// React Imports
import type { Dispatch, SetStateAction } from 'react'

// MUI Imports
import { Button, Card, CardContent, CardHeader, Grid } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, useFormContext } from 'react-hook-form'

import CustomTextField from '@/components/mui/TextField'
import SelectCustom from '@/components/react-select/SelectCustom'

// Component Imports
import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useManufacturingItemGroupData'
import StatusOption from '@/libs/material-react-table/components/StatusOption'

import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { MENU_ID } from './env'

interface Props {
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const ManufacturingItemGroupSearch = ({ setIsEnableFetching }: Props) => {
  const { setValue, getValues, control, handleSubmit } = useFormContext<FormData>()

  // Hooks : react-query
  const queryClient = useQueryClient()

  const onSubmit: SubmitHandler<FormData> = () => {
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    handleAdd()
  }

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log(data)
  }

  // Function
  const onResetFormSearch = () => {
    setValue('searchFilters.ITEM_GROUP_NAME', '')
    setValue('searchFilters.INUSE', null)
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    handleAdd()
  }

  // react-query
  const handleAdd = () => {
    const dataItem = {
      USER_ID: getUserData().USER_ID,
      APPLICATION_ID: import.meta.env.VITE_APPLICATION_ID,
      MENU_ID: MENU_ID.toString(),
      USER_PROFILE_SETTING_PROGRAM_DATA: {
        searchFilters: {
          ITEM_GROUP_NAME: getValues('searchFilters.ITEM_GROUP_NAME'),
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
    <>
      <Card style={{ overflow: 'visible', zIndex: 4 }}>
        <CardHeader title='Search filters' />
        <CardContent>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={4} lg={3}>
              <Controller
                control={control}
                name='searchFilters.ITEM_GROUP_NAME'
                render={({ field: { ref, ...fieldProps } }) => (
                  <CustomTextField
                    label='Manufacturing Item Group Name'
                    {...fieldProps}
                    //innerRef={ref}
                    fullWidth
                    placeholder='Enter ...'
                    autoComplete='off'
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4} lg={3}>
              <Controller
                name='searchFilters.INUSE'
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
        </CardContent>
      </Card>
    </>
  )
}

export default ManufacturingItemGroupSearch
