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
    TextField,
    Grid,
    CircularProgress,
    Alert,
    Box,
    Divider,
    Typography,
    Card,
    CardContent,
    CardHeader,
    Chip,
    IconButton,
    Collapse
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
import { FftStatusChip } from '../components/fftStatus'

// Services & Utils Imports
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import FindVendorServices from '@_workspace/services/_find-vendor/FindVendorServices'
import { fetchProductGroups } from '@/_workspace/react-select/async-promise-load-options/find-vendor/fetchFindVendor'
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

interface EditVendorModalProps {
    open: boolean
    onClose: () => void
    vendorId: number | null
    onSuccess?: () => void
}

const EditVendorModal = ({ open, onClose, vendorId, onSuccess: onSaveSuccess }: EditVendorModalProps) => {
    // Hooks
    const { data: vendorQueryData, isLoading: isLoadingVendor } = useGetVendor(vendorId)
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

    // Derived states
    const loading = isLoadingVendor || (!!vendorId && !vendorQueryData) // Show loading if fetching or if we have ID but no data yet
    const saving = updateVendor.isPending

    const [error, setError] = useState<string | null>(null)
    const [editingMode, setEditingMode] = useState<'view' | 'edit'>('view')
    const [expandedSections, setExpandedSections] = useState<string[]>(['company', 'contacts', 'products'])

    // RHF Setup
    const { control, handleSubmit, reset, watch, formState: { errors }, getValues, setValue } = useForm<EditVendorSchemaType>({
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
    const [vendorFftCode, setVendorFftCode] = useState<string | null | undefined>(undefined)
    const [vendorFftStatus, setVendorFftStatus] = useState<number | null | undefined>(undefined)

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

    // Populate form when data is available
    useEffect(() => {
        if (vendorQueryData && open) {
            const { comprehensive } = vendorQueryData

            setOriginalData(JSON.parse(JSON.stringify(comprehensive)))
            reset(comprehensive)

            setVendorFftCode(comprehensive.fft_vendor_code)
            setVendorFftStatus(comprehensive.fft_status != null ? Number(comprehensive.fft_status) : null)

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
    const handleSaveClick = () => {
        setConfirmModalOpen(true)
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
            <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h5" component="div">
                            {editingMode === 'edit' ? 'Edit Vendor' : 'Vendor Details'}
                        </Typography>
                        {vendorFftCode && (
                            <Chip
                                label={`Code: ${vendorFftCode}`}
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                        )}
                        {vendorFftStatus != null && (
                            <FftStatusChip value={vendorFftStatus} />
                        )}
                        {/* Enable/Disable Switch */}
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
                                        />
                                    }
                                    label={field.value === 1 ? "Active" : "Inactive"}
                                    labelPlacement="end"
                                    sx={{ ml: 2, mr: 0 }}
                                />
                            )}
                        />
                    </Box>
                    <IconButton
                        onClick={toggleEditMode}
                        disabled={loading}
                        color={editingMode === 'edit' ? 'success' : 'primary'}
                        sx={{
                            bgcolor: editingMode === 'edit' ? 'success.light' : 'primary.light',
                            '&:hover': {
                                bgcolor: editingMode === 'edit' ? 'success.main' : 'primary.main',
                                color: 'white'
                            }
                        }}
                    >
                        <EditIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ p: 3, maxHeight: '70vh', overflow: 'auto' }}>
                    {loading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
                            <CircularProgress />
                            <Typography variant="body1" sx={{ ml: 2 }}>Loading vendor details...</Typography>
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ mt: 2 }}>
                                {/* Company Information */}
                                <Card sx={{ mb: 2 }} style={{ overflow: 'visible', zIndex: 4 }}>
                                    <CardHeader
                                        title={
                                            <Typography variant="h6" color="primary">
                                                <i className="tabler-building" style={{ marginRight: 8 }} />
                                                Company Details
                                            </Typography>
                                        }
                                        action={
                                            <IconButton size='small' onClick={() => {
                                                setExpandedSections(prev =>
                                                    prev.includes('company')
                                                        ? prev.filter(s => s !== 'company')
                                                        : [...prev, 'company']
                                                )
                                            }}>
                                                <i className={classNames(
                                                    expandedSections.includes('company') ? 'tabler-chevron-up' : 'tabler-chevron-down',
                                                    'text-xl'
                                                )} />
                                            </IconButton>
                                        }
                                    />
                                    <Collapse in={expandedSections.includes('company')}>
                                        <CardContent>
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
                                                <Grid item xs={12}>
                                                    <Divider sx={{ my: 1 }}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Company Info
                                                        </Typography>
                                                    </Divider>
                                                </Grid>
                                            </Grid>
                                            {/* Company Audit Info */}
                                            <Box sx={{ mt: 2, display: 'flex', gap: 4, color: 'text.secondary' }}>
                                                <Box>
                                                    <Typography variant="caption" display="block">Created By</Typography>
                                                    <Typography variant="body2">{originalData?.CREATE_BY || '-'}</Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" display="block">Created Date</Typography>
                                                    <Typography variant="body2">
                                                        {originalData?.CREATE_DATE ? new Date(originalData.CREATE_DATE).toLocaleDateString('th-TH') : '-'}
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" display="block">Last Update By</Typography>
                                                    <Typography variant="body2">{originalData?.UPDATE_BY || '-'}</Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" display="block">Last Update Date</Typography>
                                                    <Typography variant="body2">
                                                        {originalData?.UPDATE_DATE ? new Date(originalData.UPDATE_DATE).toLocaleDateString('th-TH') : '-'}
                                                    </Typography>
                                                </Box>
                                            </Box>    </CardContent>
                                    </Collapse>
                                </Card>

                                {/* Contacts */}
                                <Card sx={{ mt: 1 }} style={{ overflow: 'visible', zIndex: 3 }}>
                                    <CardHeader
                                        title={
                                            <Typography variant="h6" color="primary">
                                                <i className="tabler-users" style={{ marginRight: 8 }} />
                                                Contacts ({contactFields.length})
                                            </Typography>
                                        }
                                        action={
                                            <IconButton size='small' onClick={() => {
                                                setExpandedSections(prev =>
                                                    prev.includes('contacts')
                                                        ? prev.filter(s => s !== 'contacts')
                                                        : [...prev, 'contacts']
                                                )
                                            }}>
                                                <i className={classNames(
                                                    expandedSections.includes('contacts') ? 'tabler-chevron-up' : 'tabler-chevron-down',
                                                    'text-xl'
                                                )} />
                                            </IconButton>
                                        }
                                    />
                                    <Collapse in={expandedSections.includes('contacts')}>
                                        <CardContent>
                                            <Grid container spacing={4}>
                                                {contactFields.map((contact, index) => (
                                                    <Grid item xs={12} key={contact.id}>
                                                        <Card variant="outlined" sx={{ bgcolor: 'background.paper', height: '100%', position: 'relative' }}>
                                                            <CardContent>
                                                                <Grid container spacing={3}>
                                                                    <Grid item xs={12}>
                                                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                                                            <Typography variant="subtitle1" color="primary">
                                                                                Contact {index + 1}
                                                                                {!contact.vendor_contact_id && <Chip label="New" size="small" color="success" sx={{ ml: 1, height: 20, fontSize: '0.65rem' }} />}
                                                                            </Typography>
                                                                            {!contact.vendor_contact_id && editingMode === 'edit' && (
                                                                                <IconButton size="small" color="error" onClick={() => removeContact(index)}>
                                                                                    <i className="tabler-trash" />
                                                                                </IconButton>
                                                                            )}
                                                                        </Box>
                                                                        <Divider sx={{ mt: 1, mb: 2 }} />
                                                                    </Grid>
                                                                    <Grid item xs={12} sm={6} md={3}>
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
                                                                    <Grid item xs={12} sm={6} md={3}>
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
                                                                    <Grid item xs={12} sm={6} md={3}>
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
                                                                    <Grid item xs={12} sm={6} md={3}>
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
                                                            </CardContent>
                                                        </Card>
                                                    </Grid>
                                                ))}
                                                {editingMode === 'edit' && (
                                                    <Grid item xs={12}>
                                                        <Button
                                                            variant="outlined"
                                                            startIcon={<i className="tabler-plus" />}
                                                            onClick={() => appendContact({ contact_name: '' })}
                                                            fullWidth
                                                        >
                                                            Add Contact
                                                        </Button>
                                                    </Grid>
                                                )}
                                            </Grid>
                                        </CardContent>
                                    </Collapse>
                                </Card>

                                {/* Products */}
                                <Card sx={{ mt: 1 }} style={{ overflow: 'visible', zIndex: 2 }}>
                                    <CardHeader
                                        title={
                                            <Typography variant="h6" color="primary">
                                                <i className="tabler-package" style={{ marginRight: 8 }} />
                                                Products ({productFields.length})
                                            </Typography>
                                        }
                                        action={
                                            <IconButton size='small' onClick={() => {
                                                setExpandedSections(prev =>
                                                    prev.includes('products')
                                                        ? prev.filter(s => s !== 'products')
                                                        : [...prev, 'products']
                                                )
                                            }}>
                                                <i className={classNames(
                                                    expandedSections.includes('products') ? 'tabler-chevron-up' : 'tabler-chevron-down',
                                                    'text-xl'
                                                )} />
                                            </IconButton>
                                        }
                                    />
                                    <Collapse in={expandedSections.includes('products')}>
                                        <CardContent>
                                            <Grid container spacing={4}>
                                                {productFields.map((product, index) => (
                                                    <Grid item xs={12} key={product.id}>
                                                        <Card variant="outlined" sx={{ bgcolor: 'background.paper', height: '100%' }}>
                                                            <CardContent>
                                                                <Grid container spacing={3}>
                                                                    <Grid item xs={12}>
                                                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                                                            <Typography variant="subtitle1" color="primary">
                                                                                Product {index + 1}
                                                                                {!product.vendor_product_id && <Chip label="New" size="small" color="success" sx={{ ml: 1, height: 20, fontSize: '0.65rem' }} />}
                                                                            </Typography>
                                                                            {editingMode === 'edit' && (
                                                                                <IconButton size="small" color="error" onClick={() => removeProduct(index)}>
                                                                                    <i className="tabler-trash" />
                                                                                </IconButton>
                                                                            )}
                                                                        </Box>
                                                                        <Divider sx={{ mt: 1, mb: 2 }} />
                                                                    </Grid>

                                                                    <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                            <Controller
                                                                                name={`products.${index}.product_group_id`}
                                                                                control={control}
                                                                                render={({ field }) => (
                                                                                    <AsyncSelectCustom
                                                                                        key={`product-group-${index}-${productGroupRefreshKey}`}
                                                                                        label='Product Group'
                                                                                        {...field}
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
                                                                                sx={{ minWidth: 38, width: 38, height: 38, p: 0, flexShrink: 0, mt: 0.5 }}
                                                                                title='Add Product Group'
                                                                            >
                                                                                <i className='tabler-plus' />
                                                                            </Button>
                                                                        )}
                                                                    </Grid>
                                                                    <Grid item xs={12} sm={6} md={3}>
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
                                                                    <Grid item xs={12} sm={6} md={3}>
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
                                                                    <Grid item xs={12} sm={6} md={3}>
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

                                                                    {/* Product Metadata */}
                                                                    {product.vendor_product_id && (
                                                                        <Grid item xs={12}>
                                                                            <Divider sx={{ my: 1 }}>
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                    Product Info
                                                                                </Typography>
                                                                            </Divider>
                                                                            <Box sx={{ mt: 1, mb: 1, display: 'flex', gap: 4, color: 'text.secondary' }}>
                                                                                <Box>
                                                                                    <Typography variant="caption" display="block">Created By</Typography>
                                                                                    <Typography variant="body2" fontSize="0.75rem">{product.CREATE_BY || 'N/A'}</Typography>
                                                                                </Box>
                                                                                <Box>
                                                                                    <Typography variant="caption" display="block">Created Date</Typography>
                                                                                    <Typography variant="body2" fontSize="0.75rem">
                                                                                        {product.CREATE_DATE ? new Date(product.CREATE_DATE).toLocaleDateString('th-TH') : 'N/A'}
                                                                                    </Typography>
                                                                                </Box>
                                                                                <Box>
                                                                                    <Typography variant="caption" display="block">Last Update By</Typography>
                                                                                    <Typography variant="body2" fontSize="0.75rem">{product.UPDATE_BY || 'N/A'}</Typography>
                                                                                </Box>
                                                                                <Box>
                                                                                    <Typography variant="caption" display="block">Last Update Date</Typography>
                                                                                    <Typography variant="body2" fontSize="0.75rem">
                                                                                        {product.UPDATE_DATE ? new Date(product.UPDATE_DATE).toLocaleDateString('th-TH') : 'N/A'}
                                                                                    </Typography>
                                                                                </Box>
                                                                            </Box>
                                                                        </Grid>
                                                                    )}
                                                                </Grid>
                                                            </CardContent>
                                                        </Card>
                                                    </Grid>
                                                ))}
                                                {editingMode === 'edit' && (
                                                    <Grid item xs={12}>
                                                        <Button
                                                            variant="outlined"
                                                            startIcon={<i className="tabler-plus" />}
                                                            onClick={() => appendProduct({ product_name: '' })}
                                                            fullWidth
                                                        >
                                                            Add Product
                                                        </Button>
                                                    </Grid>
                                                )}
                                            </Grid>
                                        </CardContent >
                                    </Collapse >
                                </Card >

                            </Box >
                        </>
                    )
                    }
                </DialogContent >
                <DialogActions sx={{ justifyContent: 'flex-start', p: 3, gap: 2 }}>
                    {editingMode === 'edit' && (
                        <Button
                            onClick={handleSubmit(onSubmit)}
                            variant="contained"
                            disabled={loading || saving}
                            startIcon={saving ? <CircularProgress size={16} /> : null}
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </Button>
                    )}
                    <Button
                        onClick={handleClose}
                        disabled={saving}
                        variant="tonal"
                        color="secondary"
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
            </Dialog >
            <AddProductGroupModal
                open={showAddProductGroupModal}
                onClose={() => setShowAddProductGroupModal(false)}
                onSuccess={handleProductGroupAdded}
            />
        </>
    )
}

export default EditVendorModal
