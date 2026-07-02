import { Dispatch, SetStateAction, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { Controller, SubmitErrorHandler, SubmitHandler, useFormContext, useFormState } from 'react-hook-form'

import { Button, Card, CardContent, CardHeader, Collapse, Divider, Grid, IconButton, Typography } from '@mui/material'

import SearchIcon from '@mui/icons-material/Search'

import classNames from 'classnames'

// React Query Imports
import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useProductTypeData'

// types Imports
import type { FormData } from './index'

import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'

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
  fetchProductTypeForSctByLikeProductTypeCodeAndInuse,
  fetchProductTypeForSctByLikeProductTypeNameAndInuse,
  ProductTypeOption
} from '@/_workspace/react-select/async-promise-load-options/fetchProductType'
import CustomTextField from '@/components/mui/TextField'
import {
  fetchSctPatternNameBySctPatternName,
  StandardCostPatternOption
} from '@/_workspace/react-select/async-promise-load-options/fetchStandardCostData'
import {
  fetchSctReasonByLikeSctReasonNameAndInuse,
  SctReasonSettingOption
} from '@/_workspace/react-select/async-promise-load-options/fetchSctReasonSetting'
import {
  fetchSctTagByLikeSctTagNameAndInuse,
  SctTagSettingOption
} from '@/_workspace/react-select/async-promise-load-options/fetchSctTag'
import { fetchSctPatternByLikePatternNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchSctPattern'
import { fetchCustomerInvoiceToByLikeCustomerInvoiceToNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/customer/fetchCustomerInvoiceTo'
import { fetchSctStatusProgressNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchSctStatusProgress'

interface Props {
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const StandardCostFormModalSearch = ({ setIsEnableFetching }: Props) => {
  // States
  const [collapse, setCollapse] = useState(false)

  // Hooks : react-hook-form
  const { setValue, getValues, control, handleSubmit, watch } = useFormContext<FormData>()
  const { isLoading } = useFormState()

  // Hooks : react-query
  const queryClient = useQueryClient()

  const onResetFormSearch = () => {
    setValue('searchFilters', {
      sctFormCode: '',
      fiscalYear: '',
      sctPattern: null,
      itemCategory: null,
      productCategory: null,
      productMain: null,
      productSub: null,
      productType: null,
      sctReasonSetting: null,
      sctTagSetting: null,
      sctStatusProgress: null,
      productionSpecificationType: null,
      customerInvoice: null
    })
  }

  // Function : react-hook-form
  const onSubmit: SubmitHandler<FormData> = () => {
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
  }

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log(data)
  }

  return (
    <Card style={{ overflow: 'visible', zIndex: 4, border: '1px solid var(--mui-palette-customColors-inputBorder)' }}>
      <CardHeader
        title='Search filters'
        action={
          <>
            <IconButton size='small' aria-label='collapse' onClick={() => setCollapse(!collapse)}>
              <i className={classNames(collapse ? 'tabler-chevron-down' : 'tabler-chevron-up', 'text-xl')} />
            </IconButton>
            {/* <Button variant='contained' onClick={() => console.log(getValues())}>
              Get Values
            </Button> */}
          </>
        }
      />
      <Collapse in={!collapse}>
        <CardContent>
          {isLoading ? (
            <>Loading</>
          ) : (
            <>
              <Grid container sx={{ position: 'relative', top: 0 }} spacing={4}>
                <Grid item xs={12}>
                  <Divider textAlign='left'>
                    <Typography variant='body2' color='primary'>
                      Header
                    </Typography>
                  </Divider>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Controller
                    name='searchFilters.sctFormCode'
                    control={control}
                    render={({ field: { ref, ...fieldProps } }) => (
                      <CustomTextField
                        {...fieldProps}
                        fullWidth
                        autoComplete='off'
                        label=' SCT Form Code'
                        placeholder='Enter SCT Form Code'
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Controller
                    name='searchFilters.fiscalYear'
                    control={control}
                    render={({ field: { ref, ...fieldProps } }) => (
                      <CustomTextField
                        {...fieldProps}
                        fullWidth
                        autoComplete='off'
                        label='Fiscal Year'
                        placeholder='Enter Fiscal Year'
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Controller
                    name='searchFilters.sctPattern'
                    control={control}
                    render={({ field: { ref, ...fieldProps } }) => (
                      <>
                        <AsyncSelectCustom
                          {...fieldProps}
                          label='SCT Pattern'
                          isClearable
                          cacheOptions
                          defaultOptions
                          loadOptions={inputValue => {
                            return fetchSctPatternByLikePatternNameAndInuse(inputValue, 1)
                          }}
                          getOptionLabel={data => data?.SCT_PATTERN_NAME.toString()}
                          getOptionValue={data => data.SCT_PATTERN_ID.toString()}
                          classNamePrefix='select'
                          placeholder='Select SCT Pattern ...'
                        />
                      </>
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
                  <Grid item xs={12} sm={3}>
                    <Controller
                      name='searchFilters.itemCategory'
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
                          placeholder='Select Item Category ...'
                        />
                      )}
                    />
                  </Grid>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Controller
                    name='searchFilters.productCategory'
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
                          placeholder='Select Product Category ...'
                        />
                      </>
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Controller
                    name='searchFilters.productMain'
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
                          placeholder='Select Product Main ...'
                        />
                      </>
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Controller
                    name='searchFilters.productSub'
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
                        placeholder='Select Product Sub ...'
                      />
                    )}
                  />
                </Grid>
                <Grid container item xs={12} spacing={4}>
                  <Grid item xs={12} sm={3}>
                    <Controller
                      name='searchFilters.productType'
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
                          placeholder='Select Product Type Code ...'
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name='searchFilters.productType'
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
                          placeholder='Select Product Type ...'
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Controller
                      name='searchFilters.customerInvoice'
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
                          placeholder='Select Customer Invoice To ...'
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} mt={3}>
                    <Divider textAlign='left'>
                      <Typography variant='body2' color='primary'>
                        Objective
                      </Typography>
                    </Divider>
                  </Grid>
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Controller
                    name='searchFilters.sctReasonSetting'
                    control={control}
                    render={({ field: { ref, ...fieldProps } }) => (
                      <AsyncSelectCustom
                        {...fieldProps}
                        label='SCT Reason'
                        isClearable
                        cacheOptions
                        defaultOptions
                        loadOptions={inputValue => {
                          return fetchSctReasonByLikeSctReasonNameAndInuse(inputValue, 1)
                        }}
                        getOptionLabel={data => data?.SCT_REASON_SETTING_NAME.toString()}
                        getOptionValue={data => data.SCT_REASON_SETTING_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select SCT Reason ...'
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Controller
                    name='searchFilters.sctTagSetting'
                    control={control}
                    render={({ field: { ref, ...fieldProps } }) => (
                      <AsyncSelectCustom
                        {...fieldProps}
                        label='SCT Tag'
                        isClearable
                        cacheOptions
                        defaultOptions
                        loadOptions={inputValue => {
                          return fetchSctTagByLikeSctTagNameAndInuse(inputValue, 1)
                        }}
                        getOptionLabel={data => data?.SCT_TAG_SETTING_NAME.toString()}
                        getOptionValue={data => data.SCT_TAG_SETTING_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select SCT Tag ...'
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Controller
                    name='searchFilters.sctStatusProgress'
                    control={control}
                    render={({ field: { ref, ...fieldProps } }) => (
                      <AsyncSelectCustom
                        {...fieldProps}
                        label='SCT Status Progress'
                        isClearable
                        cacheOptions
                        defaultOptions
                        loadOptions={inputValue => {
                          return fetchSctStatusProgressNameAndInuse({
                            sctStatusProgressName: inputValue,
                            inuse: 1
                          })
                        }}
                        getOptionLabel={data => data?.SCT_STATUS_PROGRESS_NAME.toString()}
                        getOptionValue={data => data.SCT_STATUS_PROGRESS_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select SCT Status Progress ...'
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} className='flex gap-4'>
                  <Button
                    onClick={() => handleSubmit(onSubmit, onError)()}
                    variant='contained'
                    type='button'
                    startIcon={<SearchIcon />}
                  >
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

export default StandardCostFormModalSearch
