import { useState } from 'react'
import { Button, Grid } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'
import SearchFilterCard from '@_workspace/components/search/SearchFilterCard'
import CustomTextField from '@components/mui/TextField'
import SelectCustom from '@components/react-select/SelectCustom'
import { useDxContext } from '@/_template/DxContextProvider'
import type { BlacklistFormData } from './validateSchema'
import { defaultSearchFilters } from './validateSchema'

const SearchFilter = () => {
    const [collapse, setCollapse] = useState(false)
    const { control, setValue } = useFormContext<BlacklistFormData>()
    const { setIsEnableFetching } = useDxContext()

    const groupOptions = [
        { value: 'ALL', label: 'All' },
        { value: 'US', label: 'US' },
        { value: 'CN', label: 'CN' },
    ]

    const handleSearch = () => {
        setIsEnableFetching(true)
    }

    const handleClear = () => {
        setValue('searchFilters', defaultSearchFilters)
        setIsEnableFetching(true)
    }

    return (
        <SearchFilterCard collapse={collapse} onToggle={() => setCollapse(!collapse)}>
            <Grid container spacing={4}>
                <Grid item xs={12} sm={6} md={4}>
                    <Controller
                        name='searchFilters.vendor_name'
                        control={control}
                        render={({ field }) => (
                            <CustomTextField
                                {...field}
                                fullWidth
                                label='Vendor Name'
                                placeholder='Enter ...'
                                autoComplete='off'
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        handleSearch()
                                    }
                                }}
                            />
                        )}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <Controller
                        name='searchFilters.group_code'
                        control={control}
                        render={({ field }) => (
                            <SelectCustom
                                {...field}
                                label='Group'
                                placeholder='Select ...'
                                isClearable={false}
                                options={groupOptions}
                                value={groupOptions.find((option) => option.value === field.value) || groupOptions[0]}
                                onChange={(value) => field.onChange(((value as { value: 'ALL' | 'US' | 'CN' } | null)?.value || 'ALL'))}
                                classNamePrefix='select'
                            />
                        )}
                    />
                </Grid>

                <Grid item xs={12} className='flex gap-3'>
                    <Button variant='contained' type='button' onClick={handleSearch}>Search</Button>
                    <Button variant='tonal' color='secondary' type='button' onClick={handleClear}>Clear</Button>
                </Grid>
            </Grid>
        </SearchFilterCard>
    )
}

export default SearchFilter
