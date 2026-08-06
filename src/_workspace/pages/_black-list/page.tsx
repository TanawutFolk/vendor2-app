// MUI Imports
import Grid from '@mui/material/Grid'

// React-Hook-Form Imports
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Components Imports
import SkeletonCustom from '@components/SkeletonCustom'

// My Validate Schema Imports
import type { FormDataPage } from './validationSchema'
import { fetchDefaultValues, validationSchemaPage } from './validationSchema'

// _template Imports
import { DxProvider } from '@/_template/DxContextProvider'
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
                  vendorName: getValues('searchFilters.vendorName'),
                  group: getValues('searchFilters.group')
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
