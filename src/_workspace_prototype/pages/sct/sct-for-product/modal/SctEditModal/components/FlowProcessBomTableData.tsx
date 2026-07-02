import { ReactNode, useEffect, useMemo, useState } from 'react'

import Switch from '@mui/material/Switch'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Pagination from '@mui/material/Pagination'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import CustomTextField from '@/components/mui/TextField'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import FilterListIcon from '@mui/icons-material/FilterList'
import RefreshIcon from '@mui/icons-material/Refresh'

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

import { useFormContext, useFormState } from 'react-hook-form'
import { Button } from '@mui/material'
import { formatNumber } from '@/utils/formatting-checking-value/checkingValueTypes'

const FlowProcessBomTableData = () => {
  const { getValues, watch, setValue, control } = useFormContext()

  const { errors } = useFormState({
    control
  })

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({})
  // const [columnOrder, setColumnOrder] = useState<MRT_ColumnOrderState>([])
  // const [columnPinning, setColumnPinning] = useState<MRT_ColumnPinningState>([])
  const [density, setDensity] = useState<MRT_DensityState>('compact')
  // const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])
  // const [sorting, setSorting] = useState<MRT_SortingState>([])
  // const [columnFilterFns, setColumnFilterFns] = useState<MRT_ColumnFilterFnsState>({})
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10
  })

  useEffect(() => {
    setColumnVisibility(() => {
      const isHasNo1 = getValues('SCT_COMPARE_NO_1')?.SCT_ID ? true : false
      const isHasNo2 = getValues('SCT_COMPARE_NO_2')?.SCT_ID ? true : false

      let No1Column = {}
      let No2Column = {}

      if (!isHasNo1) {
        No1Column = {
          COLLECTION_POINT_NO_1: false,
          YIELD_RATE_NO_1: false,
          DIFF_YIELD_RATE_NO_1: false,
          YIELD_ACCUMULATION_NO_1: false,
          DIFF_YIELD_ACCUMULATION_NO_1: false,
          GO_STRAIGHT_RATE_NO_1: false,
          DIFF_GO_STRAIGHT_RATE_NO_1: false,
          CLEAR_TIME_NO_1: false,
          DIFF_CLEAR_TIME_NO_1: false,
          ESSENTIAL_TIME_NO_1: false,
          DIFF_ESSENTIAL_TIME_NO_1: false,
          PROCESS_STANDARD_TIME_NO_1: false,
          DIFF_PROCESS_STANDARD_TIME_NO_1: false
        }
      }

      if (!isHasNo2) {
        No2Column = {
          COLLECTION_POINT_NO_2: false,
          YIELD_RATE_NO_2: false,
          DIFF_YIELD_RATE_NO_2: false,
          YIELD_ACCUMULATION_NO_2: false,
          DIFF_YIELD_ACCUMULATION_NO_2: false,
          GO_STRAIGHT_RATE_NO_2: false,
          DIFF_GO_STRAIGHT_RATE_NO_2: false,
          CLEAR_TIME_NO_2: false,
          DIFF_CLEAR_TIME_NO_2: false,
          ESSENTIAL_TIME_NO_2: false,
          DIFF_ESSENTIAL_TIME_NO_2: false,
          PROCESS_STANDARD_TIME_NO_2: false,
          DIFF_PROCESS_STANDARD_TIME_NO_2: false
        }
      }

      return {
        ...columnVisibility,
        ...No1Column,
        ...No2Column
      }
    })
  }, [watch('SCT_COMPARE_NO_1')?.SCT_ID, watch('SCT_COMPARE_NO_1')?.SCT_ID])

  const columns = useMemo<MRT_ColumnDef<FormData>[]>(
    () => [
      {
        accessorKey: 'PROCESS_NO',
        header: 'PROCESS NO',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 180
      },
      {
        accessorKey: 'PROCESS_SEQUENCE_CODE',
        header: 'PROCESS SEQUENCE CODE',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        Cell: ({ row }) => {
          const productTypeCode = getValues('PRODUCT_TYPE.PRODUCT_TYPE_CODE')
          const productMainAlphabet = getValues('PRODUCT_MAIN.PRODUCT_MAIN_ALPHABET')
          const runningNumber = row.original?.PROCESS_CODE.slice(-4)

          return `${productTypeCode}-${productMainAlphabet}-${runningNumber}`
        },
        size: 300
      },
      {
        accessorKey: 'PROCESS_NAME',
        header: 'PROCESS NAME',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'COLLECTION_POINT',
        header: 'COLLECTION POINT',
        size: 220,
        // enableColumnFilter: true,
        Cell: ({ row }) => {
          if (row.original?.OLD_SYSTEM_COLLECTION_POINT) {
            return (
              <>
                <Switch checked={row.original?.OLD_SYSTEM_COLLECTION_POINT ? true : false} disabled={true} />
              </>
            )
          }

          const yrGr = getValues('YR_GR') || []

          const rowValue = yrGr.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

          return (
            <>
              <Switch checked={rowValue?.COLLECTION_POINT_FOR_SCT ? true : false} disabled={true} />
            </>
          )
        }
      },
      {
        header: 'SCT Compare No.1',
        columns: [
          {
            accessorKey: 'COLLECTION_POINT_NO_1',
            header: 'COLLECTION POINT',
            // size: 250,
            // enableColumnFilter: true,
            Cell: ({ row }) => {
              const yrGr = getValues('YR_GR_NO_1') || []

              const rowValue = yrGr.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              return (
                <>
                  <Switch checked={rowValue?.COLLECTION_POINT_FOR_SCT ? true : false} disabled={true} />
                </>
              )
            }
          }
        ]
      },
      {
        header: 'SCT Compare No.2',
        columns: [
          {
            accessorKey: 'COLLECTION_POINT_NO_2',
            header: 'COLLECTION POINT',
            // size: 250,
            // enableColumnFilter: true,
            Cell: ({ row }) => {
              const yrGr = getValues('YR_GR_NO_2') || []

              const rowValue = yrGr.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              return (
                <>
                  <Switch checked={rowValue?.COLLECTION_POINT_FOR_SCT ? true : false} disabled={true} />
                </>
              )
            }
          }
        ]
      },
      {
        accessorKey: 'YIELD_RATE',
        header: 'YIELD RATE (%)',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 200,
        Cell: ({ row }) => {
          const yrGr = getValues('YR_GR') || []

          const rowValue = yrGr.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

          if (row.original?.YIELD_RATE) {
            // return <>{Number((row.original.YIELD_RATE * 100).toFixed(1))}%</>
            return formatNumber(row.original.YIELD_RATE * 100, 2, true, '%')
          }

          return (
            <>
              {/* {rowValue?.YIELD_RATE_FOR_SCT ? Math.round((rowValue.YIELD_RATE_FOR_SCT * 10000).toFixed(4)) / 10000 : ''} */}
              {formatNumber(rowValue?.YIELD_RATE_FOR_SCT, 2, true, '%')}
            </>
          )
          // return <>{rowValue?.YIELD_RATE_FOR_SCT ? Number(rowValue.YIELD_RATE_FOR_SCT).toFixed(4) : ''}</>
        }
      },
      {
        header: 'SCT Compare No.1',
        columns: [
          {
            accessorKey: 'YIELD_RATE_NO_1',
            header: 'YIELD RATE (%)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const yrGr = getValues('SCT_COMPARE_NO_1_DATA.flowProcess') || []

              const rowValue = yrGr.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              return <>{rowValue?.YIELD_RATE ? Number(rowValue.YIELD_RATE).toFixed(4) : '-'}</>
            }
          },
          {
            accessorKey: 'DIFF_YIELD_RATE_NO_1',
            header: 'DIFF YIELD RATE (%)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const yrGr = getValues('YR_GR') || []
              const yrGrValue = yrGr.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              const sctCompareNo1 = getValues('SCT_COMPARE_NO_1_DATA.flowProcess') || []
              const sctCompareNo1Value = sctCompareNo1.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              return (
                <>
                  {yrGrValue?.YIELD_RATE_FOR_SCT && sctCompareNo1Value?.YIELD_RATE
                    ? (Number(yrGrValue.YIELD_RATE_FOR_SCT) - Number(sctCompareNo1Value?.YIELD_RATE)).toFixed(4)
                    : '-'}
                </>
              )
            }
          }
        ]
      },
      {
        header: 'SCT Compare No.2',
        columns: [
          {
            accessorKey: 'YIELD_RATE_NO_2',
            header: 'YIELD RATE (%)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const yrGr = getValues('SCT_COMPARE_NO_2_DATA.flowProcess') || []

              const rowValue = yrGr.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              return <>{rowValue?.YIELD_RATE ? Number(rowValue.YIELD_RATE).toFixed(4) : '-'}</>
            }
          },
          {
            accessorKey: 'DIFF_YIELD_RATE_NO_2',
            header: 'DIFF YIELD RATE (%)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const yrGr = getValues('YR_GR') || []
              const yrGrValue = yrGr.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              const sctCompareNo2 = getValues('SCT_COMPARE_NO_2_DATA.flowProcess') || []
              const sctCompareNo2Value = sctCompareNo2.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              return (
                <>
                  {yrGrValue?.YIELD_RATE_FOR_SCT && sctCompareNo2Value?.YIELD_RATE
                    ? (Number(yrGrValue.YIELD_RATE_FOR_SCT) - Number(sctCompareNo2Value?.YIELD_RATE)).toFixed(4)
                    : '-'}
                </>
              )
            }
          }
        ]
      },
      {
        accessorKey: 'YIELD_ACCUMULATION',
        header: 'YIELD ACCUMULATION (%)',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 270,
        Cell: ({ row }) => {
          if (row.original?.YIELD_ACCUMULATION) {
            return <>{formatNumber(row.original.YIELD_ACCUMULATION * 100, 2, true, '%')}</>
          }

          const yrGr = getValues('YR_GR') || []

          const rowValue = yrGr.find(v => v.PROCESS_ID == row.original.PROCESS_ID)

          return (
            <>
              {/* {rowValue?.YIELD_ACCUMULATION_FOR_SCT ? Number(rowValue.YIELD_ACCUMULATION_FOR_SCT).toFixed(4) : ''} */}
              {formatNumber(rowValue?.YIELD_ACCUMULATION_FOR_SCT, 2, true, '%')}
            </>
          )
          // return (
          //   <>{rowValue?.YIELD_ACCUMULATION_FOR_SCT ? Number(rowValue.YIELD_ACCUMULATION_FOR_SCT).toFixed(4) : ''}</>
          // )
        }
      },
      {
        header: 'SCT Compare No.1',
        columns: [
          {
            accessorKey: 'YIELD_ACCUMULATION_NO_1',
            header: 'YIELD ACCUMULATION (%)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const yrGr = getValues('SCT_COMPARE_NO_1_DATA.flowProcess') || []

              const rowValue = yrGr.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              return <>{rowValue?.YIELD_ACCUMULATION ? Number(rowValue.YIELD_ACCUMULATION).toFixed(4) : '-'}</>
            }
          },
          {
            accessorKey: 'DIFF_YIELD_ACCUMULATION_NO_1',
            header: 'DIFF YIELD ACCUMULATION (%)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const yrGr = getValues('YR_GR') || []
              const yrGrValue = yrGr.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              const sctCompareNo1 = getValues('SCT_COMPARE_NO_1_DATA.flowProcess') || []
              const sctCompareNo1Value = sctCompareNo1.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              return (
                <>
                  {yrGrValue?.YIELD_ACCUMULATION_FOR_SCT && sctCompareNo1Value?.YIELD_ACCUMULATION
                    ? (
                        Number(yrGrValue.YIELD_ACCUMULATION_FOR_SCT) - Number(sctCompareNo1Value?.YIELD_ACCUMULATION)
                      ).toFixed(4)
                    : '-'}
                </>
              )
            }
          }
        ]
      },
      {
        header: 'SCT Compare No.2',
        columns: [
          {
            accessorKey: 'YIELD_ACCUMULATION_NO_2',
            header: 'YIELD ACCUMULATION (%)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const yrGr = getValues('SCT_COMPARE_NO_2_DATA.flowProcess') || []

              const rowValue = yrGr.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              return <>{rowValue?.YIELD_ACCUMULATION ? Number(rowValue.YIELD_ACCUMULATION).toFixed(4) : '-'}</>
            }
          },
          {
            accessorKey: 'DIFF_YIELD_ACCUMULATION_NO_2',
            header: 'DIFF YIELD ACCUMULATION (%)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const yrGr = getValues('YR_GR') || []
              const yrGrValue = yrGr.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              const sctCompareNo2 = getValues('SCT_COMPARE_NO_2_DATA.flowProcess') || []
              const sctCompareNo2Value = sctCompareNo2.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              return (
                <>
                  {yrGrValue?.YIELD_ACCUMULATION_FOR_SCT && sctCompareNo2Value?.YIELD_ACCUMULATION
                    ? (
                        Number(yrGrValue.YIELD_ACCUMULATION_FOR_SCT) - Number(sctCompareNo2Value?.YIELD_ACCUMULATION)
                      ).toFixed(4)
                    : '-'}
                </>
              )
            }
          }
        ]
      },
      {
        accessorKey: 'GO_STRAIGHT_RATE',
        header: 'GO STRAIGHT RATE (%)',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 250,
        Cell: ({ row }) => {
          if (row.original?.GO_STRAIGHT_RATE) {
            return <>{formatNumber(row.original.GO_STRAIGHT_RATE * 100, 2, true, '%')}</>
          }

          const yrGr = getValues('YR_GR') || []

          const rowValue = yrGr.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

          return (
            <>
              {/* {rowValue?.GO_STRAIGHT_RATE_FOR_SCT
                ? Math.round((rowValue.GO_STRAIGHT_RATE_FOR_SCT * 10000).toFixed(4)) / 10000
                : ''} */}

              {formatNumber(rowValue?.GO_STRAIGHT_RATE_FOR_SCT, 2, true, '%')}
            </>
          )
          // return <>{rowValue?.GO_STRAIGHT_RATE_FOR_SCT ? Number(rowValue.GO_STRAIGHT_RATE_FOR_SCT).toFixed(4) : ''}</>
        }
      },
      {
        header: 'SCT Compare No.1',
        columns: [
          {
            accessorKey: 'GO_STRAIGHT_RATE_NO_1',
            header: 'GO STRAIGHT RATE (%)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const yrGr = getValues('SCT_COMPARE_NO_1_DATA.flowProcess') || []

              const rowValue = yrGr.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              return <>{rowValue?.GO_STRAIGHT_RATE ? Number(rowValue.GO_STRAIGHT_RATE).toFixed(4) : '-'}</>
            }
          },
          {
            accessorKey: 'DIFF_GO_STRAIGHT_RATE_NO_1',
            header: 'DIFF GO STRAIGHT RATE (%)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const yrGr = getValues('YR_GR') || []
              const yrGrValue = yrGr.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              const sctCompareNo1 = getValues('SCT_COMPARE_NO_1_DATA.flowProcess') || []
              const sctCompareNo1Value = sctCompareNo1.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              return (
                <>
                  {yrGrValue?.GO_STRAIGHT_RATE_FOR_SCT && sctCompareNo1Value?.GO_STRAIGHT_RATE
                    ? (
                        Number(yrGrValue.GO_STRAIGHT_RATE_FOR_SCT) - Number(sctCompareNo1Value?.GO_STRAIGHT_RATE)
                      ).toFixed(4)
                    : '-'}
                </>
              )
            }
          }
        ]
      },
      {
        header: 'SCT Compare No.2',
        columns: [
          {
            accessorKey: 'GO_STRAIGHT_RATE_NO_2',
            header: 'GO STRAIGHT RATE (%)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const yrGr = getValues('SCT_COMPARE_NO_2_DATA.flowProcess') || []

              const rowValue = yrGr.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              return <>{rowValue?.GO_STRAIGHT_RATE ? Number(rowValue.GO_STRAIGHT_RATE).toFixed(4) : '-'}</>
            }
          },
          {
            accessorKey: 'DIFF_GO_STRAIGHT_RATE_NO_2',
            header: 'DIFF GO STRAIGHT RATE (%)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const yrGr = getValues('YR_GR') || []
              const yrGrValue = yrGr.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              const sctCompareNo2 = getValues('SCT_COMPARE_NO_2_DATA.flowProcess') || []
              const sctCompareNo2Value = sctCompareNo2.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              return (
                <>
                  {yrGrValue?.GO_STRAIGHT_RATE_FOR_SCT && sctCompareNo2Value?.GO_STRAIGHT_RATE
                    ? (
                        Number(yrGrValue.GO_STRAIGHT_RATE_FOR_SCT) - Number(sctCompareNo2Value?.GO_STRAIGHT_RATE)
                      ).toFixed(4)
                    : '-'}
                </>
              )
            }
          }
        ]
      },
      {
        accessorKey: 'CLEAR_TIME',
        header: 'CLEAR TIME (MM)',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 220,
        Cell: ({ row }) => {
          if (row.original?.CLEAR_TIME) {
            // return <>{Number((row.original.CLEAR_TIME * 100).toFixed(1))}</>
            return <>{formatNumber(row.original.CLEAR_TIME, 2, false)}</>
          }

          const clearTime = getValues('CLEAR_TIME') || []

          const rowValue = clearTime.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

          // return <>{rowValue?.CLEAR_TIME_FOR_SCT ? rowValue.CLEAR_TIME_FOR_SCT.toFixed(4) : ''}</>
          return (
            <>
              {/* {rowValue?.CLEAR_TIME_FOR_SCT || rowValue?.CLEAR_TIME_FOR_SCT == 0
                ? Math.round((rowValue.CLEAR_TIME_FOR_SCT * 10000).toFixed(4)) / 10000
                : ''} */}
              {formatNumber(rowValue, 2, false)}
            </>
          )
        }
      },
      {
        header: 'SCT Compare No.1',
        columns: [
          {
            accessorKey: 'CLEAR_TIME_NO_1',
            header: 'CLEAR TIME (MM)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const clearTime = getValues('SCT_COMPARE_NO_1_DATA.flowProcess') || []

              const rowValue = clearTime.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              return <>{rowValue?.CLEAR_TIME ? rowValue.CLEAR_TIME.toFixed(4) : '-'}</>
            }
          },
          {
            accessorKey: 'DIFF_CLEAR_TIME_NO_1',
            header: 'DIFF CLEAR TIME (MM)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const clearTime = getValues('CLEAR_TIME') || []
              const clearTimeValue = clearTime.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              const sctCompareNo1 = getValues('SCT_COMPARE_NO_1_DATA.flowProcess') || []
              const sctCompareNo1Value = sctCompareNo1.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              return (
                <>
                  {clearTimeValue?.CLEAR_TIME_FOR_SCT && sctCompareNo1Value?.CLEAR_TIME
                    ? (Number(clearTimeValue.CLEAR_TIME_FOR_SCT) - Number(sctCompareNo1Value?.CLEAR_TIME)).toFixed(4)
                    : '-'}
                </>
              )
            }
          }
        ]
      },
      {
        header: 'SCT Compare No.2',
        columns: [
          {
            accessorKey: 'CLEAR_TIME_NO_2',
            header: 'CLEAR TIME (MM)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const clearTime = getValues('SCT_COMPARE_NO_2_DATA.flowProcess') || []

              const rowValue = clearTime.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              return <>{rowValue?.CLEAR_TIME ? rowValue.CLEAR_TIME.toFixed(4) : '-'}</>
            }
          },
          {
            accessorKey: 'DIFF_CLEAR_TIME_NO_2',
            header: 'DIFF CLEAR TIME (MM)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const clearTime = getValues('CLEAR_TIME') || []
              const clearTimeValue = clearTime.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              const sctCompareNo2 = getValues('SCT_COMPARE_NO_2_DATA.flowProcess') || []
              const sctCompareNo2Value = sctCompareNo2.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              return (
                <>
                  {clearTimeValue?.CLEAR_TIME_FOR_SCT && sctCompareNo2Value?.CLEAR_TIME
                    ? (Number(clearTimeValue.CLEAR_TIME_FOR_SCT) - Number(sctCompareNo2Value?.CLEAR_TIME)).toFixed(4)
                    : '-'}
                </>
              )
            }
          }
        ]
      },
      {
        accessorKey: 'ESSENTIAL_TIME',
        header: 'ESSENTIAL TIME (MM)',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 250,
        Cell: ({ row }) => {
          if (row.original?.ESSENTIAL_TIME) {
            return <>{formatNumber(row.original.ESSENTIAL_TIME, 2, false)}</>
          }

          const yrGR = getValues('YR_GR') || []
          const clearTime = getValues('CLEAR_TIME') || []

          const yrGRValue = yrGR.find(v => v.PROCESS_ID === row.original.PROCESS_ID)
          const clearTimeValue = clearTime.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

          const value =
            (Number(clearTimeValue?.CLEAR_TIME_FOR_SCT) /
              Number(yrGRValue?.YIELD_ACCUMULATION_FOR_SCT) /
              Number(yrGRValue?.GO_STRAIGHT_RATE_FOR_SCT)) *
            100

          setValue(
            'SCT_FLOW_PROCESS',
            getValues('SCT_FLOW_PROCESS').map((item: any) => {
              if (item.PROCESS_ID === row.original.PROCESS_ID) {
                return {
                  ...item,
                  ESSENTIAL_TIME: value
                }
              }

              return item
            })
          )

          // return <>{!!value || value == 0 ? Math.round((value * 10000).toFixed(4)) / 10000 : ''}</>
          return formatNumber(value, 2, false)
          // return <>{!!value ? value.toFixed(4) : ''}</>
        }
      },
      {
        header: 'SCT Compare No.1',
        columns: [
          {
            accessorKey: 'ESSENTIAL_TIME_NO_1',
            header: 'ESSENTIAL TIME (MM)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const clearTime = getValues('SCT_COMPARE_NO_1_DATA.flowProcess') || []

              const rowValue = clearTime.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              return <>{rowValue?.ESSENTIAL_TIME ? rowValue.ESSENTIAL_TIME.toFixed(4) : '-'}</>
            }
          },
          {
            accessorKey: 'DIFF_ESSENTIAL_TIME_NO_1',
            header: 'DIFF ESSENTIAL TIME (MM)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const yrGR = getValues('YR_GR') || []
              const clearTime = getValues('CLEAR_TIME') || []

              const yrGRValue = yrGR.find(v => v.PROCESS_ID === row.original.PROCESS_ID)
              const clearTimeValue = clearTime.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              const no1Value = getValues('SCT_COMPARE_NO_1_DATA.flowProcess') || []

              const no1 = no1Value.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              let value =
                Number(clearTimeValue?.CLEAR_TIME_FOR_SCT) /
                Number(yrGRValue?.YIELD_RATE_FOR_SCT) /
                Number(yrGRValue?.GO_STRAIGHT_RATE_FOR_SCT)

              value = value - no1?.ESSENTIAL_TIME

              return <>{!!value ? value.toFixed(4) : '-'}</>
            }
          }
        ]
      },
      {
        header: 'SCT Compare No.2',
        columns: [
          {
            accessorKey: 'ESSENTIAL_TIME_NO_2',
            header: 'ESSENTIAL TIME (MM)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const clearTime = getValues('SCT_COMPARE_NO_2_DATA.flowProcess') || []

              const rowValue = clearTime.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              return <>{rowValue?.ESSENTIAL_TIME ? rowValue.ESSENTIAL_TIME.toFixed(4) : '-'}</>
            }
          },
          {
            accessorKey: 'DIFF_ESSENTIAL_TIME_NO_2',
            header: 'DIFF ESSENTIAL TIME (MM)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const yrGR = getValues('YR_GR') || []
              const clearTime = getValues('CLEAR_TIME') || []

              const yrGRValue = yrGR.find(v => v.PROCESS_ID === row.original.PROCESS_ID)
              const clearTimeValue = clearTime.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              const no2Value = getValues('SCT_COMPARE_NO_2_DATA.flowProcess') || []

              const no2 = no2Value.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              let value =
                Number(clearTimeValue?.CLEAR_TIME_FOR_SCT) /
                Number(yrGRValue?.YIELD_RATE_FOR_SCT) /
                Number(yrGRValue?.GO_STRAIGHT_RATE_FOR_SCT)

              value = value - no2?.ESSENTIAL_TIME

              return <>{!!value ? value.toFixed(4) : '-'}</>
            }
          }
        ]
      },
      {
        accessorKey: 'PROCESS_STANDARD_TIME',
        header: 'PROCESS STANDARD TIME (MM)',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        Cell: ({ row }) => {
          if (row.original?.PROCESS_STANDARD_TIME) {
            // return <>{Number((row.original.PROCESS_STANDARD_TIME * 100).toFixed(1))}</>
            return <>{formatNumber(row.original.PROCESS_STANDARD_TIME, 2, false)}</>
          }

          const yrGR = getValues('YR_GR') || []
          const clearTime = getValues('CLEAR_TIME') || []

          const yrGRValue = yrGR.find(v => v.PROCESS_ID === row.original.PROCESS_ID)
          const clearTimeValue = clearTime.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

          let value =
            Number(clearTimeValue?.CLEAR_TIME_FOR_SCT) /
            Number(yrGRValue?.YIELD_RATE_FOR_SCT) /
            Number(yrGRValue?.GO_STRAIGHT_RATE_FOR_SCT)

          value = value * 10000 * (1 + getValues('DIRECT_COST_CONDITION.INDIRECT_RATE_OF_DIRECT_PROCESS_COST'))

          // return <>{!!value || value == 0 ? Math.round((value * 10000).toFixed(4)) / 10000 : ''}</>
          return <>{formatNumber(value, 2, false)}</>
        }
      },
      {
        header: 'SCT Compare No.1',
        columns: [
          {
            accessorKey: 'PROCESS_STANDARD_TIME_NO_1',
            header: 'PROCESS STANDARD TIME (MM)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const clearTime = getValues('SCT_COMPARE_NO_1_DATA.flowProcess') || []

              const rowValue = clearTime.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              return <>{rowValue?.PROCESS_STANDARD_TIME ? rowValue.PROCESS_STANDARD_TIME.toFixed(4) : '-'}</>
            }
          },
          {
            accessorKey: 'DIFF_PROCESS_STANDARD_TIME_NO_1',
            header: 'DIFF PROCESS STANDARD TIME (MM)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const clearTime = getValues('CLEAR_TIME') || []
              const clearTimeValue = clearTime.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              const sctCompareNo1 = getValues('SCT_COMPARE_NO_1_DATA.flowProcess') || []
              const sctCompareNo1Value = sctCompareNo1.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              let value =
                Number(clearTimeValue?.CLEAR_TIME_FOR_SCT) /
                Number(sctCompareNo1Value?.YIELD_RATE) /
                Number(sctCompareNo1Value?.GO_STRAIGHT_RATE)

              value = value * (1 + getValues('DIRECT_COST_CONDITION.INDIRECT_RATE_OF_DIRECT_PROCESS_COST') / 100)

              value = value - sctCompareNo1Value?.PROCESS_STANDARD_TIME

              return <>{!!value ? value.toFixed(4) : '-'}</>
            }
          }
        ]
      },
      {
        header: 'SCT Compare No.2',
        columns: [
          {
            accessorKey: 'PROCESS_STANDARD_TIME_NO_2',
            header: 'PROCESS STANDARD TIME (MM)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const clearTime = getValues('SCT_COMPARE_NO_2_DATA.flowProcess') || []

              const rowValue = clearTime.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              return <>{rowValue?.PROCESS_STANDARD_TIME ? rowValue.PROCESS_STANDARD_TIME.toFixed(4) : '-'}</>
            }
          },
          {
            accessorKey: 'DIFF_PROCESS_STANDARD_TIME_NO_2',
            header: 'DIFF PROCESS STANDARD TIME (MM)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const clearTime = getValues('CLEAR_TIME') || []
              const clearTimeValue = clearTime.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              const sctCompareNo2 = getValues('SCT_COMPARE_NO_2_DATA.flowProcess') || []
              const sctCompareNo2Value = sctCompareNo2.find(v => v.PROCESS_ID === row.original.PROCESS_ID)

              let value =
                Number(clearTimeValue?.CLEAR_TIME_FOR_SCT) /
                Number(sctCompareNo2Value?.YIELD_RATE) /
                Number(sctCompareNo2Value?.GO_STRAIGHT_RATE)

              value = value * (1 + getValues('DIRECT_COST_CONDITION.INDIRECT_RATE_OF_DIRECT_PROCESS_COST') / 100)

              value = value - sctCompareNo2Value?.PROCESS_STANDARD_TIME

              return <>{!!value ? value.toFixed(4) : '-'}</>
            }
          }
        ]
      }
    ],
    []
  )

  const table = useMaterialReactTable({
    columns,
    // data: data?.data.ResultOnDb || [],
    data: getValues('SCT_FLOW_PROCESS') || [],
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    // onColumnFiltersChange: setColumnFilters,
    // onColumnFilterFnsChange: setColumnFilterFns,
    onPaginationChange: setPagination,
    // onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onDensityChange: setDensity,
    // onColumnPinningChange: setColumnPinning,
    // onColumnOrderChange: setColumnOrder,
    // rowCount: data?.data.TotalCountOnDb ?? 0,
    rowCount: 0,
    isMultiSortEvent: () => true,
    enableColumnFilters: false,
    enableStickyHeader: true,
    enableColumnFilterModes: true,
    enableFacetedValues: true,
    enableColumnPinning: true,
    enableRowActions: false,
    enableColumnResizing: true,
    enableColumnOrdering: true,
    // enableRowNumbers: true,
    paginationDisplayMode: 'pages',
    initialState: {
      columnPinning: {
        left: ['PROCESS_NO', 'PROCESS_NAME']
      }
    },
    state: {
      // columnFilters,
      // isLoading,
      pagination,
      // showAlertBanner: isError || data?.data.Status === false,
      // showProgressBars: isRefetching,
      // sorting,
      density,
      columnVisibility
      // columnPinning,
      // columnOrder,
      // columnFilterFns
    },
    defaultColumn: {
      size: 300
    },
    layoutMode: 'grid',
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
        <MRT_ShowHideColumnsButton table={table} />
        <MRT_ToggleDensePaddingButton table={table} />
        <MRT_ToggleFullScreenButton table={table} />
      </>
    ),
    renderTopToolbarCustomActions: () => (
      <div className='flex flex-col'>
        {(watch(`YR_GR_FROM_ENGINEER_RESOURCE_OPTION_ID`) === 4 ||
          watch(`YR_GR_FROM_ENGINEER_RESOURCE_OPTION_ID`) === '4') &&
          watch('YR_GR_FROM_ENGINEER_SELECTION.label') && (
            <Typography
              className=''
              sx={{
                color: 'var(--mui-palette-warning-main)'
              }}
            >
              Yield Rate, Go Straight Rate Revision :{' '}
              {watch('YR_GR_FROM_ENGINEER_SELECTION.label')?.replace('/', 'rev')}
            </Typography>
          )}
        {(watch(`TIME_FROM_MFG_RESOURCE_OPTION_ID`) === 4 || watch(`TIME_FROM_MFG_RESOURCE_OPTION_ID`) === '4') &&
          watch('TIME_FROM_MFG_SELECTION.label') && (
            <Typography
              className=''
              sx={{
                color: 'var(--mui-palette-warning-main)'
              }}
            >
              Clear Time Revision : {watch('TIME_FROM_MFG_SELECTION.label')?.replace('/', 'rev')}
            </Typography>
          )}
        {errors.CLEAR_TIME && (
          <>
            <Typography
              sx={{
                color: 'var(--mui-palette-error-main)'
              }}
            >
              {errors.CLEAR_TIME.message}
            </Typography>
          </>
        )}
        {errors.SCT_FLOW_PROCESS && (
          <>
            <Typography
              sx={{
                color: 'var(--mui-palette-error-main)'
              }}
            >
              {errors.SCT_FLOW_PROCESS.message}
            </Typography>
          </>
        )}
      </div>
    ),
    // renderTopToolbarCustomActions: () => (
    //   <Box sx={{ display: 'flex', gap: '1rem', p: '4px' }}>
    //     <div className='flex items-center gap-2'>
    //       <Typography className='hidden sm:block'>Show</Typography>

    //       <CustomTextField
    //         select
    //         onChange={e => {
    //           table.setPageSize(Number(e.target.value))
    //           // onChange(Number(e.target.value))
    //         }}
    //         className='is-[80px]'
    //         style={{ zIndex: 2001 }}
    //       >
    //         <MenuItem value='10'>10</MenuItem>
    //         <MenuItem value='25'>25</MenuItem>
    //         <MenuItem value='50'>50</MenuItem>
    //         <MenuItem value='100'>100</MenuItem>
    //       </CustomTextField>

    //       <Typography className='hidden sm:block'>Entries</Typography>
    //     </div>
    //     <Tooltip arrow title='Clear All Sorting' onClick={() => table.resetSorting(true)}>
    //       <IconButton>
    //         {/* <Badge badgeContent={sorting?.length ?? 0} color='primary'>
    //           <SwapVertIcon />
    //         </Badge> */}
    //       </IconButton>
    //     </Tooltip>
    //     <Tooltip arrow title='Clear All Filters' onClick={() => table.resetColumnFilters(true)}>
    //       <IconButton>
    //         {/* <Badge badgeContent={columnFilters.filter(v => v.value.length !== 0).length ?? 0} color='primary'>
    //           <FilterListIcon />
    //         </Badge> */}
    //       </IconButton>
    //     </Tooltip>
    //     <Tooltip
    //       arrow
    //       title='Refresh Data'
    //       // onClick={() => refetch()}
    //     >
    //       <IconButton>
    //         <RefreshIcon />
    //       </IconButton>
    //     </Tooltip>
    //   </Box>
    // ),
    renderBottomToolbar: ({ table }) => (
      <div className='flex items-center justify-end gap-2 p-3'>
        <div className='flex items-center gap-2'>
          <Typography variant='body1'>
            {/* Showing {pagination.pageIndex * pagination.pageSize + 1} to{' '} */}
            {/* {pagination.pageIndex * pagination.pageSize + (data?.data?.ResultOnDb?.length ?? 0)} of{' '} */}
            {/* {pagination.pageIndex * pagination.pageSize + 0} of {table.getRowCount()} entries */}
            Showing {getValues('SCT_FLOW_PROCESS')?.length || [].length} Rows
          </Typography>
          {/* <MRT_TablePagination table={table} showRowsPerPage={false} /> */}

          {/* <Pagination
            count={table.getPageOptions().length}
            page={table.getState().pagination.pageIndex + 1}
            onChange={(_event, value: number) => table.setPageIndex(value - 1)}
            variant='tonal'
            shape='rounded'
            color='primary'
          /> */}
        </div>
      </div>
    ),
    // renderRowActions: ({ row }) => (
    //   <div className='flex items-center'>
    //     <IconButton onClick={() => handleClickOpenModalView(row)}>
    //       <i className='tabler-eye text-[22px] text-textSecondary' />
    //     </IconButton>
    //     {row?.original?.INUSE === 0 ? null : (
    //       <ActionsMenu
    //         row={row}
    //         setOpenModalEdit={setOpenModalEdit}
    //         rowSelected={rowSelected}
    //         setRowSelected={setRowSelected}
    //         setOpenModalDelete={setOpenModalDelete}
    //       />
    //     )}
    //   </div>
    // ),
    // initialState: { showColumnFilters: columnFilters.filter(cf => cf?.value?.length !== 0)?.length > 0 ? true : false },
    // muiToolbarAlertBannerProps:
    //   isError || data?.data.Status === false
    //     ? {
    //         color: 'error',
    //         // children: 'Error loading data => ' + (data?.data?.Message || '')
    //         children: 'Error loading data => ' + ''
    //       }
    //     : undefined,
    muiToolbarAlertBannerProps: undefined,

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
    muiTablePaperProps: ({ table }) => ({
      elevation: 0,
      style: {
        zIndex: table.getState().isFullScreen ? 2000 : undefined
      },
      sx: {
        borderRadius: '0'
      }
    }),
    muiTableContainerProps: {
      sx: {
        borderRadius: '0',
        height: '45vh'
      }
    },
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
    <>
      <MaterialReactTable table={table} />
    </>
  )
}

export default FlowProcessBomTableData
