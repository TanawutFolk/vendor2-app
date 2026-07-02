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

import { valibotResolver } from '@hookform/resolvers/valibot'
import { Controller, SubmitErrorHandler, useForm, useFormState } from 'react-hook-form'

import { maxLengthFieldMessage, typeFieldMessage } from '@/libs/valibot/error-message/errorMessage'
import { maxLength, nonEmpty, object, pipe, string, type Input } from 'valibot'

import { getUserData } from '@/utils/user-profile/userLoginProfile'

import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'

import { PREFIX_QUERY_KEY, useCreate } from '@/_workspace/react-query/hooks/useShapeData'

import ConfirmModal from '@/components/ConfirmModal'
import CustomTextField from '@/components/mui/TextField'

// Dialog
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

// Schema with Valibot
const schema = object({
  ITEM_PROPERTY_SHAPE_NAME: pipe(
    string(typeFieldMessage({ fieldName: 'Shape Name', typeName: 'String' })),
    nonEmpty('Shape Name is required'),
    maxLength(100, maxLengthFieldMessage({ fieldName: 'Shape Name', maxLength: 100 }))
  )
})

type FormData = Input<typeof schema>

interface AddModalProps {
  openModalAdd: boolean
  setOpenModalAdd: Dispatch<SetStateAction<boolean>>
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const ShapeAddModal = ({ openModalAdd, setOpenModalAdd, setIsEnableFetching }: AddModalProps) => {
  // States : Dialog
  const [confirmModal, setConfirmModal] = useState(false)

  const queryClient = useQueryClient()

  // Hooks : react-hook-form
  const { control, getValues, handleSubmit } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      ITEM_PROPERTY_SHAPE_NAME: ''
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
      ITEM_PROPERTY_SHAPE_NAME: getValues('ITEM_PROPERTY_SHAPE_NAME').trim(),
      CREATE_BY: getUserData()?.EMPLOYEE_CODE
    }

    mutation.mutate(dataItem)
  }

  const onMutateSuccess = (data: any) => {
    if (data.data && data.data.Status == true) {
      if (data.data.ResultOnDb.affectedRows === 0) {
        const message = {
          title: 'Add Shape',
          message: 'ข้อมูลที่คุณต้องการบันทึก มีอยู่แล้ว Data already exists'
        }

        ToastMessageError(message)

        return
      }

      const message = {
        message: data.data.Message,
        title: 'Add Shape'
      }

      ToastMessageSuccess(message)
      setIsEnableFetching(true)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      //reset()
      handleClose()
    } else {
      const message = {
        title: 'Add Shape',
        message: data.data.Message
      }

      ToastMessageError(message)
    }
  }

  const onMutateError = (err: any) => {
    console.log(err)
    console.log('onMutateError')

    const message = {
      title: 'Add Shape',
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
            Add Shape
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={4}>
            <Grid item xs={12} md={12} lg={12}>
              <Controller
                name='ITEM_PROPERTY_SHAPE_NAME'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Shape Name'
                    placeholder='Enter...'
                    autoComplete='off'
                    {...(errors.ITEM_PROPERTY_SHAPE_NAME && {
                      error: true,
                      helperText: errors.ITEM_PROPERTY_SHAPE_NAME.message
                    })}
                  />
                )}
              />
            </Grid>
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

export default ShapeAddModal
