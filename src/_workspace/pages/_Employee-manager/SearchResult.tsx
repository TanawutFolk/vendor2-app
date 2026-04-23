import { useState, useMemo, useEffect } from 'react'
import { CardContent, IconButton, Button, Chip, Box } from '@mui/material'
import type { ColDef, ICellRendererParams } from 'ag-grid-community'
import DxAGgridTable from '@/_template/DxAGgridTable'
import { useFormContext } from 'react-hook-form'
import type { AssigneesFormData } from './validateSchema'
import { useDxContext } from '@/_template/DxContextProvider'
import { useAssignees } from '@_workspace/react-query/useAssignees'
import AddEditForm from './AddEditForm'
import { GroupChip } from '@_workspace/utils/groupChipHelper'
import SearchResultCard from '@_workspace/components/search/SearchResultCard'

type AssigneeRow = {
    empcode?: string
    empName?: string
    empEmail?: string
    group_code?: string
    group_name?: string
    INUSE?: number | string
    Assignees_id?: number
}

const SearchResult = () => {
    const { getValues } = useFormContext<AssigneesFormData>()
    const { isEnableFetching, setIsEnableFetching } = useDxContext()

    const [openDialog, setOpenDialog] = useState(false)
    const [editingData, setEditingData] = useState<AssigneeRow | null>(null)

    const { data: rowData = [], isLoading, isFetching } = useAssignees(getValues(), isEnableFetching)

    useEffect(() => {
        if (!isLoading && !isFetching && isEnableFetching) {
            setIsEnableFetching(false)
        }
    }, [isLoading, isFetching, isEnableFetching, setIsEnableFetching])

    const handleEdit = (data: AssigneeRow) => {
        setEditingData(data)
        setOpenDialog(true)
    }

    const handleAddNew = () => {
        setEditingData(null)
        setOpenDialog(true)
    }

    const colDefs = useMemo<ColDef[]>(() => [
        {
            headerName: 'Actions',
            colId: 'actions',
            pinned: 'left',
            width: 120,
            cellRenderer: (params: ICellRendererParams<AssigneeRow>) => {
                if (!params.data) return null
                return (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
                        <IconButton size='small' color='primary' onClick={() => handleEdit(params.data)}>
                            <i className='tabler-edit' style={{ fontSize: 18 }} />
                        </IconButton>
                    </Box>
                )
            }
        },
        { field: 'empcode', headerName: 'Emp. Code', flex: 1 },
        { field: 'empName', headerName: 'Name', flex: 2 },
        { field: 'empEmail', headerName: 'Email', flex: 2 },
        { field: 'group_code', headerName: 'Group Code', flex: 1.2 },
        {
            field: 'group_name',
            headerName: 'Group',
            flex: 1.5,
            cellRenderer: (params: ICellRendererParams<AssigneeRow>) => <GroupChip value={params.data?.group_code || params.value} label={String(params.value || '')} />
        },
        {
            field: 'INUSE',
            headerName: 'Status',
            flex: 1,
            cellRenderer: (params: ICellRendererParams<AssigneeRow>) => {
                const isActive = params.value === 1 || params.value === '1'
                return (
                    <Chip
                        label={isActive ? 'Active' : 'Inactive'}
                        size='small'
                        color={isActive ? 'success' : 'secondary'}
                        variant='tonal'
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
                <div className='ag-theme-alpine' style={{ height: 600, width: '100%' }}>
                    <DxAGgridTable
                        rowData={rowData}
                        columnDefs={colDefs}
                        loading={isFetching || isLoading}
                        pagination={true}
                    />
                </div>
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
