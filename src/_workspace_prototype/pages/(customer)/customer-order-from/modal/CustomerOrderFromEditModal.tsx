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

import type { MRT_Row } from 'material-react-table'

import DialogCloseButton from '@components/dialogs/DialogCloseButton'

import { PREFIX_QUERY_KEY, useUpdateCustomerOrderFrom } from '@/_workspace/react-query/hooks/useCustomerOrderFromData'
import CustomTextField from '@/components/mui/TextField'
// import AsyncSelectCustom from '@/customize/components/AsyncSelectCustom'

import { CustomerOrderFromInterface } from '@/_workspace/types/customer/CustomerOrderFrom'
import ConfirmModal from '@/components/ConfirmModal'
import SelectCustom from '@/components/react-select/SelectCustom'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import StatusColumn from '@/libs/material-react-table/components/StatusOption'
import StatusOptionForEdit from '@/libs/react-select/option/StatusOptionForEdit'
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
  customerOrderFromName: z
    .string({
      required_error: 'Customer Order From Name is required',
      invalid_type_error: 'Customer Order From Name must be a string'
    })
    .min(3, { message: 'Customer Order From Name must be at least 3 characters long' })
    .max(150, { message: 'Customer Order From Name must be at most 150 characters long' }),

  customerOrderFromAlphabet: z
    .string({
      required_error: 'Customer Order From Alphabet is required',
      invalid_type_error: 'Customer Order From Alphabet must be a string'
    })
    .regex(/[A-Z]/, { message: 'Customer Order From Alphabet must contain at least one uppercase letter' })
})
// productMainAlphabet: string([
//   // minLength(1, 'This field is required'),
//   // minLength(3, 'Last Name must be at least 3 characters long')
// ]),
// status: string([
//   // minLength(1, 'This field is required')
//   // , minLength(3, 'Last Name must be at least 3 characters long')
// ])
//})

// const defaultValues: FormData = {
//   productCategory: null,
//   productMainName: '',
//   productMainCode: ''
// }

interface CustomerOrderFromEditModalProps {
  openModalEdit: boolean
  setOpenModalEdit: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<CustomerOrderFromInterface> | null
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const CustomerOrderFromEditModal = ({
  openModalEdit,
  setOpenModalEdit,
  rowSelected,
  setIsEnableFetching
}: CustomerOrderFromEditModalProps) => {
  // useState

  // States : Modal
  const [confirmModal, setConfirmModal] = useState(false)

  const handleClickOpen = () => setOpenModalEdit(true)
  const handleClose = () => {
    setOpenModalEdit(false)
    // reset()
  }

  // Hooks : react-hook-form
  const { control, handleSubmit, setValue, reset, getValues } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      customerOrderFromName: rowSelected?.original.CUSTOMER_ORDER_FROM_NAME,
      customerOrderFromAlphabet: rowSelected?.original.CUSTOMER_ORDER_FROM_ALPHABET,
      status: StatusColumn.find(dataItem => dataItem.value === Number(rowSelected?.original.inuseForSearch))
    }
  })

  // const { control, handleSubmit, setValue } = reactHookFormMethods

  const { errors } = useFormState({
    control
  })

  const onSubmit = () => {
    console.log('ok')
    setConfirmModal(true)
  }

  // const onSubmit = () => {
  //   setConfirmModal(true)
  //   queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
  //   handleClose()
  // }

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log(data)
  }

  // Hooks : react-query
  const queryClient = useQueryClient()

  const handleEditCustomerOrderFrom = () => {
    setConfirmModal(false)
    const dataItem = {
      CUSTOMER_ORDER_FROM_ID: rowSelected?.original.CUSTOMER_ORDER_FROM_ID,
      CUSTOMER_ORDER_FROM_NAME: getValues('customerOrderFromName').trim(),
      CUSTOMER_ORDER_FROM_ALPHABET: getValues('customerOrderFromAlphabet').trim(),
      // INUSE: rowSelected?.original.INUSE,
      INUSE: getValues('status').value,
      CREATE_BY: getUserData()?.EMPLOYEE_CODE,
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE
    }

    mutation.mutate(dataItem)
  }

  const onMutateSuccess = data => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Update Customer Order From'
      }
      ToastMessageSuccess(message)
      setIsEnableFetching(true)

      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      // reset()
      handleClose()
    } else {
      const message = {
        title: 'Update Customer Order From',
        message: data.data.Message
      }

      ToastMessageError(message)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      // reset()
      // handleClose()
    }

    console.log('onMutateSuccess')
  }

  const onMutateError = (e: any) => {
    console.log('onMutateError', e)
  }

  const mutation = useUpdateCustomerOrderFrom(onMutateSuccess, onMutateError)

  // useEffectOnce(() => {
  //   alert('fale')
  // }, [])

  return (
    <>
      {/* <Button variant='contained' startIcon={<AddIcon />} onClick={handleClickOpen}>
        Edit Data
      </Button> */}
      <Dialog
        maxWidth='sm'
        fullWidth={true}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose()
          }
        }}
        TransitionComponent={Transition}
        open={openModalEdit}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            Edit Customer Order From
            {/* {rowSelected?.original.CUSTOMER_ORDER_FROM_ID} */}
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          {/* <Grid className='mb-5'>
            <Controller
              name='productCategory'
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
                    {...(errors.productCategory && { error: true, helperText: errors.productCategory.message })}
                  />
                </>
              )}
            />
          </Grid> */}
          {/* <Grid className='mb-5'>
            <Controller
              name='productMainCode'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  disabled
                  label='Product Main Code'
                  value='PD-M-XXXX'
                  autoComplete='off'
                  {...(errors.productMainCode && { error: true, helperText: errors.productMainCode.message })}
                />
              )}
            />
          </Grid> */}
          <Grid className='mb-3'>
            <Controller
              name='customerOrderFromName'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
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
          <Grid className='mb-3'>
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
                  isDisabled
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
          onConfirmClick={handleEditCustomerOrderFrom}
          onCloseClick={() => setConfirmModal(false)}
          isDelete={false}
        />
      </Dialog>
      {/* <DevTool control={control} /> set up the dev tool */}
    </>
  )
}

export default CustomerOrderFromEditModal
