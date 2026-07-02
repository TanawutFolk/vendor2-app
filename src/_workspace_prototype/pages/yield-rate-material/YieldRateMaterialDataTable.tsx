import { Dispatch, SetStateAction, useEffect, useMemo, useReducer, useRef, useState } from 'react'

import Link from 'next/link'

import {
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Collapse,
  Fab,
  IconButton,
  MenuItem,
  Pagination,
  Switch,
  TablePagination,
  ThemeProvider,
  Tooltip,
  Typography,
  createTheme,
  darken,
  lighten,
  useColorScheme,
  useTheme
} from '@mui/material'
import PublishIcon from '@mui/icons-material/Publish'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import classNames from 'classnames'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import FilterListIcon from '@mui/icons-material/FilterList'
import RefreshIcon from '@mui/icons-material/Refresh'
import ImportExportIcon from '@mui/icons-material/ImportExport'

// Third-party Imports
import type {
  MRT_SortingState,
  MRT_ColumnFiltersState,
  MRT_PaginationState,
  MRT_Updater,
  MRT_VisibilityState,
  MRT_DensityState,
  MRT_ColumnPinningState,
  MRT_ColumnOrderState,
  MRT_ColumnSizingState,
  MRT_Row,
  MRT_ColumnFilterFnsState
} from 'material-react-table'
import {
  MRT_ActionMenuItem,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef
} from 'material-react-table'

import { Controller, useFormContext, useForm } from 'react-hook-form'

import type { ColumnFiltersState, SortingState } from '@tanstack/react-table'

import { mkConfig, generateCsv, download } from 'export-to-csv'

import type { ButtonProps } from '@mui/material/Button'

import { literalAsync } from 'valibot'

import { useEffectOnce, useUpdateEffect } from 'react-use'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import type { FormData } from './page'

// Utils
import {
  formatToNumberIfNanThenReturnBlank,
  is_Null_Undefined_Blank
} from '@/utils/formatting-checking-value/checkingValueTypes'
import CustomTextField from '@/@core/components/mui/TextField'
import TablePaginationComponent from '@/components/TablePaginationComponent'
import OptionMenu from '@/@core/components/option-menu'

// Component Imports
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
import type {
  SearchResultTableI,
  ParamApiSearchResultTableI
} from '@/libs/material-react-table/types/SearchResultTable'
import ActionsMenu from '@/libs/material-react-table/components/ActionsMenu'
import ExportPage from './modal/exportModal'
import { ProductTypeI } from '@/_workspace/types/productGroup/ProductType'
import { YieldRateTypeI } from '@/_workspace/types/yield-rate/YieldRateType'
// import { useSearch } from '@/_workspace/react-query/hooks/useYieldRateData'
import { useSearch } from '@/_workspace/react-query/hooks/useYieldRateMaterialData'
import StatusColumn from '@/libs/material-react-table/components/StatusOption'

import CollectionPointColumn from '@/libs/react-select/option/CollectionPointOption'
import CustomAvatar from '@/@core/components/mui/Avatar'
import ImportPage from './modal/importModal'
import { useCheckPermission } from '@/_template/CheckPermission'
import { MENU_ID } from './env'

const initState: SearchResultTableI = {
  queryPageIndex: 0,
  queryPageSize: 10,
  totalCount: 0,
  querySortBy: [],
  withRowBorders: true,
  withTableBorder: false,
  withColumnBorders: false,
  striped: true
}

interface ParamApiSearchYieldRateI extends ParamApiSearchResultTableI {
  PRODUCT_MAIN_ID?: string | ''
  PRODUCT_CATEGORY_ID?: string | ''
  PRODUCT_SUB_ID?: string | ''
  PRODUCT_TYPE_NAME?: string | ''
  PRODUCT_TYPE_CODE?: string | ''
  SCT_TAG_SETTING_ID?: string | ''
  FISCAL_YEAR?: string | ''
  SCT_REASON_SETTING_ID?: string | ''
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
  SCT_TAG_SETTING_ID = '',
  FISCAL_YEAR = '',
  SCT_REASON_SETTING_ID = '',
  // IS_MODE = false,
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
    FISCAL_YEAR: is_Null_Undefined_Blank(FISCAL_YEAR) ? '' : Number(FISCAL_YEAR),
    SCT_REASON_SETTING_ID: SCT_REASON_SETTING_ID,
    SCT_TAG_SETTING_ID: SCT_TAG_SETTING_ID,
    // IS_MODE: IS_MODE,
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

interface Props {
  isEnableFetching: boolean
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

function YieldRateDataTable({ isEnableFetching, setIsEnableFetching }: Props) {
  // Hooks
  // Hooks : react-hook-form
  const { getValues, control, setValue, watch } = useFormContext<FormData>()

  const [dataProductMainSelected, setDataProductMainSelected] = useState<ProductTypeI[]>([])
  // States
  const [rowSelected, setRowSelected] = useState<MRT_Row<ProductTypeI> | null>(null)
  const [openExportModal, setOpenModalExport] = useState<boolean>(false)
  const [openImportModal, setOpenModalImport] = useState<boolean>(false)
  const [isFetchData, setIsFetchData] = useState(false)

  const handleClickOpenExport = () => {
    setOpenModalExport(true)
  }
  const handleClickOpenImport = () => {
    setOpenModalImport(true)
  }

  // const handleClickOpenDelete = () => {
  //   setOpenModalDelete(true)
  // }

  // const handleClickOpenModalView = (row: MRT_Row<DepartmentI>) => {
  //   setOpenModalView(true)
  //   setRowSelected(row)
  // }

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
  )
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: getValues('searchResults.pageSize')
  })

  const { mode: muiMode } = useColorScheme()

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
    PRODUCT_MAIN_ID: watch('PRODUCT_MAIN')?.PRODUCT_MAIN_ID || '',
    PRODUCT_CATEGORY_ID: watch('PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID || '',
    PRODUCT_SUB_ID: watch('PRODUCT_SUB')?.PRODUCT_SUB_ID || '',
    PRODUCT_TYPE_NAME: watch('PRODUCT_TYPE')?.PRODUCT_TYPE_NAME || '',
    PRODUCT_TYPE_CODE: watch('PRODUCT_TYPE')?.PRODUCT_TYPE_CODE || '',
    FISCAL_YEAR: watch('FISCAL_YEAR')?.value || '',
    SCT_REASON_SETTING_ID: watch('SCT_REASON_SETTING')?.SCT_REASON_SETTING_ID || '',
    SCT_TAG_SETTING_ID: watch('SCT_TAG_SETTING')?.SCT_TAG_SETTING_ID || '',

    inuseForSearch: getValues('INUSE')?.value

    // inuseForSearch: formatToNumberIfNanThenReturnBlank(
    //   (getValues().productCategoryStatus as StatusInterface)?.value
    // )
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
  }, [JSON.stringify([columnFilters, sorting, pagination])])

  const isFirstRender = useRef(true)

  useEffect(() => {
    isFirstRender.current = false
  }, [])

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

  // react-table
  const columns = useMemo<MRT_ColumnDef<YieldRateTypeI>[]>(
    () => [
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
        accessorKey: 'YIELD_ACCUMULATION_OF_ITEM_FOR_SCT',
        header: 'YIELD RATE MATERIAL',
        Cell: ({ cell }) => {
          return (
            <>
              <Chip
                variant='filled'
                size='small'
                label={Number(cell.row.original?.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT)?.toFixed(2) + '%'}
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
        accessorKey: 'ITEM_CODE_FOR_SUPPORT_MES',
        header: 'ITEM CODE FOR SUPPORT MES',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
        // enableColumnFilter: false,
        // enableSorting: false
      },
      {
        accessorKey: 'ITEM_INTERNAL_SHORT_NAME',
        header: 'ITEM INTERNAL SHORT NAME',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
        // enableColumnFilter: false,
        // enableSorting: false
      },
      {
        accessorKey: 'ITEM_INTERNAL_FULL_NAME',
        header: 'ITEM INTERNAL FULL NAME',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
        // enableColumnFilter: false,
        // enableSorting: false
      },
      {
        accessorKey: 'REVISION_NO',
        header: 'REVISION NO',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
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

  // const handleSortingChange = (updater: MRT_Updater<SortingState>) => {
  //   //call the setState as normal, but need to check if using an updater callback with a previous state
  //   setSorting(prevSorting =>
  //     //if updater is a function, call it with the previous state, otherwise just use the updater value
  //     updater instanceof Function ? updater(prevSorting) : {updater(); setValue('searchResults.sorting', updater)}
  //   )

  //   //put more code for your side effects here, guaranteed to only run once, even in React Strict Mode

  // }

  // useEffect(() => {
  //   console.log(columnVisibility)
  // }, [columnVisibility])

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
    enableRowActions: false,
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
    // renderRowActions: ({ row }) => (
    //   <div className='flex items-center'>
    //     <IconButton onClick={() => handleClickOpenModalView(row)}>
    //       <i className='tabler-eye text-[22px] text-textSecondary' />
    //     </IconButton>
    //     <ActionsMenu
    //       row={row}
    //       setOpenModalEdit={setOpenModalEdit}
    //       rowSelected={rowSelected}
    //       setRowSelected={setRowSelected}
    //       setOpenModalDelete={setOpenModalDelete}
    //     />
    //   </div>
    // ),
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

  const checkPermission = useCheckPermission()

  return (
    <>
      <Card>
        <CardHeader
          title='Search result'
          action={
            <>
              <Button
                variant='outlined'
                color='primary'
                sx={{
                  marginRight: '8px',
                  paddingTop: '7px',
                  paddingBottom: '7px',
                  borderRadius: '30px'
                }}
                onClick={e => {
                  const checked = getValues('openViewMode')
                  setValue('openViewMode', !checked)
                  setIsEnableFetching(true)

                  if (!checked) {
                    setColumnVisibility(prev => {
                      return {
                        ...prev,
                        PROCESS_NAME: false,
                        FLOW_PROCESS_NO: false,
                        YIELD_RATE_FOR_SCT: false,
                        TOTAL_YIELD_RATE_FOR_SCT: true,
                        GO_STRAIGHT_RATE_FOR_SCT: false,
                        YIELD_ACCUMULATION_FOR_SCT: false,
                        COLLECTION_POINT_FOR_SCT: false,
                        TOTAL_GO_STRAIGHT_RATE_FOR_SCT: true
                      }
                    })
                  } else {
                    setColumnVisibility(prev => {
                      return {
                        ...prev,
                        PROCESS_NAME: true,
                        FLOW_PROCESS_NO: true,
                        YIELD_RATE_FOR_SCT: true,
                        TOTAL_YIELD_RATE_FOR_SCT: false,
                        GO_STRAIGHT_RATE_FOR_SCT: true,
                        YIELD_ACCUMULATION_FOR_SCT: true,
                        COLLECTION_POINT_FOR_SCT: true,
                        TOTAL_GO_STRAIGHT_RATE_FOR_SCT: false
                      }
                    })
                  }
                }}
              >
                <div className='d-flex align-items-center'>
                  <span className='align-middle me-25 '>
                    {watch('openViewMode') ? 'Total View Mode' : 'Process View Mode'}
                  </span>
                  <Controller
                    name='openViewMode'
                    defaultValue={false}
                    render={({ field: { value, ref, onChange, ...fieldProps } }) => {
                      return (
                        <>
                          <Switch
                            {...fieldProps}
                            style={{
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            color='success'
                            checked={value}
                            onClick={e => {
                              e.preventDefault()
                            }}
                          />
                        </>
                      )
                    }}
                  />
                </div>
              </Button>

              <Button
                className='ms-2'
                variant='contained'
                startIcon={<PublishIcon />}
                onClick={() => {
                  if (checkPermission(Number(import.meta.env.VITE_APPLICATION_ID), MENU_ID, 'IS_CREATE')) {
                    handleClickOpenImport()
                  }
                }}
                // onClick={showAlert}
              >
                Import Form
              </Button>
              <Button
                className='mx-2'
                variant='contained'
                startIcon={<FileDownloadIcon />}
                onClick={() => {
                  handleClickOpenExport()
                }}
                // onClick={showAlert}
              >
                Export Form
              </Button>

              {openImportModal ? (
                <ImportPage
                  openImportModal={openImportModal}
                  setOpenModalImport={setOpenModalImport}
                  setIsEnableFetching={setIsEnableFetching}
                  dataProductMainSelected={dataProductMainSelected}
                  setDataProductMainSelected={setDataProductMainSelected}
                />
              ) : null}
              {openExportModal ? (
                <ExportPage
                  openExportModal={openExportModal}
                  setOpenModalExport={setOpenModalExport}
                  setIsEnableFetching={setIsEnableFetching}
                  dataProductMainSelected={dataProductMainSelected}
                  setDataProductMainSelected={setDataProductMainSelected}
                />
              ) : null}
            </>
          }
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MaterialReactTable table={table} />
        </LocalizationProvider>
      </Card>
    </>
  )
}

export default YieldRateDataTable
