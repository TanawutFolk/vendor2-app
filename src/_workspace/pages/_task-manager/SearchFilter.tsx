// MUI Imports
import { Button, Card, CardContent, CardHeader, Collapse, Grid, IconButton } from '@mui/material'

// Third-party Imports
import classNames from 'classnames'
import { useState } from 'react'

// React Hook Form Imports
import { Controller, useFormContext } from 'react-hook-form'

// Components Imports
import CustomTextField from '@components/mui/TextField'
import SelectCustom from '@components/react-select/SelectCustom'

// Context
import { useDxContext } from '@/_template/DxContextProvider'

// Types & Schema
import type { AssigneesFormData } from './validateSchema'
import { fetchDefaultValues } from './validateSchema'

export const groupOptions = [
    { label: 'Local', value: 'Local' },
    { label: 'Oversea', value: 'Oversea' },
    { label: 'PO Manager', value: 'PO_Manager' },
    { label: 'MD', value: 'MD' }
]

export const inUseOptions = [
    { label: 'Active', value: '1' },
    { label: 'Inactive', value: '0' }
]

const SearchFilter = () => {
    const [collapse, setCollapse] = useState(false)

    // React Hook Form
    const { setValue, control } = useFormContext<AssigneesFormData>()

    // DxContext — trigger grid refresh
    const { setIsEnableFetching } = useDxContext()

    const handleSearch = () => {
        setIsEnableFetching(true)
    }

    const handleClear = async () => {
        const defaults = await fetchDefaultValues()
        setValue('keyword', defaults.keyword)
        setValue('group_name', defaults.group_name)
        setValue('in_use', defaults.in_use)
        setIsEnableFetching(true)
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

                        {/* Keyword Search */}
                        <Grid item xs={12} sm={6} md={4}>
                            <Controller
                                name='keyword'
                                control={control}
                                render={({ field }) => (
                                    <CustomTextField
                                        {...field}
                                        fullWidth
                                        label='Search Keyword (Name, EmpCode, Email)'
                                        placeholder='Enter text ...'
                                        autoComplete='off'
                                    />
                                )}
                            />
                        </Grid>

                        {/* Group Name */}
                        <Grid item xs={12} sm={6} md={4}>
                            <Controller
                                name='group_name'
                                control={control}
                                render={({ field }) => (
                                    <SelectCustom
                                        label='Group Name'
                                        placeholder='Select group ...'
                                        isClearable
                                        options={groupOptions}
                                        value={field.value ? groupOptions.find(o => o.value === field.value) : null}
                                        onChange={(val: any) => field.onChange(val?.value || '')}
                                        classNamePrefix='select'
                                    />
                                )}
                            />
                        </Grid>

                        {/* Status */}
                        <Grid item xs={12} sm={6} md={4}>
                            <Controller
                                name='in_use'
                                control={control}
                                render={({ field }) => (
                                    <SelectCustom
                                        label='Status'
                                        placeholder='Select status ...'
                                        isClearable
                                        options={inUseOptions}
                                        value={field.value ? inUseOptions.find(o => o.value === field.value) : null}
                                        onChange={(val: any) => field.onChange(val?.value || '')}
                                        classNamePrefix='select'
                                    />
                                )}
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
