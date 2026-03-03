// --- Vendor Types (master_vendor_types) ---
export interface VendorTypeI {
    vendor_type_id: number
    name: string
}

// --- Product Groups (master_product_groups) ---
export interface ProductGroupI {
    product_group_id: number
    group_name: string
}

// --- Vendor Contacts (vendor_contacts) ---
export interface VendorContactI {
    vendor_contact_id?: number
    vendor_id?: number
    contact_name: string
    tel_phone?: string
    email?: string
    position?: string
}

// --- Vendor Products (vendor_products) ---
export interface VendorProductI {
    vendor_product_id?: number
    vendor_id?: number
    product_group_id: number
    maker_name: string
    product_name: string
    model_list?: string
}

// --- Main Vendor (vendors) - email removed ---
export interface VendorI {
    vendor_id?: number
    company_name: string
    province: string
    postal_code: string
    vendor_type_id: number
    vendor_region?: 'Local' | 'Oversea'
    website?: string
    tel_center?: string
    address?: string
    emailmain?: string
    note?: string
    fft_vendor_code?: string
    fft_status?: 'Active' | 'Inactive'
    last_sync_date?: string
    DESCRIPTION?: string
    CREATE_BY: string
    UPDATE_BY?: string
    CREATE_DATE?: string
    UPDATE_DATE?: string
    INUSE?: number
}

// --- Create Vendor Request (email removed) ---
export interface CreateVendorRequestI {
    company_name: string
    province: string
    postal_code: string
    vendor_type_id: number
    vendor_region?: 'Local' | 'Oversea'
    website?: string
    tel_center?: string
    address?: string
    emailmain?: string
    note?: string
    CREATE_BY: string
    contacts: VendorContactI[]
    products: VendorProductI[]
}

// --- Check Duplicate Request (email removed, uses province + postal_code) ---
export interface CheckDuplicateRequestI {
    company_name: string
    province: string
    postal_code: string
}

// --- Check Duplicate Response ---
export interface CheckDuplicateResponseI {
    Status: boolean
    isDuplicate: boolean
    existingVendorId: number | null
    Message: string
}

// --- Create Vendor Response ---
export interface CreateVendorResponseI {
    Status: boolean
    Message: string
    ResultOnDb: any
    MethodOnDb: string
    TotalCountOnDb: number
    vendorId?: number
}

// --- API Response wrapper ---
export interface AddVendorApiResponseI<T> {
    Status: boolean
    ResultOnDb: T
    TotalCountOnDb: number
    MethodOnDb: string
    Message: string
}

// --- Create Product Group Request ---
export interface CreateProductGroupRequestI {
    group_name: string
    CREATE_BY: string
}

