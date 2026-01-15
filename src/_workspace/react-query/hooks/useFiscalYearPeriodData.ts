import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import FiscalYearPeriodServices from '@/_workspace/services/sct/FiscalYearPeriodServices'
import AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import { FiscalYearPeriodI } from '@/_workspace/types/sct/FiscalYearPeriodType'

export const PREFIX_QUERY_KEY = 'FISCAL_YEAR_PERIOD'

const useSearch = (params: any, isFetchData: boolean) => {
  return useQuery<AxiosResponseI<FiscalYearPeriodI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => FiscalYearPeriodServices.search(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })
}
const useCreate = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: (dataItem: any) => FiscalYearPeriodServices.create(dataItem),
    onSuccess,
    onError
  })
}

const useUpdate = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: (dataItem: any) => FiscalYearPeriodServices.update(dataItem),
    onSuccess,
    onError
  })
}

const useDelete = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: (dataItem: any) => FiscalYearPeriodServices.delete(dataItem),
    onSuccess,
    onError
  })
}
export { useSearch, useCreate, useDelete, useUpdate }
