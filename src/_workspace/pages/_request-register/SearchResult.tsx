// React Imports
import { useMemo, useState, useEffect, useCallback } from 'react'

// MUI Imports
import {
    Grid, Card, CardContent, Box, Typography, Chip, Divider,
    IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
    Button, List, ListItem, ListItemIcon, ListItemText, CircularProgress,
    TextField, Alert
} from '@mui/material'

// AG Grid Imports
import type { ColDef } from 'ag-grid-community'
import 'ag-grid-enterprise'
import DxAGgridTable from '@/_template/DxAGgridTable'

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

const buildFileUrls = (documents: any): { name: string; url: string }[] => {
    try {
        const docs = typeof documents === 'string' ? JSON.parse(documents) : (documents || [])
        return docs.filter(Boolean).map((d: any) => ({
            name: d.file_name || d.file_path || 'Unnamed File',
            url: `${API_BASE}/uploads/documents/${d.file_path}`
        }))
    } catch { return [] }
}

const statusAccent: Record<string, string> = {
    Approved: '#28C76F',
    Pending: '#FF9F43',
    Rejected: '#EA5455',
}

const statusColor = (status: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    const s = (status || '').toLowerCase()
    if (s === 'approved') return 'success'
    if (s === 'pending') return 'warning'
    if (s === 'rejected') return 'error'
    return 'default'
}

// ─────────────────────────────────────────────────────────────────────────────
// Status Summary Chip
// ─────────────────────────────────────────────────────────────────────────────
const StatusSummaryChip = ({ label, count, color }: {
    label: string; count: number; color: 'success' | 'warning' | 'default' | 'error' | 'info'
}) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip label={`${count}`} color={color} size='small' variant='tonal' sx={{ minWidth: 28 }} />
        <Typography variant='body2' color='text.secondary'>{label}</Typography>
    </Box>
)

// ─────────────────────────────────────────────────────────────────────────────
// File Viewer Dialog
// ─────────────────────────────────────────────────────────────────────────────
const FileViewerDialog = ({ open, files, onClose }: {
    open: boolean; files: { name: string; url: string }[]; onClose: () => void
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
                                key={idx} disablePadding
                                sx={{ py: 1.5, px: 2, mb: 1, borderRadius: 2, border: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}
                                secondaryAction={
                                    <Tooltip title='Open / Download'>
                                        <IconButton edge='end' size='small' onClick={() => window.open(file.url, '_blank')} sx={{ color: 'primary.main' }}>
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
                                        <Typography variant='body2' fontWeight={600}
                                            sx={{ cursor: 'pointer', color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}
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
// Approve / Reject Dialog
// ─────────────────────────────────────────────────────────────────────────────
interface ActionDialogProps {
    open: boolean
    mode: 'approve' | 'reject'
    requestId: number | null
    onClose: () => void
    onSuccess: () => void
}

const ActionDialog = ({ open, mode, requestId, onClose, onSuccess }: ActionDialogProps) => {
    const [remark, setRemark] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const user = getUserData()

    const handleSubmit = async () => {
        if (!requestId) return
        setLoading(true)
        setError(null)
        try {
            await RegisterRequestServices.updateStatus({
                request_id: requestId,
                request_status: mode === 'approve' ? 'Approved' : 'Rejected',
                approve_by: user?.EMPLOYEE_CODE || '',
                approver_remark: remark,
                UPDATE_BY: user?.EMPLOYEE_CODE || '',
            })
            setRemark('')
            onSuccess()
            onClose()
        } catch (e: any) {
            setError(e?.message || 'Failed to update status')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <i
                        className={mode === 'approve' ? 'tabler-circle-check' : 'tabler-circle-x'}
                        style={{ fontSize: 22, color: mode === 'approve' ? '#28C76F' : '#EA5455' }}
                    />
                    <Typography variant='h6'>{mode === 'approve' ? 'Approve Request' : 'Reject Request'}</Typography>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                {error && <Alert severity='error' sx={{ mb: 2 }}>{error}</Alert>}
                <TextField
                    fullWidth multiline rows={3}
                    label='Remark / Comment (optional)'
                    placeholder='Enter your remark here...'
                    value={remark}
                    onChange={e => setRemark(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant='tonal' color='secondary' disabled={loading}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant='contained'
                    color={mode === 'approve' ? 'success' : 'error'}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} /> : undefined}
                >
                    {mode === 'approve' ? 'Confirm Approve' : 'Confirm Reject'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Detail Drawer Content
// ─────────────────────────────────────────────────────────────────────────────
interface DetailPanelProps {
    data: any
    onApprove: () => void
    onReject: () => void
    onEmailSent: () => void
}

const DetailPanel = ({ data, onApprove, onReject, onEmailSent }: DetailPanelProps) => {
    const [sendingEmail, setSendingEmail] = useState(false)
    const [emailFeedback, setEmailFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null)
    const [fileDialogOpen, setFileDialogOpen] = useState(false)
    const files = buildFileUrls(data?.documents)
    if (!data) return null

    const handleSendEmail = async () => {
        setSendingEmail(true)
        setEmailFeedback(null)
        try {
            const res = await RegisterRequestServices.sendAgreementEmail(data)
            if (res.data.Status) {
                setEmailFeedback({ type: 'success', msg: res.data.Message })
                onEmailSent()
            } else {
                setEmailFeedback({ type: 'error', msg: res.data.Message })
            }
        } catch (err: any) {
            setEmailFeedback({ type: 'error', msg: err?.response?.data?.Message || 'Failed to send email' })
        } finally {
            setSendingEmail(false)
        }
    }

    const accent = statusAccent[data.request_status] || '#8A8D99'
    const isPending = data.request_status === 'Pending'

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

    return (
        <Box sx={{ p: 3, overflowY: 'auto', height: '100%' }}>

            {/* Header Banner */}
            <Box sx={{ p: 2.5, mb: 3, borderRadius: 2, bgcolor: `${accent}10`, border: '1px solid', borderColor: `${accent}25` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5 }}>
                    <Box>
                        <Typography variant='h6' fontWeight={800}>{data.company_name}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
                            <i className='tabler-user' style={{ fontSize: 13, color: 'var(--mui-palette-text-secondary)' }} />
                            <Typography variant='body2' color='text.secondary'>
                                {data.FULL_NAME || data.EMPLOYEE_CODE}
                                {data.EMPLOYEE_DEPT ? ` · ${data.EMPLOYEE_DEPT}` : ''}
                            </Typography>
                        </Box>
                    </Box>
                    <Chip label={data.request_status} size='medium'
                        sx={{ fontWeight: 700, bgcolor: `${accent}20`, color: accent, border: '1px solid', borderColor: `${accent}40` }}
                    />
                </Box>
            </Box>

            {/* Request Info */}
            <Box sx={{ mb: 3 }}>
                <SectionHeader icon='tabler-clipboard-list' title='Request Info' />
                {infoRow('Support Product / Process', data.supportProduct_Process)}
                {infoRow('Purchase Frequency', data.purchase_frequency)}
                {infoRow('Assigned To (PIC)', data.assign_to)}
                {infoRow('Submitted Date', data.CREATE_DATE ? new Date(data.CREATE_DATE).toLocaleDateString('th-TH') : '-')}
                {data.requester_remark && infoRow('Requester Remark', data.requester_remark)}
            </Box>

            {/* Vendor Info */}
            <Box sx={{ mb: 3 }}>
                <SectionHeader icon='tabler-building-store' title='Vendor Info' />
                {infoRow('Vendor Type', data.vendor_type_name)}
                {infoRow('Region', data.vendor_region)}
                {infoRow('FFT Vendor Code', data.fft_vendor_code)}
                {infoRow('FFT Status', data.fft_status)}
                {infoRow('Address', data.address)}
                {infoRow('Province', data.province)}
                {infoRow('Postal Code', data.postal_code)}
                {infoRow('Tel Center', data.tel_center)}
                {infoRow('Website', data.website)}
                {infoRow('Email (Main)', data.emailmain)}
            </Box>

            {/* Contacts */}
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

            {/* Products */}
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

            {/* Decision Info */}
            {(data.approve_by || data.approver_remark) && (
                <Box sx={{ mb: 3 }}>
                    <SectionHeader icon='tabler-user-check' title='Decision Info' />
                    {infoRow('Approved / Rejected By', data.approve_by)}
                    {infoRow('Approval Date', data.approve_date ? new Date(data.approve_date).toLocaleDateString('th-TH') : '-')}
                    {infoRow('Approver Remark', data.approver_remark)}
                </Box>
            )}

            {/* Attached Files */}
            <Box sx={{ mb: 3 }}>
                <SectionHeader icon='tabler-paperclip' title='Attached Files' />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant='caption' color='text.secondary'>Total Documents: {files.length}</Typography>
                    <Button size='small' variant='tonal'
                        startIcon={<i className='tabler-folder-open' style={{ fontSize: 14 }} />}
                        onClick={() => setFileDialogOpen(true)}
                        disabled={files.length === 0}
                    >
                        View Files
                    </Button>
                </Box>
                {files.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {files.map((f, i) => (
                            <Chip key={i} label={f.name} size='small' variant='outlined'
                                icon={<i className='tabler-file' style={{ fontSize: 14 }} />}
                                onClick={() => window.open(f.url, '_blank')}
                                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                            />
                        ))}
                    </Box>
                )}
            </Box>

            {/* Email Agreement Section (Pending only) */}
            {isPending && (
                <Box sx={{
                    mb: 3, p: 2, borderRadius: 2,
                    bgcolor: (theme: any) => theme.palette.mode === 'light' ? 'primary.light' : 'rgba(115, 103, 240, 0.12)',
                    border: '1px dashed', borderColor: 'primary.main',
                    display: 'flex', flexDirection: 'column', gap: 1.5
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i className='tabler-mail-fast' style={{ fontSize: 20, color: 'var(--mui-palette-primary-main)' }} />
                        <Typography variant='subtitle2' fontWeight={700}>Vendor Agreement Email</Typography>
                    </Box>
                    <Typography variant='caption' color='text.secondary'>
                        ส่งอีเมลแจ้งรายละเอียดเงื่อนไขและขอเอกสารไปยัง Vendor ({data.emailmain || 'No Email'})
                    </Typography>

                    {emailFeedback && (
                        <Alert severity={emailFeedback.type} sx={{ py: 0, '& .MuiAlert-message': { fontSize: '0.75rem' } }}>
                            {emailFeedback.msg}
                        </Alert>
                    )}

                    <Button
                        variant='contained' color='primary' fullWidth size='small'
                        startIcon={sendingEmail ? <CircularProgress size={16} color='inherit' /> : <i className='tabler-send' style={{ fontSize: 16 }} />}
                        onClick={handleSendEmail}
                        disabled={sendingEmail || !data.emailmain}
                    >
                        {sendingEmail ? 'Sending...' : 'Send Agreement Email'}
                    </Button>
                </Box>
            )}

            {/* Approve / Reject Buttons (Pending only) */}
            {isPending && (
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button variant='contained' color='success' fullWidth
                        startIcon={<i className='tabler-circle-check' style={{ fontSize: 18 }} />}
                        onClick={onApprove}
                    >Approve</Button>
                    <Button variant='contained' color='error' fullWidth
                        startIcon={<i className='tabler-circle-x' style={{ fontSize: 18 }} />}
                        onClick={onReject}
                    >Reject</Button>
                </Box>
            )}

            <FileViewerDialog open={fileDialogOpen} files={files} onClose={() => setFileDialogOpen(false)} />
        </Box>
    )
}


// ─────────────────────────────────────────────────────────────────────────────
// Main SearchResult Component
// ─────────────────────────────────────────────────────────────────────────────
interface SearchResultProps {
    activeFilters: SearchFilterValues
}

export default function SearchResult({ activeFilters }: SearchResultProps) {
    const [rows, setRows] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    // Drawer state
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [selectedData, setSelectedData] = useState<any | null>(null)

    // Action dialog state
    const [actionMode, setActionMode] = useState<'approve' | 'reject'>('approve')
    const [actionDialogOpen, setActionDialogOpen] = useState(false)

    const user = getUserData()
    const empCode = user?.EMPLOYEE_CODE || ''

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await RegisterRequestServices.getAll({ assign_to: empCode })
            setRows(res.data?.ResultOnDb || [])
        } catch (err) {
            console.error('Failed to load assigned requests:', err)
        } finally {
            setLoading(false)
        }
    }, [empCode])

    useEffect(() => { fetchData() }, [fetchData])

    // Client-side filter from SearchFilter
    const filtered = useMemo(() => {
        return rows.filter(r => {
            const matchName = !activeFilters.vendor_name ||
                (r.company_name || '').toLowerCase().includes(activeFilters.vendor_name.toLowerCase())
            const matchBy = !activeFilters.submitted_by ||
                (r.FULL_NAME || r.EMPLOYEE_CODE || '').toLowerCase().includes(activeFilters.submitted_by.toLowerCase())
            const matchStatus = !activeFilters.overall_status ||
                r.request_status === activeFilters.overall_status.value
            return matchName && matchBy && matchStatus
        })
    }, [rows, activeFilters])

    const countByStatus = (status: string) => rows.filter(r => r.request_status === status).length

    const colDefs = useMemo<ColDef[]>(() => [
        {
            headerName: '',
            field: 'request_id',
            width: 68,
            pinned: 'left',
            sortable: false,
            filter: false,
            cellRenderer: (params: any) => (
                <IconButton size='small' color='primary'
                    onClick={() => { setSelectedData(params.data); setDrawerOpen(true) }}
                >
                    <i className='tabler-eye' style={{ fontSize: 18 }} />
                </IconButton>
            ),
            cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' }
        },
        {
            field: 'request_status',
            headerName: 'Status',
            width: 130,
            cellRenderer: (params: any) => (
                <Chip label={params.value || '-'} color={statusColor(params.value)} size='small' variant='tonal'
                    sx={{ fontWeight: 700, fontSize: '0.72rem', height: 24, mt: 1 }}
                />
            )
        },
        { field: 'company_name', headerName: 'Company Name', flex: 1.5, minWidth: 210, cellRenderer: 'agGroupCellRenderer' },
        { field: 'supportProduct_Process', headerName: 'Support Product / Process', flex: 1, minWidth: 180 },
        { field: 'purchase_frequency', headerName: 'Purchase Frequency', width: 170 },
        {
            field: 'FULL_NAME',
            headerName: 'Submitted By',
            flex: 1,
            minWidth: 170,
            valueGetter: (p: any) => p.data?.FULL_NAME || p.data?.EMPLOYEE_CODE || '-'
        },
        {
            field: 'documents',
            headerName: 'Files',
            width: 100,
            cellRenderer: (params: any) => {
                const count = buildFileUrls(params.value).length
                if (count === 0) return <Typography variant='caption' color='text.disabled'>—</Typography>
                return (
                    <Chip label={`${count} file${count > 1 ? 's' : ''}`} size='small' color='primary' variant='tonal'
                        icon={<i className='tabler-paperclip' style={{ fontSize: 13 }} />}
                    />
                )
            }
        },
        {
            field: 'CREATE_DATE',
            headerName: 'Submitted Date',
            width: 150,
            valueFormatter: (p: any) => p.value ? new Date(p.value).toLocaleDateString('th-TH') : '-'
        }
    ], [])

    const defaultColDef = useMemo<ColDef>(() => ({ resizable: true, sortable: true }), [])

    const handleActionSuccess = () => {
        fetchData()
        setDrawerOpen(false)
        setSelectedData(null)
    }

    return (
        <Grid container spacing={6}>

            {/* Summary Chips */}
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: 2 }}>
                                <i className='tabler-clipboard-list' style={{ fontSize: 22, color: 'var(--mui-palette-primary-main)' }} />
                                <Box>
                                    <Typography variant='h6'>My Assigned Requests</Typography>
                                    <Typography variant='caption' color='text.secondary'>Assigned to: <strong>{empCode}</strong></Typography>
                                </Box>
                            </Box>
                            <Divider orientation='vertical' flexItem />
                            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                                <StatusSummaryChip label='All' count={rows.length} color='info' />
                                <StatusSummaryChip label='Pending' count={countByStatus('Pending')} color='warning' />
                                <StatusSummaryChip label='Approved' count={countByStatus('Approved')} color='success' />
                                <StatusSummaryChip label='Rejected' count={countByStatus('Rejected')} color='error' />
                            </Box>
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
                                <DxAGgridTable
                                    rowData={filtered}
                                    columnDefs={colDefs}
                                    defaultColDef={defaultColDef}
                                    masterDetail={true}
                                    detailRowAutoHeight={true}
                                    domLayout='normal'
                                    pagination={true}
                                    paginationPageSize={20}
                                    paginationPageSizeSelector={[10, 20, 50, 100]}
                                    animateRows={true}
                                    overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No assigned requests found</span>'
                                />
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Grid>

            {/* Request Detail Modal */}
            <Dialog
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                aria-labelledby='detail-dialog-title'
                maxWidth='sm'
                fullWidth
                PaperProps={{ sx: { m: 2, borderRadius: 2 } }}
            >
                {selectedData && (
                    <>
                        <DialogTitle
                            id='detail-dialog-title'
                            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}
                        >
                            <Typography variant='h6' fontWeight={700}>Request Details</Typography>
                            <IconButton size='small' onClick={() => setDrawerOpen(false)}>
                                <i className='tabler-x' style={{ fontSize: 18 }} />
                            </IconButton>
                        </DialogTitle>

                        <DialogContent dividers sx={{ p: 0 }}>
                            <DetailPanel
                                data={selectedData}
                                onApprove={() => { setActionMode('approve'); setActionDialogOpen(true) }}
                                onReject={() => { setActionMode('reject'); setActionDialogOpen(true) }}
                                onEmailSent={() => fetchData()}
                            />
                        </DialogContent>
                    </>
                )}
            </Dialog>

            {/* Approve / Reject Dialog */}
            <ActionDialog
                open={actionDialogOpen}
                mode={actionMode}
                requestId={selectedData?.request_id || null}
                onClose={() => setActionDialogOpen(false)}
                onSuccess={handleActionSuccess}
            />
        </Grid>
    )
}
