import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import DirectCostConditionServices from '@/_workspace/services/cost-condition/DirectCostConditionServices'

import type { DirectCostConditionI } from '@/_workspace/types/cost-condition/DirectCostCondition'
import AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'

import { ReturnApiSearchDirectCostConditionI } from '@/app/[lang]/(_workspace)/cost-condition/direct-cost-condition/DirectCostConditionTableData'

export const PREFIX_QUERY_KEY = 'DIRECT_COST_CONDITION'

const useSearch = (params: ReturnApiSearchDirectCostConditionI, isFetchData: boolean) => {
  return useQuery<AxiosResponseI<DirectCostConditionI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => DirectCostConditionServices.search(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })
}

const create = (dataItem: any) => {
  const data = DirectCostConditionServices.create(dataItem)
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
