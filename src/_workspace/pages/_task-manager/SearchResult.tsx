// React Imports
import { useMemo, useState } from 'react'

// MUI Imports
import { Box, Button, Card, CardContent, CardHeader, Chip, Typography } from '@mui/material'

// AG Grid Imports
import type {
  ColDef,
  GetRowIdParams,
  ICellRendererParams,
  IServerSideDatasource,
  IServerSideGetRowsRequest,
  SortModelItem,
  ValueFormatterParams
} from 'ag-grid-community'
import { useFormContext } from 'react-hook-form'

// Components Imports
import DxAGgridTable from '@/_template/DxAGgridTable'
import { useDxContext } from '@/_template/DxContextProvider'
import TaskManagerServices from '@/_workspace/services/_task-manager/TaskManagerServices'
import ReassignDialog from '@/_workspace/components/workflow/modal/ReassignDialog'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import useDxServerSideGrid from '@/_workspace/hooks/useDxServerSideGrid'
import { buildRequestStatusFilter } from '@/_workspace/utils/requestStatusFilter'

// Types
import type { FormDataPage } from './validationSchema'
import type { TaskQueueRow } from '@/_workspace/types/_task-manager/TaskManagerTypes'

const buildParamForSearch = (
  searchFilters: FormDataPage['searchFilters'],
  request: IServerSideGetRowsRequest
) => {
  const { startRow, endRow, sortModel } = request
  const limit = (endRow ?? 50) - (startRow ?? 0)

  return {
    SEARCHFILTERS: [
      buildRequestStatusFilter(searchFilters?.status, 'CURRENT_M_REQUEST_STATUS_ID'),
      { id: 'CURRENT_OWNER_EMPCODE', value: searchFilters?.pic?.value || '' }
    ],
    COLUMNFILTERS: [],
    ORDER:
      sortModel && sortModel.length > 0
        ? sortModel.map((item: SortModelItem) => ({ id: item.colId, desc: item.sort === 'desc' }))
        : [{ id: 'REQUEST_REGISTER_VENDOR_ID', desc: true }],
    START: startRow ?? 0,
    LIMIT: limit
  }
}

function SearchResult() {
  // Context
  const { isEnableFetching, setIsEnableFetching } = useDxContext()

  const user = getUserData()
  const { getValues, setValue } = useFormContext<FormDataPage>()
  const [dialogRow, setDialogRow] = useState<TaskQueueRow | null>(null)

  const { savedGridState, handleGridReady, handleStateUpdated, refreshServerSide } = useDxServerSideGrid({
    getValues,
    setValue,
    isEnableFetching,
    setIsEnableFetching,
    lockedLeftColIds: ['action', 'request_number']
  })

  // ── Server-Side Datasource ────────────────────────────────────────────────
  const datasource = useMemo<IServerSideDatasource>(
    () => ({
      getRows: async params => {
        try {
          const payload = buildParamForSearch(getValues('searchFilters'), params.request)
          const res = await TaskManagerServices.searchAllTask(payload)

          const result = res?.data
          if (result?.Status) {
            const rowData = result.ResultOnDb || []
            // A block shorter than requested means the data ran out; clamp rowCount
            // to what actually exists so the grid never re-requests missing rows.
            const totalCount = Number(result.TotalCountOnDb) || 0
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
    [getValues]
  ) // getValues is a stable ref — no need to re-create datasource

  // Trigger refresh when Search button is clicked
  // ── Column State Persistence ──────────────────────────────────────────────
  // Read saved state once on mount — AG Grid restores it via initialState prop
  // ── Column Definitions ────────────────────────────────────────────────────
  const colDefs = useMemo<ColDef<TaskQueueRow>[]>(
    () => [
      {
        headerName: 'Action',
        field: 'action',
        width: 150,
        sortable: false,
        pinned: 'left',
        lockPinned: true,
        suppressMovable: true,
        cellRenderer: (params: ICellRendererParams<TaskQueueRow>) => (
          <Button
            size='small'
            variant='contained'
            color='warning'
            disabled={!Number(params.data?.REASSIGN_ENABLED)}
            onClick={() => setDialogRow(params.data || null)}
          >
            Reassign
          </Button>
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
        field: 'WORKFLOW_TYPE',
        headerName: 'Workflow',
        width: 180,
        cellRenderer: (params: ICellRendererParams<TaskQueueRow>) => (
          <Chip
            label={params.value || '-'}
            size='small'
            color={String(params.value || '').includes('GPR C') ? 'info' : 'default'}
            variant='tonal'
          />
        )
      },
      { field: 'REQUEST_REGISTER_VENDOR_ID', headerName: 'Request ID', width: 120 },
      { field: 'COMPANY_NAME', headerName: 'Company Name', flex: 1.5, minWidth: 220 },
      {
        field: 'REQUEST_STATUS',
        headerName: 'Status',
        width: 180,
        cellRenderer: (params: ICellRendererParams<TaskQueueRow>) => {
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
      },
      { field: 'CURRENT_STEP_NAME', headerName: 'Current Step', flex: 1.2, minWidth: 220 },
      { field: 'CURRENT_GROUP_NAME', headerName: 'PO PIC Group', flex: 1.1, minWidth: 190 },
      { field: 'CURRENT_OWNER_EMPCODE', headerName: 'PO PIC (assign_to)', width: 170 },
      {
        field: 'ASSIGNMENT_HEALTH',
        headerName: 'PO PIC Status',
        width: 150,
        cellRenderer: (params: ICellRendererParams<TaskQueueRow>) => {
          const healthy = Number(params.data?.CURRENT_OWNER_ACTIVE)
          return (
            <Chip
              label={healthy ? 'Active' : 'Needs Reassign'}
              size='small'
              color={healthy ? 'success' : 'warning'}
              variant='tonal'
            />
          )
        }
      },
      {
        field: 'CREATE_DATE',
        headerName: 'Submitted Date',
        width: 150,
        valueFormatter: (params: ValueFormatterParams<TaskQueueRow>) =>
          params.value ? new Date(params.value).toLocaleDateString('th-TH') : '-'
      }
    ],
    []
  )

  return (
    <Card>
      <CardHeader title='Search Result' titleTypographyProps={{ variant: 'h5' }} />
      <CardContent>
        <DxAGgridTable
          columnDefs={colDefs}
          serverSideDatasource={datasource}
          height={650}
          boxSx={{ p: 2 }}
          overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No task queue found</span>'
          getRowId={(params: GetRowIdParams<TaskQueueRow>) => {
            return String(params.data.REQUEST_REGISTER_VENDOR_ID || 0)
          }}
          initialState={savedGridState}
          onStateUpdated={handleStateUpdated}
          onGridReady={handleGridReady}
        />

        <ReassignDialog
          open={!!dialogRow}
          requestId={dialogRow?.REQUEST_REGISTER_VENDOR_ID || null}
          groupCode={dialogRow?.CURRENT_GROUP_CODE || ''}
          currentEmpCode={dialogRow?.CURRENT_OWNER_EMPCODE || ''}
          updateBy={user?.EMPLOYEE_CODE || 'SYSTEM'}
          onClose={() => setDialogRow(null)}
          onSuccess={() => {
            setDialogRow(null)
            refreshServerSide()
          }}
        />
      </CardContent>
    </Card>
  )
}

export default SearchResult
