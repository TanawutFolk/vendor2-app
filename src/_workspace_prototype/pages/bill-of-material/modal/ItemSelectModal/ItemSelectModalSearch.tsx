import { Dispatch, SetStateAction, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { Controller, SubmitErrorHandler, SubmitHandler, useFormContext, useFormState } from 'react-hook-form'

import { Button, Card, CardContent, CardHeader, Collapse, Divider, Grid, IconButton, Typography } from '@mui/material'

import classNames from 'classnames'

// Components Imports

import SelectCustom from '@/components/react-select/SelectCustom'

import StatusOption from '@/libs/react-select/option/StatusOption'

// types Im

// React Query Imports
import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useItemData'

import { getUserData } from '@/utils/user-profile/userLoginProfile'

import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'

import SearchIcon from '@mui/icons-material/Search'
import {
  fetchProductMainByLikeProductMainNameAndInuse,
  ProductMainOption
} from '@/_workspace/react-select/async-promise-load-options/fetchProductMain'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import { FormData } from './ItemSelectModal'
import {
  fetchItemCategoryForBomByLikeItemCategoryNameAndInuse,
  fetchItemCategoryRawMaterialAndConsumableAndPackingByLikeItemCategoryNameAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchItemCategory'
import { fetchItemPurposeByItemPurposeNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchItemPurpose'
import { fetchVendorByVendorNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchVendor'
import { fetchMakerByMakerNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchMaker'
import CustomTextField from '@/components/mui/TextField'

interface Props {
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const ItemSelectModalSearch = ({ setIsEnableFetching }: Props) => {
  // States
  const [collapse, setCollapse] = useState(false)

  // Hooks : react-hook-form
  const { setValue, getValues, control, handleSubmit } = useFormContext<FormData>()

  const { isLoading } = useFormState<FormData>()

  // Hooks : react-query
  const queryClient = useQueryClient()

  const onResetFormSearch = () => {
    setValue('searchFilters', {
      ...getValues('searchFilters'),
      itemCodeForSupportMes: '',
      FLOW_NAME: '',
      INUSE: null
    })
    setValue('itemCodeForSupportMes', '')
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
              <Grid container spacing={6}>
                <Grid item xs={12}>
                  <Divider textAlign='left'>
                    <Typography variant='body2' color='primary'>
                      Component
                    </Typography>
                  </Divider>
                </Grid>
                <Grid item xs={12} sm={2} lg={2}>
                  <Controller
                    name='itemCategory'
                    control={control}
                    defaultValue={null}
                    render={({ field: { ref, ...fieldProps } }) => (
                      <AsyncSelectCustom
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        loadOptions={inputValue => {
                          return fetchItemCategoryForBomByLikeItemCategoryNameAndInuse(inputValue)
                        }}
                        getOptionLabel={data => data?.ITEM_CATEGORY_NAME || ''}
                        getOptionValue={data => data?.ITEM_CATEGORY_ID?.toString() || ''}
                        classNamePrefix='select'
                        label='Item Category'
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={2} lg={2}>
                  <Controller
                    name='itemPurpose'
                    control={control}
                    defaultValue={null}
                    render={({ field: { ref, ...fieldProps } }) => (
                      <AsyncSelectCustom
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        loadOptions={inputValue => {
                          return fetchItemPurposeByItemPurposeNameAndInuse(inputValue)
                        }}
                        getOptionLabel={data => data?.ITEM_PURPOSE_NAME || ''}
                        getOptionValue={data => data?.ITEM_PURPOSE_ID?.toString() || ''}
                        classNamePrefix='select'
                        label='Item Purpose'
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={2} lg={2}>
                  <Controller
                    name='vendor'
                    control={control}
                    defaultValue={null}
                    render={({ field: { ref, ...fieldProps } }) => (
                      <AsyncSelectCustom
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        loadOptions={inputValue => {
                          return fetchVendorByVendorNameAndInuse(inputValue)
                        }}
                        getOptionLabel={data => data?.VENDOR_ALPHABET || ''}
                        getOptionValue={data => data?.VENDOR_ID?.toString() || ''}
                        classNamePrefix='select'
                        label='Vendor'
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={2} lg={2}>
                  <Controller
                    name='maker'
                    control={control}
                    defaultValue={null}
                    render={({ field: { ref, ...fieldProps } }) => (
                      <AsyncSelectCustom
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        loadOptions={inputValue => {
                          return fetchMakerByMakerNameAndInuse(inputValue)
                        }}
                        getOptionLabel={data => data?.MAKER_NAME || ''}
                        getOptionValue={data => data?.MAKER_ID?.toString() || ''}
                        classNamePrefix='select'
                        label='Maker'
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Divider textAlign='left'>
                    <Typography variant='body2' color='primary'>
                      Product (Sub Assy / Semi FG)
                    </Typography>
                  </Divider>
                </Grid>

                <Grid item xs={12}>
                  <Divider textAlign='left'>
                    <Typography variant='body2' color='primary'>
                      Code & Name
                    </Typography>
                  </Divider>
                </Grid>

                <Grid item xs={12} sm={3} lg={3}>
                  <Controller
                    name='itemInternalCode'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField {...field} fullWidth label='Item Internal Code' autoComplete='off' />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={3} lg={3}>
                  <Controller
                    name='itemInternalFullName'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField {...field} fullWidth label='Item Internal Full Name' autoComplete='off' />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={3} lg={3}>
                  <Controller
                    name='itemInternalShortName'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField {...field} fullWidth label='Item Internal Short Name' autoComplete='off' />
                    )}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={3} lg={3}>
                  <Controller
                    name='itemExternalCode'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField {...field} fullWidth label='Item External Code' autoComplete='off' />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={3} lg={3}>
                  <Controller
                    name='itemExternalFullName'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField {...field} fullWidth label='Item External Full Name' autoComplete='off' />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={3} lg={3}>
                  <Controller
                    name='itemExternalShortName'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField {...field} fullWidth label='Item External Short Name' autoComplete='off' />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider textAlign='left'>
                    <Typography variant='body2' color='primary'>
                      Other
                    </Typography>
                  </Divider>
                </Grid>
                <Grid item xs={12} sm={4} lg={4}>
                  <Controller
                    name='itemCodeForSupportMes'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Item Code For MES'
                        placeholder='Enter Item Code For MES'
                        autoComplete='off'
                        style={{ marginTop: '3px' }}
                      />
                    )}
                  />
                </Grid>
                {/* <Grid item xs={12} sm={4} lg={4}>
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
                </Grid> */}
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

export default ItemSelectModalSearch
