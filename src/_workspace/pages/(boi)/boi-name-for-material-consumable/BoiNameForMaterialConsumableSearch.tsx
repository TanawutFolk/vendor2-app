// React Imports
import { Dispatch, SetStateAction, useState } from 'react'

// MUI Imports

import { Button, Card, CardContent, CardHeader, Grid } from '@mui/material'

// Third-party Imports

// Components Imports

// react-hook-from Imports
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, useFormContext, useFormState } from 'react-hook-form'

import { useQueryClient } from '@tanstack/react-query'

// import AsyncCreatableSelect from 'react-select/async-creatable'

import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useBoiNameForMaterialConsumableData'

// import { fetchProductCategoryByLikeProductCategoryNameAndInuse } from '@/libs/react-select/AsyncPromiseLoadOptions/fetchProductCategory'

// react-select Imports

// react-query Imports

// Types
import { fetchBoiNameForMaterialConsumableByLikeBoiNameForMaterialConsumableAndInuse } from '@/_workspace/react-select/async-promise-load-options/boi/fetchBoiNameForMaterial'
import { fetchBoiProjectByLikeBoiProjectAndInuse } from '@/_workspace/react-select/async-promise-load-options/boi/fetchBoiProject'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import SelectCustom from '@/components/react-select/SelectCustom'
import SkeletonCustom from '@/components/SkeletonCustom'
import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import StatusOption from '@/libs/react-select/option/StatusOption'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { MENU_ID } from './env'
import type { FormData } from './page'

interface Props {
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}
function BoiNameForMaterialConsumableSearch({ setIsEnableFetching }: Props) {
  // States

  // Hooks
  // Hooks : react-hook-form
  const { setValue, getValues, control, handleSubmit } = useFormContext<FormData>()

  const { isLoading } = useFormState()

  // Hooks : react-query
  const queryClient = useQueryClient()

  // Function
  const onResetFormSearch = () => {
    setValue('searchFilters', {
      boiProject: null,
      boiGroupNo: null,
      status: null
    })
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    handleAdd()
  }

  // Function - react-hook-form
  const onSubmit: SubmitHandler<FormData> = () => {
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    handleAdd()
  }

  const onError: SubmitErrorHandler<FormData> = data => {
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
          // customerOrderFromId: getValues('searchFilters.customerOrderFromId'),
          boiProject: getValues('searchFilters.boiProject'),
          boiGroupNo: getValues('searchFilters.boiGroupNo'),
          status: getValues('searchFilters.status')
        },
        searchResults: {
          pageSize: getValues('searchResults.pageSize'),
          columnFilters: getValues('searchResults.columnFilters'),
          sorting: getValues('searchResults.sorting'),
          density: getValues('searchResults.density'),
          columnVisibility: getValues('searchResults.columnVisibility'),
          columnPinning: getValues('searchResults.columnPinning'),
          columnOrder: getValues('searchResults.columnOrder'),
          columnFilterFns: getValues('searchResults.columnFilterFns')
        }
      } as FormData
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
                  name='searchFilters.boiProject'
                  control={control}
                  render={({ field: { onChange, ...fieldProps } }) => (
                    <AsyncSelectCustom
                      {...fieldProps}
                      isClearable
                      cacheOptions
                      defaultOptions
                      loadOptions={inputValue => {
                        return fetchBoiProjectByLikeBoiProjectAndInuse(inputValue, 1)
                      }}
                      onChange={value => {
                        onChange(value)
                        // setValue('searchFilters.process', null)
                      }}
                      getOptionLabel={data => data?.BOI_PROJECT_NAME || ''}
                      getOptionValue={data => data?.BOI_PROJECT_ID?.toString() || ''}
                      classNamePrefix='select'
                      label='BOI Project Name'
                      placeholder='Enter ...'
                      // autoComplete='off'
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4} lg={3}>
                <Controller
                  name='searchFilters.boiGroupNo'
                  control={control}
                  render={({ field: { onChange, ...fieldProps } }) => (
                    <AsyncSelectCustom
                      {...fieldProps}
                      isClearable
                      cacheOptions
                      defaultOptions
                      loadOptions={inputValue => {
                        return fetchBoiNameForMaterialConsumableByLikeBoiNameForMaterialConsumableAndInuse(
                          inputValue,
                          1
                        )
                      }}
                      onChange={value => {
                        onChange(value)
                        // setValue('searchFilters.process', null)
                      }}
                      getOptionLabel={data => data?.BOI_GROUP_NO || ''}
                      getOptionValue={data => data?.BOI_PROJECT_ID?.toString() || ''}
                      classNamePrefix='select'
                      label='BOI Group No'
                      placeholder='Enter ...'
                      // autoComplete='off'
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
                      options={StatusOption}
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
                <Button variant='tonal' color='secondary' type='reset' onClick={onResetFormSearch}>
                  Clear
                </Button>
              </Grid>
            </Grid>
          </>
        )}
      </CardContent>
      {/* </Collapse> */}
    </Card>
  )
}

export default BoiNameForMaterialConsumableSearch
