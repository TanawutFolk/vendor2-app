import { ToastMessageSuccess, ToastMessageError } from '@/components/ToastMessage'
import type { QueryClient } from '@tanstack/react-query'

export interface MutateSuccessOptions {
  title: string
  onSuccess?: () => void
  queryClient?: QueryClient
  queryKeys?: any[][]
  setIsEnableFetching?: (enable: boolean) => void
}

/**
 * Handle standard mutation response checking for Status === true
 * Shows Success/Error Toasts and executes optional callbacks like InvalidateQueries or setIsEnableFetching
 */
export const handleMutateSuccess = (data: any, options: MutateSuccessOptions) => {
  const { title, onSuccess, queryClient, queryKeys, setIsEnableFetching } = options

  if (data?.data && data.data.Status === true) {
    const message = {
      title: title,
      message: data.data.Message || 'Success'
    }

    ToastMessageSuccess(message)

    if (setIsEnableFetching) {
      setIsEnableFetching(true)
    }

    if (queryClient && queryKeys) {
      queryKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    }

    if (onSuccess) {
      onSuccess()
    }
  } else {
    // 1062 is a common SQL Error code for Duplicate Entry
    const isDuplicate = data?.data?.Message?.startsWith('1062')
    const message = {
      title: title,
      message: isDuplicate ? `Duplicate ${title}` : (data?.data?.Message || 'An error occurred')
    }

    ToastMessageError(message)
  }
}

/**
 * Handle standard mutation network/try-catch errors
 */
export const handleMutateError = (error?: any, title: string = 'Error') => {
  console.log('onMutateError', error)
  const message = {
    title: title,
    message: error?.message || 'Unknown Error'
  }

  ToastMessageError(message)
}
