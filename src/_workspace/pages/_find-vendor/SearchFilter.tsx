// MUI Imports
import { Button, Divider, Grid, Typography } from '@mui/material'

// Third-party Imports
import { useState } from 'react'

// Components Imports
import { Controller, useFormContext } from 'react-hook-form'
import CustomTextField from '@components/mui/TextField'
import AsyncSelectCustom from '@components/react-select/AsyncSelectCustom'
import SelectCustom from '@components/react-select/SelectCustom'

// react-query Imports
import { useQueryClient } from '@tanstack/react-query'
import { useDxSaveSearchFilters } from '@/_template/DxSaveSearchFilters'
import { PREFIX_QUERY_KEY } from '@_workspace/react-query/hooks/useFindVendor'
import { useDxContext } from '@/_template/DxContextProvider'

// Fetch functions
import { fetchVendorTypes } from '@/_workspace/react-select/async-promise-load-options/find-vendor/fetchVendorTypes'
import { fetchProvinces } from '@/_workspace/react-select/async-promise-load-options/find-vendor/fetchProvinces'
import { fetchCountries } from '@/_workspace/react-select/async-promise-load-options/find-vendor/fetchCountries'
import { fetchProductGroups } from '@/_workspace/react-select/async-promise-load-options/find-vendor/fetchProductGroups'

// Types
import type { FindVendorFormData } from './validateSchema'
import { defaultSearchFilters } from './validateSchema'
import { MENU_ID } from './env'
import SearchFilterCard from '@_workspace/components/search/SearchFilterCard'

const SearchFilter = () => {
    // States
    const [collapse, setCollapse] = useState(false)

    // react-hook-form
    const { setValue, control, handleSubmit } = useFormContext<FindVendorFormData>()

    // react-query
    const queryClient = useQueryClient()

    // DxContext
    const { setIsEnableFetching } = useDxContext()

    const onResetFormSearch = () => {
        setValue('searchFilters', defaultSearchFilters)
    }

    // Function : react-hook-form
    const onSubmit = () => {
        setIsEnableFetching(true)
        queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
        save()
    }

    const onError = (data: any) => {
        console.log(data)
    }

    const { save } = useDxSaveSearchFilters<FindVendorFormData>({ MENU_ID })



    return (
        <SearchFilterCard collapse={collapse} onToggle={() => setCollapse(!collapse)}>
            <Grid container spacing={4}>
                        <Grid item xs={12}>
                            <Grid container>
                                <Grid item xs={12} sm={4} md={8}>
                                    <Controller
                                        name='searchFilters.global_search'
                                        control={control}
                                        render={({ field }) => (
                                            <CustomTextField
                                                {...field}
                                                fullWidth
                                                label='Global Search'
                                                placeholder='Search by Company Name, Vendor Code, etc.'
                                                autoComplete='off'
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <Divider textAlign='left'>
                                <Typography variant='body2' color='primary'>
                                    Vendor Details
                                </Typography>
                            </Divider>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Controller
                                name='searchFilters.company_name'
                                control={control}
                                render={({ field }) => (
                                    <CustomTextField
                                        {...field}
                                        fullWidth
                                        label='Company Name'
                                        placeholder='Enter ...'
                                        autoComplete='off'
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Controller
                                name='searchFilters.country'
                                control={control}
                                render={({ field }) => (
                                    <AsyncSelectCustom
                                        label='Country'
                                        placeholder='Select ...'
                                        defaultOptions
                                        cacheOptions
                                        isClearable
                                        loadOptions={inputValue => fetchCountries(inputValue)}
                                        value={field.value ? { label: field.value, value: field.value } : null}
                                        onChange={(val: { label: string; value: string } | null) => field.onChange(val?.value || '')}
                                        classNamePrefix='select'
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
                                        placeholder='Select ...'
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
                                        placeholder='Select ...'
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
                                name='searchFilters.product_group_id'
                                control={control}
                                render={({ field }) => (
                                    <AsyncSelectCustom
                                        {...field}
                                        label='Product Group'
                                        placeholder='Select ...'
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
                                name='searchFilters.product_name'
                                control={control}
                                render={({ field }) => (
                                    <CustomTextField
                                        {...field}
                                        fullWidth
                                        label='Product Name'
                                        placeholder='Enter ...'
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
                                        placeholder='Enter ...'
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
                                        placeholder='Enter ...'
                                        autoComplete='off'
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Controller
                                name='searchFilters.inuse'
                                control={control}
                                render={({ field }) => (
                                    <SelectCustom
                                        {...field}
                                        label='Status ( Active / Inactive )'
                                        placeholder='Select ...'
                                        isClearable
                                        options={[
                                            { value: 1, label: 'Active' },
                                            { value: 0, label: 'Inactive' }
                                        ]}
                                        classNamePrefix='select'
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Divider textAlign='left'>
                                <Typography variant='body2' color='primary'>
                                    Prones
                                </Typography>
                            </Divider>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Controller
                                name='searchFilters.fft_vendor_code'
                                control={control}
                                render={({ field }) => (
                                    <CustomTextField
                                        {...field}
                                        fullWidth
                                        label='Prones Code'
                                        placeholder='Enter ...'
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
                                        label='Prones Status'
                                        placeholder='Select ...'
                                        isClearable
                                        options={[
                                            { value: '1', label: 'Registered' },
                                            { value: '0', label: 'Not Registered' },
                                            { value: 'In Progress', label: 'In Progress' },
                                            { value: 'Cannot Register', label: 'Cannot Register' }
                                        ]}
                                        classNamePrefix='select'
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} className='flex gap-3'>
                            <Button
                                onClick={() => handleSubmit(onSubmit, onError)()}
                                variant='contained'
                                type='button'
                            >
                                Search
                            </Button>
                            <Button
                                variant='tonal'
                                color='secondary'
                                type='reset'
                                onClick={onResetFormSearch}
                            >
                                Clear
                            </Button>
                        </Grid>
            </Grid>
        </SearchFilterCard>
    )
}
export default SearchFilter
