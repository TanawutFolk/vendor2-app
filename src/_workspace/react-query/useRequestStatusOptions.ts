import { useQuery } from '@tanstack/react-query'
import { StatusOption } from '../services/_register-request/RegisterRequestServices'
import ApprovalQueueServices from '../services/_approval-queue/ApprovalQueueServices'

export const PREFIX_QUERY_KEY = 'REQUEST_STATUS_OPTIONS'

/**
 * Fetches active status options from m_request_status via the API.
 * Data is stable (rarely changes), so cache is held for 10 minutes.
 */
const useRequestStatusOptions = () =>
    useQuery<StatusOption[], Error>({
        queryKey: [PREFIX_QUERY_KEY],
        queryFn: async () => {
            const res = await ApprovalQueueServices.getStatusOptions()
            return res.data.ResultOnDb ?? []
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
    })

export default useRequestStatusOptions
