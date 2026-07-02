import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import CustomerOrderFromServices from '@/_workspace/services/customer/CustomerOrderFromServices'
import type { CustomerOrderFromInterface } from '@/_workspace/types/customer/CustomerOrderFrom'
import AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'

export const PREFIX_QUERY_KEY = 'CUSTOMER_ORDER_FROM'

const useSearchCustomerOrderFrom = (params: string, isFetchData: boolean) =>
  useQuery<AxiosResponseI<CustomerOrderFromInterface>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => CustomerOrderFromServices.search(params),
    placeholderData: keepPreviousData, //useful for paginated queries by keeping data from previous pages on screen while fetching the next page
    //staleTime: 0, //don't refetch previously viewed pages until cache is more than 30 seconds old
    enabled: isFetchData
  })

const create = (dataItem: any) => {
  const data = CustomerOrderFromServices.create(dataItem)

  return data
}

const useCreateCustomerOrderFrom = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: create,
    onSuccess,
    onError
  })
}

const update = (dataItem: any) => {
  const data = CustomerOrderFromServices.update(dataItem)

  return data
}

const useUpdateCustomerOrderFrom = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: update,
    onSuccess,
    onError
  })
}
const deleteCustomerOrderFrom = (dataItem: any) => {
  const data = CustomerOrderFromServices.delete(dataItem)

  return data
}

const useDeleteCustomerOrderFrom = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: deleteCustomerOrderFrom,
    onSuccess,
    onError
  })
}

export {
  useSearchCustomerOrderFrom,
  useCreateCustomerOrderFrom,
  useUpdateCustomerOrderFrom,
  useDeleteCustomerOrderFrom
}
