import { useMutation } from '@tanstack/react-query'

import AddVendorServices from '@_workspace/services/_add-vendor/AddVendorServices'
import type { CreateVendorRequestI } from '@_workspace/types/_add-vendor/AddVendorTypes'

const create = (dataItem: CreateVendorRequestI) => {
    const data = AddVendorServices.create(dataItem)
    return data
}

const useCreate = (onSuccess: any, onError: any) => {
    return useMutation({
        mutationFn: create,
        onSuccess,
        onError
    })
}

export { useCreate }
