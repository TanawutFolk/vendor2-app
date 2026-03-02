export type RegisterStatus = 'completed' | 'in_progress' | 'pending' | 'rejected' | 'skipped'

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

export interface VendorRegisterHistory {
    vendor_id: number
    vendor_name: string
    tax_id: string
    submitted_by: string
    submitted_date: string
    overall_status: RegisterStatus
    steps: RegisterStep[]
}
