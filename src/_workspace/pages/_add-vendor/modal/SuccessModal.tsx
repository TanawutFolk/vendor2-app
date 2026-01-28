// React Imports
import type { ReactElement, Ref } from 'react'
import { forwardRef } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import type { SlideProps } from '@mui/material'
import { Box, Slide, Typography, Divider, Chip, Grid, Card, CardContent } from '@mui/material'

// Types
import type { AddVendorFormData } from '../validateSchema'

const Transition = forwardRef(function Transition(
    props: SlideProps & { children?: ReactElement<any, any> },
    ref: Ref<unknown>
) {
    return <Slide direction='down' ref={ref} {...props} />
})

interface SuccessModalProps {
    show: boolean
    title?: string
    message?: string
    vendorId?: number
    vendorData?: AddVendorFormData
    onCloseClick: () => void
}

const SuccessModal = ({
    show,
    title = 'Success!',
    message = 'Vendor created successfully.',
    vendorId,
    vendorData,
    onCloseClick
}: SuccessModalProps) => {
    return (
        <>
            <Dialog
                maxWidth='md'
                fullWidth={true}
                open={show}
                disableEscapeKeyDown
                aria-labelledby='success-dialog-title'
                aria-describedby='success-dialog-description'
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

                    <Grid container spacing={2}>
                        {/* Company Info */}
                        <Grid item xs={12}>
                            <Card variant='outlined' sx={{ bgcolor: 'action.hover' }}>
                                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                                    <Typography variant='subtitle2' color='primary' gutterBottom>
                                        <i className='tabler-building me-2' />
                                        Company Details
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <Grid container>
                                                <Grid item xs={12} sm={4}>
                                                    <Typography variant='body2' color='text.secondary'>Company Name</Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={8}>
                                                    <Typography variant='body2' fontWeight={500}>{vendorData?.company_name}</Typography>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Grid container>
                                                <Grid item xs={12} sm={4}>
                                                    <Typography variant='body2' color='text.secondary'>Province</Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={8}>
                                                    <Typography variant='body2' fontWeight={500}>{vendorData?.province}</Typography>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Grid container>
                                                <Grid item xs={12} sm={4}>
                                                    <Typography variant='body2' color='text.secondary'>Postal Code</Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={8}>
                                                    <Typography variant='body2' fontWeight={500}>{vendorData?.postal_code}</Typography>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Grid container>
                                                <Grid item xs={12} sm={4}>
                                                    <Typography variant='body2' color='text.secondary'>Vendor Type</Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={8}>
                                                    <Typography variant='body2' fontWeight={500}>{vendorData?.vendor_type?.label || '-'}</Typography>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Grid container>
                                                <Grid item xs={12} sm={4}>
                                                    <Typography variant='body2' color='text.secondary'>Website</Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={8}>
                                                    <Typography variant='body2' sx={{ wordBreak: 'break-all' }} fontWeight={500}>{vendorData?.website || '-'}</Typography>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Grid container>
                                                <Grid item xs={12} sm={4}>
                                                    <Typography variant='body2' color='text.secondary'>Tel Center</Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={8}>
                                                    <Typography variant='body2' fontWeight={500}>{vendorData?.tel_center || '-'}</Typography>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        {vendorData?.address && (
                                            <Grid item xs={12}>
                                                <Grid container>
                                                    <Grid item xs={12} sm={2}>
                                                        <Typography variant='body2' color='text.secondary'>Address</Typography>
                                                    </Grid>
                                                    <Grid item xs={12} sm={10}>
                                                        <Typography variant='body2' fontWeight={500} sx={{ whiteSpace: 'pre-line' }}>{vendorData?.address}</Typography>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        )}
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Contacts */}
                        {vendorData?.contacts && vendorData?.contacts.length > 0 && (
                            <Grid item xs={12} md={6}>
                                <Card variant='outlined' sx={{ bgcolor: 'action.hover', height: '100%' }}>
                                    <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                                        <Typography variant='subtitle2' color='primary' gutterBottom>
                                            <i className='tabler-users me-2' />
                                            Contacts ({vendorData?.contacts.length})
                                        </Typography>
                                        {vendorData?.contacts.map((contact, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    p: 2,
                                                    mb: 1,
                                                    bgcolor: 'background.paper',
                                                    borderRadius: 1,
                                                    border: '1px solid',
                                                    borderColor: 'divider'
                                                }}
                                            >
                                                <Grid container spacing={1}>
                                                    <Grid item xs={12}>
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={12} sm={6}>
                                                                <Grid container>
                                                                    <Grid item xs={12} sm={3}>
                                                                        <Typography variant='caption' color='text.secondary'>Name</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={12} sm={9}>
                                                                        <Typography variant='body2' fontWeight={500}>{contact.contact_name}</Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </Grid>
                                                            <Grid item xs={12} sm={6}>
                                                                <Grid container>
                                                                    <Grid item xs={12} sm={3}>
                                                                        <Typography variant='caption' color='text.secondary'>Phone</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={12} sm={9}>
                                                                        <Typography variant='body2' fontWeight={500}>{contact.tel_phone || '-'}</Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={12} sm={6}>
                                                                <Grid container>
                                                                    <Grid item xs={12} sm={3}>
                                                                        <Typography variant='caption' color='text.secondary'>Position</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={12} sm={9}>
                                                                        <Typography variant='body2' fontWeight={500}>{contact.position || '-'}</Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </Grid>
                                                            <Grid item xs={12} sm={6}>
                                                                <Grid container>
                                                                    <Grid item xs={12} sm={3}>
                                                                        <Typography variant='caption' color='text.secondary'>Email</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={12} sm={9}>
                                                                        <Typography variant='body2' fontWeight={500} sx={{ wordBreak: 'break-all' }}>{contact.email || '-'}</Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        ))}
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}

                        {/* Products */}
                        {vendorData?.products && vendorData?.products.length > 0 && (
                            <Grid item xs={12} md={6}>
                                <Card variant='outlined' sx={{ bgcolor: 'action.hover', height: '100%' }}>
                                    <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                                        <Typography variant='subtitle2' color='primary' gutterBottom>
                                            <i className='tabler-package me-2' />
                                            Products ({vendorData?.products.length})
                                        </Typography>
                                        {vendorData?.products.map((product, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    p: 2,
                                                    mb: 1,
                                                    bgcolor: 'background.paper',
                                                    borderRadius: 1,
                                                    border: '1px solid',
                                                    borderColor: 'divider'
                                                }}
                                            >
                                                <Grid container spacing={1}>
                                                    <Grid item xs={12}>
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={12} sm={6}>
                                                                <Grid container>
                                                                    <Grid item xs={12} sm={4}>
                                                                        <Typography variant='caption' color='text.secondary'>Product Name</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={12} sm={8}>
                                                                        <Typography variant='body2' fontWeight={500}>{product.product_name}</Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </Grid>
                                                            <Grid item xs={12} sm={6}>
                                                                <Grid container>
                                                                    <Grid item xs={12} sm={4}>
                                                                        <Typography variant='caption' color='text.secondary'>Group</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={12} sm={8}>
                                                                        <Typography variant='body2' fontWeight={500}>
                                                                            {product.product_group?.label || '-'}
                                                                        </Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={12} sm={6}>
                                                                <Grid container>
                                                                    <Grid item xs={12} sm={4}>
                                                                        <Typography variant='caption' color='text.secondary'>Maker</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={12} sm={8}>
                                                                        <Typography variant='body2' fontWeight={500}>{product.maker_name || '-'}</Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </Grid>
                                                            <Grid item xs={12} sm={6}>
                                                                <Grid container>
                                                                    <Grid item xs={12} sm={4}>
                                                                        <Typography variant='caption' color='text.secondary'>Models</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={12} sm={8}>
                                                                        <Typography variant='body2' fontWeight={500} sx={{ whiteSpace: 'pre-line' }}>
                                                                            {product.model_list ? product.model_list.split('\n').join(', ') : '-'}
                                                                        </Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        ))}
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>

                <DialogActions
                    sx={{
                        justifyContent: 'center',
                        borderTop: 'none',
                        mb: 3
                    }}
                >
                    <Button variant='contained' color='success' onClick={onCloseClick} size='large'>
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default SuccessModal
