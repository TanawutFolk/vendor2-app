// React Imports
import { useMemo, useState } from 'react'

// MUI Imports
import { Box, Button, Card, CardContent, CardHeader, Chip, IconButton } from '@mui/material'

// react-hook-form Imports
import { useFormContext } from 'react-hook-form'

// AG Grid Imports
import type {
  ColDef,
  GetRowIdParams,
  ICellRendererParams,
  IServerSideGetRowsRequest,
  IServerSideDatasource,
  SortModelItem
} from 'ag-grid-community'

// Components Imports
import DxAGgridTable from '@/_template/DxAGgridTable'
import { useDxContext } from '@/_template/DxContextProvider'
import useDxServerSideGrid from '@/_workspace/hooks/useDxServerSideGrid'
import AddEditForm from './modal/AddEditForm'

// Services
import AssigneesServices from '@/_workspace/services/_task-manager/AssigneesServices'

// Utils
import { getChipSx } from '@/_workspace/utils/statusChipStyles'

// Types
import type { FormDataPage } from './validationSchema'
import type { AssigneeApiRow, AssigneeRow } from '@/_workspace/types/_Employee-manager/EmployeeManagerTypes'

const activeStatusTone = { bg: '#D6F4E6', color: '#087B55', border: '#5AD6A3' }
const inactiveStatusTone = { bg: '#E4E7EC', color: '#344054', border: '#98A2B3' }

const buildParamForSearch = (
  searchFilters: FormDataPage['searchFilters'],
  request: IServerSideGetRowsRequest
) => {
  const { startRow, endRow, sortModel } = request
  const limit = (endRow ?? 20) - (startRow ?? 0)

  return {
    SEARCHFILTERS: [
      { id: 'keyword', value: searchFilters.keyword || '' },
      { id: 'group_code', value: searchFilters.groupCode?.value || '' },
      { id: 'in_use', value: searchFilters.inUse || '' }
    ],
    ORDER:
      sortModel && sortModel.length > 0
        ? sortModel.map((item: SortModelItem) => ({ id: item.colId, desc: item.sort === 'desc' }))
        : [
            { id: 'group_code', desc: false },
            { id: 'empcode', desc: false }
          ],
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
  const [openDialog, setOpenDialog] = useState(false)
  const [editingData, setEditingData] = useState<AssigneeRow | null>(null)

  // Hooks : AG Grid
  const { savedGridState, handleGridReady, handleStateUpdated } = useDxServerSideGrid({
    getValues,
    setValue,
    isEnableFetching,
    setIsEnableFetching
  })

  const handleEdit = (data: AssigneeRow) => {
    setEditingData(data)
    setOpenDialog(true)
  }

  const handleAddNew = () => {
    setEditingData(null)
    setOpenDialog(true)
  }

  const datasource = useMemo<IServerSideDatasource>(
    () => ({
      getRows: async params => {
        try {
          const payload = buildParamForSearch(getValues('searchFilters'), params.request)
          const limit = payload.LIMIT

          const response = await AssigneesServices.search(payload)
          const result = (response as any)?.data

          if (result?.Status) {
            const rowData = result.ResultOnDb || []
            // A block shorter than requested means the data ran out; clamp rowCount
            // to what actually exists so the grid never re-requests missing rows.
            const totalCount = Number(result.TotalCountOnDb) || 0
            const rowCount = rowData.length < limit ? payload.START + rowData.length : totalCount
            params.success({ rowData, rowCount })
            return
          }

          params.fail()
        } catch {
          params.fail()
        }
      }
    }),
    [getValues]
  )

  const colDefs = useMemo<ColDef<AssigneeRow>[]>(
    () => [
      {
        headerName: 'Actions',
        colId: 'actions',
        pinned: 'left',
        width: 120,
        sortable: false,
        filter: false,
        cellRenderer: (params: ICellRendererParams<AssigneeRow>) => {
          if (!params.data) return null

          return (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
              <IconButton size='small' color='primary' onClick={() => handleEdit(params.data!)}>
                <i className='tabler-edit' style={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          )
        }
      },
      { field: 'EMPCODE', headerName: 'Emp. Code', flex: 1, filter: 'agTextColumnFilter' },
      { field: 'EMPNAME', headerName: 'Name', flex: 2, filter: 'agTextColumnFilter' },
      { field: 'EMPEMAIL', headerName: 'Email', flex: 2, filter: 'agTextColumnFilter' },
      { field: 'GROUP_CODE', headerName: 'Group Code', flex: 1.2, filter: 'agTextColumnFilter' },
      {
        field: 'INUSE',
        headerName: 'Status',
        flex: 1,
        filter: 'agTextColumnFilter',
        cellRenderer: (params: ICellRendererParams<AssigneeRow>) => {
          const isActive = params.value === 1 || params.value === '1'

          return (
            <Chip
              label={isActive ? 'Active' : 'Inactive'}
              size='small'
              sx={getChipSx(isActive ? activeStatusTone : inactiveStatusTone)}
            />
          )
        }
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
          <Button variant='contained' size='small' onClick={handleAddNew}>
            Add Assignee
          </Button>
        }
      />
      <CardContent>
        <DxAGgridTable
          columnDefs={colDefs}
          serverSideDatasource={datasource}
          height={600}
          initialState={savedGridState}
          onStateUpdated={handleStateUpdated}
          onGridReady={handleGridReady}
          getRowId={(params: GetRowIdParams<AssigneeRow>) => {
            const row = params.data as AssigneeApiRow
            return String(row.ASSIGNEES_TO_ID || row.EMPCODE || '')
          }}
          overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No assignees found.</span>'
        />
        <AddEditForm
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onSaved={() => setIsEnableFetching(true)}
          initialData={editingData}
        />
      </CardContent>
    </Card>
  )
}

export default SearchResult
