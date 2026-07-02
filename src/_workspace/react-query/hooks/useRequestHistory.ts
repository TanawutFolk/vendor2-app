import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { AxiosResponse } from 'axios'

import { RegisterRequestResponseI } from '@_workspace/services/_register-request/RegisterRequestServices'
import ApprovalQueueServices from '@_workspace/services/_approval-queue/ApprovalQueueServices'

export const PREFIX_QUERY_KEY = 'REQUEST_HISTORY'

export const useSearchRequestHistory = (params: any, enabled: boolean = true) => {
    return useQuery<AxiosResponse<RegisterRequestResponseI<any[]>>, Error>({
        queryKey: [PREFIX_QUERY_KEY, params],
        queryFn: () => ApprovalQueueServices.getAll(params),
        placeholderData: keepPreviousData,
        enabled: enabled
    })
}

