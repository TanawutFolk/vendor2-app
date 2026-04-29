'use client'

import { Chip } from '@mui/material'
import type { ICellRendererParams } from 'ag-grid-community'

import { formatFftStatus } from '@_workspace/utils/fftStatus'
import { getChipSx, getReadableStatusTone } from '@_workspace/utils/statusChipStyles'

// FFT Status configuration (for numeric values 0/1/2)
const FFT_STATUS_CONFIG: Record<string, { label: string; color: 'success' | 'error' | 'warning' | 'default' }> = {
    1: { label: 'Registered', color: 'success' as const },
    0: { label: 'Not Registered', color: 'error' as const },
    2: { label: 'Cannot Register', color: 'default' as const }
}

// Status Check configuration (for string values from Prones check)
const STATUS_CHECK_CONFIG: Record<string, { label: string; color: 'success' | 'error' | 'warning' | 'default' }> = {
    'Registered': { label: 'Registered', color: 'success' },
    'Not Registered': { label: 'Not Registered', color: 'error' },
    'In Progress': { label: 'In Progress', color: 'warning' },
    'Cannot Register': { label: 'Cannot Register', color: 'default' }
}

// Base FFT Status Chip component
interface FftStatusChipProps {
    value: number | string | undefined
    variant?: 'filled' | 'tonal'
}

export const FftStatusChip = ({ value, variant = 'filled' }: FftStatusChipProps) => {
    const label = formatFftStatus(value)
    const status = FFT_STATUS_CONFIG[String(value ?? '').trim()] || STATUS_CHECK_CONFIG[label] || STATUS_CHECK_CONFIG['Not Registered']
    const tone = getReadableStatusTone(label)

    return (
        <Chip
            label={label}
            color={status.color}
            size='small'
            variant={variant}
            sx={getChipSx(tone)}
        />
    )
}

// Status Check Chip component (for string values)
interface StatusCheckChipProps {
    value: string | undefined
    variant?: 'filled' | 'tonal'
}

export const StatusCheckChip = ({ value, variant = 'filled' }: StatusCheckChipProps) => {
    const status = STATUS_CHECK_CONFIG[value || ''] || STATUS_CHECK_CONFIG['Not Registered']
    const tone = getReadableStatusTone(status.label)

    return (
        <Chip
            label={status.label}
            color={status.color}
            size='small'
            variant={variant}
            sx={getChipSx(tone)}
        />
    )
}

// FFT Status Cell Renderer for AG Grid (wrapper around FftStatusChip)
export const FftStatusCellRenderer = (props: ICellRendererParams) => {
    return <FftStatusChip value={props.value} variant='tonal' />
}

// Status Check Cell Renderer for AG Grid (for Prones check result)
export const StatusCheckCellRenderer = (props: ICellRendererParams) => {
    return <StatusCheckChip value={props.value} variant='tonal' />
}

// Export config for use elsewhere
export { FFT_STATUS_CONFIG, STATUS_CHECK_CONFIG }

export default FftStatusCellRenderer
