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
import SelectCustom from '@/components/react-select/SelectCustom'

import { PREFIX_QUERY_KEY, useUpdate } from '@/_workspace/react-query/hooks/useItemCategory'

import ConfirmModal from '@/components/ConfirmModal'
import CustomTextField from '@/components/mui/TextField'

import { ItemCategoryI } from '@/_workspace/types/item-master/ItemCategory'

import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import StatusOption from '@/libs/react-select/option/StatusOption'
import StatusOptionForEdit from '@/libs/react-select/option/StatusOptionForEdit'

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

// Props
interface EditModalProps {
  openModalEdit: boolean
  setOpenModalEdit: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<ItemCategoryI> | null
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const ItemCategoryEditModal = ({
  openModalEdit,
  setOpenModalEdit,
  rowSelected,
  setIsEnableFetching
}: EditModalProps) => {
  // States : Dialog
  const [confirmModal, setConfirmModal] = useState(false)

  const queryClient = useQueryClient()

  // Hooks : react-hook-form
  const { control, getValues, handleSubmit } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      ITEM_CATEGORY_NAME: rowSelected?.original.ITEM_CATEGORY_NAME,
      ITEM_CATEGORY_ALPHABET: rowSelected?.original.ITEM_CATEGORY_ALPHABET,
      ITEM_CATEGORY_SHORT_NAME: rowSelected?.original.ITEM_CATEGORY_SHORT_NAME,
      PURCHASE_MODULE_NAME: {
        PURCHASE_MODULE_ID: rowSelected?.original.PURCHASE_MODULE_ID,
        PURCHASE_MODULE_NAME: rowSelected?.original.PURCHASE_MODULE_NAME
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
      ITEM_CATEGORY_ID: rowSelected?.original.ITEM_CATEGORY_ID,
      ITEM_CATEGORY_NAME: getValues('ITEM_CATEGORY_NAME').trim(),
      ITEM_CATEGORY_ALPHABET: getValues('ITEM_CATEGORY_ALPHABET').trim(),
      ITEM_CATEGORY_SHORT_NAME: getValues('ITEM_CATEGORY_SHORT_NAME').trim(),
      PURCHASE_MODULE_ID: getValues('PURCHASE_MODULE_NAME').PURCHASE_MODULE_ID,
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE,
      INUSE: getValues('INUSE')?.value
    }

    mutation.mutate(dataItem)
  }

  const onMutateSuccess = (data: any) => {
    if (data.data && data.data.Status == true) {
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

  const onMutateError = () => {
    console.log('onMutateError')

    const message = {
      title: 'Add Item Category',
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
            Edit Item Category
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid className='mb-5'>
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
          <Grid className='mb-5'>
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
          <Grid className='mb-5'>
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
          <Grid className='mb-5'>
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

export default ItemCategoryEditModal
