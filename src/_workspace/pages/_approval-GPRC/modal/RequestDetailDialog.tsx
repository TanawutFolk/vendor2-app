import { forwardRef, useEffect, useMemo, useState } from 'react'
import type { ReactNode, Ref } from 'react'
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Slide,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material'
import type { SlideProps } from '@mui/material'
import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import CustomTextField from '@components/mui/TextField'
import ApprovalQueueServices from '@_workspace/services/_approval-queue/ApprovalQueueServices'

const API_BASE = import.meta.env?.VITE_API_URL || ''

const Transition = forwardRef(function Transition(
    props: SlideProps & { children?: ReactNode },
    ref: Ref<unknown>
) {
    return <Slide direction='down' ref={ref} {...props} />
})

type FileItem = {
    key: string
    name: string
    path: string
    source: string
    criteriaNo?: string
    criteria?: string
}

interface RequestDetailDialogProps {
    open: boolean
    requestId: number | null
    fallbackRow?: Record<string, unknown> | null
    onClose: () => void
}

const safeParseArray = <T,>(input: unknown): T[] => {
    if (Array.isArray(input)) return input as T[]
    if (!input) return []

    try {
        const parsed = typeof input === 'string' ? JSON.parse(input) : input

        return Array.isArray(parsed) ? parsed as T[] : []
    } catch {
        return []
    }
}

const getValue = (data: Record<string, unknown> | null, fallback: Record<string, unknown> | null, ...keys: string[]) => {
    for (const key of keys) {
        const value = data?.[key] ?? fallback?.[key]
        if (value !== null && value !== undefined && String(value).trim() !== '') return String(value)
    }

    return '-'
}

const buildFileUrl = (path: string) => `${API_BASE}/uploads/documents/${path}`

const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'tabler-photo'
    if (ext === 'pdf') return 'tabler-file-type-pdf'
    if (['xls', 'xlsx'].includes(ext || '')) return 'tabler-file-type-xls'
    if (['doc', 'docx'].includes(ext || '')) return 'tabler-file-type-doc'

    return 'tabler-file'
}

const SectionHeader = ({ icon, title }: { icon: string; title: string }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <i className={icon} style={{ fontSize: 18, color: 'var(--mui-palette-primary-main)' }} />
        <Typography variant='subtitle1' fontWeight={700}>{title}</Typography>
        <Divider sx={{ flex: 1 }} />
    </Box>
)

const ReadOnlyField = ({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) => (
    <CustomTextField
        fullWidth
        disabled
        label={label}
        value={value || '-'}
        multiline={multiline}
        minRows={multiline ? 2 : undefined}
    />
)

const InfoItem = ({ label, value }: { label: string; value: unknown }) => (
    <Box>
        <Typography variant='caption' color='text.disabled' fontWeight={600}>
            {label}
        </Typography>
        <Typography variant='body2' fontWeight={600} sx={{ wordBreak: 'break-word' }}>
            {String(value || '-')}
        </Typography>
    </Box>
)

export default function RequestDetailDialog({
    open,
    requestId,
    fallbackRow,
    onClose,
}: RequestDetailDialogProps) {
    const [detail, setDetail] = useState<Record<string, unknown> | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!open || !requestId) {
            setDetail(null)
            setError(null)

            return
        }

        let active = true
        setLoading(true)
        setError(null)

        ApprovalQueueServices.getById(requestId)
            .then(response => {
                if (!active) return

                const payload = response.data
                if (!payload.Status) {
                    setError(payload.Message || 'Failed to load request detail')
                    setDetail(null)

                    return
                }

                setDetail(payload.ResultOnDb && typeof payload.ResultOnDb === 'object'
                    ? payload.ResultOnDb as Record<string, unknown>
                    : null
                )
            })
            .catch((loadError: unknown) => {
                if (!active) return
                setError(loadError instanceof Error ? loadError.message : 'Failed to load request detail')
                setDetail(null)
            })
            .finally(() => {
                if (active) setLoading(false)
            })

        return () => {
            active = false
        }
    }, [open, requestId])

    const contacts = useMemo(() => safeParseArray<Record<string, unknown>>(detail?.contacts), [detail?.contacts])
    const products = useMemo(() => safeParseArray<Record<string, unknown>>(detail?.products), [detail?.products])
    const files = useMemo(() => {
        const fileMap = new Map<string, FileItem>()
        const documents = safeParseArray<Record<string, unknown>>(detail?.documents)
        const gprCriteria = safeParseArray<Record<string, unknown>>(detail?.gpr_criteria)

        documents.forEach((document, index) => {
            const path = String(document.file_path || '').trim()
            if (!path) return

            fileMap.set(`document:${path}`, {
                key: `document:${path}:${index}`,
                name: String(document.file_name || path),
                path,
                source: 'Register Document',
            })
        })

        gprCriteria.forEach((criteria, index) => {
            const path = String(criteria.uploaded_file || criteria.uploaded_file_path || '').trim()
            if (!path) return

            fileMap.set(`gpr:${path}`, {
                key: `gpr:${path}:${index}`,
                name: String(criteria.uploaded_name || path),
                path,
                source: 'GPR B Upload',
                criteriaNo: String(criteria.no || criteria.criteria_no || ''),
                criteria: String(criteria.criteria || criteria.criteria_value || ''),
            })
        })

        return Array.from(fileMap.values())
    }, [detail?.documents, detail?.gpr_criteria])

    const requestNumber = getValue(detail, fallbackRow || null, 'request_number', 'REQUEST_NUMBER')

    return (
        <Dialog
            maxWidth='md'
            fullWidth
            open={open}
            TransitionComponent={Transition}
            onClose={(_event, reason) => {
                if (reason !== 'backdropClick') onClose()
            }}
            sx={{
                '& .MuiDialog-paper': { overflow: 'visible' },
                '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' },
            }}
        >
            <DialogTitle>
                <Stack direction='row' spacing={2} alignItems='center' justifyContent='space-between' sx={{ pr: 10 }}>
                    <Typography variant='h5' component='span'>
                        Request Detail
                    </Typography>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant='caption' color='text.disabled' fontWeight={600}>
                            Register Selection
                        </Typography>
                        <Typography variant='body2' fontWeight={700}>
                            {requestNumber}
                        </Typography>
                    </Box>
                </Stack>
                <DialogCloseButton onClick={onClose} disableRipple>
                    <i className='tabler-x' />
                </DialogCloseButton>
            </DialogTitle>
            <DialogContent dividers>
                {loading ? (
                    <Box sx={{ py: 10, display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity='error'>{error}</Alert>
                ) : (
                    <Stack spacing={5}>
                        <Box>
                            <SectionHeader icon='tabler-clipboard-text' title='Registration Information' />
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={4}>
                                    <ReadOnlyField label='Request No.' value={requestNumber} />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <ReadOnlyField label='Status' value={getValue(detail, fallbackRow || null, 'request_status')} />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <ReadOnlyField label='Requester' value={getValue(detail, fallbackRow || null, 'FULL_NAME', 'EMPLOYEE_CODE')} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <ReadOnlyField label='Support Product / Process' value={getValue(detail, fallbackRow || null, 'supportProduct_Process')} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <ReadOnlyField label='Purchase Frequency' value={getValue(detail, fallbackRow || null, 'purchase_frequency')} />
                                </Grid>
                                <Grid item xs={12}>
                                    <ReadOnlyField label='Requester Remark' value={getValue(detail, fallbackRow || null, 'requester_remark')} multiline />
                                </Grid>
                            </Grid>
                        </Box>

                        <Box>
                            <SectionHeader icon='tabler-building-store' title='Vendor Info' />
                            <Grid container spacing={2}>
                                {[
                                    { label: 'Vendor Name', value: getValue(detail, fallbackRow || null, 'company_name') },
                                    { label: 'Vendor Type', value: getValue(detail, fallbackRow || null, 'vendor_type_name') },
                                    { label: 'Region', value: getValue(detail, fallbackRow || null, 'vendor_region') },
                                    { label: 'FFT Vendor Code', value: getValue(detail, fallbackRow || null, 'fft_vendor_code') },
                                    { label: 'Province', value: getValue(detail, fallbackRow || null, 'province') },
                                    { label: 'Postal Code', value: getValue(detail, fallbackRow || null, 'postal_code') },
                                    { label: 'Tel Center', value: getValue(detail, fallbackRow || null, 'tel_center') },
                                    { label: 'Website', value: getValue(detail, fallbackRow || null, 'website') },
                                    { label: 'Email (Main)', value: getValue(detail, fallbackRow || null, 'emailmain') },
                                ].map(item => (
                                    <Grid item xs={12} sm={6} md={4} key={item.label}>
                                        <InfoItem label={item.label} value={item.value} />
                                    </Grid>
                                ))}
                                <Grid item xs={12}>
                                    <InfoItem label='Address' value={getValue(detail, fallbackRow || null, 'address')} />
                                </Grid>
                            </Grid>
                        </Box>

                        <Box>
                            <SectionHeader icon='tabler-users' title={`Contacts (${contacts.length})`} />
                            {contacts.length === 0 ? (
                                <Typography color='text.secondary'>No contact information.</Typography>
                            ) : (
                                <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 2fr', px: 2, py: 1, bgcolor: 'action.hover' }}>
                                        {['Name', 'Tel', 'Position', 'Email'].map(header => (
                                            <Typography key={header} variant='caption' fontWeight={700} color='text.secondary'>
                                                {header}
                                            </Typography>
                                        ))}
                                    </Box>
                                    {contacts.map((contact, index) => (
                                        <Box
                                            key={`${contact.contact_name || 'contact'}-${index}`}
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: '2fr 1.5fr 1fr 2fr',
                                                px: 2,
                                                py: 1.25,
                                                borderTop: '1px solid',
                                                borderColor: 'divider',
                                                '&:hover': { bgcolor: 'action.hover' },
                                            }}
                                        >
                                            <Typography variant='body2' fontWeight={600}>{String(contact.contact_name || '-')}</Typography>
                                            <Typography variant='body2' color='text.secondary'>{String(contact.tel_phone || '-')}</Typography>
                                            <Typography variant='body2' color='text.secondary'>{String(contact.position || '-')}</Typography>
                                            <Typography variant='body2' color='text.secondary' sx={{ wordBreak: 'break-all' }}>
                                                {String(contact.email || '-')}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>

                        <Box>
                            <SectionHeader icon='tabler-package' title={`Products (${products.length})`} />
                            {products.length === 0 ? (
                                <Typography color='text.secondary'>No product information.</Typography>
                            ) : (
                                <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 2fr 2fr', px: 2, py: 1, bgcolor: 'action.hover' }}>
                                        {['Group', 'Maker', 'Product Name', 'Model List'].map(header => (
                                            <Typography key={header} variant='caption' fontWeight={700} color='text.secondary'>
                                                {header}
                                            </Typography>
                                        ))}
                                    </Box>
                                    {products.map((product, index) => (
                                        <Box
                                            key={`${product.product_name || 'product'}-${index}`}
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: '1.5fr 1.5fr 2fr 2fr',
                                                px: 2,
                                                py: 1.25,
                                                borderTop: '1px solid',
                                                borderColor: 'divider',
                                                '&:hover': { bgcolor: 'action.hover' },
                                            }}
                                        >
                                            <Typography variant='body2' fontWeight={600}>{String(product.product_group || '-')}</Typography>
                                            <Typography variant='body2' color='text.secondary'>{String(product.maker_name || '-')}</Typography>
                                            <Typography variant='body2' color='text.secondary'>{String(product.product_name || '-')}</Typography>
                                            <Typography variant='body2' color='text.secondary'>{String(product.model_list || '-')}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>

                        <Box>
                            <SectionHeader icon='tabler-paperclip' title='Register / GPR B Uploaded Files' />
                            {files.length === 0 ? (
                                <Typography color='text.secondary'>No uploaded files found.</Typography>
                            ) : (
                                <List disablePadding>
                                    {files.map(file => (
                                        <ListItem
                                            key={file.key}
                                            disablePadding
                                            sx={{
                                                py: 1.5,
                                                px: 2,
                                                mb: 1,
                                                borderRadius: 1,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                '&:hover': { bgcolor: 'action.hover' },
                                            }}
                                            secondaryAction={
                                                <Tooltip title='Open / Download'>
                                                    <IconButton edge='end' size='small' onClick={() => window.open(buildFileUrl(file.path), '_blank')}>
                                                        <i className='tabler-external-link' style={{ fontSize: 18 }} />
                                                    </IconButton>
                                                </Tooltip>
                                            }
                                        >
                                            <ListItemIcon sx={{ minWidth: 42 }}>
                                                <i className={getFileIcon(file.name)} style={{ fontSize: 24, color: 'var(--mui-palette-primary-main)' }} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Stack direction='row' spacing={1} alignItems='center' flexWrap='wrap'>
                                                        <Typography
                                                            variant='body2'
                                                            fontWeight={700}
                                                            color='primary.main'
                                                            sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                                                            onClick={() => window.open(buildFileUrl(file.path), '_blank')}
                                                        >
                                                            {file.name}
                                                        </Typography>
                                                        <Chip size='small' label={file.source} variant='tonal' color={file.source === 'GPR B Upload' ? 'info' : 'secondary'} />
                                                        {file.criteriaNo && <Chip size='small' label={`No. ${file.criteriaNo}`} variant='tonal' color='primary' />}
                                                    </Stack>
                                                }
                                                secondary={file.criteria || undefined}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Box>
                    </Stack>
                )}
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'flex-start' }}>
                <Button variant='tonal' color='secondary' onClick={onClose}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    )
}
