import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'

import AddVendorServices from '@_workspace/services/_add-vendor/AddVendorServices'
import type { CheckDuplicateRequestI, CheckDuplicateResponseI } from '@_workspace/types/_add-vendor/AddVendorTypes'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'

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
        onSuccess: (data: CheckDuplicateResponseI) => {
            if (data?.Status === false) {
                ToastMessageError({ title: 'Check Vendor Duplicate', message: data?.Message || 'Verification failed' })
            } else if (data?.isDuplicate || data?.isBlacklisted) {
                ToastMessageError({
                    title: 'Check Vendor Duplicate',
                    message: data?.Message || 'Vendor verification failed'
                })
            } else {
                ToastMessageSuccess({
                    title: 'Check Vendor Duplicate',
                    message: data?.Message || 'Vendor is available for adding'
                })
            }
            onSuccess?.(data)
        },
        onError: (error: Error | AxiosError) => {
            const errorMessage = error instanceof AxiosError
                ? error.message
                : error.message

            ToastMessageError({ title: 'Check Vendor Duplicate', message: errorMessage || 'Verification failed' })
            onError?.(error instanceof Error ? error : new Error(errorMessage))
        }
    })
}

export { useCheckDuplicate }
