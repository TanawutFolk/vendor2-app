// React Imports
import { useState } from 'react'

// react-hook-form Imports
import { useWatch } from 'react-hook-form'

// react-use Imports
import { useDebounce, useUpdateEffect } from 'react-use'

// libs Imports
import { useCreate } from '@libs/react-query/hooks/common-system/useUserProfileSettingProgram'

// Utils Imports
import { getUserData } from '@utils/user-profile/userLoginProfile'

// -----------------------------------------------------------------------------
// DxWatchSearchFilters
//
// Mount once inside the page's FormProvider. Watches the whole `searchResults`
// blob and debounce-persists it to UserProfileSettingProgram whenever the user
// reorders / resizes / sorts / filters / pins columns — so the table layout
// survives a reload without waiting for the next Search click.
//
// `searchFiltersData` is passed in by the page so the saved payload always keeps
// the current filter values alongside the table state.
// -----------------------------------------------------------------------------
interface Props {
  MENU_ID: number
  searchFiltersData: Record<string, any>
}

function DxWatchSearchFilters({ MENU_ID, searchFiltersData }: Props) {
  const data = useWatch({
    name: 'searchResults'
  })

  const [isFirstMount, setIsFirstMount] = useState(true)

  // react-query
  const handleAdd = (searchResults: any) => {
    const dataItem = {
      USER_ID: getUserData().USER_ID,
      APPLICATION_ID: import.meta.env.VITE_APPLICATION_ID,
      MENU_ID: MENU_ID.toString(),
      USER_PROFILE_SETTING_PROGRAM_DATA: {
        searchFilters: searchFiltersData,
        searchResults: searchResults
      }
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

export default DxWatchSearchFilters
