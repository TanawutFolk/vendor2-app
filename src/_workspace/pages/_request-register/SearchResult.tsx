// React Imports
import { useMemo, useState, useEffect, useRef, useCallback } from 'react'

// MUI Imports
import {
    Grid, Card, CardContent, Box, Typography, Chip, Divider,
    IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
    Button, List, ListItem, ListItemIcon, ListItemText, CircularProgress,
    TextField, Alert
} from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'

import undraw_clean_up_re_504g from '@assets/images/common/undraw_clean_up_re_504g.svg'
import undraw_notify_re_65on from '@assets/images/common/undraw_notify_re_65on.svg'

// AG Grid Imports
import type { ColDef, IServerSideDatasource, StateUpdatedEvent } from 'ag-grid-community'
import DxAGgridTable from '@/_template/DxAGgridTable'

import type { ReactElement, Ref } from 'react'
import { forwardRef } from 'react'
import { Slide } from '@mui/material'
import type { SlideProps } from '@mui/material'

const Transition = forwardRef(function Transition(
    props: SlideProps & { children?: ReactElement<any, any> },
    ref: Ref<unknown>
) {
    return <Slide direction='down' ref={ref} {...props} />
})

import DialogCloseButton from '@components/dialogs/DialogCloseButton'

// Services
import RegisterRequestServices from '@_workspace/services/_register-request/RegisterRequestServices'

// Utils
import { getUserData } from '@/utils/user-profile/userLoginProfile'

// React Hook Form
import { useFormContext } from 'react-hook-form'
import type { RequestRegisterFormData } from './validateSchema'

// Context
import { useDxContext } from '@/_template/DxContextProvider'

// Status — colors from DB
import useRequestStatusOptions from '@_workspace/react-query/useRequestStatusOptions'

// GPR Form Dialog
import GprFormDialog from './modal/GprFormDialog'

// Reuse EditVendorModal from find-vendor page (Vendor Info + Contacts + Products editing)
import EditVendorModal from '@_workspace/pages/_find-vendor/modal/EditVendorModal'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const API_BASE = (import.meta as any).env?.VITE_API_URL || ''

const buildFileUrls = (documents: any): { name: string; url: string }[] => {
    try {
        const docs = typeof documents === 'string' ? JSON.parse(documents) : (documents || [])
        return docs.filter(Boolean).map((d: any) => ({
            name: d.file_name || d.file_path || 'Unnamed File',
            url: `${API_BASE}/uploads/documents/${d.file_path}`
        }))
    } catch { return [] }
}


// ─────────────────────────────────────────────────────────────────────────────
// File Viewer Dialog
// ─────────────────────────────────────────────────────────────────────────────
const FileViewerDialog = ({ open, files, onClose }: {
    open: boolean; files: { name: string; url: string }[]; onClose: () => void
}) => {
    const getFileIcon = (name: string) => {
        const ext = name.split('.').pop()?.toLowerCase()
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'tabler-photo'
        if (ext === 'pdf') return 'tabler-file-type-pdf'
        if (['xls', 'xlsx'].includes(ext || '')) return 'tabler-file-type-xls'
        if (['doc', 'docx'].includes(ext || '')) return 'tabler-file-type-doc'
        return 'tabler-file'
    }

    return (
        <Dialog
            maxWidth='sm'
            fullWidth={true}
            onClose={(event, reason) => {
                if (reason !== 'backdropClick') {
                    onClose()
                }
            }}
            TransitionComponent={Transition}
            open={open}
            sx={{
                '& .MuiDialog-paper': { overflow: 'visible' },
                '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
            }}
        >
            <DialogTitle>
                <Typography variant='h5' component='span'>Attached Files ({files.length})</Typography>
                <DialogCloseButton onClick={onClose} disableRipple>
                    <i className='tabler-x' />
                </DialogCloseButton>
            </DialogTitle>
            <DialogContent dividers>
                {files.length === 0 ? (
                    <Typography color='text.secondary' sx={{ py: 2, textAlign: 'center' }}>No files attached</Typography>
                ) : (
                    <List disablePadding>
                        {files.map((file, idx) => (
                            <ListItem
                                key={idx} disablePadding
                                sx={{ py: 1.5, px: 2, mb: 1, borderRadius: 2, border: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}
                                secondaryAction={
                                    <Tooltip title='Open / Download'>
                                        <IconButton edge='end' size='small' onClick={() => window.open(file.url, '_blank')} sx={{ color: 'primary.main' }}>
                                            <i className='tabler-external-link' style={{ fontSize: 18 }} />
                                        </IconButton>
                                    </Tooltip>
                                }
                            >
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                    <i className={getFileIcon(file.name)} style={{ fontSize: 24, color: 'var(--mui-palette-primary-main)' }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Typography variant='body2' fontWeight={600}
                                            sx={{ cursor: 'pointer', color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}
                                            onClick={() => window.open(file.url, '_blank')}
                                        >
                                            {file.name}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'flex-start' }}>
                <Button onClick={onClose} variant='tonal' color='secondary'>Close</Button>
            </DialogActions>
        </Dialog>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Approve / Reject Dialog
// ─────────────────────────────────────────────────────────────────────────────
interface ActionDialogProps {
    open: boolean
    mode: 'approve' | 'reject'
    requestId: number | null
    nextStatus: string
    isFinalStep: boolean
    onClose: () => void
    onSuccess: () => void
}

const ActionDialog = ({ open, mode, requestId, nextStatus, isFinalStep, onClose, onSuccess }: ActionDialogProps) => {
    const [remark, setRemark] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const user = getUserData()

    const handleSubmit = async () => {
        if (!requestId) return
        setLoading(true)
        setError(null)
        try {
            const res = await RegisterRequestServices.updateStatus({
                request_id: requestId,
                request_status: mode === 'approve' ? nextStatus : 'Rejected',
                approve_by: user?.EMPLOYEE_CODE || '',
                approver_remark: remark,
                UPDATE_BY: user?.EMPLOYEE_CODE || '',
                isFinalStep: mode === 'approve' ? isFinalStep : false,
            })
            if (res.data.Status) {
                setRemark('')
                onSuccess()
                onClose()
            } else {
                setError(res.data.Message || 'Failed to update status')
            }
        } catch (e: any) {
            setError(e?.response?.data?.Message || e?.message || 'Failed to update status')
        } finally {
            setLoading(false)
        }
    }

    const imageConfirm = mode === 'reject' ? undraw_clean_up_re_504g : undraw_notify_re_65on

    return (
        <Dialog
            maxWidth='xs'
            fullWidth={true}
            open={open}
            disableEscapeKeyDown
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
            TransitionComponent={Transition}
            onClose={(_event, reason) => {
                if (reason !== 'backdropClick') {
                    onClose()
                }
            }}
            sx={{
                '& .MuiDialog-paper': { overflow: 'visible' },
                '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
            }}
        >
            <DialogContent>
                <Box sx={{ mb: 6, display: 'flex', justifyContent: 'center' }}>
                    <img src={imageConfirm} height={120} width={150} alt='' />
                </Box>
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant='h5'>Are You Sure ?</Typography>
                    <Typography variant='h5' sx={{ color: 'text.secondary' }}>
                        ยืนยันการ{mode === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ'}ข้อมูลหรือไม่ ?
                    </Typography>
                </Box>
                
                {error && <Alert severity='error' sx={{ mb: 2 }}>{error}</Alert>}
                
                {mode === 'reject' && (
                    <TextField
                        fullWidth multiline rows={3}
                        label='Remark / Comment (Required for reject)'
                        placeholder='Enter your remark here...'
                        value={remark}
                        onChange={e => setRemark(e.target.value)}
                    />
                )}
            </DialogContent>

            <DialogActions
                sx={{
                    justifyContent: 'center',
                    borderTop: 'none',
                    mb: 4
                }}
            >
                <LoadingButton
                    onClick={handleSubmit}
                    loading={loading}
                    loadingIndicator={mode === 'approve' ? 'Approving...' : 'Rejecting...'}
                    variant='contained'
                    color={mode === 'approve' ? 'success' : 'error'}
                    sx={{ mr: 4 }}
                    disabled={mode === 'reject' && !remark.trim()}
                >
                    <span>Yes, {mode === 'approve' ? 'Approve' : 'Reject'} !</span>
                </LoadingButton>
                <Button variant='tonal' color='secondary' onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Detail Drawer Content
// ─────────────────────────────────────────────────────────────────────────────
interface DetailPanelProps {
    data: any
    onApprove: (nextStatus: string, isFinalStep: boolean) => void
    onReject: () => void
    onEmailSent: () => void
    onCompleted?: () => void
}

const DetailPanel = ({ data, onApprove, onReject, onEmailSent, onCompleted }: DetailPanelProps) => {
    const [sendingEmail, setSendingEmail] = useState(false)
    const [emailFeedback, setEmailFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null)
    const [fileDialogOpen, setFileDialogOpen] = useState(false)
    // CC emails management
    const [ccEmails, setCcEmails] = useState<string[]>([])
    const [ccInput, setCcInput] = useState('')
    const [ccEditMode, setCcEditMode] = useState(false)
    const [ccSaving, setCcSaving] = useState(false)
    const [ccFeedback, setCcFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null)
    // Account step: complete registration
    const [vendorCodeInput, setVendorCodeInput] = useState('')
    const [completing, setCompleting] = useState(false)
    const [completeFeedback, setCompleteFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null)
    // GPR Form dialog
    const [gprDialogOpen, setGprDialogOpen] = useState(false)
    // Edit Request dialog
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editForm, setEditForm] = useState({ supportProduct_Process: '', purchase_frequency: '', requester_remark: '' })
    const [editSaving, setEditSaving] = useState(false)
    const [editFeedback, setEditFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null)
    // Edit Vendor modal (reuse EditVendorModal from find-vendor)
    const [editVendorOpen, setEditVendorOpen] = useState(false)
    const { data: statusOptions = [] } = useRequestStatusOptions()
    const user = getUserData()
    const files = buildFileUrls(data?.documents)
    if (!data) return null

    const handleSendEmailAndApprove = async () => {
        setSendingEmail(true)
        setEmailFeedback(null)
        try {
            const res = await RegisterRequestServices.sendAgreementEmail(data)
            if (res.data.Status) {
                // Email sent successfully, now approve request automatically
                const updateRes = await RegisterRequestServices.updateStatus({
                    request_id: data.request_id,
                    request_status: computedNextStatus,
                    approve_by: user?.EMPLOYEE_CODE || '',
                    approver_remark: 'Agreement Email Sent',
                    UPDATE_BY: user?.EMPLOYEE_CODE || '',
                    isFinalStep: isFinalStep,
                })
                if (!updateRes.data.Status) {
                    throw new Error(updateRes.data.Message || 'Email sent but failed to update status')
                }
                setEmailFeedback({ type: 'success', msg: 'Email sent & status updated successfully.' })
                onEmailSent()
                if (onCompleted) onCompleted()
            } else {
                setEmailFeedback({ type: 'error', msg: res.data.Message })
            }
        } catch (err: any) {
            setEmailFeedback({ type: 'error', msg: err?.response?.data?.Message || 'Failed to send email or update status' })
        } finally {
            setSendingEmail(false)
        }
    }

    // Parse cc_emails from data on mount / data change
    useEffect(() => {
        try {
            const parsed = typeof data.cc_emails === 'string' ? JSON.parse(data.cc_emails) : (data.cc_emails || [])
            setCcEmails(Array.isArray(parsed) ? parsed.filter(Boolean) : [])
        } catch { setCcEmails([]) }
    }, [data?.cc_emails])

    const handleSaveCcEmails = async (updatedList: string[]) => {
        setCcSaving(true)
        setCcFeedback(null)
        try {
            const res = await RegisterRequestServices.updateCcEmails({
                request_id: data.request_id,
                cc_emails: updatedList,
                UPDATE_BY: user?.EMPLOYEE_CODE || 'SYSTEM',
            })
            if (res.data.Status) {
                setCcFeedback({ type: 'success', msg: 'CC list saved' })
                setCcEditMode(false)
                onEmailSent() // refresh grid
            } else {
                setCcFeedback({ type: 'error', msg: res.data.Message })
            }
        } catch (err: any) {
            setCcFeedback({ type: 'error', msg: err?.response?.data?.Message || 'Failed to save CC emails' })
        } finally {
            setCcSaving(false)
        }
    }

    const handleAddCc = () => {
        const email = ccInput.trim().toLowerCase()
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return
        if (ccEmails.includes(email)) { setCcInput(''); return }
        const updated = [...ccEmails, email]
        setCcEmails(updated)
        setCcInput('')
    }

    const handleRemoveCc = (email: string) => {
        setCcEmails(prev => prev.filter(e => e !== email))
    }

    const handleCompleteRegistration = async () => {
        if (!vendorCodeInput.trim()) return
        setCompleting(true)
        setCompleteFeedback(null)
        try {
            const res = await RegisterRequestServices.completeRegistration({
                request_id: data.request_id,
                vendor_code: vendorCodeInput.trim(),
                UPDATE_BY: user?.EMPLOYEE_CODE || 'SYSTEM',
            })
            if (res.data.Status) {
                setCompleteFeedback({ type: 'success', msg: 'Registration completed! Final emails sent.' })
                onCompleted?.()
            } else {
                setCompleteFeedback({ type: 'error', msg: res.data.Message })
            }
        } catch (err: any) {
            setCompleteFeedback({ type: 'error', msg: err?.response?.data?.Message || 'Failed to complete registration' })
        } finally {
            setCompleting(false)
        }
    }

    const accent = statusOptions.find(s => s.value === data.request_status)?.accent || '#8A8D99'

    // Parse approval steps to determine if current user can act
    const approvalSteps: any[] = (() => {
        try { return typeof data.approval_steps === 'string' ? JSON.parse(data.approval_steps) : (data.approval_steps || []) } catch { return [] }
    })().filter(Boolean).sort((a: any, b: any) => a.step_order - b.step_order)

    const currentStep = approvalSteps.find((s: any) => s.step_status === 'in_progress')
    const isActionable = !!currentStep
    const isAccountStep = isActionable && (currentStep?.DESCRIPTION || '').toLowerCase().includes('account')
    const isPicStep = isActionable && currentStep?.step_order === 2 && user?.EMPLOYEE_CODE === data.assign_to

    const handleOpenEditDialog = () => {
        setEditForm({
            supportProduct_Process: data.supportProduct_Process || '',
            purchase_frequency: data.purchase_frequency || '',
            requester_remark: data.requester_remark || ''
        })
        setEditFeedback(null)
        setEditDialogOpen(true)
    }

    const handleSaveEdit = async () => {
        setEditSaving(true)
        setEditFeedback(null)
        try {
            const res = await RegisterRequestServices.updateRequest({
                request_id: data.request_id,
                supportProduct_Process: editForm.supportProduct_Process,
                purchase_frequency: editForm.purchase_frequency,
                requester_remark: editForm.requester_remark,
                UPDATE_BY: user?.EMPLOYEE_CODE || 'SYSTEM',
            })
            if (res.data.Status) {
                setEditFeedback({ type: 'success', msg: 'บันทึกสำเร็จ' })
                onEmailSent() // refresh grid
                setTimeout(() => setEditDialogOpen(false), 800)
            } else {
                setEditFeedback({ type: 'error', msg: res.data.Message })
            }
        } catch (err: any) {
            setEditFeedback({ type: 'error', msg: err?.response?.data?.Message || err?.message || 'Failed to update request' })
        } finally {
            setEditSaving(false)
        }
    }

    // Compute next status value for approve action
    const nextStep = currentStep ? approvalSteps.find((s: any) => s.step_order === currentStep.step_order + 1 && s.step_status === 'pending') : null
    const isFinalStep = !!currentStep && !nextStep
    const computedNextStatus = (() => {
        // ถ้าเป็น step สุดท้าย ให้ใช้ status ของ currentStep (MD Approval)
        const targetDesc = nextStep?.DESCRIPTION || currentStep?.DESCRIPTION || ''
        const match = statusOptions.find(so => so.label === targetDesc)
        return match?.value || targetDesc
    })()

    const contacts: any[] = (() => {
        try { return typeof data.contacts === 'string' ? JSON.parse(data.contacts) : (data.contacts || []) } catch { return [] }
    })().filter(Boolean)
    const products: any[] = (() => {
        try { return typeof data.products === 'string' ? JSON.parse(data.products) : (data.products || []) } catch { return [] }
    })().filter(Boolean)

    let targetContactName = '-'
    let displayTargetEmail = data.emailmain || 'No Email'

    if (data.vendor_contact_id) {
        const c = contacts.find((x: any) => x && x.vendor_contact_id === Number(data.vendor_contact_id))
        if (c && c.email) {
            targetContactName = c.contact_name || '-'
            displayTargetEmail = c.email
        }
    } else if (contacts.length > 0) {
        const c = contacts[0]
        if (c && c.email) {
            targetContactName = c.contact_name || '-'
            displayTargetEmail = c.email
        }
    }

    const infoRow = (label: string, value: any) => (
        <Box sx={{ display: 'flex', borderBottom: '1px solid', borderColor: 'divider', py: 1.5 }}>
            <Typography variant='caption' color='text.disabled' fontWeight={700} sx={{ minWidth: 160 }}>{label}</Typography>
            <Typography variant='body2' fontWeight={500}>{value || '-'}</Typography>
        </Box>
    )

    const SectionHeader = ({ icon, title }: { icon: string; title: string }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <i className={icon} style={{ fontSize: 16, color: 'var(--mui-palette-primary-main)' }} />
            <Typography variant='subtitle2' fontWeight={700} color='text.secondary'>{title}</Typography>
            <Divider sx={{ flex: 1 }} />
        </Box>
    )

    return (
        <Box sx={{ p: 3, overflowY: 'auto', height: '100%' }}>

            {/* Header Banner */}
            <Box sx={{ p: 2.5, mb: 3, borderRadius: 1, bgcolor: `${accent}10`, border: '1px solid', borderColor: `${accent}25` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5 }}>
                    <Box>
                        <Typography variant='h6' fontWeight={800}>{data.company_name}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
                            <i className='tabler-user' style={{ fontSize: 13, color: 'var(--mui-palette-text-secondary)' }} />
                            <Typography variant='body2' color='text.secondary'>
                                {data.FULL_NAME || data.EMPLOYEE_CODE}
                                {data.EMPLOYEE_DEPT ? ` · ${data.EMPLOYEE_DEPT}` : ''}
                            </Typography>
                        </Box>
                    </Box>
                    <Chip label={data.request_status} size='medium'
                        sx={{ fontWeight: 700, bgcolor: `${accent}20`, color: accent, border: '1px solid', borderColor: `${accent}40` }}
                    />
                </Box>
            </Box>

            {/* Request Info */}
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i className='tabler-clipboard-list' style={{ fontSize: 16, color: 'var(--mui-palette-primary-main)' }} />
                        <Typography variant='subtitle2' fontWeight={700} color='text.secondary'>Request Info</Typography>
                        <Divider sx={{ flex: 1, minWidth: 40 }} />
                    </Box>
                    {isPicStep && (
                        <Button size='small' variant='tonal' color='warning'
                            startIcon={<i className='tabler-pencil' style={{ fontSize: 14 }} />}
                            onClick={handleOpenEditDialog}
                        >Edit Request</Button>
                    )}
                </Box>
                {infoRow('Support Product / Process', data.supportProduct_Process)}
                {infoRow('Purchase Frequency', data.purchase_frequency)}
                {infoRow('Assigned To (PIC)', data.assign_to)}
                {infoRow('Submitted Date', data.CREATE_DATE ? new Date(data.CREATE_DATE).toLocaleDateString('th-TH') : '-')}
                {data.requester_remark && infoRow('Requester Remark', data.requester_remark)}
            </Box>

            {/* Vendor Info */}
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i className='tabler-building-store' style={{ fontSize: 16, color: 'var(--mui-palette-primary-main)' }} />
                        <Typography variant='subtitle2' fontWeight={700} color='text.secondary'>Vendor Info</Typography>
                        <Divider sx={{ flex: 1, minWidth: 40 }} />
                    </Box>
                    {isPicStep && (
                        <Button size='small' variant='tonal' color='info'
                            startIcon={<i className='tabler-pencil' style={{ fontSize: 14 }} />}
                            onClick={() => setEditVendorOpen(true)}
                        >Edit Vendor</Button>
                    )}
                </Box>
                {infoRow('Vendor Type', data.vendor_type_name)}
                {infoRow('Region', data.vendor_region)}
                {infoRow('FFT Vendor Code', data.fft_vendor_code)}
                {infoRow('FFT Status', data.fft_status)}
                {infoRow('Address', data.address)}
                {infoRow('Province', data.province)}
                {infoRow('Postal Code', data.postal_code)}
                {infoRow('Tel Center', data.tel_center)}
                {infoRow('Website', data.website)}
                {infoRow('Email (Main)', data.emailmain)}
            </Box>

            {/* Contacts */}
            {contacts.length > 0 && (
                <Box sx={{ mb: 3 }}>
                    <SectionHeader icon='tabler-users' title={`Contacts (${contacts.length})`} />
                    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 2fr', px: 2, py: 1, bgcolor: 'action.hover' }}>
                            {['Name', 'Tel', 'Position', 'Email'].map(h => (
                                <Typography key={h} variant='caption' fontWeight={700} color='text.secondary'>{h}</Typography>
                            ))}
                        </Box>
                        {contacts.map((c, i) => (
                            <Box key={i} sx={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 2fr', px: 2, py: 1.25, borderTop: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
                                <Typography variant='body2' fontWeight={600}>{c.contact_name || '-'}</Typography>
                                <Typography variant='body2' color='text.secondary'>{c.tel_phone || '-'}</Typography>
                                <Typography variant='body2' color='text.secondary'>{c.position || '-'}</Typography>
                                <Typography variant='body2' color='text.secondary' sx={{ wordBreak: 'break-all' }}>{c.email || '-'}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}

            {/* Products */}
            {products.length > 0 && (
                <Box sx={{ mb: 3 }}>
                    <SectionHeader icon='tabler-package' title={`Products (${products.length})`} />
                    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 2fr 2fr', px: 2, py: 1, bgcolor: 'action.hover' }}>
                            {['Group', 'Maker', 'Product Name', 'Model List'].map(h => (
                                <Typography key={h} variant='caption' fontWeight={700} color='text.secondary'>{h}</Typography>
                            ))}
                        </Box>
                        {products.map((p, i) => (
                            <Box key={i} sx={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 2fr 2fr', px: 2, py: 1.25, borderTop: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
                                <Typography variant='body2' fontWeight={600}>{p.product_group || '-'}</Typography>
                                <Typography variant='body2' color='text.secondary'>{p.maker_name || '-'}</Typography>
                                <Typography variant='body2' color='text.secondary'>{p.product_name || '-'}</Typography>
                                <Typography variant='body2' color='text.secondary'>{p.model_list || '-'}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}

            {/* Approval Steps */}
            {(() => {
                const steps: any[] = (() => {
                    try { return typeof data.approval_steps === 'string' ? JSON.parse(data.approval_steps) : (data.approval_steps || []) } catch { return [] }
                })().filter(Boolean)
                const logs: any[] = (() => {
                    try { return typeof data.approval_logs === 'string' ? JSON.parse(data.approval_logs) : (data.approval_logs || []) } catch { return [] }
                })().filter(Boolean)
                if (steps.length === 0) return null
                return (
                    <Box sx={{ mb: 3 }}>
                        <SectionHeader icon='tabler-list-check' title={`Approval Steps (${steps.length})`} />
                        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '0.5fr 2fr 1.5fr 1.2fr 1.5fr', px: 2, py: 1, bgcolor: 'action.hover' }}>
                                {['#', 'Description', 'Approver', 'Status', 'Updated'].map(h => (
                                    <Typography key={h} variant='caption' fontWeight={700} color='text.secondary'>{h}</Typography>
                                ))}
                            </Box>
                            {steps.sort((a: any, b: any) => a.step_order - b.step_order).map((s: any, i: number) => {
                                const stepLog = logs.find((l: any) => l.step_id === s.step_id)
                                const getStepStatusCfg = (status: string) => {
                                    switch (status) {
                                        case 'approved': case 'completed': return { label: 'Completed', bgColor: '#28c76f20', txtColor: '#28c76f', borderColor: '#28c76f40', icon: 'tabler-circle-check-filled' }
                                        case 'in_progress': case 'current': return { label: 'In Progress', bgColor: '#ff9f4320', txtColor: '#ff9f43', borderColor: '#ff9f4340', icon: 'tabler-clock-play' }
                                        case 'rejected': return { label: 'Rejected', bgColor: '#ea545520', txtColor: '#ea5455', borderColor: '#ea545540', icon: 'tabler-circle-x-filled' }
                                        case 'skipped': return { label: 'Skipped', bgColor: '#00cfe820', txtColor: '#00cfe8', borderColor: '#00cfe840', icon: 'tabler-circle-minus' }
                                        case 'pending': default: return { label: 'Waiting', bgColor: '#ff9f4315', txtColor: '#ff9f4390', borderColor: '#ff9f4330', icon: 'tabler-clock' }
                                    }
                                }
                                const stCfg = getStepStatusCfg(s.step_status)
                                return (
                                    <Box key={i} sx={{ display: 'grid', gridTemplateColumns: '0.5fr 2fr 1.5fr 1.2fr 1.5fr', px: 2, py: 1.25, borderTop: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
                                        <Typography variant='body2' fontWeight={600}>{s.step_order}</Typography>
                                        <Typography variant='body2' fontWeight={600}>{s.DESCRIPTION || '-'}</Typography>
                                        <Typography variant='body2' color='text.secondary'>{s.approver_id || '-'}</Typography>
                                        <Chip
                                            icon={<i className={stCfg.icon} style={{ fontSize: 13, color: stCfg.txtColor }} />}
                                            label={stCfg.label}
                                            size='small'
                                            sx={{
                                                bgcolor: stCfg.bgColor,
                                                color: stCfg.txtColor,
                                                border: '1px solid',
                                                borderColor: stCfg.borderColor,
                                                fontWeight: 600,
                                                fontSize: '0.68rem',
                                                height: 22,
                                                width: 'fit-content',
                                                '& .MuiChip-icon': { color: stCfg.txtColor }
                                            }}
                                        />
                                        <Typography variant='body2' color='text.secondary'>
                                            {s.UPDATE_DATE ? new Date(s.UPDATE_DATE).toLocaleDateString('th-TH') : '-'}
                                        </Typography>
                                    </Box>
                                )
                            })}
                        </Box>
                        {logs.length > 0 && (
                            <Box sx={{ mt: 1.5 }}>
                                <Typography variant='caption' fontWeight={700} color='text.disabled' sx={{ mb: 1, display: 'block' }}>Action Logs</Typography>
                                {logs.map((l: any, i: number) => (
                                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                                        <i className='tabler-arrow-right' style={{ fontSize: 12, color: 'var(--mui-palette-text-disabled)' }} />
                                        <Typography variant='caption' color='text.secondary'>
                                            <strong>{l.action_by}</strong> — {l.action_type} {l.remark ? `(${l.remark})` : ''} · {l.action_date ? new Date(l.action_date).toLocaleString('th-TH') : ''}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>
                )
            })()}

            {/* Decision Info */}
            {(data.approve_by || data.approver_remark) && (
                <Box sx={{ mb: 3 }}>
                    <SectionHeader icon='tabler-user-check' title='Decision Info' />
                    {infoRow('Approved / Rejected By', data.approve_by)}
                    {infoRow('Approval Date', data.approve_date ? new Date(data.approve_date).toLocaleDateString('th-TH') : '-')}
                    {infoRow('Approver Remark', data.approver_remark)}
                    {data.vendor_code && infoRow('Vendor Code (FFT)', data.vendor_code)}
                </Box>
            )}

            {/* CC Recipients management — always visible, PIC can edit */}
            <Box sx={{ mb: 3 }}>
                <SectionHeader icon='tabler-users-group' title='CC Recipients (Final Email)' />
                <Box sx={{ p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    {!ccEditMode ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, flex: 1 }}>
                                {ccEmails.length === 0
                                    ? <Typography variant='caption' color='text.secondary'>No CC recipients added yet</Typography>
                                    : ccEmails.map(e => (
                                        <Chip key={e} label={e} size='small' variant='outlined'
                                            icon={<i className='tabler-mail' style={{ fontSize: 13 }} />}
                                        />
                                    ))
                                }
                            </Box>
                            <Button size='small' variant='tonal'
                                startIcon={<i className='tabler-pencil' style={{ fontSize: 14 }} />}
                                onClick={() => { setCcEditMode(true); setCcFeedback(null) }}
                            >Edit</Button>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    size='small' fullWidth
                                    label='Add email address'
                                    placeholder='name@example.com'
                                    value={ccInput}
                                    onChange={e => setCcInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCc() } }}
                                />
                                <Button variant='contained' size='small' onClick={handleAddCc}
                                    startIcon={<i className='tabler-plus' style={{ fontSize: 14 }} />}
                                >Add</Button>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, minHeight: 30 }}>
                                {ccEmails.length === 0
                                    ? <Typography variant='caption' color='text.secondary'>No emails added</Typography>
                                    : ccEmails.map(e => (
                                        <Chip key={e} label={e} size='small' variant='tonal' color='primary'
                                            onDelete={() => handleRemoveCc(e)}
                                        />
                                    ))
                                }
                            </Box>
                            {ccFeedback && <Alert severity={ccFeedback.type} sx={{ py: 0 }}>{ccFeedback.msg}</Alert>}
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                <Button size='small' variant='tonal' color='secondary'
                                    onClick={() => {
                                        setCcEditMode(false); setCcInput('')
                                        // Reset to DB value
                                        try {
                                            const parsed = typeof data.cc_emails === 'string' ? JSON.parse(data.cc_emails) : (data.cc_emails || [])
                                            setCcEmails(Array.isArray(parsed) ? parsed.filter(Boolean) : [])
                                        } catch { setCcEmails([]) }
                                    }}
                                >Cancel</Button>
                                <Button size='small' variant='contained' color='primary'
                                    disabled={ccSaving}
                                    startIcon={ccSaving ? <CircularProgress size={14} /> : <i className='tabler-device-floppy' style={{ fontSize: 14 }} />}
                                    onClick={() => handleSaveCcEmails(ccEmails)}
                                >Save</Button>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Attached Files */}
            <Box sx={{ mb: 3 }}>
                <SectionHeader icon='tabler-paperclip' title='Attached Files' />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant='caption' color='text.secondary'>Total Documents: {files.length}</Typography>
                    <Button size='small' variant='tonal'
                        startIcon={<i className='tabler-folder-open' style={{ fontSize: 14 }} />}
                        onClick={() => setFileDialogOpen(true)}
                        disabled={files.length === 0}
                    >
                        View Files
                    </Button>
                </Box>
                {files.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {files.map((f, i) => (
                            <Chip key={i} label={f.name} size='small' variant='outlined'
                                icon={<i className='tabler-file' style={{ fontSize: 14 }} />}
                                onClick={() => window.open(f.url, '_blank')}
                                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                            />
                        ))}
                    </Box>
                )}
            </Box>

            {/* Email Agreement Section */}
            {isActionable && !isAccountStep && (
                <Box sx={{
                    mb: 3, p: 2, borderRadius: 1,
                    bgcolor: (theme: any) => theme.palette.mode === 'light' ? 'primary.light' : 'rgba(115, 103, 240, 0.12)',
                    border: '1px dashed', borderColor: 'primary.main',
                    display: 'flex', flexDirection: 'column', gap: 1.5
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i className='tabler-mail-fast' style={{ fontSize: 20, color: 'var(--mui-palette-primary-main)' }} />
                        <Typography variant='subtitle2' fontWeight={700}>Vendor Agreement Email</Typography>
                    </Box>
                    <Typography variant='caption' color='text.secondary'>
                        ส่งอีเมลแจ้งรายละเอียดเงื่อนไขและขอเอกสารไปยัง Vendor Contact: <strong>{targetContactName} ({displayTargetEmail})</strong>
                        <br />การส่งอีเมลนี้จะถือเป็นการอนุมัติคำขอในขั้นตอนนี้โดยอัตโนมัติ
                    </Typography>

                    {emailFeedback && (
                        <Alert severity={emailFeedback.type} sx={{ py: 0, '& .MuiAlert-message': { fontSize: '0.75rem' } }}>
                            {emailFeedback.msg}
                        </Alert>
                    )}

                    <Button
                        variant='contained' color='primary' fullWidth size='small'
                        startIcon={sendingEmail ? <CircularProgress size={16} color='inherit' /> : <i className='tabler-send' style={{ fontSize: 16 }} />}
                        onClick={handleSendEmailAndApprove}
                        disabled={sendingEmail || !displayTargetEmail || displayTargetEmail === 'No Email'}
                    >
                        {sendingEmail ? 'Sending & Approving...' : 'Send Agreement Email & Approve'}
                    </Button>
                </Box>
            )}

            {/* Account Registration Step UI (only when Account step is in_progress) */}
            {isAccountStep && (
                <Box sx={{
                    mb: 3, p: 2.5, borderRadius: 1,
                    bgcolor: (theme: any) => theme.palette.mode === 'light' ? 'rgba(102, 16, 242, 0.04)' : 'rgba(102, 16, 242, 0.12)',
                    border: '1px solid', borderColor: 'rgba(102, 16, 242, 0.4)',
                    display: 'flex', flexDirection: 'column', gap: 2
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i className='tabler-building-bank' style={{ fontSize: 22, color: '#6610f2' }} />
                        <Box>
                            <Typography variant='subtitle1' fontWeight={700} color='#6610f2'>Account Registration Step</Typography>
                            <Typography variant='caption' color='text.secondary'>
                                กรุณาลงทะเบียน Vendor ในระบบแล้วกรอก Vendor Code เพื่อเสร็จสิ้นกระบวนการ
                            </Typography>
                        </Box>
                    </Box>
                    <TextField
                        fullWidth size='small'
                        label='Vendor Code (FFT System)'
                        placeholder='e.g. V-12345'
                        value={vendorCodeInput}
                        onChange={e => setVendorCodeInput(e.target.value)}
                    />
                    {completeFeedback && (
                        <Alert severity={completeFeedback.type} sx={{ py: 0 }}>{completeFeedback.msg}</Alert>
                    )}
                    <Button
                        variant='contained' fullWidth
                        sx={{ bgcolor: '#6610f2', '&:hover': { bgcolor: '#5a0ec4' } }}
                        disabled={completing || !vendorCodeInput.trim()}
                        startIcon={completing ? <CircularProgress size={16} color='inherit' /> : <i className='tabler-circle-check' style={{ fontSize: 18 }} />}
                        onClick={handleCompleteRegistration}
                    >
                        {completing ? 'Completing...' : 'Complete Registration'}
                    </Button>
                </Box>
            )}

            {/* GPR Form — always visible for PO PIC (checker step) */}
            {isActionable && !isAccountStep && (
                <Box sx={{
                    mb: 3, p: 2, borderRadius: 1,
                    border: '1px solid', borderColor: 'divider',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <i className='tabler-clipboard-text' style={{ fontSize: 20, color: 'var(--mui-palette-primary-main)' }} />
                        <Box>
                            <Typography variant='subtitle2' fontWeight={700}>Supplier / Outsourcing Selection Sheet</Typography>
                            <Typography variant='caption' color='text.secondary'>
                                {data.gpr_data ? 'GPR form filled — click to edit' : 'Fill in the vendor evaluation form from vendor response'}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {data.gpr_data && (
                            <Chip label='Filled' size='small' color='success' variant='tonal'
                                icon={<i className='tabler-circle-check' style={{ fontSize: 13 }} />}
                            />
                        )}
                        <Button size='small' variant='contained' color='primary'
                            startIcon={<i className={data.gpr_data ? 'tabler-pencil' : 'tabler-plus'} style={{ fontSize: 14 }} />}
                            onClick={() => setGprDialogOpen(true)}
                        >
                            {data.gpr_data ? 'Edit Form' : 'Fill Form'}
                        </Button>
                    </Box>
                </Box>
            )}

            {/* Approve / Reject Buttons (for normal approval steps only, not Account step) */}
            {isActionable && !isAccountStep && (
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button variant='contained' color='success' fullWidth
                        startIcon={<i className='tabler-circle-check' style={{ fontSize: 18 }} />}
                        onClick={() => onApprove(computedNextStatus, isFinalStep)}
                    >Approve</Button>
                    <Button variant='contained' color='error' fullWidth
                        startIcon={<i className='tabler-circle-x' style={{ fontSize: 18 }} />}
                        onClick={onReject}
                    >Reject</Button>
                </Box>
            )}

            <FileViewerDialog open={fileDialogOpen} files={files} onClose={() => setFileDialogOpen(false)} />
            <GprFormDialog
                open={gprDialogOpen}
                rowData={data}
                onClose={() => setGprDialogOpen(false)}
                onSaved={() => { setGprDialogOpen(false); onEmailSent() }}
            />

            {/* Edit Vendor Modal (reuse from find-vendor — full Vendor Info + Contacts + Products editing) */}
            <EditVendorModal
                open={editVendorOpen}
                onClose={() => setEditVendorOpen(false)}
                vendorId={data.vendor_id || null}
                rowData={{
                    vendor_id: data.vendor_id,
                    fft_vendor_code: data.fft_vendor_code,
                    fft_status: data.fft_status,
                    status_check: data.status_check,
                    company_name: data.company_name,
                    vendor_type_id: data.vendor_type_id,
                    vendor_type_name: data.vendor_type_name,
                    province: data.province,
                    postal_code: data.postal_code,
                    website: data.website,
                    address: data.address,
                    tel_center: data.tel_center,
                    emailmain: data.emailmain,
                    vendor_region: data.vendor_region,
                    contacts: contacts,
                    products: products,
                    CREATE_BY: data.CREATE_BY,
                    UPDATE_BY: data.UPDATE_BY,
                    CREATE_DATE: data.CREATE_DATE,
                    UPDATE_DATE: data.UPDATE_DATE,
                    INUSE: data.INUSE
                }}
                onSuccess={() => { setEditVendorOpen(false); onEmailSent() }}
            />

            {/* Edit Request Dialog */}
            <Dialog
                maxWidth='sm'
                fullWidth={true}
                onClose={(_event, reason) => {
                    if (reason !== 'backdropClick') setEditDialogOpen(false)
                }}
                TransitionComponent={Transition}
                open={editDialogOpen}
                sx={{
                    '& .MuiDialog-paper': { overflow: 'visible' },
                    '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
                }}
            >
                <DialogTitle>
                    <Typography variant='h5' component='span'>Edit Request</Typography>
                    <DialogCloseButton onClick={() => setEditDialogOpen(false)} disableRipple>
                        <i className='tabler-x' />
                    </DialogCloseButton>
                </DialogTitle>
                <DialogContent dividers>
                    {editFeedback && <Alert severity={editFeedback.type} sx={{ mb: 2 }}>{editFeedback.msg}</Alert>}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <TextField
                            fullWidth
                            label='Support Product / Process'
                            value={editForm.supportProduct_Process}
                            onChange={e => setEditForm(prev => ({ ...prev, supportProduct_Process: e.target.value }))}
                        />
                        <TextField
                            fullWidth
                            label='Purchase Frequency'
                            value={editForm.purchase_frequency}
                            onChange={e => setEditForm(prev => ({ ...prev, purchase_frequency: e.target.value }))}
                        />
                        <TextField
                            fullWidth multiline rows={3}
                            label='Requester Remark'
                            value={editForm.requester_remark}
                            onChange={e => setEditForm(prev => ({ ...prev, requester_remark: e.target.value }))}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'flex-start' }}>
                    <Button
                        onClick={handleSaveEdit}
                        variant='contained'
                        color='primary'
                        disabled={editSaving}
                        startIcon={editSaving ? <CircularProgress size={16} /> : <i className='tabler-device-floppy' style={{ fontSize: 16 }} />}
                    >Save</Button>
                    <Button onClick={() => setEditDialogOpen(false)} variant='tonal' color='secondary' disabled={editSaving}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}


// ─────────────────────────────────────────────────────────────────────────────
// Detail Renderer for Master/Detail AG Grid
// ─────────────────────────────────────────────────────────────────────────────
const DetailRenderer = (props: any) => {
    return (
        <DetailPanel
            data={props.data}
            onApprove={(status: string, finalStep: boolean) => props.context.onApprove(props.data, status, finalStep)}
            onReject={() => props.context.onReject(props.data)}
            onEmailSent={() => props.context.onEmailSent()}
            onCompleted={() => props.context.onCompleted()}
        />
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main SearchResult Component
// ─────────────────────────────────────────────────────────────────────────────
export default function SearchResult() {
    const { getValues, setValue } = useFormContext<RequestRegisterFormData>()
    const { isEnableFetching, setIsEnableFetching } = useDxContext()
    const { data: statusOptions = [] } = useRequestStatusOptions()

    const [totalCount, setTotalCount] = useState(0)
    const gridApiRef = useRef<any>(null)

    // Action dialog & Drawer state
    const [selectedData, setSelectedData] = useState<any | null>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)

    // Approve/Reject Action Dialog state
    const [actionMode, setActionMode] = useState<'approve' | 'reject'>('approve')
    const [actionDialogOpen, setActionDialogOpen] = useState(false)
    const [nextStatus, setNextStatus] = useState('')
    const [isFinalStep, setIsFinalStep] = useState(false)

    const user = getUserData()
    const empCode = user?.EMPLOYEE_CODE

    // ── Server-Side Datasource ────────────────────────────────────────────────
    const datasource = useMemo<IServerSideDatasource>(() => ({
        getRows: async (params) => {
            const f = getValues('searchFilters')
            const { startRow, endRow } = params.request
            const order = params.request.sortModel?.length > 0
                ? params.request.sortModel.map((s: any) => ({ id: s.colId, desc: s.sort === 'desc' }))
                : [{ id: 'request_id', desc: true }]
            try {
                const res = await RegisterRequestServices.getAll({
                    assign_to: empCode,
                    SearchFilters: [
                        { id: 'company_name', value: f.vendor_name || null },
                        { id: 'Request_By_EmployeeCode', value: f.submitted_by || null },
                        { id: 'request_status', value: f.overall_status?.value || null }
                    ].filter((x: any) => x.value !== null && x.value !== ''),
                    ColumnFilters: [],
                    Order: order,
                    Start: startRow ?? 0,
                    Limit: (endRow ?? 50) - (startRow ?? 0)
                })
                if (res.data?.Status) {
                    setTotalCount(res.data.TotalCountOnDb)
                    params.success({ rowData: res.data.ResultOnDb, rowCount: res.data.TotalCountOnDb })
                } else {
                    params.fail()
                }
            } catch {
                params.fail()
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [empCode]) // getValues is a stable ref — no need to re-create datasource

    // Trigger refresh when Search / Clear button sets isEnableFetching = true
    useEffect(() => {
        if (isEnableFetching && gridApiRef.current) {
            setIsEnableFetching(false)
            gridApiRef.current.refreshServerSide({ purge: true })
        }
    }, [isEnableFetching, setIsEnableFetching])

    // ── Column / Grid State Persistence ──────────────────────────────────────
    const savedGridState = useMemo(() => getValues('searchResults.agGridState'), []) // eslint-disable-line react-hooks/exhaustive-deps

    const handleStateUpdated = useCallback((e: StateUpdatedEvent) => {
        setValue('searchResults.agGridState', e.state)
    }, [setValue])

    const colDefs = useMemo<ColDef[]>(() => [
        {
            headerName: '',
            field: 'view',
            width: 50,
            pinned: 'left',
            cellRenderer: (params: any) => (
                <IconButton
                    size='small'
                    color='primary'
                    onClick={() => {
                        setSelectedData(params.data)
                        setDrawerOpen(true)
                    }}
                >
                    <i className='tabler-eye' style={{ fontSize: 18 }} />
                </IconButton>
            )
        },
        {
            field: 'request_status',
            headerName: 'Status',
            flex: 1.2,
            minWidth: 230,
            cellRenderer: 'agGroupCellRenderer',
            cellRendererParams: {
                innerRenderer: (params: any) => {
                    const statusCfg = statusOptions.find(s => s.value === params.value)
                    const bgColor = statusCfg?.accent ? `${statusCfg.accent}20` : '#8A8D9920'
                    const txtColor = statusCfg?.accent || '#8A8D99'
                    return (
                        <Chip label={params.value || '-'} size='small'
                            sx={{
                                bgcolor: bgColor,
                                color: txtColor,
                                border: '1px solid',
                                borderColor: `${txtColor}40`,
                                fontWeight: 700,
                                fontSize: '0.72rem',
                                height: 24
                            }}
                        />
                    )
                }
            }
        },
        { field: 'company_name', headerName: 'Company Name', flex: 1.5, minWidth: 210 },
        { field: 'supportProduct_Process', headerName: 'Support Product / Process', flex: 1, minWidth: 180 },
        { field: 'purchase_frequency', headerName: 'Purchase Frequency', width: 170 },
        {
            field: 'FULL_NAME',
            headerName: 'Submitted By',
            flex: 1,
            minWidth: 170,
            valueGetter: (p: any) => p.data?.FULL_NAME || p.data?.EMPLOYEE_CODE || '-'
        },
        {
            field: 'documents',
            headerName: 'Files',
            width: 100,
            cellRenderer: (params: any) => {
                const count = buildFileUrls(params.value).length
                if (count === 0) return <Typography variant='caption' color='text.disabled'>—</Typography>
                return (
                    <Chip label={`${count} file${count > 1 ? 's' : ''}`} size='small'
                        icon={<i className='tabler-paperclip' style={{ fontSize: 13, color: '#1976d2' }} />}
                        sx={{
                            bgcolor: '#1976d220',
                            color: '#1976d2',
                            border: '1px solid #1976d240',
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            height: 24,
                            '& .MuiChip-icon': { color: '#1976d2' }
                        }}
                    />
                )
            }
        },
        {
            field: 'CREATE_DATE',
            headerName: 'Submitted Date',
            width: 150,
            valueFormatter: (p: any) => p.value ? new Date(p.value).toLocaleDateString('th-TH') : '-'
        }
    ], [statusOptions])

    const handleActionSuccess = () => {
        gridApiRef.current?.refreshServerSide({ purge: true })
        setSelectedData(null)
    }

    const gridContext = useMemo(() => ({
        onApprove: (data: any, status: string, finalStep: boolean) => {
            setSelectedData(data)
            setNextStatus(status)
            setIsFinalStep(finalStep)
            setActionMode('approve')
            setActionDialogOpen(true)
        },
        onReject: (data: any) => {
            setSelectedData(data)
            setIsFinalStep(false)
            setActionMode('reject')
            setActionDialogOpen(true)
        },
        onEmailSent: () => {
            gridApiRef.current?.refreshServerSide({ purge: true })
        },
        onCompleted: () => {
            gridApiRef.current?.refreshServerSide({ purge: true })
            setDrawerOpen(false)
            setSelectedData(null)
        }
    }), [])

    return (
        <Grid container spacing={6}>



            {/* AG Grid */}
            <Grid item xs={12}>
                <Card>
                    <CardContent sx={{ p: '24px !important' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                            <Typography variant='subtitle1' fontWeight={700}>
                                Results ({totalCount})
                            </Typography>
                            <Button
                                size='small'
                                variant='tonal'
                                startIcon={<i className='tabler-refresh' style={{ fontSize: 16 }} />}
                                onClick={() => gridApiRef.current?.refreshServerSide({ purge: true })}
                            >
                                Refresh
                            </Button>
                        </Box>

                        <DxAGgridTable
                            columnDefs={colDefs}
                            serverSideDatasource={datasource}
                            height={600}
                            overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No assigned requests found</span>'
                            getRowId={(p: any) => String(p.data.request_id)}
                            onGridReady={(p: any) => { gridApiRef.current = p.api }}
                            initialState={savedGridState}
                            onStateUpdated={handleStateUpdated}
                            masterDetail={true}
                            detailCellRenderer={DetailRenderer}
                            detailRowHeight={850}
                            context={gridContext}
                        />
                    </CardContent>
                </Card>
            </Grid>

            {/* Approve / Reject Dialog */}
            <ActionDialog
                open={actionDialogOpen}
                mode={actionMode}
                requestId={selectedData?.request_id || null}
                nextStatus={nextStatus}
                isFinalStep={isFinalStep}
                onClose={() => setActionDialogOpen(false)}
                onSuccess={handleActionSuccess}
            />

            {/* View Detail Dialog */}
            <Dialog
                maxWidth='sm'
                fullWidth={true}
                onClose={(event, reason) => {
                    if (reason !== 'backdropClick') {
                        setDrawerOpen(false)
                    }
                }}
                TransitionComponent={Transition}
                open={drawerOpen}
                scroll='paper'
                sx={{
                    '& .MuiDialog-paper': { overflow: 'visible' },
                    '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
                }}
            >
                <DialogTitle>
                    <Typography variant='h5' component='span'>Request Details</Typography>
                    <DialogCloseButton onClick={() => setDrawerOpen(false)} disableRipple>
                        <i className='tabler-x' />
                    </DialogCloseButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0, bgcolor: 'background.default' }}>
                    {selectedData && <DetailRenderer data={selectedData} context={gridContext} />}
                </DialogContent>
            </Dialog>
        </Grid>
    )
}
