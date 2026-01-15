import { ReactNode, useEffect, useMemo, useState } from 'react'

import Switch from '@mui/material/Switch'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_InternalFilterOption,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFullScreenButton,
  MRT_VisibilityState,
  useMaterialReactTable
} from 'material-react-table'

import { useFormContext, useWatch } from 'react-hook-form'
import { formatNumber } from '@/utils/formatting-checking-value/checkingValueTypes'
import { Chip } from '@mui/material'
import { FormDataPage } from '../../validationSchema'

const FlowProcessBomTableData = () => {
  const { getValues, control, watch } = useFormContext<FormDataPage>()

  // const { errors } = useFormState({
  //   control
  // })

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({})

  const yieldRateAndGoStraightRate_total = useWatch({
    control,
    name: 'directCost.flowProcess.total.main.yieldRateAndGoStraightRate'
  })

  const flowId = useWatch({
    control,
    name: 'header.bom.FLOW_ID'
  })

  const listSctFlowProcessSequence = useWatch({
    control,
    name: 'directCost.flowProcess.body.flowProcess.main' // without supply name will watch the entire form, or ['firstName', 'lastName'] to watch both
    // defaultValue: "default", // default value before the render
  })

  const listYieldRateGoStraightRateProcessForSct = useWatch({
    control,
    name: 'directCost.flowProcess.body.yieldRateGoStraightRateProcessForSct.main' // without supply name will watch the entire form, or ['firstName', 'lastName'] to watch both
    // defaultValue: "default", // default value before the render
  })

  const listClearTimeProcessForSct = useWatch({
    control,
    name: 'directCost.flowProcess.body.clearTimeForSctProcess.main' // without supply name will watch the entire form, or ['firstName', 'lastName'] to watch both
    // defaultValue: "default", // default value before the render
  })

  const listClearTimeForSctProcess_SctCompareNo1 =
    getValues('directCost.flowProcess.body.clearTimeForSctProcess.SctCompareNo1') ?? []
  const listYieldRateGoStraightRateProcessForSct_SctCompareNo1 =
    getValues('directCost.flowProcess.body.yieldRateGoStraightRateProcessForSct.SctCompareNo1') ?? []

  const listClearTimeForSctProcess_SctCompareNo2 =
    getValues('directCost.flowProcess.body.clearTimeForSctProcess.SctCompareNo2') ?? []
  const listYieldRateGoStraightRateProcessForSct_SctCompareNo2 =
    getValues('directCost.flowProcess.body.yieldRateGoStraightRateProcessForSct.SctCompareNo2') ?? []

  useEffect(() => {
    setColumnVisibility(() => {
      // !!! Ausada please change
      // const isHasNo1 = getValues('sctComPareNo1')?.SCT_ID
      // const isHasNo2 = getValues('sctComPareNo2')?.SCT_ID

      const isHasNo1 = false
      const isHasNo2 = false

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
        //...columnVisibility,
        ...No1Column,
        ...No2Column
      }
    })
  }, [watch('sctComPareNo1')?.SCT_ID, watch('sctComPareNo2')?.SCT_ID])

  type FlowProcessType = FormDataPage['directCost']['flowProcess']['body']['flowProcess']['main'][0]

  const columns = useMemo<MRT_ColumnDef<FlowProcessType>[]>(
    () => [
      {
        accessorKey: 'FLOW_CODE',
        header: 'FLOW CODE',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 180
      },
      {
        accessorKey: 'PROCESS_NO',
        header: 'PROCESS NO',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 180
      },
      {
        accessorKey: 'PROCESS_CODE',
        header: 'PROCESS SEQUENCE CODE',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        Cell: ({ row }) => {
          const productTypeCode = getValues('product.productType.PRODUCT_TYPE_CODE')
          const productMainAlphabet = getValues('product.productMain.PRODUCT_MAIN_ALPHABET')
          const runningNumber = row.original.PROCESS_CODE.slice(-4)

          return `${productTypeCode}-${productMainAlphabet}-P${runningNumber}`
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
        Cell: ({ row }) => {
          const rowValue = listYieldRateGoStraightRateProcessForSct.find(
            v => v.processId === row.original.PROCESS_ID
          )?.collectionPointForSct

          const isYes = rowValue === 1

          return (
            <Chip variant='filled' size='small' label={isYes ? 'Yes' : 'No'} color={isYes ? 'success' : 'secondary'} />

            //       <span
            //         className={`px-2 py-1 rounded-md text-md font-medium
            //   ${isYes ? 'text-green-800' : 'bg-gray-700 text-gray-200'}
            // `}
            //       >
            //         {isYes ? 'Yes' : 'No'}
            //       </span>
          )
        }
      },
      {
        header: 'SCT Compare No.1',
        columns: [
          {
            accessorKey: 'COLLECTION_POINT_NO_1',
            header: 'COLLECTION POINT',
            Cell: ({ row }) => {
              const rowValue = listYieldRateGoStraightRateProcessForSct_SctCompareNo1.find(
                v => v.processId === row.original.PROCESS_ID
              )?.collectionPointForSct

              return (
                <>
                  <Switch checked={rowValue ? true : false} />
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
            Cell: ({ row }) => {
              const rowValue = listYieldRateGoStraightRateProcessForSct_SctCompareNo2.find(
                v => v.processId === row.original.PROCESS_ID
              )
              return (
                <>
                  <Switch checked={rowValue?.collectionPointForSct ? true : false} disabled={true} />
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
          const rowValue = listYieldRateGoStraightRateProcessForSct.find(
            v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
          )?.yieldRateForSct
          return <>{formatNumber(rowValue, 2, true, '%')}</>
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
              const rowValue = listYieldRateGoStraightRateProcessForSct_SctCompareNo1.find(
                v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
              )?.yieldRateForSct
              return <> {formatNumber(rowValue, 2, true, '%')}</>
            }
          },
          {
            header: 'DIFF YIELD RATE (%)',
            accessorKey: 'DIFF_YIELD_RATE_NO_1',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const main = listYieldRateGoStraightRateProcessForSct.find(
                v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
              )?.yieldRateForSct

              const compare = listYieldRateGoStraightRateProcessForSct_SctCompareNo1.find(
                v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
              )?.yieldRateForSct

              if (!main || !compare) {
                return <></>
              }

              return <> {formatNumber(main - compare, 2, true, '%')}</>
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
              const rowValue = listYieldRateGoStraightRateProcessForSct_SctCompareNo2.find(
                v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
              )?.yieldRateForSct
              return <> {formatNumber(rowValue, 2, true, '%')}</>
            }
          },
          {
            accessorKey: 'DIFF_YIELD_RATE_NO_2',
            header: 'DIFF YIELD RATE (%)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const main = listYieldRateGoStraightRateProcessForSct.find(
                v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
              )?.yieldRateForSct

              const compare = listYieldRateGoStraightRateProcessForSct_SctCompareNo2.find(
                v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
              )?.yieldRateForSct

              if (!main || !compare) {
                return <></>
              }

              return <> {formatNumber(main - compare, 2, true, '%')}</>
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
          const rowValue = listYieldRateGoStraightRateProcessForSct.find(
            v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
          )?.yieldAccumulationForSct
          return <>{formatNumber(rowValue, 2, true, '%')}</>
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
              const rowValue = listYieldRateGoStraightRateProcessForSct_SctCompareNo1.find(
                v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
              )?.yieldAccumulationForSct
              return <>{formatNumber(rowValue, 2, true, '%')}</>
            }
          },
          {
            accessorKey: 'DIFF_YIELD_ACCUMULATION_NO_1',
            header: 'DIFF YIELD ACCUMULATION (%)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const main = listYieldRateGoStraightRateProcessForSct.find(
                v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
              )?.yieldAccumulationForSct

              const compare = listYieldRateGoStraightRateProcessForSct_SctCompareNo1.find(
                v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
              )?.yieldAccumulationForSct

              if (!main || !compare) {
                return <></>
              }

              return <> {formatNumber(main - compare, 2, true, '%')}</>
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
              const rowValue = listYieldRateGoStraightRateProcessForSct_SctCompareNo2.find(
                v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
              )?.yieldAccumulationForSct
              return <>{formatNumber(rowValue, 2, true, '%')}</>
            }
          },
          {
            accessorKey: 'DIFF_YIELD_ACCUMULATION_NO_2',
            header: 'DIFF YIELD ACCUMULATION (%)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const main = listYieldRateGoStraightRateProcessForSct.find(
                v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
              )?.yieldAccumulationForSct

              const compare = listYieldRateGoStraightRateProcessForSct_SctCompareNo2.find(
                v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
              )?.yieldAccumulationForSct

              if (!main || !compare) {
                return <></>
              }

              return <> {formatNumber(main - compare, 2, true, '%')}</>
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
          const rowValue = listYieldRateGoStraightRateProcessForSct.find(
            v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
          )?.goStraightRateForSct

          return <> {formatNumber(rowValue, 2, true, '%')}</>
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
              const rowValue = listYieldRateGoStraightRateProcessForSct_SctCompareNo1.find(
                v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
              )?.goStraightRateForSct

              return <> {formatNumber(rowValue, 2, true, '%')}</>
            }
          },
          {
            accessorKey: 'DIFF_GO_STRAIGHT_RATE_NO_1',
            header: 'DIFF GO STRAIGHT RATE (%)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const main = listYieldRateGoStraightRateProcessForSct.find(
                v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
              )?.goStraightRateForSct

              const compare = listYieldRateGoStraightRateProcessForSct_SctCompareNo1.find(
                v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
              )?.goStraightRateForSct

              if (!main || !compare) {
                return <></>
              }

              return <> {formatNumber(main - compare, 2, true, '%')}</>
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
              const rowValue = listYieldRateGoStraightRateProcessForSct_SctCompareNo2.find(
                v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
              )?.goStraightRateForSct

              return <> {formatNumber(rowValue, 2, true, '%')}</>
            }
          },
          {
            accessorKey: 'DIFF_GO_STRAIGHT_RATE_NO_2',
            header: 'DIFF GO STRAIGHT RATE (%)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const main = listYieldRateGoStraightRateProcessForSct.find(
                v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
              )?.goStraightRateForSct

              const compare = listYieldRateGoStraightRateProcessForSct_SctCompareNo2.find(
                v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
              )?.goStraightRateForSct

              if (!main || !compare) {
                return <></>
              }

              return <> {formatNumber(main - compare, 2, true, '%')}</>
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
          const rowValue = listClearTimeProcessForSct.find(
            v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
          )?.clearTimeForSct

          return <> {formatNumber(rowValue, 2, true)}</>
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
              const rowValue = listClearTimeForSctProcess_SctCompareNo1.find(
                v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
              )?.clearTimeForSct

              return <> {formatNumber(rowValue, 2, true)}</>
            }
          },
          {
            accessorKey: 'DIFF_CLEAR_TIME_NO_1',
            header: 'DIFF CLEAR TIME (MM)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const main = listClearTimeProcessForSct.find(
                v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
              )?.clearTimeForSct

              const compare = listClearTimeForSctProcess_SctCompareNo1.find(
                v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
              )?.clearTimeForSct

              if (!main || !compare) {
                return <></>
              }

              return <> {formatNumber(main - compare, 2, true)}</>
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
              const rowValue = listClearTimeForSctProcess_SctCompareNo2.find(
                v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
              )?.clearTimeForSct

              return <> {formatNumber(rowValue, 2, true)}</>
            }
          },
          {
            accessorKey: 'DIFF_CLEAR_TIME_NO_2',
            header: 'DIFF CLEAR TIME (MM)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const main = listClearTimeProcessForSct.find(
                v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
              )?.clearTimeForSct

              const compare = listClearTimeForSctProcess_SctCompareNo2.find(
                v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
              )?.clearTimeForSct

              if (!main || !compare) {
                return <></>
              }

              return <> {formatNumber(main - compare, 2, true)}</>
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
          const yrGRValue = listYieldRateGoStraightRateProcessForSct.find(
            v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
          )
          const clearTimeValue = listClearTimeProcessForSct.find(
            v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
          )
          const value =
            (Number(clearTimeValue?.clearTimeForSct) /
              Number(yrGRValue?.yieldAccumulationForSct) /
              Number(yrGRValue?.goStraightRateForSct)) *
            100 *
            100

          // useMemo(() => setValue('', value), [value])
          return <> {formatNumber(value, 2, true)}</>
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
              const yrGRValue = listYieldRateGoStraightRateProcessForSct_SctCompareNo1.find(
                v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
              )
              const clearTimeValue = listClearTimeForSctProcess_SctCompareNo1.find(
                v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
              )

              const value =
                (Number(clearTimeValue?.clearTimeForSct) /
                  Number(yrGRValue?.yieldAccumulationForSct) /
                  Number(yrGRValue?.goStraightRateForSct)) *
                100 *
                100
              return <> {formatNumber(value, 2, true)}</>
            }
          },
          {
            accessorKey: 'DIFF_ESSENTIAL_TIME_NO_1',
            header: 'DIFF ESSENTIAL TIME (MM)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const main = () => {
                const yrGRValue = listYieldRateGoStraightRateProcessForSct.find(
                  v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
                )
                const clearTimeValue = listClearTimeProcessForSct.find(
                  v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
                )

                const value =
                  (Number(clearTimeValue?.clearTimeForSct) /
                    Number(yrGRValue?.yieldAccumulationForSct) /
                    Number(yrGRValue?.goStraightRateForSct)) *
                  100 *
                  100
                return value
              }

              const compare = () => {
                const yrGRValue = listYieldRateGoStraightRateProcessForSct_SctCompareNo1.find(
                  v => v.processId === row.original.PROCESS_ID
                )
                const clearTimeValue = listClearTimeForSctProcess_SctCompareNo1.find(
                  v => v.processId === row.original.PROCESS_ID
                )

                const value =
                  (Number(clearTimeValue?.clearTimeForSct) /
                    Number(yrGRValue?.yieldAccumulationForSct) /
                    Number(yrGRValue?.goStraightRateForSct)) *
                  100 *
                  100
                return value
              }

              if (!main || !compare) {
                return <></>
              }

              return <> {formatNumber(main() - compare(), 2, true)}</>
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
              const yrGRValue = listYieldRateGoStraightRateProcessForSct_SctCompareNo2.find(
                v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
              )
              const clearTimeValue = listClearTimeForSctProcess_SctCompareNo2.find(
                v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
              )

              const value =
                (Number(clearTimeValue?.clearTimeForSct) /
                  Number(yrGRValue?.yieldAccumulationForSct) /
                  Number(yrGRValue?.goStraightRateForSct)) *
                100 *
                100
              return <> {formatNumber(value, 2, true)}</>
            }
          },
          {
            accessorKey: 'DIFF_ESSENTIAL_TIME_NO_2',
            header: 'DIFF ESSENTIAL TIME (MM)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const main = () => {
                const yrGRValue = listYieldRateGoStraightRateProcessForSct.find(
                  v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
                )
                const clearTimeValue = listClearTimeProcessForSct.find(
                  v =>
                    v.flowId === row.original.FLOW_ID &&
                    v.flowId === row.original.FLOW_ID &&
                    v.processId === row.original.PROCESS_ID
                )

                const value =
                  (Number(clearTimeValue?.clearTimeForSct) /
                    Number(yrGRValue?.yieldAccumulationForSct) /
                    Number(yrGRValue?.goStraightRateForSct)) *
                  100 *
                  100
                return value
              }

              const compare = () => {
                const yrGRValue = listYieldRateGoStraightRateProcessForSct_SctCompareNo2.find(
                  v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
                )
                const clearTimeValue = listClearTimeForSctProcess_SctCompareNo2.find(
                  v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
                )

                const value =
                  (Number(clearTimeValue?.clearTimeForSct) /
                    Number(yrGRValue?.yieldAccumulationForSct) /
                    Number(yrGRValue?.goStraightRateForSct)) *
                  100 *
                  100
                return value
              }

              if (!main || !compare) {
                return <></>
              }

              return <> {formatNumber(main() - compare(), 2, true)}</>
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
          const yrGRValue = listYieldRateGoStraightRateProcessForSct.find(
            v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
          )
          const clearTimeValue = listClearTimeProcessForSct.find(
            v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
          )
          // let value =
          //   Number(clearTimeValue?.clearTimeForSct) /
          //   Number(yrGRValue?.yieldAccumulationForSct) /
          //   Number(yrGRValue?.goStraightRateForSct)

          // console.log(value)

          const indirectRateOfDirectProcessCost =
            getValues('indirectCost.main.costCondition.directCostCondition.indirectRateOfDirectProcessCost') ?? 0

          const value =
            (Number(clearTimeValue?.clearTimeForSct) /
              Number(yrGRValue?.yieldAccumulationForSct) /
              Number(yrGRValue?.goStraightRateForSct)) *
            100 *
            100 *
            (1 + indirectRateOfDirectProcessCost / 100)
          return <> {formatNumber(value, 2, true)}</>
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
              const yrGRValue = listYieldRateGoStraightRateProcessForSct_SctCompareNo1.find(
                v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
              )

              const clearTimeValue = listClearTimeForSctProcess_SctCompareNo1.find(
                v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
              )

              let value =
                Number(clearTimeValue?.clearTimeForSct) /
                Number(yrGRValue?.yieldAccumulationForSct) /
                Number(yrGRValue?.goStraightRateForSct)

              const indirectRateOfDirectProcessCost = getValues(
                'indirectCost.SctCompareNo1.costCondition.directCostCondition.indirectRateOfDirectProcessCost'
              )

              value = value * 10000 * (1 + indirectRateOfDirectProcessCost)

              return <> {formatNumber(value, 2, true)}</>
            }
          },
          {
            accessorKey: 'DIFF_PROCESS_STANDARD_TIME_NO_1',
            header: 'DIFF PROCESS STANDARD TIME (MM)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const main = () => {
                const yrGRValue = listYieldRateGoStraightRateProcessForSct.find(
                  v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
                )
                const clearTimeValue = listClearTimeProcessForSct.find(
                  v =>
                    v.flowId === row.original.FLOW_ID &&
                    v.flowId === row.original.FLOW_ID &&
                    v.processId === row.original.PROCESS_ID
                )
                let value =
                  Number(clearTimeValue?.clearTimeForSct) /
                  Number(yrGRValue?.yieldAccumulationForSct) /
                  Number(yrGRValue?.goStraightRateForSct)
                const indirectRateOfDirectProcessCost = getValues(
                  'indirectCost.main.costCondition.directCostCondition.indirectRateOfDirectProcessCost'
                )
                return (value = value * 10000 * (1 + (indirectRateOfDirectProcessCost ?? 0)))
              }
              const compare = () => {
                const yrGRValue = listYieldRateGoStraightRateProcessForSct_SctCompareNo1.find(
                  v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
                )
                const clearTimeValue = listClearTimeForSctProcess_SctCompareNo1.find(
                  v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
                )
                let value =
                  Number(clearTimeValue?.clearTimeForSct) /
                  Number(yrGRValue?.yieldAccumulationForSct) /
                  Number(yrGRValue?.goStraightRateForSct)
                const indirectRateOfDirectProcessCost = getValues(
                  'indirectCost.SctCompareNo1.costCondition.directCostCondition.indirectRateOfDirectProcessCost'
                )
                return (value = value * 10000 * (1 + indirectRateOfDirectProcessCost))
              }
              if (!main() || !compare()) {
                return <></>
              }
              return <> {formatNumber(main() - compare(), 2, true)}</>
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
              const yrGRValue = listYieldRateGoStraightRateProcessForSct_SctCompareNo2.find(
                v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
              )

              const clearTimeValue = listClearTimeForSctProcess_SctCompareNo2.find(
                v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
              )

              let value =
                Number(clearTimeValue?.clearTimeForSct) /
                Number(yrGRValue?.yieldAccumulationForSct) /
                Number(yrGRValue?.goStraightRateForSct)

              const indirectRateOfDirectProcessCost = getValues(
                'indirectCost.SctCompareNo2.costCondition.directCostCondition.indirectRateOfDirectProcessCost'
              )
              value = value * 10000 * (1 + indirectRateOfDirectProcessCost)

              return <> {formatNumber(value, 2, true)}</>
            }
          },
          {
            accessorKey: 'DIFF_PROCESS_STANDARD_TIME_NO_2',
            header: 'DIFF PROCESS STANDARD TIME (MM)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const main = () => {
                const yrGRValue = listYieldRateGoStraightRateProcessForSct.find(
                  v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
                )
                const clearTimeValue = listClearTimeForSctProcess_SctCompareNo2.find(
                  v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
                )
                let value =
                  Number(clearTimeValue?.clearTimeForSct) /
                  Number(yrGRValue?.yieldAccumulationForSct) /
                  Number(yrGRValue?.goStraightRateForSct)
                const indirectRateOfDirectProcessCost = getValues(
                  'indirectCost.main.costCondition.directCostCondition.indirectRateOfDirectProcessCost'
                )
                return (value = value * 10000 * (1 + (indirectRateOfDirectProcessCost ?? 0)))
              }
              const compare = () => {
                const yrGRValue = listYieldRateGoStraightRateProcessForSct_SctCompareNo2.find(
                  v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
                )
                const clearTimeValue = listClearTimeForSctProcess_SctCompareNo2.find(
                  v => v.flowId === row.original.FLOW_ID && v.processId === row.original.PROCESS_ID
                )
                let value =
                  Number(clearTimeValue?.clearTimeForSct) /
                  Number(yrGRValue?.yieldAccumulationForSct) /
                  Number(yrGRValue?.goStraightRateForSct)
                const indirectRateOfDirectProcessCost = getValues(
                  'indirectCost.SctCompareNo2.costCondition.directCostCondition.indirectRateOfDirectProcessCost'
                )
                return (value = value * 10000 * (1 + indirectRateOfDirectProcessCost))
              }
              if (!main() || !compare()) {
                return <></>
              }
              return <> {formatNumber(main() - compare(), 2, true)}</>
            }
          }
        ]
      }
    ],
    [listYieldRateGoStraightRateProcessForSct, listClearTimeProcessForSct]
  )

  const table = useMaterialReactTable({
    columns,
    // data: data?.data.ResultOnDb || [],
    data: listSctFlowProcessSequence || [],
    // manualFiltering: true,
    // manualPagination: true,
    // manualSorting: true,
    // onColumnFiltersChange: setColumnFilters,
    // onColumnFilterFnsChange: setColumnFilterFns,
    //onPaginationChange: setPagination,
    // onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    //onDensityChange: setDensity,
    // onColumnPinningChange: setColumnPinning,
    // onColumnOrderChange: setColumnOrder,
    // rowCount: data?.data.TotalCountOnDb ?? 0,
    //rowCount: 0,
    isMultiSortEvent: () => true,
    enableColumnFilters: false,
    enableStickyHeader: true,
    enableColumnFilterModes: true,
    enableFacetedValues: true,
    enableColumnPinning: true,
    enableRowActions: false,
    enableColumnResizing: true,
    enableColumnOrdering: true,
    enablePagination: false,
    // enableRowNumbers: true,
    //paginationDisplayMode: 'pages',
    initialState: {
      columnPinning: {
        left: ['FLOW_CODE', 'PROCESS_NO', 'PROCESS_NAME']
      },
      density: 'compact'
    },
    state: {
      // columnFilters,
      // isLoading,
      //pagination,
      // showAlertBanner: isError || data?.data.Status === false,
      // showProgressBars: isRefetching,
      // sorting,
      //density,
      columnVisibility
      // columnPinning,
      // columnOrder,
      // columnFilterFns
    },
    defaultColumn: {
      size: 300
    },
    //layoutMode: 'grid',
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
        {/* <Typography>
          Yield Rate & Go Straight Rate :{' '}
          {watch('directCost.flowProcess.total.main.yieldRateAndGoStraightRate.fiscalYear') ?? ''} Rev.
          {watch('directCost.flowProcess.total.main.yieldRateAndGoStraightRate.revisionNo') ?? ''}
        </Typography>
        <Typography>
          Clear Time : {watch('directCost.flowProcess.total.main.clearTime.fiscalYear') ?? ''} Rev.
          {watch('directCost.flowProcess.total.main.clearTime.revisionNo') ?? ''}
        </Typography> */}
        <div className='flex flex-col gap-4'>
          {/* <Typography variant='h5'>Details</Typography>
          <Divider /> */}
          <div className='flex flex-col gap-2'>
            <div className='flex items-center gap-1'>
              <Typography color='text.primary' className='font-medium'>
                Yield Rate & Go Straight Rate :
              </Typography>
              <Typography>
                {yieldRateAndGoStraightRate_total?.fiscalYear ?? ''} Ver.
                {yieldRateAndGoStraightRate_total?.version ?? ''}
              </Typography>

              <Typography color='text.primary' className='font-medium'>
                Flow Code :
              </Typography>
              <Typography>{yieldRateAndGoStraightRate_total?.flowCode}</Typography>

              {yieldRateAndGoStraightRate_total?.flowId != flowId ? (
                <Chip label=' Flow code doesn’t match.' variant='tonal' color={'error'} size='small' />
              ) : null}
            </div>
            <div className='flex items-center gap-1'>
              <Typography color='text.primary' className='font-medium'>
                Clear Time :
              </Typography>
              <Typography>
                {watch('directCost.flowProcess.total.main.clearTime.fiscalYear') ?? ''} Ver.
                {watch('directCost.flowProcess.total.main.clearTime.version') ?? ''}
              </Typography>
              <Typography color='text.primary' className='font-medium'>
                Flow Code :
              </Typography>
              <Typography>{watch('directCost.flowProcess.total.main.clearTime.flowCode')}</Typography>

              {watch('directCost.flowProcess.total.main.clearTime.flowId') != watch('header.bom.FLOW_ID') ? (
                <Chip label=' Flow code doesn’t match.' variant='tonal' color={'error'} size='small' />
              ) : null}
            </div>
            {/* <div className='flex items-center gap-1'>
              <Typography color='text.primary' className='font-medium'>
                Status:
              </Typography>
              <Chip label='Active' variant='tonal' color='success' size='small' />
            </div>
            <div className='flex items-center gap-1'>
              <Typography color='text.primary' className='font-medium'>
                Contact:
              </Typography>
              <Typography>+1 (234) 464-0600</Typography>
            </div>
            <div className='flex items-center gap-1'>
              <Typography color='text.primary' className='font-medium'>
                Country:
              </Typography>
              <Typography>{customerData?.country}</Typography>
            </div> */}
          </div>
        </div>
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
    renderBottomToolbar: () => (
      <div className='flex items-center justify-end gap-2 p-3'>
        <div className='flex items-center gap-2'>
          <Typography variant='body1'>
            {/* Showing {pagination.pageIndex * pagination.pageSize + 1} to{' '} */}
            {/* {pagination.pageIndex * pagination.pageSize + (data?.data?.ResultOnDb?.length ?? 0)} of{' '} */}
            {/* {pagination.pageIndex * pagination.pageSize + 0} of {table.getRowCount()} entries */}
            Showing {getValues('header.bom.TOTAL_COUNT_PROCESS')} entries
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
