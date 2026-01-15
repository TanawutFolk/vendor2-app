import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import SubProcessServices from '@/_workspace/services/SubProcessServices'
import type { SubProcessI } from '@/_workspace/types/SubProcess'
import AxiosResponseI from '@/libs/axios/types/ResultDataResponseI'

export const PREFIX_QUERY_KEY = 'SUB_PROCESS'

const useSearchSubProcess = (params: string, isFetchData: boolean) =>
  useQuery<AxiosResponseI<SubProcessI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => SubProcessServices.SearchSubProcess(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })

const create = (dataItem: any) => {
  const data = SubProcessServices.createSubProcess(dataItem)

  return data
}

const useCreateSubProcess = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: create,
    onSuccess,
    onError
  })
}

const update = (dataItem: any) => {
  const data = SubProcessServices.updateSubProcess(dataItem)

  return data
}

const useUpdateSubProcess = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: update,
    onSuccess,
    onError
  })
}

const deleteSubProcess = (dataItem: any) => {
  const data = SubProcessServices.deleteSubProcess(dataItem)

  return data
}

const useDeleteSubProcess = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: deleteSubProcess,
    onSuccess,
    onError
  })
}

export { useSearchSubProcess, useCreateSubProcess, useUpdateSubProcess, useDeleteSubProcess }
