import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import ProcessServices from '@/_workspace/services/process/ProcessServices'
import type { ProcessI } from '@/_workspace/types/process/Process'
import AxiosResponseI from '@/libs/axios/ResultDataResponseI/ResultDataResponseI'
import { ReturnApiSearchProcessI } from '@/app/[lang]/(_workspace)/process/ProcessTableData'

export const PREFIX_QUERY_KEY = 'PROCESS'

const useSearch = (params: ReturnApiSearchProcessI, isFetchData: boolean) => {
  return useQuery<AxiosResponseI<ProcessI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => ProcessServices.search(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })
}

const create = (dataItem: any) => {
  const data = ProcessServices.create(dataItem)
  return data
}

const useCreate = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: create,
    onSuccess,
    onError
  })
}

const update = (dataItem: any) => {
  const data = ProcessServices.update(dataItem)

  return data
}

const useUpdate = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: update,
    onSuccess,
    onError
  })
}

const Delete = (dataItem: any) => {
  const data = ProcessServices.Delete(dataItem)

  return data
}

const useDelete = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: Delete,
    onSuccess,
    onError
  })
}

export { useSearch, useCreate, useUpdate, useDelete }
