// React Imports
import { useCallback, useState, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'

// MUI Imports
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Chip
} from '@mui/material'
import FileDownloadIcon from '@mui/icons-material/FileDownload'

// AG Grid Imports
import type { ColDef, Column, IServerSideDatasource, IServerSideGetRowsRequest } from 'ag-grid-community'

// Common AG Grid Table
import DxAGgridTable from '@/_template/DxAGgridTable'
import { useDxContext } from '@/_template/DxContextProvider'

// File Saver
import { saveAs } from 'file-saver'

// React Hook Form
import { useFormContext } from 'react-hook-form'

// Utils
// Services & Types
import FindVendorServices from '@/_workspace/services/_find-vendor/FindVendorServices'
import { PREFIX_QUERY_KEY, useFindVendorDetail } from '@/_workspace/react-query/hooks/useFindVendor'
import type { FormDataPage } from './validationSchema'

// Components Imports
import useDxServerSideGrid from '@/_workspace/hooks/useDxServerSideGrid'

// Custom Cell Renderers
import ActionCellRenderer from '@/_workspace/components/vendor/components/ActionCellRenderer'
import { VendorStatusCellRenderer } from '@/_workspace/components/vendor/components/fftStatus'
import EmailCellRenderer from './components/EmailCellRenderer'
import VendorDetailsModal from '@/_workspace/components/vendor/modal/VendorDetailsModal'
import EditVendorModal from '@/_workspace/components/vendor/modal/EditVendorModal'
import RegisterConfirmModal from '@/_workspace/components/vendor/modal/register-request/RegisterConfirmModal'
import RegistrationQueueDialog from './modal/RegistrationQueueDialog'
import { getChipSx, getRegionTone } from '@/_workspace/utils/statusChipStyles'
import useVendorStatusIdentity from '@/_workspace/hooks/useVendorStatusIdentity'
import { isVendorStatusMaster } from '@/_workspace/utils/vendorStatusIdentity'

import { ToastMessageError } from '@/components/ToastMessage'
import { fetchVendorTypes } from '@/_workspace/react-select/async-promise-load-options/find-vendor/fetchVendorTypes'
import { fetchCountries } from '@/_workspace/react-select/async-promise-load-options/find-vendor/fetchCountries'
import { fetchProductGroups } from '@/_workspace/react-select/async-promise-load-options/find-vendor/fetchProductGroups'

const buildVendorSearchFilters = (filters: FormDataPage['searchFilters']) => [
  { id: 'global_search', value: filters?.globalSearch || '' },
  { id: 'COMPANY_NAME', value: filters?.companyName || '' },
  { id: 'COUNTRY', value: filters?.country || '' },
  { id: 'MASTER_VENDOR_TYPES_ID', value: filters?.vendorTypeId?.BUSINESS_CATEGORY_ID || null },
  { id: 'PROVINCE', value: filters?.province?.PROVINCE || '' },
  { id: 'MASTER_PRODUCT_GROUPS_ID', value: filters?.productGroupId?.MASTER_PRODUCT_GROUPS_ID || null },
  { id: 'M_VENDOR_STATUS_ID', value: filters?.status?.value ?? null },
  { id: 'PRODUCT_NAME', value: filters?.productName || '' },
  { id: 'MAKER_NAME', value: filters?.makerName || '' },
  { id: 'MODEL_LIST', value: filters?.modelList || '' },
  { id: 'FFT_VENDOR_CODE', value: filters?.fftVendorCode || '' },
  { id: 'INUSE', value: filters?.inuse?.value ?? null }
]

const buildParamForSearch = (
  filters: FormDataPage['searchFilters'],
  request: IServerSideGetRowsRequest
) => {
  const { startRow, endRow, sortModel } = request
  const limit = (endRow ?? 20) - (startRow ?? 0)

  return {
    SEARCHFILTERS: buildVendorSearchFilters(filters),
    ColumnFilters: [],
    Order: sortModel?.length
      ? sortModel.map(item => ({ id: item.colId, desc: item.sort === 'desc' }))
      : [{ id: 'COMPANY_NAME', desc: false }],
    Start: startRow ?? 0,
    Limit: limit
  }
}

function SearchResult() {
  // Context
  const { isEnableFetching, setIsEnableFetching } = useDxContext()

  const { getValues, setValue } = useFormContext<FormDataPage>()
  const queryClient = useQueryClient()
  const { vendorStatusIds } = useVendorStatusIdentity()

  // States : Modal
  // Edit Vendor (menu action) — restricted to "Not Registered" vendors, see canEditVendor below.
  const [openModalEdit, setOpenModalEdit] = useState<boolean>(false)
  const [openModalView, setOpenModalView] = useState<boolean>(false)
  const [openModalRegister, setOpenModalRegister] = useState<boolean>(false)
  const [openModalQueue, setOpenModalQueue] = useState<boolean>(false)
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null)
  const [requestsAhead, setRequestsAhead] = useState<number | null>(null)
  const shouldLoadDetail = openModalView || openModalEdit || openModalRegister
  const vendorDetailQuery = useFindVendorDetail(selectedVendorId, shouldLoadDetail)

  // Export Excel states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const openExportMenu = Boolean(anchorEl)

  const { gridApiRef, savedGridState, handleGridReady, handleStateUpdated, refreshServerSide } = useDxServerSideGrid({
    getValues,
    setValue,
    isEnableFetching,
    setIsEnableFetching
  })

  // ── Server-Side Datasource ────────────────────────────────────────────────
  const datasource = useMemo<IServerSideDatasource>(
    () => ({
      getRows: async params => {
        try {
          const payload = buildParamForSearch(getValues('searchFilters'), params.request)
          const res = await FindVendorServices.search(payload)

          const result = res?.data
          if (result?.Status) {
            // Option A: backend returns UPPER-cased column keys directly;
            // the grid/detail/register modals read those keys as-is.
            const rowData = result.ResultOnDb || []
            // A block shorter than requested means the data ran out; clamp rowCount
            // to what actually exists so the grid never re-requests missing rows.
            const totalCount = Number(result.TotalCountOnDb) || 0
            const rowCount = rowData.length < payload.Limit ? payload.Start + rowData.length : totalCount
            params.success({ rowData, rowCount })
          } else {
            params.fail()
          }
        } catch {
          params.fail()
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }),
    [getValues]
  ) // getValues is a stable ref — no need to re-create datasource

  // ── Column State Persistence ──────────────────────────────────────────────
  // Read saved state once on mount — AG Grid restores it via initialState prop

  // Persist to RHF whenever AG Grid state changes (sort, pin, reorder, hide)

  // ── Export helpers ────────────────────────────────────────────────────────
  const buildTimestamp = () => {
    const now = new Date()
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  }

  const buildSortModel = () =>
    gridApiRef.current
      ?.getColumnState()
      ?.filter((c: any) => c.sort)
      ?.map((c: any) => ({ id: c.colId, desc: c.sort === 'desc' })) || []

  // The grid's own visible columns, in display order (respects hide / reorder / pin), so the
  // exported sheet matches the screen. `empty` is whatever the column's valueFormatter renders
  // for a blank cell (e.g. '-'), asked of the formatter itself rather than duplicated here.
  const buildExportColumns = () =>
    (gridApiRef.current?.getAllDisplayedColumns() || [])
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
          SEARCHFILTERS: buildVendorSearchFilters(getValues('searchFilters')),
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
          SEARCHFILTERS: buildVendorSearchFilters(getValues('searchFilters')),
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

  // ── Edit / Register handlers ──────────────────────────────────────────────

  const handleEditClick = useCallback((vendorId: number) => {
    setSelectedVendorId(vendorId)
    setOpenModalView(true)
  }, [])

  const handleCloseSelection = useCallback(() => {
    setOpenModalView(false)
    setOpenModalEdit(false)
    setSelectedVendorId(null)
  }, [])

  // Only vendors whose current system status is Not Registered may be edited.
  const canEditVendor = useCallback(
    (data: any) => isVendorStatusMaster(data, vendorStatusIds.NOT_REGISTERED),
    [vendorStatusIds.NOT_REGISTERED]
  )

  const handleVendorEditClick = useCallback((vendorId: number, data: any) => {
    if (!vendorId || !data) {
      ToastMessageError({ title: 'Edit Vendor', message: 'Cannot open Edit. Vendor data is not ready.' })
      return
    }

    setSelectedVendorId(vendorId)
    setOpenModalEdit(true)
  }, [])

  const handleEditSuccess = useCallback(() => {
    refreshServerSide()
    if (selectedVendorId) {
      void queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY, 'DETAIL', selectedVendorId] })
    }
    handleCloseSelection()
  }, [handleCloseSelection, queryClient, refreshServerSide, selectedVendorId])

  const handleCloseRegisterModal = useCallback(() => {
    setOpenModalRegister(false)
    setSelectedVendorId(null)
  }, [])

  const handleCloseQueueModal = useCallback(() => {
    setOpenModalQueue(false)
    setRequestsAhead(null)
  }, [])

  const handleRegisterClick = useCallback((vendorId: number) => {
    setSelectedVendorId(vendorId)
    setOpenModalRegister(true)
  }, [])

  // ── Column Definitions ──────────────────────────────────────────────────────────────────
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: 'Actions',
        field: 'actions',
        width: 126,
        pinned: 'left',
        cellRenderer: ActionCellRenderer,
        cellRendererParams: {
          onEditClick: handleEditClick,
          onRegisterClick: handleRegisterClick,
          onVendorEditClick: handleVendorEditClick,
          vendorStatusIds,
          canEdit: canEditVendor,
          editDisabledReason: 'Only "Not Registered" vendors can be edited'
        },
        cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
        sortable: false,
        filter: false,
        floatingFilter: false,
        suppressMovable: true
      },
      { field: 'COMPANY_NAME', headerName: 'Company Name', width: 290, pinned: 'left' },
      {
        field: 'VENDOR_STATUS_LABEL',
        headerName: 'Vendor Status',
        width: 140,
        pinned: 'left',
        cellRenderer: VendorStatusCellRenderer,
        cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' }
      },
      {
        field: 'FFT_VENDOR_CODE',
        headerName: 'Vendor Code',
        width: 105,
        pinned: 'left',
        valueFormatter: p => p.value || '-'
      },
      { field: 'VENDOR_TYPE_NAME', headerName: 'Vendor Type', width: 150 },
      {
        field: 'VENDOR_REGION',
        headerName: 'Trade Term',
        width: 120,
        cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
        cellRenderer: (params: any) => {
          const val = params.value
          if (!val) return <span style={{ color: '#9e9e9e' }}>—</span>
          const tone = getRegionTone(val)
          return (
            <Chip
              size='small'
              label={val === 'Oversea' ? 'Oversea' : 'Local'}
              color={val === 'Oversea' ? 'info' : 'success'}
              sx={getChipSx(tone, { height: 22 })}
            />
          )
        }
      },
      {
        field: 'COUNTRY',
        headerName: 'Country',
        width: 150,
        valueFormatter: p => p.value || '-'
      },
      { field: 'PROVINCE', headerName: 'Province', width: 150 },
      {
        field: 'EMAILMAIN',
        headerName: 'Email (Main)',
        width: 220,
        cellRenderer: EmailCellRenderer
      },
      { field: 'GROUP_NAME', headerName: 'Product group', width: 165 },
      { field: 'MAKER_NAME', headerName: 'Maker Name', width: 150 },
      { field: 'PRODUCT_NAME', headerName: 'Product Name', width: 180 },
      {
        field: 'MODEL_LIST',
        headerName: 'Model List',
        width: 180,
        valueFormatter: p => (p.value ? p.value.replace(/\n/g, ', ') : '')
      },
      { field: 'CONTACT_NAME', headerName: 'Contact Name', width: 180 },
      { field: 'TEL_PHONE', headerName: 'Tel. Contact', width: 125 },
      {
        field: 'EMAIL',
        headerName: 'Email Contact',
        width: 250,
        cellRenderer: EmailCellRenderer
      }
    ],
    [handleEditClick, handleRegisterClick, handleVendorEditClick, canEditVendor, vendorStatusIds]
  )

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
              onClick={e => setAnchorEl(e.currentTarget)}
              disabled={isExporting}
              sx={{ borderRadius: '20px' }}
            >
              {isExporting ? 'Exporting...' : 'Export to Excel'}
            </Button>
            <Menu anchorEl={anchorEl} open={openExportMenu} onClose={() => setAnchorEl(null)}>
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
      <CardContent>
        <DxAGgridTable
          columnDefs={columnDefs}
          serverSideDatasource={datasource}
          height={600}
          boxSx={{ p: 2 }}
          context={{
            onEditClick: handleEditClick,
            onRegisterClick: handleRegisterClick,
            onVendorEditClick: handleVendorEditClick,
            vendorStatusIds
          }}
          initialState={savedGridState}
          onStateUpdated={handleStateUpdated}
          onGridReady={handleGridReady}
          overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No vendors found</span>'
          getRowId={(params: any) => {
            const vendorId = params.data.VENDORS_ID || 0
            const productId = params.data.VENDOR_PRODUCTS_ID || 0
            const contactId = params.data.VENDOR_CONTACTS_ID || 0
            return `${vendorId}_${productId}_${contactId}`
          }}
        />

        {openModalView ? (
          <VendorDetailsModal
            open={openModalView}
            onClose={handleCloseSelection}
            data={vendorDetailQuery.data}
            loading={vendorDetailQuery.isFetching && !vendorDetailQuery.data}
            errorMessage={vendorDetailQuery.error?.message}
          />
        ) : null}

        {openModalEdit ? (
          <EditVendorModal
            open={openModalEdit}
            onClose={handleCloseSelection}
            vendorId={selectedVendorId}
            rowData={vendorDetailQuery.data}
            loading={vendorDetailQuery.isFetching && !vendorDetailQuery.data}
            errorMessage={vendorDetailQuery.error?.message}
            updateRequest={FindVendorServices.updateComprehensive}
            fetchVendorTypes={fetchVendorTypes}
            fetchCountries={fetchCountries}
            fetchProductGroups={fetchProductGroups}
            onSuccess={handleEditSuccess}
          />
        ) : null}

        {openModalRegister ? (
          <RegisterConfirmModal
            open={openModalRegister}
            vendorData={vendorDetailQuery.data}
            loading={vendorDetailQuery.isFetching && !vendorDetailQuery.data}
            errorMessage={vendorDetailQuery.error?.message}
            onClose={handleCloseRegisterModal}
            onSuccess={data => {
              setRequestsAhead(Number(data.ResultOnDb?.REQUESTS_AHEAD || 0))
              setOpenModalQueue(true)
              setOpenModalRegister(false)
              setSelectedVendorId(null)
              refreshServerSide()
            }}
          />
        ) : null}

        {openModalQueue ? (
          <RegistrationQueueDialog
            open={openModalQueue}
            requestsAhead={requestsAhead}
            onClose={handleCloseQueueModal}
          />
        ) : null}
      </CardContent>
    </Card>
  )
}

export default SearchResult
