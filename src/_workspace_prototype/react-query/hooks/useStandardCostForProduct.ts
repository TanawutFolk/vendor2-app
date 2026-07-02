import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import StandardCostForProductServices from '@/_workspace/services/sct/StandardCostForProductServices'
import type { StandardCostFormI } from '@/_workspace/types/sct/StandardCostForProductType'
import AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import { ReturnApiSearchI } from '@/_workspace/pages/sct/sct-for-product/modal/SctAddModal/SctFormModal/SctFormModalTableData'
import { StandardCostI } from '@/_workspace/types/sct/StandardCostType'

export const PREFIX_QUERY_KEY = 'STANDARD_COST_FOR_PRODUCT'

const useSearch = (params: Record<string, any>, isEnableFetching: boolean) => {
  return useQuery<AxiosResponseI<StandardCostI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => StandardCostForProductServices.search(params),
    placeholderData: keepPreviousData,
    enabled: isEnableFetching
  })
}

const useSearchProductType = (params: ReturnApiSearchI, isFetchData: boolean) => {
  return useQuery<AxiosResponseI<StandardCostI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => StandardCostForProductServices.searchProductType(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })
}

const useSearchStandardFormProductType = (params: ReturnApiSearchI, isFetchData: boolean) => {
  return useQuery<AxiosResponseI<StandardCostFormI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => StandardCostForProductServices.searchStandardFormProductType(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })
}

const createSctForm = (dataItem: any) => {
  const data = StandardCostForProductServices.createSctForm(dataItem)
  return data
}

const useCreateSctForm = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: createSctForm,
    onSuccess,
    onError
  })
}

const updateSctForm = (dataItem: any) => {
  const data = StandardCostForProductServices.updateSctForm(dataItem)
  return data
}

const useUpdateSctForm = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: updateSctForm,
    onSuccess,
    onError
  })
}

const changeSctProgress = (dataItem: any) => {
  const data = StandardCostForProductServices.changeSctProgress(dataItem)
  return data
}

const useChangeSctProgress = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: changeSctProgress,
    onSuccess,
    onError
  })
}

const updateSctData = (dataItem: any) => {
  const data = StandardCostForProductServices.updateSctData(dataItem)
  return data
}

const useUpdateSctData = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: updateSctData,
    onSuccess,
    onError
  })
}

const deleteSctForm = (dataItem: any) => {
  const data = StandardCostForProductServices.deleteSctForm(dataItem)
  return data
}

const useDeleteSctForm = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: deleteSctForm,
    onSuccess,
    onError
  })
}

const deleteSctData = (dataItem: any) => {
  const data = StandardCostForProductServices.deleteSctData(dataItem)
  return data
}

const useDeleteSctData = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: deleteSctData,
    onSuccess,
    onError
  })
}

const createSctFormMultiple = (dataItem: any) => {
  const data = StandardCostForProductServices.createSctFormMultiple(dataItem)
  return data
}

const useCreateSctFormMultiple = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: createSctFormMultiple,
    onSuccess,
    onError
  })
}

const createDraftSctFormMultiple = (dataItem: any) => {
  const data = StandardCostForProductServices.createDraftSctFormMultiple(dataItem)
  return data
}

const useCreateDraftSctFormMultiple = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: createDraftSctFormMultiple,
    onSuccess,
    onError
  })
}

const updateSctTagBudget = (dataItem: any) => {
  const data = StandardCostForProductServices.updateSctTagBudget(dataItem)
  return data
}

const useUpdateSctTagBudget = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: updateSctTagBudget,
    onSuccess,
    onError
  })
}

const reCal = (dataItem: any) => {
  const data = StandardCostForProductServices.reCal(dataItem)
  return data
}

const useReCal = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: reCal,
    onSuccess,
    onError
  })
}

const useGetAllWithWhereCondition = (
  params: Record<string, any>,
  isEnableFetching: boolean,
  prefixQueryKey: string = ''
) => {
  return useQuery<AxiosResponseI<StandardCostI>, Error>({
    queryKey: [prefixQueryKey ? `${prefixQueryKey}_${PREFIX_QUERY_KEY}` : PREFIX_QUERY_KEY, params],
    queryFn: () => StandardCostForProductServices.getAllWithWhereCondition(params),
    placeholderData: keepPreviousData,
    enabled: isEnableFetching
  })
}

const useGetAllWithWhereCondition_old_version = (
  params: Record<string, any>,
  isEnableFetching: boolean,
  prefixQueryKey: string = ''
) => {
  return useQuery<AxiosResponseI<StandardCostI>, Error>({
    queryKey: [prefixQueryKey ? `${prefixQueryKey}_${PREFIX_QUERY_KEY}` : PREFIX_QUERY_KEY, params],
    queryFn: () => StandardCostForProductServices.getAllWithWhereCondition_old_version(params),
    placeholderData: keepPreviousData,
    enabled: isEnableFetching
  })
}

const useSearchParentProductTypeBySctRevisionCode = (params: Record<string, any>, isEnableFetching: boolean) => {
  return useQuery<AxiosResponseI<StandardCostI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => StandardCostForProductServices.getParentProductTypeBySctRevisionCode(params),
    placeholderData: keepPreviousData,
    enabled: isEnableFetching
  })
}

export {
  useSearch,
  useSearchProductType,
  useSearchStandardFormProductType,
  useCreateSctForm,
  useUpdateSctForm,
  useUpdateSctData,
  useChangeSctProgress,
  useDeleteSctForm,
  useDeleteSctData,
  useCreateSctFormMultiple,
  useCreateDraftSctFormMultiple,
  useUpdateSctTagBudget,
  useReCal,
  useGetAllWithWhereCondition,
  useGetAllWithWhereCondition_old_version,
  useSearchParentProductTypeBySctRevisionCode
}
