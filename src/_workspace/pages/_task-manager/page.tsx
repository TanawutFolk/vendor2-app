import { useEffect, useMemo, useState } from 'react'
import { Button, Chip, Grid } from '@mui/material'
import type { ColDef } from 'ag-grid-community'

import DxBreadCrumbs from '@/_template/DxBreadCrumbs'
import RegisterRequestServices from '@_workspace/services/_register-request/RegisterRequestServices'
import ApprovalQueueServices from '@_workspace/services/_approval-queue/ApprovalQueueServices'
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

const getValue = (row: any, ...keys: string[]) => {
    for (const key of keys) {
        if (row?.[key] !== undefined && row?.[key] !== null) return row[key]
    }
    return ''
}

const normalizeGroupToken = (value: any) => String(value || '').trim().toUpperCase().replace(/[\s-]+/g, '_').replace(/[().]+/g, '')

const compactGroupToken = (value: any) => String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '')

const buildAssigneeKeys = (row: any) => {
    const empcode = String(row?.empcode || '').trim().toUpperCase()
    if (!empcode) return []

    return [row?.group_code, row?.group_name]
        .flatMap(group => {
            const normalized = normalizeGroupToken(group)
            const compact = compactGroupToken(group)
            return [normalized, compact].filter(Boolean).map(item => `${empcode}|${item}`)
        })
}

const resolveGprCGroupCode = (stepCodeRaw: any) => {
    const stepCode = String(stepCodeRaw || '').trim().toUpperCase()
    if (['EMR_CHECKER', 'EMR_APPROVER', 'QMS_CHECKER', 'QMS_APPROVER'].includes(stepCode)) return stepCode
    if (['PM_MANAGER_CHECKER', 'PM_MANAGER_APPROVER'].includes(stepCode)) return 'PO_MGR'
    return ''
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
            const [requestRes, assigneeRes, gprCRes] = await Promise.all([
                ApprovalQueueServices.getAll({
                    SearchFilters: [],
                    ColumnFilters: [],
                    Order: [{ id: 'request_id', desc: true }],
                    Start: 0,
                    Limit: 500,
                }),
                AssigneesServices.search({}),
                RegisterRequestServices.gprCTaskManagerQueue(),
            ])

            const rawRows = requestRes.data?.ResultOnDb || []
            const assigneeRows = assigneeRes.data?.ResultOnDb || []
            const gprCRows = gprCRes.data?.ResultOnDb || []
            const activeAssigneeKeys = new Set(
                assigneeRows
                    .filter((row: any) => Number(row?.INUSE) === 1)
                    .flatMap(buildAssigneeKeys)
            )

            const activeRows = rawRows
                .map((row: any) => {
                    const approvalSteps = parseJsonArray(row.approval_steps).sort((a: any, b: any) => a.step_order - b.step_order)
                    const currentStep = approvalSteps.find((step: any) => step.step_status === 'in_progress')

                    if (!currentStep) return null

                    const isOversea = String(row.vendor_region || '').toLowerCase() === 'oversea'
                    const currentStepCode = inferStepCode(currentStep)
                    const isGprCHolderStep = currentStepCode === 'ISSUE_GPR_C'
                    const groupCode = resolveGroupCodeForStep(currentStep, isOversea)
                    const ownerEmpCode = isPicStep(currentStep) ? row.assign_to : currentStep.approver_id
                    const normalizedOwner = String(ownerEmpCode || '').trim().toUpperCase()
                    const currentOwnerActive = !groupCode || !ownerEmpCode
                        ? false
                        : activeAssigneeKeys.has(`${normalizedOwner}|${normalizeGroupToken(groupCode)}`)
                            || activeAssigneeKeys.has(`${normalizedOwner}|${compactGroupToken(groupCode)}`)

                    return {
                        ...row,
                        workflow_type: isGprCHolderStep ? 'Main Workflow (GPR C Holder)' : 'Main Workflow',
                        currentStep,
                        current_step_name: currentStep.DESCRIPTION || currentStepCode || '-',
                        current_step_code: currentStepCode,
                        current_group_code: groupCode,
                        current_group_name: isGprCHolderStep ? 'GPR C Sub-Workflow' : ASSIGNEE_GROUP_LABEL_MAP[groupCode] || groupCode || '-',
                        current_owner_empcode: ownerEmpCode || '-',
                        assignment_scope: isPicStep(currentStep) ? 'REQUEST_PIC' : 'CURRENT_STEP',
                        current_owner_active: isGprCHolderStep ? true : currentOwnerActive,
                        reassign_enabled: !isGprCHolderStep && !!groupCode && !!ownerEmpCode,
                        assignment_health: isGprCHolderStep ? 'Not Managed' : currentOwnerActive ? 'Healthy' : 'Needs Reassign',
                    }
                })
                .filter(Boolean)

            const gprCActiveRows = gprCRows.map((row: any) => {
                const stepCode = String(getValue(row, 'STEP_CODE', 'step_code') || '').trim().toUpperCase()
                const groupCode = resolveGprCGroupCode(stepCode)
                const ownerEmpCode = getValue(row, 'APPROVER_EMPCODE', 'approver_empcode')
                const normalizedOwner = String(ownerEmpCode || '').trim().toUpperCase()
                const currentOwnerActive = !groupCode || !ownerEmpCode
                    ? false
                    : activeAssigneeKeys.has(`${normalizedOwner}|${normalizeGroupToken(groupCode)}`)
                        || activeAssigneeKeys.has(`${normalizedOwner}|${compactGroupToken(groupCode)}`)

                return {
                    request_id: Number(getValue(row, 'REQUEST_ID', 'request_id')),
                    request_number: getValue(row, 'request_number', 'REQUEST_NUMBER'),
                    company_name: getValue(row, 'company_name', 'COMPANY_NAME'),
                    request_status: getValue(row, 'request_status', 'REQUEST_STATUS'),
                    vendor_region: getValue(row, 'vendor_region', 'VENDOR_REGION'),
                    CREATE_DATE: getValue(row, 'REQUEST_CREATE_DATE', 'request_create_date'),
                    workflow_type: 'GPR C Sub-Workflow',
                    current_step_name: getValue(row, 'STEP_NAME', 'step_name') || stepCode || '-',
                    current_step_code: stepCode,
                    current_group_code: groupCode,
                    current_group_name: ASSIGNEE_GROUP_LABEL_MAP[groupCode] || groupCode || 'Requester Approver',
                    current_owner_empcode: ownerEmpCode || '-',
                    assignment_scope: 'GPR_C_STEP',
                    gpr_c_flow_id: Number(getValue(row, 'GPR_C_FLOW_ID', 'gpr_c_flow_id')),
                    gpr_c_step_id: Number(getValue(row, 'GPR_C_STEP_ID', 'gpr_c_step_id')),
                    current_owner_active: groupCode ? currentOwnerActive : true,
                    reassign_enabled: !!groupCode && !!ownerEmpCode,
                    assignment_health: groupCode
                        ? (currentOwnerActive ? 'Healthy' : 'Needs Reassign')
                        : 'Not Managed',
                }
            })

            setRows([...gprCActiveRows, ...activeRows])
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
                    disabled={!params.data?.reassign_enabled}
                    onClick={() => setDialogRow(params.data)}
                >
                    Reassign
                </Button>
            ),
        },
        {
            field: 'workflow_type',
            headerName: 'Workflow',
            width: 180,
            cellRenderer: (params: any) => (
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
            valueFormatter: (params: any) => (
                params.value === 'REQUEST_PIC' ? 'PIC' : params.value === 'GPR_C_STEP' ? 'GPR C Step' : 'Current Step'
            ),
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
                />
            </Grid>

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
                    loadRows().catch(console.error)
                }}
            />
        </Grid>
    )
}
