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

                    {/* Vendor Data Summary */}
                    {vendorData && (
                        <Box sx={{ mt: 2 }}>
                            <Divider sx={{ mb: 2 }}>
                                <Typography variant='body2' color='primary'>
                                    Saved Information
                                </Typography>
                            </Divider>

                            <Grid container spacing={2}>
                                {/* Company Info */}
                                <Grid item xs={12}>
                                    <Card variant='outlined' sx={{ bgcolor: 'action.hover' }}>
                                        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                                            <Typography variant='subtitle2' color='primary' gutterBottom>
                                                <i className='tabler-building me-2' />
                                                Company Details
                                            </Typography>
                                            <Grid container spacing={1}>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant='caption' color='text.secondary'>
                                                        Company Name
                                                    </Typography>
                                                    <Typography variant='body2'>
                                                        {vendorData.company_name}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6} sm={3}>
                                                    <Typography variant='caption' color='text.secondary'>
                                                        Province
                                                    </Typography>
                                                    <Typography variant='body2'>
                                                        {vendorData.province}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6} sm={3}>
                                                    <Typography variant='caption' color='text.secondary'>
                                                        Postal Code
                                                    </Typography>
                                                    <Typography variant='body2'>
                                                        {vendorData.postal_code}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6} sm={4}>
                                                    <Typography variant='caption' color='text.secondary'>
                                                        Vendor Type
                                                    </Typography>
                                                    <Typography variant='body2'>
                                                        {vendorData.vendor_type_name || '-'}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6} sm={4}>
                                                    <Typography variant='caption' color='text.secondary'>
                                                        Website
                                                    </Typography>
                                                    <Typography variant='body2'>
                                                        {vendorData.website || '-'}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6} sm={4}>
                                                    <Typography variant='caption' color='text.secondary'>
                                                        Tel Center
                                                    </Typography>
                                                    <Typography variant='body2'>
                                                        {vendorData.tel_center || '-'}
                                                    </Typography>
                                                </Grid>
                                                {vendorData.address && (
                                                    <Grid item xs={12}>
                                                        <Typography variant='caption' color='text.secondary'>
                                                            Address
                                                        </Typography>
                                                        <Typography variant='body2'>
                                                            {vendorData.address}
                                                        </Typography>
                                                    </Grid>
                                                )}
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* Contacts */}
                                {vendorData.contacts && vendorData.contacts.length > 0 && (
                                    <Grid item xs={12} sm={6}>
                                        <Card variant='outlined' sx={{ bgcolor: 'action.hover', height: '100%' }}>
                                            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                                                <Typography variant='subtitle2' color='primary' gutterBottom>
                                                    <i className='tabler-users me-2' />
                                                    Contacts ({vendorData.contacts.length})
                                                </Typography>
                                                {vendorData.contacts.map((contact, index) => (
                                                    <Box
                                                        key={index}
                                                        sx={{
                                                            p: 1,
                                                            mb: 1,
                                                            bgcolor: 'background.paper',
                                                            borderRadius: 1,
                                                            border: '1px solid',
                                                            borderColor: 'divider'
                                                        }}
                                                    >
                                                        <Typography variant='body2' fontWeight={500}>
                                                            {index + 1}. {contact.seller_name}
                                                        </Typography>
                                                        <Typography variant='caption' color='text.secondary'>
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
                                {vendorData.products && vendorData.products.length > 0 && (
                                    <Grid item xs={12} sm={6}>
                                        <Card variant='outlined' sx={{ bgcolor: 'action.hover', height: '100%' }}>
                                            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                                                <Typography variant='subtitle2' color='primary' gutterBottom>
                                                    <i className='tabler-package me-2' />
                                                    Products ({vendorData.products.length})
                                                </Typography>
                                                {vendorData.products.map((product, index) => (
                                                    <Box
                                                        key={index}
                                                        sx={{
                                                            p: 1,
                                                            mb: 1,
                                                            bgcolor: 'background.paper',
                                                            borderRadius: 1,
                                                            border: '1px solid',
                                                            borderColor: 'divider'
                                                        }}
                                                    >
                                                        <Typography variant='body2' fontWeight={500}>
                                                            {index + 1}. {product.product_name}
                                                        </Typography>
                                                        <Typography variant='caption' color='text.secondary' component='div'>
                                                            Group: {product.product_group_name || '-'} • Maker: {product.maker_name}
                                                        </Typography>
                                                        {product.model_list && (
                                                            <Typography
                                                                variant='caption'
                                                                color='text.secondary'
                                                                component='div'
                                                                sx={{ whiteSpace: 'pre-line', mt: 0.5 }}
                                                            >
                                                                Models: {product.model_list.split('\n').join(', ')}
                                                            </Typography>
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
                    <Button variant='contained' color='success' onClick={onCloseClick} size='large'>
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default SuccessModal
