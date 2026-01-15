import { useFormContext, useFormState, useWatch } from 'react-hook-form'
import { useDebounce } from 'react-use'

import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { MENU_ID } from './env'
import type { FormData } from './page'

function Watched() {
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
  const { getValues } = useFormContext<FormData>()
  const { isDirty, dirtyFields } = useFormState()

  // react-query
  const handleAdd = (data: Array<any>) => {
    //  console.log(data)

    const dataItem = {
      USER_ID: getUserData().USER_ID,
      APPLICATION_ID: import.meta.env.VITE_APPLICATION_ID,
      MENU_ID: MENU_ID.toString(),
      USER_PROFILE_SETTING_PROGRAM_DATA: {
        searchFilters: {
          CUSTOMER_INVOICE_TO: getValues('searchFilters.CUSTOMER_INVOICE_TO'),
          status: getValues('searchFilters.status')
        },
        searchResults: {
          pageSize: data[0],
          columnFilters: data[1],
          sorting: data[2],
          density: data[3],
          columnVisibility: data[4],
          columnPinning: data[5],
          columnOrder: data[6]
        }
      } as FormData
    }

    mutation.mutate(dataItem)
  }

  const onMutateSuccess = () => {
    console.log('onMutateSuccess')
  }

  const onMutateError = (e: any) => {
    console.log('onMutateError', e)
  }

  const mutation = useCreate(onMutateSuccess, onMutateError)

  const [,] = useDebounce(
    () => {
      //console.log(data)

      // handleAdd(data)

      // if (JSON.stringify(reactHookFormMethods.formState.dirtyFields) !== '{}') {
      handleAdd(data)

      //}
    },
    1500,
    [data]
  )

  return (
    <>
      {/* {JSON.stringify(reactHookFormMethods.watch())} */}
      {/* {isDirty ? 'isDirty' : ''}
      {JSON.stringify(dirtyFields)} */}
      {mutation.isError ? <div>An error occurred: {mutation.error.message}</div> : null}
    </>
  )
}

export default Watched
