// React Imports
import type { Ref, ReactElement, Dispatch, SetStateAction, MutableRefObject, useRef } from 'react'
import { forwardRef, useEffect, useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import type { SlideProps } from '@mui/material'
import { Grid, Slide } from '@mui/material'
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, useForm, useFormState } from 'react-hook-form'

// Components Imports
import { useQueryClient } from '@tanstack/react-query'

import AddIcon from '@mui/icons-material/Add'

import {
  object,
  string,
  nullable,
  number,
  unknown,
  array,
  boolean,
  picklist,
  optional,
  record,
  minLength,
  maxLength,
  toTrimmed,
  regex,
  pipe,
  nonEmpty,
  nullish,
  value
} from 'valibot'

import type { Input } from 'valibot'

import { valibotResolver } from '@hookform/resolvers/valibot'

import type { MRT_Row } from 'material-react-table'

import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import { PREFIX_QUERY_KEY, useUpdateProductCategory } from '@/_workspace/react-query/hooks/useProductCategoryData'
import CustomTextField from '@/@core/components/mui/TextField'

import {
  maxLengthFieldMessage,
  minLengthFieldMessage,
  requiredFieldMessage,
  typeFieldMessage,
  uppercaseFieldMessage
} from '@/libs/valibot/error-message/errorMessage'

import ConfirmModal from '@/components/ConfirmModal'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

import StatusColumn from '@/libs/material-react-table/components/StatusOption'
import SelectCustom from '@/components/react-select/SelectCustom'
import StatusOptionForEdit from '@/libs/react-select/option/StatusOptionForEdit'
import { SpecificationSettingI } from '@/_workspace/types/specification-setting/SpecificationSetting'
import { useUpdateBoiUnit } from '@/_workspace/react-query/hooks/useBoiUnitData'
import { useUpdateSpecificationSetting } from '@/_workspace/react-query/hooks/useSpecificationSettingData'
import { fetchProductMainByLikeProductMainNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchProductMain'

import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import { fetchCustomerOrderFromByLikeCustomerOrderFromNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/customer/fetchCustomerOrderFrom'
import { fetchProductSpecificationTypeByLikeProductSpecificationTypeNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/specification-setting/fetchSpecificationType'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

export type FormData = Input<typeof schema>

const schema = object({
  productMain: nullish(
    object({
      PRODUCT_MAIN_ID: number()
      // PRODUCT_MAIN_NAME: string()
    })
  ),
  customerOrderFrom: nullish(
    object({
      CUSTOMER_ORDER_FROM_ID: number()
    })
  ),
  specificationSetting: pipe(
    string(typeFieldMessage({ fieldName: 'Product Specification Setting', typeName: 'String' })),
    nonEmpty('Please enter your Product Specification Setting')
  ),

  partNumber: pipe(
    string(typeFieldMessage({ fieldName: 'Product Part Number', typeName: 'String' })),
    maxLength(20, minLengthFieldMessage({ fieldName: 'Product Part Number', minLength: 20 })),
    minLength(8, minLengthFieldMessage({ fieldName: 'Product Part Number', minLength: 8 })),
    nonEmpty('Please enter your Product Part Number')
  ),
  modelNumber: nullable(string()),
  specificationSettingNumber: pipe(
    string(typeFieldMessage({ fieldName: 'Product Specification Setting Number', typeName: 'String' })),
    nonEmpty('Please enter your Product Specification Setting Number')
  ),
  specificationSettingVersionRevision: pipe(
    string(typeFieldMessage({ fieldName: 'Product Specification Setting Version Revision', typeName: 'String' })),
    nonEmpty('Please enter your Product Specification Setting Version Revision')
  )
})

interface SpecificationSettingEditModalProps {
  openModalEdit: boolean
  setOpenModalEdit: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<SpecificationSettingI> | null
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const SpecificationSettingEditModal = ({
  openModalEdit,
  setOpenModalEdit,
  rowSelected,
  setIsEnableFetching
}: SpecificationSettingEditModalProps) => {
  const [confirmModal, setConfirmModal] = useState(false)

  const handleClickOpen = () => setOpenModalEdit(true)
  const handleClose = () => {
    setOpenModalEdit(false)
  }

  const { watch, control, handleSubmit, setValue, reset, getValues } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      productMain:
        rowSelected?.original.PRODUCT_MAIN_NAME || rowSelected?.original.PRODUCT_MAIN_ID
          ? {
              PRODUCT_MAIN_NAME: rowSelected?.original.PRODUCT_MAIN_NAME,
              PRODUCT_MAIN_ID: rowSelected?.original.PRODUCT_MAIN_ID
            }
          : null,
      // productMain: rowSelected?.original.PRODUCT_MAIN_ID || null,
      specificationSetting: rowSelected?.original.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME || '',
      specificationSettingNumber: rowSelected?.original.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER || '',
      specificationSettingVersionRevision:
        rowSelected?.original.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION || '',
      partNumber: rowSelected?.original.PRODUCT_PART_NUMBER || '',
      modelNumber: rowSelected?.original.PRODUCT_MODEL_NUMBER || '',
      customerOrderFrom:
        rowSelected?.original.CUSTOMER_ORDER_FROM_NAME || rowSelected?.original.CUSTOMER_ORDER_FROM_ID
          ? {
              CUSTOMER_ORDER_FROM_NAME: rowSelected?.original.CUSTOMER_ORDER_FROM_NAME,
              CUSTOMER_ORDER_FROM_ID: rowSelected?.original.CUSTOMER_ORDER_FROM_ID
            }
          : '',
      productSpecificationType:
        rowSelected?.original.PRODUCT_SPECIFICATION_TYPE_NAME || rowSelected?.original.PRODUCT_SPECIFICATION_TYPE_ID
          ? {
              PRODUCT_SPECIFICATION_TYPE_NAME: rowSelected?.original.PRODUCT_SPECIFICATION_TYPE_NAME,
              PRODUCT_SPECIFICATION_TYPE_ID: rowSelected?.original.PRODUCT_SPECIFICATION_TYPE_ID
            }
          : null,
      // PRODUCT_SPECIFICATION_TYPE_NAME: rowSelected?.original.PRODUCT_SPECIFICATION_TYPE_NAME,
      // PRODUCT_SPECIFICATION_TYPE_ID: rowSelected?.original.PRODUCT_SPECIFICATION_TYPE_ID

      // customerOrderFrom: rowSelected?.original.CUSTOMER_ORDER_FROM_ID,
      status: StatusColumn.find(dataItem => dataItem.value === Number(rowSelected?.original.INUSE))
    }
  })
  console.log('Default Values via getValues:', getValues())
  console.log('CCC', rowSelected?.original.PRODUCT_MAIN_NAME)
  // const { control, handleSubmit, setValue } = reactHookFormMethods

  const { errors } = useFormState({
    control
  })

  const onSubmit = () => {
    console.log('ok')
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
      PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID: rowSelected?.original.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID,
      PRODUCT_MAIN_ID: getValues('productMain')?.PRODUCT_MAIN_ID ?? '',
      CUSTOMER_ORDER_FROM_ID: getValues('customerOrderFrom')?.CUSTOMER_ORDER_FROM_ID ?? '',
      PRODUCT_SPECIFICATION_TYPE_ID: getValues('productSpecificationType')?.PRODUCT_SPECIFICATION_TYPE_ID,
      PRODUCT_PART_NUMBER: getValues('partNumber'),
      PRODUCT_MODEL_NUMBER: getValues('modelNumber'),
      PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER: getValues('specificationSettingNumber') || '',
      PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME: getValues('specificationSetting') || '',
      PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION: getValues('specificationSettingVersionRevision') || '',
      INUSE: getValues('status').value,
      CREATE_BY: getUserData()?.EMPLOYEE_CODE,
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE
    }
    console.log('dataForSpec', dataItem)
    mutation.mutate(dataItem)
  }

  const onMutateSuccess = data => {
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
        title: 'Add Product Main',
        message: data.data.Message.startsWith('1062')
          ? 'Duplicate Product Main'
          : 'Data is duplicate. Please change Sub Process'
      }

      ToastMessageError(message)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      reset()
      handleClose()
    }
    console.log('onMutateSuccess')
  }
  const onMutateError = (e: any) => {
    console.log('onMutateError', e)
  }
  const mutation = useUpdateSpecificationSetting(onMutateSuccess, onMutateError)

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
            Edit Product Specification Document Setting
            {/* {rowSelected?.original.CUSTOMER_ORDER_FROM_ID} */}
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid className='mb-5'>
            <Controller
              name='productMain'
              control={control}
              // value={getValues('productMain')}
              // defaultValue={
              //   rowSelected.original.PRODUCT_MAIN_ID
              //     ? {
              //         PRODUCT_MAIN_ID: rowSelected.original.PRODUCT_MAIN_ID,
              //         PRODUCT_MAIN_NAME: rowSelected.original.PRODUCT_MAIN_NAME
              //         // PRODUCT_SUB_ALPHABET: row.original.PRODUCT_SUB_ALPHABET
              //       }
              //     : null
              // }
              render={({ field: { onChange, ...fieldProps } }) => (
                <AsyncSelectCustom
                  {...fieldProps}
                  isClearable
                  inputId='productMain'
                  value={getValues('productMain')}
                  // value={rowSelected?.original.PRODUCT_MAIN_NAME || ''}
                  onChange={value => {
                    onChange(value)
                    // console.log('valueForEdit', value)
                  }}
                  cacheOptions
                  defaultOptions
                  loadOptions={inputValue => {
                    return fetchProductMainByLikeProductMainNameAndInuse(inputValue, 1)
                  }}
                  getOptionLabel={data => data.PRODUCT_MAIN_NAME}
                  getOptionValue={data => data.PRODUCT_MAIN_ID?.toString()}
                  label='Product Main'
                  placeholder='Enter Product Main'
                  classNamePrefix='select'
                  {...(errors.productMain && {
                    error: true,
                    helperText: errors.productMain.message
                  })}
                />
              )}
            />
          </Grid>

          <Grid className='mb-5'>
            <Controller
              name='specificationSetting'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Product Specification Document Setting Name'
                  placeholder='Enter Product Specification Document Setting Name'
                  autoComplete='off'
                  {...(errors.specificationSetting && {
                    error: true,
                    helperText: errors.specificationSetting.message
                  })}
                />
              )}
            />
          </Grid>
          <Grid className='mb-5'>
            <Controller
              name='specificationSettingNumber'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Product Specification Document Setting Number'
                  placeholder='Enter Product Specification Document Setting Number'
                  autoComplete='off'
                  {...(errors.specificationSettingNumber && {
                    error: true,
                    helperText: errors.specificationSettingNumber.message
                  })}
                />
              )}
            />
          </Grid>
          <Grid className='mb-5'>
            <Controller
              name='specificationSettingVersionRevision'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Product Specification Document Setting Version Revision'
                  placeholder='Enter Product Specification Document Version Revision'
                  autoComplete='off'
                  {...(errors.specificationSettingVersionRevision && {
                    error: true,
                    helperText: errors.specificationSettingVersionRevision.message
                  })}
                />
              )}
            />
          </Grid>
          <Grid className='mb-5'>
            <Controller
              name='partNumber'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Product Part Number'
                  placeholder='Enter Product Part Number'
                  autoComplete='off'
                  {...(errors.partNumber && {
                    error: true,
                    helperText: errors.partNumber.message
                  })}
                />
              )}
            />
          </Grid>
          <Grid className='mb-5'>
            <Controller
              name='modelNumber'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Product Model Number'
                  placeholder='Enter Product Model Number'
                  autoComplete='off'
                  {...(errors.partNumber && {
                    error: true,
                    helperText: errors.modelNumber.message
                  })}
                />
              )}
            />
          </Grid>
          {/* {JSON.stringify(watch(`customerOrderFrom`))} */}
          <Grid className='mb-5'>
            <Controller
              name='customerOrderFrom'
              control={control}
              // defaultValue={rowSelected?.original?.CUSTOMER_ORDER_FROM_NAME}
              render={({ field: { ...fieldProps } }) => (
                <AsyncSelectCustom
                  {...fieldProps}
                  isClearable
                  cacheOptions
                  defaultOptions
                  loadOptions={inputValue => {
                    return fetchCustomerOrderFromByLikeCustomerOrderFromNameAndInuse(inputValue, '1')
                  }}
                  getOptionLabel={data => data?.CUSTOMER_ORDER_FROM_NAME}
                  getOptionValue={data => data?.CUSTOMER_ORDER_FROM_ID?.toString()}
                  label='Customer Order From'
                  placeholder='Enter Customer Order From'
                  classNamePrefix='select'
                  {...(errors.customerOrderFrom && {
                    error: true,
                    helperText: errors.customerOrderFrom.message
                  })}
                />
              )}
            />
          </Grid>

          <Grid className='mb-5'>
            <Controller
              name='productSpecificationType'
              control={control}
              // defaultValue={rowSelected?.original?.CUSTOMER_ORDER_FROM_NAME}
              render={({ field: { ...fieldProps } }) => (
                <AsyncSelectCustom
                  {...fieldProps}
                  isClearable
                  cacheOptions
                  defaultOptions
                  // value={getValues('searchFilters.productSpecificationType')}
                  loadOptions={inputValue => {
                    return fetchProductSpecificationTypeByLikeProductSpecificationTypeNameAndInuse(inputValue, 1)
                  }}
                  getOptionLabel={data => data?.PRODUCT_SPECIFICATION_TYPE_NAME}
                  getOptionValue={data => data?.PRODUCT_SPECIFICATION_TYPE_ID?.toString()}
                  label='Product Specification Type'
                  placeholder='Enter Product Specification Type'
                  classNamePrefix='select'
                  {...(errors.productSpecificationType && {
                    error: true,
                    helperText: errors.productSpecificationType.message
                  })}
                />
              )}
            />
          </Grid>
          <Grid className='mb-5'>
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

export default SpecificationSettingEditModal
