import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogActions, Box, Typography, Alert, Button } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'

import undraw_clean_up_re_504g from '@assets/images/common/undraw_clean_up_re_504g.svg'
import undraw_notify_re_65on from '@assets/images/common/undraw_notify_re_65on.svg'

import ApprovalQueueServices from '@/_workspace/services/_approval-queue/ApprovalQueueServices'
import CustomTextField from '@components/mui/TextField'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import type { ActionDialogProps } from '@/_workspace/types/_check-document/CheckDocumentTypes'
import { useMutation } from '@tanstack/react-query'

import { Transition } from '../components/shared'

type UpdateStatusBatchInput = {
  actions: ActionDialogProps['actions']
  remark: string
  empCode: string
}

const updateStatusBatch = async ({ actions, remark, empCode }: UpdateStatusBatchInput) => {
  const failedRequestIds: number[] = []
  let failedMessage = 'Failed to update status'
  let successMessage = 'Status updated successfully'

  for (const action of actions) {
    const response = await ApprovalQueueServices.updateStatus({
      REQUEST_REGISTER_VENDOR_ID: action.requestId,
      CURRENT_TASK_ID: action.currentTaskId,
      LOCK_VERSION: action.lockVersion,
      WORKFLOW_TRANSITION_ID: action.workflowTransitionId,
      APPROVE_BY: empCode,
      APPROVER_REMARK: remark,
      UPDATE_BY: empCode
    })

    if (!response.data.Status) {
      failedRequestIds.push(action.requestId)
      failedMessage = response.data.Message || failedMessage
    } else {
      successMessage = response.data.Message || successMessage
    }
  }

  return { failedRequestIds, failedMessage, successMessage }
}

const ActionDialog = ({
  open,
  mode,
  actions,
  approveActionLabel,
  rejectActionLabel,
  onClose,
  onSuccess
}: ActionDialogProps) => {
  const [remark, setRemark] = useState('')
  const [error, setError] = useState<string | null>(null)
  const user = getUserData()
  const actionCount = actions.length
  const statusMutation = useMutation({
    mutationFn: updateStatusBatch,
    onSuccess: result => {
      if (result.failedRequestIds.length > 0) {
        setError(`${result.failedMessage} (Request: ${result.failedRequestIds.join(', ')})`)
        ToastMessageError({ title: 'Update Request Status', message: result.failedMessage })
        onSuccess()
        return
      }

      ToastMessageSuccess({ title: 'Update Request Status', message: result.successMessage })
      onSuccess()
      onClose()
    },
    onError: (caughtError: unknown) => {
      const normalizedError = caughtError as { response?: { data?: { Message?: string } }; message?: string }
      const message =
        normalizedError?.response?.data?.Message || normalizedError?.message || 'Failed to update status'
      setError(message)
      ToastMessageError({ title: 'Update Request Status', message })
    }
  })
  const loading = statusMutation.isPending

  useEffect(() => {
    if (!open) {
      setRemark('')
      setError(null)
    }
  }, [open])

  const handleSubmit = () => {
    if (actions.length === 0) return
    setError(null)
    statusMutation.mutate({ actions, remark, empCode: user?.EMPLOYEE_CODE || '' })
  }

  const imageConfirm = mode === 'reject' ? undraw_clean_up_re_504g : undraw_notify_re_65on
  const actionLabel = mode === 'approve' ? approveActionLabel : rejectActionLabel

  return (
    <Dialog
      maxWidth='xs'
      fullWidth={true}
      open={open}
      disableEscapeKeyDown
     TransitionComponent={Transition}
      keepMounted
      onClose={(_event, reason) => {
        if (reason !== 'backdropClick') onClose()
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
          <Typography variant='h5'>Are You Sure ?</Typography>
          <Typography variant='h5' sx={{ color: 'text.secondary' }}>
            {mode === 'approve'
              ? actionCount > 1
                ? `Approve ${actionCount} selected requests`
                : approveActionLabel
              : rejectActionLabel}
          </Typography>
        </Box>

        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {mode === 'reject' && (
          <CustomTextField
            fullWidth
            multiline
            rows={3}
            label='Remark / Comment (Required for reject)'
            placeholder='Enter your remark here...'
            value={remark}
            onChange={e => setRemark(e.target.value)}
            inputProps={{ maxLength: 500 }}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', borderTop: 'none', mb: 4 }}>
        <LoadingButton
          onClick={handleSubmit}
          loading={loading}
          loadingIndicator={mode === 'approve' ? `${approveActionLabel}...` : `${rejectActionLabel}...`}
          variant='contained'
          color={mode === 'approve' ? 'success' : 'error'}
          sx={{ mr: 4 }}
          disabled={mode === 'reject' && !remark.trim()}
        >
          <span>Yes, {actionLabel} !</span>
        </LoadingButton>
        <Button variant='tonal' color='secondary' onClick={onClose} disabled={loading}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ActionDialog
