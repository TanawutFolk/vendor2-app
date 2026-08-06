import { useCallback, useEffect, useMemo, useState } from 'react'
import { useFormContext } from 'react-hook-form'

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Tooltip,
  Typography
} from '@mui/material'

import type { ColDef, IServerSideDatasource, IServerSideGetRowsRequest } from 'ag-grid-community'

import DxAGgridTable from '@/_template/DxAGgridTable'
import { useDxContext } from '@/_template/DxContextProvider'
import useDxServerSideGrid from '@/_workspace/hooks/useDxServerSideGrid'

import AllRequestHistoryServices from '@/_workspace/services/_all-request-history/AllRequestHistoryServices'
import DetailRenderer from '@/_workspace/pages/_request-history/components/DetailRenderer'
import { buildFileUrls } from '@/_workspace/pages/_request-history/components/shared'
import type {
  AllRequestHistoryDetail,
  AllRequestHistoryRow,
  AllRequestHistorySearchRequest
} from '@/_workspace/types/_all-request-history/AllRequestHistoryTypes'

import { useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'

import type { FormDataPage } from './validationSchema'
import RequestDetailDialog, { allRequestHistoryDetailQueryOptions } from './modal/RequestDetailDialog'

type RequestRow = AllRequestHistoryRow
type RowRendererParams = { data?: RequestRow; value?: unknown }

const getRequestId = (row?: RequestRow | null) => Number(row?.REQUEST_REGISTER_VENDOR_ID || 0)

const hasFullRequestDetail = (row?: RequestRow | null) =>
  Boolean(
    row?.APPROVAL_STEPS || row?.APPROVAL_LOGS || row?.DOCUMENTS || row?.CONTACTS || row?.PRODUCTS || row?.GPR_CRITERIA
  )

const getDocumentCount = (row?: RequestRow | null) => {
  if (row?.DOCUMENTS_COUNT !== undefined) return Number(row.DOCUMENTS_COUNT) || 0

  return buildFileUrls(row?.DOCUMENTS, String(row?.REQUEST_NUMBER || '')).length
}

const buildParamForSearch = (
  filters: FormDataPage['searchFilters'],
  request: IServerSideGetRowsRequest
): AllRequestHistorySearchRequest => {
  const { startRow, endRow, sortModel } = request
  const limit = (endRow ?? 50) - (startRow ?? 0)

  return {
    REQUESTER_SECTION: filters.section?.value || null,
    REQUEST_YEAR: filters.year?.value || null,
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

const loadRequestDetail = async (row: RequestRow, queryClient: QueryClient) => {
  const requestId = getRequestId(row)
  if (!requestId) return row || null

  try {
    return (await queryClient.fetchQuery(allRequestHistoryDetailQueryOptions(requestId))) as AllRequestHistoryDetail as RequestRow
  } catch {
    return row || null
  }
}

const LazyDetailRenderer = (props: { data?: RequestRow }) => {
  const queryClient = useQueryClient()
  const [detailData, setDetailData] = useState<RequestRow | null>(() =>
    hasFullRequestDetail(props.data) ? props.data || null : null
  )
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

function SearchResult() {
  // Context
  const { isEnableFetching, setIsEnableFetching } = useDxContext()

  const { getValues, setValue } = useFormContext<FormDataPage>()

  const { savedGridState, handleGridReady, handleStateUpdated } = useDxServerSideGrid({
    getValues,
    setValue,
    isEnableFetching,
    setIsEnableFetching,
    lockedLeftColIds: ['view', 'REQUEST_NUMBER']
  })

  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null)

  const openDetailDialog = useCallback((row?: RequestRow) => {
    setSelectedRequestId(getRequestId(row) || null)
    setDetailOpen(true)
  }, [])

  const datasource = useMemo<IServerSideDatasource>(
    () => ({
      getRows: async params => {
        const payload = buildParamForSearch(getValues('searchFilters'), params.request)

        try {
          const response = await AllRequestHistoryServices.search(payload)

          if (!response.data?.Status) {
            params.fail()
            return
          }

          const rowData = response.data.ResultOnDb || []
          const totalCount = Number(response.data.TotalCountOnDb) || 0
          const rowCount = rowData.length < payload.LIMIT ? payload.START + rowData.length : totalCount
          params.success({ rowData, rowCount })
        } catch {
          params.fail()
        }
      }
      // getValues and queryClient are stable references for the grid datasource.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }),
    [getValues]
  )

  const colDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: 'Actions',
        field: 'view',
        width: 100,
        pinned: 'left',
        lockPinned: true,
        suppressMovable: true,
        sortable: false,
        filter: false,
        cellRenderer: (params: RowRendererParams) => (
          <Tooltip title='View Details'>
            <IconButton size='small' color='primary' onClick={() => openDetailDialog(params.data)}>
              <i className='tabler-eye' style={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        )
      },
      {
        field: 'REQUEST_NUMBER',
        headerName: 'Request Number',
        width: 180,
        pinned: 'left',
        lockPinned: true,
        suppressMovable: true,
        cellRenderer: 'agGroupCellRenderer',
        valueGetter: params => params.data?.REQUEST_NUMBER || params.data?.REQUEST_REGISTER_VENDOR_ID || '-'
      },
      {
        field: 'FULL_NAME',
        headerName: 'Submitted By',
        minWidth: 180,
        flex: 1,
        sortable: false,
        valueGetter: params => params.data?.FULL_NAME || params.data?.EMPLOYEE_CODE || '-'
      },
      {
        field: 'REQUESTER_SECTION',
        headerName: 'Section',
        minWidth: 150,
        flex: 0.8
      },
      {
        field: 'REQUEST_STATUS',
        headerName: 'Status',
        minWidth: 210,
        flex: 1.1,
        sortable: false,
        cellRenderer: (params: RowRendererParams) => (
          <Typography variant='caption' fontWeight={700} color='text.secondary' noWrap>
            {String(params.value || '-')}
          </Typography>
        )
      },
      {
        field: 'COMPANY_NAME',
        headerName: 'Company Name',
        minWidth: 220,
        flex: 1.3
      },
      {
        field: 'SUPPORTPRODUCT_PROCESS',
        headerName: 'Support Product / Process',
        minWidth: 180,
        flex: 1
      },
      {
        field: 'ASSIGN_TO',
        headerName: 'PO PIC',
        minWidth: 130,
        flex: 0.8
      },
      {
        field: 'DOCUMENTS_COUNT',
        headerName: 'Files',
        width: 100,
        sortable: false,
        cellRenderer: (params: RowRendererParams) => {
          const count = getDocumentCount(params.data)
          return count > 0 ? <Chip label={`${count} file${count > 1 ? 's' : ''}`} size='small' /> : '-'
        }
      },
      {
        field: 'CREATE_DATE',
        headerName: 'Submitted Date',
        minWidth: 150,
        flex: 0.8,
        valueFormatter: params => (params.value ? new Date(params.value).toLocaleDateString('th-TH') : '-')
      }
    ],
    [openDetailDialog]
  )

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Search Result' titleTypographyProps={{ variant: 'h5' }} />
          <CardContent sx={{ p: '24px !important' }}>
            <DxAGgridTable
              columnDefs={colDefs}
              serverSideDatasource={datasource}
              height={600}
              masterDetail
              detailCellRenderer={LazyDetailRenderer}
              detailRowAutoHeight
              getRowId={(params: { data: RequestRow; rowIndex?: number }) =>
                String(params.data.REQUEST_REGISTER_VENDOR_ID ?? params.rowIndex)
              }
              onGridReady={handleGridReady}
              initialState={savedGridState}
              onStateUpdated={handleStateUpdated}
              overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No request history was found</span>'
            />
          </CardContent>
        </Card>
      </Grid>

      <RequestDetailDialog
        open={detailOpen}
        requestId={selectedRequestId}
        onClose={() => setDetailOpen(false)}
      />
    </Grid>
  )
}

export default SearchResult
