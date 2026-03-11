import { useQuery } from '@tanstack/react-query'
import type { AssigneesFormData } from '../pages/_task-manager/validateSchema'
import AssigneesServices from '../services/_task-manager/AssigneesServices'

export const useAssignees = (filters: AssigneesFormData, isEnabled: boolean) => {
    return useQuery({
        queryKey: ['assignees', filters],
        queryFn: async () => {
            const res = await AssigneesServices.search(filters)
            return res.data?.ResultOnDb || []
        },
        enabled: isEnabled
    })
}
