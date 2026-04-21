// React Imports
import { useMemo, useState, useEffect, useRef, useCallback } from 'react'

import GprFormDialog from '@_workspace/pages/_request-register/modal/GprFormDialog'

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
import SearchFilterCard from '@_workspace/components/search/SearchFilterCard'
import SearchResultCard from '@_workspace/components/search/SearchResultCard'

// Services
import RegisterRequestServices from '@_workspace/services/_register-request/RegisterRequestServices'

// Utils
import { getUserData } from '@/utils/user-profile/userLoginProfile'

// Status — colors from DB
import useRequestStatusOptions from '@_workspace/react-query/useRequestStatusOptions'
import {
    getApproveActionLabel,
    inferStepCode,
    getRejectActionLabel,
    parseActionRequiredRemark,
    isAgreementReachedStep,
    isIssueGprBStep,
    isIssueGprCStep,
    isPendingAgreementStep,
    isPicStep,
    isVendorDisagreedStep,
    resolveGroupCodeForStep,
    resolveNextStatus,
} from '@_workspace/utils/requestWorkflow'
import useApprovalWorkflow from '@_workspace/hooks/useApprovalWorkflow'

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

const parseApprovalSteps = (approvalStepsRaw: any): any[] => {
    try {
        const parsed = typeof approvalStepsRaw === 'string' ? JSON.parse(approvalStepsRaw) : (approvalStepsRaw || [])
        return Array.isArray(parsed) ? parsed.filter(Boolean) : []
    } catch {
        return []
    }
}

const getMyQueueStepStatus = (row: any, empCode?: string, queueStepCode?: string): 'in_progress' | 'approved' | 'rejected' | 'pending' => {
    const normalizedQueueStepCode = String(queueStepCode || '').trim().toUpperCase()
    const steps = parseApprovalSteps(row?.approval_steps)
    const myQueueSteps = steps.filter((step: any) => {
        if (!step || step.approver_id !== empCode) return false
        if (!normalizedQueueStepCode) return true
        return inferStepCode(step) === normalizedQueueStepCode
    })

    if (myQueueSteps.some((step: any) => step.step_status === 'in_progress')) return 'in_progress'
    if (myQueueSteps.some((step: any) => step.step_status === 'approved')) return 'approved'
    if (myQueueSteps.some((step: any) => step.step_status === 'rejected')) return 'rejected'

    return 'pending'
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
            onClose={(event, reason) => { if (reason !== 'backdropClick') onClose() }}
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
    approveActionLabel: string
    rejectActionLabel: string
    onClose: () => void
    onSuccess: () => void
}

const ActionDialog = ({ open, mode, requestId, nextStatus, isFinalStep, approveActionLabel, rejectActionLabel, onClose, onSuccess }: ActionDialogProps) => {
    const [remark, setRemark] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const user = getUserData()

    const handleSubmit = async () => {
        if (!requestId) return
        setLoading(true)
        setError(null)
        try {
            const normalizedNextStatus = String(nextStatus || '').trim().toLowerCase()
            const normalizedApproveLabel = String(approveActionLabel || '').trim().toLowerCase()
            const workflowAction: 'APPROVE' | 'DISAGREE' | 'ACTION_REQUIRED' | 'REJECT' =
                mode === 'reject'
                    ? 'REJECT'
                    : (normalizedApproveLabel.includes('action required')
                        ? 'ACTION_REQUIRED'
                        : (normalizedNextStatus.includes('issue gpr b')
                            || normalizedNextStatus.includes('issue gpr c')
                            || normalizedNextStatus.includes('vendor disagre')
                            ? 'DISAGREE'
                            : 'APPROVE'))

            const res = await RegisterRequestServices.updateStatus({
                request_id: requestId,
                request_status: mode === 'approve' ? nextStatus : 'Rejected',
                workflow_action: workflowAction,
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
    const actionLabel = mode === 'approve' ? approveActionLabel : rejectActionLabel

    return (
        <Dialog
            maxWidth='xs'
            fullWidth={true}
            open={open}
            disableEscapeKeyDown
            TransitionComponent={Transition}
            onClose={(_event, reason) => { if (reason !== 'backdropClick') onClose() }}
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
                        {mode === 'approve' ? `Confirm action: ${approveActionLabel}` : `Confirm action: ${rejectActionLabel}`}
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

            <DialogActions sx={{ justifyContent: 'center', borderTop: 'none', mb: 4 }}>
                <LoadingButton
                    onClick={handleSubmit}
                    loading={loading}
                    loadingIndicator={mode === 'approve' ? `${approveActionLabel}...` : `${rejectActionLabel}...`}
                    variant='contained'
                    color={mode === 'approve' ? 'success' : 'error'}
                    sx={{ mr: 4 }}
                    disabled={mode === 'reject' && !remark.trim()}
                >
                    <span>Yes, {actionLabel} !</span>
                </LoadingButton>
                <Button variant='tonal' color='secondary' onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Detail Panel
// ─────────────────────────────────────────────────────────────────────────────
interface DetailPanelProps {
    data: any
    empCode: string | undefined
    queueStepCode?: string
    onApprove: (nextStatus: string, isFinalStep: boolean, approveActionLabel: string) => void
    onReject: (rejectActionLabel: string) => void
    onRefresh: () => void
}

const DetailPanel = ({ data, empCode, queueStepCode, onApprove, onReject, onRefresh }: DetailPanelProps) => {
    const [fileDialogOpen, setFileDialogOpen] = useState(false)
    const [gprFormOpen, setGprFormOpen] = useState(false)
    const [actionRequiredDialogOpen, setActionRequiredDialogOpen] = useState(false)
    const [selectedActionRequired, setSelectedActionRequired] = useState<any | null>(null)
    const { data: statusOptions = [] } = useRequestStatusOptions()
    if (!data) return null

    const files = buildFileUrls(data?.documents)
    const accent = statusOptions.find(s => s.value === data.request_status)?.accent || '#8A8D99'

    const approvalSteps: any[] = (() => {
        try { return typeof data.approval_steps === 'string' ? JSON.parse(data.approval_steps) : (data.approval_steps || []) } catch { return [] }
    })().filter(Boolean).sort((a: any, b: any) => a.step_order - b.step_order)

    const logs: any[] = (() => {
        try { return typeof data.approval_logs === 'string' ? JSON.parse(data.approval_logs) : (data.approval_logs || []) } catch { return [] }
    })().filter(Boolean)

    const currentStep = approvalSteps.find((s: any) => s.step_status === 'in_progress')

    // Find the step this approver has already actioned (approved/rejected) — for showing history badge
    const myActionedStep = approvalSteps.find((s: any) =>
        s.approver_id === empCode && (s.step_status === 'approved' || s.step_status === 'rejected')
    )

    // PIC step: description contains 'pic' — allow assign_to (not just approver_id) to action
    const isCurrentPicStep = !!currentStep && isPicStep(currentStep)
    const isPicOwnedNegotiationStep = !!currentStep && (
        isPendingAgreementStep(currentStep) ||
        isAgreementReachedStep(currentStep) ||
        isIssueGprBStep(currentStep) ||
        isIssueGprCStep(currentStep) ||
        isVendorDisagreedStep(currentStep)
    )
    const isCurrentStepMine = !!currentStep && (
        currentStep.approver_id === empCode ||
        ((isCurrentPicStep || isPicOwnedNegotiationStep) && data.assign_to === empCode)
    )
    const normalizedQueueStepCode = String(queueStepCode || '').trim().toUpperCase()
    const isCurrentStepMatchingQueue = !normalizedQueueStepCode || inferStepCode(currentStep) === normalizedQueueStepCode
    const hasVendorRequested = !!currentStep && logs.some((l: any) =>
        String(l.step_id || '') === String(currentStep.step_id || '') && l.action_type === 'vendor_requested'
    )
    const approveButtonLabel = getApproveActionLabel(currentStep, hasVendorRequested)
    const rejectButtonLabel = getRejectActionLabel(currentStep)
    const isAgreementReachedCompleted = approvalSteps.some((s: any) =>
        isAgreementReachedStep(s) && String(s?.step_status || '').toLowerCase() === 'completed'
    )

    // Actionable only if there IS an in_progress step AND it belongs to this user
    const isActionable = isCurrentStepMine && isCurrentStepMatchingQueue && !isAgreementReachedCompleted

    const nextStep = currentStep ? approvalSteps.find((s: any) => s.step_order === currentStep.step_order + 1 && s.step_status === 'pending') : null
    const isFinalStep = !!currentStep && !nextStep
    const computedNextStatus = resolveNextStatus(statusOptions, currentStep, nextStep, hasVendorRequested)
    const { isNegotiationStep, actions: negotiationActions } = useApprovalWorkflow(currentStep, statusOptions)
    const agreeAction = negotiationActions.find(action => action.key === 'agree')
    const disagreeAction = negotiationActions.find(action => action.key === 'disagree')
    const renderDisagreeFirst = Boolean(disagreeAction && !disagreeAction.label.toLowerCase().includes('vendor disagreed'))

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

    const getStepStatusCfg = (status: string) => {
        switch (status) {
            case 'approved': case 'completed': return { label: 'Completed', bgColor: '#eaf8ef', txtColor: '#2e7d32', borderColor: '#b7dfc4', icon: 'tabler-circle-check-filled' }
            case 'in_progress': return { label: 'In Progress', bgColor: '#fff4e5', txtColor: '#f08a24', borderColor: '#f6c07e', icon: 'tabler-clock-filled' }
            case 'rejected': return { label: 'Rejected', bgColor: '#fdecec', txtColor: '#d64545', borderColor: '#f4b4b4', icon: 'tabler-circle-x-filled' }
            case 'skipped': return { label: 'Skipped', bgColor: '#eaf3ff', txtColor: '#3b82f6', borderColor: '#b9d7ff', icon: 'tabler-circle-minus' }
            case 'pending': default: return { label: 'Waiting', bgColor: '#f2f3f5', txtColor: '#8b909a', borderColor: '#d8dce2', icon: 'tabler-clock' }
        }
    }

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
                        {/* Your action badge — shows when this approver has already actioned this request */}
                        {myActionedStep && (
                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 1,
                                px: 1.25, py: 0.4, borderRadius: 5,
                                bgcolor: myActionedStep.step_status === 'approved' ? '#e8f5e9' : '#ffebee',
                                border: '1px solid',
                                borderColor: myActionedStep.step_status === 'approved' ? '#a5d6a7' : '#ef9a9a',
                            }}>
                                <i
                                    className={myActionedStep.step_status === 'approved' ? 'tabler-circle-check-filled' : 'tabler-circle-x-filled'}
                                    style={{ fontSize: 13, color: myActionedStep.step_status === 'approved' ? '#2e7d32' : '#c62828' }}
                                />
                                <Typography variant='caption' sx={{ fontWeight: 700, color: myActionedStep.step_status === 'approved' ? '#2e7d32' : '#c62828', lineHeight: 1 }}>
                                    Your action: {myActionedStep.step_status === 'approved' ? 'Approved' : 'Rejected'} · {myActionedStep.DESCRIPTION}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    <Chip label={data.request_status} size='medium'
                        sx={{ fontWeight: 700, bgcolor: `${accent}20`, color: accent, border: '1px solid', borderColor: `${accent}40` }}
                    />
                </Box>
            </Box>

            {/* Request Info */}
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                        <i className='tabler-clipboard-list' style={{ fontSize: 16, color: 'var(--mui-palette-primary-main)' }} />
                        <Typography variant='subtitle2' fontWeight={700} color='text.secondary'>Request Info</Typography>
                        <Divider sx={{ flex: 1 }} />
                    </Box>
                    {data.supportProduct_Process && (
                        <Button size='small' variant='tonal' color='primary' sx={{ ml: 2 }}
                            startIcon={<i className='tabler-file-report' style={{ fontSize: 16 }} />}
                            onClick={() => setGprFormOpen(true)}
                        >
                            Open GPR Form
                        </Button>
                    )}
                </Box>
                {infoRow('Support Product / Process', data.supportProduct_Process)}
                {infoRow('Purchase Frequency', data.purchase_frequency)}
                {infoRow('Assigned PIC', data.assign_to)}
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
                {infoRow('Tel Center', data.tel_center)}
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

            {/* Files */}
            {files.length > 0 && (
                <Box sx={{ mb: 3 }}>
                    <SectionHeader icon='tabler-paperclip' title={`Attached Files (${files.length})`} />
                    <Button size='small' variant='tonal'
                        startIcon={<i className='tabler-folder-open' style={{ fontSize: 16 }} />}
                        onClick={() => setFileDialogOpen(true)}
                    >
                        View {files.length} File{files.length > 1 ? 's' : ''}
                    </Button>
                </Box>
            )}

            {/* Approval Steps */}
            {approvalSteps.length > 0 && (
                <Box sx={{ mb: 3 }}>
                    <SectionHeader icon='tabler-list-check' title={`Approval Steps (${approvalSteps.length})`} />
                    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '0.5fr 2fr 1.5fr 1.2fr 1.5fr', px: 2, py: 1, bgcolor: 'action.hover' }}>
                            {['#', 'Description', 'Approver', 'Status', 'Updated'].map(h => (
                                <Typography key={h} variant='caption' fontWeight={700} color='text.secondary'>{h}</Typography>
                            ))}
                        </Box>
                        {approvalSteps.map((s: any, i: number) => {
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
                                    {(() => {
                                        const parsedRemark = parseActionRequiredRemark(l.remark)
                                        const actionTypeLabel = parsedRemark.isActionRequired ? 'action_required' : l.action_type
                                        const detailParts = [
                                            parsedRemark.owner ? `owner: ${parsedRemark.owner}` : '',
                                            parsedRemark.dueDate ? `due: ${parsedRemark.dueDate}` : '',
                                            parsedRemark.note ? `note: ${parsedRemark.note}` : '',
                                        ].filter(Boolean)
                                        const detailText = detailParts.length > 0
                                            ? detailParts.join(' | ')
                                            : (parsedRemark.rawRemark || '')

                                        return (
                                            <>
                                                {parsedRemark.isActionRequired && (
                                                    <Chip
                                                        size='small'
                                                        label='Action Required'
                                                        color='warning'
                                                        variant='tonal'
                                                        sx={{ height: 20, fontSize: '0.65rem' }}
                                                        onClick={() => {
                                                            setSelectedActionRequired(parsedRemark)
                                                            setActionRequiredDialogOpen(true)
                                                        }}
                                                    />
                                                )}
                                                <Typography variant='caption' color='text.secondary'>
                                                    <strong>{l.action_by}</strong> — {actionTypeLabel} {detailText ? `(${detailText})` : ''} · {l.action_date ? new Date(l.action_date).toLocaleString('th-TH') : ''}
                                                </Typography>
                                            </>
                                        )
                                    })()}
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
            )}

            {/* Decision Info */}
            {(data.approve_by || data.approver_remark) && (
                <Box sx={{ mb: 3 }}>
                    <SectionHeader icon='tabler-user-check' title='Decision Info' />
                    {infoRow('Approved / Rejected By', data.approve_by)}
                    {infoRow('Approval Date', data.approve_date ? new Date(data.approve_date).toLocaleDateString('th-TH') : '-')}
                    {infoRow('Approver Remark', data.approver_remark)}
                </Box>
            )}

            {/* Approve / Reject Buttons */}
            {isActionable && (
                <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                    {isNegotiationStep && agreeAction && disagreeAction && (
                        <>
                            {renderDisagreeFirst && (
                                <Button variant='contained' color={disagreeAction.color} fullWidth
                                    startIcon={<i className={disagreeAction.color === 'warning' ? 'tabler-send' : 'tabler-alert-triangle'} style={{ fontSize: 18 }} />}
                                    onClick={() => onApprove(disagreeAction.nextStatus, disagreeAction.isFinalStep, disagreeAction.label)}
                                >{disagreeAction.label}</Button>
                            )}
                            <Button variant='contained' color={agreeAction.color} fullWidth
                                startIcon={<i className='tabler-circle-check' style={{ fontSize: 18 }} />}
                                onClick={() => onApprove(agreeAction.nextStatus, agreeAction.isFinalStep, agreeAction.label)}
                            >{agreeAction.label}</Button>
                            {!renderDisagreeFirst && (
                                <Button variant='contained' color={disagreeAction.color} fullWidth
                                    startIcon={<i className={disagreeAction.color === 'warning' ? 'tabler-send' : 'tabler-alert-triangle'} style={{ fontSize: 18 }} />}
                                    onClick={() => onApprove(disagreeAction.nextStatus, disagreeAction.isFinalStep, disagreeAction.label)}
                                >{disagreeAction.label}</Button>
                            )}
                        </>
                    )}
                    {!isNegotiationStep && (
                        <>
                            <Button variant='contained' color='success' fullWidth
                                startIcon={<i className='tabler-circle-check' style={{ fontSize: 18 }} />}
                                onClick={() => onApprove(computedNextStatus, isFinalStep, approveButtonLabel)}
                            >{approveButtonLabel}</Button>
                            <Button variant='contained' color='error' fullWidth
                                startIcon={<i className='tabler-circle-x' style={{ fontSize: 18 }} />}
                                onClick={() => onReject(rejectButtonLabel)}
                            >{rejectButtonLabel}</Button>
                        </>
                    )}
                </Box>
            )}

            <FileViewerDialog open={fileDialogOpen} files={files} onClose={() => setFileDialogOpen(false)} />
            {/* Extra Modals for Detail Panel */}
            {gprFormOpen && (
                <GprFormDialog
                    open={gprFormOpen}
                    rowData={data}
                    readOnly={true}
                    onClose={() => setGprFormOpen(false)}
                    onSaved={() => {
                        // Usually this forces reload, but here we just let it be silent saving
                    }}
                />
            )}
            <Dialog
                maxWidth='sm'
                fullWidth={true}
                open={actionRequiredDialogOpen}
                onClose={() => setActionRequiredDialogOpen(false)}
            >
                <DialogTitle>Action Required Detail</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                        <Typography variant='body2'><strong>Owner:</strong> {selectedActionRequired?.owner || '-'}</Typography>
                        <Typography variant='body2'><strong>Due Date:</strong> {selectedActionRequired?.dueDate || '-'}</Typography>
                        <Typography variant='body2'><strong>Note:</strong> {selectedActionRequired?.note || '-'}</Typography>
                        <Typography variant='body2'><strong>Actor:</strong> {selectedActionRequired?.actor || '-'}</Typography>
                        <Typography variant='body2'><strong>Captured At:</strong> {selectedActionRequired?.capturedAt || '-'}</Typography>
                        {selectedActionRequired?.rawRemark && (
                            <Typography variant='caption' color='text.secondary'>Raw: {selectedActionRequired.rawRemark}</Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setActionRequiredDialogOpen(false)} variant='tonal' color='secondary'>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Detail Renderer for AG Grid Master/Detail
// ─────────────────────────────────────────────────────────────────────────────
const DetailRenderer = (props: any) => {
    return (
        <DetailPanel
            data={props.data}
            empCode={props.context.empCode}
            queueStepCode={props.context.queueStepCode}
            onApprove={(status: string, finalStep: boolean, actionLabel: string) => props.context.onApprove(props.data, status, finalStep, actionLabel)}
            onReject={(rejectActionLabel: string) => props.context.onReject(props.data, rejectActionLabel)}
            onRefresh={() => props.context.onRefresh()}
        />
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Props interface
// ─────────────────────────────────────────────────────────────────────────────
interface ApprovalPageContentProps {
    /** The status label that identifies requests belonging to this approver's queue.
     *  Used only for display — filtering is done server-side by approver_id. */
    pageTitle: string
    /** Restrict queue and actions to this workflow step code (e.g. MD_APPROVAL). */
    queueStepCode?: string
    /** Accent color for the page header strip */
    accentColor?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function ApprovalPageContent({ pageTitle, queueStepCode, accentColor = '#7367F0' }: ApprovalPageContentProps) {
    const { data: statusOptions = [] } = useRequestStatusOptions()
    const [totalCount, setTotalCount] = useState(0)
    const [collapse, setCollapse] = useState(false)
    const gridApiRef = useRef<any>(null)
    const [vendorNameFilter, setVendorNameFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState<any>(null)

    const [selectedData, setSelectedData] = useState<any | null>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)

    const [actionMode, setActionMode] = useState<'approve' | 'reject'>('approve')
    const [actionDialogOpen, setActionDialogOpen] = useState(false)
    const [nextStatus, setNextStatus] = useState('')
    const [isFinalStep, setIsFinalStep] = useState(false)
    const [approveActionLabel, setApproveActionLabel] = useState('Approve')
    const [rejectActionLabel, setRejectActionLabel] = useState('Reject')

    const user = getUserData()
    const empCode = user?.EMPLOYEE_CODE

    // ── Server-Side Datasource ─────────────────────────────────────────────
    const datasource = useMemo<IServerSideDatasource>(() => ({
        getRows: async (params) => {
            // Guard: do not fetch without empCode — would return all records and cause crashes
            if (!empCode) {
                params.success({ rowData: [], rowCount: 0 })
                return
            }
            const { startRow, endRow } = params.request
            const order = params.request.sortModel?.length > 0
                ? params.request.sortModel.map((s: any) => ({ id: s.colId, desc: s.sort === 'desc' }))
                : [{ id: 'request_id', desc: true }]
            try {
                const res = await RegisterRequestServices.getAll({
                    approver_id: empCode,
                    queue_step_code: queueStepCode,
                    SearchFilters: [
                        { id: 'company_name', value: vendorNameFilter || null },
                        { id: 'request_status', value: statusFilter?.value || null }
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
    }), [empCode, queueStepCode])

    const handleSearch = useCallback(() => {
        gridApiRef.current?.refreshServerSide({ purge: true })
    }, [])

    const handleClear = useCallback(() => {
        setVendorNameFilter('')
        setStatusFilter(null)
        setTimeout(() => gridApiRef.current?.refreshServerSide({ purge: true }), 50)
    }, [])

    const colDefs = useMemo<ColDef[]>(() => [
        {
            headerName: '',
            field: 'view',
            width: 50,
            pinned: 'left',
            cellRenderer: (params: any) => (
                <IconButton size='small' color='primary'
                    onClick={() => { setSelectedData(params.data); setDrawerOpen(true) }}
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
        {
            field: 'my_approval_status',
            headerName: 'My Approval',
            width: 150,
            sortable: false,
            filter: false,
            cellRenderer: (params: any) => {
                const myStepStatus = getMyQueueStepStatus(params.data, empCode, queueStepCode)

                if (myStepStatus === 'approved') {
                    return (
                        <Chip label='Approved' size='small'
                            sx={{
                                bgcolor: '#2e7d3220',
                                color: '#2e7d32',
                                border: '1px solid #2e7d3240',
                                fontWeight: 700,
                                fontSize: '0.72rem',
                                height: 24
                            }}
                        />
                    )
                }

                if (myStepStatus === 'rejected') {
                    return (
                        <Chip label='Rejected' size='small'
                            sx={{
                                bgcolor: '#d6454520',
                                color: '#d64545',
                                border: '1px solid #d6454540',
                                fontWeight: 700,
                                fontSize: '0.72rem',
                                height: 24
                            }}
                        />
                    )
                }

                return (
                    <Chip label='Waiting' size='small'
                        sx={{
                            bgcolor: '#fff4e5',
                            color: '#f08a24',
                            border: '1px solid #f6c07e',
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            height: 24
                        }}
                    />
                )
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
    ], [statusOptions, empCode, queueStepCode])

    const handleActionSuccess = useCallback(() => {
        gridApiRef.current?.refreshServerSide({ purge: true })
        setDrawerOpen(false)
        setSelectedData(null)
    }, [])

    const gridContext = useMemo(() => ({
        empCode,
        queueStepCode,
        onApprove: (data: any, status: string, finalStep: boolean, actionLabel: string) => {
            setSelectedData(data)
            setNextStatus(status)
            setIsFinalStep(finalStep)
            setApproveActionLabel(actionLabel || 'Approve')
            setActionMode('approve')
            setActionDialogOpen(true)
        },
        onReject: (data: any, actionLabel: string) => {
            setSelectedData(data)
            setIsFinalStep(false)
            setApproveActionLabel('Approve')
            setRejectActionLabel(actionLabel || 'Reject')
            setActionMode('reject')
            setActionDialogOpen(true)
        },
        onRefresh: handleActionSuccess
    }), [empCode, queueStepCode, handleActionSuccess])

    return (
        <Grid container spacing={6}>
            {/* Search Filter Card */}
            <Grid item xs={12}>
                <SearchFilterCard collapse={collapse} onToggle={() => setCollapse(!collapse)}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                size='small'
                                label='Vendor Name'
                                placeholder='Enter ...'
                                value={vendorNameFilter}
                                onChange={e => setVendorNameFilter(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleSearch() }}
                                autoComplete='off'
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                select
                                fullWidth
                                size='small'
                                label='Status'
                                value={statusFilter?.value || ''}
                                onChange={e => {
                                    const found = statusOptions.find(s => s.value === e.target.value)
                                    setStatusFilter(found ? { value: found.value, label: found.label } : null)
                                }}
                                SelectProps={{ native: true }}
                            >
                                <option value=''>All Statuses</option>
                                {statusOptions.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} className='flex gap-3'>
                            <Button onClick={handleSearch} variant='contained' type='button'>Search</Button>
                            <Button variant='tonal' color='secondary' type='button' onClick={handleClear}>Clear</Button>
                        </Grid>
                    </Grid>
                </SearchFilterCard>
            </Grid>

            {/* AG Grid */}
            <Grid item xs={12}>
                <SearchResultCard
                    action={
                        <Typography
                            variant='body2'
                            color='text.secondary'
                            title={pageTitle}
                            sx={{ color: accentColor, fontWeight: 600 }}
                        >
                            Total: {totalCount}
                        </Typography>
                    }
                >
                    <CardContent sx={{ p: '24px !important' }}>
                        <DxAGgridTable
                            columnDefs={colDefs}
                            serverSideDatasource={datasource}
                            height={600}
                            overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No requests pending your approval</span>'
                            getRowId={(p: any) => String(p.data.request_id)}
                            onGridReady={(p: any) => { gridApiRef.current = p.api }}
                            masterDetail={true}
                            detailCellRenderer={DetailRenderer}
                            detailRowHeight={800}
                            context={gridContext}
                        />
                    </CardContent>
                </SearchResultCard>
            </Grid>

            {/* Action Dialog */}
            <ActionDialog
                open={actionDialogOpen}
                mode={actionMode}
                requestId={selectedData?.request_id || null}
                nextStatus={nextStatus}
                isFinalStep={isFinalStep}
                approveActionLabel={approveActionLabel}
                rejectActionLabel={rejectActionLabel}
                onClose={() => setActionDialogOpen(false)}
                onSuccess={handleActionSuccess}
            />

            {/* Detail Dialog */}
            <Dialog
                maxWidth='lg'
                fullWidth={true}
                onClose={(event, reason) => { if (reason !== 'backdropClick') setDrawerOpen(false) }}
                TransitionComponent={Transition}
                open={drawerOpen}
                scroll='paper'
                sx={{
                    '& .MuiDialog-paper': {
                        overflow: 'visible',
                        width: { xs: 'calc(100vw - 16px)', sm: 'calc(100vw - 32px)', lg: '1100px' },
                        maxWidth: '1100px',
                    },
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
                    {selectedData && <DetailRenderer data={selectedData} context={{ ...gridContext, empCode }} />}
                </DialogContent>
            </Dialog>
        </Grid>
    )
}
