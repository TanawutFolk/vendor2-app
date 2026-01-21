// React Imports
import { Controller, useFormContext, useFormState } from 'react-hook-form'

// MUI Imports
import { Grid } from '@mui/material'

// Components Imports
import CustomTextField from '@components/mui/TextField'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'

// Fetch functions
import { fetchVendorTypes } from '@/_workspace/react-select/async-promise-load-options/find-vendor/fetchFindVendor'

// Types
import type { AddVendorFormData } from './validateSchema'

interface SectionProfileProps {
    isDisabled: boolean
}

const SectionProfile = ({ isDisabled }: SectionProfileProps) => {
    const { control } = useFormContext<AddVendorFormData>()
    const { errors } = useFormState({ control })

    return (
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
                            label='Tel Center (Optional)'
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
    )
}

export default SectionProfile
