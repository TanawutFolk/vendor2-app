// React Imports
import { useState, useMemo } from 'react'

// MUI Imports
import {
    Grid, Card, CardContent, Box, Typography, Chip, Divider
} from '@mui/material'

// Template Imports
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'

// Component Imports
import RequestCard from './RequestCard'
import RequestDetail from './RequestDetail'
import SearchFilter from './SearchFilter'
import type { SearchFilterValues } from './SearchFilter'

// Env Imports
import { MENU_NAME, breadcrumbNavigation } from './env'

// Types
import type { RegistrationRequest } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_REQUESTS: RegistrationRequest[] = [
    {
        request_id: 1,
        vendor_id: 2001,
        status: 'new',
        submitted_by: 'tanawut.pat',
        submitted_date: '2025-02-10',
        support_type: 'Production Process',
        purchase_frequency: '4 times / year',
        company_name: 'ABC Supply Co., Ltd.',
        vendor_type: 'Manufacturer',
        province: 'Bangkok',
        postal_code: '10400',
        tel_center: '02-123-4567',
        website: 'https://abcsupply.co.th',
        address: '123 Sukhumvit Rd., Klongtoey, Bangkok 10110',
        contacts: [
            { contact_name: 'Somchai Jaidee', tel_phone: '081-234-5678', email: 'somchai@abcsupply.co.th', position: 'Sales Manager' },
            { contact_name: 'Napat Wongdee', tel_phone: '089-876-5432', email: 'napat@abcsupply.co.th', position: 'Accounting' }
        ],
        products: [
            { product_group: 'Raw Materials', product_main: 'Metal', product_sub: 'Steel Sheet' },
            { product_group: 'Raw Materials', product_main: 'Plastic', product_sub: 'PVC Pipe', note: 'Custom sizes available' }
        ]
    },
    {
        request_id: 2,
        vendor_id: 2002,
        status: 'in_progress',
        submitted_by: 'apinya.s',
        submitted_date: '2025-02-12',
        company_name: 'XYZ Components International',
        vendor_type: 'Distributor',
        province: 'Chonburi',
        postal_code: '20000',
        tel_center: '038-456-7890',
        address: '88/9 Moo 5, Laem Chabang Industrial Estate, Chonburi',
        contacts: [
            { contact_name: 'Apinya Srisuk', tel_phone: '089-111-2222', email: 'apinya@xyzcomp.com', position: 'Director' }
        ],
        products: [
            { product_group: 'Components', product_main: 'Electronic', product_sub: 'PCB Assembly' },
            { product_group: 'Components', product_main: 'Mechanical', product_sub: 'Precision Parts' }
        ]
    },
    {
        request_id: 3,
        vendor_id: 2003,
        status: 'pending_docs',
        submitted_by: 'napat.w',
        submitted_date: '2025-02-14',
        support_type: 'Raw Material Supply',
        purchase_frequency: '12 times / year',
        company_name: 'Thai Materials Group Co.',
        vendor_type: 'Raw Material Supplier',
        province: 'Rayong',
        postal_code: '21000',
        tel_center: '038-789-0123',
        website: 'https://thaimaterials.com',
        address: '55 Eastern Seaboard Industrial Estate, Rayong',
        contacts: [
            { contact_name: 'Wanchai Prasert', tel_phone: '087-333-4444', email: 'wanchai@thaimaterials.com', position: 'Procurement' }
        ],
        products: [
            { product_group: 'Raw Materials', product_main: 'Chemical', product_sub: 'Industrial Solvent' }
        ]
    },
    {
        request_id: 4,
        vendor_id: 2004,
        status: 'approved',
        submitted_by: 'somchai.k',
        submitted_date: '2025-02-05',
        company_name: 'Precision Parts Ltd.',
        vendor_type: 'Manufacturer',
        province: 'Samut Prakan',
        postal_code: '10280',
        tel_center: '02-987-6543',
        address: '999 Bangpoo Industrial Estate, Samut Prakan',
        contacts: [
            { contact_name: 'Krit Manee', tel_phone: '081-555-6666', email: 'krit@precisionparts.co.th', position: 'CEO' }
        ],
        products: [
            { product_group: 'Components', product_main: 'Mechanical', product_sub: 'CNC Machined Parts' },
            { product_group: 'Components', product_main: 'Mechanical', product_sub: 'Die Casting Parts' }
        ]
    },
    {
        request_id: 5,
        vendor_id: 2005,
        status: 'rejected',
        submitted_by: 'wichaya.p',
        submitted_date: '2025-01-28',
        support_type: 'Finished Goods Import',
        purchase_frequency: '2 times / year',
        company_name: 'Global Trade Solutions',
        vendor_type: 'Importer',
        province: 'Pathum Thani',
        postal_code: '12120',
        tel_center: '02-654-3210',
        address: '100 Navanakorn Industrial Estate, Pathum Thani',
        contacts: [
            { contact_name: 'Wichaya Pruk', tel_phone: '088-999-0000', email: 'wichaya@globaltrade.co.th' }
        ],
        products: [
            { product_group: 'Finished Goods', product_main: 'Consumer', product_sub: 'Electronic Devices' }
        ]
    }
]

// ─────────────────────────────────────────────────────────────────────────────
// Status count helper
// ─────────────────────────────────────────────────────────────────────────────
const StatusSummaryChip = ({ label, count, color }: { label: string; count: number; color: 'success' | 'warning' | 'default' | 'error' | 'info' }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip label={`${count}`} color={color} size='small' variant='tonal' sx={{ minWidth: 28 }} />
        <Typography variant='body2' color='text.secondary'>{label}</Typography>
    </Box>
)

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
const RequestRegisterPage = () => {
    const [selectedId, setSelectedId] = useState<number>(MOCK_REQUESTS[0].request_id)
    const [filterValues, setFilterValues] = useState<SearchFilterValues | null>(null)

    const filtered = useMemo(() =>
        MOCK_REQUESTS.filter(r => {
            if (!filterValues) return true
            const matchName = !filterValues.company_name ||
                r.company_name.toLowerCase().includes(filterValues.company_name.toLowerCase())
            const matchBy = !filterValues.submitted_by ||
                r.submitted_by.toLowerCase().includes(filterValues.submitted_by.toLowerCase())
            const matchStatus = !filterValues.status || r.status === filterValues.status.value
            return matchName && matchBy && matchStatus
        }),
        [filterValues]
    )

    const selected = MOCK_REQUESTS.find(r => r.request_id === selectedId) ?? MOCK_REQUESTS[0]

    // Auto-select first when filter changes and current selected is hidden
    const isSelectedVisible = filtered.some(r => r.request_id === selectedId)
    if (!isSelectedVisible && filtered.length > 0) {
        setSelectedId(filtered[0].request_id)
    }

    // Summary counts
    const counts = {
        new: MOCK_REQUESTS.filter(r => r.status === 'new').length,
        in_progress: MOCK_REQUESTS.filter(r => r.status === 'in_progress').length,
        pending_docs: MOCK_REQUESTS.filter(r => r.status === 'pending_docs').length,
        approved: MOCK_REQUESTS.filter(r => r.status === 'approved').length,
        rejected: MOCK_REQUESTS.filter(r => r.status === 'rejected').length,
    }

    return (
        <>
            <Grid container spacing={6}>

                {/* Header */}
                <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
                    <DxBreadCrumbs menuName={MENU_NAME} breadcrumbNavigation={breadcrumbNavigation} />
                </Grid>

                {/* Search Filters */}
                <Grid item xs={12}>
                    <SearchFilter
                        onSearch={values => setFilterValues(values)}
                        onClear={() => setFilterValues(null)}
                    />
                </Grid>

                {/* Summary bar */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant='h6' fontWeight={800}>Registration Requests</Typography>
                                    <Typography variant='caption' color='text.secondary'>Pending PO department review</Typography>
                                </Box>
                                <Divider orientation='vertical' flexItem />
                                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                                    <StatusSummaryChip label='New' count={counts.new} color='info' />
                                    <StatusSummaryChip label='In Progress' count={counts.in_progress} color='warning' />
                                    <StatusSummaryChip label='Pending Docs' count={counts.pending_docs} color='default' />
                                    <StatusSummaryChip label='Approved' count={counts.approved} color='success' />
                                    <StatusSummaryChip label='Rejected' count={counts.rejected} color='error' />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Main content */}
                <Grid item xs={12}>
                    <Card sx={{ overflow: 'hidden' }}>
                        <Box sx={{ display: 'flex', height: 'calc(100vh - 320px)', minHeight: 600 }}>

                            {/* ── Left panel: Request list ── */}
                            <Box sx={{
                                width: 340, flexShrink: 0,
                                borderRight: '1px solid', borderColor: 'divider',
                                display: 'flex', flexDirection: 'column', overflow: 'hidden'
                            }}>
                                {/* List */}
                                <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {filtered.length === 0 ? (
                                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1, py: 6 }}>
                                            <i className='tabler-inbox-off' style={{ fontSize: 36, color: 'var(--mui-palette-text-disabled)' }} />
                                            <Typography variant='body2' color='text.disabled'>No requests found</Typography>
                                        </Box>
                                    ) : (
                                        filtered.map(r => (
                                            <RequestCard
                                                key={r.request_id}
                                                request={r}
                                                isSelected={r.request_id === selectedId}
                                                onClick={() => setSelectedId(r.request_id)}
                                            />
                                        ))
                                    )}
                                </Box>

                                {/* List footer */}
                                <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                                    <Typography variant='caption' color='text.disabled'>
                                        {filtered.length} of {MOCK_REQUESTS.length} requests
                                    </Typography>
                                </Box>
                            </Box>

                            {/* ── Right panel: Detail ── */}
                            <Box sx={{ flex: 1, overflow: 'hidden' }}>
                                {selected ? (
                                    <RequestDetail key={selected.request_id} request={selected} />
                                ) : (
                                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1.5 }}>
                                        <i className='tabler-hand-click' style={{ fontSize: 48, color: 'var(--mui-palette-text-disabled)' }} />
                                        <Typography variant='body1' color='text.disabled'>Select a request to view details</Typography>
                                    </Box>
                                )}
                            </Box>

                        </Box>
                    </Card>
                </Grid>

            </Grid>
        </>
    )
}

export default RequestRegisterPage
