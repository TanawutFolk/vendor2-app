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
import { valibotResolver } from '@hookform/resolvers/valibot'

import { maxLength, minLength, nonEmpty, object, pipe, regex, string, type Input } from 'valibot'
import {
  maxLengthFieldMessage,
  minLengthFieldMessage,
  requiredFieldMessage,
  typeFieldMessage
} from '@/libs/valibot/error-message/errorMessage'

import { getUserData } from '@/utils/user-profile/userLoginProfile'

import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import SelectCustom from '@/components/react-select/SelectCustom'

import { PREFIX_QUERY_KEY, useUpdate } from '@/_workspace/react-query/hooks/useProcessData'

import CustomTextField from '@/components/mui/TextField'
import ConfirmModal from '@/components/ConfirmModal'

import { ProcessI } from '@/_workspace/types/process/Process'

import StatusOptionForEdit from '@/libs/react-select/option/StatusOptionForEdit'
import StatusOption from '@/libs/react-select/option/StatusOption'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import {
  fetchProductMainByLikeProductMainNameAndInuse,
  ProductMainOption
} from '@/_workspace/react-select/async-promise-load-options/fetchProductMain'
import { SpecificationSettingI } from '@/_workspace/types/specification-setting/SpecificationSetting'

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
  rowSelected: MRT_Row<SpecificationSettingI> | null
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const SpecificationSettingViewModal = ({
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
      PRODUCT_MAIN: {
        PRODUCT_MAIN_ID: rowSelected?.original.PRODUCT_MAIN_ID,
        PRODUCT_MAIN_NAME: rowSelected?.original.PRODUCT_MAIN_NAME
      },
      CUSTOMER_ORDER_FROM: {
        CUSTOMER_ORDER_FROM_NAME: rowSelected?.original.CUSTOMER_ORDER_FROM_NAME,
        CUSTOMER_ORDER_FROM_ID: rowSelected?.original.CUSTOMER_ORDER_FROM_ID
      },
      SPECIFICATION_SETTING: rowSelected?.original?.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME,
      SPECIFICATION_SETTING_NUMBER: rowSelected?.original.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER,
      SPECIFICATION_SETTING_VERSION_REVISION:
        rowSelected?.original.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION,
      PRODUCT_PART_NUMBER: rowSelected?.original.PRODUCT_PART_NUMBER,
      INUSE: StatusOption.find(item => item.value == rowSelected?.original.INUSE)
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
      PRODUCT_SPECIFICATION_SETTING_ID: rowSelected?.original.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID,
      PRODUCT_MAIN_ID: getValues('PRODUCT_MAIN')?.PRODUCT_MAIN_ID || null,
      CUSTOMER_ORDER_FROM_ID: getValues('CUSTOMER_ORDER_FROM')?.CUSTOMER_ORDER_FROM_ID,
      PRODUCT_PART_NUMBER: getValues('PRODUCT_PART_NUMBER'),
      PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER: getValues('SPECIFICATION_SETTING_NUMBER'),
      PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME: getValues('SPECIFICATION_SETTING'),
      PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION: getValues('SPECIFICATION_SETTING_VERSION_REVISION'),
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
    console.log(data)
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
            View Product Specification Document Setting
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid className='mb-5'>
            <Controller
              name='PRODUCT_MAIN'
              control={control}
              render={({ field: { onChange, ...fieldProps } }) => (
                <AsyncSelectCustom<ProductMainOption>
                  label='Product Main'
                  inputId='PRODUCT_MAIN'
                  {...fieldProps}
                  isClearable
                  cacheOptions
                  defaultOptions
                  value={getValues('PRODUCT_MAIN')}
                  onChange={value => {
                    onChange(value)
                  }}
                  loadOptions={inputValue => {
                    return fetchProductMainByLikeProductMainNameAndInuse(inputValue, 1)
                  }}
                  getOptionLabel={data => data.PRODUCT_MAIN_NAME?.toString()}
                  getOptionValue={data => data.PRODUCT_MAIN_ID?.toString()}
                  classNamePrefix='select'
                  placeholder='Select Product Main ...'
                  isDisabled={true}
                />
              )}
            />
          </Grid>

          <Grid className='mb-5'>
            <Controller
              name='SPECIFICATION_SETTING'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Product Specification Document Setting Name'
                  placeholder='Enter Product Specification Document Setting Name'
                  autoComplete='off'
                  disabled={true}
                />
              )}
            />
          </Grid>

          <Grid className='mb-5'>
            <Controller
              name='SPECIFICATION_SETTING_NUMBER'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Product Specification Document Setting Number'
                  placeholder='Enter Product Specification Document Setting Number'
                  autoComplete='off'
                  disabled={true}
                />
              )}
            />
          </Grid>

          <Grid className='mb-5'>
            <Controller
              name='SPECIFICATION_SETTING_VERSION_REVISION'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Product Specification Document Setting Version Revision'
                  placeholder='Enter Product Specification Document Setting Version Revision'
                  autoComplete='off'
                  disabled={true}
                />
              )}
            />
          </Grid>

          <Grid className='mb-5'>
            <Controller
              name='PRODUCT_PART_NUMBER'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Product Part Number'
                  placeholder='Enter Product Part Number'
                  autoComplete='off'
                  disabled={true}
                />
              )}
            />
          </Grid>

          <Grid className='mb-5'>
            <Controller
              name='CUSTOMER_ORDER_FROM'
              control={control}
              render={({ field: { onChange, ...fieldProps } }) => (
                <AsyncSelectCustom<ProductMainOption>
                  label='Customer Order From'
                  inputId='CUSTOMER_ORDER_FROM'
                  {...fieldProps}
                  isClearable
                  cacheOptions
                  defaultOptions
                  value={getValues('CUSTOMER_ORDER_FROM')}
                  onChange={value => {
                    onChange(value)
                  }}
                  loadOptions={inputValue => {
                    return fetchProductMainByLikeProductMainNameAndInuse(inputValue, 1)
                  }}
                  getOptionLabel={data => data?.CUSTOMER_ORDER_FROM_NAME?.toString()}
                  getOptionValue={data => data?.CUSTOMER_ORDER_FROM_ID?.toString()}
                  classNamePrefix='select'
                  placeholder='Select Customer Order From'
                  isDisabled={true}
                />
              )}
            />
          </Grid>

          <Grid className='mb-5'>
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

export default SpecificationSettingViewModal
