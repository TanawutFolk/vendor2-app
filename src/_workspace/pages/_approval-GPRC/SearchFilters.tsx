// React Imports

// MUI Imports
import { Button, Card, CardContent, CardHeader, Grid } from '@mui/material'

// react-hook-from Imports
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, useFormContext, useFormState } from 'react-hook-form'

// react-select Imports
import CustomTextField from '@components/mui/TextField'
import AsyncSelectCustom from '@components/react-select/AsyncSelectCustom'

// Types
import SkeletonCustom from '@/components/SkeletonCustom'
import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import useRequestStatusOptions from '@/_workspace/react-query/hooks/useRequestStatusOptions'

// _template Imports
import { useDxContext } from '@/_template/DxContextProvider'

// My Components Imports
import { MENU_ID } from './env'
import type { FormDataPage } from './validationSchema'

function SearchFilters() {
  // Context
  const { setIsEnableFetching } = useDxContext()

  // States

  // Hooks
  // Hooks : react-hook-form
  const { setValue, getValues, control, handleSubmit } = useFormContext<FormDataPage>()

  const { isLoading } = useFormState()
  const { data: statusOptions = [] } = useRequestStatusOptions()

  // Function
  const onHandleClearSearchFilters = () => {
    setValue('searchFilters', {
      requestNumber: '',
      vendorName: '',
      stepKeyword: '',
      overallStatus: null
    })
    setIsEnableFetching(true)
    handleAdd()
  }

  // Function - react-hook-form
  const onSubmit: SubmitHandler<FormDataPage> = () => {
    setIsEnableFetching(true)
    handleAdd()
  }

  const onError: SubmitErrorHandler<FormDataPage> = data => {
    console.log(data)
  }

  // react-query
  const handleAdd = () => {
    const dataItem = {
      USER_ID: getUserData().USER_ID,
      APPLICATION_ID: import.meta.env.VITE_APPLICATION_ID,
      MENU_ID: MENU_ID.toString(),
      USER_PROFILE_SETTING_PROGRAM_DATA: {
        searchFilters: {
          requestNumber: getValues('searchFilters.requestNumber'),
          vendorName: getValues('searchFilters.vendorName'),
          stepKeyword: getValues('searchFilters.stepKeyword'),
          overallStatus: getValues('searchFilters.overallStatus')
        },
        searchResults: {
          approvalGridState: getValues('searchResults.approvalGridState'),
          actionRequiredGridState: getValues('searchResults.actionRequiredGridState')
        }
      } as FormDataPage
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

  return (
    <Card style={{ overflow: 'visible', zIndex: 4 }}>
      <CardHeader
        title='Search filters'
        titleTypographyProps={{ variant: 'h5' }}
        sx={{ '& .MuiCardHeader-avatar': { mr: 3 } }}
      />
      <CardContent>
        {isError ? <div>An error occurred: {error.message}</div> : null}
        {isLoading ? (
          <>
            <SkeletonCustom />
          </>
        ) : (
          <>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={4} lg={3}>
                <Controller
                  name='searchFilters.requestNumber'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Request No.'
                      placeholder='Enter ...'
                      autoComplete='off'
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4} lg={3}>
                <Controller
                  name='searchFilters.vendorName'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Vendor Name'
                      placeholder='Enter ...'
                      autoComplete='off'
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4} lg={3}>
                <Controller
                  name='searchFilters.stepKeyword'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} fullWidth label='Step' placeholder='Enter ...' autoComplete='off' />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4} lg={3}>
                <Controller
                  name='searchFilters.overallStatus'
                  control={control}
                  render={({ field: { ref, ...fieldProps } }) => (
                    <AsyncSelectCustom
                      {...fieldProps}
                      cacheOptions
                      defaultOptions={statusOptions}
                      loadOptions={inputValue => {
                        const keyword = String(inputValue || '').trim().toLowerCase()
                        if (!keyword) return Promise.resolve(statusOptions)
                        return Promise.resolve(
                          statusOptions.filter(option => String(option.label || '').toLowerCase().includes(keyword))
                        )
                      }}
                      isClearable
                      label='Status'
                      placeholder='Select ...'
                      classNamePrefix='select'
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} className='flex gap-4'>
                <Button onClick={() => handleSubmit(onSubmit, onError)()} variant='contained' type='button'>
                  Search
                </Button>
                <Button variant='tonal' color='secondary' type='reset' onClick={onHandleClearSearchFilters}>
                  Clear
                </Button>
              </Grid>
            </Grid>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default SearchFilters
