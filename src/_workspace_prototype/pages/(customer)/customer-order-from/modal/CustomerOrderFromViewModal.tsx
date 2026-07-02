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

import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import SelectCustom from '@/components/react-select/SelectCustom'

import { PREFIX_QUERY_KEY, useUpdate } from '@/_workspace/react-query/hooks/useProcessData'

import CustomTextField from '@/components/mui/TextField'

import StatusOption from '@/libs/react-select/option/StatusOption'
import StatusOptionForEdit from '@/libs/react-select/option/StatusOptionForEdit'

import { CustomerOrderFromInterface } from '@/_workspace/types/customer/CustomerOrderFrom'

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
  rowSelected: MRT_Row<CustomerOrderFromInterface> | null
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const CustomerOrderFromViewModal = ({
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
      CUSTOMER_ORDER_FROM_NAME: rowSelected?.original?.CUSTOMER_ORDER_FROM_NAME,
      CUSTOMER_ORDER_FROM_ALPHABET: rowSelected?.original.CUSTOMER_ORDER_FROM_ALPHABET,
      // PRODUCT_SUB_CODE: rowSelected?.original?.PRODUCT_SUB_CODE,
      // PRODUCT_SUB_NAME: rowSelected?.original?.PRODUCT_SUB_NAME,
      // PRODUCT_SUB_ALPHABET: rowSelected?.original?.PRODUCT_SUB_ALPHABET,
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
            View Customer Order From
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          {/* <Grid className='mb-5'>
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
                  getOptionLabel={data => data.PRODUCT_MAIN_NAME.toString()}
                  getOptionValue={data => data.PRODUCT_MAIN_ID.toString()}
                  classNamePrefix='select'
                  placeholder='Select Product Main ...'
                  isDisabled={true}
                />
              )}
            />
          </Grid> */}

          <Grid className='mb-3'>
            <Controller
              name='CUSTOMER_ORDER_FROM_NAME'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Customer Order From Name'
                  placeholder='Enter...'
                  autoComplete='off'
                  disabled={true}
                />
              )}
            />
          </Grid>

          <Grid className='mb-3'>
            <Controller
              name='CUSTOMER_ORDER_FROM_ALPHABET'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Customer Order From Alphabet'
                  placeholder='Enter...'
                  autoComplete='off'
                  disabled={true}
                />
              )}
            />
          </Grid>

          {/* <Grid className='mb-5'>
            <Controller
              name='PRODUCT_SUB_CODE'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Product Sub Code'
                  placeholder='Enter Product Sub Code'
                  autoComplete='off'
                  disabled={true}
                />
              )}
            />
          </Grid>

          <Grid className='mb-5'>
            <Controller
              name='PRODUCT_SUB_NAME'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Product Sub Name'
                  placeholder='Enter Product Sub Name'
                  autoComplete='off'
                  disabled={true}
                />
              )}
            />
          </Grid>

          <Grid className='mb-5'>
            <Controller
              name='PRODUCT_SUB_ALPHABET'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Product Sub Alphabet'
                  placeholder='Enter Product Sub Alphabet'
                  autoComplete='off'
                  disabled={true}
                />
              )}
            />
          </Grid> */}

          {/* <Grid className='mb-5'>
            <Controller
              name='FFT_PART_NUMBER'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='FFT Part Number'
                  placeholder='Enter FFT Part Number'
                  autoComplete='off'
                  disabled={true}
                />
              )}
            />
          </Grid> */}

          {/* <Grid className='mb-5'>
            <Controller
              name='SUFFIX_FOR_PART_NUMBER'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Suffix For Part Number'
                  placeholder='Enter Suffix For Part Number'
                  autoComplete='off'
                  disabled={true}
                />
              )}
            />
          </Grid> */}

          {/* <Grid className='mb-5'>
            <Controller
              name='IS_PRODUCT_FOR_REPAIR'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Product For Repair'
                  placeholder='Enter Product For Repair'
                  value={field.value === '1' ? 'Yes' : field.value === '0' ? 'No' : field.value}
                  autoComplete='off'
                  disabled={true}
                />
              )}
            />
          </Grid> */}

          {/* <Grid className='mb-5'>
            <Controller
              name='IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Selected Product Level for Gen Product Type Code'
                  placeholder='Enter Selected Product Level for Gen Product Type Code'
                  value={field.value === '1' ? 'Product Main' : field.value === '0' ? 'Product Sub' : field.value}
                  autoComplete='off'
                  disabled={true}
                />
              )}
            />
          </Grid> */}

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

export default CustomerOrderFromViewModal
