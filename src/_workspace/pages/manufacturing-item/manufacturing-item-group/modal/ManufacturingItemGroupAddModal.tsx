// React Imports
import type { Dispatch, ReactElement, Ref, SetStateAction } from 'react'
import { forwardRef, useState } from 'react'

// MUI Imports
import type { SlideProps } from '@mui/material'
import { Grid, Slide } from '@mui/material'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'

// Third-party Imports
import {
  maxLengthFieldMessage,
  minLengthFieldMessage,
  typeFieldMessage
} from '@/libs/valibot/error-message/errorMessage'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useQueryClient } from '@tanstack/react-query'
import type { Input } from 'valibot'
import { maxLength, minLength, nonEmpty, object, pipe, string } from 'valibot'

// Components Imports
import ConfirmModal from '@components/ConfirmModal'
import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import CustomTextField from '@components/mui/TextField'
import { ToastMessageError, ToastMessageSuccess } from '@components/ToastMessage'

// React-hook-form Imports
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, useForm, useFormState } from 'react-hook-form'

// React Query Imports
import { PREFIX_QUERY_KEY, useCreate } from '@/_workspace/react-query/hooks/useManufacturingItemGroupData'

// Utils
import { getUserData } from '@/utils/user-profile/userLoginProfile'

// Fetch data with react-select Imports

// Dialog
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

// Schema with Valibot
type FormData = Input<typeof schema>

const schema = object({
  ITEM_GROUP_NAME: pipe(
    string(typeFieldMessage({ fieldName: 'Manufacturing Item Group Name', typeName: 'String' })),
    nonEmpty('Manufacturing Item Group Name is required'),
    minLength(2, minLengthFieldMessage({ fieldName: 'Order Type Name', minLength: 2 })),
    maxLength(50, maxLengthFieldMessage({ fieldName: 'Order Type Name', maxLength: 50 }))
  )
})

// Props
interface ManufacturingItemGroupAddModalProps {
  openAddModal: boolean
  setOpenModalAdd: Dispatch<SetStateAction<boolean>>
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const ManufacturingItemGroupAddModal = ({
  openAddModal,
  setOpenModalAdd,
  setIsEnableFetching
}: ManufacturingItemGroupAddModalProps) => {
  // State

  // States : Dialog
  const [confirmModal, setConfirmModal] = useState(false)

  // Hooks : react-hook-form
  const { control, handleSubmit, getValues } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      ITEM_GROUP_NAME: ''
    }
  })

  const { errors } = useFormState({
    control
  })

  const onSubmit: SubmitHandler<FormData> = () => {
    setConfirmModal(true)
  }

  // Functions

  const handleClose = () => {
    setOpenModalAdd(false)
    // reset()
  }

  const handleAddOrderType = () => {
    setConfirmModal(false)

    const dataItem = {
      ITEM_GROUP_NAME: getValues('ITEM_GROUP_NAME'),
      CREATE_BY: getUserData()?.EMPLOYEE_CODE
    }

    mutation.mutate(dataItem)
  }

  const onMutateSuccess = data => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Add Manufacturing Item Group'
      }

      ToastMessageSuccess(message)
      setIsEnableFetching(true)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      //reset()
      handleClose()
    } else {
      const message = {
        title: 'Add Manufacturing Item Group',
        message: data.data.Message.startsWith('1062') ? 'Duplicate Manufacturing Item Group' : data.data.Message
      }

      ToastMessageError(message)
    }
  }

  const onMutateError = () => {
    console.log('onMutateError')
  }

  const mutation = useCreate(onMutateSuccess, onMutateError)

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log(data)
  }

  // Hooks : react-query
  const queryClient = useQueryClient()

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
        open={openAddModal}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
        PaperProps={{ sx: { top: 30, m: 0 } }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            Add Manufacturing Item Group
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid>
            <Controller
              name='ITEM_GROUP_NAME'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Manufacturing Item Group Name'
                  placeholder='Enter ...'
                  autoComplete='off'
                  {...(errors.ITEM_GROUP_NAME && {
                    error: true,
                    helperText: errors.ITEM_GROUP_NAME.message
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
          onConfirmClick={handleAddOrderType}
          onCloseClick={() => setConfirmModal(false)}
          isDelete={false}
        />
      </Dialog>
    </>
  )
}

export default ManufacturingItemGroupAddModal
