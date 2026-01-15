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

import { Controller, useFormContext, UseFormGetValues, UseFormSetValue } from 'react-hook-form'

import { ParamApiSearchResultTableI } from '@/libs/material-react-table/types/SearchResultTable'

// import { useSearch as useSearchDirectCostCondition } from '@/_workspace/react-query/hooks/useDirectCostCondition'

import { is_Null_Undefined_Blank } from '@/utils/formatting-checking-value/checkingValueTypes'

// Types Imports

import { useSearchSctCodeForSelection } from '@/_workspace/react-query/hooks/useStandardCostData'

import { StandardCostI } from '@/_workspace/types/sct/StandardCostType'
import { twMerge } from 'tailwind-merge'

import { useSettings } from '@/@core/hooks/useSettings'
import { fetchSctStatusProgressNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchSctStatusProgress'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import { statusColor } from '@/_workspace/pages/sct/sct-for-product/SearchResult'
import { FormDataPage } from './validationSchema'
import { FormDataPage as FormDataPageParent } from '../../validationSchema'

// import { DirectCostConditionI } from '@/_workspace/types/cost-condition/DirectCostCondition'

interface ParamApiSearchI extends ParamApiSearchResultTableI {
  FISCAL_YEAR: number | string
  PRODUCT_CATEGORY_ID: number | string
  PRODUCT_MAIN_ID: number | string
  PRODUCT_SUB_ID: number | string
  PRODUCT_TYPE_ID: number | string
  SCT_PATTERN_ID: number | string
  BOM_ID: number | string
}

export interface ReturnApiSearchDirectCostConditionI {
  FISCAL_YEAR: number | string
  PRODUCT_CATEGORY_ID: number | string
  PRODUCT_MAIN_ID: number | string
  PRODUCT_SUB_ID: number | string
  PRODUCT_TYPE_ID: number | string
  SCT_PATTERN_ID: number | string
  BOM_ID: number | string
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
  PRODUCT_CATEGORY_ID,
  PRODUCT_MAIN_ID,
  PRODUCT_SUB_ID,
  PRODUCT_TYPE_ID,
  SCT_PATTERN_ID,
  BOM_ID
}: ParamApiSearchI): ReturnApiSearchDirectCostConditionI => {
  const columnFilterQuery = queryColumnFilters.map(item => ({
    columnFns: queryColumnFilterFns[item.id],
    column: item.id.replaceAll('MODIFIED_DATE', 'UPDATE_DATE').replaceAll('inuseForSearch', 'INUSE'),
    value: item.value
  }))

  const params = {
    FISCAL_YEAR: is_Null_Undefined_Blank(FISCAL_YEAR) ? '' : Number(FISCAL_YEAR),
    PRODUCT_CATEGORY_ID: is_Null_Undefined_Blank(PRODUCT_CATEGORY_ID) ? '' : Number(PRODUCT_CATEGORY_ID),
    PRODUCT_MAIN_ID: is_Null_Undefined_Blank(PRODUCT_MAIN_ID) ? '' : Number(PRODUCT_MAIN_ID),
    PRODUCT_SUB_ID: is_Null_Undefined_Blank(PRODUCT_SUB_ID) ? '' : Number(PRODUCT_SUB_ID),
    PRODUCT_TYPE_ID: is_Null_Undefined_Blank(PRODUCT_TYPE_ID) ? '' : Number(PRODUCT_TYPE_ID),
    SCT_PATTERN_ID: is_Null_Undefined_Blank(SCT_PATTERN_ID) ? '' : Number(SCT_PATTERN_ID),
    BOM_ID: is_Null_Undefined_Blank(BOM_ID) ? '' : BOM_ID,
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
  setIsOpenSctDataModal: Dispatch<SetStateAction<boolean>>
  originalName: string
  setValueFormParent: UseFormSetValue<FormDataPageParent>
  getValueFormParent: UseFormGetValues<FormDataPageParent>
  sctCompareNo: number
}

const SctDataModalTableData = ({
  isEnableFetching,
  setIsEnableFetching,
  originalName,
  setIsOpenSctDataModal,
  setValueFormParent,
  getValueFormParent,
  sctCompareNo
}: Props) => {
  const { getValues, control, setValue } = useFormContext<FormDataPage>()
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
    FISCAL_YEAR: getValues('searchFilters.FISCAL_YEAR')?.value ?? '',
    PRODUCT_CATEGORY_ID: getValues('searchFilters.PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID ?? '',
    PRODUCT_MAIN_ID: getValues('searchFilters.PRODUCT_MAIN')?.PRODUCT_MAIN_ID ?? '',
    PRODUCT_SUB_ID: getValues('searchFilters.PRODUCT_SUB')?.PRODUCT_SUB_ID ?? '',
    PRODUCT_TYPE_ID: getValues('searchFilters.PRODUCT_TYPE')?.PRODUCT_TYPE_ID ?? '',
    SCT_PATTERN_ID: getValues('searchFilters.SCT_PATTERN_NO')?.SCT_PATTERN_ID ?? '',
    BOM_ID: getValues('searchFilters.BOM')?.BOM_ID ?? ''
  }

  const { isRefetching, isLoading, data, isError, refetch, isFetching } = useSearchSctCodeForSelection(
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

  const { settings } = useSettings()

  const columns = useMemo<MRT_ColumnDef<StandardCostI>[]>(
    () => [
      {
        accessorKey: 'SCT_STATUS_PROGRESS_NAME',
        header: 'CURRENT PROGRESS',
        Cell({ cell }) {
          let statusValue

          statusValue = statusColor[cell.getValue()]

          if (!statusValue || Object.keys(statusValue).length === 0) {
            return null
          }

          let classNames = twMerge(statusValue.text, statusValue.bg)

          if ((cell.getValue() === 'Checking' || cell.getValue() === 'Waiting Approve') && settings.mode === 'dark') {
            classNames = twMerge(statusValue.darkText, statusValue.darkBg)
          }

          return (
            <Chip
              label={String(cell.getValue())}
              className={classNames}
              // color='primary'
              variant='tonal'
              sx={{
                color: settings.mode === 'light' ? 'var(--mui-palette-text-primary)' : 'undefined'
              }}
            />
          )
        },
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        // size: 250,
        enableSorting: false,
        enableColumnFilterModes: false,
        Filter: ({ column }) => {
          return (
            <AsyncSelectCustom
              label=''
              isClearable
              cacheOptions
              defaultOptions
              loadOptions={inputValue => {
                return fetchSctStatusProgressNameAndInuse({
                  sctStatusProgressName: inputValue,
                  inuse: 1
                })
              }}
              getOptionLabel={data => data?.SCT_STATUS_PROGRESS_NAME.toString()}
              getOptionValue={data => data.SCT_STATUS_PROGRESS_ID.toString()}
              classNamePrefix='select'
              // placeholder='Select SCT Status Progress ...'
              isMulti
              onChange={option => {
                console.log(option)

                if (option?.length > 0) {
                  column.setFilterValue(option.map((item: any) => item.SCT_STATUS_PROGRESS_ID))
                } else {
                  column.setFilterValue(null)
                }
              }}
            />
          )
        }
      },
      {
        accessorKey: 'SCT_REVISION_CODE',
        header: 'SCT Revision Code',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'FISCAL_YEAR',
        header: 'Fiscal Year',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'SCT_PATTERN_NAME',
        header: 'SCT Pattern Name',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'SCT_STATUS_PROGRESS_NAME',
        header: 'SCT Status Progress Name',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'PRODUCT_TYPE_CODE',
        header: 'PRODUCT TYPE CODE',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'PRODUCT_TYPE_NAME',
        header: 'Product Type Name',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'PRODUCT_SUB_NAME',
        header: 'Product Sub Name',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'PRODUCT_MAIN_NAME',
        header: 'Product Main Name',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'PRODUCT_CATEGORY_NAME',
        header: 'Product Category Name',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'BOM_CODE',
        header: 'BOM Code',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'FLOW_CODE',
        header: 'Flow Code',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      }
    ],
    [originalName]
  )

  const table = useMaterialReactTable({
    columns: columns,
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
      // isLoading,
      pagination,
      // showAlertBanner: isError || data?.data.Status === false,
      // showProgressBars: isRefetching,
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
        size: 150,
        grow: false,
        muiTableHeadCellProps: {
          align: 'center'
        },
        muiTableBodyCellProps: {
          align: 'center'
        }
      }
      // 'mrt-row-select': {
      //   enableColumnActions: true,
      //   enableHiding: true,
      //   size: 100,
      //   muiTableHeadCellProps: {
      //     align: 'center'
      //   },
      //   muiTableBodyCellProps: {
      //     align: 'center'
      //   }
      // }
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
        <Tooltip
          arrow
          title='Refresh Data'
          // onClick={() => refetch()}
        >
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
      <>
        <Button
          variant='outlined'
          color='success'
          startIcon={<i className='tabler-check' />}
          onClick={() => {
            // set SCT_COMPARE
            const currentData = getValueFormParent(originalName)

            setValueFormParent(originalName, {
              ...currentData,
              sctCompareNo: sctCompareNo,
              SCT_ID: row.original.SCT_ID,
              sctRevisionCode: row.original?.SCT_REVISION_CODE ?? '',
              bom: {
                BOM_ID: Number(row.original?.BOM_ID),
                BOM_CODE: row.original?.BOM_CODE ?? '',
                BOM_NAME: row.original?.BOM_NAME ?? '',
                FLOW_ID: Number(row.original?.FLOW_ID),
                FLOW_CODE: row.original?.FLOW_CODE ?? '',
                FLOW_NAME: row.original?.FLOW_NAME ?? '',
                TOTAL_COUNT_PROCESS: Number(row.original?.TOTAL_COUNT_PROCESS)
              }
            })
            setIsOpenSctDataModal(false)
          }}
        >
          Select
        </Button>
      </>
    ),
    initialState: { showColumnFilters: columnFilters.filter(cf => cf?.value?.length !== 0)?.length > 0 ? true : false },
    muiToolbarAlertBannerProps:
      // isError ||
      data?.data.Status === false
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
    <Card style={{ border: '1px solid var(--mui-palette-customColors-inputBorder)' }}>
      <CardHeader title='Search result' action={<></>} />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <MaterialReactTable table={table} />
      </LocalizationProvider>
    </Card>
  )
}

export default SctDataModalTableData
