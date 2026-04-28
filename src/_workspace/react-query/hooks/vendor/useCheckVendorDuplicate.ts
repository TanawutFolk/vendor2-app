import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'

import AddVendorServices from '@_workspace/services/_add-vendor/AddVendorServices'
import type { CheckDuplicateRequestI, CheckDuplicateResponseI } from '@_workspace/types/_add-vendor/AddVendorTypes'
import { ToastMessageError } from '@/components/ToastMessage'

const checkDuplicate = async (dataItem: CheckDuplicateRequestI): Promise<CheckDuplicateResponseI> => {
    const response = await AddVendorServices.checkDuplicate(dataItem)
    return response.data
}

const useCheckDuplicate = (
    onSuccess?: (data: CheckDuplicateResponseI) => void,
    onError?: (error: Error) => void
) => {
    return useMutation({
        mutationFn: checkDuplicate,
        onSuccess,
        onError: (error: Error | AxiosError) => {
            const errorMessage = error instanceof AxiosError
                ? error.message
                : error.message

            ToastMessageError({ message: errorMessage || 'Verification failed' })
            onError?.(error instanceof Error ? error : new Error(errorMessage))
        }
    })
}

export { useCheckDuplicate }
