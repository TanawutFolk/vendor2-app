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

interface CircularMemberInfo {
    empcode: string
    name: string
    email: string
}

interface ActionRequiredStageConfig {
    pic_name: string
    pic_email: string
    result_status: 'pending' | 'completed' | ''
    result_note: string
    result_updated_at: string
    stage_label?: string
    flow_empcode?: string
    flow_order?: number | string
}

interface GprCFormState {
    gpr_c_approver_empcode: string
    gpr_c_approver_name: string
    gpr_c_approver_email: string
    gpr_c_pc_pic_name: string
    gpr_c_pc_pic_email: string
    gpr_c_circular_empcodes: string[]
    gpr_c_circular_members: CircularMemberInfo[]
    action_required_setup: {
        engineer: ActionRequiredStageConfig
        emr: ActionRequiredStageConfig
        qms: ActionRequiredStageConfig
        pm_manager: ActionRequiredStageConfig
    }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const buildEmptyForm = (): GprCFormState => ({
    gpr_c_approver_empcode: '',
    gpr_c_approver_name: '',
    gpr_c_approver_email: '',
    gpr_c_pc_pic_name: '',
    gpr_c_pc_pic_email: '',
    gpr_c_circular_empcodes: Array.from({ length: 6 }, () => ''),
    gpr_c_circular_members: [],
    action_required_setup: {
        engineer: { pic_name: '', pic_email: '', result_status: '', result_note: '', result_updated_at: '' },
        emr: { pic_name: '', pic_email: '', result_status: '', result_note: '', result_updated_at: '' },
        qms: { pic_name: '', pic_email: '', result_status: '', result_note: '', result_updated_at: '' },
        pm_manager: { pic_name: '', pic_email: '', result_status: '', result_note: '', result_updated_at: '' },
    },
})

const normalizeCircularMembers = (raw: any): CircularMemberInfo[] => {
    if (!raw) return []

    try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (!Array.isArray(parsed)) return []

        return parsed.map(item => ({
            empcode: String(item?.empcode || '').trim(),
            name: String(item?.name || '').trim(),
            email: String(item?.email || '').trim(),
        })).filter(item => item.empcode || item.name || item.email)
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
                const circularMembers = normalizeCircularMembers(result.gpr_c_circular_members || result.gpr_c_circular_json)
                const circularEmpcodes = Array.isArray(result.gpr_c_circular_empcodes)
                    ? result.gpr_c_circular_empcodes.map((item: any) => String(item || '').trim())
                    : circularMembers.map(item => item.empcode).filter(Boolean)

                const actionRequiredSetup = (() => {
                    try {
                        const parsed = typeof result.action_required_json === 'string'
                            ? JSON.parse(result.action_required_json)
                            : result.action_required_json

                        return {
                            ...buildEmptyForm().action_required_setup,
                            ...(parsed || {}),
                        }
                    } catch {
                        return buildEmptyForm().action_required_setup
                    }
                })()

                setForm({
                    gpr_c_approver_empcode: String(result.gpr_c_approver_empcode || '').trim(),
                    gpr_c_approver_name: String(result.gpr_c_approver_name || rowData?.gpr_c_approver_name || '').trim(),
                    gpr_c_approver_email: String(result.gpr_c_approver_email || rowData?.gpr_c_approver_email || '').trim(),
                    gpr_c_pc_pic_name: String(result.gpr_c_pc_pic_name || rowData?.gpr_c_pc_pic_name || '').trim(),
                    gpr_c_pc_pic_email: String(result.gpr_c_pc_pic_email || rowData?.gpr_c_pc_pic_email || '').trim(),
                    gpr_c_circular_empcodes: Array.from({ length: 6 }, (_, idx) => circularEmpcodes[idx] || ''),
                    gpr_c_circular_members: circularMembers,
                    action_required_setup: actionRequiredSetup,
                })
            } catch {
                if (!active) return
                setForm(buildEmptyForm())
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
            form.gpr_c_pc_pic_email,
            form.action_required_setup.engineer.pic_email,
            form.action_required_setup.emr.pic_email,
            form.action_required_setup.qms.pic_email,
            form.action_required_setup.pm_manager.pic_email,
        ].map(v => String(v || '').trim()).filter(Boolean)

        const invalid = emails.find(email => !EMAIL_REGEX.test(email))
        return invalid ? `Invalid email: ${invalid}` : ''
    }, [form])

    const handleCircularChange = (index: number, value: string) => {
        setForm(prev => {
            const next = [...prev.gpr_c_circular_empcodes]
            next[index] = value
            return { ...prev, gpr_c_circular_empcodes: next }
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
                    gpr_c_approver_empcode: form.gpr_c_approver_empcode,
                    gpr_c_pc_pic_name: form.gpr_c_pc_pic_name,
                    gpr_c_pc_pic_email: form.gpr_c_pc_pic_email,
                    gpr_c_circular_empcodes: form.gpr_c_circular_empcodes.map(v => String(v || '').trim()).filter(Boolean).slice(0, 6),
                    action_required_setup: form.action_required_setup,
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
                        Enter employee codes for GPR C approver and circular list. The system will resolve name and email from `person.member_fed` when you save.
                    </Alert>
                    {feedback && <Alert severity={feedback.type}>{feedback.msg}</Alert>}
                    {loading ? (
                        <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : (
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <CustomTextField
                                    fullWidth
                                    label='GPR C Approver EmpCode'
                                    value={form.gpr_c_approver_empcode}
                                    onChange={e => setForm(prev => ({ ...prev, gpr_c_approver_empcode: e.target.value }))}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <CustomTextField
                                    fullWidth
                                    label='Approver Name'
                                    value={form.gpr_c_approver_name}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <CustomTextField
                                    fullWidth
                                    label='Approver Email'
                                    value={form.gpr_c_approver_email}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <CustomTextField
                                    fullWidth
                                    label='PC PIC Name'
                                    value={form.gpr_c_pc_pic_name}
                                    onChange={e => setForm(prev => ({ ...prev, gpr_c_pc_pic_name: e.target.value }))}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <CustomTextField
                                    fullWidth
                                    label='PC PIC Email'
                                    value={form.gpr_c_pc_pic_email}
                                    onChange={e => setForm(prev => ({ ...prev, gpr_c_pc_pic_email: e.target.value }))}
                                />
                            </Grid>
                            {Array.from({ length: 6 }).map((_, index) => {
                                const memberInfo = form.gpr_c_circular_members[index]
                                return (
                                    <Grid key={index} item xs={12} md={6}>
                                        <CustomTextField
                                            fullWidth
                                            label={`Circular EmpCode ${index + 1}`}
                                            placeholder='S00000'
                                            value={form.gpr_c_circular_empcodes[index] || ''}
                                            onChange={e => handleCircularChange(index, e.target.value)}
                                            helperText={memberInfo ? `${memberInfo.name || '-'} | ${memberInfo.email || '-'}` : ''}
                                        />
                                    </Grid>
                                )
                            })}
                            {[
                                { key: 'engineer', fallbackLabel: 'Engineer Judgement' },
                                { key: 'emr', fallbackLabel: 'EMR Judgement' },
                                { key: 'qms', fallbackLabel: 'QMS Judgement' },
                                { key: 'pm_manager', fallbackLabel: 'PM Manager Approval' },
                            ].map(stage => (
                                <Grid item xs={12} key={stage.key}>
                                    <Box sx={{ mt: 1, p: 2, borderRadius: 1.5, border: '1px solid', borderColor: 'info.main' }}>
                                        <Typography variant='subtitle2' fontWeight={700} sx={{ mb: 1.5 }}>
                                            {form.action_required_setup[stage.key as keyof GprCFormState['action_required_setup']].stage_label || stage.fallbackLabel}
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={6}>
                                                <CustomTextField
                                                    fullWidth
                                                    label='PIC Name'
                                                    value={form.action_required_setup[stage.key as keyof GprCFormState['action_required_setup']].pic_name}
                                                    onChange={e => setForm(prev => ({
                                                        ...prev,
                                                        action_required_setup: {
                                                            ...prev.action_required_setup,
                                                            [stage.key]: {
                                                                ...prev.action_required_setup[stage.key as keyof GprCFormState['action_required_setup']],
                                                                pic_name: e.target.value,
                                                            }
                                                        }
                                                    }))}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <CustomTextField
                                                    fullWidth
                                                    label='PIC Email'
                                                    value={form.action_required_setup[stage.key as keyof GprCFormState['action_required_setup']].pic_email}
                                                    onChange={e => setForm(prev => ({
                                                        ...prev,
                                                        action_required_setup: {
                                                            ...prev.action_required_setup,
                                                            [stage.key]: {
                                                                ...prev.action_required_setup[stage.key as keyof GprCFormState['action_required_setup']],
                                                                pic_email: e.target.value,
                                                            }
                                                        }
                                                    }))}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Box>
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
