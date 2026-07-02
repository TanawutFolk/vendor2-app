import { Dispatch, forwardRef, ReactElement, Ref, SetStateAction, useState } from 'react'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Slide,
  SlideProps,
  Typography
} from '@mui/material'

import { useQueryClient } from '@tanstack/react-query'

import { Controller, SubmitErrorHandler, useForm, useFormState } from 'react-hook-form'

import { getUserData } from '@/utils/user-profile/userLoginProfile'

import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'

import { PREFIX_QUERY_KEY, useCreateUnitOfMeasurement } from '@/_workspace/react-query/hooks/useUnitOfMeasurement'

import ConfirmModal from '@/components/ConfirmModal'
import CustomTextField from '@/components/mui/TextField'
import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
// Dialog
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

export type FormData = z.infer<typeof schema>

// Schema with Valibot
const schema = z.object({
  unitOfMeasurementName: z
    .string({
      required_error: 'Unit of Measurement Name is required',
      invalid_type_error: 'Unit of Measurement Name must be a string'
    })
    .min(3, { message: 'Unit of Measurement Name must be at least 3 characters long' })
    .max(50, { message: 'Unit of Measurement Name must be at most 50 characters long' })
    .refine(val => val.trim() !== '', { message: 'Unit of Measurement Name is required' }),

  symbol: z
    .string({
      required_error: 'Unit Of Measurement Code is required',
      invalid_type_error: 'Unit Of Measurement Code must be a string'
    })
    .max(8, { message: 'Unit Of Measurement Code must be at most 8 characters long' })
    .refine(val => val.trim() !== '', { message: 'Unit Of Measurement Code is required' })
})

// Props
interface UnitOfMeasurementAddModalProps {
  openModalAdd: boolean
  setOpenModalAdd: Dispatch<SetStateAction<boolean>>
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const UnitOfMeasurementAddModal = ({
  openModalAdd,
  setOpenModalAdd,
  setIsEnableFetching
}: UnitOfMeasurementAddModalProps) => {
  // States : Dialog
  const [confirmModal, setConfirmModal] = useState(false)

  const queryClient = useQueryClient()

  // Hooks : react-hook-form
  const { control, getValues, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      unitOfMeasurementName: '',
      symbol: ''
    }
  })

  const { errors } = useFormState({
    control
  })

  const onSubmit = () => {
    setConfirmModal(true)
  }

  // Functions

  const handleClose = () => {
    setOpenModalAdd(false)
    // reset()
  }

  const handleAddUnitOfMeasurement = () => {
    setConfirmModal(false)

    const dataItem = {
      UNIT_OF_MEASUREMENT_NAME: getValues('unitOfMeasurementName').trim(),
      SYMBOL: getValues('symbol').trim(),
      DESCRIPTION: '',
      CREATE_BY: getUserData()?.EMPLOYEE_CODE,
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE
    }

    mutation.mutate(dataItem)
  }

  const onMutateSuccess = (data: any) => {
    if (data.data && data.data.Status == true) {
      if (data.data.ResultOnDb.affectedRows === 0) {
        const message = {
          title: 'Add Unit Of Measurement',
          message: 'ข้อมูลที่คุณต้องการบันทึก มีอยู่แล้ว Data already exists'
        }

        ToastMessageError(message)

        return
      }

      const message = {
        message: data.data.Message,
        title: 'Add Unit Of Measurement'
      }

      ToastMessageSuccess(message)
      setIsEnableFetching(true)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      //reset()
      handleClose()
    } else {
      const message = {
        title: 'Add Unit Of Measurement',
        message: data.data.Message
      }

      ToastMessageError(message)
    }
  }

  const onMutateError = () => {
    console.log('onMutateError')

    const message = {
      title: 'Add Unit Of Measurement',
      message: 'ข้อมูลที่คุณต้องการบันทึก มีอยู่แล้ว Data already exists'
    }

    ToastMessageError(message)
  }

  const mutation = useCreateUnitOfMeasurement(onMutateSuccess, onMutateError)

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log(data)
  }

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
        PaperProps={{ sx: { top: 30, m: 0 } }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            Add Unit of Measurement
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid className='mb-3'>
            <Controller
              name='unitOfMeasurementName'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Unit of Measurement Name'
                  placeholder='Enter ...'
                  autoComplete='off'
                  {...(errors.unitOfMeasurementName && {
                    error: true,
                    helperText: errors.unitOfMeasurementName.message
                  })}
                />
              )}
            />
          </Grid>
          <Grid>
            <Controller
              name='symbol'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Unit Of Measurement Code'
                  placeholder='Enter ...'
                  autoComplete='off'
                  {...(errors.symbol && {
                    error: true,
                    helperText: errors.symbol.message
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
          onConfirmClick={handleAddUnitOfMeasurement}
          onCloseClick={() => setConfirmModal(false)}
          isDelete={false}
        />
      </Dialog>
    </>
  )
}

export default UnitOfMeasurementAddModal
