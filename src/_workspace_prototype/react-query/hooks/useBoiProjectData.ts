import type ResultDataResponseI from '@/libs/axios/types/ResultDataResponseI'
import { BoiProjectI } from '@/_workspace/types/boi/BoiProject'
import BoiProjectServices from '@/_workspace/services/boi/BoiProjectServices'
import { useQuery, useMutation } from '@tanstack/react-query'

export const PREFIX_QUERY_KEY = 'BOI_PROJECT'

const useSearchBoiProject = (params: string, isFetchData: boolean) =>
  useQuery<ResultDataResponseI<BoiProjectI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => BoiProjectServices.search(params),
    enabled: isFetchData
    // staleTime: Infinity
  })

const create = (dataItem: any) => {
  const data = BoiProjectServices.create(dataItem)

  return data
}

const useCreateBoiProject = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: create,
    onSuccess,
    onError
  })
}

const update = (dataItem: any) => {
  const data = BoiProjectServices.update(dataItem)

  return data
}

const useUpdateBoiProject = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: update,
    onSuccess,
    onError
  })
}

const deleteBoiProject = (dataItem: any) => {
  const data = BoiProjectServices.delete(dataItem)

  return data
}

const useDeleteBoiProject = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: deleteBoiProject,
    onSuccess,
    onError
  })
}

export { useSearchBoiProject, useCreateBoiProject, useUpdateBoiProject, useDeleteBoiProject }
