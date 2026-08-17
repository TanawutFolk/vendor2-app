// React Imports
import { useMemo, useState, useRef, useCallback, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'

// MUI Imports
import {
  Grid,
  Box,
  Typography,
  Card,
  CardHeader,
  Chip,
  CircularProgress,
  IconButton,
  CardContent
} from '@mui/material'

// AG Grid Imports
import type { ColDef, IServerSideDatasource, IServerSideGetRowsRequest } from 'ag-grid-community'
import DxAGgridTable from '@/_template/DxAGgridTable'

// Components Imports
import { useDxContext } from '@/_template/DxContextProvider'
import useDxServerSideGrid from '@/_workspace/hooks/useDxServerSideGrid'

import ActionDialog from '../modal/ActionDialog'
import RequestDetailDialog from '../modal/RequestDetailDialog'
import DetailPanel from './DetailPanel'
import { buildFileUrls, getMyQueueStepStatus } from './shared'

// Services
import ApprovalQueueServices from '@/_workspace/services/_approval-queue/ApprovalQueueServices'
import { requestDetailQueryOptions, REQUEST_DETAIL_QUERY_KEY } from '@/_workspace/react-query/hooks/useRegisterRequest'

// Utils
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { getChipSx, getReadableStatusTone } from '@/_workspace/utils/statusChipStyles'
import { buildRequestStatusFilter } from '@/_workspace/utils/requestStatusFilter'
import useWorkflowIdentity from '@/_workspace/hooks/useWorkflowIdentity'
import { getAllowedWorkflowTransitionId } from '@/_workspace/utils/requestWorkflow'
import { ToastMessageError } from '@/components/ToastMessage'

// Types
import type { FormDataPage } from '../validationSchema'
import type {
  SearchResultSectionProps,
  ActionDialogProps,
  WorkflowActionCode
} from '@/_workspace/types/_check-document/CheckDocumentTypes'

// --- Grid section ---
const SearchResultSection = ({
  columnDefs,
  datasource,
  onGridReady,
  detailCellRenderer,
  detailRowHeight,
  context,
  initialState,
  onStateUpdated
}: SearchResultSectionProps) => {
  return (
    <Card>
      <CardHeader title='Search Result' titleTypographyProps={{ variant: 'h5' }} />
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
    </Card>
  )
}

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

const DetailLoading = () => (
  <Box sx={{ minHeight: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
    <CircularProgress size={22} />
    <Typography variant='body2' color='text.secondary'>
      Loading request details...
    </Typography>
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
  const [detailData, setDetailData] = useState<any | null>(() => (hasFullRequestDetail(props.data) ? props.data : null))
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
      queueWorkflowStepMasterId={props.context.queueWorkflowStepMasterId}
      showSelectionSheetReadOnly={props.context.showSelectionSheetReadOnly}
      onApprove={(actionCode: WorkflowActionCode, actionLabel: string) =>
        props.context.onApprove(detailData, actionCode, actionLabel)
      }
      onReject={(rejectActionLabel: string, actionCode?: 'DISAGREE' | 'REJECT' | 'RECHECK') =>
        props.context.onReject(detailData, rejectActionLabel, actionCode)
      }
      onRefresh={() => props.context.onRefresh()}
      onDetailRefresh={refreshDetail}
    />
  )
}
interface Props {
  pageTitle: string
  queueWorkflowStepMasterId?: number | null
  accentColor?: string
  showSelectionSheetReadOnly?: boolean
}

const buildParamForSearch = (
  filters: FormDataPage['searchFilters'],
  request: IServerSideGetRowsRequest,
  empCode?: string,
  queueWorkflowStepMasterId?: number | null
) => {
  const { startRow, endRow, sortModel } = request
  const limit = (endRow ?? 50) - (startRow ?? 0)

  return {
    APPROVER_EMPCODE: empCode,
    QUEUE_WORKFLOW_STEP_MASTER_ID: queueWorkflowStepMasterId,
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

export default function ApprovalPageContent({
  pageTitle,
  queueWorkflowStepMasterId,
  showSelectionSheetReadOnly = false
}: Props) {
  // Context
  const { isEnableFetching, setIsEnableFetching } = useDxContext()

  const queryClient = useQueryClient()
  const gridApiRef = useRef<any>(null)
  const { getValues, setValue } = useFormContext<FormDataPage>()
  const { savedGridState, handleGridReady, handleStateUpdated, refreshServerSide } = useDxServerSideGrid({
    getValues,
    setValue,
    isEnableFetching,
    setIsEnableFetching,
    lockedLeftColIds: ['view', 'REQUEST_NUMBER']
  })

  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const [actionMode, setActionMode] = useState<'approve' | 'reject' | 'recheck'>('approve')
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [pendingActions, setPendingActions] = useState<ActionDialogProps['actions']>([])
  const [approveActionLabel, setApproveActionLabel] = useState('Approve')
  const [rejectActionLabel, setRejectActionLabel] = useState('Reject')

  const user = getUserData()
  const empCode = user?.EMPLOYEE_CODE
  const { approvalStepStatusIds } = useWorkflowIdentity()

  const datasource = useMemo<IServerSideDatasource>(
    () => ({
      getRows: async params => {
        if (!empCode || !queueWorkflowStepMasterId) {
          params.success({ rowData: [], rowCount: 0 })
          return
        }
        try {
          const payload = buildParamForSearch(
            getValues('searchFilters'),
            params.request,
            empCode,
            queueWorkflowStepMasterId
          )
          const res = await ApprovalQueueServices.getAll(payload)
          if (res.data?.Status) {
            // Option A: backend returns UPPER-cased column keys directly;
            // the grid/detail/action-dialog read those keys as-is (no re-lowercasing).
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
    [empCode, getValues, queueWorkflowStepMasterId]
  )

  const openDetailDialog = useCallback((row?: any | null) => {
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
        cellRenderer: (params: any) => (
          <IconButton size='small' color='primary' onClick={() => openDetailDialog(params.data)}>
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
      {
        field: 'my_approval_status',
        headerName: 'My Approval',
        width: 150,
        sortable: false,
        filter: false,
        cellRenderer: (params: any) => {
          const myStepStatus = getMyQueueStepStatus(
            params.data,
            empCode,
            queueWorkflowStepMasterId,
            approvalStepStatusIds
          )

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
          if (count === 0)
            return (
              <Typography variant='caption' color='text.disabled'>
                -
              </Typography>
            )
          return (
            <Chip
              label={`${count} file${count > 1 ? 's' : ''}`}
              size='small'
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
        valueFormatter: (p: any) => (p.value ? new Date(p.value).toLocaleDateString('th-TH') : '-')
      }
    ],
    [approvalStepStatusIds, empCode, queueWorkflowStepMasterId, openDetailDialog]
  )

  const handleActionSuccess = useCallback(() => {
    refreshServerSide()
    if (selectedRequestId)
      void queryClient.invalidateQueries({ queryKey: [...REQUEST_DETAIL_QUERY_KEY, selectedRequestId] })
    setDrawerOpen(false)
    setSelectedRequestId(null)
    setPendingActions([])
  }, [refreshServerSide, queryClient, selectedRequestId])

  const gridContext = useMemo(
    () => ({
      empCode,
      queueWorkflowStepMasterId,
      showSelectionSheetReadOnly,
      onApprove: (data: any, actionCode: WorkflowActionCode, actionLabel: string) => {
        const workflowTransitionId = getAllowedWorkflowTransitionId(data?.ALLOWED_ACTIONS, actionCode)
        if (!workflowTransitionId) {
          ToastMessageError({ title: 'Workflow Action', message: 'This action is no longer available. Please refresh.' })
          return
        }
        setSelectedRequestId(getRequestIdFromRow(data) || null)
        setPendingActions([
          {
            requestId: Number(data?.REQUEST_REGISTER_VENDOR_ID),
            currentTaskId: Number(data?.CURRENT_REQUEST_APPROVAL_STEP_ID || 0),
            lockVersion: Number(data?.LOCK_VERSION || 0),
            workflowTransitionId,
            approveActionLabel: actionLabel
          }
        ])
        setApproveActionLabel(actionLabel || 'Approve')
        setActionMode('approve')
        setActionDialogOpen(true)
      },
      onReject: (
        data: any,
        actionLabel: string,
        actionCode: 'DISAGREE' | 'REJECT' | 'RECHECK' = 'REJECT'
      ) => {
        const workflowTransitionId = getAllowedWorkflowTransitionId(data?.ALLOWED_ACTIONS, actionCode)
        if (!workflowTransitionId) {
          ToastMessageError({ title: 'Workflow Action', message: 'This action is no longer available. Please refresh.' })
          return
        }
        setSelectedRequestId(getRequestIdFromRow(data) || null)
        setPendingActions([
          {
            requestId: Number(data?.REQUEST_REGISTER_VENDOR_ID),
            currentTaskId: Number(data?.CURRENT_REQUEST_APPROVAL_STEP_ID || 0),
            lockVersion: Number(data?.LOCK_VERSION || 0),
            workflowTransitionId,
            rejectActionLabel: actionLabel
          }
        ])
        setApproveActionLabel('Approve')
        setRejectActionLabel(actionLabel || 'Reject')
        setActionMode(actionCode === 'RECHECK' ? 'recheck' : 'reject')
        setActionDialogOpen(true)
      },
      onRefresh: handleActionSuccess
    }),
    [empCode, queueWorkflowStepMasterId, showSelectionSheetReadOnly, handleActionSuccess]
  )

  const searchResultDataItem = useMemo(
    () => ({
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
      onStateUpdated: handleStateUpdated
    }),
    [colDefs, datasource, gridContext, handleGridReady, handleStateUpdated, savedGridState]
  )

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <SearchResultSection {...searchResultDataItem} />
      </Grid>

      <RequestDetailDialog
        open={drawerOpen}
        requestId={selectedRequestId}
        pageTitle={pageTitle}
        context={{ ...gridContext, empCode }}
        onClose={() => setDrawerOpen(false)}
      />

      <ActionDialog
        open={actionDialogOpen}
        mode={actionMode}
        actions={pendingActions}
        approveActionLabel={approveActionLabel}
        rejectActionLabel={rejectActionLabel}
        onClose={() => setActionDialogOpen(false)}
        onSuccess={handleActionSuccess}
      />
    </Grid>
  )
}
