import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import SpecialCostConditionServices from '@/_workspace/services/cost-condition/SpecialCostConditionServices'

import type { SpecialCostConditionI } from '@/_workspace/types/cost-condition/SpecialCostCondition'
import AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'

import { ReturnApiSearchSpecialCostConditionI } from '@/app/[lang]/(_workspace)/cost-condition/special-cost-condition/SpecialCostTableData'

export const PREFIX_QUERY_KEY = 'SPECIAL_COST_CONDITION'

const useSearch = (params: ReturnApiSearchSpecialCostConditionI, isFetchData: boolean) => {
  return useQuery<AxiosResponseI<SpecialCostConditionI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => SpecialCostConditionServices.search(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })
}

const create = (dataItem: any) => {
  const data = SpecialCostConditionServices.create(dataItem)
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
