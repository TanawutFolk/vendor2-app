'use client'

// React Imports
import { useCallback, useRef, useState, useEffect, useMemo } from 'react'

// MUI Imports
import { Card, CardHeader, Box, Button, Menu, MenuItem, ListItemIcon, ListItemText, CircularProgress } from '@mui/material'
import FileDownloadIcon from '@mui/icons-material/FileDownload'

// AG Grid Imports
import type { ColDef, GridReadyEvent, ColumnState, IServerSideDatasource } from 'ag-grid-community'
import type { GridApi } from 'ag-grid-community'

// Common AG Grid Table
import DxAGgridTable from '@/_template/DxAGgridTable'

// File Saver
import { saveAs } from 'file-saver'

// React Hook Form
import { useFormContext } from 'react-hook-form'

// Axios
import RegisterRequestServices from '@_workspace/services/_register-request/RegisterRequestServices'

// Utils
import { getUserData } from '@/utils/user-profile/userLoginProfile'

// Services & Types
import FindVendorServices from '@_workspace/services/_find-vendor/FindVendorServices'
import type { FindVendorSearchRequestI } from '@_workspace/types/_find-vendor/FindVendorTypes'
import type { FindVendorFormData } from './validateSchema'

// Context
import { useDxContext } from '@/_template/DxContextProvider'

// Custom Cell Renderers
import ActionCellRenderer from './components/ActionCellRenderer'
import { StatusCheckCellRenderer } from './components/fftStatus'
import EmailCellRenderer from './components/EmailCellRenderer'
import EditVendorModal from './modal/EditVendorModal'
import RegisterConfirmModal from './register-request/RegisterConfirmModal'


const SearchResult = () => {
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

    // DxContext: controls whether fetch is enabled (set true by Search/Clear button)
    const { isEnableFetching, setIsEnableFetching } = useDxContext()

    // ── Server-Side Datasource ────────────────────────────────────────────────
    // We read form values INSIDE getRows so we always use the latest filters at fetch time
    const buildDatasource = useCallback((): IServerSideDatasource => ({
        getRows: async (params) => {
            try {
                const { startRow, endRow } = params.request
                const limit = (20) - (startRow ?? 0)

                // Read latest form values at fetch time (not stale closure)
                const currentFilters = getValues('searchFilters')
                const currentSorting = getValues('searchResults.sorting')

                const orderParams = currentSorting && currentSorting.length > 0
                    ? currentSorting.map((s: any) => ({ id: s.id, desc: s.desc }))
                    : [{ id: 'company_name', desc: false }]

                const searchParams = {
                    SearchFilters: [
                        { id: 'global_search', value: currentFilters?.global_search || '' },
                        { id: 'company_name', value: currentFilters?.company_name || '' },
                        { id: 'vendor_type_id', value: currentFilters?.vendor_type_id?.value || null },
                        { id: 'province', value: currentFilters?.province?.value || '' },
                        { id: 'product_group_id', value: currentFilters?.product_group_id?.value || null },
                        { id: 'status', value: currentFilters?.status?.value || '' },
                        { id: 'product_name', value: currentFilters?.product_name || '' },
                        { id: 'maker_name', value: currentFilters?.maker_name || '' },
                        { id: 'model_list', value: currentFilters?.model_list || '' },
                        { id: 'prones_code', value: currentFilters?.fft_vendor_code || '' },
                        { id: 'inuse', value: currentFilters?.inuse?.value ?? null }
                    ],
                    ColumnFilters: [],
                    Order: orderParams,
                    Start: startRow ?? 0,
                    Limit: limit
                }

                const res = await FindVendorServices.search(searchParams)
                const result = res?.data

                if (result?.Status) {
                    params.success({
                        rowData: result.ResultOnDb,
                        rowCount: result.TotalCountOnDb // ← tells AG Grid the true total
                    })
                } else {
                    params.fail()
                }
            } catch {
                params.fail()
            }
            // NOTE: do NOT call setIsEnableFetching here — async setState causes extra renders
        },
        destroy: () => { /* cleanup if needed */ }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [getValues]) // getValues is stable ref from react-hook-form

    // Stable datasource — created once, NOT recreated on filter changes.
    // getRows() reads form values fresh via getValues() at call time, so no stale closure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const datasource = useMemo(() => buildDatasource(), [])

    // When search button is clicked: reset the flag synchronously THEN purge+refetch
    useEffect(() => {
        if (isEnableFetching && gridApiRef.current) {
            setIsEnableFetching(false) // reset synchronously before async getRows fires
            gridApiRef.current.refreshServerSide({ purge: true })
        }
    }, [isEnableFetching, setIsEnableFetching])

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

            // Build export params inline from current form values
            const currentFilters = getValues('searchFilters')
            const exportParams = {
                SearchFilters: [
                    { id: 'global_search', value: currentFilters?.global_search || '' },
                    { id: 'company_name', value: currentFilters?.company_name || '' },
                    { id: 'vendor_type_id', value: currentFilters?.vendor_type_id?.value || null },
                    { id: 'province', value: currentFilters?.province?.value || '' },
                    { id: 'product_group_id', value: currentFilters?.product_group_id?.value || null },
                    { id: 'status', value: currentFilters?.status?.value || '' },
                    { id: 'product_name', value: currentFilters?.product_name || '' },
                    { id: 'maker_name', value: currentFilters?.maker_name || '' },
                    { id: 'model_list', value: currentFilters?.model_list || '' },
                    { id: 'prones_code', value: currentFilters?.fft_vendor_code || '' },
                    { id: 'inuse', value: currentFilters?.inuse?.value ?? null }
                ],
                ColumnFilters: [],
                Order: [] as any[],
                vendor_ids: vendorIds
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
            // Build export params inline from current form values
            const currentFiltersAll = getValues('searchFilters')
            const exportParams = {
                SearchFilters: [
                    { id: 'global_search', value: currentFiltersAll?.global_search || '' },
                    { id: 'company_name', value: currentFiltersAll?.company_name || '' },
                    { id: 'vendor_type_id', value: currentFiltersAll?.vendor_type_id?.value || null },
                    { id: 'province', value: currentFiltersAll?.province?.value || '' },
                    { id: 'product_group_id', value: currentFiltersAll?.product_group_id?.value || null },
                    { id: 'status', value: currentFiltersAll?.status?.value || '' },
                    { id: 'product_name', value: currentFiltersAll?.product_name || '' },
                    { id: 'maker_name', value: currentFiltersAll?.maker_name || '' },
                    { id: 'model_list', value: currentFiltersAll?.model_list || '' },
                    { id: 'prones_code', value: currentFiltersAll?.fft_vendor_code || '' },
                    { id: 'inuse', value: currentFiltersAll?.inuse?.value ?? null }
                ],
                ColumnFilters: [],
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
                headerName: 'Actions',
                field: 'actions',
                width: 94,
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
                field: 'vendor_region',
                headerName: 'Region',
                width: 110,
                filter: 'agTextColumnFilter',
                cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
                cellRenderer: (params: any) => {
                    const val = params.value
                    if (!val) return <span style={{ color: '#9e9e9e' }}>—</span>
                    const isOversea = val === 'Oversea'
                    return (
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '2px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600,
                            background: isOversea ? 'rgb(var(--mui-palette-info-mainChannel) / 0.12)' : 'rgb(var(--mui-palette-success-mainChannel) / 0.12)',
                            color: isOversea ? 'var(--mui-palette-info-main)' : 'var(--mui-palette-success-main)'
                        }}>
                            {isOversea ? '✈️' : '🏠'} {val}
                        </span>
                    )
                }
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
                field: 'emailmain',
                headerName: 'Email (Main)',
                width: 220,
                filter: 'agTextColumnFilter',
                cellRenderer: EmailCellRenderer
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

    // --- State Sync: AG Grid Events -> Update Form w/ MRT format ---
    const handleStateChange = useCallback((api: GridApi | null) => {
        if (!api) return
        const colState = api.getColumnState()

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
                newSorting.push({ id: colId, desc: col.sort === 'desc' })
            }
        })

        setValue('searchResults.columnOrder', newColumnOrder)
        setValue('searchResults.columnVisibility', newColumnVisibility)
        setValue('searchResults.columnPinning', newColumnPinning as any)
        setValue('searchResults.sorting', newSorting)
    }, [setValue])

    // Refresh grid after successful edit
    const handleEditSuccess = useCallback(() => {
        if (gridApiRef.current) {
            gridApiRef.current.refreshServerSide({ purge: true })
        }
    }, [])


    // --- On Row Click (Register Request) ---
    const [registerModalOpen, setRegisterModalOpen] = useState(false)
    const [selectedRegisterVendor, setSelectedRegisterVendor] = useState<any>(null)

    // Not exposing row click for Register anymore based on user feedback. Using column button instead.

    const handleConfirmRegister = async (formData?: any) => {
        if (!selectedRegisterVendor) return

        try {
            const payload = new FormData()
            payload.append('vendor_id', String(selectedRegisterVendor.vendor_id))
            payload.append('support_type', formData?.supportType || '')
            payload.append('purchase_frequency', formData?.purchaseFreq || '')
            payload.append('Request_By_EmployeeCode', getUserData()?.EMPLOYEE_CODE || '')
            payload.append('CREATE_BY', getUserData()?.EMPLOYEE_CODE || 'ถ้าเห็นข้อความนี้แจ้งS524')

            // Append each uploaded file
            if (formData?.files && Array.isArray(formData.files)) {
                formData.files.forEach((file: File) => {
                    payload.append('files', file)
                })
            }

            await RegisterRequestServices.create(payload)

            setRegisterModalOpen(false)
            setSelectedRegisterVendor(null)
        } catch (error: any) {
            console.error('Failed to create registration request:', error)
        }
    }

    const handleCloseRegisterModal = () => {
        setRegisterModalOpen(false)
        setSelectedRegisterVendor(null)
    }

    // Allow opening via context from cell renderer
    const handleRegisterClick = useCallback((vendorId: number, data: any) => {
        setSelectedRegisterVendor(data)
        setRegisterModalOpen(true)
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
            <DxAGgridTable
                columnDefs={columnDefs}
                serverSideDatasource={datasource}
                height={600}
                boxSx={{ p: 2 }}
                context={{ onEditClick: handleEditClick, onRegisterClick: handleRegisterClick }}

                // AG Grid native events — go through ...rest spread to AgGridReact directly
                onGridReady={(params: GridReadyEvent) => {
                    gridApiRef.current = params.api
                    onGridReady(params)
                }}
                onSortChanged={() => handleStateChange(gridApiRef.current)}
                onColumnMoved={() => handleStateChange(gridApiRef.current)}
                onColumnPinned={() => handleStateChange(gridApiRef.current)}
                onColumnVisible={() => handleStateChange(gridApiRef.current)}
                overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No vendors found</span>'
                getRowId={(params: any) => {
                    const vendorId = params.data.vendor_id || 0
                    const productId = params.data.vendor_product_id || 0
                    const contactId = params.data.vendor_contact_id || 0
                    return `${vendorId}_${productId}_${contactId}`
                }}
            />

            {/* Edit Vendor Modal */}
            <EditVendorModal
                open={editModalOpen}
                onClose={handleCloseEditModal}
                vendorId={selectedVendorId}
                onSuccess={handleEditSuccess}
            />

            <RegisterConfirmModal
                open={registerModalOpen}
                vendorData={selectedRegisterVendor}
                onClose={handleCloseRegisterModal}
                onConfirm={handleConfirmRegister}
            />
        </Card>
    )
}

export default SearchResult
