import { useQuery } from '@tanstack/react-query'

import FindVendorServices from '@/_workspace/services/_find-vendor/FindVendorServices'
import type { VendorComprehensiveI } from '@/_workspace/types/vendor/VendorTypes'

export const PREFIX_QUERY_KEY = 'FIND_VENDOR'

export const useFindVendorDetail = (vendorId: number | null, enabled: boolean) =>
  useQuery({
    queryKey: [PREFIX_QUERY_KEY, 'DETAIL', vendorId],
    queryFn: async (): Promise<VendorComprehensiveI> => {
      if (!vendorId) throw new Error('Vendor ID is required')

      const response = await FindVendorServices.getVendorDetail({ VENDORS_ID: vendorId })
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
