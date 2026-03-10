import React, { forwardRef, useState, useEffect } from 'react'
import type { ReactElement, Ref } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Button,
    Grid,
    Divider,
    Chip,
    Slide,
    SlideProps,
    IconButton,
    List,
    ListItem,
    RadioGroup,
    Radio,
    FormControlLabel
} from '@mui/material'
import { styled } from '@mui/material/styles'
import type { BoxProps } from '@mui/material/Box'
import { useDropzone } from 'react-dropzone'
import AppReactDropzone from '@/libs/styles/AppReactDropzone'
import ConfirmModal from '@components/ConfirmModal'
import CustomTextField from '@components/mui/TextField'

interface RegisterConfirmModalProps {
    open: boolean
    vendorData?: any
    onClose: () => void
    onConfirm: (formData?: { supportType: string; purchaseFreq: string; vendorContactId: string; files: File[] }) => void
}

// Styled Dropzone Component
const Dropzone = styled(AppReactDropzone)<BoxProps>(({ theme }) => ({
    '& .dropzone': {
        minHeight: 'unset',
        padding: theme.spacing(4),
        border: `2px dashed ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'border 0.3s ease-in-out',
        '&:hover': {
            borderColor: theme.palette.primary.main
        },
        [theme.breakpoints.down('sm')]: {
            paddingInline: theme.spacing(4)
        },
        '&+.MuiList-root .MuiListItem-root .file-name': {
            fontWeight: theme.typography.body1.fontWeight
        }
    }
}))

const InfoField = ({ label, value }: { label: string; value?: string | React.ReactNode }) => (
    <Box>
        <Typography variant='caption' color='text.disabled' sx={{ display: 'block', mb: 0.25, fontWeight: 600, letterSpacing: 0.3 }}>
            {label}
        </Typography>
        {typeof value === 'string' ? (
            <Typography variant='body2' sx={{ color: value ? 'text.primary' : 'text.disabled', fontStyle: value ? 'normal' : 'italic' }}>
                {value || '—'}
            </Typography>
        ) : (
            value || <Typography variant='body2' sx={{ color: 'text.disabled', fontStyle: 'italic' }}>—</Typography>
        )}
    </Box>
)

const SectionHeader = ({ icon, title }: { icon: string; title: string }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Box sx={{
            width: 28, height: 28, borderRadius: 1.5,
            bgcolor: 'primary.lightOpacity', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <i className={icon} style={{ fontSize: 14, color: 'var(--mui-palette-primary-main)' }} />
        </Box>
        <Typography variant='overline' fontWeight={700} letterSpacing={1} color='text.secondary'>
            {title}
        </Typography>
    </Box>
)

const Transition = forwardRef(function Transition(
    props: SlideProps & { children?: ReactElement<any, any> },
    ref: Ref<unknown>
) {
    return <Slide direction='down' ref={ref} {...props} />
})

const RegisterConfirmModal = ({ open, vendorData, onClose, onConfirm }: RegisterConfirmModalProps) => {
    // Flow state
    const [step, setStep] = useState<1 | 2>(1)
    const [confirmOpen, setConfirmOpen] = useState(false)

    // Form states
    const [supportType, setSupportType] = useState('')
    const [purchaseFreq, setPurchaseFreq] = useState('')
    const [vendorContactId, setVendorContactId] = useState('')
    const [files, setFiles] = useState<File[]>([])

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!open) {
            setTimeout(() => {
                setStep(1)
                setSupportType('')
                setPurchaseFreq('')
                setVendorContactId('')
                setFiles([])
            }, 300)
        }
    }, [open])

    const { getRootProps, getInputProps } = useDropzone({
        onDrop: acceptedFiles => {
            setFiles(prev => [...prev, ...acceptedFiles])
        }
    })

    const handleRemoveFile = (file: File) => {
        const uploadedFiles = files
        const filtered = uploadedFiles.filter((i: File) => i.name !== file.name)
        setFiles([...filtered])
    }

    const renderFilePreview = (file: File) => {
        if (file.type.startsWith('image')) {
            return <img width={38} height={38} alt={file.name} src={URL.createObjectURL(file)} style={{ borderRadius: 4, objectFit: 'cover' }} />
        }

        let fileIcon = 'tabler-file-description'
        let iconColor = 'primary.main'
        let iconBg = 'primary.lighter'

        const name = file.name.toLowerCase()
        if (file.type.includes('pdf') || name.endsWith('.pdf')) {
            fileIcon = 'tabler-file-type-pdf'
            iconColor = 'error.main'
            iconBg = 'error.lighter'
        } else if (name.endsWith('.xls') || name.endsWith('.xlsx')) {
            fileIcon = 'tabler-file-spreadsheet'
            iconColor = 'success.main'
            iconBg = 'success.lighter'
        } else if (name.endsWith('.doc') || name.endsWith('.docx')) {
            fileIcon = 'tabler-file-word'
            iconColor = 'info.main'
            iconBg = 'info.lighter'
        } else if (file.type.startsWith('video') || name.endsWith('.mp4')) {
            fileIcon = 'tabler-video'
            iconColor = 'secondary.main'
            iconBg = 'secondary.lighter'
        } else if (name.endsWith('.zip') || name.endsWith('.rar') || name.endsWith('.7z')) {
            fileIcon = 'tabler-file-zip'
            iconColor = 'warning.main'
            iconBg = 'warning.lighter'
        }

        return (
            <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={fileIcon} style={{ color: `var(--mui-palette-${iconColor.replace('.main', '')}-main)`, fontSize: '1.5rem' }} />
            </Box>
        )
    }

    const fileList = files.map((file: File) => (
        <ListItem key={file.name} sx={{ px: 0, py: 0.75 }}>
            <Box sx={{
                display: 'flex', alignItems: 'center', width: '100%', gap: 2,
                p: 1.5, borderRadius: 1.5, border: '1px solid', borderColor: 'divider',
                bgcolor: 'background.paper',
                transition: 'border 0.2s',
                '&:hover': { borderColor: 'primary.main' }
            }}>
                <Box sx={{ flexShrink: 0, display: 'flex' }}>{renderFilePreview(file)}</Box>
                <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                    <Typography variant='body2' noWrap fontWeight={600} color='text.primary'>
                        {file.name}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                        {Math.round(file.size / 100) / 10 > 1000
                            ? `${(Math.round(file.size / 100) / 10000).toFixed(1)} MB`
                            : `${(Math.round(file.size / 100) / 10).toFixed(1)} KB`}
                    </Typography>
                </Box>
                <IconButton
                    onClick={(e) => { e.stopPropagation(); handleRemoveFile(file); }}
                    size="small"
                    sx={{
                        color: 'error.main',
                        bgcolor: 'error.lighter',
                        opacity: 0.8,
                        '&:hover': { opacity: 1, bgcolor: 'error.light' }
                    }}
                >
                    <i className='tabler-trash' style={{ fontSize: '1.25rem' }} />
                </IconButton>
            </Box>
        </ListItem>
    ))

    const handleNext = () => setStep(2)
    const handleBack = () => setStep(1)

    const handleSubmit = () => {
        setConfirmOpen(true)
    }

    const handleConfirmed = () => {
        setConfirmOpen(false)
        onConfirm({ supportType, purchaseFreq, vendorContactId, files })
    }

    return (
        <>
            <Dialog
                open={open}
                onClose={(event, reason) => {
                    if (reason !== 'backdropClick') {
                        onClose()
                    }
                }}
                maxWidth="sm"
                fullWidth
                TransitionComponent={Transition}
                sx={{
                    '& .MuiDialog-paper': { overflow: 'visible' },
                    '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
                }}
            >
                <DialogContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>

                    {/* Header Icon matching other modals */}
                    <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                bgcolor: 'primary.light',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <i className={step === 1 ? 'tabler-user-plus' : 'tabler-file-description'} style={{ fontSize: 40, color: '#fff' }} />
                        </Box>
                    </Box>

                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Typography variant='h5' color='primary.main' gutterBottom>
                            {step === 1 ? 'Confirm Registration Request' : 'Additional Information'}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {step === 1
                                ? 'Are you sure you want to create a registration request for the following vendor?'
                                : 'Please provide the following details to complete the registration request.'}
                        </Typography>
                    </Box>

                    {step === 1 && vendorData && (
                        <Box sx={{
                            p: 2.5, borderRadius: 1.5,
                            bgcolor: 'background.paper',
                            border: '1px solid', borderColor: 'primary.main',
                            position: 'relative',
                            mt: 1,
                            maxHeight: '52vh',
                            overflowY: 'auto'
                        }}>
                            <Typography variant="h6" fontWeight={800} color="primary.main" sx={{ mb: 2 }}>
                                {vendorData.company_name}
                            </Typography>

                            {/* Company Profile */}
                            <SectionHeader icon="tabler-building-store" title="Company Profile" />
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <InfoField label="Vendor Type" value={vendorData.vendor_type_name} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <InfoField
                                        label="Region"
                                        value={
                                            vendorData.vendor_region ? (
                                                <Chip
                                                    size="small"
                                                    label={vendorData.vendor_region === 'Oversea' ? '✈️ Oversea' : '🏠 Local'}
                                                    color={vendorData.vendor_region === 'Oversea' ? 'info' : 'success'}
                                                    variant="tonal"
                                                    sx={{ fontWeight: 600, height: 22, fontSize: '0.7rem' }}
                                                />
                                            ) : undefined
                                        }
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <InfoField label="Province" value={vendorData.province} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <InfoField label="Website" value={vendorData.website} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <InfoField label="Tel Company" value={vendorData.tel_center} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <InfoField label="Prones Status" value={vendorData.status_check} />
                                </Grid>
                                <Grid item xs={12}>
                                    <InfoField label="Address" value={vendorData.address} />
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 2 }} />

                            {/* Contact Info (Swapped to be before Products) */}
                            <SectionHeader icon="tabler-users" title="Contact Info" />
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <InfoField label="Contact Name" value={vendorData.contact_name} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <InfoField label="Email" value={vendorData.email || vendorData.emailmain} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <InfoField label="Tel Contact" value={vendorData.tel_phone} />
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 2 }} />

                            {/* Products / Services (Swapped to be after Contact) */}
                            <SectionHeader icon="tabler-package" title="Products / Services" />
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <InfoField label="Product Group" value={vendorData.group_name} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <InfoField label="Maker Name" value={vendorData.maker_name} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <InfoField label="Product Name" value={vendorData.product_name} />
                                </Grid>
                                <Grid item xs={12}>
                                    <InfoField label="Model List" value={vendorData.model_list ? vendorData.model_list.replace(/\n/g, ', ') : undefined} />
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {step === 2 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>

                            {/* Contact Selection */}
                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                                    Select Target Contact <Typography component="span" color="error">*</Typography>
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                    The vendor agreement email will be sent to the selected contact.
                                </Typography>
                                <Box sx={{
                                    border: '1px solid', borderColor: 'divider',
                                    borderRadius: 1.5, p: 2, bgcolor: 'background.paper'
                                }}>
                                    <RadioGroup
                                        value={vendorContactId}
                                        onChange={(e) => setVendorContactId(e.target.value)}
                                    >                                        {vendorData?.contacts?.map((contact: any, index: number) => (
                                        contact.vendor_contact_id ? (
                                            <FormControlLabel
                                                key={contact.vendor_contact_id}
                                                value={String(contact.vendor_contact_id)}
                                                control={<Radio />}
                                                label={
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={600}>{contact.contact_name || `Contact ${index + 1}`}</Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {contact.email ? `✉️ ${contact.email}` : 'No email'} {contact.tel_phone ? `| 📞 ${contact.tel_phone}` : ''}
                                                        </Typography>
                                                    </Box>
                                                }
                                                sx={{ mb: 1, '&:last-child': { mb: 0 } }}
                                            />
                                        ) : null
                                    ))}
                                    </RadioGroup>
                                </Box>
                            </Box>

                            <CustomTextField
                                fullWidth
                                label="For support product / process"
                                placeholder="e.g. Server infrastructure, Maintenance..."
                                value={supportType}
                                onChange={(e: any) => setSupportType(e.target.value)}
                            />
                            <CustomTextField
                                fullWidth
                                label="Purchase Frequency / Year"
                                placeholder="e.g. Monthly, 2-3 times/year..."
                                value={purchaseFreq}
                                onChange={(e: any) => setPurchaseFreq(e.target.value)}
                            />

                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Quotation, Concerned documents</Typography>
                                <Dropzone>
                                    <div {...getRootProps({ className: 'dropzone' })}>
                                        <input {...getInputProps()} />
                                        <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: 1.5, textAlign: 'center' }}>
                                            <Box sx={{
                                                width: 48, height: 48, borderRadius: 1.5,
                                                bgcolor: 'secondary.lightOpacity', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <i className='tabler-upload' style={{ fontSize: 24, color: 'var(--mui-palette-secondary-main)' }} />
                                            </Box>
                                            <Typography variant='h6' sx={{ mb: 0.5 }}>Drop files here or click to upload</Typography>
                                            <Typography variant='body2' color='text.secondary'>Allowed files: PDF, DOC, Excel, Images</Typography>
                                        </Box>
                                    </div>
                                    {files.length > 0 && (
                                        <List sx={{ mt: 2, p: 0 }}>
                                            {fileList}
                                        </List>
                                    )}
                                </Dropzone>
                            </Box>
                        </Box>
                    )}
                </DialogContent>

                <DialogActions
                    sx={{
                        justifyContent: 'center',
                        borderTop: 'none',
                        mb: 4,
                        gap: 2
                    }}
                >
                    {step === 1 ? (
                        <>
                            <Button
                                variant="contained"
                                onClick={handleNext}
                                color="primary"
                                size='large'
                                sx={{ minWidth: 120 }}
                            >
                                Create Request
                            </Button>
                            <Button
                                variant="tonal"
                                color="secondary"
                                onClick={onClose}
                                size='large'
                                sx={{ minWidth: 100 }}
                            >
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="tonal"
                                color="secondary"
                                onClick={handleBack}
                                size='large'
                                sx={{ minWidth: 100 }}
                            >
                                Back
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                color="success"
                                size='large'
                                disabled={!supportType || !purchaseFreq || !vendorContactId}
                                sx={{ minWidth: 120 }}
                            >
                                Submit Request
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            <ConfirmModal
                show={confirmOpen}
                onConfirmClick={handleConfirmed}
                onCloseClick={() => setConfirmOpen(false)}
                isDelete={false}
                isLoading={false}
            />
        </>
    )
}

export default RegisterConfirmModal
