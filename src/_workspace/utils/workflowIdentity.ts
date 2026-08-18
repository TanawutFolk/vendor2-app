import type { StatusMasterOption } from '@/_workspace/types/StatusMasterTypes'

export const WORKFLOW_STEP_MASTER_KEY = {
  REQUEST_SUBMITTED: 'REQUEST_SUBMITTED',
  PIC_REVIEW: 'PIC_REVIEW',
  PO_PIC_IN_PROGRESS: 'PO_PIC_IN_PROGRESS',
  VENDOR_DISAGREED: 'VENDOR_DISAGREED',
  ISSUE_GPR_B: 'ISSUE_GPR_B',
  ISSUE_GPR_C: 'ISSUE_GPR_C',
  DOC_CHECK: 'DOC_CHECK',
  PO_MGR_APPROVAL: 'PO_MGR_APPROVAL',
  PO_GM_APPROVAL: 'PO_GM_APPROVAL',
  MD_APPROVAL: 'MD_APPROVAL',
  ACCOUNT_REGISTERED: 'ACCOUNT_REGISTERED'
} as const

export const APPROVAL_STEP_STATUS_MASTER_KEY = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SKIPPED: 'SKIPPED'
} as const

export const REQUEST_STATE_MASTER_KEY = {
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED'
} as const

export type WorkflowStepMasterKey = keyof typeof WORKFLOW_STEP_MASTER_KEY
export type ApprovalStepStatusMasterKey = keyof typeof APPROVAL_STEP_STATUS_MASTER_KEY

export type WorkflowStepMasterIds = Record<WorkflowStepMasterKey, number | null>
export type WorkflowStepTypeIds = Record<WorkflowStepMasterKey, number | null>
export type ApprovalStepStatusMasterIds = Record<ApprovalStepStatusMasterKey, number | null>
export type RequestStateMasterIds = Record<keyof typeof REQUEST_STATE_MASTER_KEY, number | null>

const toPositiveId = (value: unknown): number | null => {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

const normalizeCode = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toUpperCase()

const buildIdMap = <TKey extends string>(
  keys: Record<TKey, string>,
  resolveId: (code: string) => number | null
): Record<TKey, number | null> =>
  Object.keys(keys).reduce(
    (result, key) => {
      const typedKey = key as TKey
      result[typedKey] = resolveId(keys[typedKey])
      return result
    },
    {} as Record<TKey, number | null>
  )

export const buildWorkflowStepMasterIds = (
  options: Array<{ WORKFLOW_STEP_MASTER_ID?: number; STEP_CODE?: string }> = []
): WorkflowStepMasterIds =>
  buildIdMap(WORKFLOW_STEP_MASTER_KEY, code => {
    const matched = options.find(option => normalizeCode(option.STEP_CODE) === code)
    return toPositiveId(matched?.WORKFLOW_STEP_MASTER_ID)
  })

export const buildWorkflowStepTypeIds = (
  options: Array<{ WORKFLOW_STEP_TYPE_ID?: number; STEP_CODE?: string }> = []
): WorkflowStepTypeIds =>
  buildIdMap(WORKFLOW_STEP_MASTER_KEY, code => {
    const matched = options.find(option => normalizeCode(option.STEP_CODE) === code)
    return toPositiveId(matched?.WORKFLOW_STEP_TYPE_ID)
  })

export const buildApprovalStepStatusMasterIds = (options: StatusMasterOption[] = []): ApprovalStepStatusMasterIds =>
  buildIdMap(APPROVAL_STEP_STATUS_MASTER_KEY, code => {
    const matched = options.find(option => normalizeCode(option.STATUS_CODE) === code)
    return toPositiveId(matched?.STATUS_ID)
  })

export const buildRequestStateMasterIds = (options: StatusMasterOption[] = []): RequestStateMasterIds =>
  buildIdMap(REQUEST_STATE_MASTER_KEY, code => {
    const matched = options.find(option => normalizeCode(option.STATUS_CODE) === code)
    return toPositiveId(matched?.STATUS_ID)
  })

export const getWorkflowStepMasterId = (step: any): number | null =>
  toPositiveId(step?.WORKFLOW_STEP_MASTER_ID ?? step?.workflow_step_master_id ?? step?.workflow_step_id)

export const getWorkflowStepTypeId = (step: any): number | null =>
  toPositiveId(step?.WORKFLOW_STEP_TYPE_ID ?? step?.workflow_step_type_id)

export const getApprovalStepStatusMasterId = (step: any): number | null =>
  toPositiveId(step?.M_APPROVAL_STEP_STATUS_ID ?? step?.m_approval_step_status_id ?? step?.step_status_id)

export const isWorkflowStepMaster = (step: any, workflowStepMasterId: number | null | undefined) => {
  const stepId = getWorkflowStepMasterId(step)
  const expectedId = toPositiveId(workflowStepMasterId)
  return stepId !== null && expectedId !== null && stepId === expectedId
}

export const isWorkflowStepType = (step: any, workflowStepTypeId: number | null | undefined) => {
  const stepTypeId = getWorkflowStepTypeId(step)
  const expectedId = toPositiveId(workflowStepTypeId)
  return stepTypeId !== null && expectedId !== null && stepTypeId === expectedId
}

export const isApprovalStepStatusMaster = (step: any, approvalStepStatusId: number | null | undefined) => {
  const statusId = getApprovalStepStatusMasterId(step)
  const expectedId = toPositiveId(approvalStepStatusId)
  return statusId !== null && expectedId !== null && statusId === expectedId
}
