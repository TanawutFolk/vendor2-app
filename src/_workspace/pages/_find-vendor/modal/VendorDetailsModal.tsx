'use client'

import { forwardRef } from 'react'
import type { ReactElement, Ref } from 'react'

import { Box, Chip, Dialog, DialogContent, DialogTitle, Divider, Slide, Typography } from '@mui/material'
import type { SlideProps } from '@mui/material'

import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import { StatusCheckChip } from '../components/fftStatus'
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

const infoRow = (label: string, value: unknown) => (
    <Box sx={{ display: 'flex', borderBottom: '1px solid', borderColor: 'divider', py: 1.5, gap: 2 }}>
        <Typography variant='caption' color='text.disabled' fontWeight={700} sx={{ width: 160, flexShrink: 0 }}>
            {label}
        </Typography>
        <Typography variant='body2' fontWeight={500} sx={{ wordBreak: 'break-word' }}>
            {value || '-'}
        </Typography>
    </Box>
)

const SectionHeader = ({ icon, title }: { icon: string; title: string }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <i className={icon} style={{ fontSize: 16, color: 'var(--mui-palette-primary-main)' }} />
        <Typography variant='subtitle2' fontWeight={700} color='text.secondary'>{title}</Typography>
        <Divider sx={{ flex: 1 }} />
    </Box>
)

const VendorDetailsModal = ({ open, onClose, data }: VendorDetailsModalProps) => {
    const contacts = Array.isArray(data?.contacts) ? data.contacts : []
    const products = Array.isArray(data?.products) ? data.products : []

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
                                    color={Number(data?.INUSE ?? 1) === 1 ? 'success' : 'default'}
                                    size='small'
                                    sx={{ fontWeight: 700 }}
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

                    <Box sx={{ mb: 3 }}>
                        <SectionHeader icon='tabler-building-store' title='Vendor Info' />
                        {infoRow('Vendor Type', data?.vendor_type_name)}
                        {infoRow('Region', data?.vendor_region)}
                        {infoRow('FFT Vendor Code', data?.fft_vendor_code)}
                        {infoRow('Province', data?.province)}
                        {infoRow('Postal Code', data?.postal_code)}
                        {infoRow('Tel Center', data?.tel_center)}
                        {infoRow('Website', data?.website)}
                        {infoRow('Email (Main)', data?.emailmain)}
                        {infoRow('Address', data?.address)}
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <SectionHeader icon='tabler-users' title={`Contacts (${contacts.length})`} />
                        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 2fr', px: 2, py: 1, bgcolor: 'action.hover' }}>
                                {['Name', 'Tel', 'Position', 'Email'].map(h => <Typography key={h} variant='caption' fontWeight={700}>{h}</Typography>)}
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
                                {['Group', 'Maker', 'Product Name', 'Model List'].map(h => <Typography key={h} variant='caption' fontWeight={700}>{h}</Typography>)}
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
