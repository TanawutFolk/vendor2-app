import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import OrderTypeServices from '@/_workspace/services/production-control/OrderTypeServices'
import AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import { OrderTypeI } from '@/_workspace/types/production-control/OrderType'

export const PREFIX_QUERY_KEY = 'ORDER_TYPE'

const useSearch = (params: any, isFetchData: boolean) => {
  return useQuery<AxiosResponseI<OrderTypeI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => OrderTypeServices.search(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })
}
const useCreate = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: (dataItem: any) => OrderTypeServices.create(dataItem),
    onSuccess,
    onError
  })
}

const useUpdate = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: (dataItem: any) => OrderTypeServices.update(dataItem),
    onSuccess,
    onError
  })
}

const useDelete = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: (dataItem: any) => OrderTypeServices.delete(dataItem),
    onSuccess,
    onError
  })
}
export { useSearch, useCreate, useDelete, useUpdate }
