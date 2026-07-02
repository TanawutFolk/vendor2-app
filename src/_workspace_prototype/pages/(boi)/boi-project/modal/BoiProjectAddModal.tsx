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

import DialogCloseButton from '@components/dialogs/DialogCloseButton'

import CustomTextField from '@/@core/components/mui/TextField'
import { PREFIX_QUERY_KEY, useCreateBoiProject } from '@/_workspace/react-query/hooks/useBoiProjectData'
import ConfirmModal from '@/components/ConfirmModal'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
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
    .max(255, { message: 'BOI Product Group Name cannot exceed 255 characters' })
})

interface BoiProjectAddModalProps {
  openModalAdd: boolean
  setOpenModalAdd: Dispatch<SetStateAction<boolean>>
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}
const BoiProjectAddModal = ({ openModalAdd, setOpenModalAdd, setIsEnableFetching }: BoiProjectAddModalProps) => {
  // useState

  // States : Modal
  // const [openModalAdd, setOpenModalAdd] = useState<boolean>(false)
  const [confirmModal, setConfirmModal] = useState(false)

  const handleClickOpen = () => setOpenModalAdd(true)

  const handleClose = () => {
    setOpenModalAdd(false)
    reset()
  }

  // Hooks : react-hook-form
  const { control, handleSubmit, setValue, reset, getValues } = useForm<FormData>({
    resolver: zodResolver(schema),
    // defaultValues
    defaultValues: {
      boiProject: '',
      boiProjectCode: '',
      boiProductGroupName: ''
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
      BOI_PROJECT_NAME: getValues('boiProject').trim(),
      BOI_PROJECT_CODE: getValues('boiProjectCode').trim(),
      BOI_PRODUCT_GROUP_NAME: getValues('boiProductGroupName').trim(),
      CREATE_BY: getUserData()?.EMPLOYEE_CODE,
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE
    }
    console.log(dataItem)

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
        title: 'Add BOI Project',
        message: data.data.Message
        // ? 'Duplicate Customer Order From'
        // : 'Data is duplicate. Please change Product Category'
      }

      ToastMessageError(message)
    }

    console.log('onMutateSuccess')
  }

  const onMutateError = (e: any) => {
    console.log('onMutateError', e)
  }

  const mutation = useCreateBoiProject(onMutateSuccess, onMutateError)

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
            Add BOI Project
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
              name='boiProject'
              control={control}
              // render={({ field }) => (
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='BOI Project Name'
                  placeholder='Enter ...'
                  autoComplete='off'
                  {...(errors.boiProject && {
                    error: true,
                    helperText: errors.boiProject.message
                  })}
                />
              )}
            />
          </Grid>
          <Grid className='mb-3'>
            <Controller
              name='boiProjectCode'
              control={control}
              // render={({ field }) => (
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
          <Grid>
            <Controller
              name='boiProductGroupName'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='BOI Product Group Name '
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

export default BoiProjectAddModal
