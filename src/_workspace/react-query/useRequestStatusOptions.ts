import { useQuery } from '@tanstack/react-query'
import RegisterRequestServices, { StatusOption } from '../services/_register-request/RegisterRequestServices'

export const QUERY_KEY_STATUS_OPTIONS = 'RequestStatusOptions'

/**
 * Fetches active status options from m_request_status via the API.
 * Data is stable (rarely changes), so cache is held for 10 minutes.
 */
const useRequestStatusOptions = () =>
    useQuery<StatusOption[], Error>({
        queryKey: [QUERY_KEY_STATUS_OPTIONS],
        queryFn: async () => {
            const res = await RegisterRequestServices.getStatusOptions()
            return res.data.ResultOnDb ?? []
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
    })

export default useRequestStatusOptions
