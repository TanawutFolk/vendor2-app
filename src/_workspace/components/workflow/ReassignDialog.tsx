import { useEffect, useMemo, useState } from 'react'
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Typography
} from '@mui/material'
import Transition from '@components/TransitionDialog'
import ConfirmModal from '@components/ConfirmModal'
import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import CustomTextField from '@components/mui/TextField'
import SelectCustom from '@components/react-select/SelectCustom'
import { ToastMessageError, ToastMessageSuccess } from '@components/ToastMessage'
import AssigneesServices from '@_workspace/services/_task-manager/AssigneesServices'
import type { AssigneeRowI } from '@_workspace/services/_task-manager/AssigneesServices'
import ApprovalQueueServices from '@_workspace/services/_approval-queue/ApprovalQueueServices'
import { ASSIGNEE_GROUP_LABEL_MAP } from '@_workspace/utils/requestWorkflow'

type SelectOption = { value: string; label: string }

interface ReassignDialogProps {
    open: boolean
    requestId: number | null
    groupCode?: string
    currentEmpCode?: string
    updateBy?: string
    onClose: () => void
    onSuccess: () => void
}

type ServiceError = {
    response?: {
        data?: {
            Message?: string
        }
    }
    message?: string
}


const getErrorMessage = (error: unknown, fallback: string) => {
    const normalizedError = error as ServiceError
    return normalizedError?.response?.data?.Message || normalizedError?.message || fallback
}

export default function ReassignDialog({
    open,
    requestId,
    groupCode,
    currentEmpCode,
    updateBy,
    onClose,
    onSuccess
}: ReassignDialogProps) {
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [confirmModal, setConfirmModal] = useState(false)
    const [assignees, setAssignees] = useState<AssigneeRowI[]>([])
    const [toEmpcode, setToEmpcode] = useState<SelectOption | null>(null)
    const [reason, setReason] = useState('')

    useEffect(() => {
        if (!open) {
            setError(null)
            setConfirmModal(false)
            setAssignees([])
            setToEmpcode(null)
            setReason('')
            return
        }

        if (!groupCode) {
            setError('This request does not have a PO PIC group code yet.')
            return
        }

        let isMounted = true
        setLoading(true)
        setError(null)

        AssigneesServices.searchAll({ GROUP_CODE: groupCode, IN_USE: '1' })
            .then(rows => {
                if (!isMounted) return
                const availableRows = Array.from(
                    new Map(
                        rows
                            .filter(row => row.empcode && row.empcode !== currentEmpCode)
                            .map(row => [row.empcode, row])
                    ).values()
                )
                setAssignees(availableRows)
                if (availableRows.length === 0) {
                    setError('No active assignee found in this group.')
                }
            })
            .catch((err: unknown) => {
                if (!isMounted) return
                setError(getErrorMessage(err, 'Failed to load assignees'))
            })
            .finally(() => {
                if (isMounted) setLoading(false)
            })

        return () => {
            isMounted = false
        }
    }, [open, groupCode, currentEmpCode])

    const groupLabel = useMemo(() => ASSIGNEE_GROUP_LABEL_MAP[groupCode || ''] || groupCode || '-', [groupCode])

    const assigneeOptions = useMemo<SelectOption[]>(() =>
        assignees.map(item => ({
            value: item.empcode || '',
            label: `${item.empcode || ''} - ${item.empName || ''}`
        }))
    , [assignees])

    const canSubmit = Boolean(requestId && toEmpcode?.value && reason.trim())

    const handleOpenConfirm = () => {
        if (!canSubmit) return
        setConfirmModal(true)
    }

    const handleSubmit = async () => {
        if (!requestId || !toEmpcode?.value || !reason.trim()) return

        setSaving(true)
        setError(null)
        try {
            const res = await ApprovalQueueServices.reassign({
                REQUEST_REGISTER_VENDOR_ID: requestId,
                SCOPE: 'REQUEST_PIC',
                GROUP_CODE: groupCode || undefined,
                TO_EMPCODE: toEmpcode.value,
                REASON: reason.trim(),
                UPDATE_BY: updateBy || 'SYSTEM'
            })

            if (!res.data.Status) {
                ToastMessageError({ message: res.data.Message || 'Failed to reassign' })
                return
            }

            ToastMessageSuccess({ message: res.data.Message || 'PO PIC reassigned successfully' })
            setConfirmModal(false)
            onSuccess()
            onClose()
        } catch (err: unknown) {
            ToastMessageError({ message: getErrorMessage(err, 'Failed to reassign') })
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog
            open={open}
            maxWidth='xs'
            fullWidth
            TransitionComponent={Transition}
            onClose={(_event, reason) => {
                if (reason !== 'backdropClick') onClose()
            }}
            sx={{
                '& .MuiDialog-paper': { overflow: 'visible' },
                '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
            }}
            PaperProps={{ sx: { top: 30, m: 0 } }}
        >
            <DialogTitle>
                <Typography variant='h5'>
                    Reassign PO PIC
                </Typography>
                <DialogCloseButton onClick={onClose} disableRipple>
                    <i className='tabler-x' />
                </DialogCloseButton>
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <CustomTextField
                            fullWidth
                            label='PO PIC Group'
                            value={groupLabel}
                            InputProps={{ readOnly: true }}
                            disabled
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <CustomTextField
                            fullWidth
                            label='Current PO PIC'
                            value={currentEmpCode || '-'}
                            InputProps={{ readOnly: true }}
                            disabled
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <SelectCustom
                            label='Assign To'
                            placeholder='Select assignee...'
                            isClearable
                            options={assigneeOptions}
                            value={toEmpcode}
                            onChange={value => setToEmpcode(value as SelectOption | null)}
                            isDisabled={loading || assignees.length === 0}
                            classNamePrefix='select'
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <CustomTextField
                            fullWidth
                            multiline
                            rows={3}
                            label='Reason'
                            placeholder='Explain why this request PO PIC is being reassigned'
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                        />
                    </Grid>

                    {error && (
                        <Grid item xs={12}>
                            <Alert severity='error'>{error}</Alert>
                        </Grid>
                    )}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button
                    variant='contained'
                    color='success'
                    onClick={handleOpenConfirm}
                    disabled={loading || saving || !canSubmit}
                >
                    Confirm Reassign
                </Button>
                <Button variant='tonal' color='secondary' onClick={onClose} disabled={saving}>
                    Close
                </Button>
            </DialogActions>

            <ConfirmModal
                show={confirmModal}
                onConfirmClick={handleSubmit}
                onCloseClick={() => setConfirmModal(false)}
                isLoading={saving}
                isDelete={false}
            />
        </Dialog>
    )
}
