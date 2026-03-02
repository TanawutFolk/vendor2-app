// MUI Imports
import { Box, Typography, Chip } from '@mui/material'

// Types
import type { RegistrationRequest, RequestStatus } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────
export const PRIMARY_ACCENT = 'var(--mui-palette-primary-main)'
export const PRIMARY_BG = 'linear-gradient(135deg, rgba(var(--mui-palette-primary-mainChannel) / 0.1) 0%, transparent 60%)'

export const statusConfig: Record<RequestStatus, {
    label: string
    color: 'success' | 'warning' | 'default' | 'error' | 'info'
    accent: string
    bgGradient: string
    icon: string
}> = {
    new: {
        label: 'New Request',
        color: 'info',
        accent: PRIMARY_ACCENT,
        bgGradient: PRIMARY_BG,
        icon: 'tabler-bell-ringing'
    },
    in_progress: {
        label: 'In Progress',
        color: 'warning',
        accent: PRIMARY_ACCENT,
        bgGradient: PRIMARY_BG,
        icon: 'tabler-loader-2'
    },
    pending_docs: {
        label: 'Pending Documents',
        color: 'default',
        accent: PRIMARY_ACCENT,
        bgGradient: PRIMARY_BG,
        icon: 'tabler-file-time'
    },
    approved: {
        label: 'Approved',
        color: 'success',
        accent: PRIMARY_ACCENT,
        bgGradient: PRIMARY_BG,
        icon: 'tabler-circle-check'
    },
    rejected: {
        label: 'Rejected',
        color: 'error',
        accent: PRIMARY_ACCENT,
        bgGradient: PRIMARY_BG,
        icon: 'tabler-circle-x'
    }
}




interface Props {
    request: RegistrationRequest
    isSelected: boolean
    onClick: () => void
}

const RequestCard = ({ request, isSelected, onClick }: Props) => {
    const cfg = statusConfig[request.status]

    return (
        <Box
            onClick={onClick}
            sx={{
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                borderRadius: 3,
                border: '1.5px solid',
                borderColor: isSelected ? 'primary.main' : 'divider',
                background: isSelected
                    ? cfg.bgGradient
                    : 'var(--mui-palette-background-paper)',
                p: 2,
                transition: 'all 0.22s ease',
                boxShadow: isSelected
                    ? '0 4px 20px rgba(var(--mui-palette-primary-mainChannel) / 0.25)'
                    : '0 1px 4px rgba(0,0,0,0.06)',
                '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 4px 20px rgba(var(--mui-palette-primary-mainChannel) / 0.25)',
                    transform: 'translateY(-1px)'
                }
            }}
        >
            {/* Left accent bar */}
            <Box sx={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                bgcolor: 'primary.main', borderRadius: '3px 0 0 3px',
                opacity: isSelected ? 1 : 0.4, transition: 'opacity 0.2s'
            }} />


            <Box sx={{ pl: 1 }}>
                {/* Name + Status chip */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.75 }}>
                    <Typography variant='body2' fontWeight={700} noWrap sx={{ maxWidth: '60%' }}>
                        {request.company_name}
                    </Typography>
                    <Chip
                        icon={<i className={cfg.icon} style={{ fontSize: 11 }} />}
                        label={cfg.label}
                        color={cfg.color}
                        size='small'
                        variant='tonal'
                        sx={{ fontSize: '0.68rem', fontWeight: 600, height: 20 }}
                    />
                </Box>

                {/* Type + Province */}
                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
                    {request.vendor_type} · {request.province}
                </Typography>

                {/* Contacts + Products counts */}
                <Box sx={{ display: 'flex', gap: 1.5, mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <i className='tabler-users' style={{ fontSize: 11, color: 'var(--mui-palette-text-disabled)' }} />
                        <Typography variant='caption' color='text.disabled'>{request.contacts.length} contact{request.contacts.length !== 1 ? 's' : ''}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <i className='tabler-package' style={{ fontSize: 11, color: 'var(--mui-palette-text-disabled)' }} />
                        <Typography variant='caption' color='text.disabled'>{request.products.length} product{request.products.length !== 1 ? 's' : ''}</Typography>
                    </Box>
                </Box>

                {/* Footer */}
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                    <i className='tabler-user-circle' style={{ fontSize: 12, color: 'var(--mui-palette-text-disabled)' }} />
                    <Typography variant='caption' color='text.disabled'>{request.submitted_by}</Typography>
                    <Typography variant='caption' color='text.disabled' sx={{ mx: 0.25 }}>·</Typography>
                    <i className='tabler-calendar-event' style={{ fontSize: 12, color: 'var(--mui-palette-text-disabled)' }} />
                    <Typography variant='caption' color='text.disabled'>{request.submitted_date}</Typography>
                </Box>
            </Box>
        </Box>
    )
}

export default RequestCard
