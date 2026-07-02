import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import MakerServices from '@/_workspace/services/item-master/MakerServices'
import type { MakerI } from '@/_workspace/types/item-master/Maker'
import AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import { ReturnApiSearchMakerI } from '@/app/[lang]/(_workspace)/item-master/maker/MakerTableData'

export const PREFIX_QUERY_KEY = 'SHAPE'

const useSearch = (params: ReturnApiSearchMakerI, isFetchData: boolean) => {
  return useQuery<AxiosResponseI<MakerI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => MakerServices.search(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })
}

const create = (dataItem: any) => {
  const data = MakerServices.create(dataItem)
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
  const data = MakerServices.update(dataItem)

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
  const data = MakerServices.Delete(dataItem)

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
