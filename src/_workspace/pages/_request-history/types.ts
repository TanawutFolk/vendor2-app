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
    branchLabel?: string        // e.g. "ไม่ตกลง" to label the branch line
    branchChildren?: RegisterStep[]  // sub-steps inside rejection branch
}

export interface ApprovalStepRecord {
    step_id: number
    step_order: number
    approver_id: string
    step_status: string
    DESCRIPTION: string
    CREATE_DATE: string
    UPDATE_BY: string
    UPDATE_DATE: string
}

export interface ApprovalLogRecord {
    log_id: number
    step_id: number
    action_by: string
    action_type: string
    remark: string
    action_date: string
}

export interface VendorRegisterHistory {
    vendor_id: number
    vendor_name: string
    tax_id: string
    submitted_by: string
    submitted_date: string
    overall_status: RegisterStatus
    steps: RegisterStep[]
    approval_steps: ApprovalStepRecord[]
    approval_logs: ApprovalLogRecord[]
}
