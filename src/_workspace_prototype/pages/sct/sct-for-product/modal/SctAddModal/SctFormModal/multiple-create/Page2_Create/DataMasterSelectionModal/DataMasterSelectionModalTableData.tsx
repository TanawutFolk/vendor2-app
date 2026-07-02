import { YieldRateTypeI } from '@/_workspace/types/yield-rate/YieldRateType'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_ColumnFilterFnsState,
  MRT_ColumnFiltersState,
  MRT_ColumnOrderState,
  MRT_ColumnPinningState,
  MRT_ColumnSizingState,
  MRT_DensityState,
  MRT_PaginationState,
  MRT_ShowHideColumnsButton,
  MRT_SortingState,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MRT_VisibilityState,
  useMaterialReactTable
} from 'material-react-table'
import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react'
import { ClearTimeForSctTypeI } from './ClearTimeForSctType'
import * as useYieldRate from '@/_workspace/react-query/hooks/useYieldRateData'
import * as useClearTime from '@/_workspace/react-query/hooks/useClearTimeForSctData'
import { Badge, Box, Button, Chip, IconButton, MenuItem, Pagination, Tooltip, Typography } from '@mui/material'
import { ParamApiSearchResultTableI } from '@/libs/material-react-table/types/SearchResultTable'
import { Controller, FieldValue, useFormContext, UseFormSetValue, useWatch } from 'react-hook-form'
import { is_Null_Undefined_Blank } from '@/utils/formatting-checking-value/checkingValueTypes'
import CustomTextField from '@/components/mui/TextField'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import FilterListIcon from '@mui/icons-material/FilterList'
import RefreshIcon from '@mui/icons-material/Refresh'
import CustomAvatar from '@/@core/components/mui/Avatar'
import CollectionPointColumn from '@/libs/react-select/option/CollectionPointOption'

interface Props {
  originalName: 'YR_GR_FROM_ENGINEER' | 'TIME_FROM_MFG'
  isEnableFetching: boolean
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
  setValueMain: UseFormSetValue<any>
  setOpenModal: Dispatch<SetStateAction<boolean>>
}

interface ParamApiSearchYieldRateI extends ParamApiSearchResultTableI {
  PRODUCT_MAIN_ID?: string | ''
  PRODUCT_CATEGORY_ID?: string | ''
  PRODUCT_SUB_ID?: string | ''
  PRODUCT_TYPE_NAME?: string | ''
  PRODUCT_TYPE_CODE?: string | ''
  FISCAL_YEAR?: string | ''
  SCT_REASON_SETTING_ID?: string | ''
  SCT_TAG_SETTING_ID?: string | ''
  inuseForSearch?: number
  IS_MODE: boolean
}

const getUrlParamSearch = ({
  queryPageIndex,
  queryPageSize,
  querySortBy,
  queryColumnFilterFns,
  queryColumnFilters,
  PRODUCT_MAIN_ID = '',
  PRODUCT_CATEGORY_ID = '',
  PRODUCT_SUB_ID = '',
  PRODUCT_TYPE_NAME = '',
  PRODUCT_TYPE_CODE = '',
  PRODUCT_TYPE_ID = '',
  FISCAL_YEAR = '',
  SCT_REASON_SETTING_ID = '',
  SCT_TAG_SETTING_ID = '',
  IS_MODE = false,
  inuseForSearch
}: ParamApiSearchYieldRateI): object => {
  const columnFilterQuery = queryColumnFilters.map(item => ({
    columnFns: queryColumnFilterFns[item?.id],
    column: item.id.replaceAll('MODIFIED_DATE', 'UPDATE_DATE').replaceAll('inuseForSearch', 'INUSE'),
    value: item.value
  }))

  const params = {
    PRODUCT_MAIN_ID: PRODUCT_MAIN_ID,
    PRODUCT_CATEGORY_ID: PRODUCT_CATEGORY_ID,
    PRODUCT_SUB_ID: PRODUCT_SUB_ID,
    PRODUCT_TYPE_NAME: PRODUCT_TYPE_NAME.trim(),
    PRODUCT_TYPE_CODE: PRODUCT_TYPE_CODE.trim(),
    PRODUCT_TYPE_ID: PRODUCT_TYPE_ID,
    FISCAL_YEAR: is_Null_Undefined_Blank(FISCAL_YEAR) ? '' : Number(FISCAL_YEAR),
    SCT_REASON_SETTING_ID: SCT_REASON_SETTING_ID,
    SCT_TAG_SETTING_ID: SCT_TAG_SETTING_ID,
    IS_MODE: true,
    inuseForSearch: is_Null_Undefined_Blank(inuseForSearch) ? '' : inuseForSearch,
    Start: queryPageIndex,
    Limit: queryPageSize,
    Order: JSON.parse(
      JSON.stringify(querySortBy).replaceAll('MODIFIED_DATE', 'UPDATE_DATE').replaceAll('inuseForSearch', 'INUSE')
    ),
    //Order: querySortBy.toString().replaceAll('MODIFIED_DATE', 'UPDATE_DATE').replaceAll('inuseForSearch', 'INUSE'),
    // ColumnFilters: JSON.stringify(columnFilterQuery)
    ColumnFilters: columnFilterQuery
  }
  return params
}

const DataMasterSelectionModalTableData = ({
  isEnableFetching,
  setIsEnableFetching,
  originalName,
  setValueMain,
  setOpenModal
}: Props) => {
  const { getValues, control, setValue, watch } = useFormContext()

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>(
    getValues('searchResults.columnVisibility')
  )

  const [columnOrder, setColumnOrder] = useState<MRT_ColumnOrderState>(getValues('searchResults.columnOrder') || [])
  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>(getValues('searchResults.columnSizing') || {})

  const [columnPinning, setColumnPinning] = useState<MRT_ColumnPinningState>(getValues('searchResults.columnPinning'))

  const [density, setDensity] = useState<MRT_DensityState>(getValues('searchResults.density'))

  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(getValues('searchResults.columnFilters'))
  const [sorting, setSorting] = useState<MRT_SortingState>(getValues('searchResults.sorting'))
  const [columnFilterFns, setColumnFilterFns] = useState<MRT_ColumnFilterFnsState>(
    getValues('searchResults.columnFilterFns')
  )
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: getValues('searchResults.pageSize')
  })

  const paramForSearch: ParamApiSearchYieldRateI = {
    queryPageIndex: pagination.pageIndex,
    queryPageSize: pagination.pageSize,
    queryColumnFilters: columnFilters,
    queryColumnFilterFns: columnFilterFns,
    querySortBy: sorting,
    CREATE_BY: '',
    CREATE_DATE: '',
    DESCRIPTION: '',
    UPDATE_BY: '',
    UPDATE_DATE: '',
    PRODUCT_MAIN_ID: watch('searchFilters.PRODUCT_MAIN')?.PRODUCT_MAIN_ID || '',
    PRODUCT_CATEGORY_ID: watch('searchFilters.PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID || '',
    PRODUCT_SUB_ID: watch('searchFilters.PRODUCT_SUB')?.PRODUCT_SUB_ID || '',
    PRODUCT_TYPE_NAME: watch('searchFilters.PRODUCT_TYPE')?.PRODUCT_TYPE_NAME || '',
    PRODUCT_TYPE_CODE: watch('searchFilters.PRODUCT_TYPE')?.PRODUCT_TYPE_CODE || '',
    PRODUCT_TYPE_ID: watch('searchFilters.PRODUCT_TYPE')?.PRODUCT_TYPE_ID || '',
    FISCAL_YEAR: watch('FISCAL_YEAR')?.value || '',
    SCT_REASON_SETTING_ID: watch('SCT_REASON_SETTING')?.SCT_REASON_SETTING_ID || '',
    SCT_TAG_SETTING_ID: watch('SCT_TAG_SETTING')?.SCT_TAG_SETTING_ID || '',
    IS_MODE: watch('openViewMode') || false,
    inuseForSearch: getValues('INUSE')?.value
  }

  function queryFunction() {
    if (originalName === 'YR_GR_FROM_ENGINEER') {
      return useYieldRate.useSearch(getUrlParamSearch(paramForSearch), isEnableFetching)
    } else {
      return useClearTime.useSearch(getUrlParamSearch(paramForSearch), isEnableFetching)
    }
  }

  const { isRefetching, isLoading, data, isError, refetch, isFetching } = queryFunction()

  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) return
    setValue('searchResults.columnFilters', columnFilters)
  }, [columnFilters])

  useEffect(() => {
    //do something when the pagination state changes
    if (isFirstRender.current) return
    setValue('searchResults.sorting', sorting)
  }, [sorting])

  useEffect(() => {
    //do something when the pagination state changes
    if (isFirstRender.current) return
    setValue('searchResults.density', density)
  }, [density])
  useEffect(() => {
    //do something when the pagination state changes
    if (isFirstRender.current) return
    setValue('searchResults.columnVisibility', columnVisibility)
  }, [columnVisibility])
  useEffect(() => {
    //do something when the pagination state changes
    if (isFirstRender.current) return
    setValue('searchResults.columnPinning', columnPinning)
  }, [columnPinning])

  useEffect(() => {
    //do something when the pagination state changes
    if (isFirstRender.current) return
    setValue('searchResults.columnOrder', columnOrder)
  }, [columnOrder])
  useEffect(() => {
    if (isFirstRender.current) return
    setValue('searchResults.columnFilterFns', columnFilterFns)
  }, [columnFilterFns])
  useEffect(() => {
    //do something when the pagination state changes
    if (isFirstRender.current) return
    setValue('searchResults.columnSizing', columnSizing)
  }, [columnSizing])

  const openViewMode = useWatch({ control, name: 'openViewMode' })
  const isPreView = openViewMode === true
  const isTotalView = openViewMode === false

  const columns = useMemo<MRT_ColumnDef<YieldRateTypeI | ClearTimeForSctTypeI>[]>(() => {
    return originalName === 'YR_GR_FROM_ENGINEER'
      ? [
          {
            accessorKey: 'PRODUCT_CATEGORY_NAME',
            header: 'PRODUCT CATEGORY NAME',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains'
          },
          {
            accessorKey: 'PRODUCT_MAIN_NAME',
            header: 'PRODUCT MAIN NAME',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains'
          },
          {
            accessorKey: 'PRODUCT_SUB_NAME',
            header: 'PRODUCT SUB NAME',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains'
          },
          {
            accessorKey: 'PRODUCT_TYPE_NAME',
            header: 'PRODUCT TYPE NAME',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains'
          },
          {
            accessorKey: 'PRODUCT_TYPE_CODE_FOR_SCT',
            header: 'PRODUCT TYPE CODE',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains'
          },
          {
            accessorKey: 'FISCAL_YEAR',
            header: 'FISCAL YEAR',
            Cell: ({ cell }) => {
              return (
                <>
                  <CustomAvatar variant='rounded' color='primary' skin='light'>
                    <p>{cell?.row.original.FISCAL_YEAR}</p>
                  </CustomAvatar>
                  {/* <Chip size='small' icon={status?.icon} color={status?.color} /> */}
                </>
              )
            },
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'equals'
          },
          {
            accessorKey: 'FLOW_CODE',
            header: 'FLOW CODE',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains'
          },
          {
            accessorKey: 'FLOW_NAME',
            header: 'FLOW NAME',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains'
          },
          {
            accessorKey: 'FLOW_PROCESS_NO',
            header: 'FLOW PROCESS NO',
            enableHiding: isTotalView,
            enablePinning: isTotalView,
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains'
          },
          {
            accessorKey: 'PROCESS_NAME',
            header: 'PROCESS NAME',
            enableHiding: isTotalView,
            enablePinning: isTotalView,
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains'
          },
          {
            accessorKey: 'SCT_REASON_SETTING_NAME',
            header: 'SCT REASON SETTING NAME',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains'
          },

          {
            accessorKey: 'YIELD_RATE_FOR_SCT',
            header: 'YIELD RATE',
            enableHiding: isTotalView,
            enablePinning: isTotalView,
            Cell: ({ cell }: any) => {
              return (
                <>
                  <Chip
                    variant='filled'
                    size='small'
                    label={Number(cell.row.original?.YIELD_RATE_FOR_SCT)?.toFixed(2) + '%'}
                    color='primary'
                  />
                </>
              )
            },
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            enableColumnFilter: false,
            enableSorting: false
          },
          {
            accessorKey: 'TOTAL_YIELD_RATE_FOR_SCT',
            header: 'TOTAL YIELD RATE',
            enableHiding: isPreView,
            enablePinning: isPreView,

            Cell: ({ cell }: any) => {
              return (
                <>
                  <Chip
                    variant='filled'
                    size='small'
                    label={Number(cell.row.original?.TOTAL_YIELD_RATE_FOR_SCT)?.toFixed(2) + '%'}
                    color='primary'
                  />
                </>
              )
            },
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            enableColumnFilter: false,
            enableSorting: false
          },

          {
            accessorKey: 'YIELD_ACCUMULATION_FOR_SCT',
            header: 'YIELD ACCUMULATION RATE',
            enableHiding: isTotalView,
            enablePinning: isTotalView,
            Cell: ({ cell }: any) => {
              return (
                <>
                  <Chip
                    variant='filled'
                    size='small'
                    label={Number(cell.row.original?.YIELD_ACCUMULATION_FOR_SCT)?.toFixed(2) + '%'}
                  />
                </>
              )
            },
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            enableColumnFilter: false,
            enableSorting: false
          },
          {
            accessorKey: 'GO_STRAIGHT_RATE_FOR_SCT',
            header: 'GO STRAIGHT RATE',
            enableHiding: isTotalView,
            enablePinning: isTotalView,
            Cell: ({ cell }: any) => {
              return (
                <>
                  <Chip
                    variant='filled'
                    size='small'
                    label={Number(cell.row.original?.GO_STRAIGHT_RATE_FOR_SCT)?.toFixed(2) + '%'}
                  />
                </>
              )
            },
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            enableColumnFilter: false,
            enableSorting: false
          },
          {
            accessorKey: 'TOTAL_GO_STRAIGHT_RATE_FOR_SCT',
            header: 'TOTAL GO STRAIGHT RATE',
            enableHiding: isPreView,
            enablePinning: isPreView,

            Cell: ({ cell }: any) => {
              return (
                <>
                  <Chip
                    variant='filled'
                    size='small'
                    label={Number(cell.row.original?.TOTAL_GO_STRAIGHT_RATE_FOR_SCT)?.toFixed(2) + '%'}
                  />
                </>
              )
            },
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            enableColumnFilter: false,
            enableSorting: false
          },
          {
            accessorKey: 'COLLECTION_POINT_FOR_SCT',
            header: 'COLLECTION POINT',
            enableHiding: isTotalView,
            enablePinning: isTotalView,
            filterVariant: 'text',
            Cell: ({ cell }: any) => {
              const status = CollectionPointColumn.find(
                dataItem => dataItem.value === cell.row.original.COLLECTION_POINT_FOR_SCT
              )

              return (
                <>
                  <Chip variant='outlined' size='small' label={status?.label || '-'} color={status?.color} />
                </>
              )
            },
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains'
          },
          {
            accessorKey: 'REVISION_NO',
            header: 'REVISION NO',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains'
          }
        ]
      : [
          {
            accessorKey: 'FISCAL_YEAR',
            header: 'FISCAL YEAR',
            Cell: ({ cell }) => {
              return (
                <>
                  <CustomAvatar variant='rounded' color='primary' skin='light'>
                    <p>{cell?.row.original.FISCAL_YEAR}</p>
                  </CustomAvatar>
                </>
              )
            },
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'equals'
          },
          {
            accessorKey: 'PRODUCT_CATEGORY_NAME',
            header: 'PRODUCT CATEGORY',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains'
          },
          {
            accessorKey: 'PRODUCT_MAIN_NAME',
            header: 'PRODUCT MAIN',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains'
          },
          {
            accessorKey: 'PRODUCT_SUB_NAME',
            header: 'PRODUCT SUB',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains'
          },
          {
            accessorKey: 'PRODUCT_TYPE_CODE_FOR_SCT',
            header: 'PRODUCT TYPE CODE',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains'
          },
          {
            accessorKey: 'PRODUCT_TYPE_NAME',
            header: 'PRODUCT TYPE NAME',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            grow: true,
            size: 500
          },
          {
            accessorKey: 'FLOW_CODE',
            header: 'FLOW CODE',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains'
          },
          {
            accessorKey: 'FLOW_NAME',
            header: 'FLOW NAME',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains'
          },
          {
            accessorKey: 'FLOW_PROCESS_NO',
            header: 'FLOW PROCESS NO',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains'
          },
          {
            accessorKey: 'PROCESS_NAME',
            header: 'PROCESS NAME',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            grow: true,
            size: 400
          },
          {
            accessorKey: 'CLEAR_TIME',
            header: 'CLEAR TIME',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            enableColumnFilter: false,
            enableSorting: false
          },
          {
            accessorKey: 'CLEAR_TIME_ADJUST',
            header: 'CLEAR TIME ADJUST',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            enableColumnFilter: false,
            enableSorting: false
          },
          {
            accessorKey: 'CLEAR_TIME_FOR_SCT',
            header: 'CLEAR TIME FOR SCT',
            Cell: ({ cell }: any) => {
              return (
                <>
                  <Chip
                    variant='filled'
                    size='small'
                    label={cell.row.original?.CLEAR_TIME_FOR_SCT?.toFixed(4)}
                    color='primary'
                  />
                </>
              )
            },
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            enableColumnFilter: false,
            enableSorting: false
          },
          {
            accessorKey: 'TOTAL_CLEAR_TIME_FOR_SCT',
            header: 'TOTAL CLEAR TIME FOR SCT',
            Cell: ({ cell }: any) => {
              return (
                <>
                  <Chip
                    variant='filled'
                    size='small'
                    label={cell.row.original?.TOTAL_CLEAR_TIME_FOR_SCT?.toFixed(4)}
                    color='primary'
                  />
                </>
              )
            },
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            enableColumnFilter: false,
            enableSorting: false
          },
          {
            accessorKey: 'REVISION_NO',
            header: 'REVISION NO',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains'
          }
        ]
  }, [openViewMode, isTotalView, isPreView])

  const table = useMaterialReactTable({
    columns,
    data: data?.data?.ResultOnDb || [],
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
    onColumnOrderChange: setColumnOrder,
    rowCount: data?.data?.TotalCountOnDb ?? 0,
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
    defaultColumn: {
      size: 300
    },
    layoutMode: 'grid',
    displayColumnDefOptions: {
      'mrt-row-actions': {
        header: 'Actions',
        enableHiding: false,
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
        {/* <MRT_ToggleFiltersButton table={table} /> */}
        <MRT_ShowHideColumnsButton table={table} />
        <MRT_ToggleDensePaddingButton table={table} />
        <MRT_ToggleFullScreenButton table={table} />
      </>
    ),
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', gap: '1rem', p: '4px' }}>
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
        <Tooltip arrow title='Clear All Filters' onClick={() => table.resetColumnFilters(true)}>
          <IconButton>
            <Badge badgeContent={columnFilters.length ?? 0} color='primary'>
              <FilterListIcon />
            </Badge>
          </IconButton>
        </Tooltip>
        <Tooltip arrow title='Refresh Data' onClick={() => refetch()}>
          <IconButton>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
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
        <Button
          color='primary'
          variant='contained'
          onClick={() => {
            console.log(originalName)
            console.log(row.original)

            if (originalName === 'YR_GR_FROM_ENGINEER') {
              setValueMain('YR_GR_FROM_ENGINEER_SELECTION', {
                value: row.original.YIELD_RATE_GO_STRAIGHT_RATE_TOTAL_FOR_SCT_ID,
                label: `${row.original.FISCAL_YEAR} / ${row.original.REVISION_NO}`
              })
            } else {
              setValueMain('TIME_FROM_MFG_SELECTION', {
                value: row.original.CLEAR_TIME_FOR_SCT_TOTAL_ID,
                label: `${row.original.FISCAL_YEAR} / ${row.original.REVISION_NO}`
              })
            }

            setOpenModal(false)
          }}
        >
          Select
        </Button>
      </div>
    ),
    initialState: { showColumnFilters: watch('searchResults.columnFilters')?.length ? true : false },
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
    }
  })

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MaterialReactTable table={table} />
    </LocalizationProvider>
  )
}

export default DataMasterSelectionModalTableData
