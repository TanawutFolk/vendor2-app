import AddIcon from '@mui/icons-material/Add'
import FilterListIcon from '@mui/icons-material/FilterList'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Chip,
  Divider,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Pagination,
  Tooltip,
  Typography,
  useColorScheme
} from '@mui/material'
import type {
  MRT_ColumnFilterFnsState,
  MRT_ColumnFiltersState,
  MRT_ColumnOrderState,
  MRT_ColumnPinningState,
  MRT_DensityState,
  MRT_PaginationState,
  MRT_Row,
  MRT_RowSelectionState,
  MRT_SortingState,
  MRT_VisibilityState
} from 'material-react-table'
import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

import {
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef
} from 'material-react-table'

import { Controller, useFormContext } from 'react-hook-form'
// import Swal from 'sweetalert2'
// import withReactContent from 'sweetalert2-react-content'
// const MySwal = withReactContent(Swal)

import { useUpdateEffect } from 'react-use'
// import type { CustomerInvoiceToInterface } from '@/_workspace/types/customer/CustomerInvoiceTo'
import type { ProductTypeI } from '@/_workspace/types/productGroup/ProductType'

// Utils
import CustomTextField from '@components/mui/TextField'
import type { ParamApiSearchResultTableI_V2 } from '@libs/material-react-table/types/SearchResultTable'
import FileDownloadIcon from '@mui/icons-material/FileDownload'

import StatusColumn from '@libs/material-react-table/components/StatusOption'

import { useSettings } from '@/@core/hooks/useSettings'
import { useSearchProductType } from '@/_workspace/react-query/hooks/useProductTypeData'
import {
  fetchProductTypeBOMExport,
  fetchProductTypeExport
} from '@/_workspace/react-select/async-promise-load-options/fetchProductType'
import ConfirmModal from '@/components/ConfirmModal'
import SelectCustom from '@/components/react-select/SelectCustom'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { saveAs } from 'file-saver'
import ProductTypeAddModal from './modal/ProductTypeAddModal'
import ProductTypeDeleteModal from './modal/ProductTypeDeleteModal'
import ProductTypeEditModal from './modal/ProductTypeEditModal'
import ProductTypeViewModal from './modal/ProductTypeViewModal'
import { MENU_ID } from './env'
import { useCheckPermission } from '@/_template/CheckPermission'
import ActionsMenu from './ActionsMenu'
// import { useSearchProductType } from '@/_workspace/react-query/hooks/useProductTypeData'

// import ProductCategoryEditModal from './modal/ProductCategoryEditModal'
// import ProductCategoryDeleteModal from './modal/ProductCategoryDeleteModal'
// import ProductTypeAddModal from './modal/ProductTypeAddModal'

//or use your library of choice here

// const initState: SearchResultTableI = {
//   queryPageIndex: 0,
//   queryPageSize: 10,
//   totalCount: 0,
//   querySortBy: [],
//   withRowBorders: true,
//   withTableBorder: false,
//   withColumnBorders: false,
//   striped: true
// }

interface ParamApiSearchProductTypeI extends ParamApiSearchResultTableI_V2 {
  PRODUCT_TYPE_STATUS_WORKING_ID?: number | ''
  PRODUCT_TYPE_NAME?: string
  PRODUCT_TYPE_CODE?: string
  SUFFIX_FOR_PART_NUMBER?: string
  PC_NAME?: string
  PRODUCT_ITEM_NAME?: string
  PRODUCT_ITEM_CODE?: string
  FFT_PART_NUMBER?: string
  // PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID: number | ''
  // PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME: string
  // PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER: string
  // PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION: string
  // PRODUCT_PART_NUMBER: string
  // inuseForSearch?: string
}

// export const getUrlParamSearch = ({
//   queryPageIndex,
//   queryPageSize,
//   querySortBy,
//   queryColumnFilterFns,
//   queryColumnFilters,
//   PRODUCT_TYPE_NAME = '',
//   PRODUCT_TYPE_CODE = '',
//   SUFFIX_FOR_PART_NUMBER = '',
//   PC_NAME = '',
//   PRODUCT_ITEM_NAME = '',
//   PRODUCT_ITEM_CODE = '',
//   FFT_PART_NUMBER = '',
//   PRODUCT_TYPE_STATUS_WORKING_ID = '',
//   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = '',
//   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME = '',
//   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER = '',
//   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION = '',
//   PRODUCT_PART_NUMBER = '',
//   inuseForSearch = ''
//   // INUSE = null
//   // INUSE = ''
//   // PRODUCT_CATEGORY_ID = ''
// }: ParamApiSearchProductTypeI): any => {
//   const params = {
//     PRODUCT_TYPE_NAME: PRODUCT_TYPE_NAME.trim(),
//     PRODUCT_TYPE_STATUS_WORKING_ID: PRODUCT_TYPE_STATUS_WORKING_ID || '',
//     PRODUCT_TYPE_CODE: PRODUCT_TYPE_CODE.trim(),
//     SUFFIX_FOR_PART_NUMBER: SUFFIX_FOR_PART_NUMBER.trim(),
//     // PRODUCT_PART_NUMBER: PRODUCT_PART_NUMBER.trim(),
//     PC_NAME: PC_NAME.trim(),
//     PRODUCT_ITEM_NAME: PRODUCT_ITEM_NAME.trim(),
//     PRODUCT_ITEM_CODE: PRODUCT_ITEM_CODE.trim(),
//     FFT_PART_NUMBER: FFT_PART_NUMBER.trim(),
//     PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID: PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID || '',
//     PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME: PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME.trim(),
//     PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER: PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER.trim(),
//     PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION:
//       PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION.trim(),
//     PRODUCT_PART_NUMBER: PRODUCT_PART_NUMBER.trim(),
//     INUSE: is_Null_Undefined_Blank(inuseForSearch) ? '' : inuseForSearch,
//     Start: queryPageIndex,
//     Limit: queryPageSize,
//     Order: querySortBy.length > 0 ? JSON.stringify(querySortBy).replace('MODIFIED_DATE', 'UPDATE_DATE') : ''
//   }

//   return params
// }

interface Props {
  isEnableFetching: boolean
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

function ProductTypeTableData({ isEnableFetching, setIsEnableFetching }: Props) {
  // const theme = useTheme()
  const { mode: muiMode } = useColorScheme()
  // react-hook-form
  const { getValues, watch, control, setValue } = useFormContext()
  // States
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})
  const [rowSelected, setRowSelected] = useState<MRT_Row<ProductTypeI> | null>(null)

  // States : mui-react-table
  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>(
    getValues('searchResults.columnVisibility')
  )

  const [columnOrder, setColumnOrder] = useState<MRT_ColumnOrderState>(getValues('searchResults.columnOrder') || [])
  const [columnPinning, setColumnPinning] = useState<MRT_ColumnPinningState>(getValues('searchResults.columnPinning'))
  const [density, setDensity] = useState<MRT_DensityState>(getValues('searchResults.density'))
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(getValues('searchResults.columnFilters'))
  const [sorting, setSorting] = useState<MRT_SortingState>(getValues('searchResults.sorting'))

  const [columnFilterFns, setColumnFilterFns] = useState<MRT_ColumnFilterFnsState>(
    getValues('searchResults.columnFilterFns')
    // || {
    //   CREATE_BY: 'contains',
    //   CUSTOMER_INVOICE_TO_ID: 'contains',
    //   CUSTOMER_INVOICE_TO_NAME: 'contains',
    //   CUSTOMER_INVOICE_TO_ALPHABET: 'contains'
    // }
  )

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: getValues('searchResults.pageSize') || 10
  })

  // States : Modal

  const [openAddModal, setOpenModalAdd] = useState<boolean>(false)
  const [openModalEdit, setOpenModalEdit] = useState<boolean>(false)
  const [openModalDelete, setOpenModalDelete] = useState<boolean>(false)
  const [openModalView, setOpenModalView] = useState<boolean>(false)
  const [isFetchingProductType, setIsFetchingProductType] = useState<boolean>(false)
  const { settings } = useSettings()

  const [isExporting, setIsExporting] = useState(false)

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const [open, setOpen] = useState(false)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOpen(prevOpen => !prevOpen)
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setOpen(prevOpen => !prevOpen)
    setAnchorEl(null)
  }

  const handleExportSelected = async () => {
    if (Object.keys(rowSelection).length == 0) {
      // MySwal.fire({
      //   title: 'Product Type is not Selected',
      //   text: 'Please select at least one to export excel',
      //   icon: 'info',
      //   timer: 2500,
      //   background: muiMode === 'dark' ? 'var(--mui-palette-background-paper)' : 'var(--mui-palette-background-paper)',
      //   color: muiMode === 'dark' ? 'var(--mui-palette-text-paper)' : 'var(--mui-palette-text-paper)'
      // })
      handleClose()

      return (
        <ConfirmModal
          show={true}
          title='Product Type is not Selected'
          content='Please select at least one to export excel'
        />
      )
    }

    const dataSelected = []
    for (let i = 0; i < Object.keys(rowSelection).length; i++) {
      const element = Object.keys(rowSelection)[i]
      dataSelected.push(element)
    }

    setIsExporting(true)
    try {
      const dataItem = {
        columnFilters: JSON.parse(localStorage.getItem('columnOrderProductType') || '[]'),
        columnVisibility: getValues('searchResults.columnVisibility'),
        DataForFetch: paramForSearch,
        TYPE: 'selected',
        ListSelected: dataSelected
      }

      const file = await fetchProductTypeExport(dataItem)
      dayjs.extend(utc)
      dayjs.extend(timezone)
      const fileName = `ProductType_${dayjs().tz('Asia/Bangkok').format('YYYYMMDD_HHmmss')}.xlsx`
      saveAs(file, fileName)
      handleClose()
    } catch (error) {
      console.error('Export selected failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const getUrlParamSearch = (rowSelection: any): object => {
    const dataItem: any = []

    for (let i = 0; i < Object.keys(rowSelection).length; i++) {
      const element = Object.keys(rowSelection)[i]

      const data = {
        PRODUCT_TYPE_ID: element
      }
      dataItem.push(data)
    }

    const params = {
      LIST_PRODUCT_TYPE_ID: dataItem
    }
    return params
  }

  const handleExportProductTypeBOMSelected = async () => {
    setIsFetchingProductType(true)
    if (Object.keys(rowSelection).length == 0) {
      // MySwal.fire({
      //   title: 'Product Type is not Selected',
      //   text: 'Please select at least one to export excel',
      //   icon: 'info',
      //   timer: 2500,
      //   background: muiMode === 'dark' ? 'var(--mui-palette-background-paper)' : 'var(--mui-palette-background-paper)',
      //   color: muiMode === 'dark' ? 'var(--mui-palette-text-paper)' : 'var(--mui-palette-text-paper)'
      // })
      handleClose()
      return (
        <ConfirmModal
          show={true}
          title='Product Type is not Selected'
          content='Please select at least one to export excel'
        />
      )
    }

    setIsExporting(true)
    try {
      const dataItem = {
        columnFilters: JSON.parse(localStorage.getItem('columnOrderProductType') || '[]'),
        columnVisibility: getValues('searchResults.columnVisibility'),
        DataForFetch: paramForSearch,
        type: 'selected',
        productType: getUrlParamSearch(rowSelection)
      }

      const file = await fetchProductTypeBOMExport(dataItem)
      dayjs.extend(utc)
      dayjs.extend(timezone)
      const fileName = `ProductType-BOM_${dayjs().tz('Asia/Bangkok').format('YYYYMMDD_HHmmss')}.xlsx`
      saveAs(file, fileName)

      setIsFetchingProductType(false)
      handleClose()
    } catch (error) {
      console.error('Export selected failed:', error)
    } finally {
      setIsFetchingProductType(false)
      setIsExporting(false)
    }

    //mutateProductType(getUrlParamSearch(rowSelection))
  }

  const handleExportProductTypeBOMBySearchFilters = async () => {
    setIsFetchingProductType(true)

    if (
      watch('searchFilters')?.itemCategory == '' &&
      watch('searchFilters')?.productCategory == '' &&
      watch('searchFilters')?.productItemCode == '' &&
      watch('searchFilters')?.productMain == '' &&
      watch('searchFilters')?.productSub == '' &&
      watch('searchFilters')?.productTypeCode == '' &&
      watch('searchFilters')?.productTypeName == '' &&
      watch('searchFilters')?.status == undefined
    ) {
      // MySwal.fire({
      //   title: 'Search Filter is not Selected',
      //   text: 'Please select at least one search filter item to export excel',
      //   icon: 'info',
      //   timer: 2500,
      //   background: muiMode === 'dark' ? 'var(--mui-palette-background-paper)' : 'var(--mui-palette-background-paper)',
      //   color: muiMode === 'dark' ? 'var(--mui-palette-text-paper)' : 'var(--mui-palette-text-paper)'
      // })
      handleClose()
      return (
        <ConfirmModal
          show={true}
          title='Search Filter is not Selected'
          content='Please select at least one search filter item to export excel'
        />
      )
    }

    setIsExporting(true)
    try {
      const dataItem = {
        columnFilters: JSON.parse(localStorage.getItem('columnOrderProductType') || '[]'),
        columnVisibility: getValues('searchResults.columnVisibility'),
        DataForFetch: paramForSearch,
        type: 'AllPage'
        // productType: getUrlParamSearch(rowSelection)
      }

      const file = await fetchProductTypeBOMExport(dataItem)
      dayjs.extend(utc)
      dayjs.extend(timezone)
      const fileName = `ProductType-BOM_${dayjs().tz('Asia/Bangkok').format('YYYYMMDD_HHmmss')}.xlsx`
      saveAs(file, fileName)

      setIsFetchingProductType(false)
      handleClose()
    } catch (error) {
      console.error('Export selected failed:', error)
    } finally {
      setIsFetchingProductType(false)
      setIsExporting(false)
    }

    //mutateProductType(getUrlParamSearch(rowSelection))
  }

  const handleExportAllPage = async () => {
    setIsExporting(true)
    try {
      const dataItem = {
        columnFilters: JSON.parse(localStorage.getItem('columnOrderProductType') || '[]'),
        columnVisibility: getValues('searchResults.columnVisibility'),
        DataForFetch: paramForSearch,
        TYPE: 'AllPage'
      }

      const file = await fetchProductTypeExport(dataItem)
      dayjs.extend(utc)
      dayjs.extend(timezone)
      const fileName = `ProductType_${dayjs().tz('Asia/Bangkok').format('YYYYMMDD_HHmmss')}.xlsx`
      saveAs(file, fileName)
      handleClose()
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }
  // react-query
  const paramForSearch: ParamApiSearchProductTypeI = {
    SearchFilters: [
      {
        id: 'ITEM_CATEGORY_ID',
        value: getValues('searchFilters.itemCategory')?.ITEM_CATEGORY_ID || ''
      },
      {
        id: 'PRODUCT_CATEGORY_ID',
        value: getValues('searchFilters.productCategory')?.PRODUCT_CATEGORY_ID || ''
      },
      {
        id: 'PRODUCT_MAIN_ID',
        value: getValues('searchFilters.productMain')?.PRODUCT_MAIN_ID || ''
      },
      {
        id: 'PRODUCT_SUB_ID',
        value: getValues('searchFilters.productSub')?.PRODUCT_SUB_ID || ''
      },
      {
        id: 'PRODUCT_TYPE_CODE_FOR_SCT',
        value: getValues('searchFilters.productTypeCode') || ''
      },
      {
        id: 'PRODUCT_TYPE_NAME',
        value: getValues('searchFilters.productTypeName') || ''
      },

      {
        id: 'inuseForSearch',
        value: getValues('searchFilters.status')?.value ?? ''
      }
    ],
    ColumnFilters: columnFilters.map(item => ({
      columnFns: columnFilterFns[item.id],
      column: item.id,
      value: item.value
    })),

    // PRODUCT_CATEGORY_NAME: getValues('searchFilters.productCategory')?.PRODUCT_CATEGORY_NAME ?? '',
    // PRODUCT_CATEGORY_ID: getValues('searchFilters.productCategory')?.PRODUCT_CATEGORY_ID ?? '',

    // PRODUCT_MAIN_NAME: getValues('searchFilters.productMainName'),
    // PRODUCT_MAIN_CODE: getValues('searchFilters.productMainCode'),
    // PRODUCT_MAIN_ALPHABET: getValues('searchFilters.productMainAlphabet'),

    // inuseForSearch: getValues('searchFilters.status')?.value ?? ''
    Order: sorting,
    Start: pagination.pageIndex,
    Limit: pagination.pageSize

    //ColumnFilterFns: columnFilterFns
  }

  const { isRefetching, isLoading, data, isError, refetch, isFetching } = useSearchProductType(
    paramForSearch,
    isEnableFetching
  )

  useEffect(() => {
    if (isFetching === false) {
      setIsEnableFetching(false)
    }
  }, [isFetching])

  useUpdateEffect(() => {
    setIsEnableFetching(true)
  }, [JSON.stringify([columnFilters, columnFilterFns, sorting, pagination])])

  // react-table
  const columns = useMemo<MRT_ColumnDef<ProductTypeI>[]>(
    () => [
      {
        accessorKey: 'inuseForSearch',
        header: 'Status',
        size: 200,
        Cell: ({ cell }) => (
          <Chip
            variant={settings.mode === 'dark' ? 'tonal' : 'filled'}
            size='small'
            label={StatusColumn.find(dataItem => dataItem.value === cell.getValue())?.label}
            color={StatusColumn.find(dataItem => dataItem.value === cell.getValue())?.color || 'primary'}
          />
        ),

        filterSelectOptions: StatusColumn,
        filterVariant: 'multi-select',
        enableColumnFilterModes: false,
        Filter: ({ column }) => {
          const idValue = getValues('searchResults.columnFilters').find((item: any) => item.id === column.id)

          let status: typeof StatusColumn = []

          if (idValue?.value?.length > 0) {
            status = StatusColumn.filter(dataItem => idValue?.value?.includes(dataItem.value))
          }

          return (
            <SelectCustom
              value={status}
              isMulti
              isClearable
              options={StatusColumn}
              classNamePrefix='select'
              placeholder='Select Status ...'
              onChange={e => {
                const value = e?.map(status => status.value) ?? []

                column.setFilterValue(value)
              }}
            />
          )
        }
      },

      {
        accessorKey: 'ITEM_CATEGORY_NAME',
        header: 'ITEM CATEGORY NAME',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],

        filterFn: 'contains'
      },
      {
        accessorKey: 'PRODUCT_CATEGORY_NAME',
        header: 'PRODUCT CATEGORY NAME',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],

        filterFn: 'contains'
      },

      {
        accessorKey: 'PRODUCT_MAIN_NAME',
        header: 'PRODUCT MAIN NAME',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],

        filterFn: 'contains'
      },
      {
        accessorKey: 'PRODUCT_SUB_NAME',
        header: 'PRODUCT SUB NAME',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],

        filterFn: 'contains'
      },

      {
        accessorKey: 'PRODUCT_TYPE_CODE',
        header: 'PRODUCT TYPE CODE',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],

        filterFn: 'contains'
      },
      {
        accessorKey: 'PRODUCT_TYPE_CODE_FOR_SCT',
        header: 'PRODUCT TYPE CODE FOR SCT',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],

        filterFn: 'contains'
      },

      {
        accessorKey: 'PRODUCT_TYPE_NAME',
        header: 'PRODUCT TYPE NAME',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],

        filterFn: 'contains'
      },
      {
        accessorKey: 'CUSTOMER_INVOICE_TO_ALPHABET',
        header: 'CUSTOMER INVOICE TO ALPHABET',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 350
      },
      {
        accessorKey: 'ACCOUNT_DEPARTMENT_CODE',
        header: 'ACCOUNT DEPARTMENT CODE',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],

        filterFn: 'contains'
      },
      {
        accessorKey: 'BOM_CODE',
        header: 'BOM CODE',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],

        filterFn: 'contains'
      },
      {
        accessorKey: 'FLOW_CODE',
        header: 'FLOW CODE',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],

        filterFn: 'contains'
      },
      {
        accessorKey: 'PRODUCT_SPECIFICATION_TYPE_NAME',
        header: 'PRODUCT SPECIFICATION TYPE NAME',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 350
      },
      {
        accessorKey: 'UPDATE_DATE',
        header: 'UPDATE DATE',
        filterVariant: 'date',
        columnFilterModeOptions: [
          'equals',
          'notEquals',
          'greaterThan',
          'greaterThanOrEqualTo',
          'lessThan',
          'lessThanOrEqualTo'
        ],
        filterFn: 'equals'
      },
      {
        accessorKey: 'UPDATE_BY',
        header: 'UPDATE BY',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],

        filterFn: 'contains'
      }
    ],
    []
  )

  const isFirstRender = useRef(true)

  useEffect(() => {
    isFirstRender.current = false
  }, [])

  useEffect(() => {
    if (isFirstRender.current) return
    setValue('searchResults.columnFilters', columnFilters)
  }, [columnFilters])

  useEffect(() => {
    if (isFirstRender.current) return
    setValue('searchResults.sorting', sorting)
  }, [sorting])

  useEffect(() => {
    if (isFirstRender.current) return
    setValue('searchResults.density', density)
  }, [density])

  useEffect(() => {
    if (isFirstRender.current) return
    setValue('searchResults.columnVisibility', columnVisibility)
  }, [columnVisibility])
  useEffect(() => {
    if (isFirstRender.current) return
    setValue('searchResults.columnPinning', columnPinning)
  }, [columnPinning])

  useEffect(() => {
    if (isFirstRender.current) return
    setValue('searchResults.columnOrder', columnOrder)
  }, [columnOrder])

  useEffect(() => {
    if (isFirstRender.current) return
    setValue('searchResults.columnFilterFns', columnFilterFns)
  }, [columnFilterFns])

  const table = useMaterialReactTable({
    columns,
    data: data?.data?.ResultOnDb || [],
    manualFiltering: true, //turn off built-in client-side filtering
    manualPagination: true, //turn off built-in client-side pagination
    manualSorting: true, //turn off built-in client-side sorting
    onColumnFiltersChange: setColumnFilters,
    onColumnFilterFnsChange: setColumnFilterFns,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onDensityChange: setDensity,
    onColumnPinningChange: setColumnPinning,
    onColumnOrderChange: newOrder => {
      setColumnOrder(newOrder)
      localStorage.setItem('columnOrderProductType', JSON.stringify(newOrder))
    },
    rowCount: data?.data.TotalCountOnDb ?? 0,

    isMultiSortEvent: () => true,
    enableRowSelection: true,
    getRowId: row => row?.PRODUCT_TYPE_ID?.toString() ?? '',
    onRowSelectionChange: setRowSelection,
    enableStickyHeader: true,
    enableColumnFilterModes: true,
    enableFacetedValues: true,
    enableColumnPinning: true,
    enableRowActions: true,
    enableColumnResizing: true,
    enableColumnOrdering: true,
    paginationDisplayMode: 'pages',
    state: {
      columnFilters,
      isLoading,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      sorting,
      density,
      columnVisibility,
      columnPinning,
      columnOrder,
      columnFilterFns,
      rowSelection
    },
    defaultColumn: {
      //minSize: 80, //allow columns to get smaller than default
      //maxSize: 400, //allow columns to get larger than default
      size: 300 //make columns wider by default
      // muiFilterTextFieldProps: { placeholder: '' }
      // grow: true
    },
    layoutMode: 'grid',
    displayColumnDefOptions: {
      'mrt-row-actions': {
        header: 'Actions', //change header text
        size: 100, //make actions column wider
        grow: false,
        muiTableHeadCellProps: {
          align: 'center' //change head cell props
        }
      },
      'mrt-row-select': {
        enableColumnActions: true,
        enableHiding: true,
        size: 100,
        muiTableHeadCellProps: {
          align: 'center' //change head cell props
        },
        muiTableBodyCellProps: {
          align: 'center' //change head cell props
        }
      }
    },
    renderToolbarInternalActions: ({ table }) => (
      <>
        {/* add your own custom print button or something */}
        {/* <IconButton onClick={() => showPrintPreview(true)}>
          <PrintIcon />
        </IconButton> */}
        {/* built-in buttons (must pass in table prop for them to work!) */}
        {/* <MRT_ToggleFiltersButton table={table} /> */}
        <MRT_ShowHideColumnsButton table={table} />
        <MRT_ToggleDensePaddingButton table={table} />
        <MRT_ToggleFullScreenButton table={table} />
      </>
    ),
    renderTopToolbarCustomActions: () => (
      <div className='flex gap-1'>
        <div className='flex items-center gap-1'>
          <Typography className='hidden sm:block'>Show</Typography>
          <Controller
            name='searchResults.pageSize'
            control={control}
            render={({ field: { onChange, ...fieldProps } }) => (
              <CustomTextField
                {...fieldProps}
                select
                onChange={e => {
                  table.setPageSize(Number(e.target.value))
                  onChange(Number(e.target.value))
                }}
                className='is-[80px]'
                style={{ zIndex: 2001 }}
              >
                <MenuItem value='10'>10</MenuItem>
                <MenuItem value='25'>25</MenuItem>
                <MenuItem value='50'>50</MenuItem>
                <MenuItem value='100'>100</MenuItem>
              </CustomTextField>
            )}
          />
          <Typography className='hidden sm:block'>Entries</Typography>
        </div>
        {/* <Button variant='tonal' onClick={() => table.resetSorting(true)}>
          Clear All Sorting
        </Button> */}
        <Tooltip arrow title='Clear All Sorting' onClick={() => table.resetSorting(true)}>
          <IconButton>
            <Badge badgeContent={sorting.length ?? 0} color='primary'>
              <SwapVertIcon />
            </Badge>
          </IconButton>
        </Tooltip>
        <Tooltip arrow title='Clear All Filters' onClick={() => table.resetColumnFilters(true)}>
          <IconButton>
            <Badge
              badgeContent={
                table.getState().columnFilters.filter((filter: any) => {
                  if (filter.id === 'inuseForSearch' && filter.value.length <= 0) return false

                  return true
                }).length ?? 0
              }
              color='primary'
            >
              <FilterListIcon />
            </Badge>
          </IconButton>
        </Tooltip>
      </div>
    ),

    // renderBottomToolbarCustomActions: () => <>Test</>,
    renderBottomToolbar: ({ table }) => (
      <div className='flex items-center justify-end gap-2 p-3'>
        <div className='flex items-center gap-2'>
          <Typography variant='body1'>
            Showing {pagination.pageIndex * pagination.pageSize + 1} to{' '}
            {pagination.pageIndex * pagination.pageSize + (data?.data?.ResultOnDb?.length || 0)} of{' '}
            {table.getRowCount()} entries
          </Typography>
          {/* <MRT_TablePagination table={table} showRowsPerPage={false} /> */}

          <Pagination
            count={table.getPageOptions().length}
            page={table.getState().pagination.pageIndex + 1}
            onChange={(event, value: number) => table.setPageIndex(value - 1)}
            variant='tonal'
            shape='rounded'
            color='primary'
          />
        </div>
      </div>
    ),

    // muiCircularProgressProps: {
    //   color: 'secondary',
    //   thickness: 5,
    //   size: 55
    // },
    // muiSkeletonProps: {
    //   animation: 'pulse',
    //   height: 28
    // },
    renderRowActions: ({ row }) => (
      <div className='flex '>
        <IconButton onClick={() => handleClickOpenModalView(row)}>
          <i className='tabler-eye text-[22px] text-textSecondary' />
        </IconButton>
        {row.original.inuseForSearch != 0 ? (
          <ActionsMenu
            row={row}
            setOpenModalEdit={setOpenModalEdit}
            setOpenModalDelete={setOpenModalDelete}
            rowSelected={rowSelected}
            setRowSelected={setRowSelected}
            MENU_ID={MENU_ID}
            setOpenModalView={setOpenModalView}
          />
        ) : null}
      </div>
    ),

    initialState: {
      showColumnFilters: false
    },

    // muiPaginationProps: {
    //   showRowsPerPage: false
    // },
    muiToolbarAlertBannerProps: isError
      ? {
          color: 'error',
          children: 'Error loading data'
        }
      : undefined,

    muiTableHeadCellProps: {
      sx: {
        fontWeight: 600,
        textTransform: 'uppercase',

        backgroundColor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.25)'
      }
    },
    muiTableBodyProps: {
      sx: {
        //stripe the rows, make odd rows a darker color
        '& tr:nth-of-type(odd) > td': {
          backgroundColor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.055)'
        }
      }
    },

    //muiTableProps
    // muiTableBodyProps: {
    //   sx: theme => ({
    //     backgroundColor: 'var(--mui-palette-background-paper)'

    //     // '& tr:nth-of-type(odd):not([data-selected="true"]):not([data-pinned="true"]) > td': {
    //     //   backgroundColor: darken('rgb(var(--mui-palette-primary-mainChannel))', 0.9)
    //     // },
    //     // '& tr:nth-of-type(even):not([data-selected="true"]):not([data-pinned="true"]) > td': {
    //     //   backgroundColor: lighten('rgb(var(--mui-palette-background-paper))', 0.1)
    //     // }
    //   })
    // },

    muiTableBodyCellProps: {
      sx: theme => ({
        backgroundColor: 'var(--mui-palette-background-default)',
        fontSize: 15,
        borderRight:
          theme.palette.mode === 'dark'
            ? '1px solid rgb(var(--mui-palette-secondary-mainChannel) / 0.2)'
            : '1px solid rgb(var(--mui-palette-primary-mainChannel) / 0.19)',
        borderBottom:
          theme.palette.mode === 'dark'
            ? '1px solid rgb(var(--mui-palette-secondary-mainChannel) / 0.08)'
            : '1px solid rgb(var(--mui-palette-primary-mainChannel) / 0.19)'
      })
    },

    //   // sx: theme => ({
    //   //   '& tr:nth-of-type(odd):not([data-selected="true"]):not([data-pinned="true"]) > td': {
    //   //     backgroundColor: 'var(--mui-palette-background-default)'
    //   //   },
    //   //   '& tr:nth-of-type(odd):not([data-selected="true"]):not([data-pinned="true"]):hover > td': {
    //   //     backgroundColor: 'var(--mui-palette-background-paper)'
    //   //   },
    //   //   '& tr:nth-of-type(even):not([data-selected="true"]):not([data-pinned="true"]) > td': {
    //   //     backgroundColor: 'var(--mui-palette-background-default)'
    //   //   },
    //   //   '& tr:nth-of-type(even):not([data-selected="true"]):not([data-pinned="true"]):hover > td': {
    //   //     backgroundColor: 'var(--mui-palette-background-paper)'
    //   //   }
    //   // })
    // },
    muiTopToolbarProps: {
      sx: {
        backgroundColor: 'var(--mui-palette-background-default)'
      }
    },
    muiTablePaperProps: ({ table }) => ({
      elevation: 0, //change the mui box shadow
      //customize paper styles
      style: {
        zIndex: table.getState().isFullScreen ? 2000 : undefined
      },
      sx: {
        borderRadius: '0'

        //stripe the rows, make odd rows a darker color
        // '& tr:nth-of-type(odd) > td': {
        //   backgroundColor: '#bb3535'
        // }

        //border: 'none'
      }
    })
  })

  const handleClickOpen = () => setOpenModalAdd(true)
  const handleClickOpenModalView = (row: MRT_Row<ProductTypeI>) => {
    setOpenModalView(true)
    setRowSelected(row)
  }

  const checkPermission = useCheckPermission()

  return (
    <>
      <Card>
        <CardHeader
          title='Search result'
          action={
            <>
              <div className='flex items-center gap-3'>
                <Button
                  variant='outlined'
                  color='primary'
                  startIcon={<FileDownloadIcon />}
                  onClick={handleClick}
                  className='rounded-3xl'
                >
                  <div>
                    Export to Excel{' '}
                    {Object.keys(rowSelection)?.length > 0 && (
                      <Chip
                        variant='tonal'
                        color='primary'
                        size='small'
                        label={Object.keys(rowSelection)?.length || 'X'}
                      />
                    )}
                  </div>
                </Button>

                <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                  {/* Section: Product Type */}
                  <MenuItem disabled sx={{ alignItems: 'center' }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <FileDownloadIcon fontSize='small' />
                    </ListItemIcon>
                    <ListItemText
                      primaryTypographyProps={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: 'text.secondary'
                      }}
                    >
                      Product Type
                    </ListItemText>
                  </MenuItem>
                  <MenuItem onClick={handleExportSelected} disabled={isExporting}>
                    <ListItemIcon sx={{ minWidth: 32 }} />
                    <ListItemText>{isExporting ? 'Exporting...' : 'Export Selected'}</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={handleExportAllPage} disabled={isExporting}>
                    <ListItemIcon sx={{ minWidth: 32 }} />
                    <ListItemText>{isExporting ? 'Exporting...' : 'Export All'}</ListItemText>
                  </MenuItem>

                  <Divider className='m-1' />

                  {/* Section: Product Type - BOM */}
                  <MenuItem disabled sx={{ alignItems: 'center' }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <FileDownloadIcon fontSize='small' />
                    </ListItemIcon>
                    <ListItemText
                      primaryTypographyProps={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: 'text.secondary'
                      }}
                    >
                      Product Type - BOM
                    </ListItemText>
                  </MenuItem>
                  <MenuItem onClick={handleExportProductTypeBOMSelected} disabled={isExporting}>
                    <ListItemIcon sx={{ minWidth: 32 }} />
                    <ListItemText>{isExporting ? 'Exporting...' : 'Export Selected'}</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={handleExportProductTypeBOMBySearchFilters} disabled={isExporting}>
                    <ListItemIcon sx={{ minWidth: 32 }} />
                    <ListItemText>{isExporting ? 'Exporting...' : 'Export All'}</ListItemText>
                  </MenuItem>

                  <Divider className='m-1' />

                  {/* Clear All */}
                  <MenuItem
                    onClick={e => {
                      e.preventDefault()
                      setRowSelection([])
                      handleClose()
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <i className='tabler-trash' />
                    </ListItemIcon>
                    <ListItemText
                      primaryTypographyProps={{
                        fontSize: 16
                      }}
                    >
                      Clear All
                    </ListItemText>
                  </MenuItem>
                </Menu>
                <Divider orientation='vertical' flexItem />
                <Button
                  variant='contained'
                  startIcon={<AddIcon />}
                  onClick={() => {
                    if (checkPermission(Number(import.meta.env.VITE_APPLICATION_ID), MENU_ID, 'IS_CREATE')) {
                      handleClickOpen()
                    }
                  }}
                  color='success'
                  className='rounded-3xl'
                >
                  Add New
                </Button>
              </div>
              {openAddModal ? (
                <ProductTypeAddModal
                  openAddModal={openAddModal}
                  setOpenModalAdd={setOpenModalAdd}
                  setIsEnableFetching={setIsEnableFetching}
                />
              ) : null}
              {openModalEdit && (
                <ProductTypeEditModal
                  openModalEdit={openModalEdit}
                  setOpenModalEdit={setOpenModalEdit}
                  rowSelected={rowSelected}
                  setIsEnableFetching={setIsEnableFetching}
                />
              )}
              {openModalDelete ? (
                <ProductTypeDeleteModal
                  openModalDelete={openModalDelete}
                  setOpenModalDelete={setOpenModalDelete}
                  rowSelected={rowSelected}
                  setIsEnableFetching={setIsEnableFetching}
                />
              ) : null}
              {openModalView ? (
                <ProductTypeViewModal
                  openModalView={openModalView}
                  setOpenModalView={setOpenModalView}
                  rowSelected={rowSelected}
                  setIsEnableFetching={setIsEnableFetching}
                />
              ) : null}
            </>
          }
        />
        {/* {openEditModal ? (
          <ProductTypeCompleteTable
            data={dataProductTypeCompleteAll || []}
            openModalEdit={openModalEdit}
            setOpenModalEdit={setOpenModalEdit}
            rowSelected={rowSelected}
            setIsEnableFetching={setIsEnableFetching}
          />
        ) : null} */}

        {/* {openModalDelete ? (
          <ProductCategoryDeleteModal
            openModalDelete={openModalDelete}
            setOpenModalDelete={setOpenModalDelete}
            rowSelected={rowSelected}
            setIsEnableFetching={setIsEnableFetching}
          />
        ) : null} */}

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MaterialReactTable table={table} />
        </LocalizationProvider>
      </Card>
    </>
  )
}

export default ProductTypeTableData
