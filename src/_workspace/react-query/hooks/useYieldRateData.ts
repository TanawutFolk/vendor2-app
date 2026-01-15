import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import YieldRateServices from '@/_workspace/services/yield-rate/YieldRateService'
import type { YieldRateTypeI } from '@/_workspace/types/yield-rate/YieldRateType'
import AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'

export const PREFIX_QUERY_KEY = 'YIELD_RATE'

const useSearch = (params: any, isFetchData: boolean) => {
  return useQuery<AxiosResponseI<YieldRateTypeI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => YieldRateServices.search(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })
}

const create = (dataItem: any) => {
  const data = YieldRateServices.create(dataItem)
  return data
}

const useCreate = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: create,
    onSuccess,
    onError
  })
}

const update = (dataItem: any) => {
  const data = YieldRateServices.update(dataItem)

  return data
}

const useUpdate = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: update,
    onSuccess,
    onError
  })
}

const Delete = (dataItem: any) => {
  const data = YieldRateServices.Delete(dataItem)

  return data
}

const useDelete = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: Delete,
    onSuccess,
    onError
  })
}

const createYieldRateExport = (dataItem: any) => {
  const data = YieldRateServices.createYieldRateExport(dataItem).then(function (response: any) {
    const url = URL.createObjectURL(
      new Blob([response.data], {
        type: response.headers['content-type']
      })
    )

    const filename = response.headers['cache-control']

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
  })

  return data
}

const useCreateYieldRateExport = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: createYieldRateExport,
    onSuccess,
    onError
  })
}

const createYieldRateImport = (dataItem: any) => {
  const data = YieldRateServices.createYieldRateImport(dataItem)
  return data
}

const useCreateYieldRateImport = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: createYieldRateImport,
    onSuccess,
    onError
  })
}

export { useSearch, useCreate, useUpdate, useDelete, useCreateYieldRateExport, useCreateYieldRateImport }
