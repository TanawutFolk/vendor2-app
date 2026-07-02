import { Divider, Grid, Typography } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'
import CustomTextField from '@/components/mui/TextField'
import { FormDataPage } from './validationSchema'

const SctCreateFrom = () => {
  const { control, watch } = useFormContext<FormDataPage>()

  return (
    <>
      <Grid item xs={12}>
        <Divider color='primary'>
          <Typography color='primary' className='font-bold'>
            SCT Create From
          </Typography>
        </Divider>
      </Grid>
      <Grid container item spacing={3}>
        <Grid item xs={12} sm={6} lg={6}>
          <Controller
            name='header.sctCreateFrom.SCT_CREATE_FROM_NAME'
            control={control}
            render={({ field: { ...fieldProps } }) => (
              <CustomTextField
                {...fieldProps}
                fullWidth
                label='Create From'
                placeholder=''
                autoComplete='off'
                disabled={true}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={6}>
          <Controller
            name='header.sctCreateFrom.CREATE_FROM_SCT_REVISION_CODE'
            control={control}
            render={({ field: { ...fieldProps } }) => (
              <CustomTextField
                {...fieldProps}
                fullWidth
                label='Copy From SCT Revision Code'
                placeholder=''
                autoComplete='off'
                disabled={true}
              />
            )}
          />
        </Grid>
      </Grid>
      <Grid item xs={12} sm={6} lg={6}>
        <CustomTextField
          value={`${watch('header.sctCreateFrom.CREATE_FROM_SCT_FISCAL_YEAR') || ''} ${watch('header.sctCreateFrom.CREATE_FROM_SCT_PATTERN_NAME') || ''}`}
          fullWidth
          label='Copy From Fiscal Year & Pattern'
          placeholder=''
          autoComplete='off'
          disabled={true}
        />
      </Grid>
      <Grid item xs={12} sm={6} lg={6}>
        <Controller
          name='header.sctCreateFrom.CREATE_FROM_SCT_STATUS_PROGRESS_NAME'
          control={control}
          render={({ field: { ...fieldProps } }) => (
            <CustomTextField
              {...fieldProps}
              fullWidth
              label='Copy From SCT Status'
              placeholder=''
              autoComplete='off'
              disabled={true}
            />
          )}
        />
      </Grid>
    </>
  )
}

export default SctCreateFrom
