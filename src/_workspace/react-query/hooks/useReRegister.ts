import { useMutation, useQuery } from '@tanstack/react-query'

import ReRegisterServices from '@/_workspace/services/_Re-register/ReRegisterServices'
import type { ReRegisterVendorDetailI } from '@/_workspace/types/_Re-register/ReRegisterTypes'

export const RE_REGISTER_QUERY_KEY = 'RE_REGISTER'

export const useReRegisterDetail = (vendorId: number | null, enabled: boolean) =>
  useQuery({
    queryKey: [RE_REGISTER_QUERY_KEY, 'DETAIL', vendorId],
    queryFn: async (): Promise<ReRegisterVendorDetailI> => {
      if (!vendorId) throw new Error('Vendor ID is required')

      const response = await ReRegisterServices.getVendorDetail({ VENDORS_ID: vendorId })
      if (!response.data?.Status || !response.data?.ResultOnDb) {
        throw new Error(response.data?.Message || 'Failed to load vendor details')
      }

      return response.data.ResultOnDb
    },
    staleTime: 30_000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    enabled: enabled && !!vendorId
  })

const deleteReRegisterVendor = async (payload: { VENDORS_ID: number; UPDATE_BY: string }) => {
  const response = await ReRegisterServices.deleteVendor(payload)

  if (!response.data?.Status) {
    throw new Error(response.data?.Message || 'Failed to delete vendor')
  }

  return response.data
}

type DeleteReRegisterVendorPayload = Parameters<typeof deleteReRegisterVendor>[0]
type DeleteReRegisterVendorResult = Awaited<ReturnType<typeof deleteReRegisterVendor>>

export const useDeleteReRegisterVendor = (
  onSuccess?: (data: DeleteReRegisterVendorResult, variables: DeleteReRegisterVendorPayload) => unknown,
  onError?: (error: Error, variables: DeleteReRegisterVendorPayload) => unknown
) =>
  useMutation({
    mutationFn: deleteReRegisterVendor,
    onSuccess,
    onError
  })
