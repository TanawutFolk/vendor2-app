import { useState } from 'react'
import { Alert, Button, Grid, MenuItem, TextField, Typography } from '@mui/material'
import SearchFilterCard from '@_workspace/components/search/SearchFilterCard'
import { ASSIGNEE_GROUP_LABEL_MAP } from '@_workspace/utils/requestWorkflow'

interface TaskSearchFilterProps {
    statusOptions?: any[]
    searchText: string
    statusFilter: string
    groupFilter: string
    scopeFilter: string
    impactedOnly: string
    onSearchTextChange: (value: string) => void
    onStatusFilterChange: (value: string) => void
    onGroupFilterChange: (value: string) => void
    onScopeFilterChange: (value: string) => void
    onImpactedOnlyChange: (value: string) => void
    onSearch: () => void
    onClear: () => void
}

const TaskSearchFilter = ({
    statusOptions = [],
    searchText,
    statusFilter,
    groupFilter,
    scopeFilter,
    impactedOnly,
    onSearchTextChange,
    onStatusFilterChange,
    onGroupFilterChange,
    onScopeFilterChange,
    onImpactedOnlyChange,
    onSearch,
    onClear,
}: TaskSearchFilterProps) => {
    const [collapse, setCollapse] = useState(false)

    return (
        <SearchFilterCard collapse={collapse} onToggle={() => setCollapse(!collapse)}>
            <Grid container spacing={4}>
                <Grid item xs={12}>
                    <Typography variant='body2' color='text.secondary'>
                        Use this page to reassign ongoing work. This is especially important after changing employees in Employee Manager.
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Alert severity='info'>
                        Rows marked <strong>Needs Reassign</strong> mean the current owner is no longer active in the workflow group and should be reassigned before the process gets stuck.
                    </Alert>
                </Grid>
                <Grid item xs={12} md={5}>
                    <TextField
                        fullWidth
                        label='Search'
                        placeholder='Company, request id, owner, current step'
                        value={searchText}
                        onChange={e => onSearchTextChange(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        select
                        fullWidth
                        label='Status'
                        value={statusFilter}
                        onChange={e => onStatusFilterChange(e.target.value)}
                    >
                        <MenuItem value=''>All</MenuItem>
                        {statusOptions.map((item: any) => (
                            <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={12} md={3}>
                    <TextField
                        select
                        fullWidth
                        label='Workflow Group'
                        value={groupFilter}
                        onChange={e => onGroupFilterChange(e.target.value)}
                    >
                        <MenuItem value=''>All</MenuItem>
                        {Object.entries(ASSIGNEE_GROUP_LABEL_MAP).map(([value, label]) => (
                            <MenuItem key={value} value={value}>{label}</MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={12} md={3}>
                    <TextField
                        select
                        fullWidth
                        label='Scope'
                        value={scopeFilter}
                        onChange={e => onScopeFilterChange(e.target.value)}
                    >
                        <MenuItem value=''>All</MenuItem>
                        <MenuItem value='REQUEST_PIC'>PIC</MenuItem>
                        <MenuItem value='CURRENT_STEP'>Current Step</MenuItem>
                    </TextField>
                </Grid>
                <Grid item xs={12} md={3}>
                    <TextField
                        select
                        fullWidth
                        label='Owner Status'
                        value={impactedOnly}
                        onChange={e => onImpactedOnlyChange(e.target.value)}
                    >
                        <MenuItem value=''>All</MenuItem>
                        <MenuItem value='1'>Needs Reassign</MenuItem>
                        <MenuItem value='0'>Active</MenuItem>
                    </TextField>
                </Grid>
                <Grid item xs={12} md={3} className='flex gap-3'>
                    <Button variant='contained' onClick={onSearch}>Search</Button>
                    <Button variant='tonal' color='secondary' onClick={onClear}>Clear</Button>
                </Grid>
            </Grid>
        </SearchFilterCard>
    )
}

export default TaskSearchFilter
