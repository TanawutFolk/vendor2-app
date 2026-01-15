// React Imports
import type { Dispatch, SetStateAction } from 'react'
import { useState } from 'react'

// MUI Imports
import { Button, Card, CardContent, CardHeader, Divider, Grid, Typography } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, useFormContext } from 'react-hook-form'

import SelectCustom from '@/components/react-select/SelectCustom'

// Component Imports
import type { ProductCategoryOption } from '@/_workspace/react-select/async-promise-load-options/fetchProductCategory'
import { fetchProductCategoryByLikeProductCategoryNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchProductCategory'
import type { ProductMainOption } from '@/_workspace/react-select/async-promise-load-options/fetchProductMain'
import {
  fetchProductMainByLikeProductMainNameAndInuse,
  fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchProductMain'
import type { ProductSubOption } from '@/_workspace/react-select/async-promise-load-options/fetchProductSub'
import {
  fetchProductSubByLikeProductSubNameAndInuse,
  fetchProductSubByLikeProductSubNameAndProductCategoryIdAndInuse,
  fetchProductSubByLikeProductSubNameAndProductMainIdAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchProductSub'
import { fetchProductTypeByLikeProductTypeNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchProductType'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'

import { useCreate } from '@/_workspace/react-query/hooks/useItemCategory'
import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useProductTypeData'
import {
  fetchSctReasonByLikeSctReasonNameAndInuse,
  SctReasonSettingOption
} from '@/_workspace/react-select/async-promise-load-options/fetchSctReasonSetting'
import {
  fetchSctTagByLikeSctTagNameAndInuse,
  SctTagSettingOption
} from '@/_workspace/react-select/async-promise-load-options/fetchSctTag'
import { FiscalYearType } from '@/app/[lang]/(_workspace)/cost-condition/exchange-rate/ExchangeRateSearch'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { MENU_ID } from './env'
const FiscalYearOption: FiscalYearType[] = Array.from({ length: 3 }, (_, i) => {
  const year = new Date().getFullYear() + 1 - i
  return { value: year, label: year }
})

const sctPatternNoOption = [
  { value: 'P2', label: 'P2' },
  { value: 'P3', label: 'P3' }
]

interface Props {
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const YieldRateSearch = ({ setIsEnableFetching }: Props) => {
  const [isFetchData, setIsFetchData] = useState(false)

  // const [isEnableFetching, setIsEnableFetching] = useState(false)
  const { setValue, getValues, control, handleSubmit, watch } = useFormContext<FormData>()

  // Hooks : react-query
  const queryClient = useQueryClient()

  const onSubmit: SubmitHandler<FormData> = () => {
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
  }

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log(data)
  }

  // Function
  const onResetFormSearch = () => {
    setValue('FISCAL_YEAR', null)
    setValue('SCT_REASON_SETTING', null)
    setValue('SCT_TAG_SETTING', null)
    setValue('PRODUCT_CATEGORY', null)
    setValue('PRODUCT_MAIN', null)
    setValue('PRODUCT_SUB', null)
    setValue('PRODUCT_TYPE', null)
  }

  // react-query
  const handleAdd = () => {
    const dataItem = {
      USER_ID: getUserData().USER_ID,
      APPLICATION_ID: import.meta.env.VITE_APPLICATION_ID,
      MENU_ID: MENU_ID.toString(),
      USER_PROFILE_SETTING_PROGRAM_DATA: {
        searchFilters: {
          HOLIDAY_TYPE: getValues('searchFilters.HOLIDAY_TYPE'),
          HOLIDAY_TITLE_NAME: getValues('searchFilters.HOLIDAY_TITLE_NAME'),
          HOLIDAY_DATE: getValues('searchFilters.HOLIDAY_DATE'),
          INUSE: getValues('searchFilters.INUSE')
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
                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='SCT_TAG_SETTING'
                    control={control}
                    render={({ field: { onChange, ...fieldProps } }) => (
                      <AsyncSelectCustom<SctTagSettingOption>
                        label='SCT Tag'
                        inputId='SCT_TAG_SETTING'
                        {...fieldProps}
                        // isDisabled={true}
                        isClearable
                        cacheOptions
                        defaultOptions
                        value={getValues('SCT_TAG_SETTING')}
                        onChange={value => {
                          onChange(value)
                        }}
                        loadOptions={inputValue => {
                          return fetchSctTagByLikeSctTagNameAndInuse(inputValue, 1)
                        }}
                        getOptionLabel={data => data.SCT_TAG_SETTING_NAME.toString()}
                        getOptionValue={data => data.SCT_TAG_SETTING_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select SCT Tag ...'
                        //placeholder='Auto'
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
                    name='PRODUCT_CATEGORY'
                    control={control}
                    render={({ field: { onChange, ...fieldProps } }) => (
                      <AsyncSelectCustom<ProductCategoryOption>
                        label='Product Category'
                        inputId='PRODUCT_CATEGORY'
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        value={getValues('PRODUCT_CATEGORY')}
                        onChange={value => {
                          onChange(value)

                          setValue('PRODUCT_MAIN', null)
                          setValue('PRODUCT_SUB', null)
                          setValue('PRODUCT_TYPE', null)
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
                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='PRODUCT_MAIN'
                    control={control}
                    render={({ field: { onChange, ...fieldProps } }) => (
                      <AsyncSelectCustom<ProductMainOption>
                        label='Product Main'
                        inputId='PRODUCT_MAIN'
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        value={getValues('PRODUCT_MAIN')}
                        onChange={value => {
                          onChange(value)

                          setValue('PRODUCT_SUB', null)
                          setValue('PRODUCT_TYPE', null)
                        }}
                        key={watch('PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID}
                        loadOptions={inputValue => {
                          return getValues('PRODUCT_CATEGORY')
                            ? fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse(
                                inputValue,
                                1,
                                getValues('PRODUCT_CATEGORY').PRODUCT_CATEGORY_ID
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
                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='PRODUCT_SUB'
                    control={control}
                    render={({ field: { onChange, ...fieldProps } }) => (
                      <AsyncSelectCustom<ProductSubOption>
                        label='Product Sub'
                        inputId='PRODUCT_SUB'
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        value={getValues('PRODUCT_SUB')}
                        onChange={value => {
                          onChange(value)

                          setValue('PRODUCT_TYPE', null)
                        }}
                        key={watch('PRODUCT_MAIN')?.PRODUCT_MAIN_ID || watch('PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID}
                        loadOptions={inputValue => {
                          return getValues('PRODUCT_MAIN')
                            ? fetchProductSubByLikeProductSubNameAndProductMainIdAndInuse(
                                inputValue,
                                1,
                                getValues('PRODUCT_MAIN').PRODUCT_MAIN_ID
                              )
                            : getValues('PRODUCT_CATEGORY')
                              ? fetchProductSubByLikeProductSubNameAndProductCategoryIdAndInuse(
                                  inputValue,
                                  1,
                                  getValues('PRODUCT_CATEGORY').PRODUCT_CATEGORY_ID
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
                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='PRODUCT_TYPE'
                    control={control}
                    render={({ field: { ...fieldProps } }) => (
                      <AsyncSelectCustom
                        key={`${watch('PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID}_${watch('PRODUCT_MAIN')?.PRODUCT_MAIN_ID}_${watch('PRODUCT_SUB')?.PRODUCT_SUB_ID}`}
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
                            PRODUCT_CATEGORY_ID: getValues('PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID || '',
                            PRODUCT_MAIN_ID: getValues('PRODUCT_MAIN')?.PRODUCT_MAIN_ID || '',
                            PRODUCT_SUB_ID: getValues('PRODUCT_SUB')?.PRODUCT_SUB_ID || '',
                            INUSE: 1
                          })
                        }
                        getOptionLabel={data => data.PRODUCT_TYPE_CODE.toString()}
                        getOptionValue={data => data.PRODUCT_TYPE_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select Product Type Code ...'
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='PRODUCT_TYPE'
                    control={control}
                    render={({ field: { ...fieldProps } }) => (
                      <AsyncSelectCustom
                        key={`${watch('PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID}_${watch('PRODUCT_MAIN')?.PRODUCT_MAIN_ID}_${watch('PRODUCT_SUB')?.PRODUCT_SUB_ID}`}
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
                            PRODUCT_CATEGORY_ID: getValues('PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID || '',
                            PRODUCT_MAIN_ID: getValues('PRODUCT_MAIN')?.PRODUCT_MAIN_ID || '',
                            PRODUCT_SUB_ID: getValues('PRODUCT_SUB')?.PRODUCT_SUB_ID || '',
                            INUSE: 1
                          })
                        }
                        getOptionLabel={data => data.PRODUCT_TYPE_NAME.toString()}
                        getOptionValue={data => data.PRODUCT_TYPE_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select Product Type Name ...'
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

export default YieldRateSearch
