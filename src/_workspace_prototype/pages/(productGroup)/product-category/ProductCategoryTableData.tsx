import AddIcon from '@mui/icons-material/Add'
import FilterListIcon from '@mui/icons-material/FilterList'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import {
  Badge,
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
import type {
  MRT_ColumnFilterFnsState,
  MRT_ColumnFiltersState,
  MRT_ColumnOrderState,
  MRT_ColumnPinningState,
  MRT_DensityState,
  MRT_PaginationState,
  MRT_Row,
  MRT_SortingState,
  MRT_VisibilityState
} from 'material-react-table'
import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

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

import { useUpdateEffect } from 'react-use'

import type { ProductCategoryI } from '@/_workspace/types/productGroup/ProductCategory'

import type { FormData } from './page'
// Utils

import { useSearch } from '@/_workspace/react-query/hooks/useProductCategoryData'

import { useSettings } from '@/@core/hooks/useSettings'
import { useCheckPermission } from '@/_template/CheckPermission'
import CustomTextField from '@/components/mui/TextField'
import SelectCustom from '@/components/react-select/SelectCustom'
import StatusColumn from '@/libs/material-react-table/components/StatusOption'
import { ParamApiSearchResultTableI_V2 } from '@/libs/material-react-table/types/SearchResultTable'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { useQueryClient } from '@tanstack/react-query'
import { MENU_ID } from './env'
import ProductCategoryAddModal from './modal/ProductCategoryAddModal'
import ProductCategoryDeleteModal from './modal/ProductCategoryDeleteModal'
import ProductCategoryEditModal from './modal/ProductCategoryEditModal'
import ProductCategoryViewModal from './modal/ProductCategoryViewModal'
import { DxMRTTable } from '@/_template/DxMRTTable'
import ActionsMenu from '@/libs/material-react-table/components/ActionsMenu'
interface ParamApiSearchProductCategoryI extends ParamApiSearchResultTableI_V2 {
  PRODUCT_CATEGORY_ID?: number | ''
  PRODUCT_CATEGORY_CODE?: string
  PRODUCT_CATEGORY_NAME?: string
  PRODUCT_CATEGORY_ALPHABET?: string
}

export interface ReturnApiSearchProductCategoryI {
  PRODUCT_CATEGORY_ID?: number | ''
  PRODUCT_CATEGORY_CODE?: string
  PRODUCT_CATEGORY_NAME?: string
  PRODUCT_CATEGORY_ALPHABET?: string
  ColumnFilters: string
}

interface Props {
  isEnableFetching: boolean
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

function ProductCategoryTableData({ isEnableFetching, setIsEnableFetching }: Props) {
  // react-hook-form
  const { getValues, control, setValue } = useFormContext<FormData>()

  // States
  const [rowSelected, setRowSelected] = useState<MRT_Row<ProductCategoryI> | null>(null)

  // States : mui-react-table
  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>(
    getValues('searchResults.columnVisibility')
  )

  const [columnOrder, setColumnOrder] = useState<MRT_ColumnOrderState>(getValues('searchResults.columnOrder') || [])
  const [columnPinning, setColumnPinning] = useState<MRT_ColumnPinningState>(getValues('searchResults.columnPinning'))
  const [density, setDensity] = useState<MRT_DensityState>(getValues('searchResults.density'))
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    getValues('searchResults.columnFilters') || []
  )
  const [sorting, setSorting] = useState<MRT_SortingState>(getValues('searchResults.sorting'))

  const [columnFilterFns, setColumnFilterFns] = useState<MRT_ColumnFilterFnsState>(
    getValues('searchResults.columnFilterFns')
  )
  const checkPermission = useCheckPermission()

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: getValues('searchResults.pageSize')
  })

  // States : Modal
  const [openModalAdd, setOpenModalAdd] = useState<boolean>(false)
  const [openModalEdit, setOpenModalEdit] = useState<boolean>(false)
  const [openModalDelete, setOpenModalDelete] = useState<boolean>(false)
  const [openModalView, setOpenModalView] = useState<boolean>(false)
  const { settings } = useSettings()
  const queryClient = useQueryClient()
  // react-query
  const paramForSearch: ParamApiSearchProductCategoryI = {
    SearchFilters: [
      {
        id: 'PRODUCT_CATEGORY_NAME',
        value: getValues('searchFilters.productCategoryName').trim()
      },
      {
        id: 'PRODUCT_CATEGORY_CODE',
        value: getValues('searchFilters.productCategoryCode').trim()
      },
      {
        id: 'PRODUCT_CATEGORY_ALPHABET',
        value: getValues('searchFilters.productCategoryAlphabet').trim()
      },
      {
        id: 'inuseForSearch',
        value: getValues('searchFilters.status')?.value ?? ''
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

  const { isRefetching, isLoading, data, isError, isFetching } = useSearch(paramForSearch, isEnableFetching)

  useEffect(() => {
    if (isFetching === false) {
      setIsEnableFetching(false)
    }
  }, [isFetching, setIsEnableFetching])

  useUpdateEffect(() => {
    setIsEnableFetching(true)
  }, [JSON.stringify([columnFilters, columnFilterFns, sorting, pagination])])

  // react-table
  const columns = useMemo<MRT_ColumnDef<ProductCategoryI>[]>(
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
        accessorKey: 'PRODUCT_CATEGORY_CODE',
        header: 'PRODUCT CATEGORY CODE',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'PRODUCT_CATEGORY_NAME',
        header: 'PRODUCT CATEGORY NAME',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },

      {
        accessorKey: 'PRODUCT_CATEGORY_ALPHABET',
        header: 'PRODUCT CATEGORY ALPHABET',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'UPDATE_DATE',
        header: 'UPDATE DATE',
        filterVariant: 'date',

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
        header: 'UPDATE BY',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      }
    ],
    []
  )

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

  // const table = useMaterialReactTable({
  //   columns,
  //   data: data?.data.ResultOnDb || [],
  //   manualFiltering: true, //turn off built-in client-side filtering
  //   manualPagination: true, //turn off built-in client-side pagination
  //   manualSorting: true, //turn off built-in client-side sorting
  //   onColumnFiltersChange: setColumnFilters,
  //   onColumnFilterFnsChange: setColumnFilterFns,
  //   onPaginationChange: setPagination,
  //   onSortingChange: setSorting,
  //   onColumnVisibilityChange: setColumnVisibility,
  //   onDensityChange: setDensity,
  //   onColumnPinningChange: setColumnPinning,
  //   onColumnOrderChange: setColumnOrder,
  //   rowCount: data?.data.TotalCountOnDb ?? 0,
  //   isMultiSortEvent: () => true,
  //   enableStickyHeader: true,
  //   enableColumnFilterModes: true,
  //   enableFacetedValues: true,
  //   enableColumnPinning: true,
  //   enableRowActions: true,
  //   enableColumnResizing: true,
  //   enableColumnOrdering: true,
  //   paginationDisplayMode: 'pages',
  //   state: {
  //     columnFilters,
  //     isLoading,
  //     pagination,
  //     showAlertBanner: isError,
  //     showProgressBars: isRefetching,
  //     sorting,
  //     density,
  //     columnVisibility,
  //     columnPinning,
  //     columnOrder,
  //     columnFilterFns
  //   },
  //   defaultColumn: {
  //     size: 300
  //   },
  //   layoutMode: 'grid',
  //   displayColumnDefOptions: {
  //     'mrt-row-actions': {
  //       header: 'Actions', //change header text
  //       size: 100, //make actions column wider
  //       grow: false,
  //       muiTableHeadCellProps: {
  //         align: 'center' //change head cell props
  //       }
  //     },
  //     'mrt-row-select': {
  //       enableColumnActions: true,
  //       enableHiding: true,
  //       size: 100,
  //       muiTableHeadCellProps: {
  //         align: 'center' //change head cell props
  //       },
  //       muiTableBodyCellProps: {
  //         align: 'center' //change head cell props
  //       }
  //     }
  //   },
  //   renderToolbarInternalActions: ({ table }) => (
  //     <>
  //       <MRT_ShowHideColumnsButton table={table} />
  //       <MRT_ToggleDensePaddingButton table={table} />
  //       <MRT_ToggleFullScreenButton table={table} />
  //     </>
  //   ),
  //   renderTopToolbarCustomActions: () => (
  //     <div className='flex gap-1'>
  //       <div className='flex items-center gap-1'>
  //         <Typography className='hidden sm:block'>Show</Typography>
  //         <Controller
  //           name='searchResults.pageSize'
  //           control={control}
  //           render={({ field: { onChange, ...fieldProps } }) => (
  //             <CustomTextField
  //               {...fieldProps}
  //               select
  //               onChange={e => {
  //                 table.setPageSize(Number(e.target.value))
  //                 onChange(Number(e.target.value))
  //               }}
  //               className='is-[80px]'
  //               style={{ zIndex: 2001 }}
  //             >
  //               <MenuItem value='10'>10</MenuItem>
  //               <MenuItem value='25'>25</MenuItem>
  //               <MenuItem value='50'>50</MenuItem>
  //               <MenuItem value='100'>100</MenuItem>
  //             </CustomTextField>
  //           )}
  //         />
  //         <Typography className='hidden sm:block'>Entries</Typography>
  //       </div>
  //       <Tooltip arrow title='Clear All Sorting' onClick={() => table.resetSorting(true)}>
  //         <IconButton>
  //           <Badge badgeContent={sorting.length ?? 0} color='primary'>
  //             <SwapVertIcon />
  //           </Badge>
  //         </IconButton>
  //       </Tooltip>
  //       <Tooltip arrow title='Clear All Filters' onClick={() => table.resetColumnFilters(true)}>
  //         <IconButton>
  //           <Badge badgeContent={columnFilters.length ?? 0} color='primary'>
  //             <FilterListIcon />
  //           </Badge>
  //         </IconButton>
  //       </Tooltip>
  //     </div>
  //   ),
  //   renderBottomToolbar: ({ table }) => (
  //     <div className='flex items-center justify-end gap-2 p-3'>
  //       <div className='flex items-center gap-2'>
  //         <Typography variant='body1'>
  //           Showing {pagination.pageIndex * pagination.pageSize + 1} to{' '}
  //           {pagination.pageIndex * pagination.pageSize + (data?.data?.ResultOnDb?.length || 0)} of{' '}
  //           {table.getRowCount()} entries
  //         </Typography>
  //         <Pagination
  //           count={table.getPageOptions().length}
  //           page={table.getState().pagination.pageIndex + 1}
  //           onChange={(event, value: number) => table.setPageIndex(value - 1)}
  //           variant='tonal'
  //           shape='rounded'
  //           color='primary'
  //         />
  //       </div>
  //     </div>
  //   ),
  //   renderRowActions: ({ row }) => (
  //     <div className='flex items-center'>
  //       <IconButton onClick={() => handleClickOpenModalView(row)}>
  //         <i className='tabler-eye text-[22px] text-textSecondary' />
  //       </IconButton>
  //     </div>
  //   ),
  //   initialState: {
  //     showColumnFilters: columnFilters.filter((cf: any) => cf?.value?.length !== 0)?.length > 0 ? true : false
  //   },
  //   muiToolbarAlertBannerProps: isError
  //     ? {
  //         color: 'error',
  //         children: 'Error loading data'
  //       }
  //     : undefined,

  //   muiTableHeadCellProps: {
  //     sx: {
  //       fontWeight: 600,
  //       textTransform: 'uppercase',

  //       backgroundColor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.25)'
  //     }
  //   },
  //   muiTableBodyProps: {
  //     sx: {
  //       //stripe the rows, make odd rows a darker color
  //       '& tr:nth-of-type(odd) > td': {
  //         backgroundColor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.055)'
  //       }
  //     }
  //   },
  //   muiTableBodyCellProps: {
  //     sx: theme => ({
  //       backgroundColor: 'var(--mui-palette-background-default)',
  //       fontSize: 15,
  //       borderRight:
  //         theme.palette.mode === 'dark'
  //           ? '1px solid rgb(var(--mui-palette-secondary-mainChannel) / 0.2)'
  //           : '1px solid rgb(var(--mui-palette-primary-mainChannel) / 0.19)',
  //       borderBottom:
  //         theme.palette.mode === 'dark'
  //           ? '1px solid rgb(var(--mui-palette-secondary-mainChannel) / 0.08)'
  //           : '1px solid rgb(var(--mui-palette-primary-mainChannel) / 0.19)'
  //     })
  //   },
  //   muiTopToolbarProps: {
  //     sx: {
  //       backgroundColor: 'var(--mui-palette-background-default)'
  //     }
  //   },
  //   muiTablePaperProps: ({ table }) => ({
  //     elevation: 0,
  //     style: {
  //       zIndex: table.getState().isFullScreen ? 2000 : undefined
  //     },
  //     sx: {
  //       borderRadius: '0'
  //     }
  //   })
  // })

  const handleClickOpen = () => setOpenModalAdd(true)

  const handleClickOpenModalView = (row: MRT_Row<ProductCategoryI>) => {
    setOpenModalView(true)
    setRowSelected(row)
  }

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
                <ProductCategoryAddModal
                  openModalAdd={openModalAdd}
                  setOpenModalAdd={setOpenModalAdd}
                  setIsEnableFetching={setIsEnableFetching}
                  isEnableFetching={isEnableFetching}
                />
              ) : null}
            </>
          }
        />
        {openModalEdit && (
          <ProductCategoryEditModal
            openModalEdit={openModalEdit}
            setOpenModalEdit={setOpenModalEdit}
            rowSelected={rowSelected}
            setIsEnableFetching={setIsEnableFetching}
          />
        )}

        {openModalDelete ? (
          <ProductCategoryDeleteModal
            openModalDelete={openModalDelete}
            setOpenModalDelete={setOpenModalDelete}
            rowSelected={rowSelected}
            setIsEnableFetching={setIsEnableFetching}
          />
        ) : null}
        {openModalView ? (
          <ProductCategoryViewModal
            openModalView={openModalView}
            setOpenModalView={setOpenModalView}
            rowSelected={rowSelected}
            setRowSelected={setRowSelected}
            isEnableFetching={isEnableFetching}
            setIsEnableFetching={setIsEnableFetching}
          />
        ) : null}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DxMRTTable
            columns={columns}
            data={data?.data?.ResultOnDb || []}
            onColumnFiltersChange={setColumnFilters}
            onColumnFilterFnsChange={setColumnFilterFns}
            onPaginationChange={setPagination}
            onSortingChange={setSorting}
            onColumnVisibilityChange={setColumnVisibility}
            onDensityChange={setDensity}
            onColumnPinningChange={setColumnPinning}
            onColumnOrderChange={setColumnOrder}
            rowCount={data?.data?.TotalCountOnDb ?? 0}
            state={{
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
            }}
            isError={isError}
            renderRowActions={({ row }) => (
              <ActionsMenu
                row={row}
                setOpenModalEdit={setOpenModalEdit}
                setOpenModalDelete={setOpenModalDelete}
                setOpenModalView={setOpenModalView}
                rowSelected={rowSelected}
                setRowSelected={setRowSelected}
                isNeedEdit={false}
                isNeedDelete={false}
                MENU_ID={MENU_ID}
                isNeedViewEyeIcon={true}
                handleClickOpenModalView={handleClickOpenModalView}
              />
            )}
          />
        </LocalizationProvider>
      </Card>
    </>
  )
}

export default ProductCategoryTableData
