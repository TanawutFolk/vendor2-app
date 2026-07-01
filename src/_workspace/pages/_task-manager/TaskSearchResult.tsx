import { useMemo } from 'react'
import { Box, Button, Chip, Typography } from '@mui/material'
import type { ColDef, GetRowIdParams, ICellRendererParams, IServerSideDatasource, SortModelItem, ValueFormatterParams } from 'ag-grid-community'
import { useFormContext } from 'react-hook-form'

import DxAGgridTable from '@/_template/DxAGgridTable'
import SearchResultCard from '@_workspace/components/search/SearchResultCard'
import TaskManagerServices from '@_workspace/services/_task-manager/TaskManagerServices'
import ReassignDialog from '@_workspace/components/workflow/ReassignDialog'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { useDxContext } from '@/_template/DxContextProvider'
import useDxServerSideGrid from '@_workspace/hooks/useDxServerSideGrid'
import type { TaskManagerFormData } from './validateSchema'



import { useState } from 'react'
import type { TaskQueueRow } from '@_workspace/types/_task-manager/TaskManagerTypes'

const TaskSearchResult = () => {
    const user = getUserData()
    const { getValues, setValue } = useFormContext<TaskManagerFormData>()
    const [dialogRow, setDialogRow] = useState<TaskQueueRow | null>(null)

    // DxContext: set true by Search/Clear button
    const { isEnableFetching, setIsEnableFetching } = useDxContext()
    const { savedGridState, handleGridReady, handleStateUpdated, refreshServerSide } = useDxServerSideGrid({
        getValues,
        setValue,
        isEnableFetching,
        setIsEnableFetching,
        lockedLeftColIds: ['action', 'request_number']
    })

    // ── Server-Side Datasource ────────────────────────────────────────────────
    const datasource = useMemo<IServerSideDatasource>(() => ({
        getRows: async (params) => {
            try {
                const { startRow, endRow } = params.request
                const limit = (endRow ?? 50) - (startRow ?? 0)

                const currentFilters = getValues('searchFilters')

                // Build Order from AG Grid sort model
                const sortModel = params.request.sortModel
                const orderParams = sortModel && sortModel.length > 0
                    ? sortModel.map((item: SortModelItem) => ({ id: item.colId, desc: item.sort === 'desc' }))
                    : [{ id: 'request_id', desc: true }]

                // Build Order string for SQL
                const orderStr = orderParams.map(item => `t.${item.id} ${item.desc ? 'DESC' : 'ASC'}`).join(', ')

                const res = await TaskManagerServices.searchAllTask({
                    SearchFilters: [
                        { id: 'request_status', value: currentFilters?.statusFilter?.value || '' },
                        { id: 'current_owner_empcode', value: currentFilters?.picFilter?.value || '' },
                    ],
                    ColumnFilters: [],
                    Order: orderStr,
                    Offset: startRow ?? 0,
                    Limit: limit
                })

                const result = res?.data
                if (result?.Status) {
                    const rowData = (result.ResultOnDb || []).map((row: Record<string, unknown>) => ({
                        ...row,
                        request_id: row.request_id ?? row.REQUEST_REGISTER_VENDOR_ID,
                        request_number: row.request_number ?? row.REQUEST_NUMBER,
                        company_name: row.company_name ?? row.COMPANY_NAME,
                        request_status: row.request_status ?? row.REQUEST_STATUS,
                        request_state: row.request_state ?? row.REQUEST_STATE,
                        vendor_region: row.vendor_region ?? row.VENDOR_REGION,
                        CREATE_DATE: row.CREATE_DATE ?? row.create_date,
                    }))
                    params.success({ rowData, rowCount: result.TotalCountOnDb })
                } else {
                    params.fail()
                }
            } catch {
                params.fail()
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), []) // getValues is a stable ref — no need to re-create datasource

    // Trigger refresh when Search button is clicked
    // ── Column State Persistence ──────────────────────────────────────────────
    // Read saved state once on mount — AG Grid restores it via initialState prop
    // ── Column Definitions ────────────────────────────────────────────────────
    const colDefs = useMemo<ColDef<TaskQueueRow>[]>(() => [
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
                    disabled={!Number(params.data?.reassign_enabled)}
                    onClick={() => setDialogRow(params.data || null)}
                >
                    Reassign
                </Button>
            ),
        },
        {
            field: 'request_number',
            headerName: 'Request Number',
            width: 170,
            pinned: 'left',
            lockPinned: true,
            suppressMovable: true,
            valueGetter: params => params.data?.request_number || params.data?.request_id || '-',
        },
        {
            field: 'workflow_type',
            headerName: 'Workflow',
            width: 180,
            cellRenderer: (params: ICellRendererParams<TaskQueueRow>) => (
                <Chip
                    label={params.value || '-'}
                    size='small'
                    color={String(params.value || '').includes('GPR C') ? 'info' : 'default'}
                    variant='tonal'
                />
            ),
        },
        { field: 'request_id', headerName: 'Request ID', width: 120 },
        { field: 'company_name', headerName: 'Company Name', flex: 1.5, minWidth: 220 },
        {
            field: 'request_status',
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
                            bgcolor: 'transparent',
                        }}
                    >
                        <Typography variant='caption' fontWeight={700} color='text.secondary' noWrap>
                            {params.value || '-'}
                        </Typography>
                    </Box>
                )
            },
        },
        { field: 'current_step_name', headerName: 'Current Step', flex: 1.2, minWidth: 220 },
        { field: 'current_group_name', headerName: 'PO PIC Group', flex: 1.1, minWidth: 190 },
        { field: 'current_owner_empcode', headerName: 'PO PIC (assign_to)', width: 170 },
        {
            field: 'assignment_health',
            headerName: 'PO PIC Status',
            width: 150,
            cellRenderer: (params: ICellRendererParams<TaskQueueRow>) => {
                const healthy = Number(params.data?.current_owner_active)
                return (
                    <Chip
                        label={healthy ? 'Active' : 'Needs Reassign'}
                        size='small'
                        color={healthy ? 'success' : 'warning'}
                        variant='tonal'
                    />
                )
            },
        },
        {
            field: 'CREATE_DATE',
            headerName: 'Submitted Date',
            width: 150,
            valueFormatter: (params: ValueFormatterParams<TaskQueueRow>) => (params.value ? new Date(params.value).toLocaleDateString('th-TH') : '-'),
        },
    ], [])

    return (
        <SearchResultCard>
            <DxAGgridTable
                columnDefs={colDefs}
                serverSideDatasource={datasource}
                height={650}
                boxSx={{ p: 2 }}
                overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No task queue found</span>'
                getRowId={(params: GetRowIdParams<TaskQueueRow>) => {
                    return String(params.data.request_id || params.data.REQUEST_REGISTER_VENDOR_ID || 0)
                }}
                initialState={savedGridState}
                onStateUpdated={handleStateUpdated}
                onGridReady={handleGridReady}
            />

            <ReassignDialog
                open={!!dialogRow}
                requestId={dialogRow?.request_id || null}
                groupCode={dialogRow?.current_group_code || ''}
                currentEmpCode={dialogRow?.current_owner_empcode || ''}
                updateBy={user?.EMPLOYEE_CODE || 'SYSTEM'}
                onClose={() => setDialogRow(null)}
                onSuccess={() => {
                    setDialogRow(null)
                    refreshServerSide()
                }}
            />
        </SearchResultCard>
    )
}

export default TaskSearchResult
