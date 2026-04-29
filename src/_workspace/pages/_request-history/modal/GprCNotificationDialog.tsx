import { useEffect, useRef, useState } from 'react'
import { useDebounce } from 'react-use'
import {
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
import { ToastMessageError } from '@/components/ToastMessage'
import RegisterRequestServices from '@_workspace/services/_register-request/RegisterRequestServices'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { useSaveGprCNotification } from '@_workspace/react-query/hooks/vendor/useRegisterRequestHooks'

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
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [circularCount, setCircularCount] = useState(1)
    const approverLookupSeq = useRef(0)
    const pcPicLookupSeq = useRef(0)
    const circularLookupSeq = useRef(Array.from({ length: 6 }, () => 0))
    const employeeProfileCache = useRef<Record<string, CircularMemberInfo>>({})

    useEffect(() => {
        if (!open || !rowData?.request_id) return

        let active = true
        setLoading(true)

        const load = async () => {
            try {
                const res = await RegisterRequestServices.getGprForm(Number(rowData.request_id))
                if (!active) return

                const result = res?.data?.ResultOnDb || {}
                const circularMembers = normalizeCircularMembers(result.gpr_c_circular_members || result.gpr_c_circular_json)

                const nextForm = {
                    gpr_c_approver_empcode: String(result.gpr_c_approver_empcode || rowData?.gpr_c_approver_empcode || '').trim(),
                    gpr_c_approver_name: String(result.gpr_c_approver_name || rowData?.gpr_c_approver_name || '').trim(),
                    gpr_c_approver_email: String(result.gpr_c_approver_email || rowData?.gpr_c_approver_email || '').trim(),
                    gpr_c_pc_pic_empcode: String(result.gpr_c_pc_pic_empcode || rowData?.gpr_c_pc_pic_empcode || '').trim(),
                    gpr_c_pc_pic_name: String(result.gpr_c_pc_pic_name || rowData?.gpr_c_pc_pic_name || '').trim(),
                    gpr_c_pc_pic_email: String(result.gpr_c_pc_pic_email || rowData?.gpr_c_pc_pic_email || '').trim(),
                    gpr_c_circular_empcodes: Array.from({ length: 6 }, (_, idx) => circularMembers[idx]?.empcode || ''),
                    gpr_c_circular_members: circularMembers,
                }
                setForm(nextForm)
                setCircularCount(Math.max(1, Math.min(6, circularMembers.length || 1)))
            } catch {
                if (!active) return
                const circularMembers = normalizeCircularMembers(rowData?.gpr_c_circular_members || rowData?.gpr_c_circular_json)
                const fallbackForm = {
                    gpr_c_approver_empcode: String(rowData?.gpr_c_approver_empcode || '').trim(),
                    gpr_c_approver_name: String(rowData?.gpr_c_approver_name || '').trim(),
                    gpr_c_approver_email: String(rowData?.gpr_c_approver_email || '').trim(),
                    gpr_c_pc_pic_empcode: String(rowData?.gpr_c_pc_pic_empcode || '').trim(),
                    gpr_c_pc_pic_name: String(rowData?.gpr_c_pc_pic_name || '').trim(),
                    gpr_c_pc_pic_email: String(rowData?.gpr_c_pc_pic_email || '').trim(),
                    gpr_c_circular_empcodes: Array.from({ length: 6 }, (_, idx) => circularMembers[idx]?.empcode || ''),
                    gpr_c_circular_members: circularMembers,
                }
                setForm(fallbackForm)
                setCircularCount(Math.max(1, Math.min(6, circularMembers.length || 1)))
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

        const cacheKey = empcode.toUpperCase()
        if (employeeProfileCache.current[cacheKey]) return employeeProfileCache.current[cacheKey]

        const response = await RegisterRequestServices.resolveEmployeeProfile(empcode)
        if (!response.data.Status) {
            throw new Error(response.data.Message || `Employee code not found: ${empcode}`)
        }

        const profile = response.data.ResultOnDb || null
        if (profile) employeeProfileCache.current[cacheKey] = profile

        return profile
    }

    useDebounce(() => {
        const empcode = String(form.gpr_c_approver_empcode || '').trim()
        approverLookupSeq.current += 1
        const requestSeq = approverLookupSeq.current

        if (!open || !empcode) return
        if (form.gpr_c_approver_name && form.gpr_c_approver_email) return

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
    }, 450, [form.gpr_c_approver_empcode, open])

    useDebounce(() => {
        const empcode = String(form.gpr_c_pc_pic_empcode || '').trim()
        pcPicLookupSeq.current += 1
        const requestSeq = pcPicLookupSeq.current

        if (!open || !empcode) return
        if (form.gpr_c_pc_pic_name && form.gpr_c_pc_pic_email) return

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
    }, 450, [form.gpr_c_pc_pic_empcode, open])

    useDebounce(() => {
        if (!open) return

        form.gpr_c_circular_empcodes.slice(0, circularCount).forEach((rawEmpcode, index) => {
            const empcode = String(rawEmpcode || '').trim()
            circularLookupSeq.current[index] += 1
            const requestSeq = circularLookupSeq.current[index]

            if (!empcode) return
            const currentMember = form.gpr_c_circular_members[index]
            if (
                String(currentMember?.empcode || '').trim().toUpperCase() === empcode.toUpperCase()
                && currentMember?.name
                && currentMember?.email
            ) return

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
        })
    }, 450, [form.gpr_c_circular_empcodes.slice(0, circularCount).join('|'), circularCount, open])

    const handleApproverChange = (value: string) => {
        setForm(prev => ({
            ...prev,
            gpr_c_approver_empcode: value,
            gpr_c_approver_name: '',
            gpr_c_approver_email: '',
        }))

        if (!String(value || '').trim()) approverLookupSeq.current += 1
    }

    const handlePcPicChange = (value: string) => {
        setForm(prev => ({
            ...prev,
            gpr_c_pc_pic_empcode: value,
            gpr_c_pc_pic_name: '',
            gpr_c_pc_pic_email: '',
        }))

        if (!String(value || '').trim()) pcPicLookupSeq.current += 1
    }

    const handleCircularChange = (index: number, value: string) => {
        setForm(prev => {
            const next = [...prev.gpr_c_circular_empcodes]
            next[index] = value
            const nextMembers = [...prev.gpr_c_circular_members]
            nextMembers[index] = { empcode: '', name: '', email: '' }
            return { ...prev, gpr_c_circular_empcodes: next, gpr_c_circular_members: nextMembers }
        })

        if (!String(value || '').trim()) circularLookupSeq.current[index] += 1
    }

    const handleAddCircular = () => {
        setCircularCount(prev => Math.min(6, prev + 1))
    }

    const handleRemoveCircular = (index: number) => {
        setForm(prev => {
            const nextEmpcodes = prev.gpr_c_circular_empcodes.filter((_, idx) => idx !== index)
            const nextMembers = prev.gpr_c_circular_members.filter((_, idx) => idx !== index)
            return {
                ...prev,
                gpr_c_circular_empcodes: [...nextEmpcodes, ''].slice(0, 6),
                gpr_c_circular_members: [...nextMembers, { empcode: '', name: '', email: '' }].slice(0, 6),
            }
        })
        setCircularCount(prev => Math.max(1, prev - 1))
    }

    const openConfirmSave = () => {
        if (!rowData?.request_id) return
        if (!isRequester) {
            ToastMessageError({ message: 'Only requester can update this section.' })
            return
        }
        setConfirmOpen(true)
    }

    const saveMutation = useSaveGprCNotification(() => {
        setConfirmOpen(false)
        onSaved?.()
    })

    const handleSave = () => {
        if (!rowData?.request_id) return
        if (!isRequester) {
            ToastMessageError({ message: 'Only requester can update this section.' })
            return
        }

        saveMutation.mutate({
            request_id: Number(rowData.request_id),
            gpr_c_data: {
                gpr_c_approver_empcode: form.gpr_c_approver_empcode,
                gpr_c_pc_pic_empcode: form.gpr_c_pc_pic_empcode,
                gpr_c_pc_pic_name: form.gpr_c_pc_pic_name,
                gpr_c_pc_pic_email: form.gpr_c_pc_pic_email,
                gpr_c_circular_empcodes: form.gpr_c_circular_empcodes.map(v => String(v || '').trim()).filter(Boolean).slice(0, 6),
            },
            UPDATE_BY: user?.EMPLOYEE_CODE || 'SYSTEM',
        })
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
                    {loading ? (
                        <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : (
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={2}>
                                <CustomTextField
                                    fullWidth
                                    placeholder='Employee Code'
                                    label='GPR C Approver'
                                    value={form.gpr_c_approver_empcode}
                                    onChange={e => handleApproverChange(e.target.value)}
                                    disabled={!isRequester}
                                />
                            </Grid>
                            <Grid item xs={12} md={4.2}>
                                <CustomTextField
                                    fullWidth
                                    label='Approver Name'
                                    value={form.gpr_c_approver_name}    
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12} md={5.80}>
                                <CustomTextField
                                    fullWidth
                                    label='Approver Email'
                                    value={form.gpr_c_approver_email}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <CustomTextField
                                    fullWidth
                                    label='PC PIC EmpCode'
                                    placeholder='S00000'
                                    value={form.gpr_c_pc_pic_empcode}
                                    onChange={e => handlePcPicChange(e.target.value)}
                                    disabled={!isRequester}
                                />
                            </Grid>
                            <Grid item xs={12} md={4.2}>
                                <CustomTextField
                                    fullWidth
                                    label='PC PIC Name'
                                    value={form.gpr_c_pc_pic_name}
                                    onChange={e => setForm(prev => ({ ...prev, gpr_c_pc_pic_name: e.target.value }))}
                                    disabled={!isRequester}
                                />
                            </Grid>
                            <Grid item xs={12} md={5.80}>
                                <CustomTextField
                                    fullWidth
                                    label='PC PIC Email'
                                    value={form.gpr_c_pc_pic_email}
                                    onChange={e => setForm(prev => ({ ...prev, gpr_c_pc_pic_email: e.target.value }))}
                                    disabled={!isRequester}
                                />
                            </Grid>
                            {Array.from({ length: circularCount }).map((_, index) => {
                                const memberInfo = form.gpr_c_circular_members[index]

                                return (
                                    <Grid key={index} item xs={12} sx={{ position: 'relative' }}>
                                        <Grid container spacing={2} alignItems='center'>
                                            <Grid item xs={12} md={2}>
                                                <CustomTextField
                                                    fullWidth
                                                    label={`Circular EmpCode ${index + 1}`}
                                                    placeholder='S00000'
                                                    value={form.gpr_c_circular_empcodes[index] || ''}
                                                    onChange={e => handleCircularChange(index, e.target.value)}
                                                    disabled={!isRequester}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={4.2}>
                                                <CustomTextField
                                                    fullWidth
                                                    label={`Circular Name ${index + 1}`}
                                                    value={memberInfo?.name || ''}
                                                    disabled
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={5.80}>
                                                <CustomTextField
                                                    fullWidth
                                                    label={`Circular Email ${index + 1}`}
                                                    value={memberInfo?.email || ''}
                                                    disabled
                                                />
                                            </Grid>
                                        </Grid>
                                        {circularCount > 1 && (
                                            <Button
                                                size='small'
                                                color='error'
                                                variant='tonal'
                                                onClick={() => handleRemoveCircular(index)}
                                                disabled={!isRequester}
                                                sx={{
                                                    minWidth: 28,
                                                    width: 28,
                                                    height: 28,
                                                    p: 0,
                                                    mt: 1,
                                                    display: 'flex',
                                                    ml: 'auto',
                                                    '@media (min-width: 900px)': {
                                                        position: 'absolute',
                                                        right: -34,
                                                        top: 28,
                                                        mt: 0,
                                                    },
                                                }}
                                            >
                                                <i className='tabler-trash' style={{ fontSize: 15 }} />
                                            </Button>
                                        )}
                                    </Grid>
                                )
                            })}
                            {circularCount < 6 && (
                                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        variant='outlined'
                                        startIcon={<i className='tabler-plus' />}
                                        onClick={handleAddCircular}
                                        disabled={!isRequester}
                                        sx={{ borderStyle: 'dashed' }}
                                    >
                                        Add Circular List
                                    </Button>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'flex-start', px: 4, py: 3, gap: 2, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
                {isRequester && (
                    <Button
                        variant='contained'
                        onClick={openConfirmSave}
                        disabled={saveMutation.isPending || loading}
                        startIcon={saveMutation.isPending ? <CircularProgress size={14} color='inherit' /> : <i className='tabler-device-floppy' />}
                    >
                        {saveMutation.isPending ? 'Saving...' : 'Save Setup'}
                    </Button>
                )}
                <Button variant='tonal' color='secondary' onClick={onClose} disabled={saveMutation.isPending}>
                    {isRequester ? 'Cancel' : 'Close'}
                </Button>
            </DialogActions>
            <ConfirmModal
                show={confirmOpen}
                onConfirmClick={handleSave}
                onCloseClick={() => setConfirmOpen(false)}
                isLoading={saveMutation.isPending}
                isDelete={false}
            />
        </Dialog>
    )
}
