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

import type { MRT_Row } from 'material-react-table'

import DialogCloseButton from '@components/dialogs/DialogCloseButton'

import CustomTextField from '@/@core/components/mui/TextField'
import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useBoiUnitData'
// import AsyncSelectCustom from '@/customize/components/AsyncSelectCustom'
import {
  maxLengthFieldMessage,
  minLengthFieldMessage,
  typeFieldMessage,
  uppercaseFieldMessage
} from '@/libs/valibot/error-message/errorMessage'

import { useUpdateBoiUnit } from '@/_workspace/react-query/hooks/useBoiUnitData'
import { BoiUnitI } from '@/_workspace/types/boi/BoiUnit'
import ConfirmModal from '@/components/ConfirmModal'
import SelectCustom from '@/components/react-select/SelectCustom'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import StatusColumn from '@/libs/material-react-table/components/StatusOption'
import StatusOptionForEdit from '@/libs/react-select/option/StatusOptionForEdit'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

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

// const defaultValues: FormData = {
//   productCategory: null,
//   productMainName: '',
//   productMainCode: ''
// }

interface ProductCategoryEditModalProps {
  openModalEdit: boolean
  setOpenModalEdit: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<BoiUnitI> | null
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const ProductCategoryEditModal = ({
  openModalEdit,
  setOpenModalEdit,
  rowSelected,
  setIsEnableFetching
}: ProductCategoryEditModalProps) => {
  // useState

  // States : Modal
  const [confirmModal, setConfirmModal] = useState(false)

  const handleClickOpen = () => setOpenModalEdit(true)
  const handleClose = () => {
    setOpenModalEdit(false)
    // reset()
  }

  // Hooks : react-hook-form
  const { control, handleSubmit, setValue, reset, getValues } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      boiUnitName: rowSelected?.original.BOI_UNIT_NAME,
      boiUnitSymbol: rowSelected?.original.BOI_UNIT_SYMBOL,
      status: StatusColumn.find(dataItem => dataItem.value === Number(rowSelected?.original.inuseForSearch))
    }
  })

  const { errors } = useFormState({
    control
  })

  const onSubmit = () => {
    console.log('ok')
    setConfirmModal(true)
  }

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log(data)
  }

  // Hooks : react-query
  const queryClient = useQueryClient()

  const handleEditCustomerOrderFrom = () => {
    setConfirmModal(false)
    const dataItem = {
      BOI_UNIT_ID: rowSelected?.original.BOI_UNIT_ID,
      BOI_UNIT_NAME: getValues('boiUnitName').trim(),
      BOI_UNIT_SYMBOL: getValues('boiUnitSymbol').trim(),
      INUSE: getValues('status').value,
      CREATE_BY: getUserData()?.EMPLOYEE_CODE,
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE
    }
    console.log('data', dataItem)

    mutation.mutate(dataItem)
  }

  const onMutateSuccess = data => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Update BOI Unit'
      }
      ToastMessageSuccess(message)
      setIsEnableFetching(true)

      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      // reset()
      handleClose()
    } else {
      const message = {
        title: 'Update BOI Unit',
        message: data.data.Message
      }

      ToastMessageError(message)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      // reset()
    }
  }

  const onMutateError = (e: any) => {
    console.log('onMutateError', e)
  }

  const mutation = useUpdateBoiUnit(onMutateSuccess, onMutateError)

  return (
    <>
      {/* <Button variant='contained' startIcon={<AddIcon />} onClick={handleClickOpen}>
        Edit Data
      </Button> */}
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
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            Edit BOI Unit
            {/* {rowSelected?.original.CUSTOMER_ORDER_FROM_ID} */}
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid className='mb-3'>
            <Controller
              name='boiUnitName'
              control={control}
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
          <Grid className='mb-3'>
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
                  isDisabled
                />

                // <CustomTextField
                //   {...field}
                //   options={StatusOption}
                //   fullWidth
                //   label='Status'
                //   placeholder=''
                //   autoComplete='off'
                // />
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
          onConfirmClick={handleEditCustomerOrderFrom}
          onCloseClick={() => setConfirmModal(false)}
          isDelete={false}
        />
      </Dialog>
      {/* <DevTool control={control} /> set up the dev tool */}
    </>
  )
}

export default ProductCategoryEditModal
