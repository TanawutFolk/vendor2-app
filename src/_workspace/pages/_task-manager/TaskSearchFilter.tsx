import { useEffect, useState } from 'react'
import { Button, Divider, Grid, Typography } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'

// react-query Imports
import { useQueryClient } from '@tanstack/react-query'
import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { useDxContext } from '@/_template/DxContextProvider'

import useRequestStatusOptions from '@_workspace/react-query/useRequestStatusOptions'
import AssigneesServices from '@_workspace/services/_task-manager/AssigneesServices'
import SearchFilterCard from '@_workspace/components/search/SearchFilterCard'
import SelectCustom from '@components/react-select/SelectCustom'
import { defaultSearchFilters, type SelectOption, type TaskManagerFormData } from './validateSchema'
import { MENU_ID } from './env'

type UnknownRecord = Record<string, unknown>

const PREFIX_QUERY_KEY = 'TASK_MANAGER'

const TaskSearchFilter = () => {
    const [collapse, setCollapse] = useState(false)
    const [picOptions, setPicOptions] = useState<SelectOption[]>([])
    const { control, setValue, getValues, handleSubmit } = useFormContext<TaskManagerFormData>()
    const { data: statusOptions = [] } = useRequestStatusOptions()

    // react-query
    const queryClient = useQueryClient()

    // DxContext
    const { setIsEnableFetching } = useDxContext()

    useEffect(() => {
        const loadPicOptions = async () => {
            const assigneeRes = await AssigneesServices.search({})
            const assigneeRows = (assigneeRes.data?.ResultOnDb || []) as UnknownRecord[]

            setPicOptions(
                Array.from(
                    new Map(
                        assigneeRows
                            .filter(row => Number(row?.INUSE) === 1 && String(row?.empcode || '').trim())
                            .map(row => {
                                const empcode = String(row.empcode || '').trim()
                                const empName = String(row.empName || '').trim()

                                return [
                                    empcode,
                                    {
                                        value: empcode,
                                        label: empName ? `${empcode} - ${empName}` : empcode,
                                    },
                                ]
                            })
                    ).values()
                )
            )
        }

        loadPicOptions().catch(console.error)
    }, [])

    const handleClear = () => {
        setValue('searchFilters', defaultSearchFilters)
        setIsEnableFetching(true)
        queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
        handleSaveProfile()
    }

    // Function : react-hook-form
    const onSubmit = () => {
        setIsEnableFetching(true)
        queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
        handleSaveProfile()
    }

    const onError = (data: any) => {
        console.log(data)
    }

    // react-query: save user profile settings
    const handleSaveProfile = () => {
        const dataItem = {
            USER_ID: getUserData().USER_ID,
            APPLICATION_ID: import.meta.env.VITE_APPLICATION_ID,
            MENU_ID: MENU_ID.toString(),
            USER_PROFILE_SETTING_PROGRAM_DATA: {
                searchFilters: {
                    picFilter: getValues('searchFilters.picFilter'),
                    statusFilter: getValues('searchFilters.statusFilter'),
                },
                searchResults: {
                    agGridState: getValues('searchResults.agGridState')
                }
            }
        }

        mutate(dataItem)
    }

    const { mutate } = useCreate(() => {}, () => {})

    return (
        <SearchFilterCard collapse={collapse} onToggle={() => setCollapse(!collapse)}>
            <Grid container spacing={4}>
                <Grid item xs={12}>
                    <Divider textAlign='left'>
                        <Typography variant='body2' color='primary'>
                            Queue Details
                        </Typography>
                    </Divider>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Controller
                        control={control}
                        name='searchFilters.statusFilter'
                        render={({ field }) => (
                            <SelectCustom
                                label='Status'
                                placeholder='Select ...'
                                isClearable
                                options={statusOptions}
                                value={field.value}
                                onChange={value => field.onChange(value as SelectOption | null)}
                                classNamePrefix='select'
                            />
                        )}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <Controller
                        control={control}
                        name='searchFilters.picFilter'
                        render={({ field }) => (
                            <SelectCustom
                                label='PIC'
                                placeholder='Select ...'
                                isClearable
                                options={picOptions}
                                value={field.value}
                                onChange={value => field.onChange(value as SelectOption | null)}
                                classNamePrefix='select'
                            />
                        )}
                    />
                </Grid>

                <Grid item xs={12} className='flex gap-3'>
                    <Button variant='contained' type='button' onClick={handleSubmit(onSubmit, onError)}>
                        Search
                    </Button>
                    <Button variant='tonal' color='secondary' type='button' onClick={handleClear}>
                        Clear
                    </Button>
                </Grid>
            </Grid>
        </SearchFilterCard>
    )
}

export default TaskSearchFilter
