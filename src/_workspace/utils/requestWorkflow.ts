import type {
  ApprovalStepStatusMasterIds,
  WorkflowStepMasterIds
} from '@/_workspace/utils/workflowIdentity'
import {
  isApprovalStepStatusMaster,
  isWorkflowStepMaster
} from '@/_workspace/utils/workflowIdentity'

export const VENDOR_CODE_PREFIX = {
  LOCAL: '20030',
  OVERSEA: '20031'
} as const

export const getVendorCodePrefix = (vendorRegion: unknown) => {
  const normalizedVendorRegion = normalizeText(vendorRegion)

  if (normalizedVendorRegion === 'oversea') return VENDOR_CODE_PREFIX.OVERSEA
  if (normalizedVendorRegion === 'local') return VENDOR_CODE_PREFIX.LOCAL
  return ''
}

export const isVendorCodeComplete = (vendorCode: unknown, vendorRegion: unknown) => {
  const normalizedVendorCode = String(vendorCode || '')
    .trim()
    .toUpperCase()
  const expectedPrefix = getVendorCodePrefix(vendorRegion)

  return Boolean(
    expectedPrefix &&
      normalizedVendorCode.startsWith(expectedPrefix) &&
      normalizedVendorCode.length > expectedPrefix.length &&
      /^[A-Z0-9]+$/.test(normalizedVendorCode)
  )
}

export const getAllowedWorkflowTransitionId = (allowedActionsValue: unknown, actionCode: unknown): number | null => {
  let allowedActions: any[] = []
  if (Array.isArray(allowedActionsValue)) allowedActions = allowedActionsValue
  else if (typeof allowedActionsValue === 'string') {
    try {
      const parsed = JSON.parse(allowedActionsValue)
      if (Array.isArray(parsed)) allowedActions = parsed
    } catch {
      return null
    }
  }

  const normalizedActionCode = String(actionCode || '').trim().toUpperCase()
  const matched = allowedActions.find(
    action => String(action?.ACTION_CODE || '').trim().toUpperCase() === normalizedActionCode
  )
  const transitionId = Number(matched?.WORKFLOW_TRANSITION_ID)
  return Number.isInteger(transitionId) && transitionId > 0 ? transitionId : null
}

export const ASSIGNEE_GROUPS = [
  { label: 'Local PO PIC', value: 'LOCAL_PO_PIC' },
  { label: 'Oversea PO PIC', value: 'OVERSEA_PO_PIC' },
  { label: 'PO Checker (Main)', value: 'PO_CHECKER_MAIN' },
  { label: 'MD', value: 'MD' },
  { label: 'PO Manager', value: 'PO_MGR' },
  { label: 'PO GM', value: 'PO_GM' },
  { label: 'Account Local Main', value: 'ACC_LOCAL_MAIN' },
  { label: 'Account Oversea Main', value: 'ACC_OVERSEA_MAIN' },
  { label: 'EMR Checker', value: 'EMR_CHECKER' },
  { label: 'EMR Approver', value: 'EMR_APPROVER' },
  { label: 'QMS Checker', value: 'QMS_CHECKER' },
  { label: 'QMS Approver', value: 'QMS_APPROVER' }
] as const

export const ASSIGNEE_GROUP_LABEL_MAP = ASSIGNEE_GROUPS.reduce<Record<string, string>>((acc, item) => {
  acc[item.value] = item.label
  return acc
}, {})

const normalizeText = (value: any) =>
  String(value || '')
    .trim()
    .toLowerCase()

export const normalizeWorkflowText = (value: any) => normalizeText(String(value || '').replace(/[_-]+/g, ' '))

export const isPicStep = (step: any) =>
  String(step?.ACTOR_TYPE ?? step?.actor_type ?? '')
    .trim()
    .toUpperCase() === 'PIC'

export const isAccountStep = (step: any) =>
  String(step?.ACTOR_TYPE ?? step?.actor_type ?? '')
    .trim()
    .toUpperCase() === 'ACCOUNT'

export const isPoPicInProgressStep = (step: any, ids: WorkflowStepMasterIds) =>
  isWorkflowStepMaster(step, ids.PO_PIC_IN_PROGRESS)

export const isIssueGprBStep = (step: any, ids: WorkflowStepMasterIds) =>
  isWorkflowStepMaster(step, ids.ISSUE_GPR_B)

export const isIssueGprCStep = (step: any, ids: WorkflowStepMasterIds) =>
  isWorkflowStepMaster(step, ids.ISSUE_GPR_C)

export const isVendorDisagreedStep = (step: any, ids: WorkflowStepMasterIds) =>
  isWorkflowStepMaster(step, ids.VENDOR_DISAGREED)

export const isDisagreedBranchStep = (step: any, ids: WorkflowStepMasterIds) =>
  isVendorDisagreedStep(step, ids) || isIssueGprBStep(step, ids) || isIssueGprCStep(step, ids)

export const isApprovedStepStatus = (step: any, ids: ApprovalStepStatusMasterIds) =>
  isApprovalStepStatusMaster(step, ids.APPROVED)

export const isDocumentCheckApproved = (
  approvalSteps: any[] = [],
  workflowIds: WorkflowStepMasterIds,
  statusIds: ApprovalStepStatusMasterIds
) =>
  approvalSteps.some(
    (step: any) => isWorkflowStepMaster(step, workflowIds.DOC_CHECK) && isApprovedStepStatus(step, statusIds)
  )

export const getNextPendingMainApprovalStep = (
  approvalSteps: any[],
  currentStep: any,
  workflowIds: WorkflowStepMasterIds,
  statusIds: ApprovalStepStatusMasterIds
) => {
  if (!currentStep) return null

  return (
    (approvalSteps || [])
      .filter(
        (step: any) =>
          isApprovalStepStatusMaster(step, statusIds.PENDING) &&
          Number(step?.STEP_ORDER || 0) > Number(currentStep?.STEP_ORDER || 0) &&
          !isDisagreedBranchStep(step, workflowIds)
      )
      .sort((a: any, b: any) => Number(a?.STEP_ORDER || 0) - Number(b?.STEP_ORDER || 0))[0] || null
  )
}

export const resolveActionRequiredStage = (step: any) => {
  const source = normalizeWorkflowText(step?.DESCRIPTION || step?.label)
  if (source.includes('engineer')) return 'engineer'
  if (source.includes('emr')) return 'emr'
  if (source.includes('qms')) return 'qms'
  if (source.includes('pm manager') || source.includes('manager approval')) return 'pm_manager'
  return ''
}

export const getActionRequiredStageLabel = (step: any) => {
  switch (resolveActionRequiredStage(step)) {
    case 'engineer':
      return 'Engineer Judgement'
    case 'emr':
      return 'EMR Judgement'
    case 'qms':
      return 'QMS Judgement'
    case 'pm_manager':
      return 'PM Manager Approval'
    default:
      return 'Action Required'
  }
}

export const getApproveActionLabel = (
  currentStep: any,
  hasVendorRequested: boolean,
  workflowIds: WorkflowStepMasterIds
) => {
  if (!currentStep) return 'Approve'

  if (isPicStep(currentStep)) {
    if (!hasVendorRequested) return 'Approve and Send Email To Vendor'
    if (isPoPicInProgressStep(currentStep, workflowIds)) return 'Approve and Send to Doc Checker'
    if (isIssueGprBStep(currentStep, workflowIds)) return 'Send GPR C to Requester Approval'
    if (isIssueGprCStep(currentStep, workflowIds)) return 'Approve GPR C'
    return 'Approve'
  }

  if (isPoPicInProgressStep(currentStep, workflowIds)) return 'Confirm Agreement'
  if (isIssueGprBStep(currentStep, workflowIds)) return 'Send GPR C to Requester Approval'
  if (isIssueGprCStep(currentStep, workflowIds)) return 'Approve GPR C'

  return 'Approve'
}

export const getRejectActionLabel = (currentStep: any, workflowIds: WorkflowStepMasterIds) => {
  if (!currentStep) return 'Reject'
  if (isWorkflowStepMaster(currentStep, workflowIds.DOC_CHECK)) return 'Return to PO PIC'
  if (isIssueGprBStep(currentStep, workflowIds)) return 'Reject'
  if (isPoPicInProgressStep(currentStep, workflowIds) || isIssueGprCStep(currentStep, workflowIds)) {
    return 'Vendor Disagreed'
  }
  return 'Reject'
}
// ทำทำไม โฟค 22/04/2026
export const getGprStageLabel = (
  currentStep: any,
  hasVendorRequested: boolean,
  workflowIds: WorkflowStepMasterIds
) => {
  if (!currentStep) return 'Supplier / Outsourcing Selection Sheet'
  if (isIssueGprBStep(currentStep, workflowIds)) return 'Supplier / Outsourcing Selection Sheet'
  if (isIssueGprCStep(currentStep, workflowIds)) return 'Supplier / Outsourcing Selection Sheet'
  if (isPoPicInProgressStep(currentStep, workflowIds) && hasVendorRequested) return 'PO PIC In Progress'
  return 'Supplier / Outsourcing Selection Sheet'
}

export interface ParsedActionRequiredRemark {
  isActionRequired: boolean
  owner: string
  ownerEmail: string
  dueDate: string
  note: string
  actor: string
  stage: string
  capturedAt: string
  rawRemark: string
}

export const parseActionRequiredRemark = (remark: any): ParsedActionRequiredRemark => {
  const rawRemark = String(remark || '').trim()
  if (!rawRemark.toLowerCase().startsWith('action required |')) {
    return {
      isActionRequired: false,
      owner: '',
      ownerEmail: '',
      dueDate: '',
      note: '',
      actor: '',
      stage: '',
      capturedAt: '',
      rawRemark
    }
  }

  const payloadRaw = rawRemark.split('|').slice(1).join('|').trim()
  try {
    const payload = JSON.parse(payloadRaw)
    return {
      isActionRequired: true,
      owner: String(payload?.owner || ''),
      ownerEmail: String(payload?.owner_email || ''),
      dueDate: String(payload?.due_date || ''),
      note: String(payload?.note || ''),
      actor: String(payload?.actor || ''),
      stage: String(payload?.stage || ''),
      capturedAt: String(payload?.captured_at || ''),
      rawRemark
    }
  } catch {
    return {
      isActionRequired: true,
      owner: '',
      ownerEmail: '',
      dueDate: '',
      note: '',
      actor: '',
      stage: '',
      capturedAt: '',
      rawRemark
    }
  }
}

const toTitleCase = (value: string) =>
  value
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

export const formatActionTypeLabel = (value: unknown) => {
  const action = String(value || '')
    .trim()
    .toLowerCase()

  switch (action) {
    case 'approved':
      return 'Approved'
    case 'rejected':
      return 'Rejected'
    case 'returned_to_pic':
      return 'Returned to PO PIC'
    case 'returned_to_document_check':
      return 'Returned to Document Check'
    case 'vendor_requested':
      return 'Sent to Vendor'
    case 'submitted_to_requester_head':
      return 'Submitted to Requester Head'
    case 'vendor_disagreed':
      return 'Vendor Disagreed'
    case 'action_required':
      return 'Action Required'
    case 'edited':
      return 'Edited'
    case 'reassigned_pic':
      return 'Reassigned PIC'
    default:
      return toTitleCase(action.replace(/[_-]+/g, ' ')) || 'Updated'
  }
}

export const getActionTypeColor = (value: unknown): 'success' | 'error' | 'warning' | 'info' | 'secondary' => {
  const action = String(value || '')
    .trim()
    .toLowerCase()

  if (action === 'approved') return 'success'
  if (action === 'rejected' || action === 'vendor_disagreed') return 'error'
  if (action === 'action_required' || action === 'returned_to_pic' || action === 'returned_to_document_check') {
    return 'warning'
  }
  if (action === 'vendor_requested' || action === 'submitted_to_requester_head' || action === 'reassigned_pic')
    return 'info'
  return 'secondary'
}

export const buildActionLogPresentation = (log: any, approvalSteps: any[] = []) => {
  const parsedRemark = parseActionRequiredRemark(log?.DESCRIPTION)
  const actionType = parsedRemark.isActionRequired ? 'action_required' : log?.ACTION_TYPE
  const detailParts = [
    parsedRemark.owner ? `owner: ${parsedRemark.owner}` : '',
    parsedRemark.dueDate ? `due: ${parsedRemark.dueDate}` : '',
    parsedRemark.note ? `note: ${parsedRemark.note}` : ''
  ].filter(Boolean)
  const actorName = String(log?.ACTION_BY_NAME || '').trim()
  const actorCode = String(log?.ACTION_BY || '').trim()
  const matchedStep = approvalSteps.find(
    (step: any) => String(step?.REQUEST_APPROVAL_STEP_ID) === String(log?.REQUEST_APPROVAL_STEP_ID)
  )

  return {
    parsedRemark,
    actionTypeLabel: formatActionTypeLabel(actionType),
    actionColor: getActionTypeColor(actionType),
    detailText: detailParts.length > 0 ? detailParts.join(' | ') : parsedRemark.rawRemark || '',
    actorLabel: actorName ? `${actorName}${actorCode ? ` (${actorCode})` : ''}` : actorCode || '-',
    stepDescription: String(matchedStep?.DESCRIPTION || '').trim()
  }
}
