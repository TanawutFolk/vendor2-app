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
import { fetchProductGroups, fetchVendorTypes } from '@/_workspace/react-select/async-promise-load-options/find-vendor/fetchFindVendor'
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
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
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

    // Fetch comprehensive vendor data when modal opens
    useEffect(() => {
        if (open && vendorId) {
            fetchVendorData()
        }
    }, [open, vendorId])

    const fetchVendorData = async () => {
        if (!vendorId) return

        setLoading(true)
        setError(null)

        try {
            // Use search-based method to get all contacts and products of the company
            try {
                const comprehensiveResult = await FindVendorServices.getComprehensiveByVendorId(vendorId)

                const { vendor: basicVendorData, contacts: contactRecords, products: productRecords } = comprehensiveResult

                // Transform contacts to proper format
                const allContacts: VendorContactI[] = contactRecords.map(record => ({
                    vendor_contact_id: record.vendor_contact_id,
                    contact_name: record.contact_name || '',
                    position: record.position || '',
                    tel_phone: record.tel_phone || '',
                    email: record.email || '',
                    CREATE_BY: record.contact_create_by || '',
                    UPDATE_BY: record.contact_update_by || '',
                    CREATE_DATE: record.contact_create_date || '',
                    UPDATE_DATE: record.contact_update_date || ''
                }))

                // Transform products to proper format  
                const allProducts: VendorProductI[] = productRecords.map(record => ({
                    vendor_product_id: record.vendor_product_id,
                    product_group_id: record.product_group_id,
                    group_name: record.group_name || '',
                    maker_name: record.maker_name || '',
                    product_name: record.product_name || '',
                    model_list: record.model_list || '',
                    UPDATE_BY: record.product_update_by || '',
                    UPDATE_DATE: record.product_update_date || ''
                }))

                // Combine all data into comprehensive format
                const comprehensiveData: VendorComprehensiveI = {
                    vendor_id: basicVendorData.vendor_id,
                    fft_vendor_code: basicVendorData.fft_vendor_code,
                    fft_status: basicVendorData.fft_status,
                    company_name: basicVendorData.company_name,
                    vendor_type_id: basicVendorData.vendor_type_id,
                    vendor_type_name: basicVendorData.vendor_type_name,
                    province: basicVendorData.province,
                    postal_code: basicVendorData.postal_code,
                    website: basicVendorData.website,
                    address: basicVendorData.address,
                    tel_center: basicVendorData.tel_center,
                    contacts: allContacts.length > 0 ? allContacts : [{
                        vendor_contact_id: basicVendorData.vendor_contact_id,
                        contact_name: basicVendorData.contact_name || '',
                        position: basicVendorData.position || '',
                        tel_phone: basicVendorData.tel_phone || '',
                        email: basicVendorData.email || ''
                    }],
                    products: allProducts.length > 0 ? allProducts : [{
                        vendor_product_id: basicVendorData.vendor_product_id,
                        product_group_id: basicVendorData.product_group_id,
                        group_name: basicVendorData.group_name || '',
                        maker_name: basicVendorData.maker_name || '',
                        product_name: basicVendorData.product_name || '',
                        model_list: basicVendorData.model_list || ''
                    }],
                    CREATE_BY: basicVendorData.CREATE_BY,
                    UPDATE_BY: basicVendorData.UPDATE_BY,
                    CREATE_DATE: basicVendorData.CREATE_DATE,
                    UPDATE_DATE: basicVendorData.UPDATE_DATE,
                    INUSE: basicVendorData.INUSE
                }

                setOriginalData(JSON.parse(JSON.stringify(comprehensiveData))) // Deep copy for comparison
                reset(comprehensiveData) // RHF: Reset form with fetched data
                setVendorFftCode(basicVendorData.fft_vendor_code)
                setVendorFftStatus(basicVendorData.fft_status != null ? Number(basicVendorData.fft_status) : null)
                return

            } catch (searchErr) {
                console.error('Search-based comprehensive method failed:', searchErr)
            }

            // Final fallback: Use basic getById only
            const fallbackResponse = await FindVendorServices.getById(vendorId)
            if (fallbackResponse.data.Status) {
                const basicData = fallbackResponse.data.ResultOnDb
                const fallbackData = {
                    vendor_id: basicData.vendor_id,
                    fft_vendor_code: basicData.fft_vendor_code,
                    fft_status: basicData.fft_status,
                    company_name: basicData.company_name,
                    vendor_type_id: basicData.vendor_type_id,
                    vendor_type_name: basicData.vendor_type_name,
                    province: basicData.province,
                    postal_code: basicData.postal_code,
                    website: basicData.website,
                    address: basicData.address,
                    tel_center: basicData.tel_center,
                    contacts: [{
                        vendor_contact_id: basicData.vendor_contact_id,
                        contact_name: basicData.contact_name || '',
                        position: basicData.position || '',
                        tel_phone: basicData.tel_phone || '',
                        email: basicData.email || '',
                        CREATE_BY: basicData.contact_create_by || '',
                        UPDATE_BY: basicData.contact_update_by || '',
                        CREATE_DATE: basicData.contact_create_date || '',
                        UPDATE_DATE: basicData.contact_update_date || ''
                    }],
                    products: [{
                        vendor_product_id: basicData.vendor_product_id,
                        product_group_id: basicData.product_group_id,
                        group_name: basicData.group_name || '',
                        maker_name: basicData.maker_name || '',
                        product_name: basicData.product_name || '',
                        model_list: basicData.model_list || '',
                        UPDATE_BY: basicData.product_update_by || '',
                        UPDATE_DATE: basicData.product_update_date || ''
                    }],
                    CREATE_BY: basicData.CREATE_BY,
                    UPDATE_BY: basicData.UPDATE_BY,
                    CREATE_DATE: basicData.CREATE_DATE,
                    UPDATE_DATE: basicData.UPDATE_DATE,
                    INUSE: basicData.INUSE
                }
                setOriginalData(JSON.parse(JSON.stringify(fallbackData))) // Deep copy
                reset(fallbackData)
                setDeletedContactIds([])
                setDeletedProductIds([])
                setVendorFftCode(basicData.fft_vendor_code)
                setVendorFftStatus(basicData.fft_status != null ? Number(basicData.fft_status) : null)
            }
        } catch (err: any) {
            setError(err?.message || 'Failed to fetch vendor data')
        } finally {
            setLoading(false)
        }
    }

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

        setSaving(true)
        setError(null)

        const userCode = getUserData().EMPLOYEE_CODE || 'SYSTEM'
        let updatedCount = 0

        // Helper: Check if vendor fields have changed
        const hasVendorFieldsChanged = (original: VendorComprehensiveI, current: EditVendorSchemaType): boolean => {
            const vendorFields = ['company_name', 'province', 'postal_code', 'website', 'address', 'tel_center', 'INUSE'] as const
            if (vendorFields.some(field => (original as any)[field] != (current as any)[field])) return true
            // Special handling for object-based vendor_type_id
            if (original.vendor_type_id !== ((current.vendor_type_id as any)?.value || null)) return true
            return false
        }

        // Helper: Get changed contacts
        const getChangedContacts = (original: VendorContactI[], current: typeof data.contacts): VendorContactI[] => {
            if (!current) return []
            const changed: VendorContactI[] = []
            current.forEach((currentContact) => {
                if (currentContact.vendor_contact_id) {
                    const originalContact = original.find(c => c.vendor_contact_id === currentContact.vendor_contact_id)
                    if (originalContact) {
                        const hasChanged = (
                            currentContact.contact_name !== originalContact.contact_name ||
                            currentContact.position !== originalContact.position ||
                            currentContact.tel_phone !== originalContact.tel_phone ||
                            currentContact.email !== originalContact.email
                        )
                        if (hasChanged) {
                            changed.push({ ...originalContact, ...currentContact } as VendorContactI)
                        }
                    }
                }
            })
            return changed
        }

        // Helper: Get changed products
        const getChangedProducts = (original: VendorProductI[], current: typeof data.products): VendorProductI[] => {
            if (!current) return []
            const changed: VendorProductI[] = []
            current.forEach((currentProduct) => {
                if (currentProduct.vendor_product_id) {
                    const originalProduct = original.find(p => p.vendor_product_id === currentProduct.vendor_product_id)
                    if (originalProduct) {
                        const hasChanged = (
                            (currentProduct.product_group_id as any)?.value !== originalProduct.product_group_id ||
                            currentProduct.maker_name !== originalProduct.maker_name ||
                            currentProduct.product_name !== originalProduct.product_name ||
                            currentProduct.model_list !== originalProduct.model_list
                        )
                        if (hasChanged) {
                            changed.push({ ...originalProduct, ...currentProduct } as VendorProductI)
                        }
                    }
                }
            })
            return changed
        }

        // Helper: Get new contacts (no ID)
        const getNewContacts = (current: typeof data.contacts) => {
            return current?.filter(c => !c.vendor_contact_id) || []
        }

        // Helper: Get new products (no ID)
        const getNewProducts = (current: typeof data.products) => {
            return current?.filter(p => !p.vendor_product_id) || []
        }

        // Helper: Generate summary
        const generateChangesSummary = (original: VendorComprehensiveI, updated: EditVendorSchemaType) => {
            const changes = {
                added: [] as Array<{ type: string; description: string }>,
                removed: [] as Array<{ type: string; description: string }>,
                modified: [] as Array<{ type: string; description: string; before?: string; after?: string }>
            }

            // Vendor Fields
            const vendorFields = [
                { key: 'company_name', label: 'Company Name' },
                { key: 'province', label: 'Province' },
                { key: 'postal_code', label: 'Postal Code' },
                { key: 'website', label: 'Website' },
                { key: 'address', label: 'Address' },
                { key: 'tel_center', label: 'Tel Center' }
            ]

            vendorFields.forEach(field => {
                const originalValue = (original as any)[field.key] || ''
                const updatedValue = (updated as any)[field.key] || ''
                if (originalValue != updatedValue) {
                    changes.modified.push({
                        type: 'Company',
                        description: field.label,
                        before: originalValue,
                        after: updatedValue
                    })
                }
            })

            return changes
        }

        if (!originalData) return

        try {
            // 1. Check and update vendor fields if changed
            if (hasVendorFieldsChanged(originalData, data)) {
                const vendorUpdateData: VendorUpdateRequestI = {
                    vendor_id: vendorId,
                    company_name: data.company_name,
                    vendor_type_id: (data.vendor_type_id as any)?.value || null,
                    province: data.province ?? undefined,
                    postal_code: data.postal_code ?? undefined,
                    website: data.website ?? undefined,
                    address: data.address ?? undefined,
                    tel_center: data.tel_center ?? undefined,
                    INUSE: data.INUSE ?? undefined,
                    UPDATE_BY: userCode
                }

                const vendorResponse = await FindVendorServices.update(vendorId, vendorUpdateData)
                if (!vendorResponse.data.Status) {
                    throw new Error(`Vendor update failed: ${vendorResponse.data.Message}`)
                }
                updatedCount++
            }

            // 2. Update changed contacts
            const changedContacts = getChangedContacts(originalData.contacts, data.contacts)
            for (const contact of changedContacts) {
                const contactUpdateData: VendorUpdateRequestI = {
                    vendor_id: vendorId,
                    vendor_contact_id: contact.vendor_contact_id,
                    contact_name: contact.contact_name,
                    tel_phone: contact.tel_phone ?? undefined,
                    email: contact.email ?? undefined,
                    position: contact.position ?? undefined,
                    UPDATE_BY: userCode
                }

                const contactResponse = await FindVendorServices.update(vendorId, contactUpdateData)
                if (!contactResponse.data.Status) {
                    throw new Error(`Contact update failed: ${contactResponse.data.Message}`)
                }
                updatedCount++
            }

            // 3. Update only changed products (sequential to prevent race conditions)
            const changedProducts = getChangedProducts(originalData.products, data.products)
            for (const product of changedProducts) {
                const productUpdateData: VendorUpdateRequestI = {
                    vendor_id: vendorId,
                    vendor_product_id: product.vendor_product_id,
                    product_group_id: product.product_group_id ?? undefined,
                    maker_name: product.maker_name ?? undefined,
                    product_name: product.product_name,
                    model_list: product.model_list ?? undefined,
                    UPDATE_BY: userCode
                }

                const productResponse = await FindVendorServices.update(vendorId, productUpdateData)
                if (!productResponse.data.Status) {
                    throw new Error(`Product update failed: ${productResponse.data.Message}`)
                }
                updatedCount++
            }

            // 4. Create new contacts
            const newContacts = getNewContacts(data.contacts)
            for (const contact of newContacts) {
                const contactCreateData: VendorUpdateRequestI = {
                    vendor_id: vendorId,
                    // No vendor_contact_id means create
                    contact_name: contact.contact_name,
                    tel_phone: contact.tel_phone ?? undefined,
                    email: contact.email ?? undefined,
                    position: contact.position ?? undefined,
                    UPDATE_BY: userCode
                }

                const contactResponse = await FindVendorServices.update(vendorId, contactCreateData)
                if (!contactResponse.data.Status) {
                    throw new Error(`New contact creation failed: ${contactResponse.data.Message}`)
                }
                updatedCount++
            }

            // 5. Create new products
            const newProducts = getNewProducts(data.products)
            for (const product of newProducts) {
                const productCreateData: VendorUpdateRequestI = {
                    vendor_id: vendorId,
                    // No vendor_product_id means create
                    product_group_id: product.product_group_id ?? undefined,
                    maker_name: product.maker_name ?? undefined,
                    product_name: product.product_name,
                    model_list: product.model_list ?? undefined,
                    UPDATE_BY: userCode
                }

                const productResponse = await FindVendorServices.update(vendorId, productCreateData)
                if (!productResponse.data.Status) {
                    throw new Error(`New product creation failed: ${productResponse.data.Message}`)
                }
                updatedCount++
            }

            // Check if there were any changes
            if (updatedCount === 0) {
                setErrorMessage('No changes detected')
                setErrorDetails('Please modify data before saving')
                setErrorModalOpen(true)
                return
            }

            // Generate changes summary
            const changes = generateChangesSummary(originalData, data)

            // Show success modal with updated data
            setSuccessData({
                vendor: data,
                contacts: data.contacts,
                products: data.products,
                updateSummary: {
                    vendor: hasVendorFieldsChanged(originalData, data) ? 1 : 0,
                    contacts: changedContacts.length + getNewContacts(data.contacts).length + deletedContactIds.length,
                    products: changedProducts.length + getNewProducts(data.products).length + deletedProductIds.length,
                    successful: updatedCount,
                    total: updatedCount
                },
                changes: changes
            })
            setSuccessModalOpen(true)

            onSaveSuccess?.()
            setEditingMode('view')
            // Refresh data
            await fetchVendorData()

        } catch (err: any) {
            setErrorMessage(err?.message || 'Failed to save changes')
            setErrorDetails(err)
            setErrorModalOpen(true)
        } finally {
            setSaving(false)
        }
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
