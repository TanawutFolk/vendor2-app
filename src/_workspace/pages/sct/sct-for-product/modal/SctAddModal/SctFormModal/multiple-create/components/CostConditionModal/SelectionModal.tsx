import React, { Dispatch, forwardRef, ReactElement, Ref, SetStateAction, useState } from 'react'

import {
  Button,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Slide,
  SlideProps,
  Typography
} from '@mui/material'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'

import { Controller, SubmitErrorHandler, useForm, useFormContext, useFormState } from 'react-hook-form'

import { valibotResolver } from '@hookform/resolvers/valibot'
import { number, object, string, type Input } from 'valibot'
import CustomTextField from '@/components/mui/TextField'
import MasterDataModal from './Modal'
import { ToastMessageError } from '@/components/ToastMessage'

// Dialog
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

// Schema with Valibot
const schema = object({
  DIRECT_COST_CONDITION: object(
    {
      DIRECT_COST_CONDITION_ID: string(),
      FISCAL_YEAR: string(),
      VERSION: number()
    },
    'Direct Cost Condition is required'
  ),
  INDIRECT_COST_CONDITION: object(
    {
      INDIRECT_COST_CONDITION_ID: number(),
      FISCAL_YEAR: string(),
      VERSION: number()
    },
    'Indirect Cost Condition is required'
  ),
  SPECIAL_COST_CONDITION: object(
    {
      SPECIAL_COST_CONDITION_ID: number(),
      FISCAL_YEAR: string(),
      VERSION: number()
    },
    'Special Cost Condition is required'
  ),
  OTHER_COST_CONDITION: object(
    {
      OTHER_COST_CONDITION_ID: number(),
      FISCAL_YEAR: string(),
      VERSION: number()
    },
    'Other Cost Condition is required'
  )
})

type FormData = Input<typeof schema>

interface Props {
  originalName: string
  name: string
  isOpenMasterDataSelectionModal: boolean
  setIsOpenMasterDataSelectionModal: Dispatch<SetStateAction<boolean>>
}

const MasterDataSelectionModal = ({
  originalName,
  name,
  isOpenMasterDataSelectionModal,
  setIsOpenMasterDataSelectionModal
}: Props) => {
  const [costConditionType, setCostConditionType] = useState<'direct' | 'indirect' | 'special' | 'other'>('direct')
  const [isShowMasterDataModal, setIsShowMasterDataModal] = useState(false)

  const handleClose = () => {
    setIsOpenMasterDataSelectionModal(false)
  }

  // Hooks : react-hook-form
  const { control, getValues, handleSubmit, watch, setValue } = useFormContext<any>()

  const { errors } = useFormState({
    control
  })

  const onSubmit = () => {
    if (
      !getValues('COST_CONDITION.DIRECT_COST_CONDITION') ||
      !getValues('COST_CONDITION.INDIRECT_COST_CONDITION') ||
      !getValues('COST_CONDITION.SPECIAL_COST_CONDITION') ||
      !getValues('COST_CONDITION.OTHER_COST_CONDITION')
    ) {
      const message = {
        title: 'Add Cost Condition',
        message: 'Please select all cost condition'
      }

      ToastMessageError(message)

      return
    }

    setIsOpenMasterDataSelectionModal(false)
    setValue('DIRECT_COST_CONDITION', getValues('COST_CONDITION.DIRECT_COST_CONDITION'))
    setValue('INDIRECT_COST_CONDITION', getValues('COST_CONDITION.INDIRECT_COST_CONDITION'))
    setValue('SPECIAL_COST_CONDITION', getValues('COST_CONDITION.SPECIAL_COST_CONDITION'))
    setValue('OTHER_COST_CONDITION', getValues('COST_CONDITION.OTHER_COST_CONDITION'))
  }

  const onError: SubmitErrorHandler<any> = data => {
    console.log(data)
  }

  return (
    <>
      <Dialog
        maxWidth='xs'
        fullWidth={true}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose()
          }
        }}
        TransitionComponent={Transition}
        open={isOpenMasterDataSelectionModal}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
        PaperProps={{ sx: { top: 30, m: 0 } }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            Select Cost Condition Version
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid className='mb-5'>
            <Controller
              name='COST_CONDITION.DIRECT_COST_CONDITION'
              control={control}
              render={({ field }) => (
                <div className='flex flex-col'>
                  <Typography variant='h6' component='span' color='primary'>
                    Direct Cost Condition
                  </Typography>
                  <ButtonGroup variant='outlined' aria-label='Basic button group' color='secondary'>
                    {/* <Button>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        stroke-width='2'
                        stroke-linecap='round'
                        stroke-linejoin='round'
                        // @ts-ignore
                        class='icon icon-tabler icons-tabler-outline icon-tabler-eye'
                      >
                        <path stroke='none' d='M0 0h24v24H0z' fill='none' />
                        <path d='M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0' />
                        <path d='M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6' />
                      </svg>
                    </Button> */}
                    {/* <Button>Two</Button> */}
                    <Button
                      className='w-full'
                      onClick={() => {
                        setCostConditionType('direct')
                        setIsShowMasterDataModal(true)
                      }}
                    >
                      {watch('COST_CONDITION.DIRECT_COST_CONDITION')
                        ? `Fiscal year ${getValues('COST_CONDITION.DIRECT_COST_CONDITION').FISCAL_YEAR} / Version ${getValues('COST_CONDITION.DIRECT_COST_CONDITION').VERSION}`
                        : 'Select Direct Cost Condition'}
                    </Button>
                  </ButtonGroup>
                  {errors?.COST_CONDITION?.DIRECT_COST_CONDITION && (
                    <Typography variant='h6' component='span' color='error'>
                      {errors?.COST_CONDITION?.DIRECT_COST_CONDITION?.message}
                    </Typography>
                  )}
                </div>
              )}
            />
          </Grid>
          <Grid className='mb-5'>
            <Controller
              name='COST_CONDITION.INDIRECT_COST_CONDITION'
              control={control}
              render={({ field }) => (
                <div className='flex flex-col'>
                  <Typography variant='h6' component='span' color='primary'>
                    Indirect Cost Condition
                  </Typography>
                  <ButtonGroup variant='outlined' aria-label='Basic button group' color='secondary'>
                    {/* <Button>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        stroke-width='2'
                        stroke-linecap='round'
                        stroke-linejoin='round'
                        class='icon icon-tabler icons-tabler-outline icon-tabler-eye'
                      >
                        <path stroke='none' d='M0 0h24v24H0z' fill='none' />
                        <path d='M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0' />
                        <path d='M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6' />
                      </svg>
                    </Button> */}
                    {/* <Button>Two</Button> */}
                    <Button
                      className='w-full'
                      onClick={() => {
                        setCostConditionType('indirect')
                        setIsShowMasterDataModal(true)
                      }}
                    >
                      {watch('COST_CONDITION.INDIRECT_COST_CONDITION')
                        ? `Fiscal year ${getValues('COST_CONDITION.INDIRECT_COST_CONDITION').FISCAL_YEAR} / Version ${getValues('COST_CONDITION.INDIRECT_COST_CONDITION').VERSION}`
                        : 'Select Direct Cost Condition'}
                    </Button>
                  </ButtonGroup>
                  {errors?.COST_CONDITION?.INDIRECT_COST_CONDITION && (
                    <Typography variant='h6' component='span' color='error'>
                      {errors?.COST_CONDITION?.INDIRECT_COST_CONDITION?.message}
                    </Typography>
                  )}
                </div>
              )}
            />
          </Grid>
          <Grid className='mb-5'>
            <Controller
              name='COST_CONDITION.SPECIAL_COST_CONDITION'
              control={control}
              render={({ field }) => (
                <div className='flex flex-col'>
                  <Typography variant='h6' component='span' color='primary'>
                    Special Cost Condition
                  </Typography>
                  <ButtonGroup variant='outlined' aria-label='Basic button group' color='secondary'>
                    {/* <Button>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        stroke-width='2'
                        stroke-linecap='round'
                        stroke-linejoin='round'
                        class='icon icon-tabler icons-tabler-outline icon-tabler-eye'
                      >
                        <path stroke='none' d='M0 0h24v24H0z' fill='none' />
                        <path d='M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0' />
                        <path d='M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6' />
                      </svg>
                    </Button> */}
                    {/* <Button>Two</Button> */}
                    <Button
                      className='w-full'
                      onClick={() => {
                        setCostConditionType('special')
                        setIsShowMasterDataModal(true)
                      }}
                    >
                      {watch('COST_CONDITION.SPECIAL_COST_CONDITION')
                        ? `Fiscal year ${getValues('COST_CONDITION.SPECIAL_COST_CONDITION').FISCAL_YEAR} / Version ${getValues('COST_CONDITION.SPECIAL_COST_CONDITION').VERSION}`
                        : 'Select Direct Cost Condition'}{' '}
                    </Button>
                  </ButtonGroup>
                  {errors?.COST_CONDITION?.SPECIAL_COST_CONDITION && (
                    <Typography variant='h6' component='span' color='error'>
                      {errors?.COST_CONDITION?.SPECIAL_COST_CONDITION?.message}
                    </Typography>
                  )}
                </div>
              )}
            />
          </Grid>
          <Grid className='mb-5'>
            <Controller
              name='COST_CONDITION.OTHER_COST_CONDITION'
              control={control}
              render={({ field }) => (
                <div className='flex flex-col'>
                  <Typography variant='h6' component='span' color='primary'>
                    Other Cost Condition
                  </Typography>
                  <ButtonGroup variant='outlined' aria-label='Basic button group' color='secondary'>
                    {/* <Button>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        stroke-width='2'
                        stroke-linecap='round'
                        stroke-linejoin='round'
                        class='icon icon-tabler icons-tabler-outline icon-tabler-eye'
                      >
                        <path stroke='none' d='M0 0h24v24H0z' fill='none' />
                        <path d='M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0' />
                        <path d='M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6' />
                      </svg>
                    </Button> */}
                    {/* <Button>Two</Button> */}
                    <Button
                      className='w-full'
                      onClick={() => {
                        setCostConditionType('other')
                        setIsShowMasterDataModal(true)
                      }}
                    >
                      {watch('COST_CONDITION.OTHER_COST_CONDITION')
                        ? `Fiscal year ${getValues('COST_CONDITION.OTHER_COST_CONDITION').FISCAL_YEAR} / Version ${getValues('COST_CONDITION.OTHER_COST_CONDITION').VERSION}`
                        : 'Select Direct Cost Condition'}{' '}
                    </Button>
                  </ButtonGroup>
                  {errors?.COST_CONDITION?.OTHER_COST_CONDITION && (
                    <Typography variant='h6' component='span' color='error'>
                      {errors?.COST_CONDITION?.OTHER_COST_CONDITION?.message}
                    </Typography>
                  )}
                </div>
              )}
            />
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleSubmit(onSubmit, onError)()} variant='contained'>
            OK
          </Button>
          {/* <Button onClick={handleClose} variant='tonal' color='secondary'>
            Close
          </Button> */}
        </DialogActions>
      </Dialog>
      {isShowMasterDataModal && (
        <MasterDataModal
          costConditionType={costConditionType}
          isOpenMasterDataModal={isShowMasterDataModal}
          setIsOpenMasterDataModal={setIsShowMasterDataModal}
        />
      )}
    </>
  )
}

export default MasterDataSelectionModal
