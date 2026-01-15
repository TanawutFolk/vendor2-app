import { useMemo, useState } from 'react'
import Typography from '@mui/material/Typography'
import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFullScreenButton,
  MRT_VisibilityState,
  useMaterialReactTable
} from 'material-react-table'
import { useFormContext } from 'react-hook-form'
import { formatNumber } from '@/utils/formatting-checking-value/checkingValueTypes'
import { BomFlowProcessItemUsageI } from '@/_workspace/types/bom/BomFlowProcessItemUsage'
import { FormDataPage } from '../../validationSchema'
import { Pagination } from '@mui/material'
import { useCalculateYieldAccumulation } from '../../MasterDataSelection/hooks/useCalculateYieldAccumulation'
import AsyncSelect from 'react-select/async'
import { fetchSctByLikeProductTypeCodeAndCondition } from '@/_workspace/react-select/async-promise-load-options/fetchStandardCostData'
import StandardCostServices from '@/_workspace/services/sct/StandardCostServices'

const MaterialInProcessTableData = () => {
  const { getValues, watch } = useFormContext<FormDataPage>()

  const listMaterialInProcess = getValues('directCost.materialInProcess.main.body')
  const isCalculationAlready = getValues('isCalculationAlready')
  const sctResourceOptionYieldRateMaterial = getValues('masterDataSelection.yieldRateMaterial.SCT_RESOURCE_OPTION_ID')
  const listSctBomFlowProcessItemUsagePrice = getValues('listSctBomFlowProcessItemUsagePrice')
  const yieldRateData = getValues('directCost.flowProcess.body.yieldRateGoStraightRateProcessForSct.main')
  const sctStatusProgressId = getValues('header.sctStatusProgress.SCT_STATUS_PROGRESS_ID')

  const { isCalculating } = useCalculateYieldAccumulation({
    listMaterialInProcess,
    isCalculationAlready,
    sctResourceOptionYieldRateMaterial,
    listSctBomFlowProcessItemUsagePrice,
    yieldRateData
  })

  // คำนวณราคารวมอัตโนมัติ

  // const listMaterialInProcess = getValues('directCost.materialInProcess.main.body')
  // const isCalculationAlready = getValues('isCalculationAlready')
  // const sctResourceOptionYieldRateMaterial = getValues('masterDataSelection.yieldRateMaterial.SCT_RESOURCE_OPTION_ID')
  // const listSctBomFlowProcessItemUsagePrice = getValues('listSctBomFlowProcessItemUsagePrice')
  // const yieldRateData = getValues('directCost.flowProcess.body.yieldRateGoStraightRateProcessForSct.main')

  // useMemo(() => {
  //   // 1. ตรวจสอบข้อมูลพื้นฐาน
  //   if (!Array.isArray(listMaterialInProcess) || listMaterialInProcess.length === 0) {
  //     return []
  //   }

  //   if (!yieldRateData || !listSctBomFlowProcessItemUsagePrice) {
  //     console.warn('Missing required data for calculation')
  //     return listMaterialInProcess.map(params => ({
  //       ...params,
  //       price: {
  //         ...params.price,
  //         yieldAccumulation: 0 // หรือค่าดีฟอลต์
  //       }
  //     }))
  //   }

  //   // 2. สร้าง helper functions
  //   const findYieldFromPriceList = (params, isFromSctCopy = 0) => {
  //     return (
  //       listSctBomFlowProcessItemUsagePrice?.find(
  //         x =>
  //           x.BOM_FLOW_PROCESS_ITEM_USAGE_ID === params?.BOM_FLOW_PROCESS_ITEM_USAGE_ID &&
  //           x.IS_FROM_SCT_COPY === isFromSctCopy
  //       )?.YIELD_ACCUMULATION ?? ''
  //     )
  //   }

  //   const getProcessYield = params => {
  //     return (
  //       yieldRateData?.find(v => v.flowId === params?.FLOW_ID && v.processId === params?.PROCESS_ID)
  //         ?.yieldAccumulationForSct ?? ''
  //     )
  //   }

  //   const isConsumableItem = params => {
  //     return params.ITEM_CATEGORY_ID_FROM_BOM === 5
  //   }

  //   const isSpecialCItem = params => {
  //     return (
  //       params.ITEM_CODE_FOR_SUPPORT_MES?.startsWith('C') &&
  //       (params.ITEM_CATEGORY_ID_FROM_BOM === 4 || params.ITEM_CATEGORY_ID_FROM_BOM === 6)
  //     )
  //   }

  //   // 3. คำนวณผลลัพธ์

  //   for (let i = 0; i < listMaterialInProcess.length; i++) {
  //     const params = listMaterialInProcess[i]
  //     let yieldValue = ''

  //     // เงื่อนไข 1: Calculation already exists
  //     if (isCalculationAlready) {
  //       yieldValue = findYieldFromPriceList(params, 0)
  //     }
  //     // เงื่อนไข 2: SCT Selection
  //     else if (sctResourceOptionYieldRateMaterial === 4) {
  //       yieldValue = findYieldFromPriceList(params, 1)
  //     }
  //     // เงื่อนไข 3: Consumable items
  //     else if (isConsumableItem(params)) {
  //       yieldValue = 100
  //     }
  //     // เงื่อนไข 4: Special C items
  //     else if (isSpecialCItem(params)) {
  //       yieldValue = 100
  //     }
  //     // เงื่อนไข 5: Engineer adjustment
  //     else if (typeof params.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT === 'number') {
  //       yieldValue = params.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT
  //     }
  //     // เงื่อนไข 6: Process yield rate
  //     else {
  //       yieldValue = getProcessYield(params)
  //     }

  //     setValue(`directCost.materialInProcess.main.body.${i}.price.yieldAccumulation`, yieldValue)
  //   }
  //   // listMaterialInProcess.map((params, index) => {
  //   //   let yieldValue = ''

  //   //   // เงื่อนไข 1: Calculation already exists
  //   //   if (isCalculationAlready) {
  //   //     yieldValue = findYieldFromPriceList(params, 0)
  //   //   }
  //   //   // เงื่อนไข 2: SCT Selection
  //   //   else if (sctResourceOptionYieldRateMaterial === 4) {
  //   //     yieldValue = findYieldFromPriceList(params, 1)
  //   //   }
  //   //   // เงื่อนไข 3: Consumable items
  //   //   else if (isConsumableItem(params)) {
  //   //     yieldValue = 100
  //   //   }
  //   //   // เงื่อนไข 4: Special C items
  //   //   else if (isSpecialCItem(params)) {
  //   //     yieldValue = 100
  //   //   }
  //   //   // เงื่อนไข 5: Engineer adjustment
  //   //   else if (typeof params.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT === 'number') {
  //   //     yieldValue = params.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT
  //   //   }
  //   //   // เงื่อนไข 6: Process yield rate
  //   //   else {
  //   //     yieldValue = getProcessYield(params)
  //   //   }

  //   //   setValue(`directCost.materialInProcess.main.body.${index}.price.yieldAccumulation`, yieldValue)
  //   //   // ส่งคืนรูปแบบที่สม่ำเสมอ
  //   //   // return {
  //   //   //   ...params,
  //   //   //   price: {
  //   //   //     ...params.price,
  //   //   //     yieldAccumulation: yieldValue
  //   //   //   }
  //   //   // }
  //   // })
  // }, [
  //   isCalculationAlready,
  //   sctResourceOptionYieldRateMaterial,
  //   listMaterialInProcess, // ← ต้องเพิ่ม
  //   listSctBomFlowProcessItemUsagePrice,
  //   yieldRateData,
  //   setValue
  // ])

  // เซ็ตค่าอัตโนมัติเมื่อ totalPrice เปลี่ยน
  // const { fields, update } = useFieldArray({
  //   control,
  //   name: 'directCost.materialInProcess.main.body'
  // })

  // ใน useEffect
  // useEffect(() => {
  //   calculatedYields.forEach((yieldValue, index) => {
  //     if (fields[index] && fields[index].price?.yieldAccumulation !== yieldValue) {
  //       update(index, {
  //         ...fields[index],
  //         price: {
  //           ...fields[index].price,
  //           yieldAccumulation: yieldValue
  //         }
  //       })
  //     }
  //   })
  // }, [calculatedYields, fields, update])

  // const { errors } = useFormState({
  //   control
  // })

  // const listSctBomFlowProcessItemUsagePrice = useWatch({
  //   control,
  //   name: 'listSctBomFlowProcessItemUsagePrice'
  // })

  // const fields_listMaterialInProcess = useWatch({
  //   control,
  //   name: 'directCost.materialInProcess.main.body'
  // })

  // const memoizedData = useMemo(
  //   () => fields_listMaterialInProcess ?? [],
  //   [JSON.stringify(fields_listMaterialInProcess)] // ใช้ stringify สำหรับ deep comparison
  // )

  // const stableData = useMemo(() => fields_listMaterialInProcess, [JSON.stringify(fields_listMaterialInProcess)])

  // const [pagination, setPagination] = useState({
  //   pageIndex: 0,
  //   pageSize: 10
  // })

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({})
  // const [columnOrder, setColumnOrder] = useState<MRT_ColumnOrderState>([])
  // const [columnPinning, setColumnPinning] = useState<MRT_ColumnPinningState>([])
  // const [density, setDensity] = useState<MRT_DensityState>('comfortable')
  // const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])
  // const [sorting, setSorting] = useState<MRT_SortingState>([])
  // const [columnFilterFns, setColumnFilterFns] = useState<MRT_ColumnFilterFnsState>({})
  // const [pagination, setPagination] = useState<MRT_PaginationState>({
  //   pageIndex: 0,
  //   pageSize: 10
  // })

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

  // useEffect(() => {
  //   setColumnVisibility(() => {
  //     const isHasNo1 = getValues('SCT_COMPARE_NO_1')?.SCT_ID ? true : false
  //     const isHasNo2 = getValues('SCT_COMPARE_NO_2')?.SCT_ID ? true : false

  //     let No1Column = {}
  //     let No2Column = {}

  //     if (!isHasNo1) {
  //       No1Column = {
  //         AMOUNT_NO_1: false,
  //         DIFF_AMOUNT_NO_1: false,
  //         YIELD_ACCUMULATION_MATERIAL_NO_1: false,
  //         DIFF_YIELD_ACCUMULATION_MATERIAL_NO_1: false
  //       }
  //     }

  //     if (!isHasNo2) {
  //       No2Column = {
  //         AMOUNT_NO_2: false,
  //         DIFF_AMOUNT_NO_2: false,
  //         YIELD_ACCUMULATION_MATERIAL_NO_2: false,
  //         DIFF_YIELD_ACCUMULATION_MATERIAL_NO_2: false
  //       }
  //     }

  //     return {
  //       ...columnVisibility,
  //       ...No1Column,
  //       ...No2Column
  //     }
  //   })
  // }, [watch('sctComPareNo1.SCT_ID'), watch('sctComPareNo2.SCT_ID')])

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
        accessorKey: 'ITEM_CATEGORY_NAME_FROM_BOM',
        header: 'ITEM CATEGORY NAME (BOM)',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 300
      },
      {
        accessorKey: 'ITEM_EXTERNAL_SHORT_NAME',
        header: 'ITEM EXTERNAL SHORT NAME',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 400
      },
      {
        accessorKey: 'ITEM_EXTERNAL_FULL_NAME',
        header: 'ITEM EXTERNAL FULL NAME',
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
        accessorKey: 'USAGE_UNIT_CODE_FROM_MASTER',
        header: 'USAGE UNIT CODE',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 230
      },
      {
        accessorKey: 'USAGE_PRICE',
        header: 'USAGE PRICE (STANDARD PRICE) (THB)',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 350,
        //Cell: ({ row }) => <UsagePrice params={row.original} /> //UsagePrice
        Cell: ({ row }) =>
          [2, 3].includes(row.original.ITEM_CATEGORY_ID_FROM_BOM) && sctStatusProgressId === 2 ? (
            <AsyncSelect
              loadOptions={dataItem =>
                StandardCostServices.get({
                  SCT_REVISION_CODE: dataItem,
                  PRODUCT_MAIN_ID: getValues('product.productMain.PRODUCT_MAIN_ID'),
                  PRODUCT_CATEGORY_ID: '',
                  PRODUCT_SUB_ID: '',
                  PRODUCT_TYPE_ID: '',
                  SCT_PATTERN_ID: '',
                  BOM_ID: '',
                  FISCAL_YEAR: ''
                })
              }
              defaultOptions
            />
          ) : (
            formatNumber(getValues(`directCost.materialInProcess.main.body.${row.id}.price.usagePrice`), 2)
          )
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
        Cell: ({ row }) =>
          formatNumber(watch(`directCost.materialInProcess.main.body.${row.id}.price.yieldAccumulation`), 2, false, '%')
      },
      {
        accessorKey: 'AMOUNT',
        header: 'AMOUNT (THB)',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 200,
        //Cell: ({ row }) => <Amount params={row.original} />
        Cell: ({ row }) => formatNumber(watch(`directCost.materialInProcess.main.body.${row.id}.price.amount`), 7)
      },
      {
        accessorKey: 'PURCHASE_PRICE',
        header: 'PURCHASE PRICE',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 200,
        //Cell: ({ row }) => <PurchasePrice params={row.original} /> //UsagePrice
        Cell: ({ row }) =>
          formatNumber(watch(`directCost.materialInProcess.main.body.${row.id}.price.purchasePrice`), 7)
      },
      {
        accessorKey: 'PURCHASE_PRICE_CURRENCY_CODE',
        header: 'PURCHASE CURRENCY CODE',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'PURCHASE_UNIT_RATIO_FROM_MASTER',
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
        accessorKey: 'PURCHASE_UNIT_CODE_FROM_MASTER',
        header: 'PURCHASE UNIT CODE',
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
        accessorKey: 'USAGE_UNIT_RATIO_FROM_MASTER',
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
        size: 250,
        Cell: ({ cell }) => {
          return <>{formatNumber(cell.getValue())}</>
        }
      },
      // {
      //   header: 'SCT Compare No.1',
      //   columns: [
      //     {
      //       accessorKey: 'YIELD_ACCUMULATION_MATERIAL_NO_1',
      //       header: 'YIELD ACCUMULATION (%)',
      //       filterVariant: 'text',
      //       columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
      //       filterFn: 'contains',
      //       Cell: ({ row }) => {
      //         const yrGr = getValues('SCT_COMPARE_NO_1_DATA,material') ?? []
      //         const rowValue = yrGr.find(v => v.PROCESS_ID === row.original.PROCESS_ID)
      //         return <>{rowValue?.YIELD_ACCUMULATION ? rowValue.YIELD_ACCUMULATION : '-'}</>
      //       }
      //     },
      //     {
      //       accessorKey: 'DIFF_YIELD_ACCUMULATION_MATERIAL_NO_1',
      //       header: 'DIFF YIELD ACCUMULATION (%)',
      //       filterVariant: 'text',
      //       columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
      //       filterFn: 'contains',
      //       Cell: ({ row }) => {
      //         const yrGr = getValues('YR_GR') ?? []
      //         const yrGrNo1 = getValues('SCT_COMPARE_NO_1_DATA,material') ?? []
      //         const rowValue = yrGr.find(v => v.PROCESS_ID === row.original.PROCESS_ID)
      //         const rowValueNo1 = yrGrNo1.find(v => v.PROCESS_ID === row.original.PROCESS_ID)
      //         const diff = rowValue?.YIELD_ACCUMULATION_FOR_SCT - rowValueNo1?.YIELD_ACCUMULATION
      //         return <>{diff || '-'}</>
      //       }
      //     }
      //   ]
      // },
      // {
      //   header: 'SCT Compare No.2',
      //   columns: [
      //     {
      //       accessorKey: 'YIELD_ACCUMULATION_MATERIAL_NO_2',
      //       header: 'YIELD ACCUMULATION (%)',
      //       filterVariant: 'text',
      //       columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
      //       filterFn: 'contains',
      //       Cell: ({ row }) => {
      //         const yrGr = getValues('SCT_COMPARE_NO_2_DATA,material') ?? []
      //         const rowValue = yrGr.find(v => v.PROCESS_ID === row.original.PROCESS_ID)
      //         return <>{rowValue?.YIELD_ACCUMULATION ? rowValue.YIELD_ACCUMULATION : '-'}</>
      //       }
      //     },
      //     {
      //       accessorKey: 'DIFF_YIELD_ACCUMULATION_MATERIAL_NO_2',
      //       header: 'DIFF YIELD ACCUMULATION (%)',
      //       filterVariant: 'text',
      //       columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
      //       filterFn: 'contains',
      //       Cell: ({ row }) => {
      //         const yrGr = getValues('YR_GR') ?? []
      //         const yrGrNo2 = getValues('SCT_COMPARE_NO_2_DATA,material') ?? []
      //         const rowValue = yrGr.find(v => v.PROCESS_ID === row.original.PROCESS_ID)
      //         const rowValueNo2 = yrGrNo2.find(v => v.PROCESS_ID === row.original.PROCESS_ID)
      //         const diff = rowValue?.YIELD_ACCUMULATION_FOR_SCT - rowValueNo2?.YIELD_ACCUMULATION
      //         return <>{diff || '-'}</>
      //       }
      //     }
      //   ]
      // },
      // {
      //   header: 'SCT Compare No.1',
      //   columns: [
      //     {
      //       accessorKey: 'AMOUNT_NO_1',
      //       header: 'Amount',
      //       filterVariant: 'text',
      //       columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
      //       filterFn: 'contains'
      //     },
      //     {
      //       accessorKey: 'DIFF_AMOUNT_NO_1',
      //       header: 'DIFF Amount',
      //       filterVariant: 'text',
      //       columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
      //       filterFn: 'contains'
      //     }
      //   ]
      // },
      // {
      //   header: 'SCT Compare No.2',
      //   columns: [
      //     {
      //       accessorKey: 'AMOUNT_NO_2',
      //       header: 'Amount',
      //       filterVariant: 'text',
      //       columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
      //       filterFn: 'contains'
      //     },
      //     {
      //       accessorKey: 'DIFF_AMOUNT_NO_2',
      //       header: 'DIFF Amount',
      //       filterVariant: 'text',
      //       columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
      //       filterFn: 'contains'
      //     }
      //   ]
      // },
      {
        accessorKey: 'ITEM_VERSION_NO',
        header: 'ITEM CODE (VERSION)',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 230
      },
      {
        accessorKey: 'ITEM_IS_CURRENT',
        header: 'ITEM CODE (LATEST VERSION)',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        size: 300,
        Cell: ({ row }) => {
          return <>{row.original.ITEM_IS_CURRENT ? 'Yes' : 'No'}</>
        }
      }
    ],
    []
  )

  const table = useMaterialReactTable({
    columns,
    // data: data?.data.ResultOnDb || [],
    data: getValues('directCost.materialInProcess.main.body') ?? [],
    // manualFiltering: true,
    // manualPagination: false,
    // enablePagination: true,
    // paginationDisplayMode: 'pages',
    // manualSorting: true,
    // onColumnFiltersChange: setColumnFilters,
    // onColumnFilterFnsChange: setColumnFilterFns,
    //onPaginationChange: setPagination,
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
    //enableColumnFilterModes: true,
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
        left: ['ITEM_NO', 'ITEM_CODE_FOR_SUPPORT_MES', 'ITEM_CATEGORY_NAME_FROM_BOM']
        // right: ['USAGE_PRICE']
      },
      pagination: { pageIndex: 0, pageSize: 10 }
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
      //pagination // ใช้ state โดยตรง
      //pagination: table.getState().pagination // เก็บ state ปัจจุบัน
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
    //layoutMode: 'grid',
    // displayColumnDefOptions: {
    //   'mrt-row-actions': {
    //     header: 'Actions',
    //     size: 100,
    //     grow: false,
    //     muiTableHeadCellProps: {
    //       align: 'center'
    //     }
    //   },
    //   'mrt-row-select': {
    //     enableColumnActions: true,
    //     enableHiding: true,
    //     size: 100,
    //     muiTableHeadCellProps: {
    //       align: 'center'
    //     },
    //     muiTableBodyCellProps: {
    //       align: 'center'
    //     }
    //   }
    // },

    renderToolbarInternalActions: ({ table }) => (
      <>
        <MRT_ShowHideColumnsButton table={table} />
        <MRT_ToggleDensePaddingButton table={table} />
        <MRT_ToggleFullScreenButton table={table} />
      </>
    ),
    // renderTopToolbarCustomActions: () => (
    //   <div className='flex flex-col'>
    //     {/* {errors.SCT_MATERIAL && (
    //       <>
    //         <Typography
    //           sx={{
    //             color: 'var(--mui-palette-error-main)'
    //           }}
    //         >
    //           {errors.SCT_MATERIAL.message}
    //         </Typography>
    //       </>
    //     )} */}
    //   </div>
    // ),
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
    renderBottomToolbar: ({ table }) => {
      return (
        <div className='flex items-center justify-end gap-2 p-3'>
          <div className='flex items-center gap-2'>
            <Typography variant='body1'>Showing {table.getRowCount()} entries</Typography>

            <Pagination
              count={table.getPageCount()}
              page={table.getState().pagination.pageIndex + 1}
              onChange={(_event, value) => {
                console.log('Changing to page:', value)
                table.setPageIndex(value - 1)
              }}
              variant='tonal'
              shape='rounded'
              color='primary'
            />
          </div>
        </div>
      )
    },
    // renderBottomToolbar: ({ table }) => (
    //   <div className='flex items-center justify-end gap-2 p-3'>
    //     <div className='flex items-center gap-2'>
    //       <Typography variant='body1'>
    //         {/* Showing {pagination.pageIndex * pagination.pageSize + 1} to{' '} */}
    //         {/* {pagination.pageIndex * pagination.pageSize + (data?.data?.ResultOnDb?.length ?? 0)} of{' '} */}
    //         {/* {pagination.pageIndex * pagination.pageSize + 0} of {table.getRowCount()} entries */}
    //         Showing {table.getRowCount()} entries
    //       </Typography>
    //       {/* <MRT_TablePagination table={table} showRowsPerPage={false} /> */}

    //       <Pagination
    //         count={table.getPageOptions().length}
    //         page={table.getState().pagination.pageIndex + 1}
    //         onChange={(_event, value: number) => table.setPageIndex(value - 1)}
    //         variant='tonal'
    //         shape='rounded'
    //         color='primary'
    //       />
    //     </div>
    //   </div>
    // ),
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
        borderRadius: '0'
        //height: '60vh'
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
    }
    // renderColumnFilterModeMenuItems: ({ internalFilterOptions, onSelectFilterMode }): ReactNode[] => {
    //   return internalFilterOptions.map((option: MRT_InternalFilterOption) => (
    //     <MenuItem key={option.label} className='w-full gap-3' onClick={() => onSelectFilterMode(option.option)}>
    //       <div className='text-sm'>{option.symbol}</div>
    //       <div className='text-sm'>{option.label}</div>
    //     </MenuItem>
    //   ))
    // }
  })

  return (
    <>
      <MaterialReactTable table={table} />
    </>
  )
}

export default MaterialInProcessTableData
