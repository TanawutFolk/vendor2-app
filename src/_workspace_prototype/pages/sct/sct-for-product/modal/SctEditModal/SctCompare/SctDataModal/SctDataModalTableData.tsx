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
import RefreshIcon from '@mui/icons-material/Refresh'

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
  MRT_ShowHideColumnsButton,
  MRT_SortingState,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MRT_VisibilityState,
  useMaterialReactTable
} from 'material-react-table'

import { Controller, useFormContext, UseFormGetValues, UseFormSetValue } from 'react-hook-form'

import { ParamApiSearchResultTableI } from '@/libs/material-react-table/types/SearchResultTable'

// import { useSearch as useSearchDirectCostCondition } from '@/_workspace/react-query/hooks/useDirectCostCondition'

import { formatNumber, is_Null_Undefined_Blank } from '@/utils/formatting-checking-value/checkingValueTypes'

// Types Imports

import { useSearch } from '@/_workspace/react-query/hooks/useStandardCostForProduct'

import { StandardCostI } from '@/_workspace/types/sct/StandardCostType'
import { twMerge } from 'tailwind-merge'

import { useSettings } from '@/@core/hooks/useSettings'
import { fetchSctStatusProgressNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchSctStatusProgress'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import { statusColor } from '@/_workspace/pages/sct/sct-for-product/SearchResult'
import { FormDataPage } from './validationSchema'
import { FormDataPage as FormDataPageParent } from '../../validationSchema'
import { DxMRTTable } from '@/_template/DxMRTTable'

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

interface Props {
  isEnableFetching: boolean
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
  setIsOpenSctDataModal: Dispatch<SetStateAction<boolean>>
  originalName: string
  setValueFormParent: UseFormSetValue<FormDataPageParent>
  getValueFormParent: UseFormGetValues<FormDataPageParent>
  sctCompareNo: number
}

const SctDataModalTableData = ({
  isEnableFetching,
  setIsEnableFetching,
  originalName,
  setIsOpenSctDataModal,
  setValueFormParent,
  getValueFormParent,
  sctCompareNo
}: Props) => {
  const { getValues, control, setValue } = useFormContext<FormDataPage>()
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

  // const paramForSearch: ParamApiSearchI = {
  //   queryPageIndex: pagination.pageIndex,
  //   queryPageSize: pagination.pageSize,
  //   querySortBy: sorting,
  //   queryColumnFilterFns: columnFilterFns,
  //   queryColumnFilters: columnFilters,
  //   FISCAL_YEAR: getValues('searchFilters.FISCAL_YEAR')?.value ?? '',
  //   PRODUCT_CATEGORY_ID: getValues('searchFilters.PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID ?? '',
  //   PRODUCT_MAIN_ID: getValues('searchFilters.PRODUCT_MAIN')?.PRODUCT_MAIN_ID ?? '',
  //   PRODUCT_SUB_ID: getValues('searchFilters.PRODUCT_SUB')?.PRODUCT_SUB_ID ?? '',
  //   PRODUCT_TYPE_ID: getValues('searchFilters.PRODUCT_TYPE')?.PRODUCT_TYPE_ID ?? '',
  //   SCT_PATTERN_ID: getValues('searchFilters.SCT_PATTERN_NO')?.SCT_PATTERN_ID ?? '',
  //   BOM_ID: getValues('searchFilters.BOM')?.BOM_ID ?? ''
  // }

  // const { isRefetching, isLoading, data, isError, refetch, isFetching } = useSearchSctCodeForSelection(
  //   getUrlParamSearch(paramForSearch),
  //   isEnableFetching
  // )

  const paramForSearch = {
    SearchFilters: [
      {
        id: 'SCT_REVISION_CODE',
        value: ''
      },
      {
        id: 'sctLatestRevisionOption',
        value: ''
      },
      {
        id: 'FISCAL_YEAR',
        value: getValues('searchFilters.FISCAL_YEAR')?.value ?? ''
      },
      {
        id: 'SCT_PATTERN_ID',
        value: getValues('searchFilters.SCT_PATTERN_NO')?.SCT_PATTERN_ID ?? ''
      },
      {
        id: 'ITEM_CATEGORY_ID',
        value: ''
      },
      {
        id: 'PRODUCT_CATEGORY_ID',
        value: getValues('searchFilters.PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID ?? ''
      },
      {
        id: 'PRODUCT_MAIN_ID',
        value: getValues('searchFilters.PRODUCT_MAIN')?.PRODUCT_MAIN_ID ?? ''
      },
      {
        id: 'PRODUCT_SUB_ID',
        value: getValues('searchFilters.PRODUCT_SUB')?.PRODUCT_SUB_ID ?? ''
      },
      {
        id: 'PRODUCT_TYPE_ID',
        value: getValues('searchFilters.PRODUCT_TYPE')?.PRODUCT_TYPE_ID ?? ''
      },
      {
        id: 'CUSTOMER_INVOICE_TO_ID',
        value: ''
      },
      {
        id: 'SCT_REASON_SETTING_ID',
        value: ''
      },
      {
        id: 'SCT_TAG_SETTING_ID',
        value: ''
      },
      {
        id: 'SCT_STATUS_PROGRESS_ID',
        value: ''
      },
      {
        id: 'includingCancelled',
        value: true
      },
      {
        id: 'alreadyHaveSellingPrice',
        value: ''
      },
      {
        id: 'BOM_ID',
        value: getValues('searchFilters.BOM')?.BOM_ID ?? ''
      }
      // {
      //   id: 'FLOW_ID',
      //   value: getValues('searchFilters.FLOW')?.FLOW_ID ?? '',
      // },
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

  const { settings } = useSettings()

  const columns = useMemo<MRT_ColumnDef<StandardCostI>[]>(
    () => [
      {
        accessorKey: 'PRODUCT_TYPE_CODE',
        header: 'PRODUCT TYPE CODE',
        filterVariant: 'text',
        filterFn: 'contains',
        size: 230
      },
      {
        accessorKey: 'SCT_REVISION_CODE',
        header: 'SCT Revision Code',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },

      {
        accessorKey: 'FISCAL_YEAR',
        header: 'FISCAL YEAR',
        filterVariant: 'text',
        filterFn: 'contains',
        size: 180,

        muiTableBodyCellProps: {
          align: 'right'
        }
      },
      {
        accessorKey: 'SCT_PATTERN_NAME',
        header: 'SCT PATTERN NAME',
        filterVariant: 'text',
        filterFn: 'contains',
        size: 220
      },
      {
        accessorKey: 'SCT_STATUS_PROGRESS_NAME',
        header: 'CURRENT PROGRESS',
        size: 230,
        Cell({ cell }) {
          let statusValue = statusColor[cell.getValue()]
          if (!statusValue || Object.keys(statusValue).length === 0) {
            return null
          }
          let classNames = twMerge(statusValue.text, statusValue.bg)
          if ((cell.getValue() === 'Checking' || cell.getValue() === 'Waiting Approve') && settings.mode === 'dark') {
            classNames = twMerge(statusValue.darkText, statusValue.darkBg)
          }
          return (
            <Chip
              label={String(cell.getValue())}
              className={classNames}
              variant='tonal'
              sx={{
                color: settings.mode === 'light' ? 'var(--mui-palette-text-primary)' : 'undefined'
              }}
            />
          )
        }
      },
      {
        accessorKey: 'SELLING_PRICE',
        header: 'Selling Price (Baht)',
        filterVariant: 'text',
        filterFn: 'contains',
        Cell: ({ cell }) => formatNumber(cell.getValue() as number),
        size: 250,

        muiTableBodyCellProps: {
          align: 'right'
        }
      },

      {
        accessorKey: 'ADJUST_PRICE',
        header: 'ADJUST PRICE (Baht)',
        filterVariant: 'text',
        filterFn: 'contains',
        Cell: ({ cell }) => formatNumber(cell.getValue() as number),
        size: 230,

        muiTableBodyCellProps: {
          align: 'right'
        }
      },
      {
        accessorKey: 'TOTAL_INDIRECT_COST',
        header: 'INDIRECT COST',
        filterVariant: 'text',
        filterFn: 'contains',
        size: 200,
        Cell: ({ cell }) => {
          const numberValue = parseFloat(cell.getValue() as string)
          if (isNaN(numberValue)) return ''
          return Number(numberValue.toFixed(3)).toLocaleString()
        },

        muiTableBodyCellProps: {
          align: 'right'
        }
      },
      {
        accessorKey: 'INDIRECT_COST_MODE',
        header: 'INDIRECT COST (MODE)',
        filterVariant: 'text',
        filterFn: 'contains',
        size: 250
      },
      { accessorKey: 'BOM_CODE', header: 'BOM CODE', filterVariant: 'text', filterFn: 'contains', size: 200 },
      { accessorKey: 'FLOW_CODE', header: 'FLOW CODE', filterVariant: 'text', filterFn: 'contains', size: 200 },
      {
        accessorKey: 'RE_CAL_UPDATE_DATE',
        header: 'RE-CAL UPDATE DATE',
        filterVariant: 'text',
        filterFn: 'contains',
        size: 250
      },
      {
        accessorKey: 'RE_CAL_UPDATE_BY',
        header: 'RE-CAL UPDATE BY',
        filterVariant: 'text',
        filterFn: 'contains',
        size: 250
      },
      {
        accessorKey: 'SCT_REASON_SETTING_NAME',
        header: 'SCT REASON',
        filterVariant: 'text',
        filterFn: 'contains',
        size: 210
      },
      {
        accessorKey: 'SCT_TAG_SETTING_NAME',
        header: 'SCT TAG',
        filterVariant: 'text',
        filterFn: 'contains',
        size: 210
      },
      {
        accessorKey: 'ESTIMATE_PERIOD_START_DATE',
        header: 'ESTIMATE PERIOD START DATE',
        filterVariant: 'date',
        filterFn: 'equals'
      },
      {
        accessorKey: 'ESTIMATE_PERIOD_END_DATE',
        header: 'ESTIMATE PERIOD END DATE',
        filterVariant: 'date',
        filterFn: 'equals'
      },
      {
        accessorKey: 'CUSTOMER_INVOICE_TO_ALPHABET',
        header: 'CUSTOMER INVOICE TO ALPHABET',
        filterVariant: 'text',
        filterFn: 'contains',
        size: 350
      },
      {
        accessorKey: 'CUSTOMER_INVOICE_TO_NAME',
        header: 'CUSTOMER INVOICE TO NAME',
        filterVariant: 'text',
        filterFn: 'contains'
      },
      {
        accessorKey: 'PRODUCT_CATEGORY_NAME',
        header: 'PRODUCT CATEGORY NAME',
        filterVariant: 'text',
        filterFn: 'contains'
      },
      { accessorKey: 'PRODUCT_MAIN_NAME', header: 'PRODUCT MAIN NAME', filterVariant: 'text', filterFn: 'contains' },
      { accessorKey: 'PRODUCT_SUB_NAME', header: 'PRODUCT SUB NAME', filterVariant: 'text', filterFn: 'contains' },
      { accessorKey: 'PRODUCT_TYPE_NAME', header: 'PRODUCT TYPE NAME', filterVariant: 'text', filterFn: 'contains' },
      { accessorKey: 'ITEM_CATEGORY_NAME', header: 'ITEM CATEGORY', filterVariant: 'text', filterFn: 'contains' },
      {
        accessorKey: 'ASSEMBLY_GROUP_FOR_SUPPORT_MES',
        header: 'ASSEMBLY GROUP FOR SUPPORT MES',
        filterVariant: 'text',
        filterFn: 'contains',
        size: 350
      },
      { accessorKey: 'NOTE', header: 'NOTE', filterVariant: 'text', filterFn: 'contains' },
      { accessorKey: 'DESCRIPTION', header: 'DESCRIPTION', filterVariant: 'text', filterFn: 'contains' },
      { accessorKey: 'UPDATE_DATE', header: 'UPDATE DATE', filterVariant: 'date', filterFn: 'equals', size: 250 },
      { accessorKey: 'UPDATE_BY', header: 'UPDATE BY', filterVariant: 'text', filterFn: 'contains', size: 200 },
      {
        accessorKey: 'STATUS_UPDATE_DATE',
        header: 'STATUS UPDATE DATE',
        filterVariant: 'date',
        filterFn: 'equals',
        size: 250
      },
      {
        accessorKey: 'STATUS_UPDATE_BY',
        header: 'STATUS UPDATE BY',
        filterVariant: 'text',
        filterFn: 'contains',
        size: 230
      },
      { accessorKey: 'CREATE_DATE', header: 'CREATE DATE', filterVariant: 'date', filterFn: 'equals', size: 250 },
      { accessorKey: 'CREATE_BY', header: 'CREATE BY', filterVariant: 'text', filterFn: 'contains', size: 200 },
      {
        accessorKey: 'CANCEL_REASON',
        header: 'CANCEL REASON',
        filterVariant: 'text',
        filterFn: 'contains',
        size: 250
      }
    ],
    [originalName]
  )

  return (
    <Card style={{ border: '1px solid var(--mui-palette-customColors-inputBorder)' }}>
      <CardHeader title='Search result' action={<></>} />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {/* <MaterialReactTable table={table} /> */}
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
              size: 170,
              muiTableHeadCellProps: {
                align: 'center'
              },
              muiTableBodyCellProps: {
                align: 'center'
              }
            }
          }}
          renderRowActions={({ row }) => (
            <Button
              variant='outlined'
              color='success'
              startIcon={<i className='tabler-check' />}
              onClick={() => {
                // set SCT_COMPARE
                const currentData = getValueFormParent(originalName)

                setValueFormParent(originalName, {
                  ...currentData,
                  sctCompareNo: sctCompareNo,
                  SCT_ID: row.original.SCT_ID,
                  sctRevisionCode: row.original?.SCT_REVISION_CODE ?? '',
                  bom: {
                    BOM_ID: Number(row.original?.BOM_ID),
                    BOM_CODE: row.original?.BOM_CODE ?? '',
                    BOM_NAME: row.original?.BOM_NAME ?? '',
                    FLOW_ID: Number(row.original?.FLOW_ID),
                    FLOW_CODE: row.original?.FLOW_CODE ?? '',
                    FLOW_NAME: row.original?.FLOW_NAME ?? '',
                    TOTAL_COUNT_PROCESS: Number(row.original?.TOTAL_COUNT_PROCESS)
                  }
                })
                setIsOpenSctDataModal(false)
              }}
            >
              Select
            </Button>
          )}
        />
      </LocalizationProvider>
    </Card>
  )
}

export default SctDataModalTableData
