import { forwardRef } from 'react'
import type { ReactElement, Ref } from 'react'
import { Box, CircularProgress, Dialog, DialogContent, DialogTitle, Slide, Typography } from '@mui/material'
import type { SlideProps } from '@mui/material'
import { useQuery } from '@tanstack/react-query'

import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import { requestDetailQueryOptions } from '@/_workspace/react-query/hooks/useRegisterRequest'
import type { RegisterRequestRow, WorkflowActionCode } from '@/_workspace/types/_request-register/RequestRegisterTypes'
import DetailPanel from '../components/DetailPanel'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement },
  ref: Ref<unknown>
) {
  return <Slide direction='down' ref={ref} {...props} />
})

export interface RequestDetailDialogContext {
  onApprove: (
    data: RegisterRequestRow,
    actionCode: Extract<WorkflowActionCode, 'APPROVE' | 'DISAGREE' | 'ACTION_REQUIRED'>,
    actionLabel: string
  ) => void
  onReject: (data: RegisterRequestRow, actionLabel: string, actionCode?: 'DISAGREE' | 'REJECT') => void
  onEmailSent: (data?: RegisterRequestRow) => void
  onCompleted: () => void
}

interface RequestDetailDialogProps {
  open: boolean
  requestId: number | null
  context: RequestDetailDialogContext
  onClose: () => void
}

export default function RequestDetailDialog({ open, requestId, context, onClose }: RequestDetailDialogProps) {
  const detailQuery = useQuery({
    ...requestDetailQueryOptions(requestId ?? 0),
    enabled: open && !!requestId
  })
  const detailData = (detailQuery.data ?? null) as RegisterRequestRow | null

  return (
    <Dialog
      maxWidth='lg'
      fullWidth
      open={open}
      onClose={(_event, reason) => {
        if (reason !== 'backdropClick') onClose()
      }}
     TransitionComponent={Transition}
      keepMounted
      scroll='paper'
      sx={{
        '& .MuiDialog-paper': {
          overflow: 'visible',
          width: { xs: 'calc(100vw - 16px)', sm: 'calc(100vw - 32px)', lg: '1100px' },
          maxWidth: '1100px'
        },
        '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
      }}
    >
      <DialogTitle sx={{ position: 'relative' }}>
        <Typography variant='h5' component='span'>
          Request Details
        </Typography>
        <Box sx={{ position: 'absolute', top: 14, right: 56, textAlign: 'right' }}>
          <Typography variant='body2' fontWeight={700} color='text.secondary'>
            {String(detailData?.REQUEST_NUMBER || requestId || '-')}
          </Typography>
        </Box>
        <DialogCloseButton onClick={onClose} disableRipple>
          <i className='tabler-x' />
        </DialogCloseButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0, bgcolor: 'background.default' }}>
        {detailQuery.isLoading ? (
          <Box sx={{ minHeight: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
            <CircularProgress size={22} />
            <Typography variant='body2' color='text.secondary'>
              Loading request details...
            </Typography>
          </Box>
        ) : (
          detailData && (
            <DetailPanel
              data={detailData}
              onApprove={(actionCode, actionLabel) => context.onApprove(detailData, actionCode, actionLabel)}
              onReject={(actionLabel, actionCode) => context.onReject(detailData, actionLabel, actionCode)}
              onEmailSent={data => context.onEmailSent(data || detailData)}
              onCompleted={context.onCompleted}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  )
}
