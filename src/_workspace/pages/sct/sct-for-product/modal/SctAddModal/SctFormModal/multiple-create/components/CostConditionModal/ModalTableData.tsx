import { Dispatch, ReactNode, SetStateAction, useEffect, useMemo, useRef, useState } from 'react'
import { useUpdateEffect } from 'react-use'

import {
  Badge,
  Box,
  Button,
  Card,
  CardHeader,
  Chip,
  IconButton,
  MenuItem,
  Pagination,
  Tooltip,
  Typography
} from '@mui/material'

import SwapVertIcon from '@mui/icons-material/SwapVert'
import FilterListIcon from '@mui/icons-material/FilterList'
import RefreshIcon from '@mui/icons-material/Refresh'
import AddIcon from '@mui/icons-material/Add'

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import CustomTextField from '@/components/mui/TextField'

import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_ColumnFilterFnsState,
  MRT_ColumnFiltersState,
  MRT_ColumnOrderState,
  MRT_ColumnPinningState,
  MRT_DensityState,
  MRT_FilterOption,
  MRT_InternalFilterOption,
  MRT_PaginationState,
  MRT_Row,
  MRT_ShowHideColumnsButton,
  MRT_SortingState,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MRT_VisibilityState,
  useMaterialReactTable
} from 'material-react-table'

import { Controller, useFormContext } from 'react-hook-form'

import { ParamApiSearchResultTableI } from '@/libs/material-react-table/types/SearchResultTable'

import { useSearch as useSearchDirectCostCondition } from '@/_workspace/react-query/hooks/useDirectCostCondition'
import { useSearch as useSearchIndirectCostCondition } from '@/_workspace/react-query/hooks/useIndirectCostCondition'
import { useSearch as useSearchSpecialCostCondition } from '@/_workspace/react-query/hooks/useSpecialCostCondition'
import { useSearch as useSearchOtherCostCondition } from '@/_workspace/react-query/hooks/useOtherCostCondition'

import { is_Null_Undefined_Blank } from '@/utils/formatting-checking-value/checkingValueTypes'

// Types Imports
import { FormData } from './Modal'

import { DirectCostConditionI } from '@/_workspace/types/cost-condition/DirectCostCondition'
import { IndirectCostConditionI } from '@/_workspace/types/cost-condition/IndirectCostCondition'
import { SpecialCostConditionI } from '@/_workspace/types/cost-condition/SpecialCostCondition'
import { OtherCostConditionI } from '@/_workspace/types/cost-condition/OtherCostCondition'

interface ParamApiSearchI extends ParamApiSearchResultTableI {
  PRODUCT_MAIN?: {
    PRODUCT_MAIN_ID: number
    PRODUCT_MAIN_NAME: string
  }
  FISCAL_YEAR?: number
}

export interface ReturnApiSearchDirectCostConditionI {
  PRODUCT_MAIN_ID: number | string
  FISCAL_YEAR: number | string
  Start: number
  Limit: number
  Order: string
  ColumnFilters: string
}

const getUrlParamSearch = ({
  queryPageIndex,
  queryPageSize,
  querySortBy,
  queryColumnFilterFns,
  queryColumnFilters,
  FISCAL_YEAR,
  PRODUCT_MAIN
}: ParamApiSearchI): ReturnApiSearchDirectCostConditionI => {
  const columnFilterQuery = queryColumnFilters.map(item => ({
    columnFns: queryColumnFilterFns[item.id],
    column: item.id.replaceAll('MODIFIED_DATE', 'UPDATE_DATE').replaceAll('inuseForSearch', 'INUSE'),
    value: item.value
  }))

  let params = {
    FISCAL_YEAR: is_Null_Undefined_Blank(FISCAL_YEAR) ? '' : Number(FISCAL_YEAR),
    PRODUCT_MAIN_ID: PRODUCT_MAIN ? PRODUCT_MAIN.PRODUCT_MAIN_ID : '',
    Start: +queryPageIndex,
    Limit: +queryPageSize,
    Order: JSON.stringify(querySortBy).replaceAll('MODIFIED_DATE', 'UPDATE_DATE').replaceAll('inuseForSearch', 'INUSE'),
    ColumnFilters: JSON.stringify(columnFilterQuery)
  }

  return params
}

interface Props {
  isEnableFetching: boolean
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
  getValues: any
  control: any
  setValue: any
  columns: string[]
  costConditionType: 'direct' | 'indirect' | 'special' | 'other'
  setIsOpenMasterDataModal: Dispatch<SetStateAction<boolean>>
}

const MasterDataModalTableData = ({
  isEnableFetching,
  setIsEnableFetching,
  getValues,
  control,
  setValue,
  columns,
  costConditionType,
  setIsOpenMasterDataModal
}: Props) => {
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: getValues('searchResults.pageSize') || 10
  })
  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>(
    getValues('searchResults.columnVisibility')
  )
  const [columnOrder, setColumnOrder] = useState<MRT_ColumnOrderState>(getValues('searchResults.columnOrder'))
  const [columnPinning, setColumnPinning] = useState<MRT_ColumnPinningState>(getValues('searchResults.columnPinning'))
  const [density, setDensity] = useState<MRT_DensityState>(getValues('searchResults.density'))
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(getValues('searchResults.columnFilters'))
  const [sorting, setSorting] = useState<MRT_SortingState>(getValues('searchResults.sorting'))
  const [columnFilterFns, setColumnFilterFns] = useState<MRT_ColumnFilterFnsState>(
    getValues('searchResults.columnFilterFns')
  )

  const paramForSearch: ParamApiSearchI = {
    queryPageIndex: pagination.pageIndex,
    queryPageSize: pagination.pageSize,
    querySortBy: sorting,
    queryColumnFilterFns: columnFilterFns,
    queryColumnFilters: columnFilters,
    FISCAL_YEAR: getValues('searchFilters.FISCAL_YEAR')?.value,
    PRODUCT_MAIN: getValues('searchFilters.PRODUCT_MAIN')
  }

  const getSearchFunction = () => {
    if (costConditionType === 'direct') {
      return useSearchDirectCostCondition
    } else if (costConditionType === 'indirect') {
      return useSearchIndirectCostCondition
    } else if (costConditionType === 'special') {
      return useSearchSpecialCostCondition
    } else {
      return useSearchOtherCostCondition
    }
  }

  const useSearchFunction = getSearchFunction()

  const { isRefetching, isLoading, data, isError, refetch, isFetching } = useSearchFunction(
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

  const columnsDetails =
    costConditionType === 'direct'
      ? useMemo<MRT_ColumnDef<DirectCostConditionI>[]>(
          () => [
            {
              accessorKey: 'PRODUCT_MAIN_NAME',
              header: 'PRODUCT MAIN',
              filterVariant: 'text',
              columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
              filterFn: 'contains'
            },
            {
              accessorKey: 'DIRECT_UNIT_PROCESS_COST',
              header: 'DIRECT UNIT PROCESS COST (THB/h)',
              filterVariant: 'text',
              columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
              filterFn: 'contains'
            },
            {
              accessorKey: 'INDIRECT_RATE_OF_DIRECT_PROCESS_COST',
              header: 'INDIRECT RATE OF DIRECT PROCESS COST (%)',
              filterVariant: 'text',
              columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
              filterFn: 'contains'
            },
            {
              accessorKey: 'FISCAL_YEAR',
              header: 'FISCAL YEAR',
              filterVariant: 'text',
              columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
              filterFn: 'contains'
            },
            {
              accessorKey: 'VERSION',
              header: 'VERSION',
              filterVariant: 'text',
              columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
              filterFn: 'contains'
            }
          ],
          [costConditionType]
        )
      : costConditionType === 'indirect'
        ? useMemo<MRT_ColumnDef<IndirectCostConditionI>[]>(
            () => [
              {
                accessorKey: 'PRODUCT_MAIN_NAME',
                header: 'PRODUCT MAIN',
                filterVariant: 'text',
                columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
                filterFn: 'contains'
              },
              {
                accessorKey: 'LABOR',
                header: 'LABOR',
                filterVariant: 'text',
                columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
                filterFn: 'contains'
              },
              {
                accessorKey: 'DEPRECIATION',
                header: 'DEPRECIATION',
                filterVariant: 'text',
                columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
                filterFn: 'contains'
              },
              {
                accessorKey: 'OTHER_EXPENSE',
                header: 'OTHER EXPENSE',
                filterVariant: 'text',
                columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
                filterFn: 'contains'
              },
              {
                accessorKey: 'FISCAL_YEAR',
                header: 'FISCAL YEAR',
                filterVariant: 'text',
                columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
                filterFn: 'contains'
              },
              {
                accessorKey: 'VERSION',
                header: 'VERSION',
                filterVariant: 'text',
                columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
                filterFn: 'contains'
              }
            ],
            [costConditionType]
          )
        : costConditionType === 'special'
          ? useMemo<MRT_ColumnDef<SpecialCostConditionI>[]>(
              () => [
                {
                  accessorKey: 'PRODUCT_MAIN_NAME',
                  header: 'PRODUCT MAIN',
                  filterVariant: 'text',
                  columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
                  filterFn: 'contains'
                },
                {
                  accessorKey: 'ADJUST_PRICE',
                  header: 'ADJUST PRICE',
                  filterVariant: 'text',
                  columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
                  filterFn: 'contains'
                },
                {
                  accessorKey: 'FISCAL_YEAR',
                  header: 'FISCAL YEAR',
                  filterVariant: 'text',
                  columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
                  filterFn: 'contains'
                },
                {
                  accessorKey: 'VERSION',
                  header: 'VERSION',
                  filterVariant: 'text',
                  columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
                  filterFn: 'contains'
                }
              ],
              [costConditionType]
            )
          : useMemo<MRT_ColumnDef<OtherCostConditionI>[]>(
              () => [
                {
                  accessorKey: 'PRODUCT_MAIN_NAME',
                  header: 'PRODUCT MAIN',
                  filterVariant: 'text',
                  columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
                  filterFn: 'contains'
                },
                {
                  accessorKey: 'GA',
                  header: 'GA',
                  filterVariant: 'text',
                  columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
                  filterFn: 'contains'
                },
                {
                  accessorKey: 'MARGIN',
                  header: 'MARGIN',
                  filterVariant: 'text',
                  columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
                  filterFn: 'contains'
                },
                {
                  accessorKey: 'SELLING_EXPENSE',
                  header: 'SELLING EXPENSE',
                  filterVariant: 'text',
                  columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
                  filterFn: 'contains'
                },
                {
                  accessorKey: 'VAT',
                  header: 'VAT',
                  filterVariant: 'text',
                  columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
                  filterFn: 'contains'
                },
                {
                  accessorKey: 'CIT',
                  header: 'CIT',
                  filterVariant: 'text',
                  columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
                  filterFn: 'contains'
                },
                {
                  accessorKey: 'FISCAL_YEAR',
                  header: 'FISCAL YEAR',
                  filterVariant: 'text',
                  columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
                  filterFn: 'contains'
                },
                {
                  accessorKey: 'VERSION',
                  header: 'VERSION',
                  filterVariant: 'text',
                  columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
                  filterFn: 'contains'
                }
              ],
              [costConditionType]
            )

  const { setValue: setValueMain } = useFormContext()

  const table = useMaterialReactTable({
    columns: columnsDetails,
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
    onColumnOrderChange: setColumnOrder,
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
            <Badge badgeContent={columnFilters.filter(v => v.value.length !== 0).length ?? 0} color='primary'>
              <FilterListIcon />
            </Badge>
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
      <div
        className='flex items-center cursor-pointer'
        onClick={() => {
          if (costConditionType === 'direct') {
            setValue('COST_CONDITION..DIRECT_COST_CONDITION', row?.original)
            setValueMain('COST_CONDITION.DIRECT_COST_CONDITION', row?.original)
          } else if (costConditionType === 'indirect') {
            setValue('COST_CONDITION..INDIRECT_COST_CONDITION', row?.original)
            setValueMain('COST_CONDITION.INDIRECT_COST_CONDITION', row?.original)
          } else if (costConditionType === 'special') {
            setValue('COST_CONDITION..SPECIAL_COST_CONDITION', row?.original)
            setValueMain('COST_CONDITION.SPECIAL_COST_CONDITION', row?.original)
          } else {
            setValue('COST_CONDITION..OTHER_COST_CONDITION', row?.original)
            setValueMain('COST_CONDITION.OTHER_COST_CONDITION', row?.original)
          }

          setIsOpenMasterDataModal(false)
        }}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          stroke-width='2'
          stroke-linecap='round'
          stroke-linejoin='round'
          class='icon icon-tabler icons-tabler-outline icon-tabler-checkbox'
        >
          <path stroke='none' d='M0 0h24v24H0z' fill='none' />
          <path d='M9 11l3 3l8 -8' />
          <path d='M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9' />
        </svg>
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
        fontSize: 15
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
    <Card>
      <CardHeader title='Search result' action={<></>} />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <MaterialReactTable table={table} />
      </LocalizationProvider>
    </Card>
  )
}

export default MasterDataModalTableData
