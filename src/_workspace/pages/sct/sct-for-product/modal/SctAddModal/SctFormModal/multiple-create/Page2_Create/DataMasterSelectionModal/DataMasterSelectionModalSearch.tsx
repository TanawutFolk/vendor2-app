import { Dispatch, SetStateAction } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { Controller, SubmitErrorHandler, useFormContext } from 'react-hook-form'

import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useProductTypeData'

import { Button, Card, CardContent, CardHeader, Divider, Grid, Typography } from '@mui/material'
import SelectCustom from '@/components/react-select/SelectCustom'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'

import {
  fetchSctReasonByLikeSctReasonNameAndInuse,
  SctReasonSettingOption
} from '@/_workspace/react-select/async-promise-load-options/fetchSctReasonSetting'

import { FiscalYearType } from '@/_workspace/pages/cost-condition/exchange-rate/ExchangeRateSearch'
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
import { fetchProductTypeByLikeProductTypeNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchProductType'

import SearchIcon from '@mui/icons-material/Search'

const FiscalYearOption: FiscalYearType[] = Array.from({ length: 3 }, (_, i) => {
  const year = new Date().getFullYear() + 1 - i
  return { value: year, label: year }
})

interface Props {
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const DataMasterSelectionModalSearch = ({ setIsEnableFetching }: Props) => {
  const { setValue, getValues, control, handleSubmit, watch } = useFormContext()

  const queryClient = useQueryClient()

  const onSubmit = () => {
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    console.log('xx')
  }

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log(data)
  }

  const onResetFormSearch = () => {
    setValue('FISCAL_YEAR', null)
    setValue('SCT_REASON_SETTING', null)
    setValue('PRODUCT_CATEGORY', null)
    setValue('PRODUCT_MAIN', null)
    setValue('PRODUCT_SUB', null)
    setValue('PRODUCT_TYPE', null)
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
  }

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card style={{ overflow: 'visible', zIndex: 4 }}>
            <CardHeader title='Search filters' />
            <CardContent>
              <Divider color='primary'>
                <Typography color='primary'>Header</Typography>
              </Divider>
              <Grid
                container
                spacing={6}
                sx={{
                  paddingTop: '8px'
                }}
              >
                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='FISCAL_YEAR'
                    control={control}
                    render={({ field: { ...fieldProps } }) => (
                      <SelectCustom
                        {...fieldProps}
                        options={FiscalYearOption}
                        isClearable
                        label='Fiscal Year'
                        classNamePrefix='select'
                        placeholder='Select Fiscal Year'
                        value={watch('FISCAL_YEAR')}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='SCT_REASON_SETTING'
                    control={control}
                    render={({ field: { onChange, ...fieldProps } }) => (
                      <AsyncSelectCustom<SctReasonSettingOption>
                        label='SCT Reason'
                        inputId='SCT_REASON_SETTING'
                        {...fieldProps}
                        isDisabled={getValues('mode') === 'view'}
                        isClearable
                        cacheOptions
                        defaultOptions
                        value={getValues('SCT_REASON_SETTING')}
                        onChange={value => {
                          onChange(value)

                          if (value && value.SCT_REASON_SETTING_ID === 1) {
                            setValue('SCT_TAG_SETTING', {
                              SCT_TAG_SETTING_ID: 1,
                              SCT_TAG_SETTING_NAME: 'Budget'
                            })
                          } else {
                            setValue('SCT_TAG_SETTING', null)
                          }
                        }}
                        loadOptions={inputValue => {
                          return fetchSctReasonByLikeSctReasonNameAndInuse(inputValue, 1)
                        }}
                        getOptionLabel={data => data.SCT_REASON_SETTING_NAME.toString()}
                        getOptionValue={data => data.SCT_REASON_SETTING_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select SCT Reason ...'
                      />
                    )}
                  />
                </Grid>
              </Grid>
              <Divider color='primary'>
                <Typography className='mt-4' color='primary'>
                  Product Group
                </Typography>
              </Divider>
              <Grid
                container
                spacing={6}
                sx={{
                  paddingTop: '8px',
                  paddingBottom: '10px'
                }}
              >
                <Grid item xs={12} sm={4} lg={3}>
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
                        isDisabled
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4} lg={3}>
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
                        isDisabled
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4} lg={3}>
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
                        isDisabled
                      />
                    )}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.PRODUCT_TYPE'
                    control={control}
                    render={({ field: { ...fieldProps } }) => (
                      <AsyncSelectCustom
                        key={`${watch('searchFilters.PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID}_${watch('searchFilters.PRODUCT_MAIN')?.PRODUCT_MAIN_ID}_${watch('searchFilters.PRODUCT_SUB')?.PRODUCT_SUB_ID}`}
                        label='Product Type Code'
                        inputId='PRODUCT_TYPE'
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        loadOptions={inputValue =>
                          fetchProductTypeByLikeProductTypeNameAndInuse({
                            PRODUCT_TYPE_NAME: '',
                            PRODUCT_TYPE_CODE: inputValue,
                            PRODUCT_CATEGORY_ID: getValues('searchFilters.PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID || '',
                            PRODUCT_MAIN_ID: getValues('searchFilters.PRODUCT_MAIN')?.PRODUCT_MAIN_ID || '',
                            PRODUCT_SUB_ID: getValues('searchFilters.PRODUCT_SUB')?.PRODUCT_SUB_ID || '',
                            INUSE: 1
                          })
                        }
                        getOptionLabel={data => data.PRODUCT_TYPE_CODE.toString()}
                        getOptionValue={data => data.PRODUCT_TYPE_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select Product Type Code ...'
                        isDisabled
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='searchFilters.PRODUCT_TYPE'
                    control={control}
                    render={({ field: { ...fieldProps } }) => (
                      <AsyncSelectCustom
                        key={`${watch('searchFilters.PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID}_${watch('searchFilters.PRODUCT_MAIN')?.PRODUCT_MAIN_ID}_${watch('searchFilters.PRODUCT_SUB')?.PRODUCT_SUB_ID}`}
                        label='Product Type Name'
                        inputId='PRODUCT_TYPE'
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        loadOptions={inputValue =>
                          fetchProductTypeByLikeProductTypeNameAndInuse({
                            PRODUCT_TYPE_NAME: inputValue,
                            PRODUCT_TYPE_CODE: '',
                            PRODUCT_CATEGORY_ID: getValues('searchFilters.PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID || '',
                            PRODUCT_MAIN_ID: getValues('searchFilters.PRODUCT_MAIN')?.PRODUCT_MAIN_ID || '',
                            PRODUCT_SUB_ID: getValues('searchFilters.PRODUCT_SUB')?.PRODUCT_SUB_ID || '',
                            INUSE: 1
                          })
                        }
                        getOptionLabel={data => data.PRODUCT_TYPE_NAME.toString()}
                        getOptionValue={data => data.PRODUCT_TYPE_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select Product Type Name ...'
                        isDisabled
                      />
                    )}
                  />
                </Grid>
              </Grid>
              <Grid container className='mbs-0' spacing={6}>
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

export default DataMasterSelectionModalSearch
