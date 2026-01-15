import { useMutation } from '@tanstack/react-query'

import AddVendorServices from '@_workspace/services/_add-vendor/AddVendorServices'
import type { CheckDuplicateRequestI, CheckDuplicateResponseI } from '@_workspace/types/_add-vendor/AddVendorTypes'

const checkDuplicateVendor = async (dataItem: CheckDuplicateRequestI): Promise<CheckDuplicateResponseI> => {
    const response = await AddVendorServices.checkDuplicate(dataItem)
    return response.data
}

export const useCheckVendorDuplicate = (
    onSuccess: (data: CheckDuplicateResponseI) => void,
    onError: (error: Error) => void
) => {
    return useMutation({
        mutationFn: checkDuplicateVendor,
        onSuccess,
        onError
    })
}
