import { forwardRef, useEffect, useMemo, useState } from 'react'
import type { ReactNode, Ref } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Slide, Stack, Typography } from '@mui/material'
import type { SlideProps } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import { useMutation } from '@tanstack/react-query'

import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import CustomTextField from '@components/mui/TextField'
import SelectCustom from '@components/react-select/SelectCustom'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import RegisterRequestServices from '@/_workspace/services/_register-request/RegisterRequestServices'
import useStatusMasterOptions from '@/_workspace/react-query/hooks/useStatusMasterOptions'
import { STATUS_MASTER_TYPE, type StatusMasterOption } from '@/_workspace/types/StatusMasterTypes'
import { buildActionResultStatusMasterIds } from '@/_workspace/utils/actionResultIdentity'
import type { GprCActionRequiredRow } from '../types'

const Transition = forwardRef(function Transition(props: SlideProps & { children?: ReactNode }, ref: Ref<unknown>) {
  return <Slide direction='down' ref={ref} {...props} />
})

interface RecordActionResultDialogProps {
  open: boolean
  row: GprCActionRequiredRow | null
  actionBy: string
  onClose: () => void
  onSuccess: () => void | Promise<void>
}

export default function RecordActionResultDialog({
  open,
  row,
  actionBy,
  onClose,
  onSuccess
}: RecordActionResultDialogProps) {
  const [remark, setRemark] = useState('')
  const [resultStatusId, setResultStatusId] = useState<number | null>(null)
  const { data: allResultStatusOptions = [] } = useStatusMasterOptions(STATUS_MASTER_TYPE.ACTION_RESULT)
  const actionResultStatusIds = useMemo(
    () => buildActionResultStatusMasterIds(allResultStatusOptions),
    [allResultStatusOptions]
  )
  const resultStatusOptions = allResultStatusOptions.filter(
    option => option.STATUS_ID !== actionResultStatusIds.PENDING
  )
  const completedStatusId = actionResultStatusIds.COMPLETED

  useEffect(() => {
    if (!open) return
    setRemark('')
    setResultStatusId(completedStatusId)
  }, [completedStatusId, open, row])

  const recordResultMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const response = await RegisterRequestServices.gprCRecordActionResult(payload)

      if (!response.data?.Status) {
        throw new Error(response.data?.Message || 'Failed to record result')
      }

      return response.data
    },
    onSuccess: async data => {
      ToastMessageSuccess({ title: 'Record Action Required Result', message: data.Message || 'Result recorded' })
      await onSuccess()
      onClose()
    },
    onError: (error: Error) => {
      ToastMessageError({
        title: 'Record Action Required Result',
        message: error.message || 'Failed to record result'
      })
    }
  })

  const handleSubmit = () => {
    const actionRequiredId = Number(row?.REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID || 0)

    if (!actionRequiredId || !actionBy || resultStatusId === null) {
      ToastMessageError({ title: 'Record Action Required Result', message: 'Missing action required data' })
      return
    }

    recordResultMutation.mutate({
      REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID: actionRequiredId,
      M_ACTION_RESULT_STATUS_ID: resultStatusId,
      RESULT_REMARK: remark,
      RESULT_BY: actionBy,
      UPDATE_BY: actionBy
    })
  }

  const handleClose = () => {
    if (!recordResultMutation.isPending) onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={(_event, reason) => {
        if (reason !== 'backdropClick') handleClose()
      }}
      maxWidth='sm'
      fullWidth
     TransitionComponent={Transition}
      keepMounted
      sx={{
        '& .MuiDialog-paper': { overflow: 'visible' },
        '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
      }}
    >
      <DialogTitle>
        <Typography variant='h5'>Record Action Required Result</Typography>
        <DialogCloseButton onClick={handleClose} disableRipple>
          <i className='tabler-x' />
        </DialogCloseButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <SelectCustom
            label='Result Status'
            classNamePrefix='select'
            options={resultStatusOptions}
            value={resultStatusOptions.find(option => option.STATUS_ID === resultStatusId) || null}
            onChange={value => setResultStatusId((value as StatusMasterOption | null)?.STATUS_ID ?? null)}
          />
          <CustomTextField
            fullWidth
            multiline
            minRows={3}
            label='Result Remark'
            placeholder='Enter your remark here...'
            value={remark}
            onChange={event => setRemark(event.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'flex-start' }}>
        <LoadingButton
          variant='contained'
          color='success'
          loading={recordResultMutation.isPending}
          onClick={handleSubmit}
          disabled={resultStatusId === null}
        >
          Save Result
        </LoadingButton>
        <Button variant='tonal' color='secondary' onClick={handleClose} disabled={recordResultMutation.isPending}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}
