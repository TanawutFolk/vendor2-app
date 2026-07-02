import { ParamApiSearchResultTableI } from '@/libs/material-react-table/types/SearchResultTable'
import { is_Null_Undefined_Blank } from '@/utils/formatting-checking-value/checkingValueTypes'
import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react'
import { BomInterface, ItemInterface } from '../BomAddModal'
import { useFormContext } from 'react-hook-form'
import { MaterialReactTable, MRT_ColumnDef, MRT_PaginationState, useMaterialReactTable } from 'material-react-table'
import { FormData } from './BomSelectModal'
import { useSearch } from '@/_workspace/react-query/hooks/useBomData'
import { useUpdateEffect } from 'react-use'
import StatusColumn from '@/libs/material-react-table/components/StatusOption'
import { BomI } from '@/_workspace/types/bom/Bom'
import { Box, Button, Card, CardHeader, Chip, CircularProgress, MenuItem, Pagination, Typography } from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers'
import CustomTextField from '@/components/mui/TextField'
import { fetchBomDetailsByBomId } from '@/_workspace/react-select/async-promise-load-options/fetchBom'

interface ParamApiSearchI extends ParamApiSearchResultTableI {
  BOM_NAME?: string
  BOM_CODE?: string
  PRODUCTION_PURPOSE_ID?: number
  FLOW_ID?: number
  PRODUCT_CATEGORY_ID?: number
  PRODUCT_MAIN_ID?: number
  inuseForSearch?: number
}

export interface ReturnApiSearchBomI {
  BOM_NAME: string
  BOM_CODE: string
  PRODUCTION_PURPOSE_ID: string | number
  FLOW_ID: string | number
  PRODUCT_CATEGORY_ID: string | number
  PRODUCT_MAIN_ID: string | number
  INUSE: string | number
  Start: number
  Limit: number
  Order: string
  ColumnFilters: string
}

const getUrlParamSearch = ({
  queryPageIndex,
  queryPageSize,
  BOM_NAME,
  BOM_CODE,
  PRODUCTION_PURPOSE_ID,
  FLOW_ID,
  PRODUCT_CATEGORY_ID,
  PRODUCT_MAIN_ID,
  inuseForSearch
}: ParamApiSearchI): ReturnApiSearchBomI => {
  let params = {
    BOM_NAME: BOM_NAME || '',
    BOM_CODE: BOM_CODE || '',
    PRODUCTION_PURPOSE_ID: PRODUCTION_PURPOSE_ID || '',
    FLOW_ID: FLOW_ID || '',
    PRODUCT_CATEGORY_ID: PRODUCT_CATEGORY_ID || '',
    PRODUCT_MAIN_ID: PRODUCT_MAIN_ID || '',
    INUSE: is_Null_Undefined_Blank(inuseForSearch) ? '' : Number(inuseForSearch),
    Start: +queryPageIndex,
    Limit: +queryPageSize,
    Order: '[]',
    ColumnFilters: '[]'
  }

  return params
}

/*
isEnableFetching={isEnableFetching}
setIsEnableFetching={setIsEnableFetching}
setBomSelected={setBomSelected}
setIsShowBomModal={setIsShowBomModal}
setValue={setValue}
*/

export type Props = {
  isEnableFetching: boolean
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
  setBomSelected: (data: any) => void
  setIsShowBomModal: Dispatch<SetStateAction<boolean>>
  setValue: any
}

const BomSelectModalTableData = ({
  isEnableFetching,
  setIsEnableFetching,
  setBomSelected,
  setIsShowBomModal,
  setValue: setFormValue
}: Props) => {
  const [isLoadingBom, setIsLoadingBom] = useState(false)

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
    BOM_NAME: getValues('searchFilters.BOM_NAME') || undefined,
    BOM_CODE: getValues('searchFilters.BOM_CODE') || undefined,
    PRODUCTION_PURPOSE_ID: getValues('searchFilters.PRODUCTION_PURPOSE')?.PRODUCTION_PURPOSE_ID || undefined,
    FLOW_ID: getValues('searchFilters.FLOW_PROCESS_CODE')?.FLOW_ID || undefined,
    PRODUCT_CATEGORY_ID: getValues('searchFilters.PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID || undefined,
    PRODUCT_MAIN_ID: getValues('searchFilters.PRODUCT_MAIN')?.PRODUCT_MAIN_ID || undefined,
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
    setIsLoadingBom(true)

    setFormValue('PRODUCT_MAIN', {
      PRODUCT_MAIN_ID: row.original.PRODUCT_MAIN_ID,
      PRODUCT_MAIN_NAME: row.original.PRODUCT_MAIN_NAME,
      PRODUCT_MAIN_ALPHABET: row.original.PRODUCT_MAIN_ALPHABET,
      PRODUCT_CATEGORY_ID: row.original.PRODUCT_CATEGORY_ID,
      PRODUCT_CATEGORY_NAME: row.original.PRODUCT_CATEGORY_NAME
    })

    const data = await fetchBomDetailsByBomId(row.original.BOM_ID).finally(() => {
      setIsLoadingBom(false)
    })

    for (let i = 0; i < data.ITEM.length; i++) {
      for (let j = 0; i < data.ITEM.length; i++) {
        const element = data.ITEM[i]
      }
      const element = data[i]
    }

    setBomSelected(data)

    setIsShowBomModal(false)
  }

  const columns = useMemo<MRT_ColumnDef<BomI>[]>(
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
        filterVariant: 'multi-select',
        enableColumnFilterModes: false,
        enableColumnFilter: false
      },

      {
        accessorKey: 'PRODUCT_MAIN_NAME',
        header: 'PRODUCT MAIN NAME',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        enableColumnFilter: false
      },
      {
        accessorKey: 'BOM_CODE',
        header: 'BOM CODE',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        enableColumnFilter: false
      },
      {
        accessorKey: 'BOM_NAME',
        header: 'BOM NAME',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        enableColumnFilter: false
      },
      {
        accessorKey: 'FLOW_CODE',
        header: 'FLOW CODE',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        enableColumnFilter: false
      },
      {
        accessorKey: 'FLOW_NAME',
        header: 'FLOW NAME',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
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
        enableColumnFilter: false
      },
      {
        accessorKey: 'UPDATE_BY',
        header: 'MODIFIED BY',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
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
        <Button variant='outlined' onClick={() => selectAction(row)} disabled={isLoadingBom}>
          {isLoadingBom ? 'Loading' : 'Select'}
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

export default BomSelectModalTableData
