import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import type AxiosResponseI from '@/libs/axios/types/ResultDataResponseI'
import CustomerShipToServices from '@/_workspace/services/customer/CustomerShipToServices'
import type { CustomerShipToInterface } from '@/_workspace/types/customer/CustomerShipTo'

export const PREFIX_QUERY_KEY = 'CUSTOMER_SHIP_TO'

const useSearchCustomerShipTo = (params: string, isFetchData: boolean) =>
  useQuery<AxiosResponseI<CustomerShipToInterface>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => CustomerShipToServices.search(params),
    placeholderData: keepPreviousData, //useful for paginated queries by keeping data from previous pages on screen while fetching the next page
    //staleTime: 0, //don't refetch previously viewed pages until cache is more than 30 seconds old
    enabled: isFetchData
  })

const create = (dataItem: any) => {
  const data = CustomerShipToServices.create(dataItem)

  return data
}

const useCreateCustomerShipTo = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: create,
    onSuccess,
    onError
  })
}

const update = (dataItem: any) => {
  const data = CustomerShipToServices.update(dataItem)

  return data
}

const useUpdateCustomerShipTo = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: update,
    onSuccess,
    onError
  })
}
const deleteCustomerShipTo = (dataItem: any) => {
  const data = CustomerShipToServices.delete(dataItem)

  return data
}

const useDeleteCustomerShipTo = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: deleteCustomerShipTo,
    onSuccess,
    onError
  })
}

export { useSearchCustomerShipTo, useCreateCustomerShipTo, useUpdateCustomerShipTo, useDeleteCustomerShipTo }
