// React Imports

// MUI Imports
import { Button, Card, CardContent, CardHeader, Grid } from '@mui/material'

// react-hook-from Imports
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, useFormContext, useFormState } from 'react-hook-form'

// react-select Imports
import CustomTextField from '@components/mui/TextField'

// Types
import AsyncSelectCustom from '@components/react-select/AsyncSelectCustom'
import SelectCustom from '@/components/react-select/SelectCustom'
import SkeletonCustom from '@/components/SkeletonCustom'
import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import AssigneesServices from '@/_workspace/services/_task-manager/AssigneesServices'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

// _template Imports
import { useDxContext } from '@/_template/DxContextProvider'

// My Components Imports
import { MENU_ID } from './env'
import type { FormDataPage } from './validationSchema'
import type {
  GroupOption,
  GroupOptionSource,
  SelectOption
} from '@/_workspace/types/_Employee-manager/EmployeeManagerTypes'

const InUseOption = [
  { label: 'Active', value: '1' },
  { label: 'Inactive', value: '0' }
]

const mapGroupOption = (item: GroupOptionSource): GroupOption => {
  const groupCode = String(item.value || item.GROUP_CODE || item.label || '')
    .trim()
    .toUpperCase()

  return {
    label: groupCode,
    value: groupCode
  }
}

function SearchFilters() {
  // Context
  const { setIsEnableFetching } = useDxContext()

  // States

  // Hooks
  // Hooks : react-hook-form
  const { setValue, getValues, control, handleSubmit } = useFormContext<FormDataPage>()

  const { isLoading } = useFormState()

  // Function
  const onHandleClearSearchFilters = () => {
    setValue('searchFilters', {
      keyword: '',
      groupCode: null,
      inUse: ''
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

  const loadGroupOptions = async (inputValue: string) => {
    const res = await AssigneesServices.getGroups({ KEYWORD: inputValue || '' })

    return (res.data?.ResultOnDb || []).map(mapGroupOption)
  }

  // react-query
  const handleAdd = () => {
    const dataItem = {
      USER_ID: getUserData().USER_ID,
      APPLICATION_ID: import.meta.env.VITE_APPLICATION_ID,
      MENU_ID: MENU_ID.toString(),
      USER_PROFILE_SETTING_PROGRAM_DATA: {
        searchFilters: {
          keyword: getValues('searchFilters.keyword'),
          groupCode: getValues('searchFilters.groupCode'),
          inUse: getValues('searchFilters.inUse')
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
              <Grid item xs={12} sm={4} lg={3}>
                <Controller
                  name='searchFilters.keyword'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Search Keyword (Name, EmpCode, Email)'
                      placeholder='Enter ...'
                      autoComplete='off'
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4} lg={3}>
                <Controller
                  name='searchFilters.groupCode'
                  control={control}
                  render={({ field: { ref, ...fieldProps } }) => (
                    <AsyncSelectCustom
                      {...fieldProps}
                      cacheOptions
                      defaultOptions
                      loadOptions={loadGroupOptions}
                      isClearable
                      label='Group Code'
                      placeholder='Select ...'
                      classNamePrefix='select'
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4} lg={3}>
                <Controller
                  name='searchFilters.inUse'
                  control={control}
                  render={({ field }) => (
                    <SelectCustom
                      label='Status'
                      placeholder='Select ...'
                      isClearable
                      options={InUseOption}
                      value={field.value ? InUseOption.find(option => option.value === field.value) : null}
                      onChange={(value: SelectOption | null) => field.onChange(value?.value || '')}
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
