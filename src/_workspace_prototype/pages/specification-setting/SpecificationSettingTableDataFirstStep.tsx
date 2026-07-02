import type { Dispatch, MutableRefObject, SetStateAction } from 'react'
import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Collapse,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Pagination,
  TablePagination,
  ThemeProvider,
  Tooltip,
  Typography,
  createTheme,
  darken,
  lighten,
  useTheme
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import FilterListIcon from '@mui/icons-material/FilterList'
import AddIcon from '@mui/icons-material/Add'
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

import { Controller, useFormContext } from 'react-hook-form'

import { useEffectOnce, useUpdateEffect } from 'react-use'
// import type { CustomerInvoiceToInterface } from '@/_workspace/types/customer/CustomerInvoiceTo'
import type { SpecificationSettingI } from '@/_workspace/types/specification-setting/SpecificationSetting'

import type { FormData } from './page'
// Utils
import {
  formatToNumberIfNanThenReturnBlank,
  is_Null_Undefined_Blank
} from '@/utils/formatting-checking-value/checkingValueTypes'

import CustomTextField from '@/components/mui/TextField'

import type {
  SearchResultTableI,
  ParamApiSearchResultTableI
} from '@/libs/material-react-table/types/SearchResultTable'

import ActionsMenu from '@/libs/material-react-table/components/ActionsMenu'

import StatusColumn from '@/libs/material-react-table/components/StatusOption'

import { useSearchSpecificationSetting } from '@/_workspace/react-query/hooks/useSpecificationSettingData'
import { ProductMainI } from '@/_workspace/types/productGroup/product-main/ProductMain'
import SpecificationSettingAddModal from './modal/SpecificationSettingAddModal'
import SpecificationSettingEditModal from './modal/SpecificationSettingEditModal'
import SpecificationSettingDeleteModal from './modal/SpecificationSettingDeleteModal'
import SpecificationSettingViewModal from './modal/SpecificationSettingViewModal'
import SelectCustom from '@/components/react-select/SelectCustom'
import { MENU_ID } from './env'
// import ProductSubAddModal from './modal/ProductSubAddModal'
// import ProductSubEditModal from './modal/ProductSubEditModal'
// import ProductSubDeleteModal from './modal/ProductSubDeleteModal'

//or use your library of choice here

// const initState: SearchResultTableI = {
//   queryPageIndex: 0,
//   queryPageSize: 10,
//   totalCount: 0,
//   querySortBy: [],
//   withRowBorders: true,
//   withTableBorder: false,
//   withColumnBorders: false,

//   striped: true
// }

interface ParamApiSearchSpecificationI extends ParamApiSearchResultTableI {
  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID?: number | ''
  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME?: string
  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER?: string | ''
  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION?: string | ''
  PRODUCT_PART_NUMBER?: string | ''
  PRODUCT_MAIN_ID?: number | ''
  PRODUCT_SPECIFICATION_TYPE_ID?: number | ''
  PRODUCT_MAIN_NAME?: string
  CUSTOMER_ORDER_FROM_ID?: number | ''
  CUSTOMER_ORDER_FROM_NAME?: string
  PRODUCT_SPECIFICATION_TYPE_NAME?: string
  PRODUCT_MODEL_NUMBER?: string
  // ColumnFilters: string

  // inuseForSearch?: string
}
export interface ReturnApiSearchSpecificationI {
  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID?: number | ''
  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME?: string
  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER?: string | ''
  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION?: string | ''
  PRODUCT_PART_NUMBER?: string | ''
  PRODUCT_MAIN_ID?: number | ''
  PRODUCT_SPECIFICATION_TYPE_ID?: number | ''
  PRODUCT_MAIN_NAME?: string
  CUSTOMER_ORDER_FROM_ID?: number | ''
  CUSTOMER_ORDER_FROM_NAME?: string
  PRODUCT_SPECIFICATION_TYPE_NAME?: string
  PRODUCT_MODEL_NUMBER?: string
  ColumnFilters: string
}

const getUrlParamSearch = ({
  queryPageIndex,
  queryPageSize,
  querySortBy,
  queryColumnFilterFns,
  queryColumnFilters,
  // PRODUCT_SPECIFICATION_SETTING_ID = '',
  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME = '',
  PRODUCT_MAIN_ID = '',
  PRODUCT_SPECIFICATION_TYPE_ID = '',
  PRODUCT_MAIN_NAME = '',
  CUSTOMER_ORDER_FROM_ID = '',
  CUSTOMER_ORDER_FROM_NAME = '',
  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER = '',
  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION = '',
  PRODUCT_SPECIFICATION_TYPE_NAME = '',
  PRODUCT_MODEL_NUMBER = '',
  PRODUCT_PART_NUMBER = '',
  inuseForSearch = ''
  // INUSE = null
  // INUSE = ''
  // PRODUCT_CATEGORY_ID = ''
}: ParamApiSearchSpecificationI): any => {
  const columnFilterQuery = queryColumnFilters.map(item => ({
    columnFns: queryColumnFilterFns[item.id],
    column: item.id.replaceAll('MODIFIED_DATE', 'UPDATE_DATE').replaceAll('inuseForSearch', 'INUSE'),
    value: item.value
  }))

  let params = {
    PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME: PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME.trim() || '',
    // PRODUCT_SPECIFICATION_SETTING_ID: PRODUCT_SPECIFICATION_SETTING_ID || '',
    PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER: PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER.trim() || '',
    PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION:
      PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION.trim() || '',
    PRODUCT_MAIN_ID: PRODUCT_MAIN_ID || '',
    PRODUCT_SPECIFICATION_TYPE_ID: PRODUCT_SPECIFICATION_TYPE_ID || '',
    PRODUCT_PART_NUMBER: PRODUCT_PART_NUMBER || '',
    PRODUCT_MAIN_NAME: PRODUCT_MAIN_NAME.trim(),
    PRODUCT_SPECIFICATION_TYPE_NAME: PRODUCT_SPECIFICATION_TYPE_NAME.trim(),
    CUSTOMER_ORDER_FROM_NAME: CUSTOMER_ORDER_FROM_NAME.trim(),
    PRODUCT_MODEL_NUMBER: PRODUCT_MODEL_NUMBER.trim(),
    CUSTOMER_ORDER_FROM_ID: CUSTOMER_ORDER_FROM_ID || '',
    INUSE: is_Null_Undefined_Blank(inuseForSearch) ? '' : inuseForSearch,
    Start: queryPageIndex,
    Limit: queryPageSize,
    Order: querySortBy.length > 0 ? JSON.stringify(querySortBy).replace('MODIFIED_DATE', 'UPDATE_DATE') : '',
    // Order: JSON.stringify(querySortBy).replaceAll('MODIFIED_DATE', 'UPDATE_DATE').replaceAll('inuseForSearch', 'INUSE'),
    ColumnFilters: columnFilterQuery
  }

  return params
}

interface Props {
  isEnableFetching: boolean
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

function SpecificationSettingTableData({ isEnableFetching, setIsEnableFetching }: Props) {
  // react-hook-form
  const { getValues, control, setValue } = useFormContext<FormData>()

  // States
  // const [rowSelected, setRowSelected] = useState<MRT_Row<SpecificationSettingI> | null>(null)

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
    pageSize: getValues('searchResults.pageSize') || 10
  })

  // States : Modal
  const [openAddModal, setOpenModalAdd] = useState<boolean>(false)
  const [openModalEdit, setOpenModalEdit] = useState<boolean>(false)
  const [openModalDelete, setOpenModalDelete] = useState<boolean>(false)
  const [openModalView, setOpenModalView] = useState<boolean>(false)
  const [rowSelected, setRowSelected] = useState<MRT_Row<SpecificationSettingI> | null>(null)
  // react-query
  const paramForSearch: ParamApiSearchSpecificationI = {
    // SearchFilters: [
    //   {
    //     id: 'PRODUCT_MAIN_ID',
    //     value: getValues('searchFilters.productMain')?.PRODUCT_MAIN_ID || ''
    //   },
    //   {
    //     id: 'CUSTOMER_ORDER_FROM_ID',
    //     value: getValues('searchFilters.customerOrderFrom')?.CUSTOMER_ORDER_FROM_ID || ''
    //   },
    //   {
    //     id: 'PRODUCT_SPECIFICATION_TYPE_ID',
    //     value: getValues('searchFilters.productSpecificationType')?.PRODUCT_SPECIFICATION_TYPE_ID || ''
    //   },
    //   {
    //     id: 'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME',
    //     value: getValues('searchFilters.specificationSetting')
    //   },
    //   {
    //     id: 'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER',
    //     value: getValues('searchFilters.specificationSettingNumber')
    //   },
    //   {
    //     id: 'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION',
    //     value: getValues('searchFilters.specificationSettingVersionRevision')
    //   },
    //   {
    //     id: 'PRODUCT_PART_NUMBER',
    //     value: getValues('searchFilters.partNumber')
    //   },
    //   {
    //     id: 'PRODUCT_MODEL_NUMBER',
    //     value: getValues('searchFilters.modelNumber')
    //   },
    //   {
    //     id: 'inuseForSearch',
    //     value: getValues('searchFilters.status')?.value ?? ''
    //   }
    // ],
    // Order: sorting,
    // Start: pagination.pageIndex,
    // Limit: pagination.pageSize,
    // ColumnFilters: columnFilters.map(item => ({
    //   columnFns: columnFilterFns[item.id],
    //   column: item.id,
    //   value: item.value
    // })),
    queryPageIndex: pagination.pageIndex,
    queryPageSize: pagination.pageSize,
    querySortBy: sorting,
    queryColumnFilterFns: columnFilterFns,
    queryColumnFilters: columnFilters,
    INUSE: null,
    CREATE_BY: '',
    CREATE_DATE: '',
    DESCRIPTION: '',
    UPDATE_BY: '',
    UPDATE_DATE: '',
    CUSTOMER_ORDER_FROM_ID: getValues('searchFilters.customerOrderFrom')?.CUSTOMER_ORDER_FROM_ID || '',
    CUSTOMER_ORDER_FROM_NAME: getValues('searchFilters.customerOrderFrom')?.CUSTOMER_ORDER_FROM_NAME || '',
    PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME: getValues('searchFilters.specificationSetting') || '',
    PRODUCT_MAIN_ID: getValues('searchFilters.productMain')?.PRODUCT_MAIN_ID || '',
    PRODUCT_MAIN_NAME: getValues('searchFilters.productMain')?.PRODUCT_MAIN_NAME || '',
    PRODUCT_SPECIFICATION_TYPE_NAME:
      getValues('searchFilters.productSpecificationType')?.PRODUCT_SPECIFICATION_TYPE_NAME || '',
    PRODUCT_SPECIFICATION_TYPE_ID:
      getValues('searchFilters.productSpecificationType')?.PRODUCT_SPECIFICATION_TYPE_ID || '',
    PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER: getValues('searchFilters.specificationSettingNumber') || '',
    PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION: getValues(
      'searchFilters.specificationSettingVersionRevision'
    ),
    PRODUCT_PART_NUMBER: getValues('searchFilters.partNumber'),
    PRODUCT_MODEL_NUMBER: getValues('searchFilters.modelNumber') || '',
    inuseForSearch: getValues('searchFilters.status')?.value ?? ''
  }

  const { isRefetching, isLoading, data, isError, refetch, isFetching } = useSearchSpecificationSetting(
    getUrlParamSearch(paramForSearch),
    isEnableFetching
    // setIsEnableFetching(true)
  )

  useEffect(() => {
    if (isFetching === false) {
      setIsEnableFetching(false)
    }
  }, [isFetching])

  useUpdateEffect(() => {
    setIsEnableFetching(true)
  }, [JSON.stringify([columnFilters, columnFilterFns, sorting, pagination])])

  // react-table
  const columns = useMemo<MRT_ColumnDef<SpecificationSettingI>[]>(
    () => [
      {
        accessorKey: 'INUSE',
        header: 'Status',
        size: 160,
        Cell: ({ cell }) => {
          return (
            <>
              <Chip
                size='small'
                label={StatusColumn.find(dataItem => dataItem.value === cell.getValue<number>())?.label}
                color={StatusColumn.find(dataItem => dataItem.value === cell.getValue<string>())?.color || 'primary'}
              />
            </>
          )
        },
        filterSelectOptions: StatusColumn,
        filterVariant: 'select',
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
      //   accessorKey: 'PRODUCT_CATEGORY_NAME',
      //   header: 'PRODUCT CATEGORY',
      //   filterFn: 'contains'
      // },

      {
        accessorKey: 'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME',
        header: 'PRODUCT SPECIFICATION DOCUMENT SETTING NAME',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },

      {
        accessorKey: 'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER',
        header: 'PRODUCT SPECIFICATION DOCUMENT SETTING NUMBER',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION',
        header: 'PRODUCT SPECIFICATION DOCUMENT SETTING VERSION REVISION',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'PRODUCT_PART_NUMBER',
        header: 'PRODUCT PART_NUMBER',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'PRODUCT_MODEL_NUMBER',
        header: 'Product Model Number',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'PRODUCT_MAIN_NAME',
        header: 'PRODUCT MAIN',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'CUSTOMER_ORDER_FROM_NAME',
        header: 'CUSTOMER IN SPECIFICATION',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'PRODUCT_SPECIFICATION_TYPE_NAME',
        header: 'Product Specification Type',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      // {
      //   accessorKey: 'CREATE_DATE',
      //   header: 'CREATE DATE',
      //   filterFn: 'equals'
      // },
      // {
      //   accessorKey: 'CREATE_BY',
      //   header: 'CREATE BY',
      //   filterFn: 'contains'
      // },
      {
        accessorKey: 'MODIFIED_DATE',
        header: 'MODIFIED DATE',
        columnFilterModeOptions: [
          'contains',
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
        header: 'MODIFIED BY',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      }
    ],
    []
  )

  const isFirstRender = useRef(true)

  useEffect(() => {
    data?.data?.ResultOnDb?.length
  }, [isFetching])

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

  const table = useMaterialReactTable({
    columns,
    data: data?.data?.ResultOnDb || [],
    manualFiltering: true, //turn off built-in client-side filtering
    manualPagination: true, //turn off built-in client-side pagination
    manualSorting: true, //turn off built-in client-side sorting
    onColumnFiltersChange: setColumnFilters,
    onColumnFilterFnsChange: setColumnFilterFns,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onDensityChange: setDensity,
    onColumnPinningChange: setColumnPinning,
    onColumnOrderChange: setColumnOrder,
    // onColumnSizingChange: setColumnSizing,
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
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      sorting,
      density,
      columnVisibility,
      columnPinning,
      columnOrder,
      columnFilterFns
    },
    defaultColumn: {
      //minSize: 80, //allow columns to get smaller than default
      //maxSize: 400, //allow columns to get larger than default
      size: 300 //make columns wider by default
      // muiFilterTextFieldProps: { placeholder: '' }
      // grow: true
    },
    layoutMode: 'grid',
    displayColumnDefOptions: {
      'mrt-row-actions': {
        header: 'Actions', //change header text
        size: 100, //make actions column wider
        grow: false,
        muiTableHeadCellProps: {
          align: 'center' //change head cell props
        }
      },
      'mrt-row-select': {
        enableColumnActions: true,
        enableHiding: true,
        size: 100,
        muiTableHeadCellProps: {
          align: 'center' //change head cell props
        },
        muiTableBodyCellProps: {
          align: 'center' //change head cell props
        }
      }
    },

    renderToolbarInternalActions: ({ table }) => (
      <>
        {/* add your own custom print button or something */}
        {/* <IconButton onClick={() => showPrintPreview(true)}>
          <PrintIcon />
        </IconButton> */}
        {/* built-in buttons (must pass in table prop for them to work!) */}
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
        {/* <Button variant='tonal' onClick={() => table.resetSorting(true)}>
          Clear All Sorting
        </Button> */}
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
      </div>
    ),

    // renderBottomToolbarCustomActions: () => <>Test</>,

    renderBottomToolbar: ({ table }) => (
      <div className='flex items-center justify-end gap-2 p-3'>
        <div className='flex items-center gap-2'>
          <Typography variant='body1'>
            Showing {pagination.pageIndex * pagination.pageSize + 1} to{' '}
            {pagination.pageIndex * pagination.pageSize + (data?.data?.ResultOnDb?.length || 0)} of{' '}
            {table.getRowCount()} entries
          </Typography>

          {/* {useEffect(() => {
            console.log('Page Options Length:', table.getState().pagination.pageIndex + 1)
          }, [table])} */}
          <Pagination
            count={table.getPageOptions().length}
            // count={table.getPageOptions().length}
            page={table.getState().pagination.pageIndex + 1}
            onChange={(event, value: number) => table.setPageIndex(value - 1)}
            variant='tonal'
            shape='rounded'
            color='primary'
          />
        </div>
      </div>
    ),

    // muiCircularProgressProps: {
    //   color: 'secondary',
    //   thickness: 5,
    //   size: 55
    // },
    // muiSkeletonProps: {
    //   animation: 'pulse',
    //   height: 28
    // },
    renderRowActions: ({ row }) => (
      // <div className='flex items-center justify-start gap-2 p-3'>
      //   <div className='flex items-center gap-2'>
      //     <IconButton onClick={() => console.info('Edit')}>
      //       <EditIcon />
      //     </IconButton>
      //     <IconButton onClick={() => console.info('Delete')}>
      //       <DeleteIcon />
      //     </IconButton>
      //   </div>
      // </div>
      <div className='flex items-center'>
        <IconButton onClick={() => handleClickOpenModalView(row)}>
          <i className='tabler-eye text-[22px] text-textSecondary' />
        </IconButton>
        {/* <Tooltip title='Edit'>
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip> */}
        <ActionsMenu
          row={row}
          setOpenModalEdit={setOpenModalEdit}
          setOpenModalDelete={setOpenModalDelete}
          rowSelected={rowSelected}
          setRowSelected={setRowSelected}
          MENU_ID={MENU_ID}
        />
        {/* <OptionMenu
          // style={{ zIndex: 3000 }}
          iconClassName='text-[22px] text-textSecondary'
          options={[
            {
              text: 'Download',
              icon: 'tabler-download text-[22px]',
              menuItemProps: { className: 'flex items-center gap-2 text-textSecondary' }
            },
            {
              text: 'Edit',
              icon: 'tabler-pencil text-[22px]',

              //href: getLocalizedUrl(`apps/invoice/edit/${row.original.id}`, locale as Locale),
              linkProps: {
                className: 'flex items-center is-full plb-2 pli-4 gap-2 text-textSecondary'
              }
            },
            {
              text: 'Duplicate',
              icon: 'tabler-copy text-[22px]',
              menuItemProps: { className: 'flex items-center gap-2 text-textSecondary' }
            }
          ]}
        /> */}
      </div>
    ),

    // renderRowActionMenuItems: ({ row, table }) => [
    //   <IconButton key='view'>
    //     <i className='tabler-eye text-[22px] text-textSecondary' />
    //   </IconButton>,
    //   <MRT_ActionMenuItem //or just use a normal MUI MenuItem component
    //     icon={<EditIcon />}
    //     key='edit'
    //     label='Edit'
    //     onClick={() => console.info('Edit')}
    //     table={table}
    //   />,
    //   <MRT_ActionMenuItem
    //     icon={<DeleteIcon />}
    //     key='delete'
    //     label='Delete'
    //     onClick={() => console.info('Delete')}
    //     table={table}
    //   />
    // ],
    initialState: { showColumnFilters: columnFilters.filter(cf => cf?.value?.length !== 0)?.length > 0 ? true : false },

    // muiPaginationProps: {
    //   showRowsPerPage: false
    // },
    muiToolbarAlertBannerProps: isError
      ? {
          color: 'error',
          children: 'Error loading data'
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
        //stripe the rows, make odd rows a darker color
        '& tr:nth-of-type(odd) > td': {
          backgroundColor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.055)'
        }
      }
    },

    //muiTableProps
    // muiTableBodyProps: {
    //   sx: theme => ({
    //     backgroundColor: 'var(--mui-palette-background-paper)'

    //     // '& tr:nth-of-type(odd):not([data-selected="true"]):not([data-pinned="true"]) > td': {
    //     //   backgroundColor: darken('rgb(var(--mui-palette-primary-mainChannel))', 0.9)
    //     // },
    //     // '& tr:nth-of-type(even):not([data-selected="true"]):not([data-pinned="true"]) > td': {
    //     //   backgroundColor: lighten('rgb(var(--mui-palette-background-paper))', 0.1)
    //     // }
    //   })
    // },

    muiTableBodyCellProps: {
      sx: theme => ({
        backgroundColor: 'var(--mui-palette-background-default)',
        fontSize: 15

        // '& tr:nth-of-type(odd):not([data-selected="true"]):not([data-pinned="true"]) > td': {
        //   backgroundColor: darken('rgba(3, 44, 43, 1)', 0.9)
        // },
        // '& tr:nth-of-type(even):not([data-selected="true"]):not([data-pinned="true"]) > td': {
        //   backgroundColor: lighten('rgba(3, 44, 43, 1)', 0.1)
        // }
      })
    },

    //   // sx: theme => ({
    //   //   '& tr:nth-of-type(odd):not([data-selected="true"]):not([data-pinned="true"]) > td': {
    //   //     backgroundColor: 'var(--mui-palette-background-default)'
    //   //   },
    //   //   '& tr:nth-of-type(odd):not([data-selected="true"]):not([data-pinned="true"]):hover > td': {
    //   //     backgroundColor: 'var(--mui-palette-background-paper)'
    //   //   },
    //   //   '& tr:nth-of-type(even):not([data-selected="true"]):not([data-pinned="true"]) > td': {
    //   //     backgroundColor: 'var(--mui-palette-background-default)'
    //   //   },
    //   //   '& tr:nth-of-type(even):not([data-selected="true"]):not([data-pinned="true"]):hover > td': {
    //   //     backgroundColor: 'var(--mui-palette-background-paper)'
    //   //   }
    //   // })
    // },
    muiTopToolbarProps: {
      sx: {
        backgroundColor: 'var(--mui-palette-background-default)'
      }
    },
    muiTablePaperProps: ({ table }) => ({
      elevation: 0, //change the mui box shadow
      //customize paper styles
      style: {
        zIndex: table.getState().isFullScreen ? 2000 : undefined
      },
      sx: {
        borderRadius: '0'

        //stripe the rows, make odd rows a darker color
        // '& tr:nth-of-type(odd) > td': {
        //   backgroundColor: '#bb3535'
        // }

        //border: 'none'
      }
    })
  })

  const handleClickOpen = () => setOpenModalAdd(true)
  const handleClickOpenModalView = (row: MRT_Row<SpecificationSettingI>) => {
    setOpenModalView(true)
    setRowSelected(row)
  }

  return (
    <>
      {/* {data?.data.TotalCountOnDb} */}
      <Card>
        <CardHeader
          title='Search result'
          action={
            <>
              <Button
                variant='contained'
                startIcon={<AddIcon />}
                onClick={handleClickOpen}
                color='success'
                className='rounded-3xl'
              >
                Add New
              </Button>
              {openAddModal ? (
                <SpecificationSettingAddModal
                  openAddModal={openAddModal}
                  setOpenModalAdd={setOpenModalAdd}
                  isEnableFetching={isEnableFetching}
                  setIsEnableFetching={setIsEnableFetching}
                />
              ) : null}
            </>
          }
        />
        {openModalEdit && (
          <SpecificationSettingEditModal
            openModalEdit={openModalEdit}
            setOpenModalEdit={setOpenModalEdit}
            rowSelected={rowSelected}
            setIsEnableFetching={setIsEnableFetching}
          />
        )}

        {openModalDelete ? (
          <SpecificationSettingDeleteModal
            openModalDelete={openModalDelete}
            setOpenModalDelete={setOpenModalDelete}
            rowSelected={rowSelected}
            setIsEnableFetching={setIsEnableFetching}
          />
        ) : null}
        {openModalView ? (
          <SpecificationSettingViewModal
            openModalView={openModalView}
            setOpenModalView={setOpenModalView}
            rowSelected={rowSelected}
            setRowSelected={setRowSelected}
          />
        ) : null}

        <MaterialReactTable table={table} />
      </Card>
    </>
  )
}

export default SpecificationSettingTableData
