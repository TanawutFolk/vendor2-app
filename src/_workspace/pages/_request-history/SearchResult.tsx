// React Imports
import { useMemo, useState } from 'react'

// MUI Imports
import {
    Grid, Card, CardContent, Box, Typography, Chip, Divider,
    IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
    Button, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material'

// AG Grid Imports
import type { ColDef, IServerSideDatasource } from 'ag-grid-community'
import DxAGgridTable from '@/_template/DxAGgridTable'

import type { ReactElement, Ref } from 'react'
import { forwardRef } from 'react'
import { Slide } from '@mui/material'
import type { SlideProps } from '@mui/material'

const Transition = forwardRef(function Transition(
    props: SlideProps & { children?: ReactElement<any, any> },
    ref: Ref<unknown>
) {
    return <Slide direction='down' ref={ref} {...props} />
})

import DialogCloseButton from '@components/dialogs/DialogCloseButton'

import ApprovalQueueServices from '@_workspace/services/_approval-queue/ApprovalQueueServices'

// Utils
import { getUserData } from '@/utils/user-profile/userLoginProfile'

// React Hook Form
import { useFormContext } from 'react-hook-form'
import type { RequestHistoryFormData } from './validateSchema'

// Context
import { useDxContext } from '@/_template/DxContextProvider'
import useDxServerSideGrid from '@_workspace/hooks/useDxServerSideGrid'

import useRequestStatusOptions from '@_workspace/react-query/useRequestStatusOptions'
import StatusTimeline from './StatusTimeline'
import SearchResultCard from '@_workspace/components/search/SearchResultCard'
import GprCNotificationDialog from './modal/GprCNotificationDialog'

// React Query
import { useQueryClient } from '@tanstack/react-query'
import { PREFIX_QUERY_KEY } from '@_workspace/react-query/hooks/vendor/useRequestHistory'
import { isIssueGprCStep } from '@_workspace/utils/requestWorkflow'
import { formatFftStatus } from '@_workspace/utils/fftStatus'


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
// File Viewer Dialog
// ─────────────────────────────────────────────────────────────────────────────
const parseGprCCircularList = (raw: unknown): unknown[] => {
    try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw

        return Array.isArray(parsed) ? parsed.filter(Boolean) : []
    } catch {
        return []
    }
}

const hasCompletedGprCSetup = (row: Record<string, unknown>) => {
    const hasText = (value: unknown) => String(value || '').trim().length > 0

    return (
        hasText(row?.gpr_c_approver_name) &&
        hasText(row?.gpr_c_approver_email) &&
        hasText(row?.gpr_c_pc_pic_name) &&
        hasText(row?.gpr_c_pc_pic_email) &&
        parseGprCCircularList(row?.gpr_c_circular_json).length > 0
    )
}

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
        <Dialog
            maxWidth='sm'
            fullWidth={true}
            onClose={(event, reason) => {
                if (reason !== 'backdropClick') {
                    onClose()
                }
            }}
            TransitionComponent={Transition}
            open={open}
            sx={{
                '& .MuiDialog-paper': { overflow: 'visible' },
                '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
            }}
        >
            <DialogTitle>
                <Typography variant='h5' component='span'>Attached Files ({files.length})</Typography>
                <DialogCloseButton onClick={onClose} disableRipple>
                    <i className='tabler-x' />
                </DialogCloseButton>
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
                                    py: 1.5, px: 2, mb: 1, borderRadius: 1,
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
            <DialogActions sx={{ justifyContent: 'flex-start' }}>
                <Button onClick={onClose} variant='tonal' color='secondary'>Close</Button>
            </DialogActions>
        </Dialog>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Master-Detail Renderer
// ─────────────────────────────────────────────────────────────────────────────
const DetailRenderer = ({ data }: { data: any }) => {
    const [fileDialogOpen, setFileDialogOpen] = useState(false)
    const { data: statusOptions = [] } = useRequestStatusOptions()
    const files = buildFileUrls(data?.documents)
    const approvalSteps = useMemo(() => {
        try {
            return typeof data?.approval_steps === 'string' ? JSON.parse(data.approval_steps) : (data?.approval_steps || [])
        } catch {
            return []
        }
    }, [data?.approval_steps])
    const approvalLogs = useMemo(() => {
        try {
            return typeof data?.approval_logs === 'string' ? JSON.parse(data.approval_logs) : (data?.approval_logs || [])
        } catch {
            return []
        }
    }, [data?.approval_logs])
    const workflowSteps = useMemo(() => {
        try {
            const approvalSteps = typeof data.approval_steps === 'string' ? JSON.parse(data.approval_steps) : (data.approval_steps || [])
            if (approvalSteps.length > 0) return []
        } catch { /* ignore */ }

        const submitted = { title: 'Request Submitted', status: 'completed' as const, step: 0, description: '' }
        let currentStepIndex = -1
        if (data.request_status !== 'Rejected') {
            const normalizeStr = (str?: string | null) => (str || '').replace(/\s+/g, '').toLowerCase()
            if (normalizeStr(data.request_status).includes('senttopo')) currentStepIndex = 0
            else currentStepIndex = statusOptions.findIndex((s: any) => normalizeStr(s.value) === normalizeStr(data.request_status))
        }

        const s = statusOptions
            .filter((s: any) => s.value !== 'Rejected')
            .map((s: any, idx: number) => {
                let stepState: any = 'pending'
                if (data.request_status !== 'Rejected' && currentStepIndex >= 0) {
                    if (idx + 1 <= currentStepIndex) stepState = 'completed'
                    else if (idx + 1 === currentStepIndex + 1) stepState = 'in_progress'
                }
                return { title: s.label, status: stepState, step: idx + 1, description: '' }
            })
        return [submitted, ...s]
    }, [statusOptions, data.request_status, data.approval_steps])

    if (!data) return null

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
                    <Box sx={{ p: 3, mb: 3, borderRadius: 1, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                            <Box>
                                <Typography variant='h5' fontWeight={800} sx={{ mb: 0.25 }}>{data.company_name}</Typography>
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
                                <Typography variant='caption' fontWeight={700} color='text.secondary' sx={{ lineHeight: 1.2 }}>
                                    {data.request_status || '-'}
                                </Typography>
                            </Box>
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
                                { label: 'Company Name', value: data.company_name },
                                { label: 'Vendor Type', value: data.vendor_type_name },
                                { label: 'Region', value: data.vendor_region },
                                { label: 'FFT Vendor Code', value: data.fft_vendor_code },
                                { label: 'FFT Status', value: formatFftStatus(data.fft_status) },
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
                
                            <Typography variant='subtitle2' fontWeight={700} color='text.secondary'>Registration Steps</Typography>
                            <Divider sx={{ flex: 1 }} />
                        </Box>
                        <StatusTimeline
                            steps={workflowSteps}
                            approvalSteps={approvalSteps}
                            approvalLogs={approvalLogs}
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
    const queryClient = useQueryClient()

    const [totalCount, setTotalCount] = useState(0)
    const { savedGridState, handleGridReady, handleStateUpdated, refreshServerSide } = useDxServerSideGrid({
        getValues,
        setValue,
        isEnableFetching,
        setIsEnableFetching,
        lockedLeftColIds: ['view', 'request_number']
    })

    // ── Dialog State ─────────────────────────────────────────────────────────
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [selectedData, setSelectedData] = useState<any>(null)

    // ── GPR C Notification Dialog State ──────────────────────────────────────
    const [gprCOpen, setGprCOpen] = useState(false)
    const [gprCRowData, setGprCRowData] = useState<any>(null)

    const currentUserCode = String(getUserData()?.EMPLOYEE_CODE || '').trim()

    // ── Server-Side Datasource ────────────────────────────────────────────────
    const datasource = useMemo<IServerSideDatasource>(() => ({
        getRows: async (params) => {
            const f = getValues('searchFilters')
            const { startRow, endRow } = params.request
            const order = params.request.sortModel?.length > 0
                ? params.request.sortModel.map((s: any) => ({ id: s.colId, desc: s.sort === 'desc' }))
                : [{ id: 'request_id', desc: true }]
            try {
                const payload = {
                    Request_By_EmployeeCode: getUserData()?.EMPLOYEE_CODE || '',
                    SearchFilters: [
                        { id: 'company_name', value: f.vendor_name || null },
                        { id: 'request_status', value: f.overall_status?.value || null }
                    ].filter((x: any) => x.value !== null && x.value !== ''),
                    ColumnFilters: [],
                    Order: order,
                    Start: startRow ?? 0,
                    Limit: (endRow ?? 50) - (startRow ?? 0)
                }

                // Fetch using React Query client to integrate with devtools and app-wide caching invalidation
                const res = await queryClient.fetchQuery({
                    queryKey: [PREFIX_QUERY_KEY, payload],
                    queryFn: () => ApprovalQueueServices.getAll(payload),
                    staleTime: 0 // Fetch fresh data for the grid always
                })

                if (res.data?.Status) {
                    const rowData = (res.data.ResultOnDb || []).map((row: any) => ({
                        ...row,
                        request_id: row.request_id ?? row.REQUEST_REGISTER_VENDOR_ID,
                        request_number: row.request_number ?? row.REQUEST_NUMBER,
                        vendor_id: row.vendor_id ?? row.VENDORS_ID,
                        request_status: row.request_status ?? row.REQUEST_STATUS,
                        supportProduct_Process: row.supportProduct_Process ?? row.SUPPORTPRODUCT_PROCESS,
                        purchase_frequency: row.purchase_frequency ?? row.PURCHASE_FREQUENCY,
                        requester_remark: row.requester_remark ?? row.REQUESTER_REMARK,
                        approver_remark: row.approver_remark ?? row.APPROVER_REMARK,
                        approve_by: row.approve_by ?? row.APPROVE_BY,
                        approve_date: row.approve_date ?? row.APPROVE_DATE,
                        vendor_code: row.vendor_code ?? row.VENDOR_CODE,
                        assign_to: row.assign_to ?? row.ASSIGN_TO,
                        PIC_Email: row.PIC_Email ?? row.PIC_EMAIL,
                        vendor_contact_id: row.vendor_contact_id ?? row.VENDOR_CONTACTS_ID,
                        Request_By_EmployeeCode: row.Request_By_EmployeeCode ?? row.REQUEST_BY_EMPLOYEECODE ?? row.EMPLOYEE_CODE,
                        gpr_c_approver_name: row.gpr_c_approver_name ?? row.GPR_C_APPROVER_NAME,
                        gpr_c_approver_email: row.gpr_c_approver_email ?? row.GPR_C_APPROVER_EMAIL,
                        gpr_c_pc_pic_name: row.gpr_c_pc_pic_name ?? row.GPR_C_PC_PIC_NAME,
                        gpr_c_pc_pic_email: row.gpr_c_pc_pic_email ?? row.GPR_C_PC_PIC_EMAIL,
                        gpr_c_circular_json: row.gpr_c_circular_json ?? row.GPR_C_CIRCULAR_JSON,
                        action_required_json: row.action_required_json ?? row.ACTION_REQUIRED_JSON,
                        gpr_43_acceptance_status: row.gpr_43_acceptance_status ?? row.GPR_43_ACCEPTANCE_STATUS,
                        company_name: row.company_name ?? row.COMPANY_NAME,
                        fft_vendor_code: row.fft_vendor_code ?? row.FFT_VENDOR_CODE,
                        fft_status: row.fft_status ?? row.FFT_STATUS,
                        vendor_region: row.vendor_region ?? row.VENDOR_REGION,
                        province: row.province ?? row.PROVINCE,
                        postal_code: row.postal_code ?? row.POSTAL_CODE,
                        address: row.address ?? row.ADDRESS,
                        tel_center: row.tel_center ?? row.TEL_CENTER,
                        website: row.website ?? row.WEBSITE,
                        emailmain: row.emailmain ?? row.EMAILMAIN,
                    }))
                    setTotalCount(res.data.TotalCountOnDb)
                    params.success({ rowData, rowCount: res.data.TotalCountOnDb })
                } else {
                    params.fail()
                }
            } catch {
                params.fail()
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), []) // getValues is a stable ref — no need to re-create datasource

    // ── Column / Grid State Persistence ──────────────────────────────────────
    const colDefs = useMemo<ColDef[]>(() => [
        {
            headerName: 'Actions',
            field: 'view',
            width: 110,
            pinned: 'left',
            lockPinned: true,
            suppressMovable: true,
            cellRenderer: (params: any) => {
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Tooltip title='View Details'>
                            <IconButton
                                size='small'
                                color='primary'
                                onClick={() => {
                                    setSelectedData(params.data)
                                    setDrawerOpen(true)
                                }}
                            >
                                <i className='tabler-eye' style={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )
            }
        },
        {
            field: 'request_number',
            headerName: 'Request Number',
            width: 170,
            pinned: 'left',
            lockPinned: true,
            suppressMovable: true,
            valueGetter: params => params.data?.request_number || params.data?.request_id || '-'
        },
        {
            headerName: 'Require Action',
            field: 'require_action',
            width: 160,
            pinned: 'left',
            sortable: false,
            filter: false,
            cellRenderer: (params: any) => {
                const rowRequesterCode = String(
                    params.data?.Request_By_EmployeeCode
                    || params.data?.request_by_employeecode
                    || params.data?.request_by_employee_code
                    || params.data?.EMPLOYEE_CODE
                    || ''
                ).trim()
                const isRequester = !!rowRequesterCode && rowRequesterCode === currentUserCode

                // Check if current step is GPR C (from approval_steps or request_status)
                let inGprCStep = false
                try {
                    const approvalSteps = typeof params.data?.approval_steps === 'string'
                        ? JSON.parse(params.data.approval_steps)
                        : (params.data?.approval_steps || [])
                    const currentStep = approvalSteps.find((s: any) => s.STEP_STATUS === 'in_progress')
                    if (currentStep) {
                        inGprCStep = isIssueGprCStep(currentStep)
                    } else {
                        // Fallback: check request_status text
                        const statusNorm = String(params.data?.request_status || '').replace(/[_-]+/g, ' ').toLowerCase()
                        inGprCStep = statusNorm.includes('issue gpr c')
                    }
                } catch {
                    const statusNorm = String(params.data?.request_status || '').replace(/[_-]+/g, ' ').toLowerCase()
                    inGprCStep = statusNorm.includes('issue gpr c')
                }

                if (!inGprCStep || !isRequester) {
                    return <Typography variant='caption' color='text.disabled'>—</Typography>
                }

                if (hasCompletedGprCSetup(params.data)) {
                    return <Typography variant='caption' color='text.disabled'>Setup completed</Typography>
                }

                return (
                    <Tooltip title='Fill in GPR C Approver & Circular list'>
                        <Chip
                            label='GPR C Setup'
                            size='small'
                            onClick={() => {
                                setGprCRowData(params.data)
                                setGprCOpen(true)
                            }}
                            sx={{
                                cursor: 'pointer',
                                bgcolor: '#fff3e0',
                                color: '#e65100',
                                border: '1px solid #ffcc80',
                                fontWeight: 700,
                                fontSize: '0.72rem',
                                height: 24,
                                '& .MuiChip-icon': { color: '#e65100' },
                                '&:hover': { bgcolor: '#ffe0b2' },
                            }}
                        />
                    </Tooltip>
                )
            }
        },

        {
            field: 'request_status',
            headerName: 'Status',
            flex: 1.2,
            minWidth: 230,
            cellRenderer: 'agGroupCellRenderer',
            cellRendererParams: {
                innerRenderer: (params: any) => {
                    return (
                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                maxWidth: '100%',
                                px: 1.25,
                                py: 0.35,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                                bgcolor: 'transparent',
                            }}
                        >
                            <Typography variant='caption' fontWeight={700} color='text.secondary' noWrap>
                                {params.value || '-'}
                            </Typography>
                        </Box>
                    )
                }
            }
        },
        {
            field: 'company_name',
            headerName: 'Company Name',
            flex: 1.5,
            minWidth: 220
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
                    <Chip label={`${count} file${count > 1 ? 's' : ''}`} size='small'
                        icon={<i className='tabler-paperclip' style={{ fontSize: 13, color: '#1976d2' }} />}
                        sx={{
                            bgcolor: '#1976d220',
                            color: '#1976d2',
                            border: '1px solid #1976d240',
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            height: 24,
                            '& .MuiChip-icon': { color: '#1976d2' }
                        }}
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
    ], [currentUserCode])

    return (
        <Grid container spacing={6}>

            {/* AG Grid */}
            <Grid item xs={12}>
                <SearchResultCard>
                    <CardContent sx={{ p: '24px !important' }}>
                        <DxAGgridTable
                            columnDefs={colDefs}
                            serverSideDatasource={datasource}
                            height={600}
                            masterDetail={true}
                            detailCellRenderer={DetailRenderer}
                            detailRowAutoHeight={true}
                            getRowId={(p: any) => String(p.data.request_id ?? p.data.REQUEST_REGISTER_VENDOR_ID ?? p.data.vendor_id ?? p.data.VENDORS_ID ?? p.rowIndex)}
                            onGridReady={handleGridReady}
                            initialState={savedGridState}
                            onStateUpdated={handleStateUpdated}
                            overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No request history found</span>'
                        />
                    </CardContent>
                </SearchResultCard>
            </Grid>

            {/* View Detail Dialog */}
            <Dialog
                maxWidth='md'
                fullWidth={true}
                onClose={(event, reason) => {
                    if (reason !== 'backdropClick') {
                        setDrawerOpen(false)
                    }
                }}
                TransitionComponent={Transition}
                open={drawerOpen}
                scroll='paper'
                sx={{
                    '& .MuiDialog-paper': { overflow: 'visible' },
                    '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
                }}
            >
                <DialogTitle>
                    <Typography variant='h5' component='span'>Request Details</Typography>
                    <DialogCloseButton onClick={() => setDrawerOpen(false)} disableRipple>
                        <i className='tabler-x' />
                    </DialogCloseButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0, bgcolor: 'background.default' }}>
                    {selectedData && <DetailRenderer data={selectedData} />}
                </DialogContent>
            </Dialog>

            {/* GPR C Notification Dialog — Requester Action only */}
            <GprCNotificationDialog
                open={gprCOpen}
                rowData={gprCRowData}
                onClose={() => setGprCOpen(false)}
                onSaved={() => {
                    setGprCOpen(false)
                    refreshServerSide()
                }}
            />
        </Grid>
    )
}

