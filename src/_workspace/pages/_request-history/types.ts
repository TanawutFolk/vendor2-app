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
    step_id: number
    workflow_step_id?: number
    status_id?: number
    step_order: number
    approver_id: string
    step_status: string
    DESCRIPTION: string
    step_code?: string
    master_status_value?: string
    master_status_label?: string
}

export interface ApprovalLogRecord extends AuditFields {
    log_id: number
    step_id: number
    action_by: string
    action_type: string
    remark: string
    action_date: string
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
