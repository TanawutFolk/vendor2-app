import type { AuditFields } from '@/_workspace/types/AuditFields'

export interface ApprovalFlowResponseI<T = unknown> {
  Status: boolean
  ResultOnDb: T
  TotalCountOnDb: number
  MethodOnDb: string
  Message: string
}

export interface WorkflowDefinitionI extends Partial<AuditFields> {
  WORKFLOW_DEFINITION_ID: number
  WORKFLOW_CODE: string
  WORKFLOW_NAME: string
  VERSION_NO: number
  SOURCE_WORKFLOW_DEFINITION_ID?: number | null
  DEFINITION_STATUS: 'DRAFT' | 'PUBLISHED' | 'RETIRED'
  PUBLISHED_DATE?: string | null
  PUBLISHED_BY?: string | null
  RETIRED_DATE?: string | null
  DESCRIPTION?: string
  INUSE: number
}

export interface WorkflowStepI extends Partial<AuditFields> {
  WORKFLOW_STEP_MASTER_ID: number
  WORKFLOW_DEFINITION_ID: number
  WORKFLOW_STEP_TYPE_ID: number
  STEP_CODE: string
  STEP_NAME: string
  IS_CONFIGURABLE: number
  IS_REQUIRED: number
  M_REQUEST_STATUS_ID: number
  STATUS_LABEL: string
  ACTOR_TYPE?: string
  HANDLER_KEY?: string
  DEFAULT_STEP_ORDER: number
  IS_OPTIONAL: number
  DEFAULT_APPROVAL_GROUP_ID?: number | null
  APPROVAL_GROUP_CODE?: string | null
  APPROVAL_GROUP_NAME?: string | null
  REQUIRES_VENDOR_REPLY: number
  REQUIRES_VENDOR_CODE: number
  CAN_EDIT_SELECTION_SHEET: number
  LOCK_SELECTION_SHEET_ON_APPROVE: number
  DESCRIPTION?: string
  INUSE: number
}

export interface WorkflowTransitionI {
  WORKFLOW_TRANSITION_ID: number
  WORKFLOW_DEFINITION_ID: number
  FROM_WORKFLOW_STEP_MASTER_ID: number
  FROM_WORKFLOW_STEP_TYPE_ID: number
  FROM_STEP_CODE: string
  M_WORKFLOW_ACTION_ID: number
  ACTION_CODE: string
  ACTION_LABEL: string
  TO_WORKFLOW_STEP_MASTER_ID?: number | null
  TO_WORKFLOW_STEP_TYPE_ID?: number | null
  TO_STEP_CODE?: string | null
  M_REQUEST_STATE_ID?: number | null
  TERMINAL_STATE_CODE?: string | null
  CONDITION_KEY?: string | null
  PRIORITY_NO: number
  DESCRIPTION?: string
  INUSE: number
}

export interface ApprovalGroupI {
  APPROVAL_GROUP_ID: number
  GROUP_CODE: string
  GROUP_NAME: string
  APPROVER_NAME?: string | null
  ACTIVE_MEMBER_COUNT: number
}

export interface WorkflowStepTypeI {
  WORKFLOW_STEP_TYPE_ID: number
  STEP_CODE: string
  STEP_NAME: string
  IS_CONFIGURABLE: number
  IS_REQUIRED: number
  SORT_ORDER: number
  INUSE: number
}

export interface WorkflowCapabilityI {
  M_WORKFLOW_CAPABILITY_ID: number
  CAPABILITY_CODE: string
  CAPABILITY_NAME: string
  SORT_ORDER: number
}

export interface WorkflowBehaviorConfigI {
  WORKFLOW_BEHAVIOR_CONFIG_ID: number
  M_FORWARD_ACTION_ID: number
  M_SELECTION_EDIT_CAPABILITY_ID: number
  M_SELECTION_LOCK_CAPABILITY_ID: number
}

export interface ApprovalFlowDataI {
  DEFINITION: WorkflowDefinitionI
  DEFINITIONS: WorkflowDefinitionI[]
  BEHAVIOR_CONFIG: WorkflowBehaviorConfigI
  STEPS: WorkflowStepI[]
  TRANSITIONS: WorkflowTransitionI[]
  APPROVAL_GROUPS: ApprovalGroupI[]
  STEP_TYPES: WorkflowStepTypeI[]
  CAPABILITIES: WorkflowCapabilityI[]
}

export interface ApprovalGroupOptionI {
  value: number
  label: string
  groupCode: string
  activeMemberCount: number
}

export interface WorkflowDraftStepPayloadI {
  WORKFLOW_STEP_MASTER_ID: number
  WORKFLOW_STEP_TYPE_ID: number
  DEFAULT_STEP_ORDER: number
  DEFAULT_APPROVAL_GROUP_ID: number
  CAN_EDIT_SELECTION_SHEET: number
  LOCK_SELECTION_SHEET_ON_APPROVE: number
  INUSE: number
}
