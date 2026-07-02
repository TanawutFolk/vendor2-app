import BoiNameForMaterialConsumableServices from '@/_workspace/services/boi/BoiNameForMaterialConsumableServices'
import type ResultDataResponseI from '@/libs/axios/types/ResultDataResponseI'
import { BoiNameForMaterialConsumableI } from '@/_workspace/types/boi/BoiNameForMaterialConsumable'
import { useQuery, useMutation } from '@tanstack/react-query'

export const PREFIX_QUERY_KEY = 'BOI_NAME_FOR_MATERIAL'

const useSearchBoiNameForMaterialConsumable = (params: string, isFetchData: boolean) =>
  useQuery<ResultDataResponseI<BoiNameForMaterialConsumableI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => BoiNameForMaterialConsumableServices.search(params),
    enabled: isFetchData
    // staleTime: Infinity
  })

const create = (dataItem: any) => {
  const data = BoiNameForMaterialConsumableServices.create(dataItem)
  return data
}

const useCreateBoiNameForMaterialConsumable = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: create,
    onSuccess,
    onError
  })
}

const update = (dataItem: any) => {
  const data = BoiNameForMaterialConsumableServices.update(dataItem)

  return data
}

const useUpdateBoiNameForMaterialConsumable = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: update,
    onSuccess,
    onError
  })
}

const deleteBoiNameForMaterialConsumable = (dataItem: any) => {
  const data = BoiNameForMaterialConsumableServices.delete(dataItem)

  return data
}

const useDeleteBoiNameForMaterialConsumable = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: deleteBoiNameForMaterialConsumable,
    onSuccess,
    onError
  })
}

export {
  useSearchBoiNameForMaterialConsumable,
  useCreateBoiNameForMaterialConsumable,
  useUpdateBoiNameForMaterialConsumable,
  useDeleteBoiNameForMaterialConsumable
}
