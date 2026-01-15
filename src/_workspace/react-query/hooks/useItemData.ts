import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import ItemServices from '@/_workspace/services/item-master/ItemServices'

import { ReturnApiSearchItemCategoryI } from '@/app/[lang]/(_workspace)/item-master/item-category/ItemCategoryTableData'
import AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import { ItemI } from '@/_workspace/types/item-master/Item'

export const PREFIX_QUERY_KEY = 'ITEM'

const useSearch = (params: ReturnApiSearchItemCategoryI, isFetchData: boolean) => {
  return useQuery<AxiosResponseI<ItemI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => ItemServices.search(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })
}

const create = (dataItem: any) => {
  const data = ItemServices.create(dataItem)
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
  const data = ItemServices.update(dataItem)

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
  const data = ItemServices.Delete(dataItem)

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
