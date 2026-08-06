import { useMutation } from '@tanstack/react-query'

import BlacklistServices from '@/_workspace/services/_black-list/BlacklistServices'

const uploadBlacklist = (dataItem: any) => {
  const data =
    dataItem.FORMAT === 'US'
      ? BlacklistServices.importFileUS(dataItem.formData, dataItem.onUploadProgress)
      : BlacklistServices.importFileCN(dataItem.formData, dataItem.onUploadProgress)

  return data
}

const useUploadBlacklist = (onSuccess: any, onError: any) => {
  return useMutation({
    mutationFn: uploadBlacklist,
    onSuccess,
    onError
  })
}

export { useUploadBlacklist }
