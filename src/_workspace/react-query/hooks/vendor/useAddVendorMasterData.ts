import { keepPreviousData, useQuery } from '@tanstack/react-query'

import AddVendorServices from '@_workspace/services/_add-vendor/AddVendorServices'
import type { ProductGroupI, AddVendorApiResponseI } from '@_workspace/types/_add-vendor/AddVendorTypes'
import type { AxiosResponse } from 'axios'

export const PREFIX_QUERY_KEY = 'PRODUCT_GROUPS'

// Hook to get product groups for dropdown
const useGetProductGroups = (isFetchData: boolean = true) => {
    return useQuery<AxiosResponse<AddVendorApiResponseI<ProductGroupI[]>>, Error>({
        queryKey: [PREFIX_QUERY_KEY],
        queryFn: () => AddVendorServices.getProductGroups(),
        placeholderData: keepPreviousData,
        enabled: isFetchData
    })
}

export { useGetProductGroups }
