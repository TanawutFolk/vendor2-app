import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'

import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'

import Typography from '@mui/material/Typography'

import CustomTextField from '@/components/mui/TextField'

import {
  MaterialReactTable,
  MRT_ColumnDef,
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

import { Controller, useFieldArray, useFormContext, useFormState, useWatch } from 'react-hook-form'
import { ButtonGroup, Paper } from '@mui/material'
import SctSellingSelectionModal from '../../../components/SctSellingSelectionModal'
import { Eye, X } from 'react-feather'
import {
  formatNumber,
  formatToNumberIfNanThenReturnBlank,
  is_Null_Undefined_Blank
} from '@/utils/formatting-checking-value/checkingValueTypes'
import { FormDataPage } from '../../../validationSchema'

import { BomFlowProcessItemUsageI } from '@/_workspace/types/bom/BomFlowProcessItemUsage'
import { toast } from 'react-toastify'
import YieldAccumulationOfItemForSctServices from '@/_workspace/services/yield-accumulation-of-item-for-sct/YieldAccumulationOfItemForSctServices'
import ItemManufacturingStandardPriceServices from '@/_workspace/services/item-manufacturing-standard-price/ItemManufacturingStandardPriceServices'

import type { SctBomFlowProcessItemUsagePriceType } from '@/_workspace/pages/sct/sct-for-product/modal/SctEditModal/00.BackUp/index'

const MaterialInProcessTableData = () => {
  const { getValues, setValue, watch, control } = useFormContext<FormDataPage>()

  const { errors } = useFormState({
    control
  })

  // const listSctBomFlowProcessItemUsagePrice = useWatch({
  //   control,
  //   name: 'listSctBomFlowProcessItemUsagePrice'
  // })

  const { fields: fields_listMaterialInProcess, update } = useFieldArray({
    control,
    name: 'directCost.materialInProcess.main.body'
  })

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({})
  // const [columnOrder, setColumnOrder] = useState<MRT_ColumnOrderState>([])
  // const [columnPinning, setColumnPinning] = useState<MRT_ColumnPinningState>([])
  // const [density, setDensity] = useState<MRT_DensityState>('comfortable')
  // const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])
  // const [sorting, setSorting] = useState<MRT_SortingState>([])
  // const [columnFilterFns, setColumnFilterFns] = useState<MRT_ColumnFilterFnsState>({})
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10
  })

  // const SCT_RESOURCE_OPTION_ID = useWatch({
  //     control,
  //     name: 'masterDataSelection.manufacturingItemPrice.SCT_RESOURCE_OPTION_ID',
  //     defaultValue: 0 // ช่วยกัน undefined→number เด้งไปมา
  //   })

  // const listYieldRateGoStraightRateProcessForSct = useWatch({
  //   control,
  //   name: 'directCost.flowProcess.body.yieldRateGoStraightRateProcessForSct.main' // without supply name will watch the entire form, or ['firstName', 'lastName'] to watch both
  //   // defaultValue: "default", // default value before the render
  // })

  useEffect(() => {
    setColumnVisibility(() => {
      const isHasNo1 = getValues('SCT_COMPARE_NO_1')?.SCT_ID ? true : false
      const isHasNo2 = getValues('SCT_COMPARE_NO_2')?.SCT_ID ? true : false

      let No1Column = {}
      let No2Column = {}

      if (!isHasNo1) {
        No1Column = {
          AMOUNT_NO_1: false,
          DIFF_AMOUNT_NO_1: false,
          YIELD_ACCUMULATION_MATERIAL_NO_1: false,
          DIFF_YIELD_ACCUMULATION_MATERIAL_NO_1: false
        }
      }

      if (!isHasNo2) {
        No2Column = {
          AMOUNT_NO_2: false,
          DIFF_AMOUNT_NO_2: false,
          YIELD_ACCUMULATION_MATERIAL_NO_2: false,
          DIFF_YIELD_ACCUMULATION_MATERIAL_NO_2: false
        }
      }

      return {
        ...columnVisibility,
        ...No1Column,
        ...No2Column
      }
    })
  }, [watch('SCT_COMPARE_NO_1')?.SCT_ID, watch('SCT_COMPARE_NO_1')?.SCT_ID])

  const columns = useMemo<MRT_ColumnDef<BomFlowProcessItemUsageI>[]>(
    () => [
      {
        accessorKey: 'ITEM_NO',
        header: 'ITEM NO',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 150
      },
      {
        accessorKey: 'ITEM_CODE_FOR_SUPPORT_MES',
        header: 'ITEM CODE',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 200
      },
      {
        accessorKey: 'ITEM_CATEGORY_NAME',
        header: 'ITEM CATEGORY',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 200
      },
      {
        accessorKey: 'ITEM_EXTERNAL_SHORT_NAME',
        header: 'ITEM NAME',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 400
      },
      {
        accessorKey: 'USAGE_QUANTITY',
        header: 'USAGE QTY',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 200,
        Cell: ({ cell }) => formatNumber(cell.getValue(), 7)
      },
      {
        accessorKey: 'MASTER_USAGE_UNIT_NAME',
        header: 'USAGE UNIT',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        Cell: ({ cell }) => {
          return <>{formatNumber(cell.getValue())}</>
        },
        // Cell: ({ row }) => {
        //   if (row.original?.USAGE_UNIT) {
        //     return <>{row.original.USAGE_UNIT}</>
        //   }
        //   const matPriceData = getValues('MATERIAL_PRICE_DATA') || []
        //   const rowValue = matPriceData.find(v => v.ITEM_ID === row.original.ITEM_ID)
        //   return <>{rowValue?.USAGE_UNIT ? rowValue.USAGE_UNIT : ''}</>
        // },
        size: 180
      },
      {
        accessorKey: 'USAGE_PRICE',
        header: 'USAGE PRICE (THB)',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 220,
        Cell: ({ row }) => {
          const SCT_RESOURCE_OPTION_ID = useWatch({
            control,
            name: 'masterDataSelection.manufacturingItemPrice.SCT_RESOURCE_OPTION_ID',
            defaultValue: 0
          })

          const index_listMaterialInProcess = useMemo(
            () =>
              fields_listMaterialInProcess.findIndex(
                f => f.BOM_FLOW_PROCESS_ITEM_USAGE_ID == row.original.BOM_FLOW_PROCESS_ITEM_USAGE_ID
              ),
            [fields_listMaterialInProcess, row.original.BOM_FLOW_PROCESS_ITEM_USAGE_ID]
          )

          const ITEM_M_S_PRICE_VALUE = useWatch({
            control,
            name: `directCost.materialInProcess.main.body.${index_listMaterialInProcess}.price.ITEM_M_S_PRICE_VALUE`,
            defaultValue: 0
          })

          // const yieldRateGoStraightRateProcessForSct = useWatch({
          //   control,
          //   name: `directCost.flowProcess.body.yieldRateGoStraightRateProcessForSct.main`
          //   // defaultValue: 0
          // })

          // const YIELD_ACCUMULATION_FROM_FLOW_PROCESS = yieldRateGoStraightRateProcessForSct.find(
          //   f => f.FLOW_ID == row.original.FLOW_ID && f.PROCESS_ID == row.original.PROCESS_ID
          // )

          //  ITEM_M_S_PRICE_VALUE: z.number().nullish(),
          //           ITEM_M_S_PRICE_CURRENCY: z.string().nullish(),
          //           YIELD_ACCUMULATION: z.number().nullish(),
          //           AMOUNT: z.number().nullish(),
          //           PURCHASE_PRICE_VALUE: z.number().nullish(),
          //           PURCHASE_PRICE_CURRENCY: z.string().nullish()

          useEffect(() => {
            if (!SCT_RESOURCE_OPTION_ID) return
            if (index_listMaterialInProcess < 0) return

            const targetPath = `directCost.materialInProcess.main.body.${index_listMaterialInProcess}.price` as const

            const setIfChanged = (
              next: {
                ITEM_M_S_PRICE_ID: string | undefined | null
                ITEM_M_S_PRICE_VALUE: number | undefined | null
                ITEM_M_S_PRICE_VERSION: number | undefined | null
                YIELD_ACCUMULATION: number | undefined | null
                AMOUNT: number | undefined | null
                IS_ADJUST_YIELD_ACCUMULATION: number | undefined | null
                YIELD_ACCUMULATION_DEFAULT: number | undefined | null
                ADJUST_YIELD_ACCUMULATION_VERSION_NO: number | undefined | null
                SCT_ID_SELECTION: string | undefined | null
                PURCHASE_UNIT_ID: number | undefined | null
                PURCHASE_UNIT_NAME: string | undefined | null
                USAGE_UNIT_ID: number | undefined | null
                USAGE_UNIT_NAME: string | undefined | null
                PURCHASE_PRICE: number | undefined | null
                PURCHASE_UNIT_RATIO: number | undefined | null
                EXCHANGE_RATE_VALUE: number | undefined | null
                USAGE_UNIT_RATIO: number | undefined | null
                FISCAL_YEAR: number | undefined | null
                SCT_PATTERN_ID: number | undefined | null
                PURCHASE_PRICE_CURRENCY_NAME: string | undefined | null
                PURCHASE_PRICE_CURRENCY_SYMBOL: string | undefined | null
              } | null
            ) => {
              // แปลงให้เป็น number/null เพื่อลด false-negative

              const curRaw = getValues(targetPath)
              const normCur = curRaw == null ? null : curRaw

              // กัน set ค่าเดิมซ้ำ (ป้องกันลูป)
              if (Object.is(normCur, next)) return

              // setValue(targetPath, next, { shouldValidate: true })
            }

            const isCalculationAlready = !!getValues('isCalculationAlready')

            // เคสคำนวณสำเร็จแล้ว → ดึงจาก list ที่คัดไว้
            if (isCalculationAlready) {
              const v =
                getValues('listSctBomFlowProcessItemUsagePrice')?.find(
                  x =>
                    x.BOM_FLOW_PROCESS_ITEM_USAGE_ID == row.original.BOM_FLOW_PROCESS_ITEM_USAGE_ID &&
                    x.IS_FROM_SCT_COPY == 0
                ) ?? null
              setIfChanged({
                ITEM_M_S_PRICE_ID: v?.ITEM_M_S_PRICE_ID,
                ITEM_M_S_PRICE_VALUE: v?.ITEM_M_S_PRICE_VALUE,
                ITEM_M_S_PRICE_VERSION: v?.ITEM_M_S_PRICE_VERSION,

                YIELD_ACCUMULATION: v?.YIELD_ACCUMULATION,
                AMOUNT: v?.AMOUNT,
                IS_ADJUST_YIELD_ACCUMULATION: v?.IS_ADJUST_YIELD_ACCUMULATION,
                YIELD_ACCUMULATION_DEFAULT: v?.YIELD_ACCUMULATION_DEFAULT,
                ADJUST_YIELD_ACCUMULATION_VERSION_NO: v?.ADJUST_YIELD_ACCUMULATION_VERSION_NO,

                SCT_ID_SELECTION: v?.SCT_ID_SELECTION,

                PURCHASE_UNIT_ID: v?.PURCHASE_UNIT_ID,
                PURCHASE_UNIT_NAME: v?.PURCHASE_UNIT_NAME,
                USAGE_UNIT_ID: v?.USAGE_UNIT_ID,
                USAGE_UNIT_NAME: v?.USAGE_UNIT_NAME,
                PURCHASE_PRICE: v?.PURCHASE_PRICE,
                PURCHASE_UNIT_RATIO: v?.PURCHASE_UNIT_RATIO,
                EXCHANGE_RATE_VALUE: v?.EXCHANGE_RATE_VALUE,
                USAGE_UNIT_RATIO: v?.USAGE_UNIT_RATIO,
                FISCAL_YEAR: v?.FISCAL_YEAR,
                SCT_PATTERN_ID: v?.SCT_PATTERN_ID,

                PURCHASE_PRICE_CURRENCY_NAME: v?.PURCHASE_PRICE_CURRENCY_NAME,
                PURCHASE_PRICE_CURRENCY_SYMBOL: v?.PURCHASE_PRICE_CURRENCY_SYMBOL
              })
              return
            }

            // ยังไม่คำนวณ และเป็น Option 1
            if (SCT_RESOURCE_OPTION_ID === 1) {
              const FISCAL_YEAR = getValues('header.fiscalYear.value')
              const SCT_PATTERN_ID = getValues('header.sctPatternNo.value')
              const ITEM_ID = row.original.ITEM_ID
              let alive = true

              ;(async () => {
                try {
                  const res =
                    await ItemManufacturingStandardPriceServices.getByFiscalYearAndSctPatternIdAndItemId_MasterDataLatest(
                      {
                        FISCAL_YEAR,
                        ITEM_ID,
                        SCT_PATTERN_ID
                      }
                    ).catch(() => {
                      alive = false
                      toast.error('Failed to fetch Standard Price. Please check your data.', {
                        autoClose: 10000
                      })
                    })

                  if (!alive) return

                  const dbVal: SctBomFlowProcessItemUsagePriceType | null = res?.data?.ResultOnDb?.[0] ?? null

                  if (dbVal != null) {
                    setIfChanged(dbVal)
                    return
                  }
                } catch (e) {
                  if (!alive) return
                  toast.error('Failed to fetch Standard Price. Please check your data.', {
                    autoClose: 10000
                  })
                }
              })()

              return () => {
                alive = false
              }
            }

            // Option 4 (SCT Selection)
            if (SCT_RESOURCE_OPTION_ID === 4) {
              const v =
                getValues('listSctBomFlowProcessItemUsagePrice').find(
                  x =>
                    x.BOM_FLOW_PROCESS_ITEM_USAGE_ID == row.original.BOM_FLOW_PROCESS_ITEM_USAGE_ID &&
                    x.IS_FROM_SCT_COPY == 1
                ) ?? null

              setIfChanged({
                ITEM_M_S_PRICE_ID: v?.ITEM_M_S_PRICE_ID,
                ITEM_M_S_PRICE_VALUE: v?.ITEM_M_S_PRICE_VALUE,
                ITEM_M_S_PRICE_VERSION: v?.ITEM_M_S_PRICE_VERSION,

                YIELD_ACCUMULATION: v?.YIELD_ACCUMULATION,
                AMOUNT: v?.AMOUNT,
                IS_ADJUST_YIELD_ACCUMULATION: v?.IS_ADJUST_YIELD_ACCUMULATION,
                YIELD_ACCUMULATION_DEFAULT: v?.YIELD_ACCUMULATION_DEFAULT,
                ADJUST_YIELD_ACCUMULATION_VERSION_NO: v?.ADJUST_YIELD_ACCUMULATION_VERSION_NO,

                SCT_ID_SELECTION: v?.SCT_ID_SELECTION,

                PURCHASE_UNIT_ID: v?.PURCHASE_UNIT_ID,
                PURCHASE_UNIT_NAME: v?.PURCHASE_UNIT_NAME,
                USAGE_UNIT_ID: v?.USAGE_UNIT_ID,
                USAGE_UNIT_NAME: v?.USAGE_UNIT_NAME,
                PURCHASE_PRICE: v?.PURCHASE_PRICE,
                PURCHASE_UNIT_RATIO: v?.PURCHASE_UNIT_RATIO,
                EXCHANGE_RATE_VALUE: v?.EXCHANGE_RATE_VALUE,
                USAGE_UNIT_RATIO: v?.USAGE_UNIT_RATIO,
                FISCAL_YEAR: v?.FISCAL_YEAR,
                SCT_PATTERN_ID: v?.SCT_PATTERN_ID,

                PURCHASE_PRICE_CURRENCY_NAME: v?.PURCHASE_PRICE_CURRENCY_NAME,
                PURCHASE_PRICE_CURRENCY_SYMBOL: v?.PURCHASE_PRICE_CURRENCY_SYMBOL
              })
              return
            }

            setIfChanged(null)
          }, [
            SCT_RESOURCE_OPTION_ID,
            index_listMaterialInProcess,
            row.original.BOM_FLOW_PROCESS_ITEM_USAGE_ID,
            row.original.ITEM_ID
          ])

          return <>{formatNumber(ITEM_M_S_PRICE_VALUE, 7)}</>
        }
        // Cell: ({ row }) => {
        //   if (row.original?.USAGE_PRICE) {
        //     return <>{formatNumber(row.original.USAGE_PRICE, 7)}</>
        //   }
        //   const [isOpenSctSellingSelectionModal, setIsOpenSctSellingSelectionModal] = useState(false)
        //   const [isChecked, setIsChecked] = useState(false)
        //   const matPriceData = getValues('MATERIAL_PRICE_DATA') || []
        //   const rowValue = matPriceData.find(v => v.ITEM_ID === row.original.ITEM_ID)

        //   if (rowValue?.original?.ITEM_CATEGORY_ID === 2 || rowValue?.original?.ITEM_CATEGORY_ID === 3) {
        //     const matPriceData = getValues('MATERIAL_PRICE_DATA') ?? []
        //     setValue(
        //       'MATERIAL_PRICE_DATA',
        //       matPriceData.map(m => {
        //         if (m.ITEM_M_S_PRICE_ID === rowValue.ITEM_M_S_PRICE_ID) {
        //           return { ...m, ITEM_M_S_PRICE_VALUE: 0 }
        //         }
        //         return m
        //       })
        //     )
        //     return <CustomTextField disabled={true} value={0} />
        //   }

        //   if (getValues('SCT_REASON_SETTING.SCT_REASON_SETTING_ID') === 1) {
        //     return <>{formatNumber(rowValue?.ITEM_M_S_PRICE_VALUE, 7)}</>
        //   }

        //   return (
        //     <>
        //       {rowValue?.ITEM_CATEGORY_ID === 1 ||
        //       rowValue?.ITEM_CATEGORY_ID === 2 ||
        //       rowValue?.ITEM_CATEGORY_ID === 3 ? (
        //         <Paper
        //           component='form'
        //           sx={{
        //             display: 'flex',
        //             alignItems: 'center',
        //             flexDirection: 'column',
        //             paddingX: '16px',
        //             paddingY: '8px',
        //             width: '100%'
        //           }}
        //           className={rowValue?.SCT_STATUS_PROGRESS_ID_MATERIAL === 1 ? 'border-red-500 border' : ''}
        //         >
        //           SCT Revision Code: {rowValue?.SCT_REVISION_CODE_MATERIAL ?? ''}
        //           <div className='mt-2'>
        //             <CustomTextField
        //               InputProps={{
        //                 endAdornment: (
        //                   <>
        //                     <IconButton
        //                       disabled={getValues('mode') === 'view' || getValues('SCT_STATUS_PROGRESS_ID') !== 2}
        //                       onClick={e => {
        //                         e.stopPropagation()
        //                         if (getValues('mode') === 'view' || getValues('SCT_STATUS_PROGRESS_ID') !== 2) return
        //                         const materialData = (getValues('MATERIAL_PRICE_DATA') ?? []).find(
        //                           m => m.ITEM_ID === rowValue.ITEM_ID
        //                         )
        //                         delete materialData.ITEM_M_S_PRICE_VALUE_DEFAULT
        //                         delete materialData.ITEM_M_S_PRICE_VALUE
        //                         delete materialData.SCT_REVISION_CODE_MATERIAL
        //                         delete materialData.SCT_STATUS_PROGRESS_ID_MATERIAL
        //                         delete materialData.IS_MANUAL
        //                         delete materialData.SCT_ID_MATERIAL
        //                         delete materialData.ITEM_M_S_PRICE_ID
        //                         setValue(
        //                           'MATERIAL_PRICE_DATA',
        //                           getValues('MATERIAL_PRICE_DATA').map(m =>
        //                             m.ITEM_ID === materialData.ITEM_ID ? materialData : m
        //                           )
        //                         )
        //                       }}
        //                     >
        //                       <X />
        //                     </IconButton>
        //                     <IconButton
        //                       disabled={getValues('mode') === 'view' || getValues('SCT_STATUS_PROGRESS_ID') !== 2}
        //                     >
        //                       <svg
        //                         xmlns='http://www.w3.org/2000/svg'
        //                         width='24'
        //                         height='24'
        //                         viewBox='0 0 24 24'
        //                         fill='currentColor'
        //                         className='icon icon-tabler icons-tabler-filled icon-tabler-caret-down hover:bg-none'
        //                       >
        //                         <path stroke='none' d='M0 0h24v24H0z' fill='none' />
        //                         <path d='M18 9c.852 0 1.297 .986 .783 1.623l-.076 .084l-6 6a1 1 0 0 1 -1.32 .083l-.094 -.083l-6 -6l-.083 -.094l-.054 -.077l-.054 -.096l-.017 -.036l-.027 -.067l-.032 -.108l-.01 -.053l-.01 -.06l-.004 -.057v-.118l.005 -.058l.009 -.06l.01 -.052l.032 -.108l.027 -.067l.07 -.132l.065 -.09l.073 -.081l.094 -.083l.077 -.054l.096 -.054l.036 -.017l.067 -.027l.108 -.032l.053 -.01l.06 -.01l.057 -.004l12.059 -.002z' />
        //                       </svg>
        //                     </IconButton>
        //                   </>
        //                 )
        //               }}
        //               disabled={getValues('mode') === 'view' || getValues('SCT_STATUS_PROGRESS_ID') !== 2}
        //               value={formatNumber(rowValue?.ITEM_M_S_PRICE_VALUE, 7)}
        //               onChange={e => {
        //                 if (
        //                   rowValue?.ITEM_CATEGORY_ID === 1 ||
        //                   rowValue?.ITEM_CATEGORY_ID === 2 ||
        //                   rowValue?.ITEM_CATEGORY_ID === 3
        //                 ) {
        //                   if (getValues('mode') === 'view' || getValues('SCT_STATUS_PROGRESS_ID') !== 2) return
        //                   setIsOpenSctSellingSelectionModal(true)
        //                   return
        //                 }
        //                 const matPriceData = getValues('MATERIAL_PRICE_DATA') ?? []
        //                 rowValue.ITEM_M_S_PRICE_VALUE_DEFAULT = rowValue.ITEM_M_S_PRICE_VALUE
        //                 rowValue.ITEM_M_S_PRICE_VALUE = e.target.value
        //                 rowValue.IS_MANUAL = true
        //                 setValue(
        //                   'MATERIAL_PRICE_DATA',
        //                   matPriceData.map(m => (m.ITEM_M_S_PRICE_ID === rowValue.ITEM_M_S_PRICE_ID ? rowValue : m))
        //                 )
        //                 let itemAdjust = getValues('ITEM_ADJUST') ?? []
        //                 itemAdjust.push({
        //                   BOM_FLOW_PROCESS_ITEM_USAGE_ID: row.original.BOM_FLOW_PROCESS_ITEM_USAGE_ID,
        //                   SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST_VALUE: e.target.value
        //                 })
        //                 const result = Object.values(
        //                   itemAdjust.reduce((acc, item) => {
        //                     acc[item.BOM_FLOW_PROCESS_ITEM_USAGE_ID] = item
        //                     return acc
        //                   }, {} as any)
        //                 )
        //                 setValue('ITEM_ADJUST', result)
        //               }}
        //               onClick={() => {
        //                 if (
        //                   rowValue?.ITEM_CATEGORY_ID === 1 ||
        //                   rowValue?.ITEM_CATEGORY_ID === 2 ||
        //                   rowValue?.ITEM_CATEGORY_ID === 3
        //                 ) {
        //                   if (getValues('mode') === 'view' || getValues('SCT_STATUS_PROGRESS_ID') !== 2) return
        //                   setIsOpenSctSellingSelectionModal(true)
        //                   return
        //                 }
        //                 return
        //               }}
        //             />
        //           </div>
        //           <span className='text-red-500'>
        //             {rowValue?.SCT_STATUS_PROGRESS_ID_MATERIAL == 1 ? 'This SCT has been cancelled' : null}
        //           </span>
        //         </Paper>
        //       ) : (
        //         <Paper component='form' sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        //           {/* <IconButton disabled={getValues('mode') === 'view' || getValues('SCT_STATUS_PROGRESS_ID') !== 2}>
        //             {isChecked ? (
        //               <svg
        //                 onClick={() => {
        //                   if (getValues('mode') === 'view' || getValues('SCT_STATUS_PROGRESS_ID') !== 2) return
        //                   setIsChecked(!isChecked)
        //                 }}
        //                 xmlns='http://www.w3.org/2000/svg'
        //                 width='24'
        //                 height='24'
        //                 viewBox='0 0 24 24'
        //                 fill='none'
        //                 stroke='currentColor'
        //                 stroke-width='2'
        //                 stroke-linecap='round'
        //                 stroke-linejoin='round'
        //                 class='icon icon-tabler icons-tabler-outline icon-tabler-square-check'
        //               >
        //                 <path stroke='none' d='M0 0h24v24H0z' fill='none' />
        //                 <path d='M3 3m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z' />
        //                 <path d='M9 12l2 2l4 -4' />
        //               </svg>
        //             ) : (
        //               <svg
        //                 onClick={() => {
        //                   if (getValues('mode') === 'view' || getValues('SCT_STATUS_PROGRESS_ID') !== 2) return
        //                   setIsChecked(!isChecked)
        //                 }}
        //                 xmlns='http://www.w3.org/2000/svg'
        //                 width='24'
        //                 height='24'
        //                 viewBox='0 0 24 24'
        //                 fill='none'
        //                 stroke='currentColor'
        //                 stroke-width='2'
        //                 stroke-linecap='round'
        //                 stroke-linejoin='round'
        //                 class='icon icon-tabler icons-tabler-outline icon-tabler-square'
        //               >
        //                 <path stroke='none' d='M0 0h24v24H0z' fill='none' />
        //                 <path d='M3 3m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z' />
        //               </svg>
        //             )}
        //           </IconButton> */}
        //           <CustomTextField
        //             className='w-full'
        //             disabled={getValues('mode') === 'view' || !isChecked || getValues('SCT_STATUS_PROGRESS_ID') !== 2}
        //             value={formatNumber(rowValue?.ITEM_M_S_PRICE_VALUE, 7)}
        //             onChange={e => {
        //               if (
        //                 rowValue?.ITEM_CATEGORY_ID === 1 ||
        //                 rowValue?.ITEM_CATEGORY_ID === 2 ||
        //                 rowValue?.ITEM_CATEGORY_ID === 3
        //               ) {
        //                 if (getValues('mode') === 'view' || getValues('SCT_STATUS_PROGRESS_ID') !== 2) return
        //                 setIsOpenSctSellingSelectionModal(true)
        //                 return
        //               }
        //               const matPriceData = getValues('MATERIAL_PRICE_DATA') ?? []
        //               rowValue.ITEM_M_S_PRICE_VALUE_DEFAULT = rowValue.ITEM_M_S_PRICE_VALUE
        //               rowValue.ITEM_M_S_PRICE_VALUE = e.target.value
        //               rowValue.IS_MANUAL = true
        //               setValue(
        //                 'MATERIAL_PRICE_DATA',
        //                 matPriceData.map(m => (m.ITEM_M_S_PRICE_ID === rowValue.ITEM_M_S_PRICE_ID ? rowValue : m))
        //               )
        //               let itemAdjust = getValues('ITEM_ADJUST') ?? []
        //               itemAdjust.push({
        //                 BOM_FLOW_PROCESS_ITEM_USAGE_ID: row.original.BOM_FLOW_PROCESS_ITEM_USAGE_ID,
        //                 SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST_VALUE: e.target.value
        //               })
        //               const result = Object.values(
        //                 itemAdjust.reduce((acc, item) => {
        //                   acc[item.BOM_FLOW_PROCESS_ITEM_USAGE_ID] = item
        //                   return acc
        //                 }, {} as any)
        //               )
        //               setValue('ITEM_ADJUST', result)
        //             }}
        //             onClick={() => {
        //               if (
        //                 rowValue?.ITEM_CATEGORY_ID === 1 ||
        //                 rowValue?.ITEM_CATEGORY_ID === 2 ||
        //                 rowValue?.ITEM_CATEGORY_ID === 3
        //               ) {
        //                 if (getValues('mode') === 'view' || getValues('SCT_STATUS_PROGRESS_ID') !== 2) return
        //                 setIsOpenSctSellingSelectionModal(true)
        //                 return
        //               }
        //               return
        //             }}
        //           />
        //         </Paper>
        //       )}
        //       {rowValue?.ITEM_CATEGORY_ID === 1 ||
        //         rowValue?.ITEM_CATEGORY_ID === 2 ||
        //         (rowValue?.ITEM_CATEGORY_ID === 3 && (
        //           <SctSellingSelectionModal
        //             isOpenSctSellingSelectionModal={isOpenSctSellingSelectionModal}
        //             setIsOpenSctSellingSelectionModal={setIsOpenSctSellingSelectionModal}
        //             materialData={rowValue}
        //             setValueMatPrice={setValue}
        //             getValuesMatPrice={getValues}
        //           />
        //         ))}
        //     </>
        //   )
        // }
      },
      {
        accessorKey: 'USAGE_PRICE_CURRENCY',
        header: 'USAGE PRICE CURRENCY',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        Cell: () => <>THB</>,
        size: 250
      },

      {
        accessorKey: 'PROCESS_NO',
        header: 'PROCESS NO',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 200
      },
      {
        accessorKey: 'PROCESS_NAME',
        header: 'PROCESS NAME',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'YIELD_ACCUMULATION_MATERIAL',
        header: 'YIELD ACCUMULATION (%)',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        Cell: ({ row }) => {
          const SCT_RESOURCE_OPTION_ID = useWatch({
            control,
            name: 'masterDataSelection.yieldRateMaterial.SCT_RESOURCE_OPTION_ID',
            defaultValue: 0
          })

          const index_listMaterialInProcess = useMemo(
            () =>
              fields_listMaterialInProcess.findIndex(
                f => f.BOM_FLOW_PROCESS_ITEM_USAGE_ID == row.original.BOM_FLOW_PROCESS_ITEM_USAGE_ID
              ),
            [fields_listMaterialInProcess, row.original.BOM_FLOW_PROCESS_ITEM_USAGE_ID]
          )

          const YIELD_ACCUMULATION = useWatch({
            control,
            name: `directCost.materialInProcess.main.body.${index_listMaterialInProcess}.price.YIELD_ACCUMULATION`,
            defaultValue: 0
          })

          const yieldRateGoStraightRateProcessForSct = useWatch({
            control,
            name: `directCost.flowProcess.body.yieldRateGoStraightRateProcessForSct.main`
            // defaultValue: 0
          })

          const YIELD_ACCUMULATION_FROM_FLOW_PROCESS = yieldRateGoStraightRateProcessForSct.find(
            f => f.FLOW_ID == row.original.FLOW_ID && f.PROCESS_ID == row.original.PROCESS_ID
          )

          useEffect(() => {
            if (!SCT_RESOURCE_OPTION_ID) return
            if (index_listMaterialInProcess < 0) return

            const targetPath =
              `directCost.materialInProcess.main.body.${index_listMaterialInProcess}.price.YIELD_ACCUMULATION` as const

            const setIfChanged = (next: number | null | undefined) => {
              // แปลงให้เป็น number/null เพื่อลด false-negative
              const normNext = next == null ? null : Number(next)
              const curRaw = getValues(targetPath)
              const normCur = curRaw == null ? null : Number(curRaw)

              // กัน set ค่าเดิมซ้ำ (ป้องกันลูป)
              if (Object.is(normCur, normNext)) return

              setValue(targetPath, normNext, { shouldValidate: true })
            }

            const isCalculationAlready = !!getValues('isCalculationAlready')

            // เคสคำนวณสำเร็จแล้ว → ดึงจาก list ที่คัดไว้
            if (isCalculationAlready) {
              const v =
                getValues('listSctBomFlowProcessItemUsagePrice')?.find(
                  x =>
                    x.BOM_FLOW_PROCESS_ITEM_USAGE_ID == row.original.BOM_FLOW_PROCESS_ITEM_USAGE_ID &&
                    x.IS_FROM_SCT_COPY == 0
                )?.YIELD_ACCUMULATION ?? null
              setIfChanged(v)
              return
            }

            // ยังไม่คำนวณ และเป็น Option 1
            if (SCT_RESOURCE_OPTION_ID === 1) {
              // rule เร็วๆ ที่รู้ค่าแน่นอน
              if (row.original?.ITEM_CODE_FOR_SUPPORT_MES?.startsWith('CONSU')) {
                setIfChanged(100)
                return
              }
              if (row.original?.ITEM_CODE_FOR_SUPPORT_MES?.startsWith('C') && row.original?.ITEM_CATEGORY_ID == 5) {
                setIfChanged(100)
                return
              }
              if (row.original?.ITEM_CODE_FOR_SUPPORT_MES?.startsWith('R') && row.original?.ITEM_CATEGORY_ID == 5) {
                setIfChanged(100)
                return
              }
              // ลองยิง API → ถ้าไม่มีใน DB ให้ fallback จาก process
              const FISCAL_YEAR = getValues('header.fiscalYear.value')
              const PRODUCT_TYPE_ID = getValues('product.productType.PRODUCT_TYPE_ID')
              const ITEM_ID = row.original.ITEM_ID
              let alive = true

              ;(async () => {
                try {
                  const res =
                    await YieldAccumulationOfItemForSctServices.getByFiscalYearAndProductTypeIdAndItemId_MasterDataLatest(
                      {
                        FISCAL_YEAR,
                        PRODUCT_TYPE_ID,
                        ITEM_ID
                      }
                    ).catch(() => {
                      alive = false
                      toast.error('Failed to fetch Yield Accumulation of Item for SCT. Please check your data.', {
                        autoClose: 10000
                      })
                    })

                  if (!alive) return

                  const dbVal: number | null =
                    (res?.data?.ResultOnDb?.[0]?.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT as number | undefined) ?? null

                  if (dbVal != null) {
                    setIfChanged(dbVal)
                    return
                  }

                  // fallback จาก process
                  const fallback =
                    getValues('directCost.flowProcess.body.yieldRateGoStraightRateProcessForSct.main')?.find(
                      v => v.FLOW_ID == row.original.FLOW_ID && v.PROCESS_ID == row.original.PROCESS_ID
                    )?.YIELD_ACCUMULATION_FOR_SCT ?? null

                  setIfChanged(fallback)
                } catch (e) {
                  if (!alive) return
                  toast.error('Failed to fetch Yield Accumulation of Item for SCT. Please check your data.', {
                    autoClose: 10000
                  })
                  const fallback =
                    getValues('directCost.flowProcess.body.yieldRateGoStraightRateProcessForSct.main')?.find(
                      v => v.FLOW_PROCESS_ID == row.original.FLOW_PROCESS_ID
                    )?.YIELD_ACCUMULATION_FOR_SCT ?? null
                  setIfChanged(fallback)
                }
              })()

              return () => {
                alive = false
              }
            }

            // Option 4 (SCT Selection)
            if (SCT_RESOURCE_OPTION_ID === 4) {
              const v =
                getValues('listSctBomFlowProcessItemUsagePrice').find(
                  x =>
                    x.BOM_FLOW_PROCESS_ITEM_USAGE_ID == row.original.BOM_FLOW_PROCESS_ITEM_USAGE_ID &&
                    x.IS_FROM_SCT_COPY == 1
                )?.YIELD_ACCUMULATION ?? null
              setIfChanged(v)
              return
            }

            // option อื่นๆ → เซ็ต null
            setIfChanged(null)
          }, [
            SCT_RESOURCE_OPTION_ID,
            index_listMaterialInProcess,
            row.original.BOM_FLOW_PROCESS_ITEM_USAGE_ID,
            row.original.ITEM_ID,
            YIELD_ACCUMULATION_FROM_FLOW_PROCESS
          ])

          // แสดงผล: ใช้ getValues แบบเดิมได้ (ง่ายสุด)
          return <>{formatNumber(YIELD_ACCUMULATION, 7)}</>
        }
      },
      {
        accessorKey: 'AMOUNT',
        header: 'Amount',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 200,
        Cell: ({ row }) => {
          // let AMOUNT =
          //   matPriceDataValue && yrGrValue
          //     ? (usageQty * matPriceDataValue.ITEM_M_S_PRICE_VALUE) / (YIELD_ACCUMULATION_FOR_SCT / 100)
          //     : 0
          // return <>{formatNumber(row.original.AMOUNT, 7)}</>

          const index_listMaterialInProcess = useMemo(
            () =>
              fields_listMaterialInProcess.findIndex(
                f => f.BOM_FLOW_PROCESS_ITEM_USAGE_ID == row.original.BOM_FLOW_PROCESS_ITEM_USAGE_ID
              ),
            [fields_listMaterialInProcess, row.original.BOM_FLOW_PROCESS_ITEM_USAGE_ID]
          )

          const USAGE_QUANTITY = row.original.USAGE_QUANTITY
          const YIELD_ACCUMULATION_MATERIAL = getValues(
            `directCost.materialInProcess.main.body.${index_listMaterialInProcess}.price.YIELD_ACCUMULATION`
          )

          const ITEM_M_S_PRICE_VALUE = getValues(
            `directCost.materialInProcess.main.body.${index_listMaterialInProcess}.price.ITEM_M_S_PRICE_VALUE`
          )

          if (
            is_Null_Undefined_Blank(ITEM_M_S_PRICE_VALUE) === false &&
            is_Null_Undefined_Blank(YIELD_ACCUMULATION_MATERIAL) === false &&
            is_Null_Undefined_Blank(USAGE_QUANTITY) === false
          ) {
            const AMOUNT = (USAGE_QUANTITY * (ITEM_M_S_PRICE_VALUE ?? 0)) / ((YIELD_ACCUMULATION_MATERIAL ?? 0) / 100)

            return <>{formatNumber(AMOUNT, 7, true, '')}</>
          } else {
            return <></>
          }
        }
        // Cell: ({ row }) => {
        //   if (row.original?.AMOUNT) {
        //     return <>{formatNumber(row.original.AMOUNT, 7)}</>
        //   }
        //   const yrGr = getValues('YR_GR') ?? []
        //   const matPriceData = getValues('MATERIAL_PRICE_DATA') || []
        //   const yieldMaterials = getValues('YIELD_MATERIAL_DATA') || []
        //   const yieldMaterialValue = yieldMaterials.find(v => v.ITEM_ID === row.original.ITEM_ID)
        //   const matPriceDataValue = matPriceData.find(v => v.ITEM_ID === row.original.ITEM_ID)
        //   const usageQty = row.original.USAGE_QUANTITY
        //   const yrGrValue = yieldMaterialValue ?? yrGr.find(v => v.PROCESS_ID === row.original.PROCESS_ID)
        //   let YIELD_ACCUMULATION_FOR_SCT = 0
        //   if (row.original.ITEM_CODE_FOR_SUPPORT_MES?.toString()?.toUpperCase()?.startsWith('CONSU')) {
        //     YIELD_ACCUMULATION_FOR_SCT = 100
        //   } else if (
        //     row.original.ITEM_CODE_FOR_SUPPORT_MES?.toString()?.toUpperCase()?.startsWith('C') &&
        //     row.original.ITEM_CATEGORY_ID == '5'
        //   ) {
        //     YIELD_ACCUMULATION_FOR_SCT = 100
        //   } else if (
        //     row.original.ITEM_CODE_FOR_SUPPORT_MES?.toString()?.toUpperCase()?.startsWith('R') &&
        //     row.original.ITEM_CATEGORY_ID == '5'
        //   ) {
        //     YIELD_ACCUMULATION_FOR_SCT = 100
        //   } else if (yieldMaterialValue) {
        //     YIELD_ACCUMULATION_FOR_SCT = yieldMaterialValue.YIELD_ACCUMULATION_FOR_SCT
        //   } else {
        //     YIELD_ACCUMULATION_FOR_SCT = yrGr.find(
        //       v => v.PROCESS_ID === row.original.PROCESS_ID
        //     )?.YIELD_ACCUMULATION_FOR_SCT
        //   }
        //   const value =
        //     matPriceDataValue && yrGrValue
        //       ? (usageQty * matPriceDataValue.ITEM_M_S_PRICE_VALUE) / (YIELD_ACCUMULATION_FOR_SCT / 100)
        //       : 0
        //   if (value) {
        //     if (!(getValues('MATERIAL_AMOUNT') ?? []).find(v => v.ITEM_NO === row.original.ITEM_NO)) {
        //       setValue('MATERIAL_AMOUNT', [
        //         ...(getValues('MATERIAL_AMOUNT') ?? []),
        //         { ITEM_NO: row.original.ITEM_NO, ITEM_CATEGORY_ID: row.original.ITEM_CATEGORY_ID, AMOUNT: value }
        //       ])
        //     } else if (getValues('MATERIAL_AMOUNT')?.find(v => v.ITEM_NO === row.original.ITEM_NO)) {
        //       setValue(
        //         'MATERIAL_AMOUNT',
        //         (getValues('MATERIAL_AMOUNT') ?? []).map(v =>
        //           v.ITEM_NO === row.original.ITEM_NO ? { ...v, AMOUNT: value } : v
        //         )
        //       )
        //     }
        //   }
        //   return <>{formatNumber(value, 7)}</>
        // }
      },
      {
        accessorKey: 'PURCHASE_PRICE',
        header: 'PURCHASE PRICE',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 200,
        Cell: ({ row }) => {
          if (row.original?.PURCHASE_PRICE) {
            return <>{formatNumber(row.original.PURCHASE_PRICE)}</>
          }
          const matPriceData = getValues('MATERIAL_PRICE_DATA') || []
          const rowValue = matPriceData.find(v => v.ITEM_ID === row.original.ITEM_ID)
          return <>{formatNumber(rowValue?.PURCHASE_PRICE)}</>
        }
      },
      {
        accessorKey: 'PURCHASE_PRICE_CURRENCY',
        header: 'PURCHASE PRICE CURRENCY',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        Cell: ({ row }) => {
          if (row.original?.PURCHASE_PRICE_CURRENCY) return <>{row.original.PURCHASE_PRICE_CURRENCY}</>
          const matPriceData = getValues('MATERIAL_PRICE_DATA') || []
          const rowValue = matPriceData.find(v => v.ITEM_ID === row.original.ITEM_ID)
          return <>{rowValue?.PURCHASE_PRICE_CURRENCY ? rowValue.PURCHASE_PRICE_CURRENCY : ''}</>
        }
      },
      {
        accessorKey: 'PURCHASE_UNIT_RATIO',
        header: 'PURCHASE UNIT RATIO',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        Cell: ({ cell }) => {
          return <>{formatNumber(cell.getValue())}</>
        },
        // Cell: ({ row }) => {
        //   if (row.original?.PURCHASE_UNIT_RATIO) return <>{row.original.PURCHASE_UNIT_RATIO}</>
        //   const matPriceData = getValues('MATERIAL_PRICE_DATA') || []
        //   const rowValue = matPriceData.find(v => v.ITEM_ID === row.original.ITEM_ID)
        //   return <>{rowValue?.PURCHASE_UNIT_RATIO ? rowValue.PURCHASE_UNIT_RATIO : ''}</>
        // },
        size: 250
      },
      {
        accessorKey: 'PURCHASE_UNIT_NAME',
        header: 'PURCHASE UNIT',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        // Cell: ({ row }) => {
        //   if (row.original?.PURCHASE_UNIT) return <>{row.original.PURCHASE_UNIT}</>
        //   const matPriceData = getValues('MATERIAL_PRICE_DATA') || []
        //   const rowValue = matPriceData.find(v => v.ITEM_ID === row.original.ITEM_ID)
        //   return <>{rowValue?.PURCHASE_UNIT ? rowValue.PURCHASE_UNIT : ''}</>
        // },
        size: 200
      },
      {
        accessorKey: 'USAGE_UNIT_RATIO',
        header: 'USAGE UNIT RATIO',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        // Cell: ({ row }) => {
        //   if (row.original?.USAGE_UNIT_RATIO) return <>{formatNumber(row.original.USAGE_UNIT_RATIO)}</>
        //   const matPriceData = getValues('MATERIAL_PRICE_DATA') || []
        //   const rowValue = matPriceData.find(v => v.ITEM_ID === row.original.ITEM_ID)
        //   return <>{formatNumber(rowValue?.USAGE_UNIT_RATIO)}</>
        // },
        size: 250
      },
      {
        header: 'SCT Compare No.1',
        columns: [
          {
            accessorKey: 'YIELD_ACCUMULATION_MATERIAL_NO_1',
            header: 'YIELD ACCUMULATION (%)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const yrGr = getValues('SCT_COMPARE_NO_1_DATA,material') ?? []
              const rowValue = yrGr.find(v => v.PROCESS_ID === row.original.PROCESS_ID)
              return <>{rowValue?.YIELD_ACCUMULATION ? rowValue.YIELD_ACCUMULATION : '-'}</>
            }
          },
          {
            accessorKey: 'DIFF_YIELD_ACCUMULATION_MATERIAL_NO_1',
            header: 'DIFF YIELD ACCUMULATION (%)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const yrGr = getValues('YR_GR') ?? []
              const yrGrNo1 = getValues('SCT_COMPARE_NO_1_DATA,material') ?? []
              const rowValue = yrGr.find(v => v.PROCESS_ID === row.original.PROCESS_ID)
              const rowValueNo1 = yrGrNo1.find(v => v.PROCESS_ID === row.original.PROCESS_ID)
              const diff = rowValue?.YIELD_ACCUMULATION_FOR_SCT - rowValueNo1?.YIELD_ACCUMULATION
              return <>{diff || '-'}</>
            }
          }
        ]
      },
      {
        header: 'SCT Compare No.2',
        columns: [
          {
            accessorKey: 'YIELD_ACCUMULATION_MATERIAL_NO_2',
            header: 'YIELD ACCUMULATION (%)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const yrGr = getValues('SCT_COMPARE_NO_2_DATA,material') ?? []
              const rowValue = yrGr.find(v => v.PROCESS_ID === row.original.PROCESS_ID)
              return <>{rowValue?.YIELD_ACCUMULATION ? rowValue.YIELD_ACCUMULATION : '-'}</>
            }
          },
          {
            accessorKey: 'DIFF_YIELD_ACCUMULATION_MATERIAL_NO_2',
            header: 'DIFF YIELD ACCUMULATION (%)',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains',
            Cell: ({ row }) => {
              const yrGr = getValues('YR_GR') ?? []
              const yrGrNo2 = getValues('SCT_COMPARE_NO_2_DATA,material') ?? []
              const rowValue = yrGr.find(v => v.PROCESS_ID === row.original.PROCESS_ID)
              const rowValueNo2 = yrGrNo2.find(v => v.PROCESS_ID === row.original.PROCESS_ID)
              const diff = rowValue?.YIELD_ACCUMULATION_FOR_SCT - rowValueNo2?.YIELD_ACCUMULATION
              return <>{diff || '-'}</>
            }
          }
        ]
      },
      {
        header: 'SCT Compare No.1',
        columns: [
          {
            accessorKey: 'AMOUNT_NO_1',
            header: 'Amount',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains'
          },
          {
            accessorKey: 'DIFF_AMOUNT_NO_1',
            header: 'DIFF Amount',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains'
          }
        ]
      },
      {
        header: 'SCT Compare No.2',
        columns: [
          {
            accessorKey: 'AMOUNT_NO_2',
            header: 'Amount',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains'
          },
          {
            accessorKey: 'DIFF_AMOUNT_NO_2',
            header: 'DIFF Amount',
            filterVariant: 'text',
            columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
            filterFn: 'contains'
          }
        ]
      }
    ],
    []
  )

  const table = useMaterialReactTable({
    columns,
    // data: data?.data.ResultOnDb || [],
    data: fields_listMaterialInProcess ?? [],
    // manualFiltering: true,
    manualPagination: true,
    // manualSorting: true,
    // onColumnFiltersChange: setColumnFilters,
    // onColumnFilterFnsChange: setColumnFilterFns,
    // onPaginationChange: setPagination,
    // onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    // onDensityChange: setDensity,
    // onColumnPinningChange: setColumnPinning,
    // onColumnOrderChange: setColumnOrder,
    // rowCount: data?.data.TotalCountOnDb ?? 0,
    //rowCount: 0,
    //isMultiSortEvent: () => true,
    enableColumnFilters: false,
    enableStickyHeader: true,
    enableColumnFilterModes: true,
    //enableFacetedValues: true,
    enableColumnPinning: true,
    enableRowActions: false,
    enableColumnResizing: true,
    enableColumnOrdering: true,
    // enableRowNumbers: true,
    // paginationDisplayMode: 'pages',
    initialState: {
      density: 'compact',
      columnPinning: {
        left: ['ITEM_NO', 'ITEM_CODE_FOR_SUPPORT_MES'],
        right: ['USAGE_PRICE']
      }
    },
    state: {
      // columnFilters,
      // isLoading,
      // pagination,
      // showAlertBanner: isError || data?.data.Status === false,
      // showProgressBars: isRefetching,
      // sorting,
      // density,
      columnVisibility
      // columnPinning,
      // columnOrder,
      // columnFilterFns
    },
    defaultColumn: {
      size: 300
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
        <MRT_ShowHideColumnsButton table={table} />
        <MRT_ToggleDensePaddingButton table={table} />
        <MRT_ToggleFullScreenButton table={table} />
      </>
    ),
    renderTopToolbarCustomActions: () => (
      <div className='flex flex-col'>
        {/* {errors.SCT_MATERIAL && (
          <>
            <Typography
              sx={{
                color: 'var(--mui-palette-error-main)'
              }}
            >
              {errors.SCT_MATERIAL.message}
            </Typography>
          </>
        )} */}
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
            Showing {table.getRowCount()} entries
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
        height: '60vh'
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

export default MaterialInProcessTableData
