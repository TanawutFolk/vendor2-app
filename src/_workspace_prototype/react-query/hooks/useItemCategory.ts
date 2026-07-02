import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import ItemCategoryServices from '@/_workspace/services/item-master/ItemCategoryServices'
import type { ItemCategoryI } from '@/_workspace/types/item-master/ItemCategory'
import AxiosResponseI from '@/libs/axios/types/ResultDataResponseI'
import { ReturnApiSearchItemCategoryI } from '@/app/[lang]/(_workspace)/item-master/item-category/ItemCategoryTableData'

export const PREFIX_QUERY_KEY = 'ITEM_CATEGORY'

const useSearch = (params: ReturnApiSearchItemCategoryI, isFetchData: boolean) => {
  return useQuery<AxiosResponseI<ItemCategoryI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => ItemCategoryServices.search(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })
}

const create = (dataItem: any) => {
  const data = ItemCategoryServices.create(dataItem)
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
  const data = ItemCategoryServices.update(dataItem)

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
  const data = ItemCategoryServices.Delete(dataItem)

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
