import React, { forwardRef, useState, useEffect } from 'react'
import type { ReactElement, Ref } from 'react'
import {
    Dialog,
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
    Checkbox,
    FormControlLabel
} from '@mui/material'
import { styled } from '@mui/material/styles'
import type { BoxProps } from '@mui/material/Box'
import { useDropzone } from 'react-dropzone'
import AppReactDropzone from '@/libs/styles/AppReactDropzone'
import ConfirmModal from '@components/ConfirmModal'
import CustomTextField from '@components/mui/TextField'
import { getChipSx, getRegionTone } from '@_workspace/utils/statusChipStyles'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Schema & Types
import { RegisterConfirmSchema, RegisterContactSelectionSchema, defaultRegisterConfirmValues } from './validateSchema'
import type { RegisterConfirmFormData } from './validateSchema'
import type { VendorContactOption, RegisterVendorData, RegisterConfirmModalProps } from '@_workspace/types/_find-vendor/FindVendorTypes'







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
                {value || 'â€”'}
            </Typography>
        ) : (
            value || <Typography variant='body2' sx={{ color: 'text.disabled', fontStyle: 'italic' }}>â€”</Typography>
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

const parseContactOptions = (vendorData?: RegisterVendorData): VendorContactOption[] => {
    const rawContacts = (vendorData as any)?.CONTACTS

    if (Array.isArray(rawContacts)) return rawContacts

    if (typeof rawContacts === 'string' && rawContacts.trim()) {
        try {
            const parsed = JSON.parse(rawContacts)
            return Array.isArray(parsed) ? parsed : []
        } catch {
            return []
        }
    }

    return []
}

const Transition = forwardRef(function Transition(
    props: SlideProps & { children?: ReactElement },
    ref: Ref<unknown>
) {
    return <Slide direction='down' ref={ref} {...props} />
})

const RegisterConfirmModal = ({ open, vendorData, skipAdditionalInfo = false, contactSelectionOnly = false, onClose, onConfirm }: RegisterConfirmModalProps) => {
    // Form setup state
    const [step, setStep] = useState<1 | 2>(1)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [fileError, setFileError] = useState<string | null>(null) // State for immediate dropzone feedback
    const isContactSelectionOnly = contactSelectionOnly && !skipAdditionalInfo
    const formSchema = isContactSelectionOnly ? RegisterContactSelectionSchema : RegisterConfirmSchema

    // React Hook Form
    const {
        control,
        handleSubmit: handleFormSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isValid }
    } = useForm<RegisterConfirmFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultRegisterConfirmValues,
        mode: 'onChange'
    })

    // Watch values for UI logic
    const files = watch('files')
    const contactOptions = React.useMemo(() => {
        const vd = vendorData as any
        const parsedContacts = parseContactOptions(vendorData)
        const contacts = parsedContacts.length > 0
            ? parsedContacts
            : [{
                VENDOR_CONTACT_ID: vd?.VENDOR_CONTACTS_ID,
                CONTACT_NAME: vd?.CONTACT_NAME,
                EMAIL: vd?.EMAIL,
                TEL_PHONE: vd?.TEL_PHONE,
                POSITION: vd?.POSITION
            }]

        const seen = new Set<string>()

        return contacts.filter((contact: VendorContactOption) => {
            const contactId = String(contact?.VENDOR_CONTACT_ID || '')
            if (!contactId || seen.has(contactId)) return false
            seen.add(contactId)
            return true
        })
    }, [vendorData])

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!open) {
            setTimeout(() => {
                setStep(1)
                reset(defaultRegisterConfirmValues)
                setFileError(null)
            }, 300)
        }
    }, [open, reset])

    useEffect(() => {
        if (open && contactOptions.length > 0) {
            setValue('vendorContactIds', contactOptions.map((contact) => String(contact.VENDOR_CONTACT_ID)), { shouldValidate: true })
        }
    }, [contactOptions, open, setValue])


    const { getRootProps, getInputProps } = useDropzone({
        onDrop: acceptedFiles => {
            const currentFiles = watch('files')
            // Enforce a combined 10MB cap across all attached files (not just per-file).
            const MAX_TOTAL_SIZE = 10 * 1024 * 1024
            const currentTotal = currentFiles.reduce((total: number, file: File) => total + file.size, 0)
            const incomingTotal = acceptedFiles.reduce((total, file) => total + file.size, 0)
            if (currentTotal + incomingTotal > MAX_TOTAL_SIZE) {
                setFileError('Total file size must not exceed 10MB.')
                return
            }
            setValue('files', [...currentFiles, ...acceptedFiles], { shouldValidate: true })
            setFileError(null)
        },
        onDropRejected: (fileRejections) => {
            const errors = fileRejections.map(r => {
                const sizeErr = r.errors.find(e => e.code === 'file-too-large')
                const typeErr = r.errors.find(e => e.code === 'file-invalid-type')
                if (sizeErr) return `File "${r.file.name}" is too large (max 10MB).`
                if (typeErr) return `File "${r.file.name}" type is not allowed.`
                return `File "${r.file.name}" was rejected.`
            })
            setFileError(errors[0])
        },
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'image/png': ['.png'],
            'image/jpeg': ['.jpg', '.jpeg']
        },
        maxSize: 10 * 1024 * 1024 // 10MB
    })

    const handleRemoveFile = (file: File) => {
        const currentFiles = watch('files')
        const filtered = currentFiles.filter((i: File) => i.name !== file.name)
        setValue('files', filtered, { shouldValidate: true })
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
        const data = watch()
        onConfirm(data)
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
                            <i className={step === 1 ? 'tabler-user-plus' : isContactSelectionOnly ? 'tabler-users' : 'tabler-file-description'} style={{ fontSize: 40, color: '#fff' }} />
                        </Box>
                    </Box>

                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Typography variant='h5' color='primary.main' gutterBottom>
                            {step === 1 ? 'Confirm Registration Request' : isContactSelectionOnly ? 'Select Contact' : 'Additional Information'}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {step === 1
                                ? 'Are you sure you want to create a registration request for the following vendor?'
                                : isContactSelectionOnly
                                    ? 'Please select the contact to receive this re-registration request.'
                                    : 'Please provide the following details to complete the registration request.'}
                        </Typography>
                    </Box>

                    {step === 1 && vendorData && (() => {
                        // Shared with Re-register (not yet UPPER-migrated), so tolerate both casings.
                        const vd = vendorData as any
                        const companyName = vd.COMPANY_NAME
                        const vendorTypeName = vd.VENDOR_TYPE_NAME
                        const vendorRegion = vd.VENDOR_REGION
                        const country = vd.COUNTRY
                        const province = vd.PROVINCE
                        const website = vd.WEBSITE
                        const telCenter = vd.TEL_CENTER
                        const statusCheck = vd.STATUS_CHECK
                        const address = vd.ADDRESS
                        const contactName = vd.CONTACT_NAME
                        const email = vd.EMAIL
                        const emailmain = vd.EMAILMAIN
                        const telPhone = vd.TEL_PHONE
                        const groupName = vd.GROUP_NAME
                        const makerName = vd.MAKER_NAME
                        const productName = vd.PRODUCT_NAME
                        const modelList = vd.MODEL_LIST

                        return (
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
                                {companyName}
                            </Typography>

                            {/* Company Profile */}
                            <SectionHeader icon="tabler-building-store" title="Company Profile" />
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <InfoField label="Vendor Type" value={vendorTypeName} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <InfoField
                                        label="Region"
                                        value={
                                            vendorRegion ? (
                                                    <Chip
                                                        size="small"
                                                        label={vendorRegion === 'Oversea' ? 'Oversea' : 'Local'}
                                                        color={vendorRegion === 'Oversea' ? 'info' : 'success'}
                                                        sx={getChipSx(getRegionTone(vendorRegion), { height: 22 })}
                                                    />
                                            ) : undefined
                                        }
                                    />
                                </Grid>
                                {vendorRegion === 'Oversea' ? (
                                    <Grid item xs={12} sm={6}>
                                        <InfoField label="Country" value={country} />
                                    </Grid>
                                ) : (
                                    <Grid item xs={12} sm={6}>
                                        <InfoField label="Province" value={province} />
                                    </Grid>
                                )}
                                <Grid item xs={12} sm={6}>
                                    <InfoField label="Website" value={website} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <InfoField label="Tel Company" value={telCenter} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <InfoField label="Prones Status" value={statusCheck} />
                                </Grid>
                                <Grid item xs={12}>
                                    <InfoField label="Address" value={address} />
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 2 }} />

                            {/* Contact Info (Swapped to be before Products) */}
                            <SectionHeader icon="tabler-users" title="Contact Info" />
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <InfoField label="Contact Name" value={contactName} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <InfoField label="Email" value={email || emailmain} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <InfoField label="Tel Contact" value={telPhone} />
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 2 }} />

                            {/* Products / Services (Swapped to be after Contact) */}
                            <SectionHeader icon="tabler-package" title="Products / Services" />
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <InfoField label="Product Group" value={groupName} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <InfoField label="Maker Name" value={makerName} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <InfoField label="Product Name" value={productName} />
                                </Grid>
                                <Grid item xs={12}>
                                    <InfoField label="Model List" value={modelList ? modelList.replace(/\n/g, ', ') : undefined} />
                                </Grid>
                            </Grid>
                        </Box>
                        )
                    })()}

                    {step === 2 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>

                            {/* Contact Selection */}
                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                                    Select Target Contact <Typography component="span" color="error">*</Typography>
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                    The vendor agreement email will be sent to the selected contacts.
                                </Typography>
                                <Box sx={{
                                    border: '1px solid', borderColor: errors.vendorContactIds ? 'error.main' : 'divider',
                                    borderRadius: 1.5, p: 2, bgcolor: 'background.paper'
                                }}>
                                    <Controller
                                        name="vendorContactIds"
                                        control={control}
                                        render={({ field }) => (
                                            <Box>
                                                {contactOptions.map((contact, index: number) => {
                                                    const contactId = String(contact.VENDOR_CONTACT_ID)
                                                    const checked = field.value?.includes(contactId) || false

                                                    return (
                                                        <FormControlLabel
                                                            key={contactId}
                                                            control={
                                                                <Checkbox
                                                                    checked={checked}
                                                                    onChange={(event) => {
                                                                        const currentValue = field.value || []
                                                                        field.onChange(
                                                                            event.target.checked
                                                                                ? [...currentValue, contactId]
                                                                                : currentValue.filter((id: string) => id !== contactId)
                                                                        )
                                                                    }}
                                                                />
                                                            }
                                                            label={
                                                                <Box>
                                                                    <Typography variant="body2" fontWeight={600}>{contact.CONTACT_NAME || `Contact ${index + 1}`}</Typography>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        {contact.EMAIL ? contact.EMAIL : 'No email'} {contact.TEL_PHONE ? `| Tel: ${contact.TEL_PHONE}` : ''}
                                                                    </Typography>
                                                                </Box>
                                                            }
                                                            sx={{ mb: 1, display: 'flex', alignItems: 'flex-start', '&:last-child': { mb: 0 } }}
                                                        />
                                                    )
                                                })}
                                            </Box>
                                        )}
                                    />
                                </Box>
                                {errors.vendorContactIds && (
                                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                                        {errors.vendorContactIds.message}
                                    </Typography>
                                )}
                            </Box>

                            {!isContactSelectionOnly && (
                                <>
                                    <Controller
                                        name="supportType"
                                        control={control}
                                        render={({ field }) => (
                                            <CustomTextField
                                                {...field}
                                                fullWidth
                                                required
                                                label="For support product / process"
                                                placeholder="e.g. Server infrastructure, Maintenance..."
                                                error={!!errors.supportType}
                                                helperText={errors.supportType?.message}
                                            />
                                        )}
                                    />

                                    <Controller
                                        name="purchaseFreq"
                                        control={control}
                                        render={({ field }) => (
                                            <CustomTextField
                                                {...field}
                                                value={field.value ?? ''}
                                                onChange={event => field.onChange(event.target.value.replace(/[^0-9]/g, ''))}
                                                fullWidth
                                                required
                                                label="Purchase Frequency per Year"
                                                placeholder="e.g. 30, 40, 50..."
                                                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                                error={!!errors.purchaseFreq}
                                                helperText={errors.purchaseFreq?.message}
                                            />
                                        )}
                                    />

                                    <Box>
                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                            Quotation, Concerned documents <Typography component="span" color="error">*</Typography>
                                        </Typography>
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
                                                    <Typography variant='body2' fontWeight={600} color='primary.main'>
                                                        Allowed: PDF, Excel, PNG, JPG (Total max 10MB)
                                                    </Typography>
                                                    {fileError || errors.files ? (
                                                        <Typography variant='caption' color='error' sx={{ mt: 1, fontWeight: 700 }}>
                                                            {fileError || errors.files?.message}
                                                        </Typography>
                                                    ) : null}
                                                </Box>
                                            </div>
                                            {files.length > 0 && (
                                                <List sx={{ mt: 2, p: 0 }}>
                                                    {fileList}
                                                </List>
                                            )}
                                        </Dropzone>
                                    </Box>
                                </>
                            )}
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
                                onClick={skipAdditionalInfo ? handleSubmit : handleNext}
                                color="success"
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
                                variant="contained"
                                onClick={handleFormSubmit(handleSubmit)}
                                color="success"
                                size='large'
                                disabled={!isValid}
                                sx={{ minWidth: 120 }}
                            >
                                {isContactSelectionOnly ? 'Create Request' : 'Submit Request'}
                            </Button>
                            <Button
                                variant="tonal"
                                color="secondary"
                                onClick={handleBack}
                                size='large'
                                sx={{ minWidth: 100 }}
                            >
                                Back
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
