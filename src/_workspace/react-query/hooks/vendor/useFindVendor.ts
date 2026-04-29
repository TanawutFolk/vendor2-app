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
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'

export const PREFIX_QUERY_KEY = 'FIND_VENDOR'

export const useSearch = (params: FindVendorSearchRequestI, enabled: boolean = true) => {
    return useQuery<AxiosResponse<FindVendorApiResponseI<VendorResultI[]>>, Error>({
        queryKey: [PREFIX_QUERY_KEY, params],
        queryFn: () => FindVendorServices.search(params),
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
            contacts: VendorResultI[],
            products: VendorResultI[],
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

export const useUpdateVendor = (onSuccess?: any, onError?: any) => {
    return useMutation({
        mutationFn: updateVendorBatch,
        onSuccess: (data: any, variables: any, context: any) => {
            if (data?.Status === false) {
                ToastMessageError({ message: data?.Message || 'Failed to update vendor' })
            } else {
                ToastMessageSuccess({ message: data?.Message || 'Vendor updated successfully' })
            }
            onSuccess?.(data, variables, context)
        },
        onError: (error: any) => {
            ToastMessageError({ message: error?.message || 'Failed to update vendor' })
            onError?.(error)
        }
    })
}
