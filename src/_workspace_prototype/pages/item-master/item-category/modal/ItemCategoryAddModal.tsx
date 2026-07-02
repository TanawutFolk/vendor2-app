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

import { useQueryClient } from '@tanstack/react-query'

import { valibotResolver } from '@hookform/resolvers/valibot'
import { Controller, SubmitErrorHandler, useForm, useFormState } from 'react-hook-form'

import {
  maxLengthFieldMessage,
  minLengthFieldMessage,
  typeFieldMessage
} from '@/libs/valibot/error-message/errorMessage'
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

import { getUserData } from '@/utils/user-profile/userLoginProfile'

import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'

import { PREFIX_QUERY_KEY, useCreate } from '@/_workspace/react-query/hooks/useItemCategory'

import ConfirmModal from '@/components/ConfirmModal'
import CustomTextField from '@/components/mui/TextField'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'

import {
  fetchPurchaseModuleNameByPurchaseModuleNameAndInuse,
  PurchaseModuleOption
} from '@/_workspace/react-select/async-promise-load-options/fetchPurchaseModuleName'

// Dialog
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

// Schema with Valibot
const schema = object({
  ITEM_CATEGORY_NAME: pipe(
    string(typeFieldMessage({ fieldName: 'Item Category Name', typeName: 'String' })),
    nonEmpty('Item Category Name is required'),
    minLength(3, minLengthFieldMessage({ fieldName: 'Item Category Name', minLength: 3 })),
    maxLength(50, maxLengthFieldMessage({ fieldName: 'Item Category Name', maxLength: 50 }))
    // regex(/^\S+$/, 'Process Name must not contain spaces')
  ),
  ITEM_CATEGORY_ALPHABET: pipe(
    string(),
    nonEmpty('Item Category Alphabet is required'),
    maxLength(1, maxLengthFieldMessage({ fieldName: 'Item Category Name', maxLength: 1 })),
    regex(/[A-Z]/, 'Item Category Alphabet must contain a uppercase letter')
  ),
  ITEM_CATEGORY_SHORT_NAME: pipe(string(), nonEmpty('Item Category Short Name is required')),
  PURCHASE_MODULE_NAME: nonNullable(
    nullable(
      object({
        PURCHASE_MODULE_ID: number(),
        PURCHASE_MODULE_NAME: string()
      })
    ),
    'Purchase Module Name is required'
  )
})

type FormData = Input<typeof schema>

interface AddModalProps {
  openModalAdd: boolean
  setOpenModalAdd: Dispatch<SetStateAction<boolean>>
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const ItemCategoryAddModal = ({ openModalAdd, setOpenModalAdd, setIsEnableFetching }: AddModalProps) => {
  // States : Dialog
  const [confirmModal, setConfirmModal] = useState(false)

  const queryClient = useQueryClient()

  // Hooks : react-hook-form
  const { control, getValues, handleSubmit } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      ITEM_CATEGORY_NAME: '',
      ITEM_CATEGORY_ALPHABET: '',
      ITEM_CATEGORY_SHORT_NAME: '',
      PURCHASE_MODULE_NAME: null
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
      ITEM_CATEGORY_NAME: getValues('ITEM_CATEGORY_NAME').trim(),
      ITEM_CATEGORY_ALPHABET: getValues('ITEM_CATEGORY_ALPHABET').trim(),
      ITEM_CATEGORY_SHORT_NAME: getValues('ITEM_CATEGORY_SHORT_NAME').trim(),
      PURCHASE_MODULE_ID: getValues('PURCHASE_MODULE_NAME')?.PURCHASE_MODULE_ID,
      CREATE_BY: getUserData()?.EMPLOYEE_CODE
    }

    mutation.mutate(dataItem)
  }

  const onMutateSuccess = (data: any) => {
    if (data.data && data.data.Status == true) {
      if (data.data.ResultOnDb.affectedRows === 0) {
        const message = {
          title: 'Add Item Category',
          message: 'ข้อมูลที่คุณต้องการบันทึก มีอยู่แล้ว Data already exists'
        }

        ToastMessageError(message)

        return
      }

      const message = {
        message: data.data.Message,
        title: 'Add Item Category'
      }

      ToastMessageSuccess(message)
      setIsEnableFetching(true)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      //reset()
      handleClose()
    } else {
      const message = {
        title: 'Add Item Category',
        message: data.data.Message
      }

      ToastMessageError(message)
    }
  }

  const onMutateError = (err: any) => {
    console.log(err)
    console.log('onMutateError')

    const message = {
      title: 'Add Item Category',
      message: 'ข้อมูลที่คุณต้องการบันทึก มีอยู่แล้ว Data already exists'
    }

    ToastMessageError(message)
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
            Add Item Category
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid className='mb-3'>
            <Controller
              name='ITEM_CATEGORY_NAME'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Item Category Name'
                  placeholder='Enter ...'
                  autoComplete='off'
                  {...(errors.ITEM_CATEGORY_NAME && {
                    error: true,
                    helperText: errors.ITEM_CATEGORY_NAME.message
                  })}
                />
              )}
            />
          </Grid>
          <Grid className='mb-3'>
            <Controller
              name='ITEM_CATEGORY_ALPHABET'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Item Category Alphabet'
                  placeholder='Enter ...'
                  autoComplete='off'
                  {...(errors.ITEM_CATEGORY_ALPHABET && {
                    error: true,
                    helperText: errors.ITEM_CATEGORY_ALPHABET.message
                  })}
                />
              )}
            />
          </Grid>
          <Grid className='mb-3'>
            <Controller
              name='ITEM_CATEGORY_SHORT_NAME'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Item Category Short Name'
                  placeholder='Enter ...'
                  autoComplete='off'
                  {...(errors.ITEM_CATEGORY_SHORT_NAME && {
                    error: true,
                    helperText: errors.ITEM_CATEGORY_SHORT_NAME.message
                  })}
                />
              )}
            />
          </Grid>
          <Grid>
            <Controller
              name='PURCHASE_MODULE_NAME'
              control={control}
              render={({ field: { onChange, ...fieldProps } }) => (
                <>
                  <AsyncSelectCustom<PurchaseModuleOption>
                    label='Purchase Module Name'
                    inputId='PURCHASE_MODULE_NAME'
                    {...fieldProps}
                    isClearable
                    cacheOptions
                    defaultOptions
                    value={getValues('PURCHASE_MODULE_NAME')}
                    onChange={value => {
                      onChange(value)
                    }}
                    loadOptions={inputValue => {
                      return fetchPurchaseModuleNameByPurchaseModuleNameAndInuse(inputValue)
                    }}
                    getOptionLabel={data => data.PURCHASE_MODULE_NAME.toString()}
                    getOptionValue={data => data.PURCHASE_MODULE_ID.toString()}
                    classNamePrefix='select'
                    placeholder='Select ...'
                    {...(errors.PURCHASE_MODULE_NAME && {
                      error: true,
                      helperText: errors.PURCHASE_MODULE_NAME.message
                    })}
                  />
                </>
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

export default ItemCategoryAddModal
