import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import AxiosResponseI, { AxiosResponseWithErrorI } from '@/libs/axios/types/AxiosResponseInterface'

import ProductMainServices from '@/_workspace/services/productGroup/ProductMainServices'
import { SearchResultType } from '@/_workspace/pages/(productGroup)/product-main/SearchResult'

export const PREFIX_QUERY_KEY = 'PRODUCT_MAIN'

const useSearch = (params: Record<string, any>, isEnableFetching: boolean) =>
  useQuery<AxiosResponseI<SearchResultType>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => ProductMainServices.search(params),
    placeholderData: keepPreviousData,
    // staleTime: 30000,
    enabled: isEnableFetching
  })

const useCreate = (
  onSuccess: (onSuccess: AxiosResponseI) => void,
  onError: (onError: AxiosResponseWithErrorI) => void
) => {
  return useMutation({
    mutationFn: (newDataItem: Record<string, any>) => ProductMainServices.create(newDataItem),
    onSuccess,
    onError
  })
}

const useUpdate = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: (updateDataItem: Record<string, any>) => ProductMainServices.update(updateDataItem),
    onSuccess,
    onError
  })
}

const useDelete = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: (deleteDataItem: Record<string, any>) => ProductMainServices.delete(deleteDataItem),
    onSuccess,
    onError
  })
}

export { useSearch, useCreate, useUpdate, useDelete }
