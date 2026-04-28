import { useEffect, useMemo, useState } from 'react'
import { Button, Chip, Grid } from '@mui/material'
import type { ColDef } from 'ag-grid-community'

import DxBreadCrumbs from '@/_template/DxBreadCrumbs'
import RegisterRequestServices from '@_workspace/services/_register-request/RegisterRequestServices'
import AssigneesServices from '@_workspace/services/_task-manager/AssigneesServices'
import useRequestStatusOptions from '@_workspace/react-query/useRequestStatusOptions'
import ReassignDialog from '@_workspace/components/workflow/ReassignDialog'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import {
    inferStepCode,
    isPicStep,
    resolveGroupCodeForStep,
    ASSIGNEE_GROUP_LABEL_MAP,
} from '@_workspace/utils/requestWorkflow'
import TaskSearchFilter from './TaskSearchFilter'
import TaskSearchResult from './TaskSearchResult'

const MENU_NAME = 'Task Manager'
const breadcrumbNavigation = [{ menuName: 'Home', href: '/' }, { menuName: 'Task Manager' }]

const parseJsonArray = (value: any) => {
    try {
        return typeof value === 'string' ? JSON.parse(value) : (value || [])
    } catch {
        return []
    }
}

export default function Page() {
    const user = getUserData()
    const [loading, setLoading] = useState(false)
    const [picFilter, setPicFilter] = useState<{ value: string; label: string } | null>(null)
    const [statusFilter, setStatusFilter] = useState<{ value: string; label: string } | null>(null)
    const [rows, setRows] = useState<any[]>([])
    const [picOptions, setPicOptions] = useState<Array<{ value: string; label: string }>>([])
    const [dialogRow, setDialogRow] = useState<any | null>(null)
    const { data: statusOptions = [] } = useRequestStatusOptions()

    const loadRows = async () => {
        setLoading(true)
        try {
            const [requestRes, assigneeRes] = await Promise.all([
                RegisterRequestServices.getAll({
                    SearchFilters: [],
                    ColumnFilters: [],
                    Order: [{ id: 'request_id', desc: true }],
                    Start: 0,
                    Limit: 500,
                }),
                AssigneesServices.search({}),
            ])

            const rawRows = requestRes.data?.ResultOnDb || []
            const assigneeRows = assigneeRes.data?.ResultOnDb || []
            const activeAssigneeKeys = new Set(
                assigneeRows
                    .filter((row: any) => Number(row?.INUSE) === 1)
                    .map((row: any) => `${String(row?.empcode || '').trim().toUpperCase()}|${String(row?.group_code || '').trim().toUpperCase()}`)
            )

            const activeRows = rawRows
                .map((row: any) => {
                    const approvalSteps = parseJsonArray(row.approval_steps).sort((a: any, b: any) => a.step_order - b.step_order)
                    const currentStep = approvalSteps.find((step: any) => step.step_status === 'in_progress')

                    if (!currentStep) return null

                    const isOversea = String(row.vendor_region || '').toLowerCase() === 'oversea'
                    const groupCode = resolveGroupCodeForStep(currentStep, isOversea)
                    const ownerEmpCode = isPicStep(currentStep) ? row.assign_to : currentStep.approver_id
                    const ownerGroupKey = `${String(ownerEmpCode || '').trim().toUpperCase()}|${String(groupCode || '').trim().toUpperCase()}`
                    const currentOwnerActive = !groupCode || !ownerEmpCode ? false : activeAssigneeKeys.has(ownerGroupKey)

                    return {
                        ...row,
                        currentStep,
                        current_step_name: currentStep.DESCRIPTION || inferStepCode(currentStep) || '-',
                        current_step_code: inferStepCode(currentStep),
                        current_group_code: groupCode,
                        current_group_name: ASSIGNEE_GROUP_LABEL_MAP[groupCode] || groupCode || '-',
                        current_owner_empcode: ownerEmpCode || '-',
                        assignment_scope: isPicStep(currentStep) ? 'REQUEST_PIC' : 'CURRENT_STEP',
                        current_owner_active: currentOwnerActive,
                        assignment_health: currentOwnerActive ? 'Healthy' : 'Needs Reassign',
                    }
                })
                .filter(Boolean)

            setRows(activeRows)
            setPicOptions(
                Array.from(
                    new Map(
                        assigneeRows
                            .filter((row: any) => Number(row?.INUSE) === 1 && String(row?.empcode || '').trim())
                            .map((row: any) => {
                                const empcode = String(row.empcode || '').trim()
                                const empName = String(row.empName || '').trim()

                                return [
                                    empcode,
                                    {
                                        value: empcode,
                                        label: empName ? `${empcode} - ${empName}` : empcode,
                                    },
                                ]
                            })
                    ).values()
                )
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadRows().catch(console.error)
    }, [])

    const filteredRows = useMemo(() => {
        const normalizedPic = String(picFilter?.value || '').trim().toLowerCase()

        return rows.filter((row: any) => {
            const matchesStatus = !statusFilter?.value || row.request_status === statusFilter.value
            const matchesPic =
                !normalizedPic ||
                String(row.current_owner_empcode || '').toLowerCase().includes(normalizedPic)

            return matchesStatus && matchesPic
        })
    }, [rows, picFilter, statusFilter])

    const colDefs = useMemo<ColDef[]>(() => [
        {
            headerName: 'Action',
            field: 'action',
            width: 150,
            pinned: 'left',
            cellRenderer: (params: any) => (
                <Button
                    size='small'
                    variant='contained'
                    color='warning'
                    onClick={() => setDialogRow(params.data)}
                >
                    Reassign
                </Button>
            ),
        },
        { field: 'request_id', headerName: 'Request ID', width: 120 },
        { field: 'company_name', headerName: 'Company Name', flex: 1.5, minWidth: 220 },
        {
            field: 'request_status',
            headerName: 'Status',
            width: 180,
            cellRenderer: (params: any) => {
                const statusCfg = statusOptions.find((item: any) => item.value === params.value)
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
            cellRenderer: (params: any) => {
                const healthy = params.data?.current_owner_active
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
            valueFormatter: (params: any) => (params.value === 'REQUEST_PIC' ? 'PIC' : 'Current Step'),
        },
        {
            field: 'CREATE_DATE',
            headerName: 'Submitted Date',
            width: 150,
            valueFormatter: (params: any) => (params.value ? new Date(params.value).toLocaleDateString('th-TH') : '-'),
        },
    ], [statusOptions])

    return (
        <Grid container spacing={6}>
            <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
                <DxBreadCrumbs menuName={MENU_NAME} breadcrumbNavigation={breadcrumbNavigation} />
            </Grid>

            <Grid item xs={12}>
                <TaskSearchFilter
                    statusOptions={statusOptions}
                    picOptions={picOptions}
                    picFilter={picFilter}
                    statusFilter={statusFilter}
                    onPicFilterChange={setPicFilter}
                    onStatusFilterChange={setStatusFilter}
                    onSearch={() => loadRows().catch(console.error)}
                    onClear={() => {
                        setPicFilter(null)
                        setStatusFilter(null)
                    }}
                />
            </Grid>

            <Grid item xs={12}>
                <TaskSearchResult
                    filteredRows={filteredRows}
                    colDefs={colDefs}
                    loading={loading}
                    onRefresh={() => loadRows().catch(console.error)}
                />
            </Grid>

            <ReassignDialog
                open={!!dialogRow}
                requestId={dialogRow?.request_id || null}
                scope={dialogRow?.assignment_scope || 'CURRENT_STEP'}
                groupCode={dialogRow?.current_group_code || ''}
                currentEmpCode={dialogRow?.current_owner_empcode || ''}
                updateBy={user?.EMPLOYEE_CODE || 'SYSTEM'}
                onClose={() => setDialogRow(null)}
                onSuccess={() => {
                    setDialogRow(null)
                    loadRows().catch(console.error)
                }}
            />
        </Grid>
    )
}
