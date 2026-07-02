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
  Switch,
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

import { StandardCostForProductI } from '@/_workspace/types/sct/StandardCostForProductType'

import {
  ParamApiSearchResultTableI,
  ParamApiSearchResultTableI_V2
} from '@/libs/material-react-table/types/SearchResultTable'
import ActionsMenu from '@/libs/material-react-table/components/ActionsMenu'
import StatusColumn from '@/libs/material-react-table/components/StatusOption'

import { useSearch } from '@/_workspace/react-query/hooks/useStandardCostForProduct'

import { is_Null_Undefined_Blank } from '@/utils/formatting-checking-value/checkingValueTypes'

// Types Imports

import StandardCostFormModal from './modal/SctAddModal/SctFormModal'
import SctForProductEditModal from './modal/SctForProductEditModal'
import { useSettings } from '@/@core/hooks/useSettings'
import { FormDataPage } from './validationSchema'
import { DxMRTTable } from '@/_template/DxMRTTable'
import { MENU_ID } from '../env'
import { useCheckPermission } from '@/_template/CheckPermission'

interface ParamApiSearchSctForProductI extends ParamApiSearchResultTableI_V2 {
  PRODUCT_CATEGORY_ID?: number | ''
  PRODUCT_CATEGORY_NAME?: string
  PRODUCT_MAIN_ID?: number | ''
  PRODUCT_MAIN_CODE?: string
  PRODUCT_MAIN_NAME?: string
  PRODUCT_MAIN_ALPHABET?: string

  // inuseForSearch?: string
}

export interface ReturnApiSearchI {
  Start: number
  Limit: number
  Order: string
  ColumnFilters: string
}

// const getUrlParamSearch = ({
//   queryPageIndex,
//   queryPageSize,
//   querySortBy,
//   queryColumnFilterFns,
//   queryColumnFilters
// }: ParamApiSearchI): ReturnApiSearchI => {
//   const columnFilterQuery = queryColumnFilters.map(item => ({
//     columnFns: queryColumnFilterFns[item.id],
//     column: item.id.replaceAll('MODIFIED_DATE', 'UPDATE_DATE').replaceAll('inuseForSearch', 'INUSE'),
//     value: item.value
//   }))

//   let params = {
//     Start: +queryPageIndex,
//     Limit: +queryPageSize,
//     Order: JSON.stringify(querySortBy).replaceAll('MODIFIED_DATE', 'UPDATE_DATE').replaceAll('inuseForSearch', 'INUSE'),
//     ColumnFilters: JSON.stringify(columnFilterQuery)
//   }

//   return params
// }

interface Props {
  isEnableFetching: boolean
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const StandardCostForProductTableData = ({ isEnableFetching, setIsEnableFetching }: Props) => {
  // react-hook-form
  const [openModalAdd, setOpenModalAdd] = useState<boolean>(false)
  const [openModalEdit, setOpenModalEdit] = useState<boolean>(false)
  const [openModalDelete, setOpenModalDelete] = useState<boolean>(false)
  const [openModalView, setOpenModalView] = useState<boolean>(false)
  const [openModalBatchChange, setOpenModalBatchChange] = useState<boolean>(false)

  const [rowSelected, setRowSelected] = useState<MRT_Row<StandardCostForProductI> | null>(null)

  const { settings } = useSettings()
  // Hooks : react-hook-form
  const { getValues, control, setValue } = useFormContext<FormDataPage>()

  // Functions
  const handleClickOpenModalAdd = () => setOpenModalAdd(true)
  const handleClickOpenModalBatchChange = () => setOpenModalBatchChange(true)
  const handleClickOpenModalView = (row: MRT_Row<StandardCostForProductI>) => {
    setOpenModalView(true)
    setRowSelected(row)
  }

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
  // const paramForSearch: ParamApiSearchI = {
  //   queryPageIndex: pagination.pageIndex,
  //   queryPageSize: pagination.pageSize,
  //   querySortBy: sorting,
  //   queryColumnFilterFns: columnFilterFns,
  //   queryColumnFilters: columnFilters
  // }

  // react-query
  const paramForSearch: ParamApiSearchSctForProductI = {
    SearchFilters: [
      {
        id: 'SCT_REVISION_CODE',
        value: getValues('searchFilters.sctRevisionCode') || ''
      },
      {
        id: 'FISCAL_YEAR',
        value: getValues('searchFilters.fiscalYear') || ''
      },
      {
        id: 'SCT_PATTERN_ID',
        value: getValues('searchFilters.sctPattern')?.SCT_PATTERN_ID || ''
      },
      {
        id: 'ITEM_CATEGORY_ID',
        value: getValues('searchFilters.itemCategory')?.ITEM_CATEGORY_ID || ''
      },
      {
        id: 'PRODUCT_CATEGORY_ID',
        value: getValues('searchFilters.productCategory')?.PRODUCT_CATEGORY_ID || ''
      },
      {
        id: 'PRODUCT_MAIN_ID',
        value: getValues('searchFilters.productMain')?.PRODUCT_MAIN_ID || ''
      },
      {
        id: 'PRODUCT_SUB_ID',
        value: getValues('searchFilters.productSub')?.PRODUCT_SUB_ID || ''
      },
      {
        id: 'PRODUCT_TYPE_ID',
        value: getValues('searchFilters.productType')?.PRODUCT_TYPE_ID || ''
      },
      {
        id: 'SCT_REASON_SETTING_ID',
        value: getValues('searchFilters.sctReasonSetting')?.SCT_REASON_SETTING_ID || ''
      },
      {
        id: 'SCT_TAG_SETTING_ID',
        value: getValues('searchFilters.sctTagSetting')?.SCT_TAG_SETTING_ID || ''
      },
      {
        id: 'SCT_STATUS_PROGRESS_ID',
        value: getValues('searchFilters.sctStatusProgress')?.SCT_STATUS_PROGRESS_ID || ''
      }
      // {
      //   id: 'CRATE_BY',
      //   value: getValues('searchFilters.crateBy') || ''
      // },
      // {
      //   id: 'CRATE_DATE',
      //   value: getValues('searchFilters.crateDate') || ''
      // },
      // {
      //   id: 'UPDATE_BY',
      //   value: getValues('searchFilters.updateBy') || ''
      // },
      // {
      //   id: 'UPDATE_DATE',
      //   value: getValues('searchFilters.updateDate') || ''
      // }
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

  const { isRefetching, isLoading, data, isError, refetch, isFetching } = useSearch(paramForSearch, isEnableFetching)

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

  const columns = useMemo<MRT_ColumnDef<StandardCostForProductI>[]>(
    () => [
      {
        accessorKey: 'SCT_STATUS_PROGRESS_NAME',
        header: 'Current PROGRESS',
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
        accessorKey: 'FISCAL_YEAR',
        header: 'FISCAL YEAR',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'SCT_REVISION_CODE',
        header: 'SCT REVISION CODE',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
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
        filterFn: 'contains',
        size: 500
      },
      {
        accessorKey: 'ITEM_CATEGORY_NAME',
        header: 'ITEM CATEGORY',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'SCT_REASON_SETTING_NAME',
        header: 'SCT REASON',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'SCT_TAG_SETTING_NAME',
        header: 'SCT TAG',
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
        accessorKey: 'FLOW_CODE',
        header: 'FLOW CODE',

        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'SCT_PATTERN_NAME',
        header: 'SCT PATTERN NAME',

        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      }
    ],
    [settings.mode]
  )

  // const table = useMaterialReactTable({
  //   columns,
  //   data: data?.data.ResultOnDb || [],
  //   manualFiltering: true,
  //   manualPagination: true,
  //   manualSorting: true,
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
  //     showAlertBanner: isError || data?.data.Status === false,
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
  //       header: 'Actions',
  //       size: 100,
  //       grow: false,
  //       muiTableHeadCellProps: {
  //         align: 'center'
  //       }
  //     },
  //     'mrt-row-select': {
  //       enableColumnActions: true,
  //       enableHiding: true,
  //       size: 100,
  //       muiTableHeadCellProps: {
  //         align: 'center'
  //       },
  //       muiTableBodyCellProps: {
  //         align: 'center'
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
  //     <Box sx={{ display: 'flex', gap: '1rem', p: '4px' }}>
  //       <div className='flex items-center gap-2'>
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
  //           <Badge badgeContent={columnFilters.filter(v => v.value.length !== 0).length ?? 0} color='primary'>
  //             <FilterListIcon />
  //           </Badge>
  //         </IconButton>
  //       </Tooltip>
  //       <Tooltip arrow title='Refresh Data' onClick={() => refetch()}>
  //         <IconButton>
  //           <RefreshIcon />
  //         </IconButton>
  //       </Tooltip>
  //     </Box>
  //   ),
  //   renderBottomToolbar: ({ table }) => (
  //     <div className='flex items-center justify-end gap-2 p-3'>
  //       <div className='flex items-center gap-2'>
  //         <Typography variant='body1'>
  //           Showing {pagination.pageIndex * pagination.pageSize + 1} to{' '}
  //           {pagination.pageIndex * pagination.pageSize + (data?.data?.ResultOnDb?.length || 0)} of{' '}
  //           {table.getRowCount()} entries
  //         </Typography>
  //         {/* <MRT_TablePagination table={table} showRowsPerPage={false} /> */}

  //         <Pagination
  //           count={table.getPageOptions().length}
  //           page={table.getState().pagination.pageIndex + 1}
  //           onChange={(_event, value: number) => table.setPageIndex(value - 1)}
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
  //       {row?.original?.INUSE_RAW_DATA === 0 ? null : (
  //         <ActionsMenu
  //           row={row}
  //           setOpenModalEdit={setOpenModalEdit}
  //           rowSelected={rowSelected}
  //           setRowSelected={setRowSelected}
  //           setOpenModalDelete={setOpenModalDelete}
  //         />
  //       )}
  //     </div>
  //   ),
  //   initialState: { showColumnFilters: columnFilters.filter(cf => cf?.value?.length !== 0)?.length > 0 ? true : false },
  //   muiToolbarAlertBannerProps:
  //     isError || data?.data.Status === false
  //       ? {
  //           color: 'error',
  //           children: 'Error loading data => ' + (data?.data?.Message || '')
  //         }
  //       : undefined,

  //   muiTableHeadCellProps: {
  //     sx: {
  //       fontWeight: 600,
  //       textTransform: 'uppercase',

  //       backgroundColor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.25)'
  //     }
  //   },
  //   muiTableBodyProps: {
  //     sx: {
  //       '& tr:nth-of-type(odd) > td': {
  //         backgroundColor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.055)'
  //       }
  //     }
  //   },
  //   muiTopToolbarProps: {
  //     sx: {
  //       backgroundColor: 'var(--mui-palette-background-default)'
  //     }
  //   },
  //   muiTableBodyCellProps: {
  //     sx: theme => ({
  //       backgroundColor: 'var(--mui-palette-background-default)',
  //       fontSize: 15
  //     })
  //   },
  //   muiTablePaperProps: ({ table }) => ({
  //     elevation: 0,
  //     style: {
  //       zIndex: table.getState().isFullScreen ? 2000 : undefined
  //     },
  //     sx: {
  //       borderRadius: '0'
  //     }
  //   }),
  //   muiTableHeadProps: {
  //     sx: {
  //       '& .MuiInputAdornment-positionEnd': {
  //         cursor: 'pointer'
  //       },
  //       '& .MuiInput-root .tabler-chevron-down': {
  //         display: 'none'
  //       }
  //     }
  //   },
  //   muiFilterDatePickerProps: {
  //     format: 'D-MMM-YYYY'
  //   },
  //   renderColumnFilterModeMenuItems: ({ internalFilterOptions, onSelectFilterMode }): ReactNode[] => {
  //     return internalFilterOptions.map((option: MRT_InternalFilterOption) => (
  //       <MenuItem key={option.label} className='w-full gap-3' onClick={() => onSelectFilterMode(option.option)}>
  //         <div className='text-sm'>{option.symbol}</div>
  //         <div className='text-sm'>{option.label}</div>
  //       </MenuItem>
  //     ))
  //   }
  // })

  const checkPermission = useCheckPermission()

  return (
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
                  handleClickOpenModalAdd()
                }
              }}
            >
              Add New
            </Button>
            {openModalAdd ? (
              <StandardCostFormModal
                openModalAdd={openModalAdd}
                setOpenModalAdd={setOpenModalAdd}
                setIsEnableFetchingMainTable={setIsEnableFetching}
              />
            ) : null}
          </>
        }
      />

      {openModalEdit ? (
        <SctForProductEditModal
          isOpenModal={openModalEdit}
          setIsOpenModal={setOpenModalEdit}
          rowSelected={rowSelected}
          setIsEnableFetching={setIsEnableFetching}
          mode='edit'
        />
      ) : null}
      {/* {openModalDelete ? (
          <StandardCostForProductDeleteModal
            openModalDelete={openModalDelete}
            setOpenModalDelete={setOpenModalDelete}
            rowSelected={rowSelected}
            setIsEnableFetching={setIsEnableFetching}
          />
        ) : null} */}
      {openModalView ? (
        <SctForProductEditModal
          isOpenModal={openModalView}
          setIsOpenModal={setOpenModalView}
          rowSelected={rowSelected}
          setRowSelected={setRowSelected}
          mode='view'
        />
      ) : null}
      {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
        <MaterialReactTable table={table} />
      </LocalizationProvider> */}

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
              MENU_ID={MENU_ID}
            />
          )}
        />
      </LocalizationProvider>
    </Card>
  )
}

export default StandardCostForProductTableData
