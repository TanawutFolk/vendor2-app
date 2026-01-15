import AxiosResponseI, { AxiosResponseWithErrorI } from '@/libs/axios/types/AxiosResponseInterface'
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import ManufacturingItemGroupServices from '@/_workspace/services/manufacturing-item/ManufacturingItemGroupServices'
import { SearchResultType } from '@/app/[lang]/(_workspace)/manufacturing-item/item/SearchResult'

export const PREFIX_QUERY_KEY = 'ITEM_GROUP'

const useSearch = (params: Record<string, any>, isEnableFetching: boolean) =>
  useQuery<AxiosResponseI<SearchResultType>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => ManufacturingItemGroupServices.search(params),
    placeholderData: keepPreviousData,
    //staleTime: 30000,
    enabled: isEnableFetching
  })

const useCreate = (
  onSuccess: (onSuccess: AxiosResponseI) => void,
  onError: (onError: AxiosResponseWithErrorI) => void
) => {
  return useMutation({
    mutationFn: (newDataItem: Record<string, any>) => ManufacturingItemGroupServices.create(newDataItem),
    onSuccess,
    onError
  })
}

const useUpdate = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: (updateDataItem: Record<string, any>) => ManufacturingItemGroupServices.update(updateDataItem),
    onSuccess,
    onError
  })
}

const useDelete = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: (deleteDataItem: Record<string, any>) => ManufacturingItemGroupServices.delete(deleteDataItem),
    onSuccess,
    onError
  })
}

export { useCreate, useDelete, useSearch, useUpdate }
