import { useState } from 'react'

import { useFormContext, useWatch } from 'react-hook-form'

import { useDebounce, useUpdateEffect } from 'react-use'

import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

import { MENU_ID } from './env'

import type { FormData } from './page'
import ItemCategory from './page'

const ItemCategoryWatch = () => {
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

  // State
  const [isFirstMount, setIsFirstMount] = useState(true)

  // React-hook-form
  const { getValues } = useFormContext<FormData>()

  // React-query
  const handleAdd = (data: Array<any>) => {
    const dataItem = {
      USER_ID: getUserData().USER_ID,
      APPLICATION_ID: import.meta.env.VITE_APPLICATION_ID,
      MENU_ID: MENU_ID.toString(),
      USER_PROFILE_SETTING_PROGRAM_DATA: {
        searchFilters: {
          ITEM_CATEGORY_NAME: getValues('searchFilters.ITEM_CATEGORY_NAME'),
          ITEM_CATEGORY_ALPHABET: getValues('searchFilters.ITEM_CATEGORY_ALPHABET'),
          INUSE: getValues('searchFilters.INUSE')
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
    //console.log('onMutateSuccess')
  }

  const onMutateError = (e: any) => {
    // console.log('onMutateError', e)
  }

  const { mutate, isError, error } = useCreate(onMutateSuccess, onMutateError)

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

export default ItemCategoryWatch
