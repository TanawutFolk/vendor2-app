import { useMutation } from '@tanstack/react-query'
import { AxiosError, type AxiosProgressEvent, type AxiosResponse } from 'axios'
import BlacklistServices from '@_workspace/services/_black-list/BlacklistServices'
import type { BlacklistResponseI, BlacklistSearchRequestI } from '@_workspace/services/_black-list/BlacklistServices'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import type { BlacklistRow, UploadBlacklistImportPayload } from '@_workspace/pages/_black-list/types'

export const PREFIX_QUERY_KEY = 'BLACKLIST'

export const getBlacklistQueryOptions = (params: BlacklistSearchRequestI) => ({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: (): Promise<AxiosResponse<BlacklistResponseI<BlacklistRow[]>>> =>
        BlacklistServices.search(params) as Promise<AxiosResponse<BlacklistResponseI<BlacklistRow[]>>>,
    staleTime: 0,
})

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
