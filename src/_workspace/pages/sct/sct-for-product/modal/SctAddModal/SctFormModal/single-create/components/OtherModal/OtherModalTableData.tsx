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

// import { useSearch as useSearchDirectCostCondition } from '@/_workspace/react-query/hooks/useDirectCostCondition'
// import { useSearch as useSearchIndirectCostCondition } from '@/_workspace/react-query/hooks/useIndirectCostCondition'
// import { useSearch as useSearchSpecialCostCondition } from '@/_workspace/react-query/hooks/useSpecialCostCondition'
// import { useSearch as useSearchOtherCostCondition } from '@/_workspace/react-query/hooks/useOtherCostCondition'

import { is_Null_Undefined_Blank } from '@/utils/formatting-checking-value/checkingValueTypes'

// Types Imports
import { FormData } from './OtherModal'
import StandardCostForProductServices from '@/_workspace/services/sct/StandardCostForProductServices'

// import { DirectCostConditionI } from '@/_workspace/types/cost-condition/DirectCostCondition'
// import { IndirectCostConditionI } from '@/_workspace/types/cost-condition/IndirectCostCondition'
// import { SpecialCostConditionI } from '@/_workspace/types/cost-condition/SpecialCostCondition'
// import { OtherCostConditionI } from '@/_workspace/types/cost-condition/OtherCostCondition'

interface ParamApiSearchI extends ParamApiSearchResultTableI {
  FISCAL_YEAR?: number
}

export interface ReturnApiSearchDirectCostConditionI {
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
  FISCAL_YEAR
}: ParamApiSearchI): ReturnApiSearchDirectCostConditionI => {
  const columnFilterQuery = queryColumnFilters.map(item => ({
    columnFns: queryColumnFilterFns[item.id],
    column: item.id.replaceAll('MODIFIED_DATE', 'UPDATE_DATE').replaceAll('inuseForSearch', 'INUSE'),
    value: item.value
  }))

  let params = {
    FISCAL_YEAR: is_Null_Undefined_Blank(FISCAL_YEAR) ? '' : Number(FISCAL_YEAR),
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
  masterDataType: 'MATERIAL_PRICE' | 'YR_GR_FROM_ENGINEER' | 'TIME_FROM_MFG' | 'YR_ACCUMULATION_MATERIAL_FROM_ENGINEER'
  setIsOpenMasterDataSelectionModal: Dispatch<SetStateAction<boolean>>
}

const MasterDataOtherModalTableData = ({
  isEnableFetching,
  setIsEnableFetching,
  getValues,
  control,
  setValue,
  columns,
  masterDataType,
  setIsOpenMasterDataSelectionModal
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

  //! For temporary data
  const [data, setData] = useState<any>({
    data: {
      ResultOnDb: Array.from({ length: 3 }, (_, i) => {
        const year = new Date().getFullYear() + 1 - i
        return { FISCAL_YEAR: year }
      }),
      TotalCountOnDb: Array.from({ length: 3 }, (_, i) => {
        const year = new Date().getFullYear() + 1 - i
        return { FISCAL_YEAR: year }
      }).length,
      Status: true,
      MethodOnDb: '',
      Message: ''
    }
  })

  const paramForSearch: ParamApiSearchI = {
    queryPageIndex: pagination.pageIndex,
    queryPageSize: pagination.pageSize,
    querySortBy: sorting,
    queryColumnFilterFns: columnFilterFns,
    queryColumnFilters: columnFilters,
    FISCAL_YEAR: getValues('searchFilters.FISCAL_YEAR')?.value
  }

  // const getSearchFunction = () => {
  //   if (costConditionType === 'direct') {
  //     return useSearchDirectCostCondition
  //   } else if (costConditionType === 'indirect') {
  //     return useSearchIndirectCostCondition
  //   } else if (costConditionType === 'special') {
  //     return useSearchSpecialCostCondition
  //   } else {
  //     return useSearchOtherCostCondition
  //   }
  // }

  // const useSearchFunction = getSearchFunction()

  // const { isRefetching, isLoading, data, isError, refetch, isFetching } = useSearchFunction(
  //   getUrlParamSearch(paramForSearch),
  //   isEnableFetching
  // )

  // useEffect(() => {
  //   if (isFetching === false) {
  //     setIsEnableFetching(false)
  //   }
  // }, [isFetching])

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

  const columnsDetails = useMemo(
    () => [
      {
        accessorKey: 'FISCAL_YEAR',
        header: 'FISCAL YEAR',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      }
    ],
    [masterDataType]
  )

  const { setValue: setValueMain, getValues: getValuesMain } = useFormContext()

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
      <div
        className='flex items-center cursor-pointer'
        onClick={() => {
          if (masterDataType === 'MATERIAL_PRICE') {
            setValue('MATERIAL_PRICE', row?.original)
            setValueMain('MATERIAL_PRICE', row?.original)

            StandardCostForProductServices.getMaterialPriceData({
              RESOURCE_OPTION_ID: getValuesMain('MATERIAL_PRICE_RESOURCE_OPTION_ID'),
              FISCAL_YEAR: row?.original.FISCAL_YEAR,
              SCT_ID: getValuesMain('SCT_ID')
            }).then(res => {
              setValueMain('MATERIAL_PRICE_DATA', res.data.ResultOnDb)
            })
          } else if (masterDataType === 'YR_GR_FROM_ENGINEER') {
            setValue('YR_GR_FROM_ENGINEER', row?.original)
            setValueMain('YR_GR_FROM_ENGINEER', row?.original)

            StandardCostForProductServices.getYrGrData({
              RESOURCE_OPTION_ID: getValuesMain('YR_GR_FROM_ENGINEER_RESOURCE_OPTION_ID'),
              FISCAL_YEAR: row?.original.FISCAL_YEAR,
              PRODUCT_TYPE_ID: getValuesMain('PRODUCT_TYPE.PRODUCT_TYPE_ID'),
              SCT_REASON_SETTING_ID: getValuesMain('SCT_REASON_SETTING.SCT_REASON_SETTING_ID'),
              SCT_TAG_SETTING_ID: getValuesMain('SCT_TAG_SETTING.SCT_TAG_SETTING_ID'),
              BOM_ID: getValuesMain('BOM_ID')
            }).then(res => {
              setValueMain('YR_GR', res.data.ResultOnDb[0])
              setValueMain('YR_GR_TOTAL', res.data.ResultOnDb[1]?.[0] ?? null)
            })
          } else if (masterDataType === 'TIME_FROM_MFG') {
            setValue('TIME_FROM_MFG', row?.original)
            setValueMain('TIME_FROM_MFG', row?.original)

            StandardCostForProductServices.getTimeData({
              RESOURCE_OPTION_ID: getValuesMain('TIME_FROM_MFG_RESOURCE_OPTION_ID'),
              FISCAL_YEAR: row?.original.FISCAL_YEAR,
              PRODUCT_TYPE_ID: getValuesMain('PRODUCT_TYPE.PRODUCT_TYPE_ID'),
              SCT_REASON_SETTING_ID: getValuesMain('SCT_REASON_SETTING.SCT_REASON_SETTING_ID'),
              SCT_TAG_SETTING_ID: getValuesMain('SCT_TAG_SETTING.SCT_TAG_SETTING_ID'),
              BOM_ID: getValuesMain('BOM_ID')
            }).then(res => {
              setValueMain('CLEAR_TIME', res.data.ResultOnDb[0])
              setValueMain('CLEAR_TIME_TOTAL', res.data.ResultOnDb[1]?.[0] ?? null)
            })
          } else if (masterDataType === 'YR_ACCUMULATION_MATERIAL_FROM_ENGINEER') {
            setValue('YR_ACCUMULATION_MATERIAL_FROM_ENGINEER', row?.original)
            setValueMain('YR_ACCUMULATION_MATERIAL_FROM_ENGINEER', row?.original)
          } else if (masterDataType === 'COST_CONDITION') {
            setValue('COST_CONDITION', row?.original)
            setValueMain('COST_CONDITION', row?.original)
          }

          setIsOpenMasterDataSelectionModal(false)
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
    <Card>
      <CardHeader title='Search result' action={<></>} />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <MaterialReactTable table={table} />
      </LocalizationProvider>
    </Card>
  )
}

export default MasterDataOtherModalTableData
