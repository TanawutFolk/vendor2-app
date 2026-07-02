import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import type AxiosResponseI from '@/libs/axios/types/ResultDataResponseI'
import ProductSubServices from '@/_workspace/services/productGroup/ProductSubServices'
import type { ProductSubI } from '@/_workspace/types/productGroup/ProductSub'

export const PREFIX_QUERY_KEY = 'PRODUCT_SUB'

const useSearchProductSub = (params: string, isFetchData: boolean) =>
  useQuery<AxiosResponseI<ProductSubI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => ProductSubServices.search(params),
    placeholderData: keepPreviousData, //useful for paginated queries by keeping data from previous pages on screen while fetching the next page
    //staleTime: 0, //don't refetch previously viewed pages until cache is more than 30 seconds old
    enabled: isFetchData
  })

const create = (dataItem: any) => {
  const data = ProductSubServices.create(dataItem)

  return data
}

const useCreateProductSub = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: create,
    onSuccess,
    onError
  })
}

const update = (dataItem: any) => {
  const data = ProductSubServices.update(dataItem)

  return data
}

const useUpdateProductSub = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: update,
    onSuccess,
    onError
  })
}
const deleteProductSub = (dataItem: any) => {
  const data = ProductSubServices.delete(dataItem)

  return data
}

const useDeleteProductSub = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: deleteProductSub,
    onSuccess,
    onError
  })
}

export { useSearchProductSub, useCreateProductSub, useUpdateProductSub, useDeleteProductSub }
