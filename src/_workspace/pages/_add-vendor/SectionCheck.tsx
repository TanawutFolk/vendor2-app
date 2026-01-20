// React Imports
import { useState } from 'react'
import { Controller, useFormContext, useFormState } from 'react-hook-form'

// MUI Imports
import { Grid, Button, CircularProgress, Alert, Chip } from '@mui/material'

// Components Imports
import CustomTextField from '@components/mui/TextField'

// React Query Imports
import { useCheckVendorDuplicate } from '@_workspace/react-query/hooks/vendor/useCheckVendorDuplicate'

// Types
import type { AddVendorFormData } from './validateSchema'

interface SectionCheckProps {
    onVerifyChange: (isVerified: boolean, errorMessage?: string) => void
    isVerified: boolean
}

const SectionCheck = ({ onVerifyChange, isVerified }: SectionCheckProps) => {
    // States
    const [verifyError, setVerifyError] = useState<string | null>(null)

    // Hooks : react-hook-form
    const { control, trigger, getValues } = useFormContext<AddVendorFormData>()
    const { errors } = useFormState({ control })

    // Hooks : React Query - Check Duplicate
    const { mutate: checkDuplicate, isPending: isLoading } = useCheckVendorDuplicate(
        data => {
            if (data.isDuplicate) {
                const errorMsg = `Vendor already exists! (ID: ${data.existingVendorId})`
                setVerifyError(errorMsg)
                onVerifyChange(false, errorMsg)
            } else {
                setVerifyError(null)
                onVerifyChange(true)
            }
        },
        (error: Error) => {
            const msg = error?.message || 'Failed to verify vendor'
            setVerifyError(msg)
            onVerifyChange(false, msg)
        }
    )

    // Functions
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
                </Grid>
            </Grid>

            {/* {verifyError && (
                <Grid item xs={12}>
                    <Alert severity='error'>{verifyError}</Alert>
                </Grid>
            )} */}
        </Grid>
    )
}

export default SectionCheck

