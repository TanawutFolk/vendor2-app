// React Imports
import type { ReactElement, Ref } from 'react'
import { forwardRef } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import type { SlideProps } from '@mui/material'
import { Box, Slide, Typography } from '@mui/material'

const Transition = forwardRef(function Transition(
    props: SlideProps & { children?: ReactElement<any, any> },
    ref: Ref<unknown>
) {
    return <Slide direction='down' ref={ref} {...props} />
})

interface ErrorModalProps {
    show: boolean
    title?: string
    message?: string
    onCloseClick: () => void
    onRetryClick?: () => void
}

const ErrorModal = ({
    show,
    title = 'Error!',
    message = 'An error occurred while saving data. Please try again.',
    onCloseClick,
    onRetryClick
}: ErrorModalProps) => {
    return (
        <>
            <Dialog
                maxWidth='xs'
                fullWidth={true}
                open={show}
                disableEscapeKeyDown
                aria-labelledby='error-dialog-title'
                aria-describedby='error-dialog-description'
                TransitionComponent={Transition}
                onClose={(event, reason) => {
                    if (reason !== 'backdropClick') {
                        onCloseClick()
                    }
                }}
                sx={{
                    '& .MuiDialog-paper': { overflow: 'visible' },
                    '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
                }}
            >
                <DialogContent>
                    <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                bgcolor: 'error.light',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <i className='tabler-x' style={{ fontSize: 48, color: '#fff' }} />
                        </Box>
                    </Box>
                    <Box sx={{ mb: 2, textAlign: 'center' }}>
                        <Typography variant='h4' color='error.main'>
                            {title}
                        </Typography>
                    </Box>
                    <Box sx={{ mb: 2, textAlign: 'center' }}>
                        <Typography variant='body1' sx={{ color: 'text.secondary' }}>
                            {message}
                        </Typography>
                    </Box>
                </DialogContent>

            <DialogActions
                sx={{
                    justifyContent: 'flex-start',
                    borderTop: 'none',
                    mb: 4,
                    gap: 2
                }}
            >
                {onRetryClick && (
                    <Button variant='contained' color='primary' onClick={onRetryClick} size='large'>
                        Try Again
                    </Button>
                )}
                <Button variant='tonal' color='secondary' onClick={onCloseClick} size='large'>
                    Close
                </Button>
            </DialogActions>
            </Dialog>
        </>
    )
}

export default ErrorModal
