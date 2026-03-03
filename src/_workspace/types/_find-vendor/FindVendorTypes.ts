// Vendor result type matching API response
export interface VendorResultI {
    vendor_id: number
    fft_vendor_code?: string | null
    fft_status?: string | null
    status_check?: string
    company_name: string
    vendor_type_id?: number
    vendor_type_name: string
    vendor_region?: 'Local' | 'Oversea' | null
    province: string
    postal_code: string
    website: string
    address: string
    tel_center: string
    group_name: string
    maker_name: string
    product_name: string
    model_list: string
    vendor_contact_id?: number
    vendor_product_id?: number
    product_group_id?: number
    contact_name: string
    tel_phone: string
    email: string
    position: string
    CREATE_BY: string
    UPDATE_BY: string
    CREATE_DATE: string
    UPDATE_DATE: string
    INUSE: number

    // Contact Audit
    contact_create_by?: string
    contact_update_by?: string
    contact_create_date?: string
    contact_update_date?: string

    // Product Audit
    product_create_by?: string
    product_create_date?: string
    product_update_by?: string
    product_update_date?: string
}

// Vendor update request interface
export interface VendorUpdateRequestI {
    vendor_id: number
    company_name?: string
    vendor_type_id?: number | null
    province?: string
    postal_code?: string
    website?: string
    address?: string
    tel_center?: string
    group_name?: string
    maker_name?: string
    product_name?: string
    model_list?: string
    vendor_contact_id?: number

    vendor_product_id?: number
    product_group_id?: number
    contact_name?: string
    tel_phone?: string
    email?: string
    position?: string
    UPDATE_BY?: string
    INUSE?: number
}

// Search filter item interface
export interface SearchFilterItemI {
    id: string
    value: string | number | null
}

// Order item interface
export interface OrderItemI {
    id: string
    desc: boolean
}

// Search request interface (new format with SearchFilters array)
export interface FindVendorSearchRequestI {
    SearchFilters: SearchFilterItemI[]
    ColumnFilters?: any[]
    Limit: number
    Order: OrderItemI[]
    Start: number
}

// API Response interface
export interface FindVendorApiResponseI<T> {
    Status: boolean
    ResultOnDb: T
    TotalCountOnDb: number
    MethodOnDb: string
    Message: string
}
// Dropdown item interface
export interface DropdownItemI {
    value: number | string
    label: string
}

// Dropdown Response interface
export interface DropdownResponseI {
    Status: boolean
    ResultOnDb: DropdownItemI[]
    TotalCountOnDb: number
    MethodOnDb: string
    Message: string
}

// Contact information interface
export interface VendorContactI {
    vendor_contact_id?: number
    contact_name: string
    position: string
    tel_phone: string
    email: string
    CREATE_BY?: string
    UPDATE_BY?: string
    CREATE_DATE?: string
    UPDATE_DATE?: string
}

// Product information interface  
export interface VendorProductI {
    vendor_product_id?: number
    product_group_id?: number
    group_name: string
    maker_name: string
    product_name: string
    model_list: string
    CREATE_BY?: string
    UPDATE_BY?: string
    CREATE_DATE?: string
    UPDATE_DATE?: string
}

// Comprehensive vendor data interface
export interface VendorComprehensiveI {
    vendor_id: number
    fft_vendor_code?: string | null
    fft_status?: string | null
    status_check?: string
    company_name: string
    vendor_type_id?: number
    vendor_type_name: string
    vendor_region?: 'Local' | 'Oversea' | null
    province: string
    postal_code: string
    website: string
    address: string
    tel_center: string
    emailmain?: string | null
    contacts: VendorContactI[]
    products: VendorProductI[]
    CREATE_BY: string
    UPDATE_BY: string
    CREATE_DATE: string
    UPDATE_DATE: string
    INUSE: number
}

export interface UpdateVendorParamsI {
    vendorId: number
    data: any // Using any to avoid circular dependency with Schema, or redefine needed fields
    originalData: VendorComprehensiveI
    deletedContactIds: number[]
    deletedProductIds: number[]
    userCode: string
}
