import { useEffect, forwardRef } from 'react'
import type { ReactNode, Ref } from 'react'
import { useDebounce } from 'react-use'
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Stack,
    Typography,
    Slide,
} from '@mui/material'
import type { SlideProps } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import { useForm } from 'react-hook-form'
import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import CustomTextField from '@components/mui/TextField'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import RegisterRequestServices from '@_workspace/services/_register-request/RegisterRequestServices'

const Transition = forwardRef(function Transition(
    props: SlideProps & { children?: ReactNode },
    ref: Ref<unknown>
) {
    return <Slide direction='down' ref={ref} {...props} />
})

type ActionRequiredDialogForm = {
    pic_empcode: string
    pic_name: string
    pic_email: string
    required_detail: string
}

interface ActionRequiredDialogProps {
    open: boolean
    requestId: number | null
    requestNumber?: string
    stepName?: string
    actionBy: string
    updateBy?: string
    onClose: () => void
    onSuccess: () => void | Promise<void>
    onError?: (message: string) => void
}

export default function ActionRequiredDialog({
    open,
    requestId,
    requestNumber,
    stepName,
    actionBy,
    updateBy,
    onClose,
    onSuccess,
    onError,
}: ActionRequiredDialogProps) {
    const {
        register,
        handleSubmit,
        reset,
        watch,
        setError,
        clearErrors,
        setValue,
        formState: { isSubmitting, errors },
    } = useForm<ActionRequiredDialogForm>({
        defaultValues: {
            pic_empcode: '',
            pic_name: '',
            pic_email: '',
            required_detail: '',
        },
    })

    useEffect(() => {
        if (!open) return

        reset({
            pic_empcode: '',
            pic_name: '',
            pic_email: '',
            required_detail: '',
        })
        clearErrors()
    }, [open, reset, clearErrors])

    const getErrorMessage = (error: unknown) => {
        if (error instanceof Error) return error.message

        const maybeMessage = (error as { response?: { data?: { Message?: string } }; message?: string } | null)

        return maybeMessage?.response?.data?.Message || maybeMessage?.message || 'Failed to send Action Required'
    }

    const picEmpcode = watch('pic_empcode')
    const picName = watch('pic_name')
    const picEmail = watch('pic_email')
    const requiredDetail = watch('required_detail')

    useDebounce(() => {
        const empcode = String(picEmpcode || '').trim()

        if (!open) return
        if (!empcode) {
            setValue('pic_name', '')
            setValue('pic_email', '')
            clearErrors(['pic_empcode', 'root'])

            return
        }

        clearErrors(['pic_empcode', 'root'])

        void RegisterRequestServices.resolveEmployeeProfile(empcode)
            .then(response => {
                if (String(watch('pic_empcode') || '').trim() !== empcode) return

                if (!response.data?.Status) {
                    const message = response.data?.Message || `Employee code not found: ${empcode}`
                    setValue('pic_name', '')
                    setValue('pic_email', '')
                    setError('pic_empcode', { type: 'manual', message })

                    return
                }

                const profile = response.data.ResultOnDb
                setValue('pic_name', profile?.name || '')
                setValue('pic_email', profile?.email || '')
            })
            .catch(error => {
                if (String(watch('pic_empcode') || '').trim() !== empcode) return

                setValue('pic_name', '')
                setValue('pic_email', '')
                setError('pic_empcode', { type: 'manual', message: getErrorMessage(error) })
            })
    }, 450, [picEmpcode, open])

    const onSubmit = async (formData: ActionRequiredDialogForm) => {
        if (!requestId) {
            const message = 'Missing request id'
            setError('root', { type: 'manual', message })
            ToastMessageError({ message })
            onError?.(message)

            return
        }

        if (!picName.trim() || !picEmail.trim()) {
            const message = 'Please enter a valid PIC EmpCode.'
            setError('pic_empcode', { type: 'manual', message })
            ToastMessageError({ message })
            onError?.(message)

            return
        }

        try {
            const response = await RegisterRequestServices.gprCActionRequired({
                request_id: requestId,
                action_by: actionBy,
                pic_name: picName.trim(),
                pic_email: picEmail.trim(),
                required_detail: formData.required_detail.trim(),
                UPDATE_BY: updateBy || actionBy,
            })

            if (!response.data?.Status) {
                const message = response.data?.Message || 'Failed to send Action Required'
                setError('root', { type: 'manual', message })
                ToastMessageError({ message })
                onError?.(message)

                return
            }

            const message = response.data?.Message || 'Action Required sent successfully'
            ToastMessageSuccess({ message })
            await onSuccess()
            onClose()
        } catch (error: unknown) {
            const message = getErrorMessage(error)
            setError('root', { type: 'manual', message })
            ToastMessageError({ message })
            onError?.(message)
        }
    }

    return (
        <Dialog
            open={open}
            maxWidth='sm'
            fullWidth
            TransitionComponent={Transition}
            onClose={(_event, reason) => {
                if (reason !== 'backdropClick') onClose()
            }}
            sx={{
                '& .MuiDialog-paper': { overflow: 'visible' },
                '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' },
            }}
        >
            <DialogTitle>
                <Typography variant='h5'>Send Action Required</Typography>
                <DialogCloseButton onClick={onClose} disableRipple>
                    <i className='tabler-x' />
                </DialogCloseButton>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={3}>

                    <Box
                        sx={{
                            px: 3,
                            py: 2.5,
                            borderRadius: 1,
                            bgcolor: 'warning.50',
                            border: '1px solid',
                            borderColor: 'warning.200',
                        }}
                    >
                        <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 0.5 }}>
                            Notify responsible PIC
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                            Fill in the PIC information and explain what must be completed before the GPR C flow can continue.
                        </Typography>
                    </Box>

                    <Grid container spacing={2}>
                        <Grid item xs={12} md={3}>
                            <CustomTextField
                                fullWidth
                                label='PIC EmpCode'
                                placeholder='S00000'
                                error={!!errors.pic_empcode}
                                helperText={errors.pic_empcode?.message}
                                {...register('pic_empcode', {
                                    required: 'PIC EmpCode is required',
                                    onChange: () => {
                                        setValue('pic_name', '')
                                        setValue('pic_email', '')
                                        clearErrors(['pic_empcode', 'root'])
                                    },
                                })}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <CustomTextField
                                fullWidth
                                label='PIC Name'
                                value={picName}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={12} md={5}>
                            <CustomTextField
                                fullWidth
                                label='PIC Email'
                                value={picEmail}
                                disabled
                            />
                        </Grid>
                    </Grid>

                    <CustomTextField
                        fullWidth
                        multiline
                        minRows={4}
                        label='Required Detail'
                        placeholder='Describe the action required'
                        error={!!errors.required_detail}
                        helperText={errors.required_detail?.message}
                        {...register('required_detail', { required: 'Required Detail is required' })}
                    />
                </Stack>
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'flex-start' }}>
                <LoadingButton
                    variant='contained'
                    color='warning'
                    loading={isSubmitting}
                    onClick={handleSubmit(onSubmit)}
                    disabled={!picEmpcode?.trim() || !picName?.trim() || !picEmail?.trim() || !requiredDetail?.trim()}
                >
                    Send Action Required
                </LoadingButton>
                <Button variant='tonal' color='secondary' onClick={onClose} disabled={isSubmitting}>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    )
}
