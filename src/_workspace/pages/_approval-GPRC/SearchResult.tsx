import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import type {
    ColDef,
    GetRowIdParams,
    GridApi,
    GridReadyEvent,
    ICellRendererParams,
    IServerSideDatasource,
    SortModelItem,
    StateUpdatedEvent,
} from 'ag-grid-community'
import { useFormContext } from 'react-hook-form'
import DxAGgridTable from '@/_template/DxAGgridTable'
import { useDxContext } from '@/_template/DxContextProvider'
import SearchResultCard from '@_workspace/components/search/SearchResultCard'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import RegisterRequestServices from '@_workspace/services/_register-request/RegisterRequestServices'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import type { ApprovalGprCFormData } from './validateSchema'
import ActionRequiredDialog from './modal/ActionRequiredDialog'
import RequestDetailDialog from './modal/RequestDetailDialog'
import useDxServerSideGrid, { enforceLockedLeftColumns } from '@_workspace/hooks/useDxServerSideGrid'

export type GprCQueueRow = {
    REQUEST_REGISTER_VENDOR_ID?: number
    request_id?: number
    request_number?: string
    request_status?: string
    request_state?: string
    REQUEST_VENDOR_GPR_C_FLOWS_ID?: number
    REQUEST_VENDOR_GPR_C_STEPS_ID?: number
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
    REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID?: number
    REQUEST_REGISTER_VENDOR_ID?: number
    STAGE_NAME?: string
    STAGE_CODE?: string
    REQUIRED_DETAIL?: string
    RESULT_STATUS?: string
    request_number?: string
    request_status?: string
    request_state?: string
    company_name?: string
}

type DialogMode = 'APPROVE' | 'REJECT'

type AgGridColumnFilter = {
    id: string
    columnFns?: string
    value: string | string[]
}

type AgGridFilterModelValue = {
    filterType?: 'text' | 'number' | 'date' | 'set'
    type?: string
    filter?: string | number
    dateFrom?: string
    values?: string[]
}

const actionRequiredStepCodes = new Set([
    'EMR_CHECKER',
    'EMR_APPROVER',
    'QMS_CHECKER',
    'QMS_APPROVER',
    'PM_MANAGER_CHECKER',
    'PM_MANAGER_APPROVER',
])

const getRequestId = (row: GprCQueueRow) => Number(row.REQUEST_REGISTER_VENDOR_ID || row.request_id || 0)

const mapAgGridFilterModelToColumnFilters = (filterModel: Record<string, AgGridFilterModelValue>): AgGridColumnFilter[] => {
    return Object.entries(filterModel || {}).flatMap(([id, model]) => {
        if (!model) return []

        if (model.filterType === 'text' || model.filterType === 'number') {
            if (model.type === 'blank' || model.type === 'notBlank') return []

            return [{
                id,
                columnFns: model.type || 'contains',
                value: String(model.filter ?? ''),
            }]
        }

        if (model.filterType === 'date') {
            return [{
                id,
                columnFns: model.type || 'equals',
                value: String(model.dateFrom ?? ''),
            }]
        }

        if (model.filterType === 'set') {
            return model.values?.length ? [{ id, value: model.values }] : []
        }

        return []
    }).filter(item => Array.isArray(item.value) ? item.value.length > 0 : String(item.value || '').trim().length > 0)
}

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
    const user = getUserData()
    const empCode = String(user?.EMPLOYEE_CODE || '').trim()
    const userEmail = String(user?.EMAIL || '').trim()

    const [submitting, setSubmitting] = useState(false)
    const [selectedRow, setSelectedRow] = useState<GprCQueueRow | null>(null)
    const [actionRequiredRow, setActionRequiredRow] = useState<GprCQueueRow | null>(null)
    const [selectedActionRow, setSelectedActionRow] = useState<GprCActionRequiredRow | null>(null)
    const [detailRow, setDetailRow] = useState<Record<string, unknown> | null>(null)
    const [actionResultDialogOpen, setActionResultDialogOpen] = useState(false)
    const [dialogMode, setDialogMode] = useState<DialogMode>('APPROVE')
    const [remark, setRemark] = useState('')
    const [resultStatus, setResultStatus] = useState('completed')
    const [actionRequiredTotalCount, setActionRequiredTotalCount] = useState(0)

    const actionRequiredGridApiRef = useRef<GridApi | null>(null)
    const { savedGridState, handleGridReady, handleStateUpdated, refreshServerSide } = useDxServerSideGrid({
        getValues,
        setValue,
        isEnableFetching,
        setIsEnableFetching,
        statePath: 'searchResults.approvalGridState',
        lockedLeftColIds: ['action', 'request_number'],
    })

    const actionRequiredInitialState = useMemo(
        () => enforceLockedLeftColumns(getValues('searchResults.actionRequiredGridState'), ['action', 'request_number']),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    )

    const handleActionRequiredGridReady = useCallback((params: GridReadyEvent) => {
        actionRequiredGridApiRef.current = params.api
    }, [])

    const handleActionRequiredStateUpdated = useCallback((event: StateUpdatedEvent) => {
        setValue('searchResults.actionRequiredGridState', enforceLockedLeftColumns(event.state, ['action', 'request_number']), { shouldDirty: false })
    }, [setValue])

    const dialogOpen = Boolean(selectedRow)
    const actionRequiredDialogOpen = Boolean(actionRequiredRow)
    const recordDialogOpen = Boolean(selectedActionRow)
    const detailDialogOpen = Boolean(detailRow)

    const buildSearchFilters = useCallback(() => {
        const searchFilters = getValues('searchFilters')

        return [
            { id: 'request_number', value: searchFilters.request_number || '' },
            { id: 'vendor_name', value: searchFilters.vendor_name || '' },
            { id: 'step_keyword', value: searchFilters.step_keyword || '' },
            { id: 'status_keyword', value: searchFilters.status_keyword || '' },
        ]
    }, [getValues])

    const loadActionRequiredCount = useCallback(async () => {
        if (!userEmail) {
            setActionRequiredTotalCount(0)
            return
        }

        try {
            const response = await RegisterRequestServices.gprCActionRequiredQueue({
                pic_email: userEmail,
                SearchFilters: buildSearchFilters(),
                ColumnFilters: [],
                Order: [{ id: 'SENT_AT', desc: true }, { id: 'REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID', desc: true }],
                Start: 0,
                Limit: 1,
            })
            const result = response.data
            setActionRequiredTotalCount(result?.Status ? result.TotalCountOnDb || 0 : 0)
        } catch {
            setActionRequiredTotalCount(0)
        }
    }, [buildSearchFilters, userEmail])

    const refreshAllGrids = useCallback(() => {
        refreshServerSide()
        actionRequiredGridApiRef.current?.refreshServerSide?.({ purge: true })
        void loadActionRequiredCount()
    }, [loadActionRequiredCount, refreshServerSide])

    useEffect(() => {
        if (isEnableFetching) {
            void loadActionRequiredCount()
        }
    }, [isEnableFetching, loadActionRequiredCount])

    const approvalDatasource = useMemo<IServerSideDatasource>(() => ({
        getRows: async params => {
            if (!empCode) {
                params.success({ rowData: [], rowCount: 0 })
                return
            }

            try {
                const { startRow, endRow, sortModel, filterModel } = params.request
                const limit = (endRow ?? 20) - (startRow ?? 0)
                const response = await RegisterRequestServices.gprCQueue({
                    approver_empcode: empCode,
                    SearchFilters: buildSearchFilters(),
                    ColumnFilters: mapAgGridFilterModelToColumnFilters(filterModel as Record<string, AgGridFilterModelValue>),
                    Order: sortModel && sortModel.length > 0
                        ? sortModel.map((item: SortModelItem) => ({ id: item.colId, desc: item.sort === 'desc' }))
                        : [{ id: 'REQUEST_VENDOR_GPR_C_FLOWS_ID', desc: true }],
                    Start: startRow ?? 0,
                    Limit: limit || 20,
                })
                const result = response.data

                if (result?.Status) {
                    const rowData = (result.ResultOnDb || []).map((row: any) => ({
                        ...row,
                        request_id: row.request_id ?? row.REQUEST_REGISTER_VENDOR_ID,
                        request_number: row.request_number ?? row.REQUEST_NUMBER,
                        request_status: row.request_status ?? row.REQUEST_STATUS,
                        company_name: row.company_name ?? row.COMPANY_NAME,
                        contact_name: row.contact_name ?? row.CONTACT_NAME,
                        vendor_email: row.vendor_email ?? row.VENDOR_EMAIL,
                        supportProduct_Process: row.supportProduct_Process ?? row.SUPPORTPRODUCT_PROCESS,
                        purchase_frequency: row.purchase_frequency ?? row.PURCHASE_FREQUENCY,
                        address: row.address ?? row.ADDRESS,
                        vendor_region: row.vendor_region ?? row.VENDOR_REGION,
                        tel_phone: row.tel_phone ?? row.TEL_PHONE,
                    }))
                    params.success({
                        rowData,
                        rowCount: result.TotalCountOnDb || 0,
                    })
                    return
                }

                params.fail()
            } catch {
                params.fail()
            }
        },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [empCode])

    const actionRequiredDatasource = useMemo<IServerSideDatasource>(() => ({
        getRows: async params => {
            if (!userEmail) {
                setActionRequiredTotalCount(0)
                params.success({ rowData: [], rowCount: 0 })
                return
            }

            try {
                const { startRow, endRow, sortModel, filterModel } = params.request
                const limit = (endRow ?? 20) - (startRow ?? 0)
                const response = await RegisterRequestServices.gprCActionRequiredQueue({
                    pic_email: userEmail,
                    SearchFilters: buildSearchFilters(),
                    ColumnFilters: mapAgGridFilterModelToColumnFilters(filterModel as Record<string, AgGridFilterModelValue>),
                    Order: sortModel && sortModel.length > 0
                        ? sortModel.map((item: SortModelItem) => ({ id: item.colId, desc: item.sort === 'desc' }))
                        : [{ id: 'SENT_AT', desc: true }, { id: 'REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID', desc: true }],
                    Start: startRow ?? 0,
                    Limit: limit || 20,
                })
                const result = response.data

                if (result?.Status) {
                    const rowData = (result.ResultOnDb || []).map((row: any) => ({
                        ...row,
                        request_number: row.request_number ?? row.REQUEST_NUMBER,
                        request_status: row.request_status ?? row.REQUEST_STATUS,
                        company_name: row.company_name ?? row.COMPANY_NAME,
                    }))
                    setActionRequiredTotalCount(result.TotalCountOnDb || 0)
                    params.success({
                        rowData,
                        rowCount: result.TotalCountOnDb || 0,
                    })
                    return
                }

                setActionRequiredTotalCount(0)
                params.fail()
            } catch {
                setActionRequiredTotalCount(0)
                params.fail()
            }
        },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [userEmail])

    const openDialog = (mode: DialogMode, row: GprCQueueRow) => {
        setDialogMode(mode)
        setSelectedRow(row)
        setRemark('')
        setResultStatus('completed')
    }

    const closeDialog = () => {
        if (submitting) return
        setSelectedRow(null)
    }

    const openActionRequiredDialog = (row: GprCQueueRow) => {
        setActionRequiredRow(row)
    }

    const closeActionRequiredDialog = () => {
        if (submitting) return
        setActionRequiredRow(null)
    }

    const openRecordDialog = (row: GprCActionRequiredRow) => {
        setSelectedActionRow(row)
        setRemark('')
        setResultStatus('completed')
    }

    const closeRecordDialog = () => {
        if (submitting) return
        setSelectedActionRow(null)
    }

    const openDetailDialog = (row: Record<string, unknown>) => {
        setDetailRow(row)
    }

    const closeDetailDialog = () => {
        setDetailRow(null)
    }

    const dialogTitle = useMemo(() => dialogMode === 'REJECT' ? 'Reject GPR C Step' : 'Approve GPR C Step', [dialogMode])

    const handleSubmit = async () => {
        if (!selectedRow || !empCode) return

        const requestId = getRequestId(selectedRow)
        if (!requestId) {
            ToastMessageError({ title: 'GPR C Approval', message: 'Missing request id' })
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
                ToastMessageError({ title: 'GPR C Approval', message: payload.Message || 'GPR C action failed' })
                return
            }

            ToastMessageSuccess({ title: 'GPR C Approval', message: payload.Message || 'GPR C action completed' })
            setSelectedRow(null)
            refreshAllGrids()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'GPR C action failed'
            ToastMessageError({ title: 'GPR C Approval', message })
        } finally {
            setSubmitting(false)
        }
    }

    const handleRecordResult = async () => {
        if (!selectedActionRow || !empCode) return

        const actionRequiredId = Number(selectedActionRow.REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID || 0)
        if (!actionRequiredId) {
            ToastMessageError({ title: 'Record Action Required Result', message: 'Missing action required id' })
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
                ToastMessageError({ title: 'Record Action Required Result', message: payload.Message || 'Failed to record result' })
                return
            }

            ToastMessageSuccess({ title: 'Record Action Required Result', message: payload.Message || 'Result recorded' })
            setSelectedActionRow(null)
            refreshAllGrids()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to record result'
            ToastMessageError({ title: 'Record Action Required Result', message })
        } finally {
            setSubmitting(false)
        }
    }

    const approvalColumnDefs = useMemo<ColDef<GprCQueueRow>[]>(() => [
        {
            headerName: 'Action',
            field: 'action',
            width: 110,
            pinned: 'left',
            lockPinned: true,
            suppressMovable: true,
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
            pinned: 'left',
            lockPinned: true,
            suppressMovable: true,
            filter: 'agTextColumnFilter',
            valueGetter: params => params.data?.request_number || `REQ-${getRequestId(params.data || {})}`,
        },
        {
            headerName: 'Vendor',
            field: 'company_name',
            minWidth: 220,
            flex: 1,
            filter: 'agTextColumnFilter',
            valueGetter: params => params.data?.company_name || '-',
        },
        {
            headerName: 'Step',
            field: 'STEP_NAME',
            minWidth: 220,
            filter: 'agTextColumnFilter',
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
            filter: false,
            valueGetter: params => [params.data?.supportProduct_Process, params.data?.purchase_frequency].filter(Boolean).join(' / ') || '-',
        },
        {
            headerName: 'Status',
            field: 'request_status',
            minWidth: 150,
            filter: 'agTextColumnFilter',
            cellRenderer: (params: ICellRendererParams<GprCQueueRow>) => (
                <Box
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        maxWidth: '100%',
                        px: 1.25,
                        py: 0.35,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        bgcolor: 'transparent',
                    }}
                >
                    <Typography variant='caption' fontWeight={700} color='text.secondary' noWrap>
                        {params.data?.request_status || 'In Progress'}
                    </Typography>
                </Box>
            ),
        },
    ], [])

    const actionRequiredColumnDefs = useMemo<ColDef<GprCActionRequiredRow>[]>(() => [
        {
            headerName: 'Action',
            field: 'action',
            minWidth: 290,
            pinned: 'left',
            lockPinned: true,
            suppressMovable: true,
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
            pinned: 'left',
            lockPinned: true,
            suppressMovable: true,
            filter: 'agTextColumnFilter',
            valueGetter: params => params.data?.request_number || `REQ-${params.data?.REQUEST_REGISTER_VENDOR_ID || ''}`,
        },
        { headerName: 'Vendor', field: 'company_name', minWidth: 220, flex: 1, filter: 'agTextColumnFilter' },
        {
            headerName: 'Stage',
            field: 'STAGE_NAME',
            minWidth: 180,
            filter: 'agTextColumnFilter',
            valueGetter: params => params.data?.STAGE_NAME || params.data?.STAGE_CODE || '-',
        },
        {
            headerName: 'Required Detail',
            field: 'REQUIRED_DETAIL',
            minWidth: 260,
            flex: 1,
            filter: 'agTextColumnFilter',
            valueGetter: params => params.data?.REQUIRED_DETAIL || '-',
        },
        {
            headerName: 'Status',
            field: 'RESULT_STATUS',
            minWidth: 140,
            filter: 'agTextColumnFilter',
            cellRenderer: (params: ICellRendererParams<GprCActionRequiredRow>) => (
                <Box
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        maxWidth: '100%',
                        px: 1.25,
                        py: 0.35,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        bgcolor: 'transparent',
                    }}
                >
                    <Typography variant='caption' fontWeight={700} color='text.secondary' noWrap>
                        {String(params.data?.RESULT_STATUS || 'pending').toUpperCase()}
                    </Typography>
                </Box>
            ),
        },
    ], [])

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
                                    {actionRequiredTotalCount}
                                </Box>
                            }
                            onClick={() => setActionResultDialogOpen(true)}
                        >
                            Action Required Results
                        </Button>
                    </Box>
                    <DxAGgridTable
                        columnDefs={approvalColumnDefs}
                        serverSideDatasource={approvalDatasource}
                        height={560}
                        getRowId={(params: GetRowIdParams<GprCQueueRow>) => String(params.data.REQUEST_VENDOR_GPR_C_STEPS_ID || params.data.REQUEST_VENDOR_GPR_C_FLOWS_ID || getRequestId(params.data))}
                        rowHeight={64}
                        overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No GPR C approval task found.</span>'
                        initialState={savedGridState}
                        onStateUpdated={handleStateUpdated}
                        onGridReady={handleGridReady}
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
                    refreshAllGrids()
                }}
                onError={message => ToastMessageError({ title: 'Action Required', message })}
            />

            <RequestDetailDialog
                open={detailDialogOpen}
                requestId={detailRow ? Number(detailRow.REQUEST_REGISTER_VENDOR_ID || detailRow.request_id || 0) : null}
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
                        <Chip size='small' label={actionRequiredTotalCount} color='warning' variant='tonal' />
                    </Stack>
                </DialogTitle>
                <DialogContent dividers>
                    <DxAGgridTable
                        columnDefs={actionRequiredColumnDefs}
                        serverSideDatasource={actionRequiredDatasource}
                        height={420}
                        getRowId={(params: GetRowIdParams<GprCActionRequiredRow>) => String(params.data.REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID || params.data.REQUEST_REGISTER_VENDOR_ID || '')}
                        overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No pending Action Required result.</span>'
                        initialState={actionRequiredInitialState}
                        onStateUpdated={handleActionRequiredStateUpdated}
                        onGridReady={handleActionRequiredGridReady}
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
                            <option value='completed'>Completed</option>
                            <option value='incomplete'>Incomplete</option>
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
