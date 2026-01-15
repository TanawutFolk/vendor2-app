'use client'

// React Imports
import { useMemo } from 'react'

// MUI Imports
import { Card, CardHeader, Chip, Box } from '@mui/material'

// AG Grid Imports
import { AgGridReact } from 'ag-grid-react'
import type { ColDef, GridReadyEvent, ICellRendererParams } from 'ag-grid-community'
import { themeQuartz } from 'ag-grid-community'

// Types
import type { VendorResultI } from '@_workspace/types/_find-vendor/FindVendorTypes'

// Theme configuration
const agGridTheme = themeQuartz.withParams({
    spacing: 6,
    columnBorder: { style: 'solid', color: 'var(--mui-palette-TableCell-border)' }
})

interface SearchResultProps {
    data: VendorResultI[]
    isLoading?: boolean
}

// Status cell renderer
const StatusCellRenderer = (props: ICellRendererParams) => {
    const value = props.value
    const label = value === 1 ? 'Active' : 'Inactive'
    const color = value === 1 ? 'success' : 'error'

    return <Chip label={label} color={color} size='small' variant='filled' />
}

const SearchResult = ({ data, isLoading }: SearchResultProps) => {
    // Column definitions - matching API response
    const columnDefs = useMemo<ColDef[]>(
        () => [
            {
                field: 'company_name',
                headerName: 'Company Name',
                width: 320,
                filter: 'agTextColumnFilter',
                pinned: 'left'
            },
            {
                field: 'vendor_type_name',
                headerName: 'Vendor Type',
                width: 150,
                filter: 'agTextColumnFilter'
            },
            {
                field: 'province',
                headerName: 'Province',
                width: 150,
                filter: 'agTextColumnFilter'
            },
            {
                field: 'website',
                headerName: 'Website',
                width: 200,
                filter: 'agTextColumnFilter'
            },
            {
                field: 'address',
                headerName: 'Address',
                width: 300,
                filter: 'agTextColumnFilter'
            },
            {
                field: 'tel_center',
                headerName: 'Tel Company',
                width: 150,
                filter: 'agTextColumnFilter'
            },
            {
                field: 'seller_name',
                headerName: 'Contact Name',
                width: 180,
                filter: 'agTextColumnFilter'
            },
            {
                field: 'tel_phone',
                headerName: 'Tel. Contact',
                width: 150,
                filter: 'agTextColumnFilter'
            },
            {
                field: 'email',
                headerName: 'Email Contact',
                width: 200,
                filter: 'agTextColumnFilter'
            },
            {
                field: 'CREATE_BY',
                headerName: 'Created By',
                width: 120,
                filter: 'agTextColumnFilter'
            },
            {
                field: 'UPDATE_BY',
                headerName: 'Updated By',
                width: 120,
                filter: 'agTextColumnFilter'
            },
            {
                field: 'CREATE_DATE',
                headerName: 'Created Date',
                width: 150,
                filter: 'agDateColumnFilter'
            },
            {
                field: 'UPDATE_DATE',
                headerName: 'Updated Date',
                width: 150,
                filter: 'agDateColumnFilter'
            }
        ],
        []
    )

    // Default column definition
    const defaultColDef = useMemo<ColDef>(
        () => ({
            sortable: true,
            resizable: true,
            filter: true,
            floatingFilter: true
        }),
        []
    )


    return (
        <Card>
            <CardHeader title='Search Result' titleTypographyProps={{ variant: 'h5' }} />
            <Box sx={{ height: 600, width: '100%', p: 2 }}>
                <AgGridReact
                    theme={agGridTheme}
                    rowData={data}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}

                    pagination={true}
                    paginationPageSize={20}
                    paginationPageSizeSelector={[10, 20, 50, 100]}
                    rowSelection='single'
                    animateRows={true}
                    loading={isLoading}
                    overlayLoadingTemplate='<span class="ag-overlay-loading-center">Loading...</span>'
                    overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No vendors found</span>'
                    suppressRowClickSelection={false}
                    enableCellTextSelection={true}
                    copyHeadersToClipboard={true}
                />
            </Box>
        </Card>
    )
}

export default SearchResult
