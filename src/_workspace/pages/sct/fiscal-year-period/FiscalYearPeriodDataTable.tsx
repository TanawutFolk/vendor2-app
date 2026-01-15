import { Dispatch, SetStateAction, useEffect, useMemo, useReducer, useRef, useState } from 'react'

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
import { ProductTypeI } from '@/_workspace/types/productGroup/ProductType'
import { useSearch } from '@/_workspace/react-query/hooks/useFiscalYearPeriodData'
import StatusColumn from '@/libs/material-react-table/components/StatusOption'

import { FiscalYearPeriodI } from '@/_workspace/types/sct/FiscalYearPeriodType'
import FiscalYearColumn from '@/libs/material-react-table/components/FiscalYearOption'
import FiscalYearPeriodAddModal from './modal/FiscalYearPeriodAddModal'
import FiscalYearPeriodViewModal from './modal/FiscalYearPeriodViewModal'
import FiscalYearPeriodDeleteModal from './modal/FiscalYearPeriodDeleteModal'
import FiscalYearPeriodEditModal from './modal/FiscalYearPeriodEditModal'
import SelectCustom from '@/components/react-select/SelectCustom'
import { useSettings } from '@/@core/hooks/useSettings'
import { MENU_ID } from './env'
import { useCheckPermission } from '@/_template/CheckPermission'

// interface ParamApiSearchFiscalYearPeriodI extends ParamApiSearchResultTableI {
//   CUSTOMER_INVOICE_TO_ID?: string | ''
//   P2_START_MONTH_OF_FISCAL_YEAR_ID?: string | ''
//   P3_START_MONTH_OF_FISCAL_YEAR_ID?: string | ''
//   P2_NEED?: string | ''
//   inuseForSearch?: number
// }

// const getUrlParamSearch = ({
//   queryPageIndex,
//   queryPageSize,
//   querySortBy,
//   queryColumnFilterFns,
//   queryColumnFilters,
//   CUSTOMER_INVOICE_TO_ID = '',
//   P2_START_MONTH_OF_FISCAL_YEAR_ID = '',
//   P3_START_MONTH_OF_FISCAL_YEAR_ID = '',
//   P2_NEED = '',

//   inuseForSearch
// }: ParamApiSearchFiscalYearPeriodI): object => {
//   const columnFilterQuery = queryColumnFilters.map(item => ({
//     columnFns: queryColumnFilterFns[item?.id],
//     column: item.id.replaceAll('MODIFIED_DATE', 'UPDATE_DATE').replaceAll('inuseForSearch', 'INUSE'),
//     value: item.value
//   }))

//   const params = {
//     CUSTOMER_INVOICE_TO_ID: CUSTOMER_INVOICE_TO_ID,
//     P2_START_MONTH_OF_FISCAL_YEAR_ID: P2_START_MONTH_OF_FISCAL_YEAR_ID,
//     P3_START_MONTH_OF_FISCAL_YEAR_ID: P3_START_MONTH_OF_FISCAL_YEAR_ID,
//     P2_NEED: P2_NEED.trim(),
//     inuseForSearch: is_Null_Undefined_Blank(inuseForSearch) ? '' : inuseForSearch,
//     Start: queryPageIndex,
//     Limit: queryPageSize,
//     Order: JSON.parse(
//       JSON.stringify(querySortBy).replaceAll('MODIFIED_DATE', 'UPDATE_DATE').replaceAll('inuseForSearch', 'INUSE')
//     ),

//     ColumnFilters: columnFilterQuery
//   }
//   return params
// }

interface Props {
  isEnableFetching: boolean
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

function FiscalYearPeriodDataTable({ isEnableFetching, setIsEnableFetching }: Props) {
  // Hooks : react-hook-form
  const { getValues, control, setValue, watch } = useFormContext<FormData>()
  // States
  const [rowSelected, setRowSelected] = useState<MRT_Row<FiscalYearPeriodI> | null>(null)
  const [openAddModal, setOpenModalAdd] = useState<boolean>(false)
  const [openDeleteModal, setOpenModalDelete] = useState<boolean>(false)
  const [openEditModal, setOpenModalEdit] = useState<boolean>(false)
  const [openViewModal, setOpenModalView] = useState<boolean>(false)

  const handleClickOpen = () => {
    setOpenModalAdd(true)
  }

  const handleClickOpenModalView = (row: MRT_Row<FiscalYearPeriodI>) => {
    setOpenModalView(true)
    setRowSelected(row)
  }

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
  const { settings } = useSettings()

  // const paramForSearch: ParamApiSearchFiscalYearPeriodI = {
  //   queryPageIndex: pagination.pageIndex,
  //   queryPageSize: pagination.pageSize,
  //   queryColumnFilters: columnFilters,
  //   queryColumnFilterFns: columnFilterFns,
  //   querySortBy: sorting,
  //   CREATE_BY: '',
  //   CREATE_DATE: '',
  //   DESCRIPTION: '',
  //   UPDATE_BY: '',
  //   UPDATE_DATE: '',
  //   CUSTOMER_INVOICE_TO_ID: watch('searchFilters.CUSTOMER_INVOICE_TO')?.CUSTOMER_INVOICE_TO_ID || '',
  //   P2_START_MONTH_OF_FISCAL_YEAR_ID: watch('PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID || '',
  //   P3_START_MONTH_OF_FISCAL_YEAR_ID: watch('PRODUCT_SUB')?.PRODUCT_SUB_ID || '',
  //   P2_NEED: watch('PRODUCT_TYPE')?.PRODUCT_TYPE_NAME || '',
  //   inuseForSearch: getValues('searchFilters.INUSE')?.value

  //   // inuseForSearch: formatToNumberIfNanThenReturnBlank(
  //   //   (getValues().productCategoryStatus as StatusInterface)?.value
  //   // )
  // }

  const paramForSearch: ParamApiSearchI = {
    SearchFilters: [
      {
        id: 'CUSTOMER_INVOICE_TO_ID',
        value: getValues('searchFilters.CUSTOMER_INVOICE_TO')?.CUSTOMER_INVOICE_TO_ID || ''
      },

      {
        id: 'inuseForSearch',
        value: getValues('searchFilters.INUSE')?.value === 0 ? 0 : getValues('searchFilters.INUSE')?.value || ''
      }
    ],
    ColumnFilters: columnFilters.map(item => ({
      columnFns: columnFilterFns[item.id],
      column: item.id,
      value: item.value
    })),

    Order: sorting,
    Start: pagination.pageIndex,
    Limit: pagination.pageSize
  }

  const { isRefetching, isLoading, data, isError, refetch, isFetching } = useSearch(paramForSearch, isEnableFetching)

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
  const columns = useMemo<MRT_ColumnDef<FiscalYearPeriodI>[]>(
    () => [
      {
        accessorKey: 'inuseForSearch',
        header: 'Status',
        size: 200,
        Cell: ({ cell }) => (
          <Chip
            variant={settings.mode === 'dark' ? 'tonal' : 'filled'}
            size='small'
            label={StatusColumn.find(dataItem => dataItem.value === cell.getValue())?.label}
            color={StatusColumn.find(dataItem => dataItem.value === cell.getValue())?.color || 'primary'}
          />
        ),

        filterSelectOptions: StatusColumn,
        filterVariant: 'multi-select',
        enableColumnFilterModes: false,
        Filter: ({ column }) => {
          const idValue = getValues('searchResults.columnFilters').find((item: any) => item.id === column.id)

          let status: typeof StatusColumn = []

          if (idValue?.value?.length > 0) {
            status = StatusColumn.filter(dataItem => idValue?.value?.includes(dataItem.value))
          }

          return (
            <SelectCustom
              value={status}
              isMulti
              isClearable
              options={StatusColumn}
              classNamePrefix='select'
              placeholder='Select Status ...'
              onChange={e => {
                const value = e?.map(status => status.value) ?? []

                column.setFilterValue(value)
              }}
            />
          )
        }
      },
      {
        accessorKey: 'CUSTOMER_INVOICE_TO_ALPHABET',
        header: 'CUSTOMER INVOICE TO ALPHABET',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 350
      },
      {
        accessorKey: 'CUSTOMER_INVOICE_TO_NAME',
        header: 'CUSTOMER INVOICE TO NAME',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 450
      },
      {
        accessorKey: 'P2_NEED',
        header: 'P2 NEED',
        size: 200,
        Cell: ({ cell }) => {
          return (
            <>
              <Chip
                size='small'
                label={FiscalYearColumn.find(dataItem => dataItem.value === cell.getValue<number>())?.label}
                color={
                  FiscalYearColumn.find(dataItem => dataItem?.value === cell.getValue<string>())?.color || 'primary'
                }
              />
            </>
          )
        },
        filterSelectOptions: FiscalYearColumn,
        filterVariant: 'multi-select',
        enableColumnFilterModes: false,
        Filter: ({ column }) => {
          const idValue = getValues('searchResults.columnFilters').find((item: any) => item.id === column.id)

          let status: typeof FiscalYearColumn = []

          if (idValue?.value?.length > 0) {
            status = FiscalYearColumn.filter(dataItem => idValue?.value?.includes(dataItem.value))
          }

          return (
            <SelectCustom
              value={status}
              isMulti
              isClearable
              options={FiscalYearColumn}
              classNamePrefix='select'
              placeholder='Select Status ...'
              onChange={e => {
                const value = e?.map(status => status.value) ?? []

                column.setFilterValue(value)
              }}
            />
          )
        }
      },
      {
        accessorKey: 'P2_START_MONTH_OF_FISCAL_YEAR_NAME',
        header: 'P2 - Start Month of Fiscal Year',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        enableColumnFilterModes: false,
        size: 350
      },
      {
        accessorKey: 'P3_START_MONTH_OF_FISCAL_YEAR_NAME',
        header: 'P3 - Start Month of Fiscal Year',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        enableColumnFilterModes: false,
        size: 350
      },
      {
        accessorKey: 'UPDATE_DATE',
        header: 'UPDATE DATE ',
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
            <Badge
              badgeContent={
                table.getState().columnFilters.filter((filter: any) => {
                  if (
                    (filter.id === 'inuseForSearch' && filter.value.length <= 0) ||
                    (filter.id === 'P2_NEED' && filter.value.length <= 0)
                  )
                    return false

                  return true
                }).length ?? 0
              }
              color='primary'
            >
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
      <div className='flex items-center'>
        <IconButton onClick={() => handleClickOpenModalView(row)}>
          <i className='tabler-eye text-[22px] text-textSecondary' />
        </IconButton>
        {/* {row.original.inuseForSearch === 1 || row.original.inuseForSearch === 3 ? (
          <ActionsMenu
            row={row}
            setOpenModalEdit={setOpenModalEdit}
            rowSelected={rowSelected}
            setRowSelected={setRowSelected}
            setOpenModalDelete={setOpenModalDelete}
            MENU_ID={MENU_ID}
          />
        ) : null} */}
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

  const checkPermission = useCheckPermission()

  return (
    <>
      <Card>
        <CardHeader
          title='Search result'
          action={
            <>
              {openAddModal ? (
                <FiscalYearPeriodAddModal
                  openAddModal={openAddModal}
                  setOpenModalAdd={setOpenModalAdd}
                  //isEnableFetching={isEnableFetching}
                  setIsEnableFetching={setIsEnableFetching}
                />
              ) : null}
              {openViewModal ? (
                <FiscalYearPeriodViewModal
                  openViewModal={openViewModal}
                  setOpenModalView={setOpenModalView}
                  rowSelected={rowSelected}
                  isEnableFetching={isEnableFetching}
                  setIsEnableFetching={setIsEnableFetching}
                />
              ) : null}

              {openEditModal ? (
                <FiscalYearPeriodEditModal
                  openEditModal={openEditModal}
                  setOpenModalEdit={setOpenModalEdit}
                  rowSelected={rowSelected}
                  isEnableFetching={isEnableFetching}
                  setIsEnableFetching={setIsEnableFetching}
                />
              ) : null}

              {openDeleteModal ? (
                <FiscalYearPeriodDeleteModal
                  openDeleteModal={openDeleteModal}
                  setOpenModalDelete={setOpenModalDelete}
                  rowSelected={rowSelected}
                  setIsEnableFetching={setIsEnableFetching}
                />
              ) : null}
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

export default FiscalYearPeriodDataTable
