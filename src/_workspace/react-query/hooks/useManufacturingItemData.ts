import AxiosResponseI, { AxiosResponseWithErrorI } from '@/libs/axios/types/AxiosResponseInterface'
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import ManufacturingItemServices from '@/_workspace/services/manufacturing-item/ManufacturingItemServices'
import { SearchResultType } from '@/app/[lang]/(_workspace)/manufacturing-item/item/SearchResult'

export const PREFIX_QUERY_KEY = 'MANUFACTURING_ITEM'

const useSearch = (params: Record<string, any>, isEnableFetching: boolean) =>
  useQuery<AxiosResponseI<SearchResultType>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => ManufacturingItemServices.search(params),
    placeholderData: keepPreviousData,
    //staleTime: 30000,
    enabled: isEnableFetching
  })

const useCreate = (
  onSuccess: (onSuccess: AxiosResponseI) => void,
  onError: (onError: AxiosResponseWithErrorI) => void
) => {
  return useMutation({
    mutationFn: (newDataItem: Record<string, any>) => ManufacturingItemServices.create(newDataItem),
    onSuccess,
    onError
  })
}

const useUpdate = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: (updateDataItem: Record<string, any>) => ManufacturingItemServices.update(updateDataItem),
    onSuccess,
    onError
  })
}

const useDelete = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: (deleteDataItem: Record<string, any>) => ManufacturingItemServices.delete(deleteDataItem),
    onSuccess,
    onError
  })
}

import noImg from '@assets/images/common/no-image-2.jpg'
import CommonServices from '@/_workspace/services/common/commonServices'

const ImageItemFromURL = (ITEM_CODE_FOR_SUPPORT_MES: string, setSmall: any, setLarge: any) => {
  CommonServices.getImageFromUrl({ URL_PATH: ITEM_CODE_FOR_SUPPORT_MES })
    .then(responseJson => {
      if (responseJson?.data?.Status === false) {
        setSmall(noImg)
        setLarge(noImg)
      } else {
        setSmall(URL.createObjectURL(responseJson.data))
        setLarge(URL.createObjectURL(responseJson.data))
      }
    })
    .catch(error => {
      setSmall(noImg)
      setLarge(noImg)
    })
}

const createItemForm = (dataItem: any) => {
  const data = ManufacturingItemServices.createItemForm(dataItem).then(function (response: any) {
    const url = URL.createObjectURL(
      new Blob([response.data], {
        type: response.headers['content-type']
      })
    )
    const filename = response.headers['cache-control']
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
  })

  return data
}

const useCreateItemForm = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: createItemForm,
    onSuccess,
    onError
  })
}

const createImportList = (dataItem: any) => {
  const data = ManufacturingItemServices.createImportList(dataItem)
  return data
}

const useCreateImportList = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: createImportList,
    onSuccess,
    onError
  })
}

export { ImageItemFromURL, useCreate, useCreateImportList, useCreateItemForm, useDelete, useSearch, useUpdate }
