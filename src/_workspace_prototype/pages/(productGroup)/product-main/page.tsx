// MUI Imports
import Grid from '@mui/material/Grid'

// React-Hook-Form Imports
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Third-party Imports
import { useUpdateEffect } from 'react-use'

// Components Imports
import SkeletonCustom from '@components/SkeletonCustom'

// My Validate Schema Imports
import type { FormDataPage } from './validationSchema'
import { fetchDefaultValues, validationSchemaPage } from './validationSchema'

// _template Imports
import { DxProvider, useDxContext } from '@/_template/DxContextProvider'
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'
import DxWatchSearchFilters from '@/_template/DxWatchSearchFilters'

// My Components Imports
import { breadcrumbNavigation, MENU_ID, MENU_NAME } from './env'
import SearchFilters from './SearchFilters'
import SearchResult from './SearchResult'

function Page() {
  return (
    <DxProvider>
      <InnerApp />
    </DxProvider>
  )
}

const InnerApp = () => {
  // DxContext
  const { setIsEnableFetching } = useDxContext()

  // #region react-hook-form
  const reactHookFormMethods = useForm<FormDataPage>({
    resolver: zodResolver(validationSchemaPage),
    defaultValues: async () => fetchDefaultValues(MENU_ID)
  })

  const { control, getValues } = reactHookFormMethods

  const { isLoading: isLoadingReactHookForm } = useFormState({
    control: control
  })

  // #endregion react-hook-form

  // Fetch data (Search Result) after initial defaultValues react-hook-form
  useUpdateEffect(() => {
    setIsEnableFetching(true)
  }, [isLoadingReactHookForm])

  return (
    <>
      <Grid container spacing={6}>
        <FormProvider {...reactHookFormMethods}>
          <Grid
            item
            xs={12}
            sx={{
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <DxBreadCrumbs menuName={MENU_NAME} breadcrumbNavigation={breadcrumbNavigation} />
            {isLoadingReactHookForm === false && (
              <DxWatchSearchFilters
                MENU_ID={MENU_ID}
                searchFiltersData={{
                  productCategory: getValues('searchFilters.productCategory'),
                  productMainName: getValues('searchFilters.productMainName'),
                  productMainCode: getValues('searchFilters.productMainCode'),
                  productMainAlphabet: getValues('searchFilters.productMainAlphabet'),
                  status: getValues('searchFilters.status')
                }}
              />
            )}
          </Grid>
          <Grid item xs={12}>
            <SearchFilters />
          </Grid>
          <Grid item xs={12}>
            {isLoadingReactHookForm ? <SkeletonCustom /> : <SearchResult />}
          </Grid>
        </FormProvider>
      </Grid>
    </>
  )
}

export default Page
