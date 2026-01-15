// React Imports
import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

// Third-party Imports
import classNames from 'classnames'

// Components Imports
import { Controller, useFormContext, useFormState } from 'react-hook-form'

import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'

import { useQueryClient } from '@tanstack/react-query'

import CustomTextField from '@components/mui/TextField'
import AsyncSelectCustom from '@components/react-select/AsyncSelectCustom'
import SelectCustom from '@components/react-select/SelectCustom'
import SkeletonCustom from '@components/SkeletonCustom'

// React-hook-from Imports

// React-query Imports

// libs Imports
import { useCreate } from '@libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import StatusOption from '@libs/react-select/option/StatusOption'

// Utils Imports
import { getUserData } from '@utils/user-profile/userLoginProfile'

// _template Imports
import { useDxContext } from '@/_template/DxContextProvider'

// Workspace Imports
import { fetchItemCategoryRawMaterialAndConsumableAndPackingByLikeItemCategoryNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchItemCategory'
import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useManufacturingItemData'

// My Components Imports
import { fetchGetByLikeItemGroupName } from '@/_workspace/react-select/async-promise-load-options/fetchItemGroup'
import { fetchItemPurposeByItemPurposeNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchItemPurpose'
import { fetchMakerByMakerNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchMaker'
import { fetchVendorByVendorName } from '@/_workspace/react-select/async-promise-load-options/fetchVendor'
import { MENU_ID } from './env'
import type { FormDataPage } from './validationSchema'

function ItemSearch() {
  // Context
  const { setIsEnableFetching } = useDxContext()

  // States
  const [collapse, setCollapse] = useState(false)

  // react-hook-form
  const { setValue, getValues, control, handleSubmit } = useFormContext<FormDataPage>()
  const { isLoading } = useFormState()

  // react-query
  const queryClient = useQueryClient()

  // Function
  const onHandleClearSearchFilters = () => {
    setValue('searchFilters', {
      itemCategory: null,
      itemPurpose: null,
      vendor: null,
      maker: null,
      itemGroup: null,
      itemInternalCode: null,
      itemInternalFullName: '',
      itemInternalShortName: '',
      itemExternalCode: '',
      itemExternalFullName: '',
      itemExternalShortName: '',
      itemCodeForSupportMes: '',
      status: null,
      color: null,
      shape: null
    })
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    handleAdd()
  }

  // #region Function - react-hook-form
  const onSubmit: SubmitHandler<FormDataPage> = () => {
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    handleAdd()
  }

  const onError: SubmitErrorHandler<FormDataPage> = data => {
    // console.log(getValues())
    console.log(data)
  }

  const handleAdd = () => {
    const dataItem = {
      USER_ID: getUserData().USER_ID,
      APPLICATION_ID: import.meta.env.VITE_APPLICATION_ID,
      MENU_ID: MENU_ID.toString(),
      USER_PROFILE_SETTING_PROGRAM_DATA: {
        searchFilters: {
          itemCategory: getValues('searchFilters.itemCategory'),
          itemPurpose: getValues('searchFilters.itemPurpose'),
          vendor: getValues('searchFilters.vendor'),
          maker: getValues('searchFilters.maker'),
          itemGroup: getValues('searchFilters.itemGroup'),
          itemInternalCode: getValues('searchFilters.itemInternalCode'),
          itemInternalFullName: getValues('searchFilters.itemInternalFullName'),
          itemInternalShortName: getValues('searchFilters.itemInternalShortName'),
          itemExternalCode: getValues('searchFilters.itemExternalCode'),
          itemExternalFullName: getValues('searchFilters.itemExternalFullName'),
          itemExternalShortName: getValues('searchFilters.itemExternalShortName'),
          itemCodeForSupportMes: getValues('searchFilters.itemCodeForSupportMes'),
          status: getValues('searchFilters.status'),
          color: getValues('searchFilters.color'),
          shape: getValues('searchFilters.shape')
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
              <Divider textAlign='left' className='mb-3'>
                <Typography variant='body2' color='primary'>
                  Component
                </Typography>
              </Divider>
              <Grid container sx={{ position: 'relative', top: 0 }} spacing={4}>
                <Grid item xs={12} sm={3} lg={2.4}>
                  <Controller
                    name='searchFilters.itemCategory'
                    control={control}
                    defaultValue={null}
                    render={({ field: { ref, ...fieldProps } }) => (
                      <AsyncSelectCustom
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        loadOptions={inputValue => {
                          return fetchItemCategoryRawMaterialAndConsumableAndPackingByLikeItemCategoryNameAndInuse(
                            inputValue
                          )
                        }}
                        getOptionLabel={data => data?.ITEM_CATEGORY_NAME || ''}
                        getOptionValue={data => data?.ITEM_CATEGORY_ID?.toString() || ''}
                        classNamePrefix='select'
                        label='Item Category Name'
                        placeholder='Select ...'
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={3} lg={2.4}>
                  <Controller
                    name='searchFilters.itemPurpose'
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
                        label='Item Purpose Name'
                        placeholder='Select ...'
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4} lg={2.4}>
                  <Controller
                    name='searchFilters.itemGroup'
                    control={control}
                    render={({ field: { ref, ...fieldProps } }) => (
                      <AsyncSelectCustom
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        loadOptions={inputValue => {
                          return fetchGetByLikeItemGroupName(inputValue)
                        }}
                        getOptionLabel={data => data?.ITEM_GROUP_NAME.toString()}
                        getOptionValue={data => data.ITEM_GROUP_ID.toString()}
                        classNamePrefix='select'
                        label='Item Group Name'
                        placeholder='Select ...'
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={3} lg={2.4}>
                  <Controller
                    name='searchFilters.vendor'
                    control={control}
                    defaultValue={null}
                    render={({ field: { ref, ...fieldProps } }) => (
                      <AsyncSelectCustom
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        loadOptions={inputValue => {
                          return fetchVendorByVendorName(inputValue)
                        }}
                        getOptionLabel={data => data?.VENDOR_NAME || ''}
                        getOptionValue={data => data?.VENDOR_ID?.toString() || ''}
                        classNamePrefix='select'
                        label='Vendor Name'
                        placeholder='Select ...'
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={4} lg={2.4}>
                  <Controller
                    name='searchFilters.maker'
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
                        placeholder='Select ...'
                      />
                    )}
                  />
                </Grid>
              </Grid>
              <Divider textAlign='left' className='my-3'>
                <Typography variant='body2' color='primary'>
                  Code & Name
                </Typography>
              </Divider>
              <Grid container sx={{ position: 'relative', top: 0 }} spacing={4}>
                <Grid container item spacing={4}>
                  <Grid item xs={12} sm={4} lg={4}>
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
                  <Grid item xs={12} sm={4} lg={4}>
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
                  </Grid>
                </Grid>
                <Grid item xs={12} sm={4} lg={4}>
                  <Controller
                    name='searchFilters.itemExternalFullName'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Item External Full Name'
                        placeholder='Enter ...'
                        autoComplete='off'
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4} lg={4}>
                  <Controller
                    name='searchFilters.itemExternalShortName'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Item External Short Name'
                        placeholder='Enter ...'
                        autoComplete='off'
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4} lg={4}>
                  <Controller
                    name='searchFilters.itemExternalCode'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Item External Code (P/N)'
                        placeholder='Enter ...'
                        autoComplete='off'
                      />
                    )}
                  />
                </Grid>
              </Grid>
              <Divider textAlign='left' className='my-3'>
                <Typography variant='body2' color='primary'>
                  Other
                </Typography>
              </Divider>
              <Grid container sx={{ position: 'relative', top: 0 }} spacing={4}>
                <Grid item xs={12} sm={6} lg={4}>
                  <Controller
                    name='searchFilters.itemCodeForSupportMes'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Item Code'
                        placeholder='Enter ...'
                        autoComplete='off'
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} lg={2} className='leading-[18px]'>
                  <Controller
                    name='searchFilters.status'
                    control={control}
                    render={({ field: { ref, ...fieldProps } }) => (
                      <SelectCustom
                        {...fieldProps}
                        options={StatusOption}
                        isClearable
                        label='Status'
                        placeholder='Select ...'
                        classNamePrefix='select'
                      />
                    )}
                  />
                </Grid>
              </Grid>
              <Grid container sx={{ position: 'relative', top: 0 }} spacing={4} mt={1}>
                <Grid item xs={12} className='flex gap-3'>
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

export default ItemSearch
