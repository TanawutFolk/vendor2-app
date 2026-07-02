import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import CustomerInvoiceToServices from '@/_workspace/services/customer/CustomerInvoiceToServices'
import type { CustomerInvoiceToInterface } from '@/_workspace/types/customer/CustomerInvoiceTo'
import AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'

export const PREFIX_QUERY_KEY = 'CUSTOMER_INVOICE_TO'

const useSearchCustomerInvoiceTo = (params: string, isFetchData: boolean) =>
  useQuery<AxiosResponseI<CustomerInvoiceToInterface>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => CustomerInvoiceToServices.search(params),
    placeholderData: keepPreviousData, //useful for paginated queries by keeping data from previous pages on screen while fetching the next page
    //staleTime: 0, //don't refetch previously viewed pages until cache is more than 30 seconds old
    enabled: isFetchData
  })

const create = (dataItem: any) => {
  const data = CustomerInvoiceToServices.create(dataItem)

  return data
}

const useCreateCustomerInvoiceTo = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: create,
    onSuccess,
    onError
  })
}

const update = (dataItem: any) => {
  const data = CustomerInvoiceToServices.update(dataItem)

  return data
}

const useUpdateCustomerInvoiceTo = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: update,
    onSuccess,
    onError
  })
}
const deleteCustomerInvoiceTo = (dataItem: any) => {
  const data = CustomerInvoiceToServices.delete(dataItem)

  return data
}

const useDeleteCustomerInvoiceTo = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: deleteCustomerInvoiceTo,
    onSuccess,
    onError
  })
}

export {
  useSearchCustomerInvoiceTo,
  useCreateCustomerInvoiceTo,
  useUpdateCustomerInvoiceTo,
  useDeleteCustomerInvoiceTo
}
