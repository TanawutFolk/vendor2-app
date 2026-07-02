// MUI Imports
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'

// React Hook Form Imports
import { Controller, useFormContext, useFormState } from 'react-hook-form'
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'

// Components Imports
import CustomTextField from '@components/mui/TextField'
import AsyncSelectCustom from '@components/react-select/AsyncSelectCustom'
import SkeletonCustom from '@components/SkeletonCustom'

// React Query Imports
import { useQueryClient } from '@tanstack/react-query'

import { useDxSaveSearchFilters } from '@/_template/DxSaveSearchFilters'
import useRequestStatusOptions from '@_workspace/react-query/hooks/useRequestStatusOptions'

// Utils Imports

// Context
import { useDxContext } from '@/_template/DxContextProvider'

// Types & Schema
import type { RequestRegisterFormData } from './validateSchema'
import { defaultSearchFilters } from './validateSchema'
import { MENU_ID } from './env'

// TODO: เปลี่ยน path นี้ให้ตรงกับ hook/query key ของหน้านี้
import { PREFIX_QUERY_KEY } from '@_workspace/react-query/hooks/useRegisterRequest'

const SearchFilter = () => {
  // Context
  const { setIsEnableFetching } = useDxContext()

  // React Hook Form
  const { setValue, getValues, control, handleSubmit } = useFormContext<RequestRegisterFormData>()
  const { isLoading } = useFormState()

  // React Query
  const queryClient = useQueryClient()

  // Status options from DB
  const { data: statusOptions = [] } = useRequestStatusOptions()

  const onHandleClearSearchFilters = () => {
    setValue('searchFilters', defaultSearchFilters)

    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    save()
  }

  // Function : react-hook-form
  const onSubmit: SubmitHandler<RequestRegisterFormData> = () => {
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    save()
  }

  const onError: SubmitErrorHandler<RequestRegisterFormData> = data => {
    console.log(getValues())
    console.log(data)
  }

  const { save, isError, error } = useDxSaveSearchFilters<RequestRegisterFormData>({ MENU_ID })

  return (
    <Card style={{ overflow: 'visible', zIndex: 4 }}>
      <CardHeader
        title='Search filters'
        titleTypographyProps={{ variant: 'h5' }}
        sx={{ '& .MuiCardHeader-avatar': { mr: 3 } }}
      />

      <CardContent>
        {isError && <div>An error occurred: {error.message}</div>}
        {isLoading ? (
          <>
            <SkeletonCustom />
          </>
        ) : (
          <>
            <Grid container spacing={4}>
              {/* Vendor Name */}
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name='searchFilters.vendor_name'
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

              {/* Submitted By */}
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name='searchFilters.submitted_by'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Submitted By'
                      placeholder='Enter ...'
                      autoComplete='off'
                    />
                  )}
                />
              </Grid>

              {/* Overall Status */}
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name='searchFilters.overall_status'
                  control={control}
                  render={({ field: { ref, ...fieldProps } }) => (
                    <AsyncSelectCustom
                      {...fieldProps}
                      cacheOptions
                      defaultOptions={statusOptions}
                      loadOptions={(inputValue) => {
                        const keyword = String(inputValue || '').trim().toLowerCase()
                        if (!keyword) return Promise.resolve(statusOptions)
                        return Promise.resolve(statusOptions.filter((option: any) => String(option?.label || '').toLowerCase().includes(keyword)))
                      }}
                      isClearable
                      label='Status'
                      placeholder='Select ...'
                      classNamePrefix='select'
                    />
                  )}
                />
              </Grid>

              {/* Buttons */}
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
    </Card>
  )
}

export default SearchFilter
