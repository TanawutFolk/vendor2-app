'use client'

import React, { forwardRef } from 'react'
import type { ReactElement, Ref } from 'react'

import { Box, Chip, Dialog, DialogContent, DialogTitle, Divider, Grid, Slide, Typography } from '@mui/material'
import type { SlideProps } from '@mui/material'

import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import { getChipSx, getReadableStatusTone } from '@_workspace/utils/statusChipStyles'
import { StatusCheckChip, FftStatusChip } from '../components/fftStatus'
import type { VendorComprehensiveI } from '@_workspace/types/_find-vendor/FindVendorTypes'

const Transition = forwardRef(function Transition(
    props: SlideProps & { children?: ReactElement },
    ref: Ref<unknown>
) {
    return <Slide direction='down' ref={ref} {...props} />
})

type VendorDetailsModalProps = {
    open: boolean
    onClose: () => void
    data?: Partial<VendorComprehensiveI> | null
}



const SectionHeader = ({ icon, title }: { icon: string; title: string }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <i className={icon} style={{ fontSize: 16, color: 'var(--mui-palette-primary-main)' }} />
        <Typography variant='subtitle2' fontWeight={700} color='text.secondary'>{title}</Typography>
        <Divider sx={{ flex: 1 }} />
    </Box>
)

const VendorDetailsModal = ({ open, onClose, data }: VendorDetailsModalProps) => {
    const contacts = (Array.isArray(data?.contacts) ? data.contacts : []).filter(Boolean)
    const products = (Array.isArray(data?.products) ? data.products : []).filter(Boolean)

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
            sx={{
                '& .MuiDialog-paper': {
                    overflow: 'visible',
                    width: { xs: 'calc(100vw - 16px)', sm: 'calc(100vw - 32px)', lg: '1100px' },
                    maxWidth: '1100px',
                },
                '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
            }}
        >
            <DialogTitle sx={{ position: 'relative' }}>
                <Typography variant='h5' component='span'>Vendor Details</Typography>
                <Box sx={{ position: 'absolute', top: 14, right: 56, textAlign: 'right' }}>
                </Box>
                <DialogCloseButton onClick={onClose} disableRipple>
                    <i className='tabler-x' />
                </DialogCloseButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0, bgcolor: 'background.default' }}>
                <Box sx={{ p: 3, overflowY: 'auto', maxHeight: '75vh' }}>
                    <Box sx={{ p: 2.5, mb: 3, borderRadius: 1, bgcolor: 'primary.lighter', border: '1px solid', borderColor: 'primary.light' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5 }}>
                            <Box>
                                <Typography variant='h6' fontWeight={800}>{data?.company_name || '-'}</Typography>
                                <Typography variant='body2' color='text.secondary'>
                                    {data?.vendor_type_name || '-'} {data?.vendor_region ? `• ${data.vendor_region}` : ''}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                {data?.status_check && <StatusCheckChip value={data.status_check} />}
                                <Chip
                                    label={Number(data?.INUSE ?? 1) === 1 ? 'Active' : 'Inactive'}
                                    size='small'
                                    sx={getChipSx(
                                        Number(data?.INUSE ?? 1) === 1
                                            ? getReadableStatusTone('completed')
                                            : getReadableStatusTone('pending'),
                                        { fontWeight: 700 }
                                    )}
                                />
                            </Box>
                        </Box>
                    </Box>

                    {data?.status_check === 'Cannot Register' && data?.reject_reason && (
                        <Box sx={{ p: 2, mb: 3, borderRadius: 1, bgcolor: 'error.lighter', color: 'error.dark' }}>
                            <Typography variant='body2' fontWeight={700}>Reject Reason</Typography>
                            <Typography variant='body2'>{data.reject_reason}</Typography>
                        </Box>
                    )}

                    <Box sx={{ mb: 4 }}>
                        <SectionHeader icon='tabler-building-store' title='Vendor Info' />
                        <Grid container spacing={2}>
                            {[
                                { label: 'Vendor Type', value: data?.vendor_type_name },
                                { label: 'Region', value: data?.vendor_region },
                                { label: 'FFT Vendor Code', value: data?.fft_vendor_code },
                                { label: 'FFT Status', value: <FftStatusChip value={data?.fft_status} variant='tonal' /> },
                                { label: 'Province', value: data?.province },
                                { label: 'Postal Code', value: data?.postal_code },
                                { label: 'Tel Center', value: data?.tel_center },
                                { label: 'Website', value: data?.website },
                                { label: 'Email (Main)', value: data?.emailmain },
                            ].map(({ label, value }) => (
                                <Grid item xs={12} sm={6} md={4} key={label}>
                                    <Typography variant='caption' color='text.disabled' fontWeight={600}>{label}</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        {React.isValidElement(value) ? (
                                            value
                                        ) : (
                                            <Typography variant='body2' fontWeight={600} sx={{ wordBreak: 'break-word' }}>
                                                {value || '-'}
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>
                            ))}
                            {data?.address && (
                                <Grid item xs={12}>
                                    <Typography variant='caption' color='text.disabled' fontWeight={600}>Address</Typography>
                                    <Typography variant='body2' fontWeight={600} sx={{ wordBreak: 'break-word' }}>{data.address}</Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <SectionHeader icon='tabler-users' title={`Contacts (${contacts.length})`} />
                        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 2fr', px: 2, py: 1, bgcolor: 'action.hover' }}>
                                {['Name', 'Tel', 'Position', 'Email'].map(h => <Typography key={h} variant='caption' fontWeight={700} color='text.secondary'>{h}</Typography>)}
                            </Box>
                            {contacts.length === 0 ? (
                                <Typography variant='body2' color='text.secondary' sx={{ px: 2, py: 1.5 }}>No contacts</Typography>
                            ) : contacts.map((c, i) => (
                                <Box key={i} sx={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 2fr', px: 2, py: 1.25, borderTop: '1px solid', borderColor: 'divider' }}>
                                    <Typography variant='body2' fontWeight={600}>{c.contact_name || '-'}</Typography>
                                    <Typography variant='body2' color='text.secondary'>{c.tel_phone || '-'}</Typography>
                                    <Typography variant='body2' color='text.secondary'>{c.position || '-'}</Typography>
                                    <Typography variant='body2' color='text.secondary' sx={{ wordBreak: 'break-all' }}>{c.email || '-'}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    <Box sx={{ mb: 1 }}>
                        <SectionHeader icon='tabler-package' title={`Products / Services (${products.length})`} />
                        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 2fr 2fr', px: 2, py: 1, bgcolor: 'action.hover' }}>
                                {['Group', 'Maker', 'Product Name', 'Model List'].map(h => <Typography key={h} variant='caption' fontWeight={700} color='text.secondary'>{h}</Typography>)}
                            </Box>
                            {products.length === 0 ? (
                                <Typography variant='body2' color='text.secondary' sx={{ px: 2, py: 1.5 }}>No products</Typography>
                            ) : products.map((p, i) => (
                                <Box key={i} sx={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 2fr 2fr', px: 2, py: 1.25, borderTop: '1px solid', borderColor: 'divider' }}>
                                    <Typography variant='body2' fontWeight={600}>{p.group_name || '-'}</Typography>
                                    <Typography variant='body2' color='text.secondary'>{p.maker_name || '-'}</Typography>
                                    <Typography variant='body2' color='text.secondary'>{p.product_name || '-'}</Typography>
                                    <Typography variant='body2' color='text.secondary'>{p.model_list || '-'}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    )
}

export default VendorDetailsModal
