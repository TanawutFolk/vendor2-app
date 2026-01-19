'use client'

import React, { useEffect, useState, useCallback } from 'react'
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
import classNames from 'classnames'
import EditIcon from '@mui/icons-material/Edit'
import AsyncSelectCustom from '@components/react-select/AsyncSelectCustom'
import FindVendorServices from '@_workspace/services/_find-vendor/FindVendorServices'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import ConfirmModal from './ConfirmModal'
import SuccessModal from './SuccessModal'
import ErrorModal from './ErrorModal'
import { FftStatusChip } from '../components/fftStatus'
import type {
    VendorComprehensiveI,
    VendorContactI,
    VendorProductI,
    VendorUpdateRequestI
} from '@_workspace/types/_find-vendor/FindVendorTypes'

interface EditVendorModalProps {
    open: boolean
    onClose: () => void
    vendorId: number | null
    onSuccess?: () => void
}

const EditVendorModal = ({ open, onClose, vendorId, onSuccess }: EditVendorModalProps) => {
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [vendorData, setVendorData] = useState<VendorComprehensiveI | null>(null)
    const [editingMode, setEditingMode] = useState<'view' | 'edit'>('view')
    const [expandedSections, setExpandedSections] = useState<string[]>(['company', 'contacts', 'products'])
    const [originalData, setOriginalData] = useState<VendorComprehensiveI | null>(null)

    // Modal states
    const [confirmModalOpen, setConfirmModalOpen] = useState(false)
    const [successModalOpen, setSuccessModalOpen] = useState(false)
    const [errorModalOpen, setErrorModalOpen] = useState(false)
    const [successData, setSuccessData] = useState<any>(null)
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [errorDetails, setErrorDetails] = useState<string>('')

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
                    seller_name: record.seller_name || '',
                    position: record.position || '',
                    tel_phone: record.tel_phone || '',
                    email: record.email || ''
                }))

                // Transform products to proper format  
                const allProducts: VendorProductI[] = productRecords.map(record => ({
                    vendor_product_id: record.vendor_product_id,
                    group_name: record.group_name || '',
                    maker_name: record.maker_name || '',
                    product_name: record.product_name || '',
                    model_list: record.model_list || ''
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
                        seller_name: basicVendorData.seller_name || '',
                        position: basicVendorData.position || '',
                        tel_phone: basicVendorData.tel_phone || '',
                        email: basicVendorData.email || ''
                    }],
                    products: allProducts.length > 0 ? allProducts : [{
                        vendor_product_id: basicVendorData.vendor_product_id,
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

                setVendorData(comprehensiveData)
                setOriginalData(JSON.parse(JSON.stringify(comprehensiveData))) // Deep copy for comparison
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
                        seller_name: basicData.seller_name || '',
                        position: basicData.position || '',
                        tel_phone: basicData.tel_phone || '',
                        email: basicData.email || ''
                    }],
                    products: [{
                        vendor_product_id: basicData.vendor_product_id,
                        group_name: basicData.group_name || '',
                        maker_name: basicData.maker_name || '',
                        product_name: basicData.product_name || '',
                        model_list: basicData.model_list || ''
                    }],
                    CREATE_BY: basicData.CREATE_BY,
                    UPDATE_BY: basicData.UPDATE_BY,
                    CREATE_DATE: basicData.CREATE_DATE,
                    UPDATE_DATE: basicData.UPDATE_DATE,
                    INUSE: basicData.INUSE
                }
                setVendorData(fallbackData)
                setOriginalData(JSON.parse(JSON.stringify(fallbackData))) // Deep copy
            }

        } catch (err: any) {
            setError(err?.message || 'Failed to fetch vendor data')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (field: keyof VendorComprehensiveI) => (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!vendorData) return
        setVendorData(prev => prev ? ({
            ...prev,
            [field]: event.target.value
        }) : null)
    }

    const handleContactChange = (index: number, field: keyof VendorContactI) => (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!vendorData) return
        const updatedContacts = [...vendorData.contacts]
        updatedContacts[index] = {
            ...updatedContacts[index],
            [field]: event.target.value
        }
        setVendorData(prev => prev ? ({ ...prev, contacts: updatedContacts }) : null)
    }

    const handleProductChange = (index: number, field: keyof VendorProductI) => (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!vendorData) return
        const updatedProducts = [...vendorData.products]
        updatedProducts[index] = {
            ...updatedProducts[index],
            [field]: event.target.value
        }
        setVendorData(prev => prev ? ({ ...prev, products: updatedProducts }) : null)
    }

    // Compare data and generate changes summary
    const generateChangesSummary = (original: VendorComprehensiveI, updated: VendorComprehensiveI) => {
        const changes = {
            added: [] as Array<{ type: string; description: string }>,
            removed: [] as Array<{ type: string; description: string }>,
            modified: [] as Array<{ type: string; description: string; before?: string; after?: string }>
        }

        // Compare vendor fields
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

            if (originalValue !== updatedValue) {
                changes.modified.push({
                    type: 'Company',
                    description: field.label,
                    before: originalValue,
                    after: updatedValue
                })
            }
        })

        // Compare contacts
        original.contacts.forEach((originalContact, index) => {
            const updatedContact = updated.contacts[index]
            if (updatedContact) {
                const contactFields = [
                    { key: 'seller_name', label: 'Name' },
                    { key: 'position', label: 'Position' },
                    { key: 'tel_phone', label: 'Phone' },
                    { key: 'email', label: 'Email' }
                ]

                contactFields.forEach(field => {
                    const originalValue = (originalContact as any)[field.key] || ''
                    const updatedValue = (updatedContact as any)[field.key] || ''

                    if (originalValue !== updatedValue) {
                        changes.modified.push({
                            type: `Contact ${index + 1}`,
                            description: field.label,
                            before: originalValue,
                            after: updatedValue
                        })
                    }
                })
            }
        })

        // Compare products
        original.products.forEach((originalProduct, index) => {
            const updatedProduct = updated.products[index]
            if (updatedProduct) {
                const productFields = [
                    { key: 'product_name', label: 'Product Name' },
                    { key: 'maker_name', label: 'Maker' },
                    { key: 'group_name', label: 'Product Group' },
                    { key: 'model_list', label: 'Model List' }
                ]

                productFields.forEach(field => {
                    const originalValue = (originalProduct as any)[field.key] || ''
                    const updatedValue = (updatedProduct as any)[field.key] || ''

                    if (originalValue !== updatedValue) {
                        changes.modified.push({
                            type: `Product ${index + 1}`,
                            description: field.label,
                            before: originalValue,
                            after: updatedValue
                        })
                    }
                })
            }
        })

        return changes
    }

    const toggleEditMode = () => {
        setEditingMode(prev => prev === 'view' ? 'edit' : 'view')
    }



    // Helper: Check if vendor fields have changed
    const hasVendorFieldsChanged = (original: VendorComprehensiveI, current: VendorComprehensiveI): boolean => {
        const vendorFields = ['company_name', 'vendor_type_id', 'province', 'postal_code', 'website', 'address', 'tel_center']
        return vendorFields.some(field => (original as any)[field] !== (current as any)[field])
    }

    // Helper: Get changed contacts
    const getChangedContacts = (original: VendorContactI[], current: VendorContactI[]): VendorContactI[] => {
        const changed: VendorContactI[] = []
        current.forEach((currentContact, index) => {
            const originalContact = original[index]
            if (originalContact && currentContact.vendor_contact_id) {
                const hasChanged = (
                    currentContact.seller_name !== originalContact.seller_name ||
                    currentContact.position !== originalContact.position ||
                    currentContact.tel_phone !== originalContact.tel_phone ||
                    currentContact.email !== originalContact.email
                )
                if (hasChanged) {
                    changed.push(currentContact)
                }
            }
        })
        return changed
    }

    // Helper: Get changed products
    const getChangedProducts = (original: VendorProductI[], current: VendorProductI[]): VendorProductI[] => {
        const changed: VendorProductI[] = []
        current.forEach((currentProduct, index) => {
            const originalProduct = original[index]
            if (originalProduct && currentProduct.vendor_product_id) {
                const hasChanged = (
                    currentProduct.group_name !== originalProduct.group_name ||
                    currentProduct.maker_name !== originalProduct.maker_name ||
                    currentProduct.product_name !== originalProduct.product_name ||
                    currentProduct.model_list !== originalProduct.model_list
                )
                if (hasChanged) {
                    changed.push(currentProduct)
                }
            }
        })
        return changed
    }

    // Modal handlers
    const handleSaveClick = () => {
        setConfirmModalOpen(true)
    }

    const handleConfirmSave = async () => {
        setConfirmModalOpen(false)
        await performSave()
    }

    const performSave = async () => {
        if (!vendorId || !vendorData || !originalData) return

        setSaving(true)
        setError(null)

        try {
            const userCode = getUserData().EMPLOYEE_CODE || 'SYSTEM'
            let updatedCount = 0

            // 1. Check and update vendor fields if changed
            if (hasVendorFieldsChanged(originalData, vendorData)) {
                const vendorUpdateData: VendorUpdateRequestI = {
                    vendor_id: vendorId,
                    company_name: vendorData.company_name,
                    vendor_type_id: vendorData.vendor_type_id,
                    province: vendorData.province,
                    postal_code: vendorData.postal_code,
                    website: vendorData.website,
                    address: vendorData.address,
                    tel_center: vendorData.tel_center,
                    UPDATE_BY: userCode
                }

                const vendorResponse = await FindVendorServices.update(vendorId, vendorUpdateData)
                if (!vendorResponse.data.Status) {
                    throw new Error(`Vendor update failed: ${vendorResponse.data.Message}`)
                }
                updatedCount++
            }

            // 2. Update only changed contacts (sequential to prevent race conditions)
            const changedContacts = getChangedContacts(originalData.contacts, vendorData.contacts)
            for (const contact of changedContacts) {
                const contactUpdateData: VendorUpdateRequestI = {
                    vendor_id: vendorId,
                    vendor_contact_id: contact.vendor_contact_id,
                    seller_name: contact.seller_name,
                    tel_phone: contact.tel_phone,
                    email: contact.email,
                    position: contact.position,
                    UPDATE_BY: userCode
                }

                const contactResponse = await FindVendorServices.update(vendorId, contactUpdateData)
                if (!contactResponse.data.Status) {
                    throw new Error(`Contact update failed: ${contactResponse.data.Message}`)
                }
                updatedCount++
            }

            // 3. Update only changed products (sequential to prevent race conditions)
            const changedProducts = getChangedProducts(originalData.products, vendorData.products)
            for (const product of changedProducts) {
                const productUpdateData: VendorUpdateRequestI = {
                    vendor_id: vendorId,
                    vendor_product_id: product.vendor_product_id,
                    group_name: product.group_name,
                    maker_name: product.maker_name,
                    product_name: product.product_name,
                    model_list: product.model_list,
                    UPDATE_BY: userCode
                }

                const productResponse = await FindVendorServices.update(vendorId, productUpdateData)
                if (!productResponse.data.Status) {
                    throw new Error(`Product update failed: ${productResponse.data.Message}`)
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
            const changes = generateChangesSummary(originalData, vendorData)

            // Show success modal with updated data
            setSuccessData({
                vendor: vendorData,
                contacts: vendorData.contacts,
                products: vendorData.products,
                updateSummary: {
                    vendor: hasVendorFieldsChanged(originalData, vendorData) ? 1 : 0,
                    contacts: changedContacts.length,
                    products: changedProducts.length,
                    successful: updatedCount,
                    total: updatedCount
                },
                changes: changes
            })
            setSuccessModalOpen(true)

            onSuccess?.()
            setEditingMode('view')
            // Refresh data
            await fetchVendorData()

        } catch (err: any) {
            setErrorMessage(err?.message || 'Failed to save changes')
            setErrorDetails(err?.stack || err?.toString() || 'Unknown error')
            setErrorModalOpen(true)
        } finally {
            setSaving(false)
        }
    }

    const handleErrorRetry = () => {
        setErrorModalOpen(false)
        performSave()
    }

    const handleSubmit = async () => {
        handleSaveClick()
    }

    const handleClose = () => {
        setVendorData(null)
        setEditingMode('view')
        setError(null)
        onClose()
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h5" component="div">
                        {editingMode === 'edit' ? 'Edit Vendor' : 'Vendor Details'}
                    </Typography>
                    {vendorData?.fft_vendor_code && (
                        <Chip
                            label={`Code: ${vendorData.fft_vendor_code}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                        />
                    )}
                    {vendorData?.fft_status !== undefined && (
                        <FftStatusChip value={vendorData.fft_status} />
                    )}
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
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {vendorData && (
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
                                                    <TextField
                                                        fullWidth
                                                        label="Company Name"
                                                        value={vendorData.company_name || ''}
                                                        onChange={handleChange('company_name')}
                                                        size="small"
                                                        disabled={editingMode === 'view'}
                                                        InputProps={{ readOnly: editingMode === 'view' }} sx={{ mb: 1 }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <AsyncSelectCustom
                                                        value={vendorData.vendor_type_id ? { value: vendorData.vendor_type_id, label: vendorData.vendor_type_name || '' } : null}
                                                        placeholder='Select Type...'
                                                        defaultOptions
                                                        cacheOptions
                                                        isClearable
                                                        loadOptions={fetchVendorTypes}
                                                        classNamePrefix='select'
                                                        onChange={(option: any) => {
                                                            setVendorData(prev => prev ? ({
                                                                ...prev,
                                                                vendor_type_id: option?.value || null,
                                                                vendor_type_name: option?.label || ''
                                                            }) : null)
                                                        }}
                                                        isDisabled={editingMode === 'view'}
                                                    />
                                                </Grid>
                                                <Grid item xs={6} md={3}>
                                                    <TextField
                                                        fullWidth
                                                        label="Province"
                                                        value={vendorData.province || ''}
                                                        onChange={handleChange('province')}
                                                        size="small"
                                                        disabled={editingMode === 'view'}
                                                        InputProps={{ readOnly: editingMode === 'view' }} sx={{ mb: 1 }} />
                                                </Grid>
                                                <Grid item xs={6} md={3}>
                                                    <TextField
                                                        fullWidth
                                                        label="Postal Code"
                                                        value={vendorData.postal_code || ''}
                                                        onChange={handleChange('postal_code')}
                                                        size="small"
                                                        disabled={editingMode === 'view'}
                                                        InputProps={{ readOnly: editingMode === 'view' }} sx={{ mb: 1 }} />
                                                </Grid>
                                                <Grid item xs={6} md={3}>
                                                    <TextField
                                                        fullWidth
                                                        label="Website"
                                                        value={vendorData.website || ''}
                                                        onChange={handleChange('website')}
                                                        size="small"
                                                        disabled={editingMode === 'view'}
                                                        InputProps={{ readOnly: editingMode === 'view' }} sx={{ mb: 1 }} />
                                                </Grid>
                                                <Grid item xs={6} md={3}>
                                                    <TextField
                                                        fullWidth
                                                        label="Tel Company"
                                                        value={vendorData.tel_center || ''}
                                                        onChange={handleChange('tel_center')}
                                                        size="small"
                                                        disabled={editingMode === 'view'}
                                                        InputProps={{ readOnly: editingMode === 'view' }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        fullWidth
                                                        label="Address"
                                                        value={vendorData.address || ''}
                                                        onChange={handleChange('address')}
                                                        size="small"
                                                        multiline
                                                        rows={2}
                                                        disabled={editingMode === 'view'}
                                                        InputProps={{ readOnly: editingMode === 'view' }}
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
                                                <Grid item xs={6}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Created By
                                                    </Typography>
                                                    <Typography variant="body2" fontSize="0.75rem">
                                                        {vendorData.CREATE_BY || 'N/A'}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Updated By
                                                    </Typography>
                                                    <Typography variant="body2" fontSize="0.75rem">
                                                        {vendorData.UPDATE_BY || 'N/A'}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Created Date
                                                    </Typography>
                                                    <Typography variant="body2" fontSize="0.75rem">
                                                        {vendorData.CREATE_DATE ? new Date(vendorData.CREATE_DATE).toLocaleDateString('th-TH') : 'N/A'}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Last Update
                                                    </Typography>
                                                    <Typography variant="body2" fontSize="0.75rem">
                                                        {vendorData.UPDATE_DATE ? new Date(vendorData.UPDATE_DATE).toLocaleDateString('th-TH') : 'N/A'}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Collapse>
                                </Card>

                                {/* Contacts */}
                                {vendorData.contacts && vendorData.contacts.length > 0 && (
                                    <Card sx={{ mt: 1 }} style={{ overflow: 'visible', zIndex: 3 }}>
                                        <CardHeader
                                            title={
                                                <Typography variant="h6" color="primary">
                                                    <i className="tabler-users" style={{ marginRight: 8 }} />
                                                    Contacts ({vendorData.contacts.length})
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
                                                <Grid container spacing={2}>
                                                    {vendorData.contacts.map((contact, index) => (
                                                        <Grid item xs={12} md={6} key={index}>
                                                            <Card variant="outlined" sx={{ bgcolor: 'background.paper', height: '100%' }}>
                                                                <CardContent>
                                                                    <Typography variant="subtitle2" gutterBottom>
                                                                        Contact {index + 1}
                                                                    </Typography>
                                                                    <Grid container spacing={1}>
                                                                        <Grid item xs={12}>
                                                                            <TextField
                                                                                fullWidth
                                                                                label="Name"
                                                                                value={contact.seller_name || ''}
                                                                                onChange={handleContactChange(index, 'seller_name')}
                                                                                size="small"
                                                                                disabled={editingMode === 'view'}
                                                                                InputProps={{ readOnly: editingMode === 'view' }} sx={{ mb: 1 }} />
                                                                        </Grid>
                                                                        <Grid item xs={12}>
                                                                            <TextField
                                                                                fullWidth
                                                                                label="Position"
                                                                                value={contact.position || ''}
                                                                                onChange={handleContactChange(index, 'position')}
                                                                                size="small"
                                                                                disabled={editingMode === 'view'}
                                                                                InputProps={{ readOnly: editingMode === 'view' }} sx={{ mb: 1 }} />
                                                                        </Grid>
                                                                        <Grid item xs={12}>
                                                                            <TextField
                                                                                fullWidth
                                                                                label="Phone"
                                                                                value={contact.tel_phone || ''}
                                                                                onChange={handleContactChange(index, 'tel_phone')}
                                                                                size="small"
                                                                                disabled={editingMode === 'view'}
                                                                                InputProps={{ readOnly: editingMode === 'view' }}
                                                                                sx={{ mb: 1 }}
                                                                            />
                                                                        </Grid>
                                                                        <Grid item xs={12}>
                                                                            <TextField
                                                                                fullWidth
                                                                                label="Email"
                                                                                value={contact.email || ''}
                                                                                onChange={handleContactChange(index, 'email')}
                                                                                size="small"
                                                                                disabled={editingMode === 'view'}
                                                                                InputProps={{ readOnly: editingMode === 'view' }}
                                                                                sx={{ mb: 1 }}
                                                                            />
                                                                        </Grid>

                                                                        {/* Contact Metadata */}
                                                                        <Grid item xs={12}>
                                                                            <Divider sx={{ my: 1 }}>
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                    Contact Info
                                                                                </Typography>
                                                                            </Divider>
                                                                        </Grid>
                                                                        <Grid item xs={6}>
                                                                            <Typography variant="caption" color="text.secondary">
                                                                                Created By
                                                                            </Typography>
                                                                            <Typography variant="body2" fontSize="0.75rem">
                                                                                {vendorData.CREATE_BY || 'N/A'}
                                                                            </Typography>
                                                                        </Grid>
                                                                        <Grid item xs={6}>
                                                                            <Typography variant="caption" color="text.secondary">
                                                                                Updated By
                                                                            </Typography>
                                                                            <Typography variant="body2" fontSize="0.75rem">
                                                                                {vendorData.UPDATE_BY || 'N/A'}
                                                                            </Typography>
                                                                        </Grid>
                                                                        <Grid item xs={6}>
                                                                            <Typography variant="caption" color="text.secondary">
                                                                                Created Date
                                                                            </Typography>
                                                                            <Typography variant="body2" fontSize="0.75rem">
                                                                                {vendorData.CREATE_DATE ? new Date(vendorData.CREATE_DATE).toLocaleDateString('th-TH') : 'N/A'}
                                                                            </Typography>
                                                                        </Grid>
                                                                        <Grid item xs={6}>
                                                                            <Typography variant="caption" color="text.secondary">
                                                                                Last Update
                                                                            </Typography>
                                                                            <Typography variant="body2" fontSize="0.75rem">
                                                                                {vendorData.UPDATE_DATE ? new Date(vendorData.UPDATE_DATE).toLocaleDateString('th-TH') : 'N/A'}
                                                                            </Typography>
                                                                        </Grid>
                                                                    </Grid>
                                                                </CardContent>
                                                            </Card>
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            </CardContent>
                                        </Collapse>
                                    </Card>
                                )}

                                {/* Products */}
                                {vendorData.products && vendorData.products.length > 0 && (
                                    <Card sx={{ mt: 1 }} style={{ overflow: 'visible', zIndex: 2 }}>
                                        <CardHeader
                                            title={
                                                <Typography variant="h6" color="primary">
                                                    <i className="tabler-package" style={{ marginRight: 8 }} />
                                                    Products ({vendorData.products.length})
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
                                                <Grid container spacing={2}>
                                                    {vendorData.products.map((product, index) => (
                                                        <Grid item xs={12} md={6} key={index}>
                                                            <Card variant="outlined" sx={{ bgcolor: 'background.paper', height: '100%' }}>
                                                                <CardContent>
                                                                    <Typography variant="subtitle2" gutterBottom>
                                                                        Product {index + 1}
                                                                    </Typography>
                                                                    <Grid container spacing={1}>
                                                                        <Grid item xs={12}>
                                                                            <TextField
                                                                                fullWidth
                                                                                label="Product Name"
                                                                                value={product.product_name || ''}
                                                                                onChange={handleProductChange(index, 'product_name')}
                                                                                size="small"
                                                                                disabled={editingMode === 'view'}
                                                                                InputProps={{ readOnly: editingMode === 'view' }}
                                                                                sx={{ mb: 1 }}
                                                                            />
                                                                        </Grid>
                                                                        <Grid item xs={6}>
                                                                            <TextField
                                                                                fullWidth
                                                                                label="Group"
                                                                                value={product.group_name || ''}
                                                                                onChange={handleProductChange(index, 'group_name')}
                                                                                size="small"
                                                                                disabled={editingMode === 'view'}
                                                                                InputProps={{ readOnly: editingMode === 'view' }}
                                                                            />
                                                                        </Grid>
                                                                        <Grid item xs={6}>
                                                                            <TextField
                                                                                fullWidth
                                                                                label="Maker"
                                                                                value={product.maker_name || ''}
                                                                                onChange={handleProductChange(index, 'maker_name')}
                                                                                size="small"
                                                                                disabled={editingMode === 'view'}
                                                                                InputProps={{ readOnly: editingMode === 'view' }}
                                                                                sx={{ mb: 1 }}
                                                                            />
                                                                        </Grid>
                                                                        <Grid item xs={12}>
                                                                            <TextField
                                                                                fullWidth
                                                                                label="Models"
                                                                                value={product.model_list || ''}
                                                                                onChange={handleProductChange(index, 'model_list')}
                                                                                size="small"
                                                                                multiline
                                                                                rows={3}
                                                                                disabled={editingMode === 'view'}
                                                                                InputProps={{ readOnly: editingMode === 'view' }}
                                                                                helperText="Separate models with new lines"
                                                                                sx={{ mb: 2 }}
                                                                            />
                                                                        </Grid>

                                                                        {/* Product Metadata */}
                                                                        <Grid item xs={12}>
                                                                            <Divider sx={{ my: 1 }}>
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                    Product Info
                                                                                </Typography>
                                                                            </Divider>
                                                                        </Grid>
                                                                        <Grid item xs={6}>
                                                                            <Typography variant="caption" color="text.secondary">
                                                                                Created By
                                                                            </Typography>
                                                                            <Typography variant="body2" fontSize="0.75rem">
                                                                                {vendorData.CREATE_BY || 'N/A'}
                                                                            </Typography>
                                                                        </Grid>
                                                                        <Grid item xs={6}>
                                                                            <Typography variant="caption" color="text.secondary">
                                                                                Updated By
                                                                            </Typography>
                                                                            <Typography variant="body2" fontSize="0.75rem">
                                                                                {vendorData.UPDATE_BY || 'N/A'}
                                                                            </Typography>
                                                                        </Grid>
                                                                        <Grid item xs={6}>
                                                                            <Typography variant="caption" color="text.secondary">
                                                                                Created Date
                                                                            </Typography>
                                                                            <Typography variant="body2" fontSize="0.75rem">
                                                                                {vendorData.CREATE_DATE ? new Date(vendorData.CREATE_DATE).toLocaleDateString('th-TH') : 'N/A'}
                                                                            </Typography>
                                                                        </Grid>
                                                                        <Grid item xs={6}>
                                                                            <Typography variant="caption" color="text.secondary">
                                                                                Last Update
                                                                            </Typography>
                                                                            <Typography variant="body2" fontSize="0.75rem">
                                                                                {vendorData.UPDATE_DATE ? new Date(vendorData.UPDATE_DATE).toLocaleDateString('th-TH') : 'N/A'}
                                                                            </Typography>
                                                                        </Grid>
                                                                    </Grid>
                                                                </CardContent>
                                                            </Card>
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            </CardContent>
                                        </Collapse>
                                    </Card>
                                )}

                            </Box>
                        )}
                    </>
                )
                }
            </DialogContent >
            <DialogActions sx={{ justifyContent: 'space-between', p: 3 }}>
                <Button onClick={handleClose} disabled={saving}>
                    Close
                </Button>
                {editingMode === 'edit' && (
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={loading || saving}
                        startIcon={saving ? <CircularProgress size={16} /> : null}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                )}
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
    )
}

export default EditVendorModal
