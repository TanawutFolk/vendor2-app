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
import { Box, Grid, Slide } from '@mui/material'
import Divider from '@mui/material/Divider'
import type { SubmitErrorHandler } from 'react-hook-form'
import { Controller, useForm, useFormState } from 'react-hook-form'
// Components Imports
import { useQueryClient } from '@tanstack/react-query'

import DialogCloseButton from '@components/dialogs/DialogCloseButton'

import { PREFIX_QUERY_KEY, useCreateProductTypeNew } from '@/_workspace/react-query/hooks/useProductTypeData'
import { fetchAccountDepartmentCodeByLikeAccountDepartmentCodeAndInuse } from '@/_workspace/react-select/async-promise-load-options/account-department-code/fetchAccountDepartmentCode'
import {
  CustomerInvoiceToOption,
  fetchCustomerInvoiceToByLikeCustomerInvoiceToAlphabet
} from '@/_workspace/react-select/async-promise-load-options/customer/fetchCustomerInvoiceTo'
import {
  BomOption,
  fetchByLikeBomCodeAndProductMainIdAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchBom'
import { fetchItemCategoryCanBeSoldByLikeItemCategoryNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchItemCategory'
import {
  fetchProductCategoryByLikeProductCategoryNameAndInuse,
  ProductCategoryOption
} from '@/_workspace/react-select/async-promise-load-options/fetchProductCategory'
import {
  fetchProductMainByLikeProductMainNameAndInuse,
  fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse,
  ProductMainOption
} from '@/_workspace/react-select/async-promise-load-options/fetchProductMain'
import {
  fetchProductSubByLikeProductSubNameAndInuse,
  fetchProductSubByLikeProductSubNameAndProductCategoryIdAndInuse,
  fetchProductSubByLikeProductSubNameAndProductMainIdAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchProductSub'
import ConfirmModal from '@/components/ConfirmModal'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import CustomTextField from '@/@core/components/mui/TextField'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

export type FormData = z.infer<typeof schema>

export const schema = z.object({
  productCategory: z
    .object({
      PRODUCT_CATEGORY_ID: z.number({ required_error: 'Product Category ID must be a number' }),
      PRODUCT_CATEGORY_NAME: z.string({ required_error: 'Product Category Name must be a string' })
    })
    .optional()
    .nullable()
    .refine(val => val !== null && val !== undefined, {
      message: 'Please select a Product Category'
    }),

  productMain: z
    .object({
      PRODUCT_MAIN_ID: z.number({ required_error: 'Product Main ID must be a number' }),
      PRODUCT_MAIN_NAME: z.string({ required_error: 'Product Main Name must be a string' })
    })
    .optional()
    .nullable()
    .refine(val => val !== null && val !== undefined, {
      message: 'Please select a Product Main'
    }),

  productSub: z
    .object({
      PRODUCT_SUB_ID: z.number({ required_error: 'Product Sub ID must be a number' }),
      PRODUCT_SUB_NAME: z.string({ required_error: 'Product Sub Name must be a string' })
    })
    .optional()
    .nullable()
    .refine(val => val !== null && val !== undefined, {
      message: 'Please select a Product Sub'
    }),

  itemCategory: z
    .object({
      ITEM_CATEGORY_ID: z.number({ required_error: 'Please select an Item Category' }),
      ITEM_CATEGORY_NAME: z.string({ required_error: 'Please enter the Item Category name' })
    })
    .optional()
    .nullable()
    .refine(val => val !== null && val !== undefined, {
      message: 'Please select an Item Category'
    }),

  productTypeCodeAuto: z.string().optional(),

  productTypeCode: z
    .string({ required_error: 'Product Type Code must be a string' })
    .refine(val => val.replace(/\s/g, '').length === 8, {
      message: 'Product Type Code must be exactly 8 non-space characters'
    }),

  productTypeName: z
    .string({ required_error: 'Product Type Name must be a string' })
    .trim()
    .min(3, 'Product Type Name must be at least 3 characters')
    .max(200, 'Product Type Name must not exceed 200 characters'),

  bom: z
    .object({
      BOM_ID: z.number({ required_error: 'BOM ID must be a number' }),
      BOM_NAME: z.string({ required_error: 'BOM Name must be a string' })
    })
    .optional()
    .nullable(),

  customerInvoiceTo: z
    .object({
      CUSTOMER_INVOICE_TO_ID: z.number({ required_error: 'Customer Invoice To ID must be a number' }),
      CUSTOMER_INVOICE_TO_NAME: z.string({ required_error: 'Customer Invoice To Name must be a string' })
    })
    .optional()
    .nullable()
    .refine(val => val !== null && val !== undefined, {
      message: 'Please select a Customer Invoice To'
    }),

  accountDepartmentCode: z
    .object({
      ACCOUNT_DEPARTMENT_CODE_ID: z.number({ required_error: 'Account Department ID must be a number' }),
      ACCOUNT_DEPARTMENT_NAME: z.string({ required_error: 'Account Department Name must be a string' })
    })
    .optional()
    .nullable()
})

// productCategoryAlphabet: string(typeFieldMessage({ fieldName: 'Product Category Alphabet', typeName: 'String' }), [
//   regex(/[A-Z]/, uppercaseFieldMessage({ fieldName: 'Product Category Alphabet' }))
// ])

interface ProductSubAddModalProps {
  openAddModal: boolean
  setOpenModalAdd: Dispatch<SetStateAction<boolean>>
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}
const ProductTypeAddModal = ({ openAddModal, setOpenModalAdd, setIsEnableFetching }: ProductSubAddModalProps) => {
  // useState

  // States : Modal
  // const [openAddModal, setOpenModalAdd] = useState<boolean>(false)
  const [confirmModal, setConfirmModal] = useState(false)

  const handleClose = () => {
    setOpenModalAdd(false)
    reset()
  }

  // Hooks : react-hook-form
  const { control, handleSubmit, setValue, reset, getValues, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      productTypeCodeAuto: '',
      productTypeCode: '',
      productTypeName: '',
      bom: null
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
      PRODUCT_SUB_ID: getValues('productSub').PRODUCT_SUB_ID || '',
      PRODUCT_SUB_NAME: getValues('productSub').PRODUCT_SUB_NAME || '',
      ITEM_CATEGORY_ID: getValues('itemCategory').ITEM_CATEGORY_ID,

      PRODUCT_TYPE_NAME: getValues('productTypeName'),
      PRODUCT_TYPE_CODE_FOR_SCT: getValues('productTypeCode'),

      CUSTOMER_INVOICE_TO_ID: getValues('customerInvoiceTo')?.CUSTOMER_INVOICE_TO_ID || '',
      ACCOUNT_DEPARTMENT_CODE_ID: getValues('accountDepartmentCode')?.ACCOUNT_DEPARTMENT_CODE_ID || '',
      BOM_ID: getValues('bom')?.BOM_ID || '',
      FLOW_ID: getValues('bom')?.FLOW_ID || '',

      PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID: 1,

      IS_BOI: 0,
      BOI_PROJECT_ID: '',

      PRODUCT_TYPE_STATUS_PROGRESS_ID: 1,
      PRODUCT_TYPE_STATUS_WORKING_ID: 1,

      INUSE: 1,

      // !! Item Master
      // ITEM_CATEGORY_ID: getValues('itemCategory').ITEM_CATEGORY_ID,
      ITEM_PURPOSE_ID: 1, // Mass Production
      // ITEM_GROUP_ID: 1,
      VENDOR_ID: 1,
      MAKER_ID: 5,

      COLOR_ID_FOR_ITEM_THEME: '',
      WORK_ORDER_ID: '',
      PART_NO_ID: '',
      SPECIFICATION_ID: '',
      CUSTOMER_ORDER_FROM_ID: 1, // FFT,

      WIDTH: '',
      HEIGHT: '',
      DEPTH: '',
      ITEM_PROPERTY_COLOR_ID: '',
      ITEM_PROPERTY_SHAPE_ID: '',
      ITEM_PROPERTY_MADE_BY_ID: '',

      ITEM_INTERNAL_CODE: getValues('productTypeCode'),
      ITEM_INTERNAL_FULL_NAME: getValues('productTypeName'),
      ITEM_INTERNAL_SHORT_NAME: getValues('productTypeName'),
      ITEM_EXTERNAL_CODE: getValues('productTypeCode'),
      ITEM_EXTERNAL_FULL_NAME: getValues('productTypeName'),
      ITEM_EXTERNAL_SHORT_NAME: getValues('productTypeName'),

      ITEM_CODE_FOR_SUPPORT_MES: getValues('productTypeCode'),

      IS_SAME_ITEM_INTERNAL_CODE_FOR_ITEM_EXTERNAL_CODE: '1',

      IMAGE_ROOT_PATH: '',
      IMAGE_FILE_TYPE: '',

      IMAGE: '',

      // Purchase Unit
      PURCHASE_UNIT_RATIO: 1,
      PURCHASE_UNIT_ID: 1, //  Piece

      // Usage Unit
      USAGE_UNIT_RATIO: 1,
      USAGE_UNIT_ID: 1, //  Piece

      // Item Stock
      MOQ: '',
      LEAD_TIME: '',
      SAFETY_STOCK: '',
      CREATE_BY: getUserData()?.EMPLOYEE_CODE,
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE
    }
    // console.log(dataItem)

    mutation.mutate(dataItem)
    // queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
  }

  const onMutateSuccess = (data: any) => {
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

  const mutation = useCreateProductTypeNew(onMutateSuccess, onMutateError)

  return (
    <>
      <Dialog
        maxWidth='md'
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
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            Add Product Type
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>

        <DialogContent>
          <Grid item xs={12} sx={{ mb: 2 }}>
            <Divider textAlign='left'>
              <Typography variant='body2' color='primary'>
                Product Group
              </Typography>
            </Divider>
          </Grid>
          <Grid container spacing={6} sx={{ mb: 5 }}>
            {/* Product Category */}
            <Grid item xs={4}>
              <Controller
                name='productCategory'
                control={control}
                render={({ field: { onChange, ...fieldProps } }) => (
                  <AsyncSelectCustom<ProductCategoryOption>
                    label='Product Category Name'
                    inputId='productCategory'
                    {...fieldProps}
                    isClearable
                    cacheOptions
                    defaultOptions
                    loadOptions={inputValue => fetchProductCategoryByLikeProductCategoryNameAndInuse(inputValue, '1')}
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
                )}
              />
            </Grid>

            {/* Product Main */}
            <Grid item xs={4}>
              <Controller
                name='productMain'
                control={control}
                render={({ field: { onChange, ...fieldProps } }) => (
                  <AsyncSelectCustom<ProductMainOption>
                    label='Product Main Name'
                    inputId='productMain'
                    {...fieldProps}
                    isClearable
                    cacheOptions
                    defaultOptions
                    key={watch('productCategory')?.PRODUCT_CATEGORY_ID}
                    loadOptions={inputValue => {
                      if (getValues('productCategory')) {
                        return fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse(
                          inputValue,
                          1,
                          watch('productCategory')?.PRODUCT_CATEGORY_ID
                        )
                      } else {
                        return fetchProductMainByLikeProductMainNameAndInuse(inputValue || '', 1)
                      }
                    }}
                    onChange={value => {
                      onChange(value)
                      setValue('productSub', null)
                      setValue('bom', null)
                      setValue('bomName', null)
                    }}
                    getOptionLabel={data => data.PRODUCT_MAIN_NAME}
                    getOptionValue={data => data.PRODUCT_MAIN_ID.toString()}
                    classNamePrefix='select'
                    placeholder='Select ...'
                    isDisabled={!watch('productCategory')}
                    {...(errors.productMain && { error: true, helperText: errors.productMain.message })}
                  />
                )}
              />
            </Grid>

            {/* Placeholder (ช่องที่ 3) */}
            <Grid item xs={4}>
              <Controller
                name='productSub'
                control={control}
                render={({ field: { onChange, ...fieldProps } }) => (
                  <AsyncSelectCustom
                    {...fieldProps}
                    isClearable
                    cacheOptions
                    defaultOptions
                    key={`${watch('productCategory')?.PRODUCT_CATEGORY_ID}_${watch('productMain')?.PRODUCT_MAIN_ID}`}
                    loadOptions={inputValue => {
                      if (getValues('productMain')) {
                        return fetchProductSubByLikeProductSubNameAndProductMainIdAndInuse(
                          inputValue,
                          watch('productMain')?.PRODUCT_MAIN_ID,
                          1
                        )
                      } else if (getValues('productCategory')) {
                        return fetchProductSubByLikeProductSubNameAndProductCategoryIdAndInuse(
                          inputValue || '',
                          watch('productCategory')?.PRODUCT_CATEGORY_ID,
                          1
                        )
                      } else {
                        return fetchProductSubByLikeProductSubNameAndInuse(inputValue || '', 1)
                      }
                    }}
                    onChange={value => {
                      onChange(value)
                    }}
                    getOptionLabel={data => data?.PRODUCT_SUB_NAME || ''}
                    getOptionValue={data => data?.PRODUCT_SUB_ID?.toString() || ''}
                    classNamePrefix='select'
                    label='Product Sub Name'
                    placeholder='Select ...'
                    isDisabled={!watch('productMain')}
                    {...(errors.productSub && { error: true, helperText: errors.productSub.message })}
                  />
                )}
              />
            </Grid>
          </Grid>
          <Grid item xs={12} sx={{ mb: 2 }}>
            <Divider textAlign='left'>
              <Typography variant='body2' color='primary'>
                Product Type
              </Typography>
            </Divider>
          </Grid>
          <Grid container spacing={6} sx={{ mb: 5 }}>
            <Grid item xs={4}>
              <Controller
                name='itemCategory'
                control={control}
                render={({ field: { ref, ...fieldProps } }) => (
                  <AsyncSelectCustom
                    {...fieldProps}
                    isClearable
                    cacheOptions
                    defaultOptions
                    loadOptions={inputValue => {
                      return fetchItemCategoryCanBeSoldByLikeItemCategoryNameAndInuse({
                        itemCategoryName: inputValue,
                        inuse: 1
                      })
                    }}
                    getOptionLabel={data => data?.ITEM_CATEGORY_NAME || ''}
                    getOptionValue={data => data?.ITEM_CATEGORY_ID?.toString() || ''}
                    classNamePrefix='select'
                    label='Item Category Name'
                    placeholder='Select ... '
                    {...(errors.itemCategory && { error: true, helperText: errors.itemCategory.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Controller
                name='productTypeCodeAuto'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    disabled
                    label='Product Type Code (Auto)'
                    placeholder='PD-T-XXXX'
                    autoComplete='off'
                  />
                )}
              />
            </Grid>
          </Grid>
          <Grid container spacing={6} sx={{ mb: 5 }}>
            <Grid item xs={4}>
              <Controller
                name='productTypeCode'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Product Type Code for SCT'
                    placeholder='Enter ...'
                    autoComplete='off'
                    {...(errors.productTypeCode && { error: true, helperText: errors.productTypeCode.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={8}>
              <Controller
                name='productTypeName'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Product Type Name'
                    placeholder='Enter ...'
                    autoComplete='off'
                    {...(errors.productTypeName && { error: true, helperText: errors.productTypeName.message })}
                  />
                )}
              />
            </Grid>
          </Grid>
          <Grid container spacing={6} sx={{ mb: 5 }}>
            <Grid item xs={4}>
              <Controller
                name='customerInvoiceTo'
                control={control}
                render={({ field: { onChange, ...fieldProps } }) => (
                  <AsyncSelectCustom<CustomerInvoiceToOption>
                    label='Customer Invoice To Alphabet'
                    inputId='customerInvoiceTo'
                    {...fieldProps}
                    isClearable
                    cacheOptions
                    defaultOptions
                    onChange={value => {
                      onChange(value)
                    }}
                    loadOptions={inputValue => {
                      return fetchCustomerInvoiceToByLikeCustomerInvoiceToAlphabet(inputValue, 1)
                    }}
                    getOptionLabel={data => data.CUSTOMER_INVOICE_TO_ALPHABET.toString()}
                    getOptionValue={data => data.CUSTOMER_INVOICE_TO_ID.toString()}
                    classNamePrefix='select'
                    placeholder='Select ...'
                    {...(errors.customerInvoiceTo && { error: true, helperText: errors.customerInvoiceTo.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={8}>
              <Controller
                name='customerInvoiceToName'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Customer Invoice To Name (Auto)'
                    placeholder='Auto'
                    autoComplete='off'
                    value={watch('customerInvoiceTo')?.CUSTOMER_INVOICE_TO_NAME}
                    disabled
                  />
                )}
              />
            </Grid>
          </Grid>
          <Grid item xs={12} sx={{ mb: 2 }}>
            <Divider textAlign='left'>
              <Typography variant='body2' color='primary'>
                Matching with BOM (Actual)
              </Typography>
            </Divider>
          </Grid>
          <Grid container spacing={6} sx={{ mb: 5 }}>
            <Grid item xs={4}>
              <Box sx={{ position: 'relative' }}>
                <Controller
                  name='bom'
                  control={control}
                  render={({ field: { onChange, ...fieldProps } }) => (
                    <>
                      <AsyncSelectCustom<BomOption>
                        label='BOM (optional)'
                        inputId='bom'
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        key={`${watch('productMain')?.PRODUCT_MAIN_ID}`}
                        loadOptions={inputValue => {
                          return fetchByLikeBomCodeAndProductMainIdAndInuse(
                            inputValue || '',
                            1,
                            watch('productMain')?.PRODUCT_MAIN_ID
                          )
                        }}
                        onChange={value => {
                          onChange(value)
                          // setValue('process', null)
                        }}
                        getOptionLabel={data => data.BOM_CODE}
                        getOptionValue={data => data.BOM_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select ...'
                        {...(errors.bom && { error: true, helperText: errors.bom.message })}
                      />
                    </>
                  )}
                />
                {!watch('productMain') && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      bgcolor: 'rgba(0, 0, 0, 0.5)',
                      zIndex: 10,
                      borderRadius: 1,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'column',
                      pointerEvents: 'auto'
                    }}
                  >
                    <Typography sx={{ color: '#fff', fontWeight: 400, textAlign: 'center' }}>
                      Please select a Product Main before.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
            <Grid item xs={8}>
              <Controller
                name='bomName'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='BOM Name (Auto)'
                    placeholder='Auto'
                    autoComplete='off'
                    value={watch('bom')?.BOM_NAME || ''}
                    disabled
                  />
                )}
              />
            </Grid>
          </Grid>
          <Grid item xs={12} sx={{ mb: 2 }}>
            <Divider textAlign='left'>
              <Typography variant='body2' color='primary'>
                Select Account Code (optional)
              </Typography>
            </Divider>
          </Grid>
          <Grid container spacing={6}>
            <Grid item xs={4}>
              <Controller
                name='accountDepartmentCode'
                control={control}
                render={({ field: { ref, ...fieldProps } }) => (
                  <>
                    <AsyncSelectCustom
                      label='Account Department Code (optional)'
                      {...fieldProps}
                      isClearable
                      cacheOptions
                      defaultOptions
                      loadOptions={inputValue => {
                        return fetchAccountDepartmentCodeByLikeAccountDepartmentCodeAndInuse(inputValue, 1)
                      }}
                      getOptionLabel={data => data.ACCOUNT_DEPARTMENT_CODE}
                      getOptionValue={data => data.ACCOUNT_DEPARTMENT_CODE_ID.toString()}
                      classNamePrefix='select'
                      placeholder='Select ...'
                      {...(errors.accountDepartmentCode && {
                        error: true,
                        helperText: errors.accountDepartmentCode.message
                      })}
                    />
                  </>
                )}
              />
            </Grid>
            <Grid item xs={8}>
              <CustomTextField
                fullWidth
                label='Account Department Name (Auto)'
                placeholder='Auto'
                autoComplete='off'
                value={watch('accountDepartmentCode')?.ACCOUNT_DEPARTMENT_NAME ?? ''}
                disabled
              />
            </Grid>
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

export default ProductTypeAddModal
