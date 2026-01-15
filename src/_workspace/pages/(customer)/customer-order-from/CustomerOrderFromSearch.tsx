// React Imports
import { Dispatch, SetStateAction, useState } from 'react'

// MUI Imports
import SearchIcon from '@mui/icons-material/Search'
import { Button, Card, CardContent, CardHeader, Collapse, Grid, IconButton } from '@mui/material'

// Third-party Imports
import classNames from 'classnames'

// Components Imports

// react-hook-from Imports
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, useFormContext, useFormState } from 'react-hook-form'

import { useQueryClient } from '@tanstack/react-query'

// import AsyncCreatableSelect from 'react-select/async-creatable'

import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useCustomerOrderFromData'

// import { fetchProductCategoryByLikeProductCategoryNameAndInuse } from '@/libs/react-select/AsyncPromiseLoadOptions/fetchProductCategory'

// react-select Imports
import CustomTextField from '@components/mui/TextField'

// react-query Imports

// Types
import SelectCustom from '@/components/react-select/SelectCustom'
import SkeletonCustom from '@/components/SkeletonCustom'
import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import StatusOption from '@/libs/react-select/option/StatusOption'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { MENU_ID } from './env'
import type { FormData } from './page'

interface Props {
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}
function CustomerOrderFromSearch({ setIsEnableFetching }: Props) {
  // States
  const [collapse, setCollapse] = useState(false)

  // Hooks
  // Hooks : react-hook-form
  const { setValue, getValues, control, handleSubmit } = useFormContext<FormData>()

  const { isLoading } = useFormState()

  // Hooks : react-query
  const queryClient = useQueryClient()

  // Function
  const onResetFormSearch = () => {
    setValue('searchFilters', {
      // customerOrderFromId: '',
      customerOrderFromName: '',
      customerOrderFromAlphabet: '',
      status: null
    })
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    handleAdd()
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
          // customerOrderFromId: getValues('searchFilters.customerOrderFromId'),
          customerOrderFromName: getValues('searchFilters.customerOrderFromName'),
          customerOrderFromAlphabet: getValues('searchFilters.customerOrderFromAlphabet'),
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
        // avatar={<i className='tabler-search text-xl' />}
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
              <Grid container spacing={4}>
                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.customerOrderFromName'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Customer Order From Name'
                        placeholder='Enter ...'
                        autoComplete='off'
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.customerOrderFromAlphabet'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Customer Order From Alphabet'
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
                    render={({ field: { ...fieldProps } }) => (
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

export default CustomerOrderFromSearch
