// React Imports
import { Dispatch, SetStateAction, useState } from 'react'

// MUI Imports
import { Button, Card, CardContent, CardHeader, Collapse, Grid, IconButton, Select, Skeleton } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

// Third-party Imports
import classNames from 'classnames'

// Components Imports

// react-hook-from Imports
import { Controller, useFormContext, useFormState } from 'react-hook-form'
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'

import { useQueryClient } from '@tanstack/react-query'

// import AsyncCreatableSelect from 'react-select/async-creatable'

import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useSpecificationSettingData'

// import { fetchProductCategoryByLikeProductCategoryNameAndInuse } from '@/libs/react-select/AsyncPromiseLoadOptions/fetchProductCategory'

// react-select Imports
import CustomTextField from '@components/mui/TextField'

// react-query Imports

// Types
import type { FormData } from './page'
import SkeletonCustom from '@/components/SkeletonCustom'
import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { MENU_ID } from './env'
import StatusOption from '@/libs/react-select/option/StatusOption'
import SelectCustom from '@/components/react-select/SelectCustom'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import { fetchProductCategoryByLikeProductCategoryNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchProductCategory'
import {
  fetchProductMainByLikeProductMainNameAndInuse,
  fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse,
  ProductMainOption
} from '@/_workspace/react-select/async-promise-load-options/fetchProductMain'
import {
  CustomerOrderFromOption,
  fetchCustomerOrderFromByLikeCustomerOrderFromNameAndInuse
} from '@/_workspace/react-select/async-promise-load-options/customer/fetchCustomerOrderFrom'
import { fetchProductSpecificationTypeByLikeProductSpecificationTypeNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/specification-setting/fetchSpecificationType'

interface Props {
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}
function SpecificationSettingSearch({ setIsEnableFetching }: Props) {
  // States
  const [collapse, setCollapse] = useState(false)

  // Hooks
  // Hooks : react-hook-form
  const { setValue, getValues, control, handleSubmit, watch } = useFormContext<FormData>()

  const { isLoading } = useFormState()

  // Hooks : react-query
  const queryClient = useQueryClient()

  // Function
  const onResetFormSearch = () => {
    setValue('searchFilters', {
      customerOrderFrom: null,
      specificationSetting: '',
      productMain: null,
      specificationSettingNumber: '',
      specificationSettingVersionRevision: '',
      partNumber: '',
      modelNumber: '',
      productSpecificationType: null,
      status: null
    })
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
          specificationSetting: getValues('searchFilters.specificationSetting'),
          customerOrderFrom: getValues('searchFilters.customerOrderFrom'),
          productMain: getValues('searchFilters.productMain'),
          // productMain: getValues('searchFilters.productMain'),
          partNumber: getValues('searchFilters.partNumber'),
          specificationSettingNumber: getValues('searchFilters.specificationSettingNumber'),
          specificationSettingVersionRevision: getValues('searchFilters.specificationSettingVersionRevision'),
          modelNumber: getValues('searchFilters.modelNumber') || '',
          productSpecificationType: getValues('searchFilters.productSpecificationType'),
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

  const { mutate, isError, error } = useCreate(onMutateSuccess, onMutateError)

  return (
    <Card style={{ overflow: 'visible', zIndex: 4 }}>
      <CardHeader
        title='Search filters'
        action={
          <IconButton size='small' aria-label='collapse' onClick={() => setCollapse(!collapse)}>
            <i className={classNames(collapse ? 'tabler-chevron-down' : 'tabler-chevron-up', 'text-xl')} />
          </IconButton>
        }
        avatar={<i className='tabler-search text-xl' />}
        titleTypographyProps={{ variant: 'h5' }}
        sx={{ '& .MuiCardHeader-avatar': { mr: 3 } }}
      />
      <Collapse in={!collapse}>
        <CardContent>
          {isError ? <div>An error occurred: {error.message}</div> : null}
          {isLoading ? (
            <>
              <SkeletonCustom />
            </>
          ) : (
            <>
              <Grid container className='mbs-0' spacing={6}>
                {/* <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.productCategoryCode'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Product Category Code'
                        placeholder='Enter Product Main Code'
                        autoComplete='off'
                      />
                    )}
                  />
                </Grid> */}
                {/* <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.productMain'
                    control={control}
                    render={({ field: { onChange, ...fieldProps } }) => (
                      <AsyncSelectCustom
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        loadOptions={inputValue => {
                          return fetchProductMainByLikeProductMainNameAndInuse(inputValue, 1)
                        }}
                        onChange={value => {
                          onChange(value)
                          // setValue('searchFilters.process', null)
                        }}
                        getOptionLabel={data => data?.PRODUCT_MAIN_NAME || ''}
                        getOptionValue={data => ({
                          PRODUCT_MAIN_ID: data.PRODUCT_MAIN_ID?.toString(),
                          PRODUCT_MAIN_NAME: data?.PRODUCT_MAIN_NAME
                        })}
                        classNamePrefix='select'
                        label='Product Main'
                        placeholder='Enter Product Main'
                        // autoComplete='off'
                      />
                    )}
                  />
                </Grid> */}

                {/* <Grid item xs={12} sm={4} lg={3}>
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
                        // value={watch('searchFilters.productMain')?.PRODUCT_MAIN_ID}
                        loadOptions={inputValue => {
                          if (getValues('searchFilters.productCategory')) {
                            return fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse(
                              inputValue,
                              '1',
                              watch('searchFilters.productCategory')?.PRODUCT_CATEGORY_ID
                            )
                          } else {
                            return fetchProductMainByLikeProductMainNameAndInuse(inputValue || '', 1)
                          }
                        }}
                        onChange={value => {
                          onChange(value)
                          console.log('main', value)

                          // setValue('searchFilters.process', null)
                        }}
                        getOptionLabel={data => data?.PRODUCT_MAIN_NAME || ''}
                        getOptionValue={data => data?.PRODUCT_MAIN_ID?.toString() || ''}
                        classNamePrefix='select'
                        label='Product Main'
                        placeholder='Enter Product Main'
                        // autoComplete='off'
                      />
                    )}
                  />
                </Grid> */}
                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.specificationSetting'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Product Specification Document Setting Name'
                        placeholder='Enter Product Specification Document Setting Name'
                        autoComplete='off'
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.specificationSettingNumber'
                    control={control}
                    render={({ field: { ...fieldProps } }) => (
                      <CustomTextField
                        // onChange={e => {
                        //   if (e.target.value === '') {
                        //     onChange('')
                        //   } else {
                        //     onChange(Number(e.target.value))
                        //   }
                        // }}
                        {...fieldProps}
                        fullWidth
                        label='Product Specification Document Setting Number'
                        placeholder='Enter Product Specification Document Setting Number'
                        autoComplete='off'
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.specificationSettingVersionRevision'
                    control={control}
                    render={({ field: { ...fieldProps } }) => (
                      <CustomTextField
                        // onChange={e => {
                        //   if (e.target.value === '') {
                        //     onChange('')
                        //   } else {
                        //     onChange(Number(e.target.value))
                        //   }
                        // }}
                        {...fieldProps}
                        fullWidth
                        label='Product Specification Setting Document Version Revision'
                        placeholder='Enter Product Specification Document Setting Version Revision'
                        autoComplete='off'
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.partNumber'
                    control={control}
                    render={({ field: { ...fieldProps } }) => (
                      <CustomTextField
                        // onChange={e => {
                        //   if (e.target.value === '') {
                        //     onChange('')
                        //   } else {
                        //     onChange(Number(e.target.value))
                        //   }
                        // }}
                        {...fieldProps}
                        fullWidth
                        label='Product Part Number'
                        placeholder='Enter Product Part Number'
                        autoComplete='off'
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.modelNumber'
                    control={control}
                    render={({ field: { ...fieldProps } }) => (
                      <CustomTextField
                        // onChange={e => {
                        //   if (e.target.value === '') {
                        //     onChange('')
                        //   } else {
                        //     onChange(Number(e.target.value))
                        //   }
                        // }}
                        {...fieldProps}
                        fullWidth
                        label='Product Model Number'
                        placeholder='Enter Product Model Number'
                        autoComplete='off'
                      />
                    )}
                  />
                </Grid>

                {/* <Grid container spacing={6}> */}
                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.productMain'
                    control={control}
                    render={({ field: { onChange, ...fieldProps } }) => (
                      <AsyncSelectCustom<ProductMainOption>
                        label='Product Main'
                        inputId='PRODUCT_MAIN'
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        value={getValues('searchFilters.productMain')}
                        onChange={value => {
                          onChange(value)
                        }}
                        loadOptions={inputValue => {
                          return fetchProductMainByLikeProductMainNameAndInuse(inputValue, 1)
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
                    name='searchFilters.customerOrderFrom'
                    control={control}
                    render={({ field: { onChange, ...fieldProps } }) => (
                      <AsyncSelectCustom<CustomerOrderFromOption>
                        label='Customer (in specification)'
                        inputId='CUSTOMER_ORDER_FROM'
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        value={getValues('searchFilters.customerOrderFrom')}
                        onChange={value => {
                          onChange(value)
                        }}
                        loadOptions={inputValue => {
                          return fetchCustomerOrderFromByLikeCustomerOrderFromNameAndInuse(inputValue, 1)
                        }}
                        getOptionLabel={data => data.CUSTOMER_ORDER_FROM_NAME.toString()}
                        getOptionValue={data => data.CUSTOMER_ORDER_FROM_ID?.toString()}
                        classNamePrefix='select'
                        placeholder='Select Customer In Specification ...'
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.productSpecificationType'
                    control={control}
                    render={({ field: { onChange, ...fieldProps } }) => (
                      <AsyncSelectCustom
                        label='Product Specification Type'
                        inputId='PRODUCT_SPECIFICATION_TYPE'
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        value={getValues('searchFilters.productSpecificationType')}
                        onChange={value => {
                          onChange(value)
                        }}
                        loadOptions={inputValue => {
                          return fetchProductSpecificationTypeByLikeProductSpecificationTypeNameAndInuse(inputValue, 1)
                        }}
                        getOptionLabel={data => data?.PRODUCT_SPECIFICATION_TYPE_NAME.toString()}
                        getOptionValue={data => data?.PRODUCT_SPECIFICATION_TYPE_ID?.toString()}
                        classNamePrefix='select'
                        placeholder='Select Product Specification Type ...'
                      />
                    )}
                  />
                </Grid>
                {/* </Grid> */}

                {/* <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.productMain'
                    control={control}
                    render={({ field: { onChange, ...fieldProps } }) => (
                      <AsyncSelectCustom
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        loadOptions={inputValue => {
                          return fetchProductMainByLikeProductMainNameAndInuse(inputValue, 1)
                        }}
                        onChange={value => {
                          onChange(value)
                          // setValue('searchFilters.process', null)
                        }}
                        getOptionLabel={data => data?.PRODUCT_MAIN_NAME || ''}
                        getOptionValue={data => ({
                          PRODUCT_MAIN_ID: data.PRODUCT_MAIN_ID?.toString(),
                          PRODUCT_MAIN_NAME: data?.PRODUCT_MAIN_NAME
                        })}
                        classNamePrefix='select'
                        label='Product Main'
                        placeholder='Enter Product Main'
                        // autoComplete='off'
                      />
                    )}
                  />
                </Grid> */}

                {/* <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.customerOrderFrom'
                    control={control}
                    render={({ field: { onChange, ...fieldProps } }) => (
                      <AsyncSelectCustom
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        loadOptions={inputValue => {
                          return fetchCustomerOrderFromByLikeCustomerOrderFromNameAndInuse(inputValue, 1)
                        }}
                        onChange={value => {
                          onChange(value)
                          // setValue('searchFilters.process', null)
                        }}
                        getOptionLabel={data => data?.CUSTOMER_ORDER_FROM_NAME || ''}
                        getOptionValue={data => data?.CUSTOMER_ORDER_FROM_ID?.toString() || ''}
                        classNamePrefix='select'
                        label='Customer Order From'
                        placeholder='Enter Customer Order From'
                        // autoComplete='off'
                      />
                    )}
                  />
                </Grid> */}

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

export default SpecificationSettingSearch
