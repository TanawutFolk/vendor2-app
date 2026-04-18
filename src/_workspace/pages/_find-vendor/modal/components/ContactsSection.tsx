import { Box, Button, Chip, Divider, Grid, IconButton, InputAdornment, Typography } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'

import CustomTextField from '@components/mui/TextField'
import { EmailActionButtons } from '../../components/EmailActionButtons'

import type { EditVendorSchemaType } from '../validateSchema'
import SectionHeader from './SectionHeader'

type ContactsSectionProps = {
    editingMode: 'view' | 'edit'
    contactFields: any[]
    removeContact: (index: number) => void
    appendContact: (value: any) => void
}

const ContactsSection = ({ editingMode, contactFields, removeContact, appendContact }: ContactsSectionProps) => {
    const {
        control,
        getValues,
        formState: { errors },
    } = useFormContext<EditVendorSchemaType>()

    return (
        <Box sx={{ position: 'relative', zIndex: 3 }}>
            <SectionHeader icon='tabler-users' title={`Contacts (${contactFields.length})`} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {contactFields.map((contact: any, index: number) => (
                    <Box
                        key={contact.id}
                        sx={{
                            p: 2.5,
                            borderRadius: 1.5,
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'primary.main',
                            position: 'relative',
                        }}
                    >
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Box display='flex' justifyContent='space-between' alignItems='center'>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box
                                            sx={{
                                                width: 24,
                                                height: 24,
                                                borderRadius: '50%',
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Typography variant='caption' fontWeight={700}>
                                                {index + 1}
                                            </Typography>
                                        </Box>
                                        <Typography variant='subtitle2' fontWeight={600}>
                                            Contact Info
                                        </Typography>
                                        {!contact.vendor_contact_id && (
                                            <Chip label='New' size='small' color='success' sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }} />
                                        )}
                                    </Box>
                                    {editingMode === 'edit' && (
                                        <IconButton size='small' color='error' onClick={() => removeContact(index)}>
                                            <i className='tabler-trash' />
                                        </IconButton>
                                    )}
                                </Box>
                                <Divider sx={{ my: 2 }} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={6}>
                                <Controller
                                    name={`contacts.${index}.contact_name`}
                                    control={control}
                                    render={({ field }) => (
                                        <CustomTextField
                                            {...field}
                                            fullWidth
                                            label='Name'
                                            value={field.value || ''}
                                            size='small'
                                            error={!!errors.contacts?.[index]?.contact_name}
                                            helperText={errors.contacts?.[index]?.contact_name?.message}
                                            disabled={editingMode === 'view'}
                                            InputProps={{ readOnly: editingMode === 'view' }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={6}>
                                <Controller
                                    name={`contacts.${index}.tel_phone`}
                                    control={control}
                                    render={({ field }) => (
                                        <CustomTextField
                                            {...field}
                                            fullWidth
                                            label='Phone'
                                            value={field.value || ''}
                                            size='small'
                                            disabled={editingMode === 'view'}
                                            InputProps={{ readOnly: editingMode === 'view' }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={6}>
                                <Controller
                                    name={`contacts.${index}.email`}
                                    control={control}
                                    render={({ field }) => (
                                        <CustomTextField
                                            {...field}
                                            fullWidth
                                            label='Email'
                                            value={field.value || ''}
                                            size='small'
                                            error={!!errors.contacts?.[index]?.email}
                                            helperText={errors.contacts?.[index]?.email?.message}
                                            InputProps={{
                                                readOnly: editingMode === 'view',
                                                endAdornment: field.value && (
                                                    <InputAdornment position='end'>
                                                        <EmailActionButtons
                                                            email={field.value}
                                                            contactName={getValues(`contacts.${index}.contact_name`)}
                                                        />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={6}>
                                <Controller
                                    name={`contacts.${index}.position`}
                                    control={control}
                                    render={({ field }) => (
                                        <CustomTextField
                                            {...field}
                                            fullWidth
                                            label='Position'
                                            value={field.value || ''}
                                            size='small'
                                            disabled={editingMode === 'view'}
                                            InputProps={{ readOnly: editingMode === 'view' }}
                                        />
                                    )}
                                />
                            </Grid>

                            {contact.vendor_contact_id && (
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 1 }}>
                                        <Typography variant='caption' color='text.secondary'>
                                            Contact Info
                                        </Typography>
                                    </Divider>
                                    <Box sx={{ mt: 1, mb: 1, display: 'flex', gap: 4, color: 'text.secondary' }}>
                                        <Box>
                                            <Typography variant='caption' display='block'>
                                                Created By
                                            </Typography>
                                            <Typography variant='body2' fontSize='0.75rem'>
                                                {contact.CREATE_BY || 'N/A'}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant='caption' display='block'>
                                                Created Date
                                            </Typography>
                                            <Typography variant='body2' fontSize='0.75rem'>
                                                {contact.CREATE_DATE ? new Date(contact.CREATE_DATE).toLocaleDateString('th-TH') : 'N/A'}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant='caption' display='block'>
                                                Last Update By
                                            </Typography>
                                            <Typography variant='body2' fontSize='0.75rem'>
                                                {contact.UPDATE_BY || 'N/A'}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant='caption' display='block'>
                                                Last Update Date
                                            </Typography>
                                            <Typography variant='body2' fontSize='0.75rem'>
                                                {contact.UPDATE_DATE ? new Date(contact.UPDATE_DATE).toLocaleDateString('th-TH') : 'N/A'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                ))}
                {editingMode === 'edit' && (
                    <Button
                        variant='outlined'
                        startIcon={<i className='tabler-plus' />}
                        onClick={() => appendContact({ contact_name: '' })}
                        fullWidth
                        sx={{ borderStyle: 'dashed' }}
                    >
                        Add Contact
                    </Button>
                )}
            </Box>
        </Box>
    )
}

export default ContactsSection
