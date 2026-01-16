'use client'

import React, { useEffect, useState } from 'react'
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
    Chip,
    IconButton,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import EditIcon from '@mui/icons-material/Edit'
import FindVendorServices from '@_workspace/services/_find-vendor/FindVendorServices'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import ConfirmModal from './ConfirmModal'
import SuccessModal from './SuccessModal'
import ErrorModal from './ErrorModal'
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
    
    // Modal states
    const [confirmModalOpen, setConfirmModalOpen] = useState(false)
    const [successModalOpen, setSuccessModalOpen] = useState(false)
    const [errorModalOpen, setErrorModalOpen] = useState(false)
    const [successData, setSuccessData] = useState<any>(null)
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [errorDetails, setErrorDetails] = useState<string>('')

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
            // Try comprehensive API first
            try {
                const response = await FindVendorServices.getComprehensiveById(vendorId)
                if (response.data.Status) {
                    setVendorData(response.data.ResultOnDb)
                    return
                }
            } catch (err) {
                console.log('Comprehensive API not available, using search-based method')
            }

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
                return

            } catch (searchErr) {
                console.error('Search-based comprehensive method failed:', searchErr)
            }

            // Final fallback: Use basic getById only
            const fallbackResponse = await FindVendorServices.getById(vendorId)
            if (fallbackResponse.data.Status) {
                const basicData = fallbackResponse.data.ResultOnDb
                setVendorData({
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
                })
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

    const toggleEditMode = () => {
        setEditingMode(prev => prev === 'view' ? 'edit' : 'view')
    }

    const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedSections(prev => 
            isExpanded 
                ? [...prev, panel] 
                : prev.filter(section => section !== panel)
        )
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
        if (!vendorId || !vendorData) return

        setSaving(true)
        setError(null)

        try {
            // For now, we'll update the basic vendor info only
            // In the future, this could be enhanced to update contacts and products
            const primaryContact = vendorData.contacts[0] || {}
            const primaryProduct = vendorData.products[0] || {}

            const updateData: VendorUpdateRequestI = {
                vendor_id: vendorId,
                company_name: vendorData.company_name,
                vendor_type_id: vendorData.vendor_type_id,
                province: vendorData.province,
                postal_code: vendorData.postal_code,
                website: vendorData.website,
                address: vendorData.address,
                tel_center: vendorData.tel_center,
                group_name: primaryProduct.group_name,
                maker_name: primaryProduct.maker_name,
                product_name: primaryProduct.product_name,
                model_list: primaryProduct.model_list,
                vendor_contact_id: primaryContact.vendor_contact_id,
                vendor_product_id: primaryProduct.vendor_product_id,
                seller_name: primaryContact.seller_name,
                tel_phone: primaryContact.tel_phone,
                email: primaryContact.email,
                position: primaryContact.position,
                UPDATE_BY: getUserData().EMPLOYEE_CODE || 'ถ้าคุณเห็นข้อความนี้ติดต่อพี่มอส S524 ด่วน'
            }

            const response = await FindVendorServices.update(vendorId, updateData)

            if (response.data.Status) {
                // Show success modal with updated data
                setSuccessData({
                    vendor: vendorData,
                    contacts: vendorData.contacts,
                    products: vendorData.products
                })
                setSuccessModalOpen(true)
                
                onSuccess?.()
                setEditingMode('view')
                // Refresh data
                fetchVendorData()
            } else {
                setErrorMessage(response.data.Message || 'ไม่สามารถบันทึกข้อมูลได้')
                setErrorDetails(JSON.stringify(response.data, null, 2))
                setErrorModalOpen(true)
            }
        } catch (err: any) {
            setErrorMessage(err?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล')
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
                    {vendorData?.fft_status && (
                        <Chip 
                            label={vendorData.fft_status} 
                            size="small" 
                            color={vendorData.fft_status === 'Active' ? 'success' : 'error'}
                            variant="filled"
                        />
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
                                <Accordion 
                                    expanded={expandedSections.includes('company')} 
                                    onChange={handleAccordionChange('company')}
                                    defaultExpanded
                                >
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="h6" color="primary">
                                            <i className="tabler-building" style={{ marginRight: 8 }} />
                                            Company Details
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Card variant="outlined" sx={{ bgcolor: 'action.hover' }}>
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
                                                        <TextField
                                                            fullWidth
                                                            label="Vendor Type"
                                                            value={vendorData.vendor_type_name || ''}
                                                            size="small"
                                                            disabled
                                                            InputProps={{ readOnly: true }}
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
                                                            InputProps={{ readOnly: editingMode === 'view' }}                                                            sx={{ mb: 1 }}                                                        />
                                                    </Grid>
                                                    <Grid item xs={6} md={3}>
                                                        <TextField
                                                            fullWidth
                                                            label="Postal Code"
                                                            value={vendorData.postal_code || ''}
                                                            onChange={handleChange('postal_code')}
                                                            size="small"
                                                            disabled={editingMode === 'view'}
                                                            InputProps={{ readOnly: editingMode === 'view' }}                                                            sx={{ mb: 1 }}                                                        />
                                                    </Grid>
                                                    <Grid item xs={6} md={3}>
                                                        <TextField
                                                            fullWidth
                                                            label="Website"
                                                            value={vendorData.website || ''}
                                                            onChange={handleChange('website')}
                                                            size="small"
                                                            disabled={editingMode === 'view'}
                                                            InputProps={{ readOnly: editingMode === 'view' }}                                                            sx={{ mb: 1 }}                                                        />
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
                                        </Card>
                                    </AccordionDetails>
                                </Accordion>

                                {/* Contacts */}
                                {vendorData.contacts && vendorData.contacts.length > 0 && (
                                    <Accordion 
                                        expanded={expandedSections.includes('contacts')} 
                                        onChange={handleAccordionChange('contacts')}
                                        sx={{ mt: 1 }}
                                    >
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography variant="h6" color="primary">
                                                <i className="tabler-users" style={{ marginRight: 8 }} />
                                                Contacts ({vendorData.contacts.length})
                                            </Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
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
                                                                            InputProps={{ readOnly: editingMode === 'view' }}                                                                            sx={{ mb: 1 }}                                                                        />
                                                                    </Grid>
                                                                    <Grid item xs={12}>
                                                                        <TextField
                                                                            fullWidth
                                                                            label="Position"
                                                                            value={contact.position || ''}
                                                                            onChange={handleContactChange(index, 'position')}
                                                                            size="small"
                                                                            disabled={editingMode === 'view'}
                                                                            InputProps={{ readOnly: editingMode === 'view' }}                                                                            sx={{ mb: 1 }}                                                                        />
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
                                        </AccordionDetails>
                                    </Accordion>
                                )}

                                {/* Products */}
                                {vendorData.products && vendorData.products.length > 0 && (
                                    <Accordion 
                                        expanded={expandedSections.includes('products')} 
                                        onChange={handleAccordionChange('products')}
                                        sx={{ mt: 1 }}
                                    >
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography variant="h6" color="primary">
                                                <i className="tabler-package" style={{ marginRight: 8 }} />
                                                Products ({vendorData.products.length})
                                            </Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
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
                                        </AccordionDetails>
                                    </Accordion>
                                )}

                            </Box>
                        )}
                    </>
                )}
            </DialogContent>
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
        </Dialog>
    )
}

export default EditVendorModal
