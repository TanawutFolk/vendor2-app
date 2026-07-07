// MUI Imports
import { Button, Grid } from '@mui/material'

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
import { useDxSaveSearchFilters } from '@/_template/DxSaveSearchFilters'

// Types & Schema
import type { AssigneeGroupOption, AssigneesFormData } from './validateSchema'
import { defaultSearchFilters } from './validateSchema'
import { MENU_ID } from './env'
import SearchFilterCard from '@_workspace/components/search/SearchFilterCard'
import AssigneesServices from '@_workspace/services/_task-manager/AssigneesServices'
import type { GroupOptionSource, SelectOption } from '@_workspace/types/_Employee-manager/EmployeeManagerTypes'

const inUseOptions = [
    { label: 'Active', value: '1' },
    { label: 'Inactive', value: '0' }
]





const mapGroupOption = (item: GroupOptionSource): AssigneeGroupOption => {
    const groupCode = String(item.value || item.GROUP_CODE || item.label || '').trim().toUpperCase()

    return {
        label: groupCode,
        value: groupCode
    }
}

const SearchFilter = () => {
    const [collapse, setCollapse] = useState(false)

    const { setValue, control, handleSubmit } = useFormContext<AssigneesFormData>()
    const { setIsEnableFetching } = useDxContext()
    const { save } = useDxSaveSearchFilters<AssigneesFormData>({ MENU_ID })

    const onResetFormSearch = () => {
        setValue('searchFilters', defaultSearchFilters)
        setIsEnableFetching(true)
        save(defaultSearchFilters)
    }

    const onSubmit = () => {
        setIsEnableFetching(true)
        save()
    }

    const loadGroupOptions = async (inputValue: string) => {
        const res = await AssigneesServices.getGroups({ KEYWORD: inputValue || '' })
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
                        name='searchFilters.keyword'
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
                        name='searchFilters.group_code'
                        control={control}
                        render={({ field: { ref: _ref, ...fieldProps } }) => (
                            <AsyncSelectCustom
                                {...fieldProps}
                                label='Group Code'
                                placeholder='Select group code ...'
                                isClearable
                                cacheOptions
                                defaultOptions
                                loadOptions={loadGroupOptions}
                                getOptionLabel={option => option.label}
                                getOptionValue={option => option.value}
                                classNamePrefix='select'
                            />
                        )}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <Controller
                        name='searchFilters.in_use'
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
