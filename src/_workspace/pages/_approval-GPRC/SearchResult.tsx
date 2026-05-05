import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Menu,
    MenuItem,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import type { ColDef, ICellRendererParams, StateUpdatedEvent } from 'ag-grid-community'
import { useFormContext, useWatch } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import DxAGgridTable from '@/_template/DxAGgridTable'
import { useDxContext } from '@/_template/DxContextProvider'
import SearchResultCard from '@_workspace/components/search/SearchResultCard'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import RegisterRequestServices from '@_workspace/services/_register-request/RegisterRequestServices'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import type { ApprovalGprCFormData } from './validateSchema'
import ActionRequiredDialog from './modal/ActionRequiredDialog'
import RequestDetailDialog from './modal/RequestDetailDialog'

export type GprCQueueRow = {
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
    address?: string
    vendor_region?: string
    tel_phone?: string
}

export type GprCActionRequiredRow = {
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

type DialogMode = 'APPROVE' | 'REJECT'

const actionRequiredStepCodes = new Set([
    'EMR_CHECKER',
    'EMR_APPROVER',
    'QMS_CHECKER',
    'QMS_APPROVER',
    'PM_MANAGER_CHECKER',
    'PM_MANAGER_APPROVER',
])

const getRequestId = (row: GprCQueueRow) => Number(row.REQUEST_ID || row.request_id || 0)
const PREFIX_QUERY_KEY = 'APPROVAL_GPR_C'

const includesKeyword = (value: unknown, keyword: string) =>
    String(value || '').toLowerCase().includes(keyword.trim().toLowerCase())

interface RowActionMenuProps {
    canActionRequired: boolean
    onApprove: () => void
    onReject: () => void
    onActionRequired: () => void
}

const RowActionMenu = ({ canActionRequired, onApprove, onReject, onActionRequired }: RowActionMenuProps) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

    const handleClose = () => setAnchorEl(null)
    const handleSelect = (callback: () => void) => {
        callback()
        handleClose()
    }

    return (
        <>
            <Tooltip title='Actions'>
                <IconButton
                    size='small'
                    onClick={event => setAnchorEl(event.currentTarget)}
                    sx={{ color: 'text.secondary' }}
                >
                    <i className='tabler-dots-vertical' style={{ fontSize: 20 }} />
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={() => handleSelect(onApprove)} className='gap-2'>
                    <i className='tabler-check text-success' style={{ fontSize: 18 }} />
                    Approve
                </MenuItem>
                <MenuItem onClick={() => handleSelect(onReject)} className='gap-2'>
                    <i className='tabler-x text-error' style={{ fontSize: 18 }} />
                    Reject
                </MenuItem>
                <MenuItem
                    disabled={!canActionRequired}
                    onClick={() => handleSelect(onActionRequired)}
                    className='gap-2'
                >
                    <i className='tabler-alert-triangle text-warning' style={{ fontSize: 18 }} />
                    Action Required
                </MenuItem>
            </Menu>
        </>
    )
}

const SearchResult = () => {
    const { getValues, setValue } = useFormContext<ApprovalGprCFormData>()
    const { isEnableFetching, setIsEnableFetching } = useDxContext()
    const queryClient = useQueryClient()
    const approvalInitialState = useMemo(() => getValues('searchResults.approvalGridState'), [getValues])
    const actionRequiredInitialState = useMemo(() => getValues('searchResults.actionRequiredGridState'), [getValues])
    const user = getUserData()
    const empCode = String(user?.EMPLOYEE_CODE || '').trim()
    const userEmail = String(user?.EMAIL || '').trim()
    const [rows, setRows] = useState<GprCQueueRow[]>([])
    const [actionRows, setActionRows] = useState<GprCActionRequiredRow[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [selectedRow, setSelectedRow] = useState<GprCQueueRow | null>(null)
    const [actionRequiredRow, setActionRequiredRow] = useState<GprCQueueRow | null>(null)
    const [selectedActionRow, setSelectedActionRow] = useState<GprCActionRequiredRow | null>(null)
    const [detailRow, setDetailRow] = useState<Record<string, unknown> | null>(null)
    const [actionResultDialogOpen, setActionResultDialogOpen] = useState(false)
    const [dialogMode, setDialogMode] = useState<DialogMode>('APPROVE')
    const [remark, setRemark] = useState('')
    const [resultStatus, setResultStatus] = useState('COMPLETED')
    const [, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const dialogOpen = Boolean(selectedRow)
    const actionRequiredDialogOpen = Boolean(actionRequiredRow)
    const recordDialogOpen = Boolean(selectedActionRow)
    const detailDialogOpen = Boolean(detailRow)

    const searchFilters = useWatch({ name: 'searchFilters' })

    const filteredRows = useMemo(() => {
        const requestNumber = String(searchFilters.request_number || '').trim()
        const vendorName = String(searchFilters.vendor_name || '').trim()
        const stepKeyword = String(searchFilters.step_keyword || '').trim()
        const statusKeyword = String(searchFilters.status_keyword || '').trim()

        return rows.filter(row => {
            if (requestNumber && !includesKeyword(row.request_number, requestNumber) && !includesKeyword(getRequestId(row), requestNumber)) {
                return false
            }
            if (vendorName && !includesKeyword(row.company_name, vendorName)) return false
            if (stepKeyword && !includesKeyword(`${row.STEP_NAME || ''} ${row.STEP_CODE || ''}`, stepKeyword)) return false
            if (statusKeyword && !includesKeyword(row.request_status, statusKeyword)) return false

            return true
        })
    }, [rows, searchFilters])

    const filteredActionRows = useMemo(() => {
        const requestNumber = String(searchFilters.request_number || '').trim()
        const vendorName = String(searchFilters.vendor_name || '').trim()
        const stepKeyword = String(searchFilters.step_keyword || '').trim()
        const statusKeyword = String(searchFilters.status_keyword || '').trim()

        return actionRows.filter(row => {
            if (requestNumber && !includesKeyword(row.request_number, requestNumber) && !includesKeyword(row.REQUEST_ID, requestNumber)) {
                return false
            }
            if (vendorName && !includesKeyword(row.company_name, vendorName)) return false
            if (stepKeyword && !includesKeyword(`${row.STAGE_NAME || ''} ${row.STAGE_CODE || ''}`, stepKeyword)) return false
            if (statusKeyword && !includesKeyword(row.RESULT_STATUS || row.request_status, statusKeyword)) return false

            return true
        })
    }, [actionRows, searchFilters])

    const loadQueue = useCallback(async () => {
        if (!empCode) {
            setRows([])
            setActionRows([])
            return
        }

        setLoading(true)
        try {
            const response = await queryClient.fetchQuery({
                queryKey: [PREFIX_QUERY_KEY, 'approval', { approver_empcode: empCode }],
                queryFn: () => RegisterRequestServices.gprCQueue({ approver_empcode: empCode }),
                staleTime: 0,
            })
            const payload = response.data
            if (!payload.Status) {
                setMessage({ type: 'error', text: payload.Message || 'Failed to load GPR C queue' })
                setRows([])
                setActionRows([])
                return
            }

            setRows(Array.isArray(payload.ResultOnDb) ? payload.ResultOnDb as GprCQueueRow[] : [])

            if (userEmail) {
                const actionResponse = await queryClient.fetchQuery({
                    queryKey: [PREFIX_QUERY_KEY, 'action-required', { pic_email: userEmail }],
                    queryFn: () => RegisterRequestServices.gprCActionRequiredQueue({ pic_email: userEmail }),
                    staleTime: 0,
                })
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
    }, [empCode, queryClient, userEmail])

    useEffect(() => {
        if (isEnableFetching) {
            setIsEnableFetching(false)
            loadQueue()
        }
    }, [isEnableFetching, loadQueue, setIsEnableFetching])

    const openDialog = (mode: DialogMode, row: GprCQueueRow) => {
        setDialogMode(mode)
        setSelectedRow(row)
        setRemark('')
        setResultStatus('COMPLETED')
        setMessage(null)
    }

    const closeDialog = () => {
        if (submitting) return
        setSelectedRow(null)
    }

    const openActionRequiredDialog = (row: GprCQueueRow) => {
        setActionRequiredRow(row)
        setMessage(null)
    }

    const closeActionRequiredDialog = () => {
        if (submitting) return
        setActionRequiredRow(null)
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

    const openDetailDialog = (row: Record<string, unknown>) => {
        setDetailRow(row)
        setMessage(null)
    }

    const closeDetailDialog = () => {
        setDetailRow(null)
    }

    const dialogTitle = useMemo(() => {
        if (dialogMode === 'REJECT') return 'Reject GPR C Step'
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
                : await RegisterRequestServices.gprCApproveStep({ ...basePayload, remark })

            const payload = response.data
            if (!payload.Status) {
                setMessage({ type: 'error', text: payload.Message || 'GPR C action failed' })
                ToastMessageError({ message: payload.Message || 'GPR C action failed' })
                return
            }

            setMessage({ type: 'success', text: payload.Message || 'GPR C action completed' })
            ToastMessageSuccess({ message: payload.Message || 'GPR C action completed' })
            setSelectedRow(null)
            await loadQueue()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'GPR C action failed'
            setMessage({ type: 'error', text: message })
            ToastMessageError({ message })
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
                ToastMessageError({ message: payload.Message || 'Failed to record result' })
                return
            }

            setMessage({ type: 'success', text: payload.Message || 'Result recorded' })
            ToastMessageSuccess({ message: payload.Message || 'Result recorded' })
            setSelectedActionRow(null)
            await loadQueue()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to record result'
            setMessage({ type: 'error', text: message })
            ToastMessageError({ message })
        } finally {
            setSubmitting(false)
        }
    }

    const approvalColumnDefs: ColDef<GprCQueueRow>[] = [
        {
            headerName: 'Action',
            width: 110,
            pinned: 'left',
            sortable: false,
            filter: false,
            cellRenderer: (params: ICellRendererParams<GprCQueueRow>) => {
                const row = params.data
                if (!row) return null

                const stepCode = String(row.STEP_CODE || '').toUpperCase()
                const canActionRequired = actionRequiredStepCodes.has(stepCode)

                return (
                    <Stack direction='row' spacing={0.5} alignItems='center' sx={{ height: '100%' }}>
                        <Tooltip title='View Details'>
                            <IconButton
                                size='small'
                                color='primary'
                                onClick={() => openDetailDialog(row)}
                            >
                                <i className='tabler-eye' style={{ fontSize: 20 }} />
                            </IconButton>
                        </Tooltip>
                        <RowActionMenu
                            canActionRequired={canActionRequired}
                            onApprove={() => openDialog('APPROVE', row)}
                            onReject={() => openDialog('REJECT', row)}
                            onActionRequired={() => openActionRequiredDialog(row)}
                        />
                    </Stack>
                )
            },
        },
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
                const stepValue = params.data?.STEP_NAME || params.data?.STEP_CODE || '-'

                return (
                    <Typography
                        variant='body2'
                        title={stepValue}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            height: '100%',
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {stepValue}
                    </Typography>
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
    ]

    const actionRequiredColumnDefs: ColDef<GprCActionRequiredRow>[] = [
        {
            headerName: 'Action',
            minWidth: 290,
            pinned: 'left',
            sortable: false,
            filter: false,
            cellRenderer: (params: ICellRendererParams<GprCActionRequiredRow>) => params.data ? (
                <Stack direction='row' spacing={1} alignItems='center' sx={{ height: '100%' }}>
                    <Button
                        size='small'
                        variant='tonal'
                        color='info'
                        startIcon={<i className='tabler-eye' style={{ fontSize: 16 }} />}
                        onClick={() => openDetailDialog(params.data as GprCActionRequiredRow)}
                    >
                        Details
                    </Button>
                    <Button
                        size='small'
                        variant='contained'
                        startIcon={<i className='tabler-edit' style={{ fontSize: 16 }} />}
                        onClick={() => openRecordDialog(params.data as GprCActionRequiredRow)}
                    >
                        Record Result
                    </Button>
                </Stack>
            ) : null,
        },
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
    ]

    return (
        <Stack spacing={3}>
            <SearchResultCard>
                <Box sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                        <Button
                            size='medium'
                            variant='contained'
                            color='warning'
                            startIcon={<i className='tabler-alert-circle' style={{ fontSize: 16 }} />}
                            endIcon={
                                <Box
                                    component='span'
                                    sx={{
                                        minWidth: 22,
                                        height: 22,
                                        px: 1,
                                        borderRadius: '999px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: 'common.white',
                                        color: 'warning.main',
                                        fontSize: 12,
                                        fontWeight: 700,
                                    }}
                                >
                                    {filteredActionRows.length}
                                </Box>
                            }
                            onClick={() => setActionResultDialogOpen(true)}
                        >
                            Action Required Results
                        </Button>
                    </Box>
                    <DxAGgridTable
                        rowData={filteredRows}
                        columnDefs={approvalColumnDefs}
                        height={560}
                        loading={loading}
                        getRowId={params => String(params.data.GPR_C_STEP_ID || params.data.GPR_C_FLOW_ID || getRequestId(params.data))}
                        rowHeight={64}
                        overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No GPR C approval task found.</span>'
                        initialState={approvalInitialState}
                        onStateUpdated={(event: StateUpdatedEvent) => setValue('searchResults.approvalGridState', event.state)}
                    />
                </Box>
            </SearchResultCard>

            <Dialog open={dialogOpen} onClose={closeDialog} maxWidth='sm' fullWidth>
                <DialogTitle>{dialogTitle}</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={3} sx={{ pt: 1 }}>
                        <TextField
                            label='Remark'
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
                        color={dialogMode === 'REJECT' ? 'error' : 'success'}
                        onClick={handleSubmit}
                    >
                        Confirm
                    </LoadingButton>
                </DialogActions>
            </Dialog>

            <ActionRequiredDialog
                open={actionRequiredDialogOpen}
                requestId={actionRequiredRow ? getRequestId(actionRequiredRow) : null}
                requestNumber={actionRequiredRow?.request_number}
                stepName={actionRequiredRow?.STEP_NAME || actionRequiredRow?.STEP_CODE}
                actionBy={empCode}
                updateBy={empCode}
                onClose={closeActionRequiredDialog}
                onSuccess={async () => {
                    setActionRequiredRow(null)
                    await loadQueue()
                }}
                onError={message => setMessage({ type: 'error', text: message })}
            />

            <RequestDetailDialog
                open={detailDialogOpen}
                requestId={detailRow ? Number(detailRow.REQUEST_ID || detailRow.request_id || 0) : null}
                fallbackRow={detailRow}
                onClose={closeDetailDialog}
            />

            <Dialog
                open={actionResultDialogOpen}
                onClose={() => setActionResultDialogOpen(false)}
                maxWidth='lg'
                fullWidth
            >
                <DialogTitle>
                    <Stack direction='row' spacing={2} alignItems='center'>
                        <Typography variant='h5' component='span'>Action Required Results</Typography>
                        <Chip size='small' label={filteredActionRows.length} color='warning' variant='tonal' />
                    </Stack>
                </DialogTitle>
                <DialogContent dividers>
                    <DxAGgridTable
                        rowData={filteredActionRows}
                        columnDefs={actionRequiredColumnDefs}
                        height={420}
                        loading={loading}
                        getRowId={params => String(params.data.ACTION_REQUIRED_ID || params.data.REQUEST_ID || '')}
                        overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No pending Action Required result.</span>'
                        initialState={actionRequiredInitialState}
                        onStateUpdated={(event: StateUpdatedEvent) => setValue('searchResults.actionRequiredGridState', event.state)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button variant='tonal' color='secondary' onClick={() => setActionResultDialogOpen(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={recordDialogOpen} onClose={closeRecordDialog} maxWidth='sm' fullWidth>
                <DialogTitle>Record Action Required Result</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={3} sx={{ pt: 1 }}>
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
        </Stack>
    )
}

export default SearchResult
