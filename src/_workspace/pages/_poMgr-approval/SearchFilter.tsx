// MUI Imports
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'

// React Hook Form Imports
import { Controller, useFormContext, useFormState } from 'react-hook-form'
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'

// React Query Imports
import { useQueryClient } from '@tanstack/react-query'

import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import useRequestStatusOptions from '@_workspace/react-query/useRequestStatusOptions'

// Components Imports
import CustomTextField from '@components/mui/TextField'
import SelectCustom from '@components/react-select/SelectCustom'
import SkeletonCustom from '@components/SkeletonCustom'

// Utils Imports
import { getUserData } from '@/utils/user-profile/userLoginProfile'

// Context
import { useDxContext } from '@/_template/DxContextProvider'

// Types & Schema
import type { RequestRegisterFormData } from './validataeSchema'
import { defaultSearchFilters } from './validataeSchema'
import { MENU_ID } from './env'

const SearchFilter = () => {
  // Context
  const { setIsEnableFetching } = useDxContext()

  // React Hook Form
  const { setValue, getValues, control, handleSubmit } = useFormContext<RequestRegisterFormData>()
  const { isLoading } = useFormState()

  // Status options from DB
  const { data: statusOptions = [] } = useRequestStatusOptions()

  const onHandleClearSearchFilters = () => {
    setValue('searchFilters', defaultSearchFilters)

    setIsEnableFetching(true)
    handleAdd()
  }

  const onSubmit: SubmitHandler<RequestRegisterFormData> = () => {
    setIsEnableFetching(true)
    handleAdd()
  }

  const onError: SubmitErrorHandler<RequestRegisterFormData> = data => {
    console.log(getValues())
    console.log(data)
  }

  const handleAdd = () => {
    const dataItem = {
      USER_ID: getUserData().USER_ID,
      APPLICATION_ID: import.meta.env.VITE_APPLICATION_ID,
      MENU_ID: MENU_ID.toString(),
      USER_PROFILE_SETTING_PROGRAM_DATA: {
        searchFilters: getValues('searchFilters'),
        searchResults: {
          agGridState: getValues('searchResults.agGridState')
        }
      } as RequestRegisterFormData
    }

    mutate(dataItem)
  }

  const onMutateSuccess = () => {}

  const onMutateError = (e: any) => {}

  const { mutate, isError, error } = useCreate(onMutateSuccess, onMutateError)

  return (
    <Card style={{ overflow: 'visible', zIndex: 4 }}>
      <CardHeader
        title='Search filters'
        titleTypographyProps={{ variant: 'h5' }}
        sx={{ '& .MuiCardHeader-avatar': { mr: 3 } }}
      />

      <CardContent>
        {isError && <div>An error occurred: {error.message}</div>}
        {isLoading ? (
          <>
            <SkeletonCustom />
          </>
        ) : (
          <>
            <Grid container spacing={4}>
              {/* Vendor Name */}
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name='searchFilters.vendor_name'
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

              {/* Submitted By */}
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name='searchFilters.submitted_by'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Submitted By'
                      placeholder='Enter ...'
                      autoComplete='off'
                    />
                  )}
                />
              </Grid>

              {/* Status */}
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name='searchFilters.overall_status'
                  control={control}
                  render={({ field: { ref, ...fieldProps } }) => (
                    <SelectCustom
                      {...fieldProps}
                      options={statusOptions}
                      isClearable
                      label='Status'
                      placeholder='Select ...'
                      classNamePrefix='select'
                    />
                  )}
                />
              </Grid>

              {/* Buttons */}
              <Grid item xs={12} className='flex gap-3'>
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

export default SearchFilter
