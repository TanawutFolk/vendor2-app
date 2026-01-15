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

import { valibotResolver } from '@hookform/resolvers/valibot'
import { Controller, SubmitErrorHandler, useForm, useFormState } from 'react-hook-form'

import {
  maxLengthFieldMessage,
  minLengthFieldMessage,
  typeFieldMessage
} from '@/libs/valibot/error-message/errorMessage'
import { maxLength, minLength, nonEmpty, number, object, pipe, regex, string, type Input } from 'valibot'

import { getUserData } from '@/utils/user-profile/userLoginProfile'

import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import SelectCustom from '@/components/react-select/SelectCustom'

import { PREFIX_QUERY_KEY, useUpdate } from '@/_workspace/react-query/hooks/useVendor'

import ConfirmModal from '@/components/ConfirmModal'
import CustomTextField from '@/components/mui/TextField'

import { VendorI } from '@/_workspace/types/item-master/Vendor'

import {
  fetchItemImportTypeByItemImportTypeNameAndInuse,
  ItemImportTypeOption
} from '@/_workspace/react-select/async-promise-load-options/fetchItemImportType'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
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
  VENDOR_NAME: pipe(
    string(typeFieldMessage({ fieldName: 'Vendor Name', typeName: 'String' })),
    nonEmpty('Vendor Name is required'),
    minLength(3, minLengthFieldMessage({ fieldName: 'Vendor Name', minLength: 3 })),
    maxLength(50, maxLengthFieldMessage({ fieldName: 'Vendor Name', maxLength: 50 }))
  ),
  VENDOR_ALPHABET: pipe(
    string(),
    nonEmpty('Vendor Alphabet is required'),
    regex(/^[A-Z]+$/, 'Vendor Alphabet must contain only uppercase letters')
  ),
  ITEM_IMPORT_TYPE: object(
    {
      ITEM_IMPORT_TYPE_ID: number(),
      ITEM_IMPORT_TYPE_NAME: string()
    },
    'Item Import Type is required'
  )
})

type FormData = Input<typeof schema>

// Props
interface EditModalProps {
  openModalEdit: boolean
  setOpenModalEdit: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<VendorI> | null
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const VendorEditModal = ({ openModalEdit, setOpenModalEdit, rowSelected, setIsEnableFetching }: EditModalProps) => {
  // States : Dialog
  const [confirmModal, setConfirmModal] = useState(false)

  const queryClient = useQueryClient()

  // Hooks : react-hook-form
  const { control, getValues, handleSubmit, watch } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      VENDOR_NAME: rowSelected?.original.VENDOR_NAME,
      VENDOR_ALPHABET: rowSelected?.original.VENDOR_ALPHABET,
      ITEM_IMPORT_TYPE: {
        ITEM_IMPORT_TYPE_ID: rowSelected?.original.ITEM_IMPORT_TYPE_ID,
        ITEM_IMPORT_TYPE_NAME: rowSelected?.original.ITEM_IMPORT_TYPE_NAME
      },
      INUSE: StatusOption.find(item => item.value == rowSelected?.original.inuseForSearch)
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
    setOpenModalEdit(false)
    // reset()
  }

  const handleUpdate = () => {
    setConfirmModal(false)

    const dataItem = {
      VENDOR_ID: rowSelected?.original.VENDOR_ID,
      VENDOR_NAME: getValues('VENDOR_NAME').trim(),
      VENDOR_ALPHABET: getValues('VENDOR_ALPHABET').trim(),
      ITEM_IMPORT_TYPE_ID: getValues('ITEM_IMPORT_TYPE').ITEM_IMPORT_TYPE_ID,
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE,
      INUSE: getValues('INUSE')?.value
    }

    mutation.mutate(dataItem)
  }

  const onMutateSuccess = (data: any) => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Add Vendor'
      }

      ToastMessageSuccess(message)
      setIsEnableFetching(true)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      //reset()
      handleClose()
    } else {
      const message = {
        title: 'Add Vendor',
        message: data.data.Message
      }

      ToastMessageError(message)
    }
  }

  const onMutateError = () => {
    console.log('onMutateError')

    const message = {
      title: 'Add Vendor',
      message: 'ข้อมูลที่คุณต้องการบันทึก มีอยู่แล้ว Data already exists'
    }

    ToastMessageError(message)
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
        open={openModalEdit}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
        PaperProps={{ sx: { top: 30, m: 0 } }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            Edit Vendor
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid className='mb-3'>
            <Controller
              name='VENDOR_NAME'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Vendor Name'
                  placeholder='Enter ...'
                  autoComplete='off'
                  {...(errors.VENDOR_NAME && {
                    error: true,
                    helperText: errors.VENDOR_NAME.message
                  })}
                />
              )}
            />
          </Grid>
          <Grid className='mb-3'>
            <Controller
              name='VENDOR_ALPHABET'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Vendor Alphabet'
                  placeholder='Enter ...'
                  autoComplete='off'
                  {...(errors.VENDOR_ALPHABET && {
                    error: true,
                    helperText: errors.VENDOR_ALPHABET.message
                  })}
                />
              )}
            />
          </Grid>
          <Grid className='mb-3'>
            <Controller
              name='ITEM_IMPORT_TYPE'
              control={control}
              render={({ field: { onChange, ...fieldProps } }) => (
                <AsyncSelectCustom<ItemImportTypeOption>
                  label='Item Import Type'
                  inputId='ITEM_IMPORT_TYPE'
                  {...fieldProps}
                  isClearable
                  cacheOptions
                  defaultOptions
                  value={watch('ITEM_IMPORT_TYPE')}
                  onChange={value => {
                    onChange(value)
                  }}
                  loadOptions={inputValue => {
                    return fetchItemImportTypeByItemImportTypeNameAndInuse(inputValue)
                  }}
                  getOptionLabel={data => data.ITEM_IMPORT_TYPE_NAME.toString()}
                  getOptionValue={data => data.ITEM_IMPORT_TYPE_ID.toString()}
                  classNamePrefix='select'
                  placeholder='Select ...'
                  {...(errors.ITEM_IMPORT_TYPE && {
                    error: true,
                    helperText: errors.ITEM_IMPORT_TYPE.message
                  })}
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
                  isDisabled={rowSelected?.original.inuseForSearch === 1}
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
          onConfirmClick={handleUpdate}
          onCloseClick={() => setConfirmModal(false)}
          isDelete={false}
        />
      </Dialog>
    </>
  )
}

export default VendorEditModal
