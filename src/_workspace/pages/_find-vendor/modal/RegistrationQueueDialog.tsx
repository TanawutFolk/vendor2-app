import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import Transition from '@components/TransitionDialog'

interface RegistrationQueueDialogProps {
  open: boolean
  requestsAhead: number | null
  onClose: () => void
}

export default function RegistrationQueueDialog({ open, requestsAhead, onClose }: RegistrationQueueDialogProps) {
  const queueCount = requestsAhead ?? 0

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={(_event, reason) => {
        if (reason !== 'backdropClick') onClose()
      }}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: { xs: 'calc(100vw - 32px)', sm: 400 },
          maxWidth: 400,
          aspectRatio: '1 / 1',
          m: 2,
          borderRadius: 3,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ pt: 4, pb: 1, textAlign: 'center', fontWeight: 700 }}>
        Registration Request Created
      </DialogTitle>
      <DialogContent
        sx={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}
      >
        <Typography variant='overline' color='text.secondary' fontWeight={700}>
          Requests Ahead
        </Typography>
        <Typography
          component='div'
          color='primary.main'
          sx={{
            my: 1,
            fontSize: { xs: '5.5rem', sm: '7rem' },
            fontWeight: 800,
            lineHeight: 0.95,
            letterSpacing: '-0.06em'
          }}
        >
          {queueCount}
        </Typography>
        <Typography color='text.secondary'>There are currently {queueCount} requests ahead of you.</Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 4 }}>
        <Button variant='contained' sx={{ minWidth: 120 }} onClick={onClose}>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  )
}
