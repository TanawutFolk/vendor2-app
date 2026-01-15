import { useQuery } from '@tanstack/react-query'

import AddVendorServices from '@_workspace/services/_add-vendor/AddVendorServices'
import type { VendorTypeI, ProductGroupI, AddVendorApiResponseI } from '@_workspace/types/_add-vendor/AddVendorTypes'

export const PREFIX_VENDOR_TYPES_KEY = 'VENDOR_TYPES'
export const PREFIX_PRODUCT_GROUPS_KEY = 'PRODUCT_GROUPS'

// Hook to get vendor types for dropdown
export const useGetVendorTypes = (enabled: boolean = true) => {
    return useQuery<AddVendorApiResponseI<VendorTypeI[]>, Error>({
        queryKey: [PREFIX_VENDOR_TYPES_KEY],
        queryFn: async () => {
            const response = await AddVendorServices.getVendorTypes()
            return response.data
        },
        enabled
    })
}

// Hook to get product groups for dropdown
export const useGetProductGroups = (enabled: boolean = true) => {
    return useQuery<AddVendorApiResponseI<ProductGroupI[]>, Error>({
        queryKey: [PREFIX_PRODUCT_GROUPS_KEY],
        queryFn: async () => {
            const response = await AddVendorServices.getProductGroups()
            return response.data
        },
        enabled
    })
}
