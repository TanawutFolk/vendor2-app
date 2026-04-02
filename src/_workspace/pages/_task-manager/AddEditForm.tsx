import { useEffect, forwardRef } from 'react'
import type { ReactElement, Ref } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Card, Slide, Typography } from '@mui/material'
import type { SlideProps } from '@mui/material'
import { useForm, Controller } from 'react-hook-form'

const Transition = forwardRef(function Transition(
    props: SlideProps & { children?: ReactElement<any, any> },
    ref: Ref<unknown>
) {
    return <Slide direction='down' ref={ref} {...props} />
})
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import CustomTextField from '@components/mui/TextField'
import SelectCustom from '@components/react-select/SelectCustom'
import { useSaveAssignee } from '@_workspace/react-query/useAssigneesMutation'
import { groupOptions } from './SearchFilter'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'

const FormSchema = z.object({
    Assignees_id: z.number().optional(),
    empcode: z.string().min(1, 'EmpCode is required'),
    empName: z.string().min(1, 'Name is required'),
    empEmail: z.string().email('Invalid email format').min(1, 'Email is required'),
    group_name: z.string().min(1, 'Group is required'),
    INUSE: z.number()
})

type FormData = z.infer<typeof FormSchema>

interface Props {
    open: boolean
    onClose: () => void
    initialData?: any
}

const inUseOptions = [
    { label: 'Active', value: 1 },
    { label: 'Inactive', value: 0 }
]

const AddEditForm = ({ open, onClose, initialData }: Props) => {
    const { mutate: saveAssignee, isPending } = useSaveAssignee()

    const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            Assignees_id: undefined,
            empcode: '',
            empName: '',
            empEmail: '',
            group_name: '',
            INUSE: 1
        }
    })

    useEffect(() => {
        if (open) {
            if (initialData) {
                reset({
                    Assignees_id: initialData.Assignees_id,
                    empcode: initialData.empcode || '',
                    empName: initialData.empName || '',
                    empEmail: initialData.empEmail || '',
                    group_name: initialData.group_name || '',
                    INUSE: initialData.INUSE ?? 1
                })
            } else {
                reset({
                    Assignees_id: undefined,
                    empcode: '',
                    empName: '',
                    empEmail: '',
                    group_name: '',
                    INUSE: 1
                })
            }
        }
    }, [open, initialData, reset])

    const onSubmit = (data: FormData) => {
        saveAssignee(data, {
            onSuccess: () => {
                onClose()
            }
        })
    }

    return (
        <>

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
                PaperProps={{ component: 'form', onSubmit: handleSubmit(onSubmit) } as any}
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
                <DialogContent >

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
                        <Grid item xs={12} sm={6} >
                            <Controller
                                name='group_name'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex flex-col'>
                                        <SelectCustom
                                            classNamePrefix='select'
                                            label='Group Name'
                                            options={groupOptions}
                                            value={groupOptions.find(o => o.value === field.value) || null}
                                            onChange={(val: any) => field.onChange(val?.value || '')}
                                        />
                                        {errors.group_name && <span className='text-xs text-error mt-1'>{errors.group_name.message}</span>}
                                    </div>
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name='INUSE'
                                control={control}
                                render={({ field }) => (
                                    <AsyncSelectCustom
                                        classNamePrefix='select'
                                        label='Status'
                                        options={inUseOptions}
                                        value={inUseOptions.find(o => o.value === field.value) || null}
                                        onChange={(val: any) => field.onChange(val?.value ?? 1)}
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

        </>
    )
}

export default AddEditForm
