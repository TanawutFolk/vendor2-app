// React Imports
import { useState, useMemo } from 'react'

// MUI Imports
import {
    Grid, Card, CardContent, Box, Typography, Chip, Divider, Drawer, IconButton
} from '@mui/material'

// AG Grid Imports
import { AgGridReact } from 'ag-grid-react'
import type { ColDef } from 'ag-grid-community'
import { themeQuartz } from 'ag-grid-community'

// Template Imports
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'

// Component Imports
import RequestDetail from './RequestDetail'
import SearchFilter from './SearchFilter'
import type { SearchFilterValues } from './SearchFilter'
import { statusConfig } from './RequestCard'

// Env Imports
import { MENU_NAME, breadcrumbNavigation } from './env'

// Types
import type { RegistrationRequest } from './types'

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
    const [selectedId, setSelectedId] = useState<number | null>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)
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

    const selected = MOCK_REQUESTS.find(r => r.request_id === selectedId) || null

    // Column Definitions
    const columnDefs = useMemo<ColDef<RegistrationRequest>[]>(() => [
        {
            headerName: 'Actions',
            field: 'request_id',
            width: 90,
            pinned: 'left',
            cellRenderer: (params: any) => (
                <IconButton
                    size='small'
                    color='primary'
                    onClick={() => {
                        setSelectedId(params.value)
                        setDrawerOpen(true)
                    }}
                >
                    <i className='tabler-eye' style={{ fontSize: 18 }} />
                </IconButton>
            ),
            cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
            sortable: false,
            filter: false
        },
        { field: 'company_name', headerName: 'Company Name', width: 250, pinned: 'left' },
        {
            field: 'status',
            headerName: 'Status',
            width: 160,
            cellRenderer: (params: any) => {
                const cfg = statusConfig[params.value as keyof typeof statusConfig]
                if (!cfg) return params.value
                return (
                    <Chip
                        icon={<i className={cfg.icon} style={{ fontSize: 12 }} />}
                        label={cfg.label}
                        color={cfg.color}
                        size='small'
                        variant='tonal'
                        sx={{ fontSize: '0.75rem', fontWeight: 600, height: 24, mt: 1 }}
                    />
                )
            }
        },
        { field: 'vendor_type', headerName: 'Vendor Type', width: 160 },
        { field: 'support_type', headerName: 'Support Type', width: 180 },
        { field: 'purchase_frequency', headerName: 'Purchase Frequency', width: 180 },
        { field: 'province', headerName: 'Province', width: 140 },
        { field: 'submitted_by', headerName: 'Submitted By', width: 150 },
        { field: 'submitted_date', headerName: 'Submitted Date', width: 150 }
    ], [])

    const defaultColDef = useMemo<ColDef>(() => ({
        sortable: true,
        filter: 'agTextColumnFilter',
        resizable: true,
    }), [])

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
                    <Card>
                        <Box sx={{ height: 'calc(100vh - 320px)', minHeight: 600, width: '100%', p: 2 }}>
                            <AgGridReact
                                theme={agGridTheme}
                                rowData={filtered}
                                columnDefs={columnDefs}
                                defaultColDef={defaultColDef}
                                pagination={true}
                                paginationPageSize={20}
                                paginationPageSizeSelector={[10, 20, 50]}
                                animateRows={true}
                                overlayLoadingTemplate='<span class="ag-overlay-loading-center">Loading...</span>'
                                overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No requests found</span>'
                            />
                        </Box>
                    </Card>
                </Grid>

            </Grid>

            {/* Request Detail Drawer */}
            <Drawer
                anchor='right'
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{ sx: { width: { xs: '100%', sm: 500, md: 600 } } }}
            >
                {selected && (
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {/* Drawer Header with Close Button */}
                        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Typography variant='h6' fontWeight={700}>Request Details</Typography>
                            <IconButton size='small' onClick={() => setDrawerOpen(false)}>
                                <i className='tabler-x' style={{ fontSize: 20 }} />
                            </IconButton>
                        </Box>

                        {/* Request Detail Component Content */}
                        <Box sx={{ flex: 1, overflow: 'hidden' }}>
                            <RequestDetail key={selected.request_id} request={selected} />
                        </Box>
                    </Box>
                )}
            </Drawer>
        </>
    )
}

export default RequestRegisterPage
