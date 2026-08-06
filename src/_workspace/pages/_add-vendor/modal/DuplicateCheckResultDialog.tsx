import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'

import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import Transition from '@components/TransitionDialog'
import type { BlacklistMatchI } from '@/_workspace/types/_add-vendor/AddVendorTypes'

export type DuplicateCheckResultType = 'duplicate' | 'blacklist' | 'duplicate-blacklist' | null

interface DuplicateCheckResultDialogProps {
  open: boolean
  type: DuplicateCheckResultType
  errorMessage: string | null
  existingVendorId: number | null
  blacklistMatches: BlacklistMatchI[]
  onClose: () => void
  onEditExisting: () => void
}

export default function DuplicateCheckResultDialog({
  open,
  type,
  errorMessage,
  existingVendorId,
  blacklistMatches,
  onClose,
  onEditExisting
}: DuplicateCheckResultDialogProps) {
  const hasBlacklistResult = type === 'blacklist' || type === 'duplicate-blacklist'
  const hasDuplicateResult = type === 'duplicate' || type === 'duplicate-blacklist'
  const title =
    type === 'duplicate-blacklist'
      ? 'Duplicate Vendor and Blacklist Match Found'
      : type === 'blacklist'
        ? 'Blacklist Match Found'
        : 'Duplicate Vendor Found'

  const matchesTable = (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size='small' sx={{ minWidth: 720 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>List</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Matched Name</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Match Type</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Source</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Entity No.</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Programs</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {blacklistMatches.map((match, index) => (
            <TableRow key={`${match.GROUP_CODE}-${match.MATCHED_NAME}-${index}`}>
              <TableCell>
                <Chip label={match.GROUP_CODE} size='small' color={match.GROUP_CODE === 'US' ? 'primary' : 'warning'} />
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'error.main' }}>{match.MATCHED_NAME}</TableCell>
              <TableCell>{match.MATCH_TYPE === 'alias' ? 'Alias' : 'Primary Name'}</TableCell>
              <TableCell>{match.SOURCE_NAME || '-'}</TableCell>
              <TableCell>{match.ENTITY_NUMBER || '-'}</TableCell>
              <TableCell>{match.PROGRAMS || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )

  return (
    <Dialog
      maxWidth={hasBlacklistResult ? 'lg' : 'sm'}
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
    >
      <DialogTitle>
        <Typography variant='h5' component='span'>{title}</Typography>
        <DialogCloseButton onClick={onClose} disableRipple>
          <i className='tabler-x' />
        </DialogCloseButton>
      </DialogTitle>
      <DialogContent>
        {type === 'duplicate-blacklist' ? (
          <Box sx={{ pt: 2 }}>
            <Typography variant='body1' sx={{ mb: 1.5 }}>
              {errorMessage || 'This vendor already exists and also matched blacklist data.'}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
              Existing Vendor ID: {existingVendorId || '-'}
            </Typography>
            <Typography variant='subtitle2' fontWeight={700} sx={{ mb: 1.5 }}>Blacklist Matches</Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
              Company name matches {blacklistMatches.length} record(s) in the blacklist. Please contact your compliance
              team before proceeding.
            </Typography>
            {matchesTable}
          </Box>
        ) : type === 'blacklist' ? (
          <Box sx={{ pt: 2 }}>
            <Typography variant='body1' sx={{ mb: 1.5 }}>
              {errorMessage || 'This vendor matched blacklist data and registration is blocked.'}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
              Company name matches {blacklistMatches.length} record(s) in the blacklist. Please contact your compliance
              team before proceeding.
            </Typography>
            {matchesTable}
          </Box>
        ) : (
          <Box sx={{ pt: 2 }}>
            <Typography variant='body1' sx={{ mb: 1.5 }}>
              {errorMessage || 'This vendor already exists in the system.'}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Please review the existing vendor record before creating a new one.
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'flex-start' }}>
        {hasDuplicateResult && existingVendorId && (
          <Button variant='contained' color='success' onClick={onEditExisting} startIcon={<i className='tabler-edit' />}>
            Edit Existing Vendor
          </Button>
        )}
        <Button variant='tonal' color='secondary' onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
