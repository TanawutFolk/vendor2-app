import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import ColorServices from '@/_workspace/services/item-master/item-property/ColorServices'
import type { ColorI } from '@/_workspace/types/item-master/item-property/Color'
import AxiosResponseI from '@/libs/axios/types/ResultDataResponseI'
import { ReturnApiSearchColorI } from '@/app/[lang]/(_workspace)/item-master/item-property/color/ColorTableData'

export const PREFIX_QUERY_KEY = 'COLOR'

const useSearch = (params: ReturnApiSearchColorI, isFetchData: boolean) => {
  return useQuery<AxiosResponseI<ColorI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => ColorServices.search(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })
}

const create = (dataItem: any) => {
  const data = ColorServices.create(dataItem)
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
  const data = ColorServices.update(dataItem)

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
  const data = ColorServices.Delete(dataItem)

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
