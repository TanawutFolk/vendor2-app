import { useMutation, useQueryClient } from '@tanstack/react-query'
import RegisterRequestServices from '@_workspace/services/_register-request/RegisterRequestServices'
import ApprovalQueueServices from '@_workspace/services/_approval-queue/ApprovalQueueServices'
import AccRegisterServices from '@_workspace/services/_Acc-register/AccRegisterServices'

export const PREFIX_QUERY_KEY = 'REQUEST_REGISTER'

export const REQUEST_DETAIL_QUERY_KEY = [PREFIX_QUERY_KEY, 'requestDetail'] as const

export const fetchRequestDetail = async (requestId: number) => {
    const response = await ApprovalQueueServices.getById({ REQUEST_REGISTER_VENDOR_ID: requestId })
    const payload = response.data
    if (!payload?.Status || !payload.ResultOnDb || typeof payload.ResultOnDb !== 'object') {
        throw new Error(payload?.Message || 'Failed to load request detail')
    }
    return payload.ResultOnDb
}

export const requestDetailQueryOptions = (requestId: number) => ({
    queryKey: [...REQUEST_DETAIL_QUERY_KEY, requestId],
    queryFn: () => fetchRequestDetail(requestId),
    staleTime: 30_000,
})

// Fetch (with react-query caching) the full detail of a request; the
// invalidate helper is used after saving a sub-form (e.g. Selection Sheet)
// so every open panel refetches in place.
export const useRequestDetailFetcher = () => {
    const queryClient = useQueryClient()

    return {
        fetchDetail: (requestId: number) => queryClient.fetchQuery(requestDetailQueryOptions(requestId)),
        invalidateDetail: (requestId?: number) =>
            queryClient.invalidateQueries({
                queryKey: requestId ? [...REQUEST_DETAIL_QUERY_KEY, requestId] : [...REQUEST_DETAIL_QUERY_KEY],
            }),
    }
}

// Thin wrappers (prototype pattern): the caller owns toast via the onSuccess /
// onError callbacks it passes in. These span a few services but all operate on
// a vendor-registration request's lifecycle.

export const useSaveGprCNotification = (onSuccess?: any, onError?: any) => {
    return useMutation({
        mutationFn: async (payload: any) => {
            const response = await RegisterRequestServices.saveGprCNotification({
                REQUEST_REGISTER_VENDOR_ID: payload.request_id,
                GPR_C_DATA: payload.gpr_c_data,
                CREATE_BY: payload.CREATE_BY,
                UPDATE_BY: payload.UPDATE_BY
            })
            if (!response.data?.Status) {
                throw new Error(response.data?.Message || 'Save failed')
            }
            return response.data
        },
        onSuccess,
        onError
    })
}

export const useSaveGprFormMutation = (onSuccess?: any, onError?: any) => {
    return useMutation({
        mutationFn: async (payload: any) => {
            const response = await RegisterRequestServices.saveGprForm({
                REQUEST_REGISTER_VENDOR_ID: payload.request_id,
                GPR_DATA: payload.gpr_data,
                CREATE_BY: payload.CREATE_BY,
                UPDATE_BY: payload.UPDATE_BY
            })
            if (!response.data?.Status) {
                throw new Error(response.data?.Message || 'Failed to save Supplier / Outsourcing Selection Sheet')
            }
            return response.data
        },
        onSuccess,
        onError
    })
}

export const useAddDocumentMutation = (onSuccess?: any, onError?: any) => {
    return useMutation({
        mutationFn: async (payload: FormData) => {
            const response = await RegisterRequestServices.addDocument(payload)
            if (!response.data.Status) {
                throw new Error(response.data.Message || 'Upload failed')
            }
            return response.data
        },
        onSuccess,
        onError
    })
}

const updateRequest = async (payload: any) => {
    const res = await RegisterRequestServices.updateRequest(payload)
    return res.data
}

export const useUpdateRequest = (onSuccess: any, onError: any) => {
    return useMutation({ mutationFn: updateRequest, onSuccess, onError })
}

const updateStatus = async (payload: any) => {
    const res = await ApprovalQueueServices.updateStatus(payload)
    return res.data
}

export const useUpdateRequestStatus = (onSuccess: any, onError: any) => {
    return useMutation({ mutationFn: updateStatus, onSuccess, onError })
}

const completeRegistration = async (payload: any) => {
    const res = await AccRegisterServices.completeRegistration(payload)
    return res.data
}

export const useCompleteRegistration = (onSuccess: any, onError: any) => {
    return useMutation({ mutationFn: completeRegistration, onSuccess, onError })
}
