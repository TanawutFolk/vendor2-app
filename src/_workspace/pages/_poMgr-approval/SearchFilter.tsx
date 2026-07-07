// React Imports
import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

// React Hook Form Imports
import { Controller, useFormContext, useFormState } from 'react-hook-form'
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'

// React Query Imports
import { useQueryClient } from '@tanstack/react-query'

import { useDxSaveSearchFilters } from '@/_template/DxSaveSearchFilters'
import useRequestStatusOptions from '@_workspace/react-query/hooks/useRequestStatusOptions'

// Components Imports
import CustomTextField from '@components/mui/TextField'
import AsyncSelectCustom from '@components/react-select/AsyncSelectCustom'
import SkeletonCustom from '@components/SkeletonCustom'

// Workspace Components
import SearchFilterCard from '@_workspace/components/search/SearchFilterCard'

// Utils Imports

// Context
import { useDxContext } from '@/_template/DxContextProvider'

// Types & Schema
import type { RequestRegisterFormData } from './validataeSchema'
import { defaultSearchFilters } from './validataeSchema'
import { MENU_ID } from './env'

const SearchFilter = () => {
  // State
  const [collapse, setCollapse] = useState(false)

  // Context
  const { setIsEnableFetching } = useDxContext()

  // React Hook Form
  const { setValue, getValues, control, handleSubmit } = useFormContext<RequestRegisterFormData>()
  const { isLoading } = useFormState()

  // Status options from DB
  const { data: statusOptions = [] } = useRequestStatusOptions()

  const onHandleClearSearchFilters = () => {
    setValue('searchFilters', defaultSearchFilters)

    setIsEnableFetching(true)
    save()
  }

  const onSubmit: SubmitHandler<RequestRegisterFormData> = () => {
    setIsEnableFetching(true)
    save()
  }

  const onError: SubmitErrorHandler<RequestRegisterFormData> = data => {
    console.log(getValues())
    console.log(data)
  }

  const { save, isError, error } = useDxSaveSearchFilters<RequestRegisterFormData>({ MENU_ID })

  return (
    <SearchFilterCard collapse={collapse} onToggle={() => setCollapse(!collapse)}>
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

              {/* Status */}
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
    </SearchFilterCard>
  )
}

export default SearchFilter
