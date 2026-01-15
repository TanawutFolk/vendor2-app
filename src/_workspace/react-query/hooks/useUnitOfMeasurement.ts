import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import UnitOfMeasurementServices from '@/_workspace/services/unit/UnitOfMeasurementServices'
import type { UnitOfMeasurementI } from '@/_workspace/types/unit/UnitOfMeasurement'
import AxiosResponseI from '@/libs/axios/types/ResultDataResponseI'
import { ReturnApiSearchUnitOfMeasurementI } from '@/app/[lang]/(_workspace)/(units)/unit-of-measurement/UnitOfMeasurementTableData'

export const PREFIX_QUERY_KEY = 'UNIT_OF_MEASUREMENT'

const useSearchUnitOfMeasurement = (params: ReturnApiSearchUnitOfMeasurementI, isFetchData: boolean) =>
  useQuery<AxiosResponseI<UnitOfMeasurementI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => UnitOfMeasurementServices.SearchUnitOfMeasurement(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })

const create = (dataItem: any) => {
  const data = UnitOfMeasurementServices.createUnitOfMeasurement(dataItem)
  return data
}

const useCreateUnitOfMeasurement = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: create,
    onSuccess,
    onError
  })
}

const update = (dataItem: any) => {
  const data = UnitOfMeasurementServices.updateUnitOfMeasurement(dataItem)

  return data
}

const useUpdateUnitOfMeasurement = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: update,
    onSuccess,
    onError
  })
}

const deleteSubProcess = (dataItem: any) => {
  const data = UnitOfMeasurementServices.deleteUnitOfMeasurement(dataItem)

  return data
}

const useDeleteUnitOfMeasurement = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: deleteSubProcess,
    onSuccess,
    onError
  })
}

export {
  useSearchUnitOfMeasurement,
  useCreateUnitOfMeasurement,
  useUpdateUnitOfMeasurement,
  useDeleteUnitOfMeasurement
}
