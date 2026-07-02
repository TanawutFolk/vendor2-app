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
import { maxLength, minLength, nonEmpty, object, pipe, regex, string } from 'valibot'

// Components Imports
import ConfirmModal from '@components/ConfirmModal'
import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import CustomTextField from '@components/mui/TextField'
import { ToastMessageError, ToastMessageSuccess } from '@components/ToastMessage'

// React-hook-form Imports
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, useForm, useFormState } from 'react-hook-form'

// React Query Imports
import { PREFIX_QUERY_KEY, useCreate } from '@/_workspace/react-query/hooks/useOrderType'

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
  ORDER_TYPE_NAME: pipe(
    string(typeFieldMessage({ fieldName: 'Order Type Name', typeName: 'String' })),
    nonEmpty('Order Type Name is required'),
    minLength(2, minLengthFieldMessage({ fieldName: 'Order Type Name', minLength: 2 })),
    maxLength(50, maxLengthFieldMessage({ fieldName: 'Order Type Name', maxLength: 50 }))
  ),
  ORDER_TYPE_ALPHABET: pipe(
    string(),
    nonEmpty('Order Type Alphabet is required'),
    minLength(1, minLengthFieldMessage({ fieldName: 'Order Type Alphabet', minLength: 1 })),
    maxLength(1, maxLengthFieldMessage({ fieldName: 'Order Type Alphabet', maxLength: 1 })),
    regex(/^[A-Z]$/, 'Order Type Alphabet must be a single uppercase letter without spaces')
  )
})

// Props
interface OrderTypeAddModalProps {
  openAddModal: boolean
  setOpenModalAdd: Dispatch<SetStateAction<boolean>>
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const OrderTypeAddModal = ({ openAddModal, setOpenModalAdd, setIsEnableFetching }: OrderTypeAddModalProps) => {
  // State

  // States : Dialog
  const [confirmModal, setConfirmModal] = useState(false)

  // Hooks : react-hook-form
  const { control, handleSubmit, setValue, reset, getValues, watch } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      // @ts-ignore
      ORDER_TYPE_NAME: '',
      // @ts-ignore
      ORDER_TYPE_ALPHABET: ''
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
      ORDER_TYPE_NAME: getValues('ORDER_TYPE_NAME').trim(),
      ORDER_TYPE_ALPHABET: getValues('ORDER_TYPE_ALPHABET').trim(),
      CREATE_BY: getUserData()?.EMPLOYEE_CODE
    }

    //console.log('DATA-ITEM', dataItem)
    mutation.mutate(dataItem)
    //queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
  }

  const onMutateSuccess = data => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Add Order Type'
      }

      ToastMessageSuccess(message)
      setIsEnableFetching(true)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      //reset()
      handleClose()
    } else {
      const message = {
        title: 'Add Order Type',
        message: data.data.Message.startsWith('1062') ? 'Duplicate Order Type' : data.data.Message
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

  // useEffect(() => {
  //   console.log(watch('productMain.PRODUCT_MAIN_ID'))
  // }, [watch('productMain')?.PRODUCT_MAIN_ID])

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
            Add Order Type
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid className='mb-3'>
            <Controller
              name='ORDER_TYPE_NAME'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Order Type Name'
                  placeholder='Enter ...'
                  autoComplete='off'
                  {...(errors.ORDER_TYPE_NAME && {
                    error: true,
                    helperText: errors.ORDER_TYPE_NAME.message
                  })}
                />
              )}
            />
          </Grid>
          <Grid>
            <Controller
              name='ORDER_TYPE_ALPHABET'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Order Type Alphabet'
                  placeholder='Enter ...'
                  autoComplete='off'
                  {...(errors.ORDER_TYPE_ALPHABET && {
                    error: true,
                    helperText: errors.ORDER_TYPE_ALPHABET.message
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

export default OrderTypeAddModal
