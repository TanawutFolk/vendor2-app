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
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import type { ColDef, ICellRendererParams } from 'ag-grid-community'
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'
import DxAGgridTable from '@/_template/DxAGgridTable'
import SearchResultCard from '@_workspace/components/search/SearchResultCard'
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

    const approvalColumnDefs = useMemo<ColDef<GprCQueueRow>[]>(() => [
        {
            headerName: 'Request No.',
            field: 'request_number',
            minWidth: 150,
            valueGetter: params => params.data?.request_number || `REQ-${getRequestId(params.data || {})}`,
        },
        {
            headerName: 'Vendor',
            field: 'company_name',
            minWidth: 220,
            flex: 1,
            valueGetter: params => params.data?.company_name || '-',
        },
        {
            headerName: 'Step',
            field: 'STEP_NAME',
            minWidth: 220,
            cellRenderer: (params: ICellRendererParams<GprCQueueRow>) => {
                const stepCode = String(params.data?.STEP_CODE || '').toUpperCase()
                return (
                    <Stack spacing={0.5} sx={{ py: 0.75 }}>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                            {params.data?.STEP_NAME || stepCode || '-'}
                        </Typography>
                        <Chip size='small' label={stepCode || '-'} variant='tonal' color='info' sx={{ width: 'fit-content' }} />
                    </Stack>
                )
            },
        },
        {
            headerName: 'Product / Frequency',
            minWidth: 220,
            valueGetter: params => [params.data?.supportProduct_Process, params.data?.purchase_frequency].filter(Boolean).join(' / ') || '-',
        },
        {
            headerName: 'Status',
            field: 'request_status',
            minWidth: 150,
            cellRenderer: (params: ICellRendererParams<GprCQueueRow>) => (
                <Chip size='small' label={params.data?.request_status || 'In Progress'} color='warning' variant='tonal' />
            ),
        },
        {
            headerName: 'Action',
            minWidth: 360,
            pinned: 'right',
            sortable: false,
            filter: false,
            cellRenderer: (params: ICellRendererParams<GprCQueueRow>) => {
                const row = params.data
                if (!row) return null
                const stepCode = String(row.STEP_CODE || '').toUpperCase()
                const canActionRequired = actionRequiredStepCodes.has(stepCode)

                return (
                    <Stack direction='row' spacing={1} justifyContent='flex-end' sx={{ py: 0.75 }}>
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
                )
            },
        },
    ], [])

    const actionRequiredColumnDefs = useMemo<ColDef<GprCActionRequiredRow>[]>(() => [
        {
            headerName: 'Request No.',
            field: 'request_number',
            minWidth: 150,
            valueGetter: params => params.data?.request_number || `REQ-${params.data?.REQUEST_ID || ''}`,
        },
        { headerName: 'Vendor', field: 'company_name', minWidth: 220, flex: 1 },
        {
            headerName: 'Stage',
            minWidth: 180,
            valueGetter: params => params.data?.STAGE_NAME || params.data?.STAGE_CODE || '-',
        },
        {
            headerName: 'Required Detail',
            field: 'REQUIRED_DETAIL',
            minWidth: 260,
            flex: 1,
            valueGetter: params => params.data?.REQUIRED_DETAIL || '-',
        },
        {
            headerName: 'Status',
            field: 'RESULT_STATUS',
            minWidth: 140,
            cellRenderer: (params: ICellRendererParams<GprCActionRequiredRow>) => (
                <Chip size='small' label={params.data?.RESULT_STATUS || 'PENDING'} color='warning' variant='tonal' />
            ),
        },
        {
            headerName: 'Action',
            minWidth: 170,
            pinned: 'right',
            sortable: false,
            filter: false,
            cellRenderer: (params: ICellRendererParams<GprCActionRequiredRow>) => params.data ? (
                <Button
                    size='small'
                    variant='contained'
                    startIcon={<i className='tabler-edit' style={{ fontSize: 16 }} />}
                    onClick={() => openRecordDialog(params.data as GprCActionRequiredRow)}
                >
                    Record Result
                </Button>
            ) : null,
        },
    ], [])

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

                    <SearchResultCard>
                        <Box sx={{ p: 4 }}>
                            <DxAGgridTable
                                rowData={rows}
                                columnDefs={approvalColumnDefs}
                                height={560}
                                loading={loading}
                                getRowId={params => String(params.data.GPR_C_STEP_ID || params.data.GPR_C_FLOW_ID || getRequestId(params.data))}
                                rowHeight={64}
                                overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No GPR C approval task found.</span>'
                            />
                        </Box>
                    </SearchResultCard>

                    <Box>
                        <Typography variant='h6' sx={{ fontWeight: 700, mb: 2 }}>
                            Action Required Results
                        </Typography>
                        <SearchResultCard>
                            <Box sx={{ p: 4 }}>
                                <DxAGgridTable
                                    rowData={actionRows}
                                    columnDefs={actionRequiredColumnDefs}
                                    height={360}
                                    loading={loading}
                                    getRowId={params => String(params.data.ACTION_REQUIRED_ID || params.data.REQUEST_ID || '')}
                                    overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No pending Action Required result.</span>'
                                />
                            </Box>
                        </SearchResultCard>
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
