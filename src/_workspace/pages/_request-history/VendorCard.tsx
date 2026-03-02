// MUI Imports
import { Box, Typography, Chip, LinearProgress } from '@mui/material'

// Types
import type { VendorRegisterHistory, RegisterStatus } from './types'

const statusConfig: Record<RegisterStatus, {
    label: string
    color: 'success' | 'warning' | 'default' | 'error'
    accent: string
    bgGradient: string
}> = {
    completed: {
        label: 'Completed',
        color: 'success',
        accent: '#28C76F',
        bgGradient: 'linear-gradient(135deg, rgba(40,199,111,0.12) 0%, transparent 60%)'
    },
    in_progress: {
        label: 'In Progress',
        color: 'warning',
        accent: '#FF9F43',
        bgGradient: 'linear-gradient(135deg, rgba(255,159,67,0.12) 0%, transparent 60%)'
    },
    pending: {
        label: 'Pending',
        color: 'default',
        accent: '#8A8D99',
        bgGradient: 'transparent'
    },
    rejected: {
        label: 'Rejected',
        color: 'error',
        accent: '#EA5455',
        bgGradient: 'linear-gradient(135deg, rgba(234,84,85,0.12) 0%, transparent 60%)'
    },
    skipped: {
        label: 'Skipped',
        color: 'default',
        accent: '#8A8D99',
        bgGradient: 'transparent'
    }
}

interface Props {
    vendor: VendorRegisterHistory
    isSelected: boolean
    onClick: () => void
}

const VendorCard = ({ vendor, isSelected, onClick }: Props) => {
    const cfg = statusConfig[vendor.overall_status]
    const completedSteps = vendor.steps.filter(s => s.status === 'completed').length
    const totalSteps = vendor.steps.length
    const progressPct = Math.round((completedSteps / totalSteps) * 100)

    return (
        <Box
            onClick={onClick}
            sx={{
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                borderRadius: 3,
                border: '1.5px solid',
                borderColor: isSelected ? cfg.accent : 'divider',
                background: isSelected
                    ? cfg.bgGradient
                    : 'var(--mui-palette-background-paper)',
                p: 2,
                transition: 'all 0.22s ease',
                boxShadow: isSelected
                    ? `0 4px 20px ${cfg.accent}30`
                    : '0 1px 4px rgba(0,0,0,0.06)',
                '&:hover': {
                    borderColor: cfg.accent,
                    boxShadow: `0 4px 20px ${cfg.accent}30`,
                    transform: 'translateY(-1px)'
                }
            }}
        >
            {/* Left accent bar */}
            <Box
                sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 3,
                    bgcolor: cfg.accent,
                    borderRadius: '3px 0 0 3px',
                    opacity: isSelected ? 1 : 0.4,
                    transition: 'opacity 0.2s'
                }}
            />

            <Box sx={{ pl: 1 }}>
                {/* Name + chip */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.75 }}>
                    <Typography
                        variant='body2'
                        fontWeight={700}
                        noWrap
                        sx={{ maxWidth: '65%', color: isSelected ? 'text.primary' : 'text.primary' }}
                    >
                        {vendor.vendor_name}
                    </Typography>
                    <Chip
                        label={cfg.label}
                        color={cfg.color}
                        size='small'
                        variant='tonal'
                        sx={{ fontSize: '0.68rem', fontWeight: 600, height: 20 }}
                    />
                </Box>

                {/* Tax ID */}
                <Typography variant='caption' color='text.disabled' sx={{ display: 'block', mb: 1.25 }}>
                    {vendor.tax_id}
                </Typography>

                {/* Progress */}
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant='caption' color='text.secondary'>
                            {completedSteps}/{totalSteps} steps
                        </Typography>
                        <Typography variant='caption' fontWeight={700} sx={{ color: cfg.accent }}>
                            {progressPct}%
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant='determinate'
                        value={progressPct}
                        color={cfg.color === 'default' ? 'inherit' : cfg.color}
                        sx={{
                            height: 5,
                            borderRadius: 3,
                            bgcolor: 'action.hover',
                            '& .MuiLinearProgress-bar': { borderRadius: 3 }
                        }}
                    />
                </Box>

                {/* Footer: who + date */}
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', mt: 1.25 }}>
                    <i className='tabler-user-circle' style={{ fontSize: 12, color: 'var(--mui-palette-text-disabled)' }} />
                    <Typography variant='caption' color='text.disabled'>{vendor.submitted_by}</Typography>
                    <Typography variant='caption' color='text.disabled' sx={{ mx: 0.25 }}>·</Typography>
                    <i className='tabler-calendar-event' style={{ fontSize: 12, color: 'var(--mui-palette-text-disabled)' }} />
                    <Typography variant='caption' color='text.disabled'>{vendor.submitted_date}</Typography>
                </Box>
            </Box>
        </Box>
    )
}

export default VendorCard
