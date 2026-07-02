import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import FlowProcessServices from '@/_workspace/services/flow/FlowProcessServices'
import type { FlowProcessI } from '@/_workspace/types/flow/FlowProcess'

import { ReturnApiSearchFlowProcessI } from '@/app/[lang]/(_workspace)/flow/flow-process/FlowProcessTableData'
import AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'

export const PREFIX_QUERY_KEY = 'FLOW_PROCESS'

const useSearch = (params: ReturnApiSearchFlowProcessI, isFetchData: boolean, subParams: string = '') => {
  return useQuery<AxiosResponseI<FlowProcessI>, Error>({
    queryKey: [`${subParams === '' ? subParams : `${subParams}_`}${PREFIX_QUERY_KEY}`, params],
    queryFn: () => FlowProcessServices.search(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })
}

const create = (dataItem: any) => {
  const data = FlowProcessServices.create(dataItem)
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
  const data = FlowProcessServices.update(dataItem)

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
  const data = FlowProcessServices.Delete(dataItem)

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
