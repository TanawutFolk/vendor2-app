import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import ShapeServices from '@/_workspace/services/item-master/item-property/ShapeServices'
import type { ShapeI } from '@/_workspace/types/item-master/item-property/Shape'
import AxiosResponseI from '@/libs/axios/types/ResultDataResponseI'
import { ReturnApiSearchShapeI } from '@/app/[lang]/(_workspace)/item-master/item-property/shape/ShapeTableData'

export const PREFIX_QUERY_KEY = 'SHAPE'

const useSearch = (params: ReturnApiSearchShapeI, isFetchData: boolean) => {
  return useQuery<AxiosResponseI<ShapeI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => ShapeServices.search(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })
}

const create = (dataItem: any) => {
  const data = ShapeServices.create(dataItem)
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
  const data = ShapeServices.update(dataItem)

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
  const data = ShapeServices.Delete(dataItem)

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
