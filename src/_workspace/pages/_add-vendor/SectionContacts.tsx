// React Imports
import { Controller, useFormContext, useFormState, useFieldArray } from 'react-hook-form'

// MUI Imports
import { Grid, Button, IconButton, Typography, Card, CardContent, Divider } from '@mui/material'

// Components Imports
import CustomTextField from '@components/mui/TextField'

// Types
import type { AddVendorFormData } from './validateSchema'
import { defaultContactValues } from './validateSchema'

interface SectionContactsProps {
    isDisabled: boolean
}

const SectionContacts = ({ isDisabled }: SectionContactsProps) => {
    const { control } = useFormContext<AddVendorFormData>()
    const { errors } = useFormState({ control })
    const { fields, append, remove } = useFieldArray({ control, name: 'contacts' })

    const handleAddContact = () => {
        append({ ...defaultContactValues })
    }

    return (
        <Grid container spacing={4}>
            {fields.map((field, index) => (
                <Grid item xs={12} key={field.id}>
                    <Card variant='outlined'>
                        <CardContent>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Grid container justifyContent='space-between' alignItems='center'>
                                        <Typography variant='subtitle1' color='primary'>
                                            Contact #{index + 1}
                                        </Typography>
                                        {fields.length > 1 && (
                                            <IconButton size='small' color='error' onClick={() => remove(index)} disabled={isDisabled}>
                                                <i className='tabler-trash text-lg' />
                                            </IconButton>
                                        )}
                                    </Grid>
                                    <Divider sx={{ mt: 1, mb: 2 }} />
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
                        </CardContent>
                    </Card>
                </Grid>
            ))}
            <Grid item xs={12}>
                <Button
                    variant='outlined'
                    color='primary'
                    onClick={handleAddContact}
                    disabled={isDisabled}
                    startIcon={<i className='tabler-plus' />}
                >
                    Add Contact
                </Button>
            </Grid>
        </Grid>
    )
}

export default SectionContacts
