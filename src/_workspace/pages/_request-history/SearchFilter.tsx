// MUI Imports
import { Button, Grid } from '@mui/material'

// Third-party Imports
import { useState } from 'react'

// React Hook Form Imports
import { Controller, useFormContext } from 'react-hook-form'

// Components Imports
import CustomTextField from '@components/mui/TextField'
import SelectCustom from '@components/react-select/SelectCustom'

// react-query Imports
import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import useRequestStatusOptions from '@_workspace/react-query/useRequestStatusOptions'

// Context
import { useDxContext } from '@/_template/DxContextProvider'

// Types & Schema
import type { RequestHistoryFormData } from './validateSchema'
import { defaultSearchFilters } from './validateSchema'
import { MENU_ID } from './env'
import SearchFilterCard from '@_workspace/components/search/SearchFilterCard'

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
const SearchFilter = () => {
    const [collapse, setCollapse] = useState(false)

    // React Hook Form
    const { setValue, getValues, control, handleSubmit } = useFormContext<RequestHistoryFormData>()

    // DxContext — trigger grid refresh
    const { setIsEnableFetching } = useDxContext()

    // Status options from DB
    const { data: statusOptions = [] } = useRequestStatusOptions()

    const onResetFormSearch = () => {
        setValue('searchFilters', defaultSearchFilters)
    }

    // Function : react-hook-form
    const onSubmit = () => {
        setIsEnableFetching(true)
        handleAdd()
    }

    const onError = (data: any) => {
        console.log(data)
    }

    // react-query
    const handleAdd = () => {
        const dataItem = {
            USER_ID: getUserData().USER_ID,
            APPLICATION_ID: import.meta.env.VITE_APPLICATION_ID,
            MENU_ID: MENU_ID.toString(),
            USER_PROFILE_SETTING_PROGRAM_DATA: {
                searchFilters: getValues('searchFilters'),
                searchResults: { agGridState: getValues('searchResults.agGridState') }
            }
        }

        mutate(dataItem)
    }

    const { mutate } = useCreate(() => {}, () => {})

    return (
        <SearchFilterCard collapse={collapse} onToggle={() => setCollapse(!collapse)}>
            <Grid container spacing={4}>

                        {/* Vendor Name */}
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

                        {/* Submitted By */}
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

                        {/* Overall Status */}
                        <Grid item xs={12} sm={6} md={3}>
                            <Controller
                                name='searchFilters.overall_status'
                                control={control}
                                render={({ field }) => (
                                    <SelectCustom
                                        label='Overall Status'
                                        placeholder='Select ...'
                                        isClearable
                                        options={statusOptions}
                                        value={field.value ?? null}
                                        onChange={field.onChange}
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
