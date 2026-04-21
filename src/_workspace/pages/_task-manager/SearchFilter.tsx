// MUI Imports
import { Button, Grid } from '@mui/material'

// Third-party Imports
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
import SearchFilterCard from '@_workspace/components/search/SearchFilterCard'
import { ASSIGNEE_GROUPS } from '@_workspace/utils/requestWorkflow'

export const groupOptions = [...ASSIGNEE_GROUPS]

export const inUseOptions = [
    { label: 'Active', value: '1' },
    { label: 'Inactive', value: '0' }
]

const SearchFilter = () => {
    const [collapse, setCollapse] = useState(false)

    // React Hook Form
    const { setValue, control, handleSubmit } = useFormContext<AssigneesFormData>()

    // DxContext — trigger grid refresh
    const { setIsEnableFetching } = useDxContext()

    const onResetFormSearch = async () => {
        const defaults = await fetchDefaultValues()
        setValue('keyword', defaults.keyword)
        setValue('group_code', defaults.group_code)
        setValue('in_use', defaults.in_use)
    }

    // Function : react-hook-form
    const onSubmit = () => {
        setIsEnableFetching(true)
    }

    const onError = (data: any) => {
        console.log(data)
    }

    return (
        <SearchFilterCard collapse={collapse} onToggle={() => setCollapse(!collapse)}>
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

                        {/* Group Code */}
                        <Grid item xs={12} sm={6} md={4}>
                            <Controller
                                name='group_code'
                                control={control}
                                render={({ field }) => (
                                    <SelectCustom
                                        label='Group'
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
                            <Button onClick={() => handleSubmit(onSubmit, onError)()} variant='contained' type='button'>
                                Search
                            </Button>
                            <Button variant='tonal' color='secondary' type='reset' onClick={onResetFormSearch}>
                                Clear
                            </Button>
                        </Grid>

            </Grid>
        </SearchFilterCard>
    )
}

export default SearchFilter
