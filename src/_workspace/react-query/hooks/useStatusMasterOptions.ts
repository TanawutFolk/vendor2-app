import { useQuery } from '@tanstack/react-query'

import StatusMasterServices from '@/_workspace/services/_status-master/StatusMasterServices'
import {
  normalizeStatusMasterOption,
  type StatusMasterOption,
  type StatusMasterType
} from '@/_workspace/types/StatusMasterTypes'

export const STATUS_MASTER_QUERY_KEY = 'STATUS_MASTER'

const useStatusMasterOptions = (masterType: StatusMasterType) =>
  useQuery<StatusMasterOption[], Error>({
    queryKey: [STATUS_MASTER_QUERY_KEY, masterType],
    queryFn: async () => {
      const response = await StatusMasterServices.getStatusMasters({ MASTER_TYPE: masterType })
      if (!response.data?.Status) {
        throw new Error(response.data?.Message || 'Failed to load status master')
      }

      return (response.data.ResultOnDb || [])
        .map(row =>
          normalizeStatusMasterOption({
            ...row,
            value: row.STATUS_ID,
            label: row.STATUS_LABEL_EN
          })
        )
        .filter((option): option is StatusMasterOption => option !== null)
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false
  })

export default useStatusMasterOptions
