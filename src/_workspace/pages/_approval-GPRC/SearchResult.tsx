import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography
} from '@mui/material'
import type {
  ColDef,
  GetRowIdParams,
  ICellRendererParams,
  IServerSideDatasource,
  IServerSideGetRowsRequest,
  SortModelItem
} from 'ag-grid-community'
import { useFormContext } from 'react-hook-form'
import DxAGgridTable from '@/_template/DxAGgridTable'
import { useDxContext } from '@/_template/DxContextProvider'
import { ToastMessageError } from '@/components/ToastMessage'
import RegisterRequestServices from '@/_workspace/services/_register-request/RegisterRequestServices'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { getChipSx, getReadableStatusTone } from '@/_workspace/utils/statusChipStyles'
import { buildRequestStatusFilter } from '@/_workspace/utils/requestStatusFilter'
import type { FormDataPage } from './validationSchema'
import ActionRequiredDialog from './modal/ActionRequiredDialog'
import ActionRequiredResultsDialog from './modal/ActionRequiredResultsDialog'
import ConfirmActionDialog from './modal/ConfirmActionDialog'
import RequestDetailDialog from './modal/RequestDetailDialog'
import useDxServerSideGrid from '@/_workspace/hooks/useDxServerSideGrid'
import useWorkflowIdentity from '@/_workspace/hooks/useWorkflowIdentity'
import type { GprCDialogMode, GprCQueueRow } from './types'

const getRequestId = (row: GprCQueueRow) => Number(row.REQUEST_REGISTER_VENDOR_ID || 0)

const buildSearchFilters = (filters: FormDataPage['searchFilters']) => [
  { id: 'request_number', value: filters.requestNumber || '' },
  { id: 'vendor_name', value: filters.vendorName || '' },
  { id: 'step_keyword', value: filters.stepKeyword || '' },
  buildRequestStatusFilter(filters.overallStatus, 'M_REQUEST_STATUS_ID')
]

const buildApprovalParamForSearch = (
  filters: FormDataPage['searchFilters'],
  request: IServerSideGetRowsRequest,
  empCode: string
) => {
  const { startRow, endRow, sortModel } = request
  const limit = (endRow ?? 20) - (startRow ?? 0)

  return {
    APPROVER_EMPCODE: empCode,
    SEARCHFILTERS: buildSearchFilters(filters),
    COLUMNFILTERS: [],
    ORDER:
      sortModel && sortModel.length > 0
        ? sortModel.map((item: SortModelItem) => ({ id: item.colId, desc: item.sort === 'desc' }))
        : [{ id: 'REQUEST_VENDOR_GPR_C_FLOWS_ID', desc: true }],
    START: startRow ?? 0,
    LIMIT: limit || 20
  }
}

function SearchResult() {
  // Context
  const { isEnableFetching, setIsEnableFetching } = useDxContext()

  const { getValues, setValue } = useFormContext<FormDataPage>()
  const { approvalStepStatusIds } = useWorkflowIdentity()
  const user = getUserData()
  const empCode = String(user?.EMPLOYEE_CODE || '').trim()
  const userEmail = String(user?.EMAIL || '').trim()

  const [selectedRow, setSelectedRow] = useState<GprCQueueRow | null>(null)
  const [actionRequiredRow, setActionRequiredRow] = useState<GprCQueueRow | null>(null)
  const [detailRow, setDetailRow] = useState<Record<string, unknown> | null>(null)
  const [actionResultDialogOpen, setActionResultDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<GprCDialogMode>('APPROVE')
  const [actionRequiredTotalCount, setActionRequiredTotalCount] = useState(0)

  const actionRequiredCountInitializedRef = useRef(false)
  const { savedGridState, handleGridReady, handleStateUpdated, refreshServerSide } = useDxServerSideGrid({
    getValues,
    setValue,
    isEnableFetching,
    setIsEnableFetching,
    statePath: 'searchResults.approvalGridState',
    lockedLeftColIds: ['action', 'request_number']
  })

  const dialogOpen = Boolean(selectedRow)
  const actionRequiredDialogOpen = Boolean(actionRequiredRow)
  const detailDialogOpen = Boolean(detailRow)
  // Approval-queue rows carry STEP_STATUS; once a task is approved/rejected it stays in the list
  // as history, so only 'in_progress' steps remain actionable. Action-required rows have no
  // STEP_STATUS, so their existing behaviour is preserved.
  const detailStepStatusId = Number(detailRow?.M_APPROVAL_STEP_STATUS_ID || 0)
  const detailIsActioned =
    detailStepStatusId > 0 && detailStepStatusId !== approvalStepStatusIds.IN_PROGRESS
  const detailCanAction =
    Boolean(
      detailRow &&
        (detailRow.REQUEST_VENDOR_GPR_C_STEPS_ID ||
          detailRow.REQUEST_VENDOR_GPR_C_FLOWS_ID ||
          detailRow.STEP_CODE ||
          detailRow.STEP_NAME)
    ) && !detailIsActioned
  const detailStepCode = String(detailRow?.STEP_CODE || '').trim().toUpperCase()
  const detailCanRecheck = detailCanAction && detailStepCode === 'REQUESTER_APPROVER'
  const detailCanActionRequired = detailCanAction

  const loadActionRequiredCount = useCallback(async () => {
    if (!userEmail) {
      setActionRequiredTotalCount(0)
      return
    }

    try {
      const response = await RegisterRequestServices.gprCActionRequiredQueue({
        PIC_EMAIL: userEmail,
        SEARCHFILTERS: buildSearchFilters(getValues('searchFilters')),
        COLUMNFILTERS: [],
        ORDER: [
          { id: 'SENT_AT', desc: true },
          { id: 'REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID', desc: true }
        ],
        START: 0,
        LIMIT: 1
      })
      const result = response.data
      setActionRequiredTotalCount(result?.Status ? result.TotalCountOnDb || 0 : 0)
    } catch {
      setActionRequiredTotalCount(0)
    }
  }, [getValues, userEmail])

  const refreshAllGrids = useCallback(() => {
    refreshServerSide()
    void loadActionRequiredCount()
  }, [loadActionRequiredCount, refreshServerSide])

  useEffect(() => {
    if (!actionRequiredCountInitializedRef.current || isEnableFetching) {
      actionRequiredCountInitializedRef.current = true
      void loadActionRequiredCount()
    }
  }, [isEnableFetching, loadActionRequiredCount])

  const approvalDatasource = useMemo<IServerSideDatasource>(
    () => ({
      getRows: async params => {
        if (!empCode) {
          params.success({ rowData: [], rowCount: 0 })
          return
        }

        try {
          const payload = buildApprovalParamForSearch(getValues('searchFilters'), params.request, empCode)
          const response = await RegisterRequestServices.gprCQueue(payload)
          const result = response.data

          if (result?.Status) {
            const rowData = result.ResultOnDb || []
            // A block shorter than requested means the data ran out; clamp rowCount
            // to what actually exists so the grid never re-requests missing rows.
            const totalCount = Number(result.TotalCountOnDb) || 0
            const rowCount = rowData.length < payload.LIMIT ? payload.START + rowData.length : totalCount
            params.success({ rowData, rowCount })
            return
          }

          params.fail()
        } catch {
          params.fail()
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }),
    [empCode, getValues]
  )

  const openDialog = (mode: GprCDialogMode, row: GprCQueueRow) => {
    setDialogMode(mode)
    setSelectedRow(row)
  }

  const closeDialog = () => {
    setSelectedRow(null)
  }

  const openActionRequiredDialog = (row: GprCQueueRow) => {
    setActionRequiredRow(row)
  }

  const closeActionRequiredDialog = () => {
    setActionRequiredRow(null)
  }

  const openDetailDialog = (row: Record<string, unknown>) => {
    setDetailRow(row)
  }

  const closeDetailDialog = () => {
    setDetailRow(null)
  }

  const approvalColumnDefs = useMemo<ColDef<GprCQueueRow>[]>(
    () => [
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
              <IconButton size='small' color='primary' onClick={() => openDetailDialog(row)}>
                <i className='tabler-eye' style={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          )
        }
      },
      {
        headerName: 'Request Number',
        field: 'request_number',
        width: 170,
        pinned: 'left',
        lockPinned: true,
        suppressMovable: true,
        filter: 'agTextColumnFilter',
        valueGetter: params => params.data?.REQUEST_NUMBER || `REQ-${getRequestId(params.data || {})}`
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
              bgcolor: 'transparent'
            }}
          >
            <Typography variant='body2' color='text.secondary' fontWeight={500}>
              {params.data?.REQUEST_STATUS || 'In Progress'}
            </Typography>
          </Box>
        )
      },
      {
        headerName: 'My Action',
        field: 'STEP_STATUS',
        width: 170,
        filter: false,
        sortable: false,
        cellRenderer: (params: ICellRendererParams<GprCQueueRow>) => {
          const statusId = Number(params.data?.M_APPROVAL_STEP_STATUS_ID || 0)
          const cfg =
            statusId === approvalStepStatusIds.APPROVED
              ? { label: 'Approved', icon: 'tabler-circle-check', tone: getReadableStatusTone('completed') }
              : statusId === approvalStepStatusIds.REJECTED
                ? { label: 'Rejected', icon: 'tabler-circle-x', tone: getReadableStatusTone('rejected') }
                : { label: 'Awaiting You', icon: 'tabler-clock', tone: getReadableStatusTone('in progress') }

          return (
            <Chip
              size='small'
              icon={<i className={cfg.icon} style={{ fontSize: 13 }} />}
              label={cfg.label}
              sx={getChipSx(cfg.tone, {
                height: 24,
                fontWeight: 600,
                fontSize: '0.72rem',
                width: 'fit-content',
                '& .MuiChip-icon': { color: 'inherit' }
              })}
            />
          )
        }
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
                whiteSpace: 'nowrap'
              }}
            >
              {stepValue}
            </Typography>
          )
        }
      },
      {
        headerName: 'Company Name',
        field: 'company_name',
        flex: 1.5,
        minWidth: 210,
        filter: 'agTextColumnFilter',
        valueGetter: params => params.data?.COMPANY_NAME || '-'
      },
      {
        headerName: 'Support Product / Process',
        field: 'SUPPORTPRODUCT_PROCESS',
        flex: 1,
        minWidth: 180,
        filter: false,
        valueGetter: params => params.data?.SUPPORTPRODUCT_PROCESS || '-'
      },
      {
        headerName: 'Purchase Frequency',
        field: 'PURCHASE_FREQUENCY',
        width: 170,
        filter: false,
        valueGetter: params => params.data?.PURCHASE_FREQUENCY || '-'
      },
      {
        headerName: 'Submitted By',
        field: 'REQUEST_BY_EMPLOYEECODE',
        flex: 1,
        minWidth: 170,
        filter: false,
        valueGetter: params => params.data?.REQUEST_BY_EMPLOYEECODE || '-'
      },
      {
        headerName: 'Submitted Date',
        field: 'REQUEST_CREATE_DATE',
        width: 150,
        filter: false,
        valueFormatter: params => (params.value ? new Date(params.value).toLocaleDateString('th-TH') : '-')
      }
    ],
    [approvalStepStatusIds.APPROVED, approvalStepStatusIds.REJECTED]
  )

  return (
    <Stack spacing={3}>
      <Card>
        <CardHeader
          title='Search Result'
          titleTypographyProps={{ variant: 'h5' }}
          action={
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
                    fontWeight: 700
                  }}
                >
                  {actionRequiredTotalCount}
                </Box>
              }
              onClick={() => setActionResultDialogOpen(true)}
            >
              Action Required Results
            </Button>
          }
        />
        <CardContent sx={{ p: '24px !important' }}>
          <DxAGgridTable
            columnDefs={approvalColumnDefs}
            serverSideDatasource={approvalDatasource}
            height={600}
            getRowId={(params: GetRowIdParams<GprCQueueRow>) =>
              String(
                params.data.REQUEST_VENDOR_GPR_C_STEPS_ID ||
                  params.data.REQUEST_VENDOR_GPR_C_FLOWS_ID ||
                  getRequestId(params.data)
              )
            }
            overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No GPR C approval task found.</span>'
            initialState={savedGridState}
            onStateUpdated={handleStateUpdated}
            onGridReady={handleGridReady}
          />
        </CardContent>
      </Card>

      <RequestDetailDialog
        open={detailDialogOpen}
        requestId={detailRow ? Number(detailRow.REQUEST_REGISTER_VENDOR_ID || detailRow.request_id || 0) : null}
        fallbackRow={detailRow}
        actionDisabled={false}
        onApprove={detailCanAction && detailRow ? () => openDialog('APPROVE', detailRow as GprCQueueRow) : undefined}
        onRecheck={detailCanRecheck && detailRow ? () => openDialog('RECHECK', detailRow as GprCQueueRow) : undefined}
        onReject={detailCanAction && detailRow ? () => openDialog('REJECT', detailRow as GprCQueueRow) : undefined}
        onActionRequired={
          detailCanAction && detailRow ? () => openActionRequiredDialog(detailRow as GprCQueueRow) : undefined
        }
        actionRequiredDisabled={!detailCanActionRequired}
        onClose={closeDetailDialog}
      />

      <ConfirmActionDialog
        open={dialogOpen}
        mode={dialogMode}
        row={selectedRow}
        actionBy={empCode}
        onClose={closeDialog}
        onSuccess={async () => {
          setDetailRow(null)
          refreshAllGrids()
        }}
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

      <ActionRequiredResultsDialog
        open={actionResultDialogOpen}
        userEmail={userEmail}
        actionBy={empCode}
        totalCount={actionRequiredTotalCount}
        onCountChange={setActionRequiredTotalCount}
        onClose={() => setActionResultDialogOpen(false)}
        onResultSaved={refreshAllGrids}
      />
    </Stack>
  )
}

export default SearchResult
