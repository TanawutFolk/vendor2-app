// React Imports
import { useEffect } from 'react'

// MUI Imports
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Grid,
    CircularProgress,
    Slide
} from '@mui/material'
import type { SlideProps } from '@mui/material'

import type { ReactElement, Ref } from 'react'
import { forwardRef } from 'react'

const Transition = forwardRef(function Transition(
    props: SlideProps & { children?: ReactElement<any, any> },
    ref: Ref<unknown>
) {
    return <Slide direction='down' ref={ref} {...props} />
})

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Components Imports
import CustomTextField from '@components/mui/TextField'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import { ToastMessageSuccess, ToastMessageError } from '@/components/ToastMessage'

// React Query Imports
import { useCreate } from '@_workspace/react-query/hooks/vendor/useCreateProductGroup'

// Utils Imports
import { getUserData } from '@/utils/user-profile/userLoginProfile'

// Validation Schema
const addProductGroupSchema = z.object({
    group_name: z.string().min(1, 'Product Group Name is required')
})

type AddProductGroupFormData = z.infer<typeof addProductGroupSchema>

interface AddProductGroupModalProps {
    open: boolean
    onClose: () => void
    onSuccess?: () => void
}

const AddProductGroupModal = ({ open, onClose, onSuccess }: AddProductGroupModalProps) => {
    // Hooks : react-hook-form
    const { control, handleSubmit, reset, formState: { errors } } = useForm<AddProductGroupFormData>({
        resolver: zodResolver(addProductGroupSchema),
        defaultValues: {
            group_name: ''
        }
    })

    const onMutateSuccess = (data: any) => {
        if (data && data.Status == true) {
            const message = {
                message: data.Message || 'Add Product Group Success',
                title: 'Add Product Group'
            }

            ToastMessageSuccess(message)
            handleClose()
            if (onSuccess) onSuccess()
        } else {
            const message = {
                title: 'Add Product Group',
                message: data?.Message || 'Error'
            }

            ToastMessageError(message)
        }
    }

    const onMutateError = () => {
        console.log('onMutateError')
    }

    // Hooks : React Query
    const { mutate, isPending } = useCreate(onMutateSuccess, onMutateError)

    // Functions
    const handleClose = () => {
        reset()
        onClose()
    }

    const onSubmit = (data: AddProductGroupFormData) => {
        mutate({
            group_name: data.group_name.trim(),
            CREATE_BY: getUserData()?.EMPLOYEE_CODE || 'ADMIN'
        })
    }

    // Reset form when modal opens
    useEffect(() => {
        if (open) {
            reset({ group_name: '' })
        }
    }, [open, reset])

    return (
        <Dialog
            maxWidth='sm'
            fullWidth={true}
            onClose={(event, reason) => {
                if (reason !== 'backdropClick') {
                    handleClose()
                }
            }}
            TransitionComponent={Transition}
            open={open}
            sx={{
                '& .MuiDialog-paper': { overflow: 'visible' },
                '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
            }}
        >
            <DialogTitle>
                <Typography variant='h5' component='span'>
                    Add Product Group
                </Typography>
                <DialogCloseButton onClick={handleClose} disableRipple>
                    <i className='tabler-x' />
                </DialogCloseButton>
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={4} sx={{ pt: 2 }}>
                    <Grid item xs={12}>
                        <Controller
                            name="group_name"
                            control={control}
                            render={({ field }) => (
                                <CustomTextField
                                    {...field}
                                    fullWidth
                                    label='Product Group Name'
                                    placeholder='Enter product group name...'
                                    autoComplete='off'
                                    error={!!errors.group_name}
                                    helperText={errors.group_name?.message}
                                    disabled={isPending}
                                />
                            )}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'flex-start' }}>
                <Button
                    variant='contained'
                    color='primary'
                    onClick={handleSubmit(onSubmit)}
                    disabled={isPending}
                    startIcon={isPending ? <CircularProgress size={16} color='inherit' /> : null}
                >
                    {isPending ? 'Saving...' : 'Save'}
                </Button>
                <Button variant='tonal' color='secondary' onClick={handleClose} disabled={isPending}>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default AddProductGroupModal
