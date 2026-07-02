// react-hook-form Imports
import { useFormContext } from 'react-hook-form'
import type { FieldValues } from 'react-hook-form'

// common-system Imports
import { useCreate } from '@libs/react-query/hooks/common-system/useUserProfileSettingProgram'

// utils Imports
import { getUserData } from '@utils/user-profile/userLoginProfile'

// -----------------------------------------------------------------------------
// useDxSaveSearchFilters
//
// Canonical "save search preference" helper for AG Grid pages. Persists the
// current `searchFilters` together with the AG Grid state blob(s) under
// `searchResults` to UserProfileSettingProgram.
//
// Every page's SearchFilter used to re-implement this inline — call this hook
// instead so the payload shape stays identical across the whole workspace.
//
// Most pages keep a single grid state at `searchResults.agGridState` (the
// default). Pages with multiple grids (e.g. approval-GPRC) pass their own
// `searchResultsPaths`; the last path segment becomes the persisted key.
// -----------------------------------------------------------------------------
export const DEFAULT_SEARCH_RESULTS_PATHS = ['searchResults.agGridState']

interface UseDxSaveSearchFiltersArgs {
  MENU_ID: number
  searchResultsPaths?: string[]
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export const useDxSaveSearchFilters = <T extends FieldValues = FieldValues>({
  MENU_ID,
  searchResultsPaths = DEFAULT_SEARCH_RESULTS_PATHS,
  onSuccess,
  onError
}: UseDxSaveSearchFiltersArgs) => {
  const { getValues } = useFormContext<T>()

  const { mutate, isError, error } = useCreate(
    () => onSuccess?.(),
    (e: unknown) => onError?.(e)
  )

  // Pass `searchFilters` explicitly when saving right after a reset (so the
  // freshly-set defaults are captured); otherwise the current form values are used.
  const save = (searchFilters?: unknown) => {
    const searchResults = searchResultsPaths.reduce<Record<string, unknown>>((acc, path) => {
      const key = path.split('.').pop() as string

      acc[key] = getValues(path as never)

      return acc
    }, {})

    mutate({
      USER_ID: getUserData().USER_ID,
      APPLICATION_ID: import.meta.env.VITE_APPLICATION_ID,
      MENU_ID: MENU_ID.toString(),
      USER_PROFILE_SETTING_PROGRAM_DATA: {
        searchFilters: searchFilters ?? getValues('searchFilters' as never),
        searchResults
      }
    })
  }

  return { save, isError, error }
}

export default useDxSaveSearchFilters
