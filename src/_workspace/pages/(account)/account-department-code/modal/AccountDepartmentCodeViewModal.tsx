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

import { MRT_Row } from 'material-react-table'

import { useQueryClient } from '@tanstack/react-query'

import { Controller, SubmitErrorHandler, useForm, useFormState } from 'react-hook-form'

import { object, type Input } from 'valibot'

import { getUserData } from '@/utils/user-profile/userLoginProfile'

import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import SelectCustom from '@/components/react-select/SelectCustom'

import { PREFIX_QUERY_KEY, useUpdate } from '@/_workspace/react-query/hooks/useProcessData'

import CustomTextField from '@/components/mui/TextField'

import { ProductCategoryI } from '@/_workspace/types/productGroup/ProductCategory'
import StatusOption from '@/libs/react-select/option/StatusOption'
import StatusOptionForEdit from '@/libs/react-select/option/StatusOptionForEdit'

// Dialog
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

// Schema with Valibot
const schema = object({
  // PROCESS_NAME: pipe(
  //   string(typeFieldMessage({ fieldName: 'Process Name', typeName: 'String' })),
  //   nonEmpty('Process Name is required'),
  //   minLength(3, minLengthFieldMessage({ fieldName: 'Process Name', minLength: 3 })),
  //   maxLength(200, maxLengthFieldMessage({ fieldName: 'Process Name', maxLength: 200 }))
  // )
})

type FormData = Input<typeof schema>

// Props
interface ViewModalProps {
  openModalView: boolean
  setOpenModalView: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<ProductCategoryI> | null
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const AccountDepartmentCodeViewModal = ({
  openModalView,
  setOpenModalView,
  rowSelected,
  setIsEnableFetching
}: ViewModalProps) => {
  // States : Dialog
  const [confirmModal, setConfirmModal] = useState(false)

  const queryClient = useQueryClient()

  // Hooks : react-hook-form
  const { control, getValues, handleSubmit } = useForm<FormData>({
    // resolver: valibotResolver(schema),
    defaultValues: {
      ACCOUNT_DEPARTMENT_CODE: rowSelected?.original?.ACCOUNT_DEPARTMENT_CODE,
      ACCOUNT_DEPARTMENT_NAME: rowSelected?.original?.ACCOUNT_DEPARTMENT_NAME,
      note: rowSelected?.original?.NOTE,
      // PRODUCT_CATEGORY_ALPHABET: rowSelected?.original?.PRODUCT_CATEGORY_ALPHABET,
      // PRODUCT_TYPE_CODE: rowSelected?.original?.PRODUCT_TYPE_CODE,
      // PC_NAME: rowSelected?.original?.PC_NAME,
      // FFT_PART_NUMBER: rowSelected?.original?.FFT_PART_NUMBER,
      // SUFFIX_FOR_PART_NUMBER: rowSelected?.original.SUFFIX_FOR_PART_NUMBER,
      // IS_PRODUCT_FOR_REPAIR: rowSelected?.original.IS_PRODUCT_FOR_REPAIR,
      // IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE: rowSelected?.original.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE,
      INUSE: StatusOption.find(item => item.value == rowSelected?.original?.inuseForSearch)
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
    setOpenModalView(false)
    // reset()
  }

  const handleUpdate = () => {
    setConfirmModal(false)

    const dataItem = {
      ACCOUNT_DEPARTMENT_CODE_ID: rowSelected?.original.ACCOUNT_DEPARTMENT_CODE_ID,
      ACCOUNT_DEPARTMENT_CODE: getValues('ACCOUNT_DEPARTMENT_CODE'),
      ACCOUNT_DEPARTMENT_NAME: getValues('ACCOUNT_DEPARTMENT_NAME'),
      // PRODUCT_CATEGORY_ALPHABET: getValues('PRODUCT_CATEGORY_ALPHABET'),
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE,
      INUSE: getValues('INUSE')?.value
    }

    mutation.mutate(dataItem)
  }

  const onMutateSuccess = (data: any) => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Add Process'
      }

      ToastMessageSuccess(message)
      setIsEnableFetching(true)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      //reset()
      handleClose()
    } else {
      const message = {
        title: 'Add Process',
        message: data.data.Message.startsWith('1062') ? 'Duplicate Process' : data.data.Message
      }

      ToastMessageError(message)
    }
  }

  const onMutateError = () => {
    console.log('onMutateError')
  }

  const mutation = useUpdate(onMutateSuccess, onMutateError)

  const onError: SubmitErrorHandler<FormData> = data => {
    // console.log(data)
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
        open={openModalView}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
        PaperProps={{ sx: { top: 30, m: 0 } }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            View Account Department Code
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid className='mb-3'>
            <Controller
              name='ACCOUNT_DEPARTMENT_NAME'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Account Department Name'
                  placeholder='Enter...'
                  autoComplete='off'
                  disabled={true}
                />
              )}
            />
          </Grid>

          <Grid className='mb-3'>
            <Controller
              name='ACCOUNT_DEPARTMENT_CODE'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Account Department Code'
                  placeholder='Enter...'
                  autoComplete='off'
                  disabled={true}
                />
              )}
            />
          </Grid>

          {/* <Grid className='mb-5'>
            <Controller
              name='PRODUCT_CATEGORY_ALPHABET'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Product Category Alphabet'
                  placeholder='Enter Product Category Alphabet'
                  autoComplete='off'
                  disabled={true}
                />
              )}
            />
          </Grid> */}
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
                  placeholder='Enter...'
                  autoComplete='off'
                  disabled
                />
              )}
            />
          </Grid>
          <Grid>
            <Controller
              name='INUSE'
              control={control}
              render={({ field: { ...fieldProps } }) => (
                <SelectCustom
                  {...fieldProps}
                  options={StatusOptionForEdit}
                  isClearable
                  label='Status'
                  classNamePrefix='select'
                  isDisabled={true}
                />
              )}
            />
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant='tonal' color='secondary'>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default AccountDepartmentCodeViewModal
