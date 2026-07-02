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
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, useForm, useFormState } from 'react-hook-form'

// Components Imports
import { useQueryClient } from '@tanstack/react-query'

import { maxLength, minLength, nonEmpty, number, object, pipe, string } from 'valibot'

import type { Input } from 'valibot'

import { valibotResolver } from '@hookform/resolvers/valibot'

import DialogCloseButton from '@components/dialogs/DialogCloseButton'

import { PREFIX_QUERY_KEY, useUpdate } from '@/_workspace/react-query/hooks/useManufacturingItemGroupData'

import {
  maxLengthFieldMessage,
  minLengthFieldMessage,
  requiredFieldMessage,
  typeFieldMessage
} from '@/libs/valibot/error-message/errorMessage'

import { getUserData } from '@/utils/user-profile/userLoginProfile'

import { MRT_Row } from 'material-react-table'

import { ManufacturingItemGroupI } from '@/_workspace/types/manufacturing-item/ManufacturingItemGroup'
import ConfirmModal from '@/components/ConfirmModal'
import CustomTextField from '@/components/mui/TextField'
import SelectCustom from '@/components/react-select/SelectCustom'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import StatusOption from '@/libs/react-select/option/StatusOption'
import StatusOptionForEdit from '@/libs/react-select/option/StatusOptionForEdit'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

type FormData = Input<typeof schema>

const schema = object({
  ITEM_GROUP_NAME: pipe(
    string(typeFieldMessage({ fieldName: 'Manufacturing Item Group Name', typeName: 'String' })),
    nonEmpty('Manufacturing Item Group Name is required'),
    minLength(2, minLengthFieldMessage({ fieldName: 'Manufacturing Item Group Name', minLength: 2 })),
    maxLength(50, maxLengthFieldMessage({ fieldName: 'Manufacturing Item Group Name', maxLength: 50 }))
  ),

  status: object(
    {
      value: number(),
      label: string()
    },
    requiredFieldMessage({ fieldName: 'Status' })
  )
})

interface OrderTypeModalProps {
  openEditModal: boolean
  setOpenModalEdit: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<ManufacturingItemGroupI> | null
}
interface Props {
  isEnableFetching: boolean
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const ManufacturingItemGroupEditModal = ({
  openEditModal,
  setOpenModalEdit,
  rowSelected,
  isEnableFetching,
  setIsEnableFetching
}: Props & OrderTypeModalProps) => {
  // useState

  const [confirmModal, setConfirmModal] = useState(false)

  const handleClickOpen = () => setOpenModalEdit(true)
  const handleClose = () => {
    setOpenModalEdit(false)
    //reset()
  }

  // Hooks : react-hook-form

  const { control, getValues, handleSubmit } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      ITEM_GROUP_NAME: rowSelected?.original.ITEM_GROUP_NAME,

      status: StatusOption.find(item => item.value == rowSelected?.original?.INUSE)
    }
  })
  const { errors, isDirty } = useFormState({
    control
  })

  const onSubmit: SubmitHandler<FormData> = () => {
    if (isDirty === false) {
      const message = {
        title: 'Update Order Type',
        message: 'ข้อมูลไม่มีการเปลี่ยนแปลง Data is not changed'
      }
      ToastMessageError(message)
      return
    }
    setConfirmModal(true)
  }

  // Functions
  const handleEditOrderType = () => {
    setConfirmModal(false)

    const dataItem = {
      ITEM_GROUP_ID: rowSelected?.original?.ITEM_GROUP_ID,
      ITEM_GROUP_NAME: getValues('ITEM_GROUP_NAME'),

      INUSE: getValues('status')?.value,
      CREATE_BY: getUserData()?.EMPLOYEE_CODE,
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE
    }

    //console.log('DATA-ITEM', dataItem)
    mutation.mutate(dataItem)
  }

  const onMutateSuccess = (data: any) => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Update Manufacturing Item Group'
      }
      setIsEnableFetching(true)
      ToastMessageSuccess(message)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })

      handleClose()
    } else {
      const message = {
        title: 'Update Manufacturing Item Group',
        message: data.data.Message.startsWith('1062') ? 'Duplicate Manufacturing Item Group' : data.data.Message
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

  // Hooks : react-query

  const queryClient = useQueryClient()

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
        open={openEditModal}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
        PaperProps={{ sx: { top: 30, m: 0 } }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            Edit Manufacturing Item Group
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid className='mb-3'>
            <Controller
              control={control}
              name='ITEM_GROUP_NAME'
              render={({ field: { ref, ...fieldProps } }) => (
                <CustomTextField
                  label='Manufacturing Item Group Name'
                  {...fieldProps}
                  innerRef={ref}
                  fullWidth
                  placeholder='Enter ...'
                  autoComplete='off'
                  {...(errors?.ITEM_GROUP_NAME && {
                    error: true,
                    helperText: errors?.ITEM_GROUP_NAME?.message
                  })}
                />
              )}
            />
          </Grid>

          <Grid>
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
                  isDisabled={rowSelected?.original?.INUSE == 1 ? true : false}
                  {...(errors.status && {
                    error: true,
                    helperText: errors.status.message
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
          onConfirmClick={handleEditOrderType}
          onCloseClick={() => setConfirmModal(false)}
          isDelete={false}
        />
      </Dialog>
    </>
  )
}

export default ManufacturingItemGroupEditModal
