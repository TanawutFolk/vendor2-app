import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import type { AxiosResponse } from 'axios'

import FindVendorServices from '@_workspace/services/_find-vendor/FindVendorServices'
import { EditVendorUtils } from '@_workspace/services/_find-vendor/utils/EditVendorUtils'
import type {
    FindVendorSearchRequestI,
    FindVendorApiResponseI,
    VendorResultI,
    VendorComprehensiveI,
    UpdateVendorParamsI
} from '@_workspace/types/_find-vendor/FindVendorTypes'

export const PREFIX_QUERY_KEY = 'FIND_VENDOR'

export const useSearch = (params: FindVendorSearchRequestI) => {
    return useQuery<AxiosResponse<FindVendorApiResponseI<VendorResultI[]>>, Error>({
        queryKey: [PREFIX_QUERY_KEY, params],
        queryFn: () => FindVendorServices.search(params),
        placeholderData: keepPreviousData,
        enabled: true
    })
}

export const useGetVendor = (vendorId: number | null) => {
    return useQuery<
        {
            vendor: VendorResultI,
            contacts: VendorResultI[],
            products: VendorResultI[],
            comprehensive: VendorComprehensiveI
        } | null,
        Error
    >({
        queryKey: [PREFIX_QUERY_KEY, 'DETAIL', vendorId],
        queryFn: async () => {
            if (!vendorId) return null
            return await EditVendorUtils.getComprehensiveByVendorId(vendorId)
        },
        enabled: !!vendorId,
        retry: 1
    })
}

const updateVendorBatch = async (dataItem: UpdateVendorParamsI) => {
    return EditVendorUtils.updateComprehensive(dataItem)
}

export const useUpdateVendor = (onSuccess?: any, onError?: any) => {
    return useMutation({
        mutationFn: updateVendorBatch,
        onSuccess,
        onError
    })
}
