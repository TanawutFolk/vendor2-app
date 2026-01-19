'use client'

// React Imports
// React Imports
import { useMemo, useCallback, useRef, useEffect, useState } from 'react'

// MUI Imports
import { Card, CardHeader, Chip, Box } from '@mui/material'

// AG Grid Imports
import { AgGridReact } from 'ag-grid-react'
import type { ColDef, GridReadyEvent, ICellRendererParams } from 'ag-grid-community'
import { themeQuartz } from 'ag-grid-community'

// Services & Types
import FindVendorServices from '@_workspace/services/_find-vendor/FindVendorServices'
import type { VendorResultI, FindVendorSearchRequestI } from '@_workspace/types/_find-vendor/FindVendorTypes'

// Custom Cell Renderers
import ActionCellRenderer from './components/ActionCellRenderer'
import { FftStatusCellRenderer } from './components/fftStatus'
import EditVendorModal from './modal/EditVendorModal'

const agGridTheme = themeQuartz.withParams({
    spacing: 6,
    columnBorder: { style: 'solid', color: 'rgb(var(--mui-palette-primary-mainChannel) / 0.19)' },
    // Dark mode 
    browserColorScheme: 'inherit',
    backgroundColor: 'var(--mui-palette-background-paper)',
    foregroundColor: 'var(--mui-palette-text-primary)',
    // Softer header color (matching MRT pattern)
    headerBackgroundColor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.12)',
    headerTextColor: 'var(--mui-palette-text-primary)',
    // Softer odd row color (matching MRT pattern) 
    oddRowBackgroundColor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.04)',
    borderColor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.19)',
    // Row hover color
    rowHoverColor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.08)'
})


interface SearchResultProps {
    searchFilters: any
}



const SearchResult = ({ searchFilters }: SearchResultProps) => {
    const gridApiRef = useRef<any>(null)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null)

    // Handle edit click from ActionCellRenderer
    const handleEditClick = useCallback((vendorId: number) => {
        setSelectedVendorId(vendorId)
        setEditModalOpen(true)
    }, [])

    const handleCloseEditModal = useCallback(() => {
        setEditModalOpen(false)
        setSelectedVendorId(null)
    }, [])

    const handleEditSuccess = useCallback(() => {
        // Refresh grid after successful edit
        if (gridApiRef.current) {
            gridApiRef.current.refreshServerSide({ purge: true })
        }
    }, [])

    // Column definitions - matching API response
    const columnDefs = useMemo<ColDef[]>(
        () => [
            {
                headerName: 'Edit',
                field: 'actions',
                width: 60,
                pinned: 'left',
                lockPosition: 'left',
                cellRenderer: ActionCellRenderer,
                cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
                sortable: false,
                filter: false,
                floatingFilter: false
            },
            {
                field: 'fft_vendor_code',
                headerName: 'Vendor Code',
                width: 100,
                filter: 'agTextColumnFilter',
                pinned: 'left'
            },
            {
                field: 'fft_status',
                headerName: 'Prones Status',
                width: 140,
                filter: 'agTextColumnFilter',
                pinned: 'left',
                cellRenderer: FftStatusCellRenderer,
                cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' }
            },
            {
                field: 'company_name',
                headerName: 'Company Name',
                width: 290,
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
                width: 130,
                filter: 'agTextColumnFilter'
            },
            {
                field: 'group_name',
                headerName: 'Group Name',
                width: 150,
                filter: 'agTextColumnFilter'
            },
            {
                field: 'maker_name',
                headerName: 'Maker Name',
                width: 150,
                filter: 'agTextColumnFilter'
            },
            {
                field: 'product_name',
                headerName: 'Product Name',
                width: 180,
                filter: 'agTextColumnFilter'
            },
            {
                field: 'model_list',
                headerName: 'Model List',
                width: 180,
                filter: 'agTextColumnFilter',
                valueFormatter: (params) => params.value ? params.value.replace(/\n/g, ', ') : ''
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
                width: 125,
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
                filter: 'agTextColumnFilter',
                valueFormatter: (params) => params.value || 'N/A'
            },
            {
                field: 'UPDATE_BY',
                headerName: 'Updated By',
                width: 120,
                filter: 'agTextColumnFilter',
                valueFormatter: (params) => params.value || 'N/A'
            },
            {
                field: 'CREATE_DATE',
                headerName: 'Created Date',
                width: 150,
                filter: 'agDateColumnFilter',
                valueFormatter: (params) => {
                    if (!params.value) return 'N/A'
                    const date = new Date(params.value)
                    return date.toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    })
                }
            },
            {
                field: 'UPDATE_DATE',
                headerName: 'Updated Date',
                width: 150,
                filter: 'agDateColumnFilter',
                valueFormatter: (params) => {
                    if (!params.value) return 'N/A'
                    const date = new Date(params.value)
                    return date.toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    })
                }
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

    // Server-side Datasource
    const serverSideDatasource = useMemo(() => {
        return {
            getRows: async (params: any) => {
                const { startRow, endRow, sortModel } = params.request

                // Calculate pagination
                const limit = endRow - startRow
                const startPage = Math.floor(startRow / limit)

                // Sort parameters
                const sortField = sortModel.length > 0 ? sortModel[0].colId : 'company_name'
                const sortOrder = sortModel.length > 0 ? sortModel[0].sort.toUpperCase() : 'ASC'

                const requestParams: FindVendorSearchRequestI = {
                    SearchFilters: [
                        { id: 'company_name', value: searchFilters.company_name || '' },
                        { id: 'vendor_type_id', value: searchFilters.vendor_type_id?.value || null },
                        { id: 'province', value: searchFilters.province?.value || '' },
                        { id: 'group_name', value: searchFilters.group_name?.value || '' },
                        { id: 'status', value: searchFilters.status?.value || '' },
                        { id: 'product_name', value: searchFilters.product_name || '' },
                        { id: 'maker_name', value: searchFilters.maker_name || '' },
                        { id: 'model_list', value: searchFilters.model_list || '' },
                        { id: 'inuseForSearch', value: '' }
                    ],
                    ColumnFilters: [],
                    Limit: limit,
                    Order: [{ id: sortField, desc: sortOrder === 'DESC' }],
                    Start: startPage
                }

                try {
                    const response = await FindVendorServices.search(requestParams)
                    if (response.data.Status) {
                        const rowData = response.data.ResultOnDb
                        // Debug: เช็ค rowId ที่จะใช้
                        console.log('rowData:', rowData)
                        console.log('rowIds:', rowData.map((r: any) => r.vendor_product_id ? `vp_${r.vendor_product_id}` : `v_${r.vendor_id}`))

                        // ถ้า TotalCountOnDb เป็น 0 แต่มีข้อมูล ให้ใช้ความยาวของ ResultOnDb
                        // หรือถ้ามีข้อมูลน้อยกว่า limit แสดงว่าเป็นหน้าสุดท้าย
                        const totalCount = response.data.TotalCountOnDb || rowData.length
                        params.success({
                            rowData: rowData,
                            rowCount: totalCount > 0 ? totalCount : rowData.length
                        })
                    } else {
                        console.error('API Error:', response.data.Message)
                        params.fail()
                    }
                } catch (error) {
                    console.error('Error fetching vendors:', error)
                    params.fail()
                }
            }
        }
    }, [searchFilters])

    // Update datasource when filters change
    useEffect(() => {
        if (gridApiRef.current) {
            gridApiRef.current.refreshServerSide({ purge: true })
        }
    }, [serverSideDatasource])


    const onGridReady = useCallback((params: GridReadyEvent) => {
        gridApiRef.current = params.api
    }, [])

    return (
        <Card>
            <CardHeader title='Search Result' titleTypographyProps={{ variant: 'h5' }} />
            <Box sx={{ height: 600, width: '100%', p: 2 }}>
                <AgGridReact
                    theme={agGridTheme}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    context={{ onEditClick: handleEditClick }}

                    // Server-side specific props
                    rowModelType='serverSide'
                    serverSideDatasource={serverSideDatasource}
                    pagination={true}
                    paginationPageSize={20}
                    paginationPageSizeSelector={[10, 20, 50, 100]}
                    cacheBlockSize={20}

                    rowSelection='single'
                    animateRows={true}
                    overlayLoadingTemplate='<span class="ag-overlay-loading-center">Loading...</span>'
                    overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No vendors found</span>'
                    enableCellTextSelection={true}
                    copyHeadersToClipboard={true}
                    onGridReady={onGridReady}
                    getRowId={(params) => {
                        // สร้าง unique key จาก combination ของหลาย fields
                        const vendorId = params.data.vendor_id || 0
                        const productId = params.data.vendor_product_id || 0
                        const contactId = params.data.vendor_contact_id || 0

                        // ใช้ combination เพื่อให้ unique ในทุกกรณี
                        return `${vendorId}_${productId}_${contactId}`
                    }}
                />
            </Box>

            {/* Edit Vendor Modal */}
            <EditVendorModal
                open={editModalOpen}
                onClose={handleCloseEditModal}
                vendorId={selectedVendorId}
                onSuccess={handleEditSuccess}
            />
        </Card>
    )
}

export default SearchResult
