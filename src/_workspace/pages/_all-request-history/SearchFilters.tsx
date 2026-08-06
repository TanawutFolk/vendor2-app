// React Imports
import { useMemo } from 'react'

// MUI Imports
import { Button, Card, CardContent, CardHeader, Grid } from '@mui/material'

// react-hook-from Imports
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, useFormContext, useFormState, useWatch } from 'react-hook-form'

import { useQuery } from '@tanstack/react-query'

// react-select Imports
import AsyncSelectCustom from '@components/react-select/AsyncSelectCustom'

// Types
import SkeletonCustom from '@/components/SkeletonCustom'
import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import AllRequestHistoryServices from '@/_workspace/services/_all-request-history/AllRequestHistoryServices'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

// _template Imports
import { useDxContext } from '@/_template/DxContextProvider'

// My Components Imports
import { MENU_ID, PREFIX_QUERY_KEY } from './env'
import type { FormDataPage } from './validationSchema'

interface SectionOptionI {
  value: string
  label: string
}

interface YearOptionI {
  value: number
  label: string
}

const filterByLabel = <T extends { label: string }>(options: T[], inputValue: string) => {
  const keyword = String(inputValue || '')
    .trim()
    .toLowerCase()

  if (!keyword) return options

  return options.filter(option => option.label.toLowerCase().includes(keyword))
}

function SearchFilters() {
  // Context
  const { setIsEnableFetching } = useDxContext()

  // States

  // Hooks
  // Hooks : react-hook-form
  const { setValue, getValues, control, handleSubmit } = useFormContext<FormDataPage>()

  const { isLoading } = useFormState()

  const selectedSection = useWatch({ control, name: 'searchFilters.section' })
  const selectedYear = useWatch({ control, name: 'searchFilters.year' })

  // Hooks : react-query
  const filterOptionsQuery = useQuery({
    queryKey: [PREFIX_QUERY_KEY, 'FILTER_OPTIONS'],
    queryFn: async () => {
      const response = await AllRequestHistoryServices.getFilterOptions()

      if (!response.data?.Status) throw new Error(response.data?.Message || 'Failed to load history filters')

      return response.data.ResultOnDb || []
    },
    staleTime: 30_000
  })

  const sectionOptions = useMemo<SectionOptionI[]>(() => {
    const values = (filterOptionsQuery.data || [])
      .filter(row => !selectedYear?.value || Number(row.REQUEST_YEAR) === selectedYear.value)
      .map(row => String(row.REQUESTER_SECTION || '').trim())
      .filter(Boolean)

    return Array.from(new Set(values))
      .sort((a, b) => a.localeCompare(b))
      .map(value => ({ value, label: value }))
  }, [filterOptionsQuery.data, selectedYear?.value])

  const yearOptions = useMemo<YearOptionI[]>(() => {
    const values = (filterOptionsQuery.data || [])
      .filter(row => !selectedSection?.value || row.REQUESTER_SECTION === selectedSection.value)
      .map(row => Number(row.REQUEST_YEAR))
      .filter(value => Number.isInteger(value))

    return Array.from(new Set(values))
      .sort((a, b) => b - a)
      .map(value => ({ value, label: String(value) }))
  }, [filterOptionsQuery.data, selectedSection?.value])

  // Function
  const onHandleClearSearchFilters = () => {
    setValue('searchFilters', {
      section: null,
      year: null
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
          section: getValues('searchFilters.section'),
          year: getValues('searchFilters.year')
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
        {filterOptionsQuery.isError ? <div>An error occurred: {filterOptionsQuery.error.message}</div> : null}
        {isLoading || filterOptionsQuery.isLoading ? (
          <>
            <SkeletonCustom />
          </>
        ) : (
          <>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={4} lg={3}>
                <Controller
                  name='searchFilters.section'
                  control={control}
                  render={({ field: { ref, ...fieldProps } }) => (
                    <AsyncSelectCustom
                      {...fieldProps}
                      cacheOptions
                      defaultOptions={sectionOptions}
                      loadOptions={(inputValue: string) => Promise.resolve(filterByLabel(sectionOptions, inputValue))}
                      isClearable
                      label='Section'
                      placeholder='Select ...'
                      classNamePrefix='select'
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4} lg={3}>
                <Controller
                  name='searchFilters.year'
                  control={control}
                  render={({ field: { ref, ...fieldProps } }) => (
                    <AsyncSelectCustom
                      {...fieldProps}
                      cacheOptions
                      defaultOptions={yearOptions}
                      loadOptions={(inputValue: string) => Promise.resolve(filterByLabel(yearOptions, inputValue))}
                      isClearable
                      label='Year'
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
