import { useState, useMemo } from 'react'
import {
    Grid, Card, CardContent, Box, Typography, Chip, Divider, Button
} from '@mui/material'

import useRequestStatusOptions from '@_workspace/react-query/hooks/useRequestStatusOptions'
import { formatFftStatus } from '@_workspace/utils/fftStatus'
import StatusTimeline from '../StatusTimeline'

import { buildFileUrls } from './shared'
import FileViewerDialog from './FileViewerDialog'

const DetailRenderer = ({ data }: { data: any }) => {
    const [fileDialogOpen, setFileDialogOpen] = useState(false)
    const { data: statusOptions = [] } = useRequestStatusOptions()
    const files = buildFileUrls(data?.DOCUMENTS, String(data?.REQUEST_NUMBER || ''))
    const approvalSteps = useMemo(() => {
        try {
            return typeof data?.APPROVAL_STEPS === 'string' ? JSON.parse(data.APPROVAL_STEPS) : (data?.APPROVAL_STEPS || [])
        } catch {
            return []
        }
    }, [data?.APPROVAL_STEPS])
    const approvalLogs = useMemo(() => {
        try {
            return typeof data?.APPROVAL_LOGS === 'string' ? JSON.parse(data.APPROVAL_LOGS) : (data?.APPROVAL_LOGS || [])
        } catch {
            return []
        }
    }, [data?.APPROVAL_LOGS])
    const workflowSteps = useMemo(() => {
        try {
            const approvalSteps = typeof data.APPROVAL_STEPS === 'string' ? JSON.parse(data.APPROVAL_STEPS) : (data.APPROVAL_STEPS || [])
            if (approvalSteps.length > 0) return []
        } catch { /* ignore */ }

        const submitted = { title: 'Request Submitted', status: 'completed' as const, step: 0, description: '' }
        let currentStepIndex = -1
        if (data.REQUEST_STATUS !== 'Rejected') {
            const normalizeStr = (str?: string | null) => (str || '').replace(/\s+/g, '').toLowerCase()
            if (normalizeStr(data.REQUEST_STATUS).includes('senttopo')) currentStepIndex = 0
            else currentStepIndex = statusOptions.findIndex((s: any) => normalizeStr(s.value) === normalizeStr(data.REQUEST_STATUS))
        }

        const s = statusOptions
            .filter((s: any) => s.value !== 'Rejected')
            .map((s: any, idx: number) => {
                let stepState: any = 'pending'
                if (data.REQUEST_STATUS !== 'Rejected' && currentStepIndex >= 0) {
                    if (idx + 1 <= currentStepIndex) stepState = 'completed'
                    else if (idx + 1 === currentStepIndex + 1) stepState = 'in_progress'
                }
                return { title: s.label, status: stepState, step: idx + 1, description: '' }
            })
        return [submitted, ...s]
    }, [statusOptions, data.REQUEST_STATUS, data.APPROVAL_STEPS])

    if (!data) return null

    const contacts: any[] = (() => {
        try { return typeof data.CONTACTS === 'string' ? JSON.parse(data.CONTACTS) : (data.CONTACTS || []) } catch { return [] }
    })().filter(Boolean)

    const products: any[] = (() => {
        try { return typeof data.PRODUCTS === 'string' ? JSON.parse(data.PRODUCTS) : (data.PRODUCTS || []) } catch { return [] }
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
                                <Typography variant='h5' fontWeight={800} sx={{ mb: 0.25 }}>{data.COMPANY_NAME}</Typography>
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
                                    {data.REQUEST_STATUS || '-'}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Request Info Grid */}
                    <SectionHeader icon='tabler-building-store' title='Request Info' />
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant='caption' color='text.disabled' fontWeight={600}>Support Process / Product</Typography>
                            <Typography variant='body2' fontWeight={600}>{data.SUPPORTPRODUCT_PROCESS || '-'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant='caption' color='text.disabled' fontWeight={600}>Purchase Frequency / Year</Typography>
                            <Typography variant='body2' fontWeight={600}>{data.PURCHASE_FREQUENCY || '-'}{' Times / Year'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant='caption' color='text.disabled' fontWeight={600}>PO PIC</Typography>
                            <Typography variant='body2' fontWeight={600}>{data.ASSIGN_TO || '-'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant='caption' color='text.disabled' fontWeight={600}>Submitted Date</Typography>
                            <Typography variant='body2' fontWeight={600}>
                                {data.CREATE_DATE ? new Date(data.CREATE_DATE).toLocaleDateString('th-TH') : '-'}
                            </Typography>
                        </Grid>
                        {data.REQUESTER_REMARK && (
                            <Grid item xs={12}>
                                <Typography variant='caption' color='text.disabled' fontWeight={600}>Remark</Typography>
                                <Typography variant='body2'>{data.REQUESTER_REMARK}</Typography>
                            </Grid>
                        )}
                    </Grid>

                    {/* Attached Files */}
                    <Box sx={{ mb: 4 }}>
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
                    </Box>

                    {/* Vendor Info */}
                    <Box sx={{ mb: 4 }}>
                        <SectionHeader icon='tabler-building-store' title='Vendor Info' />
                        <Grid container spacing={2}>
                            {[
                                { label: 'Company Name', value: data.COMPANY_NAME },
                                { label: 'Vendor Type', value: data.VENDOR_TYPE_NAME },
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
                                    <Typography variant='body2' fontWeight={600}>{value || '-'}</Typography>
                                </Grid>
                            ))}
                            {data.ADDRESS && (
                                <Grid item xs={12}>
                                    <Typography variant='caption' color='text.disabled' fontWeight={600}>Address</Typography>
                                    <Typography variant='body2' fontWeight={600}>{data.ADDRESS}</Typography>
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
                                        <Typography variant='body2' fontWeight={600}>{c.CONTACT_NAME || '-'}</Typography>
                                        <Typography variant='body2' color='text.secondary'>{c.TEL_PHONE || '-'}</Typography>
                                        <Typography variant='body2' color='text.secondary'>{c.POSITION || '-'}</Typography>
                                        <Typography variant='body2' color='text.secondary' sx={{ wordBreak: 'break-all' }}>{c.EMAIL || '-'}</Typography>
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
                                        <Typography variant='body2' fontWeight={600}>{p.PRODUCT_GROUP || '-'}</Typography>
                                        <Typography variant='body2' color='text.secondary'>{p.MAKER_NAME || '-'}</Typography>
                                        <Typography variant='body2' color='text.secondary'>{p.PRODUCT_NAME || '-'}</Typography>
                                        <Typography variant='body2' color='text.secondary'>{p.MODEL_LIST || '-'}</Typography>
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

                    {/* Attached Files
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
                    </Box> */}

                </CardContent>
            </Card>

            <FileViewerDialog open={fileDialogOpen} files={files} onClose={() => setFileDialogOpen(false)} />
        </Box>
    )
}


// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
// Main SearchResult Component
// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬

export default DetailRenderer
