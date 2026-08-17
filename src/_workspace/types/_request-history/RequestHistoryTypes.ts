import type { AuditFields } from '@/_workspace/types/AuditFields'

export type RegisterStatus = string
export type RequestStateId = number

export interface GprCProductMainI {
  PRODUCT_MAIN_ID: number
  PRODUCT_MAIN_NAME: string
  PRODUCT_MAIN_ALPHABET: string
}

export interface GprCSectionI {
  SECT_NAME: string
}

export interface RegisterStep {
  step: number
  workflowStepMasterId?: number
  title: string
  description: string
  status: RegisterStatus
  updatedBy?: string
  updatedDate?: string
  remark?: string
  isBranch?: boolean // true = this node is a branch (sub-step of rejection path)
  branchLabel?: string // e.g. "Disagreed Case" to label the branch line
  branchChildren?: RegisterStep[] // sub-steps inside rejection branch
}

export interface ApprovalStepRecord extends AuditFields {
  REQUEST_APPROVAL_STEP_ID: number
  WORKFLOW_STEP_MASTER_ID?: number
  M_REQUEST_STATUS_ID?: number
  M_APPROVAL_STEP_STATUS_ID: number
  APPROVAL_GROUP_ID?: number | null
  APPROVAL_GROUP_MEMBER_ID?: number | null
  STEP_ORDER: number
  APPROVER_EMPCODE: string
  STEP_STATUS: string
  DESCRIPTION: string
  STEP_CODE?: string
  GROUP_CODE?: string
  master_status_value?: string
  master_status_label?: string
}

export interface ApprovalLogRecord extends AuditFields {
  REQUEST_APPROVAL_LOG_ID: number
  REQUEST_APPROVAL_STEP_ID: number
  ACTION_BY: string
  ACTION_TYPE: string
  REJECT_REASON?: string | null
  RECHECK_REASON?: string | null
  DESCRIPTION: string
  CREATE_DATE: string
}

export interface VendorRegisterHistory extends Partial<AuditFields> {
  vendor_id: number
  vendor_name: string
  tax_id: string
  submitted_by: string
  submitted_date: string
  overall_status: RegisterStatus
  request_state_id?: RequestStateId
  request_state?: 'in_progress' | 'completed' | 'rejected' | 'cancelled'
  current_status_id?: number | null
  current_step_id?: number | null
  steps: RegisterStep[]
  approval_steps: ApprovalStepRecord[]
  approval_logs: ApprovalLogRecord[]
}

export interface GprCNotificationDialogProps {
  open: boolean
  rowData: any
  onClose: () => void
  onSaved?: () => void
}

export interface GprCFormState {
  gpr_c_product_checkers: GprCProductCheckerInfo[]
  gpr_c_approver_empcode: string
  gpr_c_approver_name: string
  gpr_c_approver_email: string
  gpr_c_pc_pic_empcode: string
  gpr_c_pc_pic_name: string
  gpr_c_pc_pic_email: string
  gpr_c_circular_empcodes: string[]
  gpr_c_circular_members: CircularMemberInfo[]
}

export interface GprCProductCheckerInfo {
  product_main_id: number | null
  product_main_name: string
  section_name: string
  checker_empcode: string
  checker_name: string
  checker_email: string
}

export interface CircularMemberInfo {
  empcode: string
  name: string
  email: string
}
