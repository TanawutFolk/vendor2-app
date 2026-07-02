import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import ExchangeRateServices from '@/_workspace/services/cost-condition/ExchangeRateServices'
import type { ExchangeRateI } from '@/_workspace/types/cost-condition/ExchangeRate'
import AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import { ReturnApiSearchExchangeRateI } from '@/app/[lang]/(_workspace)/cost-condition/exchange-rate/ExchangeRateTableData'

export const PREFIX_QUERY_KEY = 'EXCHANGE_RATE'

const useSearch = (params: ReturnApiSearchExchangeRateI, isFetchData: boolean) => {
  return useQuery<AxiosResponseI<ExchangeRateI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => ExchangeRateServices.search(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })
}

const create = (dataItem: any) => {
  const data = ExchangeRateServices.create(dataItem)
  return data
}

const useCreate = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: create,
    onSuccess,
    onError
  })
}

export { useSearch, useCreate }
