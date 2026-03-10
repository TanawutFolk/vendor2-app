'use client'

// React Imports
import { useCallback, useRef, useState, useEffect, useMemo } from 'react'

// MUI Imports
import { Card, CardHeader, Box, Button, Menu, MenuItem, ListItemIcon, ListItemText, CircularProgress } from '@mui/material'
import FileDownloadIcon from '@mui/icons-material/FileDownload'

// AG Grid Imports
import type { ColDef, GridReadyEvent, IServerSideDatasource, StateUpdatedEvent } from 'ag-grid-community'

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
    const { getValues, setValue } = useFormContext<FindVendorFormData>()

    const gridApiRef = useRef<any>(null)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null)
    const [selectedRowData, setSelectedRowData] = useState<any>(null)

    // Export Excel states
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [isExporting, setIsExporting] = useState(false)
    const openExportMenu = Boolean(anchorEl)

    // DxContext: set true by Search/Clear button
    const { isEnableFetching, setIsEnableFetching } = useDxContext()

    // â”€â”€ Server-Side Datasource â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const datasource = useMemo<IServerSideDatasource>(() => ({
        getRows: async (params) => {
            try {
                const { startRow, endRow } = params.request
                const limit = (endRow ?? 20) - (startRow ?? 0)

                const currentFilters = getValues('searchFilters')

                // Build Order from AG Grid sort model
                const sortModel = params.request.sortModel
                const orderParams = sortModel && sortModel.length > 0
                    ? sortModel.map((s: any) => ({ id: s.colId, desc: s.sort === 'desc' }))
                    : [{ id: 'company_name', desc: false }]

                const res = await FindVendorServices.search({
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
                })

                const result = res?.data
                if (result?.Status) {
                    params.success({ rowData: result.ResultOnDb, rowCount: result.TotalCountOnDb })
                } else {
                    params.fail()
                }
            } catch {
                params.fail()
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), []) // getValues is a stable ref â€” no need to re-create datasource

    // Trigger refresh when Search button is clicked
    useEffect(() => {
        if (isEnableFetching && gridApiRef.current) {
            setIsEnableFetching(false)
            gridApiRef.current.refreshServerSide({ purge: true })
        }
    }, [isEnableFetching, setIsEnableFetching])

    // â”€â”€ Column State Persistence â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Read saved state once on mount â€” AG Grid restores it via initialState prop
    const savedGridState = useMemo(() => getValues('searchResults.agGridState'), []) // eslint-disable-line react-hooks/exhaustive-deps

    // Persist to RHF whenever AG Grid state changes (sort, pin, reorder, hide)
    const handleStateUpdated = useCallback((e: StateUpdatedEvent) => {
        setValue('searchResults.agGridState', e.state, { shouldDirty: false })
    }, [setValue])

    // â”€â”€ Export helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const buildSearchFilters = () => {
        const f = getValues('searchFilters')
        return [
            { id: 'global_search',   value: f?.global_search || '' },
            { id: 'company_name',    value: f?.company_name || '' },
            { id: 'vendor_type_id',  value: f?.vendor_type_id?.value || null },
            { id: 'province',        value: f?.province?.value || '' },
            { id: 'product_group_id',value: f?.product_group_id?.value || null },
            { id: 'status',          value: f?.status?.value || '' },
            { id: 'product_name',    value: f?.product_name || '' },
            { id: 'maker_name',      value: f?.maker_name || '' },
            { id: 'model_list',      value: f?.model_list || '' },
            { id: 'prones_code',     value: f?.fft_vendor_code || '' },
            { id: 'inuse',           value: f?.inuse?.value ?? null }
        ]
    }

    const buildTimestamp = () => {
        const now = new Date()
        const pad = (n: number) => n.toString().padStart(2, '0')
        return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
    }

    const handleExportCurrentPage = () => {
        setAnchorEl(null)
        gridApiRef.current?.exportDataAsExcel({
            fileName: `Vendor_List_${buildTimestamp()}.xlsx`,
            sheetName: 'Vendor List',
            // ไม่ต้องระบุ columnKeys → ใช้ column ที่ visible อยู่บนหน้าจอตาม state ปัจจุบัน
        })
    }

    const handleExportAllData = async () => {
        setIsExporting(true)
        setAnchorEl(null)
        try {
            const sortModel = gridApiRef.current?.getColumnState()
                ?.filter((c: any) => c.sort)
                ?.map((c: any) => ({ id: c.colId, desc: c.sort === 'desc' })) || []

            const file = await FindVendorServices.downloadFileForExport({
                DataForFetch: { SearchFilters: buildSearchFilters(), ColumnFilters: [], Order: sortModel },
                TYPE: 'AllPage'
            })
            saveAs(file.data, `Vendor_List_All_${buildTimestamp()}.xlsx`)
        } catch {
            alert('Export failed. Please try again.')
        } finally {
            setIsExporting(false)
        }
    }

    // â”€â”€ Edit / Register handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const handleEditClick = useCallback((vendorId: number, data: any) => {
        setSelectedVendorId(vendorId)
        setSelectedRowData(data)
        setEditModalOpen(true)
    }, [])

    const handleCloseEditModal = useCallback(() => {
        setEditModalOpen(false)
        setSelectedVendorId(null)
        setSelectedRowData(null)
    }, [])

    const handleEditSuccess = useCallback(() => {
        gridApiRef.current?.refreshServerSide({ purge: true })
    }, [])

    const [registerModalOpen, setRegisterModalOpen] = useState(false)
    const [selectedRegisterVendor, setSelectedRegisterVendor] = useState<any>(null)

    const handleRegisterClick = useCallback((vendorId: number, data: any) => {
        setSelectedRegisterVendor(data)
        setRegisterModalOpen(true)
    }, [])

    const handleConfirmRegister = async (formData?: any) => {
        if (!selectedRegisterVendor) return
        try {
            const payload = new FormData()
            payload.append('vendor_id', String(selectedRegisterVendor.vendor_id))
            payload.append('vendor_contact_id', formData?.vendorContactId || '')
            payload.append('support_type', formData?.supportType || '')
            payload.append('purchase_frequency', formData?.purchaseFreq || '')
            payload.append('Request_By_EmployeeCode', getUserData()?.EMPLOYEE_CODE || '')
            payload.append('CREATE_BY', getUserData()?.EMPLOYEE_CODE || 'à¸–à¹‰à¸²à¹€à¸«à¹‡à¸™à¸‚à¹‰à¸­à¸„à¸§à¸²à¸¡à¸™à¸µà¹‰à¹à¸ˆà¹‰à¸‡S524')
            if (formData?.files && Array.isArray(formData.files)) {
                formData.files.forEach((file: File) => payload.append('files', file))
            }
            await RegisterRequestServices.create(payload)
            setRegisterModalOpen(false)
            setSelectedRegisterVendor(null)
        } catch (error: any) {
            console.error('Failed to create registration request:', error)
        }
    }

    // â”€â”€ Column Definitions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const columnDefs = useMemo<ColDef[]>(() => [
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
            suppressMovable: true
        },
        { field: 'company_name',    headerName: 'Company Name',  width: 290, filter: 'agTextColumnFilter', pinned: 'left' },
        {
            field: 'status_check',   headerName: 'Prones Status', width: 140, filter: 'agTextColumnFilter', pinned: 'left',
            cellRenderer: StatusCheckCellRenderer,
            cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' }
        },
        { field: 'prones_code',     headerName: 'Prones Code',   width: 105, filter: 'agTextColumnFilter', pinned: 'left', valueFormatter: (p) => p.value || '-' },
        { field: 'vendor_type_name',headerName: 'Vendor Type',   width: 150, filter: 'agTextColumnFilter' },
        {
            field: 'vendor_region', headerName: 'Region', width: 110, filter: 'agTextColumnFilter',
            cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
            cellRenderer: (params: any) => {
                const val = params.value
                if (!val) return <span style={{ color: '#9e9e9e' }}>â€”</span>
                const isOversea = val === 'Oversea'
                return (
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '2px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600,
                        background: isOversea ? 'rgb(var(--mui-palette-info-mainChannel) / 0.12)' : 'rgb(var(--mui-palette-success-mainChannel) / 0.12)',
                        color: isOversea ? 'var(--mui-palette-info-main)' : 'var(--mui-palette-success-main)'
                    }}>
                        {isOversea ? 'âœˆï¸' : 'ðŸ '} {val}
                    </span>
                )
            }
        },
        { field: 'province',     headerName: 'Province',      width: 150, filter: 'agTextColumnFilter' },
        { field: 'emailmain',    headerName: 'Email (Main)',   width: 220, filter: 'agTextColumnFilter', cellRenderer: EmailCellRenderer },
        { field: 'group_name',   headerName: 'Product group', width: 165, filter: 'agTextColumnFilter' },
        { field: 'maker_name',   headerName: 'Maker Name',    width: 150, filter: 'agTextColumnFilter' },
        { field: 'product_name', headerName: 'Product Name',  width: 180, filter: 'agTextColumnFilter' },
        { field: 'model_list',   headerName: 'Model List',    width: 180, filter: 'agTextColumnFilter', valueFormatter: (p) => p.value ? p.value.replace(/\n/g, ', ') : '' },
        { field: 'contact_name', headerName: 'Contact Name',  width: 180, filter: 'agTextColumnFilter' },
        { field: 'tel_phone',    headerName: 'Tel. Contact',  width: 125, filter: 'agTextColumnFilter' },
        { field: 'email',        headerName: 'Email Contact', width: 250, filter: 'agTextColumnFilter', cellRenderer: EmailCellRenderer }
    ], [])

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
                            onClick={(e) => setAnchorEl(e.currentTarget)}
                            disabled={isExporting}
                            sx={{ borderRadius: '20px' }}
                        >
                            {isExporting ? 'Exporting...' : 'Export to Excel'}
                        </Button>
                        <Menu anchorEl={anchorEl} open={openExportMenu} onClose={() => setAnchorEl(null)}>
                            <MenuItem onClick={handleExportCurrentPage} disabled={isExporting}>
                                <ListItemIcon><FileDownloadIcon fontSize='small' /></ListItemIcon>
                                <ListItemText>Export Current Page</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={handleExportAllData} disabled={isExporting}>
                                <ListItemIcon><FileDownloadIcon fontSize='small' /></ListItemIcon>
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
                initialState={savedGridState}
                onStateUpdated={handleStateUpdated}
                onGridReady={(params: GridReadyEvent) => { gridApiRef.current = params.api }}
                overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No vendors found</span>'
                getRowId={(params: any) => {
                    const vendorId   = params.data.vendor_id || 0
                    const productId  = params.data.vendor_product_id || 0
                    const contactId  = params.data.vendor_contact_id || 0
                    return `${vendorId}_${productId}_${contactId}`
                }}
            />

            <EditVendorModal
                open={editModalOpen}
                onClose={handleCloseEditModal}
                vendorId={selectedVendorId}
                rowData={selectedRowData}
                onSuccess={handleEditSuccess}
            />

            <RegisterConfirmModal
                open={registerModalOpen}
                vendorData={selectedRegisterVendor}
                onClose={() => { setRegisterModalOpen(false); setSelectedRegisterVendor(null) }}
                onConfirm={handleConfirmRegister}
            />
        </Card>
    )
}

export default SearchResult
