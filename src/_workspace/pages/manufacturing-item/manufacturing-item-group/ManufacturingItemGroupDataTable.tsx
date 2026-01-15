import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react'

import AddIcon from '@mui/icons-material/Add'
import FilterListIcon from '@mui/icons-material/FilterList'
import RefreshIcon from '@mui/icons-material/Refresh'
import SwapVertIcon from '@mui/icons-material/SwapVert'
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
  Typography,
  useColorScheme
} from '@mui/material'

// Third-party Imports
import type {
  MRT_ColumnFilterFnsState,
  MRT_ColumnFiltersState,
  MRT_ColumnOrderState,
  MRT_ColumnPinningState,
  MRT_ColumnSizingState,
  MRT_DensityState,
  MRT_PaginationState,
  MRT_Row,
  MRT_SortingState,
  MRT_VisibilityState
} from 'material-react-table'
import {
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef
} from 'material-react-table'

import { Controller, useFormContext } from 'react-hook-form'

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { useUpdateEffect } from 'react-use'

import type { FormData } from './page'

// Utils
import CustomTextField from '@/@core/components/mui/TextField'

// Component Imports
import { useSearch } from '@/_workspace/react-query/hooks/useManufacturingItemGroupData'
import ActionsMenu from '@/libs/material-react-table/components/ActionsMenu'
import StatusColumn from '@/libs/material-react-table/components/StatusOption'
import type { SearchResultTableI } from '@/libs/material-react-table/types/SearchResultTable'

import { useSettings } from '@/@core/hooks/useSettings'
import { ManufacturingItemGroupI } from '@/_workspace/types/manufacturing-item/ManufacturingItemGroup'
import SelectCustom from '@/components/react-select/SelectCustom'

import ManufacturingItemGroupAddModal from './modal/ManufacturingItemGroupAddModal'
import ManufacturingItemGroupDeleteModal from './modal/ManufacturingItemGroupDeleteModal'
import ManufacturingItemGroupEditModal from './modal/ManufacturingItemGroupEditModal'
import ManufacturingItemGroupViewModal from './modal/ManufacturingItemGroupViewModal'
import { MENU_ID } from './env'
import { useCheckPermission } from '@/_template/CheckPermission'

// interface ParamApiSearchManufacturingItemGroupI extends ParamApiSearchResultTableI {
//   ITEM_GROUP_ID?: string | ''
//   ITEM_GROUP_NAME?: string | ''
//   inuseForSearch?: number
// }

// const getUrlParamSearch = ({
//   queryPageIndex,
//   queryPageSize,
//   querySortBy,
//   queryColumnFilterFns,
//   queryColumnFilters,
//   ITEM_GROUP_ID = '',
//   ITEM_GROUP_NAME = '',

//   inuseForSearch
// }: ParamApiSearchManufacturingItemGroupI): object => {
//   const columnFilterQuery = queryColumnFilters.map(item => ({
//     columnFns: queryColumnFilterFns[item?.id],
//     column: item.id.replaceAll('MODIFIED_DATE', 'UPDATE_DATE').replaceAll('inuseForSearch', 'INUSE'),
//     value: item.value
//   }))

//   const params = {
//     ITEM_GROUP_ID: ITEM_GROUP_ID,
//     ITEM_GROUP_NAME: ITEM_GROUP_NAME.trim(),
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

function ManufacturingItemGroupDataTable({ isEnableFetching, setIsEnableFetching }: Props) {
  // Hooks : react-hook-form
  const { getValues, control, setValue, watch } = useFormContext<FormData>()
  // States
  const [rowSelected, setRowSelected] = useState<MRT_Row<ManufacturingItemGroupI> | null>(null)
  const [openAddModal, setOpenModalAdd] = useState<boolean>(false)
  const [openDeleteModal, setOpenModalDelete] = useState<boolean>(false)
  const [openEditModal, setOpenModalEdit] = useState<boolean>(false)
  const [openViewModal, setOpenModalView] = useState<boolean>(false)
  const [isFetchData, setIsFetchData] = useState(false)

  const handleClickOpen = () => {
    setOpenModalAdd(true)
  }

  const handleClickOpenDelete = () => {
    setOpenModalDelete(true)
  }

  const handleClickOpenModalView = (row: MRT_Row<ManufacturingItemGroupI>) => {
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

  // const paramForSearch: ParamApiSearchManufacturingItemGroupI = {
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
  //   ITEM_GROUP_NAME: watch('searchFilters.ITEM_GROUP_NAME') || '',

  //   inuseForSearch: getValues('searchFilters.INUSE')?.value

  //   // inuseForSearch: formatToNumberIfNanThenReturnBlank(
  //   //   (getValues().productCategoryStatus as StatusInterface)?.value
  //   // )
  // }

  const paramForSearch: ParamApiSearchI = {
    SearchFilters: [
      {
        id: 'ITEM_GROUP_NAME',
        value: getValues('searchFilters.ITEM_GROUP_NAME').trim() || ''
      },

      {
        id: 'inuseForSearch',
        value: getValues('searchFilters.INUSE')?.value ?? ''
      }
    ],
    ColumnFilters: columnFilters.map(item => ({
      columnFns: columnFilterFns[item.id],
      column: item.id,
      value: item.value
    })),

    // PRODUCT_CATEGORY_NAME: getValues('searchFilters.productCategory')?.PRODUCT_CATEGORY_NAME ?? '',
    // PRODUCT_CATEGORY_ID: getValues('searchFilters.productCategory')?.PRODUCT_CATEGORY_ID ?? '',

    // PRODUCT_MAIN_NAME: getValues('searchFilters.productMainName'),
    // PRODUCT_MAIN_CODE: getValues('searchFilters.productMainCode'),
    // PRODUCT_MAIN_ALPHABET: getValues('searchFilters.productMainAlphabet'),

    // inuseForSearch: getValues('searchFilters.status')?.value ?? ''
    Order: sorting,
    Start: pagination.pageIndex,
    Limit: pagination.pageSize

    //ColumnFilterFns: columnFilterFns
  }

  const { isRefetching, data, isError, isFetching } = useSearch(paramForSearch, isEnableFetching)

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
  const columns = useMemo<MRT_ColumnDef<ManufacturingItemGroupI>[]>(
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
        accessorKey: 'ITEM_GROUP_NAME',
        header: 'MANUFACTURING ITEM GROUP NAME',

        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },

      {
        accessorKey: 'UPDATE_DATE',
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
      <div className='flex items-center gap-2'>
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
                  if (filter.id === 'inuseForSearch' && filter.value.length <= 0) return false

                  return true
                }).length ?? 0
              }
              color='primary'
            >
              <FilterListIcon />
            </Badge>
          </IconButton>
        </Tooltip>
      </div>
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
        {row.original?.inuseForSearch === 1 || row.original?.inuseForSearch === 3 ? (
          <ActionsMenu
            row={row}
            setOpenModalEdit={setOpenModalEdit}
            rowSelected={rowSelected}
            setRowSelected={setRowSelected}
            setOpenModalDelete={setOpenModalDelete}
            MENU_ID={MENU_ID}
            isNeedEdit={false}
            isNeedDelete={false}
          />
        ) : null}
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
                <ManufacturingItemGroupAddModal
                  openAddModal={openAddModal}
                  setOpenModalAdd={setOpenModalAdd}
                  setIsEnableFetching={setIsEnableFetching}
                />
              ) : null}
              {openViewModal ? (
                <ManufacturingItemGroupViewModal
                  openViewModal={openViewModal}
                  setOpenModalView={setOpenModalView}
                  rowSelected={rowSelected}
                  isEnableFetching={isEnableFetching}
                  setIsEnableFetching={setIsEnableFetching}
                />
              ) : null}

              {openEditModal ? (
                <ManufacturingItemGroupEditModal
                  openEditModal={openEditModal}
                  setOpenModalEdit={setOpenModalEdit}
                  rowSelected={rowSelected}
                  isEnableFetching={isEnableFetching}
                  setIsEnableFetching={setIsEnableFetching}
                />
              ) : null}

              {openDeleteModal ? (
                <ManufacturingItemGroupDeleteModal
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

export default ManufacturingItemGroupDataTable
