'use client'

// React Imports
import { useCallback, useRef, useState, useMemo } from 'react'

// MUI Imports
import { Button, Menu, MenuItem, ListItemIcon, ListItemText, CircularProgress, Chip } from '@mui/material'
import FileDownloadIcon from '@mui/icons-material/FileDownload'

// AG Grid Imports
import type { ColDef, GridReadyEvent, IServerSideDatasource } from 'ag-grid-community'

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
import useDxServerSideGrid from '@_workspace/hooks/useDxServerSideGrid'

// Custom Cell Renderers
import ActionCellRenderer from './components/ActionCellRenderer'
import { StatusCheckCellRenderer } from './components/fftStatus'
import EmailCellRenderer from './components/EmailCellRenderer'
import VendorDetailsModal from './modal/VendorDetailsModal'
import RegisterConfirmModal from './register-request/RegisterConfirmModal'
import SearchResultCard from '@_workspace/components/search/SearchResultCard'
import { getChipSx, getRegionTone } from '@_workspace/utils/statusChipStyles'

import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'

const SearchResult = () => {
    const { getValues, setValue } = useFormContext<FindVendorFormData>()

    const gridApiRef = useRef<any>(null)
    const [detailsModalOpen, setDetailsModalOpen] = useState(false)
    const [selectedRowData, setSelectedRowData] = useState<any>(null)

    // Export Excel states
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [isExporting, setIsExporting] = useState(false)
    const openExportMenu = Boolean(anchorEl)

    // DxContext: set true by Search/Clear button
    const { isEnableFetching, setIsEnableFetching } = useDxContext()
    const { savedGridState, handleGridReady, handleStateUpdated } = useDxServerSideGrid({
        getValues,
        setValue,
        isEnableFetching,
        setIsEnableFetching
    })

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
                    const rowData = (result.ResultOnDb || []).map((row: any) => ({
                        ...row,
                        vendor_id: row.vendor_id ?? row.VENDOR_ID,
                        fft_vendor_code: row.fft_vendor_code ?? row.FFT_VENDOR_CODE,
                        fft_status: row.fft_status ?? row.FFT_STATUS,
                        vendor_product_id: row.vendor_product_id ?? row.VENDOR_PRODUCT_ID,
                        product_group_id: row.product_group_id ?? row.PRODUCT_GROUP_ID,
                        vendor_contact_id: row.vendor_contact_id ?? row.VENDOR_CONTACT_ID,
                        company_name: row.company_name ?? row.COMPANY_NAME,
                        vendor_type_id: row.vendor_type_id ?? row.VENDOR_TYPE_ID,
                        vendor_region: row.vendor_region ?? row.VENDOR_REGION,
                        province: row.province ?? row.PROVINCE,
                        postal_code: row.postal_code ?? row.POSTAL_CODE,
                        website: row.website ?? row.WEBSITE,
                        address: row.address ?? row.ADDRESS,
                        tel_center: row.tel_center ?? row.TEL_CENTER,
                        emailmain: row.emailmain ?? row.EMAILMAIN,
                        group_name: row.group_name ?? row.GROUP_NAME,
                        maker_name: row.maker_name ?? row.MAKER_NAME,
                        product_name: row.product_name ?? row.PRODUCT_NAME,
                        model_list: row.model_list ?? row.MODEL_LIST,
                        contact_name: row.contact_name ?? row.CONTACT_NAME,
                        tel_phone: row.tel_phone ?? row.TEL_PHONE,
                        email: row.email ?? row.EMAIL,
                        position: row.position ?? row.POSITION,
                        match_method: row.match_method ?? row.MATCH_METHOD,
                        prones_code: row.prones_code ?? row.PRONES_CODE,
                        prones_name_en: row.prones_name_en ?? row.PRONES_NAME,
                        reject_reason: row.reject_reason ?? row.APPROVER_REMARK,
                    }))
                    params.success({ rowData, rowCount: result.TotalCountOnDb })
                } else {
                    params.fail()
                }
            } catch {
                params.fail()
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), []) // getValues is a stable ref â€” no need to re-create datasource

    // â”€â”€ Column State Persistence â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Read saved state once on mount â€” AG Grid restores it via initialState prop

    // Persist to RHF whenever AG Grid state changes (sort, pin, reorder, hide)

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
            // Keep columnKeys undefined to export currently visible columns from grid state.
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
        void vendorId
        setSelectedRowData(data)
        setDetailsModalOpen(true)
    }, [])

    const handleCloseSelection = useCallback(() => {
        setDetailsModalOpen(false)
        setSelectedRowData(null)
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
            const selectedContactIds = Array.isArray(formData?.vendorContactIds) ? formData.vendorContactIds : []

            payload.append('VENDOR_ID', String(selectedRegisterVendor.vendor_id))
            payload.append('VENDOR_CONTACT_ID', selectedContactIds[0] || '')
            selectedContactIds.forEach((contactId: string) => {
                payload.append('VENDOR_CONTACT_IDS[]', contactId)
            })
            payload.append('SUPPORT_TYPE', formData?.supportType || '')
            payload.append('PURCHASE_FREQUENCY', formData?.purchaseFreq || '')
            payload.append('REQUEST_BY_EMPLOYEECODE', getUserData()?.EMPLOYEE_CODE || '')
            payload.append('CREATE_BY', getUserData()?.EMPLOYEE_CODE || 'UNEXPECTED_MISSING_USER_CODE_CONTACT_S524')
            if (formData?.files && Array.isArray(formData.files)) {
                formData.files.forEach((file: File) => payload.append('files', file))
            }
            const response = await RegisterRequestServices.create(payload)
            if (response.data?.Status) {
                ToastMessageSuccess({ 
                    title: 'Registration Request',
                    message: response.data?.Message || 'Registration request created successfully' 
                })
                setRegisterModalOpen(false)
                setSelectedRegisterVendor(null)
            } else {
                ToastMessageError({ 
                    title: 'Registration Request',
                    message: response.data?.Message || 'Failed to create registration request' 
                })
            }
        } catch (error: any) {
            ToastMessageError({ 
                title: 'Registration Request',
                message: error?.message || 'Failed to create registration request' 
            })
            console.error('Failed to create registration request:', error)
        }
    }

    // ── Column Definitions ──────────────────────────────────────────────────────────────────
    const columnDefs = useMemo<ColDef[]>(() => [
        {
            headerName: 'Actions',
            field: 'actions',
            width: 94,
            pinned: 'left',
            cellRenderer: ActionCellRenderer,
            cellRendererParams: {
                onEditClick: handleEditClick,
                onRegisterClick: handleRegisterClick,
                showMoreActions: false
            },
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
                if (!val) return <span style={{ color: '#9e9e9e' }}>—</span>
                const tone = getRegionTone(val)
                return (
                    <Chip
                        size="small"
                        label={val === 'Oversea' ? 'Oversea' : 'Local'}
                        color={val === 'Oversea' ? 'info' : 'success'}
                        sx={getChipSx(tone, { height: 22 })}
                    />
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
    ], [handleEditClick, handleRegisterClick])

    return (
        <SearchResultCard action={
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
        }>
            <DxAGgridTable
                columnDefs={columnDefs}
                serverSideDatasource={datasource}
                height={600}
                boxSx={{ p: 2 }}
                context={{
                    onEditClick: handleEditClick,
                    onRegisterClick: handleRegisterClick
                }}
                initialState={savedGridState}
                onStateUpdated={handleStateUpdated}
                onGridReady={(params: GridReadyEvent) => {
                    handleGridReady(params)
                    gridApiRef.current = params.api
                }}
                overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No vendors found</span>'
                getRowId={(params: any) => {
                    const vendorId   = params.data.vendor_id || params.data.VENDOR_ID || 0
                    const productId  = params.data.vendor_product_id || params.data.VENDOR_PRODUCT_ID || 0
                    const contactId  = params.data.vendor_contact_id || params.data.VENDOR_CONTACT_ID || 0
                    return `${vendorId}_${productId}_${contactId}`
                }}
            />

            <VendorDetailsModal
                open={detailsModalOpen}
                onClose={handleCloseSelection}
                data={selectedRowData}
            />

            <RegisterConfirmModal
                open={registerModalOpen}
                vendorData={selectedRegisterVendor}
                onClose={() => { setRegisterModalOpen(false); setSelectedRegisterVendor(null) }}
                onConfirm={handleConfirmRegister}
            />

        </SearchResultCard>
    )
}

export default SearchResult
