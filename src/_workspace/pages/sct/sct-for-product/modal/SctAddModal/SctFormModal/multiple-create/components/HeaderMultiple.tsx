import React, { Dispatch, SetStateAction } from 'react'

import { Button, Card, CardContent, CardHeader, Divider, Grid, Typography } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

import { Controller, SubmitErrorHandler, SubmitHandler, useFormContext } from 'react-hook-form'

import SelectCustom from '@/components/react-select/SelectCustom'
import CustomTextField from '@/components/mui/TextField'

// types Imports
import type { FormData } from '../index'
import { FiscalYearType } from '@/app/[lang]/(_workspace)/cost-condition/exchange-rate/ExchangeRateSearch'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
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
  ProductTypeOption
} from '@/_workspace/react-select/async-promise-load-options/fetchProductType'

import SearchIcon from '@mui/icons-material/Search'
import { useQueryClient } from '@tanstack/react-query'
import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useProductTypeData'
import { twMerge } from 'tailwind-merge'
const FiscalYearOption: FiscalYearType[] = Array.from({ length: 2 }, (_, i) => {
  const year = new Date().getFullYear() + i
  return { value: year, label: year }
})

const sctPatternNoOption = [
  { value: 'P2', label: 'P2' },
  { value: 'P3', label: 'P3' }
]

interface Props {
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const HeaderMultiple = ({ setIsEnableFetching }: Props) => {
  // Hooks : react-hook-form
  const { setValue, getValues, control, handleSubmit, watch } = useFormContext<FormData>()
  // Hooks : react-query
  const queryClient = useQueryClient()

  const onSubmit: SubmitHandler<FormData> = () => {
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    //handleAdd()
  }

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log(data)
  }

  return (
    <>
      <Divider color='primary'>
        <Typography color='primary'>Header</Typography>
      </Divider>
      <Grid container spacing={6}>
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
                {...(errors.FISCAL_YEAR && {
                  error: true,
                  helperText: errors.FISCAL_YEAR.message
                })}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4} lg={3}>
          <Controller
            name='SCT_PATTERN'
            control={control}
            render={({ field: { onChange, ...fieldProps } }) => (
              <SelectCustom
                label='SCT Pattern No'
                {...fieldProps}
                onChange={value => {
                  onChange(value)
                  //setValue('machineName', null)
                }}
                //key={watch('department')?.DEPARTMENT_ID}
                isClearable
                options={[
                  {
                    value: 1,
                    label: 'P2'
                  },
                  {
                    value: 2,
                    label: 'P3'
                  }
                ]}
                classNamePrefix='select'
                placeholder='Select SCT Pattern No ...'
                value={watch('FISCAL_YEAR')}
                {...(errors.SCT_PATTERN_NO && {
                  error: true,
                  helperText: errors.SCT_PATTERN_NO.message
                })}
              />
            )}
          />
        </Grid>
      </Grid>
      <Divider color='primary' className='mb-2 mt-1'>
        <Typography color='primary'>Estimate Period</Typography>
      </Divider>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Grid container spacing={6}>
          <Grid item xs={12} sm={4} lg={3}>
            <Controller
              control={control}
              name='START_DATE'
              render={({ field: { value, ...fieldProps } }) => (
                <>
                  <AppReactDatepicker
                    {...fieldProps}
                    isClearable
                    showYearDropdown
                    showMonthDropdown
                    todayButton='Today'
                    selected={value}
                    id='end-date'
                    dateFormat='dd-MMMM-yyyy'
                    placeholderText='Enter Start Date'
                    customInput={
                      <CustomTextField
                        label='Start Date'
                        fullWidth
                        inputProps={{
                          className: 'text-center'
                        }}
                        {errors?.START_DATE && (
                          <span className={twMerge('custom-error-message', 'error-mui-color')}>
                            {errors.START_DATE.message}
                          </span>
                        )}
                      />
                    }
                    popperPlacement='top-start'
                    popperProps={{ strategy: 'fixed' }}
                    popperClassName='z-[2000000]'
                  />
                </>
              )}
            />
          </Grid>

          <Grid item xs={12} sm={4} lg={3}>
            <Controller
              control={control}
              name='END_DATE'
              render={({ field: { value, ...fieldProps } }) => (
                <>
                  <AppReactDatepicker
                    {...fieldProps}
                    isClearable
                    showYearDropdown
                    showMonthDropdown
                    todayButton='Today'
                    selected={value}
                    startDate={watch('START_DATE')}
                    endDate={value}
                    id='end-date'
                    dateFormat='dd-MMMM-yyyy'
                    placeholderText='Enter End Date'
                    customInput={
                      <CustomTextField
                        label='End Date'
                        fullWidth
                        inputProps={{
                          className: 'text-center'
                        }}

                        {errors?.END_DATE && (
                          <span className={twMerge('custom-error-message', 'error-mui-color')}>
                            {errors.END_DATE.message}
                          </span>
                        )}
                        // {...(errors?.searchFilters?.endWorkDate && {
                        //   error: true,
                        //   helperText: errors?.searchFilters?.endWorkDate?.message
                        // })}
                      />
                    }
                    popperPlacement='top-start'
                    popperProps={{ strategy: 'fixed' }}
                    popperClassName='z-[2000000]'
                  />
                </>
              )}
            />
          </Grid>
        </Grid>
      </LocalizationProvider>

      <Divider className='mb-1 mt-2' color='primary'>
        <Typography variant='h5' component='span' color='primary'>
          Standard Cost Form :
        </Typography>
        <Typography variant='h6' component='span'>
          {' '}
          Multiple Create
        </Typography>
      </Divider>
      <Card style={{ overflow: 'visible', zIndex: 4 }}>
        <CardHeader title='Search filters' />
        <CardContent>
          <Grid container spacing={6}>
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
                            getValues('PRODUCT_MAIN').PRODUCT_MAIN_ID,
                            1,

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
                render={({ field: {  ...fieldProps } }) => (
                  <AsyncSelectCustom
                    label='Product Type Code'
                    inputId='PRODUCT_TYPE'
                    {...fieldProps}
                    isClearable
                    cacheOptions
                    defaultOptions
                    key={
                    `${watch('PRODUCT_SUB')?.PRODUCT_SUB_ID}_
                      ${watch('PRODUCT_MAIN')?.PRODUCT_MAIN_ID}_
                      ${watch('PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID}`
                    }
                    loadOptions={inputValue => {

                      console.log(inputValue);

                      return getValues('PRODUCT_SUB')
                        ? fetchProductTypeByLikeProductTypeNameAndProductSubIdAndInuse(
                            inputValue,
                            getValues('PRODUCT_SUB').PRODUCT_SUB_ID,
                            1
                          )
                        : getValues('PRODUCT_MAIN')
                          ? fetchProductTypeByLikeProductTypeNameAndProductMainIdAndInuse(
                              inputValue,
                              getValues('PRODUCT_MAIN').PRODUCT_MAIN_ID,
                              1
                            )
                          : getValues('PRODUCT_CATEGORY')
                            ? fetchProductTypeByLikeProductTypeNameAndProductCategoryIdAndInuse(
                                inputValue,
                                getValues('PRODUCT_CATEGORY').PRODUCT_CATEGORY_ID,
                                1
                              )
                            : fetchProductTypeForSctByLikeProductTypeCodeAndInuse(inputValue, 1)
                    }}
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
                render={({ field: { onChange, ...fieldProps } }) => (
                  <AsyncSelectCustom<ProductTypeOption>
                    label='Product Type Name'
                    inputId='PRODUCT_TYPE'
                    {...fieldProps}
                    isClearable
                    cacheOptions
                    defaultOptions
                    value={getValues('PRODUCT_TYPE')}
                    onChange={value => {
                      onChange(value)
                    }}
                           key={
                    `${watch('PRODUCT_SUB')?.PRODUCT_SUB_ID}_
                      ${watch('PRODUCT_MAIN')?.PRODUCT_MAIN_ID}_
                      ${watch('PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID}`
                    }
                    loadOptions={inputValue => {
                      return getValues('PRODUCT_SUB')
                        ? fetchProductTypeByLikeProductTypeNameAndProductSubIdAndInuse(
                            inputValue,
                            getValues('PRODUCT_SUB').PRODUCT_SUB_ID,
                            1
                          )
                        : getValues('PRODUCT_MAIN')
                          ? fetchProductTypeByLikeProductTypeNameAndProductMainIdAndInuse(
                              inputValue,
                              getValues('PRODUCT_MAIN').PRODUCT_MAIN_ID,
                              1
                            )
                          : getValues('PRODUCT_CATEGORY')
                            ? fetchProductTypeByLikeProductTypeNameAndProductCategoryIdAndInuse(
                                inputValue,
                                getValues('PRODUCT_CATEGORY').PRODUCT_CATEGORY_ID,
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
          <Grid container className='mbs-0' spacing={6}>
            <Grid item xs={12} className='flex gap-4'>
              <Button
                onClick={() => handleSubmit(onSubmit, onError)()}
                variant='contained'
                type='button'

              >
                Search
              </Button>
              <Button
                variant='tonal'
                color='secondary'
                type='reset'
                //onClick={onResetFormSearch}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </>
  )
}

export default HeaderMultiple
