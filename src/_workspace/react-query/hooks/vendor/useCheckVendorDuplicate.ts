import { useMutation } from '@tanstack/react-query'

import AddVendorServices from '@_workspace/services/_add-vendor/AddVendorServices'
import type { CheckDuplicateRequestI, CheckDuplicateResponseI } from '@_workspace/types/_add-vendor/AddVendorTypes'
import { ToastMessageError } from '@/components/ToastMessage'

const checkDuplicate = async (dataItem: CheckDuplicateRequestI): Promise<CheckDuplicateResponseI> => {
    const response = await AddVendorServices.checkDuplicate(dataItem)
    return response.data
}

const useCheckDuplicate = (onSuccess: any, onError: any) => {
    return useMutation({
        mutationFn: checkDuplicate,
        onSuccess,
        onError: (error: any) => {
            ToastMessageError({ message: error?.message || 'Verification failed' })
            onError?.(error)
        }
    })
}

export { useCheckDuplicate }
