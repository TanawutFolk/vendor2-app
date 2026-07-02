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

// import type { ProductCategoryOption } from '@/libs/react-select/AsyncPromiseLoadOptions/fetchProductCategory'
// import { fetchProductCategoryByLikeProductCategoryNameAndInuse } from '@/libs/react-select/AsyncPromiseLoadOptions/fetchProductCategory'
import CustomTextField from '@/@core/components/mui/TextField'
import { PREFIX_QUERY_KEY, useCreateCustomerOrderFrom } from '@/_workspace/react-query/hooks/useCustomerOrderFromData'
// import AsyncSelectCustom from '@/customize/components/AsyncSelectCustom'
// import {
//   maxLengthFieldMessage,
//   minLengthFieldMessage,
//   requiredFieldMessage,
//   typeFieldMessage
// } from '@/libs/valibot/error-message/errorMessage'
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
  customerOrderFromName: z.preprocess(
    val => (typeof val === 'string' ? val.trim() : val),
    z
      .string({
        required_error: 'Customer Order From Name is required',
        invalid_type_error: 'Customer Order From Name must be a string'
      })
      .min(3, { message: 'Customer Order From Name must be at least 3 characters long' })
      .max(150, { message: 'Customer Order From Name must be at most 150 characters long' })
  ),

  customerOrderFromAlphabet: z.preprocess(
    val => (typeof val === 'string' ? val.trim() : val),
    z
      .string({
        required_error: 'Customer Order From Alphabet is required',
        invalid_type_error: 'Customer Order From Alphabet must be a string'
      })
      .regex(/[A-Z]/, { message: 'Customer Order From Alphabet must contain at least one uppercase letter' })
  )
})

interface CustomerOrderFromAddModalProps {
  openModalAdd: boolean
  setOpenModalAdd: Dispatch<SetStateAction<boolean>>
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}
const CustomerOrderFromAddModal = ({
  openModalAdd,
  setOpenModalAdd,
  setIsEnableFetching
}: CustomerOrderFromAddModalProps) => {
  // useState

  // States : Modal
  // const [openModalAdd, setOpenModalAdd] = useState<boolean>(false)
  const [confirmModal, setConfirmModal] = useState(false)

  const handleClickOpen = () => setOpenModalAdd(true)

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
      customerOrderFromName: '',
      customerOrderFromAlphabet: ''
    }
  })

  // const { control, handleSubmit, setValue } = reactHookFormMethods

  const { errors } = useFormState({
    control
  })

  // const onSubmit: SubmitHandler<FormData> = data => {
  //   handleAdd(data)

  //   setConfirmModal(true)
  //   // queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
  //   // handleClose()
  // }
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
      CUSTOMER_ORDER_FROM_NAME: getValues('customerOrderFromName').trim(),
      // CUSTOMER_ORDER_FROM_NAME: getValues('customerOrderFromName'),
      CUSTOMER_ORDER_FROM_ALPHABET: getValues('customerOrderFromAlphabet').trim(),
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
        title: 'Add Customer Order From'
      }

      ToastMessageSuccess(message)
      setIsEnableFetching(true)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      //reset()
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

  const mutation = useCreateCustomerOrderFrom(onMutateSuccess, onMutateError)

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
            Add Customer Order From
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          {/* <Grid className='mb-5'>
            <Controller
              name='productCategoryName'
              control={control}
              render={({ field: { ...fieldProps } }) => (
                <>
                  <AsyncSelectCustom<typeof fieldProps.value>
                    label='Product Category'
                    inputId={fieldProps.name}
                    {...fieldProps}
                    isClearable
                    cacheOptions
                    defaultOptions
                    loadOptions={inputValue => {
                      return fetchProductCategoryByLikeProductCategoryNameAndInuse(inputValue, '1')
                    }}
                    getOptionLabel={data => data.PRODUCT_CATEGORY_NAME}
                    getOptionValue={data => data.PRODUCT_CATEGORY_ID.toString()}
                    classNamePrefix='select'
                    placeholder='Select Product Category ...'
                    {...(errors.productCategoryName && { error: true, helperText: errors.productCategoryName.message })}
                  />
                </>
              )}
            />
          </Grid> */}
          {/* <Grid className='mb-5'>
            <Controller
              name='productCategoryCode'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  disabled
                  label='Product Category Code'
                  value='PD-C-XXXX'
                  autoComplete='off'
                  {...(errors.productCategoryCode && { error: true, helperText: errors.productCategoryCode.message })}
                />
              )}
            />
          </Grid> */}
          <Grid className='mb-3'>
            <Controller
              name='customerOrderFromName'
              control={control}
              // render={({ field }) => (
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  // type='text'
                  label='Customer Order From Name'
                  placeholder='Enter ...'
                  autoComplete='off'
                  {...(errors.customerOrderFromName && {
                    error: true,
                    helperText: errors.customerOrderFromName.message
                  })}
                />
              )}
            />
          </Grid>
          <Grid>
            <Controller
              name='customerOrderFromAlphabet'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Customer Order From Alphabet'
                  placeholder='Enter ...'
                  autoComplete='off'
                  {...(errors.customerOrderFromAlphabet && {
                    error: true,
                    helperText: errors.customerOrderFromAlphabet.message
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

export default CustomerOrderFromAddModal
