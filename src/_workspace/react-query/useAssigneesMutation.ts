import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import AssigneesServices from '../services/_task-manager/AssigneesServices'
import { PREFIX_QUERY_KEY } from './useAssignees'

export const useSaveAssignee = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: any) => {
            const res = await AssigneesServices.save(data)
            return res.data
        },
        onSuccess: (resData) => {
            if (resData.Status) {
                ToastMessageSuccess({ message: resData.Message || 'Saved successfully' })
            }
            queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
        },
        onError: (error: any) => {
            ToastMessageError({ message: error?.response?.data?.Message || error.message || 'Failed to save assignee' })
        }
    })
}
