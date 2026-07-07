import { useEffect } from 'react'
import {
    Dialog, DialogContent, DialogActions, Box, Typography, Button
} from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import { useForm } from 'react-hook-form'
import CustomTextField from '@components/mui/TextField'

import undraw_clean_up_re_504g from '@assets/images/common/undraw_clean_up_re_504g.svg'
import undraw_notify_re_65on from '@assets/images/common/undraw_notify_re_65on.svg'

import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { useUpdateRequestStatus } from '@_workspace/react-query/hooks/useRegisterRequest'
import type { ActionDialogForm, ActionDialogProps } from '@_workspace/types/_request-register/RequestRegisterTypes'

import { Transition, REJECT_REMARK_MAX_LENGTH } from './shared'

const ActionDialog = ({ open, mode, requestId, nextStatus, isFinalStep, approveActionLabel, rejectActionLabel, onClose, onSuccess }: ActionDialogProps) => {
    const user = getUserData()
    const {
        register,
        handleSubmit: handleFormSubmit,
        reset,
        watch,
    } = useForm<ActionDialogForm>({
        defaultValues: { remark: '' }
    })

    useEffect(() => {
        if (!open) return
        reset({ remark: '' })
    }, [open, mode, requestId, reset])

    const statusMutation = useUpdateRequestStatus(
        (resData: any) => {
            if (resData?.Status) {
                const responseMessage = resData.Message || 'Status updated successfully'
                if (/failed|error/i.test(responseMessage)) {
                    ToastMessageError({ title: 'Update Request Status', message: responseMessage })
                } else {
                    ToastMessageSuccess({ title: 'Update Request Status', message: responseMessage })
                }
                reset({ remark: '' })
                onSuccess()
                onClose()
            } else {
                ToastMessageError({ title: 'Update Request Status', message: resData?.Message || 'Failed to update status' })
            }
        },
        (e: any) => {
            ToastMessageError({ title: 'Update Request Status', message: e?.response?.data?.Message || e?.message || 'Failed to update status' })
        }
    )

    const onSubmit = (formData: ActionDialogForm) => {
        if (!requestId) return
        const effectiveNextStatus = mode === 'approve' ? nextStatus : (String(nextStatus || '').trim() || 'Rejected')
        const normalizedNextStatus = String(effectiveNextStatus || '').trim().toLowerCase()
        const normalizedApproveLabel = String(approveActionLabel || '').trim().toLowerCase()
        const isSendGprCToRequesterAction = normalizedApproveLabel.includes('send gpr c to requester approval')
        const isDisagreeStatus = normalizedNextStatus.includes('issue gpr b')
            || normalizedNextStatus.includes('issue gpr c')
            || normalizedNextStatus.includes('vendor disagre')
        const workflowAction: 'APPROVE' | 'DISAGREE' | 'ACTION_REQUIRED' | 'REJECT' =
            mode === 'reject'
                ? (isDisagreeStatus ? 'DISAGREE' : 'REJECT')
                : (normalizedApproveLabel.includes('action required')
                    ? 'ACTION_REQUIRED'
                    : (isDisagreeStatus && !isSendGprCToRequesterAction
                        ? 'DISAGREE'
                        : 'APPROVE'))

        statusMutation.mutate({
            REQUEST_REGISTER_VENDOR_ID: requestId,
            REQUEST_STATUS: effectiveNextStatus,
            WORKFLOW_ACTION: workflowAction,
            ACTION_TYPE: workflowAction,
            APPROVE_BY: user?.EMPLOYEE_CODE || '',
            APPROVER_REMARK: formData.remark,
            UPDATE_BY: user?.EMPLOYEE_CODE || '',
            ISFINALSTEP: mode === 'approve' || isDisagreeStatus ? isFinalStep : false,
        })
    }

    const imageConfirm = mode === 'reject' ? undraw_clean_up_re_504g : undraw_notify_re_65on
    return (
        <Dialog
            maxWidth='xs'
            fullWidth={true}
            open={open}
            disableEscapeKeyDown
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
            TransitionComponent={Transition}
            onClose={(_event, reason) => {
                if (reason !== 'backdropClick') {
                    onClose()
                }
            }}
            sx={{
                '& .MuiDialog-paper': { overflow: 'visible' },
                '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
            }}
        >
            <DialogContent>
                <Box sx={{ mb: 6, display: 'flex', justifyContent: 'center' }}>
                    <img src={imageConfirm} height={120} width={150} alt='' />
                </Box>
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant='h5'>Are You Sure ?</Typography>
                    <Typography variant='h5' sx={{ color: 'text.secondary' }}>
                        {mode === 'approve' ? `Confirm ${approveActionLabel}` : `Confirm ${rejectActionLabel}`}
                    </Typography>
                </Box>
                {mode === 'reject' && (
                    <CustomTextField
                        fullWidth multiline rows={3}
                        label='Remark / Comment (Required for reject)'
                        placeholder='Enter your remark here...'
                        inputProps={{ maxLength: REJECT_REMARK_MAX_LENGTH }}
                        {...register('remark')}
                    />
                )}
            </DialogContent>

            <DialogActions
                sx={{
                    justifyContent: 'center',
                    borderTop: 'none',
                    mb: 4
                }}
            >
                <LoadingButton
                    onClick={handleFormSubmit(onSubmit)}
                    loading={statusMutation.isPending}
                    loadingIndicator={mode === 'approve' ? `${approveActionLabel}...` : `${rejectActionLabel}...`}
                    variant='contained'
                    color={mode === 'approve' ? 'success' : 'error'}
                    sx={{ mr: 4 }}
                    disabled={mode === 'reject' && !watch('remark')?.trim()}
                >
                    <span> Confirm </span>
                </LoadingButton>
                <Button variant='tonal' color='secondary' onClick={onClose} disabled={statusMutation.isPending}>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ActionDialog
