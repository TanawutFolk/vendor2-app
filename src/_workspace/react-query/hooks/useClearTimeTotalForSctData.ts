import { keepPreviousData, useQuery } from '@tanstack/react-query'

import AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import ClearTimeTotalForSctServices from '@/_workspace/services/_ClearTimeSystem/ClearTimeTotalForSctServices'
import { ClearTimeTotalForSctI } from '@/_workspace/types/_ClearTimeSystem/ClearTimeTotalForSctType'

export const PREFIX_QUERY_KEY = 'CLEAR_TIME_TOTAL_FOR_SCT'

const useSearch = (params: object, isFetchData: boolean) => {
  return useQuery<AxiosResponseI<ClearTimeTotalForSctI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => ClearTimeTotalForSctServices.search(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })
}

export { useSearch }
