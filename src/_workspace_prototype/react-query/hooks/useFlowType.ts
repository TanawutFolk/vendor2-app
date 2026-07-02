import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import FlowTypeServices from '@/_workspace/services/flow/FlowTypeServices'
import type { FlowTypeI } from '@/_workspace/types/flow/FlowType'
import AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import { ReturnApiSearchFlowTypeI } from '@/app/[lang]/(_workspace)/flow/flow-type/FlowTypeTableData'

export const PREFIX_QUERY_KEY = 'FLOW_TYPE'

const useSearch = (params: ReturnApiSearchFlowTypeI, isFetchData: boolean) => {
  return useQuery<AxiosResponseI<FlowTypeI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => FlowTypeServices.search(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })
}

const create = (dataItem: any) => {
  const data = FlowTypeServices.create(dataItem)
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
  const data = FlowTypeServices.update(dataItem)

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
  const data = FlowTypeServices.Delete(dataItem)

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
