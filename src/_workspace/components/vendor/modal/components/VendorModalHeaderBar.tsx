import { Box, Button, Chip, Typography } from '@mui/material'
import { Controller } from 'react-hook-form'

import SelectCustom from '@components/react-select/SelectCustom'
import { VendorStatusChip } from '../../components/fftStatus'

import type { Control } from 'react-hook-form'
import type { EditVendorSchemaType } from '../validateSchema'
import type { VendorComprehensiveI, VendorModalHeaderBarProps } from '@/_workspace/types/vendor/VendorTypes'

// Same Active/Inactive selector the Employee Manager form uses.
const inUseOptions = [
  { label: 'Active', value: 1 },
  { label: 'Inactive', value: 0 }
]

const normalizeInUse = (value: unknown) => {
  if (value === 0 || value === '0' || value === false) return 0
  return 1
}

const VendorModalHeaderBar = ({
  control,
  originalData,
  vendorFftCode,
  vendorStatusLabel,
  editingMode,
  loading,
  onToggleEditMode,
  hideModeButton = false,
  hideVendorCode = false
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
        flexWrap: 'wrap'
      }}
    >
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.25 }}>
          <Typography variant='h6' fontWeight={800}>
            {originalData?.company_name || 'Vendor Details'}
          </Typography>
          {!hideVendorCode && vendorFftCode && (
            <Chip
              label={`Code: ${vendorFftCode}`}
              size='small'
              color='primary'
              variant='tonal'
              sx={{ fontWeight: 700, fontSize: '0.7rem', height: 22 }}
            />
          )}
          {vendorStatusLabel && (
            <VendorStatusChip value={originalData?.vendor_status_code || vendorStatusLabel} label={vendorStatusLabel} />
          )}
        </Box>
      </Box>

      {/* Right-hand actions: Active/Inactive selector, then the mode button. */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto', flexWrap: 'wrap' }}>
        <Box sx={{ minWidth: 180 }}>
          <Controller
            name='INUSE'
            control={control}
            render={({ field }) => (
              <SelectCustom
                classNamePrefix='select'
                label='Status'
                options={inUseOptions}
                value={inUseOptions.find(option => option.value === normalizeInUse(field.value)) || null}
                onChange={(val: { value: number } | null) => field.onChange(normalizeInUse(val?.value))}
                isDisabled={editingMode === 'view' || loading}
              />
            )}
          />
        </Box>

        {!hideModeButton && (
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
        )}
      </Box>
    </Box>
  )
}

export default VendorModalHeaderBar
