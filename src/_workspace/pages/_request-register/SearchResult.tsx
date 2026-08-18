// React Imports
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'

// MUI Imports
import {
  Grid,
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
  Chip,
  CircularProgress,
  IconButton
} from '@mui/material'

// AG Grid Imports
import type {
  ColDef,
  IServerSideDatasource,
  IServerSideGetRowsRequest,
  IServerSideGetRowsParams,
  ICellRendererParams,
  ValueFormatterParams,
  ValueGetterParams
} from 'ag-grid-community'
import DxAGgridTable from '@/_template/DxAGgridTable'
import { useDxContext } from '@/_template/DxContextProvider'

// Components Imports
import useDxServerSideGrid from '@/_workspace/hooks/useDxServerSideGrid'

import ActionDialog from './modal/ActionDialog'
import RequestDetailDialog from './modal/RequestDetailDialog'
import DetailPanel from './components/DetailPanel'
import { buildFileUrls } from './components/shared'

// Services
import ApprovalQueueServices from '@/_workspace/services/_approval-queue/ApprovalQueueServices'
import { requestDetailQueryOptions, REQUEST_DETAIL_QUERY_KEY } from '@/_workspace/react-query/hooks/useRegisterRequest'

// Utils
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { buildRequestStatusFilter } from '@/_workspace/utils/requestStatusFilter'
import { getAllowedWorkflowTransitionId } from '@/_workspace/utils/requestWorkflow'
import { ToastMessageError } from '@/components/ToastMessage'

// Types
import type { FormDataPage } from './validationSchema'
import type { RegisterRequestRow, WorkflowActionCode } from '@/_workspace/types/_request-register/RequestRegisterTypes'

const getRequestIdFromRow = (row: any) => Number(row?.REQUEST_REGISTER_VENDOR_ID ?? 0)

const hasFullRequestDetail = (row: any) =>
  Boolean(
    row?.APPROVAL_STEPS || row?.APPROVAL_LOGS || row?.DOCUMENTS || row?.CONTACTS || row?.PRODUCTS || row?.GPR_CRITERIA
  )

const getDocumentCount = (row: any) => {
  if (row?.DOCUMENTS_COUNT !== undefined) {
    return Number(row?.DOCUMENTS_COUNT) || 0
  }

  return buildFileUrls(row?.DOCUMENTS).length
}

const buildParamForSearch = (
  filters: FormDataPage['searchFilters'],
  request: IServerSideGetRowsRequest,
  empCode?: string
) => {
  const { startRow, endRow, sortModel } = request
  const limit = (endRow ?? 50) - (startRow ?? 0)

  return {
    ASSIGN_TO: empCode,
    APPROVER_EMPCODE: empCode,
    SEARCHFILTERS: [
      { id: 'COMPANY_NAME', value: filters.vendorName || null },
      { id: 'REQUEST_BY_EMPLOYEECODE', value: filters.submittedBy || null },
      buildRequestStatusFilter(filters.overallStatus)
    ].filter(item => item.value !== null && item.value !== ''),
    COLUMNFILTERS: [],
    ORDER: sortModel?.length
      ? sortModel.map(item => ({ id: item.colId, desc: item.sort === 'desc' }))
      : [{ id: 'REQUEST_REGISTER_VENDOR_ID', desc: true }],
    START: startRow ?? 0,
    LIMIT: limit
  }
}

const DetailLoading = () => (
  <Box sx={{ minHeight: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
    <CircularProgress size={22} />
    <Typography variant='body2' color='text.secondary'>
      Loading request details...
    </Typography>
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
  }, [props.data, queryClient])

  if (loading && !hasFullRequestDetail(detailData)) return <DetailLoading />
  if (!detailData) return null

  return (
    <DetailPanel
      data={detailData}
      onApprove={(actionCode: WorkflowActionCode, actionLabel: string) =>
        props.context.onApprove(detailData, actionCode, actionLabel)
      }
      onReject={(rejectActionLabel: string, actionCode?: 'DISAGREE' | 'REJECT') =>
        props.context.onReject(detailData, rejectActionLabel, actionCode)
      }
      onEmailSent={(data?: RegisterRequestRow) => props.context.onEmailSent(data || detailData)}
      onCompleted={() => props.context.onCompleted()}
    />
  )
}

export default function SearchResult() {
  // Context
  const { isEnableFetching, setIsEnableFetching } = useDxContext()

  const queryClient = useQueryClient()
  const { getValues, setValue } = useFormContext<FormDataPage>()

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
  // Approve/Reject Action Dialog state
  const [actionMode, setActionMode] = useState<'approve' | 'reject'>('approve')
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [workflowTransitionId, setWorkflowTransitionId] = useState(0)
  const [currentTaskId, setCurrentTaskId] = useState(0)
  const [lockVersion, setLockVersion] = useState(0)
  const [approveActionLabel, setApproveActionLabel] = useState('Approve')
  const [rejectActionLabel, setRejectActionLabel] = useState('Reject')

  const user = getUserData()
  const empCode = user?.EMPLOYEE_CODE

  // ── Server-Side Datasource ────────────────────────────────────────────────
  const datasource = useMemo<IServerSideDatasource>(
    () => ({
      getRows: async (params: IServerSideGetRowsParams) => {
        try {
          const payload = buildParamForSearch(getValues('searchFilters'), params.request, empCode)
          const res = await ApprovalQueueServices.getAll(payload)
          if (res.data?.Status) {
            const rowData = res.data.ResultOnDb || []
            // A block shorter than requested means the data ran out; clamp rowCount
            // to what actually exists so the grid never re-requests missing rows.
            const totalCount = Number(res.data.TotalCountOnDb) || 0
            const rowCount = rowData.length < payload.LIMIT ? payload.START + rowData.length : totalCount
            params.success({ rowData, rowCount })
          } else {
            params.fail()
          }
        } catch {
          params.fail()
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }),
    [empCode, getValues]
  ) // getValues is a stable ref — no need to re-create datasource

  // Trigger refresh when Search / Clear button sets isEnableFetching = true

  // ── Column / Grid State Persistence ──────────────────────────────────────

  const openDetailDialog = useCallback((row?: RegisterRequestRow | null) => {
    setSelectedRequestId(getRequestIdFromRow(row) || null)
    setDrawerOpen(true)
  }, [])
  const colDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: '',
        field: 'view',
        width: 50,
        pinned: 'left',
        lockPinned: true,
        suppressMovable: true,
        cellRenderer: (params: ICellRendererParams<RegisterRequestRow>) => (
          <IconButton size='small' color='primary' onClick={() => openDetailDialog(params.data ?? null)}>
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
        valueGetter: (p: ValueGetterParams<RegisterRequestRow>) =>
          p.data?.REQUEST_NUMBER || p.data?.REQUEST_REGISTER_VENDOR_ID || '-'
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
                  bgcolor: 'transparent'
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
          if (count === 0)
            return (
              <Typography variant='caption' color='text.disabled'>
                —
              </Typography>
            )
          return (
            <Chip
              label={`${count} file${count > 1 ? 's' : ''}`}
              size='small'
              color='info'
              variant='tonal'
              icon={<i className='tabler-paperclip' style={{ fontSize: 13 }} />}
              sx={{
                fontWeight: 700,
                fontSize: '0.72rem',
                height: 24,
                '& .MuiChip-icon': { color: 'inherit' }
              }}
            />
          )
        }
      },
      {
        field: 'CREATE_DATE',
        headerName: 'Submitted Date',
        width: 150,
        valueFormatter: (p: ValueFormatterParams<RegisterRequestRow>) =>
          p.value ? new Date(String(p.value)).toLocaleDateString('th-TH') : '-'
      }
    ],
    [openDetailDialog]
  )

  // Refresh the grid (AG Grid SSRM — not a react-query consumer) and invalidate the request
  // detail query so the modal, which subscribes to that query, refetches and re-renders in place.
  const refreshCurrentDetail = useCallback(
    (sourceRow?: RegisterRequestRow | null) => {
      refreshServerSide()
      const requestId = getRequestIdFromRow(sourceRow) || selectedRequestId || 0
      if (!requestId) return
      void queryClient.invalidateQueries({ queryKey: [...REQUEST_DETAIL_QUERY_KEY, requestId] })
    },
    [queryClient, refreshServerSide, selectedRequestId]
  )

  const handleActionSuccess = () => {
    refreshCurrentDetail()
  }

  const gridContext = useMemo(
    () => ({
      onApprove: (data: any, requestedActionCode: 'APPROVE' | 'DISAGREE' | 'ACTION_REQUIRED', actionLabel: string) => {
        const transitionId = getAllowedWorkflowTransitionId(data?.ALLOWED_ACTIONS, requestedActionCode)
        if (!transitionId) {
          ToastMessageError({ title: 'Workflow Action', message: 'This action is no longer available. Please refresh.' })
          return
        }
        setSelectedRequestId(getRequestIdFromRow(data) || null)
        setCurrentTaskId(Number(data?.CURRENT_REQUEST_APPROVAL_STEP_ID || 0))
        setLockVersion(Number(data?.LOCK_VERSION || 0))
        setWorkflowTransitionId(transitionId)
        setApproveActionLabel(actionLabel || 'Approve')
        setActionMode('approve')
        setActionDialogOpen(true)
      },
      onReject: (data: any, actionLabel: string, requestedActionCode: 'DISAGREE' | 'REJECT' = 'REJECT') => {
        const transitionId = getAllowedWorkflowTransitionId(data?.ALLOWED_ACTIONS, requestedActionCode)
        if (!transitionId) {
          ToastMessageError({ title: 'Workflow Action', message: 'This action is no longer available. Please refresh.' })
          return
        }
        setSelectedRequestId(getRequestIdFromRow(data) || null)
        setCurrentTaskId(Number(data?.CURRENT_REQUEST_APPROVAL_STEP_ID || 0))
        setLockVersion(Number(data?.LOCK_VERSION || 0))
        setWorkflowTransitionId(transitionId)
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
    }),
    [refreshCurrentDetail, refreshServerSide]
  )

  return (
    <Grid container spacing={6}>
      {/* AG Grid */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Search Result' titleTypographyProps={{ variant: 'h5' }} />
          <CardContent sx={{ p: '24px !important' }}>
            <DxAGgridTable
              columnDefs={colDefs}
              serverSideDatasource={datasource}
              height={600}
              overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No assigned requests found</span>'
              getRowId={(p: any) => String(p.data.REQUEST_REGISTER_VENDOR_ID ?? p.data.VENDORS_ID ?? p.rowIndex)}
              onGridReady={handleGridReady}
              initialState={savedGridState}
              onStateUpdated={handleStateUpdated}
              masterDetail={true}
              detailCellRenderer={DetailRenderer}
              detailRowHeight={850}
              context={gridContext}
            />
          </CardContent>
        </Card>
      </Grid>

      <RequestDetailDialog
        open={drawerOpen}
        requestId={selectedRequestId}
        context={gridContext}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Approve / Reject Dialog: render after details so its portal is the top modal layer. */}
      <ActionDialog
        open={actionDialogOpen}
        mode={actionMode}
        requestId={selectedRequestId}
        currentTaskId={currentTaskId}
        lockVersion={lockVersion}
        workflowTransitionId={workflowTransitionId}
        approveActionLabel={approveActionLabel}
        rejectActionLabel={rejectActionLabel}
        onClose={() => setActionDialogOpen(false)}
        onSuccess={handleActionSuccess}
      />
    </Grid>
  )
}
