import { useState } from 'react'

import { Box, Button, Divider, Grid, Typography } from '@mui/material'

import { Controller, useFormContext, useWatch } from 'react-hook-form'

import { FormDataPage } from '../validationSchema'
import SctDataModal from './SctDataModal'
import { is_Null_Undefined_Blank } from '@/utils/formatting-checking-value/checkingValueTypes'
import CustomTextField from '@/components/mui/TextField'
import CustomIconButton from '@/@core/components/mui/IconButton'

const SctCompare = () => {
  const [isOpenSctNo1Selected, setIsOpenSctNo1Selected] = useState(false)
  const [isOpenSctNo2Selected, setIsOpenSctNo2Selected] = useState(false)

  const { control, getValues, watch, setValue } = useFormContext<FormDataPage>()

  const [mode] = useWatch({
    control,
    name: ['mode']
  })

  return (
    <>
      <Grid item xs={12} sm={6} lg={6}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Divider color='primary'>
              <Typography color='primary' className='font-bold'>
                SCT Compare No. 1
              </Typography>
            </Divider>
          </Grid>
          <Grid item xs={12} sm={6} lg={6}>
            <Controller
              name='sctComPareNo1'
              control={control}
              render={({ field: { name, value, ...fieldProps } }) => (
                <>
                  <Box display='flex' alignItems='flex-end' gap={1}>
                    <CustomTextField
                      onClick={() => {
                        if (
                          getValues('mode') === 'view' ||
                          getValues('header.sctStatusProgress.SCT_STATUS_PROGRESS_ID') === 1
                        )
                          return
                        setIsOpenSctNo1Selected(true)
                      }}
                      {...fieldProps}
                      onChange={() => {
                        return
                      }}
                      name={name}
                      value={value?.sctRevisionCode ?? ''}
                      label='SCT Compare No. 1'
                      disabled={watch('header.sctStatusProgress.SCT_STATUS_PROGRESS_ID') === 1 || mode === 'view'}
                      autoComplete='off'
                      fullWidth
                      inputProps={{
                        sx: {
                          height: '19px'
                        }
                      }}
                    />
                    <CustomIconButton
                      aria-label='capture screenshot'
                      color='error'
                      variant='tonal'
                      className='h-[36px]'
                      sx={{ alignSelf: 'flex-end' }}
                      disabled={watch('header.sctStatusProgress.SCT_STATUS_PROGRESS_ID') === 1 || mode === 'view'}
                      onClick={() => {
                        setValue('sctComPareNo1', null, { shouldValidate: true })
                      }}
                    >
                      <i className='tabler-trash' />
                    </CustomIconButton>
                  </Box>
                  {isOpenSctNo1Selected && (
                    <SctDataModal
                      isOpenSctModal={isOpenSctNo1Selected}
                      setIsOpenSctDataModal={setIsOpenSctNo1Selected}
                      originalName={name}
                      sctCompareNo={1}
                    />
                  )}
                </>
              )}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={2}
            lg={2}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'end'
            }}
          >
            {getValues('sctComPareNo1')?.isDefaultExportCompare ? (
              <Button
                color='success'
                variant='contained'
                sx={{
                  width: '100%'
                }}
                disabled={
                  getValues('mode') === 'view' || getValues('header.sctStatusProgress.SCT_STATUS_PROGRESS_ID') === 1
                }
                startIcon={<i className='tabler-check' />}
              >
                Default
              </Button>
            ) : (
              <Button
                color='warning'
                variant='contained'
                sx={{
                  width: '100%'
                }}
                onClick={() => {
                  setValue('sctComPareNo1.isDefaultExportCompare', 1)
                  setValue('sctComPareNo2.isDefaultExportCompare', 0)
                }}
                disabled={
                  getValues('mode') === 'view' ||
                  getValues('header.sctStatusProgress.SCT_STATUS_PROGRESS_ID') === 1 ||
                  is_Null_Undefined_Blank(getValues('sctComPareNo1')?.SCT_ID)
                }
              >
                Set as Default
              </Button>
            )}
          </Grid>
          <Grid container item spacing={3}>
            <Grid item xs={12} sm={3} lg={3}>
              <CustomTextField
                value={watch('sctComPareNo1')?.bom?.BOM_CODE ?? ''}
                fullWidth
                label='BOM Code'
                placeholder='Auto'
                autoComplete='off'
                disabled={true}
              />
            </Grid>
            <Grid item xs={12} sm={9} lg={9}>
              <CustomTextField
                value={watch('sctComPareNo1')?.bom?.BOM_NAME ?? ''}
                fullWidth
                label='BOM Name'
                placeholder='Auto'
                autoComplete='off'
                disabled={true}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} sm={6} lg={6}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Divider color='primary'>
              <Typography color='primary' className='font-bold'>
                SCT Compare No. 2
              </Typography>
            </Divider>
          </Grid>
          <Grid item xs={12} sm={6} lg={6}>
            <Controller
              name='sctComPareNo2'
              control={control}
              render={({ field: { value, name, ...fieldProps } }) => (
                <>
                  <Box display='flex' alignItems='flex-end' gap={1}>
                    <CustomTextField
                      onClick={() => {
                        if (
                          getValues('mode') === 'view' ||
                          getValues('header.sctStatusProgress.SCT_STATUS_PROGRESS_ID') === 1
                        )
                          return
                        setIsOpenSctNo2Selected(true)
                      }}
                      {...fieldProps}
                      onChange={() => {
                        return
                      }}
                      name={name}
                      value={value?.sctRevisionCode ?? ''}
                      label='SCT Compare No. 2'
                      disabled={watch('header.sctStatusProgress.SCT_STATUS_PROGRESS_ID') === 1 || mode === 'view'}
                      autoComplete='off'
                      fullWidth
                      inputProps={{
                        sx: {
                          height: '19px'
                        }
                      }}
                    />
                    <CustomIconButton
                      aria-label='capture screenshot'
                      color='error'
                      variant='tonal'
                      className='h-[36px]'
                      sx={{ alignSelf: 'flex-end' }}
                      disabled={watch('header.sctStatusProgress.SCT_STATUS_PROGRESS_ID') === 1 || mode === 'view'}
                      onClick={() => {
                        setValue('sctComPareNo2', null, { shouldValidate: true })
                      }}
                    >
                      <i className='tabler-trash' />
                    </CustomIconButton>
                  </Box>
                  {isOpenSctNo2Selected && (
                    <SctDataModal
                      isOpenSctModal={isOpenSctNo2Selected}
                      setIsOpenSctDataModal={setIsOpenSctNo2Selected}
                      originalName={name}
                      sctCompareNo={1}
                    />
                  )}
                </>
              )}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={2}
            lg={2}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'end'
            }}
          >
            {getValues('sctComPareNo2')?.isDefaultExportCompare ? (
              <Button
                color='success'
                variant='contained'
                sx={{
                  width: '100%'
                }}
                disabled={
                  getValues('mode') === 'view' || getValues('header.sctStatusProgress.SCT_STATUS_PROGRESS_ID') === 1
                }
                startIcon={<i className='tabler-check' />}
              >
                Default
              </Button>
            ) : (
              <Button
                color='warning'
                variant='contained'
                sx={{
                  width: '100%'
                }}
                onClick={() => {
                  setValue('sctComPareNo2.isDefaultExportCompare', 1)
                  setValue('sctComPareNo1.isDefaultExportCompare', 0)
                }}
                disabled={
                  getValues('mode') === 'view' ||
                  getValues('header.sctStatusProgress.SCT_STATUS_PROGRESS_ID') === 1 ||
                  is_Null_Undefined_Blank(getValues('sctComPareNo2')?.SCT_ID)
                }
              >
                Set as Default
              </Button>
            )}
          </Grid>
          <Grid container item spacing={3}>
            <Grid item xs={12} sm={3} lg={3}>
              <CustomTextField
                value={watch('sctComPareNo2')?.bom?.BOM_CODE ?? ''}
                fullWidth
                label='BOM Code'
                placeholder='Auto'
                autoComplete='off'
                disabled={true}
              />
            </Grid>
            <Grid item xs={12} sm={9} lg={9}>
              <CustomTextField
                value={watch('sctComPareNo2')?.bom?.BOM_NAME ?? ''}
                fullWidth
                label='BOM Name'
                placeholder='Auto'
                autoComplete='off'
                disabled={true}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default SctCompare
