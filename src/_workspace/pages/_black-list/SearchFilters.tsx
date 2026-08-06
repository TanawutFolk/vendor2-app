// React Imports

// MUI Imports
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'

// Third-party Imports

// Components Imports
import { Controller, useFormContext, useFormState } from 'react-hook-form'

import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'

import CustomTextField from '@components/mui/TextField'
import SelectCustom from '@components/react-select/SelectCustom'
import SkeletonCustom from '@components/SkeletonCustom'

// React-hook-from Imports

// React-query Imports

// libs Imports
import { useCreate } from '@libs/react-query/hooks/common-system/useUserProfileSettingProgram'

// Utils Imports
import { getUserData } from '@utils/user-profile/userLoginProfile'

// _template Imports
import { useDxContext } from '@/_template/DxContextProvider'

// My Components Imports
import { MENU_ID } from './env'
import type { FormDataPage } from './validationSchema'

const GroupOption = [
  { value: 'US', label: 'US' },
  { value: 'CN', label: 'CN' }
]

function SearchFilters() {
  // Context
  const { setIsEnableFetching } = useDxContext()

  // States

  // react-hook-form
  const { setValue, getValues, control, handleSubmit } = useFormContext<FormDataPage>()
  const { isLoading } = useFormState()

  // Function
  const onHandleClearSearchFilters = () => {
    setValue('searchFilters', {
      vendorName: '',
      group: null
    })
    setIsEnableFetching(true)
    handleAdd()
  }

  // #region Function - react-hook-form
  const onSubmit: SubmitHandler<FormDataPage> = () => {
    setIsEnableFetching(true)
    handleAdd()
  }

  const onError: SubmitErrorHandler<FormDataPage> = data => {
    console.log(getValues())
    console.log(data)
  }

  const handleAdd = () => {
    const dataItem = {
      USER_ID: getUserData().USER_ID,
      APPLICATION_ID: import.meta.env.VITE_APPLICATION_ID,
      MENU_ID: MENU_ID.toString(),
      USER_PROFILE_SETTING_PROGRAM_DATA: {
        searchFilters: {
          vendorName: getValues('searchFilters.vendorName'),
          group: getValues('searchFilters.group')
        },
        searchResults: {
          agGridState: getValues('searchResults.agGridState')
        }
      } as FormDataPage
    }

    mutate(dataItem)
  }

  const onMutateSuccess = () => {}

  const onMutateError = (e: any) => {}

  const { mutate, isError, error } = useCreate(onMutateSuccess, onMutateError)

  // #endregion Function - react-hook-form

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
                  name='searchFilters.group'
                  control={control}
                  render={({ field: { ref, ...fieldProps } }) => (
                    <SelectCustom
                      {...fieldProps}
                      options={GroupOption}
                      isClearable
                      label='Group'
                      placeholder='Select ...'
                      classNamePrefix='select'
                    />
                  )}
                />
              </Grid>
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

export default SearchFilters
