import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import StandardCostExportServices from '@/_workspace/services/sct/StandardCostExportServices'
import type { SctCodeForSelection, StandardCostI } from '@/_workspace/types/sct/StandardCostType'
import AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'

export const PREFIX_QUERY_KEY = 'STANDARD_COST_EXPORT'

const useSearchSctExport = (params: object, isFetchData: boolean) =>
  useQuery<AxiosResponseI<StandardCostI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    //queryKey: [prefixQueryKey ? `${prefixQueryKey}_${PREFIX_QUERY_KEY}` : PREFIX_QUERY_KEY, params],
    queryFn: () => StandardCostExportServices.searchSctExport(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })

const useSearchSctCodeForSelection = (params: object, isFetchData: boolean) =>
  useQuery<AxiosResponseI<SctCodeForSelection>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    //queryKey: [prefixQueryKey ? `${prefixQueryKey}_${PREFIX_QUERY_KEY}` : PREFIX_QUERY_KEY, params],
    queryFn: () => StandardCostExportServices.searchSctCodeForSelection(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })

const useSearchSctBySctSelectedWithCondition = (params: object, isFetchData: boolean, prefixQueryKey: string = '') =>
  useQuery<AxiosResponseI<StandardCostI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    // queryKey: [prefixQueryKey ? `${prefixQueryKey}_${PREFIX_QUERY_KEY}` : PREFIX_QUERY_KEY, params],
    queryFn: () => StandardCostExportServices.searchSctBySctSelectedWithCondition(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })

const createSctExport = (dataItem: any) => {
  const data = StandardCostExportServices.createSctExport(dataItem).then(function (response) {
    const url = URL.createObjectURL(
      new Blob([response.data], {
        type: response.headers['content-type']
      })
    )

    const filename = response.headers['cache-control']

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
  })

  return data
}

const useCreateSctExport = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: createSctExport,
    onSuccess,
    onError
  })
}

const createSctFormulaExport = (dataItem: any) => {
  const data = StandardCostExportServices.createSctFormulaExport(dataItem).then(function (response) {
    const url = URL.createObjectURL(
      new Blob([response.data], {
        type: response.headers['content-type']
      })
    )

    const filename = response.headers['cache-control']

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
  })

  return data
}

const useCreateSctFormulaExport = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: createSctFormulaExport,
    onSuccess,
    onError
  })
}

export {
  useSearchSctExport,
  useSearchSctBySctSelectedWithCondition,
  useSearchSctCodeForSelection,
  useCreateSctExport,
  useCreateSctFormulaExport
}
