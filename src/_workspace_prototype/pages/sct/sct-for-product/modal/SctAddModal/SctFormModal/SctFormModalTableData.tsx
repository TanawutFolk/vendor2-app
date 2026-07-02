import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

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

import type {
  MRT_ColumnDef,
  MRT_ColumnFilterFnsState,
  MRT_ColumnFiltersState,
  MRT_ColumnOrderState,
  MRT_ColumnPinningState,
  MRT_DensityState,
  MRT_InternalFilterOption,
  MRT_PaginationState,
  MRT_Row,
  MRT_SortingState,
  MRT_VisibilityState
} from 'material-react-table'
import {
  MaterialReactTable,
  MRT_FilterOption,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  useMaterialReactTable
} from 'material-react-table'

import { Controller, useFormContext } from 'react-hook-form'

import CustomTextField from '@/components/mui/TextField'

import StandardSingleCreateModal from './single-create'

import type { ParamApiSearchResultTableI } from '@/libs/material-react-table/types/SearchResultTable'
import ActionsMenu from '@/libs/material-react-table/components/ActionsMenu'

import { useSearchStandardFormProductType } from '@/_workspace/react-query/hooks/useStandardCostForProduct'

// Types Imports
import type { FormData } from './index'
import type { StandardCostFormI } from '@/_workspace/types/sct/StandardCostForProductType'
import BatchChangeMaterialStepModal from '../../../batch-change-material/BatchChangeMaterialStepModal'
import StandardFormDeleteModal from './single-create/components/StandardFormDeleteModal'

import { MENU_ID } from '../../../env'
import StandardMultipleCreateModal from './multiple-create'

interface ParamApiSearchI extends ParamApiSearchResultTableI {
  sctFormCode?: string
  fiscalYear?: string
  sctPattern?: string | number
  itemCategory?: string | number
  productCategory?: string | number
  productMain?: string | number
  productSub?: string | number
  productType?: string | number
  sctReasonSetting?: string | number
  sctTagSetting?: string | number
  sctStatusProgress?: string | number
  customerInvoice?: string | number
}

export interface ReturnApiSearchI {
  sctFormCode?: string
  fiscalYear?: string
  sctPattern?: string | number
  itemCategory?: string | number
  productCategory?: string | number
  productMain?: string | number
  productSub?: string | number
  productType?: string | number
  sctReasonSetting?: string | number
  sctTagSetting?: string | number
  sctStatusProgress?: string | number
  customerInvoice?: string | number

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
  sctFormCode = '',
  fiscalYear = '',
  sctPattern = '',
  itemCategory = '',
  productCategory = '',
  productMain = '',
  productSub = '',
  productType = '',
  sctReasonSetting = '',
  sctTagSetting = '',
  sctStatusProgress = '',
  customerInvoice = ''
}: ParamApiSearchI): ReturnApiSearchI => {
  const columnFilterQuery = queryColumnFilters.map(item => ({
    columnFns: queryColumnFilterFns[item.id],
    column: item.id.replaceAll('MODIFIED_DATE', 'UPDATE_DATE').replaceAll('inuseForSearch', 'INUSE'),
    value: item.value
  }))

  const params = {
    SCT_FORM_CODE: sctFormCode,
    FISCAL_YEAR: fiscalYear,
    SCT_PATTERN_ID: sctPattern,
    ITEM_CATEGORY_ID: itemCategory,
    PRODUCT_CATEGORY_ID: productCategory,
    PRODUCT_MAIN_ID: productMain,
    PRODUCT_SUB_ID: productSub,
    PRODUCT_TYPE_ID: productType,
    SCT_REASON_SETTING_ID: sctReasonSetting,
    SCT_TAG_SETTING_ID: sctTagSetting,
    SCT_STATUS_PROGRESS_ID: sctStatusProgress,
    CUSTOMER_INVOICE_TO_ID: customerInvoice,
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
  setOpenModalAdd: Dispatch<SetStateAction<boolean>>
  setIsEnableFetchingMainTable: Dispatch<SetStateAction<boolean>>
}

const StandardCostFormModalTableData = ({
  isEnableFetching,
  setIsEnableFetching,
  setOpenModalAdd,
  setIsEnableFetchingMainTable
}: Props) => {
  const [openModalEdit, setOpenModalEdit] = useState<boolean>(false)
  const [openModalDelete, setOpenModalDelete] = useState<boolean>(false)
  const [openModalView, setOpenModalView] = useState<boolean>(false)

  const [rowSelected, setRowSelected] = useState<MRT_Row<StandardCostFormI> | null>(null)

  const [openSingleCreateModal, setOpenSingleCreateModal] = useState(false)
  const [openMultipleCreateModal, setOpenMultipleCreateModal] = useState(false)
  const [openModalBatchChange, setOpenModalBatchChange] = useState(false)

  const handleClickOpenModalView = (row: MRT_Row<StandardCostFormI>) => {
    setOpenModalView(true)
    setRowSelected(row)
  }

  const handleClickOpenSingleCreateModal = () => {
    setOpenSingleCreateModal(true)
  }

  const handleClickOpenMultipleCreateModal = () => {
    setOpenMultipleCreateModal(true)
  }

  const handleClickOpenBatchChangeMaterialModal = () => {
    setOpenModalBatchChange(true)
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
    sctFormCode: getValues('searchFilters.sctFormCode') || '',
    fiscalYear: getValues('searchFilters.fiscalYear') || '',
    sctPattern: getValues('searchFilters.sctPattern')?.SCT_PATTERN_ID || '',
    itemCategory: getValues('searchFilters.itemCategory')?.ITEM_CATEGORY_ID || '',
    productCategory: getValues('searchFilters.productCategory')?.PRODUCT_CATEGORY_ID || '',
    productMain: getValues('searchFilters.productMain')?.PRODUCT_MAIN_ID || '',
    productSub: getValues('searchFilters.productSub')?.PRODUCT_SUB_ID || '',
    productType: getValues('searchFilters.productType')?.PRODUCT_TYPE_ID || '',
    sctReasonSetting: getValues('searchFilters.sctReasonSetting')?.SCT_REASON_SETTING_ID || '',
    sctTagSetting: getValues('searchFilters.sctTagSetting')?.SCT_TAG_SETTING_ID || '',
    sctStatusProgress: getValues('searchFilters.sctStatusProgress')?.SCT_STATUS_PROGRESS_ID || '',
    customerInvoice: getValues('searchFilters.customerInvoice')?.CUSTOMER_INVOICE_TO_ID || ''
  }

  const { isRefetching, isLoading, data, isError, refetch, isFetching } = useSearchStandardFormProductType(
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

  const columns = useMemo<MRT_ColumnDef<StandardCostFormI>[]>(
    () => [
      {
        accessorKey: 'SCT_F_CREATE_TYPE_NAME',
        header: 'SCT CREATE TYPE',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'SCT_F_CODE',
        header: 'SCT FORM CODE',
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
        header: 'PRODUCT TYPE NAME',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'BOM_CODE',
        header: 'BOM CODE',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'BOM_NAME',
        header: 'BOM NAME',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'PRODUCT_CATEGORY_NAME',
        header: 'PRODUCT CATEGORY',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'PRODUCT_MAIN_NAME',
        header: 'PRODUCT MAIN',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'PRODUCT_SUB_NAME',
        header: 'PRODUCT SUB',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      // {
      //   accessorKey: 'FLOW_NO',
      //   header: 'FLOW NO',
      //   filterVariant: 'text',
      //   columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
      //   filterFn: 'contains'
      // },
      {
        accessorKey: 'FLOW_NAME',
        header: 'FLOW NAME',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'FISCAL_YEAR',
        header: 'FISCAL YEAR',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'SCT_PATTERN_NAME',
        header: 'SCT PATTERN',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'SCT_REASON_SETTING_NAME',
        header: 'SCT REASON SETTING',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'SCT_TAG_SETTING_NAME',
        header: 'SCT TAG SETTING',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'UPDATE_BY',
        header: 'UPDATE BY',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'UPDATE_DATE',
        header: 'UPDATE DATE',
        filterVariant: 'date',
        columnFilterModeOptions: ['equals', 'notEquals', 'before', 'after', 'between'],
        filterFn: 'equals'
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
      <Box className='flex items-center gap-2'>
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
        {/* {row?.original?.INUSE === 0 ? null : ( */}
        <ActionsMenu
          row={row}
          setOpenModalView={setOpenModalView}
          setOpenModalEdit={setOpenModalEdit}
          rowSelected={rowSelected}
          setRowSelected={setRowSelected}
          setOpenModalDelete={setOpenModalDelete}
          MENU_ID={MENU_ID}
        />
        {/* )} */}
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
    <Card style={{ overflow: 'visible', zIndex: 4, border: '1px solid var(--mui-palette-customColors-inputBorder)' }}>
      <CardHeader
        title='Search result'
        action={
          <>
            <Button variant='contained' startIcon={<AddIcon />} onClick={handleClickOpenSingleCreateModal} disabled>
              Single Create
            </Button>
            {openSingleCreateModal ? (
              <StandardSingleCreateModal
                isOpenModal={openSingleCreateModal}
                setIsOpenModal={setOpenSingleCreateModal}
                setIsEnableFetching={setIsEnableFetching}
                mode='add'
                setOpenModalAdd={setOpenModalAdd}
                setIsEnableFetchingMainTable={setIsEnableFetchingMainTable}
              />
            ) : null}

            <Button
              className='mx-2'
              variant='contained'
              startIcon={<AddIcon />}
              onClick={handleClickOpenMultipleCreateModal}
            >
              Multiple Create
            </Button>
            {openMultipleCreateModal ? (
              <StandardMultipleCreateModal
                openMultipleCreateModal={openMultipleCreateModal}
                setOpenMultipleCreateModal={setOpenMultipleCreateModal}
                setOpenModalAdd={setOpenModalAdd}
                setIsEnableFetchingMainTable={setIsEnableFetchingMainTable}
              />
            ) : null}

            <Button
              variant='contained'
              startIcon={<AddIcon />}
              onClick={handleClickOpenBatchChangeMaterialModal}
              disabled
            >
              Batch Change Material
            </Button>
            {openModalBatchChange ? (
              <BatchChangeMaterialStepModal
                openModalBatchChange={openModalBatchChange}
                setOpenModalBatchChange={setOpenModalBatchChange}
                setIsEnableFetching={setIsEnableFetching}
              />
            ) : null}
          </>
        }
      />
      {openModalEdit ? (
        <StandardSingleCreateModal
          isOpenModal={openModalEdit}
          setIsOpenModal={setOpenModalEdit}
          rowSelected={rowSelected}
          setIsEnableFetching={setIsEnableFetching}
          mode='edit'
          setOpenModalAdd={setOpenModalAdd}
          setIsEnableFetchingMainTable={setIsEnableFetchingMainTable}
        />
      ) : null}
      {openModalDelete ? (
        <StandardFormDeleteModal
          openModalDelete={openModalDelete}
          setOpenModalDelete={setOpenModalDelete}
          rowSelected={rowSelected}
          setIsEnableFetching={setIsEnableFetching}
        />
      ) : null}
      {openModalView ? (
        <StandardSingleCreateModal
          isOpenModal={openModalView}
          setIsOpenModal={setOpenModalView}
          rowSelected={rowSelected}
          mode='view'
        />
      ) : null}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <MaterialReactTable table={table} />
      </LocalizationProvider>
    </Card>
  )
}

export default StandardCostFormModalTableData
