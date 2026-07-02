import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import type ResultDataResponseI from '@/libs/axios/types/ResultDataResponseI'
import JobTypeServices from '@/_workspace/services/JobTypeServices'
import { JobTypeInterface } from '@/_workspace/types/JobType'

export const PREFIX_QUERY_KEY = 'JobType'

const useSearchJobType = (params: string, isFetchData: boolean) =>
  useQuery<ResultDataResponseI<JobTypeInterface>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => JobTypeServices.SearchJobType(params),
    placeholderData: keepPreviousData, //useful for paginated queries by keeping data from previous pages on screen while fetching the next page
    //staleTime: 0, //don't refetch previously viewed pages until cache is more than 30 seconds old
    enabled: isFetchData
  })

const useSearchJobTypeAsyncSelect = (params: object, isFetchData: boolean) =>
  useQuery<ResultDataResponseI<JobTypeInterface>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => JobTypeServices.SearchJobTypeAsyncSelect(params),
    placeholderData: keepPreviousData, //useful for paginated queries by keeping data from previous pages on screen while fetching the next page
    //staleTime: 0, //don't refetch previously viewed pages until cache is more than 30 seconds old
    enabled: isFetchData
  })

// const create = (dataItem: any) => {
//   const data = ProductMainServices.create(dataItem);

//   return data;
// };

// const useCreateJobType = (onSuccess: any, onError: any) => {
//   return useMutation({
//     mutationFn: create,
//     onSuccess,
//     onError,
//   });
// };

// const update = (dataItem: any) => {
//   const data = ProductMainServices.update(dataItem);

//   return data;
// };

// const useUpdateJobType = (onSuccess: any, onError: any) => {
//   return useMutation({
//     mutationFn: update,
//     onSuccess,
//     onError,
//   });
// };

export { useSearchJobType, useSearchJobTypeAsyncSelect }
