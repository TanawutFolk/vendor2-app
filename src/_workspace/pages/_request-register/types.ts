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

export interface RegistrationRequest {
    request_id: number
    vendor_id: number
    status: RequestStatus
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
}
