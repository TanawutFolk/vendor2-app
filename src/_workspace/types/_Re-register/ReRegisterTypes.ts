export type VendorRow = {
    VENDORS_ID?: number
    INUSE?: number
    [key: string]: unknown
}

export type SortColumnState = {
    colId: string
    sort: 'asc' | 'desc' | null
}
