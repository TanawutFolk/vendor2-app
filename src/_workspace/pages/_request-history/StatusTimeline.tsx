import { Box, Typography, Chip, Avatar } from '@mui/material'

// Types
import type { RegisterStep, RegisterStatus, ApprovalStepRecord, ApprovalLogRecord } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────
const statusConfig: Record<
    RegisterStatus,
    {
        label: string
        color: 'success' | 'warning' | 'default' | 'error' | 'info'
        bgColor: string
        iconBg: string
        connectorColor: string
        icon: string
        chipIcon: string
    }
> = {
    completed: {
        label: 'Completed',
        color: 'success',
        bgColor: 'rgba(40,199,111,0.05)',
        iconBg: '#28C76F',
        connectorColor: '#28C76F',
        icon: 'tabler-check',
        chipIcon: 'tabler-circle-check-filled'
    },
    in_progress: {
        label: 'In Progress',
        color: 'warning',
        bgColor: 'rgba(255,159,67,0.05)',
        iconBg: '#FF9F43',
        connectorColor: '#FF9F43',
        icon: 'tabler-loader-2',
        chipIcon: 'tabler-clock-filled'
    },
    pending: {
        label: 'Waiting',
        color: 'warning',
        bgColor: 'transparent',
        iconBg: '#8A8D99',
        connectorColor: 'rgba(138,141,153,0.3)',
        icon: 'tabler-point',
        chipIcon: 'tabler-clock'
    },
    rejected: {
        label: 'Rejected',
        color: 'error',
        bgColor: 'rgba(234,84,85,0.05)',
        iconBg: '#EA5455',
        connectorColor: '#EA5455',
        icon: 'tabler-x',
        chipIcon: 'tabler-circle-x-filled'
    },
    skipped: {
        label: 'Skipped',
        color: 'info',
        bgColor: 'transparent',
        iconBg: '#00CFE8',
        connectorColor: 'rgba(0,207,232,0.25)',
        icon: 'tabler-minus',
        chipIcon: 'tabler-circle-minus'
    }
}

const normalizeText = (value?: string | null) => (value || '').trim().toLowerCase().replace(/\s+/g, ' ')

const toRegisterStatus = (stepStatus?: string | null): RegisterStatus => {
    const normalized = normalizeText(stepStatus)

    if (normalized.includes('approved') || normalized.includes('completed') || normalized.includes('agreement reached')) {
        return 'completed'
    }

    if (normalized.includes('in_progress') || normalized.includes('in progress') || normalized.includes('current')) {
        return 'in_progress'
    }

    if (normalized.includes('rejected') || normalized.includes('disagree')) {
        return 'rejected'
    }

    if (normalized.includes('skipped')) {
        return 'skipped'
    }

    return 'pending'
}

const isPendingAgreementStep = (title?: string | null) => normalizeText(title).includes('pending agreement')

const isDisagreedBranchStep = (title?: string | null) => {
    const normalized = normalizeText(title)
    return normalized.includes('vendor disagreed') || normalized.includes('issue gpr b') || normalized.includes('issue gpr c')
}

const getStatusCfg = (status?: RegisterStatus) => statusConfig[status || 'pending'] || statusConfig.pending

// ─────────────────────────────────────────────────────────────────────────────
// Step Icon
// ─────────────────────────────────────────────────────────────────────────────
const StepIcon = ({ status, step }: { status: RegisterStatus; step: number }) => {
    const cfg = getStatusCfg(status)
    return (
        <Avatar
            sx={{
                width: 38,
                height: 38,
                bgcolor: cfg.iconBg,
                boxShadow: status !== 'pending' && status !== 'skipped'
                    ? `0 4px 14px ${cfg.iconBg === '#28C76F' ? 'rgba(40,199,111,0.4)' : cfg.iconBg === '#FF9F43' ? 'rgba(255,159,67,0.4)' : cfg.iconBg === '#EA5455' ? 'rgba(234,84,85,0.4)' : 'none'}`
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
    const cfg = getStatusCfg(step.status)
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
                    borderRadius: 1,
                    bgcolor: 'transparent',
                    border: '1px solid',
                    borderColor: isPending || isSkipped ? 'divider' : step.status === 'rejected' ? 'rgba(234,84,85,0.2)' : 'rgba(234,84,85,0.15)',
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

            </Box>
        </Box>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
interface Props {
    steps: RegisterStep[]
    approvalSteps?: ApprovalStepRecord[]
    approvalLogs?: ApprovalLogRecord[]
}

const StatusTimeline = ({ steps, approvalSteps, approvalLogs }: Props) => {
    // If real approval steps exist, map them to RegisterStep format
    const effectiveSteps: RegisterStep[] = (approvalSteps && approvalSteps.length > 0)
        ? (() => {
            const mappedSteps = approvalSteps
            .filter(Boolean)
            .sort((a, b) => a.step_order - b.step_order)
            .map(s => {
                const log = approvalLogs?.find(l => l.step_id === s.step_id)
                return {
                    step: s.step_order,
                    title: s.DESCRIPTION || `Step ${s.step_order}`,
                    description: s.approver_id ? `Approver: ${s.approver_id}` : '',
                    status: toRegisterStatus(s.step_status),
                    updatedBy: log?.action_by || s.UPDATE_BY || undefined,
                    updatedDate: log?.action_date ? new Date(log.action_date).toLocaleString('th-TH') : s.UPDATE_DATE ? new Date(s.UPDATE_DATE).toLocaleString('th-TH') : undefined,
                    remark: log?.remark || undefined
                } as RegisterStep
            })
            const branchChildren = mappedSteps.filter(s => isDisagreedBranchStep(s.title))
            const topLevelSteps = mappedSteps.filter(s => !isDisagreedBranchStep(s.title))
            const pendingAgreementStep = topLevelSteps.find(s => isPendingAgreementStep(s.title))

            if (pendingAgreementStep && branchChildren.length > 0) {
                pendingAgreementStep.branchLabel = 'Disagreed Case'
                pendingAgreementStep.branchChildren = branchChildren
            }

            return topLevelSteps
        })()
        : steps

    return (
        <Box sx={{ position: 'relative' }}>
            {effectiveSteps.map((step, index) => {
                const cfg = getStatusCfg(step.status)
                const isLast = index === effectiveSteps.length - 1
                const isPending = step.status === 'pending'
                const hasBranch = step.branchChildren && step.branchChildren.length > 0

                return (
                    <Box key={`${step.step}-${index}`} sx={{ display: 'flex', gap: 2, position: 'relative' }}>
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
                                            ? `linear-gradient(to bottom, ${cfg.connectorColor}, ${getStatusCfg(effectiveSteps[index + 1].status).connectorColor})`
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
                                    py: 1.5,
                                    px: 2,
                                    borderRadius: 1,
                                    bgcolor: step.status === 'in_progress' ? cfg.bgColor : 'transparent',
                                    border: '1px solid',
                                    borderColor: step.status === 'in_progress' ? (cfg as any).borderColor || 'rgba(255,159,67,0.25)' : 'divider',
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

                                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: step.remark ? 1 : 0, lineHeight: 1.6 }}>
                                    {step.description}
                                    {step.description && (step.updatedBy || step.updatedDate) ? ' • ' : ''}
                                    {step.updatedBy && `Updated by ${step.updatedBy}`}
                                    {step.updatedBy && step.updatedDate ? ' on ' : ''}
                                    {step.updatedDate}
                                </Typography>


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
                                                {step.branchLabel || 'Disagreed Case'}
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
