import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react'
import { useUpdateEffect } from 'react-use'

import { Button, Card, CardHeader } from '@mui/material'

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import {
  MRT_ColumnDef,
  MRT_ColumnFilterFnsState,
  MRT_ColumnFiltersState,
  MRT_ColumnOrderState,
  MRT_ColumnPinningState,
  MRT_DensityState,
  MRT_PaginationState,
  MRT_SortingState,
  MRT_VisibilityState
} from 'material-react-table'

import { useFormContext, UseFormReturn } from 'react-hook-form'

import { ParamApiSearchResultTableI } from '@/libs/material-react-table/types/SearchResultTable'

// import { useSearch as useSearchDirectCostCondition } from '@/_workspace/react-query/hooks/useDirectCostCondition'

import { is_Null_Undefined_Blank } from '@/utils/formatting-checking-value/checkingValueTypes'

// Types Imports

import { useSearchSctCodeForSelection } from '@/_workspace/react-query/hooks/useStandardCostData'

import { StandardCostI } from '@/_workspace/types/sct/StandardCostType'
import { DxMRTTable } from '@/_template/DxMRTTable'
import { FormDataPage } from './dataValidation'
import { FormDataPage as FormDataPageParent } from '../../dataValidation'

// import { DirectCostConditionI } from '@/_workspace/types/cost-condition/DirectCostCondition'

interface ParamApiSearchI extends ParamApiSearchResultTableI {
  FISCAL_YEAR: number | string
  PRODUCT_CATEGORY_ID: number | string
  PRODUCT_MAIN_ID: number | string
  PRODUCT_SUB_ID: number | string
  PRODUCT_TYPE_ID: number | string
  SCT_PATTERN_ID: number | string
  BOM_ID: number | string
}

export interface ReturnApiSearchDirectCostConditionI {
  FISCAL_YEAR: number | string
  PRODUCT_CATEGORY_ID: number | string
  PRODUCT_MAIN_ID: number | string
  PRODUCT_SUB_ID: number | string
  PRODUCT_TYPE_ID: number | string
  SCT_PATTERN_ID: number | string
  BOM_ID: number | string
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
  FISCAL_YEAR,
  PRODUCT_CATEGORY_ID,
  PRODUCT_MAIN_ID,
  PRODUCT_SUB_ID,
  PRODUCT_TYPE_ID,
  SCT_PATTERN_ID,
  BOM_ID
}: ParamApiSearchI): ReturnApiSearchDirectCostConditionI => {
  const columnFilterQuery = queryColumnFilters.map(item => ({
    columnFns: queryColumnFilterFns[item.id],
    column: item.id.replaceAll('MODIFIED_DATE', 'UPDATE_DATE').replaceAll('inuseForSearch', 'INUSE'),
    value: item.value
  }))

  const params = {
    FISCAL_YEAR: is_Null_Undefined_Blank(FISCAL_YEAR) ? '' : Number(FISCAL_YEAR),
    PRODUCT_CATEGORY_ID: is_Null_Undefined_Blank(PRODUCT_CATEGORY_ID) ? '' : Number(PRODUCT_CATEGORY_ID),
    PRODUCT_MAIN_ID: is_Null_Undefined_Blank(PRODUCT_MAIN_ID) ? '' : Number(PRODUCT_MAIN_ID),
    PRODUCT_SUB_ID: is_Null_Undefined_Blank(PRODUCT_SUB_ID) ? '' : Number(PRODUCT_SUB_ID),
    PRODUCT_TYPE_ID: is_Null_Undefined_Blank(PRODUCT_TYPE_ID) ? '' : Number(PRODUCT_TYPE_ID),
    SCT_PATTERN_ID: is_Null_Undefined_Blank(SCT_PATTERN_ID) ? '' : Number(SCT_PATTERN_ID),
    BOM_ID: is_Null_Undefined_Blank(BOM_ID) ? '' : BOM_ID,
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
  setIsOpenSctDataModal: Dispatch<SetStateAction<boolean>>
  RHF_parent: UseFormReturn<FormDataPageParent>
  rowData: ProductTypeI
}

const SctDataModalTableData = ({
  isEnableFetching,
  setIsEnableFetching,
  setIsOpenSctDataModal,
  RHF_parent,
  rowData
}: Props) => {
  const { setValue, getValues } = useFormContext<FormDataPage>()

  const { setValue: setValueParent, getValues: getValuesParent } = RHF_parent

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: getValues('searchResults.pageSize') || 10
  })
  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>(
    getValues('searchResults.columnVisibility')
  )
  const [columnOrder, setColumnOrder] = useState<MRT_ColumnOrderState>(getValues('searchResults.columnOrder') || [])
  const [columnPinning, setColumnPinning] = useState<MRT_ColumnPinningState>(
    getValues('searchResults.columnPinning') || {}
  )
  const [density, setDensity] = useState<MRT_DensityState>(getValues('searchResults.density'))
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    getValues('searchResults.columnFilters') || []
  )
  const [sorting, setSorting] = useState<MRT_SortingState>(getValues('searchResults.sorting'))
  const [columnFilterFns, setColumnFilterFns] = useState<MRT_ColumnFilterFnsState>(
    getValues('searchResults.columnFilterFns')
  )

  const paramForSearch: ParamApiSearchI = {
    queryPageIndex: pagination.pageIndex,
    queryPageSize: pagination.pageSize,
    querySortBy: sorting,
    queryColumnFilterFns: columnFilterFns,
    queryColumnFilters: columnFilters,
    FISCAL_YEAR: getValues('searchFilters.FISCAL_YEAR')?.value ?? '',
    PRODUCT_CATEGORY_ID: getValues('searchFilters.PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID ?? '',
    PRODUCT_MAIN_ID: getValues('searchFilters.PRODUCT_MAIN')?.PRODUCT_MAIN_ID ?? '',
    PRODUCT_SUB_ID: getValues('searchFilters.PRODUCT_SUB')?.PRODUCT_SUB_ID ?? '',
    PRODUCT_TYPE_ID: getValues('searchFilters.PRODUCT_TYPE')?.PRODUCT_TYPE_ID ?? '',
    SCT_PATTERN_ID: getValues('searchFilters.SCT_PATTERN_NO')?.SCT_PATTERN_ID ?? '',
    BOM_ID: getValues('searchFilters.BOM')?.BOM_ID ?? ''
  }

  const { isRefetching, isLoading, data, isError, isFetching } = useSearchSctCodeForSelection(
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

  const columns = useMemo<MRT_ColumnDef<StandardCostI>[]>(
    () => [
      {
        accessorKey: 'SCT_REVISION_CODE',
        header: 'SCT Revision Code',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'SCT_STATUS_PROGRESS_NAME',
        header: 'SCT STATUS PROGRESS NAME',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'FISCAL_YEAR',
        header: 'FISCAL YEAR',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 200
      },
      {
        accessorKey: 'SCT_PATTERN_NAME',
        header: 'SCT PATTERN NAME',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 200
      },
      {
        accessorKey: 'BOM_CODE',
        header: 'BOM CODE',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 200
      },
      {
        accessorKey: 'BOM_NAME',
        header: 'BOM NAME',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 400
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
        accessorKey: 'PRODUCT_TYPE_CODE_FOR_SCT',
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
        filterFn: 'contains',
        size: 500
      }
    ],
    []
  )

  // const { setValue: setValueMain, getValues: getValuesMain } = useFormContext()

  // const table = useMaterialReactTable({
  //   columns: columns,
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
  //     // isLoading,
  //     pagination,
  //     // showAlertBanner: isError || data?.data.Status === false,
  //     // showProgressBars: isRefetching,
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
  //       <Tooltip
  //         arrow
  //         title='Refresh Data'
  //         // onClick={() => refetch()}
  //       >
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
  //     <div
  //       className='flex items-center cursor-pointer'
  //       onClick={() => {
  //         if (masterDataType === 'MATERIAL_PRICE') {
  //           setValue('MATERIAL_PRICE', row?.original)
  //           setValueMain('MATERIAL_PRICE', row?.original)

  //           StandardCostForProductServices.getMaterialPriceData({
  //             RESOURCE_OPTION_ID: getValuesMain('MATERIAL_PRICE_RESOURCE_OPTION_ID'),
  //             SCT_ID: row?.original.SCT_ID,
  //             PRODUCT_TYPE_ID: getValuesMain('PRODUCT_TYPE.PRODUCT_TYPE_ID')
  //           }).then(res => {
  //             setValueMain('MATERIAL_PRICE_DATA', res.data.ResultOnDb)
  //           })
  //         } else if (masterDataType === 'YR_GR_FROM_ENGINEER') {
  //           setValue('YR_GR_FROM_ENGINEER', row?.original)
  //           setValueMain('YR_GR_FROM_ENGINEER', row?.original)

  //           StandardCostForProductServices.getYrGrData({
  //             RESOURCE_OPTION_ID: getValuesMain('YR_GR_FROM_ENGINEER_RESOURCE_OPTION_ID'),
  //             SCT_ID: row?.original.SCT_ID,
  //             PRODUCT_TYPE_ID: getValuesMain('PRODUCT_TYPE.PRODUCT_TYPE_ID')
  //           }).then(res => {
  //             setValueMain('YR_GR', res.data.ResultOnDb[0])
  //             setValueMain('YR_GR_TOTAL', res.data.ResultOnDb[1]?.[0] ?? null)
  //           })
  //         } else if (masterDataType === 'TIME_FROM_MFG') {
  //           setValue('TIME_FROM_MFG', row?.original)
  //           setValueMain('TIME_FROM_MFG', row?.original)

  //           StandardCostForProductServices.getTimeData({
  //             RESOURCE_OPTION_ID: getValuesMain('TIME_FROM_MFG_RESOURCE_OPTION_ID'),
  //             SCT_ID: row?.original.SCT_ID,
  //             PRODUCT_TYPE_ID: getValuesMain('PRODUCT_TYPE.PRODUCT_TYPE_ID')
  //           }).then(res => {
  //             setValueMain('CLEAR_TIME', res.data.ResultOnDb[0])
  //             setValueMain('CLEAR_TIME_TOTAL', res.data.ResultOnDb[1]?.[0] ?? null)
  //           })
  //         } else if (masterDataType === 'YR_ACCUMULATION_MATERIAL_FROM_ENGINEER') {
  //           setValue('YR_ACCUMULATION_MATERIAL_FROM_ENGINEER', row?.original)
  //           setValueMain('YR_ACCUMULATION_MATERIAL_FROM_ENGINEER', row?.original)
  //         } else if (masterDataType === 'COST_CONDITION') {
  //           setValue('COST_CONDITION', row?.original)
  //           setValueMain('COST_CONDITION', row?.original)

  //           StandardCostForProductServices.getCostConditionData({
  //             RESOURCE_OPTION_ID: getValuesMain('COST_CONDITION_RESOURCE_OPTION_ID'),
  //             SCT_ID: row?.original.SCT_ID,
  //             PRODUCT_TYPE_ID: getValuesMain('PRODUCT_TYPE.PRODUCT_TYPE_ID'),
  //             PRODUCT_MAIN_ID: getValuesMain('PRODUCT_MAIN.PRODUCT_MAIN_ID')
  //           }).then(res => {
  //             setValueMain('DIRECT_COST_CONDITION', res.data.ResultOnDb[0]?.[0] ?? null)
  //             setValueMain('INDIRECT_COST_CONDITION', res.data.ResultOnDb[1]?.[0] ?? null)
  //             setValueMain('OTHER_COST_CONDITION', res.data.ResultOnDb[2]?.[0] ?? null)
  //             setValueMain('SPECIAL_COST_CONDITION', res.data.ResultOnDb[3]?.[0] ?? null)
  //           })
  //         }

  //         if (isCopyAndEdit) {
  //           fetchBomDetailsByBomId(row.original?.BOM_ID).then(res => {
  //             setValueMain('BOM_ID', row.original?.BOM_ID)
  //             setValueMain('BOM_CODE_ACTUAL', res.bomCode)
  //             setValueMain('BOM_CODE', res.bomCode)
  //             setValueMain('BOM_NAME_ACTUAL', res.bomName)
  //             setValueMain('BOM_NAME', res.bomName)
  //             setValueMain('FLOW_PROCESS', res.PROCESS)
  //             setValueMain('MATERIAL_IN_PROCESS', res.ITEM)
  //             setValueMain(
  //               'MATERIAL_IN_PROCESS_ID',
  //               Object.keys(res.ITEM).map(key => {
  //                 return {
  //                   id: key
  //                 }
  //               })
  //             )
  //           })

  //           //! SetValue FLOW_PROCESS & Material on Process
  //         }

  //         if (masterDataType.startsWith('SCT_SWITCH.SCT_SELECT.DATA')) {
  //           setValueMain(masterDataType, row?.original)
  //         }

  //         setIsOpenSctDataModal(false)
  //       }}
  //     >
  //       <svg
  //         xmlns='http://www.w3.org/2000/svg'
  //         width='24'
  //         height='24'
  //         viewBox='0 0 24 24'
  //         fill='none'
  //         stroke='currentColor'
  //         stroke-width='2'
  //         stroke-linecap='round'
  //         stroke-linejoin='round'
  //         class='icon icon-tabler icons-tabler-outline icon-tabler-checkbox'
  //       >
  //         <path stroke='none' d='M0 0h24v24H0z' fill='none' />
  //         <path d='M9 11l3 3l8 -8' />
  //         <path d='M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9' />
  //       </svg>
  //     </div>
  //   ),
  //   initialState: { showColumnFilters: columnFilters.filter(cf => cf?.value?.length !== 0)?.length > 0 ? true : false },
  //   muiToolbarAlertBannerProps:
  //     // isError ||
  //     data?.data.Status === false
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

  return (
    <Card style={{ border: '1px solid var(--mui-palette-customColors-inputBorder)' }}>
      <CardHeader title='Search result' action={<></>} />
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
          displayColumnDefOptions={{
            'mrt-row-actions': {
              header: 'Selection',
              size: 150,
              // grow: false,
              muiTableHeadCellProps: {
                align: 'center'
              },
              muiTableBodyCellProps: {
                align: 'center'
              }
            }
          }}
          renderRowActions={({ row }) => (
            <>
              <Button
                variant='outlined'
                color='success'
                size='small'
                startIcon={<i className='tabler-check' />}
                onClick={() => {
                  const currentValue = getValuesParent(`productType.body.${row.original.PRODUCT_TYPE_CODE_FOR_SCT}`)

                  setValueParent(
                    `productType.body.${row.original.PRODUCT_TYPE_CODE_FOR_SCT}`,
                    {
                      ...currentValue,
                      sctCreateFrom: 'SCT Selection',
                      sctSelectId: row.original.SCT_ID,
                      bomCode: row.original.BOM_CODE,
                      bomId: row.original.BOM_ID,
                      bomName: row.original.BOM_NAME,
                      sctRevisionCode: row.original.SCT_REVISION_CODE,
                      sctSelectStatusProgress: {
                        SCT_STATUS_PROGRESS_NAME: row.original.SCT_STATUS_PROGRESS_NAME,
                        SCT_STATUS_PROGRESS_ID: row.original.SCT_STATUS_PROGRESS_ID
                      },
                      sctSelectFiscalYear: {
                        label: row.original.FISCAL_YEAR.toString(),
                        value: Number(row.original.FISCAL_YEAR)
                      },
                      sctSelectPattern: {
                        SCT_PATTERN_ID: row.original.SCT_PATTERN_ID,
                        SCT_PATTERN_NAME: row.original.SCT_PATTERN_NAME
                      }
                    },
                    { shouldValidate: true, shouldDirty: true }
                  )
                  setIsOpenSctDataModal(false)
                }}
              >
                Select
              </Button>
            </>
          )}
        />
      </LocalizationProvider>
    </Card>
  )
}

export default SctDataModalTableData
