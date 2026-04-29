import { useMutation } from '@tanstack/react-query'
import { AxiosError, type AxiosProgressEvent } from 'axios'
import BlacklistServices from '@_workspace/services/_black-list/BlacklistServices'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import type { UploadBlacklistImportPayload } from '@_workspace/pages/_black-list/types'

export const useUploadBlacklist = (onSuccessCallback?: () => void) => {
    return useMutation({
        mutationFn: async ({ payload, onProgress }: { payload: UploadBlacklistImportPayload, onProgress: (event: AxiosProgressEvent) => void }) => {
            const importFn = payload.format === 'US'
                ? BlacklistServices.importFileUS
                : BlacklistServices.importFileCN

            const response = await importFn(payload.formData, onProgress)
            if (!response.data?.Status) {
                throw new Error(response.data?.Message || 'Blacklist update failed')
            }
            return response.data
        },
        onSuccess: (data) => {
            ToastMessageSuccess({
                title: 'Blacklist',
                message: data?.Message || 'Blacklist updated successfully',
            })
            onSuccessCallback?.()
        },
        onError: (error: unknown) => {
            const errorMessage = error instanceof AxiosError
                ? (error.response?.data as { Message?: string } | undefined)?.Message || error.message
                : error instanceof Error
                    ? error.message
                    : 'Blacklist update failed'

            ToastMessageError({
                title: 'Blacklist',
                message: errorMessage,
            })
        }
    })
}
