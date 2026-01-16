'use client'

import type { ReactElement, Ref } from 'react'
import { forwardRef, useState } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Slide,
    SlideProps,
    Collapse,
    IconButton
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'

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
    errorDetails?: string
    onRetry?: () => void
}

const ErrorModal = ({
    open,
    onClose,
    title = "เกิดข้อผิดพลาด",
    message = "ไม่สามารถบันทึกข้อมูลได้",
    errorDetails,
    onRetry
}: ErrorModalProps) => {
    const [showDetails, setShowDetails] = useState(false)

    return (
        <Dialog
            open={open}
            onClose={(event, reason) => {
                if (reason !== 'backdropClick') {
                    onClose()
                }
            }}
            maxWidth="xs"
            fullWidth
            TransitionComponent={Transition}
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
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                    <Typography variant='body1' sx={{ color: 'text.secondary' }}>
                        {message}
                    </Typography>
                </Box>

                {errorDetails && (
                    <Box sx={{ mt: 2, width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Button
                                size="small"
                                color="inherit"
                                onClick={() => setShowDetails(!showDetails)}
                                endIcon={showDetails ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                            >
                                {showDetails ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียดเพิ่มเติม'}
                            </Button>
                        </Box>

                        <Collapse in={showDetails}>
                            <Box
                                sx={{
                                    mt: 2,
                                    bgcolor: 'grey.100',
                                    p: 2,
                                    borderRadius: 1,
                                    fontFamily: 'monospace',
                                    fontSize: '0.875rem',
                                    maxHeight: 200,
                                    overflow: 'auto',
                                    wordBreak: 'break-all'
                                }}
                            >
                                <Typography variant="caption" component="pre" style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                                    {errorDetails}
                                </Typography>
                            </Box>
                        </Collapse>
                    </Box>
                )}
            </DialogContent>

            <DialogActions
                sx={{
                    justifyContent: 'center',
                    borderTop: 'none',
                    mb: 4,
                    gap: 2
                }}
            >
                {onRetry && (
                    <Button
                        variant='contained'
                        color='primary'
                        onClick={onRetry}
                        size='large'
                        sx={{ minWidth: 100 }}
                    >
                        ลองใหม่
                    </Button>
                )}
                <Button
                    variant='tonal'
                    color='secondary'
                    onClick={onClose}
                    size='large'
                    sx={{ minWidth: 100 }}
                >
                    ปิด
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ErrorModal