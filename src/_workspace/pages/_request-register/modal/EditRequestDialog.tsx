import { forwardRef, useEffect, useState } from 'react'
import type { ReactElement, Ref } from 'react'
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slide,
  Typography
} from '@mui/material'
import type { SlideProps } from '@mui/material'
import { useForm } from 'react-hook-form'

import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import CustomTextField from '@components/mui/TextField'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { useUpdateRequest } from '@/_workspace/react-query/hooks/useRegisterRequest'
import type { EditRequestForm } from '@/_workspace/types/_request-register/RequestRegisterTypes'
import { buildFileUrls } from '../components/shared'
import FileViewerDialog from './FileViewerDialog'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement },
  ref: Ref<unknown>
) {
  return <Slide direction='down' ref={ref} {...props} />
})

interface EditRequestDialogProps {
  open: boolean
  data: any
  onClose: () => void
  onSuccess: () => void
}

export default function EditRequestDialog({ open, data, onClose, onSuccess }: EditRequestDialogProps) {
  const [fileDialogOpen, setFileDialogOpen] = useState(false)
  const user = getUserData()
  const files = buildFileUrls(data?.DOCUMENTS, String(data?.REQUEST_NUMBER || ''))
  const { register, handleSubmit, reset } = useForm<EditRequestForm>({
    defaultValues: {
      supportProduct_Process: '',
      purchase_frequency: '',
      requester_remark: ''
    }
  })

  useEffect(() => {
    if (!open) return
    reset({
      supportProduct_Process: data?.SUPPORTPRODUCT_PROCESS || '',
      purchase_frequency: data?.PURCHASE_FREQUENCY || '',
      requester_remark: data?.REQUESTER_REMARK || ''
    })
  }, [data, open, reset])

  const updateMutation = useUpdateRequest(
    (resData: any) => {
      if (!resData?.Status) {
        ToastMessageError({ title: 'Edit Request', message: resData?.Message || 'Failed to update request' })
        return
      }

      ToastMessageSuccess({ title: 'Edit Request', message: 'Saved successfully' })
      onSuccess()
      onClose()
    },
    (error: any) => {
      ToastMessageError({
        title: 'Edit Request',
        message: error?.response?.data?.Message || error?.message || 'Failed to update request'
      })
    }
  )

  const handleSave = (formData: EditRequestForm) => {
    updateMutation.mutate({
      REQUEST_REGISTER_VENDOR_ID: data?.REQUEST_REGISTER_VENDOR_ID,
      SUPPORTPRODUCT_PROCESS: formData.supportProduct_Process,
      PURCHASE_FREQUENCY: formData.purchase_frequency,
      REQUESTER_REMARK: formData.requester_remark,
      UPDATE_BY: user?.EMPLOYEE_CODE || 'SYSTEM'
    })
  }

  const handleClose = () => {
    if (!updateMutation.isPending) onClose()
  }

  return (
    <>
      <Dialog
        maxWidth='sm'
        fullWidth
        open={open}
        onClose={(_event, reason) => {
          if (reason !== 'backdropClick') handleClose()
        }}
       TransitionComponent={Transition}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
      >
        <DialogTitle>
          <Typography variant='h5' component='span'>Edit Request</Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <CustomTextField
              fullWidth
              label='Support Product / Process'
              placeholder='e.g. Server infrastructure, Maintenance...'
              {...register('supportProduct_Process')}
            />
            <CustomTextField
              fullWidth
              label='Purchase Frequency'
              placeholder='e.g. Monthly, 2-3 times/year...'
              {...register('purchase_frequency')}
            />
            <CustomTextField
              fullWidth
              multiline
              rows={3}
              label='Requester Remark'
              placeholder='Add remark for this request...'
              {...register('requester_remark')}
            />
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5,
                  mb: files.length > 0 ? 1.25 : 0
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i className='tabler-paperclip' style={{ fontSize: 15, color: 'var(--mui-palette-primary-main)' }} />
                  <Typography variant='body2' fontWeight={600}>Attached Files</Typography>
                  <Typography variant='caption' color='text.secondary'>Total Documents: {files.length}</Typography>
                </Box>
                <Button
                  size='small'
                  variant='tonal'
                  startIcon={<i className='tabler-folder-open' style={{ fontSize: 14 }} />}
                  onClick={() => setFileDialogOpen(true)}
                  disabled={files.length === 0}
                >
                  View Files
                </Button>
              </Box>
              {files.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {files.map((file, index) => (
                    <Chip
                      key={index}
                      label={file.name}
                      size='small'
                      variant='outlined'
                      icon={<i className='tabler-file' style={{ fontSize: 14 }} />}
                      onClick={() => window.open(file.url, '_blank')}
                      sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant='caption' color='text.secondary'>No attached files</Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-start' }}>
          <Button
            onClick={handleSubmit(handleSave)}
            variant='contained'
            color='primary'
            disabled={updateMutation.isPending}
          >
            Save
          </Button>
          <Button onClick={handleClose} variant='tonal' color='secondary' disabled={updateMutation.isPending}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <FileViewerDialog open={fileDialogOpen} files={files} onClose={() => setFileDialogOpen(false)} />
    </>
  )
}
