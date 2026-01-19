// MUI Imports
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Collapse from '@mui/material/Collapse'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'

// Third-party Imports
import classNames from 'classnames'
import { useState } from 'react'

// Components Imports
import { Controller, useFormContext } from 'react-hook-form'
import CustomTextField from '@components/mui/TextField'
import AsyncSelectCustom from '@components/react-select/AsyncSelectCustom'
import SelectCustom from '@components/react-select/SelectCustom'

// _template Imports
import { useDxContext } from '@/_template/DxContextProvider'

// react-query Imports
import { useQueryClient } from '@tanstack/react-query'
import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

// Fetch functions
import {
    fetchVendorTypes,
    fetchProvinces,
    fetchProductGroups
} from '@/_workspace/react-select/async-promise-load-options/find-vendor/fetchFindVendor'

// Types
import type { FindVendorFormData } from './validateSchema'
import { defaultSearchFilters } from './validateSchema'
import { MENU_ID } from './env'

interface SearchFilterProps {
    onSearch: () => void
}

const SearchFilter = ({ onSearch }: SearchFilterProps) => {
    // States
    const [collapse, setCollapse] = useState(false)

    // Context
    const { setIsEnableFetching } = useDxContext()

    // react-hook-form
    const { setValue, getValues, control } = useFormContext<FindVendorFormData>()

    // react-query
    const queryClient = useQueryClient()

    // USER profile setting save handlers
    const onMutateSuccess = () => {
        console.log('User profile setting saved successfully')
    }

    const onMutateError = (e: any) => {
        console.log('User profile setting save error:', e)
    }

    const { mutate } = useCreate(onMutateSuccess, onMutateError)

    // Save user profile setting
    const handleAdd = () => {
        const dataItem = {
            USER_ID: getUserData().USER_ID,
            APPLICATION_ID: import.meta.env.VITE_APPLICATION_ID,
            MENU_ID: MENU_ID.toString(),
            USER_PROFILE_SETTING_PROGRAM_DATA: {
                searchFilters: {
                    company_name: getValues('searchFilters.company_name') || '',
                    vendor_type_id: getValues('searchFilters.vendor_type_id') || null,
                    province: getValues('searchFilters.province') || null,
                    group_name: getValues('searchFilters.group_name') || null,
                    status: getValues('searchFilters.status') || null,
                    product_name: getValues('searchFilters.product_name') || '',
                    maker_name: getValues('searchFilters.maker_name') || '',
                    model_list: getValues('searchFilters.model_list') || ''
                },
                searchResults: {
                    pageSize: getValues('searchResults.pageSize') || 20,
                    columnFilters: getValues('searchResults.columnFilters'),
                    sorting: getValues('searchResults.sorting'),
                    density: getValues('searchResults.density'),
                    columnVisibility: getValues('searchResults.columnVisibility'),
                    columnPinning: getValues('searchResults.columnPinning'),
                    columnOrder: getValues('searchResults.columnOrder'),
                    columnFilterFns: getValues('searchResults.columnFilterFns')
                }
            } as FindVendorFormData
        }

        mutate(dataItem)
    }

    // Function
    const handleClear = () => {
        setValue('searchFilters', defaultSearchFilters)
        setIsEnableFetching(true)
        handleAdd()
    }

    const handleSearch = () => {
        setIsEnableFetching(true)
        onSearch()
        handleAdd()
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
                                    <AsyncSelectCustom
                                        {...field}
                                        label='Vendor Type'
                                        placeholder='Select Type...'
                                        defaultOptions
                                        cacheOptions
                                        isClearable
                                        loadOptions={inputValue => fetchVendorTypes(inputValue)}
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
                                    <AsyncSelectCustom
                                        {...field}
                                        label='Province'
                                        placeholder='Select Province...'
                                        defaultOptions
                                        cacheOptions
                                        isClearable
                                        loadOptions={inputValue => fetchProvinces(inputValue)}
                                        classNamePrefix='select'
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Controller
                                name='searchFilters.group_name'
                                control={control}
                                render={({ field }) => (
                                    <AsyncSelectCustom
                                        {...field}
                                        label='Product Group'
                                        placeholder='Select Group...'
                                        defaultOptions
                                        cacheOptions
                                        isClearable
                                        loadOptions={inputValue => fetchProductGroups(inputValue)}
                                        classNamePrefix='select'
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
                                        label='Status'
                                        placeholder='Select Status...'
                                        isClearable
                                        options={[
                                            { value: 'Active', label: 'Active' },
                                            { value: 'Inactive', label: 'Inactive' }
                                        ]}
                                        classNamePrefix='select'
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Controller
                                name='searchFilters.product_name'
                                control={control}
                                render={({ field }) => (
                                    <CustomTextField
                                        {...field}
                                        fullWidth
                                        label='Product Name'
                                        placeholder='Enter product name...'
                                        autoComplete='off'
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Controller
                                name='searchFilters.maker_name'
                                control={control}
                                render={({ field }) => (
                                    <CustomTextField
                                        {...field}
                                        fullWidth
                                        label='Maker Name'
                                        placeholder='Enter maker name...'
                                        autoComplete='off'
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Controller
                                name='searchFilters.model_list'
                                control={control}
                                render={({ field }) => (
                                    <CustomTextField
                                        {...field}
                                        fullWidth
                                        label='Model Name'
                                        placeholder='Enter model name...'
                                        autoComplete='off'
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
            </Collapse>
        </Card>
    )
}

export default SearchFilter
