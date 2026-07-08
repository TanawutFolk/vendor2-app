import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode, Ref } from 'react'
import {
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
    Slide,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material'
import type { SlideProps } from '@mui/material'
import { ToastMessageError } from '@components/ToastMessage'
import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import { useQuery } from '@tanstack/react-query'
import { requestDetailQueryOptions } from '@_workspace/react-query/hooks/useRegisterRequest'
import RegisterRequestServices from '@_workspace/services/_register-request/RegisterRequestServices'
import { formatFftStatus } from '@_workspace/utils/fftStatus'
import { getChipSx, getReadableStatusTone } from '@_workspace/utils/statusChipStyles'
import FileViewerDialog from './FileViewerDialog'

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
}
interface RequestDetailDialogProps {
    open: boolean
    requestId: number | null
    fallbackRow?: Record<string, unknown> | null
    actionDisabled?: boolean
    onApprove?: () => void
    onReject?: () => void
    onActionRequired?: () => void
    actionRequiredDisabled?: boolean
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

const hasDisplayValue = (value: unknown) => value !== null && value !== undefined && String(value).trim() !== ''

const readValue = (source: Record<string, unknown> | null | undefined, key: string) => {
    if (!source) return undefined

    for (const candidate of [key, key.toUpperCase(), key.toLowerCase()]) {
        const value = source[candidate]
        if (hasDisplayValue(value)) return value
    }

    return undefined
}

const getValue = (data: Record<string, unknown> | null, fallback: Record<string, unknown> | null, ...keys: string[]) => {
    for (const key of keys) {
        const value = readValue(data, key) ?? readValue(fallback, key)
        if (hasDisplayValue(value)) return String(value)
    }

    return '-'
}

const formatDate = (value: unknown, withTime = false) => {
    if (!hasDisplayValue(value) || String(value) === '-') return '-'

    const date = new Date(String(value))
    if (Number.isNaN(date.getTime())) return '-'

    return withTime ? date.toLocaleString('th-TH') : date.toLocaleDateString('th-TH')
}

// Registration documents now live in the request's 02.Request Documents network folder and are
// streamed via the managed download route; legacy bare-filename paths still fall back to /uploads.
const isNetworkStoredPath = (filePath: string) =>
    filePath.includes('02.Request Documents') || filePath.includes('\\') || /^[a-zA-Z]:[\\/]/.test(filePath)

const buildFileUrl = (filePath: string, fileName = '') => {
    if (isNetworkStoredPath(filePath)) {
        const params = new URLSearchParams({ FILE_PATH: filePath, FILE_NAME: fileName })
        return `${API_BASE}/register-request/downloadSelectionDocument?${params.toString()}`
    }
    return `${API_BASE}/uploads/documents/${filePath}`
}

const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'tabler-photo'
    if (ext === 'pdf') return 'tabler-file-type-pdf'
    if (['xls', 'xlsx'].includes(ext || '')) return 'tabler-file-type-xls'
    if (['doc', 'docx'].includes(ext || '')) return 'tabler-file-type-doc'
    if (['zip', 'rar', '7z'].includes(ext || '')) return 'tabler-file-zip'

    return 'tabler-file'
}

const SectionHeader = ({ icon, title }: { icon: string; title: string }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <i className={icon} style={{ fontSize: 16, color: 'var(--mui-palette-primary-main)' }} />
        <Typography variant='subtitle2' fontWeight={700} color='text.secondary'>{title}</Typography>
        <Divider sx={{ flex: 1, minWidth: 0 }} />
    </Box>
)

const InfoItem = ({ label, value }: { label: string; value: unknown }) => (
    <Box>
        <Typography variant='caption' color='text.disabled' fontWeight={600}>
            {label}
        </Typography>
        <Typography variant='body2' fontWeight={600} sx={{ wordBreak: 'break-word' }}>
            {hasDisplayValue(value) ? String(value) : '-'}
        </Typography>
    </Box>
)

const getStepStatusCfg = (status: unknown) => {
    switch (String(status || '').toLowerCase()) {
        case 'approved':
        case 'completed':
            return { label: 'Completed', icon: 'tabler-circle-check-filled', tone: getReadableStatusTone('completed') }
        case 'in_progress':
        case 'current':
            return { label: 'In Progress', icon: 'tabler-clock-play', tone: getReadableStatusTone('in progress') }
        case 'rejected':
            return { label: 'Rejected', icon: 'tabler-circle-x-filled', tone: getReadableStatusTone('rejected') }
        case 'skipped':
            return { label: 'Skipped', icon: 'tabler-circle-minus', tone: getReadableStatusTone('skipped') }
        case 'pending':
        default:
            return { label: 'Waiting', icon: 'tabler-clock', tone: getReadableStatusTone('pending') }
    }
}

const DocumentChips = ({ files, onPreview }: { files: FileItem[]; onPreview: (index: number) => void }) => (
    <Box sx={{ mt: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, mb: files.length > 0 ? 1.25 : 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className='tabler-paperclip' style={{ fontSize: 15, color: 'var(--mui-palette-primary-main)' }} />
                <Typography variant='body2' fontWeight={600}>Attached Files</Typography>
                <Typography variant='caption' color='text.secondary'>Total Documents: {files.length}</Typography>
            </Box>
            <Button
                size='small'
                variant='contained'
                disableElevation
                color='primary'
                startIcon={<i className='tabler-folder-open' style={{ fontSize: 14 }} />}
                onClick={() => onPreview(0)}
                disabled={files.length === 0}
                sx={{ minHeight: 28, fontSize: '0.72rem', px: 1.25, py: 0.35 }}
            >
                View Files
            </Button>
        </Box>
        {files.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {files.map((file, index) => (
                    <Chip
                        key={file.key}
                        label={file.name}
                        size='small'
                        variant='outlined'
                        icon={<i className={getFileIcon(file.name)} style={{ fontSize: 14 }} />}
                        onClick={() => onPreview(index)}
                        sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                    />
                ))}
            </Box>
        ) : (
            <Typography variant='body2' color='text.secondary'>No registration documents found.</Typography>
        )}
    </Box>
)

const readBlobMessage = async (blob: Blob, fallback: string) => {
    try {
        const text = await blob.text()
        if (!text) return fallback

        try {
            const parsed = JSON.parse(text) as { Message?: string; message?: string }
            return parsed.Message || parsed.message || fallback
        } catch {
            return text.length <= 300 ? text : fallback
        }
    } catch {
        return fallback
    }
}

const getServiceErrorMessage = async (error: unknown, fallback: string) => {
    const responseData = (error as { response?: { data?: unknown }; message?: string })?.response?.data

    if (responseData instanceof Blob) return readBlobMessage(responseData, fallback)

    if (responseData && typeof responseData === 'object') {
        const message = (responseData as { Message?: string; message?: string }).Message || (responseData as { Message?: string; message?: string }).message
        if (message) return message
    }

    return error instanceof Error ? error.message : fallback
}

export default function RequestDetailDialog({
    open,
    requestId,
    fallbackRow,
    actionDisabled = false,
    onApprove,
    onReject,
    onActionRequired,
    actionRequiredDisabled = false,
    onClose,
}: RequestDetailDialogProps) {
    const detailQuery = useQuery({
        ...requestDetailQueryOptions(requestId ?? 0),
        enabled: open && !!requestId,
    })
    const detail = (detailQuery.data ?? null) as Record<string, unknown> | null
    const fallback = fallbackRow || null
    const loading = detailQuery.isLoading && !detail

    // Attached Files preview (PDF/image) — same viewer used on the request-register / check-document pages.
    const [previewOpen, setPreviewOpen] = useState(false)
    const [previewIndex, setPreviewIndex] = useState(0)


    // The request detail's APPROVAL_STEPS is the main registration workflow. The GPR C sub-flow
    // (EMR/QMS/PM/PO-Mgr checker+approver chain) lives in its own tables, fetched here separately.
    const gprCFlowQuery = useQuery({
        queryKey: ['REQUEST_REGISTER', 'gprCFlow', requestId ?? 0],
        queryFn: async () => {
            const response = await RegisterRequestServices.gprCGetFlow({ REQUEST_REGISTER_VENDOR_ID: requestId })
            const payload = response.data
            if (!payload?.Status) {
                throw new Error(payload?.Message || 'Failed to load GPR C flow')
            }

            return payload.ResultOnDb as { steps?: unknown } | null
        },
        enabled: open && !!requestId,
        staleTime: 30_000,
    })

    useEffect(() => {
        if (detailQuery.isError) {
            ToastMessageError({ title: 'Request Details', message: detailQuery.error instanceof Error ? detailQuery.error.message : 'Failed to load request detail' })
        }
    }, [detailQuery.isError, detailQuery.error])

    const contacts = useMemo(
        () => safeParseArray<Record<string, unknown>>(detail?.CONTACTS ?? fallback?.CONTACTS),
        [detail?.CONTACTS, fallback?.CONTACTS]
    )
    const products = useMemo(
        () => safeParseArray<Record<string, unknown>>(detail?.PRODUCTS ?? fallback?.PRODUCTS),
        [detail?.PRODUCTS, fallback?.PRODUCTS]
    )
    const gprCFlowSteps = useMemo(
        () => safeParseArray<Record<string, unknown>>((gprCFlowQuery.data as { steps?: unknown } | null)?.steps)
            .filter(Boolean)
            .sort((a, b) => Number(a.STEP_ORDER || 0) - Number(b.STEP_ORDER || 0)),
        [gprCFlowQuery.data]
    )
    const registerDocuments = useMemo(() => {
        const fileMap = new Map<string, FileItem>()
        const documents = safeParseArray<Record<string, unknown>>(detail?.DOCUMENTS ?? fallback?.DOCUMENTS)

        documents.forEach((document, index) => {
            const path = String(document.FILE_PATH || document.file_path || '').trim()
            if (!path) return

            fileMap.set(path, {
                key: `document:${path}:${index}`,
                name: String(document.FILE_NAME || document.file_name || path),
                path,
            })
        })

        return Array.from(fileMap.values())
    }, [detail?.DOCUMENTS, fallback?.DOCUMENTS])

    // Map the attached files to the { name, url } shape the file viewer expects. Memoized so the
    // viewer's selection isn't reset while the user browses between files.
    const previewFiles = useMemo(
        () => registerDocuments.map(file => ({ name: file.name, url: buildFileUrl(file.path, file.name) })),
        [registerDocuments]
    )

    const openPreview = (index: number) => {
        setPreviewIndex(index)
        setPreviewOpen(true)
    }

    const requestNumber = getValue(detail, fallback, 'request_number', 'REQUEST_NUMBER')
    const requestStatus = getValue(detail, fallback, 'request_status', 'REQUEST_STATUS')
    const companyName = getValue(detail, fallback, 'company_name', 'COMPANY_NAME')
    const vendorRegion = getValue(detail, fallback, 'vendor_region', 'VENDOR_REGION')
    const gprBFilePath = getValue(detail, fallback, 'gpr_b_file_path', 'GPR_B_FILE_PATH')
    const gprBFileName = getValue(detail, fallback, 'gpr_b_file_name', 'GPR_B_FILE_NAME')
    const hasGprBFile = gprBFilePath !== '-' && gprBFilePath.trim() !== ''
    const gprBDisplayName = (gprBFileName !== '-' && gprBFileName) || gprBFilePath.split(/[\\/]/).pop() || 'GPR B file'

    // GPR C approvers review the vendor's GPR B response, so jump straight to that section the
    // first time the modal opens (once the detail has loaded).
    const gprBSectionRef = useRef<HTMLDivElement | null>(null)
    const hasScrolledToGprBRef = useRef(false)

    useEffect(() => {
        if (!open) {
            hasScrolledToGprBRef.current = false
            return
        }
        // Wait for both the detail and the GPR C flow (which renders above GPR B) to finish loading
        // so the section positions are settled before we scroll.
        if (loading || gprCFlowQuery.isLoading || hasScrolledToGprBRef.current) return

        const timer = setTimeout(() => {
            if (!gprBSectionRef.current) return
            hasScrolledToGprBRef.current = true
            gprBSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 250)

        return () => clearTimeout(timer)
    }, [open, loading, gprCFlowQuery.isLoading])

    const loadGprBFileBlob = async () => {
        const response = await RegisterRequestServices.downloadSelectionDocument({
            FILE_PATH: gprBFilePath,
            FILE_NAME: gprBFileName !== '-' ? gprBFileName : '',
            REQUEST_NUMBER: requestNumber !== '-' ? requestNumber : '',
        })

        return response.data
    }

    const handleGprBDownload = async () => {
        if (!hasGprBFile) return
        try {
            const blob = await loadGprBFileBlob()
            const url = URL.createObjectURL(blob)
            const anchor = document.createElement('a')
            anchor.href = url
            anchor.download = gprBDisplayName
            anchor.click()
            URL.revokeObjectURL(url)
        } catch (loadError: unknown) {
            const message = await getServiceErrorMessage(loadError, 'Failed to download GPR B file')
            ToastMessageError({ title: 'Download GPR B', message })
        }
    }
    const requestInfoItems = [
        { label: 'Support Product / Process', value: getValue(detail, fallback, 'supportProduct_Process', 'SUPPORTPRODUCT_PROCESS') },
        { label: 'Purchase Frequency', value: getValue(detail, fallback, 'purchase_frequency', 'PURCHASE_FREQUENCY') },
        { label: 'Assigned To (PIC)', value: getValue(detail, fallback, 'assign_to', 'ASSIGN_TO') },
        { label: 'Submitted Date', value: formatDate(getValue(detail, fallback, 'create_date', 'CREATE_DATE')) },
        { label: 'Requester', value: getValue(detail, fallback, 'FULL_NAME', 'REQUESTER_NAME', 'Request_By_EmployeeCode', 'EMPLOYEE_CODE') },
    ]

    const vendorInfoItems = [
        { label: 'Company Name', value: companyName },
        { label: 'Vendor Type', value: getValue(detail, fallback, 'vendor_type_name', 'VENDOR_TYPE_NAME') },
        { label: 'Region', value: vendorRegion },
        { label: 'FFT Vendor Code', value: getValue(detail, fallback, 'fft_vendor_code', 'FFT_VENDOR_CODE') },
        { label: 'FFT Status', value: formatFftStatus(getValue(detail, fallback, 'fft_status', 'FFT_STATUS')) },
        ...(vendorRegion === 'Oversea'
            ? [{ label: 'Country', value: getValue(detail, fallback, 'country', 'COUNTRY') }]
            : [
                { label: 'Province', value: getValue(detail, fallback, 'province', 'PROVINCE') },
                { label: 'Postal Code', value: getValue(detail, fallback, 'postal_code', 'POSTAL_CODE') },
            ]),
        { label: 'Tel Center', value: getValue(detail, fallback, 'tel_center', 'TEL_CENTER') },
        { label: 'Website', value: getValue(detail, fallback, 'website', 'WEBSITE') },
        { label: 'Email (Main)', value: getValue(detail, fallback, 'emailmain', 'EMAILMAIN') },
    ]

    return (
        <>
            <Dialog
            maxWidth='lg'
            fullWidth
            open={open}
            TransitionComponent={Transition}
            onClose={(_event, reason) => {
                if (reason !== 'backdropClick') onClose()
            }}
            sx={{
                '& .MuiDialog-paper': { overflow: 'visible', width: '100%', maxWidth: 1100 },
                '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' },
            }}
        >
            <DialogTitle sx={{ pb: 2 }}>
                <Stack direction='row' spacing={2} alignItems='center' justifyContent='space-between' sx={{ pr: 10 }}>
                    <Typography variant='h5' component='span'>Request Details</Typography>
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
            <DialogContent sx={{ p: 0, bgcolor: 'background.default' }}>
                {loading ? (
                    <Box sx={{ py: 10, display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box sx={{ p: 3 }}>
                        <Box sx={{ p: 2.5, mb: 3, borderRadius: 1, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5 }}>
                                <Box>
                                    <Typography variant='h6' fontWeight={800} sx={{ wordBreak: 'break-word' }}>{companyName}</Typography>
                                    <Typography variant='body2' color='text.secondary' fontWeight={600}>{requestNumber}</Typography>
                                </Box>
                                <Chip
                                    size='small'
                                    label={requestStatus}
                                    sx={getChipSx(getReadableStatusTone(requestStatus), { height: 28, fontSize: '0.78rem' })}
                                />
                            </Box>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <SectionHeader icon='tabler-clipboard-list' title='Request Info' />
                            <Grid container spacing={2}>
                                {requestInfoItems.map(({ label, value }) => (
                                    <Grid item xs={12} sm={6} md={3} key={label}>
                                        <InfoItem label={label} value={value} />
                                    </Grid>
                                ))}
                                {getValue(detail, fallback, 'requester_remark', 'REQUESTER_REMARK') !== '-' && (
                                    <Grid item xs={12}>
                                        <InfoItem label='Requester Remark' value={getValue(detail, fallback, 'requester_remark', 'REQUESTER_REMARK')} />
                                    </Grid>
                                )}
                            </Grid>
                            <DocumentChips files={registerDocuments} onPreview={openPreview} />
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <SectionHeader icon='tabler-building-store' title='Vendor Info' />
                            <Grid container spacing={2}>
                                {vendorInfoItems.map(({ label, value }) => (
                                    <Grid item xs={12} sm={6} md={4} key={label}>
                                        <InfoItem label={label} value={value} />
                                    </Grid>
                                ))}
                                {getValue(detail, fallback, 'address', 'ADDRESS') !== '-' && (
                                    <Grid item xs={12}>
                                        <InfoItem label='Address' value={getValue(detail, fallback, 'address', 'ADDRESS')} />
                                    </Grid>
                                )}
                            </Grid>
                        </Box>

                        {contacts.length > 0 && (
                            <Box sx={{ mb: 3 }}>
                                <SectionHeader icon='tabler-users' title={`Contacts (${contacts.length})`} />
                                <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflowX: 'auto', bgcolor: 'background.paper' }}>
                                    <Box sx={{ minWidth: 720 }}>
                                        <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 2fr', px: 2, py: 1, bgcolor: 'action.hover' }}>
                                            {['Name', 'Tel', 'Position', 'Email'].map(header => (
                                                <Typography key={header} variant='caption' fontWeight={700} color='text.secondary'>
                                                    {header}
                                                </Typography>
                                            ))}
                                        </Box>
                                        {contacts.map((contact, index) => (
                                            <Box
                                                key={`${getValue(contact, null, 'CONTACT_NAME', 'contact_name')}-${index}`}
                                                sx={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 2fr', px: 2, py: 1.25, borderTop: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}
                                            >
                                                <Typography variant='body2' fontWeight={600}>{getValue(contact, null, 'CONTACT_NAME', 'contact_name')}</Typography>
                                                <Typography variant='body2' color='text.secondary'>{getValue(contact, null, 'TEL_PHONE', 'tel_phone')}</Typography>
                                                <Typography variant='body2' color='text.secondary'>{getValue(contact, null, 'POSITION', 'position')}</Typography>
                                                <Typography variant='body2' color='text.secondary' sx={{ wordBreak: 'break-all' }}>
                                                    {getValue(contact, null, 'EMAIL', 'email')}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </Box>
                        )}

                        {products.length > 0 && (
                            <Box sx={{ mb: 3 }}>
                                <SectionHeader icon='tabler-package' title={`Products (${products.length})`} />
                                <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflowX: 'auto', bgcolor: 'background.paper' }}>
                                    <Box sx={{ minWidth: 760 }}>
                                        <Box sx={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 2fr 2fr', px: 2, py: 1, bgcolor: 'action.hover' }}>
                                            {['Group', 'Maker', 'Product Name', 'Model List'].map(header => (
                                                <Typography key={header} variant='caption' fontWeight={700} color='text.secondary'>
                                                    {header}
                                                </Typography>
                                            ))}
                                        </Box>
                                        {products.map((product, index) => (
                                            <Box
                                                key={`${getValue(product, null, 'PRODUCT_NAME', 'product_name')}-${index}`}
                                                sx={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 2fr 2fr', px: 2, py: 1.25, borderTop: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}
                                            >
                                                <Typography variant='body2' fontWeight={600}>{getValue(product, null, 'PRODUCT_GROUP', 'product_group')}</Typography>
                                                <Typography variant='body2' color='text.secondary'>{getValue(product, null, 'MAKER_NAME', 'maker_name')}</Typography>
                                                <Typography variant='body2' color='text.secondary'>{getValue(product, null, 'PRODUCT_NAME', 'product_name')}</Typography>
                                                <Typography variant='body2' color='text.secondary'>{getValue(product, null, 'MODEL_LIST', 'model_list')}</Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </Box>
                        )}

                        {(gprCFlowQuery.isLoading || gprCFlowSteps.length > 0) && (
                            <Box sx={{ mb: 3 }}>
                                <SectionHeader
                                    icon='tabler-git-branch'
                                    title={`GPR C Approval Flow${gprCFlowSteps.length > 0 ? ` (${gprCFlowSteps.length})` : ''}`}
                                />
                                {gprCFlowQuery.isLoading && gprCFlowSteps.length === 0 ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 2, px: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper' }}>
                                        <CircularProgress size={18} />
                                        <Typography variant='body2' color='text.secondary'>Loading GPR C approval flow...</Typography>
                                    </Box>
                                ) : (
                                    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflowX: 'auto', bgcolor: 'background.paper' }}>
                                        <Box sx={{ minWidth: 820 }}>
                                            <Box sx={{ display: 'grid', gridTemplateColumns: '0.5fr 2.2fr 1.8fr 1.2fr 1.3fr', px: 2, py: 1, bgcolor: 'action.hover' }}>
                                                {['#', 'Step', 'Approver', 'Status', 'Updated'].map(header => (
                                                    <Typography key={header} variant='caption' fontWeight={700} color='text.secondary'>
                                                        {header}
                                                    </Typography>
                                                ))}
                                            </Box>
                                            {gprCFlowSteps.map((step, index) => {
                                                const statusCfg = getStepStatusCfg(step.STEP_STATUS)
                                                // GPR C steps are individual approvals, so surface the completed state as "Approved".
                                                const stepStatusLabel = ['approved', 'completed'].includes(String(step.STEP_STATUS || '').toLowerCase())
                                                    ? 'Approved'
                                                    : statusCfg.label

                                                return (
                                                    <Box
                                                        key={`${step.REQUEST_VENDOR_GPR_C_STEPS_ID || step.STEP_ORDER || index}`}
                                                        sx={{ display: 'grid', gridTemplateColumns: '0.5fr 2.2fr 1.8fr 1.2fr 1.3fr', alignItems: 'center', px: 2, py: 1.25, borderTop: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}
                                                    >
                                                        <Typography variant='body2' fontWeight={600}>{getValue(step, null, 'STEP_ORDER')}</Typography>
                                                        <Typography variant='body2' fontWeight={600}>{getValue(step, null, 'STEP_NAME', 'STEP_CODE')}</Typography>
                                                        <Typography variant='body2' color='text.secondary'>{getValue(step, null, 'APPROVER_NAME', 'APPROVER_EMPCODE')}</Typography>
                                                        <Chip
                                                            icon={<i className={statusCfg.icon} style={{ fontSize: 13 }} />}
                                                            label={stepStatusLabel}
                                                            size='small'
                                                            sx={getChipSx(statusCfg.tone, {
                                                                fontWeight: 600,
                                                                fontSize: '0.68rem',
                                                                height: 22,
                                                                width: 'fit-content',
                                                                '& .MuiChip-icon': { color: statusCfg.tone.color },
                                                            })}
                                                        />
                                                        <Typography variant='body2' color='text.secondary'>
                                                            {formatDate(getValue(step, null, 'UPDATE_DATE', 'CREATE_DATE'))}
                                                        </Typography>
                                                    </Box>
                                                )
                                            })}
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        )}

                        <Box
                            ref={gprBSectionRef}
                            sx={{
                                mb: 0,
                                p: 2,
                                borderRadius: 1,
                                border: '2px solid',
                                borderColor: 'warning.main',
                                bgcolor: 'warning.lighterOpacity',
                                scrollMarginTop: 16,
                            }}
                        >
                            <SectionHeader icon='tabler-file-invoice' title='GPR B (Vendor Response)' />
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 1.5,
                                    mb: 2,
                                    p: 1.5,
                                    borderRadius: 1,
                                    bgcolor: 'warning.lighter',
                                    border: '1px solid',
                                    borderColor: 'warning.light',
                                }}
                            >
                                <i className='tabler-alert-triangle-filled' style={{ fontSize: 20, color: 'var(--mui-palette-warning-main)', flexShrink: 0, marginTop: 2 }} />
                                <Typography variant='body2' color='warning.dark' fontWeight={600}>
                                    The vendor did not accept all GPR A conditions. Please review the GPR B file below, which reflects the conditions the vendor has agreed to, before approving.
                                </Typography>
                            </Box>
                            {hasGprBFile ? (
                                <Box
                                    sx={{
                                        py: 1.25,
                                        px: 2,
                                        borderRadius: 1,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        bgcolor: 'background.paper',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        '&:hover': { bgcolor: 'action.hover' },
                                    }}
                                >
                                    <i className={getFileIcon(gprBDisplayName)} style={{ fontSize: 24, color: 'var(--mui-palette-primary-main)' }} />
                                    <Typography
                                        variant='body2'
                                        fontWeight={700}
                                        color='primary.main'
                                        sx={{ cursor: 'pointer', flex: 1, minWidth: 0, '&:hover': { textDecoration: 'underline' }, wordBreak: 'break-all' }}
                                        onClick={handleGprBDownload}
                                    >
                                        {gprBDisplayName}
                                    </Typography>

                                    <Tooltip title='Download'>
                                        <IconButton size='small' onClick={handleGprBDownload}>
                                            <i className='tabler-download' style={{ fontSize: 18 }} />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            ) : (
                                <Typography color='text.secondary'>No GPR B file uploaded by PO PIC.</Typography>
                            )}
                            {(onApprove || onReject || onActionRequired) && (
                                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <Button
                                        variant='contained'
                                        color='success'
                                        fullWidth
                                        startIcon={<i className='tabler-circle-check' style={{ fontSize: 18 }} />}
                                        onClick={onApprove}
                                        disabled={actionDisabled || !onApprove}
                                    >
                                        Approve
                                    </Button>
                                    {onActionRequired && (
                                        <Button
                                            variant='contained'
                                            color='info'
                                            fullWidth
                                            startIcon={<i className='tabler-bell-ringing' style={{ fontSize: 18 }} />}
                                            onClick={onActionRequired}
                                            disabled={actionDisabled || actionRequiredDisabled}
                                        >
                                            Action Required
                                        </Button>
                                    )}
                                    <Button
                                        variant='contained'
                                        color='error'
                                        fullWidth
                                        startIcon={<i className='tabler-circle-x' style={{ fontSize: 18 }} />}
                                        onClick={onReject}
                                        disabled={actionDisabled || !onReject}
                                    >
                                        Reject
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'flex-start', bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
                <Button variant='tonal' color='secondary' onClick={onClose}>
                    Close
                </Button>
            </DialogActions>
            </Dialog>

            <FileViewerDialog
                open={previewOpen}
                files={previewFiles}
                initialIndex={previewIndex}
                onClose={() => setPreviewOpen(false)}
            />
        </>
    )
}
