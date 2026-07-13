'use client'

// React Imports
import { useCallback, useRef, useState, useMemo } from 'react'

// MUI Imports
import { Button, Menu, MenuItem, ListItemIcon, ListItemText, CircularProgress, Chip } from '@mui/material'
import FileDownloadIcon from '@mui/icons-material/FileDownload'

// AG Grid Imports
import type { ColDef, Column, GridReadyEvent, IServerSideDatasource } from 'ag-grid-community'

// Common AG Grid Table
import DxAGgridTable from '@/_template/DxAGgridTable'

// File Saver
import { saveAs } from 'file-saver'

// React Hook Form
import { useFormContext } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'

// Axios
import RegisterRequestServices from '@_workspace/services/_register-request/RegisterRequestServices'

// Utils
import { getUserData } from '@/utils/user-profile/userLoginProfile'

// Services & Types
import FindVendorServices from '@_workspace/services/_find-vendor/FindVendorServices'
import { rawVendorDetailQueryOptions } from '@_workspace/react-query/hooks/useFindVendor'
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
    const queryClient = useQueryClient()
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

    // Ã¢â€â‚¬Ã¢â€â‚¬ Server-Side Datasource Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
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
                    : [{ id: 'COMPANY_NAME', desc: false }]

                const res = await FindVendorServices.search({
                    SEARCHFILTERS: [
                        { id: 'global_search', value: currentFilters?.global_search || '' },
                        { id: 'COMPANY_NAME', value: currentFilters?.company_name || '' },
                        { id: 'COUNTRY', value: currentFilters?.country || '' },
                        { id: 'MASTER_VENDOR_TYPES_ID', value: currentFilters?.vendor_type_id?.value || null },
                        { id: 'PROVINCE', value: currentFilters?.province?.value || '' },
                        { id: 'MASTER_PRODUCT_GROUPS_ID', value: currentFilters?.product_group_id?.value || null },
                        { id: 'status', value: currentFilters?.status?.value || '' },
                        { id: 'PRODUCT_NAME', value: currentFilters?.product_name || '' },
                        { id: 'MAKER_NAME', value: currentFilters?.maker_name || '' },
                        { id: 'MODEL_LIST', value: currentFilters?.model_list || '' },
                        { id: 'PRONES_CODE', value: currentFilters?.fft_vendor_code || '' },
                        { id: 'INUSE', value: currentFilters?.inuse?.value ?? null }
                    ],
                    ColumnFilters: [],
                    Order: orderParams,
                    Start: startRow ?? 0,
                    Limit: limit
                })

                const result = res?.data
                if (result?.Status) {
                    // Option A: backend returns UPPER-cased column keys directly;
                    // the grid/detail/register modals read those keys as-is.
                    const rowData = result.ResultOnDb || []
                    // A block shorter than requested means the data ran out; clamp rowCount
                    // to what actually exists so the grid never re-requests missing rows.
                    const totalCount = Number(result.TotalCountOnDb) || 0
                    const rowCount = rowData.length < limit ? (startRow ?? 0) + rowData.length : totalCount
                    params.success({ rowData, rowCount })
                } else {
                    params.fail()
                }
            } catch {
                params.fail()
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), []) // getValues is a stable ref Ã¢â‚¬â€ no need to re-create datasource

    // Ã¢â€â‚¬Ã¢â€â‚¬ Column State Persistence Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    // Read saved state once on mount Ã¢â‚¬â€ AG Grid restores it via initialState prop

    // Persist to RHF whenever AG Grid state changes (sort, pin, reorder, hide)

    // Ã¢â€â‚¬Ã¢â€â‚¬ Export helpers Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    const buildSearchFilters = () => {
        const f = getValues('searchFilters')
        return [
            { id: 'global_search',   value: f?.global_search || '' },
            { id: 'COMPANY_NAME',    value: f?.company_name || '' },
            { id: 'COUNTRY',         value: f?.country || '' },
            { id: 'MASTER_VENDOR_TYPES_ID',  value: f?.vendor_type_id?.value || null },
            { id: 'PROVINCE',        value: f?.province?.value || '' },
            { id: 'MASTER_PRODUCT_GROUPS_ID',value: f?.product_group_id?.value || null },
            { id: 'status',          value: f?.status?.value || '' },
            { id: 'PRODUCT_NAME',    value: f?.product_name || '' },
            { id: 'MAKER_NAME',      value: f?.maker_name || '' },
            { id: 'MODEL_LIST',      value: f?.model_list || '' },
            { id: 'PRONES_CODE',     value: f?.fft_vendor_code || '' },
            { id: 'INUSE',           value: f?.inuse?.value ?? null }
        ]
    }

    const buildTimestamp = () => {
        const now = new Date()
        const pad = (n: number) => n.toString().padStart(2, '0')
        return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
    }

    const buildSortModel = () => gridApiRef.current?.getColumnState()
        ?.filter((c: any) => c.sort)
        ?.map((c: any) => ({ id: c.colId, desc: c.sort === 'desc' })) || []

    // The grid's own visible columns, in display order (respects hide / reorder / pin), so the
    // exported sheet matches the screen. `empty` is whatever the column's valueFormatter renders
    // for a blank cell (e.g. '-'), asked of the formatter itself rather than duplicated here.
    const buildExportColumns = () => (gridApiRef.current?.getAllDisplayedColumns() || [])
        .map((column: Column) => column.getColDef())
        .filter((colDef: ColDef) => Boolean(colDef.field) && colDef.field !== 'actions')
        .map((colDef: ColDef) => {
            let empty = ''

            if (typeof colDef.valueFormatter === 'function') {
                try {
                    empty = String(colDef.valueFormatter({ value: null } as any) ?? '')
                } catch {
                    empty = ''
                }
            }

            return {
                id: colDef.field as string,
                header: colDef.headerName || (colDef.field as string),
                empty,
                width: colDef.width ?? 140
            }
        })

    // Vendor ids of the rows on the page the user is looking at, in display order.
    const getCurrentPageVendorIds = () => {
        const api = gridApiRef.current
        if (!api) return []

        const pageSize = api.paginationGetPageSize()
        const firstRow = api.paginationGetCurrentPage() * pageSize
        const ids: number[] = []

        for (let i = firstRow; i < firstRow + pageSize; i++) {
            const vendorId = Number((api.getDisplayedRowAtIndex(i)?.data as any)?.VENDORS_ID || 0)
            if (vendorId && !ids.includes(vendorId)) ids.push(vendorId)
        }

        return ids
    }

    // Both exports go through the same API endpoint so the workbook layout (title row,
    // headers, column order) is identical — only the row scope differs.
    const handleExportCurrentPage = async () => {
        setAnchorEl(null)
        const vendorIds = getCurrentPageVendorIds()

        if (vendorIds.length === 0) {
            ToastMessageError({ title: 'Export Vendor', message: 'No rows on this page to export.' })
            return
        }

        setIsExporting(true)
        try {
            const file = await FindVendorServices.downloadFileForExport({
                DATAFORFETCH: {
                    SEARCHFILTERS: buildSearchFilters(),
                    COLUMNFILTERS: [],
                    ORDER: buildSortModel(),
                    COLUMNS: buildExportColumns(),
                    VENDOR_IDS: vendorIds
                },
                TYPE: 'currentPage'
            })
            saveAs(file.data, `Vendor_List_${buildTimestamp()}.xlsx`)
        } catch {
            ToastMessageError({
                title: 'Export Vendor',
                message: 'Export failed. Please try again.'
            })
        } finally {
            setIsExporting(false)
        }
    }

    const handleExportAllData = async () => {
        setIsExporting(true)
        setAnchorEl(null)
        try {
            const file = await FindVendorServices.downloadFileForExport({
                DATAFORFETCH: {
                    SEARCHFILTERS: buildSearchFilters(),
                    COLUMNFILTERS: [],
                    ORDER: buildSortModel(),
                    COLUMNS: buildExportColumns()
                },
                TYPE: 'AllPage'
            })
            saveAs(file.data, `Vendor_List_All_${buildTimestamp()}.xlsx`)
        } catch {
            ToastMessageError({
                title: 'Export Vendor',
                message: 'Export failed. Please try again.'
            })
        } finally {
            setIsExporting(false)
        }
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ Edit / Register handlers Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    const mergeVendorDetails = useCallback((row: any, details: any) => ({
        ...row,
        ...details,
        VENDORS_ID: details?.VENDORS_ID ?? row?.VENDORS_ID
    }), [])

    const loadVendorDetails = useCallback(async (row: any, fallbackVendorId?: number) => {
        const vendorId = Number(row?.VENDORS_ID ?? fallbackVendorId ?? 0)
        if (!vendorId) return row

        try {
            const details = await queryClient.fetchQuery(rawVendorDetailQueryOptions(vendorId))
            return mergeVendorDetails(row, details)
        } catch (error: any) {
            ToastMessageError({
                title: 'Vendor Details',
                message: error?.message || 'Failed to load vendor details'
            })
            return row
        }
    }, [mergeVendorDetails, queryClient])
    const handleEditClick = useCallback((vendorId: number, data: any) => {
        setSelectedRowData(data)
        setDetailsModalOpen(true)
        void loadVendorDetails(data, vendorId)
            .then(setSelectedRowData)
            .catch((error: unknown) => {
                ToastMessageError({
                    title: 'Vendor Details',
                    message: error instanceof Error ? error.message : 'Failed to load vendor details'
                })
            })
    }, [loadVendorDetails])

    const handleCloseSelection = useCallback(() => {
        setDetailsModalOpen(false)
        setSelectedRowData(null)
    }, [])

    const [registerModalOpen, setRegisterModalOpen] = useState(false)
    const [selectedRegisterVendor, setSelectedRegisterVendor] = useState<any>(null)

    const handleRegisterClick = useCallback((vendorId: number, data: any) => {
        setSelectedRegisterVendor(data)
        setRegisterModalOpen(true)
        void loadVendorDetails(data, vendorId)
            .then(setSelectedRegisterVendor)
            .catch((error: unknown) => {
                ToastMessageError({
                    title: 'Vendor Details',
                    message: error instanceof Error ? error.message : 'Failed to load vendor details'
                })
            })
    }, [loadVendorDetails])

    const handleConfirmRegister = async (formData?: any) => {
        if (!selectedRegisterVendor) return
        try {
            const payload = new FormData()
            const selectedContactIds = Array.isArray(formData?.vendorContactIds) ? formData.vendorContactIds : []

            payload.append('VENDORS_ID', String(selectedRegisterVendor.VENDORS_ID))
            payload.append('VENDOR_CONTACTS_ID', selectedContactIds[0] || '')
            selectedContactIds.forEach((contactId: string) => {
                payload.append('VENDOR_CONTACT_IDS[]', contactId)
            })
            payload.append('SUPPORT_TYPE', formData?.supportType || '')
            payload.append('PURCHASE_FREQUENCY', formData?.purchaseFreq || '')
            payload.append('REQUEST_BY_EMPLOYEECODE', getUserData()?.EMPLOYEE_CODE || '')
            payload.append('REQUEST_BY_EMAIL', getUserData()?.EMAIL || '')
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

    // â”€â”€ Column Definitions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
        { field: 'COMPANY_NAME',    headerName: 'Company Name',  width: 290, filter: 'agTextColumnFilter', pinned: 'left' },
        {
            field: 'STATUS_CHECK',   headerName: 'Prones Status', width: 140, filter: 'agTextColumnFilter', pinned: 'left',
            cellRenderer: StatusCheckCellRenderer,
            cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' }
        },
        { field: 'PRONES_CODE',     headerName: 'Prones Code',   width: 105, filter: 'agTextColumnFilter', pinned: 'left', valueFormatter: (p) => p.value || '-' },
        { field: 'VENDOR_TYPE_NAME',headerName: 'Vendor Type',   width: 150, filter: 'agTextColumnFilter' },
        {
            field: 'VENDOR_REGION', headerName: 'Region', width: 110, filter: 'agTextColumnFilter',
            cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
            cellRenderer: (params: any) => {
                const val = params.value
                if (!val) return <span style={{ color: '#9e9e9e' }}>â€”</span>
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
        { field: 'COUNTRY',      headerName: 'Country',       width: 150, filter: 'agTextColumnFilter', valueFormatter: (p) => p.value || '-' },
        { field: 'PROVINCE',     headerName: 'Province',      width: 150, filter: 'agTextColumnFilter' },
        { field: 'EMAILMAIN',    headerName: 'Email (Main)',   width: 220, filter: 'agTextColumnFilter', cellRenderer: EmailCellRenderer },
        { field: 'GROUP_NAME',   headerName: 'Product group', width: 165, filter: 'agTextColumnFilter' },
        { field: 'MAKER_NAME',   headerName: 'Maker Name',    width: 150, filter: 'agTextColumnFilter' },
        { field: 'PRODUCT_NAME', headerName: 'Product Name',  width: 180, filter: 'agTextColumnFilter' },
        { field: 'MODEL_LIST',   headerName: 'Model List',    width: 180, filter: 'agTextColumnFilter', valueFormatter: (p) => p.value ? p.value.replace(/\n/g, ', ') : '' },
        { field: 'CONTACT_NAME', headerName: 'Contact Name',  width: 180, filter: 'agTextColumnFilter' },
        { field: 'TEL_PHONE',    headerName: 'Tel. Contact',  width: 125, filter: 'agTextColumnFilter' },
        { field: 'EMAIL',        headerName: 'Email Contact', width: 250, filter: 'agTextColumnFilter', cellRenderer: EmailCellRenderer }
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
                    const vendorId   = params.data.VENDORS_ID || 0
                    const productId  = params.data.VENDOR_PRODUCTS_ID || 0
                    const contactId  = params.data.VENDOR_CONTACTS_ID || 0
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
