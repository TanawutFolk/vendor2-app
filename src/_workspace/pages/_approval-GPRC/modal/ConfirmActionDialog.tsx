import { forwardRef, useEffect, useState } from 'react'
import type { ReactNode, Ref } from 'react'
import { Box, Button, Dialog, DialogActions, DialogContent, Slide, Typography } from '@mui/material'
import type { SlideProps } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import { useMutation } from '@tanstack/react-query'
import CustomTextField from '@components/mui/TextField'

import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import RegisterRequestServices from '@/_workspace/services/_register-request/RegisterRequestServices'
import type { GprCDialogMode, GprCQueueRow } from '../types'

import undraw_clean_up_re_504g from '@assets/images/common/undraw_clean_up_re_504g.svg'
import undraw_notify_re_65on from '@assets/images/common/undraw_notify_re_65on.svg'

const Transition = forwardRef(function Transition(props: SlideProps & { children?: ReactNode }, ref: Ref<unknown>) {
  return <Slide direction='down' ref={ref} {...props} />
})

const REJECT_REMARK_MAX_LENGTH = 500

interface ConfirmActionDialogProps {
  open: boolean
  mode: GprCDialogMode
  row: GprCQueueRow | null
  actionBy: string
  onSuccess: () => void | Promise<void>
  onClose: () => void
}

// Confirmation modal for the GPR C Approve / Reject actions. Mirrors the request-register
// ActionDialog so both approval flows share the same "Are You Sure?" confirmation UX.
export default function ConfirmActionDialog({
  open,
  mode,
  row,
  actionBy,
  onSuccess,
  onClose
}: ConfirmActionDialogProps) {
  const [remark, setRemark] = useState('')
  const isReject = mode === 'REJECT'
  const imageConfirm = isReject ? undraw_clean_up_re_504g : undraw_notify_re_65on
  const actionLabel = isReject ? 'Reject GPR C Step' : 'Approve GPR C Step'
  const confirmDisabled = isReject && !remark.trim()

  useEffect(() => {
    if (open) setRemark('')
  }, [open, row])

  const approvalMutation = useMutation({
    mutationFn: async () => {
      const requestId = Number(row?.REQUEST_REGISTER_VENDOR_ID || 0)

      if (!requestId || !actionBy) throw new Error('Missing request id')

      const payload = {
        REQUEST_REGISTER_VENDOR_ID: requestId,
        ACTION_BY: actionBy,
        UPDATE_BY: actionBy,
        REMARK: remark
      }
      const response =
        mode === 'REJECT'
          ? await RegisterRequestServices.gprCRejectStep(payload)
          : await RegisterRequestServices.gprCApproveStep(payload)

      if (!response.data?.Status) throw new Error(response.data?.Message || 'GPR C action failed')

      return response.data
    },
    onSuccess: async data => {
      ToastMessageSuccess({ title: 'GPR C Approval', message: data.Message || 'GPR C action completed' })
      await onSuccess()
      onClose()
    },
    onError: (error: Error) => {
      ToastMessageError({ title: 'GPR C Approval', message: error.message || 'GPR C action failed' })
    }
  })

  const handleClose = () => {
    if (!approvalMutation.isPending) onClose()
  }

  return (
    <Dialog
      maxWidth='xs'
      fullWidth
      open={open}
      disableEscapeKeyDown
      aria-labelledby='gprc-confirm-dialog-title'
      aria-describedby='gprc-confirm-dialog-description'
     TransitionComponent={Transition}
      keepMounted
      onClose={(_event, reason) => {
        if (reason !== 'backdropClick') handleClose()
      }}
      sx={{
        zIndex: theme => theme.zIndex.modal + 10,
        '& .MuiDialog-paper': { overflow: 'visible' },
        '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
      }}
    >
      <DialogContent>
        <Box sx={{ mb: 6, display: 'flex', justifyContent: 'center' }}>
          <img src={imageConfirm} height={120} width={150} alt='' />
        </Box>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant='h5' id='gprc-confirm-dialog-title'>
            Are You Sure ?
          </Typography>
          <Typography variant='h5' sx={{ color: 'text.secondary' }} id='gprc-confirm-dialog-description'>
            Confirm {actionLabel}
          </Typography>
          {row?.COMPANY_NAME && (
            <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
              {row.COMPANY_NAME}
            </Typography>
          )}
        </Box>
        {isReject && (
          <CustomTextField
            fullWidth
            multiline
            rows={3}
            label='Remark / Comment (Required for reject)'
            placeholder='Enter your remark here...'
            inputProps={{ maxLength: REJECT_REMARK_MAX_LENGTH }}
            value={remark}
            onChange={event => setRemark(event.target.value)}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', borderTop: 'none', mb: 4 }}>
        <LoadingButton
          onClick={() => approvalMutation.mutate()}
          loading={approvalMutation.isPending}
          loadingIndicator={isReject ? 'Rejecting...' : 'Approving...'}
          variant='contained'
          color={isReject ? 'error' : 'success'}
          sx={{ mr: 4 }}
          disabled={confirmDisabled}
        >
          <span>Confirm</span>
        </LoadingButton>
        <Button variant='tonal' color='secondary' onClick={handleClose} disabled={approvalMutation.isPending}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}
