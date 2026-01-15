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

import { InferOutput, maxLength, minLength, nonEmpty, nullish, object, pipe, regex, string, transform } from 'valibot'

import { valibotResolver } from '@hookform/resolvers/valibot'

import type { MRT_Row } from 'material-react-table'

import DialogCloseButton from '@components/dialogs/DialogCloseButton'

import CustomTextField from '@/@core/components/mui/TextField'
import { PREFIX_QUERY_KEY, useUpdateProductCategory } from '@/_workspace/react-query/hooks/useProductCategoryData'
// import AsyncSelectCustom from '@/customize/components/AsyncSelectCustom'
import {
  maxLengthFieldMessage,
  minLengthFieldMessage,
  typeFieldMessage,
  uppercaseFieldMessage
} from '@/libs/valibot/error-message/errorMessage'

import { ProductCategoryI } from '@/_workspace/types/productGroup/ProductCategory'
import ConfirmModal from '@/components/ConfirmModal'
import SelectCustom from '@/components/react-select/SelectCustom'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import StatusColumn from '@/libs/material-react-table/components/StatusOption'
import StatusOptionForEdit from '@/libs/react-select/option/StatusOptionForEdit'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

const Transition = forwardRef(function Transition(props: SlideProps & { children?: ReactElement }, ref: Ref<unknown>) {
  return <Slide direction='up' ref={ref} {...props} />
})

export type FormData = InferOutput<typeof schema>

const schema = object({
  productCategoryCode: nullish(string()),
  productCategoryName: pipe(
    string(typeFieldMessage({ fieldName: 'Product Category Name', typeName: 'String' })),
    transform(val => val.trim()),
    nonEmpty('Please enter your Product Category Name'),
    minLength(3, minLengthFieldMessage({ fieldName: 'Product Category Name', minLength: 3 }))
  ),
  productCategoryAlphabet: pipe(
    string(typeFieldMessage({ fieldName: 'Product Category Alphabet', typeName: 'String' })),
    transform(val => val.trim()),
    nonEmpty('Please enter your Product Category Alphabet'),
    minLength(2, minLengthFieldMessage({ fieldName: 'Product Category Alphabet', minLength: 2 })),
    maxLength(2, maxLengthFieldMessage({ fieldName: 'Product Category Alphabet', maxLength: 2 })),
    regex(/^[A-Z0-9]{2}$/, uppercaseFieldMessage({ fieldName: 'Product Category Alphabet' }))
  )
})

interface ProductCategoryEditModalProps {
  openModalEdit: boolean
  setOpenModalEdit: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<ProductCategoryI> | null
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const ProductCategoryEditModal = ({
  openModalEdit,
  setOpenModalEdit,
  rowSelected,
  setIsEnableFetching
}: ProductCategoryEditModalProps) => {
  // useState

  // States : Modal
  const [confirmModal, setConfirmModal] = useState(false)

  const handleClose = () => {
    setOpenModalEdit(false)
    // reset()
  }

  // Hooks : react-hook-form
  const { control, handleSubmit, getValues } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      productCategoryName: rowSelected?.original.PRODUCT_CATEGORY_NAME,
      productCategoryAlphabet: rowSelected?.original.PRODUCT_CATEGORY_ALPHABET,
      productCategoryCode: rowSelected?.original.PRODUCT_CATEGORY_CODE,
      status: StatusColumn.find(dataItem => dataItem.value === Number(rowSelected?.original.inuseForSearch))
    }
  })
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
      PRODUCT_CATEGORY_ID: rowSelected?.original.PRODUCT_CATEGORY_ID,
      PRODUCT_CATEGORY_NAME: getValues('productCategoryName').trim(),
      PRODUCT_CATEGORY_ALPHABET: getValues('productCategoryAlphabet').trim(),
      // INUSE: rowSelected?.original.INUSE,
      // INUSE: getValues('status').value,
      CREATE_BY: getUserData()?.EMPLOYEE_CODE,
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE
    }
    console.log('data', dataItem)

    mutation.mutate(dataItem)
  }

  const onMutateSuccess = (data: any) => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Add Product Main'
      }
      ToastMessageSuccess(message)
      setIsEnableFetching(true)

      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      // reset()
      handleClose()
    } else {
      const message = {
        title: 'Add Product Category',
        message: data.data.Message
      }

      ToastMessageError(message)
      // queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      // reset()
      // handleClose()
    }

    console.log('onMutateSuccess')
  }

  const onMutateError = (e: any) => {
    console.log('onMutateError', e)
  }

  const mutation = useUpdateProductCategory(onMutateSuccess, onMutateError)

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
        open={openModalEdit}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            Edit Product Category
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid className='mb-5'>
            <Controller
              name='productCategoryCode'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  disabled
                  label='Product Category Code (Auto)'
                  // value='PD-C-XXXX'
                  autoComplete='off'
                  {...(errors.productCategoryCode && { error: true, helperText: errors.productCategoryCode.message })}
                />
              )}
            />
          </Grid>
          <Grid className='mb-4'>
            <Controller
              name='productCategoryName'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Product Category Name'
                  placeholder='Enter ...'
                  autoComplete='off'
                  {...(errors.productCategoryName && {
                    error: true,
                    helperText: errors.productCategoryName.message
                  })}
                />
              )}
            />
          </Grid>
          <Grid className='mb-4'>
            <Controller
              name='productCategoryAlphabet'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Product Category Alphabet'
                  placeholder='Enter ...'
                  autoComplete='off'
                  {...(errors.productCategoryAlphabet && {
                    error: true,
                    helperText: errors.productCategoryAlphabet.message
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

export default ProductCategoryEditModal
