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

import { maxLength, minLength, nonEmpty, number, object, pipe, string } from 'valibot'

import type { Input } from 'valibot'

import { valibotResolver } from '@hookform/resolvers/valibot'

import type { MRT_Row } from 'material-react-table'

import DialogCloseButton from '@components/dialogs/DialogCloseButton'

import CustomTextField from '@/@core/components/mui/TextField'
// import AsyncSelectCustom from '@/customize/components/AsyncSelectCustom'
import {
  maxLengthFieldMessage,
  minLengthFieldMessage,
  requiredFieldMessage,
  typeFieldMessage
} from '@/libs/valibot/error-message/errorMessage'

import {
  PREFIX_QUERY_KEY,
  useUpdateBoiNameForMaterialConsumable
} from '@/_workspace/react-query/hooks/useBoiNameForMaterialConsumableData'
import { fetchBoiUnit } from '@/_workspace/react-select/async-promise-load-options/boi/fetchBoiUnit'
import { BoiNameForMaterialConsumableI } from '@/_workspace/types/boi/BoiNameForMaterialConsumable'
import ConfirmModal from '@/components/ConfirmModal'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
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
  boiUnitId: object(
    {
      BOI_UNIT_ID: number(),
      BOI_UNIT_SYMBOL: string()
    },
    requiredFieldMessage({ fieldName: 'BOI Unit Symbol' })
  ),

  boiDescriptionMainName: pipe(
    string(typeFieldMessage({ fieldName: 'BOI Description Main Name', typeName: 'String' })),
    nonEmpty('Please enter your BOI Description Main Name'),
    minLength(6, minLengthFieldMessage({ fieldName: 'BOI Description Main Name', minLength: 6 })),
    maxLength(6, maxLengthFieldMessage({ fieldName: 'BOI Description Main Name', maxLength: 6 }))
  )
})

// const defaultValues: FormData = {
//   productCategory: null,
//   productMainName: '',
//   productMainCode: ''
// }

interface BoiNameForMaterialConsumableModalProps {
  openModalEdit: boolean
  setOpenModalEdit: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<BoiNameForMaterialConsumableI> | null
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const BoiNameForMaterialConsumableEditModal = ({
  openModalEdit,
  setOpenModalEdit,
  rowSelected,
  setIsEnableFetching
}: BoiNameForMaterialConsumableModalProps) => {
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
      // boiProject: {
      //   BOI_PROJECT_NAME: rowSelected?.original?.BOI_PROJECT_NAME,
      //   BOI_PROJECT_ID: rowSelected?.original?.BOI_PROJECT_ID,
      //   BOI_PROJECT_CODE: rowSelected?.original?.BOI_PROJECT_CODE
      // },
      boiProject: rowSelected?.original?.BOI_PROJECT_NAME,
      boiGroupNo: rowSelected?.original?.BOI_GROUP_NO,
      boiDescriptionMainName: rowSelected?.original?.BOI_DESCRIPTION_MAIN_NAME,
      boiDescriptionSubName: rowSelected?.original?.BOI_DESCRIPTION_SUB_NAME,
      boiSymbol: rowSelected?.original?.BOI_UNIT_SYMBOL,
      status: StatusColumn.find(dataItem => dataItem.value === Number(rowSelected?.original.inuseForSearch))
    }
  })
  // const { control, handleSubmit, setValue } = reactHookFormMethods

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
      BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID: rowSelected?.original?.BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID,
      BOI_PROJECT_ID: rowSelected?.original.BOI_PROJECT_ID || '',
      BOI_GROUP_NO: getValues('boiGroupNo') || '',
      BOI_UNIT_ID: getValues('boiUnitId')?.BOI_UNIT_ID,
      BOI_DESCRIPTION_MAIN_NAME: getValues('boiDescriptionMainName').trim(),
      BOI_DESCRIPTION_SUB_NAME: getValues('boiDescriptionSubName').trim(),
      INUSE: getValues('status').value,
      CREATE_BY: getUserData()?.EMPLOYEE_CODE,
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE,
      isEditDescriptionMain:
        rowSelected?.original?.BOI_DESCRIPTION_MAIN_NAME === getValues('boiDescriptionMainName') ? 0 : 1,
      isEditDescriptionSub:
        rowSelected?.original?.BOI_DESCRIPTION_SUB_NAME === getValues('boiDescriptionSubName') ? 0 : 1,
      isEditBoiUnit: rowSelected?.original?.BOI_UNIT_ID === getValues('boiUnitId')?.BOI_UNIT_ID ? 0 : 1
    }
    mutation.mutate(dataItem)
  }

  const onMutateSuccess = data => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Add BOI Name For Material/Consumable'
      }
      ToastMessageSuccess(message)
      setIsEnableFetching(true)

      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      // reset()
      handleClose()
    } else {
      const message = {
        title: 'Add BOI Name For Material/Consumable',
        message: data.data.Message
        // ? 'Duplicate Product Main'
        // : 'Data is duplicate. Please change'
      }
      ToastMessageError(message)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      // reset()
      // handleClose()
    }

    console.log('onMutateSuccess')
  }

  const onMutateError = (e: any) => {
    console.log('onMutateError', e)
  }

  const mutation = useUpdateBoiNameForMaterialConsumable(onMutateSuccess, onMutateError)

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
            Edit BOI Name For Material/consumable
            {/* {rowSelected?.original.CUSTOMER_ORDER_FROM_ID} */}
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid className='mb-3'>
            <Controller
              name='boiProject'
              control={control}
              defaultValue={rowSelected?.original?.BOI_PROJECT_NAME}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='BOI Project Name'
                  placeholder='Enter ...'
                  autoComplete='off'
                  {...(errors.boiUnitName && {
                    error: true,
                    helperText: errors.boiUnitName.message
                  })}
                  style={{ cursor: 'not-allowed' }}
                  disabled
                />
              )}
            />
          </Grid>
          <Grid className='mb-3'>
            <Controller
              name='boiProjectCode'
              control={control}
              rules={{ required: true }}
              defaultValue={rowSelected?.original?.BOI_PROJECT_CODE}
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
                  style={{ cursor: 'not-allowed' }}
                  disabled
                />
              )}
            />
          </Grid>

          <Grid className='mb-3'>
            <Controller
              name='boiGroupNo'
              control={control}
              rules={{ required: true }}
              defaultValue={rowSelected?.original?.BOI_GROUP_NO}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='BOI Group No'
                  placeholder='Enter ...'
                  autoComplete='off'
                  {...(errors.boiUnitSymbol && {
                    error: true,
                    helperText: errors.boiUnitSymbol.message
                  })}
                  style={{ cursor: 'not-allowed' }}
                  disabled
                />
              )}
            />
          </Grid>

          <Grid className='mb-3'>
            <Controller
              name='boiDescriptionMainName'
              control={control}
              rules={{ required: true }}
              defaultValue={rowSelected?.original?.BOI_DESCRIPTION_MAIN_NAME}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='BOI Description Main Name'
                  placeholder='Enter ...'
                  autoComplete='off'
                  {...(errors.boiUnitSymbol && {
                    error: true,
                    helperText: errors.boiUnitSymbol.message
                  })}
                  style={{ cursor: 'not-allowed' }}
                  disabled={rowSelected?.original?.BOI_DESCRIPTION_SUB_NAME !== ''}
                  {...(errors.boiDescriptionMainName && {
                    error: true,
                    helperText: errors.boiDescriptionMainName.message
                  })}
                />
              )}
            />
          </Grid>

          <Grid className='mb-3'>
            <Controller
              name='boiDescriptionSubName'
              control={control}
              rules={{
                validate: {
                  checkDesSubName: value => {
                    if (
                      value.length == 0 &&
                      rowSelected?.original?.BOI_DESCRIPTION_SUB_NAME !== getValues('boiDescriptionSubName')
                    ) {
                      return 'BOI Description Sub Name is require'
                    }
                    return true
                  }
                }
              }}
              defaultValue={rowSelected?.original?.BOI_DESCRIPTION_SUB_NAME}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='BOI Description Sub Name'
                  placeholder={rowSelected?.original?.BOI_DESCRIPTION_SUB_NAME == '' ? '' : 'Enter ...'}
                  autoComplete='off'
                  {...(errors.boiUnitSymbol && {
                    error: true,
                    helperText: errors.boiUnitSymbol.message
                  })}
                  style={{ cursor: 'not-allowed' }}
                  disabled={rowSelected?.original?.BOI_DESCRIPTION_SUB_NAME == ''}
                />
              )}
            />
          </Grid>

          <Grid className='mb-3'>
            <Controller
              name='boiUnitId'
              control={control}
              defaultValue={{
                BOI_UNIT_ID: rowSelected?.original?.BOI_UNIT_ID,
                BOI_UNIT_SYMBOL: rowSelected?.original?.BOI_UNIT_SYMBOL
              }}
              render={({ field: { ...fieldProps } }) => (
                <AsyncSelectCustom
                  {...fieldProps}
                  isClearable
                  cacheOptions
                  defaultOptions
                  loadOptions={(value, callback) => {
                    if (rowSelected?.original?.BOI_DESCRIPTION_SUB_NAME === '') {
                      return fetchBoiUnit(value, 1)
                    } else {
                      callback(null)
                    }
                  }}
                  getOptionLabel={e => e.BOI_UNIT_SYMBOL}
                  getOptionValue={e => e.BOI_UNIT_ID}
                  label='BOI Unit Symbol'
                  placeholder='Select ...'
                  classNamePrefix='select'
                  isDisabled={rowSelected?.original?.BOI_DESCRIPTION_SUB_NAME !== ''}
                  {...(errors.boiUnitId && {
                    error: true,
                    helperText: errors.boiUnitId.message
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
      {/* <DevTool control={control} />  */}
    </>
  )
}

export default BoiNameForMaterialConsumableEditModal
