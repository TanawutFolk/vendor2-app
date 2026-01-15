import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import VendorServices from '@/_workspace/services/item-master/VendorServices'
import type { VendorI } from '@/_workspace/types/item-master/Vendor'
import AxiosResponseI from '@/libs/axios/types/ResultDataResponseI'
import { ReturnApiSearchVendorI } from '@/app/[lang]/(_workspace)/item-master/vendor/VendorTableData'

export const PREFIX_QUERY_KEY = 'VENDOR'

const useSearch = (params: ReturnApiSearchVendorI, isFetchData: boolean) => {
  return useQuery<AxiosResponseI<VendorI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => VendorServices.search(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })
}

const create = (dataItem: any) => {
  const data = VendorServices.create(dataItem)
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
  const data = VendorServices.update(dataItem)

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
  const data = VendorServices.Delete(dataItem)

  return data
}

const useDelete = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: Delete,
    onSuccess,
    onError
  })
}

export { useSearch, useCreate, useUpdate, useDelete }
