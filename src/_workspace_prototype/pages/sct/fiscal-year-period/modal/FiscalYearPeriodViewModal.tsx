import type { Ref, ReactElement, Dispatch, SetStateAction } from 'react'
import { forwardRef, useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import type { SlideProps } from '@mui/material'
import { Grid, Slide } from '@mui/material'
import { Controller, useForm, useFormState } from 'react-hook-form'
// Components Imports

import { object, string, number, minLength, maxLength, pipe, nonEmpty, regex } from 'valibot'

import type { Input } from 'valibot'

import { valibotResolver } from '@hookform/resolvers/valibot'

import DialogCloseButton from '@components/dialogs/DialogCloseButton'

import CustomTextField from '@/components/mui/TextField'
import {
  maxLengthFieldMessage,
  minLengthFieldMessage,
  requiredFieldMessage,
  typeFieldMessage
} from '@/libs/valibot/error-message/errorMessage'

import { MRT_Row } from 'material-react-table'

import StatusOption from '@/libs/react-select/option/StatusOption'
import { FiscalYearPeriodI } from '@/_workspace/types/sct/FiscalYearPeriodType'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

type FormData = Input<typeof schema>

const schema = object({
  department: object(
    {
      DEPARTMENT_ID: number(),
      DEPARTMENT_NAME: string()
    },
    requiredFieldMessage({ fieldName: 'Department Name' })
  ),
  divisionName: pipe(
    string(typeFieldMessage({ fieldName: 'Division Name', typeName: 'String' })),
    nonEmpty('Division Name is required'),
    minLength(2, minLengthFieldMessage({ fieldName: 'Division Name', minLength: 2 })),
    maxLength(50, maxLengthFieldMessage({ fieldName: 'Division Name', maxLength: 50 }))
  ),
  divisionAlphabet: pipe(
    string(),
    nonEmpty('Division Alphabet is required'),
    minLength(2, minLengthFieldMessage({ fieldName: 'Division Alphabet', minLength: 2 })),
    maxLength(3, maxLengthFieldMessage({ fieldName: 'Division Alphabet', maxLength: 3 })),
    regex(/[A-Z]/, 'Division Alphabet must contain a uppercase letter')
  ),
  status: object(
    {
      value: number(),
      label: string()
    },
    requiredFieldMessage({ fieldName: 'Status' })
  )
})

interface DivisionModalProps {
  openViewModal: boolean
  setOpenModalView: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<FiscalYearPeriodI> | null
}
interface Props {
  isEnableFetching: boolean
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const FiscalYearPeriodViewModal = ({ openViewModal, setOpenModalView, rowSelected }: Props & DivisionModalProps) => {
  // useState

  // States : Modal
  const handleClose = () => {
    setOpenModalView(false)
    //reset()
  }

  // Hooks : react-hook-form
  const { control } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      customerInvoiceAlphabetName: rowSelected?.original?.CUSTOMER_INVOICE_TO_ALPHABET,
      p2Need: rowSelected?.original?.P2_NEED == '1' ? 'Need' : 'No Need',
      p2StartMonthOfFiscalYear: rowSelected?.original?.P2_START_MONTH_OF_FISCAL_YEAR_NAME || '',
      p3StartMonthOfFiscalYear: rowSelected?.original?.P3_START_MONTH_OF_FISCAL_YEAR_NAME,
      status: StatusOption.find(item => item.value == rowSelected?.original?.INUSE)?.label
    }
  })

  return (
    <>
      <Dialog
        maxWidth='sm'
        fullWidth={true}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose()
          }
        }}
        TransitionComponent={Transition}
        open={openViewModal}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
        PaperProps={{ sx: { top: 30, m: 0 } }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            View Fiscal Year Period
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid className='mb-3'>
            <Controller
              name='customerInvoiceAlphabetName'
              control={control}
              render={({ field: { ...fieldProps } }) => (
                <CustomTextField
                  label='Customer Invoice To Alphabet Name'
                  {...fieldProps}
                  fullWidth
                  autoComplete='off'
                  disabled={true}
                />
              )}
            />
          </Grid>
          <Grid className='mb-3'>
            <Controller
              control={control}
              name='p2Need'
              render={({ field: { ref, ...fieldProps } }) => (
                <CustomTextField
                  label='P2 Need'
                  {...fieldProps}
                  fullWidth
                  // placeholder='Enter Division Name'
                  autoComplete='off'
                  disabled={true}
                />
              )}
            />
          </Grid>
          {rowSelected?.original?.P2_NEED == '1' ? (
            <Grid className='mb-3'>
              <Controller
                name='p2StartMonthOfFiscalYear'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Start Month of Fiscal Year (P2)'
                    //  placeholder='-'
                    autoComplete='off'
                    disabled={true}
                  />
                )}
              />
            </Grid>
          ) : null}

          <Grid className='mb-3'>
            <Controller
              name='p3StartMonthOfFiscalYear'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Start Month of Fiscal Year (P3)'
                  // placeholder='Enter Division Alphabet'
                  autoComplete='off'
                  disabled={true}
                />
              )}
            />
          </Grid>
          <Grid>
            <Controller
              name='status'
              control={control}
              render={({ field: { ...fieldProps } }) => (
                <CustomTextField label='Status' {...fieldProps} disabled fullWidth autoComplete='off' />
              )}
            />
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant='tonal' color='secondary'>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default FiscalYearPeriodViewModal
