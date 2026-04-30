import { useEffect, useMemo, useState } from 'react'
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    TextField,
    Typography
} from '@mui/material'
import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import AssigneesServices from '@_workspace/services/_task-manager/AssigneesServices'
import ApprovalQueueServices from '@_workspace/services/_approval-queue/ApprovalQueueServices'
import { ASSIGNEE_GROUP_LABEL_MAP } from '@_workspace/utils/requestWorkflow'

interface ReassignDialogProps {
    open: boolean
    requestId: number | null
    scope: 'REQUEST_PIC' | 'CURRENT_STEP' | 'GPR_C_STEP'
    gprCStepId?: number | null
    groupCode?: string
    currentEmpCode?: string
    updateBy?: string
    onClose: () => void
    onSuccess: () => void
}

export default function ReassignDialog({
    open,
    requestId,
    scope,
    gprCStepId,
    groupCode,
    currentEmpCode,
    updateBy,
    onClose,
    onSuccess
}: ReassignDialogProps) {
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [assignees, setAssignees] = useState<any[]>([])
    const [toEmpcode, setToEmpcode] = useState('')
    const [reason, setReason] = useState('')

    useEffect(() => {
        if (!open) {
            setError(null)
            setAssignees([])
            setToEmpcode('')
            setReason('')
            return
        }

        if (!groupCode) {
            setError('This step does not have a workflow group code yet.')
            return
        }

        let isMounted = true
        setLoading(true)
        setError(null)

        AssigneesServices.search({ group_code: groupCode, in_use: '1' })
            .then(res => {
                if (!isMounted) return
                const rows = (res.data?.ResultOnDb || []).filter((row: any) => row.empcode !== currentEmpCode)
                setAssignees(rows)
                if (rows.length === 0) {
                    setError('No active assignee found in this group.')
                }
            })
            .catch((err: any) => {
                if (!isMounted) return
                setError(err?.response?.data?.Message || err?.message || 'Failed to load assignees')
            })
            .finally(() => {
                if (isMounted) setLoading(false)
            })

        return () => {
            isMounted = false
        }
    }, [open, groupCode, currentEmpCode])

    const groupLabel = useMemo(() => ASSIGNEE_GROUP_LABEL_MAP[groupCode || ''] || groupCode || '-', [groupCode])

    const handleSubmit = async () => {
        if (!requestId || !toEmpcode || !reason.trim()) return

        setSaving(true)
        setError(null)
        try {
            const res = await ApprovalQueueServices.reassign({
                request_id: requestId,
                scope,
                gpr_c_step_id: gprCStepId || undefined,
                group_code: groupCode || undefined,
                to_empcode: toEmpcode,
                reason: reason.trim(),
                UPDATE_BY: updateBy || 'SYSTEM'
            })

            if (!res.data.Status) {
                setError(res.data.Message || 'Failed to reassign')
                return
            }

            onSuccess()
            onClose()
        } catch (err: any) {
            setError(err?.response?.data?.Message || err?.message || 'Failed to reassign')
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog
            open={open}
            maxWidth='xs'
            fullWidth
            onClose={(_event, reason) => {
                if (reason !== 'backdropClick') onClose()
            }}
            sx={{
                '& .MuiDialog-paper': { overflow: 'visible' },
                '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
            }}
        >
            <DialogTitle>
                <Typography variant='h5'>
                    {scope === 'REQUEST_PIC' ? 'Reassign PIC' : scope === 'GPR_C_STEP' ? 'Reassign GPR C Step' : 'Reassign Current Step'}
                </Typography>
                <DialogCloseButton onClick={onClose} disableRipple>
                    <i className='tabler-x' />
                </DialogCloseButton>
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                    fullWidth
                    label='Workflow Group'
                    value={groupLabel}
                    InputProps={{ readOnly: true }}
                />

                <TextField
                    fullWidth
                    label='Current Owner'
                    value={currentEmpCode || '-'}
                    InputProps={{ readOnly: true }}
                />

                <TextField
                    select
                    fullWidth
                    label='Assign To'
                    value={toEmpcode}
                    onChange={e => setToEmpcode(e.target.value)}
                    disabled={loading || assignees.length === 0}
                >
                    {assignees.map((item: any) => (
                        <MenuItem key={item.empcode} value={item.empcode}>
                            {item.empcode} - {item.empName}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label='Reason'
                    placeholder='Explain why this work is being reassigned'
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                />

                {error && <Alert severity='error'>{error}</Alert>}
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'flex-start' }}>
                <Button
                    variant='contained'
                    onClick={handleSubmit}
                    disabled={loading || saving || !toEmpcode || !reason.trim()}
                >
                    {saving ? 'Saving...' : 'Confirm Reassign'}
                </Button>
                <Button variant='tonal' color='secondary' onClick={onClose} disabled={saving}>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    )
}
