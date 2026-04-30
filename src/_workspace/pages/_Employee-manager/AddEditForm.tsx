import { useEffect, forwardRef, useState } from 'react'
import type { ReactElement, Ref } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Slide, Typography } from '@mui/material'
import type { SlideProps } from '@mui/material'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import CustomTextField from '@components/mui/TextField'
import SelectCustom from '@components/react-select/SelectCustom'
import { useSaveAssignee } from '@_workspace/react-query/useAssigneesMutation'
import AssigneesServices from '@_workspace/services/_task-manager/AssigneesServices'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import { AssigneesFormSchema, defaultAssigneeFormValues, type AssigneeFormData, type AssigneeRow } from './validateSchema'

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

type GroupOption = {
    label: string
    value: string
}

type GroupOptionSource = {
    label?: string
    group_name?: string
    value?: string
    group_code?: string
}

interface Props {
    open: boolean
    onClose: () => void
    onSaved?: () => void
    initialData?: AssigneeRow | null
}

const normalizeInUse = (value: unknown) => {
    if (value === 0 || value === '0' || value === false) return 0
    return 1
}

const mapGroupOption = (item: GroupOptionSource): GroupOption => ({
    label: String(item.label || item.group_name || item.value || item.group_code || '').trim(),
    value: String(item.value || item.group_code || '').trim().toUpperCase()
})

const AddEditForm = ({ open, onClose, onSaved, initialData }: Props) => {
    const { mutate: saveAssignee, isPending } = useSaveAssignee()
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
                    Assignees_id: initialData.Assignees_id,
                    empcode: initialData.empcode || '',
                    empName: initialData.empName || '',
                    empEmail: initialData.empEmail || '',
                    group_code: initialData.group_code || '',
                    group_name: initialData.group_name || '',
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

        AssigneesServices.getGroups({ keyword: '' })
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
            ...data,
            INUSE: normalizeInUse(data.INUSE)
        }, {
            onSuccess: () => {
                onSaved?.()
                onClose()
            }
        })
    }

    const loadGroupOptions = async (inputValue: string) => {
        const res = await AssigneesServices.getGroups({ keyword: inputValue || '' })
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
                <Button type='submit' variant='contained' disabled={isPending}>
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
