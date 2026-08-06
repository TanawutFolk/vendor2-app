import { forwardRef } from 'react'
import type { ReactElement, Ref } from 'react'
import { Box, CircularProgress, Dialog, DialogContent, DialogTitle, Slide, Typography } from '@mui/material'
import type { SlideProps } from '@mui/material'
import { useQuery } from '@tanstack/react-query'

import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import { requestDetailQueryOptions } from '@/_workspace/react-query/hooks/useRegisterRequest'
import DetailRenderer from '../components/DetailRenderer'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement },
  ref: Ref<unknown>
) {
  return <Slide direction='down' ref={ref} {...props} />
})

interface RequestDetailDialogProps {
  open: boolean
  requestId: number | null
  onClose: () => void
}

export default function RequestDetailDialog({ open, requestId, onClose }: RequestDetailDialogProps) {
  const detailQuery = useQuery({
    ...requestDetailQueryOptions(requestId ?? 0),
    enabled: open && !!requestId
  })

  return (
    <Dialog
      maxWidth='md'
      fullWidth
      open={open}
      onClose={(_event, reason) => {
        if (reason !== 'backdropClick') onClose()
      }}
     TransitionComponent={Transition}
      keepMounted
      scroll='paper'
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
