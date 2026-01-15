import { useQuery } from '@tanstack/react-query'
import FindVendorServices from '@_workspace/services/_find-vendor/FindVendorServices'
import type { FindVendorSearchRequestI, FindVendorApiResponseI, VendorResultI } from '@_workspace/types/_find-vendor/FindVendorTypes'

export const PREFIX_FIND_VENDOR_KEY = 'FIND_VENDOR'

// Hook to search vendors
export const useFindVendor = (params: FindVendorSearchRequestI, enabled: boolean = true) => {
    return useQuery<FindVendorApiResponseI<VendorResultI[]>, Error>({
        queryKey: [PREFIX_FIND_VENDOR_KEY, params],
        queryFn: async () => {
            const response = await FindVendorServices.search(params)
            return response.data
        },
        enabled
    })
}
