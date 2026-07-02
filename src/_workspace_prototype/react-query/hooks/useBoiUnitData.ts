import { BoiUnitI } from '../../../types/boi/BoiUnit'
import type ResultDataResponseI from '@/libs/axios/types/ResultDataResponseI'

import BoiUnitServices from '@/_workspace/services/boi/BoiUnitServices'
import { useQuery, useMutation } from '@tanstack/react-query'

export const PREFIX_QUERY_KEY = 'BOI_UNIT'

const useSearchBoiUnit = (params: string, isFetchData: boolean) =>
  useQuery<ResultDataResponseI<BoiUnitI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => BoiUnitServices.search(params),
    enabled: isFetchData
    // staleTime: Infinity
  })

const create = (dataItem: any) => {
  const data = BoiUnitServices.create(dataItem)

  return data
}

const useCreateBoiUnit = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: create,
    onSuccess,
    onError
  })
}

const update = (dataItem: any) => {
  const data = BoiUnitServices.update(dataItem)

  return data
}

const useUpdateBoiUnit = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: update,
    onSuccess,
    onError
  })
}

const deleteBoiUnit = (dataItem: any) => {
  const data = BoiUnitServices.delete(dataItem)

  return data
}

const useDeleteBoiUnit = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: deleteBoiUnit,
    onSuccess,
    onError
  })
}

export { useSearchBoiUnit, useCreateBoiUnit, useUpdateBoiUnit, useDeleteBoiUnit }
