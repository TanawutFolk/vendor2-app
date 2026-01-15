import { keepPreviousData, useQuery } from '@tanstack/react-query'

import AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import { YieldRateGoStraightRateTotalForSctI } from '@/_workspace/types/yield-rate/YieldRateGoStraightRateTotalForSctType'
import YieldRateGoStraightRateTotalForSctServices from '@/_workspace/services/yield-rate/YieldRateGoStraightRateTotalForSctServices'

export const PREFIX_QUERY_KEY = 'YIELD_RATE_GO_STRAIGHT_RATE_TOTAL_FOR_SCT'

const useSearch = (params: object, isFetchData: boolean) => {
  return useQuery<AxiosResponseI<YieldRateGoStraightRateTotalForSctI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => YieldRateGoStraightRateTotalForSctServices.search(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })
}

export { useSearch }
