import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import Transition from '@components/TransitionDialog'

export type ActionRequiredDetail = {
  stage?: string
  owner?: string
  ownerEmail?: string
  dueDate?: string
  note?: string
  actor?: string
  capturedAt?: string
  rawRemark?: string
}

interface ActionRequiredDetailDialogProps {
  open: boolean
  detail: ActionRequiredDetail | null
  onClose: () => void
}

export default function ActionRequiredDetailDialog({ open, detail, onClose }: ActionRequiredDetailDialogProps) {
  return (
    <Dialog
      maxWidth='sm'
      fullWidth
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={(_event, reason) => {
        if (reason !== 'backdropClick') onClose()
      }}
      sx={{
        '& .MuiDialog-paper': { overflow: 'visible' },
        '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
      }}
      PaperProps={{ sx: { top: 30, m: 0 } }}
    >
      <DialogTitle>
        <Typography variant='h5' component='span'>
          Action Required Detail
        </Typography>
        <DialogCloseButton onClick={onClose} disableRipple>
          <i className='tabler-x' />
        </DialogCloseButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          <Typography variant='body2'><strong>Stage:</strong> {detail?.stage || '-'}</Typography>
          <Typography variant='body2'><strong>Owner:</strong> {detail?.owner || '-'}</Typography>
          <Typography variant='body2'><strong>Owner Email:</strong> {detail?.ownerEmail || '-'}</Typography>
          <Typography variant='body2'><strong>Due Date:</strong> {detail?.dueDate || '-'}</Typography>
          <Typography variant='body2'><strong>Note:</strong> {detail?.note || '-'}</Typography>
          <Typography variant='body2'><strong>Actor:</strong> {detail?.actor || '-'}</Typography>
          <Typography variant='body2'><strong>Captured At:</strong> {detail?.capturedAt || '-'}</Typography>
          {detail?.rawRemark && (
            <Typography variant='caption' color='text.secondary'>
              Raw: {detail.rawRemark}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant='tonal' color='secondary'>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
