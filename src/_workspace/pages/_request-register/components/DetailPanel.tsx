import { useState, useEffect } from 'react'
import { Grid, Box, Typography, Chip, Button, List, ListItem, IconButton, CircularProgress } from '@mui/material'
import { styled } from '@mui/material/styles'
import type { BoxProps } from '@mui/material/Box'
import { useDropzone } from 'react-dropzone'

import AppReactDropzone from '@/libs/styles/AppReactDropzone'

import SelectionFormDialong from '../modal/SelectionFormDialong'
import EditVendorModal from '@/_workspace/components/vendor/modal/EditVendorModal'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import useApprovalWorkflow from '@/_workspace/hooks/useApprovalWorkflow'
import useGprWorkflowLogic from '@/_workspace/hooks/useGprWorkflowLogic'
import useWorkflowIdentity from '@/_workspace/hooks/useWorkflowIdentity'
import {
  getApproveActionLabel,
  getRejectActionLabel,
  isAccountStep,
  isIssueGprBStep,
  isIssueGprCStep,
  isPoPicInProgressStep,
  isPicStep,
  resolveActionRequiredStage,
  getActionRequiredStageLabel,
  isVendorDisagreedStep,
  parseActionRequiredRemark,
  getAllowedWorkflowTransitionId
} from '@/_workspace/utils/requestWorkflow'
import { formatFftStatus } from '@/_workspace/utils/fftStatus'
import { getRequesterEmployeeCode, getRequesterEmployeeName } from '@/_workspace/utils/requesterEmployee'
import { getChipSx, getReadableStatusTone } from '@/_workspace/utils/statusChipStyles'
import { DetailCard, EmptyState, ReadOnlyField, RecordCard, SectionHeader } from '@components/detail-view'
import type { DetailPanelProps } from '@/_workspace/types/_request-register/RequestRegisterTypes'

import {
  buildFileUrls,
  safeParseJSON,
  buildActionLogPresentation,
  formatActionTypeLabel,
  getActionTypeColor
} from './shared'
import FileViewerDialog from '../modal/FileViewerDialog'
import ActionRequiredDetailDialog from '../modal/ActionRequiredDetailDialog'
import EditRequestDialog from '../modal/EditRequestDialog'
import RegisterRequestServices from '@/_workspace/services/_register-request/RegisterRequestServices'
import { useFindVendorDetail } from '@/_workspace/react-query/hooks/useFindVendor'
import FindVendorServices from '@/_workspace/services/_find-vendor/FindVendorServices'
import { buildWorkflowStepMasterIds, isApprovalStepStatusMaster } from '@/_workspace/utils/workflowIdentity'
import { fetchVendorTypes } from '@/_workspace/react-select/async-promise-load-options/find-vendor/fetchVendorTypes'
import { fetchCountries } from '@/_workspace/react-select/async-promise-load-options/find-vendor/fetchCountries'
import { fetchProductGroups } from '@/_workspace/react-select/async-promise-load-options/find-vendor/fetchProductGroups'

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

  if (name.endsWith('.pdf')) {
    fileIcon = 'tabler-file-type-pdf'
    color = 'error'
  } else if (name.endsWith('.xls') || name.endsWith('.xlsx')) {
    fileIcon = 'tabler-file-spreadsheet'
    color = 'success'
  } else if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg')) {
    fileIcon = 'tabler-photo'
    color = 'info'
  } else if (name.endsWith('.doc') || name.endsWith('.docx')) {
    fileIcon = 'tabler-file-word'
    color = 'info'
  } else if (name.endsWith('.zip') || name.endsWith('.rar') || name.endsWith('.7z')) {
    fileIcon = 'tabler-file-zip'
    color = 'warning'
  }

  return (
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: 1.5,
        bgcolor: `${color}.lighter`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <i className={fileIcon} style={{ color: `var(--mui-palette-${color}-main)`, fontSize: '1.5rem' }} />
    </Box>
  )
}

const DetailPanel = ({ data: rawData, onApprove, onReject, onEmailSent, onCompleted }: DetailPanelProps) => {
  const data = rawData || {}
  const [fileDialogOpen, setFileDialogOpen] = useState(false)
  const [allowApproveBypass, setAllowApproveBypass] = useState(false)
  const [selectionFormSavedInSession, setSelectionFormSavedInSession] = useState(false)
  // Selection Form dialog
  const [selectionFormDialogOpen, setSelectionFormDialogOpen] = useState(false)
  // Edit Request dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  // Edit Vendor modal (reuse EditVendorModal from find-vendor)
  const [editVendorOpen, setEditVendorOpen] = useState(false)
  const editVendorDetailQuery = useFindVendorDetail(Number(data.VENDORS_ID) || null, editVendorOpen)
  const [actionRequiredDialogOpen, setActionRequiredDialogOpen] = useState(false)
  const [selectedActionRequired, setSelectedActionRequired] = useState<any | null>(null)
  // GPR B (vendor's returned file, uploaded by PO PIC at the Issue GPR B step)
  const [gprBUploading, setGprBUploading] = useState(false)
  const [gprBFileSession, setGprBFileSession] = useState<{ path: string; name: string; size?: number } | null>(null)
  const [gprBFileError, setGprBFileError] = useState<string | null>(null)
  const [gprBPendingFile, setGprBPendingFile] = useState<File | null>(null)
  const { approvalStepStatusIds } = useWorkflowIdentity()
  const user = getUserData()
  const files = buildFileUrls(data?.DOCUMENTS, String(data?.REQUEST_NUMBER || ''))
  useEffect(() => {
    setSelectionFormSavedInSession(false)
    setGprBFileSession(null)
    setGprBFileError(null)
    setGprBPendingFile(null)
  }, [data?.REQUEST_REGISTER_VENDOR_ID])

  // Parse approval steps to determine if current user can act
  const approvalSteps: any[] = safeParseJSON<any[]>(data.APPROVAL_STEPS, [])
    .filter(Boolean)
    .sort((a: any, b: any) => a.STEP_ORDER - b.STEP_ORDER)
  const workflowStepIds = buildWorkflowStepMasterIds(approvalSteps)

  const currentStep = approvalSteps.find((step: any) =>
    isApprovalStepStatusMaster(step, approvalStepStatusIds.IN_PROGRESS)
  )
  const allowedActions = safeParseJSON<any[]>(data.ALLOWED_ACTIONS, []).filter(Boolean)
  const isWorkflowActionAllowed = (actionCode: string) =>
    getAllowedWorkflowTransitionId(allowedActions, actionCode) !== null
  const isPicOwnedNegotiationStep =
    !!currentStep &&
    (isPoPicInProgressStep(currentStep, workflowStepIds) ||
      isIssueGprBStep(currentStep, workflowStepIds) ||
      isIssueGprCStep(currentStep, workflowStepIds) ||
      isVendorDisagreedStep(currentStep, workflowStepIds))
  const isCurrentStepMine =
    !!currentStep &&
    (currentStep.APPROVER_EMPCODE === user?.EMPLOYEE_CODE ||
      ((isPicStep(currentStep) || isPicOwnedNegotiationStep) && user?.EMPLOYEE_CODE === data.ASSIGN_TO))
  const isRequestRegisterActionStep =
    !!currentStep && (isPicStep(currentStep) || isPicOwnedNegotiationStep || isAccountStep(currentStep))
  const isActionable = isCurrentStepMine && isRequestRegisterActionStep
  const isCurrentAccountStep = isActionable && isAccountStep(currentStep)
  const isCurrentPicStep = isActionable && isPicStep(currentStep) && user?.EMPLOYEE_CODE === data.ASSIGN_TO
  const isAssignedPicUser = String(user?.EMPLOYEE_CODE || '').trim() === String(data.ASSIGN_TO || '').trim()
  const isRequester = String(data?.Request_By_EmployeeCode || '').trim() === String(user?.EMPLOYEE_CODE || '').trim()
  const isRequesterGprCSetupPhase = Boolean(
    isRequester &&
      currentStep &&
      isIssueGprCStep(currentStep, workflowStepIds) &&
      String(currentStep?.APPROVER_EMPCODE || '').trim() === String(user?.EMPLOYEE_CODE || '').trim()
  )
  const approvalLogs: any[] = safeParseJSON<any[]>(data.APPROVAL_LOGS, []).filter(Boolean)
  const logs = approvalLogs
  const everRequestedVendor = approvalLogs.some((l: any) => l.ACTION_TYPE === 'vendor_requested')

  const isSelectionSheetEditable = Number(data.IS_SELECTION_SHEET_EDITABLE) === 1
  const selectionFormMode = isSelectionSheetEditable && isActionable ? 'Edit' : 'View'
  const hasVendorRequested =
    !!currentStep &&
    approvalLogs.some(
      (l: any) =>
        String(l.REQUEST_APPROVAL_STEP_ID || '') === String(currentStep.REQUEST_APPROVAL_STEP_ID || '') &&
        l.ACTION_TYPE === 'vendor_requested'
    )
  const isWaitingForExternalGprCApproval = Boolean(
    currentStep &&
      isIssueGprCStep(currentStep, workflowStepIds) &&
      currentStep.APPROVER_EMPCODE &&
      currentStep.APPROVER_EMPCODE !== user?.EMPLOYEE_CODE
  )
  const approveButtonLabel = getApproveActionLabel(currentStep, hasVendorRequested, workflowStepIds)
  const rejectButtonLabel = getRejectActionLabel(currentStep, workflowStepIds)
  const actionRequiredSetup = safeParseJSON<any>(data.ACTION_REQUIRED_JSON, {})
  const actionRequiredStage = resolveActionRequiredStage(currentStep)
  const actionRequiredStageConfig = actionRequiredStage ? actionRequiredSetup?.[actionRequiredStage] || {} : null
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
  const hasPersistedSelectionFormData = gprCriteria.length > 0
  const canOpenSelectionFormDialog = !isCurrentAccountStep && (everRequestedVendor || hasPersistedSelectionFormData)
  const selectionFormFilled = selectionFormSavedInSession || hasPersistedSelectionFormData
  // Item 4.3 decides whether GPR B / Form B is needed.
  const gpr43Status = String(data.GPR_43_ACCEPTANCE_STATUS ?? '')
    .trim()
    .replace(/[_-]+/g, ' ')
    .toUpperCase()
  const gpr43Decision = String(gprCriteria.find((c: any) => String(c?.NO || '') === '4.3')?.REMARK || '').trim()
  const isGpr43Accepted = gpr43Status ? gpr43Status === 'ACCEPT' : gpr43Decision === 'Accept'
  const isGprBRequired = gpr43Status ? gpr43Status === 'NOT ACCEPT' : gpr43Decision === 'Not Accept'
  const hasCriteriaFile = (criteriaNo: string) =>
    gprCriteria.some((c: any) => String(c?.NO || '') === criteriaNo && !!c?.UPLOADED_FILE)
  const gprPassNeed =
    selectionFormFilled &&
    isGpr43Accepted &&
    (hasCriteriaFile('4.1') || hasCriteriaFile('4.11')) &&
    ['4.2', '4.4', '4.5'].every(hasCriteriaFile)
  // Optional criteria require at least 3 documents.
  const gprPassOptional =
    selectionFormFilled &&
    gprCriteria
      .filter((c: any) => {
        const no = String(c?.NO ?? c?.no ?? '')
        return ['4.6', '4.7', '4.8', '4.9', '4.10', '4.11', '4.12', '4.13'].includes(no)
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
    selectionFormFilled,
    gprEvalPassed,
    isGprBRequired,
    allowApproveBypass,
    workflowStepIds,
    approvalStepStatusIds
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
        message: error?.response?.data?.Message || error?.message || 'Failed to upload GPR B file'
      })
    } finally {
      setGprBUploading(false)
    }
  }

  const { getRootProps: getGprBRootProps, getInputProps: getGprBInputProps } = useDropzone({
    multiple: false,
    disabled: gprBUploading,
    onDrop: acceptedFiles => {
      setGprBFileError(null)
      if (acceptedFiles[0]) setGprBPendingFile(acceptedFiles[0])
    },
    onDropRejected: fileRejections => {
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
        REQUEST_NUMBER: String(data.REQUEST_NUMBER || '')
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
        message: error?.response?.data?.Message || error?.message || 'Failed to download GPR B file'
      })
    }
  }

  const handleOpenEditDialog = () => {
    setEditDialogOpen(true)
  }

  const { isNegotiationStep, actions: negotiationActions } = useApprovalWorkflow(currentStep, workflowStepIds, {
    isRequesterGprCSetupPhase,
    directToDocCheckerOnApprove: everRequestedVendor
  })
  const agreeAction = negotiationActions.find(action => action.key === 'agree')
  const disagreeAction = negotiationActions.find(action => action.key === 'disagree')
  const shouldShowNegotiationApprove = !(isPoPicInProgressStep(currentStep, workflowStepIds) && isGprBRequired)
  const shouldShowNegotiationDisagree = !(isPoPicInProgressStep(currentStep, workflowStepIds) && !isGprBRequired)
  const renderDisagreeFirst = Boolean(
    disagreeAction && !disagreeAction.label.toLowerCase().includes('vendor disagreed')
  )

  const contacts: any[] = safeParseJSON<any[]>(data.CONTACTS, []).filter(Boolean)
  const products: any[] = safeParseJSON<any[]>(data.PRODUCTS, []).filter(Boolean)

  return (
    <Box sx={{ p: 3, overflowY: 'auto', height: '100%' }}>
      {/* Header Banner */}
      <Box
        sx={{
          px: 3,
          py: 2,
          mb: 3,
          borderRadius: 1.5,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box>
          <Typography variant='h6' fontWeight={800}>
            {data.COMPANY_NAME || '-'}
          </Typography>
          <Typography variant='caption' color='text.disabled'>
            {data.REQUEST_NUMBER || '-'}
          </Typography>
        </Box>
        <Chip
          size='small'
          label={data.REQUEST_STATUS || '-'}
          sx={getChipSx(getReadableStatusTone(data.REQUEST_STATUS), { fontWeight: 700 })}
        />
      </Box>

      {/* Request Info */}
      <Box sx={{ mb: 3 }}>
        <SectionHeader
          icon='tabler-clipboard-list'
          title='Request Info'
          action={
            isCurrentPicStep && (
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
            )
          }
        />
        <DetailCard>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <ReadOnlyField label='Support Product / Process' value={data.SUPPORTPRODUCT_PROCESS} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <ReadOnlyField label='Purchase Frequency' value={data.PURCHASE_FREQUENCY} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <ReadOnlyField label='Assigned To (PIC)' value={data.ASSIGN_TO} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <ReadOnlyField
                label='Submitted Date'
                value={data.CREATE_DATE ? new Date(data.CREATE_DATE).toLocaleDateString('th-TH') : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <ReadOnlyField label='Request By Employee Code' value={getRequesterEmployeeCode(data)} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <ReadOnlyField label='Request By Employee Name' value={getRequesterEmployeeName(data)} />
            </Grid>
            {data.REQUESTER_REMARK && (
              <Grid item xs={12}>
                <ReadOnlyField label='Requester Remark' value={data.REQUESTER_REMARK} multiline />
              </Grid>
            )}
            <Grid item xs={12}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5,
                  mb: files.length > 0 ? 1.25 : 0
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i className='tabler-paperclip' style={{ fontSize: 15, color: 'var(--mui-palette-primary-main)' }} />
                  <Typography variant='body2' fontWeight={600}>
                    Attached Files
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Total Documents: {files.length}
                  </Typography>
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
            </Grid>
          </Grid>
        </DetailCard>
      </Box>

      {/* Vendor Info */}
      <Box sx={{ mb: 3 }}>
        <SectionHeader
          icon='tabler-building-store'
          title='Vendor Info'
          action={
            isCurrentPicStep && (
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
            )
          }
        />
        <DetailCard>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <ReadOnlyField label='Company Name' value={data.COMPANY_NAME} />
            </Grid>
            <Grid item xs={12} md={6}>
              <ReadOnlyField label='Vendor Type' value={data.VENDOR_TYPE_NAME} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                  Trade Term
                </Typography>
                <Chip
                  label={data.VENDOR_REGION === 'Oversea' ? 'Oversea' : 'Local'}
                  color={data.VENDOR_REGION === 'Oversea' ? 'info' : 'success'}
                  size='small'
                  variant='tonal'
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </Grid>
            {data.VENDOR_REGION === 'Oversea' ? (
              <Grid item xs={12} md={6}>
                <ReadOnlyField label='Country' value={data.COUNTRY} />
              </Grid>
            ) : (
              <>
                <Grid item xs={6} md={3}>
                  <ReadOnlyField label='Province' value={data.PROVINCE} />
                </Grid>
                <Grid item xs={6} md={3}>
                  <ReadOnlyField label='Postal Code' value={data.POSTAL_CODE} />
                </Grid>
              </>
            )}
            <Grid item xs={6} md={3}>
              <ReadOnlyField label='FFT Vendor Code' value={data.FFT_VENDOR_CODE} />
            </Grid>
            <Grid item xs={6} md={3}>
              <ReadOnlyField label='FFT Status' value={formatFftStatus(data.FFT_STATUS)} />
            </Grid>
            <Grid item xs={6} md={3}>
              <ReadOnlyField label='Tel Center' value={data.TEL_CENTER} />
            </Grid>
            <Grid item xs={6} md={3}>
              <ReadOnlyField label='Website' value={data.WEBSITE} />
            </Grid>
            <Grid item xs={12} md={6}>
              <ReadOnlyField label='Email (Main)' value={data.EMAILMAIN} />
            </Grid>
            <Grid item xs={12}>
              <ReadOnlyField label='Address' value={data.ADDRESS} multiline />
            </Grid>
          </Grid>
        </DetailCard>
      </Box>

      {/* Contacts */}
      <Box sx={{ mb: 3 }}>
        <SectionHeader icon='tabler-users' title={`Contacts (${contacts.length})`} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {contacts.length === 0 ? (
            <EmptyState message='No contacts' />
          ) : (
            contacts.map((c, i) => (
              <RecordCard key={i} index={i} title='Contact Info'>
                <Grid item xs={12} sm={6}>
                  <ReadOnlyField label='Name' value={c.CONTACT_NAME} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ReadOnlyField label='Phone' value={c.TEL_PHONE} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ReadOnlyField label='Email' value={c.EMAIL} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ReadOnlyField label='Position' value={c.POSITION} />
                </Grid>
              </RecordCard>
            ))
          )}
        </Box>
      </Box>

      {/* Products */}
      <Box sx={{ mb: 3 }}>
        <SectionHeader icon='tabler-package' title={`Products (${products.length})`} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {products.length === 0 ? (
            <EmptyState message='No products' />
          ) : (
            products.map((p, i) => (
              <RecordCard key={i} index={i} title='Product'>
                <Grid item xs={12} sm={6}>
                  <ReadOnlyField label='Product Group' value={p.PRODUCT_GROUP} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ReadOnlyField label='Maker' value={p.MAKER_NAME} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ReadOnlyField label='Product Name' value={p.PRODUCT_NAME} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ReadOnlyField label='Model List' value={p.MODEL_LIST} multiline />
                </Grid>
              </RecordCard>
            ))
          )}
        </Box>
      </Box>

      {/* Approval Steps */}
      {(() => {
        const steps = approvalSteps
        const logs = approvalLogs
        if (steps.length === 0) return null
        return (
          <Box sx={{ mb: 3 }}>
            <SectionHeader icon='tabler-list-check' title={`Approval Steps (${steps.length})`} />
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '0.5fr 2.6fr 1.2fr 1.5fr',
                  px: 2,
                  py: 1,
                  bgcolor: 'action.hover'
                }}
              >
                {['#', 'Description', 'Status', 'Updated'].map(h => (
                  <Typography key={h} variant='caption' fontWeight={700} color='text.secondary'>
                    {h}
                  </Typography>
                ))}
              </Box>
              {steps
                .sort((a: any, b: any) => a.STEP_ORDER - b.STEP_ORDER)
                .map((s: any, i: number) => {
                  const getStepStatusCfg = (statusId: number) => {
                    if (statusId === approvalStepStatusIds.APPROVED) {
                      return {
                        label: 'Completed',
                        icon: 'tabler-circle-check-filled',
                        tone: { bg: '#D6F4E6', color: '#087B55', border: '#5AD6A3' }
                      }
                    }
                    if (statusId === approvalStepStatusIds.IN_PROGRESS) {
                      return {
                        label: 'In Progress',
                        icon: 'tabler-clock-play',
                        tone: { bg: '#FFF0D9', color: '#D96D00', border: '#FFB35C' }
                      }
                    }
                    if (statusId === approvalStepStatusIds.REJECTED) {
                      return {
                        label: 'Rejected',
                        icon: 'tabler-circle-x-filled',
                        tone: { bg: '#FFE0E2', color: '#B42335', border: '#FF8B98' }
                      }
                    }
                    if (statusId === approvalStepStatusIds.SKIPPED) {
                      return {
                        label: 'Skipped',
                        icon: 'tabler-circle-minus',
                        tone: { bg: '#D8F2FF', color: '#0277A8', border: '#6ACCF2' }
                      }
                    }
                    return {
                      label: 'Waiting',
                      icon: 'tabler-clock',
                      tone: { bg: '#EDEDED', color: '#667085', border: '#CFCFCF' }
                    }
                  }
                  const stCfg = getStepStatusCfg(Number(s.M_APPROVAL_STEP_STATUS_ID || 0))
                  return (
                    <Box
                      key={i}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '0.5fr 2.6fr 1.2fr 1.5fr',
                        px: 2,
                        py: 1.25,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <Typography variant='body2' fontWeight={600}>
                        {s.STEP_ORDER}
                      </Typography>
                      <Typography variant='body2' fontWeight={600}>
                        {s.DESCRIPTION || '-'}
                      </Typography>
                      <Chip
                        icon={<i className={stCfg.icon} style={{ fontSize: 13 }} />}
                        label={stCfg.label}
                        size='small'
                        sx={getChipSx(stCfg.tone, {
                          fontWeight: 600,
                          fontSize: '0.68rem',
                          height: 22,
                          width: 'fit-content',
                          '& .MuiChip-icon': { color: 'inherit' }
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
                <Typography variant='caption' fontWeight={700} color='text.disabled' sx={{ mb: 1, display: 'block' }}>
                  Action Logs
                </Typography>
                {logs.map((l: any, i: number) => (
                  <Box
                    key={i}
                    sx={{
                      mb: 1,
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    {(() => {
                      const parsedRemark = parseActionRequiredRemark(
                        l.RECHECK_REASON || l.REJECT_REASON || l.DESCRIPTION
                      )
                      const actionType = parsedRemark.isActionRequired ? 'action_required' : l.ACTION_TYPE
                      const actionTypeLabel = formatActionTypeLabel(actionType)
                      const actionColor = getActionTypeColor(actionType)
                      const detailParts = [
                        parsedRemark.owner ? `owner: ${parsedRemark.owner}` : '',
                        parsedRemark.dueDate ? `due: ${parsedRemark.dueDate}` : '',
                        parsedRemark.note ? `note: ${parsedRemark.note}` : ''
                      ].filter(Boolean)
                      const detailText = detailParts.length > 0 ? detailParts.join(' | ') : parsedRemark.rawRemark || ''
                      const actorName = String(l.ACTION_BY_NAME || '').trim()
                      const actorCode = String(l.ACTION_BY || '').trim()
                      const actorLabel = actorName
                        ? `${actorName}${actorCode ? ` (${actorCode})` : ''}`
                        : actorCode || '-'
                      const matchedStep = approvalSteps.find(
                        (step: any) => String(step.REQUEST_APPROVAL_STEP_ID) === String(l.REQUEST_APPROVAL_STEP_ID)
                      )
                      const stepDescription = String(matchedStep?.DESCRIPTION || matchedStep?.description || '').trim()

                      return (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'space-between',
                              gap: 1.5,
                              flexWrap: 'wrap'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Chip
                                size='small'
                                label={actionTypeLabel}
                                sx={getChipSx(
                                  getReadableStatusTone(
                                    actionColor === 'success'
                                      ? 'completed'
                                      : actionColor === 'error'
                                        ? 'rejected'
                                        : actionColor === 'warning'
                                          ? 'in progress'
                                          : actionColor === 'info'
                                            ? 'skipped'
                                            : 'pending'
                                  ),
                                  { height: 22, fontSize: '0.68rem', fontWeight: 700 }
                                )}
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
                            <strong>{l.ACTION_BY}</strong> — {actionTypeLabel} {detailText ? `(${detailText})` : ''} ·{' '}
                            {l.CREATE_DATE ? new Date(l.CREATE_DATE).toLocaleString('th-TH') : ''}
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
      {/* Selection Form */}
      {canOpenSelectionFormDialog && (
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
            gap: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <i className='tabler-clipboard-text' style={{ fontSize: 20, color: 'var(--mui-palette-primary-main)' }} />
            <Box>
              <Typography variant='subtitle2' fontWeight={700}>
                Supplier / Outsourcing Selection Sheet
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {selectionFormMode === 'View'
                  ? 'Selection Sheet - View mode'
                  : hasPersistedSelectionFormData
                    ? 'Selection Sheet filled - click to edit'
                    : 'Fill in Selection Sheet from vendor response'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              size='small'
              variant='contained'
              color='primary'
              startIcon={
                <i
                  className={
                    selectionFormMode === 'View'
                      ? 'tabler-eye'
                      : hasPersistedSelectionFormData || selectionFormSavedInSession
                        ? 'tabler-pencil'
                        : 'tabler-plus'
                  }
                  style={{ fontSize: 14 }}
                />
              }
              onClick={() => setSelectionFormDialogOpen(true)}
            >
              {selectionFormMode === 'View'
                ? 'View Selection Sheet'
                : hasPersistedSelectionFormData || selectionFormSavedInSession
                  ? 'Edit Selection Sheet'
                  : 'Fill Selection Sheet'}
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
                <Box
                  sx={{
                    width: '100%',
                    p: 2,
                    borderRadius: 1.5,
                    bgcolor: 'info.lighter',
                    border: '1px solid',
                    borderColor: 'info.light',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5
                  }}
                >
                  <i
                    className='tabler-info-circle'
                    style={{ fontSize: 20, color: 'var(--mui-palette-info-main)', flexShrink: 0 }}
                  />
                  <Typography variant='body2' color='info.dark' fontWeight={600}>
                    Please complete the Supplier / Outsourcing Selection Sheet before proceeding.
                  </Typography>
                </Box>
              )}
              {gprWorkflow.showCriteriaWarning && (
                <Box
                  sx={{
                    width: '100%',
                    p: 2,
                    borderRadius: 1.5,
                    bgcolor: 'warning.lighter',
                    border: '1px solid',
                    borderColor: 'warning.light',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5
                  }}
                >
                  <Typography variant='body2' color='warning.dark' fontWeight={600}>
                    Selection Sheet criteria are not passed yet. Approve is disabled until item 4.3 is accepted, all
                    Need documents are attached, and at least 3 Optional documents are attached.
                  </Typography>
                </Box>
              )}
              {gprWorkflow.showGprCDecisionStatus && (
                <Box
                  sx={{
                    width: '100%',
                    p: 2,
                    borderRadius: 1.5,
                    bgcolor: gprWorkflow.hasGprCApproved
                      ? 'success.lighter'
                      : gprWorkflow.hasGprCRejected
                        ? 'error.lighter'
                        : 'warning.lighter',
                    border: '1px solid',
                    borderColor: gprWorkflow.hasGprCApproved
                      ? 'success.light'
                      : gprWorkflow.hasGprCRejected
                        ? 'error.light'
                        : 'warning.light',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5
                  }}
                >
                  <i
                    className={
                      gprWorkflow.hasGprCApproved
                        ? 'tabler-circle-check'
                        : gprWorkflow.hasGprCRejected
                          ? 'tabler-circle-x'
                          : 'tabler-clock'
                    }
                    style={{
                      fontSize: 20,
                      color: gprWorkflow.hasGprCApproved
                        ? 'var(--mui-palette-success-main)'
                        : gprWorkflow.hasGprCRejected
                          ? 'var(--mui-palette-error-main)'
                          : 'var(--mui-palette-warning-main)',
                      flexShrink: 0
                    }}
                  />
                  <Typography
                    variant='body2'
                    color={
                      gprWorkflow.hasGprCApproved
                        ? 'success.dark'
                        : gprWorkflow.hasGprCRejected
                          ? 'error.dark'
                          : 'warning.dark'
                    }
                    fontWeight={600}
                  >
                    {gprWorkflow.hasGprCApproved
                      ? 'Requester head approved GPR C. PIC can continue with Approve and Send to Doc Checker.'
                      : gprWorkflow.hasGprCRejected
                        ? 'Requester head rejected/disagreed GPR C. The request is rejected automatically by the GPR C approval flow — no action needed.'
                        : isWaitingForExternalGprCApproval
                          ? `Waiting for requester head (${currentStep?.APPROVER_EMPCODE}) to approve GPR C.`
                          : 'Waiting for requester head approval decision.'}
                  </Typography>
                </Box>
              )}
              {gprWorkflow.showSendToCheckerBtn && (
                <Button
                  variant='contained'
                  color='success'
                  fullWidth
                  startIcon={<i className='tabler-circle-check' style={{ fontSize: 18 }} />}
                  disabled={
                    gprWorkflow.disableSendToCheckerBtn ||
                    isWaitingForExternalGprCApproval ||
                    !isWorkflowActionAllowed('APPROVE')
                  }
                  onClick={() => onApprove('APPROVE', gprWorkflow.approveLabel)}
                >
                  {gprWorkflow.approveLabel}
                </Button>
              )}
              {showActionRequiredBtn && (
                <Button
                  variant='contained'
                  color='info'
                  fullWidth
                  startIcon={<i className='tabler-bell-ringing' style={{ fontSize: 18 }} />}
                  disabled={disableActionRequiredBtn || !isWorkflowActionAllowed('ACTION_REQUIRED')}
                  onClick={() => onApprove('ACTION_REQUIRED', actionRequiredLabel)}
                >
                  {actionRequiredLabel}
                </Button>
              )}
              {gprWorkflow.showSendToRequesterBtn && (
                <Box sx={{ width: '100%' }}>
                  <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
                    GPR B (Vendor Response){' '}
                    <Typography component='span' color='error'>
                      *
                    </Typography>
                  </Typography>
                  <Dropzone>
                    <div {...getGprBRootProps({ className: 'dropzone' })}>
                      <input {...getGprBInputProps()} />
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          flexDirection: 'column',
                          gap: 1.5,
                          textAlign: 'center'
                        }}
                      >
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 1.5,
                            bgcolor: 'secondary.lightOpacity',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <i
                            className='tabler-file-upload'
                            style={{ fontSize: 24, color: 'var(--mui-palette-secondary-main)' }}
                          />
                        </Box>
                        <Typography variant='h6' sx={{ mb: 0.5 }}>
                          {gprBPendingFile || hasGprBFile
                            ? 'Drop file here or click to replace'
                            : 'Drop file here or click to select'}
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
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                width: '100%',
                                gap: 2,
                                p: 1.5,
                                borderRadius: 1.5,
                                border: '1px solid',
                                borderColor: 'warning.main',
                                bgcolor: 'background.paper',
                                transition: 'border 0.2s'
                              }}
                            >
                              <Box sx={{ flexShrink: 0, display: 'flex' }}>
                                {renderGprBFilePreview(gprBPendingFile.name)}
                              </Box>
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
                                startIcon={
                                  gprBUploading ? (
                                    <CircularProgress size={14} color='inherit' />
                                  ) : (
                                    <i className='tabler-upload' style={{ fontSize: 16 }} />
                                  )
                                }
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
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                width: '100%',
                                gap: 2,
                                p: 1.5,
                                borderRadius: 1.5,
                                border: '1px solid',
                                borderColor: 'divider',
                                bgcolor: 'background.paper',
                                transition: 'border 0.2s',
                                '&:hover': { borderColor: 'primary.main' }
                              }}
                            >
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
                <Button
                  variant='contained'
                  color='warning'
                  fullWidth
                  startIcon={<i className='tabler-send' style={{ fontSize: 18 }} />}
                  disabled={
                    gprWorkflow.disableSendToRequesterBtn || !hasGprBFile || !isWorkflowActionAllowed('APPROVE')
                  }
                  onClick={() => onApprove('APPROVE', gprWorkflow.sendToRequesterLabel)}
                >
                  {gprWorkflow.sendToRequesterLabel}
                </Button>
              )}
              {gprWorkflow.showRejectBtn && (
                <Button
                  variant='contained'
                  color='error'
                  fullWidth
                  startIcon={<i className='tabler-circle-x' style={{ fontSize: 18 }} />}
                  disabled={gprWorkflow.disableRejectBtn || !isWorkflowActionAllowed('DISAGREE')}
                  onClick={() => onReject(gprWorkflow.rejectLabel, 'DISAGREE')}
                >
                  {gprWorkflow.rejectLabel}
                </Button>
              )}
              {gprWorkflow.showSendToVendorBtn && (
                <Button
                  variant='contained'
                  color='warning'
                  fullWidth
                  startIcon={<i className='tabler-send' style={{ fontSize: 18 }} />}
                  disabled={gprWorkflow.disableSendToVendorBtn || !isWorkflowActionAllowed('DISAGREE')}
                  onClick={() => {
                    setAllowApproveBypass(true)
                    onApprove('DISAGREE', gprWorkflow.sendToVendorLabel)
                  }}
                >
                  {gprWorkflow.sendToVendorLabel}
                </Button>
              )}
            </>
          )}
          {!gprWorkflow.isPicPostVendorStep && isNegotiationStep && (agreeAction || disagreeAction) && (
            <>
              {showActionRequiredBtn && (
                <Button
                  variant='contained'
                  color='info'
                  fullWidth
                  startIcon={<i className='tabler-bell-ringing' style={{ fontSize: 18 }} />}
                  disabled={disableActionRequiredBtn || !isWorkflowActionAllowed('ACTION_REQUIRED')}
                  onClick={() => onApprove('ACTION_REQUIRED', actionRequiredLabel)}
                >
                  {actionRequiredLabel}
                </Button>
              )}
              {shouldShowNegotiationDisagree && renderDisagreeFirst && disagreeAction && (
                <Button
                  variant='contained'
                  color={disagreeAction.color}
                  fullWidth
                  startIcon={
                    <i
                      className={disagreeAction.color === 'warning' ? 'tabler-send' : 'tabler-alert-triangle'}
                      style={{ fontSize: 18 }}
                    />
                  }
                  disabled={!isWorkflowActionAllowed('DISAGREE')}
                  onClick={() => onApprove('DISAGREE', disagreeAction.label)}
                >
                  {disagreeAction.label}
                </Button>
              )}
              {shouldShowNegotiationApprove && agreeAction && (
                <Button
                  variant='contained'
                  color={agreeAction.color}
                  fullWidth
                  startIcon={<i className='tabler-circle-check' style={{ fontSize: 18 }} />}
                  disabled={!isWorkflowActionAllowed('APPROVE')}
                  onClick={() => onApprove('APPROVE', agreeAction.label)}
                >
                  {agreeAction.label}
                </Button>
              )}
              {shouldShowNegotiationDisagree && !renderDisagreeFirst && disagreeAction && (
                <Button
                  variant='contained'
                  color={disagreeAction.color}
                  fullWidth
                  startIcon={
                    <i
                      className={disagreeAction.color === 'warning' ? 'tabler-send' : 'tabler-alert-triangle'}
                      style={{ fontSize: 18 }}
                    />
                  }
                  disabled={!isWorkflowActionAllowed('DISAGREE')}
                  onClick={() => onApprove('DISAGREE', disagreeAction.label)}
                >
                  {disagreeAction.label}
                </Button>
              )}
            </>
          )}
          {!gprWorkflow.isPicPostVendorStep && !isNegotiationStep && (
            <>
              {showActionRequiredBtn && (
                <Button
                  variant='contained'
                  color='info'
                  fullWidth
                  startIcon={<i className='tabler-bell-ringing' style={{ fontSize: 18 }} />}
                  disabled={disableActionRequiredBtn || !isWorkflowActionAllowed('ACTION_REQUIRED')}
                  onClick={() => onApprove('ACTION_REQUIRED', actionRequiredLabel)}
                >
                  {actionRequiredLabel}
                </Button>
              )}
              <Button
                variant='contained'
                color='success'
                fullWidth
                startIcon={<i className='tabler-circle-check' style={{ fontSize: 18 }} />}
                disabled={!isWorkflowActionAllowed('APPROVE')}
                onClick={() => onApprove('APPROVE', approveButtonLabel)}
              >
                {approveButtonLabel}
              </Button>
              <Button
                variant='contained'
                color='error'
                fullWidth
                startIcon={<i className='tabler-circle-x' style={{ fontSize: 18 }} />}
                disabled={!isWorkflowActionAllowed('REJECT')}
                onClick={() => onReject(rejectButtonLabel, 'REJECT')}
              >
                {rejectButtonLabel}
              </Button>
            </>
          )}
        </Box>
      )}

      {logs.length > 0 && (
        <Box sx={{ mb: 3, mt: 3 }}>
          <SectionHeader icon='tabler-history' title='Action Logs' />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {logs.map((l: any, i: number) => {
              const { parsedRemark, actionTypeLabel, actionColor, detailText, actorLabel, stepDescription } =
                buildActionLogPresentation(l, approvalSteps)
              return (
                <Box
                  key={`action-log-${i}`}
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 1.5,
                        flexWrap: 'wrap'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          size='small'
                          label={actionTypeLabel}
                          sx={getChipSx(
                            getReadableStatusTone(
                              actionColor === 'success'
                                ? 'completed'
                                : actionColor === 'error'
                                  ? 'rejected'
                                  : actionColor === 'warning'
                                    ? 'in progress'
                                    : actionColor === 'info'
                                      ? 'skipped'
                                      : 'pending'
                            ),
                            { height: 22, fontSize: '0.68rem', fontWeight: 700 }
                          )}
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
        open={selectionFormDialogOpen}
        rowData={data}
        mode={selectionFormMode}
        onClose={() => setSelectionFormDialogOpen(false)}
        onSaved={() => {
          setSelectionFormSavedInSession(true)
          onEmailSent(data)
        }}
      />
      <ActionRequiredDetailDialog
        open={actionRequiredDialogOpen}
        detail={selectedActionRequired}
        onClose={() => setActionRequiredDialogOpen(false)}
      />

      {/* Edit Vendor Modal (reuse from find-vendor — full Vendor Info + Contacts + Products editing) */}
      <EditVendorModal
        open={editVendorOpen}
        onClose={() => setEditVendorOpen(false)}
        vendorId={data.VENDORS_ID || null}
        rowData={editVendorDetailQuery.data}
        loading={editVendorDetailQuery.isFetching && !editVendorDetailQuery.data}
        errorMessage={editVendorDetailQuery.error?.message}
        updateRequest={FindVendorServices.updateComprehensive}
        fetchVendorTypes={fetchVendorTypes}
        fetchCountries={fetchCountries}
        fetchProductGroups={fetchProductGroups}
        onSuccess={() => {
          void editVendorDetailQuery.refetch()
          ToastMessageSuccess({ title: 'Edit Vendor', message: 'Vendor updated successfully' })
          setEditVendorOpen(false)
          onEmailSent()
        }}
      />

      <EditRequestDialog
        open={editDialogOpen}
        data={data}
        onClose={() => setEditDialogOpen(false)}
        onSuccess={() => onEmailSent()}
      />
    </Box>
  )
}

export default DetailPanel
