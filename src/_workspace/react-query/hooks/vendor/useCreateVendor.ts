import { useMutation } from '@tanstack/react-query'

import AddVendorServices from '@_workspace/services/_add-vendor/AddVendorServices'
import type { CreateVendorRequestI } from '@_workspace/types/_add-vendor/AddVendorTypes'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'

const create = (dataItem: CreateVendorRequestI) => {
    const data = AddVendorServices.create(dataItem)
    return data
}

const useCreate = (onSuccess: any, onError: any) => {
    return useMutation({
        mutationFn: create,
        onSuccess: (response: any) => {
            const result = response.data || response
            if (result.Status) {
                ToastMessageSuccess({ message: 'Vendor added successfully' })
            }
            onSuccess?.(response)
        },
        onError: (error: any) => {
            ToastMessageError({ message: error?.message || 'Failed to create vendor' })
            onError?.(error)
        }
    })
}

export { useCreate }
