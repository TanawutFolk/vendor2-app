import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import BlacklistServices from '@_workspace/services/_black-list/BlacklistServices'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import type { UploadBlacklistPayload } from '@_workspace/pages/_black-list/types'

export const useUploadBlacklist = (onSuccessCallback?: () => void) => {
    return useMutation({
        mutationFn: async ({ payload, onProgress }: { payload: UploadBlacklistPayload, onProgress: (event: any) => void }) => {
            const user = getUserData()
            const formData = new FormData()
            formData.append('file', payload.file)
            formData.append('CREATE_BY', String(user?.EMPLOYEE_CODE || 'SYSTEM'))
            formData.append('UPDATE_BY', String(user?.EMPLOYEE_CODE || 'SYSTEM'))

            const importFn = payload.format === 'US'
                ? BlacklistServices.importFileUS
                : BlacklistServices.importFileCN

            const response = await importFn(formData, onProgress)
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
