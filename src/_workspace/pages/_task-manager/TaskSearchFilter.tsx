import { useState } from 'react'
import { Button, Divider, Grid, Typography } from '@mui/material'

import SearchFilterCard from '@_workspace/components/search/SearchFilterCard'
import SelectCustom from '@components/react-select/SelectCustom'

interface SelectOption {
    value: string
    label: string
}

interface TaskSearchFilterProps {
    statusOptions?: SelectOption[]
    picOptions?: SelectOption[]
    picFilter: SelectOption | null
    statusFilter: SelectOption | null
    onPicFilterChange: (value: SelectOption | null) => void
    onStatusFilterChange: (value: SelectOption | null) => void
    onSearch: () => void
    onClear: () => void
}

const TaskSearchFilter = ({
    statusOptions = [],
    picOptions = [],
    picFilter,
    statusFilter,
    onPicFilterChange,
    onStatusFilterChange,
    onSearch,
    onClear,
}: TaskSearchFilterProps) => {
    const [collapse, setCollapse] = useState(false)

    return (
        <SearchFilterCard collapse={collapse} onToggle={() => setCollapse(!collapse)}>
            <Grid container spacing={4}>
                <Grid item xs={12}>
                    <Divider textAlign='left'>
                        <Typography variant='body2' color='primary'>
                            Queue Details
                        </Typography>
                    </Divider>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <SelectCustom
                        label='Status'
                        placeholder='Select ...'
                        isClearable
                        options={statusOptions}
                        value={statusFilter}
                        onChange={value => onStatusFilterChange(value as SelectOption | null)}
                        classNamePrefix='select'
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <SelectCustom
                        label='PIC'
                        placeholder='Select ...'
                        isClearable
                        options={picOptions}
                        value={picFilter}
                        onChange={value => onPicFilterChange(value as SelectOption | null)}
                        classNamePrefix='select'
                    />
                </Grid>

                <Grid item xs={12} className='flex gap-3'>
                    <Button variant='contained' type='button' onClick={onSearch}>
                        Search
                    </Button>
                    <Button variant='tonal' color='secondary' type='button' onClick={onClear}>
                        Clear
                    </Button>
                </Grid>
            </Grid>
        </SearchFilterCard>
    )
}

export default TaskSearchFilter
