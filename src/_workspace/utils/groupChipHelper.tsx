import { Chip } from '@mui/material'

export const GROUP_CHIP_COLOR_MAP: Record<string, 'primary' | 'info' | 'warning' | 'error' | 'default'> = {
    Local: 'primary',
    Oversea: 'info',
    PO_Manager: 'warning',
    MD: 'error'
}

export const getGroupChipColor = (group: string): 'primary' | 'info' | 'warning' | 'error' | 'default' => {
    return GROUP_CHIP_COLOR_MAP[group] ?? 'default'
}

interface GroupChipProps {
    value: string
}

export const GroupChip = ({ value }: GroupChipProps) => {
    if (!value) return <>-</>
    return <Chip label={value} size='small' color={getGroupChipColor(value)} variant='tonal' />
}
