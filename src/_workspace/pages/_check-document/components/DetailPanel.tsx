import { useState } from 'react'
import { Box, Typography, Chip, Grid, Button } from '@mui/material'

import { DetailCard, EmptyState, ReadOnlyField, RecordCard, SectionHeader } from '@components/detail-view'

import SelectionFormDialong from '@/_workspace/pages/_request-register/modal/SelectionFormDialong'
import useWorkflowIdentity from '@/_workspace/hooks/useWorkflowIdentity'
import {
  getApproveActionLabel,
  buildActionLogPresentation,
  getRejectActionLabel,
  isIssueGprBStep,
  isIssueGprCStep,
  isPoPicInProgressStep,
  isPicStep,
  resolveActionRequiredStage,
  getActionRequiredStageLabel,
  isVendorDisagreedStep,
  isVendorCodeComplete,
  getAllowedWorkflowTransitionId
} from '@/_workspace/utils/requestWorkflow'
import { formatFftStatus } from '@/_workspace/utils/fftStatus'
import { getChipSx, getReadableStatusTone } from '@/_workspace/utils/statusChipStyles'
import type { DetailPanelProps } from '@/_workspace/types/_check-document/CheckDocumentTypes'

import { buildFileUrls, getNegotiationWorkflowState } from './shared'
import FileViewerDialog from '../modal/FileViewerDialog'
import ActionRequiredDetailDialog from '../modal/ActionRequiredDetailDialog'
import {
  isApprovalStepStatusMaster,
  isWorkflowStepMaster
} from '@/_workspace/utils/workflowIdentity'

const DetailPanel = ({
  data,
  empCode,
  queueWorkflowStepMasterId,
  showSelectionSheetReadOnly = false,
  onApprove,
  onReject,
  onRefresh,
  onDetailRefresh
}: DetailPanelProps) => {
  const [fileDialogOpen, setFileDialogOpen] = useState(false)
  const [selectionFormOpen, setSelectionFormOpen] = useState(false)
  const [actionRequiredDialogOpen, setActionRequiredDialogOpen] = useState(false)
  const [selectedActionRequired, setSelectedActionRequired] = useState<any | null>(null)
  const [selectionFormSavedInSession, setSelectionFormSavedInSession] = useState(false)
  const { workflowStepIds, approvalStepStatusIds } = useWorkflowIdentity()
  if (!data) return null

  const files = buildFileUrls(data?.DOCUMENTS, String(data?.REQUEST_NUMBER || ''))
  const approvalSteps: any[] = (() => {
    try {
      return typeof data.APPROVAL_STEPS === 'string' ? JSON.parse(data.APPROVAL_STEPS) : data.APPROVAL_STEPS || []
    } catch {
      return []
    }
  })()
    .filter(Boolean)
    .sort((a: any, b: any) => a.STEP_ORDER - b.STEP_ORDER)

  const logs: any[] = (() => {
    try {
      return typeof data.APPROVAL_LOGS === 'string' ? JSON.parse(data.APPROVAL_LOGS) : data.APPROVAL_LOGS || []
    } catch {
      return []
    }
  })().filter(Boolean)

  const currentStep = approvalSteps.find((step: any) =>
    isApprovalStepStatusMaster(step, approvalStepStatusIds.IN_PROGRESS)
  )
  const allowedActions: any[] = (() => {
    try {
      return typeof data.ALLOWED_ACTIONS === 'string' ? JSON.parse(data.ALLOWED_ACTIONS) : data.ALLOWED_ACTIONS || []
    } catch {
      return []
    }
  })().filter(Boolean)
  const isWorkflowActionAllowed = (actionCode: string) =>
    getAllowedWorkflowTransitionId(allowedActions, actionCode) !== null
  const handleReturnToDocumentCheck = () => onReject('Return to PO & SCM Check All Document', 'RETURN')

  const isCurrentPicStep = !!currentStep && isPicStep(currentStep)
  const isPicOwnedNegotiationStep =
    !!currentStep &&
    (isPoPicInProgressStep(currentStep, workflowStepIds) ||
      isIssueGprBStep(currentStep, workflowStepIds) ||
      isIssueGprCStep(currentStep, workflowStepIds) ||
      isVendorDisagreedStep(currentStep, workflowStepIds))
  const isCurrentStepMine =
    !!currentStep &&
    (currentStep.APPROVER_EMPCODE === empCode ||
      ((isCurrentPicStep || isPicOwnedNegotiationStep) && data.ASSIGN_TO === empCode))
  const isAccountRegisterQueue = queueWorkflowStepMasterId === workflowStepIds.ACCOUNT_REGISTERED
  const isCurrentStepMatchingQueue =
    !queueWorkflowStepMasterId || isWorkflowStepMaster(currentStep, queueWorkflowStepMasterId)
  const hasVendorRequested =
    !!currentStep &&
    logs.some(
      (l: any) =>
        String(l.REQUEST_APPROVAL_STEP_ID || '') === String(currentStep.REQUEST_APPROVAL_STEP_ID || '') &&
        l.ACTION_TYPE === 'vendor_requested'
    )
  const approveButtonLabel = getApproveActionLabel(currentStep, hasVendorRequested, workflowStepIds)
  const rejectButtonLabel = getRejectActionLabel(currentStep, workflowStepIds)
  const actionRequiredSetup = (() => {
    try {
      return typeof data.ACTION_REQUIRED_JSON === 'string'
        ? JSON.parse(data.ACTION_REQUIRED_JSON)
        : data.ACTION_REQUIRED_JSON || {}
    } catch {
      return {}
    }
  })()
  const actionRequiredStage = resolveActionRequiredStage(currentStep)
  const actionRequiredStageConfig = actionRequiredStage ? actionRequiredSetup?.[actionRequiredStage] || {} : null
  const showActionRequiredBtn = Boolean(isCurrentStepMine && isCurrentStepMatchingQueue && actionRequiredStage)
  const disableActionRequiredBtn = !String(actionRequiredStageConfig?.pic_email || '').trim()
  const actionRequiredLabel = actionRequiredStage
    ? `Action Required - ${getActionRequiredStageLabel(currentStep)}`
    : 'Action Required'
  const isActionable = isCurrentStepMine && isCurrentStepMatchingQueue
  const isSelectionSheetEditable = Number(data.IS_SELECTION_SHEET_EDITABLE) === 1
  const selectionFormMode = (isSelectionSheetEditable || isAccountRegisterQueue) && isActionable ? 'Edit' : 'View'
  const vendorCodeSelector = String(data?.PROPOSED_VENDOR_CODE || data?.VENDOR_CODE_SELECTOR || '').trim()
  const hasCompletedVendorCode = isVendorCodeComplete(vendorCodeSelector, data?.VENDOR_REGION)
  const hasPersistedSelectionFormData = (() => {
    if (!data.GPR_CRITERIA) return false
    try {
      const parsed = typeof data.GPR_CRITERIA === 'string' ? JSON.parse(data.GPR_CRITERIA) : data.GPR_CRITERIA
      return Array.isArray(parsed) && parsed.filter(Boolean).length > 0
    } catch {
      return false
    }
  })()
  const { isNegotiationStep, actions: negotiationActions } = getNegotiationWorkflowState(
    currentStep,
    workflowStepIds
  )
  const agreeAction = negotiationActions.find(action => action.key === 'agree')
  const disagreeAction = negotiationActions.find(action => action.key === 'disagree')
  const renderDisagreeFirst = Boolean(
    disagreeAction && !disagreeAction.label.toLowerCase().includes('vendor disagreed')
  )

  const contacts: any[] = (() => {
    try {
      return typeof data.CONTACTS === 'string' ? JSON.parse(data.CONTACTS) : data.CONTACTS || []
    } catch {
      return []
    }
  })().filter(Boolean)
  const products: any[] = (() => {
    try {
      return typeof data.PRODUCTS === 'string' ? JSON.parse(data.PRODUCTS) : data.PRODUCTS || []
    } catch {
      return []
    }
  })().filter(Boolean)
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
    return { label: 'Waiting', icon: 'tabler-clock', tone: { bg: '#EDEDED', color: '#667085', border: '#CFCFCF' } }
  }

  return (
    <Box sx={{ p: 3, overflowY: 'auto', height: '100%' }}>
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
            {data.REQUESTER_REMARK && (
              <Grid item xs={12}>
                <ReadOnlyField label='Requester Remark' value={data.REQUESTER_REMARK} multiline />
              </Grid>
            )}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: files.length > 0 ? 1.25 : 0 }}>
                <i className='tabler-paperclip' style={{ fontSize: 15, color: 'var(--mui-palette-primary-main)' }} />
                <Typography variant='body2' fontWeight={600}>
                  Attached Files
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Total Documents: {files.length}
                </Typography>
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
            </Grid>
          </Grid>
        </DetailCard>
      </Box>

      {/* Vendor Info */}
      <Box sx={{ mb: 3 }}>
        <SectionHeader icon='tabler-building-store' title='Vendor Info' />
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
                {isAccountRegisterQueue && selectionFormMode === 'Edit'
                  ? 'Enter the Vendor Code to complete registration'
                  : selectionFormMode === 'View'
                  ? 'Selection Sheet - View mode'
                  : hasPersistedSelectionFormData || selectionFormSavedInSession
                    ? 'Selection Sheet filled - click to edit'
                    : 'Fill in Selection Sheet'}
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
                    isAccountRegisterQueue && selectionFormMode === 'Edit'
                      ? 'tabler-pencil'
                      : selectionFormMode === 'View'
                      ? 'tabler-eye'
                      : hasPersistedSelectionFormData || selectionFormSavedInSession
                        ? 'tabler-pencil'
                        : 'tabler-plus'
                  }
                  style={{ fontSize: 14 }}
                />
              }
              onClick={() => setSelectionFormOpen(true)}
            >
              {isAccountRegisterQueue && selectionFormMode === 'Edit'
                ? 'Enter Vendor Code'
                : selectionFormMode === 'View'
                ? 'View Selection Sheet'
                : hasPersistedSelectionFormData || selectionFormSavedInSession
                  ? 'Edit Selection Sheet'
                  : 'Fill Selection Sheet'}
            </Button>
          </Box>
        </Box>
      )}

      {approvalSteps.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <SectionHeader icon='tabler-list-check' title={`Approval Steps (${approvalSteps.length})`} />
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
            {approvalSteps.map((s: any, i: number) => {
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
        </Box>
      )}

      {isActionable && !isAccountRegisterQueue && (
        <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
          {isNegotiationStep && agreeAction && disagreeAction && (
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
              {renderDisagreeFirst && (
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
              {!renderDisagreeFirst && (
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
          {!isNegotiationStep && (
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
              {isWorkflowActionAllowed('RETURN') && (
                <Button
                  variant='contained'
                  color='warning'
                  fullWidth
                  startIcon={<i className='tabler-arrow-back-up' style={{ fontSize: 18 }} />}
                  onClick={handleReturnToDocumentCheck}
                >
                  Return to PO &amp; SCM Check All Document
                </Button>
              )}
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

      {isActionable && isAccountRegisterQueue && (
        <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
          <Button
            variant='contained'
            color='success'
            fullWidth
            disabled={!hasCompletedVendorCode || !isWorkflowActionAllowed('APPROVE')}
            startIcon={<i className='tabler-circle-check' style={{ fontSize: 18 }} />}
            onClick={() => onApprove('APPROVE', 'Complete Registration')}
          >
            Complete Registration
          </Button>
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
      {selectionFormOpen && (
        <SelectionFormDialong
          open={selectionFormOpen}
          rowData={data}
          mode={selectionFormMode}
          onClose={() => setSelectionFormOpen(false)}
          onSaved={() => {
            setSelectionFormSavedInSession(true)
            setSelectionFormOpen(false)
            // Refresh this request's detail in place (keeps the
            // Account Register Vendor Details dialog open) rather
            // than onRefresh, which closes it after approve/reject.
            ;(onDetailRefresh || onRefresh)()
          }}
        />
      )}
      <ActionRequiredDetailDialog
        open={actionRequiredDialogOpen}
        detail={selectedActionRequired}
        onClose={() => setActionRequiredDialogOpen(false)}
      />
    </Box>
  )
}

export default DetailPanel
