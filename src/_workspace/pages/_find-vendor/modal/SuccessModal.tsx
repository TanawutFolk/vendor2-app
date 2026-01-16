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
    Divider,
    Grid,
    Chip,
    Card,
    CardContent,
    Slide,
    SlideProps
} from '@mui/material'

interface UpdatedData {
    vendor?: any
    contacts?: any[]
    products?: any[]
}

interface SuccessModalProps {
    open: boolean
    onClose: () => void
    title?: string
    message?: string
    updatedData?: UpdatedData
}

const Transition = forwardRef(function Transition(
    props: SlideProps & { children?: ReactElement<any, any> },
    ref: Ref<unknown>
) {
    return <Slide direction='down' ref={ref} {...props} />
})

const SuccessModal = ({
    open,
    onClose,
    title = "บันทึกข้อมูลสำเร็จ",
    message = "ข้อมูลถูกอัพเดทเรียบร้อยแล้ว",
    updatedData
}: SuccessModalProps) => {
    return (
        <Dialog
            open={open}
            onClose={(event, reason) => {
                if (reason !== 'backdropClick') {
                    onClose()
                }
            }}
            maxWidth="md"
            fullWidth
            TransitionComponent={Transition}
            sx={{
                '& .MuiDialog-paper': { overflow: 'visible' },
                '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
            }}
        >
            <DialogContent>
                {/* Success Icon */}
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                    <Box
                        sx={{
                            width: 70,
                            height: 70,
                            borderRadius: '50%',
                            bgcolor: 'success.light',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <i className='tabler-check' style={{ fontSize: 40, color: '#fff' }} />
                    </Box>
                </Box>

                {/* Title & Message */}
                <Box sx={{ mb: 2, textAlign: 'center' }}>
                    <Typography variant='h4' color='success.main'>
                        {title}
                    </Typography>
                </Box>
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                    <Typography variant='body1' sx={{ color: 'text.secondary' }}>
                        {message}
                    </Typography>
                </Box>

                {updatedData && (
                    <Box sx={{ mt: 2 }}>
                        <Divider sx={{ mb: 2 }}>
                            <Typography variant='body2' color='primary'>
                                ข้อมูลที่บันทึก
                            </Typography>
                        </Divider>

                        <Grid container spacing={2}>
                            {/* Company Information */}
                            {updatedData.vendor && (
                                <Grid item xs={12}>
                                    <Card variant='outlined' sx={{ bgcolor: 'action.hover' }}>
                                        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                                            <Typography variant="subtitle2" color="success.main" gutterBottom>
                                                <i className="tabler-building" style={{ marginRight: 8 }} />
                                                ข้อมูลบริษัท
                                            </Typography>
                                            <Grid container spacing={1}>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant='caption' color='text.secondary'>
                                                        ชื่อบริษัท
                                                    </Typography>
                                                    <Typography variant='body2'>
                                                        {updatedData.vendor.company_name}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6} sm={3}>
                                                    <Typography variant='caption' color='text.secondary'>
                                                        จังหวัด
                                                    </Typography>
                                                    <Typography variant='body2'>
                                                        {updatedData.vendor.province}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6} sm={3}>
                                                    <Typography variant='caption' color='text.secondary'>
                                                        เว็บไซต์
                                                    </Typography>
                                                    <Typography variant='body2'>
                                                        {updatedData.vendor.website || '-'}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            )}

                            {/* Contacts */}
                            {updatedData.contacts && updatedData.contacts.length > 0 && (
                                <Grid item xs={12} sm={6}>
                                    <Card variant='outlined' sx={{ bgcolor: 'action.hover', height: '100%' }}>
                                        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                                            <Typography variant="subtitle2" color="info.main" gutterBottom>
                                                <i className="tabler-users" style={{ marginRight: 8 }} />
                                                ผู้ติดต่อ ({updatedData.contacts.length} คน)
                                            </Typography>
                                            {updatedData.contacts.map((contact, index) => (
                                                <Box key={index} sx={{
                                                    p: 1,
                                                    mb: 1,
                                                    bgcolor: 'background.paper',
                                                    borderRadius: 1,
                                                    border: '1px solid',
                                                    borderColor: 'divider'
                                                }}>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {index + 1}. {contact.seller_name || 'N/A'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {contact.position && `${contact.position} • `}
                                                        {contact.tel_phone && `📞 ${contact.tel_phone} • `}
                                                        {contact.email && `✉️ ${contact.email}`}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            )}

                            {/* Products */}
                            {updatedData.products && updatedData.products.length > 0 && (
                                <Grid item xs={12} sm={6}>
                                    <Card variant='outlined' sx={{ bgcolor: 'action.hover', height: '100%' }}>
                                        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                                            <Typography variant="subtitle2" color="warning.main" gutterBottom>
                                                <i className="tabler-package" style={{ marginRight: 8 }} />
                                                สินค้า ({updatedData.products.length} รายการ)
                                            </Typography>
                                            {updatedData.products.map((product, index) => (
                                                <Box key={index} sx={{
                                                    p: 1,
                                                    mb: 1,
                                                    bgcolor: 'background.paper',
                                                    borderRadius: 1,
                                                    border: '1px solid',
                                                    borderColor: 'divider'
                                                }}>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {index + 1}. {product.product_name || 'N/A'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" component="div">
                                                        {product.group_name && `Group: ${product.group_name} • `}
                                                        Maker: {product.maker_name || '-'}
                                                    </Typography>
                                                    {product.model_list && (
                                                        <Box sx={{ mt: 0.5 }}>
                                                            {product.model_list.split('\n').filter((m: string) => m.trim()).map((model: string, idx: number) => (
                                                                <Chip
                                                                    key={idx}
                                                                    label={model.trim()}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }}
                                                                />
                                                            ))}
                                                        </Box>
                                                    )}
                                                </Box>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                )}
            </DialogContent>

            <DialogActions
                sx={{
                    justifyContent: 'center',
                    borderTop: 'none',
                    mb: 3
                }}
            >
                <Button
                    variant="contained"
                    color="success"
                    onClick={onClose}
                    size='large'
                    sx={{ minWidth: 100 }}
                >
                    ตกลง
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default SuccessModal