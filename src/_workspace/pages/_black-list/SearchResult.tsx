// React Imports
import { useMemo, useState } from 'react'

// MUI Imports
import { Button, Card, CardContent, CardHeader, Chip } from '@mui/material'

// react-hook-form Imports
import { useFormContext } from 'react-hook-form'

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

// Components Imports
import DxAGgridTable from '@/_template/DxAGgridTable'
import { useDxContext } from '@/_template/DxContextProvider'
import useDxServerSideGrid from '@/_workspace/hooks/useDxServerSideGrid'

// Types
import UploadBlacklistModal from './modal/UploadBlacklistModal'
import { BlacklistI } from '@/_workspace/types/_black-list/BlacklistTypes'
import BlacklistServices from '@/_workspace/services/_black-list/BlacklistServices'
import type { FormDataPage } from './validationSchema'

const buildParamForSearch = (
  searchFilters: FormDataPage['searchFilters'],
  request: IServerSideGetRowsRequest
) => {
  const { startRow, endRow, sortModel } = request
  const limit = (endRow ?? 20) - (startRow ?? 0)

  return {
    SEARCHFILTERS: [
      { id: 'VENDOR_NAME', value: searchFilters.vendorName || '' },
      { id: 'GROUP_CODE', value: searchFilters.group?.value || '' }
    ],
    COLUMNFILTERS: [],
    ORDER:
      sortModel && sortModel.length > 0
        ? sortModel.map((item: SortModelItem) => ({ id: item.colId, desc: item.sort === 'desc' }))
        : [{ id: 'UPDATED_DATE', desc: true }],
    START: startRow ?? 0,
    LIMIT: limit || 20
  }
}

function SearchResult() {
  // Context
  const { isEnableFetching, setIsEnableFetching } = useDxContext()

  // react-hook-form
  const { getValues, setValue } = useFormContext<FormDataPage>()

  // States : Modal
  const [openModalUpload, setOpenModalUpload] = useState(false)

  // Hooks : AG Grid
  const { savedGridState, handleGridReady, handleStateUpdated } = useDxServerSideGrid({
    getValues,
    setValue,
    isEnableFetching,
    setIsEnableFetching
  })

  const datasource = useMemo<IServerSideDatasource>(
    () => ({
      getRows: async params => {
        try {
          const payload = buildParamForSearch(getValues('searchFilters'), params.request)
          const response = await BlacklistServices.search(payload)

          const result = (response as any)?.data

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
    [getValues]
  )

  const colDefs = useMemo<ColDef<BlacklistI>[]>(
    () => [
      { field: 'BLACKLIST_ID', headerName: 'Blacklist ID', width: 130, pinned: 'left', filter: 'agNumberColumnFilter' },
      {
        field: 'VENDOR_NAME',
        headerName: 'Vendor Name',
        flex: 1.4,
        minWidth: 240,
        pinned: 'left',
        filter: 'agTextColumnFilter'
      },
      {
        field: 'GROUP_CODE',
        headerName: 'Group',
        width: 120,
        filter: 'agTextColumnFilter',
        cellRenderer: (params: ICellRendererParams<BlacklistI>) => {
          const color = params.value === 'US' ? 'primary' : 'warning'
          return <Chip size='small' label={params.value || '-'} color={color} variant='tonal' />
        }
      },
      {
        field: 'SOURCE_NAME',
        headerName: 'Source',
        flex: 1.6,
        minWidth: 320,
        filter: 'agTextColumnFilter',
        valueFormatter: (params: ValueFormatterParams<BlacklistI>) => params.value || '-'
      },
      {
        field: 'COUNTRY',
        headerName: 'Country',
        width: 220,
        filter: 'agTextColumnFilter',
        valueFormatter: (params: ValueFormatterParams<BlacklistI>) => params.value || '-'
      },
      {
        field: 'ENTITY_NUMBER',
        headerName: 'Entity Number',
        width: 160,
        filter: 'agTextColumnFilter',
        valueFormatter: (params: ValueFormatterParams<BlacklistI>) => params.value || '-'
      },
      {
        field: 'ENTITY_TYPE',
        headerName: 'Type',
        width: 140,
        filter: 'agTextColumnFilter',
        valueFormatter: (params: ValueFormatterParams<BlacklistI>) => params.value || '-'
      },
      {
        field: 'PROGRAMS',
        headerName: 'Programs',
        flex: 1.2,
        minWidth: 220,
        filter: 'agTextColumnFilter',
        valueFormatter: (params: ValueFormatterParams<BlacklistI>) => params.value || '-'
      },
      {
        field: 'WMD_TYPE',
        headerName: 'WMD',
        width: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params: ValueFormatterParams<BlacklistI>) => params.value || '-'
      },
      {
        field: 'ALIAS_COUNT',
        headerName: 'Aliases',
        width: 120,
        filter: 'agNumberColumnFilter',
        cellRenderer: (params: ICellRendererParams<BlacklistI>) => (
          <Chip size='small' label={String(params.value || 0)} color='info' variant='tonal' />
        )
      },
      {
        field: 'IN_USE',
        headerName: 'Status',
        width: 120,
        filter: 'agTextColumnFilter',
        cellRenderer: (params: ICellRendererParams<BlacklistI>) => (
          <Chip
            size='small'
            label={Number(params.value) === 1 ? 'Active' : 'Inactive'}
            color={Number(params.value) === 1 ? 'success' : 'default'}
            variant='tonal'
          />
        )
      },
      {
        field: 'UPDATE_BY',
        headerName: 'Updated By',
        width: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params: ValueFormatterParams<BlacklistI>) => params.value || '-'
      },
      {
        field: 'UPDATED_DATE',
        headerName: 'Updated Date',
        width: 170,
        filter: 'agDateColumnFilter',
        valueFormatter: (params: ValueFormatterParams<BlacklistI>) =>
          params.value ? new Date(String(params.value)).toLocaleDateString('th-TH') : '-'
      }
    ],
    []
  )

  return (
    <Card>
      <CardHeader
        title='Search Result'
        titleTypographyProps={{ variant: 'h5' }}
        action={
          <Button
            size='small'
            variant='contained'
            startIcon={<i className='tabler-upload' style={{ fontSize: 16 }} />}
            onClick={() => setOpenModalUpload(true)}
          >
            Update Blacklist
          </Button>
        }
      />
      <CardContent>
        <DxAGgridTable
          columnDefs={colDefs}
          serverSideDatasource={datasource}
          height={650}
          initialState={savedGridState}
          onStateUpdated={handleStateUpdated}
          onGridReady={handleGridReady}
          overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No blacklist vendors found</span>'
          getRowId={(params: GetRowIdParams<BlacklistI>) => {
            const row = params.data as any
            return String(row.BLACKLIST_ID || '')
          }}
        />
      </CardContent>

      <UploadBlacklistModal
        openModalUpload={openModalUpload}
        setOpenModalUpload={setOpenModalUpload}
        setIsEnableFetching={setIsEnableFetching}
      />
    </Card>
  )
}

export default SearchResult
