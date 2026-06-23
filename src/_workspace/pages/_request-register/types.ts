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

export interface ApprovalLogItem extends AuditFields {
    REQUEST_APPROVAL_LOG_ID: number
    REQUEST_APPROVAL_STEP_ID: number
    ACTION_BY: string
    ACTION_TYPE: string
    DESCRIPTION: string
    CREATE_DATE: string
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
