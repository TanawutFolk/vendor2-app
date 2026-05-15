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

import DxAGgridTable from '@/_template/DxAGgridTable'
import SearchResultCard from '@_workspace/components/search/SearchResultCard'
import FindVendorServices from '@_workspace/services/_find-vendor/FindVendorServices'
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

type VendorRow = Partial<VendorComprehensiveI> & {
    vendor_id?: number
    vendor_product_id?: number
    vendor_contact_id?: number
    [key: string]: unknown
}

type SortColumnState = {
    colId: string
    sort?: 'asc' | 'desc' | null
}

const SearchResult = () => {
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

    const datasource = useMemo<IServerSideDatasource>(() => ({
        getRows: async (params) => {
            try {
                const { startRow, endRow } = params.request
                const limit = (endRow ?? 20) - (startRow ?? 0)
                const currentFilters = getValues('searchFilters')
                const sortModel = params.request.sortModel
                const orderParams = sortModel && sortModel.length > 0
                    ? sortModel.map((s) => ({ id: s.colId, desc: s.sort === 'desc' }))
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
                    const rowData = (result.ResultOnDb || []).map((row: VendorRow) => ({
                        ...row,
                        vendor_id: row.vendor_id ?? row.VENDOR_ID,
                        fft_vendor_code: row.fft_vendor_code ?? row.FFT_VENDOR_CODE,
                        fft_status: row.fft_status ?? row.FFT_STATUS,
                        vendor_product_id: row.vendor_product_id ?? row.VENDOR_PRODUCT_ID,
                        product_group_id: row.product_group_id ?? row.PRODUCT_GROUP_ID,
                        vendor_contact_id: row.vendor_contact_id ?? row.VENDOR_CONTACT_ID,
                        company_name: row.company_name ?? row.COMPANY_NAME,
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
    }), [])

    const buildSearchFilters = () => {
        const f = getValues('searchFilters')
        return [
            { id: 'global_search', value: f?.global_search || '' },
            { id: 'company_name', value: f?.company_name || '' },
            { id: 'vendor_type_id', value: f?.vendor_type_id?.value || null },
            { id: 'province', value: f?.province?.value || '' },
            { id: 'product_group_id', value: f?.product_group_id?.value || null },
            { id: 'status', value: f?.status?.value || '' },
            { id: 'product_name', value: f?.product_name || '' },
            { id: 'maker_name', value: f?.maker_name || '' },
            { id: 'model_list', value: f?.model_list || '' },
            { id: 'prones_code', value: f?.fft_vendor_code || '' },
            { id: 'inuse', value: f?.inuse?.value ?? null }
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
            fileName: `Re_Register_${buildTimestamp()}.xlsx`,
            sheetName: 'Re-register'
        })
    }

    const handleExportAllData = async () => {
        setIsExporting(true)
        setAnchorEl(null)
        try {
            const sortModel = gridApiRef.current?.getColumnState()
                ?.filter((c): c is SortColumnState => Boolean(c.sort))
                ?.map((c) => ({ id: c.colId, desc: c.sort === 'desc' })) || []

            const file = await FindVendorServices.downloadFileForExport({
                DataForFetch: { SearchFilters: buildSearchFilters(), ColumnFilters: [], Order: sortModel },
                TYPE: 'AllPage'
            })
            saveAs(file.data, `Re_Register_All_${buildTimestamp()}.xlsx`)
        } catch {
            alert('Export failed. Please try again.')
        } finally {
            setIsExporting(false)
        }
    }

    const handleCreateReRegister = useCallback(async (row?: VendorRow, formData?: RegisterConfirmFormData) => {
        const vendorId = Number(row?.vendor_id || 0)
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
            payload.append('VENDOR_ID', String(vendorId))
            payload.append('VENDOR_CONTACT_ID', selectedContactIds[0] || (row?.vendor_contact_id ? String(row.vendor_contact_id) : ''))
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
        if (!data?.vendor_id) {
            ToastMessageError({ title: 'Re-register', message: 'Vendor data is not ready' })
            return
        }

        setSelectedReRegisterVendor(data)
        setReRegisterModalOpen(true)
    }, [])

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
        setSelectedVendorId(vendorId)
        setSelectedRowData(data)
        setDetailsModalOpen(true)
    }, [])

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
            ToastMessageError({ message: 'Cannot open Edit. Vendor data is not ready.' })
            return
        }

        setSelectedVendorId(vendorId)
        setSelectedRowData(data)
        setEditModalOpen(true)
    }, [])

    const handleVendorDeleteClick = useCallback((vendorId: number, data: VendorRow) => {
        if (!vendorId || !data) {
            ToastMessageError({ message: 'Cannot open Delete. Vendor data is not ready.' })
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
            const response = await FindVendorServices.deleteVendor(selectedVendorId, getUserData()?.EMPLOYEE_CODE || 'SYSTEM')
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
                canRegister: (data: VendorRow) => String(data.status_check || '') === 'Registered',
                registerDisabled: (data: VendorRow) => creatingVendorId === Number(data.vendor_id || 0)
            },
            sortable: false,
            filter: false,
            floatingFilter: false,
            suppressMovable: true,
            cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' }
        },
        { field: 'company_name', headerName: 'Company Name', width: 290, filter: 'agTextColumnFilter', pinned: 'left' },
        {
            field: 'status_check',
            headerName: 'Prones Status',
            width: 140,
            filter: 'agTextColumnFilter',
            pinned: 'left',
            cellRenderer: StatusCheckCellRenderer,
            cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' }
        },
        { field: 'prones_code', headerName: 'Prones Code', width: 115, filter: 'agTextColumnFilter', pinned: 'left', valueFormatter: (p) => p.value || '-' },
        { field: 'vendor_type_name', headerName: 'Vendor Type', width: 150, filter: 'agTextColumnFilter' },
        {
            field: 'vendor_region',
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
        { field: 'province', headerName: 'Province', width: 150, filter: 'agTextColumnFilter' },
        { field: 'emailmain', headerName: 'Email (Main)', width: 220, filter: 'agTextColumnFilter' },
        { field: 'group_name', headerName: 'Product group', width: 165, filter: 'agTextColumnFilter' },
        { field: 'maker_name', headerName: 'Maker Name', width: 150, filter: 'agTextColumnFilter' },
        { field: 'product_name', headerName: 'Product Name', width: 180, filter: 'agTextColumnFilter' },
        { field: 'model_list', headerName: 'Model List', width: 180, filter: 'agTextColumnFilter', valueFormatter: (p: ValueFormatterParams<VendorRow>) => p.value ? String(p.value).replace(/\n/g, ', ') : '' },
        { field: 'contact_name', headerName: 'Contact Name', width: 180, filter: 'agTextColumnFilter' },
        { field: 'tel_phone', headerName: 'Tel. Contact', width: 125, filter: 'agTextColumnFilter' },
        { field: 'email', headerName: 'Email Contact', width: 250, filter: 'agTextColumnFilter' }
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
                    const vendorId = params.data.vendor_id || params.data.VENDOR_ID || 0
                    const productId = params.data.vendor_product_id || params.data.VENDOR_PRODUCT_ID || 0
                    const contactId = params.data.vendor_contact_id || params.data.VENDOR_CONTACT_ID || 0
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
                vendorData={selectedReRegisterVendor || undefined}
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
