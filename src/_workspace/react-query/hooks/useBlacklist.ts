import { useMutation } from '@tanstack/react-query'
import { type AxiosProgressEvent, type AxiosResponse } from 'axios'
import BlacklistServices from '@_workspace/services/_black-list/BlacklistServices'
import type { BlacklistResponseI } from '@_workspace/services/_black-list/BlacklistServices'
import type { BlacklistRow, UploadBlacklistImportPayload } from '@_workspace/types/_black-list/BlacklistTypes'

export const PREFIX_QUERY_KEY = 'BLACKLIST'

export const getBlacklistQueryOptions = (params: Record<string, unknown>) => ({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: (): Promise<AxiosResponse<BlacklistResponseI<BlacklistRow[]>>> =>
        BlacklistServices.search(params) as Promise<AxiosResponse<BlacklistResponseI<BlacklistRow[]>>>,
    staleTime: 0,
})

// Thin wrapper (prototype pattern): the caller owns toast / progress via the
// onSuccess / onError callbacks it passes in.
export const useUploadBlacklist = (onSuccess?: (data: any) => void, onError?: (error: unknown) => void) => {
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
        onSuccess,
        onError
    })
}
