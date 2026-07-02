import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import YieldRateMaterialService from '@/_workspace/services/yield-accumulation-of-item-for-sct/YieldAccumulationOfItemForSctServices'
import type { YieldRateTypeI } from '@/_workspace/types/yield-rate/YieldRateType'
import AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'

export const PREFIX_QUERY_KEY = 'YIELD_RATE_MATERIAL'

const useSearch = (params: any, isFetchData: boolean) => {
  return useQuery<AxiosResponseI<YieldRateTypeI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => YieldRateMaterialService.search(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })
}

const create = (dataItem: any) => {
  const data = YieldRateMaterialService.create(dataItem)
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
  const data = YieldRateMaterialService.update(dataItem)

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
  const data = YieldRateMaterialService.Delete(dataItem)

  return data
}

const useDelete = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: Delete,
    onSuccess,
    onError
  })
}

const createYieldRateMaterialExport = (dataItem: any) => {
  const data = YieldRateMaterialService.createYieldRateMaterialExport(dataItem).then(function (response: any) {
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

const useCreateYieldRateMaterialExport = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: createYieldRateMaterialExport,
    onSuccess,
    onError
  })
}

const createYieldRateMaterialImport = (dataItem: any) => {
  const data = YieldRateMaterialService.createYieldRateMaterialImport(dataItem)
  return data
}

const useCreateYieldRateMaterialImport = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: createYieldRateMaterialImport,
    onSuccess,
    onError
  })
}

export {
  useSearch,
  useCreate,
  useUpdate,
  useDelete,
  useCreateYieldRateMaterialExport,
  useCreateYieldRateMaterialImport
}
