import { useMutation } from '@tanstack/react-query'

import AddVendorServices from '@_workspace/services/_add-vendor/AddVendorServices'
import type { CreateVendorRequestI, CreateVendorResponseI } from '@_workspace/types/_add-vendor/AddVendorTypes'

const createVendor = async (dataItem: CreateVendorRequestI): Promise<CreateVendorResponseI> => {
    const response = await AddVendorServices.create(dataItem)
    return response.data
}

export const useCreateVendor = (
    onSuccess: (data: CreateVendorResponseI) => void,
    onError: (error: Error) => void
) => {
    return useMutation({
        mutationFn: createVendor,
        onSuccess,
        onError
    })
}
