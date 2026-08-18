// React Imports
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useFormContext } from 'react-hook-form'

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
  IconButton,
  Tooltip,
  Alert
} from '@mui/material'

// AG Grid Imports
import type { ColDef, IServerSideDatasource, IServerSideGetRowsRequest } from 'ag-grid-community'
import DxAGgridTable from '@/_template/DxAGgridTable'
import { useDxContext } from '@/_template/DxContextProvider'

// Components Imports
import useDxServerSideGrid from '@/_workspace/hooks/useDxServerSideGrid'

import GprCNotificationDialog from './modal/GprCNotificationDialog'
import RequestDetailDialog from './modal/RequestDetailDialog'
import DetailRenderer from './components/DetailRenderer'
import { buildFileUrls, hasCompletedGprCSetup } from './components/shared'

// Services
import ApprovalQueueServices from '@/_workspace/services/_approval-queue/ApprovalQueueServices'

// Utils
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { isWorkflowStepType } from '@/_workspace/utils/workflowIdentity'
import { buildRequestStatusFilter } from '@/_workspace/utils/requestStatusFilter'
import useWorkflowIdentity from '@/_workspace/hooks/useWorkflowIdentity'
import useWorkflowStepTypeIdentity from '@/_workspace/hooks/useWorkflowStepTypeIdentity'

// React Query
import { useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { requestDetailQueryOptions } from '@/_workspace/react-query/hooks/useRegisterRequest'

// Types
import type { FormDataPage } from './validationSchema'

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

const buildParamForSearch = (filters: FormDataPage['searchFilters'], request: IServerSideGetRowsRequest) => {
  const { startRow, endRow, sortModel } = request
  const limit = (endRow ?? 50) - (startRow ?? 0)

  return {
    SEARCHFILTERS: [
      { id: 'company_name', value: filters.vendorName || null },
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
  <Box sx={{ minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
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

const LazyDetailRenderer = (props: any) => {
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
        console.error('Load request history detail failed:', error)
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

  return <DetailRenderer data={detailData} />
}
export default function SearchResult() {
  // Context
  const { isEnableFetching, setIsEnableFetching } = useDxContext()

  const { getValues, setValue } = useFormContext<FormDataPage>()
  const { approvalStepStatusIds } = useWorkflowIdentity()
  const { workflowStepTypeIds } = useWorkflowStepTypeIdentity()

  const { savedGridState, handleGridReady, handleStateUpdated, refreshServerSide } = useDxServerSideGrid({
    getValues,
    setValue,
    isEnableFetching,
    setIsEnableFetching,
    lockedLeftColIds: ['view', 'REQUEST_NUMBER', 'require_action']
  })

  // ── Dialog State ─────────────────────────────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null)

  // ── GPR C Notification Dialog State ──────────────────────────────────────
  const [gprCOpen, setGprCOpen] = useState(false)
  const [gprCRowData, setGprCRowData] = useState<any>(null)

  const currentUserCode = String(getUserData()?.EMPLOYEE_CODE || '').trim()

  // ── Server-Side Datasource ────────────────────────────────────────────────
  const datasource = useMemo<IServerSideDatasource>(
    () => ({
      getRows: async params => {
        if (!currentUserCode) {
          params.success({ rowData: [], rowCount: 0 })
          return
        }

        try {
          const payload = buildParamForSearch(getValues('searchFilters'), params.request)
          const res = await ApprovalQueueServices.getMyRequests(currentUserCode, payload)

          if (res.data?.Status) {
            // Option A: backend returns UPPER-cased column keys directly;
            // the grid/detail/modal read those keys as-is (no re-lowercasing).
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
    [currentUserCode, getValues]
  ) // getValues is a stable ref — no need to re-create datasource

  // ── Column / Grid State Persistence ──────────────────────────────────────
  const openDetailDialog = useCallback((row?: any | null) => {
    setSelectedRequestId(getRequestIdFromRow(row) || null)
    setDrawerOpen(true)
  }, [])
  const colDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: 'Actions',
        field: 'view',
        width: 110,
        pinned: 'left',
        lockPinned: true,
        suppressMovable: true,
        cellRenderer: (params: any) => {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Tooltip title='View Details'>
                <IconButton size='small' color='primary' onClick={() => openDetailDialog(params.data)}>
                  <i className='tabler-eye' style={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
          )
        }
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
        headerName: 'Require Action',
        field: 'require_action',
        width: 160,
        pinned: 'left',
        sortable: false,
        filter: false,
        cellRenderer: (params: any) => {
          const rowRequesterCode = String(params.data?.EMPLOYEE_CODE || '').trim()
          const isRequester = !!rowRequesterCode && rowRequesterCode === currentUserCode

          // The list and detail responses both expose master IDs. Labels/codes are display only.
          let inGprCStep = isWorkflowStepType(
            { WORKFLOW_STEP_TYPE_ID: params.data?.CURRENT_WORKFLOW_STEP_TYPE_ID },
            workflowStepTypeIds.ISSUE_GPR_C
          )
          try {
            const approvalSteps =
              typeof params.data?.APPROVAL_STEPS === 'string'
                ? JSON.parse(params.data.APPROVAL_STEPS)
                : params.data?.APPROVAL_STEPS || []
            const currentStep = approvalSteps.find(
              (s: any) => Number(s.M_APPROVAL_STEP_STATUS_ID) === approvalStepStatusIds.IN_PROGRESS
            )
            if (!inGprCStep && currentStep) {
              inGprCStep = isWorkflowStepType(currentStep, workflowStepTypeIds.ISSUE_GPR_C)
            }
          } catch {}

          if (!inGprCStep || !isRequester) {
            return (
              <Typography variant='caption' color='text.disabled'>
                -
              </Typography>
            )
          }

          if (hasCompletedGprCSetup(params.data)) {
            return (
              <Typography variant='caption' color='text.disabled'>
                Setup completed
              </Typography>
            )
          }

          return (
            <Tooltip title='Set Product Checkers, GPR C Approver, PC PIC & Circular list'>
              <Chip
                label='GPR C Setup'
                size='small'
                color='warning'
                variant='tonal'
                onClick={() => {
                  setGprCRowData(params.data)
                  setGprCOpen(true)
                }}
                sx={{
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  height: 24
                }}
              />
            </Tooltip>
          )
        }
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
                  maxWidth: '100%',
                  px: 1.25,
                  py: 0.35,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'transparent'
                }}
              >
                <Typography variant='caption' fontWeight={700} color='text.secondary' noWrap>
                  {params.value || '-'}
                </Typography>
              </Box>
            )
          }
        }
      },
      {
        field: 'COMPANY_NAME',
        headerName: 'Company Name',
        flex: 1.5,
        minWidth: 220
      },
      {
        field: 'SUPPORTPRODUCT_PROCESS',
        headerName: 'Support Product / Process',
        flex: 1,
        minWidth: 150
      },
      {
        field: 'PURCHASE_FREQUENCY',
        headerName: 'Purchase Freqency',
        flex: 0.9,
        minWidth: 130
      },
      {
        field: 'ASSIGN_TO',
        headerName: 'PO PIC',
        flex: 1,
        minWidth: 150
      },
      {
        field: 'DOCUMENTS_COUNT',
        headerName: 'Files',
        flex: 0.6,
        minWidth: 90,
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
        flex: 1,
        minWidth: 140,
        valueFormatter: p => (p.value ? new Date(p.value).toLocaleDateString('th-TH') : '-')
      }
    ],
    [approvalStepStatusIds.IN_PROGRESS, currentUserCode, openDetailDialog, workflowStepTypeIds.ISSUE_GPR_C]
  )

  return (
    <Grid container spacing={6}>
      {!currentUserCode && (
        <Grid item xs={12}>
          <Alert severity='error'>Unable to identify the current employee. My Request History cannot be loaded.</Alert>
        </Grid>
      )}

      {/* AG Grid */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Search Result' titleTypographyProps={{ variant: 'h5' }} />
          <CardContent sx={{ p: '24px !important' }}>
            <DxAGgridTable
              columnDefs={colDefs}
              serverSideDatasource={datasource}
              height={600}
              masterDetail={true}
              detailCellRenderer={LazyDetailRenderer}
              detailRowAutoHeight={true}
              getRowId={(p: any) => String(p.data.REQUEST_REGISTER_VENDOR_ID ?? p.data.VENDORS_ID ?? p.rowIndex)}
              onGridReady={handleGridReady}
              initialState={savedGridState}
              onStateUpdated={handleStateUpdated}
              overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No requests submitted by you were found</span>'
            />
          </CardContent>
        </Card>
      </Grid>

      <RequestDetailDialog open={drawerOpen} requestId={selectedRequestId} onClose={() => setDrawerOpen(false)} />

      {/* GPR C Notification Dialog — Requester Action only */}
      <GprCNotificationDialog
        open={gprCOpen}
        rowData={gprCRowData}
        onClose={() => setGprCOpen(false)}
        onSaved={() => {
          setGprCOpen(false)
          refreshServerSide()
        }}
      />
    </Grid>
  )
}
