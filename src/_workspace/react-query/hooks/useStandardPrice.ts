import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import StandardPriceServices from '@/_workspace/services/item-manufacturing-standard-price/ItemManufacturingStandardPriceServices'

import type { StandardPriceI } from '@/_workspace/types/manufacturing-item/StandardPrice'
import AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import { ReturnApiSearchI } from '@/_workspace/pages/manufacturing-item/standard-price/StandardPriceTableData'

export const PREFIX_QUERY_KEY = 'STANDARD_PRICE'

const useSearch = (params: ReturnApiSearchI, isFetchData: boolean) => {
  return useQuery<AxiosResponseI<StandardPriceI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => StandardPriceServices.search(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })
}

const create = (dataItem: any) => {
  const data = StandardPriceServices.create(dataItem)
  return data
}

const useCreate = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: create,
    onSuccess,
    onError
  })
}

const useDelete = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: dataItem => StandardPriceServices.delete(dataItem),
    onSuccess,
    onError
  })
}

export { useSearch, useCreate, useDelete }
