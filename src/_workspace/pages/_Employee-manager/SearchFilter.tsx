// MUI Imports
import { Alert, Button, Grid, Typography } from '@mui/material'

// Third-party Imports
import { useState } from 'react'

// React Hook Form Imports
import { Controller, useFormContext } from 'react-hook-form'

// Components Imports
import CustomTextField from '@components/mui/TextField'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import SelectCustom from '@components/react-select/SelectCustom'

// Context
import { useDxContext } from '@/_template/DxContextProvider'

// Types & Schema
import type { AssigneesFormData } from './validateSchema'
import { fetchDefaultValues } from './validateSchema'
import SearchFilterCard from '@_workspace/components/search/SearchFilterCard'
import AssigneesServices from '@_workspace/services/_task-manager/AssigneesServices'

const inUseOptions = [
    { label: 'Active', value: '1' },
    { label: 'Inactive', value: '0' }
]

type GroupOptionSource = {
    label?: string
    group_name?: string
    value?: string
    group_code?: string
}

type SelectOption = {
    label: string
    value: string
}

const mapGroupOption = (item: GroupOptionSource): SelectOption => ({
    label: String(item.label || item.group_name || item.value || item.group_code || '').trim(),
    value: String(item.value || item.group_code || '').trim().toUpperCase()
})

const SearchFilter = () => {
    const [collapse, setCollapse] = useState(false)

    const { setValue, control, handleSubmit } = useFormContext<AssigneesFormData>()
    const { setIsEnableFetching } = useDxContext()

    const onResetFormSearch = async () => {
        const defaults = await fetchDefaultValues()
        setValue('keyword', defaults.keyword)
        setValue('group_code', defaults.group_code)
        setValue('in_use', defaults.in_use)
    }

    const onSubmit = () => {
        setIsEnableFetching(true)
    }

    const loadGroupOptions = async (inputValue: string) => {
        const res = await AssigneesServices.getGroups({ keyword: inputValue || '' })
        return (res.data?.ResultOnDb || []).map(mapGroupOption)
    }

    const onError = (data: unknown) => {
        console.log(data)
    }

    return (
        <SearchFilterCard collapse={collapse} onToggle={() => setCollapse(!collapse)}>
            <Grid container spacing={4}>

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

                <Grid item xs={12} sm={6} md={4}>
                    <Controller
                        name='group_code'
                        control={control}
                        render={({ field }) => (
                            <AsyncSelectCustom
                                label='Group'
                                placeholder='Select group ...'
                                cacheOptions
                                defaultOptions
                                loadOptions={loadGroupOptions}
                                value={field.value ? { label: field.value, value: field.value } : null}
                                onChange={(val: SelectOption | null) => field.onChange(val?.value || '')}
                                classNamePrefix='select'
                            />
                        )}
                    />
                </Grid>

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
                                onChange={(val: SelectOption | null) => field.onChange(val?.value || '')}
                                classNamePrefix='select'
                            />
                        )}
                    />
                </Grid>

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
