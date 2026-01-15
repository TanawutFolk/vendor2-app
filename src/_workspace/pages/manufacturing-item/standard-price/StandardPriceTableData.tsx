import { Dispatch, ReactNode, SetStateAction, useEffect, useMemo, useRef, useState } from 'react'
import { useUpdateEffect } from 'react-use'

import FileDownloadIcon from '@mui/icons-material/FileDownload'
import {
  Backdrop,
  Badge,
  Box,
  Button,
  Card,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Pagination,
  Tooltip,
  Typography
} from '@mui/material'
import { saveAs } from 'file-saver'

import AddIcon from '@mui/icons-material/Add'
import SwapVertIcon from '@mui/icons-material/SwapVert'

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'

import CustomTextField from '@/components/mui/TextField'

import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_ColumnFilterFnsState,
  MRT_ColumnFiltersState,
  MRT_ColumnPinningState,
  MRT_DensityState,
  MRT_InternalFilterOption,
  MRT_PaginationState,
  MRT_Row,
  MRT_ShowHideColumnsButton,
  MRT_SortingState,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFullScreenButton,
  MRT_VisibilityState,
  useMaterialReactTable
} from 'material-react-table'

import { Controller, useFormContext } from 'react-hook-form'

import StandardPriceModal from './modal/StandardPriceModal'

import { StandardPriceI } from '@/_workspace/types/manufacturing-item/StandardPrice'

import { ParamApiSearchResultTableI } from '@/libs/material-react-table/types/SearchResultTable'

import { useSearch } from '@/_workspace/react-query/hooks/useStandardPrice'

import StatusColumn from '@/libs/material-react-table/components/StatusOption'
import { formatNumber } from '@/utils/formatting-checking-value/checkingValueTypes'

// Types Imports
import { useSettings } from '@/@core/hooks/useSettings'
import { useCheckPermission } from '@/_template/CheckPermission'
import { fetchExportStandardPrice } from '@/_workspace/react-select/async-promise-load-options/fetchStandardPrice'
import { MENU_ID } from './env'
import { FormData } from './page'
import ActionsMenu from '@/libs/material-react-table/components/ActionsMenu'
import StandardPriceDeleteModal from './modal/StandardPriceDeleteModal'

interface ParamApiSearchI extends ParamApiSearchResultTableI {
  M_CODE?: {
    ITEM_ID: number
    ITEM_CODE_FOR_SUPPORT_MES: string
  }
  FISCAL_YEAR?: number
  SCT_PATTERN_ID?: number
  VENDOR_ID?: number
  ITEM_IMPORT_TYPE_ID?: number
  ITEM_INTERNAL_FULL_NAME?: string
  ITEM_INTERNAL_SHORT_NAME?: string
  includingCancelled?: boolean
  manufacturingOption?: number
  INUSE?: number
}

export interface ReturnApiSearchI {
  M_CODE_ID: number | string
  FISCAL_YEAR: number | string
  SCT_PATTERN_ID: number | string
  VENDOR_ID: number | string
  ITEM_IMPORT_TYPE_ID: number | string
  ITEM_INTERNAL_FULL_NAME: string
  ITEM_INTERNAL_SHORT_NAME: string
  includingCancelled: boolean
  manufacturingOption?: string
  INUSE?: number | string
  Start: number
  Limit: number
  Order: any
  ColumnFilters: any
}

const getUrlParamSearch = ({
  queryPageIndex,
  queryPageSize,
  querySortBy,
  queryColumnFilterFns,
  queryColumnFilters,
  M_CODE,
  FISCAL_YEAR,
  SCT_PATTERN_ID,
  ITEM_IMPORT_TYPE_ID,
  VENDOR_ID,
  ITEM_INTERNAL_FULL_NAME,
  ITEM_INTERNAL_SHORT_NAME,
  includingCancelled,
  manufacturingOption,
  INUSE
}: ParamApiSearchI): ReturnApiSearchI => {
  const columnFilterQuery = queryColumnFilters.map(item => ({
    columnFns: queryColumnFilterFns[item.id],
    column: item.id.replaceAll('MODIFIED_DATE', 'UPDATE_DATE').replaceAll('inuseForSearch', 'INUSE'),
    value: item.value
  }))

  let params = {
    ITEM_CODE_FOR_SUPPORT_MES: M_CODE?.ITEM_CODE_FOR_SUPPORT_MES ?? '',
    FISCAL_YEAR: FISCAL_YEAR ? FISCAL_YEAR : '',
    SCT_PATTERN_ID: SCT_PATTERN_ID,
    VENDOR_ID: VENDOR_ID,
    ITEM_IMPORT_TYPE_ID: ITEM_IMPORT_TYPE_ID,
    ITEM_INTERNAL_FULL_NAME: ITEM_INTERNAL_FULL_NAME ? ITEM_INTERNAL_FULL_NAME : '',
    ITEM_INTERNAL_SHORT_NAME: ITEM_INTERNAL_SHORT_NAME ? ITEM_INTERNAL_SHORT_NAME : '',
    includingCancelled: includingCancelled ? includingCancelled : false,
    manufacturingOption: manufacturingOption,
    INUSE: INUSE,
    Start: +queryPageIndex,
    Limit: +queryPageSize,
    Order: querySortBy,
    ColumnFilters: columnFilterQuery
  }

  return params
}

interface Props {
  isEnableFetching: boolean
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const StandardPriceTableData = ({ isEnableFetching, setIsEnableFetching }: Props) => {
  const [openModalAdd, setOpenModalAdd] = useState<boolean>(false)
  const [openModalView, setOpenModalView] = useState<boolean>(false)
  const [openModalDelete, setOpenModalDelete] = useState<boolean>(false)

  const [rowSelected, setRowSelected] = useState<MRT_Row<StandardPriceI> | null>(null)

  const handleClickOpen = () => setOpenModalAdd(true)
  const handleClickOpenModalView = (row: MRT_Row<StandardPriceI>) => {
    setOpenModalView(true)
    setRowSelected(row)
  }

  const { getValues, control, setValue } = useFormContext<FormData>()

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: getValues('searchResults.pageSize') || 10
  })
  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>(
    getValues('searchResults.columnVisibility')
  )
  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('columnOrderStandardPrice') || '[]')
  })
  const [columnPinning, setColumnPinning] = useState<MRT_ColumnPinningState>(getValues('searchResults.columnPinning'))
  const [density, setDensity] = useState<MRT_DensityState>(getValues('searchResults.density'))
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(getValues('searchResults.columnFilters'))
  const [sorting, setSorting] = useState<MRT_SortingState>(getValues('searchResults.sorting'))
  const [columnFilterFns, setColumnFilterFns] = useState<MRT_ColumnFilterFnsState>(
    getValues('searchResults.columnFilterFns')
  )
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const open = Boolean(anchorEl)
  const [anchorElImport, setAnchorElImport] = useState<null | HTMLElement>(null)

  const checkPermission = useCheckPermission()
  const { settings } = useSettings()

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const paramForSearch: ParamApiSearchI = {
    queryPageIndex: pagination.pageIndex,
    queryPageSize: pagination.pageSize,
    querySortBy: sorting,
    queryColumnFilterFns: columnFilterFns,
    queryColumnFilters: columnFilters,
    M_CODE: getValues('searchFilters.ITEM_CODE_FOR_SUPPORT_MES'),
    FISCAL_YEAR: getValues('searchFilters.FISCAL_YEAR'),
    SCT_PATTERN_ID: getValues('searchFilters.SCT_PATTERN')?.SCT_PATTERN_ID,
    VENDOR_ID: getValues('searchFilters.vendor')?.VENDOR_ID,
    ITEM_IMPORT_TYPE_ID: getValues('searchFilters.ITEM_IMPORT_TYPE')?.ITEM_IMPORT_TYPE_ID,
    ITEM_INTERNAL_FULL_NAME: getValues('searchFilters.itemInternalFullName'),
    ITEM_INTERNAL_SHORT_NAME: getValues('searchFilters.itemInternalShortName'),
    includingCancelled: getValues('searchFilters.includingCancelled') || false,
    manufacturingOption: getValues('searchFilters.manufacturingOption')?.value || '',
    INUSE: getValues('searchFilters.status')?.value !== 0 ? getValues('searchFilters.status')?.value : '0'
  }

  const { isRefetching, isLoading, data, isError, isFetching } = useSearch(
    getUrlParamSearch(paramForSearch),
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

  const handleExportCurrentPage = async () => {
    setIsExporting(true)
    try {
      const dataItem = {
        columnFilters: JSON.parse(localStorage.getItem('columnOrderStandardPrice') || '[]'),
        columnVisibility: getValues('searchResults.columnVisibility'),
        DataForFetch: paramForSearch,
        TYPE: 'currentPage'
      }

      const file = await fetchExportStandardPrice(dataItem)
      // สร้าง timestamp แบบ YYYYMMDD_HHmmss
      const now = new Date()
      const pad = (n: number) => n.toString().padStart(2, '0')
      const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`

      // ใช้ชื่อเดียวกับฝั่ง backend ที่จะ generate เช่น ManufacturingItem_20250703_103300.xlsx
      const filename = `ManufacturingItemPrice_${timestamp}.xlsx`
      saveAs(file, filename)
      handleClose()
    } catch (error) {
      console.error('Export current page failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportAllPage = async () => {
    setIsExporting(true)
    try {
      const dataItem = {
        columnFilters: JSON.parse(localStorage.getItem('columnOrderStandardPrice') || '[]'),
        columnVisibility: getValues('searchResults.columnVisibility'),
        DataForFetch: paramForSearch,
        TYPE: 'AllPage'
      }

      const file = await fetchExportStandardPrice(dataItem)
      // สร้าง timestamp แบบ YYYYMMDD_HHmmss
      const now = new Date()
      const pad = (n: number) => n.toString().padStart(2, '0')
      const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`

      // ใช้ชื่อเดียวกับฝั่ง backend ที่จะ generate เช่น ManufacturingItem_20250703_103300.xlsx
      const filename = `ManufacturingItemPrice_${timestamp}.xlsx`
      saveAs(file, filename)
      handleClose()
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const columns = useMemo<MRT_ColumnDef<StandardPriceI>[]>(
    () => [
      {
        accessorKey: 'INUSE',
        header: 'Status',
        size: 200,
        Cell: ({ cell }) => (
          <Chip
            variant={settings.mode === 'dark' ? 'tonal' : 'filled'}
            size='small'
            label={StatusColumn.find(dataItem => dataItem.value === cell.getValue())?.label}
            color={StatusColumn.find(dataItem => dataItem.value === cell.getValue())?.color || 'primary'}
          />
        )
      },
      {
        accessorKey: 'ITEM_CODE_FOR_SUPPORT_MES',
        header: 'ITEM CODE',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 200
      },
      {
        accessorKey: 'ITEM_M_S_PRICE_VALUE',
        header: 'STANDARD PRICE (THB)',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        Cell: ({ row }) => {
          return <>{formatNumber(row.original.ITEM_M_S_PRICE_VALUE, 7)}</>
        },
        size: 280
      },

      {
        accessorKey: 'FISCAL_YEAR',
        header: 'FISCAL YEAR',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 200
      },
      {
        accessorKey: 'SCT_PATTERN_NAME',
        header: 'SCT PATTERN',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 210
      },
      {
        accessorKey: 'VERSION',
        header: 'VERSION',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 150
      },
      {
        accessorKey: 'IS_CURRENT',
        header: 'LATEST VERSION',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 200,
        Cell: ({ row }) => {
          return <>{row.original.IS_CURRENT ? 'Yes' : 'No'}</>
        }
      },
      {
        accessorKey: 'NOTE',
        header: 'NOTE',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 150
      },
      {
        accessorKey: 'VENDOR_NAME',
        header: 'VENDOR NAME',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 350
      },
      {
        accessorKey: 'ITEM_IMPORT_TYPE_NAME',
        header: 'IMPORT TYPE',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 200
      },
      {
        accessorKey: 'VENDOR_ALPHABET',
        header: 'VENDOR ALPHABET',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 250
      },
      {
        accessorKey: 'PURCHASE_UNIT_CODE',
        header: 'PURCHASE UNIT CODE',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'USAGE_UNIT_CODE',
        header: 'USAGE UNIT CODE',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'ITEM_INTERNAL_SHORT_NAME',
        header: 'ITEM INTERNAL SHORT NAME',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 450
      },
      {
        accessorKey: 'ITEM_INTERNAL_FULL_NAME',
        header: 'ITEM INTERNAL FULL NAME',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 450
      },
      {
        accessorKey: 'PURCHASE_PRICE',
        header: 'PURCHASE PRICE',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        Cell: ({ row }) => {
          return (
            <>
              {/* {formatToDecimalDisplay(row.original.PURCHASE_PRICE)} */}
              {formatNumber(row.original.PURCHASE_PRICE, 7)}
              {/* <Chip className='ms-2' label={row.original.PURCHASE_PRICE_CURRENCY_SYMBOL} color='secondary' /> */}
            </>
          )
        },
        size: 250
      },
      {
        accessorKey: 'PURCHASE_PRICE_CURRENCY_SYMBOL',
        header: 'PURCHASE CURRENCY',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 250
      },
      {
        accessorKey: 'EXCHANGE_RATE_VALUE',
        header: 'EXCHANGE RATE',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        Cell: ({ row }) => {
          return (
            <>
              {formatNumber(row.original.EXCHANGE_RATE_VALUE)} {row.original.PURCHASE_PRICE_CURRENCY_SYMBOL}{' '}
              {/* <Chip className='ms-2 me-2' label={row.original.PURCHASE_PRICE_CURRENCY_SYMBOL} color='secondary' /> */}
              = 1 THB
              {/* <Chip className='ms-2 me-2' label={'THB'} color='primary' /> */}
            </>
          )
        },
        size: 250
      },
      {
        accessorKey: 'PURCHASE_UNIT_RATIO',
        header: 'PURCHASE UNIT RATIO',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 280,
        Cell: ({ cell }) => {
          return <>{formatNumber(cell.getValue())}</>
        }
      },
      {
        accessorKey: 'USAGE_UNIT_RATIO',
        header: 'USAGE UNIT RATIO',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 250,
        Cell: ({ cell }) => {
          return <>{formatNumber(cell.getValue())}</>
        }
      },
      {
        accessorKey: 'IMPORT_FEE_RATE',
        header: 'IMPORT FEE RATE (%)',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 250,
        Cell: ({ cell }) => {
          return <>{cell.getValue() === null ? '' : formatNumber(cell.getValue(), 2, false, '%')}</>
        }
      },
      {
        accessorKey: 'ITEM_M_S_PRICE_CREATE_FROM_SETTING_NAME',
        header: 'CREATE FROM',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'ITEM_VERSION_NO',
        header: 'ITEM CODE (VERSION)',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 230
      },
      {
        accessorKey: 'ITEM_IS_CURRENT',
        header: 'ITEM CODE (LATEST VERSION)',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 300,
        Cell: ({ row }) => {
          return <>{row.original.ITEM_IS_CURRENT ? 'Yes' : 'No'}</>
        }
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
        filterFn: 'equals',
        size: 250
      },
      {
        accessorKey: 'UPDATE_BY',
        header: 'UPDATE BY',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 200
      }
    ],
    []
  )

  useEffect(() => {
    if (columnOrder.length === 0) {
      setColumnOrder(columns.map((col: any) => col.accessorKey))
    }
  }, [columns])

  const table = useMaterialReactTable({
    columns,
    data: data?.data.ResultOnDb || [],
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    onColumnFiltersChange: setColumnFilters,
    onColumnFilterFnsChange: setColumnFilterFns,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onDensityChange: setDensity,
    onColumnPinningChange: setColumnPinning,
    onColumnOrderChange: newOrder => {
      setColumnOrder(newOrder)
      localStorage.setItem('columnOrderStandardPrice', JSON.stringify(newOrder))
    },
    rowCount: data?.data.TotalCountOnDb ?? 0,
    isMultiSortEvent: () => true,
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
      showAlertBanner: isError || data?.data.Status === false,
      showProgressBars: isRefetching,
      sorting,
      density,
      columnVisibility,
      columnPinning,
      columnOrder,
      columnFilterFns
    },
    // initialState: {
    //   //showColumnFilters: true,
    //   columnPinning: {
    //     left: ['ITEM_CODE_FOR_SUPPORT_MES']
    //   },
    //   density: 'compact'
    // },
    defaultColumn: {
      size: 300
    },
    layoutMode: 'grid',
    displayColumnDefOptions: {
      'mrt-row-actions': {
        header: 'Actions',
        size: 100,
        grow: false,
        muiTableHeadCellProps: {
          align: 'center'
        }
      },
      'mrt-row-select': {
        enableColumnActions: true,
        enableHiding: true,
        size: 100,
        muiTableHeadCellProps: {
          align: 'center'
        },
        muiTableBodyCellProps: {
          align: 'center'
        }
      }
    },
    renderToolbarInternalActions: ({ table }) => (
      <>
        <MRT_ShowHideColumnsButton table={table} />
        <MRT_ToggleDensePaddingButton table={table} />
        <MRT_ToggleFullScreenButton table={table} />
      </>
    ),
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <div className='flex items-center gap-2'>
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
        <Tooltip arrow title='Clear All Sorting' onClick={() => table.resetSorting(true)}>
          <IconButton>
            <Badge badgeContent={sorting.length ?? 0} color='primary'>
              <SwapVertIcon />
            </Badge>
          </IconButton>
        </Tooltip>
        {/* <Tooltip arrow title='Clear All Filters' onClick={() => table.resetColumnFilters(true)}>
          <IconButton>
            <Badge badgeContent={columnFilters.filter(v => v.value.length !== 0).length ?? 0} color='primary'>
              <FilterListIcon />
            </Badge>
          </IconButton>
        </Tooltip> */}
      </Box>
    ),
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
            onChange={(_event, value: number) => table.setPageIndex(value - 1)}
            variant='tonal'
            shape='rounded'
            color='primary'
          />
        </div>
      </div>
    ),
    renderRowActions: ({ row }) => (
      <div className='flex items-center'>
        {/* <IconButton onClick={() => handleClickOpenModalView(row)}>
          <i className='tabler-eye text-[22px] text-textSecondary' />
        </IconButton> */}
        <ActionsMenu
          row={row}
          isNeedEdit={false}
          isNeedDelete={row?.original?.IS_CURRENT === 1 ? false : true}
          rowSelected={rowSelected}
          setRowSelected={setRowSelected}
          MENU_ID={MENU_ID}
          isNeedViewEyeIcon={false}
          setOpenModalDelete={setOpenModalDelete}
        />
      </div>
    ),
    initialState: { showColumnFilters: columnFilters.filter(cf => cf?.value?.length !== 0)?.length > 0 ? true : false },
    muiToolbarAlertBannerProps:
      isError || data?.data.Status === false
        ? {
            color: 'error',
            children: 'Error loading data => ' + (data?.data?.Message || '')
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
        '& tr:nth-of-type(odd) > td': {
          backgroundColor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.055)'
        }
      }
    },
    muiTopToolbarProps: {
      sx: {
        backgroundColor: 'var(--mui-palette-background-default)'
      }
    },
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
    muiTablePaperProps: ({ table }) => ({
      elevation: 0,
      style: {
        zIndex: table.getState().isFullScreen ? 2000 : undefined
      },
      sx: {
        borderRadius: '0'
      }
    }),
    muiTableHeadProps: {
      sx: {
        '& .MuiInputAdornment-positionEnd': {
          cursor: 'pointer'
        },
        '& .MuiInput-root .tabler-chevron-down': {
          display: 'none'
        }
      }
    },
    muiFilterDatePickerProps: {
      format: 'D-MMM-YYYY'
    },
    renderColumnFilterModeMenuItems: ({ internalFilterOptions, onSelectFilterMode }): ReactNode[] => {
      return internalFilterOptions.map((option: MRT_InternalFilterOption) => (
        <MenuItem key={option.label} className='w-full gap-3' onClick={() => onSelectFilterMode(option.option)}>
          <div className='text-sm'>{option.symbol}</div>
          <div className='text-sm'>{option.label}</div>
        </MenuItem>
      ))
    }
  })

  return (
    <>
      {openModalDelete ? (
        <StandardPriceDeleteModal
          openModalDelete={openModalDelete}
          setOpenModalDelete={setOpenModalDelete}
          rowSelected={rowSelected}
          setIsEnableFetching={setIsEnableFetching}
        />
      ) : null}
      <Card>
        <CardHeader
          title='Search result'
          action={
            <>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outlined'
                  color='primary'
                  startIcon={<FileDownloadIcon />}
                  onClick={handleClick}
                  className='rounded-3xl'
                >
                  Export to Excel
                </Button>
                <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                  <MenuItem onClick={handleExportCurrentPage} disabled={isExporting}>
                    <ListItemIcon>
                      <FileDownloadIcon fontSize='small' />
                    </ListItemIcon>
                    <ListItemText>{isExporting ? 'Exporting...' : 'Export Current Page'}</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={handleExportAllPage} disabled={isExporting}>
                    <ListItemIcon>
                      <FileDownloadIcon fontSize='small' />
                    </ListItemIcon>
                    <ListItemText>{isExporting ? 'Exporting...' : 'Export All'}</ListItemText>
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
              {openModalAdd ? (
                <StandardPriceModal
                  openModalAdd={openModalAdd}
                  setOpenModalAdd={setOpenModalAdd}
                  setIsEnableFetching={setIsEnableFetching}
                  mode='add'
                />
              ) : null}
            </>
          }
        />
        {openModalView ? (
          <StandardPriceModal
            openModalView={openModalView}
            setOpenModalView={setOpenModalView}
            rowSelected={rowSelected}
            setRowSelected={setRowSelected}
            mode='view'
          />
        ) : null}
        {isExporting && (
          <Backdrop open style={{ zIndex: 1300 }}>
            <CircularProgress color='inherit' />
          </Backdrop>
        )}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MaterialReactTable table={table} />
        </LocalizationProvider>
      </Card>
    </>
  )
}

export default StandardPriceTableData
