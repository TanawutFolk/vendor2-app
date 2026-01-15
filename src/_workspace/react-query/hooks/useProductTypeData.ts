import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import ProductTypeServices from '@/_workspace/services/productGroup/ProductTypeServices'
import type { ProductTypeI } from '@/_workspace/types/productGroup/ProductType'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'

export const PREFIX_QUERY_KEY = 'PRODUCT_TYPE'

// const useSearchProductType = (params: string, isFetchData: boolean) =>
//   useQuery<AxiosResponseI<ProductTypeI>, Error>({
//     queryKey: [PREFIX_QUERY_KEY, params],
//     queryFn: () => ProductTypeServices.search(params),
//     placeholderData: keepPreviousData, //useful for paginated queries by keeping data from previous pages on screen while fetching the next page
//     //staleTime: 0, //don't refetch previously viewed pages until cache is more than 30 seconds old
//     enabled: isFetchData
//   })

// const useSearchProductTypeForCopy = (isFetchData: boolean, prefixQueryKey: string = '') =>
//   useQuery<AxiosResponseI<ProductTypeI>, Error>({
//     queryKey: [prefixQueryKey ? `${prefixQueryKey}_${PREFIX_QUERY_KEY}` : PREFIX_QUERY_KEY],
//     queryFn: () => ProductTypeServices.searchForCopy(),
//     placeholderData: keepPreviousData, //useful for paginated queries by keeping data from previous pages on screen while fetching the next page
//     //staleTime: 0, //don't refetch previously viewed pages until cache is more than 30 seconds old
//     enabled: isFetchData
//   })

//----------------------------------------------------------------------------------------
const useSearch = (params: object, isEnableFetching: boolean, subParams: string = '') =>
  useQuery<AxiosResponseI<ProductTypeI>, Error>({
    queryKey: [subParams ? `${subParams}_${PREFIX_QUERY_KEY}` : PREFIX_QUERY_KEY, params],
    queryFn: () => ProductTypeServices.search(params),
    placeholderData: keepPreviousData,
    // staleTime: 30000,
    enabled: isEnableFetching
  })

const useSearchProductType = (params: object, isEnableFetching: boolean, subParams: string = '') =>
  useQuery<AxiosResponseI<ProductTypeI>, Error>({
    queryKey: [subParams ? `${subParams}_${PREFIX_QUERY_KEY}` : PREFIX_QUERY_KEY, params],
    queryFn: () => ProductTypeServices.searchProductType(params),
    placeholderData: keepPreviousData,
    //staleTime: 30000,
    enabled: isEnableFetching
  })
// const useSearchProductTypeForEdit = (isFetchData: boolean, subParams: string = '') =>
//   useQuery<AxiosResponseI<ProductTypeI>, Error>({
//     queryKey: [subParams ? `${subParams}_${PREFIX_QUERY_KEY}` : PREFIX_QUERY_KEY],
//     queryFn: () => ProductTypeServices.searchForEdit(),
//     placeholderData: keepPreviousData, //useful for paginated queries by keeping data from previous pages on screen while fetching the next page
//     //staleTime: 0, //don't refetch previously viewed pages until cache is more than 30 seconds old
//     enabled: isFetchData
//   })

const create = (dataItem: any) => {
  const data = ProductTypeServices.create(dataItem)

  return data
}

const useCreateProductType = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: create,
    onSuccess,
    onError
  })
}

const createProductType = (dataItem: any) => {
  const data = ProductTypeServices.createProductType(dataItem)
  return data
}

const useCreateProductTypeNew = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: createProductType,
    onSuccess,
    onError
  })
}

const updateProductType = (dataItem: any) => {
  const data = ProductTypeServices.updateProductType(dataItem)
  return data
}

const useUpdateProductType = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: updateProductType,
    onSuccess,
    onError
  })
}

const usedDeleteProductTypeAndItem = (dataItem: any) => {
  const data = ProductTypeServices.deleteProductTypeAndItem(dataItem)
  return data
}
const useDeleteProductTypeAndItem = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: usedDeleteProductTypeAndItem,
    onSuccess,
    onError
  })
}

const useSearchProductTypeList = (params: object, isFetchData: boolean) =>
  useQuery<AxiosResponseI<ProductTypeI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => ProductTypeServices.searchProductTypeList(params),
    placeholderData: keepPreviousData, //useful for paginated queries by keeping data from previous pages on screen while fetching the next page
    //staleTime: 0, //don't refetch previously viewed pages until cache is more than 30 seconds old
    enabled: isFetchData
  })

const useSearchProductTypeByProductGroup = (params: object, isFetchData: boolean) =>
  useQuery<AxiosResponseI<ProductTypeI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => ProductTypeServices.getProductTypeByProductGroup(params),
    placeholderData: keepPreviousData, //useful for paginated queries by keeping data from previous pages on screen while fetching the next page
    //staleTime: 0, //don't refetch previously viewed pages until cache is more than 30 seconds old
    enabled: isFetchData
  })

const useSearchByProductGroup = (params: object, isFetchData: boolean) =>
  useQuery<AxiosResponseI<ProductTypeI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => ProductTypeServices.getByProductGroup(params),
    placeholderData: keepPreviousData, //useful for paginated queries by keeping data from previous pages on screen while fetching the next page
    //staleTime: 0, //don't refetch previously viewed pages until cache is more than 30 seconds old
    enabled: isFetchData
  })

const useSearchProductTypeByProductMainID = (params: object, isFetchData: boolean) =>
  useQuery<AxiosResponseI<ProductTypeI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => ProductTypeServices.getProductTypeByProductMainID(params),
    placeholderData: keepPreviousData, //useful for paginated queries by keeping data from previous pages on screen while fetching the next page
    //staleTime: 0, //don't refetch previously viewed pages until cache is more than 30 seconds old
    enabled: isFetchData
  })

export {
  useSearch,
  useCreateProductType,
  useSearchByProductGroup,
  useSearchProductTypeByProductGroup,
  useSearchProductTypeList,
  useSearchProductTypeByProductMainID,
  useSearchProductType,
  useCreateProductTypeNew,
  useUpdateProductType,
  useDeleteProductTypeAndItem
}
