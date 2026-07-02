import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import type { AxiosResponse } from 'axios'

import FindVendorServices from '@_workspace/services/_find-vendor/FindVendorServices'
import { EditVendorUtils } from '@_workspace/services/_find-vendor/utils/EditVendorUtils'
import type {
    FindVendorSearchRequestI,
    FindVendorApiResponseI,
    VendorResultI,
    VendorComprehensiveI,
    UpdateVendorParamsI,
    VendorContactI,
    VendorProductI
} from '@_workspace/types/_find-vendor/FindVendorTypes'

export const PREFIX_QUERY_KEY = 'FIND_VENDOR'

export const useSearch = (params: FindVendorSearchRequestI, enabled: boolean = true) => {
    return useQuery<AxiosResponse<FindVendorApiResponseI<VendorResultI[]>>, Error>({
        queryKey: [PREFIX_QUERY_KEY, params],
        queryFn: () => FindVendorServices.search({
            SEARCHFILTERS: params.SearchFilters,
            COLUMNFILTERS: params.ColumnFilters,
            ORDER: params.Order,
            START: params.Start,
            LIMIT: params.Limit
        }),
        placeholderData: keepPreviousData,
        enabled: enabled
    })
}

export const getVendorDetailQueryConfig = (vendorId: number | null) => ({
    queryKey: [PREFIX_QUERY_KEY, 'DETAIL', vendorId],
    queryFn: async () => {
        if (!vendorId) return null
        return await EditVendorUtils.getComprehensiveByVendorId(vendorId)
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
})

export const useGetVendor = (vendorId: number | null, enabled?: boolean) => {
    return useQuery<
        {
            vendor: VendorResultI,
            contacts: VendorContactI[],
            products: VendorProductI[],
            comprehensive: VendorComprehensiveI
        } | null,
        Error
    >({
        ...getVendorDetailQueryConfig(vendorId),
        enabled: enabled !== undefined ? enabled : !!vendorId,
    })
}

const updateVendorBatch = async (dataItem: UpdateVendorParamsI) => {
    return EditVendorUtils.updateComprehensive(dataItem)
}

// Thin wrapper (prototype pattern): the caller owns toast via onSuccess / onError.
export const useUpdateVendor = (onSuccess?: any, onError?: any) => {
    return useMutation({
        mutationFn: updateVendorBatch,
        onSuccess,
        onError
    })
}
