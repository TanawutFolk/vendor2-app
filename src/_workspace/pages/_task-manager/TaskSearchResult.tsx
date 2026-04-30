import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Button, Chip } from '@mui/material'
import type { ColDef, GridReadyEvent, ICellRendererParams, IServerSideDatasource, StateUpdatedEvent, ValueFormatterParams } from 'ag-grid-community'
import { useFormContext } from 'react-hook-form'

import DxAGgridTable from '@/_template/DxAGgridTable'
import SearchResultCard from '@_workspace/components/search/SearchResultCard'
import TaskManagerServices from '@_workspace/services/_task-manager/TaskManagerServices'
import useRequestStatusOptions from '@_workspace/react-query/useRequestStatusOptions'
import ReassignDialog from '@_workspace/components/workflow/ReassignDialog'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { useDxContext } from '@/_template/DxContextProvider'
import type { TaskManagerFormData } from './validateSchema'

type SelectOptionWithAccent = {
    value: string
    label: string
    accent?: string
}

type TaskQueueRow = Record<string, unknown> & {
    request_id?: number
    request_number?: string
    company_name?: string
    request_status?: string
    vendor_region?: string
    CREATE_DATE?: string
    workflow_type?: string
    current_step_name?: string
    current_step_code?: string
    current_group_code?: string
    current_group_name?: string
    current_owner_empcode?: string
    assignment_scope?: string
    current_owner_active?: boolean | number
    reassign_enabled?: boolean | number
    assignment_health?: string
    gpr_c_flow_id?: number
    gpr_c_step_id?: number
}

import { useState } from 'react'

const TaskSearchResult = () => {
    const user = getUserData()
    const { getValues, setValue } = useFormContext<TaskManagerFormData>()
    const gridApiRef = useRef<any>(null)
    const [dialogRow, setDialogRow] = useState<TaskQueueRow | null>(null)
    const { data: statusOptionsRaw = [] } = useRequestStatusOptions()
    const statusOptions = statusOptionsRaw as SelectOptionWithAccent[]

    // DxContext: set true by Search/Clear button
    const { isEnableFetching, setIsEnableFetching } = useDxContext()

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
                    ? sortModel.map((s: any) => ({ id: s.colId, desc: s.sort === 'desc' }))
                    : [{ id: 'request_id', desc: true }]

                // Build Order string for SQL
                const orderStr = orderParams.map((o: any) => `t.${o.id} ${o.desc ? 'DESC' : 'ASC'}`).join(', ')

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
                    params.success({ rowData: result.ResultOnDb, rowCount: result.TotalCountOnDb })
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
    useEffect(() => {
        if (isEnableFetching && gridApiRef.current) {
            setIsEnableFetching(false)
            gridApiRef.current.refreshServerSide({ purge: true })
        }
    }, [isEnableFetching, setIsEnableFetching])

    // ── Column State Persistence ──────────────────────────────────────────────
    // Read saved state once on mount — AG Grid restores it via initialState prop
    const savedGridState = useMemo(() => getValues('searchResults.agGridState'), []) // eslint-disable-line react-hooks/exhaustive-deps

    // Persist to RHF whenever AG Grid state changes (sort, pin, reorder, hide)
    const handleStateUpdated = useCallback((e: StateUpdatedEvent) => {
        setValue('searchResults.agGridState', e.state, { shouldDirty: false })
    }, [setValue])

    // ── Column Definitions ────────────────────────────────────────────────────
    const colDefs = useMemo<ColDef<TaskQueueRow>[]>(() => [
        {
            headerName: 'Action',
            field: 'action',
            width: 150,
            pinned: 'left',
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
                const statusCfg = statusOptions.find((item: SelectOptionWithAccent) => item.value === params.value)
                const accent = statusCfg?.accent || '#8A8D99'
                return (
                    <Chip
                        label={params.value || '-'}
                        size='small'
                        sx={{ bgcolor: `${accent}20`, color: accent, border: '1px solid', borderColor: `${accent}40`, fontWeight: 700 }}
                    />
                )
            },
        },
        { field: 'current_step_name', headerName: 'Current Step', flex: 1.2, minWidth: 220 },
        { field: 'current_group_name', headerName: 'Workflow Group', flex: 1.1, minWidth: 190 },
        { field: 'current_owner_empcode', headerName: 'Current Owner', width: 160 },
        {
            field: 'assignment_health',
            headerName: 'Owner Status',
            width: 150,
            cellRenderer: (params: ICellRendererParams<TaskQueueRow>) => {
                const healthy = Number(params.data?.current_owner_active)
                if (params.data?.assignment_health === 'Not Managed') {
                    return <Chip label='Not Managed' size='small' variant='tonal' />
                }
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
            field: 'assignment_scope',
            headerName: 'Scope',
            width: 150,
            valueFormatter: (params: ValueFormatterParams<TaskQueueRow>) => (
                params.value === 'REQUEST_PIC' ? 'PIC' : params.value === 'GPR_C_STEP' ? 'GPR C Step' : 'Current Step'
            ),
        },
        {
            field: 'CREATE_DATE',
            headerName: 'Submitted Date',
            width: 150,
            valueFormatter: (params: ValueFormatterParams<TaskQueueRow>) => (params.value ? new Date(params.value).toLocaleDateString('th-TH') : '-'),
        },
    ], [statusOptions])

    return (
        <SearchResultCard>
            <DxAGgridTable
                columnDefs={colDefs}
                serverSideDatasource={datasource}
                height={650}
                boxSx={{ p: 2 }}
                overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No task queue found</span>'
                getRowId={(params: any) => {
                    const reqId = params.data.request_id || 0
                    const flowId = params.data.gpr_c_flow_id || 0
                    const stepId = params.data.gpr_c_step_id || 0
                    const scope = params.data.assignment_scope || ''
                    return `${reqId}_${flowId}_${stepId}_${scope}`
                }}
                initialState={savedGridState}
                onStateUpdated={handleStateUpdated}
                onGridReady={(params: GridReadyEvent) => { gridApiRef.current = params.api }}
            />

            <ReassignDialog
                open={!!dialogRow}
                requestId={dialogRow?.request_id || null}
                scope={dialogRow?.assignment_scope || 'CURRENT_STEP'}
                gprCStepId={dialogRow?.gpr_c_step_id || null}
                groupCode={dialogRow?.current_group_code || ''}
                currentEmpCode={dialogRow?.current_owner_empcode || ''}
                updateBy={user?.EMPLOYEE_CODE || 'SYSTEM'}
                onClose={() => setDialogRow(null)}
                onSuccess={() => {
                    setDialogRow(null)
                    gridApiRef.current?.refreshServerSide({ purge: true })
                }}
            />
        </SearchResultCard>
    )
}

export default TaskSearchResult
