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

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
const SearchFilter = () => {
    const [collapse, setCollapse] = useState(false)

    // React Hook Form
    const { setValue, getValues, control } = useFormContext<RequestHistoryFormData>()

    // DxContext — trigger grid refresh
    const { setIsEnableFetching } = useDxContext()

    // Status options from DB
    const { data: statusOptions = [] } = useRequestStatusOptions()

    // Save user preferences
    const { mutate } = useCreate(() => {}, () => {})

    const handleSave = () => {
        mutate({
            USER_ID: getUserData().USER_ID,
            APPLICATION_ID: import.meta.env.VITE_APPLICATION_ID,
            MENU_ID: MENU_ID.toString(),
            USER_PROFILE_SETTING_PROGRAM_DATA: {
                searchFilters: getValues('searchFilters'),
                searchResults: { agGridState: getValues('searchResults.agGridState') }
            }
        })
    }

    const handleSearch = () => {
        setIsEnableFetching(true)
        handleSave()
    }

    const handleClear = () => {
        setValue('searchFilters', defaultSearchFilters)
        setIsEnableFetching(true)
        handleSave()
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
