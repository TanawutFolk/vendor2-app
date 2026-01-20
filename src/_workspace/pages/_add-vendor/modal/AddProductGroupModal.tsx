'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Grid,
    CircularProgress
} from '@mui/material'
import CustomTextField from '@components/mui/TextField'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import { useCreateProductGroup } from '@_workspace/react-query/hooks/vendor/useCreateProductGroup'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { ToastMessageSuccess, ToastMessageError } from '@/components/ToastMessage'

interface AddProductGroupModalProps {
    open: boolean
    onClose: () => void
    onSuccess?: () => void
}

const AddProductGroupModal = ({ open, onClose, onSuccess }: AddProductGroupModalProps) => {
    // States
    const [groupName, setGroupName] = useState('')
    const [error, setError] = useState<string | null>(null)

    // Hooks
    const { mutate, isPending } = useCreateProductGroup(
        (data) => {
            if (data.Status) {
                ToastMessageSuccess({
                    title: 'Add Product Group',
                    message: data.Message
                })
                handleClose()
                onSuccess?.()
            } else {
                ToastMessageError({
                    title: 'Add Product Group',
                    message: data.Message
                })
            }
        },
        (error) => {
            ToastMessageError({
                title: 'Add Product Group',
                message: error?.message || 'Failed to create product group'
            })
        }
    )

    // Functions
    const handleClose = () => {
        setGroupName('')
        setError(null)
        onClose()
    }

    const handleSave = () => {
        if (!groupName.trim()) {
            setError('Product Group Name is required')
            return
        }

        mutate({
            group_name: groupName.trim(),
            CREATE_BY: getUserData()?.EMPLOYEE_CODE || 'ADMIN'
        })
    }

    return (
        <Dialog
            open={open}
            onClose={(e, reason) => {
                if (reason !== 'backdropClick') {
                    handleClose()
                }
            }}
            maxWidth='xs'
            fullWidth
            sx={{
                '& .MuiDialog-paper': { overflow: 'visible' }
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
                        <CustomTextField
                            fullWidth
                            label='Product Group Name'
                            placeholder='Enter product group name...'
                            value={groupName}
                            onChange={(e) => {
                                setGroupName(e.target.value)
                                setError(null)
                            }}
                            autoComplete='off'
                            error={!!error}
                            helperText={error}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button
                    variant='contained'
                    color='primary'
                    onClick={handleSave}
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
