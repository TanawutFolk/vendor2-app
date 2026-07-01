import type { VendorComprehensiveI } from '@_workspace/types/_find-vendor/FindVendorTypes'

export type VendorRow = Partial<VendorComprehensiveI> & {
    vendor_id: number
    INUSE?: number
}

export type SortColumnState = {
    colId: string
    sort: 'asc' | 'desc' | null
}
