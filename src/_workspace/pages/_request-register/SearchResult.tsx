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
import type { ICellRendererParams, IServerSideGetRowsParams } from 'ag-grid-community'
import type { ValueFormatterParams, ValueGetterParams } from 'ag-grid-community'
import DxAGgridTable from '@/_template/DxAGgridTable'

import type { ReactElement, Ref } from 'react'
import { forwardRef } from 'react'
import { Slide } from '@mui/material'
import type { SlideProps } from '@mui/material'
import { alpha } from '@mui/material/styles'

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
import { useForm } from 'react-hook-form'
import type { RequestRegisterFormData } from './validateSchema'

// Context
import { useDxContext } from '@/_template/DxContextProvider'

// Status — colors from DB
import useRequestStatusOptions from '@_workspace/react-query/useRequestStatusOptions'

// GPR Form Dialog
import GprFormDialog from './modal/GprFormDialog'
import GprCNotificationDialog from './modal/GprCNotificationDialog'

// Reuse EditVendorModal from find-vendor page (Vendor Info + Contacts + Products editing)
import EditVendorModal from '@_workspace/pages/_find-vendor/modal/EditVendorModal'
import {
    getApproveActionLabel,
    getGprStageLabel,
    parseActionRequiredRemark,
    getRejectActionLabel,
    inferStepCode,
    isAccountStep,
    isAgreementReachedStep,
    isIssueGprBStep,
    isIssueGprCStep,
    isPendingAgreementStep,
    isPicStep,
    resolveActionRequiredStage,
    getActionRequiredStageLabel,
    isVendorDisagreedStep,
    WORKFLOW_STEP_CODE,
    resolveGroupCodeForStep,
    resolveNextStatus,
} from '@_workspace/utils/requestWorkflow'
import useApprovalWorkflow from '@_workspace/hooks/useApprovalWorkflow'
import useGprWorkflowLogic from '@_workspace/hooks/useGprWorkflowLogic'
import SearchResultCard from '@_workspace/components/search/SearchResultCard'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const API_BASE = (import.meta as any).env?.VITE_API_URL || ''

const safeParseJSON = <T,>(input: unknown, fallback: T): T => {
    if (input == null) return fallback
    if (typeof input === 'string') {
        try { return JSON.parse(input) as T }
        catch { return fallback }
    }
    return input as T
}

const buildFileUrls = (documents: any): { name: string; url: string }[] => {
    const docs = safeParseJSON<any[]>(documents, [])
    return docs.filter(Boolean).map((d: any) => ({
        name: d.file_name || d.file_path || 'Unnamed File',
        url: `${API_BASE}/uploads/documents/${d.file_path}`
    }))
}

interface RegisterRequestRow {
    request_id: number
    request_status: string
    company_name?: string
    supportProduct_Process?: string
    purchase_frequency?: string
    FULL_NAME?: string
    EMPLOYEE_CODE?: string
    documents?: unknown
    CREATE_DATE?: string
    [key: string]: unknown
}

interface EditRequestForm {
    supportProduct_Process: string
    purchase_frequency: string
    requester_remark: string
}

interface ActionDialogForm {
    remark: string
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
    approveActionLabel: string
    rejectActionLabel: string
    onClose: () => void
    onSuccess: () => void
}

const ActionDialog = ({ open, mode, requestId, nextStatus, isFinalStep, approveActionLabel, rejectActionLabel, onClose, onSuccess }: ActionDialogProps) => {
    const [error, setError] = useState<string | null>(null)
    const user = getUserData()
    const {
        register,
        handleSubmit: handleFormSubmit,
        reset,
        watch,
        formState: { isSubmitting }
    } = useForm<ActionDialogForm>({
        defaultValues: { remark: '' }
    })

    useEffect(() => {
        if (!open) return
        setError(null)
        reset({ remark: '' })
    }, [open, mode, requestId, reset])

    const onSubmit = async (formData: ActionDialogForm) => {
        if (!requestId) return
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
                approver_remark: formData.remark,
                UPDATE_BY: user?.EMPLOYEE_CODE || '',
                isFinalStep: mode === 'approve' ? isFinalStep : false,
            })
            if (res.data.Status) {
                reset({ remark: '' })
                onSuccess()
                onClose()
            } else {
                setError(res.data.Message || 'Failed to update status')
            }
        } catch (e: any) {
            setError(e?.response?.data?.Message || e?.message || 'Failed to update status')
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
                        {mode === 'approve' ? `Confirm action ${approveActionLabel}` : `Confirm action ${rejectActionLabel}`}
                    </Typography>
                </Box>

                {error && <Alert severity='error' sx={{ mb: 2 }}>{error}</Alert>}

                {mode === 'reject' && (
                    <TextField
                        fullWidth multiline rows={3}
                        label='Remark / Comment (Required for reject)'
                        placeholder='Enter your remark here...'
                        {...register('remark')}
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
                    onClick={handleFormSubmit(onSubmit)}
                    loading={isSubmitting}
                    loadingIndicator={mode === 'approve' ? `${approveActionLabel}...` : `${rejectActionLabel}...`}
                    variant='contained'
                    color={mode === 'approve' ? 'success' : 'error'}
                    sx={{ mr: 4 }}
                    disabled={mode === 'reject' && !watch('remark')?.trim()}
                >
                    <span> Confirm </span>
                </LoadingButton>
                <Button variant='tonal' color='secondary' onClick={onClose} disabled={isSubmitting}>
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
    onApprove: (nextStatus: string, isFinalStep: boolean, approveActionLabel: string) => void
    onReject: (rejectActionLabel: string) => void
    onEmailSent: () => void
    onCompleted?: () => void
}

const DetailPanel = ({ data, onApprove, onReject, onEmailSent, onCompleted }: DetailPanelProps) => {
    const [fileDialogOpen, setFileDialogOpen] = useState(false)
    const [allowApproveBypass, setAllowApproveBypass] = useState(false)
    const [gprCSentInSession, setGprCSentInSession] = useState(false)
    const [gprSavedInSession, setGprSavedInSession] = useState(false)
    // Account step: complete registration
    const [vendorCodeInput, setVendorCodeInput] = useState('')
    const [completing, setCompleting] = useState(false)
    const [completeFeedback, setCompleteFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null)
    // GPR Form dialog
    const [gprDialogOpen, setGprDialogOpen] = useState(false)
    const [gprCDialogOpen, setGprCDialogOpen] = useState(false)
    // Edit Request dialog
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editFeedback, setEditFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null)
    // Edit Vendor modal (reuse EditVendorModal from find-vendor)
    const [editVendorOpen, setEditVendorOpen] = useState(false)
    const [actionRequiredDialogOpen, setActionRequiredDialogOpen] = useState(false)
    const [selectedActionRequired, setSelectedActionRequired] = useState<any | null>(null)
    const { data: statusOptions = [] } = useRequestStatusOptions()
    const user = getUserData()
    const {
        register: registerEdit,
        handleSubmit: handleEditSubmit,
        reset: resetEdit,
        formState: { isSubmitting: editSaving }
    } = useForm<EditRequestForm>({
        defaultValues: {
            supportProduct_Process: '',
            purchase_frequency: '',
            requester_remark: ''
        }
    })
    const files = buildFileUrls(data?.documents)
    if (!data) return null

    useEffect(() => {
        setGprSavedInSession(false)
        setGprCSentInSession(false)
    }, [data?.request_id])


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
    const approvalSteps: any[] = safeParseJSON<any[]>(data.approval_steps, [])
        .filter(Boolean)
        .sort((a: any, b: any) => a.step_order - b.step_order)

    const currentStep = approvalSteps.find((s: any) => s.step_status === 'in_progress')
    const currentStepCode = currentStep ? inferStepCode(currentStep) : ''
    const isAgreementReachedCompleted = approvalSteps.some((s: any) =>
        isAgreementReachedStep(s) && String(s?.step_status || '').toLowerCase() === 'completed'
    )
    const isPicOwnedNegotiationStep = !!currentStep && (
        isPendingAgreementStep(currentStep) ||
        isAgreementReachedStep(currentStep) ||
        isIssueGprBStep(currentStep) ||
        isIssueGprCStep(currentStep) ||
        isVendorDisagreedStep(currentStep)
    )
    const isCurrentStepMine = !!currentStep && (
        currentStep.approver_id === user?.EMPLOYEE_CODE ||
        ((isPicStep(currentStep) || isPicOwnedNegotiationStep) && user?.EMPLOYEE_CODE === data.assign_to)
    )
    const isRequestRegisterActionStep = !!currentStep && (
        isPicStep(currentStep) ||
        isPicOwnedNegotiationStep ||
        isAccountStep(currentStep)
    )
    const isActionable = isCurrentStepMine && isRequestRegisterActionStep && !isAgreementReachedCompleted
    const isCurrentAccountStep = isActionable && isAccountStep(currentStep)
    const isCurrentPicStep = isActionable && isPicStep(currentStep) && user?.EMPLOYEE_CODE === data.assign_to
    const isPoMgrOrAboveStep = [
        WORKFLOW_STEP_CODE.PO_MGR_APPROVAL,
        WORKFLOW_STEP_CODE.PO_GM_APPROVAL,
        WORKFLOW_STEP_CODE.MD_APPROVAL,
    ].includes(currentStepCode as any)
    const isRequester = String(data?.Request_By_EmployeeCode || '').trim() === String(user?.EMPLOYEE_CODE || '').trim()
    const approvalLogs: any[] = safeParseJSON<any[]>(data.approval_logs, []).filter(Boolean)
    const everRequestedVendor = approvalLogs.some((l: any) => l.action_type === 'vendor_requested')

    const canOpenGprDialog = !isCurrentAccountStep && (isActionable || isPoMgrOrAboveStep) && everRequestedVendor
    const canOpenRequesterGprCDialog = isRequester && !isCurrentAccountStep
    const isGprReadOnly = !isCurrentAccountStep && isPoMgrOrAboveStep
    const hasVendorRequested = !!currentStep && approvalLogs.some((l: any) =>
        String(l.step_id || '') === String(currentStep.step_id || '') && l.action_type === 'vendor_requested'
    )
    const approveButtonLabel = getApproveActionLabel(currentStep, hasVendorRequested)
    const rejectButtonLabel = getRejectActionLabel(currentStep)
    const gprStageLabel = getGprStageLabel(currentStep, hasVendorRequested)
    const actionRequiredSetup = safeParseJSON<any>(data.action_required_json, {})
    const actionRequiredStage = resolveActionRequiredStage(currentStep)
    const actionRequiredStageConfig = actionRequiredStage ? (actionRequiredSetup?.[actionRequiredStage] || {}) : null
    const showActionRequiredBtn = Boolean(isActionable && actionRequiredStage)
    const disableActionRequiredBtn = !String(actionRequiredStageConfig?.pic_email || '').trim()
    const actionRequiredLabel = actionRequiredStage
        ? `Action Required - ${getActionRequiredStageLabel(currentStep)}`
        : 'Action Required'
    const circularListPreview = safeParseJSON<string[]>(data.gpr_c_circular_json, [])
    const hasGprCSetup = Boolean(
        data.gpr_c_approver_name
        || data.gpr_c_approver_email
        || data.gpr_c_pc_pic_name
        || data.gpr_c_pc_pic_email
        || (Array.isArray(circularListPreview) && circularListPreview.some(Boolean))
    )

    // GPR evaluation: determine pass/fail from gpr_criteria (joined via vendor_selection_criteria)
    const parsedGprData = safeParseJSON<any>(data.gpr_data, null)
    const gprCriteriaFromData = Array.isArray(parsedGprData?.criteria) ? parsedGprData.criteria : []
    const gprCriteria: any[] = (() => {
        const raw = data.gpr_criteria
        if (Array.isArray(raw)) return raw
        try {
            const parsed = JSON.parse(raw)
            return Array.isArray(parsed) && parsed.length > 0 ? parsed : gprCriteriaFromData
        } catch {
            return gprCriteriaFromData
        }
    })()
    const hasPersistedGprData = Boolean(data.gpr_data) || gprCriteriaFromData.length > 0
    const gprFormFilled = gprSavedInSession || hasPersistedGprData || gprCriteria.length > 0
    // 4.1–4.5 (Need): all must have uploaded_file (4.3 checked via remark='Accept' OR uploaded_file)
    const gprPassNeed = gprFormFilled && gprCriteria
        .filter((c: any) => {
            const no = String(c?.no || '')
            return ['4.1', '4.2', '4.3', '4.4', '4.5'].includes(no)
        })
        .every((c: any) => !!c?.uploaded_file)
    // 4.6-4.13 (Optional): at least 4 must have uploaded_file
    const gprPassOptional = gprFormFilled && gprCriteria
        .filter((c: any) => {
            const no = String(c?.no || '')
            return ['4.6', '4.7', '4.8', '4.9', '4.10', '4.11', '4.12', '4.13'].includes(no)
        })
        .filter((c: any) => !!c?.uploaded_file).length >= 4
    const gprEvalPassed = gprPassNeed && gprPassOptional
    const gprWorkflow = useGprWorkflowLogic({
        currentStep,
        approvalSteps,
        hasSentGprCInSession: gprCSentInSession,
        isActionable,
        isPicOwnedNegotiationStep,
        everRequestedVendor,
        gprFormFilled,
        gprEvalPassed,
        allowApproveBypass,
        statusOptions,
    })

    useEffect(() => {
        if (gprWorkflow.isCurrentIssueGprBStep) {
            setAllowApproveBypass(true)
        }
    }, [gprWorkflow.isCurrentIssueGprBStep])

    const handleOpenEditDialog = () => {
        resetEdit({
            supportProduct_Process: data.supportProduct_Process || '',
            purchase_frequency: data.purchase_frequency || '',
            requester_remark: data.requester_remark || ''
        })
        setEditFeedback(null)
        setEditDialogOpen(true)
    }

    const handleSaveEdit = async (formData: EditRequestForm) => {
        setEditFeedback(null)
        try {
            const res = await RegisterRequestServices.updateRequest({
                request_id: data.request_id,
                supportProduct_Process: formData.supportProduct_Process,
                purchase_frequency: formData.purchase_frequency,
                requester_remark: formData.requester_remark,
                UPDATE_BY: user?.EMPLOYEE_CODE || 'SYSTEM',
            })
            if (res.data.Status) {
                setEditFeedback({ type: 'success', msg: 'Saved successfully' })
                onEmailSent() // refresh grid
                setTimeout(() => setEditDialogOpen(false), 800)
            } else {
                setEditFeedback({ type: 'error', msg: res.data.Message })
            }
        } catch (err: any) {
            setEditFeedback({ type: 'error', msg: err?.response?.data?.Message || err?.message || 'Failed to update request' })
        }
    }

    // Compute next status value for approve action
    const nextStep = currentStep ? approvalSteps.find((s: any) => s.step_order === currentStep.step_order + 1 && s.step_status === 'pending') : null
    const isFinalStep = !!currentStep && !nextStep
    const computedNextStatus = resolveNextStatus(statusOptions, currentStep, nextStep, hasVendorRequested)
    const { isNegotiationStep, actions: negotiationActions } = useApprovalWorkflow(currentStep, statusOptions)
    const agreeAction = negotiationActions.find(action => action.key === 'agree')
    const disagreeAction = negotiationActions.find(action => action.key === 'disagree')
    const renderDisagreeFirst = Boolean(disagreeAction && !disagreeAction.label.toLowerCase().includes('vendor disagreed'))

    const contacts: any[] = safeParseJSON<any[]>(data.contacts, []).filter(Boolean)
    const products: any[] = safeParseJSON<any[]>(data.products, []).filter(Boolean)

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
                    {isCurrentPicStep && (
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
                    {isCurrentPicStep && (
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
                const steps = approvalSteps
                const logs = approvalLogs
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
                                        case 'approved':
                                        case 'completed':
                                            return { label: 'Completed', colorKey: 'success', icon: 'tabler-circle-check-filled' }
                                        case 'in_progress':
                                        case 'current':
                                            return { label: 'In Progress', colorKey: 'warning', icon: 'tabler-clock-play' }
                                        case 'rejected':
                                            return { label: 'Rejected', colorKey: 'error', icon: 'tabler-circle-x-filled' }
                                        case 'skipped':
                                            return { label: 'Skipped', colorKey: 'info', icon: 'tabler-circle-minus' }
                                        case 'pending':
                                        default:
                                            return { label: 'Waiting', colorKey: 'pending', icon: 'tabler-clock' }
                                    }
                                }
                                const stCfg = getStepStatusCfg(s.step_status)
                                return (
                                    <Box key={i} sx={{ display: 'grid', gridTemplateColumns: '0.5fr 2fr 1.5fr 1.2fr 1.5fr', px: 2, py: 1.25, borderTop: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
                                        <Typography variant='body2' fontWeight={600}>{s.step_order}</Typography>
                                        <Typography variant='body2' fontWeight={600}>{s.DESCRIPTION || '-'}</Typography>
                                        <Typography variant='body2' color='text.secondary'>{s.approver_id || '-'}</Typography>
                                        <Chip
                                            icon={<i className={stCfg.icon} style={{ fontSize: 13 }} />}
                                            label={stCfg.label}
                                            size='small'
                                            sx={(theme) => {
                                                const colorMap: Record<string, string> = {
                                                    success: theme.palette.success.main,
                                                    warning: theme.palette.warning.main,
                                                    error: theme.palette.error.main,
                                                    info: theme.palette.info.main,
                                                    pending: theme.palette.text.secondary,
                                                }
                                                const chipColor = colorMap[stCfg.colorKey] || theme.palette.text.secondary
                                                const bgColor = stCfg.colorKey === 'pending'
                                                    ? theme.palette.action.hover
                                                    : alpha(chipColor, theme.palette.mode === 'dark' ? 0.24 : 0.12)
                                                const borderColor = stCfg.colorKey === 'pending'
                                                    ? theme.palette.divider
                                                    : alpha(chipColor, theme.palette.mode === 'dark' ? 0.55 : 0.35)

                                                return {
                                                    bgcolor: bgColor,
                                                    color: chipColor,
                                                    border: '1px solid',
                                                    borderColor,
                                                    fontWeight: 600,
                                                    fontSize: '0.68rem',
                                                    height: 22,
                                                    width: 'fit-content',
                                                    '& .MuiChip-icon': { color: chipColor }
                                                }
                                            }}
                                        />
                                        {isIssueGprCStep(s) && ['approved', 'completed'].includes(String(s?.step_status || '').toLowerCase()) && (
                                            <Chip
                                                size='small'
                                                color='success'
                                                variant='tonal'
                                                label='Requester Completed'
                                                sx={{ ml: 1, fontSize: '0.65rem', height: 20, verticalAlign: 'middle' }}
                                            />
                                        )}
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
                )
            })()}

            {/* Decision Info
            {(data.approve_by || data.approver_remark) && (
                <Box sx={{ mb: 3 }}>
                    <SectionHeader icon='tabler-user-check' title='Decision Info' />
                    {infoRow('Approved / Rejected By', data.approve_by)}
                    {infoRow('Approval Date', data.approve_date ? new Date(data.approve_date).toLocaleDateString('th-TH') : '-')}
                    {infoRow('Approver Remark', data.approver_remark)}
                    {data.vendor_code && infoRow('Vendor Code (FFT)', data.vendor_code)}
                </Box>
            )} */}

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

            {/* Account Registration Step UI (only when Account step is in_progress) */}
            {isCurrentAccountStep && (
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
                                Register the vendor in the FFT system, then enter the Vendor Code to complete the process.
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

            {/* GPR Form */}
            {canOpenGprDialog && (
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
                                {isGprReadOnly
                                    ? `${gprStageLabel} (read-only)`
                                    : (data.gpr_data
                                        ? `${gprStageLabel} filled - click to edit`
                                        : `Fill in ${gprStageLabel} from vendor response`)}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {(hasPersistedGprData || gprSavedInSession) && (
                            <Chip label='Filled' size='small' color='success' variant='tonal'
                                icon={<i className='tabler-circle-check' style={{ fontSize: 13 }} />}
                            />
                        )}
                        <Button size='small' variant='contained' color='primary'
                            startIcon={<i className={isGprReadOnly ? 'tabler-eye' : ((hasPersistedGprData || gprSavedInSession) ? 'tabler-pencil' : 'tabler-plus')} style={{ fontSize: 14 }} />}
                            onClick={() => setGprDialogOpen(true)}
                        >
                            {isGprReadOnly ? `View ${gprStageLabel}` : ((hasPersistedGprData || gprSavedInSession) ? `Edit ${gprStageLabel}` : `Fill ${gprStageLabel}`)}
                        </Button>
                    </Box>
                </Box>
            )}

            {canOpenRequesterGprCDialog && (
                <Box sx={{
                    mb: 3, p: 2, borderRadius: 1,
                    border: '1px solid', borderColor: 'warning.main',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <i className='tabler-users' style={{ fontSize: 20, color: 'var(--mui-palette-warning-main)' }} />
                        <Box>
                            <Typography variant='subtitle2' fontWeight={700}>Requester GPR C Notification Setup</Typography>
                            <Typography variant='caption' color='text.secondary'>
                                Fill approver name and email, PC PIC, and circular list. This section belongs to requester.
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {hasGprCSetup && (
                            <Chip label='Configured' size='small' color='success' variant='tonal'
                                icon={<i className='tabler-circle-check' style={{ fontSize: 13 }} />}
                            />
                        )}
                        <Button
                            size='small'
                            variant='contained'
                            color='warning'
                            startIcon={<i className={hasGprCSetup ? 'tabler-pencil' : 'tabler-plus'} style={{ fontSize: 14 }} />}
                            onClick={() => setGprCDialogOpen(true)}
                        >
                            {hasGprCSetup ? 'Edit Setup' : 'Setup'}
                        </Button>
                    </Box>
                </Box>
            )}

            {/* Approve / Reject Buttons (for normal approval steps only, not Account step) */}
            {isActionable && !isCurrentAccountStep && (
                <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                    {/* PIC post-vendor step: buttons determined by GPR evaluation */}
                    {gprWorkflow.isPicPostVendorStep && (
                        <>
                            {gprWorkflow.showMissingSheetWarning && (
                                <Box sx={{
                                    width: '100%', p: 2, borderRadius: 1.5,
                                    bgcolor: 'info.lighter', border: '1px solid', borderColor: 'info.light',
                                    display: 'flex', alignItems: 'center', gap: 1.5
                                }}>
                                    <i className='tabler-info-circle' style={{ fontSize: 20, color: 'var(--mui-palette-info-main)', flexShrink: 0 }} />
                                    <Typography variant='body2' color='info.dark' fontWeight={600}>
                                        Please complete the Supplier / Outsourcing Selection Sheet before proceeding.
                                    </Typography>
                                </Box>
                            )}
                            {gprWorkflow.showCriteriaWarning && (
                                <Box sx={{
                                    width: '100%', p: 2, borderRadius: 1.5,
                                    bgcolor: 'warning.lighter', border: '1px solid', borderColor: 'warning.light',
                                    display: 'flex', alignItems: 'center', gap: 1.5
                                }}>
                                    
                                    <Typography variant='body2' color='warning.dark' fontWeight={600} >
                                        Vendor has not agreed yet from GPR (A) criteria result. Approve is disabled until criteria pass.
                                    </Typography>
                                </Box>
                            )}
                            {gprWorkflow.showGprCDecisionStatus && (
                                <Box sx={{
                                    width: '100%', p: 2, borderRadius: 1.5,
                                    bgcolor: gprWorkflow.hasGprCApproved
                                        ? 'success.lighter'
                                        : (gprWorkflow.hasGprCRejected ? 'error.lighter' : 'warning.lighter'),
                                    border: '1px solid',
                                    borderColor: gprWorkflow.hasGprCApproved
                                        ? 'success.light'
                                        : (gprWorkflow.hasGprCRejected ? 'error.light' : 'warning.light'),
                                    display: 'flex', alignItems: 'center', gap: 1.5
                                }}>
                                    <i
                                        className={gprWorkflow.hasGprCApproved ? 'tabler-circle-check' : (gprWorkflow.hasGprCRejected ? 'tabler-circle-x' : 'tabler-clock')}
                                        style={{
                                            fontSize: 20,
                                            color: gprWorkflow.hasGprCApproved
                                                ? 'var(--mui-palette-success-main)'
                                                : (gprWorkflow.hasGprCRejected ? 'var(--mui-palette-error-main)' : 'var(--mui-palette-warning-main)'),
                                            flexShrink: 0,
                                        }}
                                    />
                                    <Typography
                                        variant='body2'
                                        color={gprWorkflow.hasGprCApproved ? 'success.dark' : (gprWorkflow.hasGprCRejected ? 'error.dark' : 'warning.dark')}
                                        fontWeight={600}
                                    >
                                        {gprWorkflow.hasGprCApproved
                                            ? 'GPR C approvers approved. PIC can continue with Approve GPR (B) and Send To Checker.'
                                            : (gprWorkflow.hasGprCRejected
                                                ? 'GPR C approvers rejected/disagreed. PIC should choose Reject to continue rejection loop.'
                                                : 'Waiting for requester and GPR C approvers decision.')}
                                    </Typography>
                                </Box>
                            )}
                            {gprWorkflow.showSendToCheckerBtn && (
                                <Button variant='contained' color='success' fullWidth
                                    startIcon={<i className='tabler-circle-check' style={{ fontSize: 18 }} />}
                                    disabled={gprWorkflow.disableSendToCheckerBtn}
                                    onClick={() => onApprove(gprWorkflow.agreementReachedStatusValue || computedNextStatus, false, gprWorkflow.approveLabel)}
                                >{gprWorkflow.approveLabel}</Button>
                            )}
                            {showActionRequiredBtn && (
                                <Button variant='contained' color='info' fullWidth
                                    startIcon={<i className='tabler-bell-ringing' style={{ fontSize: 18 }} />}
                                    disabled={disableActionRequiredBtn}
                                    onClick={() => onApprove(computedNextStatus, false, actionRequiredLabel)}
                                >{actionRequiredLabel}</Button>
                            )}
                            {gprWorkflow.showSendToRequesterBtn && (
                                <Button variant='contained' color='warning' fullWidth
                                    startIcon={<i className='tabler-send' style={{ fontSize: 18 }} />}
                                    disabled={gprWorkflow.disableSendToRequesterBtn}
                                    onClick={() => {
                                        setGprCSentInSession(true)
                                        onApprove(gprWorkflow.issueGprCStatusValue || computedNextStatus, false, gprWorkflow.sendToRequesterLabel)
                                    }}
                                >{gprWorkflow.sendToRequesterLabel}</Button>
                            )}
                            {gprWorkflow.showRejectBtn && (
                                <Button variant='contained' color='error' fullWidth
                                    startIcon={<i className='tabler-circle-x' style={{ fontSize: 18 }} />}
                                    disabled={gprWorkflow.disableRejectBtn}
                                    onClick={() => onApprove(gprWorkflow.vendorDisagreedStatusValue || computedNextStatus, true, gprWorkflow.rejectLabel)}
                                >{gprWorkflow.rejectLabel}</Button>
                            )}
                            {gprWorkflow.showSendToVendorBtn && (
                                <Button variant='contained' color='warning' fullWidth
                                    startIcon={<i className='tabler-send' style={{ fontSize: 18 }} />}
                                    disabled={gprWorkflow.disableSendToVendorBtn}
                                    onClick={() => {
                                        setAllowApproveBypass(true)
                                        onApprove(gprWorkflow.issueGprBStatusValue || computedNextStatus, false, gprWorkflow.sendToVendorLabel)
                                    }}
                                >{gprWorkflow.sendToVendorLabel}</Button>
                            )}
                        </>
                    )}
                    {!gprWorkflow.isPicPostVendorStep && isNegotiationStep && agreeAction && disagreeAction && (
                        <>
                            {showActionRequiredBtn && (
                                <Button variant='contained' color='info' fullWidth
                                    startIcon={<i className='tabler-bell-ringing' style={{ fontSize: 18 }} />}
                                    disabled={disableActionRequiredBtn}
                                    onClick={() => onApprove(computedNextStatus, false, actionRequiredLabel)}
                                >{actionRequiredLabel}</Button>
                            )}
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
                    {!gprWorkflow.isPicPostVendorStep && !isNegotiationStep && (
                        <>
                            {showActionRequiredBtn && (
                                <Button variant='contained' color='info' fullWidth
                                    startIcon={<i className='tabler-bell-ringing' style={{ fontSize: 18 }} />}
                                    disabled={disableActionRequiredBtn}
                                    onClick={() => onApprove(computedNextStatus, false, actionRequiredLabel)}
                                >{actionRequiredLabel}</Button>
                            )}
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
            <GprFormDialog
                open={gprDialogOpen}
                rowData={data}
                readOnly={isGprReadOnly}
                onClose={() => setGprDialogOpen(false)}
                onSaved={() => {
                    setGprSavedInSession(true)
                    setGprDialogOpen(false)
                    onEmailSent()
                }}
            />
            <GprCNotificationDialog
                open={gprCDialogOpen}
                rowData={data}
                onClose={() => setGprCDialogOpen(false)}
                onSaved={() => {
                    setGprCDialogOpen(false)
                    onEmailSent()
                }}
            />
            <Dialog
                maxWidth='sm'
                fullWidth={true}
                open={actionRequiredDialogOpen}
                onClose={() => setActionRequiredDialogOpen(false)}
            >
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
                            {...registerEdit('supportProduct_Process')}
                        />
                        <TextField
                            fullWidth
                            label='Purchase Frequency'
                            {...registerEdit('purchase_frequency')}
                        />
                        <TextField
                            fullWidth multiline rows={3}
                            label='Requester Remark'
                            {...registerEdit('requester_remark')}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'flex-start' }}>
                    <Button
                        onClick={handleEditSubmit(handleSaveEdit)}
                        variant='contained'
                        color='primary'
                        disabled={editSaving}
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
            onApprove={(status: string, finalStep: boolean, actionLabel: string) => props.context.onApprove(props.data, status, finalStep, actionLabel)}
            onReject={(rejectActionLabel: string) => props.context.onReject(props.data, rejectActionLabel)}
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
    const [selectedData, setSelectedData] = useState<RegisterRequestRow | null>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)

    // Approve/Reject Action Dialog state
    const [actionMode, setActionMode] = useState<'approve' | 'reject'>('approve')
    const [actionDialogOpen, setActionDialogOpen] = useState(false)
    const [nextStatus, setNextStatus] = useState('')
    const [isFinalStep, setIsFinalStep] = useState(false)
    const [approveActionLabel, setApproveActionLabel] = useState('Approve')
    const [rejectActionLabel, setRejectActionLabel] = useState('Reject')

    const user = getUserData()
    const empCode = user?.EMPLOYEE_CODE

    // ── Server-Side Datasource ────────────────────────────────────────────────
    const datasource = useMemo<IServerSideDatasource>(() => ({
        getRows: async (params: IServerSideGetRowsParams) => {
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
            cellRenderer: (params: ICellRendererParams<RegisterRequestRow>) => (
                <IconButton
                    size='small'
                    color='primary'
                    onClick={() => {
                        setSelectedData(params.data ?? null)
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
            valueGetter: (p: ValueGetterParams<RegisterRequestRow>) => p.data?.FULL_NAME || p.data?.EMPLOYEE_CODE || '-'
        },
        {
            field: 'documents',
            headerName: 'Files',
            width: 100,
            cellRenderer: (params: ICellRendererParams<RegisterRequestRow>) => {
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
            valueFormatter: (p: ValueFormatterParams<RegisterRequestRow>) => p.value ? new Date(String(p.value)).toLocaleDateString('th-TH') : '-'
        }
    ], [statusOptions])

    const handleActionSuccess = () => {
        gridApiRef.current?.refreshServerSide({ purge: true })
        setDrawerOpen(false)
        setSelectedData(null)
    }

    const gridContext = useMemo(() => ({
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
                <SearchResultCard>
                    <CardContent sx={{ p: '24px !important' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        </Box>

                        <DxAGgridTable
                            columnDefs={colDefs}
                            serverSideDatasource={datasource}
                            height={600}
                            overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No assigned requests found</span>'
                            getRowId={(p: { data: RegisterRequestRow }) => String(p.data.request_id)}
                            onGridReady={(p: any) => { gridApiRef.current = p.api }}
                            initialState={savedGridState}
                            onStateUpdated={handleStateUpdated}
                            masterDetail={true}
                            detailCellRenderer={DetailRenderer}
                            detailRowHeight={850}
                            context={gridContext}
                        />
                    </CardContent>
                </SearchResultCard>
            </Grid>

            {/* Approve / Reject Dialog */}
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

            {/* View Detail Dialog */}
            <Dialog
                maxWidth='lg'
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
                    '& .MuiDialog-paper': {
                        overflow: 'visible',
                        width: { xs: 'calc(100vw - 16px)', sm: 'calc(100vw - 32px)', lg: '1100px' },
                        maxWidth: '1100px',
                    },
                    '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
                }}
            >
                <DialogTitle sx={{ position: 'relative' }}>
                    <Typography variant='h5' component='span'>Request Details</Typography>
                    <Box sx={{ position: 'absolute', top: 14, right: 56, textAlign: 'right' }}>
                        <Typography variant='caption' color='text.disabled' sx={{ display: 'block', lineHeight: 1 }}>
                            Request No.
                        </Typography>
                        <Typography variant='body2' fontWeight={700} color='text.secondary'>
                            {String(selectedData?.request_number || selectedData?.request_id || '-')}
                        </Typography>
                    </Box>
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
