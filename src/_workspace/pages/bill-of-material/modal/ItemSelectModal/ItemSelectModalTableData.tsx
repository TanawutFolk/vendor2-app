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

import { ItemI } from '@/_workspace/types/flow/Item'

import StatusColumn from '@/libs/material-react-table/components/StatusOption'
import { ParamApiSearchResultTableI } from '@/libs/material-react-table/types/SearchResultTable'
import ActionsMenu from '@/libs/material-react-table/components/ActionsMenu'

import { useSearch } from '@/_workspace/react-query/hooks/useItemData'

import { is_Null_Undefined_Blank } from '@/utils/formatting-checking-value/checkingValueTypes'

// Types Imports
import { FlowInterface, FormData } from './ItemSelectModal'
import { ProcessInterface } from '../BomAddModal'
import { fetchProcessByItemId } from '@/_workspace/react-select/async-promise-load-options/fetchItem'

interface ParamApiSearchI extends ParamApiSearchResultTableI {
  PRODUCT_MAIN?: {
    PRODUCT_MAIN_ID: number
    PRODUCT_MAIN_NAME: string
  } | null
  FLOW_CODE?: string
  FLOW_NAME?: string
  inuseForSearch?: number
}

export interface ReturnApiSearchItemI {
  PRODUCT_MAIN_ID: number | string
  FLOW_CODE: string
  FLOW_NAME: string
  INUSE: string | number
  Start: number
  Limit: number
  Order: string
  ColumnFilters: string
}

// const getUrlParamSearch = ({
//   queryPageIndex,
//   queryPageSize,
//   querySortBy,
//   PRODUCT_MAIN = null,
//   FLOW_CODE = '',
//   FLOW_NAME = '',
//   inuseForSearch
// }: ParamApiSearchI): ReturnApiSearchItemI => {
//   let params = {
//     PRODUCT_MAIN_ID: PRODUCT_MAIN?.PRODUCT_MAIN_ID || '',
//     FLOW_CODE: FLOW_CODE || '',
//     FLOW_NAME: FLOW_NAME || '',
//     INUSE: is_Null_Undefined_Blank(inuseForSearch) ? '' : Number(inuseForSearch),
//     Start: +queryPageIndex,
//     Limit: +queryPageSize,
//     Order: '[]',
//     ColumnFilters: '[]'
//   }

//   return params
// }

const getUrlParamSearch = (
  queryPageIndex,
  queryPageSize,
  querySortBy = [],
  {
    itemInternalCode = '',
    itemInternalFullName = '',
    itemInternalShortName = '',
    itemExternalCode = '',
    itemExternalFullName = '',
    itemExternalShortName = '',
    itemCategory,
    itemPurpose,
    itemGroup,
    vendor,
    maker,
    itemPropertyWidth = '',
    itemPropertyHeight = '',
    itemPropertyDepth = '',
    itemPropertyColor,
    itemPropertyShape,
    itemPropertyMadeBy,
    usageUnit,
    itemCodeForSupportMes = '',
    isHaveItemPriceOfFiscalYear,
    fiscalYear = '',
    productCategory,
    productMain,
    productSub,
    productType,
    workOrder,
    partNo,
    specification,
    customerOrderFrom,
    productCategoryItemOwner,
    productMainItemOwner
  }
) => {
  let params = ``
  params += `"ITEM_INTERNAL_CODE":"${itemInternalCode.trim()}"`
  params += `, "ITEM_INTERNAL_FULL_NAME":"${itemInternalFullName.trim()}"`
  params += `, "ITEM_INTERNAL_SHORT_NAME":"${itemInternalShortName.trim()}"`
  params += `, "ITEM_EXTERNAL_CODE":"${itemExternalCode.trim()}"`
  params += `, "ITEM_EXTERNAL_FULL_NAME":"${itemExternalFullName.trim()}"`
  params += `, "ITEM_EXTERNAL_SHORT_NAME":"${itemExternalShortName.trim()}"`
  params += `, "ITEM_CODE_FOR_SUPPORT_MES":"${itemCodeForSupportMes.trim()}"`
  params += `, "INUSE":""`
  params += `, "InuseRawData":"1"`
  params += `, "Start":"${queryPageIndex}"`
  params += `, "Limit":"${queryPageSize}"`
  params += `, "ITEM_CATEGORY_ID":"${itemCategory?.ITEM_CATEGORY_ID || ''}"`
  params += `, "ITEM_PURPOSE_ID":"${itemPurpose?.ITEM_PURPOSE_ID || ''}"`
  params += `, "ITEM_GROUP_ID":"${itemGroup?.ITEM_GROUP_ID || ''}"`
  params += `, "VENDOR_ID":"${vendor?.VENDOR_ID || ''}"`
  params += `, "MAKER_ID":"${maker?.MAKER_ID || ''}"`

  params += `, "PRODUCT_CATEGORY_ID":"${productCategory?.PRODUCT_CATEGORY_ID || ''}"`
  params += `, "PRODUCT_MAIN_ID":"${productMain?.PRODUCT_MAIN_ID || ''}"`
  params += `, "PRODUCT_SUB_ID":"${productSub?.PRODUCT_SUB_ID || ''}"`
  params += `, "PRODUCT_TYPE_ID":"${productType?.PRODUCT_TYPE_ID || ''}"`

  params += `, "WORK_ORDER_ID":"${workOrder?.WORK_ORDER_ID || ''}"`
  params += `, "PART_NO_ID":"${partNo?.PART_NO_ID || ''}"`
  params += `, "SPECIFICATION_ID":"${specification?.SPECIFICATION_ID || ''}"`
  params += `, "CUSTOMER_ORDER_FROM_ID":"${customerOrderFrom?.CUSTOMER_ORDER_FROM_ID || ''}"`

  params += `, "WIDTH":"${itemPropertyWidth.trim()}"`
  params += `, "HEIGHT":"${itemPropertyHeight.trim()}"`
  params += `, "DEPTH":"${itemPropertyDepth.trim()}"`

  params += `, "ITEM_PROPERTY_COLOR_ID":"${itemPropertyColor?.ITEM_PROPERTY_COLOR_ID || ''}"`
  params += `, "ITEM_PROPERTY_SHAPE_ID":"${itemPropertyShape?.ITEM_PROPERTY_SHAPE_ID || ''}"`
  params += `, "ITEM_PROPERTY_MADE_BY_ID":"${itemPropertyMadeBy?.ITEM_PROPERTY_MADE_BY_ID || ''}"`
  params += `, "USAGE_UNIT_ID":"${usageUnit?.UNIT_OF_MEASUREMENT_ID || ''}"`
  params += `, "IS_HAVE_ITEM_PRICE_OF_FISCAL_YEAR":"${isHaveItemPriceOfFiscalYear?.value || ''}"`
  params += `, "CHECK_ITEM_IN_PRODUCT_MAIN_ID":""`
  params += `, "IS_EXISTS_ITEM_IN_PRODUCT_MAIN":"${
    productCategoryItemOwner?.PRODUCT_CATEGORY_ID || productMainItemOwner?.PRODUCT_MAIN_ID ? '1' : '0'
  }"`
  params += `, "PRODUCT_CATEGORY_ID_FOR_ITEM_PRODUCT_MAIN":"${
    productMainItemOwner?.PRODUCT_MAIN_ID ? '' : productCategoryItemOwner?.PRODUCT_CATEGORY_ID || ''
  }"`
  params += `, "PRODUCT_MAIN_ID_FOR_ITEM_PRODUCT_MAIN":"${productMainItemOwner?.PRODUCT_MAIN_ID || ''}"`
  params += `, "IS_SEARCH_FOR_BOM":"1"`
  params += `, "FISCAL_YEAR":"${fiscalYear.trim()}"`
  if (querySortBy?.length > 0) {
    params += `, "Order":${JSON.stringify(querySortBy).replace('MODIFIED_DATE', 'UPDATE_DATE')}`
  }
  params = `{${params}}`
  return params
}

export type Props = {
  isEnableFetching: boolean
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
  setIsOpenSelectingItemModal: Dispatch<SetStateAction<boolean>>
  setFormValue: Dispatch<SetStateAction<FormData>>
  rowIdSelected: string
}

const ItemSelectModalTableData = ({
  isEnableFetching,
  setIsEnableFetching,
  // PRODUCT_MAIN,
  // setProcessSelected,
  setIsOpenSelectingItemModal,

  // setFlowSelected,
  // get,
  setFormValue,
  rowIdSelected
}: Props) => {
  const [rowSelected, setRowSelected] = useState<MRT_Row<ItemI> | null>(null)

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
    PRODUCT_MAIN: PRODUCT_MAIN,
    FLOW_CODE: getValues('searchFilters.FLOW_CODE') || undefined,
    FLOW_NAME: getValues('searchFilters.FLOW_NAME') || undefined,
    inuseForSearch: getValues('searchFilters.INUSE')?.value
  }

  const { isRefetching, isLoading, data, isError, refetch, isFetching } = useSearch(
    getUrlParamSearch(pagination.pageIndex, pagination.pageSize, [], getValues()),
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
    setFormValue(rowIdSelected, { ...row.original, UNIT_OF_MEASUREMENT_NAME: row.original.USAGE_UNIT_SYMBOL })

    setIsOpenSelectingItemModal(false)
  }

  const columns = useMemo<MRT_ColumnDef<ItemI>[]>(
    () => [
      {
        accessorKey: 'inuseForSearch',
        header: 'Status',
        Cell: ({ cell }) => {
          const status = StatusColumn.find(dataItem => dataItem.value === cell.row.original.INUSE)

          return (
            <>
              {cell.row.original?.IS_DRAFT ? (
                <Chip size='small' label='Draft' color='secondary' />
              ) : (
                <Chip size='small' label={status?.label} color={status?.color} />
              )}
            </>
          )
        },
        filterSelectOptions: StatusColumn,
        enableColumnFilter: false
      },

      {
        header: 'Item Code For MES',
        accessorKey: 'ITEM_CODE_FOR_SUPPORT_MES',
        enableColumnFilter: false,
        enableColumnOrdering: false
      },
      {
        header: 'Item Internal Full Name',
        accessorKey: 'ITEM_INTERNAL_FULL_NAME',
        enableColumnFilter: false
      },
      {
        header: 'Item Internal Short Name',
        accessorKey: 'ITEM_INTERNAL_SHORT_NAME',
        enableColumnFilter: false
      },
      {
        header: 'Item Category',
        accessorKey: 'ITEM_CATEGORY_NAME'
      },
      {
        header: 'Item Purpose',
        accessorKey: 'ITEM_PURPOSE_NAME'
      },
      {
        header: 'Item Group',
        accessorKey: 'ITEM_GROUP_NAME'
      },
      {
        header: 'Vendor Alphabet',
        accessorKey: 'VENDOR_ALPHABET'
      },
      {
        header: 'Maker',
        accessorKey: 'MAKER_NAME'
      },
      {
        header: 'Width [mm]',
        accessorKey: 'WIDTH'
      },
      {
        header: 'Height [mm]',
        accessorKey: 'HEIGHT'
      },
      {
        header: 'Depth [mm]',
        accessorKey: 'DEPTH'
      },
      {
        header: 'Color',
        accessorKey: 'ITEM_PROPERTY_COLOR_NAME',
        enableColumnFilter: false
      },
      {
        header: 'Shape',
        accessorKey: 'ITEM_PROPERTY_SHAPE_NAME'
      },
      {
        header: 'Made by',
        accessorKey: 'ITEM_PROPERTY_MADE_BY_NAME'
      },
      {
        header: 'Usage Unit',
        accessorKey: 'USAGE_UNIT_SYMBOL'
      },
      {
        header: 'Item External Code (P/N)',
        accessorKey: 'ITEM_EXTERNAL_CODE'
      },
      {
        header: 'Item External Full Name',
        accessorKey: 'ITEM_EXTERNAL_FULL_NAME'
      },
      {
        header: 'Item External Short Name',
        accessorKey: 'ITEM_EXTERNAL_SHORT_NAME'
      },
      {
        header: 'Product Category',
        accessorKey: 'PRODUCT_CATEGORY_NAME'
      },
      {
        header: 'Product Main',
        accessorKey: 'PRODUCT_MAIN_NAME'
      },
      {
        header: 'Product Sub',
        accessorKey: 'PRODUCT_SUB_NAME'
      },
      {
        header: 'Product Type',
        accessorKey: 'PRODUCT_TYPE_NAME'
      },
      {
        header: 'Work Order',
        accessorKey: 'WORK_ORDER_CODE'
      },
      {
        header: 'Part No',
        accessorKey: 'PART_NO_CODE'
      },
      {
        header: 'Specification',
        accessorKey: 'SPECIFICATION_CODE'
      },
      {
        header: 'Customer Order From',
        accessorKey: 'CUSTOMER_ORDER_FROM_ALPHABET'
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
        <Button variant='contained' onClick={() => selectAction(row)}>
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
      <Card>
        <CardHeader title='Search result' />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MaterialReactTable table={table} />
        </LocalizationProvider>
      </Card>
    </>
  )
}

export default ItemSelectModalTableData
