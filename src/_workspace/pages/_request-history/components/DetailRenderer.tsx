import { useState, useMemo } from 'react'
import { Grid, Card, CardContent, Box, Typography, Chip, Button } from '@mui/material'

import { DetailCard, EmptyState, ReadOnlyField, RecordCard, SectionHeader } from '@components/detail-view'

import useRequestStatusOptions from '@_workspace/react-query/hooks/useRequestStatusOptions'
import { formatFftStatus } from '@_workspace/utils/fftStatus'
import { getChipSx, getReadableStatusTone } from '@_workspace/utils/statusChipStyles'
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

    const isOversea = data.VENDOR_REGION === 'Oversea'

    return (
        <Box sx={{ p: 4, bgcolor: 'background.default', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Card variant='outlined' sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
                <CardContent sx={{ p: '24px !important', display: 'flex', flexDirection: 'column', gap: 3 }}>

                    {/* Header Banner */}
                    <Box
                        sx={{
                            px: 3,
                            py: 2,
                            borderRadius: 1.5,
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 2
                        }}
                    >
                        <Box>
                            <Typography variant='h6' fontWeight={800}>{data.COMPANY_NAME || '-'}</Typography>
                            <Typography variant='caption' color='text.disabled'>
                                {data.REQUEST_NUMBER || '-'}
                            </Typography>
                        </Box>
                        <Chip
                            size='small'
                            label={data.REQUEST_STATUS || '-'}
                            sx={getChipSx(getReadableStatusTone(data.REQUEST_STATUS), { fontWeight: 700 })}
                        />
                    </Box>

                    {/* Request Info */}
                    <Box>
                        <SectionHeader
                            icon='tabler-clipboard-list'
                            title='Request Info'
                            action={
                                <Button
                                    size='small'
                                    variant='tonal'
                                    startIcon={<i className='tabler-folder-open' style={{ fontSize: 16 }} />}
                                    onClick={() => setFileDialogOpen(true)}
                                    disabled={files.length === 0}
                                >
                                    {files.length === 0 ? 'No Files' : `View ${files.length} File${files.length > 1 ? 's' : ''}`}
                                </Button>
                            }
                        />
                        <DetailCard>
                            <Grid container spacing={4}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <ReadOnlyField label='Support Process / Product' value={data.SUPPORTPRODUCT_PROCESS} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <ReadOnlyField
                                        label='Purchase Frequency / Year'
                                        value={data.PURCHASE_FREQUENCY ? `${data.PURCHASE_FREQUENCY} Times / Year` : ''}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <ReadOnlyField label='PO PIC' value={data.ASSIGN_TO} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <ReadOnlyField
                                        label='Submitted Date'
                                        value={data.CREATE_DATE ? new Date(data.CREATE_DATE).toLocaleDateString('th-TH') : ''}
                                    />
                                </Grid>
                                {data.REQUESTER_REMARK && (
                                    <Grid item xs={12}>
                                        <ReadOnlyField label='Remark' value={data.REQUESTER_REMARK} multiline />
                                    </Grid>
                                )}
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: files.length > 0 ? 1.25 : 0 }}>
                                        <i className='tabler-paperclip' style={{ fontSize: 15, color: 'var(--mui-palette-primary-main)' }} />
                                        <Typography variant='body2' fontWeight={600}>Attached Files</Typography>
                                        <Typography variant='caption' color='text.secondary'>Total Documents: {files.length}</Typography>
                                    </Box>
                                    {files.length > 0 ? (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {files.map((f, i) => (
                                                <Chip
                                                    key={i}
                                                    label={f.name}
                                                    size='small'
                                                    variant='outlined'
                                                    icon={<i className='tabler-file' style={{ fontSize: 14 }} />}
                                                    onClick={() => window.open(f.url, '_blank')}
                                                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                                                />
                                            ))}
                                        </Box>
                                    ) : (
                                        <Typography variant='caption' color='text.secondary'>No attached files</Typography>
                                    )}
                                </Grid>
                            </Grid>
                        </DetailCard>
                    </Box>

                    {/* Vendor Info */}
                    <Box>
                        <SectionHeader icon='tabler-building-store' title='Vendor Info' />
                        <DetailCard>
                            <Grid container spacing={4}>
                                <Grid item xs={12} md={6}>
                                    <ReadOnlyField label='Company Name' value={data.COMPANY_NAME} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <ReadOnlyField label='Vendor Type' value={data.VENDOR_TYPE_NAME} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Box>
                                        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                                            Vendor Region
                                        </Typography>
                                        <Chip
                                            label={isOversea ? 'Oversea' : 'Local'}
                                            color={isOversea ? 'info' : 'success'}
                                            size='small'
                                            variant='tonal'
                                            sx={{ fontWeight: 600 }}
                                        />
                                    </Box>
                                </Grid>
                                {isOversea ? (
                                    <Grid item xs={12} md={6}>
                                        <ReadOnlyField label='Country' value={data.COUNTRY} />
                                    </Grid>
                                ) : (
                                    <>
                                        <Grid item xs={6} md={3}>
                                            <ReadOnlyField label='Province' value={data.PROVINCE} />
                                        </Grid>
                                        <Grid item xs={6} md={3}>
                                            <ReadOnlyField label='Postal Code' value={data.POSTAL_CODE} />
                                        </Grid>
                                    </>
                                )}
                                <Grid item xs={6} md={3}>
                                    <ReadOnlyField label='FFT Vendor Code' value={data.FFT_VENDOR_CODE} />
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <ReadOnlyField label='FFT Status' value={formatFftStatus(data.FFT_STATUS)} />
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <ReadOnlyField label='Tel Center' value={data.TEL_CENTER} />
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <ReadOnlyField label='Website' value={data.WEBSITE} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <ReadOnlyField label='Email (Main)' value={data.EMAILMAIN} />
                                </Grid>
                                <Grid item xs={12}>
                                    <ReadOnlyField label='Address' value={data.ADDRESS} multiline />
                                </Grid>
                            </Grid>
                        </DetailCard>
                    </Box>

                    {/* Contacts */}
                    <Box>
                        <SectionHeader icon='tabler-users' title={`Contacts (${contacts.length})`} />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {contacts.length === 0 ? (
                                <EmptyState message='No contacts' />
                            ) : contacts.map((c, i) => (
                                <RecordCard key={i} index={i} title='Contact Info'>
                                    <Grid item xs={12} sm={6}>
                                        <ReadOnlyField label='Name' value={c.CONTACT_NAME} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <ReadOnlyField label='Phone' value={c.TEL_PHONE} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <ReadOnlyField label='Email' value={c.EMAIL} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <ReadOnlyField label='Position' value={c.POSITION} />
                                    </Grid>
                                </RecordCard>
                            ))}
                        </Box>
                    </Box>

                    {/* Products */}
                    <Box>
                        <SectionHeader icon='tabler-package' title={`Products (${products.length})`} />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {products.length === 0 ? (
                                <EmptyState message='No products' />
                            ) : products.map((p, i) => (
                                <RecordCard key={i} index={i} title='Product'>
                                    <Grid item xs={12} sm={6}>
                                        <ReadOnlyField label='Product Group' value={p.PRODUCT_GROUP} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <ReadOnlyField label='Maker' value={p.MAKER_NAME} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <ReadOnlyField label='Product Name' value={p.PRODUCT_NAME} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <ReadOnlyField label='Model List' value={p.MODEL_LIST} multiline />
                                    </Grid>
                                </RecordCard>
                            ))}
                        </Box>
                    </Box>

                    {/* Registration Steps Timeline */}
                    <Box>
                        <SectionHeader icon='tabler-list-check' title='Registration Steps' />
                        <StatusTimeline
                            steps={workflowSteps}
                            approvalSteps={approvalSteps}
                            approvalLogs={approvalLogs}
                        />
                    </Box>

                </CardContent>
            </Card>

            <FileViewerDialog open={fileDialogOpen} files={files} onClose={() => setFileDialogOpen(false)} />
        </Box>
    )
}

export default DetailRenderer
