// Vendor result type matching API response
export interface VendorResultI {
    vendor_id: number
    company_name: string
    vendor_type_name: string
    province: string
    postal_code: string
    website: string
    address: string
    tel_center: string
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

// Search request interface
export interface FindVendorSearchRequestI {
    company_name?: string
    vendor_type_id?: number | null
    province?: string
    status?: number | string
    Start?: number
    Limit?: number
}

// API Response interface
export interface FindVendorApiResponseI<T> {
    Status: boolean
    ResultOnDb: T
    TotalCountOnDb: number
    MethodOnDb: string
    Message: string
}
