import React from 'react'

import { Divider, Grid, Typography } from '@mui/material'
import SctDataInput from '../Page2_Create/MasterDataSelection/MasterDataSelection_Body'
import { useFormContext, useFormState } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'

const SctData = () => {
  const { control } = useFormContext()
  const { errors } = useFormState({
    control
  })

  return (
    <>
      <Grid container spacing={6} className='mt-2'>
        <Grid item xs={12} sm={12} lg={12}>
          <Typography color='primary'>SCT Data (for Preparing Step)</Typography>
        </Grid>
      </Grid>
      <Grid container spacing={6}>
        <Grid item xs={12} sm={6} lg={6}>
          <Divider color='primary' className='mb-2 mt-1'>
            <Typography>Cost Condition</Typography>
          </Divider>
          <SctDataInput name='COST_CONDITION' />
          {(errors?.COST_CONDITION_RESOURCE_OPTION_ID && (
            <span className={twMerge('custom-error-message', 'error-mui-color', 'mx-auto')}>
              {errors.COST_CONDITION_RESOURCE_OPTION_ID.message}
            </span>
          )) ||
            (errors?.COST_CONDITION && (
              <span className={twMerge('custom-error-message', 'error-mui-color', 'mx-auto')}>
                {errors.COST_CONDITION?.message ?? errors.COST_CONDITION?.root?.message}
              </span>
            ))}
        </Grid>
      </Grid>
      <Grid container spacing={6}>
        <Grid item xs={12} sm={6} lg={6}>
          <Divider color='primary' className='mb-2 mt-1'>
            <Typography>Yield Rate & Go Straight Rate</Typography>
          </Divider>
          <SctDataInput name='YR_GR_FROM_ENGINEER' />
          {(errors?.YR_GR_FROM_ENGINEER_RESOURCE_OPTION_ID && (
            <span className={twMerge('custom-error-message', 'error-mui-color', 'mx-auto')}>
              {errors.YR_GR_FROM_ENGINEER_RESOURCE_OPTION_ID.message}
            </span>
          )) ||
            (errors?.YR_GR_FROM_ENGINEER && (
              <span className={twMerge('custom-error-message', 'error-mui-color', 'mx-auto')}>
                {errors.YR_GR_FROM_ENGINEER.message}
              </span>
            ))}
        </Grid>
        <Grid item xs={12} sm={6} lg={6}>
          <Divider color='primary' className='mb-2 mt-1'>
            <Typography>Clear Time</Typography>
          </Divider>
          <SctDataInput name='TIME_FROM_MFG' />
          {(errors?.TIME_FROM_MFG_RESOURCE_OPTION_ID && (
            <span className={twMerge('custom-error-message', 'error-mui-color', 'mx-auto')}>
              {errors.TIME_FROM_MFG_RESOURCE_OPTION_ID.message}
            </span>
          )) ||
            (errors?.TIME_FROM_MFG && (
              <span className={twMerge('custom-error-message', 'error-mui-color', 'mx-auto')}>
                {errors.TIME_FROM_MFG.message}
              </span>
            ))}
        </Grid>
      </Grid>
      <Grid container spacing={6}>
        <Grid item xs={12} sm={6} lg={6}>
          <Divider color='primary' className='mb-2 mt-1'>
            <Typography>Manufacturing Item Price</Typography>
          </Divider>
          <SctDataInput name='MATERIAL_PRICE' />
          {(errors?.MATERIAL_PRICE_RESOURCE_OPTION_ID && (
            <span className={twMerge('custom-error-message', 'error-mui-color', 'mx-auto')}>
              {errors.MATERIAL_PRICE_RESOURCE_OPTION_ID.message}
            </span>
          )) ||
            (errors?.MATERIAL_PRICE && (
              <span className={twMerge('custom-error-message', 'error-mui-color', 'mx-auto')}>
                {errors.MATERIAL_PRICE.message}
              </span>
            ))}
        </Grid>
        <Grid item xs={12} sm={6} lg={6}>
          <Divider color='primary' className='mb-2 mt-1'>
            <Typography>Yield Rate Material</Typography>
          </Divider>
          <SctDataInput name='YR_ACCUMULATION_MATERIAL_FROM_ENGINEER' />
          {(errors?.YR_ACCUMULATION_MATERIAL_FROM_ENGINEER_RESOURCE_OPTION_ID && (
            <span className={twMerge('custom-error-message', 'error-mui-color', 'mx-auto')}>
              {errors.YR_ACCUMULATION_MATERIAL_FROM_ENGINEER_RESOURCE_OPTION_ID.message}
            </span>
          )) ||
            (errors?.YR_ACCUMULATION_MATERIAL_FROM_ENGINEER && (
              <span className={twMerge('custom-error-message', 'error-mui-color', 'mx-auto')}>
                {errors.YR_ACCUMULATION_MATERIAL_FROM_ENGINEER.message}
              </span>
            ))}
        </Grid>
      </Grid>
    </>
  )
}

export default SctData
