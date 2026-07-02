import React, { useState } from 'react'

import { Button, Divider, Grid, Typography } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

import { Controller, useFormContext } from 'react-hook-form'

import SelectCustom from '@/components/react-select/SelectCustom'
import CustomTextField from '@/components/mui/TextField'

// types Imports
import type { FormData } from '../index'
import { FiscalYearType } from '@/app/[lang]/(_workspace)/cost-condition/exchange-rate/ExchangeRateSearch'
import SctDataModal from './sctDataModal/SctDataModal'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import {
  fetchSctReasonByLikeSctReasonNameAndInuse,
  SctReasonSettingOption
} from '@/_workspace/react-select/async-promise-load-options/fetchSctReasonSetting'
import {
  fetchSctTagByLikeSctTagNameAndInuse,
  SctTagSettingOption
} from '@/_workspace/react-select/async-promise-load-options/fetchSctTag'

const FiscalYearOption: FiscalYearType[] = Array.from({ length: 2 }, (_, i) => {
  const year = new Date().getFullYear() + i
  return { value: year, label: year }
})

const sctPatternNoOption = [
  { value: 1, label: 'P2' },
  { value: 2, label: 'P3' }
]

const Header = () => {
  const [isOpenSctModal, setIsOpenSctDataModal] = useState(false)

  // Hooks : react-hook-form
  const { setValue, getValues, control, handleSubmit, watch } = useFormContext<FormData>()

  return (
    <>
      <Divider color='primary'>
        <Typography color='primary'>Header</Typography>
      </Divider>
      <Grid container spacing={6}>
        <Grid item xs={12} sm={4} lg={4}>
          <Controller
            name='FISCAL_YEAR'
            control={control}
            render={({ field: { ...fieldProps } }) => (
              <SelectCustom
                {...fieldProps}
                isDisabled={getValues('mode') === 'view' || getValues('mode') === 'edit'}
                options={FiscalYearOption}
                isClearable
                label='Fiscal Year'
                classNamePrefix='select'
                placeholder='Select Fiscal Year'
                value={watch('FISCAL_YEAR')}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={4} lg={4}>
          <Controller
            name='SCT_PATTERN_NO'
            control={control}
            render={({ field: { ...fieldProps } }) => (
              <SelectCustom
                {...fieldProps}
                isDisabled={getValues('mode') === 'view' || getValues('mode') === 'edit'}
                options={sctPatternNoOption}
                isClearable
                label='SCT Pattern No'
                classNamePrefix='select'
                placeholder='Select SCT Pattern No'
                value={watch('SCT_PATTERN_NO')}
              />
            )}
          />
        </Grid>
      </Grid>
      <Grid container spacing={6}>
        <Grid item xs={12} sm={4} lg={4}>
          <Controller
            name='SCT_REASON_SETTING'
            control={control}
            render={({ field: { onChange, ...fieldProps } }) => (
              <AsyncSelectCustom<SctReasonSettingOption>
                label='SCT Reason'
                inputId='SCT_REASON_SETTING'
                {...fieldProps}
                isDisabled={getValues('mode') === 'view'}
                isClearable
                cacheOptions
                defaultOptions
                value={getValues('SCT_REASON_SETTING')}
                onChange={value => {
                  onChange(value)

                  if (value && value.SCT_REASON_SETTING_ID === 1) {
                    setValue('SCT_TAG_SETTING', {
                      SCT_TAG_SETTING_ID: 1,
                      SCT_TAG_SETTING_NAME: 'Budget'
                    })
                  } else {
                    setValue('SCT_TAG_SETTING', null)
                  }
                }}
                loadOptions={inputValue => {
                  return fetchSctReasonByLikeSctReasonNameAndInuse(inputValue, 1)
                }}
                getOptionLabel={data => data.SCT_REASON_SETTING_NAME.toString()}
                getOptionValue={data => data.SCT_REASON_SETTING_ID.toString()}
                classNamePrefix='select'
                placeholder='Select SCT Reason ...'
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={4} lg={4}>
          <Controller
            name='SCT_TAG_SETTING'
            control={control}
            render={({ field: { onChange, ...fieldProps } }) => (
              <AsyncSelectCustom<SctTagSettingOption>
                label='SCT Tag'
                inputId='SCT_TAG_SETTING'
                {...fieldProps}
                isDisabled={true}
                isClearable
                cacheOptions
                defaultOptions
                value={getValues('SCT_TAG_SETTING')}
                onChange={value => {
                  onChange(value)
                }}
                loadOptions={inputValue => {
                  return fetchSctTagByLikeSctTagNameAndInuse(inputValue, 1)
                }}
                getOptionLabel={data => data.SCT_TAG_SETTING_NAME.toString()}
                getOptionValue={data => data.SCT_TAG_SETTING_ID.toString()}
                classNamePrefix='select'
                placeholder='Auto'
              />
            )}
          />
        </Grid>
      </Grid>
      <Divider color='primary' className='mb-2 mt-1'>
        <Typography color='primary'>Estimate Period</Typography>
      </Divider>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Grid container spacing={6}>
          <Grid item xs={12} sm={4} lg={4}>
            <Controller
              name='START_DATE'
              control={control}
              render={({ field: { ...fieldProps } }) => (
                <DatePicker
                  {...fieldProps}
                  label='Start Date'
                  value={watch('START_DATE')}
                  disabled={getValues('mode') === 'view'}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={4} lg={4}>
            <Controller
              name='END_DATE'
              control={control}
              render={({ field: { ...fieldProps } }) => (
                <DatePicker
                  {...fieldProps}
                  label='End Date'
                  value={watch('END_DATE')}
                  disabled={getValues('mode') === 'view'}
                />
              )}
            />
          </Grid>
        </Grid>
      </LocalizationProvider>
      <Divider color='primary' className='mb-2 mt-1 relative'>
        <Typography color='primary'>BOM</Typography>
        <div className='absolute -top-1 left-3/4'>
          <Button
            color='primary'
            variant='contained'
            size='small'
            onClick={() => {
              setIsOpenSctDataModal(true)
            }}
            disabled={!watch('PRODUCT_TYPE') || getValues('mode') === 'view'}
          >
            Copy & Edit
          </Button>
          {isOpenSctModal && (
            <SctDataModal
              isOpenSctModal={isOpenSctModal}
              setIsOpenSctDataModal={setIsOpenSctDataModal}
              isCopyAndEdit={true}
            />
          )}
        </div>
      </Divider>
      <Grid container spacing={6}>
        <Grid item xs={12} sm={4} lg={4}>
          <Controller
            name='BOM_CODE_ACTUAL'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='BOM Code (Actual)'
                placeholder='Auto'
                autoComplete='off'
                disabled={true}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={4} lg={4}>
          <Controller
            name='BOM_NAME_ACTUAL'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='BOM Name (Actual)'
                placeholder='Auto'
                autoComplete='off'
                disabled={true}
              />
            )}
          />
        </Grid>
      </Grid>
      <Grid
        container
        spacing={6}
        sx={{
          marginTop: '2px'
        }}
      >
        <Grid item xs={12} sm={4} lg={4}>
          <Controller
            name='BOM_CODE'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='BOM Code'
                placeholder='Auto'
                autoComplete='off'
                disabled={true}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={4} lg={4}>
          <Controller
            name='BOM_NAME'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='BOM Name'
                placeholder='Auto'
                autoComplete='off'
                disabled={true}
              />
            )}
          />
        </Grid>
      </Grid>
    </>
  )
}

export default Header
