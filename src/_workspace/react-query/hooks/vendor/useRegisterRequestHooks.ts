import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import RegisterRequestServices from '@_workspace/services/_register-request/RegisterRequestServices'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'

export const PREFIX_QUERY_KEY = 'REQUEST_REGISTER'
export const useSaveGprCNotification = (onSuccessCallback?: () => void) => {
    return useMutation({
        mutationFn: async (payload: any) => {
            const response = await RegisterRequestServices.saveGprCNotification(payload)
            if (!response.data?.Status) {
                throw new Error(response.data?.Message || 'Save failed')
            }
            return response.data
        },
        onSuccess: (data) => {
            ToastMessageSuccess({ 
                title: 'GPR C Notification',
                message: data?.Message || 'GPR C notification setup saved.' 
            })
            onSuccessCallback?.()
        },
        onError: (error: unknown) => {
            let message = 'Failed to save GPR C notification setup'
            if (error instanceof AxiosError) {
                message = (error.response?.data as any)?.Message || error.message
            } else if (error instanceof Error) {
                message = error.message
            }
            ToastMessageError({ 
                title: 'GPR C Notification',
                message: message 
            })
        }
    })
}

export const useSaveGprFormMutation = (onSuccessCallback?: () => void) => {
    return useMutation({
        mutationFn: async (payload: any) => {
            const response = await RegisterRequestServices.saveGprForm(payload)
            if (!response.data?.Status) {
                throw new Error(response.data?.Message || 'Failed to save Supplier / Outsourcing Selection Sheet')
            }
            return response.data
        },
        onSuccess: (data) => {
            ToastMessageSuccess({ 
                title: 'Save GPR Form',
                message: data?.Message || 'Supplier / Outsourcing Selection Sheet saved successfully.' 
            })
            onSuccessCallback?.()
        },
        onError: (error: unknown) => {
            let message = 'Failed to save Supplier / Outsourcing Selection Sheet'
            if (error instanceof AxiosError) {
                message = (error.response?.data as any)?.Message || error.message
            } else if (error instanceof Error) {
                message = error.message
            }
            ToastMessageError({ 
                title: 'Save GPR Form',
                message: message 
            })
        }
    })
}

export const useAddDocumentMutation = (onSuccessCallback?: (data: any) => void, onErrorCallback?: (error: any) => void) => {
    return useMutation({
        mutationFn: async (payload: FormData) => {
            const response = await RegisterRequestServices.addDocument(payload)
            if (!response.data.Status) {
                throw new Error(response.data.Message || 'Upload failed')
            }
            return response.data
        },
        onSuccess: (data) => {
            onSuccessCallback?.(data)
        },
        onError: (error: unknown) => {
            onErrorCallback?.(error)
        }
    })
}
