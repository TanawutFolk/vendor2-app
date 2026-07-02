import { Divider, Grid, Typography } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { Controller, useFormContext, useFormState, useWatch } from 'react-hook-form'
import CustomTextField from '@/components/mui/TextField'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { FormDataPage } from './validationSchema'

const Header = () => {
  const { getValues, control } = useFormContext<FormDataPage>()

  const { errors } = useFormState({
    control
  })

  const [mode, sctStatusProgressId] = useWatch({
    control,
    name: ['mode', 'header.sctStatusProgress.SCT_STATUS_PROGRESS_ID']
  })

  return (
    <>
      <Grid item xs={12}>
        <Divider color='primary'>
          <Typography color='primary' className='font-bold'>
            Header
          </Typography>
        </Divider>
      </Grid>

      <Grid container item spacing={4}>
        <Grid item xs={12} sm={8} lg={8}>
          {/* แถวบน - SCT Reason ต่างๆ */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={3} lg={3}>
              <Controller
                name='header.fiscalYear'
                control={control}
                render={({ field: { value, ...fieldProps } }) => (
                  <CustomTextField
                    {...fieldProps}
                    fullWidth
                    label='SCT Reason'
                    placeholder=''
                    autoComplete='off'
                    disabled
                    value={value?.label ?? ''}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3} lg={3}>
              <Controller
                name='header.sctPatternNo'
                control={control}
                render={({ field: { value, ...fieldProps } }) => (
                  <CustomTextField
                    {...fieldProps}
                    fullWidth
                    label='SCT Reason'
                    placeholder=''
                    autoComplete='off'
                    disabled
                    value={value?.label ?? ''}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3} lg={3}>
              <Controller
                name='header.sctReason'
                control={control}
                render={({ field: { value, ...fieldProps } }) => (
                  <CustomTextField
                    {...fieldProps}
                    fullWidth
                    label='SCT Reason'
                    placeholder=''
                    autoComplete='off'
                    disabled
                    value={value?.SCT_REASON_SETTING_NAME ?? ''}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3} lg={3}>
              <Controller
                name='header.sctTagSetting'
                control={control}
                render={({ field: { value, ...fieldProps } }) => (
                  <CustomTextField
                    {...fieldProps}
                    fullWidth
                    label='SCT Tag'
                    placeholder=''
                    autoComplete='off'
                    disabled
                    value={value?.SCT_TAG_SETTING_NAME ?? ''}
                  />
                )}
              />
            </Grid>
          </Grid>

          {/* แถวล่าง - SCT Revision Code และ SCT Status Progress */}
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6} lg={6}>
              <Controller
                name='header.sctRevisionCode'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='SCT Revision Code'
                    placeholder='Auto'
                    autoComplete='off'
                    disabled
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Controller
                name='header.sctStatusProgress'
                control={control}
                render={({ field: { value, ...fieldProps } }) => (
                  <CustomTextField
                    {...fieldProps}
                    fullWidth
                    label='SCT Status Progress'
                    placeholder=''
                    autoComplete='off'
                    disabled
                    value={value?.SCT_STATUS_PROGRESS_NAME ?? ''}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={4} lg={4}>
          <Controller
            name='header.note'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                disabled={mode === 'view' || sctStatusProgressId == 1}
                fullWidth
                label={'Note'}
                autoComplete='off'
                multiline
                rows={3.5}
              />
            )}
          />
        </Grid>
      </Grid>
      {/* <Grid item xs={12} sm={4} lg={4}>
        <Controller
          name='header.note'
          control={control}
          render={({ field }) => (
            <CustomTextField
              {...field}
              disabled={mode === 'view' || sctStatusProgressId == 1}
              fullWidth
              label={'Note'}
              // <div className='flex gap-1'>
              //   <Typography color='primary'>Note</Typography> <Typography color='secondary'>(optional)</Typography>
              // </div>

              autoComplete='off'
              multiline
              rows={1}
            />
          )}
        />
      </Grid> */}
      {/* <Grid item xs={12}>
        <Divider color='primary'>
          <Typography color='primary' className='font-bold'>
            Estimate Period
          </Typography>
        </Divider>
      </Grid> */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Grid item xs={12} sm={4} lg={4}>
          <Controller
            name='header.estimatePeriodStartDate'
            control={control}
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
                  dateFormat='dd-MMM-yyyy'
                  placeholderText='Enter Start Date'
                  popperPlacement='top-start'
                  popperProps={{ strategy: 'fixed' }}
                  popperClassName='z-[2000000]'
                  disabled={
                    getValues('mode') === 'view' || getValues('header.sctStatusProgress')?.SCT_STATUS_PROGRESS_ID == 1
                  }
                  customInput={
                    <CustomTextField
                      label='Start Date'
                      fullWidth
                      inputProps={{
                        className: 'text-center'
                      }}
                      disabled={
                        getValues('mode') === 'view' ||
                        getValues('header.sctStatusProgress')?.SCT_STATUS_PROGRESS_ID == 1
                      }
                      {...(errors?.header?.estimatePeriodStartDate && {
                        error: true,
                        helperText: errors.header.estimatePeriodStartDate.message
                      })}
                    />
                  }
                />
              </>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={4} lg={4}>
          <Controller
            name='header.estimatePeriodEndDate'
            control={control}
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
                  dateFormat='dd-MMM-yyyy'
                  placeholderText='Enter End Date'
                  popperPlacement='top-start'
                  popperProps={{ strategy: 'fixed' }}
                  popperClassName='z-[2000000]'
                  disabled={
                    getValues('mode') === 'view' || getValues('header.sctStatusProgress')?.SCT_STATUS_PROGRESS_ID == 1
                  }
                  customInput={
                    <CustomTextField
                      label='End Date'
                      fullWidth
                      inputProps={{
                        className: 'text-center'
                      }}
                      disabled={
                        getValues('mode') === 'view' ||
                        getValues('header.sctStatusProgress')?.SCT_STATUS_PROGRESS_ID == 1
                      }
                      {...(errors?.header?.estimatePeriodEndDate && {
                        error: true,
                        helperText: errors.header.estimatePeriodEndDate.message
                      })}
                    />
                  }
                />
              </>
            )}
          />
        </Grid>
      </LocalizationProvider>
      <Grid item xs={12} sm={4} lg={4}>
        <CustomTextField
          value={`${getValues('product.productMain.PRODUCT_MAIN_ALPHABET')}${getValues('product.productSub.PRODUCT_SUB_ALPHABET')}${getValues('product.itemCategory.ITEM_CATEGORY_ALPHABET')}1`}
          fullWidth
          label='Assembly Group'
          placeholder='Auto'
          autoComplete='off'
          disabled
        />
      </Grid>
      <Grid item xs={12}>
        <Divider color='primary'>
          <Typography color='primary' className='font-bold'>
            BOM
          </Typography>
        </Divider>
      </Grid>
      <Grid item xs={12} sm={3} lg={3}>
        <Controller
          name='header.bom.BOM_CODE_ACTUAL'
          control={control}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              label='BOM Code (Actual)'
              placeholder='Auto'
              autoComplete='off'
              disabled
            />
          )}
        />
      </Grid>
      <Grid item xs={12} sm={9} lg={9}>
        <Controller
          name='header.bom.BOM_NAME_ACTUAL'
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
      <Grid item xs={12} sm={3} lg={3}>
        <Controller
          name='header.bom.BOM_CODE'
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
      <Grid item xs={12} sm={9} lg={9}>
        <Controller
          name='header.bom.BOM_NAME'
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
    </>
  )
}

export default Header
