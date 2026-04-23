import { useQuery } from '@tanstack/react-query'
import type { AssigneesFormData } from '../pages/_Employee-manager/validateSchema'
import AssigneesServices from '../services/_task-manager/AssigneesServices'

export const QUERY_KEY_PREFIX = 'ASSIGNEES'
export const PREFIX_QUERY_KEY = QUERY_KEY_PREFIX

export const useAssignees = (filters: AssigneesFormData, isEnabled: boolean) => {
    return useQuery({
        queryKey: [PREFIX_QUERY_KEY, filters],
        queryFn: async () => {
            const res = await AssigneesServices.search(filters)
            return res.data?.ResultOnDb || []
        },
        enabled: isEnabled
    })
}
