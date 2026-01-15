import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import type ResultDataResponseI from '@/libs/axios/types/ResultDataResponseI'
import ProcessTimeStudyServices from '@/_workspace/services/ProcessTimeStudyServices'
import { ProcessTimeStudyInterface } from '@/_workspace/types/ProcessTimeStudy'

export const PREFIX_QUERY_KEY = 'PROCESS_TIME_STUDY_SETTING'

const useSearchProcessTimeStudy = (params: string, isFetchData: boolean, subParams: string = '') =>
  useQuery<ResultDataResponseI<ProcessTimeStudyInterface>, Error>({
    queryKey: [`${subParams === '' ? subParams : `${subParams}_`}${PREFIX_QUERY_KEY}`, params],
    queryFn: () => ProcessTimeStudyServices.SearchProcessTimeStudy(params),
    placeholderData: keepPreviousData, //useful for paginated queries by keeping data from previous pages on screen while fetching the next page
    //staleTime: 0, //don't refetch previously viewed pages until cache is more than 30 seconds old
    enabled: isFetchData
  })

const useSearchProcessTimeStudySettingData = (params: string, isFetchData: boolean, subParams: string = '') =>
  useQuery<ResultDataResponseI<ProcessTimeStudyInterface>, Error>({
    queryKey: [`${subParams === '' ? subParams : `${subParams}_`}${PREFIX_QUERY_KEY}`, params],
    queryFn: () => ProcessTimeStudyServices.SearchProcessTimeStudySettingData(params),
    placeholderData: keepPreviousData, //useful for paginated queries by keeping data from previous pages on screen while fetching the next page
    //staleTime: 0, //don't refetch previously viewed pages until cache is more than 30 seconds old
    enabled: isFetchData
  })

const useCreateProcessTimeStudy = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: (dataItem: any) => ProcessTimeStudyServices.InsertProcessTimeStudy(dataItem),
    onSuccess,
    onError
  })
}

const useDeleteProcessTimeStudy = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: (dataItem: any) => ProcessTimeStudyServices.deleteProcessTimeStudy(dataItem),
    onSuccess,
    onError
  })
}
export {
  // useSearchProcessTimeStudySettingDetail,
  useCreateProcessTimeStudy,
  useSearchProcessTimeStudy,
  useDeleteProcessTimeStudy,
  useSearchProcessTimeStudySettingData
}
