import BomServices from '@/_workspace/services/bom/BomServices'
import { BomI } from '@/_workspace/types/bom/Bom'
import { ReturnApiSearchBomI } from '@/app/[lang]/(_workspace)/bill-of-material/BomTableData'
import AxiosResponseI from '@/libs/axios/types/ResultDataResponseI'
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

export const PREFIX_QUERY_KEY = 'BOM'

const useSearch = (params: ReturnApiSearchBomI, isFetchData: boolean) => {
  return useQuery<AxiosResponseI<BomI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => BomServices.search(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })
}

const create = (dataItem: any) => {
  const data = BomServices.create(dataItem)
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
  const data = BomServices.update(dataItem)

  return data
}

const useUpdate = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: update,
    onSuccess,
    onError
  })
}

const updateBomProductType = (dataItem: any) => {
  const data = BomServices.updateBomProductType(dataItem)

  return data
}

const useUpdateBomProductType = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: updateBomProductType,
    onSuccess,
    onError
  })
}

const Delete = (dataItem: any) => {
  const data = BomServices.Delete(dataItem)

  return data
}

const useDelete = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: Delete,
    onSuccess,
    onError
  })
}

const useGetBomDetailByBomId = (params: object, isFetchData: boolean) => {
  return useQuery<AxiosResponseI<BomI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => BomServices.getBomDetailByBomId(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })
}

const useSearchItemCodeForSupportMes = (params: object, isFetchData: boolean) =>
  useQuery<AxiosResponseI<BomI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => BomServices.getItemCodeForSupportMes(params),
    placeholderData: keepPreviousData, //useful for paginated queries by keeping data from previous pages on screen while fetching the next page
    //staleTime: 0, //don't refetch previously viewed pages until cache is more than 30 seconds old
    enabled: isFetchData
  })

export {
  useCreate,
  useDelete,
  useGetBomDetailByBomId,
  useSearch,
  useSearchItemCodeForSupportMes,
  useUpdate,
  useUpdateBomProductType
}
