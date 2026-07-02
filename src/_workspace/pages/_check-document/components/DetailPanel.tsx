import { useState } from 'react'
import {
    Box, Typography, Divider, Chip, Grid, Button, CircularProgress,
    Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material'

import GprFormDialog from '@_workspace/pages/_request-register/modal/GprFormDialog'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import useRequestStatusOptions from '@_workspace/react-query/hooks/useRequestStatusOptions'
import {
    getApproveActionLabel,
    buildActionLogPresentation,
    inferStepCode,
    getRejectActionLabel,
    isIssueGprBStep,
    isIssueGprCStep,
    isPendingAgreementStep,
    isPicStep,
    resolveActionRequiredStage,
    getActionRequiredStageLabel,
    isVendorDisagreedStep,
    resolveNextStatus,
    getNextPendingMainApprovalStep,
    isDocumentCheckApproved,
} from '@_workspace/utils/requestWorkflow'
import { formatFftStatus } from '@_workspace/utils/fftStatus'
import { getChipSx, getReadableStatusTone } from '@_workspace/utils/statusChipStyles'
import type { DetailPanelProps } from '@_workspace/types/_check-document/CheckDocumentTypes'

import { buildFileUrls, getNegotiationWorkflowState } from './shared'
import FileViewerDialog from './FileViewerDialog'
import { useCompleteRegistration } from '@_workspace/react-query/hooks/useRegisterRequest'

const DetailPanel = ({ data, empCode, queueStepCode, showSelectionSheetReadOnly = false, onApprove, onReject, onRefresh, onDetailRefresh }: DetailPanelProps) => {
    const [fileDialogOpen, setFileDialogOpen] = useState(false)
    const [gprFormOpen, setGprFormOpen] = useState(false)
    const [actionRequiredDialogOpen, setActionRequiredDialogOpen] = useState(false)
    const [selectedActionRequired, setSelectedActionRequired] = useState<any | null>(null)
    const [gprSavedInSession, setGprSavedInSession] = useState(false)
    const { data: statusOptions = [] } = useRequestStatusOptions()
    const completeMutation = useCompleteRegistration(
        (resData: any) => {
            if (resData?.Status) {
                ToastMessageSuccess({ title: 'Complete Registration', message: resData.Message || 'Registration completed successfully.' })
                onRefresh()
            } else {
                ToastMessageError({ title: 'Complete Registration', message: resData?.Message || 'Failed to complete registration.' })
            }
        },
        (err: any) => {
            ToastMessageError({ title: 'Complete Registration', message: err?.response?.data?.Message || err?.message || 'Failed to complete registration.' })
        }
    )
    if (!data) return null

    const files = buildFileUrls(data?.documents)
    const approvalSteps: any[] = (() => {
        try { return typeof data.approval_steps === 'string' ? JSON.parse(data.approval_steps) : (data.approval_steps || []) } catch { return [] }
    })().filter(Boolean).sort((a: any, b: any) => a.STEP_ORDER - b.STEP_ORDER)

    const logs: any[] = (() => {
        try { return typeof data.approval_logs === 'string' ? JSON.parse(data.approval_logs) : (data.approval_logs || []) } catch { return [] }
    })().filter(Boolean)

    const currentStep = approvalSteps.find((s: any) => s.STEP_STATUS === 'in_progress')
    const myActionedStep = approvalSteps.find((s: any) =>
        s.APPROVER_EMPCODE === empCode && (s.STEP_STATUS === 'approved' || s.STEP_STATUS === 'rejected')
    )

    const isCurrentPicStep = !!currentStep && isPicStep(currentStep)
    const isPicOwnedNegotiationStep = !!currentStep && (
        isPendingAgreementStep(currentStep) ||
        isIssueGprBStep(currentStep) ||
        isIssueGprCStep(currentStep) ||
        isVendorDisagreedStep(currentStep)
    )
    const isCurrentStepMine = !!currentStep && (
        currentStep.APPROVER_EMPCODE === empCode ||
        ((isCurrentPicStep || isPicOwnedNegotiationStep) && data.ASSIGN_TO === empCode)
    )
    const normalizedQueueStepCode = String(queueStepCode || '').trim().toUpperCase()
    const isAccountRegisterQueue = normalizedQueueStepCode === 'ACCOUNT_REGISTERED'
    const isCurrentStepMatchingQueue = !normalizedQueueStepCode || inferStepCode(currentStep) === normalizedQueueStepCode
    const hasVendorRequested = !!currentStep && logs.some((l: any) =>
        String(l.REQUEST_APPROVAL_STEP_ID || '') === String(currentStep.REQUEST_APPROVAL_STEP_ID || '') && l.ACTION_TYPE === 'vendor_requested'
    )
    const approveButtonLabel = getApproveActionLabel(currentStep, hasVendorRequested)
    const rejectButtonLabel = getRejectActionLabel(currentStep)
    const actionRequiredSetup = (() => {
        try { return typeof data.ACTION_REQUIRED_JSON === 'string' ? JSON.parse(data.ACTION_REQUIRED_JSON) : (data.ACTION_REQUIRED_JSON || {}) } catch { return {} }
    })()
    const actionRequiredStage = resolveActionRequiredStage(currentStep)
    const actionRequiredStageConfig = actionRequiredStage ? (actionRequiredSetup?.[actionRequiredStage] || {}) : null
    const showActionRequiredBtn = Boolean(isCurrentStepMine && isCurrentStepMatchingQueue && actionRequiredStage)
    const disableActionRequiredBtn = !String(actionRequiredStageConfig?.pic_email || '').trim()
    const actionRequiredLabel = actionRequiredStage
        ? `Action Required - ${getActionRequiredStageLabel(currentStep)}`
        : 'Action Required'
    const isActionable = isCurrentStepMine && isCurrentStepMatchingQueue
    const isSelectionSheetLocked = isDocumentCheckApproved(approvalSteps)
    const isGprReadOnly = isSelectionSheetLocked || !isActionable
    const vendorCodeSelector = String(data?.PROPOSED_VENDOR_CODE || data?.vendor_code_selector || data?.VENDOR_CODE_SELECTOR || '').trim()
    const handleCompleteAccountRegistration = () => {
        const latestVendorCode = String(data?.PROPOSED_VENDOR_CODE || data?.vendor_code_selector || data?.VENDOR_CODE_SELECTOR || '').trim()
        if (!latestVendorCode) {
            ToastMessageError({
                title: 'Complete Registration',
                message: 'Please fill Vendor Code in the Selection Sheet before completing registration.'
            })
            return
        }

        completeMutation.mutate({
            REQUEST_REGISTER_VENDOR_ID: Number(data?.REQUEST_REGISTER_VENDOR_ID || 0),
            UPDATE_BY: empCode || 'SYSTEM',
        })
    }
    const hasPersistedGprData = (() => {
        if (!data.gpr_data) return false
        try {
            const parsed = typeof data.gpr_data === 'string' ? JSON.parse(data.gpr_data) : data.gpr_data
            return Boolean(parsed)
        } catch {
            return false
        }
    })()
    const nextStep = getNextPendingMainApprovalStep(approvalSteps, currentStep)
    const isFinalStep = !!currentStep && !nextStep
    const computedNextStatus = resolveNextStatus(statusOptions, currentStep, nextStep, hasVendorRequested)
    const { isNegotiationStep, actions: negotiationActions } = getNegotiationWorkflowState(currentStep, statusOptions)
    const agreeAction = negotiationActions.find(action => action.key === 'agree')
    const disagreeAction = negotiationActions.find(action => action.key === 'disagree')
    const renderDisagreeFirst = Boolean(disagreeAction && !disagreeAction.label.toLowerCase().includes('vendor disagreed'))

    const contacts: any[] = (() => {
        try { return typeof data.contacts === 'string' ? JSON.parse(data.contacts) : (data.contacts || []) } catch { return [] }
    })().filter(Boolean)
    const products: any[] = (() => {
        try { return typeof data.products === 'string' ? JSON.parse(data.products) : (data.products || []) } catch { return [] }
    })().filter(Boolean)
    const infoRow = (label: string, value: any) => (
        <Box sx={{ display: 'flex', borderBottom: '1px solid', borderColor: 'divider', py: 1.5 }}>
            <Typography variant='caption' color='text.disabled' fontWeight={700} sx={{ minWidth: 160 }}>{label}</Typography>
            <Typography variant='body2' fontWeight={500}>{value || '-'}</Typography>
        </Box>
    )

    const SectionHeader = ({ icon, title }: { icon: string; title: string }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <i className={icon} style={{ fontSize: 16, color: 'var(--mui-palette-primary-main)' }} />
            <Typography variant='subtitle2' fontWeight={700} color='text.secondary'>{title}</Typography>
            <Divider sx={{ flex: 1 }} />
        </Box>
    )

    const getStepStatusCfg = (status: string) => {
        switch (status) {
            case 'approved':
            case 'completed':
                return { label: 'Completed', icon: 'tabler-circle-check-filled', tone: { bg: '#D6F4E6', color: '#087B55', border: '#5AD6A3' } }
            case 'in_progress':
            case 'current':
                return { label: 'In Progress', icon: 'tabler-clock-play', tone: { bg: '#FFF0D9', color: '#D96D00', border: '#FFB35C' } }
            case 'rejected':
                return { label: 'Rejected', icon: 'tabler-circle-x-filled', tone: { bg: '#FFE0E2', color: '#B42335', border: '#FF8B98' } }
            case 'skipped':
                return { label: 'Skipped', icon: 'tabler-circle-minus', tone: { bg: '#D8F2FF', color: '#0277A8', border: '#6ACCF2' } }
            case 'pending':
            default:
                return { label: 'Waiting', icon: 'tabler-clock', tone: { bg: '#EDEDED', color: '#667085', border: '#CFCFCF' } }
        }
    }

    return (
        <Box sx={{ p: 3, overflowY: 'auto', height: '100%' }}>
            <Box sx={{ p: 2.5, mb: 3, borderRadius: 1, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5 }}>
                    <Box>
                        <Typography variant='h6' fontWeight={800}>{data.COMPANY_NAME}</Typography>
                        {myActionedStep && (
                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 1, px: 1.25, py: 0.4, borderRadius: 5, bgcolor: myActionedStep.STEP_STATUS === 'approved' ? '#e8f5e9' : '#ffebee', border: '1px solid', borderColor: myActionedStep.STEP_STATUS === 'approved' ? '#a5d6a7' : '#ef9a9a' }}>
                                <i className={myActionedStep.STEP_STATUS === 'approved' ? 'tabler-circle-check-filled' : 'tabler-circle-x-filled'} style={{ fontSize: 13, color: myActionedStep.STEP_STATUS === 'approved' ? '#2e7d32' : '#c62828' }} />
                                <Typography variant='caption' sx={{ fontWeight: 700, color: myActionedStep.STEP_STATUS === 'approved' ? '#2e7d32' : '#c62828', lineHeight: 1 }}>
                                    Your action: {myActionedStep.STEP_STATUS === 'approved' ? 'Approved' : 'Rejected'} - {myActionedStep.DESCRIPTION}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    <Box
                        sx={{
                            px: 1.5,
                            py: 0.75,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            bgcolor: 'transparent',
                            maxWidth: 320,
                        }}
                    >
                        <Typography variant='body2' color='text.secondary' fontWeight={600}>
                            {data.REQUEST_STATUS || '-'}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ mb: 4 }}>
                <SectionHeader icon='tabler-clipboard-list' title='Request Info' />
                <Grid container spacing={2}>
                    {[
                        { label: 'Support Product / Process', value: data.SUPPORTPRODUCT_PROCESS },
                        { label: 'Purchase Frequency', value: data.PURCHASE_FREQUENCY },
                        { label: 'Assigned PIC', value: data.ASSIGN_TO },
                        { label: 'Submitted Date', value: data.CREATE_DATE ? new Date(data.CREATE_DATE).toLocaleDateString('th-TH') : '-' },
                    ].map(({ label, value }) => (
                        <Grid item xs={12} sm={6} md={3} key={label}>
                            <Typography variant='caption' color='text.disabled' fontWeight={600}>{label}</Typography>
                            <Typography variant='body2' fontWeight={600} sx={{ wordBreak: 'break-word' }}>{value || '-'}</Typography>
                        </Grid>
                    ))}
                    {data.REQUESTER_REMARK && (
                        <Grid item xs={12}>
                            <Typography variant='caption' color='text.disabled' fontWeight={600}>Requester Remark</Typography>
                            <Typography variant='body2' fontWeight={600} sx={{ wordBreak: 'break-word' }}>{data.REQUESTER_REMARK}</Typography>
                        </Grid>
                    )}
                </Grid>
            </Box>

            <Box sx={{ mb: 4 }}>
                <SectionHeader icon='tabler-building-store' title='Vendor Info' />
                <Grid container spacing={2}>
                    {[
                        { label: 'Company Name', value: data.COMPANY_NAME },
                        { label: 'Vendor Type', value: data.vendor_type_name },
                        { label: 'Region', value: data.VENDOR_REGION },
                        { label: 'FFT Vendor Code', value: data.FFT_VENDOR_CODE },
                        { label: 'FFT Status', value: formatFftStatus(data.FFT_STATUS) },
                        ...(data.VENDOR_REGION === 'Oversea'
                            ? [{ label: 'Country', value: data.COUNTRY }]
                            : [
                                { label: 'Province', value: data.PROVINCE },
                                { label: 'Postal Code', value: data.POSTAL_CODE }
                            ]),
                        { label: 'Tel Center', value: data.TEL_CENTER },
                        { label: 'Website', value: data.WEBSITE },
                        { label: 'Email (Main)', value: data.EMAILMAIN },
                    ].map(({ label, value }) => (
                        <Grid item xs={12} sm={6} md={4} key={label}>
                            <Typography variant='caption' color='text.disabled' fontWeight={600}>{label}</Typography>
                            <Typography variant='body2' fontWeight={600} sx={{ wordBreak: 'break-word' }}>{value || '-'}</Typography>
                        </Grid>
                    ))}
                    {data.ADDRESS && (
                        <Grid item xs={12}>
                            <Typography variant='caption' color='text.disabled' fontWeight={600}>Address</Typography>
                            <Typography variant='body2' fontWeight={600} sx={{ wordBreak: 'break-word' }}>{data.ADDRESS}</Typography>
                        </Grid>
                    )}
                </Grid>
            </Box>

            {contacts.length > 0 && (
                <Box sx={{ mb: 3 }}>
                    <SectionHeader icon='tabler-users' title={`Contacts (${contacts.length})`} />
                    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 2fr', px: 2, py: 1, bgcolor: 'action.hover' }}>
                            {['Name', 'Tel', 'Position', 'Email'].map(h => (
                                <Typography key={h} variant='caption' fontWeight={700} color='text.secondary'>{h}</Typography>
                            ))}
                        </Box>
                        {contacts.map((c, i) => (
                            <Box key={i} sx={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 2fr', px: 2, py: 1.25, borderTop: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
                                <Typography variant='body2' fontWeight={600}>{c.contact_name || '-'}</Typography>
                                <Typography variant='body2' color='text.secondary'>{c.tel_phone || '-'}</Typography>
                                <Typography variant='body2' color='text.secondary'>{c.position || '-'}</Typography>
                                <Typography variant='body2' color='text.secondary' sx={{ wordBreak: 'break-all' }}>{c.email || '-'}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}

            {products.length > 0 && (
                <Box sx={{ mb: 3 }}>
                    <SectionHeader icon='tabler-package' title={`Products (${products.length})`} />
                    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 2fr 2fr', px: 2, py: 1, bgcolor: 'action.hover' }}>
                            {['Group', 'Maker', 'Product Name', 'Model List'].map(h => (
                                <Typography key={h} variant='caption' fontWeight={700} color='text.secondary'>{h}</Typography>
                            ))}
                        </Box>
                        {products.map((p, i) => (
                            <Box key={i} sx={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 2fr 2fr', px: 2, py: 1.25, borderTop: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
                                <Typography variant='body2' fontWeight={600}>{p.product_group || '-'}</Typography>
                                <Typography variant='body2' color='text.secondary'>{p.maker_name || '-'}</Typography>
                                <Typography variant='body2' color='text.secondary'>{p.product_name || '-'}</Typography>
                                <Typography variant='body2' color='text.secondary'>{p.model_list || '-'}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}

            {files.length > 0 && (
                <Box sx={{ mb: 3 }}>
                    <SectionHeader icon='tabler-paperclip' title={`Attached Files (${files.length})`} />
                    <Button size='small' variant='tonal' startIcon={<i className='tabler-folder-open' style={{ fontSize: 16 }} />} onClick={() => setFileDialogOpen(true)}>
                        View {files.length} File{files.length > 1 ? 's' : ''}
                    </Button>
                </Box>
            )}

            {showSelectionSheetReadOnly && (
                <Box
                    sx={{
                        mb: 3,
                        p: 2,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <i className='tabler-clipboard-text' style={{ fontSize: 20, color: 'var(--mui-palette-primary-main)' }} />
                        <Box>
                            <Typography variant='subtitle2' fontWeight={700}>Supplier / Outsourcing Selection Sheet</Typography>
                            <Typography variant='caption' color='text.secondary'>
                                {isGprReadOnly
                                    ? 'Selection Sheet (read-only)'
                                    : (hasPersistedGprData || gprSavedInSession
                                        ? 'Selection Sheet filled - click to edit'
                                        : 'Fill in Selection Sheet')}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button
                            size='small'
                            variant='contained'
                            color='primary'
                            startIcon={<i className={isGprReadOnly ? 'tabler-eye' : ((hasPersistedGprData || gprSavedInSession) ? 'tabler-pencil' : 'tabler-plus')} style={{ fontSize: 14 }} />}
                            onClick={() => setGprFormOpen(true)}
                        >
                            {isGprReadOnly ? 'View Selection Sheet' : ((hasPersistedGprData || gprSavedInSession) ? 'Edit Selection Sheet' : 'Fill Selection Sheet')}
                        </Button>
                    </Box>
                </Box>
            )}

            {approvalSteps.length > 0 && (
                <Box sx={{ mb: 3 }}>
                    <SectionHeader icon='tabler-list-check' title={`Approval Steps (${approvalSteps.length})`} />
                    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '0.5fr 2.6fr 1.2fr 1.5fr', px: 2, py: 1, bgcolor: 'action.hover' }}>
                            {['#', 'Description', 'Status', 'Updated'].map(h => (
                                <Typography key={h} variant='caption' fontWeight={700} color='text.secondary'>{h}</Typography>
                            ))}
                        </Box>
                        {approvalSteps.map((s: any, i: number) => {
                            const stCfg = getStepStatusCfg(s.STEP_STATUS)
                            return (
                                <Box key={i} sx={{ display: 'grid', gridTemplateColumns: '0.5fr 2.6fr 1.2fr 1.5fr', px: 2, py: 1.25, borderTop: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
                                    <Typography variant='body2' fontWeight={600}>{s.STEP_ORDER}</Typography>
                                    <Typography variant='body2' fontWeight={600}>{s.DESCRIPTION || '-'}</Typography>
                                    <Chip
                                        icon={<i className={stCfg.icon} style={{ fontSize: 13 }} />}
                                        label={stCfg.label}
                                        size='small'
                                        sx={getChipSx(stCfg.tone, {
                                            fontWeight: 600,
                                            fontSize: '0.68rem',
                                            height: 22,
                                            width: 'fit-content',
                                            '& .MuiChip-icon': { color: stCfg.tone.color }
                                        })}
                                    />
                                    <Typography variant='body2' color='text.secondary'>
                                        {s.UPDATE_DATE ? new Date(s.UPDATE_DATE).toLocaleDateString('th-TH') : '-'}
                                    </Typography>
                                </Box>
                            )
                        })}
                    </Box>

                </Box>
            )}

            {(data.APPROVE_BY || data.APPROVER_REMARK) && (
                <Box sx={{ mb: 3 }}>
                    <SectionHeader icon='tabler-user-check' title='Decision Info' />
                    {infoRow('Approved / Rejected By', data.APPROVE_BY)}
                    {infoRow('Approval Date', data.APPROVE_DATE ? new Date(data.APPROVE_DATE).toLocaleDateString('th-TH') : '-')}
                    {infoRow('Approver Remark', data.APPROVER_REMARK)}
                </Box>
            )}

            {isActionable && !isAccountRegisterQueue && (
                <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                    {isNegotiationStep && agreeAction && disagreeAction && (
                        <>
                            {showActionRequiredBtn && (
                                <Button variant='contained' color='info' fullWidth startIcon={<i className='tabler-bell-ringing' style={{ fontSize: 18 }} />} disabled={disableActionRequiredBtn} onClick={() => onApprove(computedNextStatus, false, actionRequiredLabel)}>{actionRequiredLabel}</Button>
                            )}
                            {renderDisagreeFirst && (
                                <Button variant='contained' color={disagreeAction.color} fullWidth startIcon={<i className={disagreeAction.color === 'warning' ? 'tabler-send' : 'tabler-alert-triangle'} style={{ fontSize: 18 }} />} onClick={() => onApprove(disagreeAction.nextStatus, disagreeAction.isFinalStep, disagreeAction.label)}>{disagreeAction.label}</Button>
                            )}
                            <Button variant='contained' color={agreeAction.color} fullWidth startIcon={<i className='tabler-circle-check' style={{ fontSize: 18 }} />} onClick={() => onApprove(agreeAction.nextStatus, agreeAction.isFinalStep, agreeAction.label)}>{agreeAction.label}</Button>
                            {!renderDisagreeFirst && (
                                <Button variant='contained' color={disagreeAction.color} fullWidth startIcon={<i className={disagreeAction.color === 'warning' ? 'tabler-send' : 'tabler-alert-triangle'} style={{ fontSize: 18 }} />} onClick={() => onApprove(disagreeAction.nextStatus, disagreeAction.isFinalStep, disagreeAction.label)}>{disagreeAction.label}</Button>
                            )}
                        </>
                    )}
                    {!isNegotiationStep && (
                        <>
                            {showActionRequiredBtn && (
                                <Button variant='contained' color='info' fullWidth startIcon={<i className='tabler-bell-ringing' style={{ fontSize: 18 }} />} disabled={disableActionRequiredBtn} onClick={() => onApprove(computedNextStatus, false, actionRequiredLabel)}>{actionRequiredLabel}</Button>
                            )}
                            <Button variant='contained' color='success' fullWidth startIcon={<i className='tabler-circle-check' style={{ fontSize: 18 }} />} onClick={() => onApprove(computedNextStatus, isFinalStep, approveButtonLabel)}>{approveButtonLabel}</Button>
                            <Button variant='contained' color='error' fullWidth startIcon={<i className='tabler-circle-x' style={{ fontSize: 18 }} />} onClick={() => onReject(rejectButtonLabel)}>{rejectButtonLabel}</Button>
                        </>
                    )}
                </Box>
            )}

            {isActionable && isAccountRegisterQueue && (
                <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                    <Button
                        variant='contained'
                        color='success'
                        fullWidth
                        disabled={completeMutation.isPending || !vendorCodeSelector}
                        startIcon={completeMutation.isPending ? <CircularProgress size={18} color='inherit' /> : <i className='tabler-circle-check' style={{ fontSize: 18 }} />}
                        onClick={handleCompleteAccountRegistration}
                    >
                        {completeMutation.isPending ? 'Completing...' : 'Complete Registration'}
                    </Button>
                </Box>
            )}

            {logs.length > 0 && (
                <Box sx={{ mb: 3, mt: 3 }}>
                    <SectionHeader icon='tabler-history' title='Action Logs' />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {logs.map((l: any, i: number) => {
                            const {
                                parsedRemark,
                                actionTypeLabel,
                                actionColor,
                                detailText,
                                actorLabel,
                                stepDescription,
                            } = buildActionLogPresentation(l, approvalSteps)
                            return (
                                <Box
                                    key={`action-log-${i}`}
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 1.5,
                                        bgcolor: 'background.paper',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                                <Chip
                                                    size='small'
                                                    label={actionTypeLabel}
                                                    sx={getChipSx(getReadableStatusTone(
                                                        actionColor === 'success' ? 'completed' :
                                                        actionColor === 'error' ? 'rejected' :
                                                        actionColor === 'warning' ? 'in progress' :
                                                        actionColor === 'info' ? 'skipped' : 'pending'
                                                    ), { height: 22, fontSize: '0.68rem', fontWeight: 700 })}
                                                />
                                                {parsedRemark.isActionRequired && (
                                                    <Chip
                                                        size='small'
                                                        label='View Detail'
                                                        color='warning'
                                                        variant='outlined'
                                                        sx={{ height: 22, fontSize: '0.68rem' }}
                                                        onClick={() => {
                                                            setSelectedActionRequired(parsedRemark)
                                                            setActionRequiredDialogOpen(true)
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                            <Typography variant='caption' color='text.disabled'>
                                                {l.CREATE_DATE ? new Date(l.CREATE_DATE).toLocaleString('th-TH') : '-'}
                                            </Typography>
                                        </Box>
                                        <Typography variant='body2' fontWeight={600}>
                                            {actorLabel}
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.35 }}>
                                            {stepDescription && (
                                                <Typography variant='caption' color='text.secondary'>
                                                    <strong>Step:</strong> {stepDescription}
                                                </Typography>
                                            )}
                                            <Typography variant='caption' color='text.secondary'>
                                                <strong>Action:</strong> {actionTypeLabel}
                                            </Typography>
                                            {detailText && (
                                                <Typography variant='caption' color='text.secondary'>
                                                    <strong>Detail:</strong> {detailText}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                </Box>
                            )
                        })}
                    </Box>
                </Box>
            )}

            <FileViewerDialog open={fileDialogOpen} files={files} onClose={() => setFileDialogOpen(false)} />
            {gprFormOpen && (
                <GprFormDialog
                    open={gprFormOpen}
                    rowData={data}
                    readOnly={isGprReadOnly}
                    onClose={() => setGprFormOpen(false)}
                    onSaved={() => {
                        setGprSavedInSession(true)
                        setGprFormOpen(false)
                        // Refresh this request's detail in place (keeps the
                        // Account Register Vendor Details dialog open) rather
                        // than onRefresh, which closes it after approve/reject.
                        ;(onDetailRefresh || onRefresh)()
                    }}
                />
            )}
            <Dialog maxWidth='sm' fullWidth={true} open={actionRequiredDialogOpen} onClose={() => setActionRequiredDialogOpen(false)}>
                <DialogTitle>Action Required Detail</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                        <Typography variant='body2'><strong>Stage:</strong> {selectedActionRequired?.stage || '-'}</Typography>
                        <Typography variant='body2'><strong>Owner:</strong> {selectedActionRequired?.owner || '-'}</Typography>
                        <Typography variant='body2'><strong>Owner Email:</strong> {selectedActionRequired?.ownerEmail || '-'}</Typography>
                        <Typography variant='body2'><strong>Due Date:</strong> {selectedActionRequired?.dueDate || '-'}</Typography>
                        <Typography variant='body2'><strong>Note:</strong> {selectedActionRequired?.note || '-'}</Typography>
                        <Typography variant='body2'><strong>Actor:</strong> {selectedActionRequired?.actor || '-'}</Typography>
                        <Typography variant='body2'><strong>Captured At:</strong> {selectedActionRequired?.capturedAt || '-'}</Typography>
                        {selectedActionRequired?.rawRemark && (
                            <Typography variant='caption' color='text.secondary'>Raw: {selectedActionRequired.rawRemark}</Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setActionRequiredDialogOpen(false)} variant='tonal' color='secondary'>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default DetailPanel
