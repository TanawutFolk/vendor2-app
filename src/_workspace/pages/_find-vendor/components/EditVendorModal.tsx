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
    Typography
} from '@mui/material'
import FindVendorServices from '@_workspace/services/_find-vendor/FindVendorServices'
import type { VendorResultI, VendorUpdateRequestI } from '@_workspace/types/_find-vendor/FindVendorTypes'

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
    const [formData, setFormData] = useState<Partial<VendorResultI>>({})

    // Fetch vendor data when modal opens
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
            const response = await FindVendorServices.getById(vendorId)
            if (response.data.Status) {
                setFormData(response.data.ResultOnDb)
            } else {
                setError(response.data.Message || 'Failed to fetch vendor data')
            }
        } catch (err: any) {
            setError(err?.message || 'Failed to fetch vendor data')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (field: keyof VendorResultI) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }))
    }

    const handleSubmit = async () => {
        if (!vendorId) return

        setSaving(true)
        setError(null)

        try {
            const updateData: VendorUpdateRequestI = {
                vendor_id: vendorId,
                company_name: formData.company_name,
                vendor_type_id: formData.vendor_type_id,
                province: formData.province,
                postal_code: formData.postal_code,
                website: formData.website,
                address: formData.address,
                tel_center: formData.tel_center,
                group_name: formData.group_name,
                maker_name: formData.maker_name,
                product_name: formData.product_name,
                model_list: formData.model_list,
                vendor_contact_id: formData.vendor_contact_id,
                vendor_product_id: formData.vendor_product_id,
                seller_name: formData.seller_name,
                tel_phone: formData.tel_phone,
                email: formData.email,
                position: formData.position,
                UPDATE_BY: 'SYSTEM' // Replace with actual user
            }

            const response = await FindVendorServices.update(vendorId, updateData)

            if (response.data.Status) {
                onSuccess?.()
                onClose()
            } else {
                setError(response.data.Message || 'Failed to update vendor')
            }
        } catch (err: any) {
            setError(err?.message || 'Failed to update vendor')
        } finally {
            setSaving(false)
        }
    }

    const handleClose = () => {
        setFormData({})
        setError(null)
        onClose()
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>Edit Vendor</DialogTitle>
            <DialogContent dividers>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {/* Company Information */}
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                            Company Information
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Company Name"
                                    value={formData.company_name || ''}
                                    onChange={handleChange('company_name')}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Vendor Type"
                                    value={formData.vendor_type_name || ''}
                                    disabled
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Province"
                                    value={formData.province || ''}
                                    onChange={handleChange('province')}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Postal Code"
                                    value={formData.postal_code || ''}
                                    onChange={handleChange('postal_code')}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Website"
                                    value={formData.website || ''}
                                    onChange={handleChange('website')}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Tel Company"
                                    value={formData.tel_center || ''}
                                    onChange={handleChange('tel_center')}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Address"
                                    value={formData.address || ''}
                                    onChange={handleChange('address')}
                                    size="small"
                                    multiline
                                    rows={2}
                                />
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        {/* Product Information */}
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                            Product Information
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Group Name"
                                    value={formData.group_name || ''}
                                    onChange={handleChange('group_name')}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Maker Name"
                                    value={formData.maker_name || ''}
                                    onChange={handleChange('maker_name')}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Product Name"
                                    value={formData.product_name || ''}
                                    onChange={handleChange('product_name')}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Model List"
                                    value={formData.model_list || ''}
                                    onChange={handleChange('model_list')}
                                    size="small"
                                />
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        {/* Contact Information */}
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                            Contact Information
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Contact Name"
                                    value={formData.seller_name || ''}
                                    onChange={handleChange('seller_name')}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Position"
                                    value={formData.position || ''}
                                    onChange={handleChange('position')}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Tel. Contact"
                                    value={formData.tel_phone || ''}
                                    onChange={handleChange('tel_phone')}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    value={formData.email || ''}
                                    onChange={handleChange('email')}
                                    size="small"
                                />
                            </Grid>
                        </Grid>
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={saving}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || saving}
                    startIcon={saving ? <CircularProgress size={16} /> : null}
                >
                    {saving ? 'Saving...' : 'Save'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default EditVendorModal
