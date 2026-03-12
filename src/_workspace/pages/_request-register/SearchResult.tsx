// React Imports
import { useMemo, useState, useEffect, useRef, useCallback } from 'react'

// MUI Imports
import {
    Grid, Card, CardContent, Box, Typography, Chip, Divider,
    IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
    Button, List, ListItem, ListItemIcon, ListItemText, CircularProgress,
    TextField, Alert
} from '@mui/material'

// AG Grid Imports
import type { ColDef, IServerSideDatasource, StateUpdatedEvent } from 'ag-grid-community'
import DxAGgridTable from '@/_template/DxAGgridTable'

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
        <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <i className='tabler-paperclip' style={{ fontSize: 20, color: 'var(--mui-palette-primary-main)' }} />
                    <Typography variant='h6'>Attached Files ({files.length})</Typography>
                </Box>
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
            <DialogActions>
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
            await RegisterRequestServices.updateStatus({
                request_id: requestId,
                request_status: mode === 'approve' ? nextStatus : 'Rejected',
                approve_by: user?.EMPLOYEE_CODE || '',
                approver_remark: remark,
                UPDATE_BY: user?.EMPLOYEE_CODE || '',
                isFinalStep: mode === 'approve' ? isFinalStep : false,
            })
            setRemark('')
            onSuccess()
            onClose()
        } catch (e: any) {
            setError(e?.message || 'Failed to update status')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <i
                        className={mode === 'approve' ? 'tabler-circle-check' : 'tabler-circle-x'}
                        style={{ fontSize: 22, color: mode === 'approve' ? '#28C76F' : '#EA5455' }}
                    />
                    <Typography variant='h6'>{mode === 'approve' ? 'Approve Request' : 'Reject Request'}</Typography>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                {error && <Alert severity='error' sx={{ mb: 2 }}>{error}</Alert>}
                <TextField
                    fullWidth multiline rows={3}
                    label='Remark / Comment (optional)'
                    placeholder='Enter your remark here...'
                    value={remark}
                    onChange={e => setRemark(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant='tonal' color='secondary' disabled={loading}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant='contained'
                    color={mode === 'approve' ? 'success' : 'error'}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} /> : undefined}
                >
                    {mode === 'approve' ? 'Confirm Approve' : 'Confirm Reject'}
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
    const { data: statusOptions = [] } = useRequestStatusOptions()
    const user = getUserData()
    const files = buildFileUrls(data?.documents)
    if (!data) return null

    const handleSendEmail = async () => {
        setSendingEmail(true)
        setEmailFeedback(null)
        try {
            const res = await RegisterRequestServices.sendAgreementEmail(data)
            if (res.data.Status) {
                setEmailFeedback({ type: 'success', msg: res.data.Message })
                onEmailSent()
            } else {
                setEmailFeedback({ type: 'error', msg: res.data.Message })
            }
        } catch (err: any) {
            setEmailFeedback({ type: 'error', msg: err?.response?.data?.Message || 'Failed to send email' })
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
                <SectionHeader icon='tabler-clipboard-list' title='Request Info' />
                {infoRow('Support Product / Process', data.supportProduct_Process)}
                {infoRow('Purchase Frequency', data.purchase_frequency)}
                {infoRow('Assigned To (PIC)', data.assign_to)}
                {infoRow('Submitted Date', data.CREATE_DATE ? new Date(data.CREATE_DATE).toLocaleDateString('th-TH') : '-')}
                {data.requester_remark && infoRow('Requester Remark', data.requester_remark)}
            </Box>

            {/* Vendor Info */}
            <Box sx={{ mb: 3 }}>
                <SectionHeader icon='tabler-building-store' title='Vendor Info' />
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
                            <Box sx={{ display: 'grid', gridTemplateColumns: '0.5fr 2fr 1.5fr 1fr 1.5fr', px: 2, py: 1, bgcolor: 'action.hover' }}>
                                {['#', 'Description', 'Approver', 'Status', 'Updated'].map(h => (
                                    <Typography key={h} variant='caption' fontWeight={700} color='text.secondary'>{h}</Typography>
                                ))}
                            </Box>
                            {steps.sort((a: any, b: any) => a.step_order - b.step_order).map((s: any, i: number) => {
                                const stepLog = logs.find((l: any) => l.step_id === s.step_id)
                                return (
                                    <Box key={i} sx={{ display: 'grid', gridTemplateColumns: '0.5fr 2fr 1.5fr 1fr 1.5fr', px: 2, py: 1.25, borderTop: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
                                        <Typography variant='body2' fontWeight={600}>{s.step_order}</Typography>
                                        <Typography variant='body2' fontWeight={600}>{s.DESCRIPTION || '-'}</Typography>
                                        <Typography variant='body2' color='text.secondary'>{s.approver_id || '-'}</Typography>
                                        <Chip label={s.step_status === 'pending' ? 'waiting' : (s.step_status || 'waiting')} size='small' variant='tonal'
                                            color={s.step_status === 'approved' ? 'success' : s.step_status === 'rejected' ? 'error' : s.step_status === 'pending' ? 'warning' : 'default'}
                                            sx={{ fontWeight: 600, fontSize: '0.68rem', height: 22 }}
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

            {/* Email Agreement Section (actionable status only, not for Account step)
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
                        ส่งอีเมลแจ้งรายละเอียดเงื่อนไขและขอเอกสารไปยัง Vendor ({data.emailmain || 'No Email'})
                    </Typography>

                    {emailFeedback && (
                        <Alert severity={emailFeedback.type} sx={{ py: 0, '& .MuiAlert-message': { fontSize: '0.75rem' } }}>
                            {emailFeedback.msg}
                        </Alert>
                    )}

                    <Button
                        variant='contained' color='primary' fullWidth size='small'
                        startIcon={sendingEmail ? <CircularProgress size={16} color='inherit' /> : <i className='tabler-send' style={{ fontSize: 16 }} />}
                        onClick={handleSendEmail}
                        disabled={sendingEmail || !data.emailmain}
                    >
                        {sendingEmail ? 'Sending...' : 'Send Agreement Email'}
                    </Button>
                </Box>
            )} */}

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
                    const chipColor = (statusOptions.find(s => s.value === params.value)?.chipColor || 'default') as any
                    return (
                        <Chip label={params.value || '-'} color={chipColor} size='small' variant='tonal'
                            sx={{ fontWeight: 700, fontSize: '0.72rem', height: 24 }}
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
                    <Chip label={`${count} file${count > 1 ? 's' : ''}`} size='small' color='primary' variant='tonal'
                        icon={<i className='tabler-paperclip' style={{ fontSize: 13 }} />}
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
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                maxWidth='lg'
                fullWidth
                scroll='paper'
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <i className='tabler-file-description' style={{ fontSize: 24, color: 'var(--mui-palette-primary-main)' }} />
                        <Typography variant='h5'>Request Details</Typography>
                    </Box>
                    <IconButton onClick={() => setDrawerOpen(false)} size='small'>
                        <i className='tabler-x' style={{ fontSize: 20 }} />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0, bgcolor: 'background.default' }}>
                    {selectedData && <DetailRenderer data={selectedData} context={gridContext} />}
                </DialogContent>
            </Dialog>
        </Grid>
    )
}
