import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import type AxiosResponseI from '@/libs/axios/types/ResultDataResponseI'
import SpecificationSettingServices from '@/_workspace/services/specification-setting/SpecificationSettingServices'
import type { SpecificationSettingI } from '@/_workspace/types/specification-setting/SpecificationSetting'
import { ReturnApiSearchSpecificationI } from '@/app/[lang]/(_workspace)/specification-setting/SpecificationSettingTableData'

export const PREFIX_QUERY_KEY = 'SPECIFICATION_SETTING'

// #region ใช้งานกับ GET ของ Time Record
// const useSearchSpecificationSetting = (params: string, isEnableFetching: boolean, subParams: string = '') =>
//   useQuery<AxiosResponseI<SpecificationSettingI>, Error>({
//     queryKey: [subParams ? `${subParams}_${PREFIX_QUERY_KEY}` : PREFIX_QUERY_KEY, params],
//     queryFn: () => SpecificationSettingServices.search(params),
//     placeholderData: keepPreviousData, //useful for paginated queries by keeping data from previous pages on screen while fetching the next page
//     //staleTime: 0, //don't refetch previously viewed pages until cache is more than 30 seconds old
//     enabled: isEnableFetching
//   })
//#endregion

// #region ใช้งานกับ POST ของ search
const useSearchSpecificationSetting = (
  params: Record<string, any>,
  isEnableFetching: boolean,
  subParams: string = ''
) =>
  useQuery<AxiosResponseI<SpecificationSettingI>, Error>({
    queryKey: [subParams ? `${subParams}_${PREFIX_QUERY_KEY}` : PREFIX_QUERY_KEY, params],
    queryFn: () => SpecificationSettingServices.search(params),
    placeholderData: keepPreviousData, //useful for paginated queries by keeping data from previous pages on screen while fetching the next page
    //staleTime: 0, //don't refetch previously viewed pages until cache is more than 30 seconds old
    enabled: isEnableFetching
  })

//#endregion

// #region ใช้งานกับ GET ของ search

// const useSearchSpecificationSetting = (
//   params: ReturnApiSearchSpecificationI,
//   isEnableFetching: boolean,
//   subParams: string = ''
// ) =>
//   useQuery<AxiosResponseI<SpecificationSettingI>, Error>({
//     queryKey: [subParams ? `${subParams}_${PREFIX_QUERY_KEY}` : PREFIX_QUERY_KEY, params],
//     queryFn: () => SpecificationSettingServices.search(params),
//     placeholderData: keepPreviousData, //useful for paginated queries by keeping data from previous pages on screen while fetching the next page
//     //staleTime: 0, //don't refetch previously viewed pages until cache is more than 30 seconds old
//     enabled: isEnableFetching
//   })
//#endregion

const useSearchSpecificationSettingForCopy = (isFetchData: boolean, prefixQueryKey: string = '') =>
  useQuery<AxiosResponseI<SpecificationSettingI>, Error>({
    queryKey: [prefixQueryKey ? `${prefixQueryKey}_${PREFIX_QUERY_KEY}` : PREFIX_QUERY_KEY],
    queryFn: () => SpecificationSettingServices.searchForCopy(),
    placeholderData: keepPreviousData, //useful for paginated queries by keeping data from previous pages on screen while fetching the next page
    //staleTime: 0, //don't refetch previously viewed pages until cache is more than 30 seconds old
    enabled: isFetchData
  })

const create = (dataItem: any) => {
  const data = SpecificationSettingServices.create(dataItem)

  return data
}

const useCreateSpecificationSetting = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: create,
    onSuccess,
    onError
  })
}

const update = (dataItem: any) => {
  const data = SpecificationSettingServices.update(dataItem)

  return data
}

const useUpdateSpecificationSetting = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: update,
    onSuccess,
    onError
  })
}
const deleteSpecificationSetting = (dataItem: any) => {
  const data = SpecificationSettingServices.delete(dataItem)

  return data
}

const useDeleteSpecificationSetting = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: deleteSpecificationSetting,
    onSuccess,
    onError
  })
}

export {
  useSearchSpecificationSetting,
  useCreateSpecificationSetting,
  useUpdateSpecificationSetting,
  useSearchSpecificationSettingForCopy,
  useDeleteSpecificationSetting
}
