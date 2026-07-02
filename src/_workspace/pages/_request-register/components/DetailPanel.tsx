import { useState, useEffect } from 'react'
import {
    Grid, Box, Typography, Chip, Divider,
    Dialog, DialogTitle, DialogContent, DialogActions, Button
} from '@mui/material'
import { useForm } from 'react-hook-form'

import GprFormDialog from '../modal/GprFormDialog'
import EditVendorModal from '@_workspace/pages/_find-vendor/modal/EditVendorModal'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import useRequestStatusOptions from '@_workspace/react-query/hooks/useRequestStatusOptions'
import useApprovalWorkflow from '@_workspace/hooks/useApprovalWorkflow'
import useGprWorkflowLogic from '@_workspace/hooks/useGprWorkflowLogic'
import {
    getApproveActionLabel,
    getRejectActionLabel,
    inferStepCode,
    isAccountStep,
    isIssueGprBStep,
    isIssueGprCStep,
    isPendingAgreementStep,
    isPicStep,
    resolveActionRequiredStage,
    getActionRequiredStageLabel,
    isVendorDisagreedStep,
    isDocumentCheckApproved,
    getNextPendingMainApprovalStep,
    WORKFLOW_STEP_CODE,
    resolveNextStatus,
    parseActionRequiredRemark,
} from '@_workspace/utils/requestWorkflow'
import { formatFftStatus } from '@_workspace/utils/fftStatus'
import { getChipSx, getReadableStatusTone } from '@_workspace/utils/statusChipStyles'
import CustomTextField from '@components/mui/TextField'
import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import type { EditRequestForm, DetailPanelProps } from '@_workspace/types/_request-register/RequestRegisterTypes'

import { Transition, buildFileUrls, safeParseJSON, buildActionLogPresentation, formatActionTypeLabel, getActionTypeColor } from './shared'
import FileViewerDialog from './FileViewerDialog'
import { useUpdateRequest } from '@_workspace/react-query/hooks/useRegisterRequest'

const DetailPanel = ({ data: rawData, onApprove, onReject, onEmailSent, onCompleted }: DetailPanelProps) => {
    const data = rawData || {}
    const [fileDialogOpen, setFileDialogOpen] = useState(false)
    const [allowApproveBypass, setAllowApproveBypass] = useState(false)
    const [gprCSentInSession, setGprCSentInSession] = useState(false)
    const [gprSavedInSession, setGprSavedInSession] = useState(false)
    // GPR Form dialog
    const [gprDialogOpen, setGprDialogOpen] = useState(false)
    // Edit Request dialog
    const [editDialogOpen, setEditDialogOpen] = useState(false)
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
    } = useForm<EditRequestForm>({
        defaultValues: {
            supportProduct_Process: '',
            purchase_frequency: '',
            requester_remark: ''
        }
    })
    const files = buildFileUrls(data?.documents)
    useEffect(() => {
        setGprSavedInSession(false)
        setGprCSentInSession(false)
    }, [data?.request_id])

    // Parse approval steps to determine if current user can act
    const approvalSteps: any[] = safeParseJSON<any[]>(data.approval_steps, [])
        .filter(Boolean)
        .sort((a: any, b: any) => a.STEP_ORDER - b.STEP_ORDER)

    const currentStep = approvalSteps.find((s: any) => s.STEP_STATUS === 'in_progress')
    const currentStepCode = currentStep ? inferStepCode(currentStep) : ''
    const isPicOwnedNegotiationStep = !!currentStep && (
        isPendingAgreementStep(currentStep) ||
        isIssueGprBStep(currentStep) ||
        isIssueGprCStep(currentStep) ||
        isVendorDisagreedStep(currentStep)
    )
    const isCurrentStepMine = !!currentStep && (
        currentStep.APPROVER_EMPCODE === user?.EMPLOYEE_CODE ||
        ((isPicStep(currentStep) || isPicOwnedNegotiationStep) && user?.EMPLOYEE_CODE === data.assign_to)
    )
    const isRequestRegisterActionStep = !!currentStep && (
        isPicStep(currentStep) ||
        isPicOwnedNegotiationStep ||
        isAccountStep(currentStep)
    )
    const isActionable = isCurrentStepMine && isRequestRegisterActionStep
    const isCurrentAccountStep = isActionable && isAccountStep(currentStep)
    const isCurrentPicStep = isActionable && isPicStep(currentStep) && user?.EMPLOYEE_CODE === data.assign_to
    const isAssignedPicUser = String(user?.EMPLOYEE_CODE || '').trim() === String(data.assign_to || '').trim()
    const isPoMgrOrAboveStep = [
        WORKFLOW_STEP_CODE.PO_MGR_APPROVAL,
        WORKFLOW_STEP_CODE.PO_GM_APPROVAL,
        WORKFLOW_STEP_CODE.MD_APPROVAL,
    ].includes(currentStepCode as any)
    const isSelectionSheetLocked = isDocumentCheckApproved(approvalSteps)
    const isRequester = String(data?.Request_By_EmployeeCode || '').trim() === String(user?.EMPLOYEE_CODE || '').trim()
    const isRequesterGprCSetupPhase = Boolean(
        isRequester
        && currentStep
        && isIssueGprCStep(currentStep)
        && String(currentStep?.APPROVER_EMPCODE || '').trim() === String(user?.EMPLOYEE_CODE || '').trim()
    )
    const approvalLogs: any[] = safeParseJSON<any[]>(data.approval_logs, []).filter(Boolean)
    const logs = approvalLogs
    const everRequestedVendor = approvalLogs.some((l: any) => l.ACTION_TYPE === 'vendor_requested')

    const isGprReadOnly = isSelectionSheetLocked || (!isCurrentAccountStep && (!isActionable || isPoMgrOrAboveStep))
    const hasVendorRequested = !!currentStep && approvalLogs.some((l: any) =>
        String(l.REQUEST_APPROVAL_STEP_ID || '') === String(currentStep.REQUEST_APPROVAL_STEP_ID || '') && l.ACTION_TYPE === 'vendor_requested'
    )
    const isWaitingForExternalGprCApproval = Boolean(
        currentStep
        && isIssueGprCStep(currentStep)
        && currentStep.APPROVER_EMPCODE
        && currentStep.APPROVER_EMPCODE !== user?.EMPLOYEE_CODE
    )
    const approveButtonLabel = getApproveActionLabel(currentStep, hasVendorRequested)
    const rejectButtonLabel = getRejectActionLabel(currentStep)
    const actionRequiredSetup = safeParseJSON<any>(data.action_required_json, {})
    const actionRequiredStage = resolveActionRequiredStage(currentStep)
    const actionRequiredStageConfig = actionRequiredStage ? (actionRequiredSetup?.[actionRequiredStage] || {}) : null
    const showActionRequiredBtn = Boolean(isActionable && actionRequiredStage)
    const disableActionRequiredBtn = !String(actionRequiredStageConfig?.pic_email || '').trim()
    const actionRequiredLabel = actionRequiredStage
        ? `Action Required - ${getActionRequiredStageLabel(currentStep)}`
        : 'Action Required'
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
    const canOpenGprDialog = !isCurrentAccountStep && (everRequestedVendor || hasPersistedGprData)
    const gprFormFilled = gprSavedInSession || hasPersistedGprData || gprCriteria.length > 0
    // Item 4.3 decides whether GPR B / Form B is needed.
    const gpr43Status = String(data.gpr_43_acceptance_status ?? data.GPR_43_ACCEPTANCE_STATUS ?? '').trim().replace(/[_-]+/g, ' ').toUpperCase()
    const gpr43Decision = String(gprCriteria.find((c: any) => String(c?.no || '') === '4.3')?.remark || '').trim()
    const isGpr43Accepted = gpr43Status ? gpr43Status === 'ACCEPT' : gpr43Decision === 'Accept'
    const isGprBRequired = gpr43Status ? gpr43Status === 'NOT ACCEPT' : gpr43Decision === 'Not Accept'
    const gprPassNeed = gprFormFilled && isGpr43Accepted && ['4.1', '4.2', '4.4', '4.5', '4.11']
        .every((no) => gprCriteria.some((c: any) => String(c?.no || '') === no && !!c?.uploaded_file))
    // Optional criteria require at least 3 documents.
    const gprPassOptional = gprFormFilled && gprCriteria
        .filter((c: any) => {
            const no = String(c?.no || '')
            return ['4.6', '4.7', '4.8', '4.9', '4.10', '4.12', '4.13'].includes(no)
        })
        .filter((c: any) => !!c?.uploaded_file).length >= 3
    const gprEvalPassed = gprPassNeed && gprPassOptional
    const gprWorkflow = useGprWorkflowLogic({
        currentStep,
        approvalSteps,
        hasSentGprCInSession: gprCSentInSession,
        isActionable,
        isAssignedPicUser,
        isPicOwnedNegotiationStep,
        everRequestedVendor,
        gprFormFilled,
        gprEvalPassed,
        isGprBRequired,
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
        setEditDialogOpen(true)
    }

    const updateMutation = useUpdateRequest(
        (resData: any) => {
            if (resData?.Status) {
                ToastMessageSuccess({ title: 'Edit Request', message: 'Saved successfully' })
                onEmailSent() // refresh grid
                setEditDialogOpen(false)
            } else {
                ToastMessageError({ title: 'Edit Request', message: resData?.Message || 'Failed to update request' })
            }
        },
        (err: any) => {
            ToastMessageError({ title: 'Edit Request', message: err?.response?.data?.Message || err?.message || 'Failed to update request' })
        }
    )

    const handleSaveEdit = (formData: EditRequestForm) => {
        updateMutation.mutate({
            REQUEST_REGISTER_VENDOR_ID: data.request_id,
            SUPPORTPRODUCT_PROCESS: formData.supportProduct_Process,
            PURCHASE_FREQUENCY: formData.purchase_frequency,
            REQUESTER_REMARK: formData.requester_remark,
            UPDATE_BY: user?.EMPLOYEE_CODE || 'SYSTEM',
        })
    }

    // Compute next status value for approve action
    const nextStep = getNextPendingMainApprovalStep(approvalSteps, currentStep)
    const isFinalStep = !!currentStep && !nextStep
    const computedNextStatus = resolveNextStatus(statusOptions, currentStep, nextStep, hasVendorRequested)
    const { isNegotiationStep, actions: negotiationActions } = useApprovalWorkflow(currentStep, statusOptions, {
        isRequesterGprCSetupPhase,
        directToDocCheckerOnApprove: everRequestedVendor,
    })
    const agreeAction = negotiationActions.find(action => action.key === 'agree')
    const disagreeAction = negotiationActions.find(action => action.key === 'disagree')
    const shouldShowNegotiationApprove = !(isPendingAgreementStep(currentStep) && isGprBRequired)
    const shouldShowNegotiationDisagree = !(isPendingAgreementStep(currentStep) && !isGprBRequired)
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
            <Box sx={{ p: 2.5, mb: 3, borderRadius: 1, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5 }}>
                    <Box>
                        <Typography variant='h6' fontWeight={800}>{data.company_name}</Typography>
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

            {/* Request Info */}
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i className='tabler-clipboard-list' style={{ fontSize: 16, color: 'var(--mui-palette-primary-main)' }} />
                        <Typography variant='subtitle2' fontWeight={700} color='text.secondary'>Request Info</Typography>
                        <Divider sx={{ flex: 1, minWidth: 650 }} />
                    </Box>
                    {isCurrentPicStep && (
                        <Button
                            size='small'
                            variant='contained'
                            disableElevation
                            color='primary'
                            startIcon={<i className='tabler-pencil' style={{ fontSize: 14 }} />}
                            onClick={handleOpenEditDialog}
                            sx={{ minHeight: 28, fontSize: '0.72rem', px: 1.25, py: 0.35 }}
                        >
                            Edit Request
                        </Button>
                    )}
                </Box>
                <Grid container spacing={2}>
                    {[
                        { label: 'Support Product / Process', value: data.supportProduct_Process },
                        { label: 'Purchase Frequency', value: data.purchase_frequency },
                        { label: 'Assigned To (PIC)', value: data.assign_to },
                        { label: 'Submitted Date', value: data.CREATE_DATE ? new Date(data.CREATE_DATE).toLocaleDateString('th-TH') : '-' },
                    ].map(({ label, value }) => (
                        <Grid item xs={12} sm={6} md={3} key={label}>
                            <Typography variant='caption' color='text.disabled' fontWeight={600}>{label}</Typography>
                            <Typography variant='body2' fontWeight={600} sx={{ wordBreak: 'break-word' }}>{value || '-'}</Typography>
                        </Grid>
                    ))}
                    {data.requester_remark && (
                        <Grid item xs={12}>
                            <Typography variant='caption' color='text.disabled' fontWeight={600}>Requester Remark</Typography>
                            <Typography variant='body2' fontWeight={600} sx={{ wordBreak: 'break-word' }}>{data.requester_remark}</Typography>
                        </Grid>
                    )}
                </Grid>
                <Box sx={{ mt: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, mb: files.length > 0 ? 1.25 : 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <i className='tabler-paperclip' style={{ fontSize: 15, color: 'var(--mui-palette-primary-main)' }} />
                            <Typography variant='body2' fontWeight={600}>Attached Files</Typography>
                            <Typography variant='caption' color='text.secondary'>Total Documents: {files.length}</Typography>
                        </Box>
                        <Button
                            size='small'
                            variant='contained'
                            disableElevation
                            color='primary'
                            startIcon={<i className='tabler-folder-open' style={{ fontSize: 14 }} />}
                            onClick={() => setFileDialogOpen(true)}
                            disabled={files.length === 0}
                            sx={{ minHeight: 28, fontSize: '0.72rem', px: 1.25, py: 0.35 }}
                        >
                            View Files
                        </Button>
                    </Box>
                    {files.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {files.map((f, i) => (
                                <Chip
                                    key={i}
                                    label={f.name}
                                    size='small'
                                    variant='outlined'
                                    icon={<i className='tabler-file' style={{ fontSize: 14 }} />}
                                    onClick={() => window.open(f.url, '_blank')}
                                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                                />
                            ))}
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Vendor Info */}
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i className='tabler-building-store' style={{ fontSize: 16, color: 'var(--mui-palette-primary-main)' }} />
                        <Typography variant='subtitle2' fontWeight={700} color='text.secondary'>Vendor Info</Typography>
                        <Divider sx={{ flex: 1, minWidth: 650 }} />
                    </Box>
                    {isCurrentPicStep && (
                        <Button
                            size='small'
                            variant='contained'
                            disableElevation
                            color='primary'
                            startIcon={<i className='tabler-pencil' style={{ fontSize: 14 }} />}
                            onClick={() => setEditVendorOpen(true)}
                            sx={{ minHeight: 28, fontSize: '0.72rem', px: 1.25, py: 0.35 }}
                        >
                            Edit Vendor
                        </Button>
                    )}
                </Box>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    {[
                        { label: 'Company Name', value: data.company_name },
                        { label: 'Vendor Type', value: data.vendor_type_name },
                        { label: 'Region', value: data.vendor_region },
                        { label: 'FFT Vendor Code', value: data.fft_vendor_code },
                        { label: 'FFT Status', value: formatFftStatus(data.fft_status) },
                        ...(data.vendor_region === 'Oversea'
                            ? [{ label: 'Country', value: data.country }]
                            : [
                                { label: 'Province', value: data.province },
                                { label: 'Postal Code', value: data.postal_code }
                            ]),
                        { label: 'Tel Center', value: data.tel_center },
                        { label: 'Website', value: data.website },
                        { label: 'Email (Main)', value: data.emailmain },
                    ].map(({ label, value }) => (
                        <Grid item xs={12} sm={6} md={4} key={label}>
                            <Typography variant='caption' color='text.disabled' fontWeight={600}>{label}</Typography>
                            <Typography variant='body2' fontWeight={600} sx={{ wordBreak: 'break-word' }}>{value || '-'}</Typography>
                        </Grid>
                    ))}
                    {data.address && (
                        <Grid item xs={12}>
                            <Typography variant='caption' color='text.disabled' fontWeight={600}>Address</Typography>
                            <Typography variant='body2' fontWeight={600} sx={{ wordBreak: 'break-word' }}>{data.address}</Typography>
                        </Grid>
                    )}
                </Grid>
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
                            <Box sx={{ display: 'grid', gridTemplateColumns: '0.5fr 2.6fr 1.2fr 1.5fr', px: 2, py: 1, bgcolor: 'action.hover' }}>
                                {['#', 'Description', 'Status', 'Updated'].map(h => (
                                    <Typography key={h} variant='caption' fontWeight={700} color='text.secondary'>{h}</Typography>
                                ))}
                            </Box>
                            {steps.sort((a: any, b: any) => a.STEP_ORDER - b.STEP_ORDER).map((s: any, i: number) => {
                                const getStepStatusCfg = (status: string) => {
                                    switch (status) {
                                        case 'approved':
                                        case 'completed':
                                            return { label: 'Completed', icon: 'tabler-circle-check-filled', tone: { bg: '#D6F4E6', color: '#087B55', border: '#5AD6A3' } }
                                        case 'in_progress':
                                        case 'current':
                                            return { label: 'In Progress', icon: 'tabler-clock-play', tone: { bg: '#FFF0D9', color: '#D96D00', border: '#FFB35C' } }
                                        case 'rejected':
                                            return { label: 'Rejected', icon: 'tabler-circle-x-filled', tone: { bg: '#FFE0E2', color: '#B42335', border: '#FF8B98' } }
                                        case 'skipped':
                                            return { label: 'Skipped', icon: 'tabler-circle-minus', tone: { bg: '#D8F2FF', color: '#0277A8', border: '#6ACCF2' } }
                                        case 'pending':
                                        default:
                                            return { label: 'Waiting', icon: 'tabler-clock', tone: { bg: '#EDEDED', color: '#667085', border: '#CFCFCF' } }
                                    }
                                }
                                const stCfg = getStepStatusCfg(s.STEP_STATUS)
                                return (
                                    <Box key={i} sx={{ display: 'grid', gridTemplateColumns: '0.5fr 2.6fr 1.2fr 1.5fr', px: 2, py: 1.25, borderTop: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
                                        <Typography variant='body2' fontWeight={600}>{s.STEP_ORDER}</Typography>
                                        <Typography variant='body2' fontWeight={600}>{s.DESCRIPTION || '-'}</Typography>
                                        <Chip
                                            icon={<i className={stCfg.icon} style={{ fontSize: 13 }} />}
                                            label={stCfg.label}
                                            size='small'
                                            sx={getChipSx(stCfg.tone, {
                                                fontWeight: 600,
                                                fontSize: '0.68rem',
                                                height: 22,
                                                width: 'fit-content',
                                                '& .MuiChip-icon': { color: stCfg.tone.color }
                                            })}
                                        />
                                        {isIssueGprCStep(s) && ['approved', 'completed'].includes(String(s?.STEP_STATUS || '').toLowerCase()) && (
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
                        {false && logs.length > 0 && (
                            <Box sx={{ mt: 1.5 }}>
                                <Typography variant='caption' fontWeight={700} color='text.disabled' sx={{ mb: 1, display: 'block' }}>Action Logs</Typography>
                                {logs.map((l: any, i: number) => (
                                    <Box
                                        key={i}
                                        sx={{
                                            mb: 1,
                                            p: 1.5,
                                            borderRadius: 1.5,
                                            bgcolor: 'background.paper',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                        }}
                                    >
                                        {(() => {
                                            const parsedRemark = parseActionRequiredRemark(l.DESCRIPTION)
                                            const actionType = parsedRemark.isActionRequired ? 'action_required' : l.ACTION_TYPE
                                            const actionTypeLabel = formatActionTypeLabel(actionType)
                                            const actionColor = getActionTypeColor(actionType)
                                            const detailParts = [
                                                parsedRemark.owner ? `owner: ${parsedRemark.owner}` : '',
                                                parsedRemark.dueDate ? `due: ${parsedRemark.dueDate}` : '',
                                                parsedRemark.note ? `note: ${parsedRemark.note}` : '',
                                            ].filter(Boolean)
                                            const detailText = detailParts.length > 0
                                                ? detailParts.join(' | ')
                                                : (parsedRemark.rawRemark || '')
                                            const actorName = String(l.ACTION_BY_NAME || '').trim()
                                            const actorCode = String(l.ACTION_BY || '').trim()
                                            const actorLabel = actorName
                                                ? `${actorName}${actorCode ? ` (${actorCode})` : ''}`
                                                : (actorCode || '-')
                                            const matchedStep = approvalSteps.find((step: any) => String(step.REQUEST_APPROVAL_STEP_ID) === String(l.REQUEST_APPROVAL_STEP_ID))
                                            const stepDescription = String(matchedStep?.DESCRIPTION || matchedStep?.description || '').trim()

                                            return (
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                                            <Chip
                                                                size='small'
                                                                label={actionTypeLabel}
                                                                sx={getChipSx(getReadableStatusTone(
                                                                    actionColor === 'success' ? 'completed' :
                                                                    actionColor === 'error' ? 'rejected' :
                                                                    actionColor === 'warning' ? 'in progress' :
                                                                    actionColor === 'info' ? 'skipped' : 'pending'
                                                                ), { height: 22, fontSize: '0.68rem', fontWeight: 700 })}
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
                                                            {l.CREATE_DATE ? new Date(l.CREATE_DATE).toLocaleString('th-TH') : '-'}
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant='body2' fontWeight={600}>
                                                        {actorLabel}
                                                    </Typography>
                                                    <Typography variant='caption' color='text.secondary'>
                                                        <strong>{l.ACTION_BY}</strong> ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â {actionTypeLabel} {detailText ? `(${detailText})` : ''} Ãƒâ€šÃ‚Â· {l.CREATE_DATE ? new Date(l.CREATE_DATE).toLocaleString('th-TH') : ''}
                                                    </Typography>
                                                </Box>
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
                                    ? 'Selection Sheet (read-only)'
                                    : (data.gpr_data
                                        ? 'Selection Sheet filled - click to edit'
                                        : 'Fill in Selection Sheet from vendor response')}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button size='small' variant='contained' color='primary'
                            startIcon={<i className={isGprReadOnly ? 'tabler-eye' : ((hasPersistedGprData || gprSavedInSession) ? 'tabler-pencil' : 'tabler-plus')} style={{ fontSize: 14 }} />}
                            onClick={() => setGprDialogOpen(true)}
                        >
                            {isGprReadOnly ? 'View Selection Sheet' : ((hasPersistedGprData || gprSavedInSession) ? 'Edit Selection Sheet' : 'Fill Selection Sheet')}
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
                                        Selection Sheet criteria are not passed yet. Approve is disabled until item 4.3 is accepted, all Need documents are attached, and at least 3 Optional documents are attached.
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
                                            ? 'Requester head approved GPR C. PIC can continue with Approve and Send to Doc Checker.'
                                            : (gprWorkflow.hasGprCRejected
                                                ? 'Requester head rejected/disagreed GPR C. PIC should choose Reject to continue rejection loop.'
                                                : (isWaitingForExternalGprCApproval
                                                    ? `Waiting for requester head (${currentStep?.APPROVER_EMPCODE}) to approve GPR C.`
                                                    : 'Waiting for requester head approval decision.'))}
                                    </Typography>
                                </Box>
                            )}
                            {gprWorkflow.showSendToCheckerBtn && (
                                <Button variant='contained' color='success' fullWidth
                                    startIcon={<i className='tabler-circle-check' style={{ fontSize: 18 }} />}
                                    disabled={gprWorkflow.disableSendToCheckerBtn || isWaitingForExternalGprCApproval}
                                    onClick={() => onApprove(gprWorkflow.documentCheckStatusValue || computedNextStatus, false, gprWorkflow.approveLabel)}
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
                                    onClick={() => onReject(gprWorkflow.rejectLabel, gprWorkflow.vendorDisagreedStatusValue || computedNextStatus, true)}
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
                    {!gprWorkflow.isPicPostVendorStep && isNegotiationStep && (agreeAction || disagreeAction) && (
                        <>
                            {showActionRequiredBtn && (
                                <Button variant='contained' color='info' fullWidth
                                    startIcon={<i className='tabler-bell-ringing' style={{ fontSize: 18 }} />}
                                    disabled={disableActionRequiredBtn}
                                    onClick={() => onApprove(computedNextStatus, false, actionRequiredLabel)}
                                >{actionRequiredLabel}</Button>
                            )}
                            {shouldShowNegotiationDisagree && renderDisagreeFirst && disagreeAction && (
                                <Button variant='contained' color={disagreeAction.color} fullWidth
                                    startIcon={<i className={disagreeAction.color === 'warning' ? 'tabler-send' : 'tabler-alert-triangle'} style={{ fontSize: 18 }} />}
                                    onClick={() => onApprove(disagreeAction.nextStatus, disagreeAction.isFinalStep, disagreeAction.label)}
                                >{disagreeAction.label}</Button>
                            )}
                            {shouldShowNegotiationApprove && agreeAction && (
                                <Button variant='contained' color={agreeAction.color} fullWidth
                                    startIcon={<i className='tabler-circle-check' style={{ fontSize: 18 }} />}
                                    onClick={() => onApprove(agreeAction.nextStatus, agreeAction.isFinalStep, agreeAction.label)}
                                >{agreeAction.label}</Button>
                            )}
                            {shouldShowNegotiationDisagree && !renderDisagreeFirst && disagreeAction && (
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

            {logs.length > 0 && (
                <Box sx={{ mb: 3, mt: 3 }}>
                    <SectionHeader icon='tabler-history' title='Action Logs' />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
                                                    sx={getChipSx(getReadableStatusTone(
                                                        actionColor === 'success' ? 'completed' :
                                                        actionColor === 'error' ? 'rejected' :
                                                        actionColor === 'warning' ? 'in progress' :
                                                        actionColor === 'info' ? 'skipped' : 'pending'
                                                    ), { height: 22, fontSize: '0.68rem', fontWeight: 700 })}
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
                                                {l.CREATE_DATE ? new Date(l.CREATE_DATE).toLocaleString('th-TH') : '-'}
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
                    onEmailSent(data)
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

            {/* Edit Vendor Modal (reuse from find-vendor ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â full Vendor Info + Contacts + Products editing) */}
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
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <CustomTextField
                            fullWidth
                            label='Support Product / Process'
                            placeholder='e.g. Server infrastructure, Maintenance...'
                            {...registerEdit('supportProduct_Process')}
                        />
                        <CustomTextField
                            fullWidth
                            label='Purchase Frequency'
                            placeholder='e.g. Monthly, 2-3 times/year...'
                            {...registerEdit('purchase_frequency')}
                        />
                        <CustomTextField
                            fullWidth multiline rows={3}
                            label='Requester Remark'
                            placeholder='Add remark for this request...'
                            {...registerEdit('requester_remark')}
                        />
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, mb: files.length > 0 ? 1.25 : 0 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <i className='tabler-paperclip' style={{ fontSize: 15, color: 'var(--mui-palette-primary-main)' }} />
                                    <Typography variant='body2' fontWeight={600}>Attached Files</Typography>
                                    <Typography variant='caption' color='text.secondary'>Total Documents: {files.length}</Typography>
                                </Box>
                                <Button
                                    size='small'
                                    variant='tonal'
                                    startIcon={<i className='tabler-folder-open' style={{ fontSize: 14 }} />}
                                    onClick={() => setFileDialogOpen(true)}
                                    disabled={files.length === 0}
                                >
                                    View Files
                                </Button>
                            </Box>
                            {files.length > 0 ? (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {files.map((f, i) => (
                                        <Chip
                                            key={i}
                                            label={f.name}
                                            size='small'
                                            variant='outlined'
                                            icon={<i className='tabler-file' style={{ fontSize: 14 }} />}
                                            onClick={() => window.open(f.url, '_blank')}
                                            sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                                        />
                                    ))}
                                </Box>
                            ) : (
                                <Typography variant='caption' color='text.secondary'>
                                    No attached files
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'flex-start' }}>
                    <Button
                        onClick={handleEditSubmit(handleSaveEdit)}
                        variant='contained'
                        color='primary'
                        disabled={updateMutation.isPending}
                    >Save</Button>
                    <Button onClick={() => setEditDialogOpen(false)} variant='tonal' color='secondary' disabled={updateMutation.isPending}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default DetailPanel
