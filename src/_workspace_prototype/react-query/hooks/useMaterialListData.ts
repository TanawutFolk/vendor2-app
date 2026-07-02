import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import MaterialListServices from '@/_workspace/services/environment-certificate/MaterialListServices'
import type { MaterialListI } from '@/_workspace/types/environment-certificate/MaterialList'
import AxiosResponseI from '@/libs/axios/types/ResultDataResponseI'
import { ReturnApiSearchMaterialListI } from '@/app/[lang]/(_workspace)/environment-certification/material-list/MaterialListTableData'

export const PREFIX_QUERY_KEY = 'MATERIAL_LIST'

const useSearch = (params: ReturnApiSearchMaterialListI, isFetchData: boolean) => {
  return useQuery<AxiosResponseI<MaterialListI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => MaterialListServices.search(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })
}

export { useSearch }
