import { Dispatch, SetStateAction, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { Controller, SubmitErrorHandler, SubmitHandler, useFormContext, useFormState } from 'react-hook-form'

import { Button, Card, CardContent, CardHeader, Collapse, Divider, Grid, IconButton, Typography } from '@mui/material'

import classNames from 'classnames'

// Components Imports
import CustomTextField from '@core/components/mui/TextField'
import SelectCustom from '@/components/react-select/SelectCustom'

import StatusOption from '@/libs/react-select/option/StatusOption'

// types Im

// React Query Imports
import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useFlowProcessData'

import { getUserData } from '@/utils/user-profile/userLoginProfile'

import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'

import SearchIcon from '@mui/icons-material/Search'
import {
  fetchProductMainByLikeProductMainNameAndInuse,
  fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse,
  ProductMainOption
} from '@/_workspace/react-select/async-promise-load-options/fetchProductMain'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import { FormData } from './FlowProcessSelectModal'
import {
  fetchProductCategoryByLikeProductCategoryNameAndInuse,
  ProductCategoryOption
} from '@/_workspace/react-select/async-promise-load-options/fetchProductCategory'

interface Props {
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
  getValues: any
}

const FlowProcessSearch = ({ setIsEnableFetching, getValues: getValuesForm }: Props) => {
  // States
  const [collapse, setCollapse] = useState(false)

  // Hooks : react-hook-form
  const { setValue, getValues, control, handleSubmit, watch } = useFormContext<FormData>()

  const { isLoading } = useFormState<FormData>()

  // Hooks : react-query
  const queryClient = useQueryClient()

  const onResetFormSearch = () => {
    setValue('searchFilters', {
      ...getValues('searchFilters'),
      PRODUCT_CATEGORY: null,
      PRODUCT_MAIN: null,
      FLOW_CODE: '',
      FLOW_NAME: '',
      INUSE: null
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
    <Card
      style={{ overflow: 'visible', zIndex: 4 }}
      sx={{
        border: '1px solid var(--mui-palette-customColors-inputBorder)'
      }}
    >
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
              <Divider>
                <Typography color='primary'>Product</Typography>
              </Divider>
              <Grid
                container
                spacing={6}
                sx={{
                  paddingTop: '8px',
                  paddingBottom: '12px'
                }}
              >
                <Grid item xs={12} sm={4} lg={4}>
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
                        }}
                        loadOptions={inputValue => {
                          return fetchProductCategoryByLikeProductCategoryNameAndInuse(inputValue, '1')
                        }}
                        getOptionLabel={data => data?.PRODUCT_CATEGORY_NAME?.toString() ?? ''}
                        getOptionValue={data => data?.PRODUCT_CATEGORY_ID?.toString() ?? ''}
                        classNamePrefix={'select'}
                        placeholder='Select Product Category ...'
                        isDisabled={getValuesForm('PRODUCT_MAIN')?.PRODUCT_MAIN_ID ? true : false}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4} lg={4} sx={{ marginBottom: '1rem' }}>
                  <Controller
                    name='searchFilters.PRODUCT_MAIN'
                    control={control}
                    render={({ field: { onChange, ...fieldProps } }) => (
                      <AsyncSelectCustom<ProductMainOption>
                        label='Product Main'
                        inputId='PRODUCT_MAIN'
                        {...fieldProps}
                        key={watch('searchFilters.PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID}
                        isClearable
                        cacheOptions
                        defaultOptions
                        value={getValues('searchFilters.PRODUCT_MAIN')}
                        onChange={value => {
                          onChange(value)
                        }}
                        loadOptions={inputValue => {
                          if (watch('searchFilters.PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID) {
                            return fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse(
                              inputValue,
                              1,
                              getValues('searchFilters.PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID ?? ''
                            )
                          }

                          return fetchProductMainByLikeProductMainNameAndInuse(inputValue, 1)
                        }}
                        getOptionLabel={data => data.PRODUCT_MAIN_NAME.toString()}
                        getOptionValue={data => data.PRODUCT_MAIN_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select Product Main ...'
                        isDisabled={getValuesForm('PRODUCT_MAIN')?.PRODUCT_MAIN_ID ? true : false}
                      />
                    )}
                  />
                </Grid>
              </Grid>
              <Divider>
                <Typography color='primary'>Flow Detail</Typography>
              </Divider>
              <Grid
                container
                spacing={6}
                sx={{
                  paddingTop: '8px',
                  paddingBottom: '12px'
                }}
              >
                <Grid item xs={12} sm={4} lg={4}>
                  <Controller
                    name='searchFilters.FLOW_CODE'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Flow Code'
                        placeholder='Enter Flow Code'
                        autoComplete='off'
                        style={{ marginTop: '3px' }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4} lg={4}>
                  <Controller
                    name='searchFilters.FLOW_NAME'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Flow Name'
                        placeholder='Enter Flow Name'
                        autoComplete='off'
                        style={{ marginTop: '3px' }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={3} lg={3}>
                  <Controller
                    name='searchFilters.INUSE'
                    control={control}
                    render={({ field: { ...fieldProps } }) => (
                      <SelectCustom
                        label='Status'
                        {...fieldProps}
                        isClearable
                        options={StatusOption}
                        classNamePrefix='select'
                        placeholder='Select Status ...'
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
            </>
          )}
        </CardContent>
      </Collapse>
    </Card>
  )
}

export default FlowProcessSearch
