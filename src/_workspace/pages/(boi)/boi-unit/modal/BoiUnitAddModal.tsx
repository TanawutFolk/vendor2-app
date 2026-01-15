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

import { maxLength, minLength, nonEmpty, object, pipe, regex, string } from 'valibot'

import type { Input } from 'valibot'

import { valibotResolver } from '@hookform/resolvers/valibot'

import DialogCloseButton from '@components/dialogs/DialogCloseButton'

import CustomTextField from '@/@core/components/mui/TextField'
import { useCreateBoiUnit } from '@/_workspace/react-query/hooks/useBoiUnitData'
import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useProductCategoryData'
import ConfirmModal from '@/components/ConfirmModal'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import {
  maxLengthFieldMessage,
  minLengthFieldMessage,
  typeFieldMessage,
  uppercaseFieldMessage
} from '@/libs/valibot/error-message/errorMessage'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { AxiosResponseWithErrorI } from '@/libs/axios/types/AxiosResponseInterface'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

export type FormData = Input<typeof schema>

const schema = object({
  boiUnitName: pipe(
    string(typeFieldMessage({ fieldName: 'BOI Unit Name', typeName: 'String' })),
    nonEmpty('Please enter your BOI Unit Name'),
    minLength(3, minLengthFieldMessage({ fieldName: 'BOI Unit Name', minLength: 3 }))
  ),

  boiUnitSymbol: pipe(
    string(typeFieldMessage({ fieldName: 'BOI Unit Symbol', typeName: 'String' })),
    nonEmpty('Please enter your Product Category Alphabet'),
    minLength(2, minLengthFieldMessage({ fieldName: 'BOI Unit Symbol', minLength: 2 })),
    maxLength(2, maxLengthFieldMessage({ fieldName: 'BOI Unit Symbol', maxLength: 2 })),
    regex(/^[A-Z]/, uppercaseFieldMessage({ fieldName: 'BOI Unit Symbol' }))
  )
})
// productCategoryAlphabet: string(typeFieldMessage({ fieldName: 'Product Category Alphabet', typeName: 'String' }), [
//   regex(/[A-Z]/, uppercaseFieldMessage({ fieldName: 'Product Category Alphabet' }))
// ])

interface BoiUnitAddModalProps {
  openModalAdd: boolean
  setOpenModalAdd: Dispatch<SetStateAction<boolean>>
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}
const BoiUnitAddModal = ({ openModalAdd, setOpenModalAdd, setIsEnableFetching }: BoiUnitAddModalProps) => {
  // useState

  // States : Modal
  // const [openModalAdd, setOpenModalAdd] = useState<boolean>(false)
  const [confirmModal, setConfirmModal] = useState(false)

  const handleClose = () => {
    setOpenModalAdd(false)
    reset()
  }

  // Hooks : react-hook-form
  const { control, handleSubmit, reset, getValues } = useForm<FormData>({
    resolver: valibotResolver(schema),
    // defaultValues
    defaultValues: {
      boiUnitName: '',
      boiUnitSymbol: ''
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
      BOI_UNIT_NAME: getValues('boiUnitName').trim(),
      BOI_UNIT_SYMBOL: getValues('boiUnitSymbol').trim(),
      CREATE_BY: getUserData()?.EMPLOYEE_CODE,
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE
    }
    mutation.mutate(dataItem)
    // queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
  }

  const onMutateSuccess = data => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Add Product Category'
      }

      ToastMessageSuccess(message)
      setIsEnableFetching(true)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      //reset()
      handleClose()
    } else {
      const message = {
        title: 'Add BOI Unit',
        message: data.data.Message
      }

      ToastMessageError(message)
    }
  }

  const onMutateError = (e: AxiosResponseWithErrorI) => {
    const message = {
      title: 'Add BOI Unit',
      message: e.message
    }

    ToastMessageError(message)
    setConfirmModal(false)
  }

  const mutation = useCreateBoiUnit(onMutateSuccess, onMutateError)

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
            Add BOI Unit
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          {/* <Grid className='mb-5'>
            <Controller
              name='productCategoryName'
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
                    {...(errors.productCategoryName && { error: true, helperText: errors.productCategoryName.message })}
                  />
                </>
              )}
            />
           </Grid> */}
          {/* <Grid className='mb-5'>
            <Controller
              name='productCategoryCode'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  disabled
                  label='Product Category Code'
                  value='....................................................PD-C-XXXX....................................................'
                  autoComplete='off'
                  {...(errors.productCategoryCode && { error: true, helperText: errors.productCategoryCode.message })}
                />
              )}
            />
          </Grid> */}
          <Grid className='mb-3'>
            <Controller
              name='boiUnitName'
              control={control}
              // render={({ field }) => (
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='BOI Unit Name'
                  placeholder='Enter ...'
                  autoComplete='off'
                  {...(errors.boiUnitName && {
                    error: true,
                    helperText: errors.boiUnitName.message
                  })}
                />
              )}
            />
          </Grid>
          <Grid>
            <Controller
              name='boiUnitSymbol'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='BOI Unit Symbol'
                  placeholder='Enter ...'
                  autoComplete='off'
                  {...(errors.boiUnitSymbol && {
                    error: true,
                    helperText: errors.boiUnitSymbol.message
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

export default BoiUnitAddModal
