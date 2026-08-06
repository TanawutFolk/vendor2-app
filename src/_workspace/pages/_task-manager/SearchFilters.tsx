// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import { Button, Card, CardContent, CardHeader, Divider, Grid, Typography } from '@mui/material'

// react-hook-from Imports
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, useFormContext, useFormState } from 'react-hook-form'

// react-select Imports
import SelectCustom from '@components/react-select/SelectCustom'

// Types
import SkeletonCustom from '@/components/SkeletonCustom'
import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import useRequestStatusOptions from '@/_workspace/react-query/hooks/useRequestStatusOptions'
import AssigneesServices from '@/_workspace/services/_task-manager/AssigneesServices'
import type { AssigneeRowI } from '@/_workspace/services/_task-manager/AssigneesServices'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

// _template Imports
import { useDxContext } from '@/_template/DxContextProvider'

// My Components Imports
import { MENU_ID } from './env'
import type { FormDataPage } from './validationSchema'

interface SelectOptionI {
  M_REQUEST_STATUS_ID?: number
  value: string
  label: string
}

function SearchFilters() {
  // Context
  const { setIsEnableFetching } = useDxContext()

  // States
  const [picOptions, setPicOptions] = useState<SelectOptionI[]>([])

  // Hooks
  // Hooks : react-hook-form
  const { setValue, getValues, control, handleSubmit } = useFormContext<FormDataPage>()

  const { isLoading } = useFormState()

  // Hooks : react-query
  const { data: statusOptions = [] } = useRequestStatusOptions()

  useEffect(() => {
    const loadPicOptions = async () => {
      const assigneeRows: AssigneeRowI[] = await AssigneesServices.searchAll({ IN_USE: '1' })

      setPicOptions(
        Array.from(
          new Map(
            assigneeRows
              .filter(row => Number(row?.INUSE) === 1 && String(row?.empcode || '').trim())
              .map(row => {
                const empcode = String(row.empcode || '').trim()
                const empName = String(row.empName || '').trim()

                return [
                  empcode,
                  {
                    value: empcode,
                    label: empName ? `${empcode} - ${empName}` : empcode
                  }
                ]
              })
          ).values()
        )
      )
    }

    loadPicOptions().catch(console.error)
  }, [])

  // Function
  const onHandleClearSearchFilters = () => {
    setValue('searchFilters', {
      status: null,
      pic: null
    })
    setIsEnableFetching(true)
    handleAdd()
  }

  // Function - react-hook-form
  const onSubmit: SubmitHandler<FormDataPage> = () => {
    setIsEnableFetching(true)
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
        searchFilters: {
          status: getValues('searchFilters.status'),
          pic: getValues('searchFilters.pic')
        },
        searchResults: {
          agGridState: getValues('searchResults.agGridState')
        }
      } as FormDataPage
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
        titleTypographyProps={{ variant: 'h5' }}
        sx={{ '& .MuiCardHeader-avatar': { mr: 3 } }}
      />
      <CardContent>
        {isError ? <div>An error occurred: {error.message}</div> : null}
        {isLoading ? (
          <>
            <SkeletonCustom />
          </>
        ) : (
          <>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Divider textAlign='left'>
                  <Typography variant='body2' color='primary'>
                    Queue Details
                  </Typography>
                </Divider>
              </Grid>
              <Grid item xs={12} sm={4} lg={3}>
                <Controller
                  name='searchFilters.status'
                  control={control}
                  render={({ field: { ...fieldProps } }) => (
                    <SelectCustom
                      {...fieldProps}
                      options={statusOptions}
                      isClearable
                      label='Status'
                      placeholder='Select ...'
                      classNamePrefix='select'
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4} lg={3}>
                <Controller
                  name='searchFilters.pic'
                  control={control}
                  render={({ field: { ...fieldProps } }) => (
                    <SelectCustom
                      {...fieldProps}
                      options={picOptions}
                      isClearable
                      label='PIC'
                      placeholder='Select ...'
                      classNamePrefix='select'
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} className='flex gap-4'>
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
    </Card>
  )
}

export default SearchFilters
