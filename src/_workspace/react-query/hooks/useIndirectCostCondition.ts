import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import IndirectCostConditionServices from '@/_workspace/services/cost-condition/IndirectCostConditionServices'

import type { IndirectCostConditionI } from '@/_workspace/types/cost-condition/IndirectCostCondition'
import AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'

import { ReturnApiSearchIndirectCostConditionI } from '@/app/[lang]/(_workspace)/cost-condition/indirect-cost-condition/IndirectCostConditionTableData'

export const PREFIX_QUERY_KEY = 'INDIRECT_COST_CONDITION'

const useSearch = (params: ReturnApiSearchIndirectCostConditionI, isFetchData: boolean) => {
  return useQuery<AxiosResponseI<IndirectCostConditionI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => IndirectCostConditionServices.search(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })
}

const create = (dataItem: any) => {
  const data = IndirectCostConditionServices.create(dataItem)
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
