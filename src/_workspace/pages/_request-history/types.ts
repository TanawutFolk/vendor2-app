export type RegisterStatus = 'completed' | 'in_progress' | 'pending' | 'rejected'

export interface RegisterStep {
    step: number
    title: string
    description: string
    status: RegisterStatus
    updatedBy?: string
    updatedDate?: string
    remark?: string
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
