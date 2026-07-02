import { Dispatch, SetStateAction, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { Controller, SubmitErrorHandler, SubmitHandler, useFormContext, useFormState } from 'react-hook-form'

import { Button, Card, CardContent, CardHeader, Collapse, Divider, Grid, IconButton, Typography } from '@mui/material'

import classNames from 'classnames'

// Components Imports

// types Imports

// React Query Imports
import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useStandardCostForProduct'

import { MENU_ID } from './env'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'

import SearchIcon from '@mui/icons-material/Search'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import { fetchProductCategoryByLikeProductCategoryNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchProductCategory'
import { FormDataPage } from './validationSchema'
import {
  fetchProductMainByLikeProductMainNameAndInuse,
  fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchProductMain'
import {
  fetchProductSubByLikeProductSubNameAndInuse,
  fetchProductSubByLikeProductSubNameAndProductCategoryIdAndInuse,
  fetchProductSubByLikeProductSubNameAndProductMainIdAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchProductSub'
import { fetchSctPatternByLikePatternNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchSctPattern'
import CustomTextField from '@/components/mui/TextField'
import {
  fetchProductTypeByLikeProductTypeNameAndInuse,
  fetchProductTypeForSctByLikeProductTypeCodeAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchProductType'

import {
  fetchItemCategoryCanBeSoldByLikeItemCategoryNameAndInuse,
  fetchItemCategoryForBomByLikeItemCategoryNameAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchItemCategory'
import { fetchSctReasonByLikeSctReasonNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchSctReasonSetting'
import { fetchSctTagByLikeSctTagNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchSctTag'
import { fetchSctStatusProgressNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchSctStatusProgress'

interface Props {
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const StandardCostForProductSearch = ({ setIsEnableFetching }: Props) => {
  // States
  const [collapse, setCollapse] = useState(false)

  // Hooks : react-hook-form
  const {
    setValue,
    getValues,
    control,
    handleSubmit,
    formState: { errors },
    watch
  } = useFormContext<FormDataPage>()
  const { isLoading } = useFormState()

  // Hooks : react-query
  const queryClient = useQueryClient()

  const onResetFormSearch = () => {
    setValue('searchFilters', {})
  }

  // Function : react-hook-form
  const onSubmit: SubmitHandler<FormDataPage> = () => {
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    handleAdd()
  }

  const onError: SubmitErrorHandler<FormDataPage> = data => {
    console.log(data)
  }

  // react-query
  const handleAdd = () => {
    const dataItem = {
      USER_ID: getUserData().USER_ID,
      APPLICATION_ID: import.meta.env.VITE_APPLICATION_ID,
      MENU_ID: MENU_ID.toString(),
      USER_PROFILE_SETTING_PROGRAM_DATA: {
        searchFilters: {},
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
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Divider textAlign='left'>
                    <Typography variant='body2' color='primary'>
                      Header
                    </Typography>
                  </Divider>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Controller
                    name='searchFilters.sctRevisionCode'
                    control={control}
                    render={({ field: { ref, ...fieldProps } }) => (
                      <CustomTextField
                        {...fieldProps}
                        fullWidth
                        autoComplete='off'
                        label=' SCT Revision Code'
                        placeholder='Enter SCT Revision Code'
                        {...(errors?.searchFilters?.sctRevisionCode && {
                          error: true,
                          helperText: errors?.searchFilters?.sctRevisionCode.message
                        })}
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
                        {...(errors?.searchFilters?.fiscalYear && {
                          error: true,
                          helperText: errors?.searchFilters?.fiscalYear.message
                        })}
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
                          {...(errors?.searchFilters?.itemCategory && {
                            error: true,
                            helperText: errors?.searchFilters?.itemCategory.message
                          })}
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
                          {...(errors?.searchFilters?.productCategory && {
                            error: true,
                            helperText: errors?.searchFilters?.productCategory.message
                          })}
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
                          {...(errors?.searchFilters?.productMain && {
                            error: true,
                            helperText: errors?.searchFilters?.productMain.message
                          })}
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
                              1,
                              productMainId
                            )
                          } else if (productCategoryId) {
                            return fetchProductSubByLikeProductSubNameAndProductCategoryIdAndInuse(
                              inputValue,
                              1,
                              productCategoryId
                            )
                          } else {
                            return fetchProductSubByLikeProductSubNameAndInuse(inputValue, 1)
                          }
                        }}
                        getOptionLabel={data => data?.PRODUCT_SUB_NAME.toString()}
                        getOptionValue={data => data.PRODUCT_SUB_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select Product Sub ...'
                        {...(errors?.searchFilters?.productSub && {
                          error: true,
                          helperText: errors?.searchFilters?.productSub.message
                        })}
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
                          {...(errors?.searchFilters?.productType && {
                            error: true,
                            helperText: errors?.searchFilters?.productType.message
                          })}
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
                          {...(errors?.searchFilters?.productType && {
                            error: true,
                            helperText: errors?.searchFilters?.productType.message
                          })}
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
              </Grid>
              <Grid container className='mbs-0' spacing={6}>
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
                        {...(errors?.searchFilters?.sctReasonSetting && {
                          error: true,
                          helperText: errors?.searchFilters?.sctReasonSetting.message
                        })}
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
                        {...(errors?.searchFilters?.sctTagSetting && {
                          error: true,
                          helperText: errors?.searchFilters?.sctTagSetting.message
                        })}
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
                        {...(errors?.searchFilters?.sctStatusProgress && {
                          error: true,
                          helperText: errors?.searchFilters?.sctStatusProgress.message
                        })}
                      />
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

export default StandardCostForProductSearch
