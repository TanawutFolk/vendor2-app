// React Imports

// MUI Imports
import { Button, Card, CardContent, CardHeader, Divider, Grid, Typography } from '@mui/material'

// Components Imports
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, useFormContext, useFormState } from 'react-hook-form'
import CustomTextField from '@components/mui/TextField'
import AsyncSelectCustom from '@components/react-select/AsyncSelectCustom'
import SelectCustom from '@components/react-select/SelectCustom'
import SkeletonCustom from '@/components/SkeletonCustom'

// libs Imports
import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'

// Utils Imports
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import useStatusMasterOptions from '@/_workspace/react-query/hooks/useStatusMasterOptions'
import { STATUS_MASTER_TYPE } from '@/_workspace/types/StatusMasterTypes'

// _template Imports
import { useDxContext } from '@/_template/DxContextProvider'

// Workspace Imports
import { fetchVendorTypes } from '@/_workspace/react-select/async-promise-load-options/re-register/fetchVendorTypes'
import { fetchProvinces } from '@/_workspace/react-select/async-promise-load-options/re-register/fetchProvinces'
import { fetchProductGroups } from '@/_workspace/react-select/async-promise-load-options/re-register/fetchProductGroups'

// My Components Imports
import { MENU_ID } from './env'
import type { FormDataPage } from './validationSchema'

const InuseOption = [
  { value: 1, label: 'Active' },
  { value: 0, label: 'Inactive' }
]

function SearchFilters() {
  // Context
  const { setIsEnableFetching } = useDxContext()

  // States

  // Hooks
  // Hooks : react-hook-form
  const { setValue, getValues, control, handleSubmit } = useFormContext<FormDataPage>()

  const { isLoading } = useFormState()
  const { data: vendorStatusOptions = [] } = useStatusMasterOptions(STATUS_MASTER_TYPE.VENDOR)

  // Function
  const onHandleClearSearchFilters = () => {
    setValue('searchFilters', {
      globalSearch: '',
      companyName: '',
      vendorTypeId: null,
      province: null,
      productGroupId: null,
      status: null,
      inuse: null,
      productName: '',
      makerName: '',
      modelList: '',
      fftVendorCode: ''
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
          globalSearch: getValues('searchFilters.globalSearch'),
          companyName: getValues('searchFilters.companyName'),
          vendorTypeId: getValues('searchFilters.vendorTypeId'),
          province: getValues('searchFilters.province'),
          productGroupId: getValues('searchFilters.productGroupId'),
          status: getValues('searchFilters.status'),
          inuse: getValues('searchFilters.inuse'),
          productName: getValues('searchFilters.productName'),
          makerName: getValues('searchFilters.makerName'),
          modelList: getValues('searchFilters.modelList'),
          fftVendorCode: getValues('searchFilters.fftVendorCode')
        },
        searchResults: {
          agGridState: getValues('searchResults.agGridState')
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
              <Grid item xs={12} sm={8} lg={8}>
                <Controller
                  name='searchFilters.globalSearch'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Global Search'
                      placeholder='Search by Company Name, Vendor Code, etc.'
                      autoComplete='off'
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Divider textAlign='left'>
                  <Typography variant='body2' color='primary'>
                    Vendor Details
                  </Typography>
                </Divider>
              </Grid>
              <Grid item xs={12} sm={4} lg={3}>
                <Controller
                  name='searchFilters.companyName'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Company Name'
                      placeholder='Enter ...'
                      autoComplete='off'
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4} lg={3}>
                <Controller
                  name='searchFilters.vendorTypeId'
                  control={control}
                  render={({ field: { ...fieldProps } }) => (
                    <AsyncSelectCustom
                      {...fieldProps}
                      defaultOptions
                      cacheOptions
                      loadOptions={(inputValue: string) => fetchVendorTypes(inputValue)}
                      isClearable
                      label='Vendor Type'
                      placeholder='Select ...'
                      classNamePrefix='select'
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4} lg={3}>
                <Controller
                  name='searchFilters.province'
                  control={control}
                  render={({ field: { ...fieldProps } }) => (
                    <AsyncSelectCustom
                      {...fieldProps}
                      defaultOptions
                      cacheOptions
                      loadOptions={(inputValue: string) => fetchProvinces(inputValue)}
                      isClearable
                      label='Province'
                      placeholder='Select ...'
                      classNamePrefix='select'
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4} lg={3}>
                <Controller
                  name='searchFilters.productGroupId'
                  control={control}
                  render={({ field: { ...fieldProps } }) => (
                    <AsyncSelectCustom
                      {...fieldProps}
                      defaultOptions
                      cacheOptions
                      loadOptions={(inputValue: string) => fetchProductGroups(inputValue)}
                      isClearable
                      label='Product Group'
                      placeholder='Select ...'
                      classNamePrefix='select'
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4} lg={3}>
                <Controller
                  name='searchFilters.productName'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Product Name'
                      placeholder='Enter ...'
                      autoComplete='off'
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4} lg={3}>
                <Controller
                  name='searchFilters.makerName'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Maker Name'
                      placeholder='Enter ...'
                      autoComplete='off'
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4} lg={3}>
                <Controller
                  name='searchFilters.modelList'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Model Name'
                      placeholder='Enter ...'
                      autoComplete='off'
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4} lg={3}>
                <Controller
                  name='searchFilters.inuse'
                  control={control}
                  render={({ field: { ...fieldProps } }) => (
                    <SelectCustom
                      {...fieldProps}
                      options={InuseOption}
                      isClearable
                      label='Status ( Active / Inactive )'
                      placeholder='Select ...'
                      classNamePrefix='select'
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4} lg={3}>
                <Controller
                  name='searchFilters.status'
                  control={control}
                  render={({ field: { ...fieldProps } }) => (
                    <SelectCustom
                      {...fieldProps}
                      options={vendorStatusOptions}
                      isClearable
                      label='Vendor Status'
                      placeholder='Select ...'
                      classNamePrefix='select'
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4} lg={3}>
                <Controller
                  name='searchFilters.fftVendorCode'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Vendor Code'
                      placeholder='Enter ...'
                      autoComplete='off'
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
