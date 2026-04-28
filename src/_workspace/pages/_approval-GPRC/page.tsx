import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    LinearProgress,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'
import RegisterRequestServices from '@_workspace/services/_register-request/RegisterRequestServices'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { MENU_NAME, breadcrumbNavigation } from './env'

type GprCQueueRow = {
    REQUEST_ID?: number
    request_id?: number
    request_number?: string
    request_status?: string
    GPR_C_FLOW_ID?: number
    GPR_C_STEP_ID?: number
    STEP_CODE?: string
    STEP_NAME?: string
    STEP_ORDER?: number
    APPROVER_EMPCODE?: string
    APPROVER_NAME?: string
    STEP_STATUS?: string
    company_name?: string
    contact_name?: string
    vendor_email?: string
    supportProduct_Process?: string
    purchase_frequency?: string
}

type DialogMode = 'APPROVE' | 'REJECT' | 'ACTION_REQUIRED'

type GprCActionRequiredRow = {
    ACTION_REQUIRED_ID?: number
    REQUEST_ID?: number
    STAGE_NAME?: string
    STAGE_CODE?: string
    REQUIRED_DETAIL?: string
    RESULT_STATUS?: string
    request_number?: string
    request_status?: string
    company_name?: string
}

const getRequestId = (row: GprCQueueRow) => Number(row.REQUEST_ID || row.request_id || 0)

const actionRequiredStepCodes = new Set([
    'EMR_CHECKER',
    'EMR_APPROVER',
    'QMS_CHECKER',
    'QMS_APPROVER',
    'PM_MANAGER_CHECKER',
    'PM_MANAGER_APPROVER',
])

export default function ApprovalGprCPage() {
    const user = getUserData()
    const empCode = String(user?.EMPLOYEE_CODE || '').trim()
    const userEmail = String(user?.EMAIL || '').trim()
    const [rows, setRows] = useState<GprCQueueRow[]>([])
    const [actionRows, setActionRows] = useState<GprCActionRequiredRow[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [selectedRow, setSelectedRow] = useState<GprCQueueRow | null>(null)
    const [selectedActionRow, setSelectedActionRow] = useState<GprCActionRequiredRow | null>(null)
    const [dialogMode, setDialogMode] = useState<DialogMode>('APPROVE')
    const [remark, setRemark] = useState('')
    const [picName, setPicName] = useState('')
    const [picEmail, setPicEmail] = useState('')
    const [resultStatus, setResultStatus] = useState('COMPLETED')
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const dialogOpen = Boolean(selectedRow)
    const recordDialogOpen = Boolean(selectedActionRow)

    const loadQueue = useCallback(async () => {
        if (!empCode) {
            setRows([])
            return
        }

        setLoading(true)
        try {
            const response = await RegisterRequestServices.gprCQueue({ approver_empcode: empCode })
            const payload = response.data
            if (!payload.Status) {
                setMessage({ type: 'error', text: payload.Message || 'Failed to load GPR C queue' })
                setRows([])
                return
            }
            setRows(Array.isArray(payload.ResultOnDb) ? payload.ResultOnDb as GprCQueueRow[] : [])

            if (userEmail) {
                const actionResponse = await RegisterRequestServices.gprCActionRequiredQueue({ pic_email: userEmail })
                const actionPayload = actionResponse.data
                setActionRows(actionPayload.Status && Array.isArray(actionPayload.ResultOnDb)
                    ? actionPayload.ResultOnDb as GprCActionRequiredRow[]
                    : []
                )
            } else {
                setActionRows([])
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to load GPR C queue'
            setMessage({ type: 'error', text: message })
            setRows([])
            setActionRows([])
        } finally {
            setLoading(false)
        }
    }, [empCode, userEmail])

    useEffect(() => {
        loadQueue()
    }, [loadQueue])

    const openDialog = (mode: DialogMode, row: GprCQueueRow) => {
        setDialogMode(mode)
        setSelectedRow(row)
        setRemark('')
        setPicName('')
        setPicEmail('')
        setResultStatus('COMPLETED')
        setMessage(null)
    }

    const closeDialog = () => {
        if (submitting) return
        setSelectedRow(null)
    }

    const openRecordDialog = (row: GprCActionRequiredRow) => {
        setSelectedActionRow(row)
        setRemark('')
        setResultStatus('COMPLETED')
        setMessage(null)
    }

    const closeRecordDialog = () => {
        if (submitting) return
        setSelectedActionRow(null)
    }

    const dialogTitle = useMemo(() => {
        if (dialogMode === 'REJECT') return 'Reject GPR C Step'
        if (dialogMode === 'ACTION_REQUIRED') return 'Send Action Required'
        return 'Approve GPR C Step'
    }, [dialogMode])

    const handleSubmit = async () => {
        if (!selectedRow || !empCode) return

        const requestId = getRequestId(selectedRow)
        if (!requestId) {
            setMessage({ type: 'error', text: 'Missing request id' })
            return
        }

        setSubmitting(true)
        try {
            const basePayload = {
                request_id: requestId,
                action_by: empCode,
                UPDATE_BY: empCode,
            }
            const response = dialogMode === 'REJECT'
                ? await RegisterRequestServices.gprCRejectStep({ ...basePayload, remark })
                : dialogMode === 'ACTION_REQUIRED'
                    ? await RegisterRequestServices.gprCActionRequired({
                        ...basePayload,
                        pic_name: picName,
                        pic_email: picEmail,
                        required_detail: remark,
                    })
                    : await RegisterRequestServices.gprCApproveStep({ ...basePayload, remark })

            const payload = response.data
            if (!payload.Status) {
                setMessage({ type: 'error', text: payload.Message || 'GPR C action failed' })
                return
            }

            setMessage({ type: 'success', text: payload.Message || 'GPR C action completed' })
            setSelectedRow(null)
            await loadQueue()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'GPR C action failed'
            setMessage({ type: 'error', text: message })
        } finally {
            setSubmitting(false)
        }
    }

    const handleRecordResult = async () => {
        if (!selectedActionRow || !empCode) return

        const actionRequiredId = Number(selectedActionRow.ACTION_REQUIRED_ID || 0)
        if (!actionRequiredId) {
            setMessage({ type: 'error', text: 'Missing action required id' })
            return
        }

        setSubmitting(true)
        try {
            const response = await RegisterRequestServices.gprCRecordActionResult({
                action_required_id: actionRequiredId,
                result_status: resultStatus,
                result_remark: remark,
                result_by: empCode,
                UPDATE_BY: empCode,
            })
            const payload = response.data
            if (!payload.Status) {
                setMessage({ type: 'error', text: payload.Message || 'Failed to record result' })
                return
            }

            setMessage({ type: 'success', text: payload.Message || 'Result recorded' })
            setSelectedActionRow(null)
            await loadQueue()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to record result'
            setMessage({ type: 'error', text: message })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Grid container spacing={6}>
            <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
                <DxBreadCrumbs menuName={MENU_NAME} breadcrumbNavigation={breadcrumbNavigation} />
            </Grid>

            <Grid item xs={12}>
                <Stack spacing={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                        <Box>
                            <Typography variant='h5' sx={{ fontWeight: 700 }}>
                                Approval GPR C
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                                Current GPR C workflow steps assigned to {empCode || 'current user'}
                            </Typography>
                        </Box>
                        <Button
                            variant='tonal'
                            startIcon={<i className='tabler-refresh' style={{ fontSize: 18 }} />}
                            onClick={loadQueue}
                            disabled={loading}
                        >
                            Refresh
                        </Button>
                    </Box>

                    {message && (
                        <Alert severity={message.type} onClose={() => setMessage(null)}>
                            {message.text}
                        </Alert>
                    )}

                    <TableContainer component={Paper} variant='outlined'>
                        {loading && <LinearProgress />}
                        <Table size='small'>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Request No.</TableCell>
                                    <TableCell>Vendor</TableCell>
                                    <TableCell>Step</TableCell>
                                    <TableCell>Product / Frequency</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align='right'>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={6}>
                                            <Box sx={{ py: 8, textAlign: 'center' }}>
                                                <Typography color='text.secondary'>No GPR C approval task found.</Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )}

                                {rows.map(row => {
                                    const requestId = getRequestId(row)
                                    const stepCode = String(row.STEP_CODE || '').toUpperCase()
                                    const canActionRequired = actionRequiredStepCodes.has(stepCode)

                                    return (
                                        <TableRow key={`${row.GPR_C_FLOW_ID || requestId}-${row.GPR_C_STEP_ID || stepCode}`} hover>
                                            <TableCell>
                                                <Typography variant='body2' sx={{ fontWeight: 700 }}>
                                                    {row.request_number || `REQ-${requestId}`}
                                                </Typography>
                                                <Typography variant='caption' color='text.secondary'>
                                                    ID {requestId}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant='body2'>{row.company_name || '-'}</Typography>
                                                <Typography variant='caption' color='text.secondary'>
                                                    {row.contact_name || row.vendor_email || '-'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Stack spacing={0.75}>
                                                    <Typography variant='body2' sx={{ fontWeight: 600 }}>
                                                        {row.STEP_NAME || stepCode || '-'}
                                                    </Typography>
                                                    <Chip size='small' label={stepCode || '-'} variant='tonal' color='info' sx={{ width: 'fit-content' }} />
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant='body2'>{row.supportProduct_Process || '-'}</Typography>
                                                <Typography variant='caption' color='text.secondary'>
                                                    {row.purchase_frequency || '-'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip size='small' label={row.request_status || 'In Progress'} color='warning' variant='tonal' />
                                            </TableCell>
                                            <TableCell align='right'>
                                                <Stack direction='row' spacing={1} justifyContent='flex-end' sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                                                    {canActionRequired && (
                                                        <Button
                                                            size='small'
                                                            variant='tonal'
                                                            color='warning'
                                                            startIcon={<i className='tabler-alert-triangle' style={{ fontSize: 16 }} />}
                                                            onClick={() => openDialog('ACTION_REQUIRED', row)}
                                                        >
                                                            Action Required
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size='small'
                                                        variant='tonal'
                                                        color='error'
                                                        startIcon={<i className='tabler-x' style={{ fontSize: 16 }} />}
                                                        onClick={() => openDialog('REJECT', row)}
                                                    >
                                                        Reject
                                                    </Button>
                                                    <Button
                                                        size='small'
                                                        variant='contained'
                                                        color='success'
                                                        startIcon={<i className='tabler-check' style={{ fontSize: 16 }} />}
                                                        onClick={() => openDialog('APPROVE', row)}
                                                    >
                                                        Approve
                                                    </Button>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box>
                        <Typography variant='h6' sx={{ fontWeight: 700, mb: 2 }}>
                            Action Required Results
                        </Typography>
                        <TableContainer component={Paper} variant='outlined'>
                            <Table size='small'>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Request No.</TableCell>
                                        <TableCell>Vendor</TableCell>
                                        <TableCell>Stage</TableCell>
                                        <TableCell>Required Detail</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align='right'>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {actionRows.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6}>
                                                <Box sx={{ py: 5, textAlign: 'center' }}>
                                                    <Typography color='text.secondary'>No pending Action Required result.</Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {actionRows.map(row => (
                                        <TableRow key={row.ACTION_REQUIRED_ID} hover>
                                            <TableCell>{row.request_number || `REQ-${row.REQUEST_ID || ''}`}</TableCell>
                                            <TableCell>{row.company_name || '-'}</TableCell>
                                            <TableCell>{row.STAGE_NAME || row.STAGE_CODE || '-'}</TableCell>
                                            <TableCell>{row.REQUIRED_DETAIL || '-'}</TableCell>
                                            <TableCell>
                                                <Chip size='small' label={row.RESULT_STATUS || 'PENDING'} color='warning' variant='tonal' />
                                            </TableCell>
                                            <TableCell align='right'>
                                                <Button
                                                    size='small'
                                                    variant='contained'
                                                    startIcon={<i className='tabler-edit' style={{ fontSize: 16 }} />}
                                                    onClick={() => openRecordDialog(row)}
                                                >
                                                    Record Result
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </Stack>
            </Grid>

            <Dialog open={dialogOpen} onClose={closeDialog} maxWidth='sm' fullWidth>
                <DialogTitle>{dialogTitle}</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={3} sx={{ pt: 1 }}>
                        {selectedRow && (
                            <Alert severity={dialogMode === 'REJECT' ? 'warning' : 'info'}>
                                {selectedRow.request_number || `Request ${getRequestId(selectedRow)}`} - {selectedRow.STEP_NAME || selectedRow.STEP_CODE}
                            </Alert>
                        )}

                        {dialogMode === 'ACTION_REQUIRED' && (
                            <Stack spacing={2}>
                                <TextField
                                    label='PIC Name'
                                    value={picName}
                                    onChange={event => setPicName(event.target.value)}
                                    fullWidth
                                    required
                                />
                                <TextField
                                    label='PIC Email'
                                    value={picEmail}
                                    onChange={event => setPicEmail(event.target.value)}
                                    fullWidth
                                    required
                                />
                            </Stack>
                        )}

                        <TextField
                            label={dialogMode === 'ACTION_REQUIRED' ? 'Required Detail' : 'Remark'}
                            value={remark}
                            onChange={event => setRemark(event.target.value)}
                            fullWidth
                            multiline
                            minRows={3}
                            required={dialogMode !== 'APPROVE'}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button variant='tonal' color='secondary' onClick={closeDialog} disabled={submitting}>
                        Cancel
                    </Button>
                    <LoadingButton
                        variant='contained'
                        loading={submitting}
                        color={dialogMode === 'REJECT' ? 'error' : dialogMode === 'ACTION_REQUIRED' ? 'warning' : 'success'}
                        onClick={handleSubmit}
                        disabled={dialogMode === 'ACTION_REQUIRED' && (!picEmail || !remark)}
                    >
                        Confirm
                    </LoadingButton>
                </DialogActions>
            </Dialog>

            <Dialog open={recordDialogOpen} onClose={closeRecordDialog} maxWidth='sm' fullWidth>
                <DialogTitle>Record Action Required Result</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={3} sx={{ pt: 1 }}>
                        {selectedActionRow && (
                            <Alert severity='info'>
                                {selectedActionRow.request_number || `Request ${selectedActionRow.REQUEST_ID || ''}`} - {selectedActionRow.STAGE_NAME || selectedActionRow.STAGE_CODE}
                            </Alert>
                        )}
                        <TextField
                            label='Result Status'
                            select
                            SelectProps={{ native: true }}
                            value={resultStatus}
                            onChange={event => setResultStatus(event.target.value)}
                            fullWidth
                        >
                            <option value='COMPLETED'>Completed</option>
                            <option value='INCOMPLETE'>Incomplete</option>
                        </TextField>
                        <TextField
                            label='Result Remark'
                            value={remark}
                            onChange={event => setRemark(event.target.value)}
                            fullWidth
                            multiline
                            minRows={3}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button variant='tonal' color='secondary' onClick={closeRecordDialog} disabled={submitting}>
                        Cancel
                    </Button>
                    <LoadingButton variant='contained' loading={submitting} onClick={handleRecordResult}>
                        Save Result
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </Grid>
    )
}
