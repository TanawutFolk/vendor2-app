import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import OtherCostConditionServices from '@/_workspace/services/cost-condition/OtherCostConditionServices'

import type { OtherCostConditionI } from '@/_workspace/types/cost-condition/OtherCostCondition'
import AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'

import { ReturnApiSearchOtherCostConditionI } from '@/app/[lang]/(_workspace)/cost-condition/other-cost-condition/OtherCostTableData'

export const PREFIX_QUERY_KEY = 'OTHER_COST_CONDITION'

const useSearch = (params: ReturnApiSearchOtherCostConditionI, isFetchData: boolean) => {
  return useQuery<AxiosResponseI<OtherCostConditionI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => OtherCostConditionServices.search(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })
}

const create = (dataItem: any) => {
  const data = OtherCostConditionServices.create(dataItem)
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
