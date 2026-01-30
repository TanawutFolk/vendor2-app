'use client'

// React Imports
import { useMemo, useCallback, useRef, useState, useEffect } from 'react'

// MUI Imports
import { Card, CardHeader, Box, Button, Menu, MenuItem, ListItemIcon, ListItemText, CircularProgress } from '@mui/material'
import FileDownloadIcon from '@mui/icons-material/FileDownload'

// AG Grid Imports
import { AgGridReact } from 'ag-grid-react'
import type { ColDef, GridReadyEvent, ColumnState, SortModelItem } from 'ag-grid-community'
import { themeQuartz } from 'ag-grid-community'

// File Saver
import { saveAs } from 'file-saver'

// React Hook Form
import { useFormContext } from 'react-hook-form'

// Template Context
import { useDxContext } from '@/_template/DxContextProvider'

// Services & Types
import FindVendorServices from '@_workspace/services/_find-vendor/FindVendorServices'
import type { FindVendorSearchRequestI } from '@_workspace/types/_find-vendor/FindVendorTypes'
import type { FindVendorFormData } from './validateSchema'

// React Query Hooks
import { useSearch } from '@_workspace/react-query/hooks/vendor/useFindVendor'

// Custom Cell Renderers
import ActionCellRenderer from './components/ActionCellRenderer'
import { StatusCheckCellRenderer } from './components/fftStatus'
import EmailCellRenderer from './components/EmailCellRenderer'
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

const SearchResult = () => {
    // DxContext for managing fetch state
    const { isEnableFetching, setIsEnableFetching } = useDxContext()

    // React Hook Form
    const { getValues, setValue } = useFormContext<FindVendorFormData>()

    const gridApiRef = useRef<any>(null)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null)

    // Export Excel states
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [isExporting, setIsExporting] = useState(false)
    const openExportMenu = Boolean(anchorEl)

    const handleExportMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleExportMenuClose = () => {
        setAnchorEl(null)
    }

    // Shared search parameters (same as used in server-side datasource)
    const paramForSearch: FindVendorSearchRequestI = useMemo(() => {
        // We need to re-calculate params when fetch is enabled
        // This dependency on isEnableFetching allows the useMemo to update "just in time" before the query runs
        // effectively capturing the latest form values at the moment the search button was clicked.
        // Note: In strict mode or some setups, simply depending on isEnableFetching might not be enough if it doesn't change frequently,
        // but here isEnableFetching is toggled true when Search is clicked.
        if (!isEnableFetching && !isExporting) {
            // Return existing Memo or maybe just default? 
            // Ideally we want the params to be "latched" when isEnableFetching becomes true.
            // React Query will re-run when params change OR when enabled becomes true.
            // If we want to capture form values ONLY when search is clicked, we rely on React Query's behavior.
            // However, getValues() is not reactive. So we might need to rely on the fact that the parent re-renders 
            // or that we're passing these params to the query.
        }

        const searchFilters = getValues('searchFilters')

        // Get sorting from Form State (MRT format) -> convert to API format
        const sorting = getValues('searchResults.sorting')
        const orderParams = sorting && sorting.length > 0
            ? sorting.map((sort: any) => ({ id: sort.id, desc: sort.desc }))
            : [{ id: 'company_name', desc: false }]

        return {
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
                { id: 'prones_code', value: searchFilters.fft_vendor_code || '' },
                { id: 'inuse', value: searchFilters.inuse?.value ?? null }
            ],
            ColumnFilters: [],
            Order: orderParams,
            Start: 0,
            Limit: 10000 // Fetch all for client-side pagination
        }
    }, [isEnableFetching, isExporting, getValues]) // Add getValues to dependency (though it's stable) and isEnableFetching to trigger rebuild

    // React Query Hook
    const {
        data: searchResult,
        isLoading,
        isFetching,
        refetch
    } = useSearch(paramForSearch, isEnableFetching)

    // Reset isEnableFetching when fetching is done
    useEffect(() => {
        if (!isFetching && isEnableFetching) {
            setIsEnableFetching(false)
        }
    }, [isFetching, isEnableFetching, setIsEnableFetching])


    const rowData = useMemo(() => {
        if (searchResult?.data?.Status) {
            return searchResult.data.ResultOnDb
        }
        return []
    }, [searchResult])

    // Helper to get current sort model
    const getSortModel = () => {
        if (!gridApiRef.current) return [{ id: 'company_name', desc: false }]

        const sortModel = gridApiRef.current.getColumnState().filter((col: any) => col.sort !== null)

        if (sortModel.length === 0) return [{ id: 'company_name', desc: false }]

        return sortModel.map((col: any) => ({
            id: col.colId,
            desc: col.sort === 'desc'
        }))
    }

    // Export current page data (uses backend API)
    const handleExportCurrentPage = async () => {
        setIsExporting(true)
        handleExportMenuClose()

        try {
            // Get Pagination State from Grid
            const currentPage = gridApiRef.current?.paginationGetCurrentPage() || 0
            const pageSize = gridApiRef.current?.paginationGetPageSize() || 20

            // Collect Vendor IDs from current page (Sorted & Filtered)
            const startRow = currentPage * pageSize
            const endRow = startRow + pageSize
            const vendorIds: number[] = []

            gridApiRef.current?.forEachNodeAfterFilterAndSort((node: any, index: number) => {
                if (index >= startRow && index < endRow && node.data) {
                    vendorIds.push(node.data.vendor_id)
                }
            })

            // Clone paramForSearch (filters/search needed for context? Actually IDs are enough for fetching, 
            // but we might need filters if we were doing server-side. 
            // Here we just send IDs + filters (just in case backend needs them for Prones match logic dependent on global search? 
            // No, matchVendorsWithPrones uses fresh data.
            // But we send paramForSearch to keep backend happy with types.

            const exportParams = {
                ...paramForSearch,
                vendor_ids: vendorIds, // Send Ordered IDs
                Order: [] // No sort needed, we will sort by ID order in backend
            }

            const dataItem = {
                DataForFetch: exportParams,
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
            // Clone paramForSearch and inject current sort model
            const exportParams = {
                ...paramForSearch,
                Order: getSortModel()
            }

            const dataItem = {
                DataForFetch: exportParams,
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
        setSelectedVendorId(vendorId)
        setEditModalOpen(true)
    }, [])

    const handleCloseEditModal = useCallback(() => {
        setEditModalOpen(false)
        setSelectedVendorId(null)
    }, [])

    // Column definitions
    const columnDefs = useMemo<ColDef[]>(
        () => [
            {
                headerName: 'Edit',
                field: 'actions',
                width: 60,
                pinned: 'left',
                cellRenderer: ActionCellRenderer,
                cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
                sortable: false,
                filter: false,
                floatingFilter: false,
                suppressMovable: true // Lock this column
            },
            {
                field: 'company_name',
                headerName: 'Company Name',
                width: 290,
                filter: 'agTextColumnFilter',
                pinned: 'left'
            },
            {
                field: 'status_check',
                headerName: 'Prones Status',
                width: 140,
                filter: 'agTextColumnFilter',
                pinned: 'left',
                cellRenderer: StatusCheckCellRenderer,
                cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' }
            },
            {
                field: 'prones_code',
                headerName: 'Prones Code',
                width: 105,
                filter: 'agTextColumnFilter',
                pinned: 'left',
                valueFormatter: (params) => params.value || '-'
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

    const onGridReady = useCallback((params: GridReadyEvent) => {
        gridApiRef.current = params.api

        // --- Load state from Form Context (MRT format) -> Apply to AG Grid ---

        // 1. Column Order & Visibility
        const columnOrder = getValues('searchResults.columnOrder')
        const columnVisibility = getValues('searchResults.columnVisibility')
        const columnPinning = getValues('searchResults.columnPinning')
        const sorting = getValues('searchResults.sorting')

        if (columnOrder || columnVisibility || columnPinning || sorting) {
            const columnState: ColumnState[] = []

            // Get all current columns from grid
            const allColumns = params.api.getColumns()
            if (allColumns) {
                // If we have strict column order, use it. Otherwise use grid default order.
                // Note: The schema stores MRT columnOrder which might contain IDs not in AG Grid or vice versa.

                // Strategy: Iterate over all grid columns, and for each find its state in the saved settings. 
                // BUT order matters. So we should iterate over Saved Order first?
                // AG Grid applyColumnState works best if you provide the state for all columns.

                // Let's create a map of known columns for easy lookup
                const colMap = new Map()
                allColumns.forEach(c => colMap.set(c.getColId(), c))

                // Build state based on Saved Order
                if (columnOrder && columnOrder.length > 0) {
                    let sortIndexCounter = 0
                    columnOrder.forEach((colId: string) => {
                        if (colMap.has(colId)) {
                            const state: ColumnState = { colId }

                            // Visibility
                            if (columnVisibility && columnVisibility[colId] !== undefined) {
                                state.hide = !columnVisibility[colId]
                            }

                            // Pinning (MRT stores as { left: [ids], right: [ids] })
                            if (columnPinning) {
                                if (columnPinning.left?.includes(colId)) state.pinned = 'left'
                                else if (columnPinning.right?.includes(colId)) state.pinned = 'right'
                                else state.pinned = null
                            }

                            // Sorting (MRT stores as [{ id, desc }])
                            const sortItem = sorting?.find((s: any) => s.id === colId)
                            if (sortItem) {
                                state.sort = sortItem.desc ? 'desc' : 'asc'
                                state.sortIndex = sortIndexCounter++
                            }

                            columnState.push(state)
                            colMap.delete(colId) // Mark as handled
                        }
                    })
                }

                // Add remaining columns (newly added or missing from order)
                colMap.forEach((col, colId) => {
                    // For 'actions', we force it to be first? No, let the standard order handle it if available.
                    // But if user messed up order, default 'actions' might be hidden or at end.
                    // We'll just push them.
                    const state: ColumnState = { colId }
                    // Visibility
                    if (columnVisibility && columnVisibility[colId] !== undefined) {
                        state.hide = !columnVisibility[colId]
                    }
                    // Pinning
                    if (columnPinning) {
                        if (columnPinning.left?.includes(colId)) state.pinned = 'left'
                        else if (columnPinning.right?.includes(colId)) state.pinned = 'right'
                    }
                    columnState.push(state)
                })

                params.api.applyColumnState({ state: columnState, applyOrder: !!columnOrder })
            }
        }

    }, [getValues])

    // --- State Sync Handlers (AG Grid Events -> Update Form w/ MRT format) ---
    const handleStateChange = useCallback(() => {
        if (!gridApiRef.current) return

        // 1. Column Order & Visibility & Pinning & Sorting
        const colState = gridApiRef.current.getColumnState()

        const newColumnOrder: string[] = []
        const newColumnVisibility: Record<string, boolean> = {}
        const newColumnPinning: { left: string[]; right: string[] } = { left: [], right: [] }
        const newSorting: any[] = []

        colState.forEach((col: ColumnState) => {
            const colId = col.colId
            newColumnOrder.push(colId)
            newColumnVisibility[colId] = !col.hide

            if (col.pinned === 'left') newColumnPinning.left.push(colId)
            if (col.pinned === 'right') newColumnPinning.right.push(colId)

            if (col.sort) {
                newSorting.push({
                    id: colId,
                    desc: col.sort === 'desc'
                })
            }
        })

        // Update Form
        setValue('searchResults.columnOrder', newColumnOrder)
        setValue('searchResults.columnVisibility', newColumnVisibility)
        setValue('searchResults.columnPinning', newColumnPinning as any)
        setValue('searchResults.sorting', newSorting)

    }, [setValue])

    // Refresh grid after successful edit
    const handleEditSuccess = useCallback(() => {
        refetch()
    }, [refetch])

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
                    loading={isLoading || isFetching} // Pass loading state to grid

                    // Client-side props
                    rowData={rowData}
                    pagination={true}
                    paginationPageSize={20}
                    paginationPageSizeSelector={[10, 20, 50, 100]}

                    rowSelection='single'
                    animateRows={true}
                    overlayLoadingTemplate='<span class="ag-overlay-loading-center">Loading...</span>'
                    overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No vendors found</span>'
                    enableCellTextSelection={true}
                    copyHeadersToClipboard={true}
                    onGridReady={onGridReady}

                    // State Sync Events
                    onSortChanged={handleStateChange}
                    onColumnMoved={handleStateChange}
                    onColumnPinned={handleStateChange}
                    onColumnVisible={handleStateChange}
                    // onDragStopped={handleStateChange} // Maybe safer than onColumnMoved for extensive drags? but moved is fine.

                    getRowId={(params) => {
                        const vendorId = params.data.vendor_id || 0
                        const productId = params.data.vendor_product_id || 0
                        const contactId = params.data.vendor_contact_id || 0
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
