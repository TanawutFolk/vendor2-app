// React Imports
import { useState } from 'react'
import { Controller, useFormContext, useFormState, useFieldArray } from 'react-hook-form'

// MUI Imports
import { Grid, Button, CircularProgress, Chip, IconButton, Typography, Card, CardContent, Divider, Box } from '@mui/material'

// Components Imports
import CustomTextField from '@components/mui/TextField'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import EditVendorModal from '@_workspace/pages/_find-vendor/modal/EditVendorModal'
import AddProductGroupModal from './modal/AddProductGroupModal'

// Fetch functions & React Query
import { useCheckDuplicate } from '@_workspace/react-query/hooks/vendor/useCheckVendorDuplicate'
import type { CheckDuplicateResponseI } from '@_workspace/types/_add-vendor/AddVendorTypes'
import { fetchVendorTypes } from '@/_workspace/react-select/async-promise-load-options/find-vendor/fetchVendorTypes'
import { fetchProductGroups } from '@/_workspace/react-select/async-promise-load-options/find-vendor/fetchProductGroups'

// Types
import type { AddVendorFormData } from './validateSchema'
import { defaultContactValues, defaultProductValues } from './validateSchema'

export interface SectionCheckProps {
    onVerifyChange: (isVerified: boolean, errorMessage?: string) => void
    isVerified: boolean
}

export interface SectionDisabledProps {
    isDisabled: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 1: Check Vendor Duplicate
// ─────────────────────────────────────────────────────────────────────────────
export const SectionCheck = ({ onVerifyChange, isVerified }: SectionCheckProps) => {
    const [verifyError, setVerifyError] = useState<string | null>(null)
    const [existingVendorId, setExistingVendorId] = useState<number | null>(null)
    const [editModalOpen, setEditModalOpen] = useState(false)

    const { control, trigger, getValues } = useFormContext<AddVendorFormData>()
    const { errors } = useFormState({ control })

    const { mutate: checkDuplicate, isPending: isLoading } = useCheckDuplicate(
        (data: CheckDuplicateResponseI) => {
            if (data.isDuplicate && data.existingVendorId) {
                const errorMsg = `Vendor already exists! (ID: ${data.existingVendorId})`
                setVerifyError(errorMsg)
                setExistingVendorId(data.existingVendorId)
                onVerifyChange(false, errorMsg)
            } else {
                setVerifyError(null)
                setExistingVendorId(null)
                onVerifyChange(true)
            }
        },
        (error: Error) => {
            const msg = error?.message || 'Failed to verify vendor'
            setVerifyError(msg)
            onVerifyChange(false, msg)
        }
    )

    const handleVerify = async () => {
        setVerifyError(null)
        const isValid = await trigger(['company_name', 'province', 'postal_code'])
        if (isValid) {
            const values = getValues()
            checkDuplicate({
                company_name: values.company_name,
                province: values.province,
                postal_code: values.postal_code
            })
        }
    }

    return (
        <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
                <Controller
                    name='company_name'
                    control={control}
                    render={({ field }) => (
                        <CustomTextField
                            {...field}
                            fullWidth
                            label='Company Name'
                            placeholder='Enter company name...'
                            autoComplete='off'
                            disabled={isVerified}
                            {...(errors.company_name && { error: true, helperText: errors.company_name.message })}
                        />
                    )}
                />
            </Grid>
            <Grid item xs={12} sm={3}>
                <Controller
                    name='province'
                    control={control}
                    render={({ field }) => (
                        <CustomTextField
                            {...field}
                            fullWidth
                            label='Province'
                            placeholder='Enter province...'
                            autoComplete='off'
                            disabled={isVerified}
                            {...(errors.province && { error: true, helperText: errors.province.message })}
                        />
                    )}
                />
            </Grid>
            <Grid item xs={12} sm={3}>
                <Controller
                    name='postal_code'
                    control={control}
                    render={({ field }) => (
                        <CustomTextField
                            {...field}
                            fullWidth
                            label='Postal Code'
                            placeholder='Enter postal code...'
                            autoComplete='off'
                            disabled={isVerified}
                            {...(errors.postal_code && { error: true, helperText: errors.postal_code.message })}
                        />
                    )}
                />
            </Grid>

            <Grid item xs={12}>
                <Grid container spacing={2} alignItems='center'>
                    <Grid item>
                        <Button
                            variant='contained'
                            color={isVerified ? 'success' : 'primary'}
                            onClick={handleVerify}
                            disabled={isLoading || isVerified}
                            startIcon={isLoading ? <CircularProgress size={16} color='inherit' /> : null}
                        >
                            {isLoading ? 'Checking...' : isVerified ? 'Verified ✓' : 'Check Duplicate'}
                        </Button>
                    </Grid>
                    {isVerified && (
                        <Grid item>
                            <Chip label='Vendor is available for Adding' color='success' variant='outlined' />
                        </Grid>
                    )}
                    {existingVendorId && (
                        <Grid item>
                            <Button
                                variant='contained'
                                color='success'
                                onClick={() => setEditModalOpen(true)}
                                startIcon={<i className='tabler-edit' />}
                            >
                                Edit Existing Vendor
                            </Button>
                        </Grid>
                    )}
                </Grid>
            </Grid>

            <EditVendorModal
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                vendorId={existingVendorId}
                onSuccess={() => {
                    setEditModalOpen(false)
                    setExistingVendorId(null)
                    setVerifyError(null)
                }}
            />
        </Grid>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 2: Vendor Profile
// ─────────────────────────────────────────────────────────────────────────────
export const SectionProfile = ({ isDisabled }: SectionDisabledProps) => {
    const { control } = useFormContext<AddVendorFormData>()
    const { errors } = useFormState({ control })

    return (
        <Box sx={{
            p: 2.5, borderRadius: 1.5,
            bgcolor: 'background.paper',
            border: '1px solid', borderColor: 'primary.main'
        }}>
            <Grid container spacing={4}>
                <Grid item xs={12} sm={6} md={4}>
                    <Controller
                        name='company_name'
                        control={control}
                        render={({ field }) => (
                            <CustomTextField
                                {...field}
                                fullWidth
                                label='Company Name'
                                placeholder='Enter company name...'
                                autoComplete='off'
                                disabled={true}
                                {...(errors.company_name && { error: true, helperText: errors.company_name.message })}
                            />
                        )}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Controller
                        name='province'
                        control={control}
                        render={({ field }) => (
                            <CustomTextField
                                {...field}
                                fullWidth
                                label='Province'
                                placeholder='Enter province...'
                                autoComplete='off'
                                disabled={true}
                                {...(errors.province && { error: true, helperText: errors.province.message })}
                            />
                        )}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Controller
                        name='postal_code'
                        control={control}
                        render={({ field }) => (
                            <CustomTextField
                                {...field}
                                fullWidth
                                label='Postal Code'
                                placeholder='Enter postal code...'
                                autoComplete='off'
                                disabled={true}
                                {...(errors.postal_code && { error: true, helperText: errors.postal_code.message })}
                            />
                        )}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Controller
                        name='vendor_type'
                        control={control}
                        render={({ field }) => (
                            <AsyncSelectCustom
                                {...field}
                                label='Vendor Type'
                                loadOptions={inputValue => fetchVendorTypes(inputValue)}
                                defaultOptions
                                cacheOptions
                                isClearable
                                isDisabled={isDisabled}
                                placeholder='Select vendor type...'
                                classNamePrefix='select'
                                {...(errors.vendor_type && { error: true, helperText: 'Vendor Type is required' })}
                            />
                        )}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Controller
                        name='website'
                        control={control}
                        render={({ field }) => (
                            <CustomTextField
                                {...field}
                                fullWidth
                                label='Website'
                                placeholder='https://...'
                                autoComplete='off'
                                disabled={isDisabled}
                                {...(errors.website && { error: true, helperText: errors.website.message })}
                            />
                        )}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Controller
                        name='tel_center'
                        control={control}
                        render={({ field }) => (
                            <CustomTextField
                                {...field}
                                fullWidth
                                label='Tel Center'
                                placeholder='Enter phone number...'
                                autoComplete='off'
                                disabled={isDisabled}
                                {...(errors.tel_center && { error: true, helperText: errors.tel_center.message })}
                            />
                        )}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Controller
                        name='address'
                        control={control}
                        render={({ field }) => (
                            <CustomTextField
                                {...field}
                                fullWidth
                                label='Address'
                                placeholder='Enter full address...'
                                autoComplete='off'
                                multiline
                                rows={2}
                                disabled={isDisabled}
                                {...(errors.address && { error: true, helperText: errors.address.message })}
                            />
                        )}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Controller
                        name='note'
                        control={control}
                        render={({ field }) => (
                            <CustomTextField
                                {...field}
                                fullWidth
                                label='Note (optional)'
                                placeholder='Additional notes...'
                                autoComplete='off'
                                multiline
                                rows={2}
                                disabled={isDisabled}
                                {...(errors.note && { error: true, helperText: errors.note.message })}
                            />
                        )}
                    />
                </Grid>
            </Grid>
        </Box>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 3: Contacts
// ─────────────────────────────────────────────────────────────────────────────
export const SectionContacts = ({ isDisabled }: SectionDisabledProps) => {
    const { control } = useFormContext<AddVendorFormData>()
    const { errors } = useFormState({ control })
    const { fields, append, remove } = useFieldArray({ control, name: 'contacts' })

    const handleAddContact = () => {
        append({ ...defaultContactValues })
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {fields.map((field, index) => (
                <Box key={field.id} sx={{
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
                                </Box>
                                {fields.length > 1 && (
                                    <IconButton size="small" color="error" onClick={() => remove(index)} disabled={isDisabled}>
                                        <i className="tabler-trash" />
                                    </IconButton>
                                )}
                            </Box>
                            <Divider sx={{ my: 2 }} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Controller
                                name={`contacts.${index}.contact_name`}
                                control={control}
                                render={({ field }) => (
                                    <CustomTextField
                                        {...field}
                                        fullWidth
                                        label='Contact Name'
                                        placeholder='Enter name...'
                                        autoComplete='off'
                                        disabled={isDisabled}
                                        {...(errors.contacts?.[index]?.contact_name && {
                                            error: true,
                                            helperText: errors.contacts[index]?.contact_name?.message
                                        })}
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
                                        label='Tel.'
                                        placeholder='Enter tel.'
                                        autoComplete='off'
                                        disabled={isDisabled}
                                        {...(errors.contacts?.[index]?.tel_phone && {
                                            error: true,
                                            helperText: errors.contacts[index]?.tel_phone?.message
                                        })}
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
                                        label='Email'
                                        placeholder='Enter email...'
                                        autoComplete='off'
                                        type='email'
                                        disabled={isDisabled}
                                        {...(errors.contacts?.[index]?.email && {
                                            error: true,
                                            helperText: errors.contacts[index]?.email?.message
                                        })}
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
                                        label='Position (Optional)'
                                        placeholder='Enter position...'
                                        autoComplete='off'
                                        disabled={isDisabled}
                                        {...(errors.contacts?.[index]?.position && {
                                            error: true,
                                            helperText: errors.contacts[index]?.position?.message
                                        })}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                </Box>
            ))}
            <Button
                variant="outlined"
                startIcon={<i className="tabler-plus" />}
                onClick={handleAddContact}
                disabled={isDisabled}
                fullWidth
                sx={{ borderStyle: 'dashed' }}
            >
                Add Contact
            </Button>
        </Box>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 4: Products
// ─────────────────────────────────────────────────────────────────────────────
export const SectionProducts = ({ isDisabled }: SectionDisabledProps) => {
    const [showAddProductGroupModal, setShowAddProductGroupModal] = useState(false)
    const [productGroupRefreshKey, setProductGroupRefreshKey] = useState(0)

    const { control } = useFormContext<AddVendorFormData>()
    const { errors } = useFormState({ control })
    const { fields, append, remove } = useFieldArray({ control, name: 'products' })

    const handleAddProduct = () => {
        append({ ...defaultProductValues })
    }

    const handleProductGroupAdded = () => {
        setProductGroupRefreshKey(prev => prev + 1)
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {fields.map((field, index) => (
                <Box key={field.id} sx={{
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
                                </Box>
                                {fields.length > 1 && (
                                    <IconButton size="small" color="error" onClick={() => remove(index)} disabled={isDisabled}>
                                        <i className="tabler-trash" />
                                    </IconButton>
                                )}
                            </Box>
                            <Divider sx={{ my: 2 }} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', gap: 1 }}>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Controller
                                    name={`products.${index}.product_group`}
                                    control={control}
                                    render={({ field }) => (
                                        <AsyncSelectCustom
                                            {...field}
                                            key={`product-group-${index}-${productGroupRefreshKey}`}
                                            label='Product Group'
                                            loadOptions={inputValue => fetchProductGroups(inputValue)}
                                            defaultOptions
                                            cacheOptions={false}
                                            isClearable
                                            isDisabled={isDisabled}
                                            placeholder='Select group...'
                                            classNamePrefix='select'
                                            {...(errors.products?.[index]?.product_group && {
                                                error: true,
                                                helperText: errors.products[index]?.product_group?.message || 'Product Group is required'
                                            })}
                                        />
                                    )}
                                />
                            </Box>
                            <Button
                                variant='tonal'
                                color='secondary'
                                onClick={() => setShowAddProductGroupModal(true)}
                                disabled={isDisabled}
                                sx={{ minWidth: 38, width: 38, height: 38, p: 0, flexShrink: 0, alignSelf: 'flex-start', mt: '20px' }}
                                title='Add Product Group'
                            >
                                <i className='tabler-plus' />
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Controller
                                name={`products.${index}.maker_name`}
                                control={control}
                                render={({ field }) => (
                                    <CustomTextField
                                        {...field}
                                        fullWidth
                                        label='Maker Name'
                                        placeholder='Enter maker...'
                                        autoComplete='off'
                                        disabled={isDisabled}
                                        {...(errors.products?.[index]?.maker_name && {
                                            error: true,
                                            helperText: errors.products[index]?.maker_name?.message
                                        })}
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
                                        label='Product Name'
                                        placeholder='Enter product...'
                                        autoComplete='off'
                                        disabled={isDisabled}
                                        {...(errors.products?.[index]?.product_name && {
                                            error: true,
                                            helperText: errors.products[index]?.product_name?.message
                                        })}
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
                                        label='Model List'
                                        placeholder='Enter each model...'
                                        autoComplete='off'
                                        disabled={isDisabled}
                                        {...(errors.products?.[index]?.model_list && {
                                            error: true,
                                            helperText: errors.products[index]?.model_list?.message
                                        })}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                </Box>
            ))}
            <Button
                variant="outlined"
                startIcon={<i className="tabler-plus" />}
                onClick={handleAddProduct}
                disabled={isDisabled}
                fullWidth
                sx={{ borderStyle: 'dashed' }}
            >
                Add Product
            </Button>
            <AddProductGroupModal
                open={showAddProductGroupModal}
                onClose={() => setShowAddProductGroupModal(false)}
                onSuccess={handleProductGroupAdded}
            />
        </Box>
    )
}
