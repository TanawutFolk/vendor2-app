import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import ClearTimeService from '@/_workspace/services/_ClearTimeSystem/ClearTimeProcessForSctServices'
import type { ClearTimeForSctTypeI } from '@/_workspace/types/_ClearTimeSystem/ClearTimeForSctType'
import AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'

export const PREFIX_QUERY_KEY = 'CLEAR_TIME_FOR_SCT'

const useSearch = (params: any, isFetchData: boolean) => {
  return useQuery<AxiosResponseI<ClearTimeForSctTypeI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => ClearTimeService.search(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })
}

const create = (dataItem: any) => {
  const data = ClearTimeService.create(dataItem)
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
  const data = ClearTimeService.update(dataItem)

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
  const data = ClearTimeService.Delete(dataItem)

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
