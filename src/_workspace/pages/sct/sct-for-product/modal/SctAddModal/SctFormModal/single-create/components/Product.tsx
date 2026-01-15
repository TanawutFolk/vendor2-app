import React from 'react'

import { Divider, Grid, Typography } from '@mui/material'

import { Controller, useFormContext, useFormState } from 'react-hook-form'

import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'

// types Imports
import type { FormData } from '../index'

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
  ProductTypeOption
} from '@/_workspace/react-select/async-promise-load-options/fetchProductType'
import CustomTextField from '@/components/mui/TextField'
import { fetchBomDetailsByBomIdAndProductTypeId } from '@/_workspace/react-select/async-promise-load-options/fetchBom'

const Product = () => {
  // Hooks : react-hook-form
  const { setValue, getValues, control, handleSubmit, watch } = useFormContext<FormData>()

  const { errors } = useFormState({
    control
  })

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Divider textAlign='left'>
            <Typography variant='body2' color='primary'>
              Product
            </Typography>
          </Divider>
        </Grid>
        <Grid item xs={12} sm={4} lg={4}>
          <Controller
            name='PRODUCT_CATEGORY'
            control={control}
            render={({ field: { onChange, ...fieldProps } }) => (
              <AsyncSelectCustom<ProductCategoryOption>
                label='Product Category'
                inputId='PRODUCT_CATEGORY'
                {...fieldProps}
                isDisabled={getValues('mode') === 'view' || getValues('mode') === 'edit'}
                isClearable
                cacheOptions
                defaultOptions
                value={getValues('PRODUCT_CATEGORY')}
                onChange={value => {
                  onChange(value)

                  setValue('PRODUCT_MAIN', null)
                  setValue('PRODUCT_SUB', null)
                  setValue('PRODUCT_TYPE', null)

                  setValue('ITEM_CATEGORY', '')
                  setValue('PRODUCT_SPECIFICATION_TYPE', '')
                  setValue('BOM_CODE_ACTUAL', '')
                  setValue('BOM_CODE', '')
                  setValue('BOM_NAME_ACTUAL', '')
                  setValue('BOM_NAME', '')
                  setValue('FLOW_PROCESS', [])
                  setValue('MATERIAL_IN_PROCESS', [])
                  setValue('MATERIAL_IN_PROCESS_ID', [])
                }}
                loadOptions={inputValue => {
                  return fetchProductCategoryByLikeProductCategoryNameAndInuse(inputValue, '1')
                }}
                getOptionLabel={data => data.PRODUCT_CATEGORY_NAME.toString()}
                getOptionValue={data => data.PRODUCT_CATEGORY_ID.toString()}
                classNamePrefix='select'
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={4} lg={4}>
          <Controller
            name='PRODUCT_MAIN'
            control={control}
            render={({ field: { onChange, ...fieldProps } }) => (
              <AsyncSelectCustom<ProductMainOption>
                label='Product Main'
                inputId='PRODUCT_MAIN'
                {...fieldProps}
                isDisabled={getValues('mode') === 'view' || getValues('mode') === 'edit'}
                isClearable
                cacheOptions
                defaultOptions
                value={getValues('PRODUCT_MAIN')}
                onChange={value => {
                  onChange(value)

                  setValue('PRODUCT_SUB', null)
                  setValue('PRODUCT_TYPE', null)

                  setValue('ITEM_CATEGORY', '')
                  setValue('PRODUCT_SPECIFICATION_TYPE', '')
                  setValue('BOM_CODE_ACTUAL', '')
                  setValue('BOM_CODE', '')
                  setValue('BOM_NAME_ACTUAL', '')
                  setValue('BOM_NAME', '')
                  setValue('FLOW_PROCESS', [])
                  setValue('MATERIAL_IN_PROCESS', [])
                  setValue('MATERIAL_IN_PROCESS_ID', [])
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
        <Grid item xs={12} sm={4} lg={4}>
          <Controller
            name='PRODUCT_SUB'
            control={control}
            render={({ field: { onChange, ...fieldProps } }) => (
              <AsyncSelectCustom<ProductSubOption>
                label='Product Sub'
                inputId='PRODUCT_SUB'
                {...fieldProps}
                isDisabled={getValues('mode') === 'view' || getValues('mode') === 'edit'}
                isClearable
                cacheOptions
                defaultOptions
                value={getValues('PRODUCT_SUB')}
                onChange={value => {
                  onChange(value)

                  setValue('PRODUCT_TYPE', null)

                  setValue('ITEM_CATEGORY', '')
                  setValue('PRODUCT_SPECIFICATION_TYPE', '')
                  setValue('BOM_CODE_ACTUAL', '')
                  setValue('BOM_CODE', '')
                  setValue('BOM_NAME_ACTUAL', '')
                  setValue('BOM_NAME', '')
                  setValue('FLOW_PROCESS', [])
                  setValue('MATERIAL_IN_PROCESS', [])
                  setValue('MATERIAL_IN_PROCESS_ID', [])
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
        <Grid container item xs={12} spacing={2}>
          <Grid item xs={12} sm={4} lg={4}>
            <Controller
              name='PRODUCT_TYPE'
              control={control}
              render={({ field: { onChange, ...fieldProps } }) => (
                <AsyncSelectCustom<ProductTypeOption>
                  label='Product Type Code'
                  inputId='PRODUCT_TYPE'
                  {...fieldProps}
                  isDisabled={getValues('mode') === 'view' || getValues('mode') === 'edit'}
                  isClearable
                  cacheOptions
                  defaultOptions
                  value={watch('PRODUCT_TYPE')}
                  onChange={value => {
                    onChange(value)

                    if (value) {
                      setValue('ITEM_CATEGORY', value?.ITEM_CATEGORY_NAME ?? '')
                      setValue('PRODUCT_SPECIFICATION_TYPE', value?.PRODUCT_SPECIFICATION_TYPE_NAME ?? '')

                      setValue('PRODUCT_CATEGORY', {
                        PRODUCT_CATEGORY_ID: value.PRODUCT_CATEGORY_ID,
                        PRODUCT_CATEGORY_NAME: value.PRODUCT_CATEGORY_NAME,
                        PRODUCT_CATEGORY_ALPHABET: value.PRODUCT_CATEGORY_ALPHABET
                      })
                      setValue('PRODUCT_MAIN', {
                        PRODUCT_CATEGORY_ID: value.PRODUCT_CATEGORY_ID,
                        PRODUCT_CATEGORY_NAME: value.PRODUCT_CATEGORY_NAME,
                        PRODUCT_CATEGORY_ALPHABET: value.PRODUCT_CATEGORY_ALPHABET,
                        PRODUCT_CATEGORY_CODE: value.PRODUCT_CATEGORY_CODE,
                        PRODUCT_MAIN_ID: value.PRODUCT_MAIN_ID,
                        PRODUCT_MAIN_NAME: value.PRODUCT_MAIN_NAME,
                        PRODUCT_MAIN_ALPHABET: value.PRODUCT_MAIN_ALPHABET
                      })
                      setValue('PRODUCT_SUB', {
                        PRODUCT_SUB_ID: value.PRODUCT_SUB_ID,
                        PRODUCT_SUB_NAME: value.PRODUCT_SUB_NAME,
                        PRODUCT_SUB_ALPHABET: value.PRODUCT_SUB_ALPHABET
                      })

                      fetchBomDetailsByBomIdAndProductTypeId(value.BOM_ID, value.PRODUCT_TYPE_ID).then(res => {
                        setValue('BOM_ID', value.BOM_ID)
                        setValue('BOM_CODE_ACTUAL', res.bomCode)
                        setValue('BOM_CODE', res.bomCode)
                        setValue('BOM_NAME_ACTUAL', res.bomName)
                        setValue('BOM_NAME', res.bomName)
                        setValue('FLOW_PROCESS', res.PROCESS)
                        setValue('MATERIAL_IN_PROCESS', res.ITEM)
                        setValue(
                          'MATERIAL_IN_PROCESS_ID',
                          Object.keys(res.ITEM).map(key => {
                            return {
                              id: key
                            }
                          })
                        )
                      })
                    } else {
                      setValue('ITEM_CATEGORY', '')
                      setValue('PRODUCT_SPECIFICATION_TYPE', '')
                      setValue('PRODUCT_CATEGORY', null)
                      setValue('PRODUCT_MAIN', null)
                      setValue('PRODUCT_SUB', null)
                      setValue('BOM_ID', null)
                      setValue('BOM_CODE_ACTUAL', '')
                      setValue('BOM_CODE', '')
                      setValue('BOM_NAME_ACTUAL', '')
                      setValue('BOM_NAME', '')
                      setValue('FLOW_PROCESS', [])
                      setValue('MATERIAL_IN_PROCESS', [])
                      setValue('MATERIAL_IN_PROCESS_ID', [])
                    }
                  }}
                  key={
                    watch('PRODUCT_SUB')?.PRODUCT_SUB_ID ||
                    watch('PRODUCT_MAIN')?.PRODUCT_MAIN_ID ||
                    watch('PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID
                  }
                  loadOptions={inputValue =>
                    fetchProductTypeByLikeProductTypeNameAndInuse({
                      PRODUCT_TYPE_NAME: getValues('PRODUCT_TYPE')?.PRODUCT_TYPE_NAME || '',
                      PRODUCT_TYPE_CODE: inputValue,
                      PRODUCT_CATEGORY_ID: getValues('PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID || '',
                      PRODUCT_MAIN_ID: getValues('PRODUCT_MAIN')?.PRODUCT_MAIN_ID || '',
                      PRODUCT_SUB_ID: getValues('PRODUCT_SUB')?.PRODUCT_SUB_ID || '',
                      INUSE: 1
                    })
                  }
                  getOptionLabel={data => data.PRODUCT_TYPE_CODE?.toString() ?? ''}
                  getOptionValue={data => data.PRODUCT_TYPE_ID?.toString() ?? ''}
                  classNamePrefix='select'
                  {...(errors.PRODUCT_TYPE && {
                    error: true,
                    helperText: errors.PRODUCT_TYPE.message
                  })}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={8} lg={8}>
            <Controller
              name='PRODUCT_TYPE'
              control={control}
              render={({ field: { onChange, ...fieldProps } }) => (
                <AsyncSelectCustom<ProductTypeOption>
                  label='Product Type Name'
                  inputId='PRODUCT_TYPE'
                  {...fieldProps}
                  isDisabled={getValues('mode') === 'view' || getValues('mode') === 'edit'}
                  isClearable
                  cacheOptions
                  defaultOptions
                  value={watch('PRODUCT_TYPE')}
                  onChange={value => {
                    onChange(value)

                    if (value) {
                      setValue('ITEM_CATEGORY', value?.ITEM_CATEGORY_NAME ?? '')
                      setValue('PRODUCT_SPECIFICATION_TYPE', value?.PRODUCT_SPECIFICATION_TYPE_NAME ?? '')

                      setValue('PRODUCT_CATEGORY', {
                        PRODUCT_CATEGORY_ID: value.PRODUCT_CATEGORY_ID,
                        PRODUCT_CATEGORY_NAME: value.PRODUCT_CATEGORY_NAME,
                        PRODUCT_CATEGORY_ALPHABET: value.PRODUCT_CATEGORY_ALPHABET
                      })
                      setValue('PRODUCT_MAIN', {
                        PRODUCT_CATEGORY_ID: value.PRODUCT_CATEGORY_ID,
                        PRODUCT_CATEGORY_NAME: value.PRODUCT_CATEGORY_NAME,
                        PRODUCT_CATEGORY_ALPHABET: value.PRODUCT_CATEGORY_ALPHABET,
                        PRODUCT_CATEGORY_CODE: value.PRODUCT_CATEGORY_CODE,
                        PRODUCT_MAIN_ID: value.PRODUCT_MAIN_ID,
                        PRODUCT_MAIN_NAME: value.PRODUCT_MAIN_NAME,
                        PRODUCT_MAIN_ALPHABET: value.PRODUCT_MAIN_ALPHABET
                      })
                      setValue('PRODUCT_SUB', {
                        PRODUCT_SUB_ID: value.PRODUCT_SUB_ID,
                        PRODUCT_SUB_NAME: value.PRODUCT_SUB_NAME,
                        PRODUCT_SUB_ALPHABET: value.PRODUCT_SUB_ALPHABET
                      })

                      fetchBomDetailsByBomIdAndProductTypeId(value.BOM_ID, value.PRODUCT_TYPE_ID).then(res => {
                        setValue('BOM_ID', value.BOM_ID)
                        setValue('BOM_CODE_ACTUAL', res.bomCode)
                        setValue('BOM_CODE', res.bomCode)
                        setValue('BOM_NAME_ACTUAL', res.bomName)
                        setValue('BOM_NAME', res.bomName)
                        setValue('FLOW_PROCESS', res.PROCESS)
                        setValue('MATERIAL_IN_PROCESS', res.ITEM)
                        setValue(
                          'MATERIAL_IN_PROCESS_ID',
                          Object.keys(res.ITEM).map(key => {
                            return {
                              id: key
                            }
                          })
                        )
                      })
                    } else {
                      setValue('ITEM_CATEGORY', '')
                      setValue('PRODUCT_SPECIFICATION_TYPE', '')
                      setValue('PRODUCT_CATEGORY', null)
                      setValue('PRODUCT_MAIN', null)
                      setValue('PRODUCT_SUB', null)
                      setValue('BOM_ID', null)
                      setValue('BOM_CODE_ACTUAL', '')
                      setValue('BOM_CODE', '')
                      setValue('BOM_NAME_ACTUAL', '')
                      setValue('BOM_NAME', '')
                      setValue('FLOW_PROCESS', [])
                      setValue('MATERIAL_IN_PROCESS', [])
                      setValue('MATERIAL_IN_PROCESS_ID', [])
                    }
                  }}
                  key={
                    watch('PRODUCT_SUB')?.PRODUCT_SUB_ID ||
                    watch('PRODUCT_MAIN')?.PRODUCT_MAIN_ID ||
                    watch('PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID
                  }
                  loadOptions={inputValue =>
                    fetchProductTypeByLikeProductTypeNameAndInuse({
                      PRODUCT_TYPE_NAME: inputValue,
                      PRODUCT_TYPE_CODE: getValues('PRODUCT_TYPE')?.PRODUCT_TYPE_CODE || '',
                      PRODUCT_CATEGORY_ID: getValues('PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID || '',
                      PRODUCT_MAIN_ID: getValues('PRODUCT_MAIN')?.PRODUCT_MAIN_ID || '',
                      PRODUCT_SUB_ID: getValues('PRODUCT_SUB')?.PRODUCT_SUB_ID || '',
                      INUSE: 1
                    })
                  }
                  getOptionLabel={data => data.PRODUCT_TYPE_NAME.toString()}
                  getOptionValue={data => data.PRODUCT_TYPE_ID.toString()}
                  classNamePrefix='select'
                  {...(errors.PRODUCT_TYPE && {
                    error: true,
                    helperText: errors.PRODUCT_TYPE.message
                  })}
                />
              )}
            />
          </Grid>
        </Grid>
        <Grid item xs={12} sm={4} lg={4}>
          <Controller
            name='ITEM_CATEGORY'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Item Category'
                placeholder='Auto'
                autoComplete='off'
                disabled={true}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={4} lg={4}>
          <Controller
            name='PRODUCT_SPECIFICATION_TYPE'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Product Specification Type'
                placeholder='Auto'
                autoComplete='off'
                disabled={true}
              />
            )}
          />
        </Grid>
        <Grid container item xs={12} spacing={3}>
          <Grid item xs={12} sm={4} lg={4}>
            <Controller
              name='NOTE'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  disabled={getValues('mode') === 'view'}
                  fullWidth
                  label={
                    <div className='flex gap-1'>
                      <Typography variant='body2' color='primary'>
                        Note
                      </Typography>{' '}
                      <Typography variant='body2' color='secondary'>
                        (optional)
                      </Typography>
                    </div>
                  }
                  autoComplete='off'
                  multiline
                  rows={4}
                />
              )}
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default Product
