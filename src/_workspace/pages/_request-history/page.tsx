// React Imports
import { useState } from 'react'

// MUI Imports
import { Grid, Card, CardContent, Box, Typography, Chip, TextField, InputAdornment, Divider, Avatar } from '@mui/material'

// Template Imports
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'

// Component Imports
import StatusTimeline from './StatusTimeline'
import VendorCard from './VendorCard'
import SearchFilter, { defaultSearchFilterValues } from './SearchFilter'

// Env Imports
import { MENU_NAME, breadcrumbNavigation } from './env'

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
            {
                step: 1,
                title: 'Sent to PO',
                description: 'Registration request sent to Procurement Officer for further processing.',
                status: 'completed',
                updatedBy: 'tanawut.pat',
                updatedDate: '2025-02-10 09:30'
            },
            {
                step: 2,
                title: 'PO Approved',
                description: 'Procurement Officer reviewed and approved the vendor information.',
                status: 'completed',
                updatedBy: 'somchai.k',
                updatedDate: '2025-02-11 10:15'
            },
            {
                step: 3,
                title: 'PO Requested Vendor Documents',
                description: 'PO sent a document request form for the vendor to complete and return.',
                status: 'completed',
                updatedBy: 'somchai.k',
                updatedDate: '2025-02-11 14:00'
            },
            {
                step: 4,
                title: 'Vendor Accepted GPR A',
                description: 'Awaiting vendor confirmation to submit documents as requested in GPR A.',
                status: 'in_progress',
                updatedBy: 'vendor.abc',
                updatedDate: '2025-02-12 09:00'
                // No branch shown — vendor has not rejected yet
            },
            {
                step: 5,
                title: 'PO Check Information / GPR',
                description: 'PO verifies the accuracy of documents and GPR submitted by the vendor.',
                status: 'pending'
            },
            {
                step: 6,
                title: 'PO Manager Approval',
                description: 'Procurement Manager reviews and gives final approval before MD.',
                status: 'pending'
            },
            {
                step: 7,
                title: 'MD Approval',
                description: 'Managing Director officially approves the vendor registration.',
                status: 'pending'
            },
            {
                step: 8,
                title: 'Complete',
                description: 'Vendor is fully registered in the system and ready for use.',
                status: 'pending'
            }
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
const StatusSummaryChip = ({ label, count, color }: { label: string; count: number; color: 'success' | 'warning' | 'default' | 'error' }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip label={`${count}`} color={color} size='small' variant='tonal' sx={{ minWidth: 28 }} />
        <Typography variant='body2' color='text.secondary'>{label}</Typography>
    </Box>
)

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
const RequestRegisterHistoryPage = () => {
    const [selectedId, setSelectedId] = useState<number>(MOCK_DATA[0].vendor_id)
    const [search, setSearch] = useState('')
    const [activeFilters, setActiveFilters] = useState<SearchFilterValues>(defaultSearchFilterValues)

    const filtered = MOCK_DATA.filter(v => {
        const matchName = !activeFilters.vendor_name || v.vendor_name.toLowerCase().includes(activeFilters.vendor_name.toLowerCase())
        const matchSubmittedBy = !activeFilters.submitted_by || v.submitted_by.toLowerCase().includes(activeFilters.submitted_by.toLowerCase())
        const matchStatus = !activeFilters.overall_status || v.overall_status === activeFilters.overall_status.value
        const matchSearch = !search || v.vendor_name.toLowerCase().includes(search.toLowerCase()) || v.tax_id.includes(search)
        return matchName && matchSubmittedBy && matchStatus && matchSearch
    })

    const selected = MOCK_DATA.find(v => v.vendor_id === selectedId)
    const completedSteps = selected ? selected.steps.filter(s => s.status === 'completed').length : 0
    const progressPct = selected ? Math.round((completedSteps / selected.steps.length) * 100) : 0

    const statusAccent: Record<string, string> = {
        completed: '#28C76F',
        in_progress: '#FF9F43',
        rejected: '#EA5455',
        pending: '#8A8D99'
    }

    return (
        <>
            <Grid container spacing={6}>

                {/* Header */}
                <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
                    <DxBreadCrumbs menuName={MENU_NAME} breadcrumbNavigation={breadcrumbNavigation} />
                </Grid>

                {/* Search Filter */}
                <Grid item xs={12}>
                    <SearchFilter
                        onSearch={vals => setActiveFilters(vals)}
                        onClear={() => {
                            setActiveFilters(defaultSearchFilterValues)
                            setSearch('')
                        }}
                    />
                </Grid>

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
                                <StatusSummaryChip label='Completed' count={MOCK_DATA.filter(v => v.overall_status === 'completed').length} color='success' />
                                <StatusSummaryChip label='In Progress' count={MOCK_DATA.filter(v => v.overall_status === 'in_progress').length} color='warning' />
                                <StatusSummaryChip label='Rejected' count={MOCK_DATA.filter(v => v.overall_status === 'rejected').length} color='error' />
                                <StatusSummaryChip label='Pending' count={MOCK_DATA.filter(v => v.overall_status === 'pending').length} color='default' />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Left: Vendor List */}
                <Grid item xs={12} md={4} lg={3.5}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ p: '20px !important' }}>
                            <Typography variant='subtitle1' fontWeight={700} sx={{ mb: 2 }}>
                                Vendor Requests
                                <Chip label={filtered.length} size='small' variant='tonal' sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} />
                            </Typography>

                            <TextField
                                fullWidth size='small'
                                placeholder='Search name or tax ID...'
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                sx={{ mb: 2.5 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position='start'>
                                            <i className='tabler-search' style={{ fontSize: 15, color: 'var(--mui-palette-text-disabled)' }} />
                                        </InputAdornment>
                                    )
                                }}
                            />

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: '70vh', overflowY: 'auto', pr: 0.5 }}>
                                {filtered.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', py: 6 }}>
                                        <i className='tabler-search-off' style={{ fontSize: 32, color: 'var(--mui-palette-text-disabled)' }} />
                                        <Typography variant='body2' color='text.disabled' mt={1}>No results found</Typography>
                                    </Box>
                                ) : filtered.map(vendor => (
                                    <VendorCard
                                        key={vendor.vendor_id}
                                        vendor={vendor}
                                        isSelected={vendor.vendor_id === selectedId}
                                        onClick={() => setSelectedId(vendor.vendor_id)}
                                    />
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right: Timeline Detail */}
                <Grid item xs={12} md={8} lg={8.5}>
                    {selected ? (
                        <Card>
                            <CardContent sx={{ p: '24px !important' }}>

                                {/* Vendor Hero Header */}
                                <Box
                                    sx={{
                                        p: 3,
                                        mb: 3,
                                        borderRadius: 3,
                                        background: `linear-gradient(135deg, ${statusAccent[selected.overall_status]}15 0%, ${statusAccent[selected.overall_status]}04 100%)`,
                                        border: '1px solid',
                                        borderColor: `${statusAccent[selected.overall_status]}25`,
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {/* Decorative circle */}
                                    <Box sx={{
                                        position: 'absolute', right: -20, top: -20,
                                        width: 120, height: 120, borderRadius: '50%',
                                        bgcolor: `${statusAccent[selected.overall_status]}10`
                                    }} />

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                                        <Box>
                                            <Typography variant='h5' fontWeight={800} sx={{ mb: 0.25 }}>
                                                {selected.vendor_name}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <i className='tabler-id' style={{ fontSize: 13, color: 'var(--mui-palette-text-secondary)' }} />
                                                <Typography variant='body2' color='text.secondary'>
                                                    TAX: {selected.tax_id}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Chip
                                            label={selected.overall_status.replace('_', ' ').toUpperCase()}
                                            size='medium'
                                            sx={{
                                                fontWeight: 700,
                                                fontSize: '0.75rem',
                                                bgcolor: `${statusAccent[selected.overall_status]}20`,
                                                color: statusAccent[selected.overall_status],
                                                border: '1px solid',
                                                borderColor: `${statusAccent[selected.overall_status]}40`
                                            }}
                                        />
                                    </Box>

                                    {/* Meta row */}
                                    <Box sx={{ display: 'flex', gap: 3, mt: 2, flexWrap: 'wrap' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                            <Avatar sx={{ width: 22, height: 22, bgcolor: 'primary.lightOpacity' }}>
                                                <i className='tabler-user' style={{ fontSize: 12, color: 'var(--mui-palette-primary-main)' }} />
                                            </Avatar>
                                            <Typography variant='caption' fontWeight={600} color='text.secondary'>
                                                {selected.submitted_by}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                            <Avatar sx={{ width: 22, height: 22, bgcolor: 'primary.lightOpacity' }}>
                                                <i className='tabler-calendar' style={{ fontSize: 12, color: 'var(--mui-palette-primary-main)' }} />
                                            </Avatar>
                                            <Typography variant='caption' fontWeight={600} color='text.secondary'>
                                                {selected.submitted_date}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Progress bar */}
                                    <Box sx={{ mt: 2.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                                            <Typography variant='caption' color='text.secondary' fontWeight={500}>
                                                Overall Progress
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                                                <Typography variant='body2' fontWeight={800} sx={{ color: statusAccent[selected.overall_status] }}>
                                                    {progressPct}%
                                                </Typography>
                                                <Typography variant='caption' color='text.disabled'>
                                                    ({completedSteps}/{selected.steps.length})
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ height: 10, borderRadius: 5, bgcolor: 'rgba(0,0,0,0.06)', overflow: 'hidden', position: 'relative' }}>
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    left: 0, top: 0, bottom: 0,
                                                    width: `${progressPct}%`,
                                                    borderRadius: 5,
                                                    background: `linear-gradient(90deg, ${statusAccent[selected.overall_status]}, ${statusAccent[selected.overall_status]}aa)`,
                                                    boxShadow: `0 2px 8px ${statusAccent[selected.overall_status]}60`,
                                                    transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)'
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Divider + label */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                    <i className='tabler-timeline' style={{ fontSize: 16, color: 'var(--mui-palette-primary-main)' }} />
                                    <Typography variant='subtitle2' fontWeight={700} color='text.secondary'>
                                        Registration Steps
                                    </Typography>
                                    <Divider sx={{ flex: 1 }} />
                                </Box>

                                {/* Timeline */}
                                <StatusTimeline steps={selected.steps} />

                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent>
                                <Box sx={{ textAlign: 'center', py: 10 }}>
                                    <i className='tabler-building-store' style={{ fontSize: 48, color: 'var(--mui-palette-text-disabled)' }} />
                                    <Typography variant='body1' color='text.disabled' mt={2}>
                                        Select a vendor to view registration details
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    )}
                </Grid>

            </Grid>
        </>
    )
}

export default RequestRegisterHistoryPage
