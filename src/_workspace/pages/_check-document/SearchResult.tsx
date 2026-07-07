// React Imports
import { useMemo, useState, useRef, useCallback, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'

// MUI Imports
import {
    Grid, Box, Typography, Chip, CircularProgress, IconButton, CardContent,
    Dialog, DialogTitle, DialogContent
} from '@mui/material'

// AG Grid Imports
import type { ColDef, IServerSideDatasource } from 'ag-grid-community'
import DxAGgridTable from '@/_template/DxAGgridTable'

// Template / hooks
import { useDxContext } from '@/_template/DxContextProvider'
import useDxServerSideGrid from '@_workspace/hooks/useDxServerSideGrid'

// Components
import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import SearchResultCard from '@_workspace/components/search/SearchResultCard'
import ActionDialog from './components/ActionDialog'
import DetailPanel from './components/DetailPanel'
import { Transition, buildFileUrls, getMyQueueStepStatus } from './components/shared'

// Services
import ApprovalQueueServices from '@_workspace/services/_approval-queue/ApprovalQueueServices'
import { requestDetailQueryOptions, REQUEST_DETAIL_QUERY_KEY } from '@_workspace/react-query/hooks/useRegisterRequest'

// Utils
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { getChipSx, getReadableStatusTone } from '@_workspace/utils/statusChipStyles'

// Types & Schema
import type { RequestRegisterFormData } from './validataeSchema'
import type { SearchResultSectionProps, ActionDialogProps, ApprovalPageContentProps } from '@_workspace/types/_check-document/CheckDocumentTypes'

// --- Grid section ---
const SearchResultSection = ({
    columnDefs,
    datasource,
    onGridReady,
    detailCellRenderer,
    detailRowHeight,
    context,
    initialState,
    onStateUpdated,
}: SearchResultSectionProps) => {
    return (
        <SearchResultCard
        >
            <CardContent sx={{ p: '24px !important' }}>
                <DxAGgridTable
                    columnDefs={columnDefs}
                    serverSideDatasource={datasource}
                    height={600}
                    overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No requests pending your approval</span>'
                    getRowId={(params: any) => String(params.data.REQUEST_REGISTER_VENDOR_ID ?? params.rowIndex)}
                    onGridReady={onGridReady}
                    initialState={initialState}
                    onStateUpdated={onStateUpdated}
                    masterDetail={true}
                    detailCellRenderer={detailCellRenderer}
                    detailRowHeight={detailRowHeight}
                    context={context}
                    rowSelection='single'
                />
            </CardContent>
        </SearchResultCard>
    )
}

const getRequestIdFromRow = (row: any) => Number(row?.REQUEST_REGISTER_VENDOR_ID ?? 0)

const hasFullRequestDetail = (row: any) => Boolean(
    row?.APPROVAL_STEPS || row?.APPROVAL_LOGS || row?.DOCUMENTS || row?.CONTACTS || row?.PRODUCTS || row?.GPR_CRITERIA
)

const getDocumentCount = (row: any) => {
    if (row?.DOCUMENTS_COUNT !== undefined) {
        return Number(row?.DOCUMENTS_COUNT) || 0
    }

    return buildFileUrls(row?.DOCUMENTS).length
}

const DetailLoading = () => (
    <Box sx={{ minHeight: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
        <CircularProgress size={22} />
        <Typography variant='body2' color='text.secondary'>Loading request details...</Typography>
    </Box>
)

const loadRequestDetail = async (row: any, queryClient: QueryClient) => {
    const requestId = getRequestIdFromRow(row)
    if (!requestId) return row || null

    try {
        return await queryClient.fetchQuery(requestDetailQueryOptions(requestId))
    } catch {
        return row || null
    }
}

// --- Detail renderer for AG Grid master/detail ---
const DetailRenderer = (props: any) => {
    const queryClient = useQueryClient()
    const [detailData, setDetailData] = useState<any | null>(() => hasFullRequestDetail(props.data) ? props.data : null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        let active = true
        const row = props.data || null

        if (!row) {
            setDetailData(null)
            return
        }

        if (hasFullRequestDetail(row)) {
            setDetailData(row)
            return
        }

        setDetailData(row)
        setLoading(true)
        loadRequestDetail(row, queryClient)
            .then(detail => {
                if (active) setDetailData(detail || row)
            })
            .catch(error => {
                console.error('Load approval request detail failed:', error)
                if (active) setDetailData(row)
            })
            .finally(() => {
                if (active) setLoading(false)
            })

        return () => {
            active = false
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.data])

    const refreshDetail = useCallback(async () => {
        if (!detailData) return
        try {
            await queryClient.invalidateQueries({ queryKey: [...REQUEST_DETAIL_QUERY_KEY, getRequestIdFromRow(detailData)] })
            const detail = await loadRequestDetail(detailData, queryClient)
            setDetailData(detail || detailData)
        } catch (error) {
            console.error('Refresh approval request detail failed:', error)
        }
    }, [detailData, queryClient])

    if (loading && !hasFullRequestDetail(detailData)) return <DetailLoading />
    if (!detailData) return null

    return (
        <DetailPanel
            data={detailData}
            empCode={props.context.empCode}
            queueStepCode={props.context.queueStepCode}
            showSelectionSheetReadOnly={props.context.showSelectionSheetReadOnly}
            onApprove={(status: string, finalStep: boolean, actionLabel: string) => props.context.onApprove(detailData, status, finalStep, actionLabel)}
            onReject={(rejectActionLabel: string) => props.context.onReject(detailData, rejectActionLabel)}
            onRefresh={() => props.context.onRefresh()}
            onDetailRefresh={refreshDetail}
        />
    )
}
export default function ApprovalPageContent({ pageTitle, queueStepCode, showSelectionSheetReadOnly = false }: ApprovalPageContentProps) {
    const queryClient = useQueryClient()
    const gridApiRef = useRef<any>(null)
    const { getValues, setValue } = useFormContext<RequestRegisterFormData>()
    const { isEnableFetching, setIsEnableFetching } = useDxContext()
    const { savedGridState, handleGridReady, handleStateUpdated, refreshServerSide } = useDxServerSideGrid({
        getValues,
        setValue,
        isEnableFetching,
        setIsEnableFetching,
        lockedLeftColIds: ['view', 'REQUEST_NUMBER']
    })

    // Modal subscribes to the request detail via react-query (single source of truth); the grid is
    // AG Grid SSRM and is refreshed separately via refreshServerSide.
    const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const detailQuery = useQuery({
        ...requestDetailQueryOptions(selectedRequestId ?? 0),
        enabled: drawerOpen && !!selectedRequestId,
    })
    const selectedData = (detailQuery.data ?? null) as any

    const [actionMode, setActionMode] = useState<'approve' | 'reject'>('approve')
    const [actionDialogOpen, setActionDialogOpen] = useState(false)
    const [pendingActions, setPendingActions] = useState<ActionDialogProps['actions']>([])
    const [approveActionLabel, setApproveActionLabel] = useState('Approve')
    const [rejectActionLabel, setRejectActionLabel] = useState('Reject')

    const user = getUserData()
    const empCode = user?.EMPLOYEE_CODE

    const datasource = useMemo<IServerSideDatasource>(() => ({
        getRows: async (params) => {
            if (!empCode) {
                params.success({ rowData: [], rowCount: 0 })
                return
            }
            const { startRow, endRow } = params.request
            const order = params.request.sortModel?.length > 0
                ? params.request.sortModel.map((s: any) => ({ id: s.colId, desc: s.sort === 'desc' }))
                : [{ id: 'REQUEST_REGISTER_VENDOR_ID', desc: true }]
            try {
                const res = await ApprovalQueueServices.getAll({
                    APPROVER_EMPCODE: empCode,
                    QUEUE_STEP_CODE: queueStepCode,
                    SEARCHFILTERS: [
                        { id: 'COMPANY_NAME', value: getValues('searchFilters.vendor_name') || null },
                        { id: 'REQUEST_BY_EMPLOYEECODE', value: getValues('searchFilters.submitted_by') || null },
                        { id: 'REQUEST_STATUS', value: getValues('searchFilters.overall_status')?.value || null }
                    ].filter((x: any) => x.value !== null && x.value !== ''),
                    COLUMNFILTERS: [],
                    ORDER: order,
                    START: startRow ?? 0,
                    LIMIT: (endRow ?? 50) - (startRow ?? 0)
                })
                if (res.data?.Status) {
                    // Option A: backend returns UPPER-cased column keys directly;
                    // the grid/detail/action-dialog read those keys as-is (no re-lowercasing).
                    const rowData = res.data.ResultOnDb || []
                    params.success({ rowData, rowCount: res.data.TotalCountOnDb })
                } else {
                    params.fail()
                }
            } catch {
                params.fail()
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [empCode, queueStepCode])

    const openDetailDialog = useCallback((row?: any | null) => {
        setSelectedRequestId(getRequestIdFromRow(row) || null)
        setDrawerOpen(true)
    }, [])
    const colDefs = useMemo<ColDef[]>(() => [
        {
            headerName: '',
            field: 'view',
            width: 50,
            pinned: 'left',
            lockPinned: true,
            suppressMovable: true,
            cellRenderer: (params: any) => (
                <IconButton size='small' color='primary' onClick={() => openDetailDialog(params.data)} >
                    <i className='tabler-eye' style={{ fontSize: 18 }} />
                </IconButton>
            )
        },
        {
            field: 'REQUEST_NUMBER',
            headerName: 'Request Number',
            width: 170,
            pinned: 'left',
            lockPinned: true,
            suppressMovable: true,
            valueGetter: params => params.data?.REQUEST_NUMBER || params.data?.REQUEST_REGISTER_VENDOR_ID || '-'
        },
        {
            field: 'REQUEST_STATUS',
            headerName: 'Status',
            flex: 1.2,
            minWidth: 230,
            cellRenderer: 'agGroupCellRenderer',
            cellRendererParams: {
                innerRenderer: (params: any) => {
                    return (
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
                                {params.value || '-'}
                            </Typography>
                        </Box>
                    )
                }
            }
        },
        {
            field: 'my_approval_status',
            headerName: 'My Approval',
            width: 150,
            sortable: false,
            filter: false,
            cellRenderer: (params: any) => {
                const myStepStatus = getMyQueueStepStatus(params.data, empCode, queueStepCode)

                if (myStepStatus === 'approved') {
                    return <Chip label='Approved' size='small' sx={getChipSx(getReadableStatusTone('approved'))} />
                }

                if (myStepStatus === 'rejected') {
                    return <Chip label='Rejected' size='small' sx={getChipSx(getReadableStatusTone('rejected'))} />
                }

                return <Chip label='Waiting' size='small' sx={getChipSx(getReadableStatusTone('waiting'))} />
            }
        },
        { field: 'COMPANY_NAME', headerName: 'Company Name', flex: 1.5, minWidth: 210 },
        { field: 'SUPPORTPRODUCT_PROCESS', headerName: 'Support Product / Process', flex: 1, minWidth: 180 },
        { field: 'PURCHASE_FREQUENCY', headerName: 'Purchase Frequency', width: 170 },
        {
            field: 'FULL_NAME',
            headerName: 'Submitted By',
            flex: 1,
            minWidth: 170,
            valueGetter: (p: any) => p.data?.FULL_NAME || p.data?.EMPLOYEE_CODE || '-'
        },
        {
            field: 'DOCUMENTS_COUNT',
            headerName: 'Files',
            width: 100,
            cellRenderer: (params: any) => {
                const count = getDocumentCount(params.data)
                if (count === 0) return <Typography variant='caption' color='text.disabled'>-</Typography>
                return (
                    <Chip label={`${count} file${count > 1 ? 's' : ''}`} size='small' icon={<i className='tabler-paperclip' style={{ fontSize: 13, color: '#1976d2' }} />} sx={{ bgcolor: '#1976d220', color: '#1976d2', border: '1px solid #1976d240', fontWeight: 700, fontSize: '0.72rem', height: 24, '& .MuiChip-icon': { color: '#1976d2' } }} />
                )
            }
        },
        {
            field: 'CREATE_DATE',
            headerName: 'Submitted Date',
            width: 150,
            valueFormatter: (p: any) => p.value ? new Date(p.value).toLocaleDateString('th-TH') : '-'
        }
    ], [empCode, queueStepCode, openDetailDialog])

    const handleActionSuccess = useCallback(() => {
        refreshServerSide()
        if (selectedRequestId) void queryClient.invalidateQueries({ queryKey: [...REQUEST_DETAIL_QUERY_KEY, selectedRequestId] })
        setDrawerOpen(false)
        setSelectedRequestId(null)
        setPendingActions([])
    }, [refreshServerSide, queryClient, selectedRequestId])

    const gridContext = useMemo(() => ({
        empCode,
        queueStepCode,
        showSelectionSheetReadOnly,
        onApprove: (data: any, status: string, finalStep: boolean, actionLabel: string) => {
            setSelectedRequestId(getRequestIdFromRow(data) || null)
            setPendingActions([{
                requestId: Number(data?.REQUEST_REGISTER_VENDOR_ID),
                nextStatus: status,
                isFinalStep: finalStep,
                approveActionLabel: actionLabel,
            }])
            setApproveActionLabel(actionLabel || 'Approve')
            setActionMode('approve')
            setActionDialogOpen(true)
        },
        onReject: (data: any, actionLabel: string) => {
            setSelectedRequestId(getRequestIdFromRow(data) || null)
            setPendingActions([{
                requestId: Number(data?.REQUEST_REGISTER_VENDOR_ID),
                nextStatus: 'Rejected',
                isFinalStep: false,
                rejectActionLabel: actionLabel,
            }])
            setApproveActionLabel('Approve')
            setRejectActionLabel(actionLabel || 'Reject')
            setActionMode('reject')
            setActionDialogOpen(true)
        },
        onRefresh: handleActionSuccess
    }), [empCode, queueStepCode, showSelectionSheetReadOnly, handleActionSuccess])

    const searchResultDataItem = useMemo(() => ({
        columnDefs: colDefs,
        datasource,
        onGridReady: (params: any) => {
            handleGridReady(params)
            gridApiRef.current = params.api
        },
        detailCellRenderer: DetailRenderer,
        detailRowHeight: 800,
        context: gridContext,
        initialState: savedGridState,
        onStateUpdated: handleStateUpdated,
    }), [colDefs, datasource, gridContext, handleGridReady, handleStateUpdated, savedGridState])

    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <SearchResultSection {...searchResultDataItem} />
            </Grid>

            <ActionDialog
                open={actionDialogOpen}
                mode={actionMode}
                actions={pendingActions}
                approveActionLabel={approveActionLabel}
                rejectActionLabel={rejectActionLabel}
                onClose={() => setActionDialogOpen(false)}
                onSuccess={handleActionSuccess}
            />

            <Dialog
                maxWidth='lg'
                fullWidth={true}
                onClose={(event, reason) => { if (reason !== 'backdropClick') setDrawerOpen(false) }}
                TransitionComponent={Transition}
                open={drawerOpen}
                scroll='paper'
                sx={{
                    '& .MuiDialog-paper': {
                        overflow: 'visible',
                        width: { xs: 'calc(100vw - 16px)', sm: 'calc(100vw - 32px)', lg: '1100px' },
                        maxWidth: '1100px',
                    },
                    '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
                }}
            >
                <DialogTitle>
                    <Typography variant='h5' component='span'>{pageTitle} Details</Typography>
                    <DialogCloseButton onClick={() => setDrawerOpen(false)} disableRipple>
                        <i className='tabler-x' />
                    </DialogCloseButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0, bgcolor: 'background.default' }}>
                    {detailQuery.isLoading ? <DetailLoading /> : selectedData && <DetailRenderer data={selectedData} context={{ ...gridContext, empCode }} />}
                </DialogContent>
            </Dialog>
        </Grid>
    )
}
