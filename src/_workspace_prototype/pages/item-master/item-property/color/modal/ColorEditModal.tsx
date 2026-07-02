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

import { maxLengthFieldMessage, typeFieldMessage } from '@/libs/valibot/error-message/errorMessage'
import { maxLength, nonEmpty, object, pipe, string, type Input } from 'valibot'

import { getUserData } from '@/utils/user-profile/userLoginProfile'

import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import SelectCustom from '@/components/react-select/SelectCustom'

import { PREFIX_QUERY_KEY, useUpdate } from '@/_workspace/react-query/hooks/useColorData'

import ConfirmModal from '@/components/ConfirmModal'
import CustomTextField from '@/components/mui/TextField'

import { ColorI } from '@/_workspace/types/item-master/item-property/Color'

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
  ITEM_PROPERTY_COLOR_NAME: pipe(
    string(typeFieldMessage({ fieldName: 'Color Name', typeName: 'String' })),
    nonEmpty('Color Name is required'),
    maxLength(100, maxLengthFieldMessage({ fieldName: 'Color Name', maxLength: 100 }))
  )
})

type FormData = Input<typeof schema>

// Props
interface EditModalProps {
  openModalEdit: boolean
  setOpenModalEdit: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<ColorI> | null
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const ColorEditModal = ({ openModalEdit, setOpenModalEdit, rowSelected, setIsEnableFetching }: EditModalProps) => {
  // States : Dialog
  const [confirmModal, setConfirmModal] = useState(false)

  const queryClient = useQueryClient()

  // Hooks : react-hook-form
  const { control, getValues, handleSubmit } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      ITEM_PROPERTY_COLOR_NAME: rowSelected?.original.ITEM_PROPERTY_COLOR_NAME,
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
      ITEM_PROPERTY_COLOR_ID: rowSelected?.original.ITEM_PROPERTY_COLOR_ID,
      ITEM_PROPERTY_COLOR_NAME: getValues('ITEM_PROPERTY_COLOR_NAME').trim(),
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE,
      INUSE: getValues('INUSE')?.value
    }

    mutation.mutate(dataItem)
  }

  const onMutateSuccess = (data: any) => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Add Color'
      }

      ToastMessageSuccess(message)
      setIsEnableFetching(true)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      //reset()
      handleClose()
    } else {
      const message = {
        title: 'Add Color',
        message: data.data.Message
      }

      ToastMessageError(message)
    }
  }

  const onMutateError = () => {
    console.log('onMutateError')

    const message = {
      title: 'Add Color',
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
            Edit Color
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={4}>
            <Grid item xs={12} md={12} lg={12}>
              <Controller
                name='ITEM_PROPERTY_COLOR_NAME'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Color Name'
                    placeholder='Enter...'
                    autoComplete='off'
                    {...(errors.ITEM_PROPERTY_COLOR_NAME && {
                      error: true,
                      helperText: errors.ITEM_PROPERTY_COLOR_NAME.message
                    })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={12} lg={12}>
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

export default ColorEditModal
