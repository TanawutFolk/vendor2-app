import { Dispatch, SetStateAction, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { Controller, SubmitErrorHandler, SubmitHandler, useFormContext, useFormState } from 'react-hook-form'

import { Button, Card, CardContent, CardHeader, Collapse, Divider, Grid, IconButton, Typography } from '@mui/material'

import classNames from 'classnames'

// Components Imports
import SelectCustom from '@/components/react-select/SelectCustom'
import CustomTextField from '@core/components/mui/TextField'

import StatusOption from '@/libs/react-select/option/StatusOption'

// types Imports
import type { FormData } from './page'

// React Query Imports
import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useVendor'

import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { MENU_ID } from './env'

import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'

interface Props {
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const VendorSearch = ({ setIsEnableFetching }: Props) => {
  // States
  const [collapse, setCollapse] = useState(false)

  // Hooks : react-hook-form
  const { setValue, getValues, control, handleSubmit } = useFormContext<FormData>()
  const { isLoading } = useFormState()

  // Hooks : react-query
  const queryClient = useQueryClient()

  const onResetFormSearch = () => {
    setValue('searchFilters', {
      VENDOR_NAME: '',
      VENDOR_ALPHABET: '',
      VENDOR_CD_PRONES: '',
      VENDOR_NAME_PRONES: '',
      INUSE: null
    })
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    handleAdd()
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
          VENDOR_NAME: getValues('searchFilters.VENDOR_NAME'),
          VENDOR_ALPHABET: getValues('searchFilters.VENDOR_ALPHABET'),
          VENDOR_CD_PRONES: getValues('searchFilters.VENDOR_CD_PRONES'),
          VENDOR_NAME_PRONES: getValues('searchFilters.VENDOR_NAME_PRONES'),
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
              <Grid container spacing={4}>
                <Grid container item spacing={4}>
                  <Grid item xs={12} sm={4} lg={4}>
                    <Controller
                      name='searchFilters.VENDOR_NAME'
                      control={control}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          fullWidth
                          label='Vendor Name'
                          placeholder='Enter ...'
                          autoComplete='off'
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4} lg={4}>
                    <Controller
                      name='searchFilters.VENDOR_ALPHABET'
                      control={control}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          fullWidth
                          label='Vendor Alphabet'
                          placeholder='Enter ...'
                          autoComplete='off'
                        />
                      )}
                    />
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Divider textAlign='left'>
                    <Typography variant='body2' color='primary'>
                      Prones
                    </Typography>
                  </Divider>
                </Grid>
                <Grid item xs={12} sm={4} lg={4}>
                  <Controller
                    name='searchFilters.VENDOR_CD_PRONES'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Vendor Code Prones'
                        placeholder='Enter ...'
                        autoComplete='off'
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4} lg={4}>
                  <Controller
                    name='searchFilters.VENDOR_NAME_PRONES'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Vendor Name Prones'
                        placeholder='Enter ...'
                        autoComplete='off'
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
                        placeholder='Select ...'
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Grid container className='mbs-0' spacing={4}>
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

export default VendorSearch
