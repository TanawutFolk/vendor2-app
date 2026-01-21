import { keepPreviousData, useQuery } from '@tanstack/react-query'

import FindVendorServices from '@_workspace/services/_find-vendor/FindVendorServices'
import type { FindVendorSearchRequestI, FindVendorApiResponseI, VendorResultI } from '@_workspace/types/_find-vendor/FindVendorTypes'
import type { AxiosResponse } from 'axios'

export const PREFIX_QUERY_KEY = 'FIND_VENDOR'

const useSearch = (params: FindVendorSearchRequestI, isFetchData: boolean) => {
    return useQuery<AxiosResponse<FindVendorApiResponseI<VendorResultI[]>>, Error>({
        queryKey: [PREFIX_QUERY_KEY, params],
        queryFn: () => FindVendorServices.search(params),
        placeholderData: keepPreviousData,
        enabled: isFetchData
    })
}

export { useSearch }
