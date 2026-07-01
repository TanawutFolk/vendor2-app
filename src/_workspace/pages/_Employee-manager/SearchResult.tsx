import { useMemo, useState } from 'react'
import { CardContent, IconButton, Button, Chip, Box } from '@mui/material'
import type { ColDef, GetRowIdParams, ICellRendererParams, IServerSideDatasource, SortModelItem } from 'ag-grid-community'
import DxAGgridTable from '@/_template/DxAGgridTable'
import { useFormContext } from 'react-hook-form'
import type { AssigneeRow, AssigneesFormData } from './validateSchema'
import { useDxContext } from '@/_template/DxContextProvider'
import AddEditForm from './AddEditForm'
import SearchResultCard from '@_workspace/components/search/SearchResultCard'
import useDxServerSideGrid from '@_workspace/hooks/useDxServerSideGrid'
import AssigneesServices from '@_workspace/services/_task-manager/AssigneesServices'
import { getChipSx } from '@_workspace/utils/statusChipStyles'
import type { AssigneeApiRow } from '@_workspace/types/_Employee-manager/EmployeeManagerTypes'

const activeStatusTone = { bg: '#D6F4E6', color: '#087B55', border: '#5AD6A3' }
const inactiveStatusTone = { bg: '#E4E7EC', color: '#344054', border: '#98A2B3' }



const SearchResult = () => {
    const { getValues, setValue } = useFormContext<AssigneesFormData>()
    const { isEnableFetching, setIsEnableFetching } = useDxContext()

    const [openDialog, setOpenDialog] = useState(false)
    const [editingData, setEditingData] = useState<AssigneeRow | null>(null)
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

    const datasource = useMemo<IServerSideDatasource>(() => ({
        getRows: async params => {
            try {
                const { startRow, endRow, sortModel } = params.request
                const limit = (endRow ?? 20) - (startRow ?? 0)
                const currentFilters = getValues('searchFilters')

                const payload = {
                    SearchFilters: [
                        { id: 'keyword', value: currentFilters.keyword || '' },
                        { id: 'group_code', value: currentFilters.group_code?.value || '' },
                        { id: 'in_use', value: currentFilters.in_use || '' },
                    ],
                    Order: sortModel && sortModel.length > 0
                        ? sortModel.map((item: SortModelItem) => ({ id: item.colId, desc: item.sort === 'desc' }))
                        : [{ id: 'group_code', desc: false }, { id: 'empcode', desc: false }],
                    Start: startRow ?? 0,
                    Limit: limit || 20,
                }

                const response = await AssigneesServices.search(payload)
                const result = response.data

                if (result?.Status) {
                    const rowData = (result.ResultOnDb || []).map((row: AssigneeApiRow) => ({
                        ...row,
                        Assignees_id: row.Assignees_id ?? row.ASSIGNEES_TO_ID,
                        empcode: row.empcode ?? row.EMPCODE,
                        empName: row.empName ?? row.EMPNAME,
                        empEmail: row.empEmail ?? row.EMPEMAIL,
                        group_code: row.group_code ?? row.GROUP_CODE,
                        group_name: row.group_name ?? row.GROUP_NAME,
                        INUSE: row.INUSE,
                    }))
                    params.success({
                        rowData,
                        rowCount: result.TotalCountOnDb || 0,
                    })
                    return
                }

                params.fail()
            } catch {
                params.fail()
            }
        },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [])

    const colDefs = useMemo<ColDef<AssigneeRow>[]>(() => [
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
        { field: 'empcode', headerName: 'Emp. Code', flex: 1, filter: 'agTextColumnFilter' },
        { field: 'empName', headerName: 'Name', flex: 2, filter: 'agTextColumnFilter' },
        { field: 'empEmail', headerName: 'Email', flex: 2, filter: 'agTextColumnFilter' },
        { field: 'group_code', headerName: 'Group Code', flex: 1.2, filter: 'agTextColumnFilter' },
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
    ], [])

    return (
        <SearchResultCard action={
            <Button variant='contained' size='small' onClick={handleAddNew}>
                Add Assignee
            </Button>
        }>
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
                        return String(row.Assignees_id || row.ASSIGNEES_TO_ID || row.empcode || row.EMPCODE || '')
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
        </SearchResultCard>
    )
}

export default SearchResult
