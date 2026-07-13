'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { Button, Chip, CircularProgress, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import type {
    ColDef,
    GetRowIdParams,
    GridApi,
    GridReadyEvent,
    ICellRendererParams,
    IServerSideDatasource,
    ValueFormatterParams
} from 'ag-grid-community'
import { saveAs } from 'file-saver'
import { useFormContext } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'

import DxAGgridTable from '@/_template/DxAGgridTable'
import SearchResultCard from '@_workspace/components/search/SearchResultCard'
import FindVendorServices from '@_workspace/services/_find-vendor/FindVendorServices'
import { rawVendorDetailQueryOptions } from '@_workspace/react-query/hooks/useFindVendor'
import RegisterRequestServices from '@_workspace/services/_register-request/RegisterRequestServices'
import { useDxContext } from '@/_template/DxContextProvider'
import useDxServerSideGrid from '@_workspace/hooks/useDxServerSideGrid'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { getChipSx, getRegionTone } from '@_workspace/utils/statusChipStyles'
import ActionCellRenderer from '../_find-vendor/components/ActionCellRenderer'
import ConfirmModal from '@components/ConfirmModal'
import { StatusCheckCellRenderer } from '../_find-vendor/components/fftStatus'
import EditVendorModal from '../_find-vendor/modal/EditVendorModal'
import RegisterConfirmModal from '../_find-vendor/register-request/RegisterConfirmModal'
import VendorDetailsModal from '../_find-vendor/modal/VendorDetailsModal'
import type { VendorComprehensiveI } from '@_workspace/types/_find-vendor/FindVendorTypes'
import type { RegisterConfirmFormData } from '../_find-vendor/register-request/validateSchema'
import type { ReRegisterFormData } from './validateSchema'
import type { VendorRow, SortColumnState } from '@_workspace/types/_Re-register/ReRegisterTypes'





const SearchResult = () => {
    const queryClient = useQueryClient()
    const { getValues, setValue } = useFormContext<ReRegisterFormData>()
    const gridApiRef = useRef<GridApi<VendorRow> | null>(null)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [isExporting, setIsExporting] = useState(false)
    const [creatingVendorId, setCreatingVendorId] = useState<number | null>(null)
    const [detailsModalOpen, setDetailsModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [reRegisterModalOpen, setReRegisterModalOpen] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null)
    const [selectedRowData, setSelectedRowData] = useState<VendorRow | null>(null)
    const [selectedReRegisterVendor, setSelectedReRegisterVendor] = useState<VendorRow | null>(null)
    const openExportMenu = Boolean(anchorEl)
    const { isEnableFetching, setIsEnableFetching } = useDxContext()
    const { savedGridState, handleGridReady, handleStateUpdated, refreshServerSide } = useDxServerSideGrid({
        getValues,
        setValue,
        isEnableFetching,
        setIsEnableFetching
    })

    const loadVendorDetails = useCallback(async (row: VendorRow, fallbackVendorId?: number): Promise<VendorRow> => {
        const rowData = row as any
        const vendorId = Number(rowData?.VENDORS_ID ?? fallbackVendorId ?? 0)
        if (!vendorId) return row

        try {
            const details = await queryClient.fetchQuery(rawVendorDetailQueryOptions(vendorId))
            return { ...row, ...details }
        } catch (error: any) {
            ToastMessageError({
                title: 'Vendor Details',
                message: error?.message || 'Failed to load vendor details'
            })
            return row
        }
    }, [queryClient])

    const datasource = useMemo<IServerSideDatasource>(() => ({
        getRows: async (params) => {
            try {
                const { startRow, endRow } = params.request
                const limit = (endRow ?? 20) - (startRow ?? 0)
                const currentFilters = getValues('searchFilters')
                const sortModel = params.request.sortModel
                const orderParams = sortModel && sortModel.length > 0
                    ? sortModel.map((s) => ({ id: s.colId, desc: s.sort === 'desc' }))
                    : [{ id: 'COMPANY_NAME', desc: false }]

                const res = await FindVendorServices.search({
                    SEARCHFILTERS: [
                        { id: 'global_search', value: currentFilters?.global_search || '' },
                        { id: 'COMPANY_NAME', value: currentFilters?.company_name || '' },
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
    }), [])

    const buildSearchFilters = () => {
        const f = getValues('searchFilters')
        return [
            { id: 'global_search', value: f?.global_search || '' },
            { id: 'COMPANY_NAME', value: f?.company_name || '' },
            { id: 'MASTER_VENDOR_TYPES_ID', value: f?.vendor_type_id?.value || null },
            { id: 'PROVINCE', value: f?.province?.value || '' },
            { id: 'MASTER_PRODUCT_GROUPS_ID', value: f?.product_group_id?.value || null },
            { id: 'status', value: f?.status?.value || '' },
            { id: 'PRODUCT_NAME', value: f?.product_name || '' },
            { id: 'MAKER_NAME', value: f?.maker_name || '' },
            { id: 'MODEL_LIST', value: f?.model_list || '' },
            { id: 'PRONES_CODE', value: f?.fft_vendor_code || '' },
            { id: 'INUSE', value: f?.inuse?.value ?? null }
        ]
    }

    const buildTimestamp = () => {
        const now = new Date()
        const pad = (n: number) => n.toString().padStart(2, '0')
        return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
    }

    const buildSortModel = () => gridApiRef.current?.getColumnState()
        ?.filter((c): c is SortColumnState => Boolean(c.sort))
        ?.map((c) => ({ id: c.colId, desc: c.sort === 'desc' })) || []

    // The grid's own visible columns, in display order (respects hide / reorder / pin), so the
    // exported sheet matches the screen. `empty` is whatever the column's valueFormatter renders
    // for a blank cell (e.g. '-'), asked of the formatter itself rather than duplicated here.
    const buildExportColumns = () => (gridApiRef.current?.getAllDisplayedColumns() || [])
        .map(column => column.getColDef())
        .filter(colDef => Boolean(colDef.field) && colDef.field !== 'actions')
        .map(colDef => {
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
            const vendorId = Number(api.getDisplayedRowAtIndex(i)?.data?.VENDORS_ID || 0)
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
            ToastMessageError({ title: 'Re-register', message: 'No rows on this page to export.' })
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
            saveAs(file.data, `Re_Register_${buildTimestamp()}.xlsx`)
        } catch {
            ToastMessageError({ title: 'Re-register', message: 'Export failed. Please try again.' })
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
            saveAs(file.data, `Re_Register_All_${buildTimestamp()}.xlsx`)
        } catch {
            ToastMessageError({ title: 'Re-register', message: 'Export failed. Please try again.' })
        } finally {
            setIsExporting(false)
        }
    }

    const handleCreateReRegister = useCallback(async (row?: VendorRow, formData?: RegisterConfirmFormData) => {
        const vendorId = Number(row?.VENDORS_ID || 0)
        const user = getUserData()
        const empCode = String(user?.EMPLOYEE_CODE || '').trim()
        const selectedContactIds = Array.isArray(formData?.vendorContactIds) ? formData.vendorContactIds : []

        if (!vendorId) {
            ToastMessageError({ title: 'Re-register', message: 'Vendor ID is missing' })
            return
        }

        if (!empCode) {
            ToastMessageError({ title: 'Re-register', message: 'Current user employee code is missing' })
            return
        }

        setCreatingVendorId(vendorId)
        try {
            const payload = new FormData()
            payload.append('VENDORS_ID', String(vendorId))
            payload.append('VENDOR_CONTACTS_ID', selectedContactIds[0] || (row?.VENDOR_CONTACTS_ID ? String(row.VENDOR_CONTACTS_ID) : ''))
            selectedContactIds.forEach((contactId: string) => {
                payload.append('VENDOR_CONTACT_IDS[]', contactId)
            })
            payload.append('SUPPORT_TYPE', formData?.supportType || '')
            payload.append('PURCHASE_FREQUENCY', formData?.purchaseFreq || '')
            payload.append('REQUEST_BY_EMPLOYEECODE', empCode)
            payload.append('CREATE_BY', empCode)
            payload.append('REQUEST_TYPE', 'RE_REGISTER')
            payload.append('REQUEST_NUMBER_PREFIX', 'R')
            payload.append('PIC_EMAIL', user?.EMAIL || '')
            if (formData?.files && Array.isArray(formData.files)) {
                formData.files.forEach((file: File) => payload.append('files', file))
            }

            const response = await RegisterRequestServices.create(payload)
            if (response.data?.Status) {
                ToastMessageSuccess({
                    title: 'Re-register',
                    message: response.data?.Message || 'Re-register request created successfully'
                })
                setReRegisterModalOpen(false)
                setSelectedReRegisterVendor(null)
                refreshServerSide()
            } else {
                ToastMessageError({
                    title: 'Re-register',
                    message: response.data?.Message || 'Failed to create re-register request'
                })
            }
        } catch (error: unknown) {
            ToastMessageError({
                title: 'Re-register',
                message: error instanceof Error ? error.message : 'Failed to create re-register request'
            })
        } finally {
            setCreatingVendorId(null)
        }
    }, [refreshServerSide])

    const handleOpenReRegisterModal = useCallback((_vendorId: number, data: VendorRow) => {
        const vendorId = Number(data?.VENDORS_ID || _vendorId || 0)
        if (!vendorId) {
            ToastMessageError({ title: 'Re-register', message: 'Vendor data is not ready' })
            return
        }

        const normalizedData = { ...data, VENDORS_ID: vendorId }
        setSelectedReRegisterVendor(normalizedData)
        setReRegisterModalOpen(true)
        void loadVendorDetails(normalizedData, vendorId)
            .then(setSelectedReRegisterVendor)
            .catch((error: unknown) => {
                ToastMessageError({
                    title: 'Vendor Details',
                    message: error instanceof Error ? error.message : 'Failed to load vendor details'
                })
            })
    }, [loadVendorDetails])

    const handleCloseReRegisterModal = useCallback(() => {
        if (creatingVendorId) return
        setReRegisterModalOpen(false)
        setSelectedReRegisterVendor(null)
    }, [creatingVendorId])

    const handleConfirmReRegister = useCallback((formData?: RegisterConfirmFormData) => {
        void handleCreateReRegister(selectedReRegisterVendor || undefined, formData)
    }, [handleCreateReRegister, selectedReRegisterVendor])

    const handleReRegisterAction = useCallback((_vendorId: number, data: VendorRow) => {
        handleOpenReRegisterModal(_vendorId, data)
    }, [handleOpenReRegisterModal])

    const handleViewDetailsClick = useCallback((vendorId: number, data: VendorRow) => {
        const normalizedData = { ...data, VENDORS_ID: vendorId }
        setSelectedVendorId(vendorId)
        setSelectedRowData(normalizedData)
        setDetailsModalOpen(true)
        void loadVendorDetails(normalizedData, vendorId)
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
        setEditModalOpen(false)
        setDeleteModalOpen(false)
        setSelectedVendorId(null)
        setSelectedRowData(null)
    }, [])

    const handleEditSuccess = useCallback(() => {
        refreshServerSide()
    }, [refreshServerSide])

    const handleVendorEditClick = useCallback((vendorId: number, data: VendorRow) => {
        if (!vendorId || !data) {
            ToastMessageError({ title: 'Re-register', message: 'Cannot open Edit. Vendor data is not ready.' })
            return
        }

        setSelectedVendorId(vendorId)
        setSelectedRowData(data)
        setEditModalOpen(true)
    }, [])

    const handleVendorDeleteClick = useCallback((vendorId: number, data: VendorRow) => {
        if (!vendorId || !data) {
            ToastMessageError({ title: 'Re-register', message: 'Cannot open Delete. Vendor data is not ready.' })
            return
        }

        setSelectedVendorId(vendorId)
        setSelectedRowData(data)
        setDeleteModalOpen(true)
    }, [])

    const handleConfirmDeleteVendor = useCallback(async () => {
        if (!selectedVendorId) return

        setDeleteLoading(true)
        try {
            const response = await FindVendorServices.deleteVendor({ VENDORS_ID: selectedVendorId, UPDATE_BY: getUserData()?.EMPLOYEE_CODE || 'SYSTEM' })
            if (response.data?.Status) {
                ToastMessageSuccess({
                    title: 'Delete Vendor',
                    message: response.data?.Message || 'Vendor deleted successfully'
                })
                handleCloseSelection()
                refreshServerSide()
            } else {
                ToastMessageError({
                    title: 'Delete Vendor',
                    message: response.data?.Message || 'Failed to delete vendor'
                })
            }
        } catch (error: unknown) {
            ToastMessageError({
                title: 'Delete Vendor',
                message: error instanceof Error ? error.message : 'Failed to delete vendor'
            })
        } finally {
            setDeleteLoading(false)
        }
    }, [handleCloseSelection, refreshServerSide, selectedVendorId])

    const columnDefs = useMemo<ColDef[]>(() => [
        {
            headerName: 'Actions',
            field: 'actions',
            width: 126,
            pinned: 'left',
            cellRenderer: ActionCellRenderer,
            cellRendererParams: {
                onEditClick: handleViewDetailsClick,
                onRegisterClick: handleReRegisterAction,
                onVendorEditClick: handleVendorEditClick,
                onVendorDeleteClick: handleVendorDeleteClick,
                registerColor: 'primary',
                registerTitle: 'Send Re-register Request',
                canRegister: (data: VendorRow) => String(data.STATUS_CHECK || '') === 'Registered',
                registerDisabled: (data: VendorRow) => creatingVendorId === Number(data.VENDORS_ID || 0)
            },
            sortable: false,
            filter: false,
            floatingFilter: false,
            suppressMovable: true,
            cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' }
        },
        { field: 'COMPANY_NAME', headerName: 'Company Name', width: 290, filter: 'agTextColumnFilter', pinned: 'left' },
        {
            field: 'STATUS_CHECK',
            headerName: 'Prones Status',
            width: 140,
            filter: 'agTextColumnFilter',
            pinned: 'left',
            cellRenderer: StatusCheckCellRenderer,
            cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' }
        },
        { field: 'PRONES_CODE', headerName: 'Prones Code', width: 115, filter: 'agTextColumnFilter', pinned: 'left', valueFormatter: (p) => p.value || '-' },
        { field: 'VENDOR_TYPE_NAME', headerName: 'Vendor Type', width: 150, filter: 'agTextColumnFilter' },
        {
            field: 'VENDOR_REGION',
            headerName: 'Region',
            width: 110,
            filter: 'agTextColumnFilter',
            cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
            cellRenderer: (params: ICellRendererParams<VendorRow>) => {
                const val = params.value
                if (!val) return <span style={{ color: '#9e9e9e' }}>-</span>
                const region = String(val)
                const tone = getRegionTone(region)
                return (
                    <Chip
                        size='small'
                        label={region === 'Oversea' ? 'Oversea' : 'Local'}
                        color={region === 'Oversea' ? 'info' : 'success'}
                        sx={getChipSx(tone, { height: 22 })}
                    />
                )
            }
        },
        { field: 'PROVINCE', headerName: 'Province', width: 150, filter: 'agTextColumnFilter' },
        { field: 'EMAILMAIN', headerName: 'Email (Main)', width: 220, filter: 'agTextColumnFilter' },
        { field: 'GROUP_NAME', headerName: 'Product group', width: 165, filter: 'agTextColumnFilter' },
        { field: 'MAKER_NAME', headerName: 'Maker Name', width: 150, filter: 'agTextColumnFilter' },
        { field: 'PRODUCT_NAME', headerName: 'Product Name', width: 180, filter: 'agTextColumnFilter' },
        { field: 'MODEL_LIST', headerName: 'Model List', width: 180, filter: 'agTextColumnFilter', valueFormatter: (p: ValueFormatterParams<VendorRow>) => p.value ? String(p.value).replace(/\n/g, ', ') : '' },
        { field: 'CONTACT_NAME', headerName: 'Contact Name', width: 180, filter: 'agTextColumnFilter' },
        { field: 'TEL_PHONE', headerName: 'Tel. Contact', width: 125, filter: 'agTextColumnFilter' },
        { field: 'EMAIL', headerName: 'Email Contact', width: 250, filter: 'agTextColumnFilter' }
    ], [creatingVendorId, handleReRegisterAction, handleViewDetailsClick, handleVendorDeleteClick, handleVendorEditClick])

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
                    onEditClick: handleViewDetailsClick,
                    onRegisterClick: handleReRegisterAction,
                    onVendorEditClick: handleVendorEditClick,
                    onVendorDeleteClick: handleVendorDeleteClick
                }}
                initialState={savedGridState}
                onStateUpdated={handleStateUpdated}
                onGridReady={(params: GridReadyEvent) => {
                    handleGridReady(params)
                    gridApiRef.current = params.api
                }}
                overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No vendors found</span>'
                getRowId={(params: GetRowIdParams<VendorRow>) => {
                    const vendorId = params.data.VENDORS_ID || 0
                    const productId = params.data.VENDOR_PRODUCTS_ID || 0
                    const contactId = params.data.VENDOR_CONTACTS_ID || 0
                    return `${vendorId}_${productId}_${contactId}`
                }}
            />

            <VendorDetailsModal
                open={detailsModalOpen}
                onClose={handleCloseSelection}
                data={selectedRowData}
            />

            <EditVendorModal
                open={editModalOpen}
                onClose={handleCloseSelection}
                vendorId={selectedVendorId}
                rowData={selectedRowData || undefined}
                onSuccess={handleEditSuccess}
            />

            <RegisterConfirmModal
                open={reRegisterModalOpen}
                vendorData={(selectedReRegisterVendor || undefined) as any}
                contactSelectionOnly
                onClose={handleCloseReRegisterModal}
                onConfirm={handleConfirmReRegister}
            />

            <ConfirmModal
                show={deleteModalOpen}
                onCloseClick={handleCloseSelection}
                onConfirmClick={handleConfirmDeleteVendor}
                isLoading={deleteLoading}
                isDelete
            />
        </SearchResultCard>
    )
}

export default SearchResult
