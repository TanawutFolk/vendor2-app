import { Box, Typography, Chip, Avatar } from '@mui/material'
import { getChipSx, getReadableStatusTone } from '@_workspace/utils/statusChipStyles'

// Types
import type { RegisterStep, RegisterStatus, ApprovalStepRecord, ApprovalLogRecord } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────
const statusConfig: Record<
    RegisterStatus,
    {
        label: string
        iconBg: string
        connectorColor: string
        icon: string
        chipIcon: string
    }
> = {
    completed: {
        label: 'Completed',
        iconBg: '#28C76F',
        connectorColor: '#28C76F',
        icon: 'tabler-check',
        chipIcon: 'tabler-circle-check-filled'
    },
    in_progress: {
        label: 'In Progress',
        iconBg: '#F08A24',
        connectorColor: '#F08A24',
        icon: 'tabler-loader-2',
        chipIcon: 'tabler-clock-filled'
    },
    pending: {
        label: 'Waiting',
        iconBg: '#8B909A',
        connectorColor: 'rgba(139,144,154,0.35)',
        icon: 'tabler-point',
        chipIcon: 'tabler-clock'
    },
    rejected: {
        label: 'Rejected',
        iconBg: '#EA5455',
        connectorColor: '#EA5455',
        icon: 'tabler-x',
        chipIcon: 'tabler-circle-x-filled'
    },
    skipped: {
        label: 'Skipped',
        iconBg: '#3B82F6',
        connectorColor: 'rgba(59,130,246,0.35)',
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

const shouldShowActionBy = (status: RegisterStatus) => ['completed', 'rejected', 'skipped'].includes(status)

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
    const tone = getReadableStatusTone(step.status)

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
                    borderColor: isPending || isSkipped ? 'divider' : tone.border,
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
                        size='small'
                        sx={getChipSx(tone, {
                            fontWeight: 600,
                            fontSize: '0.68rem',
                            height: 20,
                            '& .MuiChip-icon': { color: tone.color }
                        })}
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
            .sort((a, b) => a.STEP_ORDER - b.STEP_ORDER)
            .map(s => {
                const log = approvalLogs?.find(l => l.REQUEST_APPROVAL_STEP_ID === s.REQUEST_APPROVAL_STEP_ID)
                const status = toRegisterStatus(s.STEP_STATUS)
                const canShowActionBy = shouldShowActionBy(status)
                const updatedBy = canShowActionBy ? log?.ACTION_BY || s.UPDATE_BY : undefined
                const updatedDate = canShowActionBy && log?.CREATE_DATE
                    ? new Date(log.CREATE_DATE).toLocaleString('th-TH')
                    : canShowActionBy && s.UPDATE_DATE
                        ? new Date(s.UPDATE_DATE).toLocaleString('th-TH')
                        : undefined

                return {
                    step: s.STEP_ORDER,
                    title: s.DESCRIPTION || `Step ${s.STEP_ORDER}`,
                    description: '',
                    status,
                    updatedBy,
                    updatedDate,
                    remark: log?.DESCRIPTION || undefined
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
                const tone = getReadableStatusTone(step.status)

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
                                            ? `linear-gradient(to bottom, ${cfg.connectorColor}, ${getStatusCfg(effectiveSteps[index + 1]?.status).connectorColor})`
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
                                    bgcolor: step.status === 'in_progress' ? tone.bg : 'transparent',
                                    border: '1px solid',
                                    borderColor: step.status === 'in_progress' ? tone.border : 'divider',
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
                                        size='small'
                                        sx={getChipSx(tone, {
                                            fontWeight: 600,
                                            fontSize: '0.72rem',
                                            '& .MuiChip-icon': { color: tone.color }
                                        })}
                                    />
                                </Box>

                                {(step.description || step.updatedBy || step.updatedDate) && (
                                    <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: step.remark ? 1 : 0, lineHeight: 1.6 }}>
                                        {step.description}
                                    {step.description && (step.updatedBy || step.updatedDate) ? ' • ' : ''}
                                        {step.updatedBy && `Action By ${step.updatedBy}`}
                                        {step.updatedBy && step.updatedDate ? ' on ' : ''}
                                        {step.updatedDate}
                                    </Typography>
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

