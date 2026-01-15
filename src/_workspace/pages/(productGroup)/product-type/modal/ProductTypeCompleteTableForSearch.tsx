// React Imports
import { Dispatch, SetStateAction, useState } from 'react'
// MUI Imports
import { Button, Card, CardContent, CardHeader, Collapse, Grid, IconButton, Select, Skeleton } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
// Third-party Imports
import classNames from 'classnames'
// react-hook-from Imports
import { Controller, useFormContext, useFormState } from 'react-hook-form'
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
// react-select Imports
import CustomTextField from '@components/mui/TextField'
// react-query Imports
import type { FormData } from '../page'
import SkeletonCustom from '@/components/SkeletonCustom'
import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { MENU_ID } from '../env'
import StatusOption from '@/libs/react-select/option/StatusOption'
import SelectCustom from '@/components/react-select/SelectCustom'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import { fetchBoiProjectByLikeBoiProjectAndInuse } from '@/_workspace/react-select/async-promise-load-options/boi/fetchBoiProject'
import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useProductTypeData'
import { fetchProductTypeStatusWorkingByLikeProductTypeStatusWorkingNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchProductType'

interface Props {
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}
function ProductTypeCompleteTableForSearch({ setIsEnableFetching }: Props) {
  // States
  const [collapse, setCollapse] = useState(true)

  // Hooks : react-hook-form
  const { setValue, getValues, control, handleSubmit } = useFormContext<FormData>()

  const { isLoading } = useFormState()

  // Hooks : react-query
  const queryClient = useQueryClient()

  // Function
  const onResetFormSearch = () => {
    setValue('searchFilters', {
      // customerOrderFromId: '',
      productTypeName: '',
      productTypeCode: '',
      // suffixForPartNumber: '',
      // pcName: '',
      // fftPartNumber: '',
      productItemName: '',
      productItemCode: '',
      productTypeStatusWorking: null
      // selectedProductLevelForGen: null,
      // status: null
    })
  }

  // Function - react-hook-form
  const onSubmit: SubmitHandler<FormData> = () => {
    // setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: ['PRODUCT_TYPE_FOR_COPY_PRODUCT_TYPE'] })
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
          productTypeName: getValues('searchFilters.productTypeName') || '',
          productTypeCode: getValues('searchFilters.productTypeCode') || '',
          suffixForPartNumber: getValues('searchFilters.suffixForPartNumber') || '',
          productForRepair: getValues('searchFilters.productForRepair') || '',
          pcName: getValues('searchFilters.pcName') || '',
          fftPartNumber: getValues('searchFilters.fftPartNumber') || '',
          productItemName: getValues('searchFilters.productItemName') || '',
          productItemCode: getValues('searchFilters.productItemCode') || '',
          productTypeStatusWorking:
            getValues('searchFilters.productTypeStatusWorking')?.PRODUCT_TYPE_STATUS_WORKING_ID || ''
          // status: getValues('searchFilters.status')
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
      } as FormData
    }
    console.log('ForCopy', dataItem)
    console.log('productItemName', getValues('searchFilters.productItemName'))
    console.log('productItemCode', getValues('searchFilters.productItemCode'))

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
        title='Search filters Product Type For Copy'
        action={
          // <IconButton size='small' aria-label='collapse' onClick={() => setCollapse(!collapse)} disabled>
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
              <Grid container className='mbs-0' spacing={2}>
                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.productTypeStatusWorking'
                    control={control}
                    render={({ field: { onChange, ...fieldProps } }) => (
                      <AsyncSelectCustom
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        loadOptions={inputValue => {
                          return fetchProductTypeStatusWorkingByLikeProductTypeStatusWorkingNameAndInuse(
                            inputValue,
                            '1'
                          )
                        }}
                        onChange={value => {
                          onChange(value)
                          // setValue('searchFilters.process', null)
                        }}
                        getOptionLabel={data => data?.PRODUCT_TYPE_STATUS_WORKING_NAME || ''}
                        getOptionValue={data => data?.PRODUCT_TYPE_STATUS_WORKING_ID?.toString() || ''}
                        classNamePrefix='select'
                        label='Product Type Status Working'
                        placeholder='Enter Product Type Status Working'
                        // autoComplete='off'
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.productTypeName'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Product Type Name'
                        placeholder='Enter Product Type Name'
                        autoComplete='off'
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.productTypeCode'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Product Type Code'
                        placeholder='Enter Product Type Code'
                        autoComplete='off'
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.productItemName'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Product Item Name'
                        placeholder='Enter Product Item Name'
                        autoComplete='off'
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.productItemCode'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Product Item Code (16 digits)'
                        placeholder='Enter Product Item Code'
                        autoComplete='off'
                      />
                    )}
                  />
                </Grid>

                {/* <Grid item xs={12} sm={4} lg={3}>
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
                    )}
                  />
                </Grid> */}

                <Grid item xs={12} className='flex gap-4 justify-end'>
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

export default ProductTypeCompleteTableForSearch
