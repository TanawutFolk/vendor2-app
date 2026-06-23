import type { AuditFields } from '@_workspace/types/AuditFields'

export type RegisterStatus = string

export interface RegisterStep {
    step: number
    title: string
    description: string
    status: RegisterStatus
    updatedBy?: string
    updatedDate?: string
    remark?: string
    // Branching support
    isBranch?: boolean          // true = this node is a branch (sub-step of rejection path)
    branchLabel?: string        // e.g. "Disagreed Case" to label the branch line
    branchChildren?: RegisterStep[]  // sub-steps inside rejection branch
}

export interface ApprovalStepRecord extends AuditFields {
    REQUEST_APPROVAL_STEP_ID: number
    WORKFLOW_STEP_MASTER_ID?: number
    M_REQUEST_STATUS_ID?: number
    STEP_ORDER: number
    APPROVER_EMPCODE: string
    STEP_STATUS: string
    DESCRIPTION: string
    STEP_CODE?: string
    master_status_value?: string
    master_status_label?: string
}

export interface ApprovalLogRecord extends AuditFields {
    REQUEST_APPROVAL_LOG_ID: number
    REQUEST_APPROVAL_STEP_ID: number
    ACTION_BY: string
    ACTION_TYPE: string
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
    request_state?: 'in_progress' | 'completed' | 'rejected' | 'cancelled'
    current_status_id?: number | null
    current_step_id?: number | null
    steps: RegisterStep[]
    approval_steps: ApprovalStepRecord[]
    approval_logs: ApprovalLogRecord[]
}
