import { Box, Button, Chip, FormControlLabel, Switch, Typography } from '@mui/material'
import { Controller } from 'react-hook-form'

import { StatusCheckChip } from '../../components/fftStatus'

import type { Control } from 'react-hook-form'
import type { EditVendorSchemaType } from '../validateSchema'
import type { VendorComprehensiveI } from '@_workspace/types/_find-vendor/FindVendorTypes'

type VendorModalHeaderBarProps = {
    control: Control<EditVendorSchemaType>
    originalData: VendorComprehensiveI | null
    vendorFftCode: string | null | undefined
    vendorStatusCheck: string | undefined
    editingMode: 'view' | 'edit'
    loading: boolean
    onToggleEditMode: () => void
}

const VendorModalHeaderBar = ({
    control,
    originalData,
    vendorFftCode,
    vendorStatusCheck,
    editingMode,
    loading,
    onToggleEditMode,
}: VendorModalHeaderBarProps) => {
    return (
        <Box
            sx={{
                width: '100%',
                px: 3,
                py: 2,
                bgcolor: 'background.paper',
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap',
            }}
        >
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.25 }}>
                    <Typography variant='h6' fontWeight={800}>
                        {originalData?.company_name || 'Vendor Details'}
                    </Typography>
                    {vendorFftCode && (
                        <Chip
                            label={`Code: ${vendorFftCode}`}
                            size='small'
                            color='primary'
                            variant='tonal'
                            sx={{ fontWeight: 700, fontSize: '0.7rem', height: 22 }}
                        />
                    )}
                    {vendorStatusCheck && <StatusCheckChip value={vendorStatusCheck} />}
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Controller
                        name='INUSE'
                        control={control}
                        render={({ field }) => (
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={field.value === 1}
                                        onChange={e => field.onChange(e.target.checked ? 1 : 0)}
                                        color='success'
                                        disabled={editingMode === 'view'}
                                        size='small'
                                    />
                                }
                                label={
                                    <Typography variant='caption' fontWeight={600} color={field.value === 1 ? 'success.main' : 'text.disabled'}>
                                        {field.value === 1 ? 'Active' : 'Inactive'}
                                    </Typography>
                                }
                                sx={{ m: 0 }}
                            />
                        )}
                    />
                    <Typography variant='caption' color='text.disabled'>
                        ·
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                        <i className='tabler-user' style={{ fontSize: 12, color: 'var(--mui-palette-text-disabled)' }} />
                        <Typography variant='caption' color='text.disabled'>
                            Update By: {originalData?.UPDATE_BY || '-'}
                        </Typography>
                    </Box>
                    <Typography variant='caption' color='text.disabled'>
                        ·
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                        <i className='tabler-calendar' style={{ fontSize: 12, color: 'var(--mui-palette-text-disabled)' }} />
                        <Typography variant='caption' color='text.disabled'>
                            Update Date: {originalData?.UPDATE_DATE ? new Date(originalData.UPDATE_DATE).toLocaleDateString('th-TH') : '-'}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Button
                variant={editingMode === 'edit' ? 'contained' : 'tonal'}
                color={editingMode === 'edit' ? 'success' : 'primary'}
                onClick={onToggleEditMode}
                disabled={loading}
                startIcon={editingMode === 'edit' ? <i className='tabler-check' /> : <i className='tabler-edit' />}
                sx={{ fontWeight: 700 }}
            >
                {editingMode === 'edit' ? 'Editing Mode' : 'Edit Mode'}
            </Button>
        </Box>
    )
}

export default VendorModalHeaderBar
