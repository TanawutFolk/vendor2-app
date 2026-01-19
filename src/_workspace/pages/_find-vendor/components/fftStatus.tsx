'use client'

import { Chip } from '@mui/material'
import type { ICellRendererParams } from 'ag-grid-community'

// FFT Status configuration
const FFT_STATUS_CONFIG = {
    1: { label: 'Registered', color: 'success' as const },
    0: { label: 'Not Registered', color: 'error' as const }
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

// FFT Status Cell Renderer for AG Grid (wrapper around FftStatusChip)
export const FftStatusCellRenderer = (props: ICellRendererParams) => {
    return <FftStatusChip value={props.value} variant='tonal' />
}

// Export config for use elsewhere
export { FFT_STATUS_CONFIG }

export default FftStatusCellRenderer
