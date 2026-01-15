// React Imports
import { Dispatch, SetStateAction, useState } from 'react'
// MUI Imports
import SearchIcon from '@mui/icons-material/Search'
import { Button, Card, CardContent, CardHeader, Grid } from '@mui/material'
// Third-party Imports
// react-hook-from Imports
import { useQueryClient } from '@tanstack/react-query'
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, useFormContext, useFormState } from 'react-hook-form'
// react-select Imports
import CustomTextField from '@components/mui/TextField'
// react-query Imports
import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useProductTypeData'
import {
  fetchItemCategoryByItemCategoryNameAndInuse,
  fetchItemCategoryCanBeSoldByLikeItemCategoryNameAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchItemCategory'
import { fetchProductCategoryByLikeProductCategoryNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchProductCategory'
import {
  fetchProductMainByLikeProductMainNameAndInuse,
  fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchProductMain'
import {
  fetchProductSubByLikeProductSubNameAndInuse,
  fetchProductSubByLikeProductSubNameAndProductCategoryIdAndInuse,
  fetchProductSubByLikeProductSubNameAndProductMainIdAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchProductSub'
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
function ProductTypeSearch({ setIsEnableFetching }: Props) {
  // States

  // Hooks : react-hook-form
  const { setValue, getValues, control, handleSubmit, watch } = useFormContext<FormData>()

  const { isLoading } = useFormState()

  // Hooks : react-query
  const queryClient = useQueryClient()

  // Function
  const onResetFormSearch = () => {
    setValue('searchFilters', {
      // customerOrderFromId: '',
      productTypeName: '',
      productTypeCode: '',
      itemCategory: '',
      productCategory: '',
      productMain: '',
      productSub: '',
      productItemCode: '',
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
          itemCategory: getValues('searchFilters.itemCategory') || '',
          productCategory: getValues('searchFilters.productCategory') || '',
          productMain: getValues('searchFilters.productMain') || '',
          productSub: getValues('searchFilters.productSub') || '',
          productTypeName: getValues('searchFilters.productTypeName') || '',
          productTypeCode: getValues('searchFilters.productTypeCode') || '',
          statusWorking: '1',
          status: getValues('searchFilters.status')?.value
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
    console.log(dataItem)

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
          <SkeletonCustom />
        ) : (
          <>
            <Grid container spacing={4}>
              <Grid container item xs={12} spacing={2}>
                <Grid item xs={12} sm={3} lg={3}>
                  <Controller
                    name='searchFilters.itemCategory'
                    control={control}
                    defaultValue={null}
                    render={({ field: { ref, ...fieldProps } }) => (
                      <AsyncSelectCustom
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        loadOptions={inputValue => {
                          return fetchItemCategoryCanBeSoldByLikeItemCategoryNameAndInuse({
                            itemCategoryName: inputValue,
                            inuse: 1
                          })
                        }}
                        getOptionLabel={data => data?.ITEM_CATEGORY_NAME || ''}
                        getOptionValue={data => data?.ITEM_CATEGORY_ID?.toString() || ''}
                        classNamePrefix='select'
                        label='Item Category Name'
                        placeholder='Select ...'
                      />
                    )}
                  />
                </Grid>
              </Grid>
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
                        loadOptions={inputValue =>
                          fetchProductCategoryByLikeProductCategoryNameAndInuse(inputValue, '1')
                        }
                        onChange={value => {
                          onChange(value)
                          setValue('searchFilters.productMain', null)
                          setValue('searchFilters.productSub', null)
                        }}
                        getOptionLabel={data => data?.PRODUCT_CATEGORY_NAME || ''}
                        getOptionValue={data => data?.PRODUCT_CATEGORY_ID?.toString() || ''}
                        classNamePrefix='select'
                        label='Product Category Name'
                        placeholder='Select ...'
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.productMain'
                    control={control}
                    render={({ field: { onChange, ...fieldProps } }) => (
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
                        onChange={value => {
                          onChange(value)
                          setValue('searchFilters.productSub', null)
                        }}
                        getOptionLabel={data => data?.PRODUCT_MAIN_NAME || ''}
                        getOptionValue={data => data?.PRODUCT_MAIN_ID?.toString() || ''}
                        classNamePrefix='select'
                        label='Product Main Name'
                        placeholder='Select ...'
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.productSub'
                    control={control}
                    render={({ field: { onChange, ...fieldProps } }) => (
                      <AsyncSelectCustom
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        key={`${watch('searchFilters.productCategory')?.PRODUCT_CATEGORY_ID}_${watch('searchFilters.productMain')?.PRODUCT_MAIN_ID}`}
                        loadOptions={inputValue => {
                          if (getValues('searchFilters.productMain')) {
                            return fetchProductSubByLikeProductSubNameAndProductMainIdAndInuse(
                              inputValue,
                              watch('searchFilters.productMain')?.PRODUCT_MAIN_ID,
                              1
                            )
                          } else if (getValues('searchFilters.productCategory')) {
                            return fetchProductSubByLikeProductSubNameAndProductCategoryIdAndInuse(
                              inputValue || '',
                              watch('searchFilters.productCategory')?.PRODUCT_CATEGORY_ID,
                              1
                            )
                          } else {
                            return fetchProductSubByLikeProductSubNameAndInuse(inputValue || '', 1)
                          }
                        }}
                        onChange={value => {
                          onChange(value)
                        }}
                        getOptionLabel={data => data?.PRODUCT_SUB_NAME || ''}
                        getOptionValue={data => data?.PRODUCT_SUB_ID?.toString() || ''}
                        classNamePrefix='select'
                        label='Product Sub Name'
                        placeholder='Select ...'
                      />
                    )}
                  />
                </Grid>
              </Grid>
              <Grid item xs={12} sm={4} lg={3}>
                <Controller
                  name='searchFilters.productTypeCode'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Product Type Code for SCT'
                      placeholder='Enter ...'
                      autoComplete='off'
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4} lg={6}>
                <Controller
                  name='searchFilters.productTypeName'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Product Type Name'
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
    </Card>
  )
}

export default ProductTypeSearch
