import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import { Controller, useFormContext, useFormState } from 'react-hook-form'
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'

import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import useRequestStatusOptions from '@_workspace/react-query/useRequestStatusOptions'
import CustomTextField from '@components/mui/TextField'
import SelectCustom from '@components/react-select/SelectCustom'
import SkeletonCustom from '@components/SkeletonCustom'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { useDxContext } from '@/_template/DxContextProvider'
import { MENU_ID } from './env'
import { defaultSearchFilters, type AccRegisterFormData, type SelectOptionFormData } from './validateSchema'

const SearchFilter = () => {
    const { setIsEnableFetching } = useDxContext()
    const { setValue, getValues, control, handleSubmit } = useFormContext<AccRegisterFormData>()
    const { isLoading } = useFormState({ control })
    const { data: statusOptions = [] } = useRequestStatusOptions()

    const onMutateSuccess = () => {}
    const onMutateError = () => {}
    const { mutate, isError, error } = useCreate(onMutateSuccess, onMutateError)

    const handleSaveSearchPreference = () => {
        mutate({
            USER_ID: getUserData().USER_ID,
            APPLICATION_ID: import.meta.env.VITE_APPLICATION_ID,
            MENU_ID: MENU_ID.toString(),
            USER_PROFILE_SETTING_PROGRAM_DATA: {
                searchFilters: getValues('searchFilters'),
                searchResults: {
                    agGridState: getValues('searchResults.agGridState'),
                },
            } as AccRegisterFormData,
        })
    }

    const onHandleClearSearchFilters = () => {
        setValue('searchFilters', defaultSearchFilters)
        setIsEnableFetching(true)
        handleSaveSearchPreference()
    }

    const onSubmit: SubmitHandler<AccRegisterFormData> = () => {
        setIsEnableFetching(true)
        handleSaveSearchPreference()
    }

    const onError: SubmitErrorHandler<AccRegisterFormData> = data => {
        console.log(getValues())
        console.log(data)
    }

    return (
        <Card style={{ overflow: 'visible', zIndex: 4 }}>
            <CardHeader
                title='Search filters'
                titleTypographyProps={{ variant: 'h5' }}
                sx={{ '& .MuiCardHeader-avatar': { mr: 3 } }}
            />

            <CardContent>
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
                                    <SelectCustom
                                        {...field}
                                        options={statusOptions}
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
            </CardContent>
        </Card>
    )
}

export default SearchFilter
