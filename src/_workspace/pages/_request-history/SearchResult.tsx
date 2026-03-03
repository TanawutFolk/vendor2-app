// React Imports
import { useMemo } from 'react'

// MUI Imports
import { Grid, Card, CardContent, Box, Typography, Chip, Divider, Avatar } from '@mui/material'

// AG Grid Imports
import { AgGridReact } from 'ag-grid-react'
import type { ColDef } from 'ag-grid-community'
import { themeQuartz } from 'ag-grid-community'
import 'ag-grid-enterprise'

// Component Imports
import StatusTimeline from './StatusTimeline'

// Types
import type { VendorRegisterHistory } from './types'
import type { SearchFilterValues } from './SearchFilter'

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_DATA: VendorRegisterHistory[] = [
    {
        vendor_id: 1001,
        vendor_name: 'ABC Supply Co., Ltd.',
        tax_id: '0105563012345',
        submitted_by: 'tanawut.pat',
        submitted_date: '2025-02-10',
        overall_status: 'in_progress',
        steps: [
            { step: 1, title: 'Sent to PO', description: 'Registration request sent to Procurement Officer for further processing.', status: 'completed', updatedBy: 'tanawut.pat', updatedDate: '2025-02-10 09:30' },
            { step: 2, title: 'PO Approved', description: 'Procurement Officer reviewed and approved the vendor information.', status: 'completed', updatedBy: 'somchai.k', updatedDate: '2025-02-11 10:15' },
            { step: 3, title: 'PO Requested Vendor Documents', description: 'PO sent a document request form for the vendor to complete and return.', status: 'completed', updatedBy: 'somchai.k', updatedDate: '2025-02-11 14:00' },
            { step: 4, title: 'Vendor Accepted GPR A', description: 'Awaiting vendor confirmation to submit documents as requested in GPR A.', status: 'in_progress', updatedBy: 'vendor.abc', updatedDate: '2025-02-12 09:00' },
            { step: 5, title: 'PO Check Information / GPR', description: 'PO verifies the accuracy of documents and GPR submitted by the vendor.', status: 'pending' },
            { step: 6, title: 'PO Manager Approval', description: 'Procurement Manager reviews and gives final approval before MD.', status: 'pending' },
            { step: 7, title: 'MD Approval', description: 'Managing Director officially approves the vendor registration.', status: 'pending' },
            { step: 8, title: 'Complete', description: 'Vendor is fully registered in the system and ready for use.', status: 'pending' }
        ]
    },
    {
        vendor_id: 1002,
        vendor_name: 'XYZ Components International',
        tax_id: '0105564098765',
        submitted_by: 'apinya.s',
        submitted_date: '2025-02-05',
        overall_status: 'completed',
        steps: [
            { step: 1, title: 'Sent to PO', description: 'Registration request sent to Procurement Officer.', status: 'completed', updatedBy: 'apinya.s', updatedDate: '2025-02-05 08:00' },
            { step: 2, title: 'PO Approved', description: 'Procurement Officer reviewed and approved the vendor information.', status: 'completed', updatedBy: 'somchai.k', updatedDate: '2025-02-06 09:00' },
            { step: 3, title: 'PO Requested Vendor Documents', description: 'PO sent document request form to the vendor.', status: 'completed', updatedBy: 'somchai.k', updatedDate: '2025-02-06 11:00' },
            { step: 4, title: 'Vendor Accepted GPR A', description: 'Vendor confirmed and submitted all required documents (GPR A).', status: 'completed', updatedBy: 'vendor.xyz', updatedDate: '2025-02-07 08:30' },
            { step: 5, title: 'PO Check Information / GPR', description: 'PO verified documents and GPR.', status: 'completed', updatedBy: 'manager.proc', updatedDate: '2025-02-07 14:00' },
            { step: 6, title: 'PO Manager Approval', description: 'Procurement Manager approved.', status: 'completed', updatedBy: 'manager.proc', updatedDate: '2025-02-08 09:30' },
            { step: 7, title: 'MD Approval', description: 'Managing Director officially approved the vendor registration.', status: 'completed', updatedBy: 'md.sign', updatedDate: '2025-02-09 10:00' },
            { step: 8, title: 'Complete', description: 'Vendor successfully registered in the system.', status: 'completed', updatedBy: 'system', updatedDate: '2025-02-09 10:05' }
        ]
    },
    {
        vendor_id: 1003,
        vendor_name: 'Thai Materials Group Co.',
        tax_id: '0105565011122',
        submitted_by: 'napat.w',
        submitted_date: '2025-02-15',
        overall_status: 'rejected',
        steps: [
            { step: 1, title: 'Sent to PO', description: 'Registration request sent to Procurement Officer.', status: 'completed', updatedBy: 'napat.w', updatedDate: '2025-02-15 13:00' },
            { step: 2, title: 'PO Approved', description: 'Procurement Officer reviewed and approved the vendor information.', status: 'completed', updatedBy: 'somchai.k', updatedDate: '2025-02-15 15:00' },
            { step: 3, title: 'PO Requested Vendor Documents', description: 'PO sent document request form to the vendor.', status: 'completed', updatedBy: 'somchai.k', updatedDate: '2025-02-16 09:00' },
            {
                step: 4,
                title: 'Vendor Declined GPR A',
                description: 'Vendor declined GPR A — negotiation process initiated.',
                status: 'rejected',
                updatedBy: 'vendor.thai',
                updatedDate: '2025-02-16 14:00',
                remark: 'Vendor indicated that the terms in GPR A were not acceptable.',
                branchLabel: 'Vendor Declined Path',
                branchChildren: [
                    { step: 1, title: 'Vendor Declined GPR A', description: 'Vendor rejected the offer in GPR A.', status: 'completed', updatedBy: 'vendor.thai', updatedDate: '2025-02-16 14:00' },
                    { step: 2, title: 'Issue GPR B', description: 'Issued GPR B with revised terms for second-round negotiation.', status: 'completed', updatedBy: 'somchai.k', updatedDate: '2025-02-17 10:00' },
                    { step: 3, title: 'Keep GPR B', description: 'Vendor acknowledged GPR B and is under consideration.', status: 'completed', updatedBy: 'vendor.thai', updatedDate: '2025-02-18 09:00' },
                    { step: 4, title: 'Issue GPR C', description: 'Issued GPR C as the final offer.', status: 'completed', updatedBy: 'somchai.k', updatedDate: '2025-02-19 10:00' },
                    { step: 5, title: 'Rejected', description: 'Case closed — vendor declined all offers.', status: 'rejected', updatedBy: 'manager.proc', updatedDate: '2025-02-19 16:00', remark: 'Vendor registration process terminated.' }
                ]
            },
            { step: 5, title: 'PO Check Information / GPR', description: 'PO verifies documents and GPR.', status: 'pending' },
            { step: 6, title: 'PO Manager Approval', description: 'Procurement Manager reviews and approves.', status: 'pending' },
            { step: 7, title: 'MD Approval', description: 'Managing Director approves the registration.', status: 'pending' },
            { step: 8, title: 'Complete', description: 'Vendor fully registered in the system.', status: 'pending' }
        ]
    }
]

// ─────────────────────────────────────────────────────────────────────────────
// Status Summary Chip
// ─────────────────────────────────────────────────────────────────────────────
const StatusSummaryChip = ({ label, count, color }: { label: string; count: number; color: 'success' | 'warning' | 'default' | 'error' | 'info' }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip label={`${count}`} color={color} size='small' variant='tonal' sx={{ minWidth: 28 }} />
        <Typography variant='body2' color='text.secondary'>{label}</Typography>
    </Box>
)

// ─────────────────────────────────────────────────────────────────────────────
// AG Grid Theme
// ─────────────────────────────────────────────────────────────────────────────
const agGridTheme = themeQuartz.withParams({
    spacing: 6,
    columnBorder: { style: 'solid', color: 'rgb(var(--mui-palette-primary-mainChannel) / 0.19)' },
    browserColorScheme: 'inherit',
    backgroundColor: 'var(--mui-palette-background-paper)',
    foregroundColor: 'var(--mui-palette-text-primary)',
    headerBackgroundColor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.12)',
    headerTextColor: 'var(--mui-palette-text-primary)',
    oddRowBackgroundColor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.04)',
    borderColor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.19)',
    rowHoverColor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.08)'
})

// ─────────────────────────────────────────────────────────────────────────────
// Master-Detail Renderer
// ─────────────────────────────────────────────────────────────────────────────
const DetailRenderer = ({ data }: { data: VendorRegisterHistory }) => {
    const selected = data
    if (!selected) return null

    const completedSteps = selected.steps.filter(s => s.status === 'completed').length
    const progressPct = Math.round((completedSteps / selected.steps.length) * 100)

    const statusAccent: Record<string, string> = {
        completed: '#28C76F',
        in_progress: '#FF9F43',
        rejected: '#EA5455',
        pending: '#8A8D99'
    }

    return (
        <Box sx={{ p: 4, bgcolor: 'background.default', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Card variant='outlined' sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
                <CardContent sx={{ p: '24px !important' }}>
                    <Box sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: `${statusAccent[selected.overall_status]}10`, border: '1px solid', borderColor: `${statusAccent[selected.overall_status]}25`, position: 'relative', overflow: 'hidden' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                            <Box>
                                <Typography variant='h5' fontWeight={800} sx={{ mb: 0.25 }}>{selected.vendor_name}</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <i className='tabler-id' style={{ fontSize: 13, color: 'var(--mui-palette-text-secondary)' }} />
                                    <Typography variant='body2' color='text.secondary'>TAX: {selected.tax_id}</Typography>
                                </Box>
                            </Box>
                            <Chip label={selected.overall_status.replace('_', ' ').toUpperCase()} size='medium' sx={{ fontWeight: 700, fontSize: '0.75rem', bgcolor: `${statusAccent[selected.overall_status]}20`, color: statusAccent[selected.overall_status], border: '1px solid', borderColor: `${statusAccent[selected.overall_status]}40` }} />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 3, mt: 2, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                <Avatar sx={{ width: 22, height: 22, bgcolor: 'primary.main' }}>
                                    <i className='tabler-user' style={{ fontSize: 12, color: 'var(--mui-palette-primary-contrastText)' }} />
                                </Avatar>
                                <Typography variant='caption' fontWeight={600} color='text.secondary'>{selected.submitted_by}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                <Avatar sx={{ width: 22, height: 22, bgcolor: 'primary.main' }}>
                                    <i className='tabler-calendar' style={{ fontSize: 12, color: 'var(--mui-palette-primary-contrastText)' }} />
                                </Avatar>
                                <Typography variant='caption' fontWeight={600} color='text.secondary'>{selected.submitted_date}</Typography>
                            </Box>
                        </Box>
                        <Box sx={{ mt: 2.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                                <Typography variant='caption' color='text.secondary' fontWeight={500}>Overall Progress</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                                    <Typography variant='body2' fontWeight={800} sx={{ color: statusAccent[selected.overall_status] }}>{progressPct}%</Typography>
                                    <Typography variant='caption' color='text.disabled'>({completedSteps}/{selected.steps.length})</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ height: 10, borderRadius: 5, bgcolor: 'rgba(0,0,0,0.06)', overflow: 'hidden', position: 'relative' }}>
                                <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${progressPct}%`, borderRadius: 5, background: `${statusAccent[selected.overall_status]}`, boxShadow: `0 2px 8px ${statusAccent[selected.overall_status]}60`, transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)' }} />
                            </Box>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                        <i className='tabler-timeline' style={{ fontSize: 16, color: 'var(--mui-palette-primary-main)' }} />
                        <Typography variant='subtitle2' fontWeight={700} color='text.secondary'>Registration Steps</Typography>
                        <Divider sx={{ flex: 1 }} />
                    </Box>
                    <StatusTimeline steps={selected.steps} />
                </CardContent>
            </Card>
        </Box>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main SearchResult Component
// ─────────────────────────────────────────────────────────────────────────────
interface SearchResultProps {
    activeFilters: SearchFilterValues
}

export default function SearchResult({ activeFilters }: SearchResultProps) {
    const filtered = MOCK_DATA.filter(v => {
        const matchName = !activeFilters.vendor_name || v.vendor_name.toLowerCase().includes(activeFilters.vendor_name.toLowerCase())
        const matchSubmittedBy = !activeFilters.submitted_by || v.submitted_by.toLowerCase().includes(activeFilters.submitted_by.toLowerCase())
        const matchStatus = !activeFilters.overall_status || v.overall_status === activeFilters.overall_status.value
        return matchName && matchSubmittedBy && matchStatus
    })

    const colDefs = useMemo<ColDef<VendorRegisterHistory>[]>(() => [
        {
            field: 'vendor_name',
            headerName: 'Company Name',
            flex: 1.5,
            minWidth: 260,
            cellRenderer: 'agGroupCellRenderer'
        },
        { field: 'tax_id', headerName: 'Tax ID', flex: 1, minWidth: 150 },
        { field: 'submitted_by', headerName: 'Submitted By', flex: 1, minWidth: 160 },
        { field: 'submitted_date', headerName: 'Submitted Date', flex: 1, minWidth: 150 },
        {
            field: 'overall_status',
            headerName: 'Status',
            flex: 1,
            minWidth: 140,
            cellRenderer: (params: any) => {
                if (!params.value) return null
                let color: 'success' | 'warning' | 'error' | 'default' = 'default'
                if (params.value === 'completed') color = 'success'
                if (params.value === 'in_progress') color = 'warning'
                if (params.value === 'rejected') color = 'error'
                return <Chip label={params.value.replace('_', ' ').toUpperCase()} color={color} size='small' variant='tonal' sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
            }
        }
    ], [])

    const defaultColDef = useMemo<ColDef>(() => ({
        resizable: true,
        sortable: true
    }), [])

    return (
        <Grid container spacing={6}>
            {/* Summary chips */}
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: 2 }}>
                                <i className='tabler-history' style={{ fontSize: 22, color: 'var(--mui-palette-primary-main)' }} />
                                <Typography variant='h6'>Registration Status Overview</Typography>
                            </Box>
                            <Divider orientation='vertical' flexItem />
                            <StatusSummaryChip label='All' count={MOCK_DATA.length} color='info' />
                            <StatusSummaryChip label='Completed' count={MOCK_DATA.filter(v => v.overall_status === 'completed').length} color='success' />
                            <StatusSummaryChip label='In Progress' count={MOCK_DATA.filter(v => v.overall_status === 'in_progress').length} color='warning' />
                            <StatusSummaryChip label='Rejected' count={MOCK_DATA.filter(v => v.overall_status === 'rejected').length} color='error' />
                            <StatusSummaryChip label='Pending' count={MOCK_DATA.filter(v => v.overall_status === 'pending').length} color='default' />
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            {/* Main Content Grid */}
            <Grid item xs={12}>
                <Card>
                    <CardContent sx={{ p: '24px !important' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Typography variant='subtitle1' fontWeight={700}>
                                History Results ({filtered.length})
                            </Typography>
                        </Box>

                        <Box sx={{ width: '100%', height: 600 }}>
                            <AgGridReact
                                rowData={filtered}
                                columnDefs={colDefs}
                                defaultColDef={defaultColDef}
                                theme={agGridTheme}
                                masterDetail={true}
                                detailCellRenderer={DetailRenderer}
                                detailRowAutoHeight={true}
                                domLayout='normal'
                                rowSelection='single'
                            />
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    )
}
