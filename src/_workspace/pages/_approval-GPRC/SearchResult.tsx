import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
    Box,
    Button,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
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
import ConfirmActionDialog from './modal/ConfirmActionDialog'
import RequestDetailDialog from './modal/RequestDetailDialog'
import useDxServerSideGrid, { enforceLockedLeftColumns } from '@_workspace/hooks/useDxServerSideGrid'

export type GprCQueueRow = {
    REQUEST_REGISTER_VENDOR_ID?: number
    REQUEST_NUMBER?: string
    REQUEST_STATUS?: string
    REQUEST_STATE?: string
    REQUEST_VENDOR_GPR_C_FLOWS_ID?: number
    REQUEST_VENDOR_GPR_C_STEPS_ID?: number
    STEP_CODE?: string
    STEP_NAME?: string
    STEP_ORDER?: number
    APPROVER_EMPCODE?: string
    APPROVER_NAME?: string
    STEP_STATUS?: string
    COMPANY_NAME?: string
    CONTACT_NAME?: string
    VENDOR_EMAIL?: string
    SUPPORTPRODUCT_PROCESS?: string
    PURCHASE_FREQUENCY?: string
    ADDRESS?: string
    VENDOR_REGION?: string
    TEL_PHONE?: string
    [key: string]: unknown
}

export type GprCActionRequiredRow = {
    REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID?: number
    REQUEST_REGISTER_VENDOR_ID?: number
    STAGE_NAME?: string
    STAGE_CODE?: string
    REQUIRED_DETAIL?: string
    RESULT_STATUS?: string
    REQUEST_NUMBER?: string
    REQUEST_STATUS?: string
    REQUEST_STATE?: string
    COMPANY_NAME?: string
    [key: string]: unknown
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
    'REQUESTER_APPROVER',
    'EMR_CHECKER',
    'EMR_APPROVER',
    'QMS_CHECKER',
    'QMS_APPROVER',
    'PM_MANAGER_APPROVER',
])

const getRequestId = (row: GprCQueueRow) => Number(row.REQUEST_REGISTER_VENDOR_ID || 0)

const mapAgGridFilterModelToColumnFilters = (filterModel: Record<string, AgGridFilterModelValue>): AgGridColumnFilter[] => {
    const columnFilters = Object.entries(filterModel || {}).flatMap<AgGridColumnFilter>(([id, model]): AgGridColumnFilter[] => {
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
    })

    return columnFilters.filter(item => Array.isArray(item.value) ? item.value.length > 0 : String(item.value || '').trim().length > 0)
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
    const detailCanAction = Boolean(detailRow && (
        detailRow.REQUEST_VENDOR_GPR_C_STEPS_ID
        || detailRow.REQUEST_VENDOR_GPR_C_FLOWS_ID
        || detailRow.STEP_CODE
        || detailRow.STEP_NAME
    ))
    const detailCanActionRequired = Boolean(
        detailCanAction
        && detailRow
        && actionRequiredStepCodes.has(String(detailRow.STEP_CODE || '').toUpperCase())
    )

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
                PIC_EMAIL: userEmail,
                SEARCHFILTERS: buildSearchFilters(),
                COLUMNFILTERS: [],
                ORDER: [{ id: 'SENT_AT', desc: true }, { id: 'REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID', desc: true }],
                START: 0,
                LIMIT: 1,
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
                    APPROVER_EMPCODE: empCode,
                    SEARCHFILTERS: buildSearchFilters(),
                    COLUMNFILTERS: mapAgGridFilterModelToColumnFilters(filterModel as Record<string, AgGridFilterModelValue>),
                    ORDER: sortModel && sortModel.length > 0
                        ? sortModel.map((item: SortModelItem) => ({ id: item.colId, desc: item.sort === 'desc' }))
                        : [{ id: 'REQUEST_VENDOR_GPR_C_FLOWS_ID', desc: true }],
                    START: startRow ?? 0,
                    LIMIT: limit || 20,
                })
                const result = response.data

                if (result?.Status) {
                    const rowData = result.ResultOnDb || []
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
                    PIC_EMAIL: userEmail,
                    SEARCHFILTERS: buildSearchFilters(),
                    COLUMNFILTERS: mapAgGridFilterModelToColumnFilters(filterModel as Record<string, AgGridFilterModelValue>),
                    ORDER: sortModel && sortModel.length > 0
                        ? sortModel.map((item: SortModelItem) => ({ id: item.colId, desc: item.sort === 'desc' }))
                        : [{ id: 'SENT_AT', desc: true }, { id: 'REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID', desc: true }],
                    START: startRow ?? 0,
                    LIMIT: limit || 20,
                })
                const result = response.data

                if (result?.Status) {
                    const rowData = result.ResultOnDb || []
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
                REQUEST_REGISTER_VENDOR_ID: requestId,
                ACTION_BY: empCode,
                UPDATE_BY: empCode,
            }
            const response = dialogMode === 'REJECT'
                ? await RegisterRequestServices.gprCRejectStep({ ...basePayload, REMARK: remark })
                : await RegisterRequestServices.gprCApproveStep({ ...basePayload, REMARK: remark })

            const payload = response.data
            if (!payload.Status) {
                ToastMessageError({ title: 'GPR C Approval', message: payload.Message || 'GPR C action failed' })
                return
            }

            ToastMessageSuccess({ title: 'GPR C Approval', message: payload.Message || 'GPR C action completed' })
            setSelectedRow(null)
            setDetailRow(null)
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
                REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID: actionRequiredId,
                RESULT_STATUS: resultStatus,
                RESULT_REMARK: remark,
                RESULT_BY: empCode,
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
            headerName: '',
            field: 'action',
            width: 72,
            pinned: 'left',
            lockPinned: true,
            suppressMovable: true,
            sortable: false,
            filter: false,
            cellRenderer: (params: ICellRendererParams<GprCQueueRow>) => {
                const row = params.data
                if (!row) return null

                return (
                    <Tooltip title='View Details'>
                        <IconButton
                            size='small'
                            color='primary'
                            onClick={() => openDetailDialog(row)}
                        >
                            <i className='tabler-eye' style={{ fontSize: 20 }} />
                        </IconButton>
                    </Tooltip>
                )
            },
        },
        {
            headerName: 'Request Number',
            field: 'request_number',
            width: 170,
            pinned: 'left',
            lockPinned: true,
            suppressMovable: true,
            filter: 'agTextColumnFilter',
            valueGetter: params => params.data?.REQUEST_NUMBER || `REQ-${getRequestId(params.data || {})}`,
        },
        {
            headerName: 'Status',
            field: 'request_status',
            flex: 1.2,
            minWidth: 230,
            filter: 'agTextColumnFilter',
            cellRenderer: (params: ICellRendererParams<GprCQueueRow>) => (
                <Box
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        minHeight: 24,
                        px: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        bgcolor: 'transparent',
                    }}
                >
                    <Typography variant='body2' color='text.secondary' fontWeight={500}>
                        {params.data?.REQUEST_STATUS || 'In Progress'}
                    </Typography>
                </Box>
            ),
        },
        {
            headerName: 'Step',
            field: 'STEP_NAME',
            width: 200,
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
            headerName: 'Company Name',
            field: 'company_name',
            flex: 1.5,
            minWidth: 210,
            filter: 'agTextColumnFilter',
            valueGetter: params => params.data?.COMPANY_NAME || '-',
        },
        {
            headerName: 'Support Product / Process',
            field: 'SUPPORTPRODUCT_PROCESS',
            flex: 1,
            minWidth: 180,
            filter: false,
            valueGetter: params => params.data?.SUPPORTPRODUCT_PROCESS || '-',
        },
        {
            headerName: 'Purchase Frequency',
            field: 'PURCHASE_FREQUENCY',
            width: 170,
            filter: false,
            valueGetter: params => params.data?.PURCHASE_FREQUENCY || '-',
        },
        {
            headerName: 'Submitted By',
            field: 'REQUEST_BY_EMPLOYEECODE',
            flex: 1,
            minWidth: 170,
            filter: false,
            valueGetter: params => params.data?.REQUEST_BY_EMPLOYEECODE || '-',
        },
        {
            headerName: 'Submitted Date',
            field: 'REQUEST_CREATE_DATE',
            width: 150,
            filter: false,
            valueFormatter: params => params.value ? new Date(params.value).toLocaleDateString('th-TH') : '-',
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
            valueGetter: params => params.data?.REQUEST_NUMBER || `REQ-${params.data?.REQUEST_REGISTER_VENDOR_ID || ''}`,
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
            <SearchResultCard
                action={(
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
                )}
            >
                <CardContent sx={{ p: '24px !important' }}>
                    <DxAGgridTable
                        columnDefs={approvalColumnDefs}
                        serverSideDatasource={approvalDatasource}
                        height={600}
                        getRowId={(params: GetRowIdParams<GprCQueueRow>) => String(params.data.REQUEST_VENDOR_GPR_C_STEPS_ID || params.data.REQUEST_VENDOR_GPR_C_FLOWS_ID || getRequestId(params.data))}
                        overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No GPR C approval task found.</span>'
                        initialState={savedGridState}
                        onStateUpdated={handleStateUpdated}
                        onGridReady={handleGridReady}
                    />
                </CardContent>
            </SearchResultCard>

            <ConfirmActionDialog
                open={dialogOpen}
                mode={dialogMode}
                remark={remark}
                submitting={submitting}
                companyName={selectedRow?.COMPANY_NAME}
                onRemarkChange={setRemark}
                onConfirm={handleSubmit}
                onClose={closeDialog}
            />

            <ActionRequiredDialog
                open={actionRequiredDialogOpen}
                requestId={actionRequiredRow ? getRequestId(actionRequiredRow) : null}
                requestNumber={actionRequiredRow?.REQUEST_NUMBER}
                stepName={actionRequiredRow?.STEP_NAME || actionRequiredRow?.STEP_CODE}
                actionBy={empCode}
                updateBy={empCode}
                onClose={closeActionRequiredDialog}
                onSuccess={async () => {
                    setActionRequiredRow(null)
                    setDetailRow(null)
                    refreshAllGrids()
                }}
                onError={message => ToastMessageError({ title: 'Action Required', message })}
            />

            <RequestDetailDialog
                open={detailDialogOpen}
                requestId={detailRow ? Number(detailRow.REQUEST_REGISTER_VENDOR_ID || detailRow.request_id || 0) : null}
                fallbackRow={detailRow}
                actionDisabled={submitting}
                onApprove={detailCanAction && detailRow ? () => openDialog('APPROVE', detailRow as GprCQueueRow) : undefined}
                onReject={detailCanAction && detailRow ? () => openDialog('REJECT', detailRow as GprCQueueRow) : undefined}
                onActionRequired={detailCanAction && detailRow ? () => openActionRequiredDialog(detailRow as GprCQueueRow) : undefined}
                actionRequiredDisabled={!detailCanActionRequired}
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
