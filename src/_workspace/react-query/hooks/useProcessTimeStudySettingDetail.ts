import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import type ResultDataResponseI from '@/libs/axios/types/ResultDataResponseI'
import ProcessTimeStudySettingDetailServices from '@/_workspace/services/ProcessTimeStudySettingDetailService'
import { ProcessTimeStudySettingDetailInterface } from '@/_workspace/types/ProcessTimeStudySettingDetail'

export const PREFIX_QUERY_KEY = 'SearchProcessTimeStudySettingDetail'

const useSearchProcessTimeStudySettingDetail = (params: string, isFetchData: boolean) =>
  useQuery<ResultDataResponseI<ProcessTimeStudySettingDetailInterface>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => ProcessTimeStudySettingDetailServices.SearchProcessTimeStudySettingDetail(params),
    placeholderData: keepPreviousData, //useful for paginated queries by keeping data from previous pages on screen while fetching the next page
    //staleTime: 0, //don't refetch previously viewed pages until cache is more than 30 seconds old
    enabled: isFetchData
  })

interface SearchProcessTimeStudySettingDetailByProcessTimeStudyIdI extends ProcessTimeStudySettingDetailInterface {
  WORK_ELEMENT_NAME: string
  JOB_TYPE_NAME: string
  PROCESS_TIME_STUDY_SETTING_DETAIL_ID: number
}

const useSearchProcessTimeStudySettingDetailByProcessTimeStudyId = (params: string, isFetchData: boolean) =>
  useQuery<ResultDataResponseI<SearchProcessTimeStudySettingDetailByProcessTimeStudyIdI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () =>
      ProcessTimeStudySettingDetailServices.SearchProcessTimeStudySettingDetailByProcessTimeStudyId(params),
    placeholderData: keepPreviousData, //useful for paginated queries by keeping data from previous pages on screen while fetching the next page
    //staleTime: 0, //don't refetch previously viewed pages until cache is more than 30 seconds old
    enabled: isFetchData
  })
const useUpdateProcessTimeStudyDetail = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: (dataItem: any) => ProcessTimeStudySettingDetailServices.UpdateProcessTimeStudySettingDetail(dataItem),
    onSuccess,
    onError
  })
}

export {
  useSearchProcessTimeStudySettingDetail,
  useSearchProcessTimeStudySettingDetailByProcessTimeStudyId,
  useUpdateProcessTimeStudyDetail
}
