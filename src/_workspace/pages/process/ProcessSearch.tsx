import { Dispatch, SetStateAction, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { Controller, SubmitErrorHandler, SubmitHandler, useFormContext, useFormState } from 'react-hook-form'

import { Button, Card, CardContent, CardHeader, Collapse, Grid, IconButton } from '@mui/material'

import classNames from 'classnames'

// Components Imports
import CustomTextField from '@core/components/mui/TextField'
import SelectCustom from '@/components/react-select/SelectCustom'

import StatusOption from '@/libs/react-select/option/StatusOption'

// types Imports
import type { FormData } from './page'

// React Query Imports
import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useProcessData'

import { MENU_ID } from './env'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'

import SearchIcon from '@mui/icons-material/Search'
import {
  fetchProductMainByLikeProductMainNameAndInuse,
  ProductMainOption
} from '@/_workspace/react-select/async-promise-load-options/fetchProductMain'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'

interface Props {
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const ProcessSearch = ({ setIsEnableFetching }: Props) => {
  // States
  const [collapse, setCollapse] = useState(false)

  // Hooks : react-hook-form
  const { setValue, getValues, control, handleSubmit } = useFormContext<FormData>()
  const { isLoading } = useFormState()

  // Hooks : react-query
  const queryClient = useQueryClient()

  const onResetFormSearch = () => {
    setValue('searchFilters', {
      PRODUCT_MAIN: null,
      PROCESS_CODE: '',
      PROCESS_NAME: '',
      INUSE: null
    })
  }

  // Function : react-hook-form
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
          PRODUCT_MAIN: getValues('searchFilters.PRODUCT_MAIN'),
          PROCESS_CODE: getValues('searchFilters.PROCESS_CODE'),
          PROCESS_NAME: getValues('searchFilters.PROCESS_NAME'),
          INUSE: getValues('searchFilters.INUSE')
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
              <Grid container spacing={6}>
                <Grid item xs={12} sm={4} lg={4} sx={{ marginBottom: '1rem' }}>
                  <Controller
                    name='searchFilters.PRODUCT_MAIN'
                    control={control}
                    render={({ field: { onChange, ...fieldProps } }) => (
                      <AsyncSelectCustom<ProductMainOption>
                        label='Product Main'
                        inputId='PRODUCT_MAIN'
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        value={getValues('searchFilters.PRODUCT_MAIN')}
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
              </Grid>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={4} lg={4}>
                  <Controller
                    name='searchFilters.PROCESS_CODE'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Process Code'
                        placeholder='Enter Process Code'
                        autoComplete='off'
                        style={{ marginTop: '3px' }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4} lg={4}>
                  <Controller
                    name='searchFilters.PROCESS_NAME'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Process Name'
                        placeholder='Enter Process Name'
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

export default ProcessSearch
