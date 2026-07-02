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

import type { MRT_Row } from 'material-react-table'

import DialogCloseButton from '@components/dialogs/DialogCloseButton'

import CustomTextField from '@/@core/components/mui/TextField'
import { PREFIX_QUERY_KEY, useUpdateProductSub } from '@/_workspace/react-query/hooks/useProductSubData'
// import AsyncSelectCustom from '@/customize/components/AsyncSelectCustom'
import {
  maxLengthFieldMessage,
  minLengthFieldMessage,
  requiredFieldMessage,
  typeFieldMessage,
  uppercaseFieldMessage
} from '@/libs/valibot/error-message/errorMessage'

import { fetchProductCategoryByLikeProductCategoryNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchProductCategory'
import {
  fetchProductMainByLikeProductMainNameAndInuse,
  fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchProductMain'
import { ProductSubI } from '@/_workspace/types/productGroup/ProductSub'
import ConfirmModal from '@/components/ConfirmModal'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import SelectCustom from '@/components/react-select/SelectCustom'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import StatusColumn from '@/libs/material-react-table/components/StatusOption'
import StatusOptionForEdit from '@/libs/react-select/option/StatusOptionForEdit'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

export type FormData = Input<typeof schema>

const schema = object({
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

// const defaultValues: FormData = {
//   productCategory: null,
//   productMainName: '',
//   productMainCode: ''
// }

interface ProductSubEditModalProps {
  openModalEdit: boolean
  setOpenModalEdit: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<ProductSubI> | null
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const ProductSubEditModal = ({
  openModalEdit,
  setOpenModalEdit,
  rowSelected,
  setIsEnableFetching
}: ProductSubEditModalProps) => {
  // useState

  // States : Modal
  const [confirmModal, setConfirmModal] = useState(false)

  const handleClickOpen = () => setOpenModalEdit(true)
  const handleClose = () => {
    setOpenModalEdit(false)
    // reset()
  }

  // Hooks : react-hook-form
  const { control, handleSubmit, setValue, reset, getValues, watch } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      productCategory: {
        PRODUCT_CATEGORY_ID: rowSelected?.original.PRODUCT_CATEGORY_ID,
        PRODUCT_CATEGORY_NAME: rowSelected?.original.PRODUCT_CATEGORY_NAME
      },
      productMain: {
        PRODUCT_MAIN_ID: rowSelected?.original.PRODUCT_MAIN_ID,
        PRODUCT_MAIN_NAME: rowSelected?.original.PRODUCT_MAIN_NAME
      },
      productSubName: rowSelected?.original.PRODUCT_SUB_NAME,
      productSubAlphabet: rowSelected?.original.PRODUCT_SUB_ALPHABET,
      productSubCode: rowSelected?.original.PRODUCT_SUB_CODE,
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

  const handleEditProductSub = () => {
    setConfirmModal(false)
    const dataItem = {
      PRODUCT_SUB_ID: rowSelected?.original.PRODUCT_SUB_ID,
      // PRODUCT_CATEGORY_ID:
      //   getValues('productCategory.PRODUCT_CATEGORY_ID') || rowSelected?.original.PRODUCT_CATEGORY_ID,
      PRODUCT_MAIN_ID: getValues('productMain')?.PRODUCT_MAIN_ID || rowSelected?.original.PRODUCT_MAIN_ID,
      PRODUCT_SUB_NAME: getValues('productSubName').trim(),
      PRODUCT_SUB_ALPHABET: getValues('productSubAlphabet').trim(),
      // INUSE: rowSelected?.original.INUSE,
      // INUSE: getValues('status').value,
      CREATE_BY: getUserData()?.EMPLOYEE_CODE,
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE
    }
    mutation.mutate(dataItem)
  }

  const onMutateSuccess = data => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Update Product Sub'
      }
      ToastMessageSuccess(message)
      setIsEnableFetching(true)

      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      // reset()
      handleClose()
    } else {
      const message = {
        title: 'Update Product Sub',
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

  const mutation = useUpdateProductSub(onMutateSuccess, onMutateError)

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
            Edit Product Sub
            {/* {rowSelected?.original.CUSTOMER_ORDER_FROM_ID} */}
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          {/* <Grid className='mb-4'>
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

          <Grid className='mb-4'>
            <Controller
              name='productCategory'
              control={control}
              render={({ field: { onChange, ...fieldProps } }) => (
                <>
                  <AsyncSelectCustom
                    label='Product Category Name'
                    inputId='productCategory'
                    {...fieldProps}
                    isClearable
                    cacheOptions
                    defaultOptions
                    loadOptions={inputValue => {
                      return fetchProductCategoryByLikeProductCategoryNameAndInuse(inputValue)
                    }}
                    onChange={value => {
                      onChange(value)
                      setValue('productMain', '')
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
                  <AsyncSelectCustom
                    label='Product Main Name'
                    inputId='productMain'
                    {...fieldProps}
                    isClearable
                    cacheOptions
                    defaultOptions
                    // loadOptions={inputValue => {
                    //   return fetchProductCategoryByLikeProductCategoryNameAndInuse(inputValue)
                    // }}
                    key={watch('productCategory')?.PRODUCT_CATEGORY_ID}
                    loadOptions={inputValue => {
                      console.log('Row', getValues('productMain'))

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

                      // setValue('productMain', { PRODUCT_MAIN_NAME: getValues('productMain') })
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
                  // value='..................................................'
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
              render={({ field }) => (
                <CustomTextField
                  // key={watch('productMain')?.PRODUCT_MAIN_ID}
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
          <Grid className='mb-4'>
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
          onConfirmClick={handleEditProductSub}
          onCloseClick={() => setConfirmModal(false)}
          isDelete={false}
        />
      </Dialog>
      {/* <DevTool control={control} /> set up the dev tool */}
    </>
  )
}

export default ProductSubEditModal
