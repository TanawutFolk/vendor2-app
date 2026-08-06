'use client'

import { Chip } from '@mui/material'
import type { ICellRendererParams } from 'ag-grid-community'

import {
  formatFftStatus,
  normalizeVendorStatusCode,
  VENDOR_STATUS_CODE
} from '@/_workspace/utils/fftStatus'
import { getChipSx, getReadableStatusTone } from '@/_workspace/utils/statusChipStyles'
import type { FftStatusChipProps, VendorStatusChipProps } from '@/_workspace/types/vendor/VendorTypes'

// FFT Status configuration (for numeric values 0/1/2)
const FFT_STATUS_CONFIG: Record<string, { label: string; color: 'success' | 'error' | 'warning' | 'default' }> = {
  1: { label: 'Registered', color: 'success' as const },
  0: { label: 'Not Registered', color: 'error' as const },
  2: { label: 'Cannot Register', color: 'default' as const }
}

const VENDOR_STATUS_CONFIG: Record<string, { color: 'success' | 'error' | 'warning' | 'default' }> = {
  [VENDOR_STATUS_CODE.REGISTERED]: { color: 'success' },
  [VENDOR_STATUS_CODE.NOT_REGISTERED]: { color: 'error' },
  [VENDOR_STATUS_CODE.IN_PROGRESS]: { color: 'warning' },
  [VENDOR_STATUS_CODE.CANNOT_REGISTER]: { color: 'default' }
}

// Base FFT Status Chip component

export const FftStatusChip = ({ value, variant = 'filled' }: FftStatusChipProps) => {
  const label = formatFftStatus(value)
  const status = FFT_STATUS_CONFIG[String(value ?? '').trim()] || FFT_STATUS_CONFIG[0]
  const tone = getReadableStatusTone(label)

  return <Chip label={label} color={status.color} size='small' variant={variant} sx={getChipSx(tone)} />
}

// Vendor Status Chip component. The value may be a stable status code, its
// display label, or the legacy numeric FFT_STATUS during the transition.

export const VendorStatusChip = ({ value, label, variant = 'filled' }: VendorStatusChipProps) => {
  const statusCode = normalizeVendorStatusCode(value)
  const displayLabel = label || String(value || statusCode).replaceAll('_', ' ')
  const status = VENDOR_STATUS_CONFIG[statusCode]
  const tone = getReadableStatusTone(displayLabel)

  return <Chip label={displayLabel} color={status.color} size='small' variant={variant} sx={getChipSx(tone)} />
}

// FFT Status Cell Renderer for AG Grid (wrapper around FftStatusChip)
export const FftStatusCellRenderer = (props: ICellRendererParams) => {
  return <FftStatusChip value={props.value} variant='tonal' />
}

export const VendorStatusCellRenderer = (props: ICellRendererParams) => {
  return (
    <VendorStatusChip
      value={props.data?.VENDOR_STATUS_CODE ?? props.value}
      label={props.data?.VENDOR_STATUS_LABEL}
      variant='tonal'
    />
  )
}

// Export config for use elsewhere
export { FFT_STATUS_CONFIG, VENDOR_STATUS_CONFIG }

export default FftStatusCellRenderer
