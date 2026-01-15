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

import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'

import type { MRT_Row } from 'material-react-table'

import DialogCloseButton from '@components/dialogs/DialogCloseButton'

import CustomTextField from '@/@core/components/mui/TextField'
import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useProductCategoryData'
// import AsyncSelectCustom from '@/customize/components/AsyncSelectCustom'

import { useUpdateBoiProject } from '@/_workspace/react-query/hooks/useBoiProjectData'
import { BoiProjectI } from '@/_workspace/types/boi/BoiProject'
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

export type FormData = z.infer<typeof schema>

const schema = z.object({
  boiProject: z
    .string({ required_error: 'BOI Project Name is required' })
    .nonempty({ message: 'BOI Project Name is required' }) // แค่ต้องไม่เป็นค่าว่าง
    .max(255, { message: 'BOI Project Description cannot exceed 255 characters' }),

  boiProjectCode: z
    .string({ required_error: 'BOI Project Code is required' })
    .nonempty({ message: 'BOI Project Code is required' }) // แค่ต้องไม่เป็นค่าว่าง
    .max(255, { message: 'BOI Project Code cannot exceed 255 characters' }),

  boiProductGroupName: z
    .string()
    .nonempty({ message: 'BOI Project Group Name is required' }) // แค่ต้องไม่เป็นค่าว่าง
    .max(255, { message: 'BOI Product Group Name cannot exceed 255 characters' }),
  status: z.object({
    value: z.number(),
    label: z.string()
  })
})

interface BoiProjectUnitEditModalProps {
  openModalEdit: boolean
  setOpenModalEdit: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<BoiProjectI> | null
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const BoiProjectUnitEditModal = ({
  openModalEdit,
  setOpenModalEdit,
  rowSelected,
  setIsEnableFetching
}: BoiProjectUnitEditModalProps) => {
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
    resolver: zodResolver(schema),
    defaultValues: {
      boiProject: rowSelected?.original.BOI_PROJECT_NAME,
      boiProjectCode: rowSelected?.original.BOI_PROJECT_CODE,
      boiProductGroupName: rowSelected?.original.BOI_PRODUCT_GROUP_NAME,
      status: StatusColumn?.find(dataItem => dataItem?.value === Number(rowSelected?.original?.inuseForSearch))
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
      BOI_PROJECT_ID: rowSelected?.original.BOI_PROJECT_ID,
      BOI_PROJECT_NAME: getValues('boiProject').trim(),
      BOI_PROJECT_CODE: getValues('boiProjectCode').trim(),
      BOI_PRODUCT_GROUP_NAME: getValues('boiProductGroupName').trim(),
      // INUSE: rowSelected?.original.INUSE,
      INUSE: getValues('status')?.value,
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
        title: 'Add Product Main'
      }
      ToastMessageSuccess(message)
      setIsEnableFetching(true)

      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      // reset()
      handleClose()
    } else {
      const message = {
        title: 'Add Product Main',
        message: data.data.Message
      }

      ToastMessageError(message)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      // reset()
    }

    console.log('onMutateSuccess')
  }

  const onMutateError = (e: any) => {
    console.log('onMutateError', e)
  }

  const mutation = useUpdateBoiProject(onMutateSuccess, onMutateError)

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
            Edit BOI Project
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
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='BOI Project Name'
                  placeholder='Enter ...'
                  autoComplete='off'
                  {...(errors.boiProject && { error: true, helperText: errors.boiProject.message })}
                />
              )}
            />
          </Grid>

          <Grid className='mb-3'>
            <Controller
              name='boiProjectCode'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='BOI Project Code'
                  placeholder='Enter ...'
                  autoComplete='off'
                  {...(errors.boiProjectCode && {
                    error: true,
                    helperText: errors.boiProjectCode.message
                  })}
                />
              )}
            />
          </Grid>

          <Grid className='mb-3'>
            <Controller
              name='boiProductGroupName'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='BOI Product Group Name'
                  placeholder='Enter ...'
                  autoComplete='off'
                  {...(errors.boiProductGroupName && {
                    error: true,
                    helperText: errors.boiProductGroupName.message
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
      {/* <DevTool control={control} /> set up the dev tool */}
    </>
  )
}

export default BoiProjectUnitEditModal
