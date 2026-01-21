import { useMutation, useQueryClient } from '@tanstack/react-query'

import AddVendorServices from '@_workspace/services/_add-vendor/AddVendorServices'
import type { CreateProductGroupRequestI } from '@_workspace/types/_add-vendor/AddVendorTypes'
import { PREFIX_QUERY_KEY } from './useAddVendorMasterData'

const createProductGroup = (dataItem: CreateProductGroupRequestI) => {
    const data = AddVendorServices.createProductGroup(dataItem)
    return data
}

const useCreate = (onSuccess: any, onError: any) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createProductGroup,
        onSuccess: (data: any) => {
            // Invalidate product groups query to refresh the dropdown
            queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
            onSuccess?.(data)
        },
        onError: (error: any) => {
            onError?.(error)
        }
    })
}

export { useCreate }
