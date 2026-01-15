import React, { Dispatch, SetStateAction, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { Controller, SubmitErrorHandler, SubmitHandler, useFormContext } from 'react-hook-form'

import { Button, Card, CardContent, CardHeader, Collapse, Divider, Grid, IconButton, Typography } from '@mui/material'

import classNames from 'classnames'

import SelectCustom from '@/components/react-select/SelectCustom'

// React Query Imports
import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useStandardCostForProduct'

import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'

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
import { fetchBomByBomCodeAndProductMainIdAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchBom'
import { fetchSctPatternNameBySctPatternName } from '@/_workspace/react-select/async-promise-load-options/fetchStandardCostData'
import { FiscalYearType } from '@/_workspace/pages/cost-condition/exchange-rate/ExchangeRateSearch'
import { FormDataPage } from './dataValidation'

interface Props {
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const FiscalYearOption: FiscalYearType[] = Array.from({ length: 12 }, (_, i) => {
  const year = new Date().getFullYear() + 1 - i
  return { value: year, label: year.toString() }
})

const SctDataModalSearch = ({ setIsEnableFetching }: Props) => {
  // States
  const [collapse, setCollapse] = useState(false)

  const { control, setValue, getValues, watch, handleSubmit } = useFormContext<FormDataPage>()
  // Hooks : react-query
  const queryClient = useQueryClient()

  const onResetFormSearch = () => {
    setValue('searchFilters.FISCAL_YEAR', null)
    setValue('searchFilters.SCT_PATTERN_NO', null)
    setValue('searchFilters.BOM', null)

    setIsEnableFetching(true)
    queryClient.invalidateQueries({
      queryKey: [PREFIX_QUERY_KEY]
    })
  }

  // Function : react-hook-form
  const onSubmit: SubmitHandler<FormDataPage> = () => {
    setIsEnableFetching(true)
    queryClient.invalidateQueries({
      queryKey: [PREFIX_QUERY_KEY]
    })
  }

  const onError: SubmitErrorHandler<FormDataPage> = data => {
    console.log(data)
  }

  return (
    <Card style={{ overflow: 'visible', zIndex: 4, border: '1px solid var(--mui-palette-customColors-inputBorder)' }}>
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
          <>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Divider color='primary'>
                  <Typography color='primary'>Product</Typography>
                </Divider>
              </Grid>
              <Grid item xs={12} sm={4} lg={4}>
                <Controller
                  name='searchFilters.PRODUCT_CATEGORY'
                  control={control}
                  render={({ field: { onChange, ...fieldProps } }) => (
                    <AsyncSelectCustom
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
              <Grid item xs={12} sm={4} lg={4}>
                <Controller
                  name='searchFilters.PRODUCT_MAIN'
                  control={control}
                  render={({ field: { onChange, ...fieldProps } }) => (
                    <AsyncSelectCustom
                      label='Product Main'
                      inputId='PRODUCT_MAIN'
                      {...fieldProps}
                      isClearable
                      cacheOptions
                      defaultOptions
                      onChange={value => {
                        onChange(value)

                        setValue('searchFilters.PRODUCT_SUB', null)
                        setValue('searchFilters.PRODUCT_TYPE', null)
                      }}
                      key={watch('searchFilters.PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID}
                      loadOptions={inputValue => {
                        return getValues('searchFilters.PRODUCT_CATEGORY.PRODUCT_CATEGORY_ID')
                          ? fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse(
                              inputValue,
                              1,
                              getValues('searchFilters.PRODUCT_CATEGORY.PRODUCT_CATEGORY_ID')
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
              <Grid item xs={12} sm={4} lg={4}>
                <Controller
                  name='searchFilters.PRODUCT_SUB'
                  control={control}
                  render={({ field: { onChange, ...fieldProps } }) => (
                    <AsyncSelectCustom
                      label='Product Sub'
                      inputId='PRODUCT_SUB'
                      {...fieldProps}
                      isClearable
                      cacheOptions
                      defaultOptions
                      onChange={value => {
                        onChange(value)

                        setValue('searchFilters.PRODUCT_TYPE', null)
                      }}
                      key={
                        watch('searchFilters.PRODUCT_MAIN')?.PRODUCT_MAIN_ID ||
                        watch('searchFilters.PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID
                      }
                      loadOptions={inputValue => {
                        return getValues('searchFilters.PRODUCT_MAIN.PRODUCT_MAIN_ID')
                          ? fetchProductSubByLikeProductSubNameAndProductMainIdAndInuse(
                              inputValue,
                              1,
                              getValues('searchFilters.PRODUCT_MAIN.PRODUCT_MAIN_ID')
                            )
                          : getValues('searchFilters.PRODUCT_CATEGORY')
                            ? fetchProductSubByLikeProductSubNameAndProductCategoryIdAndInuse(
                                inputValue,
                                1,
                                getValues('searchFilters.PRODUCT_CATEGORY.PRODUCT_CATEGORY_ID')
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
              <Grid item xs={12} sm={4} lg={4}>
                <Controller
                  name='searchFilters.PRODUCT_TYPE'
                  control={control}
                  render={({ field: { onChange, ...fieldProps } }) => (
                    <AsyncSelectCustom
                      label='Product Type Name'
                      inputId='PRODUCT_TYPE'
                      {...fieldProps}
                      isClearable
                      cacheOptions
                      defaultOptions
                      onChange={value => {
                        onChange(value)
                      }}
                      key={
                        watch('searchFilters.PRODUCT_SUB')?.PRODUCT_SUB_ID ||
                        watch('searchFilters.PRODUCT_MAIN')?.PRODUCT_MAIN_ID ||
                        watch('searchFilters.PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID
                      }
                      loadOptions={inputValue => {
                        return fetchProductTypeByLikeProductTypeNameAndInuse({
                          INUSE: 1,
                          PRODUCT_CATEGORY_ID: getValues('searchFilters.PRODUCT_CATEGORY.PRODUCT_CATEGORY_ID'),
                          PRODUCT_MAIN_ID: getValues('searchFilters.PRODUCT_MAIN.PRODUCT_MAIN_ID'),
                          PRODUCT_SUB_ID: getValues('searchFilters.PRODUCT_SUB.PRODUCT_SUB_ID'),
                          PRODUCT_TYPE_CODE: getValues('searchFilters.PRODUCT_TYPE.PRODUCT_TYPE_CODE'),
                          PRODUCT_TYPE_NAME: inputValue
                        })
                      }}
                      getOptionLabel={data => data.PRODUCT_TYPE_NAME.toString()}
                      getOptionValue={data => data.PRODUCT_TYPE_ID.toString()}
                      classNamePrefix='select'
                      placeholder='Select Product Type Name ...'
                      isDisabled
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4} lg={4}>
                <Controller
                  name='searchFilters.PRODUCT_TYPE'
                  control={control}
                  render={({ field: { onChange, ...fieldProps } }) => (
                    <AsyncSelectCustom
                      label='Product Type Code'
                      inputId='PRODUCT_TYPE'
                      {...fieldProps}
                      isClearable
                      isSearchable
                      cacheOptions
                      defaultOptions
                      onChange={value => {
                        onChange(value)
                      }}
                      key={
                        watch('searchFilters.PRODUCT_SUB')?.PRODUCT_SUB_ID ||
                        watch('searchFilters.PRODUCT_MAIN')?.PRODUCT_MAIN_ID ||
                        watch('searchFilters.PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID
                      }
                      loadOptions={inputValue => {
                        return fetchProductTypeByLikeProductTypeNameAndInuse({
                          INUSE: 1,
                          PRODUCT_CATEGORY_ID: getValues('searchFilters.PRODUCT_CATEGORY.PRODUCT_CATEGORY_ID'),
                          PRODUCT_MAIN_ID: getValues('searchFilters.PRODUCT_MAIN.PRODUCT_MAIN_ID'),
                          PRODUCT_SUB_ID: getValues('searchFilters.PRODUCT_SUB.PRODUCT_SUB_ID'),
                          PRODUCT_TYPE_CODE: getValues('searchFilters.PRODUCT_TYPE.PRODUCT_TYPE_CODE'),
                          PRODUCT_TYPE_NAME: inputValue
                        })
                      }}
                      getOptionLabel={data => data.PRODUCT_TYPE_CODE?.toString() ?? ''}
                      getOptionValue={data => data.PRODUCT_TYPE_ID.toString()}
                      classNamePrefix='select'
                      placeholder='Select Product Type Code ...'
                      isDisabled
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Divider color='primary'>
                  <Typography color='primary'>Header</Typography>
                </Divider>
              </Grid>
              <Grid item xs={12} sm={4} lg={4}>
                <Controller
                  name='searchFilters.FISCAL_YEAR'
                  control={control}
                  render={({ field: { ...fieldProps } }) => (
                    <SelectCustom
                      {...fieldProps}
                      options={FiscalYearOption}
                      isClearable
                      label='Fiscal Year'
                      classNamePrefix='select'
                      placeholder='Select Fiscal Year ...'
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4} lg={4}>
                <Controller
                  name='searchFilters.SCT_PATTERN_NO'
                  control={control}
                  render={({ field: { ...fieldProps } }) => (
                    <AsyncSelectCustom
                      label='SCT Pattern Name'
                      inputId='SCT_PATTERN_NO'
                      {...fieldProps}
                      isClearable
                      cacheOptions
                      defaultOptions
                      //value={getValues('searchFilters.SCT_PATTERN_NO')}
                      loadOptions={inputValue => {
                        return fetchSctPatternNameBySctPatternName(inputValue)
                      }}
                      getOptionLabel={data => data.SCT_PATTERN_NAME.toString()}
                      getOptionValue={data => data.SCT_PATTERN_ID.toString()}
                      classNamePrefix='select'
                      placeholder='Select SCT Pattern ...'
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Divider color='primary'>
                  <Typography color='primary'>BOM</Typography>
                </Divider>
              </Grid>
              <Grid item xs={12} sm={4} lg={4}>
                <Controller
                  name='searchFilters.BOM'
                  control={control}
                  render={({ field: { ...fieldProps } }) => (
                    <AsyncSelectCustom
                      label='BOM Code'
                      inputId='BOM_CODE'
                      {...fieldProps}
                      isClearable
                      // isSearchable={false}
                      cacheOptions
                      defaultOptions
                      loadOptions={(inputValue, callback) => {
                        if (getValues('searchFilters.PRODUCT_MAIN')?.PRODUCT_MAIN_ID) {
                          return fetchBomByBomCodeAndProductMainIdAndInuse(
                            inputValue,
                            '',
                            getValues('searchFilters.PRODUCT_MAIN.PRODUCT_MAIN_ID')
                          )
                        } else {
                          return callback([])
                        }
                      }}
                      getOptionLabel={data => data.BOM_CODE.toString()}
                      getOptionValue={data => data.BOM_ID.toString()}
                      classNamePrefix='select'
                      placeholder='Select BOM ...'
                    />
                  )}
                />
              </Grid>{' '}
              <Grid item xs={12} sm={4} lg={4}>
                <Controller
                  name='searchFilters.BOM'
                  control={control}
                  render={({ field: { ...fieldProps } }) => (
                    <AsyncSelectCustom
                      label='BOM Name'
                      inputId='BOM_NAME'
                      {...fieldProps}
                      isClearable
                      cacheOptions
                      defaultOptions
                      loadOptions={(inputValue, callback) => {
                        if (getValues('searchFilters.PRODUCT_MAIN')?.PRODUCT_MAIN_ID) {
                          return fetchBomByBomCodeAndProductMainIdAndInuse(
                            inputValue,
                            '',
                            getValues('searchFilters.PRODUCT_MAIN.PRODUCT_MAIN_ID')
                          )
                        } else {
                          return callback([])
                        }
                      }}
                      getOptionLabel={data => data.BOM_NAME.toString()}
                      getOptionValue={data => data.BOM_ID.toString()}
                      classNamePrefix='select'
                      placeholder='Select BOM ...'
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} className='flex gap-4'>
                <Button
                  onClick={() => handleSubmit(onSubmit, onError)()}
                  variant='contained'
                  type='button'
                  // startIcon={<SearchIcon />}
                >
                  Search
                </Button>
                <Button variant='tonal' color='secondary' type='reset' onClick={onResetFormSearch}>
                  Clear
                </Button>
              </Grid>
            </Grid>
          </>
        </CardContent>
      </Collapse>
    </Card>
  )
}

export default SctDataModalSearch
