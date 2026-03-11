import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import type { AxiosResponse } from 'axios'

import RegisterRequestServices, { RegisterRequestResponseI } from '@_workspace/services/_register-request/RegisterRequestServices'

export const PREFIX_QUERY_KEY = 'REQUEST_HISTORY'

export const useSearchRequestHistory = (params: any, enabled: boolean = true) => {
    return useQuery<AxiosResponse<RegisterRequestResponseI<any[]>>, Error>({
        queryKey: [PREFIX_QUERY_KEY, params],
        queryFn: () => RegisterRequestServices.getAll(params),
        placeholderData: keepPreviousData,
        enabled: enabled
    })
}

// Optional: If we need a mutation to trigger a refresh or invalidate queries later
// export const useUpdateStatus = (onSuccess?: any, onError?: any) => {
//     return useMutation({
//         mutationFn: RegisterRequestServices.updateStatus,
//         onSuccess,
//         onError
//     })
// }
