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

import MaterialListExportModal from './modal/MaterialListExportModal'

import { MaterialListI } from '@/_workspace/types/environment-certificate/MaterialList'

import StatusColumn from '@/libs/material-react-table/components/StatusOption'
import { ParamApiSearchResultTableI } from '@/libs/material-react-table/types/SearchResultTable'
import ActionsMenu from '@/libs/material-react-table/components/ActionsMenu'

import { useSearch } from '@/_workspace/react-query/hooks/useMaterialListData'

import { is_Null_Undefined_Blank } from '@/utils/formatting-checking-value/checkingValueTypes'

// Types Imports
import { FormData } from './page'
import { ItemCategoryI } from '@/_workspace/types/item-master/ItemCategory'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import SelectCustom from '@/components/react-select/SelectCustom'

interface ParamApiSearchI extends ParamApiSearchResultTableI {
  ITEM_CATEGORY: ItemCategoryI[]
  PRODUCT_CATEGORY: {
    PRODUCT_CATEGORY_ID: number
    PRODUCT_CATEGORY_NAME: string
  } | null
  PRODUCT_MAIN: {
    PRODUCT_MAIN_ID: number
    PRODUCT_MAIN_NAME: string
  } | null
  PRODUCT_SUB: {
    PRODUCT_SUB_ID: number
    PRODUCT_SUB_NAME: string
  } | null
  PRODUCT_TYPE: {
    PRODUCT_TYPE_ID: number
    PRODUCT_TYPE_NAME: string
  } | null
  CUSTOMER_INVOICE_TO: {
    CUSTOMER_INVOICE_TO_ID: number
    CUSTOMER_INVOICE_TO_NAME: string
  } | null
  EXPORT_MODE: {
    value: number
    label: string
  }
}

export interface ReturnApiSearchMaterialListI {
  ITEM_CATEGORY: string
  PRODUCT_CATEGORY_ID: number | string
  PRODUCT_MAIN_ID: number | string
  PRODUCT_SUB_ID: number | string
  PRODUCT_TYPE_ID: number | string
  CUSTOMER_INVOICE_TO_ID: number | string
  EXPORT_MODE_ID: number | string
  Start: number
  Limit: number
  Order: string
  ColumnFilters: string
  FILE_NAME?: string
}

const getUrlParamSearch = ({
  queryPageIndex,
  queryPageSize,
  querySortBy,
  queryColumnFilterFns,
  queryColumnFilters,
  ITEM_CATEGORY,
  PRODUCT_CATEGORY,
  PRODUCT_MAIN,
  PRODUCT_SUB,
  PRODUCT_TYPE,
  CUSTOMER_INVOICE_TO,
  EXPORT_MODE
}: ParamApiSearchI): ReturnApiSearchMaterialListI => {
  const columnFilterQuery = queryColumnFilters.map(item => ({
    columnFns: queryColumnFilterFns[item.id],
    column: item.id.replaceAll('MODIFIED_DATE', 'UPDATE_DATE').replaceAll('inuseForSearch', 'INUSE'),
    value: item.value
  }))

  let params = {
    ITEM_CATEGORY: JSON.stringify(ITEM_CATEGORY),
    PRODUCT_CATEGORY_ID: PRODUCT_CATEGORY?.PRODUCT_CATEGORY_ID || '',
    PRODUCT_MAIN_ID: PRODUCT_MAIN?.PRODUCT_MAIN_ID || '',
    PRODUCT_SUB_ID: PRODUCT_SUB?.PRODUCT_SUB_ID || '',
    PRODUCT_TYPE_ID: PRODUCT_TYPE?.PRODUCT_TYPE_ID || '',
    CUSTOMER_INVOICE_TO_ID: CUSTOMER_INVOICE_TO?.CUSTOMER_INVOICE_TO_ID || '',
    EXPORT_MODE_ID: EXPORT_MODE?.value || '',
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
}

const MaterialListTableData = ({ isEnableFetching, setIsEnableFetching }: Props) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false)

  const handleClickExportModalOpen = () => {
    setIsExportModalOpen(true)
  }

  // Hooks : react-hook-form
  const { getValues, control, setValue } = useFormContext<FormData>()

  // Table States
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

  // Hooks : react-query
  const paramForSearch: ParamApiSearchI = {
    queryPageIndex: pagination.pageIndex,
    queryPageSize: pagination.pageSize,
    querySortBy: sorting,
    queryColumnFilterFns: columnFilterFns,
    queryColumnFilters: columnFilters,
    ITEM_CATEGORY: getValues('searchFilters.ITEM_CATEGORY'),
    PRODUCT_CATEGORY: getValues('searchFilters.PRODUCT_CATEGORY'),
    PRODUCT_MAIN: getValues('searchFilters.PRODUCT_MAIN'),
    PRODUCT_SUB: getValues('searchFilters.PRODUCT_SUB'),
    PRODUCT_TYPE: getValues('searchFilters.PRODUCT_TYPE'),
    CUSTOMER_INVOICE_TO: getValues('searchFilters.CUSTOMER_INVOICE_TO'),
    EXPORT_MODE: getValues('searchFilters.EXPORT_MODE')
  }

  const { isRefetching, isLoading, data, isError, refetch, isFetching } = useSearch(
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

  const columns = useMemo<MRT_ColumnDef<MaterialListI>[]>(
    () => [
      {
        accessorKey: 'ITEM_CATEGORY_NAME',
        header: 'Item Category',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'PRODUCT_CATEGORY_NAME',
        header: 'Product Category',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'PRODUCT_MAIN_NAME',
        header: 'Product Main',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'PRODUCT_SUB_NAME',
        header: 'Product Sub',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'PRODUCT_TYPE_CODE',
        header: 'Standard Cost Code',
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
        accessorKey: 'CUSTOMER_INVOICE_TO_NAME',
        header: 'Customer Invoice To',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'PRODUCT_TYPE_CODE_SUB',
        header: 'Standard Cost Code (Sub)',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'PRODUCT_TYPE_NAME_SUB',
        header: 'Product Type Name (Sub)',
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
        accessorKey: 'M_CODE_MES',
        header: 'M-Code (MES)',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'ITEM_CATEGORY_FROM_BOM',
        header: 'Item Category (from BOM)',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'MATERIAL_EXTERNAL_FULL_NAME',
        header: 'Material External Full Name',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'MATERIAL_EXTERNAL_SHORT_NAME',
        header: 'Material External Short Name',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'PURCHASE_SPECIFICATION_NO',
        header: 'Purchase Specification No.',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'DRAWING_NO',
        header: 'Drawing No.',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'MADE_BY',
        header: 'Item Made By',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'VENDOR_NAME',
        header: 'Vendor',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'MAKER_NAME',
        header: 'Maker',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'ITEM_CATEGORY_FROM_ITEM_MASTER',
        header: 'Item Category (from Item Master)',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'RoSH10',
        header: 'RoSH10',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'REACH',
        header: 'REACH',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'Green_NTT',
        header: 'Green NTT',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'ChemSHERPA',
        header: 'ChemSHERPA',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'Conflict_Minerals',
        header: 'Conflict Minerals',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'Packaging_Waste',
        header: 'Packaging Waste',
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
            <Badge badgeContent={columnFilters.length ?? 0} color='primary'>
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
      <Card>
        <CardHeader
          title='Search result'
          action={
            <div className='flex gap-3'>
              <Controller
                name='searchFilters.EXPORT_MODE'
                control={control}
                defaultValue={{
                  value: 1,
                  label: 'Product With M-Code'
                }}
                render={({ field: { ...fieldProps } }) => (
                  <div>
                    <SelectCustom
                      label='Export Mode'
                      {...fieldProps}
                      options={[
                        {
                          value: 1,
                          label: 'Product With M-Code'
                        },

                        {
                          value: 2,
                          label: 'Product Without Duplicate M-Code'
                        },
                        {
                          value: 3,
                          label: 'All M-Code'
                        }
                      ]}
                      classNamePrefix='select'
                      placeholder='Select Export Mode ...'
                    />
                  </div>
                )}
              />
              <Button
                sx={{
                  height: 'min-content',
                  alignSelf: 'end'
                }}
                variant='contained'
                startIcon={<FileDownloadIcon />}
                onClick={handleClickExportModalOpen}
              >
                Export
              </Button>
              {isExportModalOpen ? (
                <MaterialListExportModal
                  isExportModalOpen={isExportModalOpen}
                  setIsExportModalOpen={setIsExportModalOpen}
                  getUrlParamSearch={getUrlParamSearch(paramForSearch)}
                />
              ) : null}
            </div>
          }
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MaterialReactTable table={table} />
        </LocalizationProvider>
      </Card>
    </>
  )
}

export default MaterialListTableData
