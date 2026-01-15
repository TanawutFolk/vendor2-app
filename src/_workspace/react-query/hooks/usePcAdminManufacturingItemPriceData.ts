import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import AxiosResponseI, { AxiosResponseWithErrorI } from '@/libs/axios/types/AxiosResponseInterface'
import PcAdminManufacturingItemPriceServices from '@/_workspace/services/manufacturing-item/PcAdminManufacturingItemPriceServices'

export const PREFIX_QUERY_KEY = 'MANUFACTURING_ITEM_PRICE'

const useCreate = (
  onSuccess: (onSuccess: AxiosResponseI) => void,
  onError: (onError: AxiosResponseWithErrorI) => void
) => {
  return useMutation({
    mutationFn: (newDataItem: Record<string, any>) => PcAdminManufacturingItemPriceServices.create(newDataItem),
    onSuccess,
    onError
  })
}

export { useCreate }
