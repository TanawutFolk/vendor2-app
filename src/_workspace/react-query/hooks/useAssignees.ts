import { useMutation } from '@tanstack/react-query'

import AssigneesServices from '@/_workspace/services/_task-manager/AssigneesServices'

const save = async (dataItem: any) => {
  const res = await AssigneesServices.save(dataItem)

  if (!res.data?.Status) {
    throw new Error(res.data?.Message || 'Failed to save assignee')
  }

  return res.data
}

const useSaveAssignee = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: save,
    onSuccess,
    onError
  })
}

export { useSaveAssignee }
