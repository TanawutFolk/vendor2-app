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

import UnitOfMeasurementAddModal from './modal/UnitOfMeasurementAddModal'
import UnitOfMeasurementEditModal from './modal/UnitOfMeasurementEditModal'
import UnitOfMeasurementDeleteModal from './modal/UnitOfMeasurementDeleteModal'
import UnitOfMeasurementViewModal from './modal/UnitOfMeasurementViewModal'

import { UnitOfMeasurementI } from '@/_workspace/types/unit/UnitOfMeasurement'

import StatusColumn from '@/libs/material-react-table/components/StatusOption'
import { ParamApiSearchResultTableI_V2 } from '@/libs/material-react-table/types/SearchResultTable'
import ActionsMenu from '@/libs/material-react-table/components/ActionsMenu'

import { useSearchUnitOfMeasurement } from '@/_workspace/react-query/hooks/useUnitOfMeasurement'

// Types Imports
import { FormData } from './page'
import SelectCustom from '@/components/react-select/SelectCustom'

import { useSettings } from '@/@core/hooks/useSettings'
import { MENU_ID } from './env'
import { useCheckPermission } from '@/_template/CheckPermission'

interface ParamApiSearchUnitOfMeasurementI extends ParamApiSearchResultTableI_V2 {
  UNIT_OF_MEASUREMENT_NAME?: string
  SYMBOL?: string
  inuseForSearch?: number
}

export interface ReturnApiSearchUnitOfMeasurementI {
  UNIT_OF_MEASUREMENT_NAME: string
  SYMBOL: string
  INUSE: string | number
  Start: number
  Limit: number
  Order: string
  ColumnFilters: string
}

interface Props {
  isEnableFetching: boolean
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const UnitOfMeasurementTableData = ({ isEnableFetching, setIsEnableFetching }: Props) => {
  const [openModalAdd, setOpenModalAdd] = useState<boolean>(false)
  const [openModalEdit, setOpenModalEdit] = useState<boolean>(false)
  const [openModalDelete, setOpenModalDelete] = useState<boolean>(false)
  const [openModalView, setOpenModalView] = useState<boolean>(false)

  const [rowSelected, setRowSelected] = useState<MRT_Row<UnitOfMeasurementI> | null>(null)

  // Functions
  const handleClickOpen = () => setOpenModalAdd(true)
  const handleClickOpenModalView = (row: MRT_Row<UnitOfMeasurementI>) => {
    setOpenModalView(true)
    setRowSelected(row)
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
  const { settings } = useSettings()

  // react-query
  const paramForSearch: ParamApiSearchUnitOfMeasurementI = {
    SearchFilters: [
      {
        id: 'UNIT_OF_MEASUREMENT_NAME',
        value: getValues('searchFilters.UNIT_OF_MEASUREMENT_NAME').trim() || ''
      },
      {
        id: 'SYMBOL',
        value: getValues('searchFilters.SYMBOL').trim() || ''
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

    Order: sorting,
    Start: pagination.pageIndex,
    Limit: pagination.pageSize
  }
  const { isRefetching, isLoading, data, isError, isFetching } = useSearchUnitOfMeasurement(
    paramForSearch,
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

  const columns = useMemo<MRT_ColumnDef<UnitOfMeasurementI>[]>(
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
      // {
      //   accessorKey: 'UNIT_OF_MEASUREMENT_ID',
      //   header: 'UNIT OF MEASUREMENT ID',
      //   enableColumnFilter: false
      // },
      {
        accessorKey: 'UNIT_OF_MEASUREMENT_NAME',
        header: 'UNIT OF MEASUREMENT NAME',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'SYMBOL',
        header: 'UNIT OF MEASUREMENT CODE',
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
      <div className='flex gap-1'>
        <div className='flex items-center gap-1'>
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
        {row?.original?.inuseForSearch === 1 ? (
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

  const checkPermission = useCheckPermission()

  return (
    <>
      <Card>
        <CardHeader
          title='Search result'
          action={
            <>
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
              {openModalAdd ? (
                <UnitOfMeasurementAddModal
                  openModalAdd={openModalAdd}
                  setOpenModalAdd={setOpenModalAdd}
                  setIsEnableFetching={setIsEnableFetching}
                />
              ) : null}
            </>
          }
        />
        {openModalEdit ? (
          <UnitOfMeasurementEditModal
            openModalEdit={openModalEdit}
            setOpenModalEdit={setOpenModalEdit}
            rowSelected={rowSelected}
            setIsEnableFetching={setIsEnableFetching}
          />
        ) : null}
        {openModalDelete ? (
          <UnitOfMeasurementDeleteModal
            openModalDelete={openModalDelete}
            setOpenModalDelete={setOpenModalDelete}
            rowSelected={rowSelected}
            setIsEnableFetching={setIsEnableFetching}
          />
        ) : null}
        {openModalView ? (
          <UnitOfMeasurementViewModal
            openModalView={openModalView}
            setOpenModalView={setOpenModalView}
            rowSelected={rowSelected}
            setRowSelected={setRowSelected}
          />
        ) : null}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MaterialReactTable table={table} />
        </LocalizationProvider>
      </Card>
    </>
  )
}

export default UnitOfMeasurementTableData
