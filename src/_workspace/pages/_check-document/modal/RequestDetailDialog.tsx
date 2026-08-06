import { forwardRef } from 'react'
import type { ReactElement, Ref } from 'react'
import { Box, CircularProgress, Dialog, DialogContent, DialogTitle, Slide, Typography } from '@mui/material'
import type { SlideProps } from '@mui/material'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import {
  requestDetailQueryOptions,
  REQUEST_DETAIL_QUERY_KEY
} from '@/_workspace/react-query/hooks/useRegisterRequest'
import type { WorkflowActionCode } from '@/_workspace/types/_check-document/CheckDocumentTypes'
import DetailPanel from '../components/DetailPanel'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement },
  ref: Ref<unknown>
) {
  return <Slide direction='down' ref={ref} {...props} />
})

export interface ApprovalDetailDialogContext {
  empCode: string
  queueWorkflowStepMasterId?: number | null
  showSelectionSheetReadOnly?: boolean
  onApprove: (data: Record<string, unknown>, actionCode: WorkflowActionCode, actionLabel: string) => void
  onReject: (
    data: Record<string, unknown>,
    actionLabel: string,
    actionCode?: 'DISAGREE' | 'REJECT' | 'RETURN'
  ) => void
  onRefresh: () => void
}

interface RequestDetailDialogProps {
  open: boolean
  requestId: number | null
  pageTitle: string
  context: ApprovalDetailDialogContext
  onClose: () => void
}

export default function RequestDetailDialog({
  open,
  requestId,
  pageTitle,
  context,
  onClose
}: RequestDetailDialogProps) {
  const queryClient = useQueryClient()
  const detailQuery = useQuery({
    ...requestDetailQueryOptions(requestId ?? 0),
    enabled: open && !!requestId
  })
  const detailData = (detailQuery.data ?? null) as Record<string, unknown> | null

  const refreshDetail = async () => {
    if (!requestId) return
    await queryClient.invalidateQueries({ queryKey: [...REQUEST_DETAIL_QUERY_KEY, requestId] })
    await detailQuery.refetch()
  }

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
      <DialogTitle>
        <Typography variant='h5' component='span'>
          {pageTitle} Details
        </Typography>
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
              empCode={context.empCode}
              queueWorkflowStepMasterId={context.queueWorkflowStepMasterId}
              showSelectionSheetReadOnly={context.showSelectionSheetReadOnly}
              onApprove={(actionCode, actionLabel) => context.onApprove(detailData, actionCode, actionLabel)}
              onReject={(actionLabel, actionCode) => context.onReject(detailData, actionLabel, actionCode)}
              onRefresh={context.onRefresh}
              onDetailRefresh={refreshDetail}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  )
}
