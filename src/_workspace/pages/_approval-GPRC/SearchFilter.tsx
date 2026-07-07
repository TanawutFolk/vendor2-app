// React Imports
import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

// React Hook Form Imports
import { Controller, useFormContext, useFormState } from 'react-hook-form'
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'

// React Query Imports
import { useDxSaveSearchFilters } from '@/_template/DxSaveSearchFilters'

// Components Imports
import CustomTextField from '@components/mui/TextField'
import SkeletonCustom from '@components/SkeletonCustom'

// Workspace Components
import SearchFilterCard from '@_workspace/components/search/SearchFilterCard'

// Utils Imports

// Context
import { useDxContext } from '@/_template/DxContextProvider'

// Types & Schema
import type { ApprovalGprCFormData } from './validateSchema'
import { defaultSearchFilters } from './validateSchema'
import { MENU_ID } from './env'

const SearchFilter = () => {
    // State
    const [collapse, setCollapse] = useState(false)

    // Context
    const { setIsEnableFetching } = useDxContext()

    // React Hook Form
    const { setValue, getValues, control, handleSubmit } = useFormContext<ApprovalGprCFormData>()
    const { isLoading } = useFormState()

    const onHandleClearSearchFilters = () => {
        setValue('searchFilters', defaultSearchFilters)

        setIsEnableFetching(true)
        save()
    }

    const onSubmit: SubmitHandler<ApprovalGprCFormData> = () => {
        setIsEnableFetching(true)
        save()
    }

    const onError: SubmitErrorHandler<ApprovalGprCFormData> = data => {
        console.log(getValues())
        console.log(data)
    }

    const { save, isError, error } = useDxSaveSearchFilters<ApprovalGprCFormData>({
        MENU_ID,
        searchResultsPaths: ['searchResults.approvalGridState', 'searchResults.actionRequiredGridState'],
    })

    return (
        <SearchFilterCard collapse={collapse} onToggle={() => setCollapse(!collapse)}>
                {isError && <div>An error occurred: {error instanceof Error ? error.message : 'Failed to save search filters'}</div>}
                {isLoading ? (
                    <>
                        <SkeletonCustom />
                    </>
                ) : (
                    <>
                        <Grid container spacing={4}>
                            <Grid item xs={12} sm={6} md={3}>
                                <Controller
                                    name='searchFilters.request_number'
                                    control={control}
                                    render={({ field }) => (
                                        <CustomTextField
                                            {...field}
                                            fullWidth
                                            label='Request No.'
                                            placeholder='Enter ...'
                                            autoComplete='off'
                                        />
                                    )}
                                />
                            </Grid>

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
                                    name='searchFilters.step_keyword'
                                    control={control}
                                    render={({ field }) => (
                                        <CustomTextField
                                            {...field}
                                            fullWidth
                                            label='Step'
                                            placeholder='Enter ...'
                                            autoComplete='off'
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <Controller
                                    name='searchFilters.status_keyword'
                                    control={control}
                                    render={({ field }) => (
                                        <CustomTextField
                                            {...field}
                                            fullWidth
                                            label='Status'
                                            placeholder='Enter ...'
                                            autoComplete='off'
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
                    </>
                )}
        </SearchFilterCard>
    )
}

export default SearchFilter
