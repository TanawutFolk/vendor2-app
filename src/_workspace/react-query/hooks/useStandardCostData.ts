import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import StandardCostServices from '@/_workspace/services/sct/StandardCostServices'
import type { SctCodeForSelection, StandardCostI } from '@/_workspace/types/sct/StandardCostType'
import AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'

export const PREFIX_QUERY_KEY = 'STANDARD_COST'

const useSearchSct = (params: object, isFetchData: boolean) =>
  useQuery<AxiosResponseI<StandardCostI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    //queryKey: [prefixQueryKey ? `${prefixQueryKey}_${PREFIX_QUERY_KEY}` : PREFIX_QUERY_KEY, params],
    queryFn: () => StandardCostServices.searchSct(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })

const useSearchSctCodeForSelection = (params: object, isFetchData: boolean) =>
  useQuery<AxiosResponseI<StandardCostI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    //queryKey: [prefixQueryKey ? `${prefixQueryKey}_${PREFIX_QUERY_KEY}` : PREFIX_QUERY_KEY, params],
    queryFn: () => StandardCostServices.searchSctCodeForSelection(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })

const useSearchSctCodeForSelectionMaterialPrice = (params: object, isFetchData: boolean) =>
  useQuery<AxiosResponseI<SctCodeForSelection>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    //queryKey: [prefixQueryKey ? `${prefixQueryKey}_${PREFIX_QUERY_KEY}` : PREFIX_QUERY_KEY, params],
    queryFn: () => StandardCostServices.searchSctCodeForSelectionMaterialPrice(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })

const useSearchSctBySctSelectedWithCondition = (params: object, isFetchData: boolean, prefixQueryKey: string = '') =>
  useQuery<AxiosResponseI<StandardCostI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    // queryKey: [prefixQueryKey ? `${prefixQueryKey}_${PREFIX_QUERY_KEY}` : PREFIX_QUERY_KEY, params],
    queryFn: () => StandardCostServices.searchSctBySctSelectedWithCondition(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })

export {
  useSearchSct,
  useSearchSctBySctSelectedWithCondition,
  useSearchSctCodeForSelection,
  useSearchSctCodeForSelectionMaterialPrice
}
