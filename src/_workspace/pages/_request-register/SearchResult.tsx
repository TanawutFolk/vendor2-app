// React Imports
import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { useFormContext } from 'react-hook-form'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'

// MUI Imports
import {
    Grid, CardContent, Box, Typography, Chip, CircularProgress,
    IconButton, Dialog, DialogTitle, DialogContent
} from '@mui/material'

// AG Grid Imports
import type { ColDef, IServerSideDatasource, IServerSideGetRowsParams, ICellRendererParams, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community'
import DxAGgridTable from '@/_template/DxAGgridTable'

// Template / hooks
import { useDxContext } from '@/_template/DxContextProvider'
import useDxServerSideGrid from '@_workspace/hooks/useDxServerSideGrid'

// Components
import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import SearchResultCard from '@_workspace/components/search/SearchResultCard'
import ActionDialog from './components/ActionDialog'
import DetailPanel from './components/DetailPanel'
import { Transition, buildFileUrls } from './components/shared'

// Services
import ApprovalQueueServices from '@_workspace/services/_approval-queue/ApprovalQueueServices'
import { requestDetailQueryOptions, REQUEST_DETAIL_QUERY_KEY } from '@_workspace/react-query/hooks/useRegisterRequest'

// Utils
import { getUserData } from '@/utils/user-profile/userLoginProfile'

// Types & Schema
import type { RequestRegisterFormData } from './validateSchema'
import type { RegisterRequestRow } from '@_workspace/types/_request-register/RequestRegisterTypes'

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

const loadRequestDetail = async (row: any, queryClient: QueryClient): Promise<RegisterRequestRow | null> => {
    const requestId = getRequestIdFromRow(row)
    if (!requestId) return row ?? null

    try {
        return (await queryClient.fetchQuery(requestDetailQueryOptions(requestId))) as RegisterRequestRow
    } catch {
        return row ?? null
    }
}

// --- Detail renderer for AG Grid master/detail ---
const DetailRenderer = (props: any) => {
    const queryClient = useQueryClient()
    const [detailData, setDetailData] = useState<RegisterRequestRow | null>(() => {
        const row = props.data ?? null
        return row && hasFullRequestDetail(row) ? row : null
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        let active = true
        const row = props.data ?? null

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
                console.error('Load request detail failed:', error)
                if (active) setDetailData(row)
            })
            .finally(() => {
                if (active) setLoading(false)
            })

        return () => {
            active = false
        }
    }, [props.data])

    if (loading && !hasFullRequestDetail(detailData)) return <DetailLoading />
    if (!detailData) return null

    return (
        <DetailPanel
            data={detailData}
            onApprove={(status: string, finalStep: boolean, actionLabel: string) => props.context.onApprove(detailData, status, finalStep, actionLabel)}
            onReject={(rejectActionLabel: string, status?: string, finalStep?: boolean) => props.context.onReject(detailData, rejectActionLabel, status, finalStep)}
            onEmailSent={(data?: RegisterRequestRow) => props.context.onEmailSent(data || detailData)}
            onCompleted={() => props.context.onCompleted()}
        />
    )
}


export default function SearchResult() {
    const queryClient = useQueryClient()
    const { getValues, setValue } = useFormContext<RequestRegisterFormData>()
    const { isEnableFetching, setIsEnableFetching } = useDxContext()

    const gridApiRef = useRef<any>(null)
    const { savedGridState, handleGridReady, handleStateUpdated, refreshServerSide } = useDxServerSideGrid({
        getValues,
        setValue,
        isEnableFetching,
        setIsEnableFetching,
        lockedLeftColIds: ['view', 'request_number']
    })

    // Action dialog & Drawer state
    // The modal subscribes to the request detail via react-query (single source of truth), so an
    // invalidate after an action auto-refetches and re-renders it in place (grid is refreshed
    // separately via refreshServerSide since AG Grid SSRM is not a react-query consumer).
    const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const detailQuery = useQuery({
        ...requestDetailQueryOptions(selectedRequestId ?? 0),
        enabled: drawerOpen && !!selectedRequestId,
    })
    const selectedData = (detailQuery.data ?? null) as RegisterRequestRow | null

    // Approve/Reject Action Dialog state
    const [actionMode, setActionMode] = useState<'approve' | 'reject'>('approve')
    const [actionDialogOpen, setActionDialogOpen] = useState(false)
    const [nextStatus, setNextStatus] = useState('')
    const [isFinalStep, setIsFinalStep] = useState(false)
    const [approveActionLabel, setApproveActionLabel] = useState('Approve')
    const [rejectActionLabel, setRejectActionLabel] = useState('Reject')

    const user = getUserData()
    const empCode = user?.EMPLOYEE_CODE

    // Ã¢â€â‚¬Ã¢â€â‚¬ Server-Side Datasource Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    const datasource = useMemo<IServerSideDatasource>(() => ({
        getRows: async (params: IServerSideGetRowsParams) => {
            const f = getValues('searchFilters')
            const { startRow, endRow } = params.request
            const limit = (endRow ?? 50) - (startRow ?? 0)
            const order = params.request.sortModel?.length > 0
                ? params.request.sortModel.map((s: any) => ({ id: s.colId, desc: s.sort === 'desc' }))
                : [{ id: 'REQUEST_REGISTER_VENDOR_ID', desc: true }]
            try {
                const res = await ApprovalQueueServices.getAll({
                    ASSIGN_TO: empCode,
                    APPROVER_EMPCODE: empCode,
                    SEARCHFILTERS: [
                        { id: 'COMPANY_NAME', value: f.vendor_name || null },
                        { id: 'REQUEST_BY_EMPLOYEECODE', value: f.submitted_by || null },
                        { id: 'REQUEST_STATUS', value: f.overall_status?.value || null }
                    ].filter((x: any) => x.value !== null && x.value !== ''),
                    COLUMNFILTERS: [],
                    ORDER: order,
                    START: startRow ?? 0,
                    LIMIT: limit
                })
                if (res.data?.Status) {
                    const rowData = res.data.ResultOnDb || []
                    // A block shorter than requested means the data ran out; clamp rowCount
                    // to what actually exists so the grid never re-requests missing rows.
                    const totalCount = Number(res.data.TotalCountOnDb) || 0
                    const rowCount = rowData.length < limit ? (startRow ?? 0) + rowData.length : totalCount
                    params.success({ rowData, rowCount })
                } else {
                    params.fail()
                }
            } catch {
                params.fail()
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [empCode]) // getValues is a stable ref Ã¢â‚¬â€ no need to re-create datasource

    // Trigger refresh when Search / Clear button sets isEnableFetching = true

    // Ã¢â€â‚¬Ã¢â€â‚¬ Column / Grid State Persistence Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

    const openDetailDialog = useCallback((row?: RegisterRequestRow | null) => {
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
            cellRenderer: (params: ICellRendererParams<RegisterRequestRow>) => (
                <IconButton
                    size='small'
                    color='primary'
                    onClick={() => openDetailDialog(params.data ?? null)}
                >
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
            valueGetter: (p: ValueGetterParams<RegisterRequestRow>) => p.data?.REQUEST_NUMBER || p.data?.REQUEST_REGISTER_VENDOR_ID || '-'
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
        { field: 'COMPANY_NAME', headerName: 'Company Name', flex: 1.5, minWidth: 210 },
        { field: 'SUPPORTPRODUCT_PROCESS', headerName: 'Support Product / Process', flex: 1, minWidth: 180 },
        { field: 'PURCHASE_FREQUENCY', headerName: 'Purchase Frequency', width: 170 },
        {
            field: 'FULL_NAME',
            headerName: 'Submitted By',
            flex: 1,
            minWidth: 170,
            valueGetter: (p: ValueGetterParams<RegisterRequestRow>) => p.data?.FULL_NAME || p.data?.EMPLOYEE_CODE || '-'
        },
        {
            field: 'DOCUMENTS_COUNT',
            headerName: 'Files',
            width: 100,
            cellRenderer: (params: ICellRendererParams<RegisterRequestRow>) => {
                const count = getDocumentCount(params.data)
                if (count === 0) return <Typography variant='caption' color='text.disabled'>Ã¢â‚¬â€</Typography>
                return (
                    <Chip label={`${count} file${count > 1 ? 's' : ''}`} size='small'
                        icon={<i className='tabler-paperclip' style={{ fontSize: 13, color: '#1976d2' }} />}
                        sx={{
                            bgcolor: '#1976d220',
                            color: '#1976d2',
                            border: '1px solid #1976d240',
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            height: 24,
                            '& .MuiChip-icon': { color: '#1976d2' }
                        }}
                    />
                )
            }
        },
        {
            field: 'CREATE_DATE',
            headerName: 'Submitted Date',
            width: 150,
            valueFormatter: (p: ValueFormatterParams<RegisterRequestRow>) => p.value ? new Date(String(p.value)).toLocaleDateString('th-TH') : '-'
        }
    ], [openDetailDialog])

    // Refresh the grid (AG Grid SSRM — not a react-query consumer) and invalidate the request
    // detail query so the modal, which subscribes to that query, refetches and re-renders in place.
    const refreshCurrentDetail = useCallback((sourceRow?: RegisterRequestRow | null) => {
        refreshServerSide()
        const requestId = getRequestIdFromRow(sourceRow) || selectedRequestId || 0
        if (!requestId) return
        void queryClient.invalidateQueries({ queryKey: [...REQUEST_DETAIL_QUERY_KEY, requestId] })
    }, [queryClient, refreshServerSide, selectedRequestId])

    const handleActionSuccess = () => {
        refreshCurrentDetail()
    }

    const gridContext = useMemo(() => ({
        onApprove: (data: any, status: string, finalStep: boolean, actionLabel: string) => {
            setSelectedRequestId(getRequestIdFromRow(data) || null)
            setNextStatus(status)
            setIsFinalStep(finalStep)
            setApproveActionLabel(actionLabel || 'Approve')
            setActionMode('approve')
            setActionDialogOpen(true)
        },
        onReject: (data: any, actionLabel: string, status = 'Rejected', finalStep = false) => {
            setSelectedRequestId(getRequestIdFromRow(data) || null)
            setNextStatus(status || 'Rejected')
            setIsFinalStep(finalStep)
            setApproveActionLabel('Approve')
            setRejectActionLabel(actionLabel || 'Reject')
            setActionMode('reject')
            setActionDialogOpen(true)
        },
        onEmailSent: (data?: RegisterRequestRow) => {
            refreshCurrentDetail(data)
        },
        onCompleted: () => {
            refreshServerSide()
            setDrawerOpen(false)
            setSelectedRequestId(null)
        }
    }), [refreshCurrentDetail, refreshServerSide])

    return (
        <Grid container spacing={6}>



            {/* AG Grid */}
            <Grid item xs={12}>
                <SearchResultCard>
                    <CardContent sx={{ p: '24px !important' }}>
                        <DxAGgridTable
                            columnDefs={colDefs}
                            serverSideDatasource={datasource}
                            height={600}
                            overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No assigned requests found</span>'
                            getRowId={(p: any) => String(p.data.REQUEST_REGISTER_VENDOR_ID ?? p.data.VENDORS_ID ?? p.rowIndex)}
                            onGridReady={(p: any) => {
                                handleGridReady(p)
                                gridApiRef.current = p.api
                            }}
                            initialState={savedGridState}
                            onStateUpdated={handleStateUpdated}
                            masterDetail={true}
                            detailCellRenderer={DetailRenderer}
                            detailRowHeight={850}
                            context={gridContext}
                        />
                    </CardContent>
                </SearchResultCard>
            </Grid>

            {/* Approve / Reject Dialog */}
            <ActionDialog
                open={actionDialogOpen}
                mode={actionMode}
                requestId={selectedRequestId}
                nextStatus={nextStatus}
                isFinalStep={isFinalStep}
                approveActionLabel={approveActionLabel}
                rejectActionLabel={rejectActionLabel}
                onClose={() => setActionDialogOpen(false)}
                onSuccess={handleActionSuccess}
            />

            {/* View Detail Dialog */}
            <Dialog
                maxWidth='lg'
                fullWidth={true}
                onClose={(event, reason) => {
                    if (reason !== 'backdropClick') {
                        setDrawerOpen(false)
                    }
                }}
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
                <DialogTitle sx={{ position: 'relative' }}>
                    <Typography variant='h5' component='span'>Request Details</Typography>
                    <Box sx={{ position: 'absolute', top: 14, right: 56, textAlign: 'right' }}>
                        <Typography variant='body2' fontWeight={700} color='text.secondary'>
                            {String(selectedData?.REQUEST_NUMBER || selectedRequestId || '-')}
                        </Typography>
                    </Box>
                    <DialogCloseButton onClick={() => setDrawerOpen(false)} disableRipple>
                        <i className='tabler-x' />
                    </DialogCloseButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0, bgcolor: 'background.default' }}>
                    {detailQuery.isLoading ? <DetailLoading /> : selectedData && <DetailRenderer data={selectedData} context={gridContext} />}
                </DialogContent>
            </Dialog>
        </Grid>
    )
}

