import { useMemo } from 'react'

import useStatusMasterOptions from '@/_workspace/react-query/hooks/useStatusMasterOptions'
import { STATUS_MASTER_TYPE } from '@/_workspace/types/StatusMasterTypes'
import { buildVendorStatusMasterIds } from '@/_workspace/utils/vendorStatusIdentity'

const useVendorStatusIdentity = () => {
  const statusQuery = useStatusMasterOptions(STATUS_MASTER_TYPE.VENDOR)
  const vendorStatusIds = useMemo(() => buildVendorStatusMasterIds(statusQuery.data || []), [statusQuery.data])

  return {
    vendorStatusIds,
    isLoading: statusQuery.isLoading,
    isError: statusQuery.isError
  }
}

export default useVendorStatusIdentity
