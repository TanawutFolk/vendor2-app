// MUI Imports
import { Button, Card, CardContent, CardHeader, Collapse, Grid, IconButton } from '@mui/material'

// Third-party Imports
import classNames from 'classnames'
import { useState } from 'react'

// Components Imports
import CustomTextField from '@components/mui/TextField'
import SelectCustom from '@components/react-select/SelectCustom'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface SearchFilterValues {
    vendor_name: string
    submitted_by: string
    overall_status: { value: string; label: string } | null
}

export const defaultSearchFilterValues: SearchFilterValues = {
    vendor_name: '',
    submitted_by: '',
    overall_status: null
}

// ─────────────────────────────────────────────────────────────────────────────
// Status Options (matching actual DB values from request_register_vendor)
// ─────────────────────────────────────────────────────────────────────────────
const statusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
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

                        {/* Vendor Name */}
                        <Grid item xs={12} sm={6} md={3}>
                            <CustomTextField
                                fullWidth
                                label='Vendor Name'
                                placeholder='Enter ...'
                                autoComplete='off'
                                value={values.vendor_name}
                                onChange={e => handleChange('vendor_name', e.target.value)}
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

                        {/* Overall Status */}
                        <Grid item xs={12} sm={6} md={3}>
                            <SelectCustom
                                label='Status'
                                placeholder='Select ...'
                                isClearable
                                options={statusOptions}
                                value={values.overall_status}
                                onChange={(val: any) => handleChange('overall_status', val)}
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
