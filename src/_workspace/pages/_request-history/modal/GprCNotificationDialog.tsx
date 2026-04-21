import { useEffect, useMemo, useState } from 'react'
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Typography,
} from '@mui/material'
import CustomTextField from '@components/mui/TextField'
import RegisterRequestServices from '@_workspace/services/_register-request/RegisterRequestServices'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

interface GprCNotificationDialogProps {
    open: boolean
    rowData: any
    onClose: () => void
    onSaved?: () => void
}

interface GprCFormState {
    gpr_c_approver_name: string
    gpr_c_approver_email: string
    gpr_c_pc_pic_name: string
    gpr_c_pc_pic_email: string
    gpr_c_circular_list: string[]
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const buildEmptyForm = (): GprCFormState => ({
    gpr_c_approver_name: '',
    gpr_c_approver_email: '',
    gpr_c_pc_pic_name: '',
    gpr_c_pc_pic_email: '',
    gpr_c_circular_list: Array.from({ length: 6 }, () => ''),
})

const normalizeCircularList = (raw: any): string[] => {
    if (!raw) return []

    try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (!Array.isArray(parsed)) return []
        return parsed.map(item => String(item || '').trim()).filter(Boolean).slice(0, 6)
    } catch {
        return []
    }
}

export default function GprCNotificationDialog({ open, rowData, onClose, onSaved }: GprCNotificationDialogProps) {
    const user = getUserData()
    const requesterCode = String(
        rowData?.Request_By_EmployeeCode
        || rowData?.request_by_employeecode
        || rowData?.request_by_employee_code
        || rowData?.EMPLOYEE_CODE
        || ''
    ).trim()
    const currentUserCode = String(user?.EMPLOYEE_CODE || '').trim()
    const isRequester = !!requesterCode && requesterCode === currentUserCode

    const [form, setForm] = useState<GprCFormState>(buildEmptyForm)
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

    useEffect(() => {
        if (!open || !rowData?.request_id) return

        let active = true
        setLoading(true)
        setFeedback(null)

        const load = async () => {
            try {
                const res = await RegisterRequestServices.getGprForm(Number(rowData.request_id))
                if (!active) return

                const result = res?.data?.ResultOnDb || {}
                const circularList = normalizeCircularList(result.gpr_c_circular_json)

                setForm({
                    gpr_c_approver_name: String(result.gpr_c_approver_name || rowData?.gpr_c_approver_name || '').trim(),
                    gpr_c_approver_email: String(result.gpr_c_approver_email || rowData?.gpr_c_approver_email || '').trim(),
                    gpr_c_pc_pic_name: String(result.gpr_c_pc_pic_name || rowData?.gpr_c_pc_pic_name || '').trim(),
                    gpr_c_pc_pic_email: String(result.gpr_c_pc_pic_email || rowData?.gpr_c_pc_pic_email || '').trim(),
                    gpr_c_circular_list: Array.from({ length: 6 }, (_, idx) => circularList[idx] || ''),
                })
            } catch {
                if (!active) return
                const circularList = normalizeCircularList(rowData?.gpr_c_circular_json)
                setForm({
                    gpr_c_approver_name: String(rowData?.gpr_c_approver_name || '').trim(),
                    gpr_c_approver_email: String(rowData?.gpr_c_approver_email || '').trim(),
                    gpr_c_pc_pic_name: String(rowData?.gpr_c_pc_pic_name || '').trim(),
                    gpr_c_pc_pic_email: String(rowData?.gpr_c_pc_pic_email || '').trim(),
                    gpr_c_circular_list: Array.from({ length: 6 }, (_, idx) => circularList[idx] || ''),
                })
            } finally {
                if (active) setLoading(false)
            }
        }

        load()

        return () => {
            active = false
        }
    }, [open, rowData])

    const emailValidationError = useMemo(() => {
        const emails = [
            form.gpr_c_approver_email,
            form.gpr_c_pc_pic_email,
            ...form.gpr_c_circular_list,
        ].map(v => String(v || '').trim()).filter(Boolean)

        const invalid = emails.find(email => !EMAIL_REGEX.test(email))
        return invalid ? `Invalid email: ${invalid}` : ''
    }, [form])

    const handleCircularChange = (index: number, value: string) => {
        setForm(prev => {
            const next = [...prev.gpr_c_circular_list]
            next[index] = value
            return { ...prev, gpr_c_circular_list: next }
        })
    }

    const handleSave = async () => {
        if (!rowData?.request_id) return
        if (!isRequester) {
            setFeedback({ type: 'error', msg: 'Only requester can update this section.' })
            return
        }
        if (emailValidationError) {
            setFeedback({ type: 'error', msg: emailValidationError })
            return
        }

        setSaving(true)
        setFeedback(null)

        try {
            const response = await RegisterRequestServices.saveGprCNotification({
                request_id: Number(rowData.request_id),
                gpr_c_data: {
                    gpr_c_approver_name: form.gpr_c_approver_name,
                    gpr_c_approver_email: form.gpr_c_approver_email,
                    gpr_c_pc_pic_name: form.gpr_c_pc_pic_name,
                    gpr_c_pc_pic_email: form.gpr_c_pc_pic_email,
                    gpr_c_circular_list: form.gpr_c_circular_list.map(v => String(v || '').trim()).filter(Boolean).slice(0, 6),
                },
                UPDATE_BY: user?.EMPLOYEE_CODE || 'SYSTEM',
            })

            if (response.data.Status) {
                setFeedback({ type: 'success', msg: 'GPR C notification setup saved.' })
                onSaved?.()
            } else {
                setFeedback({ type: 'error', msg: response.data.Message || 'Save failed' })
            }
        } catch (error: any) {
            setFeedback({ type: 'error', msg: error?.response?.data?.Message || 'Failed to save GPR C notification setup' })
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
            <DialogTitle>Requester GPR C Notification Setup</DialogTitle>
            <DialogContent dividers>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {!isRequester && (
                        <Alert severity='warning'>Only requester can edit this section.</Alert>
                    )}
                    <Alert severity='info' sx={{ py: 0 }}>
                        Fill approver and circular list for GPR C escalation flow. Circular list supports up to 6 persons.
                    </Alert>
                    {feedback && <Alert severity={feedback.type}>{feedback.msg}</Alert>}
                    {loading ? (
                        <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : (
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <CustomTextField
                                    fullWidth
                                    label='GPR C Approver Name'
                                    value={form.gpr_c_approver_name}
                                    onChange={e => setForm(prev => ({ ...prev, gpr_c_approver_name: e.target.value }))}
                                    disabled={!isRequester}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <CustomTextField
                                    fullWidth
                                    label='GPR C Approver Email'
                                    value={form.gpr_c_approver_email}
                                    onChange={e => setForm(prev => ({ ...prev, gpr_c_approver_email: e.target.value }))}
                                    disabled={!isRequester}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <CustomTextField
                                    fullWidth
                                    label='PC PIC Name'
                                    value={form.gpr_c_pc_pic_name}
                                    onChange={e => setForm(prev => ({ ...prev, gpr_c_pc_pic_name: e.target.value }))}
                                    disabled={!isRequester}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <CustomTextField
                                    fullWidth
                                    label='PC PIC Email'
                                    value={form.gpr_c_pc_pic_email}
                                    onChange={e => setForm(prev => ({ ...prev, gpr_c_pc_pic_email: e.target.value }))}
                                    disabled={!isRequester}
                                />
                            </Grid>
                            {Array.from({ length: 6 }).map((_, index) => (
                                <Grid key={index} item xs={12} md={6}>
                                    <CustomTextField
                                        fullWidth
                                        label={`Circular Email ${index + 1}`}
                                        placeholder='optional@example.com'
                                        value={form.gpr_c_circular_list[index] || ''}
                                        onChange={e => handleCircularChange(index, e.target.value)}
                                        disabled={!isRequester}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    )}

                    {emailValidationError && (
                        <Typography variant='caption' color='error'>
                            {emailValidationError}
                        </Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button variant='tonal' color='secondary' onClick={onClose} disabled={saving}>Cancel</Button>
                <Button
                    variant='contained'
                    onClick={handleSave}
                    disabled={saving || loading || !isRequester}
                    startIcon={saving ? <CircularProgress size={14} color='inherit' /> : null}
                >
                    {saving ? 'Saving...' : 'Save Setup'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
