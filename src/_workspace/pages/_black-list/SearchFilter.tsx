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

// Components Imports
import CustomTextField from '@components/mui/TextField'
import SelectCustom from '@components/react-select/SelectCustom'
import SkeletonCustom from '@components/SkeletonCustom'

// Workspace Components
import SearchFilterCard from '@_workspace/components/search/SearchFilterCard'

// Utils Imports

// Context
import { useDxContext } from '@/_template/DxContextProvider'

// Types & Schema
import type { BlacklistFormData } from './validateSchema'
import { defaultSearchFilters } from './validateSchema'
import { MENU_ID } from './env'

import { PREFIX_QUERY_KEY } from '@_workspace/react-query/hooks/useBlacklist'

const groupOptions = [
  { value: 'ALL', label: 'All' },
  { value: 'US', label: 'US' },
  { value: 'CN', label: 'CN' }
]

const SearchFilter = () => {
  // State
  const [collapse, setCollapse] = useState(false)

  // Context
  const { setIsEnableFetching } = useDxContext()

  // React Hook Form
  const { control, setValue, getValues, handleSubmit } = useFormContext<BlacklistFormData>()
  const { isLoading } = useFormState()

  // React Query
  const queryClient = useQueryClient()

  const onHandleClearSearchFilters = () => {
    setValue('searchFilters', defaultSearchFilters)

    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    save()
  }

  const onSubmit: SubmitHandler<BlacklistFormData> = () => {
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    save()
  }

  const onError: SubmitErrorHandler<BlacklistFormData> = data => {
    console.log(getValues())
    console.log(data)
  }

  const { save, isError, error } = useDxSaveSearchFilters<BlacklistFormData>({ MENU_ID })

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
              <Grid item xs={12} sm={6} md={4}>
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

              <Grid item xs={12} sm={6} md={4}>
                <Controller
                  name='searchFilters.group_code'
                  control={control}
                  render={({ field: { ref, ...fieldProps } }) => (
                    <SelectCustom
                      {...fieldProps}
                      label='Group'
                      placeholder='Select ...'
                      isClearable={false}
                      options={groupOptions}
                      value={groupOptions.find(option => option.value === fieldProps.value) || groupOptions[0]}
                      onChange={value =>
                        fieldProps.onChange(((value as { value: 'ALL' | 'US' | 'CN' } | null)?.value || 'ALL'))
                      }
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
    </SearchFilterCard>
  )
}

export default SearchFilter
