import { useMutation, useQueryClient } from '@tanstack/react-query'
import AddVendorServices from '@_workspace/services/_add-vendor/AddVendorServices'
import type { CreateProductGroupRequestI } from '@_workspace/types/_add-vendor/AddVendorTypes'
import { PREFIX_PRODUCT_GROUPS_KEY } from './useAddVendorMasterData'

export const useCreateProductGroup = (
    onSuccess?: (data: any) => void,
    onError?: (error: any) => void
) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateProductGroupRequestI) =>
            AddVendorServices.createProductGroup(data).then(res => res.data),
        onSuccess: (data) => {
            // Invalidate product groups query to refresh the dropdown
            queryClient.invalidateQueries({ queryKey: [PREFIX_PRODUCT_GROUPS_KEY] })
            onSuccess?.(data)
        },
        onError: (error) => {
            onError?.(error)
        }
    })
}
