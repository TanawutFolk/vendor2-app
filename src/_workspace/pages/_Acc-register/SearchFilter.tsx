import { useState } from 'react'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import { Controller, useFormContext, useFormState } from 'react-hook-form'
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'

import useRequestStatusOptions from '@_workspace/react-query/hooks/useRequestStatusOptions'
import CustomTextField from '@components/mui/TextField'
import AsyncSelectCustom from '@components/react-select/AsyncSelectCustom'
import SkeletonCustom from '@components/SkeletonCustom'
import SearchFilterCard from '@_workspace/components/search/SearchFilterCard'
import { useDxContext } from '@/_template/DxContextProvider'
import { useDxSaveSearchFilters } from '@/_template/DxSaveSearchFilters'
import { MENU_ID } from './env'
import { defaultSearchFilters, type AccRegisterFormData, type SelectOptionFormData } from './validateSchema'

const SearchFilter = () => {
    const [collapse, setCollapse] = useState(false)
    const { setIsEnableFetching } = useDxContext()
    const { setValue, getValues, control, handleSubmit } = useFormContext<AccRegisterFormData>()
    const { isLoading } = useFormState({ control })
    const { data: statusOptions = [] } = useRequestStatusOptions()

    const { save, isError, error } = useDxSaveSearchFilters<AccRegisterFormData>({ MENU_ID })

    const onHandleClearSearchFilters = () => {
        setValue('searchFilters', defaultSearchFilters)
        setIsEnableFetching(true)
        save(defaultSearchFilters)
    }

    const onSubmit: SubmitHandler<AccRegisterFormData> = () => {
        setIsEnableFetching(true)
        save()
    }

    const onError: SubmitErrorHandler<AccRegisterFormData> = data => {
        console.log(getValues())
        console.log(data)
    }

    return (
        <SearchFilterCard collapse={collapse} onToggle={() => setCollapse(!collapse)}>
                {isError && <div>An error occurred: {error.message}</div>}
                {isLoading ? (
                    <SkeletonCustom />
                ) : (
                    <Grid container spacing={4}>
                        <Grid item xs={12} sm={6} md={3}>
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
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Controller
                                name='searchFilters.submitted_by'
                                control={control}
                                render={({ field }) => (
                                    <CustomTextField
                                        {...field}
                                        fullWidth
                                        label='Submitted By'
                                        placeholder='Enter ...'
                                        autoComplete='off'
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Controller
                                name='searchFilters.overall_status'
                                control={control}
                                render={({ field }) => (
                                    <AsyncSelectCustom
                                        {...field}
                                        cacheOptions
                                        defaultOptions={statusOptions}
                                        loadOptions={(inputValue) => {
                                            const keyword = String(inputValue || '').trim().toLowerCase()
                                            if (!keyword) return Promise.resolve(statusOptions)
                                            return Promise.resolve(
                                                statusOptions.filter((option: any) => String(option?.label || '').toLowerCase().includes(keyword))
                                            )
                                        }}
                                        isClearable
                                        label='Status'
                                        placeholder='Select ...'
                                        classNamePrefix='select'
                                        onChange={value => field.onChange(value as SelectOptionFormData | null)}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} className='flex gap-3'>
                            <Button onClick={() => handleSubmit(onSubmit, onError)()} variant='contained' type='button'>
                                Search
                            </Button>
                            <Button variant='tonal' color='secondary' type='reset' onClick={onHandleClearSearchFilters}>
                                Clear
                            </Button>
                        </Grid>
                    </Grid>
                )}
        </SearchFilterCard>
    )
}

export default SearchFilter
