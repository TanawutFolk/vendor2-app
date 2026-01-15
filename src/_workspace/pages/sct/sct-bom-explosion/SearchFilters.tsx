// React Imports
import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Collapse from '@mui/material/Collapse'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'

// Third-party Imports
import classNames from 'classnames'

// Components Imports
import { Controller, useFormContext, useFormState } from 'react-hook-form'

import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'

import { useQueryClient } from '@tanstack/react-query'

import CustomTextField from '@components/mui/TextField'
import SkeletonCustom from '@components/SkeletonCustom'
import AsyncSelectCustom from '@components/react-select/AsyncSelectCustom'
import SelectCustom from '@components/react-select/SelectCustom'

// React-hook-from Imports

// React-query Imports

// libs Imports
import { useCreate } from '@libs/react-query/hooks/common-system/useUserProfileSettingProgram'

// Utils Imports
import { getUserData } from '@utils/user-profile/userLoginProfile'

// _template Imports
import { useDxContext } from '@/_template/DxContextProvider'

// Workspace Imports
import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useStandardCostForProduct'
import { fetchProductCategoryByLikeProductCategoryNameAndInuse } from '@_workspace/react-select/async-promise-load-options/fetchProductCategory'

// My Components Imports
import { MENU_ID } from './env'
import type { FormDataPage } from './validationSchema'
import { Checkbox, Divider, FormControlLabel, Typography } from '@mui/material'
import { fetchSctPatternByLikePatternNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchSctPattern'
import { fetchItemCategoryCanBeSoldByLikeItemCategoryNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchItemCategory'
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
import { fetchSctReasonByLikeSctReasonNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchSctReasonSetting'
import { fetchSctTagByLikeSctTagNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchSctTag'
import { fetchSctStatusProgressNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchSctStatusProgress'
import { fetchCustomerInvoiceToByLikeCustomerInvoiceToNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/customer/fetchCustomerInvoiceTo'
import { ToastMessageError } from '@/components/ToastMessage'
import { fetchFlowByLikeFlowCodeAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchFlowProcess'
import { fetchBomByLikeBomCodeAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchBom'

function SctBomExplosionSearch() {
  // Context
  const { setIsEnableFetching, setPagination } = useDxContext()

  // States
  const [collapse, setCollapse] = useState(false)

  // react-hook-form
  const {
    setValue,
    getValues,
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useFormContext<FormDataPage>()
  const { isLoading } = useFormState()

  // react-query
  const queryClient = useQueryClient()

  // Function
  const onHandleClearSearchFilters = () => {
    setValue(
      'searchFilters',
      {
        sctRevisionCode: '',
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
        customerInvoice: null,
        alreadyHaveSellingPrice: null,
        includingCancelled: false,
        itemCodeForSupportMes: '',
        // itemInternalFullName: '',
        // itemInternalShortName: '',
        bom: null,
        flow: null,
        sctLatestRevisionOption: {
          value: 'All',
          label: 'All',
          icon: 'tabler-checks'
        }
      },
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true
      }
    )

    setValue(
      'searchFilters.sctLatestRevisionOption',
      {
        value: 'All',
        label: 'All',
        icon: 'tabler-checks'
      },
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true
      }
    )

    setValue('searchFilters.includingCancelled', false, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    })

    // setIsEnableFetching(true)
    // queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    handleAdd()
  }

  // #region Function - react-hook-form
  const onSubmit: SubmitHandler<FormDataPage> = () => {
    setPagination({ pageIndex: 0, pageSize: getValues('searchResults.pageSize') ?? 10 })
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    handleAdd()
  }

  const onError: SubmitErrorHandler<FormDataPage> = data => {
    const message = {
      title: 'SCT Data',
      message: data ? JSON.stringify(data) : ''
    }

    ToastMessageError(message)
  }

  const handleAdd = () => {
    const dataItem = {
      USER_ID: getUserData().USER_ID,
      APPLICATION_ID: import.meta.env.VITE_APPLICATION_ID,
      MENU_ID: MENU_ID.toString(),
      USER_PROFILE_SETTING_PROGRAM_DATA: {
        searchFilters: {
          sctRevisionCode: getValues('searchFilters.sctRevisionCode'),
          fiscalYear: getValues('searchFilters.fiscalYear'),
          sctPattern: getValues('searchFilters.sctPattern'),
          itemCategory: getValues('searchFilters.itemCategory'),
          productCategory: getValues('searchFilters.productCategory'),
          productMain: getValues('searchFilters.productMain'),
          productSub: getValues('searchFilters.productSub'),
          productType: getValues('searchFilters.productType'),
          sctReasonSetting: getValues('searchFilters.sctReasonSetting'),
          sctTagSetting: getValues('searchFilters.sctTagSetting'),
          sctStatusProgress: getValues('searchFilters.sctStatusProgress'),
          productionSpecificationType: getValues('searchFilters.productionSpecificationType'),
          customerInvoice: getValues('searchFilters.customerInvoice'),
          alreadyHaveSellingPrice: getValues('searchFilters.alreadyHaveSellingPrice'),
          includingCancelled: getValues('searchFilters.includingCancelled'),
          sctLatestRevisionOption: getValues('searchFilters.sctLatestRevisionOption'),
          itemCodeForSupportMes: getValues('searchFilters.itemCodeForSupportMes'),
          // itemInternalFullName: getValues('searchFilters.itemInternalFullName'),
          // itemInternalShortName: getValues('searchFilters.itemInternalShortName'),
          bom: getValues('searchFilters.bom'),
          flow: getValues('searchFilters.flow')
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
      } as FormDataPage
    }

    mutate(dataItem)
  }

  const onMutateSuccess = () => {}

  const onMutateError = (e: any) => {}

  const { mutate, isError, error } = useCreate(onMutateSuccess, onMutateError)

  // #endregion Function - react-hook-form

  return (
    <Card style={{ overflow: 'visible', zIndex: 4 }}>
      <CardHeader
        title='Search filters'
        action={
          <IconButton size='small' aria-label='collapse' onClick={() => setCollapse(!collapse)}>
            <i className={classNames(collapse ? 'tabler-chevron-down' : 'tabler-chevron-up', 'text-xl')} />
          </IconButton>
        }
        titleTypographyProps={{ variant: 'h5' }}
        sx={{ '& .MuiCardHeader-avatar': { mr: 3 } }}
      />
      <Collapse in={!collapse}>
        <CardContent>
          {isError && <div>An error occurred: {error.message}</div>}
          {isLoading ? (
            <>
              <SkeletonCustom />
            </>
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
                <Grid item xs={12} sm={5}>
                  <Controller
                    name='searchFilters.sctRevisionCode'
                    control={control}
                    render={({ field: { ...fieldProps } }) => (
                      <CustomTextField
                        rows={1}
                        multiline
                        {...fieldProps}
                        fullWidth
                        autoComplete='off'
                        label={`SCT Revision Code (กรุณาใส่ , (Comma) คั่น กรณีมากกว่า 1 รายการ)`}
                        placeholder='Enter ...'
                        {...(errors?.searchFilters?.sctRevisionCode && {
                          error: true,
                          helperText: errors?.searchFilters?.sctRevisionCode?.message
                        })}
                        disabled={watch('searchFilters.sctLatestRevisionOption')?.value === 'Latest'}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Controller
                    name='searchFilters.sctLatestRevisionOption'
                    control={control}
                    render={({ field: { onChange, ...fieldProps } }) => (
                      <SelectCustom
                        {...fieldProps}
                        options={[
                          {
                            value: 'All',
                            label: 'All',
                            icon: 'tabler-checks'
                          },
                          {
                            value: 'Latest',
                            label: 'Latest',
                            icon: 'tabler-check'
                          }
                        ]}
                        onChange={value => {
                          onChange(value)
                          if (value?.value === 'Latest') {
                            setValue('searchFilters.sctRevisionCode', '', { shouldDirty: true, shouldValidate: true })
                          }
                        }}
                        isClearable
                        label='Option - SCT Revision Code'
                        placeholder='Select ...'
                        classNamePrefix='select'
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Controller
                    name='searchFilters.fiscalYear'
                    control={control}
                    render={({ field: { ref, ...fieldProps } }) => (
                      <CustomTextField
                        {...fieldProps}
                        fullWidth
                        autoComplete='off'
                        label='Fiscal Year'
                        placeholder='Enter ...'
                        {...(errors?.searchFilters?.fiscalYear && {
                          error: true,
                          helperText: errors?.searchFilters?.fiscalYear.message
                        })}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
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
                          placeholder='Select ...'
                          {...(errors?.searchFilters?.sctPattern && {
                            error: true,
                            helperText: errors?.searchFilters?.sctPattern.message
                          })}
                        />
                      </>
                    )}
                  />
                </Grid>
                <Grid item xs={12} mt={3}>
                  <Divider textAlign='left'>
                    <Typography variant='body2' color='primary'>
                      Component
                    </Typography>
                  </Divider>
                </Grid>
                <Grid item xs={12} sm={5} lg={5}>
                  <Controller
                    name='searchFilters.itemCodeForSupportMes'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        rows={1}
                        multiline
                        {...field}
                        fullWidth
                        label={`Item Code (กรุณาใส่ , (Comma) คั่น กรณีมากกว่า 1 รายการ)`}
                        placeholder='Enter ...'
                        autoComplete='off'
                      />
                    )}
                  />
                </Grid>
                {/* <Grid item xs={12} sm={3} lg={3}>
                  <Controller
                    name='searchFilters.itemInternalFullName'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Item Internal Full Name'
                        placeholder='Enter ...'
                        autoComplete='off'
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={3} lg={3}>
                  <Controller
                    name='searchFilters.itemInternalShortName'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Item Internal Short Name'
                        placeholder='Enter ...'
                        autoComplete='off'
                      />
                    )}
                  />
                </Grid> */}
                <Grid item xs={12} sm={3} lg={3}>
                  <Controller
                    name='searchFilters.flow'
                    control={control}
                    render={({ field: { ...fieldProps } }) => (
                      <AsyncSelectCustom
                        {...fieldProps}
                        label='Flow Code'
                        isClearable
                        cacheOptions
                        defaultOptions
                        loadOptions={inputValue => {
                          console.log(inputValue)
                          return fetchFlowByLikeFlowCodeAndInuse({
                            flowCode: inputValue,
                            inuse: 1
                          })
                        }}
                        getOptionLabel={data => data?.FLOW_CODE?.toString()}
                        getOptionValue={data => data?.FLOW_ID?.toString()}
                        classNamePrefix='select'
                        placeholder='Select ...'
                        {...(errors?.searchFilters?.flow && {
                          error: true,
                          helperText: errors?.searchFilters?.flow.message
                        })}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={3} lg={3}>
                  <Controller
                    name='searchFilters.bom'
                    control={control}
                    render={({ field: { ...fieldProps } }) => (
                      <AsyncSelectCustom
                        {...fieldProps}
                        label='BOM Code'
                        isClearable
                        cacheOptions
                        defaultOptions
                        loadOptions={inputValue => {
                          return fetchBomByLikeBomCodeAndInuse({
                            bomCode: inputValue,
                            inuse: 1
                          })
                        }}
                        getOptionLabel={data => data?.BOM_CODE.toString()}
                        getOptionValue={data => data.BOM_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select ...'
                        {...(errors?.searchFilters?.bom && {
                          error: true,
                          helperText: errors?.searchFilters?.bom.message
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
                      name='searchFilters.itemCategory'
                      control={control}
                      render={({ field: { ...fieldProps } }) => (
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
                          placeholder='Select ...'
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid container className='mbs-0' spacing={4}>
                <Grid item xs={12} mt={3}>
                  <Divider textAlign='left'>
                    <Typography variant='body2' color='primary'>
                      Objective
                    </Typography>
                  </Divider>
                </Grid>
                <Grid item xs={12} sm={2}>
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
                        placeholder='Select ...'
                        {...(errors?.searchFilters?.sctReasonSetting && {
                          error: true,
                          helperText: errors?.searchFilters?.sctReasonSetting.message
                        })}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
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
                        placeholder='Select ...'
                        {...(errors?.searchFilters?.sctTagSetting && {
                          error: true,
                          helperText: errors?.searchFilters?.sctTagSetting.message
                        })}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Controller
                    name='searchFilters.sctStatusProgress'
                    control={control}
                    render={({ field: { onChange, ...fieldProps } }) => (
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
                        onChange={option => {
                          if (option?.SCT_STATUS_PROGRESS_ID) {
                            if (option?.SCT_STATUS_PROGRESS_ID === 1) {
                              setValue('searchFilters.includingCancelled', true, {
                                shouldDirty: true,
                                shouldTouch: true,
                                shouldValidate: true
                              })
                            } else {
                              setValue('searchFilters.includingCancelled', false, {
                                shouldDirty: true,
                                shouldTouch: true,
                                shouldValidate: true
                              })
                            }
                          }

                          onChange(option)
                        }}
                        getOptionLabel={data => data?.SCT_STATUS_PROGRESS_NAME.toString()}
                        getOptionValue={data => data.SCT_STATUS_PROGRESS_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select ...'
                        {...(errors?.searchFilters?.sctStatusProgress && {
                          error: true,
                          helperText: errors?.searchFilters?.sctStatusProgress.message
                        })}
                      />
                    )}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={2}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-end'
                  }}
                >
                  <Controller
                    name='searchFilters.includingCancelled'
                    control={control}
                    render={({ field: { value, ...fieldProps } }) => (
                      <FormControlLabel
                        control={<Checkbox {...fieldProps} color='warning' checked={value} />}
                        label='Including Cancelled'
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Controller
                    name='searchFilters.alreadyHaveSellingPrice'
                    control={control}
                    render={({ field: { ...fieldProps } }) => (
                      <SelectCustom
                        {...fieldProps}
                        options={[
                          {
                            value: 1,
                            label: 'Yes',
                            icon: 'tabler-check'
                          },
                          {
                            value: 0,
                            label: 'No',
                            icon: 'tabler-x'
                          }
                        ]}
                        isClearable
                        label='Already have a Selling Price ?'
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
                  <Button variant='tonal' color='secondary' type='reset' onClick={onHandleClearSearchFilters}>
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

export default SctBomExplosionSearch
