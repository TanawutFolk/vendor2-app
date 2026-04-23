'use client'

import { Chip } from '@mui/material'
import type { ICellRendererParams } from 'ag-grid-community'

// FFT Status configuration (for numeric values 0/1)
const FFT_STATUS_CONFIG = {
    1: { label: 'Registered', color: 'success' as const },
    0: { label: 'Not Registered', color: 'error' as const }
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
    const status = FFT_STATUS_CONFIG[value as keyof typeof FFT_STATUS_CONFIG] || FFT_STATUS_CONFIG[0]

    return (
        <Chip
            label={status.label}
            color={status.color}
            size='small'
            variant={variant}
            sx={{ fontWeight: 500 }}
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

    return (
        <Chip
            label={status.label}
            color={status.color}
            size='small'
            variant={variant}
            sx={{ fontWeight: 500 }}
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
