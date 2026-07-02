// React Imports
import type { Dispatch, ReactElement, Ref, SetStateAction } from 'react'
import { forwardRef } from 'react'

// MUI Imports
import type { SlideProps } from '@mui/material'
import { Box, Grid, Slide } from '@mui/material'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Typography from '@mui/material/Typography'

// Third-party Imports
import { typeFieldMessage } from '@/libs/valibot/error-message/errorMessage'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useQueryClient } from '@tanstack/react-query'
import type { Input } from 'valibot'
import { nonEmpty, object, pipe, string } from 'valibot'

// Components Imports
import CustomTextField from '@components/mui/TextField'
import { ToastMessageError, ToastMessageSuccess } from '@components/ToastMessage'

// React-hook-form Imports
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, useForm, useFormState } from 'react-hook-form'

// React Query Imports
import { PREFIX_QUERY_KEY, useCreate } from '@/_workspace/react-query/hooks/usePcAdminManufacturingItemPriceData'

// Utils
import { getUserData } from '@/utils/user-profile/userLoginProfile'

// Fetch data with react-select Imports

// Dialog
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

// Schema with Valibot
type FormData = Input<typeof schema>

const schema = object({
  CONFIRM_TYPING: pipe(
    string(typeFieldMessage({ fieldName: 'Confirm Typing Data', typeName: 'String' })),
    nonEmpty('Please typing "Confirm" to create data')
  )
})

// Props
interface ConfirmTypingModalProps {
  openAddModal: boolean
  setOpenModalAdd: Dispatch<SetStateAction<boolean>>
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
  fiscalYear: number
  setConfirmModal: Dispatch<SetStateAction<boolean>>
  setOpenModalLoading: Dispatch<SetStateAction<boolean>>
}

const TypingConfirmModal = ({
  openAddModal,
  setOpenModalAdd,
  setIsEnableFetching,
  fiscalYear,
  setConfirmModal,
  setOpenModalLoading
}: ConfirmTypingModalProps) => {
  // State

  // Hooks : react-hook-form
  const { control, handleSubmit, setValue, reset, getValues, watch } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      // @ts-ignore
      CONFIRM_TYPING: ''
    }
  })

  const { errors } = useFormState({
    control
  })

  const onSubmit: SubmitHandler<FormData> = () => {
    if (watch('CONFIRM_TYPING') === 'Confirm') {
      setOpenModalLoading(true)
      handleConfirm()
    } else {
      const message = {
        title: 'Show Error Message',
        message: 'Wrong typing'
      }

      ToastMessageError(message)
    }
  }

  // Functions
  const handleClose = () => {
    setOpenModalAdd(false)
    // reset()
  }

  const handleConfirm = () => {
    setConfirmModal(false)
    setOpenModalAdd(false)

    const dataItem = {
      FISCAL_YEAR: fiscalYear + 1,
      SCT_PATTERN_ID: 1,
      CREATE_BY: getUserData()?.EMPLOYEE_CODE
    }

    mutation.mutate(dataItem)

    // queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
  }

  const onMutateSuccess = (data: any) => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Add Manufacturing Item Price'
      }

      ToastMessageSuccess(message)
      setIsEnableFetching(true)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      //reset()
      setOpenModalLoading(false)
      handleClose()
    } else {
      const message = {
        title: 'Add Manufacturing Item Price',
        message: data.data.Message.startsWith('1062') ? 'Duplicate Manufacturing Item Price' : data.data.Message
      }

      ToastMessageError(message)
      setOpenModalLoading(false)
    }
  }

  const onMutateError = () => {
    console.log('onMutateError')
  }

  const mutation = useCreate(onMutateSuccess, onMutateError)

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
        open={openAddModal}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
        PaperProps={{ sx: { top: 30, m: 0 } }}
      >
        <DialogContent>
          <Box sx={{ mb: 6, display: 'flex', justifyContent: 'center' }}></Box>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant='h5'>
              Type <span style={{ fontWeight: 'bold' }}>"Confirm"</span> to Create All Standard Price{' '}
              <span style={{ color: 'var(--primary-color)' }}>{fiscalYear}</span> P2
            </Typography>
            <Grid container sx={{ display: 'flex', justifyContent: 'center' }}>
              <Grid className='mt-3' item xs={12} sm={10} md={10}>
                <Controller
                  name='CONFIRM_TYPING'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      placeholder='Enter ...'
                      autoComplete='off'
                      {...(errors.CONFIRM_TYPING && {
                        error: true,
                        helperText: errors.CONFIRM_TYPING.message
                      })}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleSubmit(onSubmit, onError)()} variant='contained'>
            Yes
          </Button>
          <Button onClick={handleClose} variant='tonal' color='secondary'>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default TypingConfirmModal
