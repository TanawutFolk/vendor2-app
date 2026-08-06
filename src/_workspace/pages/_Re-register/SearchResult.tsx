// React Imports
import { useCallback, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

// MUI Imports
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import type {
  ColDef,
  GetRowIdParams,
  ICellRendererParams,
  IServerSideDatasource,
  IServerSideGetRowsRequest,
  ValueFormatterParams
} from 'ag-grid-community'
import { saveAs } from 'file-saver'
import { useFormContext } from 'react-hook-form'

// Components Imports
import DxAGgridTable from '@/_template/DxAGgridTable'
import { useDxContext } from '@/_template/DxContextProvider'
import ReRegisterServices from '@/_workspace/services/_Re-register/ReRegisterServices'
import {
  RE_REGISTER_QUERY_KEY,
  useReRegisterDetail
} from '@/_workspace/react-query/hooks/useReRegister'
import useDxServerSideGrid from '@/_workspace/hooks/useDxServerSideGrid'
import { ToastMessageError } from '@/components/ToastMessage'
import { getChipSx, getRegionTone } from '@/_workspace/utils/statusChipStyles'
import ActionCellRenderer from '@/_workspace/components/vendor/components/ActionCellRenderer'
import { VendorStatusCellRenderer } from '@/_workspace/components/vendor/components/fftStatus'
import EditVendorModal from '@/_workspace/components/vendor/modal/EditVendorModal'
import RegisterConfirmModal from '@/_workspace/components/vendor/modal/register-request/RegisterConfirmModal'
import VendorDetailsModal from '@/_workspace/components/vendor/modal/VendorDetailsModal'
import DeleteVendorModal from './modal/DeleteVendorModal'

// Types

import type { FormDataPage } from './validationSchema'
import useVendorStatusIdentity from '@/_workspace/hooks/useVendorStatusIdentity'
import { isVendorStatusMaster } from '@/_workspace/utils/vendorStatusIdentity'
import type { VendorRow, SortColumnState } from '@/_workspace/types/_Re-register/ReRegisterTypes'

const buildVendorSearchFilters = (filters: FormDataPage['searchFilters']) => [
  { id: 'global_search', value: filters?.globalSearch || '' },
  { id: 'COMPANY_NAME', value: filters?.companyName || '' },
  { id: 'MASTER_VENDOR_TYPES_ID', value: filters?.vendorTypeId?.value || null },
  { id: 'PROVINCE', value: filters?.province?.value || '' },
  { id: 'MASTER_PRODUCT_GROUPS_ID', value: filters?.productGroupId?.value || null },
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  // States : Modal
  const [openModalEdit, setOpenModalEdit] = useState<boolean>(false)
  const [openModalDelete, setOpenModalDelete] = useState<boolean>(false)
  const [openModalView, setOpenModalView] = useState<boolean>(false)
  const [openModalReRegister, setOpenModalReRegister] = useState<boolean>(false)

  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null)
  const shouldLoadDetail = openModalView || openModalEdit || openModalReRegister
  const vendorDetailQuery = useReRegisterDetail(selectedVendorId, shouldLoadDetail)
  const openExportMenu = Boolean(anchorEl)
  const { gridApiRef, savedGridState, handleGridReady, handleStateUpdated, refreshServerSide } = useDxServerSideGrid({
    getValues,
    setValue,
    isEnableFetching,
    setIsEnableFetching
  })

  const creatingVendorId = openModalReRegister ? selectedVendorId : null

  const datasource = useMemo<IServerSideDatasource>(
    () => ({
      getRows: async params => {
        try {
          const payload = buildParamForSearch(getValues('searchFilters'), params.request)
          const res = await ReRegisterServices.search(payload)

          const result = res?.data
          if (result?.Status) {
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
  )

  const buildTimestamp = () => {
    const now = new Date()
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  }

  const buildSortModel = () =>
    gridApiRef.current
      ?.getColumnState()
      ?.filter((c): c is SortColumnState => Boolean(c.sort))
      ?.map(c => ({ id: c.colId, desc: c.sort === 'desc' })) || []

  // The grid's own visible columns, in display order (respects hide / reorder / pin), so the
  // exported sheet matches the screen. `empty` is whatever the column's valueFormatter renders
  // for a blank cell (e.g. '-'), asked of the formatter itself rather than duplicated here.
  const buildExportColumns = () =>
    (gridApiRef.current?.getAllDisplayedColumns() || [])
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
      const file = await ReRegisterServices.downloadFileForExport({
        DATAFORFETCH: {
          SEARCHFILTERS: buildVendorSearchFilters(getValues('searchFilters')),
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
      const file = await ReRegisterServices.downloadFileForExport({
        DATAFORFETCH: {
          SEARCHFILTERS: buildVendorSearchFilters(getValues('searchFilters')),
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

  const handleOpenReRegisterModal = useCallback((vendorId: number) => {
    if (!vendorId) {
      ToastMessageError({ title: 'Re-register', message: 'Vendor data is not ready' })
      return
    }

    setSelectedVendorId(vendorId)
    setOpenModalReRegister(true)
  }, [])

  const handleCloseReRegisterModal = useCallback(() => {
    setOpenModalReRegister(false)
    setSelectedVendorId(null)
  }, [])

  const handleReRegisterAction = useCallback(
    (vendorId: number) => {
      handleOpenReRegisterModal(vendorId)
    },
    [handleOpenReRegisterModal]
  )

  const handleViewDetailsClick = useCallback((vendorId: number) => {
    setSelectedVendorId(vendorId)
    setOpenModalView(true)
  }, [])

  const handleCloseSelection = useCallback(() => {
    setOpenModalView(false)
    setOpenModalEdit(false)
    setOpenModalDelete(false)
    setSelectedVendorId(null)
  }, [])

  const handleEditSuccess = useCallback(() => {
    refreshServerSide()
    if (selectedVendorId) {
      void queryClient.invalidateQueries({ queryKey: [RE_REGISTER_QUERY_KEY, 'DETAIL', selectedVendorId] })
    }
    handleCloseSelection()
  }, [handleCloseSelection, queryClient, refreshServerSide, selectedVendorId])

  const handleVendorEditClick = useCallback((vendorId: number, data: VendorRow) => {
    if (!vendorId || !data) {
      ToastMessageError({ title: 'Re-register', message: 'Cannot open Edit. Vendor data is not ready.' })
      return
    }

    setSelectedVendorId(vendorId)
    setOpenModalEdit(true)
  }, [])

  const handleVendorDeleteClick = useCallback((vendorId: number, data: VendorRow) => {
    if (!vendorId || !data) {
      ToastMessageError({ title: 'Re-register', message: 'Cannot open Delete. Vendor data is not ready.' })
      return
    }

    setSelectedVendorId(vendorId)
    setOpenModalDelete(true)
  }, [])

  const columnDefs = useMemo<ColDef[]>(
    () => [
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
          vendorStatusIds,
          registerColor: 'primary',
          registerTitle: 'Send Re-register Request',
          canRegister: (data: VendorRow) => isVendorStatusMaster(data, vendorStatusIds.REGISTERED),
          registerDisabled: (data: VendorRow) => creatingVendorId === Number(data.VENDORS_ID || 0)
        },
        sortable: false,
        filter: false,
        floatingFilter: false,
        suppressMovable: true,
        cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' }
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
        width: 115,
        pinned: 'left',
        valueFormatter: p => p.value || '-'
      },
      { field: 'VENDOR_TYPE_NAME', headerName: 'Vendor Type', width: 150 },
      {
        field: 'VENDOR_REGION',
        headerName: 'Trade Term',
        width: 110,
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
      { field: 'PROVINCE', headerName: 'Province', width: 150 },
      { field: 'EMAILMAIN', headerName: 'Email (Main)', width: 220 },
      { field: 'GROUP_NAME', headerName: 'Product group', width: 165 },
      { field: 'MAKER_NAME', headerName: 'Maker Name', width: 150 },
      { field: 'PRODUCT_NAME', headerName: 'Product Name', width: 180 },
      {
        field: 'MODEL_LIST',
        headerName: 'Model List',
        width: 180,
        valueFormatter: (p: ValueFormatterParams<VendorRow>) => (p.value ? String(p.value).replace(/\n/g, ', ') : '')
      },
      { field: 'CONTACT_NAME', headerName: 'Contact Name', width: 180 },
      { field: 'TEL_PHONE', headerName: 'Tel. Contact', width: 125 },
      { field: 'EMAIL', headerName: 'Email Contact', width: 250 }
    ],
    [
      creatingVendorId,
      handleReRegisterAction,
      handleViewDetailsClick,
      handleVendorDeleteClick,
      handleVendorEditClick,
      vendorStatusIds
    ]
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
            onEditClick: handleViewDetailsClick,
            onRegisterClick: handleReRegisterAction,
            onVendorEditClick: handleVendorEditClick,
            onVendorDeleteClick: handleVendorDeleteClick,
            vendorStatusIds
          }}
          initialState={savedGridState}
          onStateUpdated={handleStateUpdated}
          onGridReady={handleGridReady}
          overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No vendors found</span>'
          getRowId={(params: GetRowIdParams<VendorRow>) => {
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
            updateRequest={ReRegisterServices.updateComprehensive}
            vendorTypesRequest={ReRegisterServices.getVendorTypes}
            countriesRequest={ReRegisterServices.getCountries}
            productGroupsRequest={ReRegisterServices.getProductGroups}
            onSuccess={handleEditSuccess}
          />
        ) : null}

        {openModalReRegister ? (
          <RegisterConfirmModal
            open={openModalReRegister}
            vendorData={vendorDetailQuery.data}
            loading={vendorDetailQuery.isFetching && !vendorDetailQuery.data}
            errorMessage={vendorDetailQuery.error?.message}
            contactSelectionOnly
            requestType='RE_REGISTER'
            onClose={handleCloseReRegisterModal}
            onSuccess={() => {
              setOpenModalReRegister(false)
              setSelectedVendorId(null)
              refreshServerSide()
            }}
          />
        ) : null}

        {openModalDelete ? (
          <DeleteVendorModal
            open={openModalDelete}
            vendorId={selectedVendorId}
            onClose={handleCloseSelection}
            onSuccess={() => {
              setOpenModalView(false)
              setOpenModalEdit(false)
              setOpenModalDelete(false)
              setSelectedVendorId(null)
              refreshServerSide()
            }}
          />
        ) : null}
      </CardContent>
    </Card>
  )
}

export default SearchResult
