'use client'

import type { ReactElement, Ref } from 'react'
import { forwardRef } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Slide,
    SlideProps
} from '@mui/material'

const Transition = forwardRef(function Transition(
    props: SlideProps & { children?: ReactElement<any, any> },
    ref: Ref<unknown>
) {
    return <Slide direction='down' ref={ref} {...props} />
})

interface ConfirmModalProps {
    open: boolean
    onClose: () => void
    onConfirm: () => void
    title?: string
    message?: string
    loading?: boolean
}

const ConfirmModal = ({
    open,
    onClose,
    onConfirm,
    title = "ยืนยันการบันทึกข้อมูล",
    message = "คุณต้องการบันทึกการเปลี่ยนแปลงใช่หรือไม่?",
    loading = false
}: ConfirmModalProps) => {
    return (
        <Dialog
            open={open}
            onClose={(event, reason) => {
                if (reason !== 'backdropClick' && !loading) {
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
                            bgcolor: 'warning.light',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <i className='tabler-alert-circle' style={{ fontSize: 48, color: '#fff' }} />
                    </Box>
                </Box>
                <Box sx={{ mb: 2, textAlign: 'center' }}>
                    <Typography variant='h4' color='warning.main'>
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
                    justifyContent: 'center',
                    borderTop: 'none',
                    mb: 4,
                    gap: 2
                }}
            >
                <Button
                    variant="tonal"
                    color="secondary"
                    onClick={onClose}
                    disabled={loading}
                    size='large'
                    sx={{ minWidth: 100 }}
                >
                    ยกเลิก
                </Button>
                <Button
                    variant="contained"
                    onClick={onConfirm}
                    disabled={loading}
                    color="primary"
                    size='large'
                    sx={{ minWidth: 100 }}
                >
                    {loading ? 'กำลังบันทึก...' : 'ยืนยัน'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ConfirmModal