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

import { maxLength, minLength, nonEmpty, number, object, pipe, regex, string, transform } from 'valibot'

import type { Input } from 'valibot'

import { valibotResolver } from '@hookform/resolvers/valibot'

import DialogCloseButton from '@components/dialogs/DialogCloseButton'

import CustomTextField from '@/@core/components/mui/TextField'
import { PREFIX_QUERY_KEY, useCreateProductSub } from '@/_workspace/react-query/hooks/useProductSubData'
import {
  fetchProductCategoryByLikeProductCategoryNameAndInuse,
  ProductCategoryOption
} from '@/_workspace/react-select/async-promise-load-options/fetchProductCategory'
import {
  fetchProductMainByLikeProductMainNameAndInuse,
  fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse,
  ProductMainOption
} from '@/_workspace/react-select/async-promise-load-options/fetchProductMain'
import ConfirmModal from '@/components/ConfirmModal'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import {
  maxLengthFieldMessage,
  minLengthFieldMessage,
  requiredFieldMessage,
  typeFieldMessage,
  uppercaseFieldMessage
} from '@/libs/valibot/error-message/errorMessage'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

export type FormData = Input<typeof schema>

const schema = object({
  // productCategoryName: string(typeFieldMessage({ fieldName: 'Product Category Name', typeName: 'String' }), [
  //   minLength(3, minLengthFieldMessage({ fieldName: 'Product Category Name', minLength: 3 })),
  //   maxLength(50, maxLengthFieldMessage({ fieldName: 'Product Category Name', maxLength: 50 }))
  // ]),
  productCategory: object(
    {
      PRODUCT_CATEGORY_ID: number(typeFieldMessage({ fieldName: 'Product Category Name', typeName: 'Number' })),
      PRODUCT_CATEGORY_NAME: string(typeFieldMessage({ fieldName: 'Product Category Name', typeName: 'String' }))
    },
    requiredFieldMessage({ fieldName: 'Product Category' })
  ),
  productMain: object(
    {
      PRODUCT_MAIN_ID: number(typeFieldMessage({ fieldName: 'Product Main Name', typeName: 'Number' })),
      PRODUCT_MAIN_NAME: string(typeFieldMessage({ fieldName: 'Product Main Name', typeName: 'String' }))
    },
    requiredFieldMessage({ fieldName: 'Product Main' })
  ),

  productSubName: pipe(
    string(typeFieldMessage({ fieldName: 'Product Sub Name', typeName: 'String' })),
    transform(val => val.trim()),
    nonEmpty('Please enter your Product Sub Name'),
    minLength(3, minLengthFieldMessage({ fieldName: 'Product Sub Name', minLength: 3 })),
    regex(/^[^\s]+$/, 'Product Sub Name must not contain spaces')
  ),

  productSubAlphabet: pipe(
    string(typeFieldMessage({ fieldName: 'Product Sub Alphabet', typeName: 'String' })),
    transform(val => val.trim()),
    nonEmpty('Please enter your Product Sub Alphabet'),
    minLength(2, minLengthFieldMessage({ fieldName: 'Product Sub Alphabet', minLength: 2 })),
    maxLength(2, maxLengthFieldMessage({ fieldName: 'Product Sub Alphabet', maxLength: 2 })),
    regex(/^[A-Z]/, uppercaseFieldMessage({ fieldName: 'Product Sub Alphabet' }))
  )
})
// productCategoryAlphabet: string(typeFieldMessage({ fieldName: 'Product Category Alphabet', typeName: 'String' }), [
//   regex(/[A-Z]/, uppercaseFieldMessage({ fieldName: 'Product Category Alphabet' }))
// ])

interface ProductSubAddModalProps {
  openModalAdd: boolean
  setOpenModalAdd: Dispatch<SetStateAction<boolean>>
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}
const ProductSubAddModal = ({ openModalAdd, setOpenModalAdd, setIsEnableFetching }: ProductSubAddModalProps) => {
  // useState

  // States : Modal
  // const [openModalAdd, setOpenModalAdd] = useState<boolean>(false)
  const [confirmModal, setConfirmModal] = useState(false)

  const handleClose = () => {
    setOpenModalAdd(false)
    reset()
  }

  // Hooks : react-hook-form
  const { control, handleSubmit, setValue, reset, getValues, watch } = useForm<FormData>({
    resolver: valibotResolver(schema),
    // defaultValues
    defaultValues: {
      productCategory: null,
      productMain: null,
      productSubName: '',
      productSubAlphabet: ''
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
      PRODUCT_CATEGORY_ID: getValues('productCategory')?.PRODUCT_CATEGORY_ID,
      PRODUCT_MAIN_ID: getValues('productMain')?.PRODUCT_MAIN_ID,
      PRODUCT_SUB_NAME: getValues('productSubName').trim(),
      PRODUCT_SUB_ALPHABET: getValues('productSubAlphabet').trim(),
      CREATE_BY: getUserData()?.EMPLOYEE_CODE,
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE
    }
    console.log(dataItem)

    mutation.mutate(dataItem)
    // queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
  }

  const onMutateSuccess = data => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Add Product Sub'
      }

      ToastMessageSuccess(message)
      setIsEnableFetching(true)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      //reset()
      handleClose()
    } else {
      const message = {
        title: 'Add Product Sub',
        message: data.data.Message
      }

      ToastMessageError(message)
    }

    console.log('onMutateSuccess')
  }

  const onMutateError = (e: any) => {
    console.log('onMutateError', e)
  }

  const mutation = useCreateProductSub(onMutateSuccess, onMutateError)

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
            Add Product Sub
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid className='mb-4'>
            <Controller
              name='productCategory'
              control={control}
              render={({ field: { onChange, ...fieldProps } }) => (
                <>
                  <AsyncSelectCustom<ProductCategoryOption>
                    label='Product Category Name'
                    inputId='productCategory'
                    {...fieldProps}
                    isClearable
                    cacheOptions
                    defaultOptions
                    loadOptions={inputValue => {
                      return fetchProductCategoryByLikeProductCategoryNameAndInuse(inputValue, '1')
                    }}
                    onChange={value => {
                      onChange(value)
                      setValue('productMain', null)
                    }}
                    getOptionLabel={data => data.PRODUCT_CATEGORY_NAME}
                    getOptionValue={data => data.PRODUCT_CATEGORY_ID.toString()}
                    classNamePrefix='select'
                    placeholder='Select ...'
                    {...(errors.productCategory && { error: true, helperText: errors.productCategory.message })}
                  />
                </>
              )}
            />
          </Grid>
          <Grid className='mb-4'>
            <Controller
              name='productMain'
              control={control}
              render={({ field: { onChange, ...fieldProps } }) => (
                <>
                  <AsyncSelectCustom<ProductMainOption>
                    label='Product Main Name'
                    inputId='productMain'
                    {...fieldProps}
                    isClearable
                    cacheOptions
                    defaultOptions
                    key={watch('productCategory')?.PRODUCT_CATEGORY_ID}
                    // value={watch('productMain')?.PRODUCT_MAIN_ID}
                    loadOptions={inputValue => {
                      if (getValues('productCategory')) {
                        return fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse(
                          inputValue,
                          '1',
                          watch('productCategory')?.PRODUCT_CATEGORY_ID
                        )
                      } else {
                        return fetchProductMainByLikeProductMainNameAndInuse(inputValue || '', 1)
                      }
                    }}
                    onChange={value => {
                      onChange(value)
                      // setValue('process', null)
                    }}
                    getOptionLabel={data => data.PRODUCT_MAIN_NAME}
                    getOptionValue={data => data.PRODUCT_MAIN_ID.toString()}
                    classNamePrefix='select'
                    placeholder='Select ...'
                    isDisabled={!getValues('productCategory')}
                    {...(errors.productMain && { error: true, helperText: errors.productMain.message })}
                  />
                </>
              )}
            />
          </Grid>
          <Grid className='mb-4'>
            <Controller
              name='productSubCode'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  disabled
                  label='Product Sub Code (Auto)'
                  // value='PD-C-XXXX'
                  placeholder='PD-C-XXXX'
                  autoComplete='off'
                  {...(errors.productSubCode && { error: true, helperText: errors.productSubCode.message })}
                />
              )}
            />
          </Grid>
          <Grid className='mb-4'>
            <Controller
              name='productSubName'
              control={control}
              // render={({ field }) => (
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Product Sub Name'
                  placeholder='Enter ...'
                  autoComplete='off'
                  {...(errors.productSubName && {
                    error: true,
                    helperText: errors.productSubName.message
                  })}
                />
              )}
            />
          </Grid>
          <Grid>
            <Controller
              name='productSubAlphabet'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Product Sub Alphabet'
                  placeholder='Enter ...'
                  autoComplete='off'
                  {...(errors.productSubAlphabet && {
                    error: true,
                    helperText: errors.productSubAlphabet.message
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

export default ProductSubAddModal
