import { useEffect, useMemo, useState } from 'react'
import {
    Box,
    Button,
    CardContent,
    Chip,
    Grid,
    MenuItem,
    TextField,
    Typography
} from '@mui/material'
import type { ColDef } from 'ag-grid-community'

import DxBreadCrumbs from '@/_template/DxBreadCrumbs'
import DxAGgridTable from '@/_template/DxAGgridTable'
import RegisterRequestServices from '@_workspace/services/_register-request/RegisterRequestServices'
import useRequestStatusOptions from '@_workspace/react-query/useRequestStatusOptions'
import ReassignDialog from '@_workspace/components/workflow/ReassignDialog'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import {
    inferStepCode,
    isPicStep,
    resolveGroupCodeForStep,
    ASSIGNEE_GROUP_LABEL_MAP
} from '@_workspace/utils/requestWorkflow'
import SearchFilterCard from '@_workspace/components/search/SearchFilterCard'
import SearchResultCard from '@_workspace/components/search/SearchResultCard'

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
    const [collapse, setCollapse] = useState(false)
    const [loading, setLoading] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [rows, setRows] = useState<any[]>([])
    const [dialogRow, setDialogRow] = useState<any | null>(null)
    const { data: statusOptions = [] } = useRequestStatusOptions()

    const loadRows = async () => {
        setLoading(true)
        try {
            const res = await RegisterRequestServices.getAll({
                SearchFilters: [],
                ColumnFilters: [],
                Order: [{ id: 'request_id', desc: true }],
                Start: 0,
                Limit: 500
            })

            const rawRows = res.data?.ResultOnDb || []
            const activeRows = rawRows
                .map((row: any) => {
                    const approvalSteps = parseJsonArray(row.approval_steps).sort((a: any, b: any) => a.step_order - b.step_order)
                    const currentStep = approvalSteps.find((step: any) => step.step_status === 'in_progress')

                    if (!currentStep) return null

                    const isOversea = String(row.vendor_region || '').toLowerCase() === 'oversea'
                    const groupCode = resolveGroupCodeForStep(currentStep, isOversea)
                    const ownerEmpCode = isPicStep(currentStep) ? row.assign_to : currentStep.approver_id

                    return {
                        ...row,
                        currentStep,
                        current_step_name: currentStep.DESCRIPTION || inferStepCode(currentStep) || '-',
                        current_step_code: inferStepCode(currentStep),
                        current_group_code: groupCode,
                        current_group_name: ASSIGNEE_GROUP_LABEL_MAP[groupCode] || groupCode || '-',
                        current_owner_empcode: ownerEmpCode || '-',
                        assignment_scope: isPicStep(currentStep) ? 'REQUEST_PIC' : 'CURRENT_STEP'
                    }
                })
                .filter(Boolean)

            setRows(activeRows)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadRows().catch(console.error)
    }, [])

    const filteredRows = useMemo(() => {
        const keyword = searchText.trim().toLowerCase()

        return rows.filter((row: any) => {
            const matchesStatus = !statusFilter || row.request_status === statusFilter
            const matchesKeyword =
                !keyword ||
                String(row.company_name || '').toLowerCase().includes(keyword) ||
                String(row.request_id || '').toLowerCase().includes(keyword) ||
                String(row.current_owner_empcode || '').toLowerCase().includes(keyword) ||
                String(row.current_step_name || '').toLowerCase().includes(keyword)

            return matchesStatus && matchesKeyword
        })
    }, [rows, searchText, statusFilter])

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
            )
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
            }
        },
        { field: 'current_step_name', headerName: 'Current Step', flex: 1.2, minWidth: 220 },
        { field: 'current_group_name', headerName: 'Workflow Group', flex: 1.1, minWidth: 190 },
        { field: 'current_owner_empcode', headerName: 'Current Owner', width: 160 },
        {
            field: 'assignment_scope',
            headerName: 'Scope',
            width: 150,
            valueFormatter: (params: any) => params.value === 'REQUEST_PIC' ? 'PIC' : 'Current Step'
        },
        {
            field: 'CREATE_DATE',
            headerName: 'Submitted Date',
            width: 150,
            valueFormatter: (params: any) => params.value ? new Date(params.value).toLocaleDateString('th-TH') : '-'
        }
    ], [statusOptions])

    return (
        <Grid container spacing={6}>
            <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
                <DxBreadCrumbs menuName={MENU_NAME} breadcrumbNavigation={breadcrumbNavigation} />
            </Grid>

            <Grid item xs={12}>
                <SearchFilterCard collapse={collapse} onToggle={() => setCollapse(!collapse)}>
                    <Grid container spacing={4}>
                        <Grid item xs={12}>
                            <Typography variant='body2' color='text.secondary'>
                                Use this page to move ongoing work to another responsible person.
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={5}>
                            <TextField
                                fullWidth
                                label='Search'
                                placeholder='Company, request id, owner, current step'
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                select
                                fullWidth
                                label='Status'
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                            >
                                <MenuItem value=''>All</MenuItem>
                                {statusOptions.map((item: any) => (
                                    <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={3} className='flex gap-3'>
                            <Button variant='contained' onClick={() => loadRows().catch(console.error)}>Search</Button>
                            <Button variant='tonal' color='secondary' onClick={() => { setSearchText(''); setStatusFilter('') }}>Clear</Button>
                        </Grid>
                    </Grid>
                </SearchFilterCard>
            </Grid>

            <Grid item xs={12}>
                <SearchResultCard action={
                    <Button
                        size='small'
                        variant='tonal'
                        startIcon={<i className='tabler-refresh' style={{ fontSize: 16 }} />}
                        onClick={() => loadRows().catch(console.error)}
                    >
                        Refresh
                    </Button>
                }>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant='subtitle1' fontWeight={700}>
                                Results ({filteredRows.length})
                            </Typography>
                        </Box>
                        <DxAGgridTable
                            rowData={filteredRows}
                            columnDefs={colDefs}
                            loading={loading}
                            pagination={true}
                            height={650}
                        />
                    </CardContent>
                </SearchResultCard>
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
