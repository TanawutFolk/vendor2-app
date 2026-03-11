import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import AssigneesServices from '../services/_task-manager/AssigneesServices'

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
            queryClient.invalidateQueries({ queryKey: ['assignees'] })
        },
        onError: (error: any) => {
            ToastMessageError({ message: error?.response?.data?.Message || error.message || 'Failed to save assignee' })
        }
    })
}

export const useDeleteAssignee = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id: number) => {
            const res = await AssigneesServices.delete(id)
            return res.data
        },
        onSuccess: (resData) => {
            if (resData.Status) {
                ToastMessageSuccess({ message: resData.Message || 'Deleted successfully' })
            }
            queryClient.invalidateQueries({ queryKey: ['assignees'] })
        },
        onError: (error: any) => {
            ToastMessageError({ message: error?.response?.data?.Message || error.message || 'Failed to delete assignee' })
        }
    })
}
