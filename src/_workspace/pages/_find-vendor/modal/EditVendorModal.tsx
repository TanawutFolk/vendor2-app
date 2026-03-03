'use client'

// React Imports
import React, { useEffect, useState, useCallback } from 'react'

// MUI Imports
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    CircularProgress,
    Box,
    Divider,
    Typography,
    Chip,
    IconButton,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import { InputAdornment, Tooltip } from '@mui/material'

// Third-party Imports
import classNames from 'classnames'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Components Imports
import CustomTextField from '@components/mui/TextField'
import AsyncSelectCustom from '@components/react-select/AsyncSelectCustom'
import ConfirmModal from './ConfirmModal'
import SuccessModal from './SuccessModal'
import ErrorModal from './ErrorModal'
import { EmailActionButtons } from './EmailActionButtons'
import AddProductGroupModal from '../../_add-vendor/modal/AddProductGroupModal'
import { FftStatusChip, StatusCheckChip } from '../components/fftStatus'

// Services & Utils Imports
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import FindVendorServices from '@_workspace/services/_find-vendor/FindVendorServices'
import { fetchProductGroups } from '@/_workspace/react-select/async-promise-load-options/find-vendor/fetchProductGroups'
import { useQueryClient } from '@tanstack/react-query'
import { PREFIX_QUERY_KEY, useGetVendor, useUpdateVendor } from '@_workspace/react-query/hooks/vendor/useFindVendor'
import { FormControlLabel, Switch } from '@mui/material'

// Types & Schema Imports
import type {
    VendorComprehensiveI,
    VendorContactI,
    VendorProductI,
    VendorUpdateRequestI
} from '@_workspace/types/_find-vendor/FindVendorTypes'
import { editVendorSchema, EditVendorSchemaType } from './validateSchema'

// ─────────────────────────────────────────────────────────────────────────────
// Shared UI Components (matching RequestDetail.tsx)
// ─────────────────────────────────────────────────────────────────────────────
const InfoField = ({ label, value, fullWidth }: { label: string; value?: string | React.ReactNode; fullWidth?: boolean }) => (
    <Box sx={{ ...(fullWidth ? { gridColumn: '1 / -1' } : {}) }}>
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

interface EditVendorModalProps {
    open: boolean
    onClose: () => void
    vendorId: number | null
    onSuccess?: () => void
}

const EditVendorModal = ({ open, onClose, vendorId, onSuccess: onSaveSuccess }: EditVendorModalProps) => {
    // Hooks
    const { data: vendorQueryData, isLoading: isLoadingVendor, isFetching: isFetchingVendor } = useGetVendor(vendorId)
    const queryClient = useQueryClient()
    const updateVendor = useUpdateVendor(
        (data: any, variables: any) => {
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY, 'DETAIL', variables.vendorId] })
            queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] }) // Refresh list as well

            setSuccessData(data)
            setSuccessModalOpen(true)
            onSaveSuccess?.()
            setEditingMode('view')
        },
        (err: any) => {
            setErrorMessage(err?.message || 'Failed to save changes')
            setErrorDetails(err)
            setErrorModalOpen(true)
        }
    )

    // Derived states — include isFetchingVendor so loading overlay shows on every refetch (not just first load)
    // This prevents stale data from showing while new vendor data is being loaded in background
    const loading = isLoadingVendor || isFetchingVendor || (!!vendorId && !vendorQueryData)
    const saving = updateVendor.isPending

    const [error, setError] = useState<string | null>(null)
    const [editingMode, setEditingMode] = useState<'view' | 'edit'>('view')

    // RHF Setup
    const { control, handleSubmit, reset, watch, formState: { errors }, getValues, setValue, trigger } = useForm<EditVendorSchemaType>({
        resolver: zodResolver(editVendorSchema),
        defaultValues: {
            company_name: '',
            vendor_type_id: null,
            contacts: [],
            products: []
        }
    })

    const { fields: contactFields, append: appendContact, remove: removeContactField } = useFieldArray({
        control,
        name: 'contacts'
    })

    const { fields: productFields, append: appendProduct, remove: removeProductField } = useFieldArray({
        control,
        name: 'products'
    })

    const [originalData, setOriginalData] = useState<VendorComprehensiveI | null>(null)
    const [showAddProductGroupModal, setShowAddProductGroupModal] = useState(false)
    const [productGroupRefreshKey, setProductGroupRefreshKey] = useState(0)
    const [deletedContactIds, setDeletedContactIds] = useState<number[]>([])
    const [deletedProductIds, setDeletedProductIds] = useState<number[]>([])

    // Modal states
    const [confirmModalOpen, setConfirmModalOpen] = useState(false)
    const [successModalOpen, setSuccessModalOpen] = useState(false)
    const [errorModalOpen, setErrorModalOpen] = useState(false)
    const [successData, setSuccessData] = useState<any>(null)
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [errorDetails, setErrorDetails] = useState<any>(null)
    const [vendorFftCode, setVendorFftCode] = useState<string | null | undefined>(null)
    const [vendorFftStatus, setVendorFftStatus] = useState<number | null>(null)
    const [vendorStatusCheck, setVendorStatusCheck] = useState<string | undefined>(undefined)

    // Watch for changes to display in header
    const watchedValues = watch()


    // Dropdown fetcher for vendor types (following SearchFilter.tsx pattern)
    const fetchVendorTypes = useCallback(async (inputValue: string) => {
        try {
            const response = await FindVendorServices.getVendorTypes()
            if (response.data.Status) {
                return response.data.ResultOnDb.filter(item =>
                    item.label.toLowerCase().includes(inputValue.toLowerCase())
                )
            }
            return []
        } catch (error) {
            console.error('Error fetching vendor types:', error)
            return []
        }
    }, [])

    // ─── Clear form immediately when vendorId changes ───────────────────────────
    // This prevents stale data from showing while new vendor data is being fetched.
    // Must run BEFORE the populate effect so the form is always clean on each open.
    useEffect(() => {
        if (!vendorId) return // Modal closing — do nothing (let onClose handle)
        reset({ company_name: '', vendor_type_id: null, contacts: [], products: [] })
        setOriginalData(null)
        setVendorFftCode(null)
        setVendorFftStatus(null)
        setVendorStatusCheck(undefined)
        setDeletedContactIds([])
        setDeletedProductIds([])
        setEditingMode('view')
    }, [vendorId]) // eslint-disable-line react-hooks/exhaustive-deps

    // Populate form when data is available
    useEffect(() => {
        if (vendorQueryData && open) {
            const { comprehensive } = vendorQueryData

            setOriginalData(JSON.parse(JSON.stringify(comprehensive)))
            reset(comprehensive)

            setVendorFftCode(comprehensive.fft_vendor_code)
            setVendorFftStatus(comprehensive.fft_status != null ? Number(comprehensive.fft_status) : null)
            setVendorStatusCheck(comprehensive.status_check)

            // Clear deletions tracking on fresh load
            setDeletedContactIds([])
            setDeletedProductIds([])
        }
    }, [vendorQueryData, open, reset])

    const toggleEditMode = () => {
        setEditingMode(prev => prev === 'view' ? 'edit' : 'view')
    }

    const handleProductGroupAdded = () => {
        setProductGroupRefreshKey(prev => prev + 1)
    }

    // Modal handlers
    const handleSaveClick = async () => {
        const isValid = await trigger()
        if (isValid) {
            setConfirmModalOpen(true)
        }
    }

    const onSubmit = async (data: EditVendorSchemaType) => {
        if (!vendorId) return

        setError(null)

        const userCode = getUserData().EMPLOYEE_CODE || 'SYSTEM'

        if (!originalData) return

        // We trigger mutation here. Success/Error are handled in the hook callbacks.
        updateVendor.mutate({
            vendorId,
            data,
            originalData,
            deletedContactIds,
            deletedProductIds,
            userCode
        })
    }

    const handleConfirmSave = async () => {
        setConfirmModalOpen(false)
        await handleSubmit(onSubmit)()
    }




    const handleErrorRetry = () => {
        setErrorModalOpen(false)
        handleSubmit(onSubmit)()
    }

    const handleSaveButtonClick = async () => {
        handleSaveClick()
    }

    const handleClose = () => {
        reset()
        setEditingMode('view')
        setError(null)
        setDeletedContactIds([])
        setDeletedProductIds([])
        onClose()
    }

    const removeContact = (index: number) => {
        const contact = getValues(`contacts.${index}`)
        if (contact && contact.vendor_contact_id) {
            setDeletedContactIds(prev => [...prev, contact.vendor_contact_id!])
        }
        removeContactField(index)
    }

    const removeProduct = (index: number) => {
        const product = getValues(`products.${index}`)
        if (product && product.vendor_product_id) {
            setDeletedProductIds(prev => [...prev, product.vendor_product_id!])
        }
        removeProductField(index)
    }

    return (
        <>
            <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth PaperProps={{ sx: { bgcolor: 'background.default' } }}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 0 }}>
                    <Box sx={{
                        width: '100%', px: 3, py: 2,
                        bgcolor: 'background.paper',
                        borderBottom: '1px solid', borderColor: 'divider',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap'
                    }}>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.25 }}>
                                <Typography variant="h6" fontWeight={800}>
                                    {originalData?.company_name || 'Vendor Details'}
                                </Typography>
                                {vendorFftCode && (
                                    <Chip label={`Code: ${vendorFftCode}`} size="small" color="primary" variant="tonal" sx={{ fontWeight: 700, fontSize: '0.7rem', height: 22 }} />
                                )}
                                {vendorStatusCheck && (
                                    <StatusCheckChip value={vendorStatusCheck} />
                                )}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                                <Controller
                                    name="INUSE"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={field.value === 1}
                                                    onChange={(e) => field.onChange(e.target.checked ? 1 : 0)}
                                                    color="success"
                                                    disabled={editingMode === 'view'}
                                                    size="small"
                                                />
                                            }
                                            label={<Typography variant='caption' fontWeight={600} color={field.value === 1 ? 'success.main' : 'text.disabled'}>{field.value === 1 ? 'Active' : 'Inactive'}</Typography>}
                                            sx={{ m: 0 }}
                                        />
                                    )}
                                />
                                <Typography variant='caption' color='text.disabled'>·</Typography>
                                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                    <i className='tabler-user' style={{ fontSize: 12, color: 'var(--mui-palette-text-disabled)' }} />
                                    <Typography variant='caption' color='text.disabled'>Update By: {originalData?.UPDATE_BY || '-'}</Typography>
                                </Box>
                                <Typography variant='caption' color='text.disabled'>·</Typography>
                                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                    <i className='tabler-calendar' style={{ fontSize: 12, color: 'var(--mui-palette-text-disabled)' }} />
                                    <Typography variant='caption' color='text.disabled'>
                                        Update Date: {originalData?.UPDATE_DATE ? new Date(originalData.UPDATE_DATE).toLocaleDateString('th-TH') : '-'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        <Button
                            variant={editingMode === 'edit' ? 'contained' : 'tonal'}
                            color={editingMode === 'edit' ? 'success' : 'primary'}
                            onClick={toggleEditMode}
                            disabled={loading}
                            startIcon={editingMode === 'edit' ? <i className='tabler-check' /> : <i className='tabler-edit' />}
                            sx={{ fontWeight: 700 }}
                        >
                            {editingMode === 'edit' ? 'Editing Mode' : 'Edit Mode'}
                        </Button>
                    </Box>
                </DialogTitle>
                <DialogContent dividers sx={{ p: 3, maxHeight: '75vh', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {loading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
                            <CircularProgress />
                            <Typography variant="body1" sx={{ ml: 2 }}>Loading vendor details...</Typography>
                        </Box>
                    ) : (
                        <>
                            {/* Company Information */}
                            <Box sx={{ position: 'relative', zIndex: 4 }}>
                                <SectionHeader icon="tabler-building-store" title="Company Profile" />
                                <Box sx={{
                                    p: 2.5, borderRadius: 1.5,
                                    bgcolor: 'background.paper',
                                    border: '1px solid', borderColor: 'primary.main'
                                }}>
                                    <Grid container spacing={4}>
                                        <Grid item xs={12} md={6}>
                                            <Controller
                                                name="company_name"
                                                control={control}
                                                render={({ field }) => (
                                                    <CustomTextField
                                                        {...field}
                                                        fullWidth
                                                        label="Company Name"
                                                        error={!!errors.company_name}
                                                        helperText={errors.company_name?.message}
                                                        disabled={editingMode === 'view'}
                                                        InputProps={{ readOnly: editingMode === 'view' }}
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Controller
                                                name="vendor_type_id"
                                                control={control}
                                                render={({ field }) => (
                                                    <AsyncSelectCustom
                                                        label='Vendor Type'
                                                        {...field}
                                                        value={field.value ? { value: field.value, label: getValues('vendor_type_name') || 'Unknown' } : null}
                                                        onChange={(val: any) => {
                                                            console.log('Selected Vendor Type:', val)
                                                            const newValue = val && val.value !== undefined ? val.value : null
                                                            field.onChange(newValue)
                                                            setValue('vendor_type_name', val?.label || null)
                                                        }}
                                                        placeholder='Select Type...'
                                                        defaultOptions
                                                        cacheOptions
                                                        isClearable
                                                        loadOptions={fetchVendorTypes}
                                                        classNamePrefix='select'
                                                        isDisabled={editingMode === 'view'}
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Controller
                                                name="vendor_region"
                                                control={control}
                                                render={({ field }) => (
                                                    <Box>
                                                        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                                                            Vendor Region
                                                        </Typography>
                                                        {editingMode === 'view' ? (
                                                            <Chip
                                                                label={field.value === 'Oversea' ? '✈️ Oversea' : '🏠 Local'}
                                                                color={field.value === 'Oversea' ? 'info' : 'success'}
                                                                size='small'
                                                                variant='tonal'
                                                                sx={{ fontWeight: 600 }}
                                                            />
                                                        ) : (
                                                            <ToggleButtonGroup
                                                                value={field.value || 'Local'}
                                                                exclusive
                                                                onChange={(_, val) => { if (val !== null) field.onChange(val) }}
                                                                size='small'
                                                                color='primary'
                                                            >
                                                                <ToggleButton value='Local' sx={{ px: 3, fontWeight: 600 }}>🏠 Local</ToggleButton>
                                                                <ToggleButton value='Oversea' sx={{ px: 3, fontWeight: 600 }}>✈️ Oversea</ToggleButton>
                                                            </ToggleButtonGroup>
                                                        )}
                                                    </Box>
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={6} md={3}>
                                            <Controller
                                                name="province"
                                                control={control}
                                                render={({ field }) => (
                                                    <CustomTextField
                                                        {...field}
                                                        fullWidth
                                                        label="Province"
                                                        value={field.value || ''}
                                                        size="small"
                                                        error={!!errors.province}
                                                        helperText={errors.province?.message}
                                                        disabled={editingMode === 'view'}
                                                        InputProps={{ readOnly: editingMode === 'view' }}
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={6} md={3}>
                                            <Controller
                                                name="postal_code"
                                                control={control}
                                                render={({ field }) => (
                                                    <CustomTextField
                                                        {...field}
                                                        fullWidth
                                                        label="Postal Code"
                                                        value={field.value || ''}
                                                        size="small"
                                                        error={!!errors.postal_code}
                                                        helperText={errors.postal_code?.message}
                                                        disabled={editingMode === 'view'}
                                                        InputProps={{ readOnly: editingMode === 'view' }}
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={6} md={3}>
                                            <Controller
                                                name="website"
                                                control={control}
                                                render={({ field }) => (
                                                    <CustomTextField
                                                        {...field}
                                                        fullWidth
                                                        label="Website"
                                                        value={field.value || ''}
                                                        size="small"
                                                        error={!!errors.website}
                                                        helperText={errors.website?.message}
                                                        disabled={editingMode === 'view'}
                                                        InputProps={{ readOnly: editingMode === 'view' }}
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={6} md={3}>
                                            <Controller
                                                name="tel_center"
                                                control={control}
                                                render={({ field }) => (
                                                    <CustomTextField
                                                        {...field}
                                                        fullWidth
                                                        label="Tel Company"
                                                        value={field.value || ''}
                                                        size="small"
                                                        error={!!errors.tel_center}
                                                        helperText={errors.tel_center?.message}
                                                        disabled={editingMode === 'view'}
                                                        InputProps={{ readOnly: editingMode === 'view' }}
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={6} md={3}>
                                            <Controller
                                                name="emailmain"
                                                control={control}
                                                render={({ field }) => (
                                                    <CustomTextField
                                                        {...field}
                                                        fullWidth
                                                        label="Email (Main)"
                                                        value={field.value || ''}
                                                        size="small"
                                                        type="email"
                                                        error={!!errors.emailmain}
                                                        helperText={errors.emailmain?.message}
                                                        disabled={editingMode === 'view'}
                                                        InputProps={{ readOnly: editingMode === 'view' }}
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Controller
                                                name="address"
                                                control={control}
                                                render={({ field }) => (
                                                    <CustomTextField
                                                        {...field}
                                                        fullWidth
                                                        label="Address"
                                                        value={field.value || ''}
                                                        size="small"
                                                        multiline
                                                        rows={2}
                                                        error={!!errors.address}
                                                        helperText={errors.address?.message}
                                                        disabled={editingMode === 'view'}
                                                        InputProps={{ readOnly: editingMode === 'view' }}
                                                    />
                                                )}
                                            />
                                        </Grid>

                                        {/* Company Metadata */}
                                        {originalData?.vendor_id && (
                                            <Grid item xs={12}>
                                                <Divider sx={{ my: 1 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Company Info
                                                    </Typography>
                                                </Divider>
                                                <Box sx={{ mt: 1, mb: 1, display: 'flex', gap: 4, color: 'text.secondary', flexWrap: 'wrap' }}>
                                                    <Box>
                                                        <Typography variant="caption" display="block">Created By</Typography>
                                                        <Typography variant="body2" fontSize="0.75rem">{originalData.CREATE_BY || 'N/A'}</Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" display="block">Created Date</Typography>
                                                        <Typography variant="body2" fontSize="0.75rem">
                                                            {originalData.CREATE_DATE ? new Date(originalData.CREATE_DATE).toLocaleDateString('th-TH') : 'N/A'}
                                                        </Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" display="block">Last Update By</Typography>
                                                        <Typography variant="body2" fontSize="0.75rem">{originalData.UPDATE_BY || 'N/A'}</Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" display="block">Last Update Date</Typography>
                                                        <Typography variant="body2" fontSize="0.75rem">
                                                            {originalData.UPDATE_DATE ? new Date(originalData.UPDATE_DATE).toLocaleDateString('th-TH') : 'N/A'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        )}
                                    </Grid>
                                </Box>
                            </Box>

                            <Divider />

                            {/* Contacts */}
                            <Box sx={{ position: 'relative', zIndex: 3 }}>
                                <SectionHeader icon="tabler-users" title={`Contacts (${contactFields.length})`} />

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {contactFields.map((contact, index) => (
                                        <Box key={contact.id} sx={{
                                            p: 2.5, borderRadius: 1.5,
                                            bgcolor: 'background.paper',
                                            border: '1px solid', borderColor: 'primary.main',
                                            position: 'relative'
                                        }}>
                                            <Grid container spacing={3}>
                                                <Grid item xs={12}>
                                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{
                                                                width: 24, height: 24, borderRadius: '50%',
                                                                bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                            }}>
                                                                <Typography variant='caption' fontWeight={700}>{index + 1}</Typography>
                                                            </Box>
                                                            <Typography variant="subtitle2" fontWeight={600}>
                                                                Contact Info
                                                            </Typography>
                                                            {!contact.vendor_contact_id && <Chip label="New" size="small" color="success" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }} />}
                                                        </Box>
                                                        {editingMode === 'edit' && (
                                                            <IconButton size="small" color="error" onClick={() => removeContact(index)}>
                                                                <i className="tabler-trash" />
                                                            </IconButton>
                                                        )}
                                                    </Box>
                                                    <Divider sx={{ my: 2 }} />
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={6}>
                                                    <Controller
                                                        name={`contacts.${index}.contact_name`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <CustomTextField
                                                                {...field}
                                                                fullWidth
                                                                label="Name"
                                                                value={field.value || ''}
                                                                size="small"
                                                                error={!!errors.contacts?.[index]?.contact_name}
                                                                helperText={errors.contacts?.[index]?.contact_name?.message}
                                                                disabled={editingMode === 'view'}
                                                                InputProps={{ readOnly: editingMode === 'view' }}
                                                            />
                                                        )}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={6}>
                                                    <Controller
                                                        name={`contacts.${index}.tel_phone`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <CustomTextField
                                                                {...field}
                                                                fullWidth
                                                                label="Phone"
                                                                value={field.value || ''}
                                                                size="small"
                                                                disabled={editingMode === 'view'}
                                                                InputProps={{ readOnly: editingMode === 'view' }}
                                                            />
                                                        )}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={6}>
                                                    <Controller
                                                        name={`contacts.${index}.email`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <CustomTextField
                                                                {...field}
                                                                fullWidth
                                                                label="Email"
                                                                value={field.value || ''}
                                                                size="small"
                                                                error={!!errors.contacts?.[index]?.email}
                                                                helperText={errors.contacts?.[index]?.email?.message}
                                                                InputProps={{
                                                                    readOnly: editingMode === 'view',
                                                                    endAdornment: field.value && (
                                                                        <InputAdornment position="end">
                                                                            <EmailActionButtons
                                                                                email={field.value}
                                                                                contactName={getValues(`contacts.${index}.contact_name`)}
                                                                            />
                                                                        </InputAdornment>
                                                                    )
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={6}>
                                                    <Controller
                                                        name={`contacts.${index}.position`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <CustomTextField
                                                                {...field}
                                                                fullWidth
                                                                label="Position"
                                                                value={field.value || ''}
                                                                size="small"
                                                                disabled={editingMode === 'view'}
                                                                InputProps={{ readOnly: editingMode === 'view' }}
                                                            />
                                                        )}
                                                    />
                                                </Grid>

                                                {/* Contact Metadata */}
                                                {contact.vendor_contact_id && (
                                                    <Grid item xs={12}>
                                                        <Divider sx={{ my: 1 }}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Contact Info
                                                            </Typography>
                                                        </Divider>
                                                        <Box sx={{ mt: 1, mb: 1, display: 'flex', gap: 4, color: 'text.secondary' }}>
                                                            <Box>
                                                                <Typography variant="caption" display="block">Created By</Typography>
                                                                <Typography variant="body2" fontSize="0.75rem">{contact.CREATE_BY || 'N/A'}</Typography>
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="caption" display="block">Created Date</Typography>
                                                                <Typography variant="body2" fontSize="0.75rem">
                                                                    {contact.CREATE_DATE ? new Date(contact.CREATE_DATE).toLocaleDateString('th-TH') : 'N/A'}
                                                                </Typography>
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="caption" display="block">Last Update By</Typography>
                                                                <Typography variant="body2" fontSize="0.75rem">{contact.UPDATE_BY || 'N/A'}</Typography>
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="caption" display="block">Last Update Date</Typography>
                                                                <Typography variant="body2" fontSize="0.75rem">
                                                                    {contact.UPDATE_DATE ? new Date(contact.UPDATE_DATE).toLocaleDateString('th-TH') : 'N/A'}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Grid>
                                                )}
                                            </Grid>
                                        </Box>
                                    ))}
                                    {editingMode === 'edit' && (
                                        <Button
                                            variant="outlined"
                                            startIcon={<i className="tabler-plus" />}
                                            onClick={() => appendContact({ contact_name: '' })}
                                            fullWidth
                                            sx={{ borderStyle: 'dashed' }}
                                        >
                                            Add Contact
                                        </Button>
                                    )}
                                </Box>
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            {/* Products */}
                            <Box sx={{ position: 'relative', zIndex: 2 }}>
                                <SectionHeader icon="tabler-package" title={`Products / Services (${productFields.length})`} />
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {productFields.map((product, index) => (
                                        <Box key={product.id} sx={{
                                            p: 2.5, borderRadius: 1.5,
                                            bgcolor: 'background.paper',
                                            border: '1px solid', borderColor: 'primary.main',
                                            position: 'relative'
                                        }}>
                                            <Grid container spacing={3}>
                                                <Grid item xs={12}>
                                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{
                                                                width: 24, height: 24, borderRadius: '50%',
                                                                bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                            }}>
                                                                <Typography variant='caption' fontWeight={700}>{index + 1}</Typography>
                                                            </Box>
                                                            <Typography variant="subtitle2" fontWeight={600}>
                                                                Product
                                                            </Typography>
                                                            {!product.vendor_product_id && <Chip label="New" size="small" color="success" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }} />}
                                                        </Box>
                                                        {editingMode === 'edit' && (
                                                            <IconButton size="small" color="error" onClick={() => removeProduct(index)}>
                                                                <i className="tabler-trash" />
                                                            </IconButton>
                                                        )}
                                                    </Box>
                                                    <Divider sx={{ my: 2 }} />
                                                </Grid>

                                                <Grid item xs={12} sm={6} md={6} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Controller
                                                            name={`products.${index}.product_group_id`}
                                                            control={control}
                                                            render={({ field }) => (
                                                                <AsyncSelectCustom
                                                                    key={`product-group-${index}-${productGroupRefreshKey}`}
                                                                    label='Product Group'
                                                                    {...field}
                                                                    value={field.value ? { value: field.value, label: getValues(`products.${index}.group_name`) || 'Unknown' } : null}
                                                                    onChange={(val: any) => {
                                                                        field.onChange(val?.value)
                                                                        setValue(`products.${index}.group_name`, val?.label)
                                                                    }}
                                                                    loadOptions={(inputValue, callback) => {
                                                                        fetchProductGroups(inputValue).then(options => callback(options as any))
                                                                    }}
                                                                    defaultOptions
                                                                    cacheOptions={false}
                                                                    isClearable
                                                                    isDisabled={editingMode === 'view'}
                                                                    placeholder='Select group...'
                                                                    classNamePrefix='select'
                                                                />
                                                            )}
                                                        />
                                                    </Box>
                                                    {editingMode === 'edit' && (
                                                        <Button
                                                            variant='tonal'
                                                            color='secondary'
                                                            onClick={() => setShowAddProductGroupModal(true)}
                                                            sx={{ minWidth: 38, width: 38, height: 38, p: 0, flexShrink: 0, mt: 5.4 }}
                                                            title='Add Product Group'
                                                        >
                                                            <i className='tabler-plus' />
                                                        </Button>
                                                    )}
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={6}>
                                                    <Controller
                                                        name={`products.${index}.maker_name`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <CustomTextField
                                                                {...field}
                                                                fullWidth
                                                                label="Maker Name"
                                                                value={field.value || ''}
                                                                size="small"
                                                                disabled={editingMode === 'view'}
                                                                InputProps={{ readOnly: editingMode === 'view' }}
                                                            />
                                                        )}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={6}>
                                                    <Controller
                                                        name={`products.${index}.product_name`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <CustomTextField
                                                                {...field}
                                                                fullWidth
                                                                label="Product Name"
                                                                value={field.value || ''}
                                                                size="small"
                                                                error={!!errors.products?.[index]?.product_name}
                                                                helperText={errors.products?.[index]?.product_name?.message}
                                                                disabled={editingMode === 'view'}
                                                                InputProps={{ readOnly: editingMode === 'view' }}
                                                            />
                                                        )}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={6}>
                                                    <Controller
                                                        name={`products.${index}.model_list`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <CustomTextField
                                                                {...field}
                                                                fullWidth
                                                                multiline
                                                                label="Model List"
                                                                value={field.value || ''}
                                                                size="small"
                                                                disabled={editingMode === 'view'}
                                                                InputProps={{ readOnly: editingMode === 'view' }}
                                                            />
                                                        )}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    ))}
                                    {editingMode === 'edit' && (
                                        <Button
                                            variant="outlined"
                                            startIcon={<i className="tabler-plus" />}
                                            onClick={() => appendProduct({ product_name: '' })}
                                            fullWidth
                                            sx={{ borderStyle: 'dashed' }}
                                        >
                                            Add Product
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        </>
                    )}
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'flex-start', p: 3, gap: 2, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
                    {editingMode === 'edit' && (
                        <Button
                            onClick={handleSaveClick}
                            variant="contained"
                            disabled={loading || saving}
                            startIcon={saving ? <CircularProgress size={16} /> : <i className='tabler-device-floppy' />}
                            sx={{ fontWeight: 700 }}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    )}
                    <Button
                        onClick={handleClose}
                        disabled={saving}
                        variant="tonal"
                        color="secondary"
                        sx={{ fontWeight: 700 }}
                    >
                        {editingMode === 'edit' ? 'Cancel' : 'Close'}
                    </Button>
                </DialogActions>

                {/* Confirm Modal */}
                <ConfirmModal
                    open={confirmModalOpen}
                    onClose={() => setConfirmModalOpen(false)}
                    onConfirm={handleConfirmSave}
                    loading={saving}
                    title="Confirm Save Changes"
                    message="Do you want to save changes to this vendor?"
                />

                {/* Success Modal */}
                <SuccessModal
                    open={successModalOpen}
                    onClose={() => setSuccessModalOpen(false)}
                    title="Saved successfully"
                    message="Vendor data has been updated."
                    updatedData={successData}
                />

                {/* Error Modal */}
                <ErrorModal
                    open={errorModalOpen}
                    onClose={() => setErrorModalOpen(false)}
                    onRetry={handleErrorRetry}
                    title="An error occurred"
                    message={errorMessage}
                    errorDetails={errorDetails}
                />
            </Dialog>
            <AddProductGroupModal
                open={showAddProductGroupModal}
                onClose={() => setShowAddProductGroupModal(false)}
                onSuccess={handleProductGroupAdded}
            />
        </>
    )
}

export default EditVendorModal
