import { forwardRef } from 'react'
import type { ReactNode, Ref } from 'react'
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    Slide,
    Typography,
} from '@mui/material'
import type { SlideProps } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import CustomTextField from '@components/mui/TextField'

import undraw_clean_up_re_504g from '@assets/images/common/undraw_clean_up_re_504g.svg'
import undraw_notify_re_65on from '@assets/images/common/undraw_notify_re_65on.svg'

const Transition = forwardRef(function Transition(
    props: SlideProps & { children?: ReactNode },
    ref: Ref<unknown>
) {
    return <Slide direction='down' ref={ref} {...props} />
})

const REJECT_REMARK_MAX_LENGTH = 500

interface ConfirmActionDialogProps {
    open: boolean
    mode: 'APPROVE' | 'REJECT'
    remark: string
    submitting: boolean
    companyName?: string
    onRemarkChange: (value: string) => void
    onConfirm: () => void
    onClose: () => void
}

// Confirmation modal for the GPR C Approve / Reject actions. Mirrors the request-register
// ActionDialog so both approval flows share the same "Are You Sure?" confirmation UX.
export default function ConfirmActionDialog({
    open,
    mode,
    remark,
    submitting,
    companyName,
    onRemarkChange,
    onConfirm,
    onClose,
}: ConfirmActionDialogProps) {
    const isReject = mode === 'REJECT'
    const imageConfirm = isReject ? undraw_clean_up_re_504g : undraw_notify_re_65on
    const actionLabel = isReject ? 'Reject GPR C Step' : 'Approve GPR C Step'
    const confirmDisabled = isReject && !remark.trim()

    return (
        <Dialog
            maxWidth='xs'
            fullWidth
            open={open}
            disableEscapeKeyDown
            aria-labelledby='gprc-confirm-dialog-title'
            aria-describedby='gprc-confirm-dialog-description'
            TransitionComponent={Transition}
            onClose={(_event, reason) => {
                if (reason !== 'backdropClick') onClose()
            }}
            sx={{
                '& .MuiDialog-paper': { overflow: 'visible' },
                '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' },
            }}
        >
            <DialogContent>
                <Box sx={{ mb: 6, display: 'flex', justifyContent: 'center' }}>
                    <img src={imageConfirm} height={120} width={150} alt='' />
                </Box>
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant='h5' id='gprc-confirm-dialog-title'>Are You Sure ?</Typography>
                    <Typography variant='h5' sx={{ color: 'text.secondary' }} id='gprc-confirm-dialog-description'>
                        Confirm {actionLabel}
                    </Typography>
                    {companyName && (
                        <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                            {companyName}
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
                        onChange={event => onRemarkChange(event.target.value)}
                    />
                )}
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'center', borderTop: 'none', mb: 4 }}>
                <LoadingButton
                    onClick={onConfirm}
                    loading={submitting}
                    loadingIndicator={isReject ? 'Rejecting...' : 'Approving...'}
                    variant='contained'
                    color={isReject ? 'error' : 'success'}
                    sx={{ mr: 4 }}
                    disabled={confirmDisabled}
                >
                    <span>Confirm</span>
                </LoadingButton>
                <Button variant='tonal' color='secondary' onClick={onClose} disabled={submitting}>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    )
}
