import { FiscalYearType } from '@/_workspace/pages/cost-condition/exchange-rate/ExchangeRateSearch'
import CustomTextField from '@/components/mui/TextField'
import SelectCustom from '@/components/react-select/SelectCustom'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { Divider, Grid, Typography } from '@mui/material'

import { Controller, useFormContext, useFormState, useWatch } from 'react-hook-form'
import { FormDataPage } from '../dataValidation'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { fetchSctReasonByLikeSctReasonNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchSctReasonSetting'
import { fetchSctTagByLikeSctTagNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchSctTag'
import { useEffect } from 'react'
import { ProductTypeI } from '@/_workspace/types/productGroup/ProductType'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'

const currentYear = new Date().getFullYear()

const yearConfigs = [
  { offset: -1, suffix: '' },
  { offset: 0, suffix: '' },
  { offset: 1, suffix: '' }
]

const FiscalYearOption: FiscalYearType[] = yearConfigs.map(({ offset, suffix }) => {
  const year = currentYear + offset
  return {
    value: year,
    label: `${year}${suffix}`
  }
})

interface Props {
  dataProductTypeSelected: ProductTypeI[]
}

function Header({ dataProductTypeSelected }: Props) {
  const { control, setValue, getValues } = useFormContext<FormDataPage>()

  const { errors } = useFormState({
    control
  })

  const SCT_PATTERN_NO = useWatch({
    control,
    name: 'header.sctPatternNo'
  })
  const FISCAL_YEAR = useWatch({
    control,
    name: 'header.fiscalYear'
  })

  useEffect(() => {
    if (!FISCAL_YEAR?.value || !SCT_PATTERN_NO?.value) return

    if (SCT_PATTERN_NO?.value == 1) {
      const allP2NotNeed = dataProductTypeSelected.some(item => item.P2_NEED === 0)
      if (allP2NotNeed) {
        setValue('header.sctPatternNo', null)
        setValue('header.estimatePeriodStartDate', null)
        setValue('header.estimatePeriodEndDate', null)
        toast.error('P2 no need in some product type')
        return
      } else {
        const allSame = new Set(dataProductTypeSelected.map(o => o.P2_START_MONTH_NO)).size === 1
        if (allSame) {
          try {
            const estimatePeriodStartDate = dayjs(
              `${getValues('header.fiscalYear')?.value}-${String(dataProductTypeSelected[0].P2_START_MONTH_NO).padStart(2, '0')}-01`
            )

            setValue('header.estimatePeriodStartDate', estimatePeriodStartDate.toDate())
            setValue(
              'header.estimatePeriodEndDate',
              estimatePeriodStartDate.add(2, 'month').subtract(1, 'day').toDate()
            )
          } catch (error) {
            toast.error(error?.message ?? 'Error in estimatePeriodStartDate')
          }
        }
      }
    } else if (SCT_PATTERN_NO?.value == 2) {
      const allSame = new Set(dataProductTypeSelected.map(o => o.P3_START_MONTH_NO)).size === 1
      if (allSame) {
        try {
          const estimatePeriodStartDate = dayjs(
            `${getValues('header.fiscalYear')?.value}-${String(dataProductTypeSelected[0].P3_START_MONTH_NO).padStart(2, '0')}-01`
          )

          setValue('header.estimatePeriodStartDate', estimatePeriodStartDate.toDate())
          setValue('header.estimatePeriodEndDate', estimatePeriodStartDate.add(1, 'year').subtract(1, 'day').toDate())
        } catch (error) {
          toast.error(error?.message ?? 'Error in estimatePeriodStartDate')
        }
      }
    }
  }, [FISCAL_YEAR?.value, SCT_PATTERN_NO?.value])

  return (
    <>
      <Grid item xs={12}>
        <Divider color='primary'>
          <Typography color='primary'>Header</Typography>
        </Divider>
      </Grid>
      <Grid item xs={12} sm={2} lg={2}>
        <Controller
          name='header.fiscalYear'
          control={control}
          render={({ field: { ...fieldProps } }) => (
            <SelectCustom
              {...fieldProps}
              options={FiscalYearOption}
              isClearable
              label='Fiscal Year'
              classNamePrefix='select'
              placeholder='Select ...'
              {...(errors?.header?.fiscalYear && {
                error: true,
                helperText: errors.header.fiscalYear.message
              })}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} sm={2} lg={2}>
        <Controller
          name='header.sctPatternNo'
          control={control}
          render={({ field: { ...fieldProps } }) => (
            <SelectCustom
              label='SCT Pattern No'
              {...fieldProps}
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
              placeholder='Select ...'
              {...(errors?.header?.sctPatternNo && {
                error: true,
                helperText: errors.header.sctPatternNo.message
              })}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} sm={2} lg={2}>
        <Controller
          name='header.sctReason'
          control={control}
          render={({ field: { onChange, ...fieldProps } }) => (
            <AsyncSelectCustom
              label='SCT Reason'
              inputId='SCT_REASON_SETTING'
              {...fieldProps}
              isClearable
              cacheOptions
              defaultOptions
              loadOptions={inputValue => {
                return fetchSctReasonByLikeSctReasonNameAndInuse(inputValue, 1)
              }}
              onChange={value => {
                onChange(value)

                // // Budget
                // if (value && value.SCT_REASON_SETTING_ID === 1) {
                //   setValue(
                //     'header.sctTag',
                //     {
                //       SCT_TAG_SETTING_ID: 1,
                //       SCT_TAG_SETTING_NAME: 'Budget'
                //     },
                //     { shouldValidate: true, shouldDirty: true }
                //   )
                // }
                // // Price
                // else {
                //   setValue('header.sctTag', null, { shouldValidate: true, shouldDirty: true })
                // }
              }}
              getOptionLabel={data => data.SCT_REASON_SETTING_NAME.toString()}
              getOptionValue={data => data.SCT_REASON_SETTING_ID.toString()}
              classNamePrefix='select'
              placeholder='Select ...'
              {...(errors?.header?.sctReason && {
                error: true,
                helperText: errors.header.sctReason.message
              })}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} sm={2} lg={2}>
        <Controller
          name='header.sctTag'
          control={control}
          render={({ field: { ...fieldProps } }) => (
            <AsyncSelectCustom
              label='SCT Tag'
              inputId='SCT_TAG_SETTING'
              {...fieldProps}
              isDisabled={true}
              isClearable
              cacheOptions
              defaultOptions
              loadOptions={inputValue => {
                return fetchSctTagByLikeSctTagNameAndInuse(inputValue, 1)
              }}
              getOptionLabel={data => data.SCT_TAG_SETTING_NAME.toString()}
              getOptionValue={data => data.SCT_TAG_SETTING_ID.toString()}
              classNamePrefix='select'
              {...(errors?.header?.sctTag && {
                error: true,
                helperText: errors.header.sctTag.message
              })}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} sm={4} lg={4}>
        <Controller
          control={control}
          name='header.note'
          render={({ field: { ...fieldProps } }) => (
            <>
              <CustomTextField
                label='Note'
                fullWidth
                multiline
                rows={1}
                {...fieldProps}
                {...(errors?.header?.note && {
                  error: true,
                  helperText: errors.header.note.message
                })}
                autoComplete='off'
              />
            </>
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Divider color='primary'>
          <Typography color='primary'>Estimate Period</Typography>
        </Divider>
      </Grid>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Grid item xs={12} sm={2} lg={2}>
          <Controller
            control={control}
            name='header.estimatePeriodStartDate'
            render={({ field: { value, ...fieldProps } }) => (
              <>
                <AppReactDatepicker
                  {...fieldProps}
                  isClearable
                  showYearDropdown
                  showMonthDropdown
                  todayButton='Today'
                  selected={value ?? null}
                  id='end-date'
                  dateFormat='dd-MMM-yyyy'
                  placeholderText='Enter Start Date'
                  //onChange={(date: Date | null) => onChange(date)}
                  customInput={
                    <CustomTextField
                      label='Start Date'
                      fullWidth
                      inputProps={{
                        className: 'text-center'
                      }}
                      {...(errors?.header?.estimatePeriodStartDate && {
                        error: true,
                        helperText: errors.header.estimatePeriodStartDate.message
                      })}
                      autoComplete='off'
                    />
                  }
                  popperPlacement='top-start'
                  popperProps={{ strategy: 'fixed' }}
                  popperClassName='z-[2000000]'
                  autoComplete='off'
                />
              </>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={2} lg={2}>
          <Controller
            control={control}
            name='header.estimatePeriodEndDate'
            render={({ field: { value, ...fieldProps } }) => (
              <>
                <AppReactDatepicker
                  {...fieldProps}
                  isClearable
                  showYearDropdown
                  showMonthDropdown
                  todayButton='Today'
                  selected={value ?? null}
                  id='end-date'
                  dateFormat='dd-MMM-yyyy'
                  placeholderText='Enter End Date'
                  // onChange={(date: Date | null) => onChange(date)}
                  customInput={
                    <CustomTextField
                      label='End Date'
                      fullWidth
                      inputProps={{
                        className: 'text-center'
                      }}
                      {...(errors?.header?.estimatePeriodEndDate && {
                        error: true,
                        helperText: errors.header.estimatePeriodEndDate.message
                      })}
                      autoComplete='off'
                    />
                  }
                  popperPlacement='top-start'
                  popperProps={{ strategy: 'fixed' }}
                  popperClassName='z-[2000000]'
                  autoComplete='off'
                />
              </>
            )}
          />
        </Grid>{' '}
      </LocalizationProvider>
    </>
  )
}

export default Header
