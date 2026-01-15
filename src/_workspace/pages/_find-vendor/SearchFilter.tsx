'use client'

// MUI Imports
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'

// Components Imports
import { Controller, useFormContext } from 'react-hook-form'
import CustomTextField from '@components/mui/TextField'
import SelectCustom from '@/components/react-select/SelectCustom'

// libs Imports
import StatusOption from '@libs/react-select/option/StatusOption'

// _template Imports
import { useDxContext } from '@/_template/DxContextProvider'

// Hooks
import { useGetVendorTypes } from '@_workspace/react-query/hooks/vendor/useAddVendorMasterData'

// Types
import type { FindVendorFormData } from './validateSchema'
import { defaultSearchFilters } from './validateSchema'
import { useMemo } from 'react'

interface SearchFilterProps {
    onSearch: () => void
}

const SearchFilter = ({ onSearch }: SearchFilterProps) => {
    // Context
    const { setIsEnableFetching } = useDxContext()

    // react-hook-form
    const { setValue, control, handleSubmit } = useFormContext<FindVendorFormData>()

    // React Query - Get Vendor Types for dropdown
    const { data: vendorTypesData } = useGetVendorTypes(true)

    // Transform vendor types to options
    const vendorTypeOptions = useMemo(() => {
        if (!vendorTypesData?.ResultOnDb) return []
        return vendorTypesData.ResultOnDb.map(item => ({
            value: item.vendor_type_id,
            label: item.name
        }))
    }, [vendorTypesData])

    // Function
    const handleClear = () => {
        setValue('searchFilters', defaultSearchFilters)
        setIsEnableFetching(true)
    }

    const handleSearch = () => {
        setIsEnableFetching(true)
        onSearch()
    }

    return (
        <Card style={{ overflow: 'visible', zIndex: 4 }}>
            <CardHeader
                title='Search Filters'
                titleTypographyProps={{ variant: 'h5' }}
                sx={{ '& .MuiCardHeader-avatar': { mr: 3 } }}
            />
            <CardContent>
                <Grid container spacing={4}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Controller
                            name='searchFilters.company_name'
                            control={control}
                            render={({ field }) => (
                                <CustomTextField
                                    {...field}
                                    fullWidth
                                    label='Company Name'
                                    placeholder='Enter company name...'
                                    autoComplete='off'
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Controller
                            name='searchFilters.vendor_type_id'
                            control={control}
                            render={({ field }) => (
                                <SelectCustom
                                    value={vendorTypeOptions.find(opt => opt.value === field.value) || null}
                                    onChange={(selected: any) => {
                                        field.onChange(selected?.value || null)
                                    }}
                                    options={vendorTypeOptions}
                                    isClearable
                                    label='Vendor Type'
                                    placeholder='Select vendor type...'
                                    classNamePrefix='select'
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Controller
                            name='searchFilters.province'
                            control={control}
                            render={({ field }) => (
                                <CustomTextField
                                    {...field}
                                    fullWidth
                                    label='Province'
                                    placeholder='Enter province...'
                                    autoComplete='off'
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Controller
                            name='searchFilters.status'
                            control={control}
                            render={({ field }) => (
                                <SelectCustom
                                    {...field}
                                    options={StatusOption}
                                    isClearable
                                    label='Status'
                                    placeholder='Select status...'
                                    classNamePrefix='select'
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} className='flex gap-3'>
                        <Button
                            onClick={handleSearch}
                            variant='contained'
                            type='button'
                        >
                            Search
                        </Button>
                        <Button
                            variant='tonal'
                            color='secondary'
                            type='reset'
                            onClick={handleClear}
                        >
                            Clear
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}

export default SearchFilter
