import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import ImportFeeServices from '@/_workspace/services/cost-condition/ImportFeeServices'

import type { ImportFeeI } from '@/_workspace/types/cost-condition/ImportFee'
import AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'

import { ReturnApiSearchI } from '@/app/[lang]/(_workspace)/cost-condition/import-fee/ImportFeeTableData'

export const PREFIX_QUERY_KEY = 'IMPORT_FEE'

const useSearch = (params: ReturnApiSearchI, isFetchData: boolean) => {
  return useQuery<AxiosResponseI<ImportFeeI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => ImportFeeServices.search(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })
}

const create = (dataItem: any) => {
  const data = ImportFeeServices.create(dataItem)
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
