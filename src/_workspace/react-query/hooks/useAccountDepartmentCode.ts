import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import AccountDepartmentCodeServices from '@/_workspace/services/account/AccountDepartmentCodeServices'
import { AccountDepartmentCodeI } from '@/_workspace/types/account/AccountDepartmentCode'

export const PREFIX_QUERY_KEY = 'ACCOUNT_DEPARTMENT_CODE'

const useSearchAccountDepartmentCode = (params: string, isFetchData: boolean) =>
  useQuery<AxiosResponseI<AccountDepartmentCodeI>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => AccountDepartmentCodeServices.search(params),
    placeholderData: keepPreviousData, //useful for paginated queries by keeping data from previous pages on screen while fetching the next page
    //staleTime: 0, //don't refetch previously viewed pages until cache is more than 30 seconds old
    enabled: isFetchData
  })

const create = (dataItem: any) => {
  const data = AccountDepartmentCodeServices.create(dataItem)

  return data
}

const useCreateAccountDepartmentCode = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: create,
    onSuccess,
    onError
  })
}

const update = (dataItem: any) => {
  const data = AccountDepartmentCodeServices.update(dataItem)

  return data
}

const useUpdateAccountDepartmentCode = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: update,
    onSuccess,
    onError
  })
}
const deleteAccountDepartmentCode = (dataItem: any) => {
  const data = AccountDepartmentCodeServices.delete(dataItem)

  return data
}

const useDeleteAccountDepartmentCode = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: deleteAccountDepartmentCode,
    onSuccess,
    onError
  })
}

export {
  useSearchAccountDepartmentCode,
  useCreateAccountDepartmentCode,
  useUpdateAccountDepartmentCode,
  useDeleteAccountDepartmentCode
}
