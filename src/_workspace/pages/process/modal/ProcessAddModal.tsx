import { Dispatch, forwardRef, ReactElement, Ref, SetStateAction, useState } from 'react'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  Radio,
  RadioGroup,
  Slide,
  SlideProps,
  Typography
} from '@mui/material'

import { useQueryClient } from '@tanstack/react-query'

import { Controller, SubmitErrorHandler, useForm, useFormState } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'

import {
  maxLength,
  minLength,
  nonEmpty,
  nonNullable,
  nullable,
  number,
  object,
  pipe,
  regex,
  string,
  type Input
} from 'valibot'
import {
  maxLengthFieldMessage,
  minLengthFieldMessage,
  requiredFieldMessage,
  typeFieldMessage
} from '@/libs/valibot/error-message/errorMessage'

import { getUserData } from '@/utils/user-profile/userLoginProfile'

import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'

import { PREFIX_QUERY_KEY, useCreate } from '@/_workspace/react-query/hooks/useProcessData'

import CustomTextField from '@/components/mui/TextField'
import ConfirmModal from '@/components/ConfirmModal'
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
  PRODUCT_MAIN: nonNullable(
    nullable(
      object({
        PRODUCT_MAIN_ID: number(),
        PRODUCT_MAIN_NAME: string(),
        PRODUCT_MAIN_ALPHABET: string()
      })
    ),
    'Product Main is required'
  ),
  PROCESS_NAME: pipe(
    string(typeFieldMessage({ fieldName: 'Process Name', typeName: 'String' })),
    nonEmpty('Process Name is required'),
    minLength(3, minLengthFieldMessage({ fieldName: 'Process Name', minLength: 3 })),
    maxLength(200, maxLengthFieldMessage({ fieldName: 'Process Name', maxLength: 200 }))
  ),
  isAutoCreateFlowProcess: string()
})

type FormData = Input<typeof schema>

interface AddModalProps {
  openModalAdd: boolean
  setOpenModalAdd: Dispatch<SetStateAction<boolean>>
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const ProcessAddModal = ({ openModalAdd, setOpenModalAdd, setIsEnableFetching }: AddModalProps) => {
  // States : Dialog
  const [confirmModal, setConfirmModal] = useState(false)

  const queryClient = useQueryClient()

  // Hooks : react-hook-form
  const { control, getValues, handleSubmit } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      PRODUCT_MAIN: null,
      PROCESS_NAME: ''
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
    setOpenModalAdd(false)
    // reset()
  }

  const handleAdd = () => {
    setConfirmModal(false)

    const dataItem = {
      PRODUCT_MAIN_ID: getValues('PRODUCT_MAIN')?.PRODUCT_MAIN_ID,
      PRODUCT_MAIN_ALPHABET: getValues('PRODUCT_MAIN')?.PRODUCT_MAIN_ALPHABET,
      PROCESS_NAME: getValues('PROCESS_NAME'),
      isAutoCreateFlowProcess: getValues('isAutoCreateFlowProcess') == '1' ? 1 : 0,
      CREATE_BY: getUserData()?.EMPLOYEE_CODE
    }

    mutation.mutate(dataItem)
  }

  const onMutateSuccess = (data: any) => {
    if (data.data && data.data.Status == true) {
      // if (data.data.ResultOnDb.affectedRows === 0) {
      //   const message = {
      //     title: 'Add Process',
      //     message: 'ข้อมูลที่คุณต้องการบันทึก มีอยู่แล้ว Data already exists'
      //   }

      //   ToastMessageError(message)

      //   return
      // }

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
        message: data.data.Message
      }

      ToastMessageError(message)
    }
  }

  const onMutateError = (err: any) => {
    console.log(err)
    console.log('onMutateError')

    if (err?.response?.data?.Message) {
      const message = {
        title: 'Add Process',
        message: err.response.data.Message.split(':')[1].trim()
      }

      ToastMessageError(message)
    } else {
      const message = {
        title: 'Add Process',
        message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
      }

      ToastMessageError(message)
    }
  }

  const mutation = useCreate(onMutateSuccess, onMutateError)

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
        open={openModalAdd}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
        PaperProps={{ sx: { top: 30, m: 0 } }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            Add Process
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
                  {...(errors.PRODUCT_MAIN && {
                    error: true,
                    helperText: errors.PRODUCT_MAIN.message
                  })}
                />
              )}
            />
          </Grid>
          <Grid className='mb-5'>
            <Controller
              name='PROCESS_CODE'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Process Code (Auto)'
                  autoComplete='off'
                  disabled={true}
                  placeholder='PCS-XX-XXXX'
                />
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
          <Grid item xs={12} mt={3}>
            <Divider textAlign='left'>
              <Typography variant='body2' color='primary'>
                Auto Create Flow Process (1 Process in Flow)
              </Typography>
            </Divider>
          </Grid>
          <Grid item xs={12}>
            <FormControl error={Boolean(errors.isAutoCreateFlowProcess)}>
              <Controller
                name='isAutoCreateFlowProcess'
                control={control}
                defaultValue={'0'}
                render={({ field: { value, ...fieldProps } }) => (
                  <RadioGroup row {...fieldProps} name='radio-buttons-group'>
                    <FormControlLabel value='1' control={<Radio checked={value === '1'} />} label='Need' />
                    <FormControlLabel value='0' control={<Radio checked={value === '0'} />} label='No Need' />
                  </RadioGroup>
                )}
              />
              {errors.isAutoCreateFlowProcess && (
                <FormHelperText error>{errors.isAutoCreateFlowProcess.message}</FormHelperText>
              )}
            </FormControl>
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

export default ProcessAddModal
