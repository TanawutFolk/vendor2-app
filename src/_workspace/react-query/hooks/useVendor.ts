import { useMutation } from '@tanstack/react-query'

import { EditVendorUtils } from '@/_workspace/services/vendor/EditVendorUtils'
import type { UpdateVendorParamsI } from '@/_workspace/types/vendor/VendorTypes'

const updateVendor = async (payload: UpdateVendorParamsI) => EditVendorUtils.updateComprehensive(payload)

export const useUpdateVendor = (
  onSuccess?: (data: unknown, variables: UpdateVendorParamsI) => unknown,
  onError?: (error: Error, variables: UpdateVendorParamsI) => unknown
) =>
  useMutation({
    mutationFn: updateVendor,
    onSuccess,
    onError
  })
