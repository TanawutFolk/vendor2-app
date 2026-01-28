'use client'

// React Imports
import { useMemo, useCallback, useRef, useEffect, useState } from 'react'

// MUI Imports
import { Card, CardHeader, Chip, Box, Button, Menu, MenuItem, ListItemIcon, ListItemText, CircularProgress } from '@mui/material'
import FileDownloadIcon from '@mui/icons-material/FileDownload'

// AG Grid Imports
import { AgGridReact } from 'ag-grid-react'
import type { ColDef, GridReadyEvent, ICellRendererParams } from 'ag-grid-community'
import { themeQuartz } from 'ag-grid-community'

// File Saver
import { saveAs } from 'file-saver'

// Template Imports
import { useCheckPermission } from '@/_template/CheckPermission'

// Services & Types
import FindVendorServices from '@_workspace/services/_find-vendor/FindVendorServices'
import type { VendorResultI, FindVendorSearchRequestI } from '@_workspace/types/_find-vendor/FindVendorTypes'

// Custom Cell Renderers
import ActionCellRenderer from './components/ActionCellRenderer'
import { FftStatusCellRenderer } from './components/fftStatus'
import EmailCellRenderer from './components/EmailCellRenderer' // New import
import EditVendorModal from './modal/EditVendorModal'
import { MENU_ID } from './env'

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

    // Template - Permission check
    // const checkPermission = useCheckPermission()


    // Export Excel states
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [isExporting, setIsExporting] = useState(false)
    const openExportMenu = Boolean(anchorEl)

    const handleExportMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        // // Check IS_SEARCH permission before export (Commented out for debug)
        // const hasPermission = checkPermission(
        //     Number(import.meta.env.VITE_APPLICATION_ID),
        //     MENU_ID,
        //     'IS_SEARCH'
        // )
        // if (!hasPermission) return


        setAnchorEl(event.currentTarget)
    }

    const handleExportMenuClose = () => {
        setAnchorEl(null)
    }

    // Shared search parameters (same as used in server-side datasource)
    const paramForSearch: FindVendorSearchRequestI = useMemo(() => ({
        SearchFilters: [
            { id: 'global_search', value: searchFilters.global_search || '' },
            { id: 'company_name', value: searchFilters.company_name || '' },
            { id: 'vendor_type_id', value: searchFilters.vendor_type_id?.value || null },
            { id: 'province', value: searchFilters.province?.value || '' },
            { id: 'product_group_id', value: searchFilters.product_group_id?.value || null },
            { id: 'status', value: searchFilters.status?.value || '' },
            { id: 'product_name', value: searchFilters.product_name || '' },
            { id: 'maker_name', value: searchFilters.maker_name || '' },
            { id: 'model_list', value: searchFilters.model_list || '' },
            { id: 'inuseForSearch', value: '' }
        ],
        ColumnFilters: [],
        Order: [{ id: 'company_name', desc: false }],
        Start: 0,
        Limit: 20
    }), [searchFilters])

    // Export current page data (uses backend API)
    const handleExportCurrentPage = async () => {
        setIsExporting(true)
        handleExportMenuClose()

        try {
            const dataItem = {
                DataForFetch: paramForSearch,
                TYPE: 'currentPage'
            }

            const file = await FindVendorServices.downloadFileForExport(dataItem)

            // Generate filename with timestamp
            const now = new Date()
            const pad = (n: number) => n.toString().padStart(2, '0')
            const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
            const filename = `Vendor_List_${timestamp}.xlsx`

            saveAs(file.data, filename)
            handleExportMenuClose()

        } catch (error) {
            console.error('Export current page failed:', error)
            alert('Export failed. Please try again.')
        } finally {
            setIsExporting(false)
        }
    }

    // Export all data (uses backend API)
    const handleExportAllData = async () => {
        setIsExporting(true)
        handleExportMenuClose()

        try {
            const dataItem = {
                DataForFetch: paramForSearch,
                TYPE: 'AllPage'
            }

            const file = await FindVendorServices.downloadFileForExport(dataItem)

            // Generate filename with timestamp
            const now = new Date()
            const pad = (n: number) => n.toString().padStart(2, '0')
            const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
            const filename = `Vendor_List_All_${timestamp}.xlsx`

            saveAs(file.data, filename)
            handleExportMenuClose()

        } catch (error) {
            console.error('Export all data failed:', error)
            alert('Export failed. Please try again.')
        } finally {
            setIsExporting(false)
        }
    }

    // Handle edit click from ActionCellRenderer
    const handleEditClick = useCallback((vendorId: number) => {
        console.log('handleEditClick called with vendorId:', vendorId)

        // const appId = Number(import.meta.env.VITE_APPLICATION_ID)
        // console.log('Checking Permission:', { appId, MENU_ID, permissionType: 'IS_UPDATE' })

        // // Check IS_UPDATE permission before editing
        // const hasPermission = checkPermission(
        //     appId,
        //     MENU_ID,
        //     'IS_UPDATE'
        // )

        // console.log('Permission check result:', hasPermission)

        // if (!hasPermission) {
        //     console.warn('Permission denied or data missing. Bypassing for debugging...')
        //     // return // TODO: Uncomment this after verifying permission data
        // }



        setSelectedVendorId(vendorId)
        setEditModalOpen(true)
    }, []) // checkPermission

    const handleCloseEditModal = useCallback(() => {
        setEditModalOpen(false)
        setSelectedVendorId(null)
    }, [])



    // Column definitions - matching API response
    const columnDefs = useMemo<ColDef[]>(
        () => [
            {
                headerName: 'Edit',
                field: 'actions',
                width: 60,
                pinned: 'left',
                // lockPosition: 'left',
                cellRenderer: ActionCellRenderer,
                cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
                sortable: false,
                filter: false,
                floatingFilter: false
            },
            {
                field: 'fft_vendor_code',
                headerName: 'Vendor Code',
                width: 150,
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
                headerName: 'Product group',
                width: 165,
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
                field: 'contact_name',
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
                width: 250,
                filter: 'agTextColumnFilter',
                cellRenderer: EmailCellRenderer
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
            filter: false,
            floatingFilter: false
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
                        { id: 'global_search', value: searchFilters.global_search || '' },
                        { id: 'company_name', value: searchFilters.company_name || '' },
                        { id: 'vendor_type_id', value: searchFilters.vendor_type_id?.value || null },
                        { id: 'province', value: searchFilters.province?.value || '' },
                        { id: 'product_group_id', value: searchFilters.product_group_id?.value || null },
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
                        const totalCount = response.data.TotalCountOnDb

                        params.success({
                            rowData: rowData,
                            rowCount: totalCount
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

    // Refresh grid after successful edit
    const handleEditSuccess = useCallback(() => {
        if (gridApiRef.current) {
            gridApiRef.current.refreshServerSide({ purge: true })
        }
    }, [])

    return (
        <Card>
            <CardHeader
                title='Search Result'
                titleTypographyProps={{ variant: 'h5' }}
                action={
                    <>
                        <Button
                            variant='outlined'
                            color='primary'
                            startIcon={isExporting ? <CircularProgress size={16} /> : <FileDownloadIcon />}
                            onClick={handleExportMenuClick}
                            disabled={isExporting}
                            sx={{ borderRadius: '20px' }}
                        >
                            {isExporting ? 'Exporting...' : 'Export to Excel'}
                        </Button>
                        <Menu
                            anchorEl={anchorEl}
                            open={openExportMenu}
                            onClose={handleExportMenuClose}
                        >
                            <MenuItem onClick={handleExportCurrentPage} disabled={isExporting}>
                                <ListItemIcon>
                                    <FileDownloadIcon fontSize='small' />
                                </ListItemIcon>
                                <ListItemText>Export Current Page</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={handleExportAllData} disabled={isExporting}>
                                <ListItemIcon>
                                    <FileDownloadIcon fontSize='small' />
                                </ListItemIcon>
                                <ListItemText>Export All</ListItemText>
                            </MenuItem>
                        </Menu>
                    </>
                }
            />
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
