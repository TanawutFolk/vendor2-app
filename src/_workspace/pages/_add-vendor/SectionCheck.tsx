// React Imports
import { Controller, useFormContext, useFormState } from 'react-hook-form'

// MUI Imports
import { Grid, Button, CircularProgress, Alert, Chip } from '@mui/material'

// Components Imports
import CustomTextField from '@components/mui/TextField'

// Types
import type { AddVendorFormData } from './validateSchema'

interface SectionCheckProps {
    onVerify: () => void
    isVerified: boolean
    isLoading: boolean
    verifyError: string | null
}

const SectionCheck = ({ onVerify, isVerified, isLoading, verifyError }: SectionCheckProps) => {
    // Hooks : react-hook-form
    const { control } = useFormContext<AddVendorFormData>()
    const { errors } = useFormState({ control })

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
                            {...(errors.company_name && {
                                error: true,
                                helperText: errors.company_name.message
                            })}
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
                            {...(errors.province && {
                                error: true,
                                helperText: errors.province.message
                            })}
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
                            {...(errors.postal_code && {
                                error: true,
                                helperText: errors.postal_code.message
                            })}
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
                            onClick={onVerify}
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
                </Grid>
            </Grid>

            {verifyError && (
                <Grid item xs={12}>
                    <Alert severity='error'>{verifyError}</Alert>
                </Grid>
            )}
        </Grid>
    )
}

export default SectionCheck
