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
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, useForm, useFormState } from 'react-hook-form'

// Components Imports
import { useQueryClient } from '@tanstack/react-query'

import { maxLength, minLength, nonEmpty, number, object, pipe, regex, string } from 'valibot'

import type { Input } from 'valibot'

import { valibotResolver } from '@hookform/resolvers/valibot'

import DialogCloseButton from '@components/dialogs/DialogCloseButton'

import { PREFIX_QUERY_KEY, useUpdate } from '@/_workspace/react-query/hooks/useOrderType'

import {
  maxLengthFieldMessage,
  minLengthFieldMessage,
  requiredFieldMessage,
  typeFieldMessage
} from '@/libs/valibot/error-message/errorMessage'

import { getUserData } from '@/utils/user-profile/userLoginProfile'

import { MRT_Row } from 'material-react-table'

import { OrderTypeI } from '@/_workspace/types/production-control/OrderType'
import ConfirmModal from '@/components/ConfirmModal'
import CustomTextField from '@/components/mui/TextField'
import SelectCustom from '@/components/react-select/SelectCustom'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import StatusOption from '@/libs/react-select/option/StatusOption'
import StatusOptionForEdit from '@/libs/react-select/option/StatusOptionForEdit'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

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
  ),
  status: object(
    {
      value: number(),
      label: string()
    },
    requiredFieldMessage({ fieldName: 'Status' })
  )
})

interface OrderTypeModalProps {
  openEditModal: boolean
  setOpenModalEdit: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<OrderTypeI> | null
}
interface Props {
  isEnableFetching: boolean
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const OrderTypeEditModal = ({
  openEditModal,
  setOpenModalEdit,
  rowSelected,
  isEnableFetching,
  setIsEnableFetching
}: Props & OrderTypeModalProps) => {
  // useState

  const [confirmModal, setConfirmModal] = useState(false)

  const handleClickOpen = () => setOpenModalEdit(true)
  const handleClose = () => {
    setOpenModalEdit(false)
    //reset()
  }

  // Hooks : react-hook-form

  const { control, getValues, handleSubmit } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      ORDER_TYPE_NAME: rowSelected?.original.ORDER_TYPE_NAME,
      ORDER_TYPE_ALPHABET: rowSelected?.original.ORDER_TYPE_ALPHABET,
      status: StatusOption.find(item => item.value == rowSelected?.original?.inuseForSearch)
    }
  })
  const { errors, isDirty } = useFormState({
    control
  })

  const onSubmit: SubmitHandler<FormData> = () => {
    if (isDirty === false) {
      const message = {
        title: 'Update Order Type',
        message: 'ข้อมูลไม่มีการเปลี่ยนแปลง Data is not changed'
      }
      ToastMessageError(message)
      return
    }
    setConfirmModal(true)
  }

  // Functions
  const handleEditOrderType = () => {
    setConfirmModal(false)

    const dataItem = {
      ORDER_TYPE_ID: rowSelected?.original?.ORDER_TYPE_ID,
      ORDER_TYPE_NAME: getValues('ORDER_TYPE_NAME').trim(),
      ORDER_TYPE_ALPHABET: getValues('ORDER_TYPE_ALPHABET').trim(),
      INUSE: getValues('status')?.value,
      CREATE_BY: getUserData()?.EMPLOYEE_CODE,
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE
    }

    //console.log('DATA-ITEM', dataItem)
    mutation.mutate(dataItem)
  }

  const onMutateSuccess = (data: any) => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Update Order Type'
      }
      setIsEnableFetching(true)
      ToastMessageSuccess(message)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })

      handleClose()
    } else {
      const message = {
        title: 'Update Order Type',
        message: data.data.Message.startsWith('1062') ? 'Duplicate Order Type' : data.data.Message
      }
      ToastMessageError(message)
    }
  }

  const onMutateError = () => {
    console.log('onMutateError')
  }

  const mutation = useUpdate(onMutateSuccess, onMutateError)

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
        open={openEditModal}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
        PaperProps={{ sx: { top: 30, m: 0 } }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            Edit Order Type
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid className='mb-3'>
            <Controller
              control={control}
              name='ORDER_TYPE_NAME'
              render={({ field: { ref, ...fieldProps } }) => (
                <CustomTextField
                  label='Order Type Name'
                  {...fieldProps}
                  innerRef={ref}
                  fullWidth
                  placeholder='Enter ...'
                  autoComplete='off'
                  {...(errors?.ORDER_TYPE_NAME && {
                    error: true,
                    helperText: errors?.ORDER_TYPE_NAME?.message
                  })}
                />
              )}
            />
          </Grid>
          <Grid className='mb-3'>
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
          <Grid>
            <Controller
              name='status'
              control={control}
              render={({ field: { ...fieldProps } }) => (
                <SelectCustom
                  {...fieldProps}
                  options={StatusOptionForEdit}
                  isClearable
                  label='Status'
                  classNamePrefix='select'
                  isDisabled={rowSelected?.original?.inuseForSearch == 1 ? true : false}
                  {...(errors.status && {
                    error: true,
                    helperText: errors.status.message
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
          onConfirmClick={handleEditOrderType}
          onCloseClick={() => setConfirmModal(false)}
          isDelete={false}
        />
      </Dialog>
    </>
  )
}

export default OrderTypeEditModal
