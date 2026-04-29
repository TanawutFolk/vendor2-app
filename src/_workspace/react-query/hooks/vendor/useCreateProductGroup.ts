import { useMutation, useQueryClient } from '@tanstack/react-query'

import AddVendorServices from '@_workspace/services/_add-vendor/AddVendorServices'
import type { CreateProductGroupRequestI } from '@_workspace/types/_add-vendor/AddVendorTypes'
import { PREFIX_QUERY_KEY } from './useAddVendorMasterData'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'

const createProductGroup = async (dataItem: CreateProductGroupRequestI) => {
    const response = await AddVendorServices.createProductGroup(dataItem)
    return response.data
}

const useCreate = (onSuccess: any, onError: any) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createProductGroup,
        onSuccess: (data: any) => {
            // Invalidate product groups query to refresh the dropdown
            queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
            if (data?.Status === false) {
                ToastMessageError({ message: data?.Message || 'Failed to add product group' })
            } else {
                ToastMessageSuccess({ message: data?.Message || 'Product Group added successfully' })
            }
            onSuccess?.(data)
        },
        onError: (error: any) => {
            ToastMessageError({ message: error?.message || 'Failed to add product group' })
            onError?.(error)
        }
    })
}

export { useCreate }
