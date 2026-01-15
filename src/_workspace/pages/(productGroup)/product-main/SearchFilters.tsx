// React Imports

// MUI Imports
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'

// Third-party Imports

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
import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useProductMainData'
import { fetchProductCategoryByLikeProductCategoryNameAndInuse } from '@_workspace/react-select/async-promise-load-options/fetchProductCategory'

// My Components Imports
import { MENU_ID } from './env'
import type { FormDataPage } from './validationSchema'

function ProductMainSearch() {
  // Context
  const { setIsEnableFetching } = useDxContext()

  // States

  // react-hook-form
  const { setValue, getValues, control, handleSubmit } = useFormContext<FormDataPage>()
  const { isLoading } = useFormState()

  // react-query
  const queryClient = useQueryClient()

  // Function
  const onHandleClearSearchFilters = () => {
    setValue('searchFilters', {
      productCategory: null,
      productMainName: '',
      productMainCode: '',
      productMainAlphabet: '',
      status: null
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
    console.log(getValues())
    console.log(data)
  }

  const handleAdd = () => {
    const dataItem = {
      USER_ID: getUserData().USER_ID,
      APPLICATION_ID: import.meta.env.VITE_APPLICATION_ID,
      MENU_ID: MENU_ID.toString(),
      USER_PROFILE_SETTING_PROGRAM_DATA: {
        searchFilters: {
          productCategory: getValues('searchFilters.productCategory'),
          productMainName: getValues('searchFilters.productMainName'),
          productMainCode: getValues('searchFilters.productMainCode'),
          productMainAlphabet: getValues('searchFilters.productMainAlphabet'),
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
        // action={
        //   <IconButton size='small' aria-label='collapse' onClick={() => setCollapse(!collapse)}>
        //     <i className={classNames(collapse ? 'tabler-chevron-down' : 'tabler-chevron-up', 'text-xl')} />
        //   </IconButton>
        // }
        titleTypographyProps={{ variant: 'h5' }}
        sx={{ '& .MuiCardHeader-avatar': { mr: 3 } }}
      />
      {/* <Collapse in={!collapse}> */}
      <CardContent>
        {isError && <div>An error occurred: {error.message}</div>}
        {isLoading ? (
          <>
            <SkeletonCustom />
          </>
        ) : (
          <>
            <Grid container spacing={4}>
              <Grid container item xs={12} spacing={2}>
                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.productCategory'
                    control={control}
                    defaultValue={null}
                    render={({ field: { ref, ...fieldProps } }) => (
                      <AsyncSelectCustom
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        loadOptions={inputValue => {
                          return fetchProductCategoryByLikeProductCategoryNameAndInuse(inputValue, '1')
                        }}
                        getOptionLabel={data => data?.PRODUCT_CATEGORY_NAME || ''}
                        getOptionValue={data => data?.PRODUCT_CATEGORY_ID?.toString() || ''}
                        classNamePrefix='select'
                        label='Product Category Name'
                        placeholder='Enter ...'
                      />
                    )}
                  />
                </Grid>
              </Grid>
              <Grid item xs={12} sm={4} lg={3}>
                <Controller
                  name='searchFilters.productMainCode'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Product Main Code'
                      placeholder='Enter ...'
                      autoComplete='off'
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4} lg={3}>
                <Controller
                  name='searchFilters.productMainName'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Product Main Name'
                      placeholder='Enter ...'
                      autoComplete='off'
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4} lg={3}>
                <Controller
                  name='searchFilters.productMainAlphabet'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Product Main Alphabet'
                      placeholder='Enter ...'
                      autoComplete='off'
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4} lg={3}>
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
      {/* </Collapse> */}
    </Card>
  )
}

export default ProductMainSearch
