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

// Dialog
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

// Schema with Valibot
const schema = object({
  PROCESS_NAME: pipe(
    string(typeFieldMessage({ fieldName: 'Process Name', typeName: 'String' })),
    nonEmpty('Process Name is required'),
    minLength(3, minLengthFieldMessage({ fieldName: 'Process Name', minLength: 3 })),
    maxLength(200, maxLengthFieldMessage({ fieldName: 'Process Name', maxLength: 200 }))
  )
})

type FormData = Input<typeof schema>

// Props
interface EditModalProps {
  openModalEdit: boolean
  setOpenModalEdit: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<ProcessI> | null
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const ProcessEditModal = ({ openModalEdit, setOpenModalEdit, rowSelected, setIsEnableFetching }: EditModalProps) => {
  // States : Dialog
  const [confirmModal, setConfirmModal] = useState(false)

  const queryClient = useQueryClient()

  // Hooks : react-hook-form
  const { control, getValues, handleSubmit } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      PRODUCT_MAIN: {
        PRODUCT_MAIN_ID: rowSelected?.original.PRODUCT_MAIN_ID,
        PRODUCT_MAIN_NAME: rowSelected?.original.PRODUCT_MAIN_NAME
      },
      PROCESS_CODE: rowSelected?.original.PROCESS_CODE,
      PROCESS_NAME: rowSelected?.original.PROCESS_NAME
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
      PROCESS_ID: rowSelected?.original.PROCESS_ID,
      PROCESS_NAME: getValues('PROCESS_NAME'),
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE
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
        message: 'ข้อมูลที่คุณต้องการบันทึก มีอยู่แล้ว Data already exists'
      }

      ToastMessageError(message)
    }
  }

  const onMutateError = () => {
    console.log('onMutateError')

    const message = {
      title: 'Add Process',
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
            Edit Process
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
                  getOptionLabel={data => data.PRODUCT_MAIN_NAME.toString()}
                  getOptionValue={data => data.PRODUCT_MAIN_ID.toString()}
                  classNamePrefix='select'
                  placeholder='Select Product Main ...'
                  isDisabled={true}
                />
              )}
            />
          </Grid>
          <Grid className='mb-5'>
            <Controller
              name='PROCESS_CODE'
              control={control}
              render={({ field }) => (
                <CustomTextField {...field} fullWidth label='Process Code (Auto)' autoComplete='off' disabled={true} />
              )}
            />
          </Grid>
          <Grid className='mb-5'>
            <Controller
              name='PROCESS_NAME'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Process Name'
                  placeholder='Enter Process Name'
                  autoComplete='off'
                  {...(errors.PROCESS_NAME && {
                    error: true,
                    helperText: errors.PROCESS_NAME.message
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
          onConfirmClick={handleUpdate}
          onCloseClick={() => setConfirmModal(false)}
          isDelete={false}
        />
      </Dialog>
    </>
  )
}

export default ProcessEditModal
