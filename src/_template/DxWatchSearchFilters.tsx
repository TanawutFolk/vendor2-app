// React Imports
import { useState } from 'react'

// react-hook-form Imports
import { useWatch } from 'react-hook-form'

// react-use Imports
import { useDebounce, useUpdateEffect } from 'react-use'

// template Imports
import { useDxSaveSearchFilters, DEFAULT_SEARCH_RESULTS_PATHS } from './DxSaveSearchFilters'

// -----------------------------------------------------------------------------
// DxWatchSearchFilters
//
// Mount once inside the page's FormProvider. Watches the AG Grid state blob(s)
// under `searchResults` and debounce-persists them to UserProfileSettingProgram
// whenever the user reorders / resizes / sorts / filters / pins columns — so
// grid layout survives a reload without waiting for the next Search click.
//
// This is the AG Grid equivalent of the prototype's per-page `<XxxWatch />`.
// Pages with multiple grids pass their own `watchPaths`.
// -----------------------------------------------------------------------------
interface Props {
  MENU_ID: number
  watchPaths?: string[]
}

function DxWatchSearchFilters({ MENU_ID, watchPaths = DEFAULT_SEARCH_RESULTS_PATHS }: Props) {
  const { save, isError, error } = useDxSaveSearchFilters({ MENU_ID, searchResultsPaths: watchPaths })

  const watched = useWatch({ name: watchPaths })

  const [isFirstMount, setIsFirstMount] = useState(true)

  // Skip the initial value (restored from DB); only persist real user changes.
  useDebounce(
    () => {
      if (isFirstMount === false) {
        save()
      }
    },
    1500,
    [JSON.stringify(watched)]
  )

  useUpdateEffect(() => {
    setIsFirstMount(false)
  }, [JSON.stringify(watched)])

  return <>{isError ? <div>An error occurred: {error?.message}</div> : null}</>
}

export default DxWatchSearchFilters
