import { Button, Grid, TextField } from '@mui/material'

import SearchFilterCard from '@_workspace/components/search/SearchFilterCard'

interface SearchFilterProps {
    collapse: boolean
    onToggle: () => void
    vendorNameFilter: string
    onVendorNameFilterChange: (value: string) => void
    statusFilter: { value: string; label: string } | null
    onStatusFilterChange: (value: { value: string; label: string } | null) => void
    statusOptions: Array<{ value: string; label: string }>
    onSearch: () => void
    onClear: () => void
}

const SearchFilter = ({
    collapse,
    onToggle,
    vendorNameFilter,
    onVendorNameFilterChange,
    statusFilter,
    onStatusFilterChange,
    statusOptions,
    onSearch,
    onClear,
}: SearchFilterProps) => {
    return (
        <SearchFilterCard collapse={collapse} onToggle={onToggle}>
            <Grid container spacing={4}>
                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        fullWidth
                        size='small'
                        label='Vendor Name'
                        placeholder='Enter ...'
                        value={vendorNameFilter}
                        onChange={event => onVendorNameFilterChange(event.target.value)}
                        onKeyDown={event => {
                            if (event.key === 'Enter') {
                                onSearch()
                            }
                        }}
                        autoComplete='off'
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        select
                        fullWidth
                        size='small'
                        label='Status'
                        value={statusFilter?.value || ''}
                        onChange={event => {
                            const selectedStatus = statusOptions.find(option => option.value === event.target.value)
                            onStatusFilterChange(selectedStatus ? { value: selectedStatus.value, label: selectedStatus.label } : null)
                        }}
                        SelectProps={{ native: true }}
                    >
                        <option value=''>All Statuses</option>
                        {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={12} className='flex gap-3'>
                    <Button onClick={onSearch} variant='contained' type='button'>
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

export default SearchFilter
