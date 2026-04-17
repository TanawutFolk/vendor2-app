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

// Services
import RegisterRequestServices from '@_workspace/services/_register-request/RegisterRequestServices'

// Utils
import { getUserData } from '@/utils/user-profile/userLoginProfile'

// React Hook Form
import { useFormContext } from 'react-hook-form'
import type { RequestHistoryFormData } from './validateSchema'

// Context
import { useDxContext } from '@/_template/DxContextProvider'

import useRequestStatusOptions from '@_workspace/react-query/useRequestStatusOptions'
import StatusTimeline from './StatusTimeline'

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
                    <Box sx={{ p: 3, mb: 3, borderRadius: 1, bgcolor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.1)', border: '1px solid', borderColor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.25)' }}>
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
                                label={data.request_status} size='medium' color='primary' variant='tonal'
                                sx={{ fontWeight: 700, fontSize: '0.75rem' }}
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
                            steps={workflowSteps}
                            approvalSteps={(() => {
                                try { return typeof data.approval_steps === 'string' ? JSON.parse(data.approval_steps) : (data.approval_steps || []) } catch { return [] }
                            })()}
                            approvalLogs={(() => {
                                try { return typeof data.approval_logs === 'string' ? JSON.parse(data.approval_logs) : (data.approval_logs || []) } catch { return [] }
                            })()}
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
import { useQueryClient } from '@tanstack/react-query'
import { PREFIX_QUERY_KEY } from '@_workspace/react-query/hooks/vendor/useRequestHistory'

export default function SearchResult() {
    const { getValues, setValue } = useFormContext<RequestHistoryFormData>()
    const { isEnableFetching, setIsEnableFetching } = useDxContext()
    const { data: statusOptions = [] } = useRequestStatusOptions()
    const queryClient = useQueryClient()

    const [totalCount, setTotalCount] = useState(0)
    const gridApiRef = useRef<any>(null)

    // ── Dialog State ─────────────────────────────────────────────────────────
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [selectedData, setSelectedData] = useState<any>(null)

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
                    queryFn: () => RegisterRequestServices.getAll(payload),
                    staleTime: 0 // Fetch fresh data for the grid always
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
            headerName: '',
            field: 'view',
            width: 50,
            pinned: 'left',
            cellRenderer: (params: any) => (
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
            )
        },
        {
            field: 'request_status',
            headerName: 'Status',
            flex: 1.2,
            minWidth: 230,
            cellRenderer: 'agGroupCellRenderer',
            cellRendererParams: {
                innerRenderer: (params: any) => {
                    const statusCfg = statusOptions.find(s => s.value === params.value)
                    const bgColor = statusCfg?.accent ? `${statusCfg.accent}20` : '#8A8D9920'
                    const txtColor = statusCfg?.accent || '#8A8D99'
                    return (
                        <Chip label={params.value || '-'} size='small'
                            sx={{
                                bgcolor: bgColor,
                                color: txtColor,
                                border: '1px solid',
                                borderColor: `${txtColor}40`,
                                fontWeight: 700,
                                fontSize: '0.72rem',
                                height: 24
                            }}
                        />
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
    ], [statusOptions])

    return (
        <Grid container spacing={6}>


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
        </Grid>
    )
}
