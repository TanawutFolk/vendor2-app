// React Imports
import type { Dispatch, SetStateAction } from 'react'

// MUI Imports
import { Button, Card, CardContent, CardHeader, Divider, Grid, Typography } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, useFormContext, useFormState } from 'react-hook-form'

// Component Imports
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
import { fetchProductTypeByLikeProductTypeNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchProductType'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'

import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useYieldRateData'
import { fetchCustomerInvoiceToByLikeCustomerInvoiceToNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/customer/fetchCustomerInvoiceTo'
import { fetchItemCategoryCanBeSoldByLikeItemCategoryNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchItemCategory'
import CustomTextField from '@/components/mui/TextField'
import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { MENU_ID } from './env'

interface Props {
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const YieldRateSearch = ({ setIsEnableFetching }: Props) => {
  // const [isFetchData, setIsFetchData] = useState(false)

  // const [isEnableFetching, setIsEnableFetching] = useState(false)
  const { setValue, getValues, control, handleSubmit, watch } = useFormContext<FormData>()

  const { errors } = useFormState({ control })
  // Hooks : react-query
  const queryClient = useQueryClient()

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
          FISCAL_YEAR: getValues('searchFilters.FISCAL_YEAR'),
          // SCT_REASON_SETTING: getValues('SCT_REASON_SETTING'),
          PRODUCT_CATEGORY: getValues('searchFilters.PRODUCT_CATEGORY'),
          PRODUCT_MAIN: getValues('searchFilters.PRODUCT_MAIN'),
          PRODUCT_SUB: getValues('searchFilters.PRODUCT_SUB'),
          PRODUCT_TYPE: getValues('searchFilters.PRODUCT_TYPE'),
          ITEM_CATEGORY: getValues('searchFilters.ITEM_CATEGORY'),
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

  // Function
  const onResetFormSearch = () => {
    setValue('searchFilters.FISCAL_YEAR', '', { shouldDirty: true, shouldTouch: true, shouldValidate: true })
    setValue('searchFilters.PRODUCT_CATEGORY', null, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    })
    setValue('searchFilters.PRODUCT_MAIN', null, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
    setValue('searchFilters.PRODUCT_SUB', null, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
    setValue('searchFilters.PRODUCT_TYPE', null, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
    setValue('searchFilters.ITEM_CATEGORY', null, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
    setValue('searchFilters.CUSTOMER_INVOICE_TO', null, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    })

    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    handleAdd()
  }

  return (
    <>
      <Card style={{ overflow: 'visible', zIndex: 4 }}>
        <CardHeader title='Search filters' />
        <CardContent>
          <>
            <Grid container sx={{ position: 'relative', top: 0 }} spacing={4}>
              <Grid item xs={12}>
                <Divider textAlign='left'>
                  <Typography variant='body2' color='primary'>
                    Header
                  </Typography>
                </Divider>
              </Grid>

              <Grid item xs={12} sm={2}>
                <Controller
                  name='searchFilters.FISCAL_YEAR'
                  control={control}
                  render={({ field: { ...fieldProps } }) => (
                    <CustomTextField
                      {...fieldProps}
                      fullWidth
                      autoComplete='off'
                      label='Fiscal Year'
                      placeholder='Enter ...'
                      {...(errors?.searchFilters?.FISCAL_YEAR && {
                        error: true,
                        helperText: errors?.searchFilters?.FISCAL_YEAR.message
                      })}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} mt={3}>
                <Divider textAlign='left'>
                  <Typography variant='body2' color='primary'>
                    Product
                  </Typography>
                </Divider>
              </Grid>
              <Grid container item xs={12} spacing={4}>
                <Grid item xs={12} sm={2}>
                  <Controller
                    name='searchFilters.ITEM_CATEGORY'
                    control={control}
                    render={({ field: { ref, ...fieldProps } }) => (
                      <AsyncSelectCustom
                        {...fieldProps}
                        label='Item Category'
                        isClearable
                        cacheOptions
                        defaultOptions
                        loadOptions={inputValue => {
                          return fetchItemCategoryCanBeSoldByLikeItemCategoryNameAndInuse({
                            itemCategoryName: inputValue,
                            inuse: 1
                          })
                        }}
                        getOptionLabel={data => data?.ITEM_CATEGORY_NAME.toString()}
                        getOptionValue={data => data.ITEM_CATEGORY_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select ...'
                        {...(errors?.searchFilters?.itemCategory && {
                          error: true,
                          helperText: errors?.searchFilters?.itemCategory.message
                        })}
                      />
                    )}
                  />
                </Grid>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Controller
                  name='searchFilters.PRODUCT_CATEGORY'
                  control={control}
                  render={({ field: { ref, onChange, ...fieldProps } }) => (
                    <>
                      <AsyncSelectCustom
                        {...fieldProps}
                        label='Product Category'
                        isClearable
                        cacheOptions
                        defaultOptions
                        onChange={e => {
                          onChange(e)
                          setValue('searchFilters.productMain', null)
                          setValue('searchFilters.productSub', null)
                          setValue('searchFilters.productType', null)
                        }}
                        loadOptions={inputValue => {
                          return fetchProductCategoryByLikeProductCategoryNameAndInuse(inputValue, '1')
                        }}
                        getOptionLabel={data => data?.PRODUCT_CATEGORY_NAME.toString()}
                        getOptionValue={data => data.PRODUCT_CATEGORY_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select ...'
                        {...(errors?.searchFilters?.productCategory && {
                          error: true,
                          helperText: errors?.searchFilters?.productCategory.message
                        })}
                      />
                    </>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name='searchFilters.PRODUCT_MAIN'
                  control={control}
                  render={({ field: { ref, onChange, ...fieldProps } }) => (
                    <>
                      <AsyncSelectCustom
                        key={`${watch('searchFilters.productCategory')?.PRODUCT_CATEGORY_ID}`}
                        {...fieldProps}
                        label='Product Main'
                        isClearable
                        cacheOptions
                        defaultOptions
                        onChange={e => {
                          onChange(e)
                          setValue('searchFilters.productSub', null)
                          setValue('searchFilters.productType', null)
                        }}
                        loadOptions={inputValue => {
                          const productCategoryId = getValues('searchFilters.productCategory')?.PRODUCT_CATEGORY_ID
                          if (productCategoryId) {
                            return fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse(
                              inputValue,
                              1,
                              productCategoryId
                            )
                          } else {
                            return fetchProductMainByLikeProductMainNameAndInuse(inputValue, 1)
                          }
                        }}
                        getOptionLabel={data => data?.PRODUCT_MAIN_NAME.toString()}
                        getOptionValue={data => data.PRODUCT_MAIN_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select ...'
                        {...(errors?.searchFilters?.productMain && {
                          error: true,
                          helperText: errors?.searchFilters?.productMain.message
                        })}
                      />
                    </>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name='searchFilters.PRODUCT_SUB'
                  control={control}
                  render={({ field: { ref, ...fieldProps } }) => (
                    <AsyncSelectCustom
                      key={`${watch('searchFilters.productCategory')?.PRODUCT_CATEGORY_ID}_${watch('searchFilters.productMain')?.PRODUCT_MAIN_ID}`}
                      {...fieldProps}
                      label='Product Sub'
                      isClearable
                      cacheOptions
                      defaultOptions
                      loadOptions={inputValue => {
                        const productCategoryId = getValues('searchFilters.productCategory')?.PRODUCT_CATEGORY_ID
                        const productMainId = getValues('searchFilters.productMain')?.PRODUCT_MAIN_ID

                        if (productMainId) {
                          return fetchProductSubByLikeProductSubNameAndProductMainIdAndInuse(
                            inputValue,
                            productMainId,
                            1
                          )
                        } else if (productCategoryId) {
                          return fetchProductSubByLikeProductSubNameAndProductCategoryIdAndInuse(
                            inputValue,
                            productCategoryId,
                            1
                          )
                        } else {
                          return fetchProductSubByLikeProductSubNameAndInuse(inputValue, 1)
                        }
                      }}
                      getOptionLabel={data => data?.PRODUCT_SUB_NAME.toString()}
                      getOptionValue={data => data.PRODUCT_SUB_ID.toString()}
                      classNamePrefix='select'
                      placeholder='Select ...'
                      {...(errors?.searchFilters?.productSub && {
                        error: true,
                        helperText: errors?.searchFilters?.productSub.message
                      })}
                    />
                  )}
                />
              </Grid>
              <Grid container item xs={12} spacing={4}>
                <Grid item xs={12} sm={2}>
                  <Controller
                    name='searchFilters.PRODUCT_TYPE'
                    control={control}
                    render={({ field: { ref, ...fieldProps } }) => (
                      <AsyncSelectCustom
                        key={`${watch('searchFilters.productCategory')?.PRODUCT_CATEGORY_ID}_${watch('searchFilters.productMain')?.PRODUCT_MAIN_ID}_${watch('searchFilters.productSub')?.PRODUCT_SUB_ID}`}
                        {...fieldProps}
                        label='Product Type Code'
                        isClearable
                        cacheOptions
                        defaultOptions
                        loadOptions={inputValue => {
                          return fetchProductTypeByLikeProductTypeNameAndInuse({
                            PRODUCT_TYPE_NAME: '',
                            INUSE: 1,
                            PRODUCT_TYPE_CODE: inputValue,
                            PRODUCT_SUB_ID: getValues('searchFilters.productSub')?.PRODUCT_SUB_ID || '',
                            PRODUCT_MAIN_ID: getValues('searchFilters.productMain')?.PRODUCT_MAIN_ID || '',
                            PRODUCT_CATEGORY_ID: getValues('searchFilters.productCategory')?.PRODUCT_CATEGORY_ID || ''
                          })
                        }}
                        getOptionLabel={data => data?.PRODUCT_TYPE_CODE.toString()}
                        getOptionValue={data => data.PRODUCT_TYPE_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select ...'
                        {...(errors?.searchFilters?.productType && {
                          error: true,
                          helperText: errors?.searchFilters?.productType.message
                        })}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name='searchFilters.PRODUCT_TYPE'
                    control={control}
                    render={({ field: { ref, ...fieldProps } }) => (
                      <AsyncSelectCustom
                        key={`${watch('searchFilters.productCategory')?.PRODUCT_CATEGORY_ID}_${watch('searchFilters.productMain')?.PRODUCT_MAIN_ID}_${watch('searchFilters.productSub')?.PRODUCT_SUB_ID}`}
                        {...fieldProps}
                        label='Product Type Name'
                        isClearable
                        cacheOptions
                        defaultOptions
                        loadOptions={inputValue => {
                          return fetchProductTypeByLikeProductTypeNameAndInuse({
                            PRODUCT_TYPE_NAME: inputValue,
                            INUSE: 1,
                            PRODUCT_TYPE_CODE: '',
                            PRODUCT_SUB_ID: getValues('searchFilters.productSub')?.PRODUCT_SUB_ID || '',
                            PRODUCT_MAIN_ID: getValues('searchFilters.productMain')?.PRODUCT_MAIN_ID || '',
                            PRODUCT_CATEGORY_ID: getValues('searchFilters.productCategory')?.PRODUCT_CATEGORY_ID || ''
                          })
                        }}
                        getOptionLabel={data => data?.PRODUCT_TYPE_NAME.toString()}
                        getOptionValue={data => data.PRODUCT_TYPE_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select ...'
                        {...(errors?.searchFilters?.productType && {
                          error: true,
                          helperText: errors?.searchFilters?.productType.message
                        })}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name='searchFilters.CUSTOMER_INVOICE_TO'
                    control={control}
                    render={({ field: { ref, ...fieldProps } }) => (
                      <AsyncSelectCustom
                        label='Customer Invoice To Name'
                        inputId='CUSTOMER_INVOICE_TO'
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        loadOptions={inputValue => {
                          return fetchCustomerInvoiceToByLikeCustomerInvoiceToNameAndInuse(inputValue, 1)
                        }}
                        getOptionLabel={data => data.CUSTOMER_INVOICE_TO_NAME.toString()}
                        getOptionValue={data => data.CUSTOMER_INVOICE_TO_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select ...'
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
            </Grid>
          </>
        </CardContent>
      </Card>
    </>
  )
}

export default YieldRateSearch
