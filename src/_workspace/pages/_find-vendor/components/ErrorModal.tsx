'use client'

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
    open: boolean
    onClose: () => void
    title?: string
    message?: string
    errorDetails?: any
    onRetry?: () => void
}

const ErrorModal = ({
    open,
    onClose,
    message = 'Something went wrong',
    errorDetails,
    onRetry
}: ErrorModalProps) => {
    // Extract ResultOnDb message if available
    const dbMessage = errorDetails?.response?.data?.ResultOnDb?.[0]?.message || errorDetails?.ResultOnDb?.[0]?.message
    const displayMessage = dbMessage || message
    return (
        <Dialog
            maxWidth='sm'
            fullWidth={true}
            open={open}
            disableEscapeKeyDown
            aria-labelledby='error-dialog-title'
            aria-describedby='error-dialog-description'
            TransitionComponent={Transition}
            onClose={(event, reason) => {
                if (reason !== 'backdropClick') {
                    onClose()
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
                    <Typography variant='h5' color='error.main'>
                        Please check the vendor information all required fields are correct.
                    </Typography>
                </Box>
                <Box sx={{ mb: 2, textAlign: 'center' }}>
                    <Typography variant='body1' sx={{ color: 'text.secondary' }}>
                        {displayMessage}
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
                {/* 
                <Button variant='contained' color='primary' onClick={onRetry} size='large'>
                    Try Again
                </Button> */}

                <Button variant='tonal' color='secondary' onClick={onClose} size='large'>
                    OK
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ErrorModal