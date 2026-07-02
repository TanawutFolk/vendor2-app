// React Imports
import { Dispatch, SetStateAction } from 'react'

// MUI Imports
import { Button, Card, CardContent, CardHeader, Grid } from '@mui/material'

// Third-party Imports

// Components Imports

// react-hook-from Imports
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, useFormContext, useFormState } from 'react-hook-form'

import { useQueryClient } from '@tanstack/react-query'

// import AsyncCreatableSelect from 'react-select/async-creatable'

import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useProductSubData'

// import { fetchProductCategoryByLikeProductCategoryNameAndInuse } from '@/libs/react-select/AsyncPromiseLoadOptions/fetchProductCategory'

// react-select Imports
import CustomTextField from '@components/mui/TextField'

// react-query Imports

// Types
import { fetchProductCategoryByLikeProductCategoryNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchProductCategory'
import {
  fetchProductMainByLikeProductMainNameAndInuse,
  fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchProductMain'
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
function ProductSubSearch({ setIsEnableFetching }: Props) {
  // States

  // Hooks
  // Hooks : react-hook-form
  const { setValue, getValues, control, handleSubmit, watch } = useFormContext<FormData>()

  const { isLoading } = useFormState()

  // Hooks : react-query
  const queryClient = useQueryClient()

  // Function
  const onResetFormSearch = () => {
    setValue('searchFilters', {
      // customerOrderFromId: '',
      productCategory: null,
      productMain: null,
      productSubName: '',
      productSubCode: '',
      productSubAlphabet: '',
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
          productCategory: getValues('searchFilters.productCategory'),
          productMain: getValues('searchFilters.productMain'),
          productSubName: getValues('searchFilters.productSubName'),
          productSubCode: getValues('searchFilters.productMainCode'),
          productSubAlphabet: getValues('searchFilters.productMainAlphabet'),
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
            <Grid container spacing={4}>
              <Grid container item xs={12} spacing={4}>
                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.productCategory'
                    control={control}
                    render={({ field: { onChange, ...fieldProps } }) => (
                      <AsyncSelectCustom
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        loadOptions={inputValue => {
                          return fetchProductCategoryByLikeProductCategoryNameAndInuse(inputValue, 1)
                        }}
                        onChange={value => {
                          onChange(value)
                          setValue('searchFilters.productMain', null)
                        }}
                        getOptionLabel={data => data?.PRODUCT_CATEGORY_NAME || ''}
                        getOptionValue={data => data?.PRODUCT_CATEGORY_ID?.toString() || ''}
                        classNamePrefix='select'
                        label='Product Category Name'
                        placeholder='Enter ...'
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.productMain'
                    control={control}
                    render={({ field: { ...fieldProps } }) => (
                      <AsyncSelectCustom
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        key={watch('searchFilters.productCategory')?.PRODUCT_CATEGORY_ID}
                        loadOptions={inputValue => {
                          if (getValues('searchFilters.productCategory')) {
                            return fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse(
                              inputValue,
                              1,
                              watch('searchFilters.productCategory')?.PRODUCT_CATEGORY_ID
                            )
                          } else {
                            return fetchProductMainByLikeProductMainNameAndInuse(inputValue || '', 1)
                          }
                        }}
                        getOptionLabel={data => data?.PRODUCT_MAIN_NAME || ''}
                        getOptionValue={data => data?.PRODUCT_MAIN_ID?.toString() || ''}
                        classNamePrefix='select'
                        label='Product Main Name'
                        placeholder='Enter ...'
                        // autoComplete='off'
                      />
                    )}
                  />
                </Grid>
              </Grid>
              <Grid item xs={12} sm={4} lg={3}>
                <Controller
                  name='searchFilters.productSubCode'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Product Sub Code'
                      placeholder='Enter ...'
                      autoComplete='off'
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4} lg={3}>
                <Controller
                  name='searchFilters.productSubName'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Product Sub Name'
                      placeholder='Enter ...'
                      autoComplete='off'
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4} lg={3}>
                <Controller
                  name='searchFilters.productSubAlphabet'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Product Sub Alphabet'
                      placeholder='Enter ...'
                      autoComplete='off'
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

export default ProductSubSearch
