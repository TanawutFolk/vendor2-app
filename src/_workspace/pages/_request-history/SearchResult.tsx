// React Imports
import { useMemo, useState, useEffect, useCallback } from 'react'

// MUI Imports
import {
    Grid, Card, CardContent, Box, Typography, Chip, Divider,
    IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
    Button, List, ListItem, ListItemIcon, ListItemText, CircularProgress
} from '@mui/material'

// AG Grid Imports
import { AgGridReact } from 'ag-grid-react'
import type { ColDef } from 'ag-grid-community'
import { themeQuartz } from 'ag-grid-community'
import 'ag-grid-enterprise'

// Services
import RegisterRequestServices from '@_workspace/services/_register-request/RegisterRequestServices'

// Utils
import { getUserData } from '@/utils/user-profile/userLoginProfile'

// Types
import type { SearchFilterValues } from './SearchFilter'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const API_BASE = (import.meta as any).env?.VITE_API_URL || ''

// Build accessible file URLs from comma-separated filenames stored in DB
const buildFileUrls = (filePath: string | null): { name: string; url: string }[] => {
    if (!filePath) return []
    return filePath.split(',').map(name => ({
        name: name.trim(),
        url: `${API_BASE}/uploads/documents/${name.trim()}`
    }))
}

const statusAccent: Record<string, string> = {
    Approved: '#28C76F',
    Pending: '#FF9F43',
    Rejected: '#EA5455',
    in_progress: '#FF9F43',
    completed: '#28C76F',
    rejected: '#EA5455',
    pending: '#8A8D99'
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
// Status Timeline Component
// ─────────────────────────────────────────────────────────────────────────────
const StatusTimeline = ({ status }: { status: string }) => {
    // Determine step states based on the single request_status
    let submittedState: 'completed' | 'in_progress' | 'pending' = 'completed'
    let progressState: 'completed' | 'in_progress' | 'pending' | 'rejected' = 'pending'
    let finalState: 'completed' | 'in_progress' | 'pending' | 'rejected' = 'pending'

    const s = status?.toLowerCase()

    if (s === 'pending') {
        progressState = 'in_progress'
    } else if (s === 'in_progress' || s === 'in progress') {
        progressState = 'in_progress'
    } else if (s === 'approved' || s === 'completed') {
        progressState = 'completed'
        finalState = 'completed'
    } else if (s === 'rejected') {
        progressState = 'completed'
        finalState = 'rejected'
    }

    const steps = [
        { title: 'Request Submitted', state: submittedState, icon: 'tabler-file-upload' },
        { title: 'In Review / Progress', state: progressState, icon: 'tabler-user-check' },
        { title: finalState === 'rejected' ? 'Rejected' : 'Approved', state: finalState, icon: finalState === 'rejected' ? 'tabler-x' : 'tabler-check' }
    ]

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative', ml: 1, mt: 2 }}>
            <Box sx={{ position: 'absolute', left: 19, top: 20, bottom: 20, width: 2, bgcolor: 'divider', zIndex: 0 }} />

            {steps.map((step, idx) => {
                const isCompleted = step.state === 'completed'
                const isCurrent = step.state === 'in_progress'
                const isRejected = step.state === 'rejected'

                let color = 'text.disabled'
                let bg = 'action.hover'

                if (isCompleted) {
                    color = 'success.main'
                    bg = 'success.light'
                } else if (isCurrent) {
                    color = 'warning.main'
                    bg = 'warning.light'
                } else if (isRejected) {
                    color = 'error.main'
                    bg = 'error.light'
                }

                return (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, position: 'relative', zIndex: 1, mb: idx === steps.length - 1 ? 0 : 3 }}>
                        <Box sx={{
                            width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            bgcolor: isCompleted || isCurrent || isRejected ? bg : 'background.paper',
                            border: '2px solid',
                            borderColor: isCompleted || isCurrent || isRejected ? 'transparent' : 'divider',
                            boxShadow: isCurrent ? `0 0 0 4px rgba(255, 159, 67, 0.2)` : 'none'
                        }}>
                            <i className={step.icon} style={{ fontSize: 20, color: isCompleted || isCurrent || isRejected ? `var(--mui-palette-${color.replace('.main', '')}-main)` : 'inherit' }} />
                        </Box>
                        <Box sx={{ pt: 1 }}>
                            <Typography variant='subtitle2' fontWeight={isCurrent ? 800 : 600} color={isCurrent || isCompleted || isRejected ? 'text.primary' : 'text.disabled'}>
                                {step.title}
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
    const files = buildFileUrls(data?.File_Path)

    if (!data) return null

    const accent = statusAccent[data.request_status] || '#8A8D99'

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
                            <Typography variant='caption' color='text.disabled' fontWeight={600}>Support Type</Typography>
                            <Typography variant='body2' fontWeight={600}>{data.supportProduct_Process || '-'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant='caption' color='text.disabled' fontWeight={600}>Purchase Frequency</Typography>
                            <Typography variant='body2' fontWeight={600}>{data.purchase_frequency || '-'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant='caption' color='text.disabled' fontWeight={600}>Assigned To</Typography>
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
                        <StatusTimeline status={data.request_status} />
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
// AG Grid Theme
// ─────────────────────────────────────────────────────────────────────────────
const agGridTheme = themeQuartz.withParams({
    spacing: 6,
    columnBorder: { style: 'solid', color: 'rgb(var(--mui-palette-primary-mainChannel) / 0.19)' },
    browserColorScheme: 'inherit',
    backgroundColor: 'var(--mui-palette-background-paper)',
    foregroundColor: 'var(--mui-palette-text-primary)',
    headerBackgroundColor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.12)',
    headerTextColor: 'var(--mui-palette-text-primary)',
    oddRowBackgroundColor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.04)',
    borderColor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.19)',
    rowHoverColor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.08)'
})

// ─────────────────────────────────────────────────────────────────────────────
// Main SearchResult Component
// ─────────────────────────────────────────────────────────────────────────────
interface SearchResultProps {
    activeFilters: SearchFilterValues
}

export default function SearchResult({ activeFilters }: SearchResultProps) {
    const [rows, setRows] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await RegisterRequestServices.getAll({
                Request_By_EmployeeCode: getUserData()?.EMPLOYEE_CODE || ''
            })
            setRows(res.data?.ResultOnDb || [])
        } catch (err) {
            console.error('Failed to load request history:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // Client-side filter on top
    const filtered = useMemo(() => {
        return rows.filter(r => {
            const matchName = !activeFilters.vendor_name || (r.company_name || '').toLowerCase().includes(activeFilters.vendor_name.toLowerCase())
            const matchBy = !activeFilters.submitted_by || (r.FULL_NAME || r.EMPLOYEE_CODE || '').toLowerCase().includes(activeFilters.submitted_by.toLowerCase())
            const matchStatus = !activeFilters.overall_status || r.request_status === activeFilters.overall_status.value
            return matchName && matchBy && matchStatus
        })
    }, [rows, activeFilters])

    const colDefs = useMemo<ColDef[]>(() => [
        {
            field: 'request_status',
            headerName: 'Status',
            flex: 0.9,
            minWidth: 120,
            cellRenderer: (params: any) => {
                const val = params.value
                if (!val) return null
                let color: 'success' | 'warning' | 'error' | 'default' = 'default'
                if (val === 'Approved' || val === 'completed') color = 'success'
                if (val === 'Pending' || val === 'in_progress') color = 'warning'
                if (val === 'Rejected' || val === 'rejected') color = 'error'
                return <Chip label={val} color={color} size='small' variant='tonal' sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
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
            headerName: 'Assigned To',
            flex: 1,
            minWidth: 150
        },
        {
            field: 'File_Path',
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
    ], [])


    const defaultColDef = useMemo<ColDef>(() => ({ resizable: true, sortable: true }), [])

    // Count by status
    const countByStatus = (status: string) => rows.filter(r =>
        r.request_status?.toLowerCase() === status.toLowerCase()
    ).length

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
                            <StatusSummaryChip label='All' count={rows.length} color='info' />
                            <StatusSummaryChip label='Approved' count={countByStatus('Approved')} color='success' />
                            <StatusSummaryChip label='Pending' count={countByStatus('Pending')} color='warning' />
                            <StatusSummaryChip label='Rejected' count={countByStatus('Rejected')} color='error' />
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
                                Results ({filtered.length})
                            </Typography>
                            <Button
                                size='small'
                                variant='tonal'
                                startIcon={loading ? <CircularProgress size={14} /> : <i className='tabler-refresh' style={{ fontSize: 16 }} />}
                                onClick={fetchData}
                                disabled={loading}
                            >
                                Refresh
                            </Button>
                        </Box>

                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <Box sx={{ width: '100%', height: 600 }}>
                                <AgGridReact
                                    rowData={filtered}
                                    columnDefs={colDefs}
                                    defaultColDef={defaultColDef}
                                    theme={agGridTheme}
                                    masterDetail={true}
                                    detailCellRenderer={DetailRenderer}
                                    detailRowAutoHeight={true}
                                    domLayout='normal'
                                    rowSelection='single'
                                />
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    )
}
