// React Imports
import { useMemo, useState, useEffect, useRef, useCallback } from 'react'

// MUI Imports
import {
    Grid, Card, CardContent, Box, Typography, Chip, Divider,
    IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
    Button, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material'

// AG Grid Imports
import type { ColDef, IServerSideDatasource, StateUpdatedEvent } from 'ag-grid-community'
import DxAGgridTable from '@/_template/DxAGgridTable'

// Services
import RegisterRequestServices from '@_workspace/services/_register-request/RegisterRequestServices'

// Utils
import { getUserData } from '@/utils/user-profile/userLoginProfile'

// React Hook Form
import { useFormContext } from 'react-hook-form'
import type { RequestHistoryFormData } from './validateSchema'

// Context
import { useDxContext } from '@/_template/DxContextProvider'

// Status — icons from code, everything else from DB
import { STATUS_ICON_MAP } from '@_workspace/constants/requestStatus'
import useRequestStatusOptions from '@_workspace/react-query/useRequestStatusOptions'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const API_BASE = (import.meta as any).env?.VITE_API_URL || ''

// Build accessible file URLs from comma-separated filenames stored in DB
const buildFileUrls = (documents: any): { name: string; url: string }[] => {
    try {
        const docs = typeof documents === 'string' ? JSON.parse(documents) : (documents || [])
        return docs.filter(Boolean).map((d: any) => ({
            name: d.file_name || d.file_path || 'Unnamed File',
            url: `${API_BASE}/uploads/documents/${d.file_path}`
        }))
    } catch { return [] }
}

// ─────────────────────────────────────────────────────────────────────────────
// Status Summary Chip
// ─────────────────────────────────────────────────────────────────────────────
const StatusSummaryChip = ({ label, count, color }: { label: string; count: number; color: 'success' | 'warning' | 'default' | 'error' | 'info' }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip label={`${count}`} color={color} size='small' variant='tonal' sx={{ minWidth: 28 }} />
        <Typography variant='body2' color='text.secondary'>{label}</Typography>
    </Box>
)

// ─────────────────────────────────────────────────────────────────────────────
// File Viewer Dialog
// ─────────────────────────────────────────────────────────────────────────────
const FileViewerDialog = ({ open, files, onClose }: {
    open: boolean
    files: { name: string; url: string }[]
    onClose: () => void
}) => {
    const getFileIcon = (name: string) => {
        const ext = name.split('.').pop()?.toLowerCase()
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'tabler-photo'
        if (ext === 'pdf') return 'tabler-file-type-pdf'
        if (['xls', 'xlsx'].includes(ext || '')) return 'tabler-file-type-xls'
        if (['doc', 'docx'].includes(ext || '')) return 'tabler-file-type-doc'
        return 'tabler-file'
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <i className='tabler-paperclip' style={{ fontSize: 20, color: 'var(--mui-palette-primary-main)' }} />
                    <Typography variant='h6'>Attached Files ({files.length})</Typography>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                {files.length === 0 ? (
                    <Typography color='text.secondary' sx={{ py: 2, textAlign: 'center' }}>No files attached</Typography>
                ) : (
                    <List disablePadding>
                        {files.map((file, idx) => (
                            <ListItem
                                key={idx}
                                disablePadding
                                sx={{
                                    py: 1.5, px: 2, mb: 1, borderRadius: 2,
                                    border: '1px solid', borderColor: 'divider',
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                                secondaryAction={
                                    <Tooltip title='Open / Download'>
                                        <IconButton
                                            edge='end'
                                            size='small'
                                            onClick={() => window.open(file.url, '_blank')}
                                            sx={{ color: 'primary.main' }}
                                        >
                                            <i className='tabler-external-link' style={{ fontSize: 18 }} />
                                        </IconButton>
                                    </Tooltip>
                                }
                            >
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                    <i className={getFileIcon(file.name)} style={{ fontSize: 24, color: 'var(--mui-palette-primary-main)' }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Typography
                                            variant='body2'
                                            fontWeight={600}
                                            sx={{
                                                cursor: 'pointer', color: 'primary.main',
                                                '&:hover': { textDecoration: 'underline' }
                                            }}
                                            onClick={() => window.open(file.url, '_blank')}
                                        >
                                            {file.name}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant='tonal' color='secondary'>Close</Button>
            </DialogActions>
        </Dialog>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Status Timeline Component  (steps from request_approval_step + fallback to DB status options)
// ─────────────────────────────────────────────────────────────────────────────
const StatusTimeline = ({ status, approvalSteps, approvalLogs }: { status: string; approvalSteps?: any[]; approvalLogs?: any[] }) => {
    const { data: statusOptions = [] } = useRequestStatusOptions()

    // Parse approval_steps & approval_logs from JSON if needed
    const steps: any[] = useMemo(() => {
        try {
            const raw = typeof approvalSteps === 'string' ? JSON.parse(approvalSteps) : (approvalSteps || [])
            return raw.filter(Boolean).sort((a: any, b: any) => a.step_order - b.step_order)
        } catch { return [] }
    }, [approvalSteps])

    const logs: any[] = useMemo(() => {
        try {
            const raw = typeof approvalLogs === 'string' ? JSON.parse(approvalLogs) : (approvalLogs || [])
            return raw.filter(Boolean)
        } catch { return [] }
    }, [approvalLogs])

    // If we have real approval steps, use those; otherwise fall back to status-based workflow
    const hasRealSteps = steps.length > 0

    // Fallback: Build workflow steps from DB (old behavior)
    const workflowSteps = useMemo(() => {
        if (hasRealSteps) return []
        const submitted = { label: 'Request Submitted', value: null as string | null, icon: 'tabler-file-upload' }
        const s = statusOptions
            .filter(s => s.value !== 'Rejected')
            .map(s => ({ label: s.label, value: s.value as string | null, icon: STATUS_ICON_MAP[s.value] || 'tabler-file' }))
        return [submitted, ...s]
    }, [statusOptions, hasRealSteps])

    const isRejected = status === 'Rejected'

    // ── Real steps view (from request_approval_step) ──
    if (hasRealSteps) {
        return (
            <Box sx={{ position: 'relative', ml: 1, mt: 1 }}>
                {isRejected && (
                    <Box sx={{ mb: 2, p: 1.5, borderRadius: 1.5, bgcolor: 'error.light', display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <i className='tabler-circle-x' style={{ fontSize: 18, color: 'var(--mui-palette-error-main)' }} />
                        <Typography variant='body2' color='error.main' fontWeight={700}>Request Rejected</Typography>
                    </Box>
                )}

                {/* vertical connector line */}
                <Box sx={{ position: 'absolute', left: 19, top: isRejected ? 62 : 20, bottom: 20, width: 2, bgcolor: 'divider', zIndex: 0 }} />

                {steps.map((step: any, idx: number) => {
                    const stepStatus = step.step_status || 'pending'
                    const isCompleted = stepStatus === 'approved' || stepStatus === 'completed'
                    const isCurrent = stepStatus === 'in_progress' || stepStatus === 'current'
                    const isStepRejected = stepStatus === 'rejected'
                    const isSkipped = stepStatus === 'skipped'
                    const isPending = !isCompleted && !isCurrent && !isStepRejected && !isSkipped

                    const iconColor = isCompleted
                        ? 'var(--mui-palette-success-main)'
                        : isCurrent
                            ? 'var(--mui-palette-warning-main)'
                            : isStepRejected
                                ? 'var(--mui-palette-error-main)'
                                : isSkipped
                                    ? 'var(--mui-palette-info-main)'
                                    : 'inherit'

                    const stepIcon = isCompleted ? 'tabler-check'
                        : isCurrent ? 'tabler-loader-2'
                        : isStepRejected ? 'tabler-x'
                        : isSkipped ? 'tabler-minus'
                        : STATUS_ICON_MAP[step.DESCRIPTION] || 'tabler-point'

                    const stepLog = logs.find((l: any) => l.step_id === step.step_id)

                    return (
                        <Box key={idx}
                            sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, position: 'relative', zIndex: 1, mb: idx === steps.length - 1 ? 0 : 3 }}
                        >
                            <Box sx={{
                                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                bgcolor: isCompleted ? 'success.light' : isCurrent ? 'warning.light' : isStepRejected ? 'error.light' : isSkipped ? 'info.light' : 'background.paper',
                                border: '2px solid',
                                borderColor: isCompleted || isCurrent || isStepRejected || isSkipped ? 'transparent' : 'divider',
                                boxShadow: isCurrent ? '0 0 0 4px rgba(255, 159, 67, 0.2)' : 'none',
                            }}>
                                <i className={stepIcon} style={{ fontSize: 20, color: iconColor }} />
                            </Box>
                            <Box sx={{ pt: 0.5, flex: 1 }}>
                                <Typography
                                    variant='subtitle2'
                                    fontWeight={isCurrent ? 800 : isCompleted ? 600 : 500}
                                    color={isPending || isSkipped ? 'text.disabled' : 'text.primary'}
                                >
                                    {step.DESCRIPTION || `Step ${step.step_order}`}
                                </Typography>
                                {step.approver_id && (
                                    <Typography variant='caption' color='text.secondary'>
                                        Approver: {step.approver_id}
                                    </Typography>
                                )}
                                {stepLog && (
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography variant='caption' color='text.disabled'>
                                            {stepLog.action_by} — {stepLog.action_type}
                                            {stepLog.remark ? ` (${stepLog.remark})` : ''}
                                            {stepLog.action_date ? ` · ${new Date(stepLog.action_date).toLocaleString('th-TH')}` : ''}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    )
                })}
            </Box>
        )
    }

    // ── Fallback: status-based view (old behavior) ──
    const currentStepIndex = isRejected
        ? -1
        : workflowSteps.findIndex(s => s.value === status)

    return (
        <Box sx={{ position: 'relative', ml: 1, mt: 1 }}>
            {isRejected && (
                <Box sx={{ mb: 2, p: 1.5, borderRadius: 1.5, bgcolor: 'error.light', display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <i className='tabler-circle-x' style={{ fontSize: 18, color: 'var(--mui-palette-error-main)' }} />
                    <Typography variant='body2' color='error.main' fontWeight={700}>Request Rejected</Typography>
                </Box>
            )}

            {/* vertical connector line */}
            <Box sx={{ position: 'absolute', left: 19, top: isRejected ? 62 : 20, bottom: 20, width: 2, bgcolor: 'divider', zIndex: 0 }} />

            {workflowSteps.map((step, idx) => {
                let stepState: 'completed' | 'in_progress' | 'pending' = 'pending'
                if (idx === 0) {
                    stepState = 'completed' // Request Submitted — always done
                } else if (!isRejected && currentStepIndex > 0) {
                    if (idx < currentStepIndex) stepState = 'completed'
                    else if (idx === currentStepIndex) stepState = 'in_progress'
                }

                const isCompleted = stepState === 'completed'
                const isCurrent = stepState === 'in_progress'

                const iconColor = isCompleted
                    ? 'var(--mui-palette-success-main)'
                    : isCurrent
                        ? 'var(--mui-palette-warning-main)'
                        : 'inherit'

                return (
                    <Box
                        key={idx}
                        sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, position: 'relative', zIndex: 1, mb: idx === workflowSteps.length - 1 ? 0 : 3 }}
                    >
                        <Box sx={{
                            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            bgcolor: isCompleted ? 'success.light' : isCurrent ? 'warning.light' : 'background.paper',
                            border: '2px solid',
                            borderColor: isCompleted || isCurrent ? 'transparent' : 'divider',
                            boxShadow: isCurrent ? '0 0 0 4px rgba(255, 159, 67, 0.2)' : 'none',
                        }}>
                            <i className={step.icon} style={{ fontSize: 20, color: iconColor }} />
                        </Box>
                        <Box sx={{ pt: 1 }}>
                            <Typography
                                variant='subtitle2'
                                fontWeight={isCurrent ? 800 : isCompleted ? 600 : 500}
                                color={isCompleted || isCurrent ? 'text.primary' : 'text.disabled'}
                            >
                                {step.label}
                            </Typography>
                        </Box>
                    </Box>
                )
            })}
        </Box>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Master-Detail Renderer
// ─────────────────────────────────────────────────────────────────────────────
const DetailRenderer = ({ data }: { data: any }) => {
    const [fileDialogOpen, setFileDialogOpen] = useState(false)
    const { data: statusOptions = [] } = useRequestStatusOptions()
    const files = buildFileUrls(data?.documents)

    if (!data) return null

    const accent = statusOptions.find(s => s.value === data.request_status)?.accent || '#8A8D99'

    const contacts: any[] = (() => {
        try { return typeof data.contacts === 'string' ? JSON.parse(data.contacts) : (data.contacts || []) } catch { return [] }
    })().filter(Boolean)

    const products: any[] = (() => {
        try { return typeof data.products === 'string' ? JSON.parse(data.products) : (data.products || []) } catch { return [] }
    })().filter(Boolean)

    const SectionHeader = ({ icon, title }: { icon: string; title: string }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <i className={icon} style={{ fontSize: 16, color: 'var(--mui-palette-primary-main)' }} />
            <Typography variant='subtitle2' fontWeight={700} color='text.secondary'>{title}</Typography>
            <Divider sx={{ flex: 1 }} />
        </Box>
    )

    return (
        <Box sx={{ p: 4, bgcolor: 'background.default', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Card variant='outlined' sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
                <CardContent sx={{ p: '24px !important' }}>

                    {/* Header Banner */}
                    <Box sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: `${accent}10`, border: '1px solid', borderColor: `${accent}25` }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                            <Box>
                                <Typography variant='h5' fontWeight={800} sx={{ mb: 0.25 }}>{data.company_name}</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <i className='tabler-user' style={{ fontSize: 13, color: 'var(--mui-palette-text-secondary)' }} />
                                    <Typography variant='body2' color='text.secondary'>
                                        {data.FULL_NAME || data.EMPLOYEE_CODE} · {data.EMPLOYEE_DEPT || ''}
                                    </Typography>
                                </Box>
                            </Box>
                            <Chip
                                label={data.request_status} size='medium'
                                sx={{ fontWeight: 700, fontSize: '0.75rem', bgcolor: `${accent}20`, color: accent, border: '1px solid', borderColor: `${accent}40` }}
                            />
                        </Box>
                    </Box>

                    {/* Request Info Grid */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant='caption' color='text.disabled' fontWeight={600}>Support Process / Product</Typography>
                            <Typography variant='body2' fontWeight={600}>{data.supportProduct_Process || '-'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant='caption' color='text.disabled' fontWeight={600}>Purchase Frequency / Year</Typography>
                            <Typography variant='body2' fontWeight={600}>{data.purchase_frequency || '-'}{' Times / Year'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant='caption' color='text.disabled' fontWeight={600}>PO PIC</Typography>
                            <Typography variant='body2' fontWeight={600}>{data.assign_to || '-'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant='caption' color='text.disabled' fontWeight={600}>Submitted Date</Typography>
                            <Typography variant='body2' fontWeight={600}>
                                {data.CREATE_DATE ? new Date(data.CREATE_DATE).toLocaleDateString('th-TH') : '-'}
                            </Typography>
                        </Grid>
                        {data.requester_remark && (
                            <Grid item xs={12}>
                                <Typography variant='caption' color='text.disabled' fontWeight={600}>Remark</Typography>
                                <Typography variant='body2'>{data.requester_remark}</Typography>
                            </Grid>
                        )}
                    </Grid>

                    {/* Vendor Info */}
                    <Box sx={{ mb: 4 }}>
                        <SectionHeader icon='tabler-building-store' title='Vendor Info' />
                        <Grid container spacing={2}>
                            {[
                                { label: 'Vendor Type', value: data.vendor_type_name },
                                { label: 'Region', value: data.vendor_region },
                                { label: 'FFT Vendor Code', value: data.fft_vendor_code },
                                { label: 'FFT Status', value: data.fft_status },
                                { label: 'Province', value: data.province },
                                { label: 'Postal Code', value: data.postal_code },
                                { label: 'Tel Center', value: data.tel_center },
                                { label: 'Website', value: data.website },
                                { label: 'Email (Main)', value: data.emailmain },
                            ].map(({ label, value }) => (
                                <Grid item xs={12} sm={6} md={4} key={label}>
                                    <Typography variant='caption' color='text.disabled' fontWeight={600}>{label}</Typography>
                                    <Typography variant='body2' fontWeight={600}>{value || '-'}</Typography>
                                </Grid>
                            ))}
                            {data.address && (
                                <Grid item xs={12}>
                                    <Typography variant='caption' color='text.disabled' fontWeight={600}>Address</Typography>
                                    <Typography variant='body2' fontWeight={600}>{data.address}</Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Box>

                    {/* Contacts */}
                    {contacts.length > 0 && (
                        <Box sx={{ mb: 4 }}>
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

                    {/* Products */}
                    {products.length > 0 && (
                        <Box sx={{ mb: 4 }}>
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

                    {/* Registration Steps Timeline */}
                    <Box sx={{ mb: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                            <i className='tabler-timeline' style={{ fontSize: 16, color: 'var(--mui-palette-primary-main)' }} />
                            <Typography variant='subtitle2' fontWeight={700} color='text.secondary'>Registration Steps</Typography>
                            <Divider sx={{ flex: 1 }} />
                        </Box>
                        <StatusTimeline
                            status={data.request_status}
                            approvalSteps={data.approval_steps}
                            approvalLogs={data.approval_logs}
                        />
                    </Box>

                    {/* Attached Files */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <i className='tabler-paperclip' style={{ fontSize: 16, color: 'var(--mui-palette-primary-main)' }} />
                        <Typography variant='subtitle2' fontWeight={700} color='text.secondary'>Attached Files</Typography>
                        <Divider sx={{ flex: 1 }} />
                        <Button size='small' variant='tonal'
                            startIcon={<i className='tabler-folder-open' style={{ fontSize: 16 }} />}
                            onClick={() => setFileDialogOpen(true)}
                            disabled={files.length === 0}
                        >
                            {files.length === 0 ? 'No Files' : `View ${files.length} File${files.length > 1 ? 's' : ''}`}
                        </Button>
                    </Box>

                    {files.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                            {files.map((f, i) => (
                                <Chip key={i} label={f.name} size='small' variant='outlined'
                                    icon={<i className='tabler-file' style={{ fontSize: 14 }} />}
                                    onClick={() => window.open(f.url, '_blank')}
                                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                                />
                            ))}
                        </Box>
                    )}
                </CardContent>
            </Card>

            <FileViewerDialog open={fileDialogOpen} files={files} onClose={() => setFileDialogOpen(false)} />
        </Box>
    )
}


// ─────────────────────────────────────────────────────────────────────────────
// Main SearchResult Component
// ─────────────────────────────────────────────────────────────────────────────
export default function SearchResult() {
    const { getValues, setValue } = useFormContext<RequestHistoryFormData>()
    const { isEnableFetching, setIsEnableFetching } = useDxContext()
    const { data: statusOptions = [] } = useRequestStatusOptions()

    const [totalCount, setTotalCount] = useState(0)
    const gridApiRef = useRef<any>(null)

    // ── Server-Side Datasource ────────────────────────────────────────────────
    const datasource = useMemo<IServerSideDatasource>(() => ({
        getRows: async (params) => {
            const f = getValues('searchFilters')
            const { startRow, endRow } = params.request
            const order = params.request.sortModel?.length > 0
                ? params.request.sortModel.map((s: any) => ({ id: s.colId, desc: s.sort === 'desc' }))
                : [{ id: 'request_id', desc: true }]
            try {
                const res = await RegisterRequestServices.getAll({
                    Request_By_EmployeeCode: getUserData()?.EMPLOYEE_CODE || '',
                    SearchFilters: [
                        { id: 'company_name', value: f.vendor_name || null },
                        { id: 'request_status', value: f.overall_status?.value || null }
                    ].filter((x: any) => x.value !== null && x.value !== ''),
                    ColumnFilters: [],
                    Order: order,
                    Start: startRow ?? 0,
                    Limit: (endRow ?? 50) - (startRow ?? 0)
                })
                if (res.data?.Status) {
                    setTotalCount(res.data.TotalCountOnDb)
                    params.success({ rowData: res.data.ResultOnDb, rowCount: res.data.TotalCountOnDb })
                } else {
                    params.fail()
                }
            } catch {
                params.fail()
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), []) // getValues is a stable ref — no need to re-create datasource

    // Trigger refresh when Search / Clear button sets isEnableFetching = true
    useEffect(() => {
        if (isEnableFetching && gridApiRef.current) {
            setIsEnableFetching(false)
            gridApiRef.current.refreshServerSide({ purge: true })
        }
    }, [isEnableFetching, setIsEnableFetching])

    // ── Column / Grid State Persistence ──────────────────────────────────────
    const savedGridState = useMemo(() => getValues('searchResults.agGridState'), []) // eslint-disable-line react-hooks/exhaustive-deps

    const handleStateUpdated = useCallback((e: StateUpdatedEvent) => {
        setValue('searchResults.agGridState', e.state)
    }, [setValue])

    const colDefs = useMemo<ColDef[]>(() => [
        {
            field: 'request_status',
            headerName: 'Status',
            flex: 1.2,
            minWidth: 210,
            cellRenderer: (params: any) => {
                if (!params.value) return null
                const chipColor = (statusOptions.find(s => s.value === params.value)?.chipColor || 'default') as any
                return (
                    <Chip
                        label={params.value}
                        color={chipColor}
                        size='small'
                        variant='tonal'
                        sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                    />
                )
            }
        },
        {
            field: 'company_name',
            headerName: 'Company Name',
            flex: 1.5,
            minWidth: 220,
            cellRenderer: 'agGroupCellRenderer'
        },
        {
            field: 'supportProduct_Process',
            headerName: 'Support Product / Process',
            flex: 1,
            minWidth: 150
        },
        {
            field: 'purchase_frequency',
            headerName: 'Purchase Freqency',
            flex: 0.9,
            minWidth: 130
        },
        {
            field: 'FULL_NAME',
            headerName: 'Submitted By Employee Name',
            flex: 1.2,
            minWidth: 200,
            valueGetter: p => p.data?.FULL_NAME || p.data?.EMPLOYEE_CODE || '-'
        },
        {
            field: 'EMPLOYEE_CODE',
            headerName: 'Employee Code',
            flex: 0.8,
            minWidth: 130
        },
        {
            field: 'assign_to',
            headerName: 'PO PIC',
            flex: 1,
            minWidth: 150
        },
        {
            field: 'documents',
            headerName: 'Files',
            flex: 0.6,
            minWidth: 90,
            cellRenderer: (params: any) => {
                const count = buildFileUrls(params.value).length
                if (count === 0) return <Typography variant='caption' color='text.disabled'>—</Typography>
                return (
                    <Chip
                        label={`${count} file${count > 1 ? 's' : ''}`}
                        size='small'
                        color='primary'
                        variant='tonal'
                        icon={<i className='tabler-paperclip' style={{ fontSize: 13 }} />}
                    />
                )
            }
        },
        {
            field: 'CREATE_DATE',
            headerName: 'Submitted Date',
            flex: 1,
            minWidth: 140,
            valueFormatter: p => p.value ? new Date(p.value).toLocaleDateString('th-TH') : '-'
        }
    ], [statusOptions])

    return (
        <Grid container spacing={6}>
            {/* Summary Chips */}
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: 2 }}>
                                <i className='tabler-history' style={{ fontSize: 22, color: 'var(--mui-palette-primary-main)' }} />
                                <Typography variant='h6'>My Registration Requests</Typography>
                            </Box>
                            <Divider orientation='vertical' flexItem />
                            <StatusSummaryChip label='All' count={totalCount} color='info' />
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            {/* AG Grid */}
            <Grid item xs={12}>
                <Card>
                    <CardContent sx={{ p: '24px !important' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                            <Typography variant='subtitle1' fontWeight={700}>
                                Results ({totalCount})
                            </Typography>
                            <Button
                                size='small'
                                variant='tonal'
                                startIcon={<i className='tabler-refresh' style={{ fontSize: 16 }} />}
                                onClick={() => gridApiRef.current?.refreshServerSide({ purge: true })}
                            >
                                Refresh
                            </Button>
                        </Box>

                        <DxAGgridTable
                            columnDefs={colDefs}
                            serverSideDatasource={datasource}
                            height={600}
                            masterDetail={true}
                            detailCellRenderer={DetailRenderer}
                            detailRowAutoHeight={true}
                            getRowId={(p: any) => String(p.data.request_id ?? p.data.vendor_id ?? p.rowIndex)}
                            onGridReady={(p: any) => { gridApiRef.current = p.api }}
                            initialState={savedGridState}
                            onStateUpdated={handleStateUpdated}
                        />
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    )
}
