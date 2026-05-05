// React Imports
import { useState } from 'react'
import { Controller, useFormContext, useFormState, useFieldArray } from 'react-hook-form'

// MUI Imports
import { Grid, Button, CircularProgress, Chip, IconButton, Typography, Card, CardContent, Divider, Box, ToggleButton, ToggleButtonGroup, Alert, Table, TableBody, TableCell, TableHead, TableRow, Backdrop, Fade, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'

// Components Imports
import CustomTextField from '@components/mui/TextField'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import SelectCustom from '@components/react-select/SelectCustom'
import EditVendorModal from '@_workspace/pages/_find-vendor/modal/EditVendorModal'
import AddProductGroupModal from './modal/AddProductGroupModal'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'

// Fetch functions & React Query
import { useCheckDuplicate } from '@_workspace/react-query/hooks/vendor/useCheckVendorDuplicate'
import type { CheckDuplicateResponseI, BlacklistMatchI } from '@_workspace/types/_add-vendor/AddVendorTypes'
import { fetchVendorTypes } from '@/_workspace/react-select/async-promise-load-options/find-vendor/fetchVendorTypes'
import { fetchProductGroups } from '@/_workspace/react-select/async-promise-load-options/find-vendor/fetchProductGroups'
import { fetchVendorRegions } from '@/_workspace/react-select/async-promise-load-options/find-vendor/fetchVendorRegions'

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
    const [blacklistMatches, setBlacklistMatches] = useState<BlacklistMatchI[]>([])
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [resultModalOpen, setResultModalOpen] = useState(false)
    const [resultModalType, setResultModalType] = useState<'duplicate' | 'blacklist' | null>(null)

    const { control, trigger, getValues } = useFormContext<AddVendorFormData>()
    const { errors } = useFormState({ control })

    const { mutate: checkDuplicate, isPending: isLoading } = useCheckDuplicate(
        (data: CheckDuplicateResponseI) => {
            if (data.isDuplicate && data.existingVendorId) {
                const errorMsg = `Vendor already exists in the system (ID: ${data.existingVendorId})`
                setVerifyError(errorMsg)
                setExistingVendorId(data.existingVendorId)
                setBlacklistMatches([])
                setResultModalType('duplicate')
                setResultModalOpen(true)
                onVerifyChange(false, errorMsg)
            } else if (data.isBlacklisted) {
                const blacklistMessage = data.Message || 'Vendor matched the blacklist and cannot be registered'
                setVerifyError(blacklistMessage)
                setExistingVendorId(null)
                setBlacklistMatches(data.blacklistMatches || [])
                setResultModalType('blacklist')
                setResultModalOpen(true)
                onVerifyChange(false, blacklistMessage)
            } else {
                setVerifyError(null)
                setExistingVendorId(null)
                setBlacklistMatches([])
                setResultModalType(null)
                setResultModalOpen(false)
                onVerifyChange(true)
            }
        },
        (error: Error) => {
            const msg = error?.message || 'Failed to verify vendor'
            setVerifyError(msg)
            setExistingVendorId(null)
            setBlacklistMatches([])
            setResultModalType(null)
            setResultModalOpen(false)
            onVerifyChange(false, msg)
        }
    )

    const handleVerify = async () => {
        setVerifyError(null)
        setExistingVendorId(null)
        setBlacklistMatches([])
        setResultModalType(null)
        setResultModalOpen(false)
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
        <>
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
                                {isLoading ? 'Checking...' : isVerified ? 'Verified ✓' : 'Check Duplicate and Blacklist'}
                            </Button>
                        </Grid>
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

                {/* ── Duplicate Error ── */}
                {/* ── Blacklist Warning ── */}
                {false && blacklistMatches.length > 0 && (
                    <Grid item xs={12}>
                        <Alert
                            severity='error'
                            icon={<i className='tabler-shield-x' style={{ fontSize: '1.5rem' }} />}
                            sx={{ alignItems: 'flex-start' }}
                        >
                            <Typography variant='subtitle2' fontWeight={700} sx={{ mb: 1 }}>
                                🚫 Vendor is Blacklisted — Registration Blocked
                            </Typography>
                            <Typography variant='body2' sx={{ mb: 2 }}>
                                Company name matches {blacklistMatches.length} record(s) in the Blacklist. Contact your compliance team before proceeding.
                            </Typography>
                            <Box sx={{ overflowX: 'auto' }}>
                                <Table size='small' sx={{ minWidth: 500, bgcolor: 'background.paper', borderRadius: 1 }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700 }}>List</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Matched Name</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Match Type</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Source</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Entity No.</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Programs</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {blacklistMatches.map((match, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>
                                                    <Chip
                                                        label={match.group_code}
                                                        size='small'
                                                        color={match.group_code === 'US' ? 'primary' : 'warning'}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 600, color: 'error.main' }}>{match.matched_name}</TableCell>
                                                <TableCell>{match.match_type === 'alias' ? 'Alias' : 'Primary Name'}</TableCell>
                                                <TableCell>{match.source_name || '-'}</TableCell>
                                                <TableCell>{match.entity_number || '-'}</TableCell>
                                                <TableCell>{match.programs || '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        </Alert>
                    </Grid>
                )}

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
                <Dialog
                    maxWidth={resultModalType === 'blacklist' ? 'lg' : 'sm'}
                    fullWidth={true}
                    open={resultModalOpen}
                    onClose={() => setResultModalOpen(false)}
                    sx={{
                        '& .MuiDialog-paper': { overflow: 'visible' },
                        '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
                    }}
                >
                    <DialogTitle>
                        <Typography variant='h5' component='span'>
                            {resultModalType === 'blacklist' ? 'Blacklist Match Found' : 'Duplicate Vendor Found'}
                        </Typography>
                        <DialogCloseButton onClick={() => setResultModalOpen(false)} disableRipple>
                            <i className='tabler-x' />
                        </DialogCloseButton>
                    </DialogTitle>
                    <DialogContent>
                        {resultModalType === 'blacklist' ? (
                            <Box sx={{ pt: 2 }}>
                                <Typography variant='body1' sx={{ mb: 1.5 }}>
                                    {verifyError || 'This vendor matched blacklist data and registration is blocked.'}
                                </Typography>
                                <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                                    Company name matches {blacklistMatches.length} record(s) in the blacklist. Please contact your compliance team before proceeding.
                                </Typography>
                                <Box sx={{ overflowX: 'auto' }}>
                                    <Table size='small' sx={{ minWidth: 720 }}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 700 }}>List</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Matched Name</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Match Type</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Source</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Entity No.</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Programs</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {blacklistMatches.map((match, idx) => (
                                                <TableRow key={`${match.group_code}-${match.matched_name}-${idx}`}>
                                                    <TableCell>
                                                        <Chip
                                                            label={match.group_code}
                                                            size='small'
                                                            color={match.group_code === 'US' ? 'primary' : 'warning'}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 600, color: 'error.main' }}>{match.matched_name}</TableCell>
                                                    <TableCell>{match.match_type === 'alias' ? 'Alias' : 'Primary Name'}</TableCell>
                                                    <TableCell>{match.source_name || '-'}</TableCell>
                                                    <TableCell>{match.entity_number || '-'}</TableCell>
                                                    <TableCell>{match.programs || '-'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Box>
                            </Box>
                        ) : (
                            <Box sx={{ pt: 2 }}>
                                <Typography variant='body1' sx={{ mb: 1.5 }}>
                                    {verifyError || 'This vendor already exists in the system.'}
                                </Typography>
                                <Typography variant='body2' color='text.secondary'>
                                    Please review the existing vendor record before creating a new one.
                                </Typography>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: 'flex-start' }}>
                        {resultModalType === 'duplicate' && existingVendorId && (
                            <Button
                                variant='contained'
                                color='success'
                                onClick={() => {
                                    setResultModalOpen(false)
                                    setEditModalOpen(true)
                                }}
                                startIcon={<i className='tabler-edit' />}
                            >
                                Edit Existing Vendor
                            </Button>
                        )}
                        <Button variant='tonal' color='secondary' onClick={() => setResultModalOpen(false)}>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </Grid>

            <Backdrop
                open={isLoading}
                sx={{
                    zIndex: (theme) => theme.zIndex.modal + 1,
                    backgroundColor: 'rgba(15, 23, 42, 0.28)',
                    backdropFilter: 'blur(4px)'
                }}
            >
                <Fade in={isLoading}>
                    <Box
                        sx={{
                            minWidth: 320,
                            maxWidth: 380,
                            px: 5,
                            py: 4,
                            borderRadius: 3,
                            bgcolor: 'background.paper',
                            boxShadow: '0 24px 60px rgba(15, 23, 42, 0.18)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2
                        }}
                    >
                        <Box
                            sx={{
                                width: 64,
                                height: 64,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'primary.lightOpacity'
                            }}
                        >
                            <CircularProgress
                                size={30}
                                thickness={4.5}
                                sx={{
                                    color: 'primary.main'
                                }}
                            />
                        </Box>

                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant='h6' sx={{ mb: 0.5 }}>
                                Checking Vendor
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                                We are checking duplicate vendor data and blacklist matches from both US and CN lists.
                            </Typography>
                        </Box>
                    </Box>
                </Fade>
            </Backdrop>
        </>
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
                        name='vendor_region'
                        control={control}
                        render={({ field }) => (
                            <AsyncSelectCustom
                                label='Vendor Region'
                                loadOptions={(inputValue: string) => fetchVendorRegions(inputValue)}
                                value={field.value ? { label: field.value, value: field.value } : null}
                                onChange={(val: { label: string; value: string } | null) => field.onChange(val?.value || '')}
                                defaultOptions
                                cacheOptions
                                isClearable
                                isDisabled={isDisabled}
                                placeholder='Select vendor region...'
                                classNamePrefix='select'
                                {...(errors.vendor_region && { error: true })}
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
                <Grid item xs={12} sm={6} md={4}>
                    <Controller
                        name='emailmain'
                        control={control}
                        render={({ field }) => (
                            <CustomTextField
                                {...field}
                                fullWidth
                                label='Email (Main)'
                                placeholder='vendor@company.com'
                                autoComplete='off'
                                type='email'
                                disabled={isDisabled}
                                {...(errors.emailmain && { error: true, helperText: errors.emailmain.message })}
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
