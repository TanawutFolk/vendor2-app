// MUI Imports
import { Box, Typography, Chip, Tooltip, Avatar } from '@mui/material'

// Types
import type { RegisterStep, RegisterStatus } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────
const statusConfig: Record<
    RegisterStatus,
    {
        label: string
        color: 'success' | 'warning' | 'default' | 'error' | 'info'
        gradient: string
        iconBg: string
        connectorColor: string
        icon: string
        chipIcon: string
    }
> = {
    completed: {
        label: 'Completed',
        color: 'success',
        gradient: 'linear-gradient(135deg, rgba(40,199,111,0.08) 0%, rgba(40,199,111,0.02) 100%)',
        iconBg: 'linear-gradient(135deg, #28C76F, #20a85c)',
        connectorColor: '#28C76F',
        icon: 'tabler-check',
        chipIcon: 'tabler-circle-check-filled'
    },
    in_progress: {
        label: 'In Progress',
        color: 'warning',
        gradient: 'linear-gradient(135deg, rgba(255,159,67,0.1) 0%, rgba(255,159,67,0.02) 100%)',
        iconBg: 'linear-gradient(135deg, #FF9F43, #e8893a)',
        connectorColor: '#FF9F43',
        icon: 'tabler-loader-2',
        chipIcon: 'tabler-clock-filled'
    },
    pending: {
        label: 'Pending',
        color: 'default',
        gradient: 'transparent',
        iconBg: 'linear-gradient(135deg, #8A8D99, #6e7178)',
        connectorColor: 'rgba(138,141,153,0.3)',
        icon: 'tabler-point',
        chipIcon: 'tabler-clock'
    },
    rejected: {
        label: 'Rejected',
        color: 'error',
        gradient: 'linear-gradient(135deg, rgba(234,84,85,0.08) 0%, rgba(234,84,85,0.02) 100%)',
        iconBg: 'linear-gradient(135deg, #EA5455, #c94344)',
        connectorColor: '#EA5455',
        icon: 'tabler-x',
        chipIcon: 'tabler-circle-x-filled'
    },
    skipped: {
        label: 'Skipped',
        color: 'info',
        gradient: 'transparent',
        iconBg: 'linear-gradient(135deg, #00CFE8, #00b4cc)',
        connectorColor: 'rgba(0,207,232,0.25)',
        icon: 'tabler-minus',
        chipIcon: 'tabler-circle-minus'
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Step Icon
// ─────────────────────────────────────────────────────────────────────────────
const StepIcon = ({ status, step }: { status: RegisterStatus; step: number }) => {
    const cfg = statusConfig[status]
    return (
        <Avatar
            sx={{
                width: 38,
                height: 38,
                background: cfg.iconBg,
                boxShadow: status !== 'pending' && status !== 'skipped'
                    ? `0 4px 14px ${cfg.iconBg.includes('28C76F') ? 'rgba(40,199,111,0.4)' : cfg.iconBg.includes('FF9F43') ? 'rgba(255,159,67,0.4)' : cfg.iconBg.includes('EA5455') ? 'rgba(234,84,85,0.4)' : 'none'}`
                    : 'none',
                flexShrink: 0,
                zIndex: 1,
                fontSize: '0.8rem',
                fontWeight: 700,
                transition: 'box-shadow 0.3s'
            }}
        >
            {status === 'pending' ? (
                <Typography variant='caption' fontWeight={700} color='white'>{step}</Typography>
            ) : (
                <i className={cfg.icon} style={{ fontSize: 16, color: 'white' }} />
            )}
        </Avatar>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Branch Node (sub-step for rejection path)
// ─────────────────────────────────────────────────────────────────────────────
const BranchStep = ({ step, isLast }: { step: RegisterStep; isLast: boolean }) => {
    const cfg = statusConfig[step.status]
    const isPending = step.status === 'pending'
    const isSkipped = step.status === 'skipped'

    return (
        <Box sx={{ display: 'flex', gap: 2, position: 'relative' }}>
            {/* icon + connector */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 0.5 }}>
                <StepIcon status={step.status} step={step.step} />
                {!isLast && (
                    <Box
                        sx={{
                            width: '2px',
                            flex: 1,
                            minHeight: 20,
                            my: 0.5,
                            borderRadius: 1,
                            background: `linear-gradient(to bottom, ${cfg.connectorColor}, rgba(234,84,85,0.15))`
                        }}
                    />
                )}
            </Box>

            {/* content */}
            <Box
                sx={{
                    flex: 1,
                    mb: isLast ? 0 : 1.5,
                    px: 2,
                    py: 1.5,
                    borderRadius: 2.5,
                    background: isPending || isSkipped ? 'var(--mui-palette-action-hover)' : cfg.gradient,
                    border: '1px solid',
                    borderColor: isPending || isSkipped ? 'divider' : step.status === 'rejected' ? 'rgba(234,84,85,0.2)' : 'rgba(234,84,85,0.15)',
                    opacity: isPending || isSkipped ? 0.6 : 1,
                    transition: 'all 0.25s ease'
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                    <Typography variant='caption' fontWeight={700} color={isPending || isSkipped ? 'text.disabled' : 'text.primary'}>
                        {step.title}
                    </Typography>
                    <Chip
                        icon={<i className={cfg.chipIcon} style={{ fontSize: 11 }} />}
                        label={cfg.label}
                        color={cfg.color}
                        size='small'
                        variant='tonal'
                        sx={{ fontWeight: 600, fontSize: '0.68rem', height: 20 }}
                    />
                </Box>
                {step.description && (
                    <Typography variant='caption' color='text.secondary' sx={{ display: 'block', lineHeight: 1.5 }}>
                        {step.description}
                    </Typography>
                )}
                {step.remark && (
                    <Box sx={{ mt: 1, px: 1, py: 0.5, borderRadius: 1.5, bgcolor: 'background.paper', border: '1px dashed', borderColor: 'divider', display: 'flex', gap: 0.75, alignItems: 'flex-start' }}>
                        <i className='tabler-quote' style={{ fontSize: 12, marginTop: 1, color: 'var(--mui-palette-error-main)', opacity: 0.7 }} />
                        <Typography variant='caption' color='text.secondary' sx={{ fontStyle: 'italic', lineHeight: 1.5 }}>{step.remark}</Typography>
                    </Box>
                )}
            </Box>
        </Box>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
interface Props {
    steps: RegisterStep[]
}

const StatusTimeline = ({ steps }: Props) => {
    return (
        <Box sx={{ position: 'relative' }}>
            {steps.map((step, index) => {
                const cfg = statusConfig[step.status]
                const isLast = index === steps.length - 1
                const isPending = step.status === 'pending'
                const hasBranch = step.branchChildren && step.branchChildren.length > 0

                return (
                    <Box key={`${step.step}-${index}`} sx={{ display: 'flex', gap: 2.5, position: 'relative' }}>
                        {/* Left: icon + connector */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 0.5 }}>
                            <StepIcon status={step.status} step={step.step} />
                            {!isLast && (
                                <Box
                                    sx={{
                                        width: '2px',
                                        flex: 1,
                                        minHeight: 28,
                                        my: 1,
                                        borderRadius: 1,
                                        background: step.status === 'completed'
                                            ? `linear-gradient(to bottom, ${cfg.connectorColor}, ${statusConfig[steps[index + 1].status].connectorColor})`
                                            : `linear-gradient(to bottom, ${cfg.connectorColor}, rgba(138,141,153,0.15))`
                                    }}
                                />
                            )}
                        </Box>

                        {/* Right: content + optional branch */}
                        <Box sx={{ flex: 1, mb: isLast ? 0 : 2 }}>
                            {/* Main card */}
                            <Box
                                sx={{
                                    p: 2.5,
                                    borderRadius: 3,
                                    background: isPending
                                        ? 'var(--mui-palette-action-hover)'
                                        : cfg.gradient,
                                    border: '1px solid',
                                    borderColor: isPending
                                        ? 'divider'
                                        : step.status === 'completed' ? 'rgba(40,199,111,0.2)'
                                            : step.status === 'in_progress' ? 'rgba(255,159,67,0.25)'
                                                : step.status === 'rejected' ? 'rgba(234,84,85,0.2)'
                                                    : 'divider',
                                    opacity: isPending ? 0.65 : 1,
                                    transition: 'all 0.25s ease'
                                }}
                            >
                                {/* Title Row */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 0.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant='subtitle2' fontWeight={700} color={isPending ? 'text.disabled' : 'text.primary'}>
                                            {step.title}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        icon={<i className={cfg.chipIcon} style={{ fontSize: 13 }} />}
                                        label={cfg.label}
                                        color={cfg.color}
                                        size='small'
                                        variant='tonal'
                                        sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                                    />
                                </Box>

                                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1, lineHeight: 1.6 }}>
                                    {step.description}
                                </Typography>

                                {/* Meta */}
                                {(step.updatedBy || step.updatedDate) && (
                                    <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>
                                        {step.updatedBy && (
                                            <Tooltip title='Updated by' placement='top'>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                    <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: 'primary.lightOpacity', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <i className='tabler-user' style={{ fontSize: 10, color: 'var(--mui-palette-primary-main)' }} />
                                                    </Box>
                                                    <Typography variant='caption' fontWeight={500} color='text.secondary'>{step.updatedBy}</Typography>
                                                </Box>
                                            </Tooltip>
                                        )}
                                        {step.updatedDate && (
                                            <Tooltip title='Updated date' placement='top'>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                    <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: 'primary.lightOpacity', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <i className='tabler-calendar' style={{ fontSize: 10, color: 'var(--mui-palette-primary-main)' }} />
                                                    </Box>
                                                    <Typography variant='caption' fontWeight={500} color='text.secondary'>{step.updatedDate}</Typography>
                                                </Box>
                                            </Tooltip>
                                        )}
                                    </Box>
                                )}

                                {/* Remark */}
                                {step.remark && (
                                    <Box
                                        sx={{
                                            mt: 1.5,
                                            px: 1.5,
                                            py: 1,
                                            borderRadius: 2,
                                            bgcolor: 'background.paper',
                                            border: '1px dashed',
                                            borderColor: 'divider',
                                            display: 'flex',
                                            gap: 1,
                                            alignItems: 'flex-start'
                                        }}
                                    >
                                        <i className='tabler-quote' style={{ fontSize: 14, marginTop: 1, color: 'var(--mui-palette-primary-main)', opacity: 0.7 }} />
                                        <Typography variant='caption' color='text.secondary' sx={{ fontStyle: 'italic', lineHeight: 1.6 }}>
                                            {step.remark}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>

                            {/* Branch Path (rejection scenario) */}
                            {hasBranch && (
                                <Box
                                    sx={{
                                        mt: 1.5,
                                        ml: 3,
                                        pl: 2,
                                        borderLeft: '2px dashed',
                                        borderColor: 'rgba(234,84,85,0.4)',
                                        position: 'relative'
                                    }}
                                >
                                    {/* Branch label */}
                                    <Box
                                        sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 0.75,
                                            mb: 1.5,
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 10,
                                            bgcolor: 'rgba(234,84,85,0.08)',
                                            border: '1px solid rgba(234,84,85,0.2)'
                                        }}
                                    >
                                        <i className='tabler-git-branch' style={{ fontSize: 13, color: 'var(--mui-palette-error-main)' }} />
                                        <Typography variant='caption' fontWeight={700} color='error.main'>
                                            {step.branchLabel || 'กรณีไม่ตกลง'}
                                        </Typography>
                                    </Box>

                                    {/* Branch sub-steps */}
                                    {step.branchChildren!.map((child, childIdx) => (
                                        <BranchStep
                                            key={`branch-${child.step}-${childIdx}`}
                                            step={child}
                                            isLast={childIdx === step.branchChildren!.length - 1}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Box>
                )
            })}
        </Box>
    )
}

export default StatusTimeline
