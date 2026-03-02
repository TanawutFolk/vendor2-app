// MUI Imports
import { Button, Card, CardContent, CardHeader, Collapse, Grid, IconButton } from '@mui/material'

// Third-party Imports
import classNames from 'classnames'
import { useState } from 'react'

// Components Imports
import CustomTextField from '@components/mui/TextField'
import SelectCustom from '@components/react-select/SelectCustom'

// Types
import type { RequestStatus } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface SearchFilterValues {
    company_name: string
    submitted_by: string
    status: { value: RequestStatus; label: string } | null
}

export const defaultSearchFilterValues: SearchFilterValues = {
    company_name: '',
    submitted_by: '',
    status: null
}

// ─────────────────────────────────────────────────────────────────────────────
// Status Options
// ─────────────────────────────────────────────────────────────────────────────
const statusOptions: { value: RequestStatus; label: string }[] = [
    { value: 'new', label: 'New Request' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'pending_docs', label: 'Pending Documents' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
]

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────
interface SearchFilterProps {
    onSearch: (values: SearchFilterValues) => void
    onClear: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
const SearchFilter = ({ onSearch, onClear }: SearchFilterProps) => {
    const [collapse, setCollapse] = useState(false)
    const [values, setValues] = useState<SearchFilterValues>(defaultSearchFilterValues)

    const handleChange = <K extends keyof SearchFilterValues>(key: K, value: SearchFilterValues[K]) => {
        setValues(prev => ({ ...prev, [key]: value }))
    }

    const handleSearch = () => onSearch(values)

    const handleClear = () => {
        setValues(defaultSearchFilterValues)
        onClear()
    }

    return (
        <Card style={{ overflow: 'visible', zIndex: 4 }}>
            <CardHeader
                title='Search Filters'
                action={
                    <IconButton size='small' aria-label='collapse' onClick={() => setCollapse(!collapse)}>
                        <i className={classNames(collapse ? 'tabler-chevron-down' : 'tabler-chevron-up', 'text-xl')} />
                    </IconButton>
                }
                titleTypographyProps={{ variant: 'h5' }}
                sx={{ '& .MuiCardHeader-avatar': { mr: 3 } }}
            />
            <Collapse in={!collapse}>
                <CardContent>
                    <Grid container spacing={4}>

                        {/* Company Name */}
                        <Grid item xs={12} sm={6} md={3}>
                            <CustomTextField
                                fullWidth
                                label='Company Name'
                                placeholder='Enter ...'
                                autoComplete='off'
                                value={values.company_name}
                                onChange={e => handleChange('company_name', e.target.value)}
                            />
                        </Grid>

                        {/* Submitted By */}
                        <Grid item xs={12} sm={6} md={3}>
                            <CustomTextField
                                fullWidth
                                label='Submitted By'
                                placeholder='Enter ...'
                                autoComplete='off'
                                value={values.submitted_by}
                                onChange={e => handleChange('submitted_by', e.target.value)}
                            />
                        </Grid>

                        {/* Status */}
                        <Grid item xs={12} sm={6} md={3}>
                            <SelectCustom
                                label='Status'
                                placeholder='Select ...'
                                isClearable
                                options={statusOptions}
                                value={values.status}
                                onChange={(val: any) => handleChange('status', val)}
                                classNamePrefix='select'
                            />
                        </Grid>

                        {/* Buttons */}
                        <Grid item xs={12} className='flex gap-3'>
                            <Button onClick={handleSearch} variant='contained' type='button'>
                                Search
                            </Button>
                            <Button variant='tonal' color='secondary' type='reset' onClick={handleClear}>
                                Clear
                            </Button>
                        </Grid>

                    </Grid>
                </CardContent>
            </Collapse>
        </Card>
    )
}

export default SearchFilter
