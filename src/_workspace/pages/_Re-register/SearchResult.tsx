'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Chip, CircularProgress, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material'
import type { ChipProps } from '@mui/material'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import type {
    ColDef,
    GetRowIdParams,
    GridApi,
    GridReadyEvent,
    ICellRendererParams,
    IServerSideDatasource,
    StateUpdatedEvent,
    ValueFormatterParams
} from 'ag-grid-community'
import { saveAs } from 'file-saver'
import { useFormContext } from 'react-hook-form'

import DxAGgridTable from '@/_template/DxAGgridTable'
import SearchResultCard from '@_workspace/components/search/SearchResultCard'
import FindVendorServices from '@_workspace/services/_find-vendor/FindVendorServices'
import { useDxContext } from '@/_template/DxContextProvider'
import { getChipSx, getRegionTone } from '@_workspace/utils/statusChipStyles'
import type { ReRegisterFormData } from './validateSchema'

type VendorRow = {
    vendor_id?: number
    vendor_product_id?: number
    vendor_contact_id?: number
    [key: string]: unknown
}

type SortColumnState = {
    colId: string
    sort?: 'asc' | 'desc' | null
}

const StatusCheckCellRenderer = (params: ICellRendererParams<VendorRow>) => {
    const value = String(params.value || 'Not Registered')

    const color: ChipProps['color'] = value === 'Registered'
        ? 'success'
        : value === 'In Progress'
            ? 'warning'
            : value === 'Cannot Register'
                ? 'error'
                : 'default'

    return <Chip size='small' color={color} label={value} sx={{ height: 22 }} />
}

const SearchResult = () => {
    const { getValues, setValue } = useFormContext<ReRegisterFormData>()
    const gridApiRef = useRef<GridApi<VendorRow> | null>(null)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [isExporting, setIsExporting] = useState(false)
    const openExportMenu = Boolean(anchorEl)
    const { isEnableFetching, setIsEnableFetching } = useDxContext()

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
                    params.success({ rowData: result.ResultOnDb, rowCount: result.TotalCountOnDb })
                } else {
                    params.fail()
                }
            } catch {
                params.fail()
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [])

    useEffect(() => {
        if (isEnableFetching && gridApiRef.current) {
            setIsEnableFetching(false)
            gridApiRef.current.refreshServerSide({ purge: true })
        }
    }, [isEnableFetching, setIsEnableFetching])

    const savedGridState = useMemo(() => getValues('searchResults.agGridState'), []) // eslint-disable-line react-hooks/exhaustive-deps

    const handleStateUpdated = useCallback((e: StateUpdatedEvent) => {
        setValue('searchResults.agGridState', e.state, { shouldDirty: false })
    }, [setValue])

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

    const columnDefs = useMemo<ColDef[]>(() => [
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
    ], [])

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
                initialState={savedGridState}
                onStateUpdated={handleStateUpdated}
                onGridReady={(params: GridReadyEvent) => { gridApiRef.current = params.api }}
                overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No vendors found</span>'
                getRowId={(params: GetRowIdParams<VendorRow>) => {
                    const vendorId = params.data.vendor_id || 0
                    const productId = params.data.vendor_product_id || 0
                    const contactId = params.data.vendor_contact_id || 0
                    return `${vendorId}_${productId}_${contactId}`
                }}
            />
        </SearchResultCard>
    )
}

export default SearchResult
