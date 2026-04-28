import { useEffect, useRef, useState } from 'react'
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
import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import ConfirmModal from '@components/ConfirmModal'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import RegisterRequestServices from '@_workspace/services/_register-request/RegisterRequestServices'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

interface GprCNotificationDialogProps {
    open: boolean
    rowData: any
    onClose: () => void
    onSaved?: () => void
}

interface GprCFormState {
    gpr_c_approver_empcode: string
    gpr_c_approver_name: string
    gpr_c_approver_email: string
    gpr_c_pc_pic_empcode: string
    gpr_c_pc_pic_name: string
    gpr_c_pc_pic_email: string
    gpr_c_circular_empcodes: string[]
    gpr_c_circular_members: CircularMemberInfo[]
}

interface CircularMemberInfo {
    empcode: string
    name: string
    email: string
}

const buildEmptyForm = (): GprCFormState => ({
    gpr_c_approver_empcode: '',
    gpr_c_approver_name: '',
    gpr_c_approver_email: '',
    gpr_c_pc_pic_empcode: '',
    gpr_c_pc_pic_name: '',
    gpr_c_pc_pic_email: '',
    gpr_c_circular_empcodes: Array.from({ length: 6 }, () => ''),
    gpr_c_circular_members: [],
})

const normalizeCircularMembers = (raw: any): CircularMemberInfo[] => {
    if (!raw) return []

    try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (!Array.isArray(parsed)) return []

        return parsed.map(item => ({
            empcode: String(item?.empcode || item || '').trim(),
            name: String(item?.name || '').trim(),
            email: String(item?.email || '').trim(),
        })).filter(item => item.empcode || item.name || item.email).slice(0, 6)
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
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [showPcPicFields, setShowPcPicFields] = useState(false)
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
    const approverLookupSeq = useRef(0)
    const pcPicLookupSeq = useRef(0)
    const circularLookupSeq = useRef(Array.from({ length: 6 }, () => 0))

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

                const nextForm = {
                    gpr_c_approver_empcode: String(result.gpr_c_approver_empcode || '').trim(),
                    gpr_c_approver_name: String(result.gpr_c_approver_name || rowData?.gpr_c_approver_name || '').trim(),
                    gpr_c_approver_email: String(result.gpr_c_approver_email || rowData?.gpr_c_approver_email || '').trim(),
                    gpr_c_pc_pic_empcode: String(result.gpr_c_pc_pic_empcode || '').trim(),
                    gpr_c_pc_pic_name: String(result.gpr_c_pc_pic_name || rowData?.gpr_c_pc_pic_name || '').trim(),
                    gpr_c_pc_pic_email: String(result.gpr_c_pc_pic_email || rowData?.gpr_c_pc_pic_email || '').trim(),
                    gpr_c_circular_empcodes: Array.from({ length: 6 }, (_, idx) => circularMembers[idx]?.empcode || ''),
                    gpr_c_circular_members: circularMembers,
                }
                setForm(nextForm)
                setShowPcPicFields(Boolean(nextForm.gpr_c_pc_pic_name || nextForm.gpr_c_pc_pic_email || nextForm.gpr_c_pc_pic_empcode))
            } catch {
                if (!active) return
                const circularMembers = normalizeCircularMembers(rowData?.gpr_c_circular_members || rowData?.gpr_c_circular_json)
                const fallbackForm = {
                    gpr_c_approver_empcode: '',
                    gpr_c_approver_name: String(rowData?.gpr_c_approver_name || '').trim(),
                    gpr_c_approver_email: String(rowData?.gpr_c_approver_email || '').trim(),
                    gpr_c_pc_pic_empcode: '',
                    gpr_c_pc_pic_name: String(rowData?.gpr_c_pc_pic_name || '').trim(),
                    gpr_c_pc_pic_email: String(rowData?.gpr_c_pc_pic_email || '').trim(),
                    gpr_c_circular_empcodes: Array.from({ length: 6 }, (_, idx) => circularMembers[idx]?.empcode || ''),
                    gpr_c_circular_members: circularMembers,
                }
                setForm(fallbackForm)
                setShowPcPicFields(Boolean(fallbackForm.gpr_c_pc_pic_name || fallbackForm.gpr_c_pc_pic_email))
            } finally {
                if (active) setLoading(false)
            }
        }

        load()

        return () => {
            active = false
        }
    }, [open, rowData])

    const lookupEmployeeProfile = async (empcodeRaw: string): Promise<CircularMemberInfo | null> => {
        const empcode = String(empcodeRaw || '').trim()
        if (!empcode) return null

        const response = await RegisterRequestServices.resolveEmployeeProfile(empcode)
        if (!response.data.Status) {
            throw new Error(response.data.Message || `Employee code not found: ${empcode}`)
        }

        return response.data.ResultOnDb || null
    }

    const handleApproverChange = (value: string) => {
        setForm(prev => ({
            ...prev,
            gpr_c_approver_empcode: value,
            gpr_c_approver_name: '',
            gpr_c_approver_email: '',
        }))

        const empcode = String(value || '').trim()
        approverLookupSeq.current += 1
        const requestSeq = approverLookupSeq.current

        if (!empcode) return

        void lookupEmployeeProfile(empcode)
            .then(member => {
                if (!member || requestSeq !== approverLookupSeq.current) return

                setForm(prev => (
                    String(prev.gpr_c_approver_empcode || '').trim() === empcode
                        ? {
                            ...prev,
                            gpr_c_approver_name: member.name || '',
                            gpr_c_approver_email: member.email || '',
                        }
                        : prev
                ))
            })
            .catch(() => {
                if (requestSeq !== approverLookupSeq.current) return
                setForm(prev => (
                    String(prev.gpr_c_approver_empcode || '').trim() === empcode
                        ? { ...prev, gpr_c_approver_name: '', gpr_c_approver_email: '' }
                        : prev
                ))
            })
    }

    const handlePcPicChange = (value: string) => {
        setForm(prev => ({
            ...prev,
            gpr_c_pc_pic_empcode: value,
            gpr_c_pc_pic_name: '',
            gpr_c_pc_pic_email: '',
        }))

        const empcode = String(value || '').trim()
        pcPicLookupSeq.current += 1
        const requestSeq = pcPicLookupSeq.current

        if (!empcode) return

        void lookupEmployeeProfile(empcode)
            .then(member => {
                if (!member || requestSeq !== pcPicLookupSeq.current) return

                setForm(prev => (
                    String(prev.gpr_c_pc_pic_empcode || '').trim() === empcode
                        ? {
                            ...prev,
                            gpr_c_pc_pic_name: member.name || '',
                            gpr_c_pc_pic_email: member.email || '',
                        }
                        : prev
                ))
            })
            .catch(() => {
                if (requestSeq !== pcPicLookupSeq.current) return
                setForm(prev => (
                    String(prev.gpr_c_pc_pic_empcode || '').trim() === empcode
                        ? { ...prev, gpr_c_pc_pic_name: '', gpr_c_pc_pic_email: '' }
                        : prev
                ))
            })
    }

    const handleCircularChange = (index: number, value: string) => {
        setForm(prev => {
            const next = [...prev.gpr_c_circular_empcodes]
            next[index] = value
            const nextMembers = [...prev.gpr_c_circular_members]
            nextMembers[index] = { empcode: '', name: '', email: '' }
            return { ...prev, gpr_c_circular_empcodes: next, gpr_c_circular_members: nextMembers }
        })

        const empcode = String(value || '').trim()
        circularLookupSeq.current[index] += 1
        const requestSeq = circularLookupSeq.current[index]

        if (!empcode) return

        void lookupEmployeeProfile(empcode)
            .then(member => {
                if (!member || requestSeq !== circularLookupSeq.current[index]) return

                setForm(prev => {
                    if (String(prev.gpr_c_circular_empcodes[index] || '').trim() !== empcode) return prev

                    const nextMembers = [...prev.gpr_c_circular_members]
                    nextMembers[index] = {
                        empcode: member.empcode || empcode,
                        name: member.name || '',
                        email: member.email || '',
                    }

                    return { ...prev, gpr_c_circular_members: nextMembers }
                })
            })
            .catch(() => {
                if (requestSeq !== circularLookupSeq.current[index]) return

                setForm(prev => {
                    if (String(prev.gpr_c_circular_empcodes[index] || '').trim() !== empcode) return prev

                    const nextMembers = [...prev.gpr_c_circular_members]
                    nextMembers[index] = { empcode: '', name: '', email: '' }

                    return { ...prev, gpr_c_circular_members: nextMembers }
                })
            })
    }

    const openConfirmSave = () => {
        if (!rowData?.request_id) return
        if (!isRequester) {
            ToastMessageError({ message: 'Only requester can update this section.' })
            setFeedback({ type: 'error', msg: 'Only requester can update this section.' })
            return
        }
        setConfirmOpen(true)
    }

    const handleSave = async () => {
        if (!rowData?.request_id) return
        if (!isRequester) {
            setFeedback({ type: 'error', msg: 'Only requester can update this section.' })
            ToastMessageError({ message: 'Only requester can update this section.' })
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
                },
                UPDATE_BY: user?.EMPLOYEE_CODE || 'SYSTEM',
            })

            if (response.data.Status) {
                setFeedback({ type: 'success', msg: 'GPR C notification setup saved.' })
                ToastMessageSuccess({ message: 'GPR C notification setup saved.' })
                setConfirmOpen(false)
                onSaved?.()
            } else {
                setFeedback({ type: 'error', msg: response.data.Message || 'Save failed' })
                ToastMessageError({ message: response.data.Message || 'Save failed' })
            }
        } catch (error: unknown) {
            const message = (error as { response?: { data?: { Message?: string } } })?.response?.data?.Message || 'Failed to save GPR C notification setup'
            setFeedback({ type: 'error', msg: message })
            ToastMessageError({ message })
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth='md'
            PaperProps={{ sx: { bgcolor: 'background.default' } }}
            sx={{
                '& .MuiDialog-paper': { overflow: 'visible' },
                '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' },
            }}
        >
            <DialogTitle sx={{ px: 4, py: 4, position: 'relative' }}>
                <Typography variant='h5' component='span' fontWeight={800}>
                    Requester GPR C Notification Setup
                </Typography>
                <DialogCloseButton onClick={onClose} disableRipple>
                    <i className='tabler-x' />
                </DialogCloseButton>
            </DialogTitle>
            <DialogContent dividers sx={{ px: 4, py: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {!isRequester && (
                        <Alert severity='warning'>Only requester can edit this section.</Alert>
                    )}
                    {feedback && <Alert severity={feedback.type}>{feedback.msg}</Alert>}
                    {loading ? (
                        <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : (
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={2.5}>
                                <CustomTextField
                                    fullWidth
                                    label='GPR C Approver EmpCode'
                                    value={form.gpr_c_approver_empcode}
                                    onChange={e => handleApproverChange(e.target.value)}
                                    disabled={!isRequester}
                                />
                            </Grid>
                            <Grid item xs={12} md={4.25}>
                                <CustomTextField
                                    fullWidth
                                    label='Approver Name'
                                    value={form.gpr_c_approver_name}    
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12} md={5.25}>
                                <CustomTextField
                                    fullWidth
                                    label='Approver Email'
                                    value={form.gpr_c_approver_email}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    variant='tonal'
                                    color={showPcPicFields ? 'secondary' : 'primary'}
                                    startIcon={<i className={showPcPicFields ? 'tabler-user-minus' : 'tabler-user-plus'} />}
                                    onClick={() => {
                                        setShowPcPicFields(prev => {
                                            const next = !prev
                                            if (!next) {
                                                setForm(current => ({
                                                    ...current,
                                                    gpr_c_pc_pic_empcode: '',
                                                    gpr_c_pc_pic_name: '',
                                                    gpr_c_pc_pic_email: '',
                                                }))
                                            }
                                            return next
                                        })
                                    }}
                                    disabled={!isRequester}
                                >
                                    {showPcPicFields ? 'Remove PC PIC' : 'Add PC PIC'}
                                </Button>
                            </Grid>
                            {showPcPicFields && (
                                <>
                                    <Grid item xs={12} md={2.5}>
                                        <CustomTextField
                                            fullWidth
                                            label='PC PIC EmpCode'
                                            placeholder='S00000'
                                            value={form.gpr_c_pc_pic_empcode}
                                            onChange={e => handlePcPicChange(e.target.value)}
                                            disabled={!isRequester}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4.25}>
                                        <CustomTextField
                                            fullWidth
                                            label='PC PIC Name'
                                            value={form.gpr_c_pc_pic_name}
                                            onChange={e => setForm(prev => ({ ...prev, gpr_c_pc_pic_name: e.target.value }))}
                                            disabled={!isRequester}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={5.25}>
                                        <CustomTextField
                                            fullWidth
                                            label='PC PIC Email'
                                            value={form.gpr_c_pc_pic_email}
                                            onChange={e => setForm(prev => ({ ...prev, gpr_c_pc_pic_email: e.target.value }))}
                                            disabled={!isRequester}
                                        />
                                    </Grid>
                                </>
                            )}
                            {Array.from({ length: 6 }).map((_, index) => {
                                const memberInfo = form.gpr_c_circular_members[index]

                                return (
                                    <Grid key={index} item xs={12}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={2.5}>
                                                <CustomTextField
                                                    fullWidth
                                                    label={`Circular EmpCode ${index + 1}`}
                                                    placeholder='S00000'
                                                    value={form.gpr_c_circular_empcodes[index] || ''}
                                                    onChange={e => handleCircularChange(index, e.target.value)}
                                                    disabled={!isRequester}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={4.25}>
                                                <CustomTextField
                                                    fullWidth
                                                    label={`Circular Name ${index + 1}`}
                                                    value={memberInfo?.name || ''}
                                                    disabled
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={5.25}>
                                                <CustomTextField
                                                    fullWidth
                                                    label={`Circular Email ${index + 1}`}
                                                    value={memberInfo?.email || ''}
                                                    disabled
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                )
                            })}
                        </Grid>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'flex-start', px: 4, py: 3, gap: 2, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
                {isRequester && (
                    <Button
                        variant='contained'
                        onClick={openConfirmSave}
                        disabled={saving || loading}
                        startIcon={saving ? <CircularProgress size={14} color='inherit' /> : <i className='tabler-device-floppy' />}
                    >
                        {saving ? 'Saving...' : 'Save Setup'}
                    </Button>
                )}
                <Button variant='tonal' color='secondary' onClick={onClose} disabled={saving}>
                    {isRequester ? 'Cancel' : 'Close'}
                </Button>
            </DialogActions>
            <ConfirmModal
                show={confirmOpen}
                onConfirmClick={handleSave}
                onCloseClick={() => setConfirmOpen(false)}
                isLoading={saving}
                isDelete={false}
            />
        </Dialog>
    )
}
