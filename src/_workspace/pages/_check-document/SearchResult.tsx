// React Imports
import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { useDxContext } from '@/_template/DxContextProvider'
import useDxServerSideGrid from '@_workspace/hooks/useDxServerSideGrid'

import GprFormDialog from '@_workspace/pages/_request-register/modal/GprFormDialog'

// MUI Imports
import {
    Grid, Box, Typography, Chip, Divider,
    IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
    Button, List, ListItem, ListItemIcon, ListItemText, CircularProgress, CardContent,
    TextField, Alert
} from '@mui/material'
import type { ButtonProps } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'

import undraw_clean_up_re_504g from '@assets/images/common/undraw_clean_up_re_504g.svg'
import undraw_notify_re_65on from '@assets/images/common/undraw_notify_re_65on.svg'

// AG Grid Imports
import type { ColDef, IServerSideDatasource } from 'ag-grid-community'
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
import { useFormContext } from 'react-hook-form'
import type { RequestRegisterFormData } from './validataeSchema'
import SearchResultCard from '@_workspace/components/search/SearchResultCard'

// Services
import ApprovalQueueServices from '@_workspace/services/_approval-queue/ApprovalQueueServices'

// Utils
import { getUserData } from '@/utils/user-profile/userLoginProfile'

// Status — colors from DB
import useRequestStatusOptions from '@_workspace/react-query/useRequestStatusOptions'
import {
    getApproveActionLabel,
    buildActionLogPresentation,
    inferStepCode,
    getRejectActionLabel,
    isAgreementReachedStep,
    isIssueGprBStep,
    isIssueGprCStep,
    isPendingAgreementStep,
    isPicStep,
    resolveActionRequiredStage,
    getActionRequiredStageLabel,
    isVendorDisagreedStep,
    resolveNextStatus,
    normalizeWorkflowText,
} from '@_workspace/utils/requestWorkflow'
import { formatFftStatus } from '@_workspace/utils/fftStatus'

interface SearchResultSectionProps {
    columnDefs: ColDef[]
    datasource: IServerSideDatasource
    onGridReady: (params: any) => void
    detailCellRenderer: any
    detailRowHeight: number
    context: Record<string, any>
    initialState: any
    onStateUpdated: (event: any) => void
}

const SearchResultSection = ({
    columnDefs,
    datasource,
    onGridReady,
    detailCellRenderer,
    detailRowHeight,
    context,
    initialState,
    onStateUpdated,
}: SearchResultSectionProps) => {
    return (
        <SearchResultCard
        >
            <CardContent sx={{ p: '24px !important' }}>
                <DxAGgridTable
                    columnDefs={columnDefs}
                    serverSideDatasource={datasource}
                    height={600}
                    overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No requests pending your approval</span>'
                    getRowId={(params: any) => String(params.data.request_id ?? params.data.REQUEST_ID ?? params.rowIndex)}
                    onGridReady={onGridReady}
                    initialState={initialState}
                    onStateUpdated={onStateUpdated}
                    masterDetail={true}
                    detailCellRenderer={detailCellRenderer}
                    detailRowHeight={detailRowHeight}
                    context={context}
                    rowSelection='single'
                />
            </CardContent>
        </SearchResultCard>
    )
}

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

const normalizeStatusText = (value: unknown) => normalizeWorkflowText(String(value || ''))

const resolveWorkflowStatusValue = (statusOptions: any[] = [], preferredText: string, fallbackValue: string) => {
    const target = normalizeStatusText(preferredText)
    const matched = statusOptions.find(option => {
        const candidates = [
            option?.value,
            option?.label,
            option?.status_value,
            option?.status_label,
            option?.DESCRIPTION,
            option?.description,
        ]
        return candidates.some(candidate => normalizeStatusText(candidate) === target)
    })

    return matched?.value || fallbackValue
}

type WorkflowActionColor = Extract<ButtonProps['color'], 'success' | 'warning' | 'error'>

interface NegotiationAction {
    key: 'agree' | 'disagree'
    label: string
    color: WorkflowActionColor
    nextStatus: string
    isFinalStep: boolean
}

const getNegotiationWorkflowState = (currentStep: any, statusOptions: any[] = []): {
    isNegotiationStep: boolean
    actions: NegotiationAction[]
} => {
    const agreementReachedStatus = resolveWorkflowStatusValue(statusOptions, 'Agreement Reached', 'Agreement Reached')
    const issueGprBStatus = resolveWorkflowStatusValue(statusOptions, 'Issue GPR B', 'Issue GPR B')
    const issueGprCStatus = resolveWorkflowStatusValue(statusOptions, 'Issue GPR C', 'Issue GPR C')
    const vendorDisagreedStatus = resolveWorkflowStatusValue(statusOptions, 'Vendor Disagreed', 'Vendor Disagreed')
    const documentCheckStatus =
        resolveWorkflowStatusValue(statusOptions, 'PO & SCM Check All Document', '')
        || resolveWorkflowStatusValue(statusOptions, 'PO & SCM Checker', '')
        || resolveWorkflowStatusValue(statusOptions, 'Check All Document', '')
        || resolveWorkflowStatusValue(statusOptions, 'Document Checker', '')

    if (isPendingAgreementStep(currentStep)) {
        return {
            isNegotiationStep: true,
            actions: [
                { key: 'agree', label: 'Approve', color: 'success', nextStatus: agreementReachedStatus, isFinalStep: false },
                { key: 'disagree', label: 'Send GPR B to Vendor', color: 'warning', nextStatus: issueGprBStatus, isFinalStep: false },
            ],
        }
    }

    if (isIssueGprBStep(currentStep)) {
        return {
            isNegotiationStep: true,
            actions: [
                { key: 'agree', label: 'Send GPR C to Requester Approval', color: 'warning', nextStatus: issueGprCStatus, isFinalStep: false },
                { key: 'disagree', label: 'Reject', color: 'error', nextStatus: vendorDisagreedStatus, isFinalStep: true },
            ],
        }
    }

    if (isIssueGprCStep(currentStep)) {
        return {
            isNegotiationStep: true,
            actions: [
                { key: 'agree', label: 'Approve GPR C', color: 'success', nextStatus: agreementReachedStatus, isFinalStep: false },
                { key: 'disagree', label: 'Vendor Disagreed (Close)', color: 'error', nextStatus: vendorDisagreedStatus, isFinalStep: true },
            ],
        }
    }

    if (isAgreementReachedStep(currentStep)) {
        return {
            isNegotiationStep: true,
            actions: [
                { key: 'agree', label: 'Approve and Send to Doc Checker', color: 'success', nextStatus: documentCheckStatus || agreementReachedStatus, isFinalStep: false },
                { key: 'disagree', label: 'Send GPR B to Vendor', color: 'warning', nextStatus: issueGprBStatus, isFinalStep: false },
            ],
        }
    }

    return {
        isNegotiationStep: false,
        actions: [],
    }
}

const getRowApprovalState = (row: any, empCode?: string, queueStepCode?: string, statusOptions: any[] = []) => {
    const approvalSteps: any[] = parseApprovalSteps(row?.approval_steps)
        .sort((a: any, b: any) => a.step_order - b.step_order)

    const logs: any[] = (() => {
        try {
            const parsed = typeof row?.approval_logs === 'string' ? JSON.parse(row.approval_logs) : (row?.approval_logs || [])
            return Array.isArray(parsed) ? parsed.filter(Boolean) : []
        } catch {
            return []
        }
    })()

    const currentStep = approvalSteps.find((s: any) => s.step_status === 'in_progress')
    const myActionedStep = approvalSteps.find((s: any) =>
        s.approver_id === empCode && (s.step_status === 'approved' || s.step_status === 'rejected')
    )

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
        ((isCurrentPicStep || isPicOwnedNegotiationStep) && row.assign_to === empCode)
    )
    const normalizedQueueStepCode = String(queueStepCode || '').trim().toUpperCase()
    const isCurrentStepMatchingQueue = !normalizedQueueStepCode || inferStepCode(currentStep) === normalizedQueueStepCode
    const hasVendorRequested = !!currentStep && logs.some((l: any) =>
        String(l.step_id || '') === String(currentStep.step_id || '') && l.action_type === 'vendor_requested'
    )
    const approveButtonLabel = getApproveActionLabel(currentStep, hasVendorRequested)
    const rejectButtonLabel = getRejectActionLabel(currentStep)
    const actionRequiredSetup = (() => {
        try {
            return typeof row?.action_required_json === 'string' ? JSON.parse(row.action_required_json) : (row?.action_required_json || {})
        } catch {
            return {}
        }
    })()
    const actionRequiredStage = resolveActionRequiredStage(currentStep)
    const actionRequiredStageConfig = actionRequiredStage ? (actionRequiredSetup?.[actionRequiredStage] || {}) : null
    const showActionRequiredBtn = Boolean(isCurrentStepMine && isCurrentStepMatchingQueue && actionRequiredStage)
    const disableActionRequiredBtn = !String(actionRequiredStageConfig?.pic_email || '').trim()
    const actionRequiredLabel = actionRequiredStage
        ? `Action Required - ${getActionRequiredStageLabel(currentStep)}`
        : 'Action Required'
    const isAgreementReachedCompleted = approvalSteps.some((s: any) =>
        isAgreementReachedStep(s) && String(s?.step_status || '').toLowerCase() === 'completed'
    )
    const isActionable = isCurrentStepMine && isCurrentStepMatchingQueue && !isAgreementReachedCompleted
    const nextStep = currentStep ? approvalSteps.find((s: any) => s.step_order === currentStep.step_order + 1 && s.step_status === 'pending') : null
    const isFinalStep = !!currentStep && !nextStep
    const computedNextStatus = resolveNextStatus(statusOptions, currentStep, nextStep, hasVendorRequested)
    const workflowState = getNegotiationWorkflowState(currentStep, statusOptions)
    const agreeAction = workflowState.actions.find(action => action.key === 'agree')
    const disagreeAction = workflowState.actions.find(action => action.key === 'disagree')
    const renderDisagreeFirst = Boolean(disagreeAction && !disagreeAction.label.toLowerCase().includes('vendor disagreed'))

    return {
        approvalSteps,
        logs,
        myActionedStep,
        isActionable,
        approveButtonLabel,
        rejectButtonLabel,
        showActionRequiredBtn,
        disableActionRequiredBtn,
        actionRequiredLabel,
        isFinalStep,
        computedNextStatus,
        isNegotiationStep: workflowState.isNegotiationStep,
        agreeAction,
        disagreeAction,
        renderDisagreeFirst,
    }
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
    actions: Array<{
        requestId: number
        nextStatus: string
        isFinalStep: boolean
        approveActionLabel?: string
        rejectActionLabel?: string
    }>
    approveActionLabel: string
    rejectActionLabel: string
    onClose: () => void
    onSuccess: () => void
}

const ActionDialog = ({ open, mode, actions, approveActionLabel, rejectActionLabel, onClose, onSuccess }: ActionDialogProps) => {
    const [remark, setRemark] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const user = getUserData()
    const actionCount = actions.length

    useEffect(() => {
        if (!open) {
            setRemark('')
            setError(null)
        }
    }, [open])

    const handleSubmit = async () => {
        if (actions.length === 0) return
        setLoading(true)
        setError(null)
        try {
            const failedRequestIds: number[] = []
            let failedMessage = 'Failed to update status'

            for (const action of actions) {
                const effectiveNextStatus = String(action.nextStatus || '').trim()
                const effectiveApproveLabel = String(action.approveActionLabel || approveActionLabel || '').trim()
                const normalizedNextStatus = effectiveNextStatus.toLowerCase()
                const normalizedApproveLabel = effectiveApproveLabel.toLowerCase()
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

                const res = await ApprovalQueueServices.updateStatus({
                    request_id: action.requestId,
                    request_status: mode === 'approve' ? effectiveNextStatus : 'Rejected',
                    workflow_action: workflowAction,
                    approve_by: user?.EMPLOYEE_CODE || '',
                    approver_remark: remark,
                    UPDATE_BY: user?.EMPLOYEE_CODE || '',
                    isFinalStep: mode === 'approve' ? action.isFinalStep : false,
                })

                if (!res.data.Status) {
                    failedRequestIds.push(action.requestId)
                    failedMessage = res.data.Message || failedMessage
                }
            }

            if (failedRequestIds.length > 0) {
                setError(`${failedMessage} (Request: ${failedRequestIds.join(', ')})`)
                onSuccess()
                return
            }

            onSuccess()
            onClose()
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
                        {mode === 'approve'
                            ? (actionCount > 1 ? `Confirm approve ${actionCount} selected requests` : `Confirm action ${approveActionLabel}`)
                            : `Confirm action ${rejectActionLabel}`}
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
    showSelectionSheetReadOnly?: boolean
    onApprove: (nextStatus: string, isFinalStep: boolean, approveActionLabel: string) => void
    onReject: (rejectActionLabel: string) => void
    onRefresh: () => void
}

const DetailPanel = ({ data, empCode, queueStepCode, showSelectionSheetReadOnly = false, onApprove, onReject, onRefresh }: DetailPanelProps) => {
    const [fileDialogOpen, setFileDialogOpen] = useState(false)
    const [gprFormOpen, setGprFormOpen] = useState(false)
    const [actionRequiredDialogOpen, setActionRequiredDialogOpen] = useState(false)
    const [selectedActionRequired, setSelectedActionRequired] = useState<any | null>(null)
    const { data: statusOptions = [] } = useRequestStatusOptions()
    if (!data) return null

    const files = buildFileUrls(data?.documents)
    const approvalSteps: any[] = (() => {
        try { return typeof data.approval_steps === 'string' ? JSON.parse(data.approval_steps) : (data.approval_steps || []) } catch { return [] }
    })().filter(Boolean).sort((a: any, b: any) => a.step_order - b.step_order)

    const logs: any[] = (() => {
        try { return typeof data.approval_logs === 'string' ? JSON.parse(data.approval_logs) : (data.approval_logs || []) } catch { return [] }
    })().filter(Boolean)

    const currentStep = approvalSteps.find((s: any) => s.step_status === 'in_progress')
    const myActionedStep = approvalSteps.find((s: any) =>
        s.approver_id === empCode && (s.step_status === 'approved' || s.step_status === 'rejected')
    )

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
    const actionRequiredSetup = (() => {
        try { return typeof data.action_required_json === 'string' ? JSON.parse(data.action_required_json) : (data.action_required_json || {}) } catch { return {} }
    })()
    const actionRequiredStage = resolveActionRequiredStage(currentStep)
    const actionRequiredStageConfig = actionRequiredStage ? (actionRequiredSetup?.[actionRequiredStage] || {}) : null
    const showActionRequiredBtn = Boolean(isCurrentStepMine && isCurrentStepMatchingQueue && actionRequiredStage)
    const disableActionRequiredBtn = !String(actionRequiredStageConfig?.pic_email || '').trim()
    const actionRequiredLabel = actionRequiredStage
        ? `Action Required - ${getActionRequiredStageLabel(currentStep)}`
        : 'Action Required'
    const isAgreementReachedCompleted = approvalSteps.some((s: any) =>
        isAgreementReachedStep(s) && String(s?.step_status || '').toLowerCase() === 'completed'
    )
    const isActionable = isCurrentStepMine && isCurrentStepMatchingQueue && !isAgreementReachedCompleted
    const nextStep = currentStep ? approvalSteps.find((s: any) => s.step_order === currentStep.step_order + 1 && s.step_status === 'pending') : null
    const isFinalStep = !!currentStep && !nextStep
    const computedNextStatus = resolveNextStatus(statusOptions, currentStep, nextStep, hasVendorRequested)
    const { isNegotiationStep, actions: negotiationActions } = getNegotiationWorkflowState(currentStep, statusOptions)
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
            <Box sx={{ p: 2.5, mb: 3, borderRadius: 1, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5 }}>
                    <Box>
                        <Typography variant='h6' fontWeight={800}>{data.company_name}</Typography>
                        {myActionedStep && (
                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 1, px: 1.25, py: 0.4, borderRadius: 5, bgcolor: myActionedStep.step_status === 'approved' ? '#e8f5e9' : '#ffebee', border: '1px solid', borderColor: myActionedStep.step_status === 'approved' ? '#a5d6a7' : '#ef9a9a' }}>
                                <i className={myActionedStep.step_status === 'approved' ? 'tabler-circle-check-filled' : 'tabler-circle-x-filled'} style={{ fontSize: 13, color: myActionedStep.step_status === 'approved' ? '#2e7d32' : '#c62828' }} />
                                <Typography variant='caption' sx={{ fontWeight: 700, color: myActionedStep.step_status === 'approved' ? '#2e7d32' : '#c62828', lineHeight: 1 }}>
                                    Your action: {myActionedStep.step_status === 'approved' ? 'Approved' : 'Rejected'} · {myActionedStep.DESCRIPTION}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    <Box
                        sx={{
                            px: 1.5,
                            py: 0.75,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            bgcolor: 'transparent',
                            maxWidth: 320,
                        }}
                    >
                        <Typography variant='body2' color='text.secondary' fontWeight={600}>
                            {data.request_status || '-'}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                        <i className='tabler-clipboard-list' style={{ fontSize: 16, color: 'var(--mui-palette-primary-main)' }} />
                        <Typography variant='subtitle2' fontWeight={700} color='text.secondary'>Request Info</Typography>
                        <Divider sx={{ flex: 1 }} />
                    </Box>
                </Box>
                {infoRow('Support Product / Process', data.supportProduct_Process)}
                {infoRow('Purchase Frequency', data.purchase_frequency)}
                {infoRow('Assigned PIC', data.assign_to)}
                {infoRow('Submitted Date', data.CREATE_DATE ? new Date(data.CREATE_DATE).toLocaleDateString('th-TH') : '-')}
                {data.requester_remark && infoRow('Requester Remark', data.requester_remark)}
            </Box>

            <Box sx={{ mb: 3 }}>
                <SectionHeader icon='tabler-building-store' title='Vendor Info' />
                {infoRow('Company Name', data.company_name)}
                {infoRow('Vendor Type', data.vendor_type_name)}
                {infoRow('Region', data.vendor_region)}
                {infoRow('FFT Vendor Code', data.fft_vendor_code)}
                {infoRow('FFT Status', formatFftStatus(data.fft_status, { statusCheck: data.status_check, requestStatus: data.request_status }))}
                {infoRow('Address', data.address)}
                {infoRow('Province', data.province)}
                {infoRow('Tel Center', data.tel_center)}
                {infoRow('Email (Main)', data.emailmain)}
            </Box>

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

            {files.length > 0 && (
                <Box sx={{ mb: 3 }}>
                    <SectionHeader icon='tabler-paperclip' title={`Attached Files (${files.length})`} />
                    <Button size='small' variant='tonal' startIcon={<i className='tabler-folder-open' style={{ fontSize: 16 }} />} onClick={() => setFileDialogOpen(true)}>
                        View {files.length} File{files.length > 1 ? 's' : ''}
                    </Button>
                </Box>
            )}

            {showSelectionSheetReadOnly && (
                <Box
                    sx={{
                        mb: 3,
                        p: 2,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <i className='tabler-clipboard-text' style={{ fontSize: 20, color: 'var(--mui-palette-primary-main)' }} />
                        <Box>
                            <Typography variant='subtitle2' fontWeight={700}>Supplier / Outsourcing Selection Sheet</Typography>
                            <Typography variant='caption' color='text.secondary'>
                                Selection Sheet (read-only)
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button
                            size='small'
                            variant='contained'
                            color='primary'
                            startIcon={<i className='tabler-eye' style={{ fontSize: 14 }} />}
                            onClick={() => setGprFormOpen(true)}
                        >
                            View Selection Sheet
                        </Button>
                    </Box>
                </Box>
            )}

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
                                        sx={{ bgcolor: stCfg.bgColor, color: stCfg.txtColor, border: '1px solid', borderColor: stCfg.borderColor, fontWeight: 600, fontSize: '0.68rem', height: 22, width: 'fit-content', '& .MuiChip-icon': { color: stCfg.txtColor } }}
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
                            {logs.map((l: any, i: number) => {
                                const {
                                    parsedRemark,
                                    actionTypeLabel,
                                    actionColor,
                                    detailText,
                                    actorLabel,
                                    stepDescription,
                                } = buildActionLogPresentation(l, approvalSteps)

                                return (
                                    <Box
                                        key={`action-log-${i}`}
                                        sx={{
                                            mb: 1,
                                            p: 1.5,
                                            borderRadius: 1.5,
                                            bgcolor: 'background.paper',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                                    <Chip
                                                        size='small'
                                                        label={actionTypeLabel}
                                                        color={actionColor}
                                                        variant='tonal'
                                                        sx={{ height: 22, fontSize: '0.68rem', fontWeight: 700 }}
                                                    />
                                                    {parsedRemark.isActionRequired && (
                                                        <Chip
                                                            size='small'
                                                            label='View Detail'
                                                            color='warning'
                                                            variant='outlined'
                                                            sx={{ height: 22, fontSize: '0.68rem' }}
                                                            onClick={() => {
                                                                setSelectedActionRequired(parsedRemark)
                                                                setActionRequiredDialogOpen(true)
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                                <Typography variant='caption' color='text.disabled'>
                                                    {l.action_date ? new Date(l.action_date).toLocaleString('th-TH') : '-'}
                                                </Typography>
                                            </Box>
                                            <Typography variant='body2' fontWeight={600}>
                                                {actorLabel}
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.35 }}>
                                                {stepDescription && (
                                                    <Typography variant='caption' color='text.secondary'>
                                                        <strong>Step:</strong> {stepDescription}
                                                    </Typography>
                                                )}
                                                <Typography variant='caption' color='text.secondary'>
                                                    <strong>Action:</strong> {actionTypeLabel}
                                                </Typography>
                                                {detailText && (
                                                    <Typography variant='caption' color='text.secondary'>
                                                        <strong>Detail:</strong> {detailText}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    </Box>
                                )
                            })}
                        </Box>
                    )}
                </Box>
            )}

            {(data.approve_by || data.approver_remark) && (
                <Box sx={{ mb: 3 }}>
                    <SectionHeader icon='tabler-user-check' title='Decision Info' />
                    {infoRow('Approved / Rejected By', data.approve_by)}
                    {infoRow('Approval Date', data.approve_date ? new Date(data.approve_date).toLocaleDateString('th-TH') : '-')}
                    {infoRow('Approver Remark', data.approver_remark)}
                </Box>
            )}

            {isActionable && (
                <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                    {isNegotiationStep && agreeAction && disagreeAction && (
                        <>
                            {showActionRequiredBtn && (
                                <Button variant='contained' color='info' fullWidth startIcon={<i className='tabler-bell-ringing' style={{ fontSize: 18 }} />} disabled={disableActionRequiredBtn} onClick={() => onApprove(computedNextStatus, false, actionRequiredLabel)}>{actionRequiredLabel}</Button>
                            )}
                            {renderDisagreeFirst && (
                                <Button variant='contained' color={disagreeAction.color} fullWidth startIcon={<i className={disagreeAction.color === 'warning' ? 'tabler-send' : 'tabler-alert-triangle'} style={{ fontSize: 18 }} />} onClick={() => onApprove(disagreeAction.nextStatus, disagreeAction.isFinalStep, disagreeAction.label)}>{disagreeAction.label}</Button>
                            )}
                            <Button variant='contained' color={agreeAction.color} fullWidth startIcon={<i className='tabler-circle-check' style={{ fontSize: 18 }} />} onClick={() => onApprove(agreeAction.nextStatus, agreeAction.isFinalStep, agreeAction.label)}>{agreeAction.label}</Button>
                            {!renderDisagreeFirst && (
                                <Button variant='contained' color={disagreeAction.color} fullWidth startIcon={<i className={disagreeAction.color === 'warning' ? 'tabler-send' : 'tabler-alert-triangle'} style={{ fontSize: 18 }} />} onClick={() => onApprove(disagreeAction.nextStatus, disagreeAction.isFinalStep, disagreeAction.label)}>{disagreeAction.label}</Button>
                            )}
                        </>
                    )}
                    {!isNegotiationStep && (
                        <>
                            {showActionRequiredBtn && (
                                <Button variant='contained' color='info' fullWidth startIcon={<i className='tabler-bell-ringing' style={{ fontSize: 18 }} />} disabled={disableActionRequiredBtn} onClick={() => onApprove(computedNextStatus, false, actionRequiredLabel)}>{actionRequiredLabel}</Button>
                            )}
                            <Button variant='contained' color='success' fullWidth startIcon={<i className='tabler-circle-check' style={{ fontSize: 18 }} />} onClick={() => onApprove(computedNextStatus, isFinalStep, approveButtonLabel)}>{approveButtonLabel}</Button>
                            <Button variant='contained' color='error' fullWidth startIcon={<i className='tabler-circle-x' style={{ fontSize: 18 }} />} onClick={() => onReject(rejectButtonLabel)}>{rejectButtonLabel}</Button>
                        </>
                    )}
                </Box>
            )}

            <FileViewerDialog open={fileDialogOpen} files={files} onClose={() => setFileDialogOpen(false)} />
            {gprFormOpen && (
                <GprFormDialog
                    open={gprFormOpen}
                    rowData={data}
                    readOnly={true}
                    onClose={() => setGprFormOpen(false)}
                    onSaved={() => {
                    }}
                />
            )}
            <Dialog maxWidth='sm' fullWidth={true} open={actionRequiredDialogOpen} onClose={() => setActionRequiredDialogOpen(false)}>
                <DialogTitle>Action Required Detail</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                        <Typography variant='body2'><strong>Stage:</strong> {selectedActionRequired?.stage || '-'}</Typography>
                        <Typography variant='body2'><strong>Owner:</strong> {selectedActionRequired?.owner || '-'}</Typography>
                        <Typography variant='body2'><strong>Owner Email:</strong> {selectedActionRequired?.ownerEmail || '-'}</Typography>
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
            showSelectionSheetReadOnly={props.context.showSelectionSheetReadOnly}
            onApprove={(status: string, finalStep: boolean, actionLabel: string) => props.context.onApprove(props.data, status, finalStep, actionLabel)}
            onReject={(rejectActionLabel: string) => props.context.onReject(props.data, rejectActionLabel)}
            onRefresh={() => props.context.onRefresh()}
        />
    )
}

interface ApprovalPageContentProps {
    pageTitle: string
    queueStepCode?: string
    accentColor?: string
    showSelectionSheetReadOnly?: boolean
}

export default function ApprovalPageContent({ pageTitle, queueStepCode, accentColor = '#7367F0', showSelectionSheetReadOnly = false }: ApprovalPageContentProps) {
    const gridApiRef = useRef<any>(null)
    const { getValues, setValue } = useFormContext<RequestRegisterFormData>()
    const { isEnableFetching, setIsEnableFetching } = useDxContext()
    const { savedGridState, handleGridReady, handleStateUpdated, refreshServerSide } = useDxServerSideGrid({
        getValues,
        setValue,
        isEnableFetching,
        setIsEnableFetching,
        lockedLeftColIds: ['view', 'request_number']
    })

    const [selectedData, setSelectedData] = useState<any | null>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)

    const [actionMode, setActionMode] = useState<'approve' | 'reject'>('approve')
    const [actionDialogOpen, setActionDialogOpen] = useState(false)
    const [pendingActions, setPendingActions] = useState<ActionDialogProps['actions']>([])
    const [approveActionLabel, setApproveActionLabel] = useState('Approve')
    const [rejectActionLabel, setRejectActionLabel] = useState('Reject')

    const user = getUserData()
    const empCode = user?.EMPLOYEE_CODE

    const datasource = useMemo<IServerSideDatasource>(() => ({
        getRows: async (params) => {
            if (!empCode) {
                params.success({ rowData: [], rowCount: 0 })
                return
            }
            const { startRow, endRow } = params.request
            const order = params.request.sortModel?.length > 0
                ? params.request.sortModel.map((s: any) => ({ id: s.colId, desc: s.sort === 'desc' }))
                : [{ id: 'request_id', desc: true }]
            try {
                const res = await ApprovalQueueServices.getAll({
                    approver_id: empCode,
                    queue_step_code: queueStepCode,
                    SearchFilters: [
                        { id: 'company_name', value: getValues('searchFilters.vendor_name') || null },
                        { id: 'Request_By_EmployeeCode', value: getValues('searchFilters.submitted_by') || null },
                        { id: 'request_status', value: getValues('searchFilters.overall_status')?.value || null }
                    ].filter((x: any) => x.value !== null && x.value !== ''),
                    ColumnFilters: [],
                    Order: order,
                    Start: startRow ?? 0,
                    Limit: (endRow ?? 50) - (startRow ?? 0)
                })
                if (res.data?.Status) {
                    const rowData = (res.data.ResultOnDb || []).map((row: any) => ({
                        ...row,
                        request_id: row.request_id ?? row.REQUEST_ID,
                        request_number: row.request_number ?? row.REQUEST_NUMBER,
                        vendor_id: row.vendor_id ?? row.VENDOR_ID,
                        request_status: row.request_status ?? row.REQUEST_STATUS,
                        supportProduct_Process: row.supportProduct_Process ?? row.SUPPORTPRODUCT_PROCESS,
                        purchase_frequency: row.purchase_frequency ?? row.PURCHASE_FREQUENCY,
                        requester_remark: row.requester_remark ?? row.REQUESTER_REMARK,
                        approver_remark: row.approver_remark ?? row.APPROVER_REMARK,
                        approve_by: row.approve_by ?? row.APPROVE_BY,
                        approve_date: row.approve_date ?? row.APPROVE_DATE,
                        vendor_code: row.vendor_code ?? row.VENDOR_CODE,
                        assign_to: row.assign_to ?? row.ASSIGN_TO,
                        PIC_Email: row.PIC_Email ?? row.PIC_EMAIL,
                        vendor_contact_id: row.vendor_contact_id ?? row.VENDOR_CONTACT_ID,
                        Request_By_EmployeeCode: row.Request_By_EmployeeCode ?? row.REQUEST_BY_EMPLOYEECODE ?? row.EMPLOYEE_CODE,
                        gpr_c_approver_name: row.gpr_c_approver_name ?? row.GPR_C_APPROVER_NAME,
                        gpr_c_approver_email: row.gpr_c_approver_email ?? row.GPR_C_APPROVER_EMAIL,
                        gpr_c_pc_pic_name: row.gpr_c_pc_pic_name ?? row.GPR_C_PC_PIC_NAME,
                        gpr_c_pc_pic_email: row.gpr_c_pc_pic_email ?? row.GPR_C_PC_PIC_EMAIL,
                        gpr_c_circular_json: row.gpr_c_circular_json ?? row.GPR_C_CIRCULAR_JSON,
                        action_required_json: row.action_required_json ?? row.ACTION_REQUIRED_JSON,
                        gpr_43_acceptance_status: row.gpr_43_acceptance_status ?? row.GPR_43_ACCEPTANCE_STATUS,
                        company_name: row.company_name ?? row.COMPANY_NAME,
                        fft_vendor_code: row.fft_vendor_code ?? row.FFT_VENDOR_CODE,
                        fft_status: row.fft_status ?? row.FFT_STATUS,
                        vendor_region: row.vendor_region ?? row.VENDOR_REGION,
                        province: row.province ?? row.PROVINCE,
                        postal_code: row.postal_code ?? row.POSTAL_CODE,
                        address: row.address ?? row.ADDRESS,
                        tel_center: row.tel_center ?? row.TEL_CENTER,
                        website: row.website ?? row.WEBSITE,
                        emailmain: row.emailmain ?? row.EMAILMAIN,
                    }))
                    params.success({ rowData, rowCount: res.data.TotalCountOnDb })
                } else {
                    params.fail()
                }
            } catch {
                params.fail()
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [empCode, queueStepCode])

    const colDefs = useMemo<ColDef[]>(() => [
        {
            headerName: '',
            field: 'view',
            width: 50,
            pinned: 'left',
            lockPinned: true,
            suppressMovable: true,
            cellRenderer: (params: any) => (
                <IconButton size='small' color='primary' onClick={() => { setSelectedData(params.data); setDrawerOpen(true) }}>
                    <i className='tabler-eye' style={{ fontSize: 18 }} />
                </IconButton>
            )
        },
        {
            field: 'request_number',
            headerName: 'Request Number',
            width: 170,
            pinned: 'left',
            lockPinned: true,
            suppressMovable: true,
            valueGetter: params => params.data?.request_number || params.data?.request_id || '-'
        },
        {
            field: 'request_status',
            headerName: 'Status',
            flex: 1.2,
            minWidth: 230,
            cellRenderer: 'agGroupCellRenderer',
            cellRendererParams: {
                innerRenderer: (params: any) => {
                    return (
                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                minHeight: 24,
                                px: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                                bgcolor: 'transparent',
                            }}
                        >
                            <Typography variant='body2' color='text.secondary' fontWeight={500}>
                                {params.value || '-'}
                            </Typography>
                        </Box>
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
                    return <Chip label='Approved' size='small' sx={{ bgcolor: '#2e7d3220', color: '#2e7d32', border: '1px solid #2e7d3240', fontWeight: 700, fontSize: '0.72rem', height: 24 }} />
                }

                if (myStepStatus === 'rejected') {
                    return <Chip label='Rejected' size='small' sx={{ bgcolor: '#d6454520', color: '#d64545', border: '1px solid #d6454540', fontWeight: 700, fontSize: '0.72rem', height: 24 }} />
                }

                return <Chip label='Waiting' size='small' sx={{ bgcolor: '#fff4e5', color: '#f08a24', border: '1px solid #f6c07e', fontWeight: 700, fontSize: '0.72rem', height: 24 }} />
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
                if (count === 0) return <Typography variant='caption' color='text.disabled'>-</Typography>
                return (
                    <Chip label={`${count} file${count > 1 ? 's' : ''}`} size='small' icon={<i className='tabler-paperclip' style={{ fontSize: 13, color: '#1976d2' }} />} sx={{ bgcolor: '#1976d220', color: '#1976d2', border: '1px solid #1976d240', fontWeight: 700, fontSize: '0.72rem', height: 24, '& .MuiChip-icon': { color: '#1976d2' } }} />
                )
            }
        },
        {
            field: 'CREATE_DATE',
            headerName: 'Submitted Date',
            width: 150,
            valueFormatter: (p: any) => p.value ? new Date(p.value).toLocaleDateString('th-TH') : '-'
        }
    ], [empCode, queueStepCode])

    const handleActionSuccess = useCallback(() => {
        refreshServerSide()
        setDrawerOpen(false)
        setSelectedData(null)
        setPendingActions([])
    }, [refreshServerSide])

    const gridContext = useMemo(() => ({
        empCode,
        queueStepCode,
        showSelectionSheetReadOnly,
        onApprove: (data: any, status: string, finalStep: boolean, actionLabel: string) => {
            setSelectedData(data)
            setPendingActions([{
                requestId: Number(data?.request_id),
                nextStatus: status,
                isFinalStep: finalStep,
                approveActionLabel: actionLabel,
            }])
            setApproveActionLabel(actionLabel || 'Approve')
            setActionMode('approve')
            setActionDialogOpen(true)
        },
        onReject: (data: any, actionLabel: string) => {
            setSelectedData(data)
            setPendingActions([{
                requestId: Number(data?.request_id),
                nextStatus: 'Rejected',
                isFinalStep: false,
                rejectActionLabel: actionLabel,
            }])
            setApproveActionLabel('Approve')
            setRejectActionLabel(actionLabel || 'Reject')
            setActionMode('reject')
            setActionDialogOpen(true)
        },
        onRefresh: handleActionSuccess
    }), [empCode, queueStepCode, showSelectionSheetReadOnly, handleActionSuccess])

    const searchResultDataItem = useMemo(() => ({
        columnDefs: colDefs,
        datasource,
        onGridReady: (params: any) => {
            handleGridReady(params)
            gridApiRef.current = params.api
        },
        detailCellRenderer: DetailRenderer,
        detailRowHeight: 800,
        context: gridContext,
        initialState: savedGridState,
        onStateUpdated: handleStateUpdated,
    }), [colDefs, datasource, gridContext, handleGridReady, handleStateUpdated, savedGridState])

    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <SearchResultSection {...searchResultDataItem} />
            </Grid>

            <ActionDialog
                open={actionDialogOpen}
                mode={actionMode}
                actions={pendingActions}
                approveActionLabel={approveActionLabel}
                rejectActionLabel={rejectActionLabel}
                onClose={() => setActionDialogOpen(false)}
                onSuccess={handleActionSuccess}
            />

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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: accentColor, flexShrink: 0 }} />
                        <Typography variant='h5' component='span'>{pageTitle} Details</Typography>
                    </Box>
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
