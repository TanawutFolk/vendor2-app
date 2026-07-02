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

import ConfirmModal from '@/components/ConfirmModal'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { z } from 'zod'

import {
  PREFIX_QUERY_KEY,
  useCreateAccountDepartmentCode
} from '@/_workspace/react-query/hooks/useAccountDepartmentCode'
import { zodResolver } from '@hookform/resolvers/zod'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

export type FormData = z.infer<typeof schema>

const schema = z.object({
  accountDepartmentCode: z
    .string({
      required_error: 'Account Department Code is required',
      invalid_type_error: 'Account Department Code must be a string'
    })
    .min(2, { message: 'Account Department Code must be at least 2 characters long' })
    .max(150, { message: 'Account Department Code must be at most 150 characters long' }),

  accountDepartmentName: z
    .string({
      required_error: 'Account Department Name is required',
      invalid_type_error: 'Account Department Name must be a string'
    })
    .regex(/[A-Z]/, { message: 'Account Department Name must contain at least one uppercase letter' }),

  note: z.string().nullable().optional()
})

interface AccountDepartmentCodeAddModalProps {
  openModalAdd: boolean
  setOpenModalAdd: Dispatch<SetStateAction<boolean>>
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}
const AccountDepartmentCodeAddModal = ({
  openModalAdd,
  setOpenModalAdd,
  setIsEnableFetching
}: AccountDepartmentCodeAddModalProps) => {
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
    // defaultValues
    defaultValues: {
      // customerOrderFromName: null,
      accountDepartmentName: '',
      accountDepartmentCode: ''
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
      ACCOUNT_DEPARTMENT_NAME: getValues('accountDepartmentName').trim(),
      // CUSTOMER_ORDER_FROM_NAME: getValues('customerOrderFromName'),
      ACCOUNT_DEPARTMENT_CODE: getValues('accountDepartmentCode').trim(),
      NOTE: getValues('note')?.trim() || '',
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
        title: 'Add Account Department Code'
      }

      ToastMessageSuccess(message)
      setIsEnableFetching(true)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      handleClose()
    } else {
      const message = {
        title: 'Add ',
        message: data.data.Message
      }

      ToastMessageError(message)
    }

    console.log('onMutateSuccess')
  }

  const onMutateError = (e: any) => {
    console.log('onMutateError', e)
  }

  const mutation = useCreateAccountDepartmentCode(onMutateSuccess, onMutateError)

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
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            Add Account Department Code
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid className='mb-3'>
            <Controller
              name='accountDepartmentName'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Account Department Name'
                  placeholder='Enter ...'
                  autoComplete='off'
                  {...(errors.accountDepartmentName && {
                    error: true,
                    helperText: errors.accountDepartmentName.message
                  })}
                />
              )}
            />
          </Grid>
          <Grid className='mb-3'>
            <Controller
              name='accountDepartmentCode'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Account Department Code'
                  placeholder='Enter ...'
                  autoComplete='off'
                  {...(errors.accountDepartmentCode && {
                    error: true,
                    helperText: errors.accountDepartmentCode.message
                  })}
                />
              )}
            />
          </Grid>
          <Grid>
            <Controller
              name='note'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Note (optional)'
                  placeholder='Enter ...'
                  autoComplete='off'
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

export default AccountDepartmentCodeAddModal
