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

import CustomTextField from '@/@core/components/mui/TextField'
// import AsyncSelectCustom from '@/customize/components/AsyncSelectCustom'

import ConfirmModal from '@/components/ConfirmModal'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
// import { CustomerInvoiceToInterface } from '@/_workspace/types/customer/CustomerInvoiceTo'
import StatusColumn from '@/libs/material-react-table/components/StatusOption'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { z } from 'zod'

import {
  PREFIX_QUERY_KEY,
  useUpdateAccountDepartmentCode
} from '@/_workspace/react-query/hooks/useAccountDepartmentCode'
import { DepartmentCodeInterface } from '@/_workspace/types/account/AccountDepartmentCode'
import SelectCustom from '@/components/react-select/SelectCustom'
import StatusOptionForEdit from '@/libs/react-select/option/StatusOptionForEdit'
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

  note: z.string().nullable().optional() // ฟิลด์ note สามารถใส่หรือไม่ใส่ก็ได้
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

interface AccountDepartmentCodeEditModalProps {
  openModalEdit: boolean
  setOpenModalEdit: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<DepartmentCodeInterface> | null
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const AccountDepartmentCodeEditModal = ({
  openModalEdit,
  setOpenModalEdit,
  rowSelected,
  setIsEnableFetching
}: AccountDepartmentCodeEditModalProps) => {
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
      accountDepartmentName: rowSelected?.original.ACCOUNT_DEPARTMENT_NAME,
      accountDepartmentCode: rowSelected?.original.ACCOUNT_DEPARTMENT_CODE,
      note: rowSelected?.original.NOTE,
      status: StatusColumn.find(dataItem => dataItem.value === Number(rowSelected?.original.inuseForSearch))
    }
  })
  // console.log('CCC', rowSelected?.original.INUSE)
  // const { control, handleSubmit, setValue } = reactHookFormMethods

  const { errors } = useFormState({
    control
  })

  const onSubmit = () => {
    setConfirmModal(true)
  }

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log(data)
  }

  // Hooks : react-query
  const queryClient = useQueryClient()

  const handleEditCustomerOrderFrom = () => {
    setConfirmModal(false)
    const dataItem = {
      ACCOUNT_DEPARTMENT_CODE_ID: rowSelected?.original.ACCOUNT_DEPARTMENT_CODE_ID,
      ACCOUNT_DEPARTMENT_NAME: getValues('accountDepartmentName').trim(),
      ACCOUNT_DEPARTMENT_CODE: getValues('accountDepartmentCode').trim(),
      NOTE: getValues('note').trim(),
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
        title: 'Update Account Department Code'
      }
      ToastMessageSuccess(message)
      setIsEnableFetching(true)

      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      // reset()
      handleClose()
    } else {
      const message = {
        title: 'Update Account Department Code',
        message: data.data.Message
      }

      ToastMessageError(message)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      // reset()
    }

    console.log('onMutateSuccess')
  }

  const onMutateError = (e: any) => {
    console.log('onMutateError', e)
  }

  const mutation = useUpdateAccountDepartmentCode(onMutateSuccess, onMutateError)

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
            Edit Account Department Code
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
          <Grid className='mb-3'>
            <Controller
              name='note'
              control={control}
              // render={({ field }) => (
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  // type='text'
                  label='Note (optional)'
                  placeholder='Enter ...'
                  autoComplete='off'
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

                // <CustomTextField
                //   {...field}
                //   options={StatusOption}
                //   fullWidth
                //   label='Status'
                //   placeholder=''
                //   autoComplete='off'
                // />
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

export default AccountDepartmentCodeEditModal
