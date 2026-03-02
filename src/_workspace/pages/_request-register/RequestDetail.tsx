// React Imports
import { useState } from 'react'

// MUI Imports
import {
    Box, Typography, Chip, Divider, Button, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material'

// Types
import type { RegistrationRequest } from './types'
import { statusConfig } from './RequestCard'

// ─────────────────────────────────────────────────────────────────────────────
// Info Field (read-only label+value)
// ─────────────────────────────────────────────────────────────────────────────
const InfoField = ({ label, value, fullWidth }: { label: string; value?: string; fullWidth?: boolean }) => (
    <Box sx={{ ...(fullWidth ? { gridColumn: '1 / -1' } : {}) }}>
        <Typography variant='caption' color='text.disabled' sx={{ display: 'block', mb: 0.25, fontWeight: 600, letterSpacing: 0.3 }}>
            {label}
        </Typography>
        <Typography variant='body2' sx={{ color: value ? 'text.primary' : 'text.disabled', fontStyle: value ? 'normal' : 'italic' }}>
            {value || '—'}
        </Typography>
    </Box>
)

// ─────────────────────────────────────────────────────────────────────────────
// Section header
// ─────────────────────────────────────────────────────────────────────────────
const SectionHeader = ({ icon, title }: { icon: string; title: string }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Box sx={{
            width: 28, height: 28, borderRadius: 1.5,
            bgcolor: 'primary.lightOpacity', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <i className={icon} style={{ fontSize: 14, color: 'var(--mui-palette-primary-main)' }} />
        </Box>
        <Typography variant='overline' fontWeight={700} letterSpacing={1} color='text.secondary'>
            {title}
        </Typography>
    </Box>
)

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
interface Props {
    request: RegistrationRequest
}

const RequestDetail = ({ request }: Props) => {
    const cfg = statusConfig[request.status]
    const isActionable = request.status === 'new' || request.status === 'in_progress'

    const [approveDialog, setApproveDialog] = useState(false)
    const [rejectDialog, setRejectDialog] = useState(false)
    const [rejectRemark, setRejectRemark] = useState('')

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

            {/* ── Top bar: meta info + action buttons ── */}
            <Box sx={{
                px: 3, py: 2,
                background: cfg.bgGradient,
                borderBottom: '1px solid', borderColor: 'divider',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap'
            }}>
                {/* Left: who/when submitted */}
                <Box>
                    <Typography variant='h6' fontWeight={800} sx={{ mb: 0.25 }}>
                        {request.company_name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Chip
                            icon={<i className={cfg.icon} style={{ fontSize: 12 }} />}
                            label={cfg.label}
                            color={cfg.color}
                            size='small'
                            variant='tonal'
                            sx={{ fontWeight: 700, fontSize: '0.7rem', height: 22 }}
                        />
                        <Typography variant='caption' color='text.disabled'>·</Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                            <i className='tabler-user-circle' style={{ fontSize: 12, color: 'var(--mui-palette-text-disabled)' }} />
                            <Typography variant='caption' color='text.disabled'>{request.submitted_by}</Typography>
                        </Box>
                        <Typography variant='caption' color='text.disabled'>·</Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                            <i className='tabler-calendar-event' style={{ fontSize: 12, color: 'var(--mui-palette-text-disabled)' }} />
                            <Typography variant='caption' color='text.disabled'>{request.submitted_date}</Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Right: action buttons */}
                {isActionable && (
                    <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                        <Button
                            variant='tonal'
                            color='error'
                            size='small'
                            startIcon={<i className='tabler-circle-x' />}
                            onClick={() => setRejectDialog(true)}
                            sx={{ fontWeight: 700 }}
                        >
                            Reject
                        </Button>
                        <Button
                            variant='contained'
                            color='primary'
                            size='small'
                            startIcon={<i className='tabler-circle-check' />}
                            onClick={() => setApproveDialog(true)}
                            sx={{ fontWeight: 700 }}
                        >
                            Approve
                        </Button>
                    </Box>
                )}

                {/* Terminal status */}
                {!isActionable && (
                    <Chip
                        icon={<i className={request.status === 'approved' ? 'tabler-check' : 'tabler-x'} style={{ fontSize: 12 }} />}
                        label={request.status === 'approved' ? 'Already Approved' : 'Rejected'}
                        color={request.status === 'approved' ? 'success' : 'error'}
                        variant='outlined'
                        sx={{ fontWeight: 700 }}
                    />
                )}
            </Box>

            {/* ── Scrollable content: Vendor data ── */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>

                {/* Request Context */}
                {(request.support_type || request.purchase_frequency) && (
                    <Box sx={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2,
                        px: 1.5, py: 1.5, borderRadius: 1,
                        bgcolor: 'action.hover', border: '1px dashed', borderColor: 'divider'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <Box sx={{
                                mt: 0.25, width: 24, height: 24, borderRadius: 1, flexShrink: 0,
                                bgcolor: 'primary.lightOpacity', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <i className='tabler-tool' style={{ fontSize: 13, color: 'var(--mui-palette-primary-main)' }} />
                            </Box>
                            <Box>
                                <Typography variant='caption' color='text.disabled' fontWeight={600} sx={{ display: 'block', lineHeight: 1.2 }}>
                                    For support product / process
                                </Typography>
                                <Typography variant='body2' fontWeight={600}>
                                    {request.support_type || '—'}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <Box sx={{
                                mt: 0.25, width: 24, height: 24, borderRadius: 1, flexShrink: 0,
                                bgcolor: 'primary.lightOpacity', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <i className='tabler-calendar-repeat' style={{ fontSize: 13, color: 'var(--mui-palette-primary-main)' }} />
                            </Box>
                            <Box>
                                <Typography variant='caption' color='text.disabled' fontWeight={600} sx={{ display: 'block', lineHeight: 1.2 }}>
                                    Purchase Frequency / Year
                                </Typography>
                                <Typography variant='body2' fontWeight={600}>
                                    {request.purchase_frequency || '—'}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                )}

                {/* Company Profile */}
                <Box>
                    <SectionHeader icon='tabler-building-store' title='Company Profile' />
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 2.5,
                        p: 2.5, borderRadius: 1.5,
                        bgcolor: 'action.hover',
                        border: '1px solid', borderColor: 'divider'
                    }}>
                        <InfoField label='Company Name' value={request.company_name} />
                        <InfoField label='Vendor Type' value={request.vendor_type} />
                        <InfoField label='Tel. Center' value={request.tel_center} />
                        <InfoField label='Province' value={request.province} />
                        <InfoField label='Postal Code' value={request.postal_code} />
                        <InfoField label='Website' value={request.website} />
                        <InfoField label='Address' value={request.address} fullWidth />
                        {request.note && <InfoField label='Note' value={request.note} fullWidth />}
                    </Box>
                </Box>

                <Divider />

                {/* Contacts */}
                <Box>
                    <SectionHeader icon='tabler-users' title={`Contacts (${request.contacts.length})`} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {request.contacts.map((c, i) => (
                            <Box key={i} sx={{
                                p: 2, borderRadius: 1.5,
                                border: '1px solid', borderColor: 'divider',
                                bgcolor: 'background.paper'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                    <Box sx={{
                                        width: 30, height: 30, borderRadius: '50%',
                                        bgcolor: 'primary.lightOpacity', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Typography variant='caption' fontWeight={700} color='primary'>{i + 1}</Typography>
                                    </Box>
                                    <Typography variant='subtitle2' fontWeight={700}>{c.contact_name}</Typography>
                                    {c.position && (
                                        <Chip label={c.position} size='small' variant='tonal' color='default'
                                            sx={{ fontSize: '0.65rem', height: 18, fontWeight: 600 }} />
                                    )}
                                </Box>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                                    <InfoField label='Tel.' value={c.tel_phone} />
                                    <InfoField label='Email' value={c.email} />
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>

                <Divider />

                {/* Products */}
                <Box>
                    <SectionHeader icon='tabler-package' title={`Products / Services (${request.products.length})`} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {request.products.map((p, i) => (
                            <Box key={i} sx={{
                                px: 2, py: 1.5, borderRadius: 1.5,
                                border: '1px solid', borderColor: 'divider',
                                bgcolor: 'background.paper',
                                display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap'
                            }}>
                                <Box sx={{
                                    width: 26, height: 26, borderRadius: 1.5, flexShrink: 0,
                                    bgcolor: 'primary.lightOpacity', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <i className='tabler-box' style={{ fontSize: 13, color: 'var(--mui-palette-primary-main)' }} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant='body2' fontWeight={600}>{p.product_sub}</Typography>
                                    <Typography variant='caption' color='text.secondary'>
                                        {p.product_group} › {p.product_main}
                                    </Typography>
                                </Box>
                                {p.note && (
                                    <Typography variant='caption' color='text.disabled' sx={{ fontStyle: 'italic' }}>
                                        {p.note}
                                    </Typography>
                                )}
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>

            {/* ── Approve Dialog ── */}
            <Dialog open={approveDialog} onClose={() => setApproveDialog(false)} maxWidth='xs' fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>Confirm Approval</DialogTitle>
                <DialogContent>
                    <Typography variant='body2' color='text.secondary'>
                        Approve the registration request for <strong>{request.company_name}</strong>?
                        The request will proceed to the next step.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setApproveDialog(false)} variant='tonal' color='secondary'>Cancel</Button>
                    <Button variant='contained' color='success' onClick={() => setApproveDialog(false)}
                        startIcon={<i className='tabler-check' />}>
                        Confirm Approve
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Reject Dialog ── */}
            <Dialog open={rejectDialog} onClose={() => setRejectDialog(false)} maxWidth='xs' fullWidth>
                <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>Reject Request</DialogTitle>
                <DialogContent>
                    <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                        Reject the request for <strong>{request.company_name}</strong>. Please provide a reason.
                    </Typography>
                    <TextField
                        fullWidth multiline rows={3}
                        label='Reason for rejection *'
                        placeholder='e.g. Incomplete information, vendor does not meet requirements...'
                        value={rejectRemark}
                        onChange={e => setRejectRemark(e.target.value)}
                        size='small'
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setRejectDialog(false)} variant='tonal' color='secondary'>Cancel</Button>
                    <Button variant='contained' color='error'
                        disabled={rejectRemark.trim() === ''}
                        onClick={() => setRejectDialog(false)}
                        startIcon={<i className='tabler-x' />}>
                        Confirm Reject
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default RequestDetail
