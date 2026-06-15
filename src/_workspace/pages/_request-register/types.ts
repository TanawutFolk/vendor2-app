import type { AuditFields } from '@_workspace/types/AuditFields'

export type RequestStatus = 'new' | 'in_progress' | 'pending_docs' | 'approved' | 'rejected'

export interface VendorContact {
    contact_name: string
    tel_phone: string
    email: string
    position?: string
}

export interface VendorProduct {
    product_group: string
    product_main: string
    product_sub: string
    note?: string
}

export interface ApprovalStepItem extends AuditFields {
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

export interface ApprovalLogItem extends AuditFields {
    log_id: number
    step_id: number
    action_by: string
    action_type: string
    remark: string
    action_date: string
}

export interface RegistrationRequest extends Partial<AuditFields> {
    request_id: number
    vendor_id: number
    status: RequestStatus
    request_state?: 'in_progress' | 'completed' | 'rejected' | 'cancelled'
    current_status_id?: number | null
    current_step_id?: number | null
    submitted_by: string
    submitted_date: string
    support_type?: string           // For support product / process
    purchase_frequency?: string     // Purchase Frequency / Year

    // Vendor profile (from _add-vendor form)
    company_name: string
    vendor_type: string
    province: string
    postal_code: string
    tel_center: string
    website?: string
    address: string
    note?: string

    // Relations
    contacts: VendorContact[]
    products: VendorProduct[]
    approval_steps: ApprovalStepItem[]
    approval_logs: ApprovalLogItem[]
}
