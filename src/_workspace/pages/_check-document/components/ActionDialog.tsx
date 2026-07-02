import { useState, useEffect } from 'react'
import {
    Dialog, DialogContent, DialogActions, Box, Typography, Alert, Button
} from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'

import undraw_clean_up_re_504g from '@assets/images/common/undraw_clean_up_re_504g.svg'
import undraw_notify_re_65on from '@assets/images/common/undraw_notify_re_65on.svg'

import ApprovalQueueServices from '@_workspace/services/_approval-queue/ApprovalQueueServices'
import CustomTextField from '@components/mui/TextField'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import type { ActionDialogProps } from '@_workspace/types/_check-document/CheckDocumentTypes'

import { Transition } from './shared'

// NOTE: This dialog performs a BULK status update (loops over `actions`), so the
// mutation stays inline rather than going through a single-mutation react-query hook.
const ActionDialog = ({ open, mode, actions, approveActionLabel, rejectActionLabel, onClose, onSuccess }: ActionDialogProps) => {
    const [remark, setRemark] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const user = getUserData()
    const actionCount = actions.length

    useEffect(() => {
        if (!open) {
            setRemark('')
            setError(null)
        }
    }, [open])

    const handleSubmit = async () => {
        if (actions.length === 0) return
        setLoading(true)
        setError(null)
        try {
            const failedRequestIds: number[] = []
            let failedMessage = 'Failed to update status'
            let successMessage = 'Status updated successfully'

            for (const action of actions) {
                const effectiveNextStatus = String(action.nextStatus || '').trim()
                const effectiveApproveLabel = String(action.approveActionLabel || approveActionLabel || '').trim()
                const normalizedNextStatus = effectiveNextStatus.toLowerCase()
                const normalizedApproveLabel = effectiveApproveLabel.toLowerCase()
                const workflowAction: 'APPROVE' | 'DISAGREE' | 'ACTION_REQUIRED' | 'REJECT' =
                    mode === 'reject'
                        ? 'REJECT'
                        : (normalizedApproveLabel.includes('action required')
                            ? 'ACTION_REQUIRED'
                            : (normalizedNextStatus.includes('issue gpr b')
                                || normalizedNextStatus.includes('issue gpr c')
                                || normalizedNextStatus.includes('vendor disagre')
                                ? 'DISAGREE'
                                : 'APPROVE'))

                const res = await ApprovalQueueServices.updateStatus({
                    REQUEST_REGISTER_VENDOR_ID: action.requestId,
                    REQUEST_STATUS: mode === 'approve' ? effectiveNextStatus : 'Rejected',
                    WORKFLOW_ACTION: workflowAction,
                    ACTION_TYPE: workflowAction,
                    APPROVE_BY: user?.EMPLOYEE_CODE || '',
                    APPROVER_REMARK: remark,
                    UPDATE_BY: user?.EMPLOYEE_CODE || '',
                    ISFINALSTEP: mode === 'approve' ? action.isFinalStep : false,
                })

                if (!res.data.Status) {
                    failedRequestIds.push(action.requestId)
                    failedMessage = res.data.Message || failedMessage
                } else {
                    successMessage = res.data.Message || successMessage
                }
            }

            if (failedRequestIds.length > 0) {
                setError(`${failedMessage} (Request: ${failedRequestIds.join(', ')})`)
                ToastMessageError({ title: 'Update Request Status', message: failedMessage })
                onSuccess()
                return
            }

            ToastMessageSuccess({ title: 'Update Request Status', message: successMessage })
            onSuccess()
            onClose()
        } catch (e: any) {
            setError(e?.response?.data?.Message || e?.message || 'Failed to update status')
            ToastMessageError({ title: 'Update Request Status', message: e?.response?.data?.Message || e?.message || 'Failed to update status' })
        } finally {
            setLoading(false)
        }
    }

    const imageConfirm = mode === 'reject' ? undraw_clean_up_re_504g : undraw_notify_re_65on
    const actionLabel = mode === 'approve' ? approveActionLabel : rejectActionLabel

    return (
        <Dialog
            maxWidth='xs'
            fullWidth={true}
            open={open}
            disableEscapeKeyDown
            TransitionComponent={Transition}
            onClose={(_event, reason) => { if (reason !== 'backdropClick') onClose() }}
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
                        {mode === 'approve'
                            ? (actionCount > 1 ? `Approve ${actionCount} selected requests` : approveActionLabel)
                            : rejectActionLabel}
                    </Typography>
                </Box>

                {error && <Alert severity='error' sx={{ mb: 2 }}>{error}</Alert>}

                {mode === 'reject' && (
                    <CustomTextField
                        fullWidth multiline rows={3}
                        label='Remark / Comment (Required for reject)'
                        placeholder='Enter your remark here...'
                        value={remark}
                        onChange={e => setRemark(e.target.value)}
                        inputProps={{ maxLength: 500 }}
                    />
                )}
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'center', borderTop: 'none', mb: 4 }}>
                <LoadingButton
                    onClick={handleSubmit}
                    loading={loading}
                    loadingIndicator={mode === 'approve' ? `${approveActionLabel}...` : `${rejectActionLabel}...`}
                    variant='contained'
                    color={mode === 'approve' ? 'success' : 'error'}
                    sx={{ mr: 4 }}
                    disabled={mode === 'reject' && !remark.trim()}
                >
                    <span>Yes, {actionLabel} !</span>
                </LoadingButton>
                <Button variant='tonal' color='secondary' onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ActionDialog
