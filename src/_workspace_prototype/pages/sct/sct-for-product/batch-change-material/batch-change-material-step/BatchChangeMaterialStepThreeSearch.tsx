import { Dispatch, SetStateAction, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { Controller, SubmitErrorHandler, SubmitHandler, useFormContext, useFormState } from 'react-hook-form'

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Collapse,
  Divider,
  Grid,
  IconButton,
  LinearProgress
} from '@mui/material'

import classNames from 'classnames'

// Components Imports
import CustomTextField from '@/components/mui/TextField'
import SelectCustom from '@/components/react-select/SelectCustom'

import StatusOption from '@/libs/react-select/option/StatusOption'

import { getUserData } from '@/utils/user-profile/userLoginProfile'

import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'

import SearchIcon from '@mui/icons-material/Search'

import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

interface Props {
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

export interface FiscalYearType {
  value: number
  label: number
}

// Year -3 to +1 from now
const FiscalYearOption: FiscalYearType[] = Array.from({ length: 3 }, (_, i) => {
  const year = new Date().getFullYear() - 1 + i
  return { value: year, label: year }
})

const BatchChangeMaterialStepThreeSearch = ({ setIsEnableFetching }: Props) => {
  // States
  const [collapse, setCollapse] = useState(false)

  // Hooks : react-hook-form
  const { setValue, getValues, control, handleSubmit, watch } = useFormContext<FormData>()
  const { isLoading } = useFormState()

  // Hooks : react-query
  const queryClient = useQueryClient()

  const onResetFormSearch = () => {
    setValue('searchFilters.DEPARTMENT', null)
    setValue('searchFilters.DIVISION', null)
    setValue('searchFilters.SECTION_NAME', '')
    setValue('searchFilters.SECTION_ALPHABET', '')
    setValue('searchFilters.INUSE', null)
  }

  // Function : react-hook-form
  const onSubmit: SubmitHandler<FormData> = () => {
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
  }

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log(data)
  }

  return (
    <>
      <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
        <Divider textAlign='left'>
          <Chip label='Header' sx={{ color: 'var(--primary-color)' }} variant='outlined' size='small' />
        </Divider>
        <Grid container spacing={6}>
          <Grid item xs={12} sm={4} lg={3}>
            <Controller
              name='searchFilters.FISCAL_YEAR'
              control={control}
              render={({ field: { ...fieldProps } }) => (
                <SelectCustom
                  {...fieldProps}
                  options={FiscalYearOption}
                  isClearable
                  label='Fiscal Year'
                  classNamePrefix='select'
                  placeholder='Select Fiscal Year'
                  value={watch('searchFilters.FISCAL_YEAR')}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={4} lg={3}>
            <Controller
              name='searchFilters.SCT_PATTERN'
              control={control}
              render={({ field: { onChange, ...fieldProps } }) => (
                <SelectCustom
                  label='SCT Pattern No'
                  {...fieldProps}
                  onChange={value => {
                    onChange(value)
                    //setValue('machineName', null)
                  }}
                  //key={watch('department')?.DEPARTMENT_ID}
                  isClearable
                  options={[
                    {
                      value: 1,
                      label: 'P2'
                    },
                    {
                      value: 2,
                      label: 'P3'
                    }
                  ]}
                  classNamePrefix='select'
                  placeholder='Select SCT Pattern No ...'
                />
              )}
            />
          </Grid>
        </Grid>

        <Divider className='mt-3 mb-1' textAlign='left'>
          <Chip label='Estimate Period' sx={{ color: 'var(--primary-color)' }} variant='outlined' size='small' />
        </Divider>

        <Grid container spacing={6}>
          <Grid item xs={12} sm={4} lg={3}>
            <Controller
              control={control}
              name='searchFilters.START_DATE'
              render={({ field: { value, ...fieldProps } }) => (
                <>
                  <AppReactDatepicker
                    {...fieldProps}
                    isClearable
                    showYearDropdown
                    showMonthDropdown
                    todayButton='Today'
                    selected={value}
                    id='end-date'
                    dateFormat='dd-MMMM-yyyy'
                    placeholderText='Enter Start Date'
                    customInput={
                      <CustomTextField
                        label='Start Date'
                        fullWidth
                        inputProps={{
                          className: 'text-center'
                        }}
                        // {...(errors?.searchFilters?.endWorkDate && {
                        //   error: true,
                        //   helperText: errors?.searchFilters?.endWorkDate?.message
                        // })}
                      />
                    }
                    popperPlacement='top-start'
                    popperProps={{ strategy: 'fixed' }}
                    popperClassName='z-[2000000]'
                  />
                </>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={4} lg={3}>
            <Controller
              control={control}
              name='searchFilters.END_DATE'
              render={({ field: { value, ...fieldProps } }) => (
                <>
                  <AppReactDatepicker
                    {...fieldProps}
                    isClearable
                    showYearDropdown
                    showMonthDropdown
                    todayButton='Today'
                    selected={value}
                    id='end-date'
                    dateFormat='dd-MMMM-yyyy'
                    placeholderText='Enter End Date'
                    customInput={
                      <CustomTextField
                        label='End Date'
                        fullWidth
                        inputProps={{
                          className: 'text-center'
                        }}
                        // {...(errors?.searchFilters?.endWorkDate && {
                        //   error: true,
                        //   helperText: errors?.searchFilters?.endWorkDate?.message
                        // })}
                      />
                    }
                    popperPlacement='top-start'
                    popperProps={{ strategy: 'fixed' }}
                    popperClassName='z-[2000000]'
                  />
                </>
              )}
            />
          </Grid>
        </Grid>
      </div>
    </>
  )
}

export default BatchChangeMaterialStepThreeSearch
