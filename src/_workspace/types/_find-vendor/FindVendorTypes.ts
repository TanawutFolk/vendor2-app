// Vendor result type matching API response
export interface VendorResultI {
    vendor_id: number
    fft_vendor_code?: string | null
    fft_status?: string | null
    company_name: string
    vendor_type_id?: number
    vendor_type_name: string
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
    seller_name: string
    tel_phone: string
    email: string
    position: string
    CREATE_BY: string
    UPDATE_BY: string
    CREATE_DATE: string
    UPDATE_DATE: string
    INUSE: number
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
    seller_name?: string
    tel_phone?: string
    email?: string
    position?: string
    UPDATE_BY?: string
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
