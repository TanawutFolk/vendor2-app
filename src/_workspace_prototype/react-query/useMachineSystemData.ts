import type ResultDataResponseI from '@/libs/axios/types/ResultDataResponseI'

import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import MachineSystemRegisterServices from '../services/MachineSystemServices'
import { MachineSystemRegisterInterface } from '../types/MachineSystemTypes'

export const PREFIX_QUERY_KEY = 'SearchMachineSystemRegister'

const useSearchMachineSystemRegister = (params: string, isFetchData: boolean) =>
  useQuery<ResultDataResponseI<MachineSystemRegisterInterface>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => MachineSystemRegisterServices.SearchMachineSystemRegister(params),
    placeholderData: keepPreviousData, //useful for paginated queries by keeping data from previous pages on screen while fetching the next page
    //staleTime: 0, //don't refetch previously viewed pages until cache is more than 30 seconds old
    enabled: isFetchData
  })

const useCreateMachineSystemRegister = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: (dataItem: any) => MachineSystemRegisterServices.InsertProcessTimeStudy(dataItem),
    onSuccess,
    onError
  })
}
const useUpdateMachineSystemRegister = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: (dataItem: any) => MachineSystemRegisterServices.UpdateMachineSystemRegister(dataItem),
    onSuccess,
    onError
  })
}
const useDeleteMachineSystemRegister = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: (dataItem: any) => MachineSystemRegisterServices.DeleteMachineSystemRegister(dataItem),
    onSuccess,
    onError
  })
}

export {
  useSearchMachineSystemRegister,
  useCreateMachineSystemRegister,
  useUpdateMachineSystemRegister,
  useDeleteMachineSystemRegister
}
