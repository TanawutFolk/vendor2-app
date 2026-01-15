// React Imports
import { Controller, useFormContext, useFormState } from 'react-hook-form'

// MUI Imports
import { Grid } from '@mui/material'

// Components Imports
import CustomTextField from '@components/mui/TextField'
import SelectCustom from '@/components/react-select/SelectCustom'

// Types
import type { AddVendorFormData } from './validateSchema'

interface SectionProfileProps {
    isDisabled: boolean
    vendorTypeOptions: { value: number; label: string }[]
}

const SectionProfile = ({ isDisabled, vendorTypeOptions }: SectionProfileProps) => {
    // Hooks : react-hook-form
    const { control, setValue } = useFormContext<AddVendorFormData>()
    const { errors } = useFormState({ control })

    return (
        <Grid container spacing={4}>
            {/* Row 1 */}
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
                            {...(errors.company_name && {
                                error: true,
                                helperText: errors.company_name.message
                            })}
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
                            {...(errors.province && {
                                error: true,
                                helperText: errors.province.message
                            })}
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
                            {...(errors.postal_code && {
                                error: true,
                                helperText: errors.postal_code.message
                            })}
                        />
                    )}
                />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
                <Controller
                    name='vendor_type_id'
                    control={control}
                    render={({ field }) => (
                        <SelectCustom
                            label='Vendor Type'
                            value={vendorTypeOptions.find(opt => opt.value === field.value) || null}
                            onChange={(selected: any) => {
                                field.onChange(selected?.value || 0)
                                setValue('vendor_type_name', selected?.label || '')
                            }}
                            options={vendorTypeOptions}
                            isClearable
                            isDisabled={isDisabled}
                            placeholder='Select vendor type...'
                            classNamePrefix='select'
                            {...(errors.vendor_type_id && {
                                error: true,
                                helperText: 'Vendor Type is required'
                            })}
                        />
                    )}
                />
            </Grid>

            {/* Row 2 */}
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
                            {...(errors.website && {
                                error: true,
                                helperText: errors.website.message
                            })}
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
                            {...(errors.tel_center && {
                                error: true,
                                helperText: errors.tel_center.message
                            })}
                        />
                    )}
                />
            </Grid>

            {/* Row 3 */}
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
                            {...(errors.address && {
                                error: true,
                                helperText: errors.address.message
                            })}
                        />
                    )}
                />
            </Grid>

            {/* Row 4 */}
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
                            {...(errors.note && {
                                error: true,
                                helperText: errors.note.message
                            })}
                        />
                    )}
                />
            </Grid>
        </Grid>
    )
}

export default SectionProfile
