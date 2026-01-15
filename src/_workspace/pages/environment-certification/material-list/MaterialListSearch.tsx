import { Dispatch, SetStateAction, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { Controller, SubmitErrorHandler, SubmitHandler, useFormContext, useFormState } from 'react-hook-form'

import { Button, Card, CardContent, CardHeader, Collapse, Grid, IconButton } from '@mui/material'

import classNames from 'classnames'

// Components Imports
import CustomTextField from '@core/components/mui/TextField'
import SelectCustom from '@/components/react-select/SelectCustom'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'

// types Imports
import type { FormData } from './page'

// React Query Imports
import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useMaterialListData'

import { MENU_ID } from './env'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'

import SearchIcon from '@mui/icons-material/Search'

import {
  fetchItemCategoryCanBeSoldByLikeItemCategoryNameAndInuse,
  ItemCategoryOption
} from '@/_workspace/react-select/async-promise-load-options/fetchItemCategory'
import {
  fetchProductCategoryByLikeProductCategoryNameAndInuse,
  ProductCategoryOption
} from '@/_workspace/react-select/async-promise-load-options/fetchProductCategory'
import {
  fetchProductMainByLikeProductMainNameAndInuse,
  fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse,
  ProductMainOption
} from '@/_workspace/react-select/async-promise-load-options/fetchProductMain'
import {
  fetchProductSubByLikeProductSubNameAndInuse,
  fetchProductSubByLikeProductSubNameAndProductCategoryIdAndInuse,
  fetchProductSubByLikeProductSubNameAndProductMainIdAndInuse,
  ProductSubOption
} from '@/_workspace/react-select/async-promise-load-options/fetchProductSub'
import {
  fetchProductTypeByLikeProductTypeNameAndInuse,
  fetchProductTypeByLikeProductTypeNameAndProductCategoryIdAndInuse,
  fetchProductTypeByLikeProductTypeNameAndProductMainIdAndInuse,
  fetchProductTypeByLikeProductTypeNameAndProductSubIdAndInuse,
  ProductTypeOption
} from '@/_workspace/react-select/async-promise-load-options/fetchProductType'
import {
  CustomerInvoiceToOption,
  fetchCustomerInvoiceToByLikeCustomerInvoiceToNameAndInuse
} from '@/_workspace/react-select/async-promise-load-options/customer/fetchCustomerInvoiceTo'

interface Props {
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const MaterialListSearch = ({ setIsEnableFetching }: Props) => {
  // States
  const [collapse, setCollapse] = useState(false)

  // Hooks : react-hook-form
  const { setValue, getValues, control, handleSubmit, watch } = useFormContext<FormData>()
  const { isLoading } = useFormState()

  // Hooks : react-query
  const queryClient = useQueryClient()

  const onResetFormSearch = () => {
    setValue('searchFilters', {
      ITEM_CATEGORY: [],
      PRODUCT_CATEGORY: null,
      PRODUCT_MAIN: null,
      PRODUCT_SUB: null,
      PRODUCT_TYPE: null,
      CUSTOMER_INVOICE_TO: null,
      EXPORT_MODE: {
        value: 1,
        label: 'Product With M-Code'
      }
    })
  }

  // Function : react-hook-form
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
          ITEM_CATEGORY: getValues('searchFilters.ITEM_CATEGORY'),
          PRODUCT_CATEGORY: getValues('searchFilters.PRODUCT_CATEGORY'),
          PRODUCT_MAIN: getValues('searchFilters.PRODUCT_MAIN'),
          PRODUCT_SUB: getValues('searchFilters.PRODUCT_SUB'),
          PRODUCT_TYPE: getValues('searchFilters.PRODUCT_TYPE'),
          CUSTOMER_INVOICE_TO: getValues('searchFilters.CUSTOMER_INVOICE_TO')
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
      }
    }

    mutate(dataItem)
  }

  const onMutateSuccess = () => {
    console.log('onMutateSuccess')
  }

  const onMutateError = (e: any) => {
    console.log('onMutateError', e)
  }

  const { mutate } = useCreate(onMutateSuccess, onMutateError)

  return (
    <Card style={{ overflow: 'visible', zIndex: 4 }}>
      <CardHeader
        title='Search filters'
        action={
          <IconButton size='small' aria-label='collapse' onClick={() => setCollapse(!collapse)}>
            <i className={classNames(collapse ? 'tabler-chevron-down' : 'tabler-chevron-up', 'text-xl')} />
          </IconButton>
        }
      />
      <Collapse in={!collapse}>
        <CardContent>
          {isLoading ? (
            <>Loading</>
          ) : (
            <>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={4} lg={4} sx={{ marginBottom: '1rem' }}>
                  <Controller
                    name='searchFilters.ITEM_CATEGORY'
                    control={control}
                    render={({ field: { onChange, ...fieldProps } }) => (
                      <AsyncSelectCustom<ItemCategoryOption>
                        label='Item Category'
                        inputId='ITEM_CATEGORY'
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        value={getValues('searchFilters.ITEM_CATEGORY')}
                        onChange={value => {
                          onChange(value)
                        }}
                        loadOptions={inputValue => {
                          return fetchItemCategoryCanBeSoldByLikeItemCategoryNameAndInuse({
                            itemCategoryName: inputValue,
                            inuse: 1
                          })
                        }}
                        getOptionLabel={data => data.ITEM_CATEGORY_NAME.toString()}
                        getOptionValue={data => data.ITEM_CATEGORY_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select Item Category ...'
                        isMulti
                      />
                    )}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={4} lg={4} sx={{ marginBottom: '1rem' }}>
                  <Controller
                    name='searchFilters.PRODUCT_CATEGORY'
                    control={control}
                    render={({ field: { onChange, ...fieldProps } }) => (
                      <AsyncSelectCustom<ProductCategoryOption>
                        label='Product Category'
                        inputId='PRODUCT_CATEGORY'
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        value={getValues('searchFilters.PRODUCT_CATEGORY')}
                        onChange={value => {
                          onChange(value)

                          setValue('searchFilters.PRODUCT_MAIN', null)
                          setValue('searchFilters.PRODUCT_SUB', null)
                          setValue('searchFilters.PRODUCT_TYPE', null)
                        }}
                        loadOptions={inputValue => {
                          return fetchProductCategoryByLikeProductCategoryNameAndInuse(inputValue, '1')
                        }}
                        getOptionLabel={data => data.PRODUCT_CATEGORY_NAME.toString()}
                        getOptionValue={data => data.PRODUCT_CATEGORY_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select Product Category ...'
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4} lg={4} sx={{ marginBottom: '1rem' }}>
                  <Controller
                    name='searchFilters.PRODUCT_MAIN'
                    control={control}
                    render={({ field: { onChange, ...fieldProps } }) => (
                      <AsyncSelectCustom<ProductMainOption>
                        label='Product Main'
                        inputId='PRODUCT_MAIN'
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        value={getValues('searchFilters.PRODUCT_MAIN')}
                        onChange={value => {
                          onChange(value)

                          setValue('searchFilters.PRODUCT_SUB', null)
                          setValue('searchFilters.PRODUCT_TYPE', null)
                        }}
                        key={watch('searchFilters.PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID}
                        loadOptions={inputValue => {
                          return getValues('searchFilters.PRODUCT_CATEGORY')
                            ? fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse(
                                inputValue,
                                1,
                                getValues('searchFilters.PRODUCT_CATEGORY').PRODUCT_CATEGORY_ID
                              )
                            : fetchProductMainByLikeProductMainNameAndInuse(inputValue, 1)
                        }}
                        getOptionLabel={data => data.PRODUCT_MAIN_NAME.toString()}
                        getOptionValue={data => data.PRODUCT_MAIN_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select Product Main ...'
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4} lg={4} sx={{ marginBottom: '1rem' }}>
                  <Controller
                    name='searchFilters.PRODUCT_SUB'
                    control={control}
                    render={({ field: { onChange, ...fieldProps } }) => (
                      <AsyncSelectCustom<ProductSubOption>
                        label='Product Sub'
                        inputId='PRODUCT_SUB'
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        value={getValues('searchFilters.PRODUCT_SUB')}
                        onChange={value => {
                          onChange(value)

                          setValue('searchFilters.PRODUCT_TYPE', null)
                        }}
                        key={
                          watch('searchFilters.PRODUCT_MAIN')?.PRODUCT_MAIN_ID ||
                          watch('searchFilters.PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID
                        }
                        loadOptions={inputValue => {
                          return getValues('searchFilters.PRODUCT_MAIN')
                            ? fetchProductSubByLikeProductSubNameAndProductMainIdAndInuse(
                                inputValue,
                                1,
                                getValues('searchFilters.PRODUCT_MAIN').PRODUCT_MAIN_ID
                              )
                            : getValues('searchFilters.PRODUCT_CATEGORY')
                              ? fetchProductSubByLikeProductSubNameAndProductCategoryIdAndInuse(
                                  inputValue,
                                  1,
                                  getValues('searchFilters.PRODUCT_CATEGORY').PRODUCT_CATEGORY_ID
                                )
                              : fetchProductSubByLikeProductSubNameAndInuse(inputValue, 1)
                        }}
                        getOptionLabel={data => data.PRODUCT_SUB_NAME.toString()}
                        getOptionValue={data => data.PRODUCT_SUB_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select Product Sub ...'
                      />
                    )}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={4} lg={4} sx={{ marginBottom: '1rem' }}>
                  <Controller
                    name='searchFilters.PRODUCT_TYPE'
                    control={control}
                    render={({ field: { onChange, ...fieldProps } }) => (
                      <AsyncSelectCustom<ProductTypeOption>
                        label='Product Type Code'
                        inputId='PRODUCT_TYPE'
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        value={getValues('searchFilters.PRODUCT_TYPE')}
                        onChange={value => {
                          onChange(value)
                        }}
                        key={
                          watch('searchFilters.PRODUCT_SUB')?.PRODUCT_SUB_ID ||
                          watch('searchFilters.PRODUCT_MAIN')?.PRODUCT_MAIN_ID ||
                          watch('searchFilters.PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID
                        }
                        loadOptions={inputValue => {
                          return getValues('searchFilters.PRODUCT_SUB')
                            ? fetchProductTypeByLikeProductTypeNameAndProductSubIdAndInuse(
                                inputValue,
                                getValues('searchFilters.PRODUCT_SUB').PRODUCT_SUB_ID,
                                1
                              )
                            : getValues('searchFilters.PRODUCT_MAIN')
                              ? fetchProductTypeByLikeProductTypeNameAndProductMainIdAndInuse(
                                  inputValue,
                                  getValues('searchFilters.PRODUCT_MAIN').PRODUCT_MAIN_ID,
                                  1
                                )
                              : getValues('searchFilters.PRODUCT_CATEGORY')
                                ? fetchProductTypeByLikeProductTypeNameAndProductCategoryIdAndInuse(
                                    inputValue,
                                    getValues('searchFilters.PRODUCT_CATEGORY').PRODUCT_CATEGORY_ID,
                                    1
                                  )
                                : fetchProductTypeByLikeProductTypeNameAndInuse(inputValue, 1)
                        }}
                        getOptionLabel={data => data.PRODUCT_TYPE_CODE.toString()}
                        getOptionValue={data => data.PRODUCT_TYPE_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select Product Type Code ...'
                      />
                    )}
                  />
                </Grid>{' '}
                <Grid item xs={12} sm={4} lg={4} sx={{ marginBottom: '1rem' }}>
                  <Controller
                    name='searchFilters.PRODUCT_TYPE'
                    control={control}
                    render={({ field: { onChange, ...fieldProps } }) => (
                      <AsyncSelectCustom<ProductTypeOption>
                        label='Product Type Name'
                        inputId='PRODUCT_TYPE'
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        value={getValues('searchFilters.PRODUCT_TYPE')}
                        onChange={value => {
                          onChange(value)
                        }}
                        key={
                          watch('searchFilters.PRODUCT_SUB')?.PRODUCT_SUB_ID ||
                          watch('searchFilters.PRODUCT_MAIN')?.PRODUCT_MAIN_ID ||
                          watch('searchFilters.PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID
                        }
                        loadOptions={inputValue => {
                          return getValues('searchFilters.PRODUCT_SUB')
                            ? fetchProductTypeByLikeProductTypeNameAndProductSubIdAndInuse(
                                inputValue,
                                getValues('searchFilters.PRODUCT_SUB').PRODUCT_SUB_ID,
                                1
                              )
                            : getValues('searchFilters.PRODUCT_MAIN')
                              ? fetchProductTypeByLikeProductTypeNameAndProductMainIdAndInuse(
                                  inputValue,
                                  getValues('searchFilters.PRODUCT_MAIN').PRODUCT_MAIN_ID,
                                  1
                                )
                              : getValues('searchFilters.PRODUCT_CATEGORY')
                                ? fetchProductTypeByLikeProductTypeNameAndProductCategoryIdAndInuse(
                                    inputValue,
                                    getValues('searchFilters.PRODUCT_CATEGORY').PRODUCT_CATEGORY_ID,
                                    1
                                  )
                                : fetchProductTypeByLikeProductTypeNameAndInuse(inputValue, 1)
                        }}
                        getOptionLabel={data => data.PRODUCT_TYPE_NAME.toString()}
                        getOptionValue={data => data.PRODUCT_TYPE_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select Product Type Name ...'
                      />
                    )}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={4} lg={4} sx={{ marginBottom: '1rem' }}>
                  <Controller
                    name='searchFilters.CUSTOMER_INVOICE_TO'
                    control={control}
                    render={({ field: { onChange, ...fieldProps } }) => (
                      <AsyncSelectCustom<CustomerInvoiceToOption>
                        label='Customer Invoice To'
                        inputId='CUSTOMER_INVOICE_TO'
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        value={getValues('searchFilters.CUSTOMER_INVOICE_TO')}
                        onChange={value => {
                          onChange(value)
                        }}
                        loadOptions={inputValue => {
                          return fetchCustomerInvoiceToByLikeCustomerInvoiceToNameAndInuse(inputValue, 1)
                        }}
                        getOptionLabel={data => data.CUSTOMER_INVOICE_TO_NAME.toString()}
                        getOptionValue={data => data.CUSTOMER_INVOICE_TO_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select Customer Invoice To ...'
                      />
                    )}
                  />
                </Grid>
              </Grid>
              <Grid container className='mbs-0' spacing={6}>
                <Grid item xs={12} className='flex gap-3'>
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
      </Collapse>
    </Card>
  )
}

export default MaterialListSearch
