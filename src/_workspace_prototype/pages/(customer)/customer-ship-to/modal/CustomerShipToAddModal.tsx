// React Imports
import type { Dispatch, ReactElement, Ref, SetStateAction } from 'react'
import { forwardRef, useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'

import type { SlideProps } from '@mui/material'
import { Grid, Slide } from '@mui/material'
import type { SubmitErrorHandler } from 'react-hook-form'
import { Controller, useForm, useFormState } from 'react-hook-form'

// Components Imports
import { useQueryClient } from '@tanstack/react-query'

import DialogCloseButton from '@components/dialogs/DialogCloseButton'

import CustomTextField from '@/@core/components/mui/TextField'
import { PREFIX_QUERY_KEY, useCreateCustomerShipTo } from '@/_workspace/react-query/hooks/useCustomerShipToData'

import ConfirmModal from '@/components/ConfirmModal'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

export type FormData = z.infer<typeof schema>

const schema = z.object({
  customerShipToName: z
    .string({
      required_error: 'Customer Ship To Name is required',
      invalid_type_error: 'Customer Ship To Name must be a string'
    })
    .min(3, { message: 'Customer Ship To Name must be at least 3 characters long' })
    .max(150, { message: 'Customer Ship To Name must be at most 150 characters long' }),

  customerShipToAlphabet: z
    .string({
      required_error: 'Customer Ship To Alphabet is required',
      invalid_type_error: 'Customer Ship To Alphabet must be a string'
    })
    .regex(/[A-Z]/, { message: 'Customer Ship To Alphabet must contain at least one uppercase letter' })
})

interface CustomerOrderFromAddModalProps {
  openModalAdd: boolean
  setOpenModalAdd: Dispatch<SetStateAction<boolean>>
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}
const CustomerShipToAddModal = ({
  openModalAdd,
  setOpenModalAdd,
  setIsEnableFetching
}: CustomerOrderFromAddModalProps) => {
  // useState

  // States : Modal

  const [confirmModal, setConfirmModal] = useState(false)

  const handleClose = () => {
    setOpenModalAdd(false)
    reset()
  }

  // Hooks : react-hook-form
  const { control, handleSubmit, setValue, reset, getValues } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      customerShipToName: '',
      customerShipToAlphabet: ''
    }
  })

  const { errors } = useFormState({
    control
  })

  const onSubmit = () => {
    setConfirmModal(true)
  }

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log('ERROR', data)
  }

  // Hooks : react-query
  const queryClient = useQueryClient()

  const handleAdd = () => {
    setConfirmModal(false)

    const dataItem = {
      CUSTOMER_SHIP_TO_NAME: getValues('customerShipToName').trim(),
      // CUSTOMER_ORDER_FROM_NAME: getValues('customerOrderFromName'),
      CUSTOMER_SHIP_TO_ALPHABET: getValues('customerShipToAlphabet').trim(),
      CREATE_BY: getUserData()?.EMPLOYEE_CODE,
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE
    }

    mutation.mutate(dataItem)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
  }

  const onMutateSuccess = data => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Add Customer Ship To'
      }

      ToastMessageSuccess(message)
      setIsEnableFetching(true)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      //reset()
      handleClose()
    } else {
      const message = {
        title: 'Add Customer Ship To',
        message: data.data.Message
      }

      ToastMessageError(message)
    }

    console.log('onMutateSuccess')
  }

  const onMutateError = (e: any) => {
    console.log('onMutateError', e)
  }

  const mutation = useCreateCustomerShipTo(onMutateSuccess, onMutateError)

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
        open={openModalAdd}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            Add Customer Ship To
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid className='mb-3'>
            <Controller
              name='customerShipToName'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Customer Ship To Name'
                  placeholder='Enter ...'
                  autoComplete='off'
                  {...(errors.customerShipToName && {
                    error: true,
                    helperText: errors.customerShipToName.message
                  })}
                />
              )}
            />
          </Grid>
          <Grid>
            <Controller
              name='customerShipToAlphabet'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Customer Ship To Alphabet'
                  placeholder='Enter ...'
                  autoComplete='off'
                  {...(errors.customerShipToAlphabet && {
                    error: true,
                    helperText: errors.customerShipToAlphabet.message
                  })}
                />
              )}
            />
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleSubmit(onSubmit, onError)()} variant='contained' color='success'>
            Save & Complete
          </Button>
          <Button onClick={handleClose} variant='tonal' color='secondary'>
            Close
          </Button>
        </DialogActions>
        <ConfirmModal
          show={confirmModal}
          onConfirmClick={handleAdd}
          onCloseClick={() => setConfirmModal(false)}
          isDelete={false}
        />
      </Dialog>
    </>
  )
}

export default CustomerShipToAddModal
