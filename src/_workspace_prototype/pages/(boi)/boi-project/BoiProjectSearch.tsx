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

import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useBoiProjectData'

// import { fetchProductCategoryByLikeProductCategoryNameAndInuse } from '@/libs/react-select/AsyncPromiseLoadOptions/fetchProductCategory'

// react-select Imports

// react-query Imports

// Types
import {
  fetchBoiProductGroupByLikeBoiProductGroup,
  fetchBoiProjectByLikeBoiProjectAndInuse,
  fetchBoiProjectCodeByLikeBoiProjectCodeAndInuse
} from '@/_workspace/react-select/async-promise-load-options/boi/fetchBoiProject'
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
function BoiProjectSearch({ setIsEnableFetching }: Props) {
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
      boiProductGroupName: '',
      boiProjectCode: '',
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
          boiProjectCode: getValues('searchFilters.boiProjectCode'),
          boiProductGroupName: getValues('searchFilters.boiProductGroupName'),
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
    console.log('Knaa', dataItem)

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
        // action={
        //   <IconButton size='small' aria-label='collapse' onClick={() => setCollapse(!collapse)}>
        //     <i className={classNames(collapse ? 'tabler-chevron-down' : 'tabler-chevron-up', 'text-xl')} />
        //   </IconButton>
        // }
        // avatar={<i className='tabler-search text-xl' />}
        titleTypographyProps={{ variant: 'h5' }}
        sx={{ '& .MuiCardHeader-avatar': { mr: 3 } }}
      />
      {/* <Collapse in={!collapse}> */}
      <CardContent>
        {isError ? <div>An error occurred: {error.message}</div> : null}
        {isLoading ? (
          <>
            <SkeletonCustom />
          </>
        ) : (
          <>
            {/* <Grid container spacing={6}>
                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.productCategoryCode'
                    control={control}
                    render={({ field: { ...fieldProps } }) => (
                      <AsyncSelectCustom
                        label='Product Category'
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        loadOptions={inputValue => {
                          return fetchProductCategoryByLikeProductCategoryNameAndInuse(inputValue, '1')
                        }}
                        getOptionLabel={data => data.PRODUCT_CATEGORY_NAME}
                        getOptionValue={data => data.PRODUCT_CATEGORY_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select Product Category ...'
                      />
                    )}
                  />
                </Grid>
              </Grid> */}

            {/* <AsyncCreatableSelectCustom
                label='Test Label'
                isClearable
                cacheOptions
                defaultOptions
                classNamePrefix='select'
                loadOptions={inputValue =>
                  fetchProductCategoryByLikeProductCategoryNameAndInuse(inputValue, '1').then(value =>
                    value.map(data => ({
                      ...data,
                      value: data.PRODUCT_CATEGORY_ID,
                      label: data.PRODUCT_CATEGORY_NAME
                    }))
                  )
                }

                // {...(errors?.searchFilters?.productCategory && {
                //   error: true,
                //   helperText: errors?.searchFilters?.productCategory.message
                // })}
              /> */}

            <Grid container spacing={4}>
              {/* <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.productCategoryCode'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Product Category Code'
                        placeholder='Enter Product Main Code'
                        autoComplete='off'
                      />
                    )}
                  />
                </Grid> */}
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
                  name='searchFilters.boiProjectCode'
                  control={control}
                  render={({ field: { onChange, ...fieldProps } }) => (
                    <AsyncSelectCustom
                      {...fieldProps}
                      isClearable
                      cacheOptions
                      defaultOptions
                      loadOptions={inputValue => {
                        return fetchBoiProjectCodeByLikeBoiProjectCodeAndInuse(inputValue, 1)
                      }}
                      onChange={value => {
                        onChange(value)
                        // setValue('searchFilters.process', null)
                      }}
                      getOptionLabel={data => data?.BOI_PROJECT_CODE || ''}
                      getOptionValue={data => data?.BOI_PROJECT_ID?.toString() || ''}
                      classNamePrefix='select'
                      label='BOI Project Code'
                      placeholder='Enter ...'
                      // autoComplete='off'
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4} lg={3}>
                <Controller
                  name='searchFilters.boiProductGroupName'
                  control={control}
                  render={({ field: { onChange, ...fieldProps } }) => (
                    <AsyncSelectCustom
                      {...fieldProps}
                      isClearable
                      cacheOptions
                      defaultOptions
                      loadOptions={inputValue => {
                        return fetchBoiProductGroupByLikeBoiProductGroup(inputValue)
                      }}
                      onChange={value => {
                        onChange(value)
                        // setValue('searchFilters.process', null)
                      }}
                      getOptionLabel={data => data?.BOI_PRODUCT_GROUP_NAME || ''}
                      getOptionValue={data => data?.BOI_PROJECT_ID?.toString() || ''}
                      classNamePrefix='select'
                      label='BOI Product Group Name'
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

                    // <CustomTextField
                    //   {...field}
                    //   options={StatusOption}
                    //   fullWidth
                    //   label='Status'
                    //   placeholder=''
                    //   autoComplete='off'
                    // />
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

export default BoiProjectSearch
