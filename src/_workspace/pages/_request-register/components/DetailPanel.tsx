import { useState, useEffect } from 'react'
import {
    Grid, Box, Typography, Chip, Divider,
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    List, ListItem, IconButton, CircularProgress
} from '@mui/material'
import { styled } from '@mui/material/styles'
import type { BoxProps } from '@mui/material/Box'
import { useDropzone } from 'react-dropzone'
import { useForm } from 'react-hook-form'

import AppReactDropzone from '@/libs/styles/AppReactDropzone'

import SelectionFormDialong from '../modal/SelectionFormDialong'
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
import RegisterRequestServices from '@_workspace/services/_register-request/RegisterRequestServices'

// Styled dropzone — same look as the Requester's "Quotation, Concerned documents"
// upload in /find-vendor (RegisterConfirmModal).
const Dropzone = styled(AppReactDropzone)<BoxProps>(({ theme }) => ({
    '& .dropzone': {
        minHeight: 'unset',
        padding: theme.spacing(4),
        border: `2px dashed ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'border 0.3s ease-in-out',
        '&:hover': {
            borderColor: theme.palette.primary.main
        },
        [theme.breakpoints.down('sm')]: {
            paddingInline: theme.spacing(4)
        },
        '&+.MuiList-root .MuiListItem-root .file-name': {
            fontWeight: theme.typography.body1.fontWeight
        }
    }
}))

const renderGprBFilePreview = (fileName: string) => {
    const name = String(fileName || '').toLowerCase()
    let fileIcon = 'tabler-file-description'
    let color = 'primary'

    if (name.endsWith('.pdf')) { fileIcon = 'tabler-file-type-pdf'; color = 'error' }
    else if (name.endsWith('.xls') || name.endsWith('.xlsx')) { fileIcon = 'tabler-file-spreadsheet'; color = 'success' }
    else if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg')) { fileIcon = 'tabler-photo'; color = 'info' }
    else if (name.endsWith('.doc') || name.endsWith('.docx')) { fileIcon = 'tabler-file-word'; color = 'info' }
    else if (name.endsWith('.zip') || name.endsWith('.rar') || name.endsWith('.7z')) { fileIcon = 'tabler-file-zip'; color = 'warning' }

    return (
        <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: `${color}.lighter`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className={fileIcon} style={{ color: `var(--mui-palette-${color}-main)`, fontSize: '1.5rem' }} />
        </Box>
    )
}

const DetailPanel = ({ data: rawData, onApprove, onReject, onEmailSent, onCompleted }: DetailPanelProps) => {
    const data = rawData || {}
    const [fileDialogOpen, setFileDialogOpen] = useState(false)
    const [allowApproveBypass, setAllowApproveBypass] = useState(false)
    const [gprSavedInSession, setGprSavedInSession] = useState(false)
    // GPR Form dialog
    const [gprDialogOpen, setGprDialogOpen] = useState(false)
    // Edit Request dialog
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    // Edit Vendor modal (reuse EditVendorModal from find-vendor)
    const [editVendorOpen, setEditVendorOpen] = useState(false)
    const [actionRequiredDialogOpen, setActionRequiredDialogOpen] = useState(false)
    const [selectedActionRequired, setSelectedActionRequired] = useState<any | null>(null)
    // GPR B (vendor's returned file, uploaded by PO PIC at the Issue GPR B step)
    const [gprBUploading, setGprBUploading] = useState(false)
    const [gprBFileSession, setGprBFileSession] = useState<{ path: string; name: string; size?: number } | null>(null)
    const [gprBFileError, setGprBFileError] = useState<string | null>(null)
    const [gprBPendingFile, setGprBPendingFile] = useState<File | null>(null)
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
    const files = buildFileUrls(data?.DOCUMENTS, String(data?.REQUEST_NUMBER || ''))
    useEffect(() => {
        setGprSavedInSession(false)
        setGprBFileSession(null)
        setGprBFileError(null)
        setGprBPendingFile(null)
    }, [data?.REQUEST_REGISTER_VENDOR_ID])

    // Parse approval steps to determine if current user can act
    const approvalSteps: any[] = safeParseJSON<any[]>(data.APPROVAL_STEPS, [])
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
        ((isPicStep(currentStep) || isPicOwnedNegotiationStep) && user?.EMPLOYEE_CODE === data.ASSIGN_TO)
    )
    const isRequestRegisterActionStep = !!currentStep && (
        isPicStep(currentStep) ||
        isPicOwnedNegotiationStep ||
        isAccountStep(currentStep)
    )
    const isActionable = isCurrentStepMine && isRequestRegisterActionStep
    const isCurrentAccountStep = isActionable && isAccountStep(currentStep)
    const isCurrentPicStep = isActionable && isPicStep(currentStep) && user?.EMPLOYEE_CODE === data.ASSIGN_TO
    const isAssignedPicUser = String(user?.EMPLOYEE_CODE || '').trim() === String(data.ASSIGN_TO || '').trim()
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
    const approvalLogs: any[] = safeParseJSON<any[]>(data.APPROVAL_LOGS, []).filter(Boolean)
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
    const actionRequiredSetup = safeParseJSON<any>(data.ACTION_REQUIRED_JSON, {})
    const actionRequiredStage = resolveActionRequiredStage(currentStep)
    const actionRequiredStageConfig = actionRequiredStage ? (actionRequiredSetup?.[actionRequiredStage] || {}) : null
    const showActionRequiredBtn = Boolean(isActionable && actionRequiredStage)
    const disableActionRequiredBtn = !String(actionRequiredStageConfig?.pic_email || '').trim()
    const actionRequiredLabel = actionRequiredStage
        ? `Action Required - ${getActionRequiredStageLabel(currentStep)}`
        : 'Action Required'
    // GPR evaluation: determine pass/fail from GPR_CRITERIA (joined via vendor_selection_criteria)
    const gprCriteria: any[] = (() => {
        const raw = data.GPR_CRITERIA
        if (Array.isArray(raw)) return raw.filter(Boolean)
        try {
            const parsed = JSON.parse(raw)
            return Array.isArray(parsed) ? parsed.filter(Boolean) : []
        } catch {
            return []
        }
    })()
    const hasPersistedGprData = gprCriteria.length > 0
    const canOpenGprDialog = !isCurrentAccountStep && (everRequestedVendor || hasPersistedGprData)
    const gprFormFilled = gprSavedInSession || hasPersistedGprData
    // Item 4.3 decides whether GPR B / Form B is needed.
    const gpr43Status = String(data.GPR_43_ACCEPTANCE_STATUS ?? '').trim().replace(/[_-]+/g, ' ').toUpperCase()
    const gpr43Decision = String(gprCriteria.find((c: any) => String(c?.NO || '') === '4.3')?.REMARK || '').trim()
    const isGpr43Accepted = gpr43Status ? gpr43Status === 'ACCEPT' : gpr43Decision === 'Accept'
    const isGprBRequired = gpr43Status ? gpr43Status === 'NOT ACCEPT' : gpr43Decision === 'Not Accept'
    const gprPassNeed = gprFormFilled && isGpr43Accepted && ['4.1', '4.2', '4.4', '4.5', '4.11']
        .every((no) => gprCriteria.some((c: any) => String(c?.NO || '') === no && !!c?.UPLOADED_FILE))
    // Optional criteria require at least 3 documents.
    const gprPassOptional = gprFormFilled && gprCriteria
        .filter((c: any) => {
            const no = String(c?.no || '')
            return ['4.6', '4.7', '4.8', '4.9', '4.10', '4.12', '4.13'].includes(no)
        })
        .filter((c: any) => !!c?.UPLOADED_FILE).length >= 3
    const gprEvalPassed = gprPassNeed && gprPassOptional
    const gprWorkflow = useGprWorkflowLogic({
        currentStep,
        approvalSteps,
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

    // GPR B file: prefer the just-uploaded session file, fall back to what the request already holds.
    const gprBFilePath = gprBFileSession?.path || String(data.GPR_B_FILE_PATH || '')
    const gprBFileName = gprBFileSession?.name || String(data.GPR_B_FILE_NAME || '')
    const hasGprBFile = Boolean(gprBFilePath)

    const uploadGprBFile = async (file: File) => {
        const requestId = Number(data.REQUEST_REGISTER_VENDOR_ID) || 0
        const requestNumber = String(data.REQUEST_NUMBER || '')
        if (!requestId || !requestNumber) {
            ToastMessageError({ title: 'Upload GPR B', message: 'Request information is missing.' })
            return
        }

        setGprBUploading(true)
        try {
            const uploadForm = new FormData()
            uploadForm.append('REQUEST_REGISTER_VENDOR_ID', String(requestId))
            uploadForm.append('file', file)
            uploadForm.append('CREATE_BY', user?.EMPLOYEE_CODE || 'SYSTEM')
            uploadForm.append('DOCUMENT_SCOPE', 'GPR_B')
            uploadForm.append('REQUEST_NUMBER', requestNumber)

            const response = await RegisterRequestServices.addDocument(uploadForm)
            if (!response.data?.Status) {
                throw new Error(response.data?.Message || 'Upload failed')
            }

            const { FILE_PATH: file_path, FILE_NAME: file_name } = response.data.ResultOnDb
            setGprBFileSession({ path: file_path || '', name: file_name || file.name, size: file.size })
            setGprBPendingFile(null)
            ToastMessageSuccess({ title: 'Upload GPR B', message: 'GPR B file uploaded successfully.' })
        } catch (error: any) {
            ToastMessageError({
                title: 'Upload GPR B',
                message: error?.response?.data?.Message || error?.message || 'Failed to upload GPR B file',
            })
        } finally {
            setGprBUploading(false)
        }
    }

    const { getRootProps: getGprBRootProps, getInputProps: getGprBInputProps } = useDropzone({
        multiple: false,
        disabled: gprBUploading,
        onDrop: (acceptedFiles) => {
            setGprBFileError(null)
            if (acceptedFiles[0]) setGprBPendingFile(acceptedFiles[0])
        },
        onDropRejected: (fileRejections) => {
            const messages = fileRejections.map(r => {
                const sizeErr = r.errors.find(e => e.code === 'file-too-large')
                const typeErr = r.errors.find(e => e.code === 'file-invalid-type')
                if (sizeErr) return `File "${r.file.name}" is too large (max 10MB).`
                if (typeErr) return `File "${r.file.name}" type is not allowed.`
                return `File "${r.file.name}" was rejected.`
            })
            setGprBFileError(messages[0])
        },
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'image/png': ['.png'],
            'image/jpeg': ['.jpg', '.jpeg']
        },
        maxSize: 10 * 1024 * 1024 // 10MB
    })

    const formatGprBFileSize = (size?: number) => {
        if (!size) return ''
        return Math.round(size / 100) / 10 > 1000
            ? `${(Math.round(size / 100) / 10000).toFixed(1)} MB`
            : `${(Math.round(size / 100) / 10).toFixed(1)} KB`
    }
    const gprBFileSizeLabel = formatGprBFileSize(gprBFileSession?.size) || 'Uploaded file'

    const handleGprBDownload = async () => {
        if (!gprBFilePath) return
        try {
            const response = await RegisterRequestServices.downloadSelectionDocument({
                FILE_PATH: gprBFilePath,
                FILE_NAME: gprBFileName,
                REQUEST_NUMBER: String(data.REQUEST_NUMBER || ''),
            })
            const blob = response.data
            const downloadName = gprBFileName || gprBFilePath.split(/[/\\]/).pop() || 'gpr-b-file'
            const url = URL.createObjectURL(blob)
            const anchor = document.createElement('a')
            anchor.href = url
            anchor.download = downloadName
            anchor.click()
            URL.revokeObjectURL(url)
        } catch (error: any) {
            ToastMessageError({
                title: 'Download GPR B',
                message: error?.response?.data?.Message || error?.message || 'Failed to download GPR B file',
            })
        }
    }

    const handleOpenEditDialog = () => {
        resetEdit({
            supportProduct_Process: data.SUPPORTPRODUCT_PROCESS || '',
            purchase_frequency: data.PURCHASE_FREQUENCY || '',
            requester_remark: data.REQUESTER_REMARK || ''
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
            REQUEST_REGISTER_VENDOR_ID: data.REQUEST_REGISTER_VENDOR_ID,
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

    const contacts: any[] = safeParseJSON<any[]>(data.CONTACTS, []).filter(Boolean)
    const products: any[] = safeParseJSON<any[]>(data.PRODUCTS, []).filter(Boolean)

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
                        <Typography variant='h6' fontWeight={800}>{data.COMPANY_NAME}</Typography>
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
                            {data.REQUEST_STATUS || '-'}
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
                        { label: 'Support Product / Process', value: data.SUPPORTPRODUCT_PROCESS },
                        { label: 'Purchase Frequency', value: data.PURCHASE_FREQUENCY },
                        { label: 'Assigned To (PIC)', value: data.ASSIGN_TO },
                        { label: 'Submitted Date', value: data.CREATE_DATE ? new Date(data.CREATE_DATE).toLocaleDateString('th-TH') : '-' },
                    ].map(({ label, value }) => (
                        <Grid item xs={12} sm={6} md={3} key={label}>
                            <Typography variant='caption' color='text.disabled' fontWeight={600}>{label}</Typography>
                            <Typography variant='body2' fontWeight={600} sx={{ wordBreak: 'break-word' }}>{value || '-'}</Typography>
                        </Grid>
                    ))}
                    {data.REQUESTER_REMARK && (
                        <Grid item xs={12}>
                            <Typography variant='caption' color='text.disabled' fontWeight={600}>Requester Remark</Typography>
                            <Typography variant='body2' fontWeight={600} sx={{ wordBreak: 'break-word' }}>{data.REQUESTER_REMARK}</Typography>
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
                        { label: 'Company Name', value: data.COMPANY_NAME },
                        { label: 'Vendor Type', value: data.VENDOR_TYPE_NAME },
                        { label: 'Region', value: data.VENDOR_REGION },
                        { label: 'FFT Vendor Code', value: data.FFT_VENDOR_CODE },
                        { label: 'FFT Status', value: formatFftStatus(data.FFT_STATUS) },
                        ...(data.VENDOR_REGION === 'Oversea'
                            ? [{ label: 'Country', value: data.country }]
                            : [
                                { label: 'Province', value: data.province },
                                { label: 'Postal Code', value: data.POSTAL_CODE }
                            ]),
                        { label: 'Tel Center', value: data.TEL_CENTER },
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
                                <Typography variant='body2' fontWeight={600}>{c.CONTACT_NAME || '-'}</Typography>
                                <Typography variant='body2' color='text.secondary'>{c.TEL_PHONE || '-'}</Typography>
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
                                <Typography variant='body2' fontWeight={600}>{p.PRODUCT_GROUP || '-'}</Typography>
                                <Typography variant='body2' color='text.secondary'>{p.MAKER_NAME || '-'}</Typography>
                                <Typography variant='body2' color='text.secondary'>{p.PRODUCT_NAME || '-'}</Typography>
                                <Typography variant='body2' color='text.secondary'>{p.MODEL_LIST || '-'}</Typography>
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
            {(data.APPROVE_BY || data.APPROVER_REMARK) && (
                <Box sx={{ mb: 3 }}>
                    <SectionHeader icon='tabler-user-check' title='Decision Info' />
                    {infoRow('Approved / Rejected By', data.APPROVE_BY)}
                    {infoRow('Approval Date', data.APPROVE_DATE ? new Date(data.APPROVE_DATE).toLocaleDateString('th-TH') : '-')}
                    {infoRow('Approver Remark', data.APPROVER_REMARK)}
                    {data.VENDOR_CODE && infoRow('Vendor Code (FFT)', data.VENDOR_CODE)}
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
                                    : (hasPersistedGprData
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
                                                ? 'Requester head rejected/disagreed GPR C. The request is rejected automatically by the GPR C approval flow — no action needed.'
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
                                <Box sx={{ width: '100%' }}>
                                    <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
                                        GPR B (Vendor Response) <Typography component='span' color='error'>*</Typography>
                                    </Typography>
                                    <Dropzone>
                                        <div {...getGprBRootProps({ className: 'dropzone' })}>
                                            <input {...getGprBInputProps()} />
                                            <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: 1.5, textAlign: 'center' }}>
                                                <Box sx={{
                                                    width: 48, height: 48, borderRadius: 1.5,
                                                    bgcolor: 'secondary.lightOpacity', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    <i className='tabler-file-upload' style={{ fontSize: 24, color: 'var(--mui-palette-secondary-main)' }} />
                                                </Box>
                                                <Typography variant='h6' sx={{ mb: 0.5 }}>
                                                    {(gprBPendingFile || hasGprBFile) ? 'Drop file here or click to replace' : 'Drop file here or click to select'}
                                                </Typography>
                                                <Typography variant='body2' fontWeight={600} color='primary.main'>
                                                    Allowed: PDF, Excel, PNG, JPG (Max 10MB)
                                                </Typography>
                                                {gprBFileError && (
                                                    <Typography variant='caption' color='error' sx={{ mt: 1, fontWeight: 700 }}>
                                                        {gprBFileError}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </div>
                                        {(gprBPendingFile || hasGprBFile) && (
                                            <List sx={{ mt: 2, p: 0 }}>
                                                {gprBPendingFile ? (
                                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                                        <Box sx={{
                                                            display: 'flex', alignItems: 'center', width: '100%', gap: 2,
                                                            p: 1.5, borderRadius: 1.5, border: '1px solid', borderColor: 'warning.main',
                                                            bgcolor: 'background.paper',
                                                            transition: 'border 0.2s'
                                                        }}>
                                                            <Box sx={{ flexShrink: 0, display: 'flex' }}>{renderGprBFilePreview(gprBPendingFile.name)}</Box>
                                                            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                                                                <Typography variant='body2' noWrap fontWeight={600} color='text.primary'>
                                                                    {gprBPendingFile.name}
                                                                </Typography>
                                                                <Typography variant='caption' color='warning.dark'>
                                                                    {formatGprBFileSize(gprBPendingFile.size)} - Waiting for upload
                                                                </Typography>
                                                            </Box>
                                                            <Button
                                                                size='small'
                                                                variant='contained'
                                                                color='primary'
                                                                disabled={gprBUploading}
                                                                startIcon={gprBUploading ? <CircularProgress size={14} color='inherit' /> : <i className='tabler-upload' style={{ fontSize: 16 }} />}
                                                                onClick={() => uploadGprBFile(gprBPendingFile)}
                                                            >
                                                                {gprBUploading ? 'Uploading...' : 'Upload'}
                                                            </Button>
                                                            <IconButton
                                                                onClick={() => setGprBPendingFile(null)}
                                                                size='small'
                                                                disabled={gprBUploading}
                                                                sx={{
                                                                    color: 'error.main',
                                                                    bgcolor: 'error.lighter',
                                                                    opacity: 0.8,
                                                                    '&:hover': { opacity: 1, bgcolor: 'error.light' }
                                                                }}
                                                            >
                                                                <i className='tabler-trash' style={{ fontSize: '1.25rem' }} />
                                                            </IconButton>
                                                        </Box>
                                                    </ListItem>
                                                ) : (
                                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                                        <Box sx={{
                                                            display: 'flex', alignItems: 'center', width: '100%', gap: 2,
                                                            p: 1.5, borderRadius: 1.5, border: '1px solid', borderColor: 'divider',
                                                            bgcolor: 'background.paper',
                                                            transition: 'border 0.2s',
                                                            '&:hover': { borderColor: 'primary.main' }
                                                        }}>
                                                            <Box sx={{ flexShrink: 0, display: 'flex' }}>{renderGprBFilePreview(gprBFileName)}</Box>
                                                            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                                                                <Typography
                                                                    variant='body2'
                                                                    noWrap
                                                                    fontWeight={600}
                                                                    color='primary.main'
                                                                    sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                                                                    onClick={handleGprBDownload}
                                                                >
                                                                    {gprBFileName || 'GPR B file'}
                                                                </Typography>
                                                                <Typography variant='caption' color='text.secondary'>
                                                                    {gprBFileSizeLabel}
                                                                </Typography>
                                                            </Box>
                                                            <IconButton
                                                                onClick={handleGprBDownload}
                                                                size='small'
                                                                sx={{
                                                                    color: 'primary.main',
                                                                    bgcolor: 'primary.lighter',
                                                                    opacity: 0.8,
                                                                    '&:hover': { opacity: 1, bgcolor: 'primary.light' }
                                                                }}
                                                            >
                                                                <i className='tabler-download' style={{ fontSize: '1.25rem' }} />
                                                            </IconButton>
                                                        </Box>
                                                    </ListItem>
                                                )}
                                            </List>
                                        )}
                                    </Dropzone>
                                    {!hasGprBFile && (
                                        <Typography variant='caption' color='warning.dark' sx={{ mt: 1, display: 'block' }}>
                                            Please upload the GPR B file received from the vendor before sending GPR C to the requester.
                                        </Typography>
                                    )}
                                </Box>
                            )}
                            {gprWorkflow.showSendToRequesterBtn && (
                                <Button variant='contained' color='warning' fullWidth
                                    startIcon={<i className='tabler-send' style={{ fontSize: 18 }} />}
                                    disabled={gprWorkflow.disableSendToRequesterBtn || !hasGprBFile}
                                    onClick={() => onApprove(gprWorkflow.issueGprCStatusValue || computedNextStatus, false, gprWorkflow.sendToRequesterLabel)}
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
            <SelectionFormDialong
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
                vendorId={data.VENDORS_ID || null}
                rowData={{
                    VENDORS_ID: data.VENDORS_ID,
                    FFT_VENDOR_CODE: data.FFT_VENDOR_CODE,
                    FFT_STATUS: data.FFT_STATUS,
                    STATUS_CHECK: data.STATUS_CHECK,
                    COMPANY_NAME: data.COMPANY_NAME,
                    MASTER_VENDOR_TYPES_ID: data.MASTER_VENDOR_TYPES_ID,
                    VENDOR_TYPE_NAME: data.VENDOR_TYPE_NAME,
                    PROVINCE: data.PROVINCE,
                    POSTAL_CODE: data.POSTAL_CODE,
                    WEBSITE: data.WEBSITE,
                    ADDRESS: data.ADDRESS,
                    TEL_CENTER: data.TEL_CENTER,
                    EMAILMAIN: data.EMAILMAIN,
                    VENDOR_REGION: data.VENDOR_REGION,
                    CONTACTS: contacts,
                    PRODUCTS: products,
                    CREATE_BY: data.CREATE_BY,
                    UPDATE_BY: data.UPDATE_BY,
                    CREATE_DATE: data.CREATE_DATE,
                    UPDATE_DATE: data.UPDATE_DATE,
                    INUSE: data.INUSE
                }}
                onSuccess={() => {
                    ToastMessageSuccess({ title: 'Edit Vendor', message: 'Vendor updated successfully' })
                    setEditVendorOpen(false)
                    onEmailSent()
                }}
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
