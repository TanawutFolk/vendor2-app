import { useFormContext, useWatch } from 'react-hook-form'
import { useDebounce, useUpdateEffect } from 'react-use'

import { useState } from 'react'

import type { FormData } from '../yield-rate-material/page'

import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { MENU_ID } from './env'

function YieldRateWatch() {
  const data = useWatch({
    name: [
      'searchResults.pageSize',
      'searchResults.columnFilters',
      'searchResults.sorting',
      'searchResults.density',
      'searchResults.columnVisibility',
      'searchResults.columnPinning',
      'searchResults.columnOrder',
      'searchResults.columnFilterFns'
    ],
    exact: true
  })

  const [isFirstMount, setIsFirstMount] = useState(true)
  // react-hook-form
  const { getValues } = useFormContext<FormData>()

  // react-query
  const handleAdd = (data: Array<any>) => {
    const dataItem = {
      USER_ID: getUserData().USER_ID,
      APPLICATION_ID: import.meta.env.VITE_APPLICATION_ID,
      MENU_ID: MENU_ID.toString(),
      USER_PROFILE_SETTING_PROGRAM_DATA: {
        searchFilters: {
          FISCAL_YEAR: getValues('searchFilters.FISCAL_YEAR'),
          PRODUCT_CATEGORY: getValues('searchFilters.PRODUCT_CATEGORY'),
          PRODUCT_MAIN: getValues('searchFilters.PRODUCT_MAIN'),
          PRODUCT_SUB: getValues('searchFilters.PRODUCT_SUB'),
          PRODUCT_TYPE: getValues('searchFilters.PRODUCT_TYPE'),
          PRODUCT_CODE_NAME: getValues('searchFilters.PRODUCT_CODE_NAME'),
          FLOW_CODE: getValues('searchFilters.FLOW_CODE'),
          FLOW_NAME: getValues('searchFilters.FLOW_NAME'),
          FLOW_PROCESS_NO: getValues('searchFilters.FLOW_PROCESS_NO'),
          REVISION_NO: getValues('searchFilters.REVISION_NO'),
          COLLECTION_POINT_FOR_SCT: getValues('searchFilters.COLLECTION_POINT_FOR_SCT')
        },
        searchResults: {
          pageSize: data[0],
          columnFilters: data[1],
          sorting: data[2],
          density: data[3],
          columnVisibility: data[4],
          columnPinning: data[5],
          columnOrder: data[6],
          columnFilterFns: data[7]
        }
      } as FormData
    }

    mutate(dataItem)
  }

  const onMutateSuccess = () => {
    console.log('onMutateSuccess')
  }

  const onMutateError = (e: any) => {
    console.log('onMutateError', e)
  }

  const { mutate, isError, error } = useCreate(onMutateSuccess, onMutateError)

  // const [,] = useDebounce(
  //   () => {
  //     handleAdd(data)
  //   },

  //   1500,
  //   [data]
  // )
  const [,] = useDebounce(
    () => {
      if (isFirstMount === false) {
        handleAdd(data)
      }
    },
    1500,
    [JSON.stringify(data)]
  )

  useUpdateEffect(() => {
    setIsFirstMount(false)
  }, [JSON.stringify(data)])

  return <>{isError ? <div>An error occurred: {error.message}</div> : null}</>
}

export default YieldRateWatch
