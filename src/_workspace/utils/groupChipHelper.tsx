import { Chip } from '@mui/material'
import { ASSIGNEE_GROUP_LABEL_MAP } from './requestWorkflow'

export const GROUP_CHIP_COLOR_MAP: Record<string, 'primary' | 'info' | 'warning' | 'error' | 'secondary'> = {
    LOCAL_PO_PIC: 'primary',
    OVERSEA_PO_PIC: 'info',
    PO_CHECKER_MAIN: 'warning',
    MD: 'error',
    PO_MGR: 'warning',
    PO_GM: 'secondary',
    ACC_LOCAL_MAIN: 'info',
    ACC_OVERSEA_MAIN: 'info'
}

export const getGroupChipColor = (group: string): 'primary' | 'info' | 'warning' | 'error' | 'secondary' => {
    return GROUP_CHIP_COLOR_MAP[group] ?? 'secondary'
}

interface GroupChipProps {
    value: string
    label?: string
}

export const GroupChip = ({ value, label }: GroupChipProps) => {
    if (!value) return <>-</>
    return <Chip label={label || ASSIGNEE_GROUP_LABEL_MAP[value] || value} size='small' color={getGroupChipColor(value)} variant='tonal' />
}
