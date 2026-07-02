import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react'
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

import { FlowProcessI } from '@/_workspace/types/flow/FlowProcess'

import StatusColumn from '@/libs/material-react-table/components/StatusOption'
import { ParamApiSearchResultTableI } from '@/libs/material-react-table/types/SearchResultTable'
import ActionsMenu from '@/libs/material-react-table/components/ActionsMenu'

import { useSearch } from '@/_workspace/react-query/hooks/useFlowProcessData'

import { is_Null_Undefined_Blank } from '@/utils/formatting-checking-value/checkingValueTypes'

// Types Imports
import { FlowInterface, FormData } from './FlowProcessSelectModal'
import { ProcessInterface } from '../FlowProcessAddModal'
import { fetchProcessByFlowProcessId } from '@/_workspace/react-select/async-promise-load-options/fetchFlowProcess'

interface ParamApiSearchI extends ParamApiSearchResultTableI {
  PRODUCT_CATEGORY_ID?: number
  PRODUCT_MAIN_ID?: number
  FLOW_CODE?: string
  FLOW_NAME?: string
  inuseForSearch?: number
}

export interface ReturnApiSearchFlowProcessI {
  PRODUCT_CATEGORY_ID: string | number
  PRODUCT_MAIN_ID: string | number
  FLOW_CODE: string
  FLOW_NAME: string
  INUSE: string | number
  Start: number
  Limit: number
  Order: string
  ColumnFilters: string
}

const getUrlParamSearch = ({
  queryPageIndex,
  queryPageSize,
  querySortBy,
  PRODUCT_CATEGORY_ID,
  PRODUCT_MAIN_ID,
  FLOW_CODE = '',
  FLOW_NAME = '',
  inuseForSearch
}: ParamApiSearchI): ReturnApiSearchFlowProcessI => {
  let params = {
    PRODUCT_CATEGORY_ID: PRODUCT_CATEGORY_ID || '',
    PRODUCT_MAIN_ID: PRODUCT_MAIN_ID || '',
    FLOW_CODE: FLOW_CODE || '',
    FLOW_NAME: FLOW_NAME || '',
    INUSE: is_Null_Undefined_Blank(inuseForSearch) ? '' : Number(inuseForSearch),
    Start: +queryPageIndex,
    Limit: +queryPageSize,
    Order: '[]',
    ColumnFilters: '[]'
  }

  return params
}

export type Props =
  | {
      get: 'process'
      isEnableFetching: boolean
      setIsEnableFetching: Dispatch<SetStateAction<boolean>>
      PRODUCT_MAIN: any
      setProcessSelected: Dispatch<SetStateAction<ProcessInterface[]>>
      setFlowSelected?: (flow: FlowInterface) => void
      setIsShowFlowProcessModal: Dispatch<SetStateAction<boolean>>
      setValue: any
    }
  | {
      get: 'flow'
      isEnableFetching: boolean
      setIsEnableFetching: Dispatch<SetStateAction<boolean>>
      PRODUCT_MAIN: any
      setProcessSelected?: Dispatch<SetStateAction<ProcessInterface[]>>
      setFlowSelected: (flow: FlowInterface) => void
      setIsShowFlowProcessModal: Dispatch<SetStateAction<boolean>>
      setValue: any
    }

const FlowProcessSelectModalTableData = ({
  isEnableFetching,
  setIsEnableFetching,
  PRODUCT_MAIN,
  setProcessSelected,
  setIsShowFlowProcessModal,
  setFlowSelected,
  get,
  setValue: setValueMainModal
}: Props) => {
  const [rowSelected, setRowSelected] = useState<MRT_Row<FlowProcessI> | null>(null)

  // Hooks : react-hook-form
  const { getValues, control, setValue } = useFormContext<FormData>()

  // Table States
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10
  })

  // Hooks : react-query
  const paramForSearch: ParamApiSearchI = {
    queryPageIndex: pagination.pageIndex,
    queryPageSize: pagination.pageSize,
    PRODUCT_CATEGORY_ID: getValues('searchFilters.PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID || undefined,
    PRODUCT_MAIN_ID: getValues('searchFilters.PRODUCT_MAIN')?.PRODUCT_MAIN_ID || undefined,
    FLOW_CODE: getValues('searchFilters.FLOW_CODE') || undefined,
    FLOW_NAME: getValues('searchFilters.FLOW_NAME') || undefined,
    inuseForSearch: getValues('searchFilters.INUSE')?.value
  }

  const { isRefetching, isLoading, data, isError, refetch, isFetching } = useSearch(
    getUrlParamSearch(paramForSearch),
    isEnableFetching
  )

  useEffect(() => {
    if (isFetching === false) {
      // setIsEnableFetching(false)
    }
  }, [isFetching])

  useUpdateEffect(() => {
    setIsEnableFetching(true)
  }, [JSON.stringify([pagination])])

  const isFirstRender = useRef(true)

  useEffect(() => {
    isFirstRender.current = false
  }, [])

  const selectAction = async (row: any) => {
    if (get === 'flow') {
      setFlowSelected(row.original as FlowInterface)
      return
    } else if (get === 'process') {
      const data = await fetchProcessByFlowProcessId(row.original.FLOW_ID)
      setProcessSelected(data as ProcessInterface[])
      setValueMainModal('PRODUCT_MAIN', getValues('searchFilters.PRODUCT_MAIN'))
    }

    setIsShowFlowProcessModal(false)
  }

  const columns = useMemo<MRT_ColumnDef<FlowProcessI>[]>(
    () => [
      {
        accessorKey: 'inuseForSearch',
        header: 'Status',
        Cell: ({ cell }) => {
          const status = StatusColumn.find(dataItem => dataItem.value === cell.row.original.INUSE)

          return (
            <>
              <Chip size='small' label={status?.label} color={status?.color} />
            </>
          )
        },
        filterSelectOptions: StatusColumn,
        enableColumnFilter: false
      },

      {
        accessorKey: 'PRODUCT_MAIN_NAME',
        header: 'PRODUCT MAIN NAME',
        enableColumnFilter: false
      },
      {
        accessorKey: 'FLOW_CODE',
        header: 'FLOW CODE',
        enableColumnFilter: false
      },
      {
        accessorKey: 'FLOW_NAME',
        header: 'FLOW NAME',
        enableColumnFilter: false
      },
      {
        accessorKey: 'TOTAL_COUNT_PROCESS',
        header: 'TOTAL COUNT PROCESS',
        enableColumnFilter: false
      },
      {
        accessorKey: 'MODIFIED_DATE',
        header: 'MODIFIED DATE',
        enableColumnFilter: false
      },
      {
        accessorKey: 'UPDATE_BY',
        header: 'MODIFIED BY',
        enableColumnFilter: false
      }
    ],
    []
  )

  const table = useMaterialReactTable({
    columns,
    data: data?.data.ResultOnDb || [],
    manualFiltering: false,
    manualPagination: true,
    manualSorting: false,
    onPaginationChange: setPagination,
    rowCount: data?.data.TotalCountOnDb ?? 0,
    isMultiSortEvent: () => true,
    enableStickyHeader: true,
    enableColumnFilterModes: true,
    enableFacetedValues: true,
    enableColumnPinning: true,
    enableRowActions: true,
    enableColumnResizing: true,
    enableColumnOrdering: false,
    paginationDisplayMode: 'pages',
    state: {
      isLoading,
      pagination,
      showAlertBanner: isError || data?.data.Status === false,
      showProgressBars: isRefetching
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
    renderToolbarInternalActions: ({ table }) => <></>,
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', gap: '1rem', p: '4px' }}>
        <div className='flex items-center gap-2'>
          <Typography className='hidden sm:block'>Show</Typography>

          <CustomTextField
            value={pagination.pageSize}
            select
            onChange={e => {
              table.setPageSize(Number(e.target.value))
            }}
            className='is-[80px]'
            style={{ zIndex: 2001 }}
          >
            <MenuItem value='10'>10</MenuItem>
            <MenuItem value='25'>25</MenuItem>
            <MenuItem value='50'>50</MenuItem>
            <MenuItem value='100'>100</MenuItem>
          </CustomTextField>

          <Typography className='hidden sm:block'>Entries</Typography>
        </div>
        {/* <Tooltip arrow title='Clear All Sorting' onClick={() => table.resetSorting(true)}>
          <IconButton>
            <Badge badgeContent={sorting.length ?? 0} color='primary'>
              <SwapVertIcon />
            </Badge>
          </IconButton>
        </Tooltip> */}
        {/* <Tooltip arrow title='Clear All Filters' onClick={() => table.resetColumnFilters(true)}>
          <IconButton>
            <Badge badgeContent={columnFilters.length ?? 0} color='primary'>
              <FilterListIcon />
            </Badge>
          </IconButton>
        </Tooltip> */}
        {/* <Tooltip arrow title='Refresh Data' onClick={() => refetch()}>
          <IconButton>
            <RefreshIcon />
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
        <Button variant='outlined' onClick={() => selectAction(row)}>
          Select
        </Button>
      </div>
    ),
    initialState: { showColumnFilters: false },
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
    }
  })

  return (
    <>
      <Card
        sx={{
          border: '1px solid var(--mui-palette-customColors-inputBorder)'
        }}
      >
        <CardHeader title='Search result' />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MaterialReactTable table={table} />
        </LocalizationProvider>
      </Card>
    </>
  )
}

export default FlowProcessSelectModalTableData
