import { useMutation, useQuery } from '@tanstack/react-query'
import type { AssigneesSearchFiltersFormData } from '../../pages/_Employee-manager/validateSchema'
import AssigneesServices from '../../services/_task-manager/AssigneesServices'

export const PREFIX_QUERY_KEY = 'ASSIGNEES'

export const useAssignees = (filters: AssigneesSearchFiltersFormData, isEnabled: boolean) => {
    return useQuery({
        queryKey: [PREFIX_QUERY_KEY, filters],
        queryFn: async () => {
            const res = await AssigneesServices.search({
                KEYWORD: filters.keyword,
                GROUP_CODE: filters.group_code?.value,
                IN_USE: filters.in_use,
            })
            if (!res.data?.Status) {
                throw new Error(res.data?.Message || 'Failed to load assignees')
            }
            return res.data?.ResultOnDb || []
        },
        enabled: isEnabled
    })
}

// Thin wrapper (prototype pattern): the caller owns toast / invalidate / close
// via the onSuccess / onError callbacks it passes in.
const save = async (data: any) => {
    const res = await AssigneesServices.save(data)
    if (!res.data?.Status) {
        throw new Error(res.data?.Message || 'Failed to save assignee')
    }
    return res.data
}

export const useSaveAssignee = (onSuccess: any, onError: any) => {
    return useMutation({
        mutationFn: save,
        onSuccess,
        onError
    })
}
