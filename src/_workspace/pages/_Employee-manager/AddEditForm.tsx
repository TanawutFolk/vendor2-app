import { useEffect, forwardRef, useState } from 'react'
import type { ReactElement, Ref } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Slide, Typography } from '@mui/material'
import type { SlideProps } from '@mui/material'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import CustomTextField from '@components/mui/TextField'
import SelectCustom from '@components/react-select/SelectCustom'
import { useQueryClient } from '@tanstack/react-query'
import { useSaveAssignee, PREFIX_QUERY_KEY } from '@_workspace/react-query/hooks/useAssignees'
import AssigneesServices from '@_workspace/services/_task-manager/AssigneesServices'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import { AssigneesFormSchema, defaultAssigneeFormValues, type AssigneeFormData, type AssigneeRow } from './validateSchema'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import type { GroupOption, GroupOptionSource, AddEditFormProps } from '@_workspace/types/_Employee-manager/EmployeeManagerTypes'

const Transition = forwardRef(function Transition(
    props: SlideProps & { children?: ReactElement },
    ref: Ref<unknown>
) {
    return <Slide direction='down' ref={ref} {...props} />
})

const inUseOptions = [
    { label: 'Active', value: 1 },
    { label: 'Inactive', value: 0 }
]







const normalizeInUse = (value: unknown) => {
    if (value === 0 || value === '0' || value === false) return 0
    return 1
}

const mapGroupOption = (item: GroupOptionSource): GroupOption => ({
    label: String(item.label || item.GROUP_NAME || item.value || item.GROUP_CODE || '').trim(),
    value: String(item.value || item.GROUP_CODE || '').trim().toUpperCase()
})

const AddEditForm = ({ open, onClose, onSaved, initialData }: AddEditFormProps) => {
    const queryClient = useQueryClient()
    const user = getUserData()

    const onMutateSuccess = (resData: any) => {
        ToastMessageSuccess({ title: 'Save Assignee', message: resData?.Message || 'Saved successfully' })
        queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
        onSaved?.()
        onClose()
    }

    const onMutateError = (error: any) => {
        ToastMessageError({
            title: 'Save Assignee',
            message: error?.response?.data?.Message || error.message || 'Failed to save assignee'
        })
    }

    const { mutate: saveAssignee, isPending } = useSaveAssignee(onMutateSuccess, onMutateError)
    const [defaultGroupOptions, setDefaultGroupOptions] = useState<GroupOption[]>([])

    const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<AssigneeFormData>({
        resolver: zodResolver(AssigneesFormSchema),
        defaultValues: defaultAssigneeFormValues
    })
    const watchedGroupCode = useWatch({ control, name: 'group_code' })
    const watchedGroupName = useWatch({ control, name: 'group_name' })

    useEffect(() => {
        if (open) {
            if (initialData) {
                reset({
                    Assignees_id: initialData.ASSIGNEES_TO_ID,
                    empcode: initialData.EMPCODE || '',
                    empName: initialData.EMPNAME || '',
                    empEmail: initialData.EMPEMAIL || '',
                    group_code: initialData.GROUP_CODE || '',
                    group_name: initialData.GROUP_NAME || '',
                    INUSE: normalizeInUse(initialData.INUSE)
                })
            } else {
                reset(defaultAssigneeFormValues)
            }
        }
    }, [open, initialData, reset])

    useEffect(() => {
        let isMounted = true

        if (!open) {
            setDefaultGroupOptions([])
            return
        }

        AssigneesServices.getGroups({ KEYWORD: '' })
            .then(res => {
                if (!isMounted) return
                const options = (res.data?.ResultOnDb || []).map(mapGroupOption)
                setDefaultGroupOptions(options)
            })
            .catch(() => {
                if (isMounted) setDefaultGroupOptions([])
            })

        return () => {
            isMounted = false
        }
    }, [open])

    const onSubmit = (data: AssigneeFormData) => {
        saveAssignee({
            ASSIGNEES_TO_ID: data.Assignees_id,
            EMPCODE: data.empcode,
            EMPNAME: data.empName,
            EMPEMAIL: data.empEmail,
            GROUP_CODE: data.group_code,
            GROUP_NAME: data.group_name,
            CREATE_BY: user?.EMPLOYEE_CODE || 'SYSTEM',
            UPDATE_BY: user?.EMPLOYEE_CODE || 'SYSTEM',
            INUSE: normalizeInUse(data.INUSE)
        })
    }

    const loadGroupOptions = async (inputValue: string) => {
        const res = await AssigneesServices.getGroups({ KEYWORD: inputValue || '' })
        const options = (res.data?.ResultOnDb || []).map(mapGroupOption)
        setDefaultGroupOptions(prev => {
            const map = new Map<string, GroupOption>()
            ;[...prev, ...options].forEach(item => {
                if (item?.value) map.set(item.value, item)
            })
            return Array.from(map.values())
        })
        return options
    }

    return (
        <Dialog
            maxWidth='sm'
            fullWidth={true}
            onClose={(event, reason) => {
                if (reason !== 'backdropClick') {
                    onClose()
                }
            }}
            TransitionComponent={Transition}
            open={open}
            PaperProps={{ component: 'form', onSubmit: handleSubmit(onSubmit) }}
            sx={{
                '& .MuiDialog-paper': { overflow: 'visible' },
                '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
            }}
        >
            <DialogTitle>
                <Typography variant='h5' component='span'>{initialData ? 'Edit Assignee' : 'Add New Assignee'}</Typography>
                <DialogCloseButton onClick={onClose} disableRipple>
                    <i className='tabler-x' />
                </DialogCloseButton>
            </DialogTitle>
            <DialogContent>
                <Grid className='z-100000000' container spacing={4}>
                    <Grid item xs={12} sm={6}>
                        <Controller
                            name='empcode'
                            control={control}
                            render={({ field }) => (
                                <CustomTextField
                                    {...field}
                                    fullWidth
                                    label='Employee Code'
                                    error={!!errors.empcode}
                                    helperText={errors.empcode?.message}
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Controller
                            name='empName'
                            control={control}
                            render={({ field }) => (
                                <CustomTextField
                                    {...field}
                                    fullWidth
                                    label='Name'
                                    error={!!errors.empName}
                                    helperText={errors.empName?.message}
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Controller
                            name='empEmail'
                            control={control}
                            render={({ field }) => (
                                <CustomTextField
                                    {...field}
                                    fullWidth
                                    label='Email'
                                    error={!!errors.empEmail}
                                    helperText={errors.empEmail?.message}
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Controller
                            name='group_code'
                            control={control}
                            render={({ field }) => (
                                <div className='flex flex-col'>
                                    <AsyncSelectCustom
                                        classNamePrefix='select'
                                        label='Group'
                                        cacheOptions
                                        defaultOptions={defaultGroupOptions}
                                        loadOptions={loadGroupOptions}
                                        value={watchedGroupCode ? (
                                            defaultGroupOptions.find(option => option.value === watchedGroupCode)
                                            || {
                                                value: watchedGroupCode,
                                                label: watchedGroupName || watchedGroupCode
                                            }
                                        ) : null}
                                        onChange={(val: GroupOption | null) => {
                                            field.onChange(val?.value || '')
                                            setValue('group_name', val?.label || '')
                                        }}
                                    />
                                    {errors.group_code && <span className='text-xs text-error mt-1'>{errors.group_code.message}</span>}
                                </div>
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Controller
                            name='INUSE'
                            control={control}
                            render={({ field }) => (
                                <SelectCustom
                                    classNamePrefix='select'
                                    label='Status'
                                    options={inUseOptions}
                                    value={inUseOptions.find(o => o.value === normalizeInUse(field.value)) || null}
                                    onChange={(val: { value: number } | null) => field.onChange(normalizeInUse(val?.value))}
                                />
                            )}
                        />
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'flex-start' }}>
                <Button type='submit' variant='contained' color='success' disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save'}
                </Button>
                <Button onClick={onClose} variant='tonal' color='secondary' disabled={isPending}>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default AddEditForm
