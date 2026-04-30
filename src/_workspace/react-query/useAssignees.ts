import { useQuery } from '@tanstack/react-query'
import type { AssigneesSearchFiltersFormData } from '../pages/_Employee-manager/validateSchema'
import AssigneesServices from '../services/_task-manager/AssigneesServices'

export const PREFIX_QUERY_KEY = 'ASSIGNEES'

export const useAssignees = (filters: AssigneesSearchFiltersFormData, isEnabled: boolean) => {
    return useQuery({
        queryKey: [PREFIX_QUERY_KEY, filters],
        queryFn: async () => {
            const res = await AssigneesServices.search(filters)
            return res.data?.ResultOnDb || []
        },
        enabled: isEnabled
    })
}
