import { Dispatch, ReactNode, SetStateAction, useEffect, useMemo, useRef, useState } from 'react'
import { useUpdateEffect } from 'react-use'

import {
  Badge,
  Box,
  Button,
  Card,
  CardHeader,
  IconButton,
  MenuItem,
  Pagination,
  Tooltip,
  Typography
} from '@mui/material'

import FilterListIcon from '@mui/icons-material/FilterList'
import SwapVertIcon from '@mui/icons-material/SwapVert'

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'

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
  MRT_ShowHideColumnsButton,
  MRT_SortingState,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MRT_VisibilityState,
  useMaterialReactTable
} from 'material-react-table'

import { Controller, useFormContext, UseFormReturn } from 'react-hook-form'

import { ParamApiSearchResultTableI } from '@/libs/material-react-table/types/SearchResultTable'

import { useSearch } from '@/_workspace/react-query/hooks/useClearTimeTotalForSctData'

import { is_Null_Undefined_Blank } from '@/utils/formatting-checking-value/checkingValueTypes'
import { FormDataPage } from './validationSchema'
import { FormDataPage as FormDataPageParent } from '../../validationSchema'
import { ClearTimeTotalForSctI } from '@/_workspace/types/_ClearTimeSystem/ClearTimeTotalForSctType'
// Types Imports

interface ParamApiSearchI extends ParamApiSearchResultTableI {
  PRODUCT_TYPE?: {
    PRODUCT_TYPE_ID: number
    PRODUCT_TYPE_CODE: string
    PRODUCT_TYPE_NAME: string
  }
  FISCAL_YEAR?: number
}

export interface ReturnApiSearchClearTimeTotalForSctI {
  PRODUCT_TYPE_ID: number | string
  FISCAL_YEAR: number | string
  Start: number
  Limit: number
  Order: Array<{ id: string; desc: boolean }>
  ColumnFilters: Array<{ columnFns: MRT_FilterOption; column: string; value: unknown }>
}

const getUrlParamSearch = ({
  queryPageIndex,
  queryPageSize,
  querySortBy,
  queryColumnFilterFns,
  queryColumnFilters,
  FISCAL_YEAR,
  PRODUCT_TYPE
}: ParamApiSearchI): ReturnApiSearchClearTimeTotalForSctI => {
  const columnFilterQuery = queryColumnFilters.map(item => ({
    columnFns: queryColumnFilterFns[item.id],
    column: item.id.replaceAll('MODIFIED_DATE', 'UPDATE_DATE').replaceAll('inuseForSearch', 'INUSE'),
    value: item.value
  }))

  const params = {
    FISCAL_YEAR: is_Null_Undefined_Blank(FISCAL_YEAR) ? '' : Number(FISCAL_YEAR),
    PRODUCT_TYPE_ID: PRODUCT_TYPE ? PRODUCT_TYPE.PRODUCT_TYPE_ID : '',
    Start: queryPageIndex,
    Limit: queryPageSize,
    Order: querySortBy,
    ColumnFilters: columnFilterQuery
  }

  return params
}

interface Props {
  isEnableFetching: boolean
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
  setIsOpenModal: Dispatch<SetStateAction<boolean>>
  RHF_parent: UseFormReturn<FormDataPageParent>
  onChange: () => void
}

const ClearTimeTableData = ({ isEnableFetching, setIsEnableFetching, setIsOpenModal, RHF_parent, onChange }: Props) => {
  const { setValue: setValueParent, getValues: getValuesParent } = RHF_parent

  const { getValues, control, setValue } = useFormContext<FormDataPage>()

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10
  })
  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({})
  const [columnOrder, setColumnOrder] = useState<MRT_ColumnOrderState>([])
  const [columnPinning, setColumnPinning] = useState<MRT_ColumnPinningState>({
    left: [],
    right: []
  })
  const [density, setDensity] = useState<MRT_DensityState>('compact')
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [columnFilterFns, setColumnFilterFns] = useState<MRT_ColumnFilterFnsState>({})

  const paramForSearch: ParamApiSearchI = {
    queryPageIndex: pagination.pageIndex,
    queryPageSize: pagination.pageSize,
    querySortBy: sorting ?? [],
    queryColumnFilterFns: columnFilterFns ?? {},
    queryColumnFilters: columnFilters ?? [],
    FISCAL_YEAR: getValues('searchFilters.FISCAL_YEAR')?.value,
    PRODUCT_TYPE: getValues('searchFilters.PRODUCT_TYPE') ?? undefined
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

  const columns = useMemo<MRT_ColumnDef<ClearTimeTotalForSctI>[]>(
    () => [
      {
        accessorKey: 'FISCAL_YEAR',
        header: 'FISCAL YEAR',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 180
      },
      {
        accessorKey: 'REVISION_NO',
        header: 'VERSION',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 150
      },
      {
        accessorKey: 'PRODUCT_MAIN_NAME',
        header: 'PRODUCT MAIN NAME',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'TOTAL_CLEAR_TIME_FOR_SCT',
        header: 'TOTAL CLEAR TIME FOR SCT (MM)',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 350
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
        filterFn: 'contains',
        size: 350
      },
      {
        accessorKey: 'MODIFIED_DATE',
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
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      }
    ],
    []
  )

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
        header: 'Selection',
        size: 150,
        // grow: false,
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
            <Badge badgeContent={columnFilters.filter(v => v?.value !== 0).length ?? 0} color='primary'>
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
      <>
        {getValuesParent('header.bom.FLOW_ID') === row.original.FLOW_ID && (
          <Button
            variant='outlined'
            color='success'
            size='small'
            startIcon={<i className='tabler-check' />}
            onClick={() => {
              setValueParent(
                'directCost.flowProcess.total.main.clearTime',
                {
                  fiscalYear: row.original.FISCAL_YEAR,
                  version: row.original.REVISION_NO
                  // totalClearTime: row.original.TOTAL_CLEAR_TIME_FOR_SCT,
                  // flowId: row.original.FLOW_ID,
                  // flowCode: row.original.FLOW_CODE,
                  // flowName: row.original.FLOW_NAME
                },
                { shouldValidate: true, shouldDirty: true, shouldTouch: true }
              )

              onChange()
              setIsOpenModal(false)
            }}
          >
            Select
          </Button>
        )}
      </>
    ),
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
      <Card style={{ overflow: 'visible', zIndex: 4, border: '1px solid var(--mui-palette-customColors-inputBorder)' }}>
        <CardHeader title='Search result' />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MaterialReactTable table={table} />
        </LocalizationProvider>
      </Card>
    </>
  )
}

export default ClearTimeTableData
