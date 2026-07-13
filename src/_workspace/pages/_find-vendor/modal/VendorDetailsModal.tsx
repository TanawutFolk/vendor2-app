'use client'

// MUI Imports
import { Alert, AlertTitle, Box, Chip, Dialog, DialogContent, DialogTitle, Grid, Typography } from '@mui/material'

// Components Imports
import Transition from '@components/TransitionDialog'
import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import { DetailCard, EmptyState, ReadOnlyField, RecordCard, SectionHeader } from '@components/detail-view'

import { EmailActionButtons } from '../components/EmailActionButtons'
import { StatusCheckChip } from '../components/fftStatus'

// Utils Imports
import { getChipSx, getReadableStatusTone } from '@_workspace/utils/statusChipStyles'

import type { VendorDetailsModalProps } from '@_workspace/types/_find-vendor/FindVendorTypes'

const VendorDetailsModal = ({ open, onClose, data }: VendorDetailsModalProps) => {
    const contacts = (Array.isArray(data?.CONTACTS) ? data.CONTACTS : []).filter(Boolean)
    const products = (Array.isArray(data?.PRODUCTS) ? data.PRODUCTS : []).filter(Boolean)

    const companyName = data?.COMPANY_NAME
    const vendorTypeName = data?.VENDOR_TYPE_NAME
    const vendorRegion = data?.VENDOR_REGION
    const statusCheck = data?.STATUS_CHECK
    const rejectReason = data?.REJECT_REASON

    // Same source as the grid's Prones Code column (vendor_match_result); the vendors row
    // only carries FFT_VENDOR_CODE once the vendor is registered.
    const fftVendorCode = data?.PRONES_CODE || data?.FFT_VENDOR_CODE
    const isActive = Number(data?.INUSE ?? 1) === 1

    return (
        <Dialog
            maxWidth='lg'
            fullWidth
            onClose={(event, reason) => {
                if (reason !== 'backdropClick') onClose()
            }}
            TransitionComponent={Transition}
            open={open}
            scroll='paper'
            PaperProps={{
                sx: {
                    bgcolor: 'background.default',
                    width: 'min(1200px, calc(100vw - 32px))'
                }
            }}
            sx={{
                '& .MuiDialog-paper': { overflow: 'visible' },
                '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
            }}
        >
            <DialogTitle>
                <Typography variant='h5' component='span'>
                    Vendor Details
                </Typography>
                <DialogCloseButton onClick={onClose} disableRipple>
                    <i className='tabler-x' />
                </DialogCloseButton>
            </DialogTitle>

            {/* Header bar — same layout as VendorModalHeaderBar, without the form-bound INUSE switch */}
            <Box
                sx={{
                    width: '100%',
                    px: 3,
                    py: 2,
                    bgcolor: 'background.paper',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                    flexWrap: 'wrap'
                }}
            >
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.25, flexWrap: 'wrap' }}>
                        <Typography variant='h6' fontWeight={800}>
                            {companyName || 'Vendor Details'}
                        </Typography>
                        {fftVendorCode && (
                            <Chip
                                label={`Code: ${fftVendorCode}`}
                                size='small'
                                color='primary'
                                variant='tonal'
                                sx={{ fontWeight: 700, fontSize: '0.7rem', height: 22 }}
                            />
                        )}
                        {statusCheck && <StatusCheckChip value={statusCheck} />}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Chip
                            label={isActive ? 'Active' : 'Inactive'}
                            size='small'
                            sx={getChipSx(getReadableStatusTone(isActive ? 'completed' : 'pending'), { fontWeight: 700 })}
                        />
                        <Typography variant='caption' color='text.disabled'>
                            ·
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                            <i className='tabler-user' style={{ fontSize: 12, color: 'var(--mui-palette-text-disabled)' }} />
                            <Typography variant='caption' color='text.disabled'>
                                Update By: {data?.UPDATE_BY || '-'}
                            </Typography>
                        </Box>
                        <Typography variant='caption' color='text.disabled'>
                            ·
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                            <i className='tabler-calendar' style={{ fontSize: 12, color: 'var(--mui-palette-text-disabled)' }} />
                            <Typography variant='caption' color='text.disabled'>
                                Update Date:{' '}
                                {data?.UPDATE_DATE ? new Date(data.UPDATE_DATE).toLocaleDateString('th-TH') : '-'}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>

            <DialogContent
                dividers
                sx={{ p: 3, maxHeight: '75vh', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}
            >
                {statusCheck === 'Cannot Register' && (
                    <Alert severity='error'>
                        <AlertTitle>Cannot Register</AlertTitle>
                        <strong>Reject Reason:</strong> {rejectReason || 'No reason specified'}
                    </Alert>
                )}

                {/* Company Profile */}
                <Box>
                    <SectionHeader icon='tabler-building-store' title='Company Profile' />
                    <DetailCard>
                        <Grid container spacing={4}>
                            <Grid item xs={12} md={6}>
                                <ReadOnlyField label='Company Name' value={companyName} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <ReadOnlyField label='Vendor Type' value={vendorTypeName} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Box>
                                    <Typography
                                        variant='caption'
                                        color='text.secondary'
                                        sx={{ display: 'block', mb: 1, fontWeight: 600 }}
                                    >
                                        Vendor Region
                                    </Typography>
                                    <Chip
                                        label={vendorRegion === 'Oversea' ? 'Oversea' : 'Local'}
                                        color={vendorRegion === 'Oversea' ? 'info' : 'success'}
                                        size='small'
                                        variant='tonal'
                                        sx={{ fontWeight: 600 }}
                                    />
                                </Box>
                            </Grid>
                            {vendorRegion === 'Oversea' ? (
                                <Grid item xs={12} md={6}>
                                    <ReadOnlyField label='Country' value={data?.COUNTRY} />
                                </Grid>
                            ) : (
                                <>
                                    <Grid item xs={6} md={3}>
                                        <ReadOnlyField label='Province' value={data?.PROVINCE} />
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                        <ReadOnlyField label='Postal Code' value={data?.POSTAL_CODE} />
                                    </Grid>
                                </>
                            )}
                            <Grid item xs={6} md={3}>
                                <ReadOnlyField label='Website' value={data?.WEBSITE} />
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <ReadOnlyField label='Tel Company' value={data?.TEL_CENTER} />
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <ReadOnlyField
                                    label='Email (Main)'
                                    value={data?.EMAILMAIN}
                                    endAdornment={
                                        data?.EMAILMAIN ? (
                                            <EmailActionButtons email={data.EMAILMAIN} contactName={companyName} />
                                        ) : undefined
                                    }
                                />
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <ReadOnlyField label='FFT Vendor Code' value={fftVendorCode} />
                            </Grid>
                            <Grid item xs={12}>
                                <ReadOnlyField label='Address' value={data?.ADDRESS} multiline />
                            </Grid>
                        </Grid>
                    </DetailCard>
                </Box>

                {/* Contacts */}
                <Box>
                    <SectionHeader icon='tabler-users' title={`Contacts (${contacts.length})`} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {contacts.length === 0 ? (
                            <EmptyState message='No contacts' />
                        ) : (
                            contacts.map((contact: any, index: number) => (
                                <RecordCard key={contact.VENDOR_CONTACT_ID ?? index} index={index} title='Contact Info'>
                                    <Grid item xs={12} sm={6}>
                                        <ReadOnlyField label='Name' value={contact.CONTACT_NAME} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <ReadOnlyField label='Phone' value={contact.TEL_PHONE} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <ReadOnlyField
                                            label='Email'
                                            value={contact.EMAIL}
                                            endAdornment={
                                                contact.EMAIL ? (
                                                    <EmailActionButtons
                                                        email={contact.EMAIL}
                                                        contactName={contact.CONTACT_NAME}
                                                    />
                                                ) : undefined
                                            }
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <ReadOnlyField label='Position' value={contact.POSITION} />
                                    </Grid>
                                </RecordCard>
                            ))
                        )}
                    </Box>
                </Box>

                {/* Products / Services */}
                <Box>
                    <SectionHeader icon='tabler-package' title={`Products / Services (${products.length})`} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {products.length === 0 ? (
                            <EmptyState message='No products' />
                        ) : (
                            products.map((product: any, index: number) => (
                                <RecordCard key={product.VENDOR_PRODUCT_ID ?? index} index={index} title='Product'>
                                    <Grid item xs={12} sm={6}>
                                        <ReadOnlyField label='Product Group' value={product.GROUP_NAME} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <ReadOnlyField label='Maker' value={product.MAKER_NAME} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <ReadOnlyField label='Product Name' value={product.PRODUCT_NAME} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <ReadOnlyField label='Model List' value={product.MODEL_LIST} multiline />
                                    </Grid>
                                </RecordCard>
                            ))
                        )}
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    )
}

export default VendorDetailsModal
