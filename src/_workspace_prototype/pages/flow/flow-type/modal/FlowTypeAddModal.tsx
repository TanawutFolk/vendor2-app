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
import { valibotResolver } from '@hookform/resolvers/valibot'

import { maxLength, minLength, nonEmpty, object, pipe, regex, string, type Input } from 'valibot'
import {
  maxLengthFieldMessage,
  minLengthFieldMessage,
  requiredFieldMessage,
  typeFieldMessage
} from '@/libs/valibot/error-message/errorMessage'

import { getUserData } from '@/utils/user-profile/userLoginProfile'

import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'

import { PREFIX_QUERY_KEY, useCreate } from '@/_workspace/react-query/hooks/useFlowType'

import CustomTextField from '@/components/mui/TextField'
import ConfirmModal from '@/components/ConfirmModal'

// Dialog
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

// Schema with Valibot
const schema = object({
  FLOW_TYPE_NAME: pipe(
    string(typeFieldMessage({ fieldName: 'Flow Type Name', typeName: 'String' })),
    nonEmpty('Flow Type Name is required'),
    minLength(3, minLengthFieldMessage({ fieldName: 'Flow Type Name', minLength: 3 })),
    maxLength(50, maxLengthFieldMessage({ fieldName: 'Flow Type Name', maxLength: 50 }))
  ),
  FLOW_TYPE_ALPHABET: pipe(
    string(),
    nonEmpty('Flow Type Alphabet is required'),
    maxLength(1, maxLengthFieldMessage({ fieldName: 'Flow Type Name', maxLength: 1 })),
    regex(/[A-Z]/, 'Flow Type Alphabet must contain a uppercase letter')
  )
})

type FormData = Input<typeof schema>

interface AddModalProps {
  openModalAdd: boolean
  setOpenModalAdd: Dispatch<SetStateAction<boolean>>
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const FlowTypeAddModal = ({ openModalAdd, setOpenModalAdd, setIsEnableFetching }: AddModalProps) => {
  // States : Dialog
  const [confirmModal, setConfirmModal] = useState(false)

  const queryClient = useQueryClient()

  // Hooks : react-hook-form
  const { control, getValues, handleSubmit } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      FLOW_TYPE_NAME: '',
      FLOW_TYPE_ALPHABET: ''
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

  const handleAdd = () => {
    setConfirmModal(false)

    const dataItem = {
      FLOW_TYPE_NAME: getValues('FLOW_TYPE_NAME'),
      FLOW_TYPE_ALPHABET: getValues('FLOW_TYPE_ALPHABET'),
      CREATE_BY: getUserData()?.EMPLOYEE_CODE
    }

    mutation.mutate(dataItem)
  }

  const onMutateSuccess = (data: any) => {
    if (data.data && data.data.Status == true) {
      if (data.data.ResultOnDb.affectedRows === 0) {
        const message = {
          title: 'Add Flow Type',
          message: 'ข้อมูลที่คุณต้องการบันทึก มีอยู่แล้ว Data already exists'
        }

        ToastMessageError(message)

        return
      }

      const message = {
        message: data.data.Message,
        title: 'Add Flow Type'
      }

      ToastMessageSuccess(message)
      setIsEnableFetching(true)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      //reset()
      handleClose()
    } else {
      const message = {
        title: 'Add Flow Type',
        message: 'ข้อมูลที่คุณต้องการบันทึก มีอยู่แล้ว Data already exists'
      }

      ToastMessageError(message)
    }
  }

  const onMutateError = (err: any) => {
    console.log(err)
    console.log('onMutateError')

    const message = {
      title: 'Add Flow Type',
      message: 'ข้อมูลที่คุณต้องการบันทึก มีอยู่แล้ว Data already exists'
    }

    ToastMessageError(message)
  }

  const mutation = useCreate(onMutateSuccess, onMutateError)

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
            Add Flow Type
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid className='mb-5'>
            <Controller
              name='FLOW_TYPE_NAME'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Flow Type Name'
                  placeholder='Enter Flow Type Name'
                  autoComplete='off'
                  {...(errors.FLOW_TYPE_NAME && {
                    error: true,
                    helperText: errors.FLOW_TYPE_NAME.message
                  })}
                />
              )}
            />
          </Grid>
          <Grid className='mb-5'>
            <Controller
              name='FLOW_TYPE_ALPHABET'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Flow Type Alphabet'
                  placeholder='Enter Flow Type Alphabet'
                  autoComplete='off'
                  {...(errors.FLOW_TYPE_ALPHABET && {
                    error: true,
                    helperText: errors.FLOW_TYPE_ALPHABET.message
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

export default FlowTypeAddModal
