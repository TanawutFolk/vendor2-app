import { useFormContext, useWatch } from 'react-hook-form'
import { useDebounce } from 'react-use'

import { MENU_ID } from './env'
import type { FormData } from './page'
import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

function CustomerOrderFromWatch() {
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

  // react-hook-form
  const { getValues, watch } = useFormContext<FormData>()

  // react-query
  const handleAdd = (data: Array<any>) => {
    const dataColumn = watch('tableData').filter((column: any) => column.filterFn || column._filterFn)
    const newData = { ...data[7] }

    dataColumn.forEach((item: any) => {
      const key = item.accessorKey
      if (newData[key] && !item.columnFilterModeOptions.includes(newData[key])) {
        if (newData[key] === 'UPDATE_DATE') {
          newData[key] = 'equals'
        } else {
          newData[key] = 'contains'
        }
      }
    })
    // dataColumn.forEach((item: any) => {
    //   const key = item.accessorKey
    //   if (newData[key]) {
    //     const isValidValue = item.columnFilterModeOptions.includes(newData[key])
    //     if (!isValidValue) {
    //       newData[key] = key === 'UPDATE_DATE' ? 'equals' : 'contains'
    //     }
    //   }
    // })

    // console.log(newData)
    const dataItem = {
      USER_ID: getUserData().USER_ID,
      APPLICATION_ID: import.meta.env.VITE_APPLICATION_ID,
      MENU_ID: MENU_ID.toString(),
      USER_PROFILE_SETTING_PROGRAM_DATA: {
        searchFilters: {
          // productCategory: getValues('searchFilters.productCategory'),
          // customerOrderFromId: getValues('searchFilters.customerOrderFromId '),
          customerOrderFromName: getValues('searchFilters.customerOrderFromName'),
          customerOrderFromAlphabet: getValues('searchFilters.customerOrderFromAlphabet'),
          status: getValues('searchFilters.status')
        },
        searchResults: {
          pageSize: data[0],
          columnFilters: data[1],
          sorting: data[2],
          density: data[3],
          columnVisibility: data[4],
          columnPinning: data[5],
          columnOrder: data[6],
          columnFilterFns: newData
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

  const [,] = useDebounce(
    () => {
      handleAdd(data)
    },
    1500,
    [data]
  )

  return <>{isError ? <div>An error occurred: {error.message}</div> : null}</>
}

export default CustomerOrderFromWatch
