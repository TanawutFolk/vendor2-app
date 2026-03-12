import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, IconButton, Button, Typography, Chip, Box } from '@mui/material'
import type { ColDef } from 'ag-grid-community'
import DxAGgridTable from '@/_template/DxAGgridTable'
import { useFormContext } from 'react-hook-form'
import type { AssigneesFormData } from './validateSchema'
import { useDxContext } from '@/_template/DxContextProvider'
import { useAssignees } from '@_workspace/react-query/useAssignees'
import { useDeleteAssignee } from '@_workspace/react-query/useAssigneesMutation'
import AddEditForm from './AddEditForm'
import { GroupChip } from '@_workspace/utils/groupChipHelper'

const SearchResult = () => {
    const { getValues } = useFormContext<AssigneesFormData>()
    const { isEnableFetching, setIsEnableFetching } = useDxContext()

    // Manage Form Modal State
    const [openDialog, setOpenDialog] = useState(false)
    const [editingData, setEditingData] = useState<any>(null)

    // Fetch Data
    const { data: rowData = [], isLoading, isFetching } = useAssignees(getValues(), isEnableFetching)

    // Delete Mutation
    const { mutate: deleteAssignee } = useDeleteAssignee()

    // Stop fetching loop after load
    useMemo(() => {
        if (!isLoading && !isFetching && isEnableFetching) {
            setIsEnableFetching(false)
        }
    }, [isLoading, isFetching, isEnableFetching, setIsEnableFetching])

    const handleEdit = (data: any) => {
        setEditingData(data)
        setOpenDialog(true)
    }

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this assignee?')) {
            deleteAssignee(id)
        }
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
            cellRenderer: (params: any) => {
                if (!params.data) return null
                return (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
                        <IconButton size='small' color='primary' onClick={() => handleEdit(params.data)}>
                            <i className='tabler-edit' style={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton size='small' color='error' onClick={() => handleDelete(params.data.Assignees_id)}>
                            <i className='tabler-trash' style={{ fontSize: 18 }} />
                        </IconButton>
                    </Box>
                )
            }
        },
        { field: 'empcode', headerName: 'Emp. Code', flex: 1 },
        { field: 'empName', headerName: 'Name', flex: 2 },
        { field: 'empEmail', headerName: 'Email', flex: 2 },
        {
            field: 'group_name',
            headerName: 'Group',
            flex: 1.5,
            cellRenderer: (params: any) => <GroupChip value={params.value} />
        },
        {
            field: 'INUSE',
            headerName: 'Status',
            flex: 1,
            cellRenderer: (params: any) => {
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
        <Card>
            <CardHeader
                title={<Typography variant='h5'>Search Result</Typography>}

            />
            <CardContent>
                <div className='ag-theme-alpine' style={{ height: 600, width: '100%' }}>
                    <DxAGgridTable
                        rowData={rowData}
                        columnDefs={colDefs}
                        loading={isFetching || isLoading}
                        pagination={true}
                    />
                </div>
                {/* Add/Edit Modal */}
            <AddEditForm
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                initialData={editingData}
            />
            </CardContent>

            
        </Card>
    )
}

export default SearchResult
