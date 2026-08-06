import { forwardRef } from 'react'
import type { ReactElement, Ref } from 'react'
import { Box, CircularProgress, Dialog, DialogContent, DialogTitle, Slide, Typography } from '@mui/material'
import type { SlideProps } from '@mui/material'
import { useQuery } from '@tanstack/react-query'

import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import DetailRenderer from '@/_workspace/pages/_request-history/components/DetailRenderer'
import AllRequestHistoryServices from '@/_workspace/services/_all-request-history/AllRequestHistoryServices'
import { PREFIX_QUERY_KEY } from '../env'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement },
  ref: Ref<unknown>
) {
  return <Slide direction='down' ref={ref} {...props} />
})

export const allRequestHistoryDetailQueryOptions = (requestId: number) => ({
  queryKey: [PREFIX_QUERY_KEY, 'DETAIL', requestId],
  queryFn: async () => {
    const response = await AllRequestHistoryServices.getById(requestId)

    if (!response.data?.Status || !response.data.ResultOnDb) {
      throw new Error(response.data?.Message || 'Failed to load request detail')
    }

    return response.data.ResultOnDb
  },
  staleTime: 30_000
})

interface RequestDetailDialogProps {
  open: boolean
  requestId: number | null
  onClose: () => void
}

export default function RequestDetailDialog({ open, requestId, onClose }: RequestDetailDialogProps) {
  const detailQuery = useQuery({
    ...allRequestHistoryDetailQueryOptions(requestId ?? 0),
    enabled: open && !!requestId
  })

  return (
    <Dialog
      maxWidth='md'
      fullWidth
      open={open}
     TransitionComponent={Transition}
      keepMounted
      scroll='paper'
      onClose={(_event, reason) => {
        if (reason !== 'backdropClick') onClose()
      }}
      sx={{
        '& .MuiDialog-paper': { overflow: 'visible' },
        '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
      }}
    >
      <DialogTitle>
        <Typography variant='h5' component='span'>
          Request Details
        </Typography>
        <DialogCloseButton onClick={onClose} disableRipple>
          <i className='tabler-x' />
        </DialogCloseButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0, bgcolor: 'background.default' }}>
        {detailQuery.isLoading ? (
          <Box sx={{ minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
            <CircularProgress size={22} />
            <Typography variant='body2' color='text.secondary'>
              Loading request details...
            </Typography>
          </Box>
        ) : (
          detailQuery.data && <DetailRenderer data={detailQuery.data} />
        )}
      </DialogContent>
    </Dialog>
  )
}
