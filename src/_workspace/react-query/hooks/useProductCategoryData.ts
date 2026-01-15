import { ProductCategoryI } from '@/_workspace/types/productGroup/ProductCategory'
import ProductCategoryServices from '@/_workspace/services/productGroup/ProductCategoryServices'
import { useQuery, useMutation, keepPreviousData } from '@tanstack/react-query'
import AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'

export const PREFIX_QUERY_KEY = 'PRODUCT_CATEGORY'

// const useSearchProductCategory = (params: Record<string, any>, isFetchData: boolean) =>
//   useQuery<ResultDataResponseI<ProductCategoryI>, Error>({
//     queryKey: [PREFIX_QUERY_KEY, params],
//     queryFn: () => ProductCategoryServices.search(params),
//     enabled: isFetchData

//     // staleTime: Infinity
//   })

const useSearch = (params: Record<string, any>, isEnableFetching: boolean) =>
  useQuery<AxiosResponseI<ProductCategoryI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => ProductCategoryServices.search(params),
    placeholderData: keepPreviousData,
    // staleTime: 30000,
    enabled: isEnableFetching
  })

// const useSearchProductCategory = (params: Record<string, any>, isEnableFetching: boolean) =>
//   useQuery<AxiosResponseI<ProductCategoryI>, Error>({
//     queryKey: [PREFIX_QUERY_KEY, params],
//     queryFn: () => ProductCategoryServices.search(params),
//     placeholderData: keepPreviousData,
//     staleTime: 30000,
//     enabled: isEnableFetching
//   })

// const useSearchProductCategory = (params: Record<string, any>, isEnableFetching: boolean, subParams: string = '') =>
//   useQuery<AxiosResponseI<ProductCategoryI>, Error>({
//     queryKey: [subParams ? `${subParams}_${PREFIX_QUERY_KEY}` : PREFIX_QUERY_KEY, params],
//     queryFn: () => ProductCategoryServices.search(params),
//     placeholderData: keepPreviousData, //useful for paginated queries by keeping data from previous pages on screen while fetching the next page
//     //staleTime: 0, //don't refetch previously viewed pages until cache is more than 30 seconds old
//     enabled: isEnableFetching
//   })

const create = (dataItem: any) => {
  const data = ProductCategoryServices.create(dataItem)

  return data
}

const useCreateProductCategory = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: create,
    onSuccess,
    onError
  })
}

const update = (dataItem: any) => {
  const data = ProductCategoryServices.update(dataItem)

  return data
}

const useUpdateProductCategory = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: update,
    onSuccess,
    onError
  })
}

const deleteProductCategory = (dataItem: any) => {
  const data = ProductCategoryServices.delete(dataItem)

  return data
}

const useDeleteProductCategory = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: deleteProductCategory,
    onSuccess,
    onError
  })
}

export { useSearch, useCreateProductCategory, useUpdateProductCategory, useDeleteProductCategory }
