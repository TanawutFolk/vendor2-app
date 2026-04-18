import { Box, Chip, Divider, Grid, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'

import CustomTextField from '@components/mui/TextField'
import AsyncSelectCustom from '@components/react-select/AsyncSelectCustom'

import type { VendorComprehensiveI } from '@_workspace/types/_find-vendor/FindVendorTypes'
import type { EditVendorSchemaType } from '../validateSchema'
import SectionHeader from './SectionHeader'

type VendorProfileSectionProps = {
    editingMode: 'view' | 'edit'
    originalData: VendorComprehensiveI | null
    fetchVendorTypes: (inputValue: string) => Promise<any[]>
}

const VendorProfileSection = ({ editingMode, originalData, fetchVendorTypes }: VendorProfileSectionProps) => {
    const {
        control,
        getValues,
        setValue,
        formState: { errors },
    } = useFormContext<EditVendorSchemaType>()

    return (
        <Box sx={{ position: 'relative', zIndex: 4 }}>
            <SectionHeader icon='tabler-building-store' title='Company Profile' />
            <Box
                sx={{
                    p: 2.5,
                    borderRadius: 1.5,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'primary.main',
                }}
            >
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Controller
                            name='company_name'
                            control={control}
                            render={({ field }) => (
                                <CustomTextField
                                    {...field}
                                    fullWidth
                                    label='Company Name'
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
                            name='vendor_type_id'
                            control={control}
                            render={({ field }) => (
                                <AsyncSelectCustom
                                    label='Vendor Type'
                                    {...field}
                                    value={field.value ? { value: field.value, label: getValues('vendor_type_name') || 'Unknown' } : null}
                                    onChange={(val: any) => {
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
                            name='vendor_region'
                            control={control}
                            render={({ field }) => (
                                <Box>
                                    <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                                        Vendor Region
                                    </Typography>
                                    {editingMode === 'view' ? (
                                        <Chip
                                            label={field.value === 'Oversea' ? 'Oversea' : 'Local'}
                                            color={field.value === 'Oversea' ? 'info' : 'success'}
                                            size='small'
                                            variant='tonal'
                                            sx={{ fontWeight: 600 }}
                                        />
                                    ) : (
                                        <ToggleButtonGroup
                                            value={field.value || 'Local'}
                                            exclusive
                                            onChange={(_, val) => {
                                                if (val !== null) field.onChange(val)
                                            }}
                                            size='small'
                                            color='primary'
                                        >
                                            <ToggleButton value='Local' sx={{ px: 3, fontWeight: 600 }}>
                                                Local
                                            </ToggleButton>
                                            <ToggleButton value='Oversea' sx={{ px: 3, fontWeight: 600 }}>
                                                Oversea
                                            </ToggleButton>
                                        </ToggleButtonGroup>
                                    )}
                                </Box>
                            )}
                        />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Controller
                            name='province'
                            control={control}
                            render={({ field }) => (
                                <CustomTextField
                                    {...field}
                                    fullWidth
                                    label='Province'
                                    value={field.value || ''}
                                    size='small'
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
                            name='postal_code'
                            control={control}
                            render={({ field }) => (
                                <CustomTextField
                                    {...field}
                                    fullWidth
                                    label='Postal Code'
                                    value={field.value || ''}
                                    size='small'
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
                            name='website'
                            control={control}
                            render={({ field }) => (
                                <CustomTextField
                                    {...field}
                                    fullWidth
                                    label='Website'
                                    value={field.value || ''}
                                    size='small'
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
                            name='tel_center'
                            control={control}
                            render={({ field }) => (
                                <CustomTextField
                                    {...field}
                                    fullWidth
                                    label='Tel Company'
                                    value={field.value || ''}
                                    size='small'
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
                            name='emailmain'
                            control={control}
                            render={({ field }) => (
                                <CustomTextField
                                    {...field}
                                    fullWidth
                                    label='Email (Main)'
                                    value={field.value || ''}
                                    size='small'
                                    type='email'
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
                            name='address'
                            control={control}
                            render={({ field }) => (
                                <CustomTextField
                                    {...field}
                                    fullWidth
                                    label='Address'
                                    value={field.value || ''}
                                    size='small'
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

                    {originalData?.vendor_id && (
                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }}>
                                <Typography variant='caption' color='text.secondary'>
                                    Company Info
                                </Typography>
                            </Divider>
                            <Box sx={{ mt: 1, mb: 1, display: 'flex', gap: 4, color: 'text.secondary', flexWrap: 'wrap' }}>
                                <Box>
                                    <Typography variant='caption' display='block'>
                                        Created By
                                    </Typography>
                                    <Typography variant='body2' fontSize='0.75rem'>
                                        {originalData.CREATE_BY || 'N/A'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant='caption' display='block'>
                                        Created Date
                                    </Typography>
                                    <Typography variant='body2' fontSize='0.75rem'>
                                        {originalData.CREATE_DATE ? new Date(originalData.CREATE_DATE).toLocaleDateString('th-TH') : 'N/A'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant='caption' display='block'>
                                        Last Update By
                                    </Typography>
                                    <Typography variant='body2' fontSize='0.75rem'>
                                        {originalData.UPDATE_BY || 'N/A'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant='caption' display='block'>
                                        Last Update Date
                                    </Typography>
                                    <Typography variant='body2' fontSize='0.75rem'>
                                        {originalData.UPDATE_DATE ? new Date(originalData.UPDATE_DATE).toLocaleDateString('th-TH') : 'N/A'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            </Box>
        </Box>
    )
}

export default VendorProfileSection
