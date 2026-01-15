import { formatNumber, is_Null_Undefined_Blank } from '@/utils/formatting-checking-value/checkingValueTypes'
import { CustomCellRendererProps } from 'ag-grid-react'
import { useFormContext, useWatch } from 'react-hook-form'
import { FormDataPage } from '../../../validationSchema'
import { toast } from 'react-toastify'
import YieldAccumulationOfItemForSctServices from '@/_workspace/services/yield-accumulation-of-item-for-sct/YieldAccumulationOfItemForSctServices'
import React, { useEffect, useMemo, useRef } from 'react'

/**
 * Module-level cache & pending map
 * - cache: เก็บผลเรียกสำเร็จ (รวม null) → ให้ cell ต่าง ๆ ใช้ร่วมกัน
 * - pending: เก็บ Promise ที่กำลัง fetch อยู่ → ถ้า cell อื่นร้องขอ key เดียวกัน จะ reuse promise
 */
const yieldCache = new Map<string, number | null>()
const pendingFetches = new Map<string, Promise<number | null>>()

type FetchKey = { fiscalYear: string | number; productTypeId: number | string; itemId: number | string }
const makeKey = ({ fiscalYear, productTypeId, itemId }: FetchKey) => `${fiscalYear}::${productTypeId}::${itemId}`

// async function fetchYieldAccumulationCached(keyObj: FetchKey) {
//   const key = makeKey(keyObj)

//   if (yieldCache.has(key)) {
//     return yieldCache.get(key) ?? null
//   }

//   if (pendingFetches.has(key)) {
//     return pendingFetches.get(key)!
//   }

//   const p = (async () => {
//     try {
//       const res = await YieldAccumulationOfItemForSctServices.getByFiscalYearAndProductTypeIdAndItemId_MasterDataLatest(
//         {
//           FISCAL_YEAR: keyObj.fiscalYear,
//           PRODUCT_TYPE_ID: keyObj.productTypeId,
//           ITEM_ID: keyObj.itemId
//         }
//       )
//       // parse result (ตามโค้ดเดิม)
//       let dbVal: number | null = null
//       if (res?.data?.ResultOnDb?.length > 0) {
//         dbVal = (res.data.ResultOnDb[0]?.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT as number | undefined) ?? null
//       }
//       yieldCache.set(key, dbVal)
//       return dbVal
//     } catch (e) {
//       // don't cache on network error — caller can fallback
//       throw e
//     } finally {
//       pendingFetches.delete(key)
//     }
//   })()

//   pendingFetches.set(key, p)
//   return p
// }

/**
 * YieldAccumulation cell renderer
 *
 * Note:
 * - ใช้ cache/pending เพื่อหลีกเลี่ยง fetch ซ้ำ
 * - เมื่อ setValue ให้ปิด shouldValidate/shouldDirty/shouldTouch เพื่อลดงานของ RHF
 * - ถ้าเป็นไปได้ ให้ AG Grid ใช้ valueGetter แทน component นี้ (ลดการ mount/unmount ของ React component)
 */
const YieldAccumulation = React.memo((params: CustomCellRendererProps) => {
  const { getValues, setValue, control } = useFormContext<FormDataPage>()

  const listMaterialInProcess = useWatch({
    control,
    name: 'directCost.materialInProcess.main.body'
  })

  const SCT_RESOURCE_OPTION_ID_YieldRateMaterial = useWatch({
    control,
    name: 'masterDataSelection.yieldRateMaterial.SCT_RESOURCE_OPTION_ID',
    defaultValue: 0
  })

  const SCT_RESOURCE_OPTION_ID_YR = useWatch({
    control,
    name: 'masterDataSelection.yieldRateAndGoStraightRate.SCT_RESOURCE_OPTION_ID',
    defaultValue: 0
  })

  const index_listMaterialInProcess = useMemo(
    () =>
      listMaterialInProcess?.findIndex(
        f => f.BOM_FLOW_PROCESS_ITEM_USAGE_ID == params.data.BOM_FLOW_PROCESS_ITEM_USAGE_ID
      ),
    // listMaterialInProcess is stable reference from useFieldArray, but still include length changes
    [listMaterialInProcess.length, params.data.BOM_FLOW_PROCESS_ITEM_USAGE_ID]
  )

  const YIELD_ACCUMULATION = useWatch({
    control,
    name: `directCost.materialInProcess.main.body.${index_listMaterialInProcess}.price.YIELD_ACCUMULATION`,
    defaultValue: 0
  })

  // ref to prevent setting state after unmount
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    // guard early
    if (!SCT_RESOURCE_OPTION_ID_YieldRateMaterial || !SCT_RESOURCE_OPTION_ID_YR) return
    if (index_listMaterialInProcess < 0) return

    const targetPath =
      `directCost.materialInProcess.main.body.${index_listMaterialInProcess}.price.YIELD_ACCUMULATION` as const

    const setIfChanged = (next: number | null | undefined) => {
      const normNext = next == null ? null : Number(next)
      const curRaw = getValues(targetPath)
      const normCur = curRaw == null ? null : Number(curRaw)
      if (Object.is(normCur, normNext)) return

      // IMPORTANT: reduce RHF side-effects: don't trigger validation/dirty/touch unless needed
      setValue(targetPath, normNext, { shouldValidate: false, shouldDirty: false, shouldTouch: false })
    }

    const isCalculationAlready = !!getValues('isCalculationAlready')
    if (isCalculationAlready) {
      const v =
        getValues('listSctBomFlowProcessItemUsagePrice')?.find(
          x => x.BOM_FLOW_PROCESS_ITEM_USAGE_ID == params.data.BOM_FLOW_PROCESS_ITEM_USAGE_ID && x.IS_FROM_SCT_COPY == 0
        )?.YIELD_ACCUMULATION ?? null
      setIfChanged(v)
      return
    }

    if (params.data?.ITEM_CODE_FOR_SUPPORT_MES?.startsWith('CONSU')) {
      setIfChanged(100)
      return
    }
    if (params.data?.ITEM_CODE_FOR_SUPPORT_MES?.startsWith('C') && params.data?.ITEM_CATEGORY_ID == 5) {
      setIfChanged(100)
      return
    }
    if (params.data?.ITEM_CODE_FOR_SUPPORT_MES?.startsWith('R') && params.data?.ITEM_CATEGORY_ID == 5) {
      setIfChanged(100)
      return
    }

    // option 4 path (from listSct...) -> prefer sync
    if (SCT_RESOURCE_OPTION_ID_YieldRateMaterial === 4) {
      const sctBomFlowProcessItemUsagePrice = getValues('listSctBomFlowProcessItemUsagePrice')?.find(
        v =>
          v.BOM_FLOW_PROCESS_ITEM_USAGE_ID == params.data.BOM_FLOW_PROCESS_ITEM_USAGE_ID &&
          v.IS_FROM_SCT_COPY == 1 &&
          v.IS_ADJUST_YIELD_ACCUMULATION == 1
      )?.YIELD_ACCUMULATION

      if (is_Null_Undefined_Blank(sctBomFlowProcessItemUsagePrice) === false) {
        setIfChanged(sctBomFlowProcessItemUsagePrice)
        return
      } else {
        const fallback =
          getValues('directCost.flowProcess.body.yieldRateGoStraightRateProcessForSct.main')?.find(
            v => v.FLOW_ID == params.data.FLOW_ID && v.PROCESS_ID == params.data.PROCESS_ID
          )?.YIELD_ACCUMULATION_FOR_SCT ?? null

        setIfChanged(fallback)
        return
      }
    }

    // main branch: option === 1
    if (SCT_RESOURCE_OPTION_ID_YieldRateMaterial === 1) {
      const FISCAL_YEAR = getValues('header.fiscalYear.value')
      const PRODUCT_TYPE_ID = getValues('product.productType.PRODUCT_TYPE_ID')
      const ITEM_ID = params.data.ITEM_ID

      const keyObj = { fiscalYear: FISCAL_YEAR, productTypeId: PRODUCT_TYPE_ID, itemId: ITEM_ID }
      const key = makeKey(keyObj)

      // 1) ถ้ามีค่าใน cache -> set sync (ช่วยลดงานอย่างมาก)
      if (yieldCache.has(key)) {
        setIfChanged(yieldCache.get(key) ?? null)
        return
      }

      // 2) ถ้าไม่มี -> call cached fetch (shared promise)
      let alive = true
      // fetchYieldAccumulationCached(keyObj)
      //   .then(dbVal => {
      //     if (!alive || !mountedRef.current) return
      //     // ถ้า dbVal === undefined treat as null
      //     if (dbVal != null) {
      //       setIfChanged(dbVal)
      //     } else {
      //       // fallback to flowProcess value (ถ้า db null)
      //       const fallback =
      //         getValues('directCost.flowProcess.body.yieldRateGoStraightRateProcessForSct.main')?.find(
      //           v => v.FLOW_ID == params.data.FLOW_ID && v.PROCESS_ID == params.data.PROCESS_ID
      //         )?.YIELD_ACCUMULATION_FOR_SCT ?? null
      //       setIfChanged(fallback)
      //     }
      //   })
      //   .catch(err => {
      //     // แสดง toast แค่ครั้งเดียวต่อ key (หลีกเลี่ยง spam) — เช็คว่า cache ไม่มี key นี้อยู่
      //     if (!yieldCache.has(key)) {
      //       // throttle toast by only showing if not already cached error (simple heuristic)
      //       toast.error('Failed to fetch Yield Accumulation of Item for SCT. Please check your data.', {
      //         autoClose: 10000
      //       })
      //     }
      //     // fallback
      //     const fallback =
      //       getValues('directCost.flowProcess.body.yieldRateGoStraightRateProcessForSct.main')?.find(
      //         v => v.FLOW_ID == params.data.FLOW_ID && v.PROCESS_ID == params.data.PROCESS_ID
      //       )?.YIELD_ACCUMULATION_FOR_SCT ?? null
      //     if (mountedRef.current) setIfChanged(fallback)
      //   })

      return () => {
        alive = false
      }
    }

    // default: set null
    setIfChanged(null)
    // intentionally no deps on getValues/setValue to avoid frequent re-run; we rely on watches above
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    SCT_RESOURCE_OPTION_ID_YieldRateMaterial,
    SCT_RESOURCE_OPTION_ID_YR,
    index_listMaterialInProcess,
    params.data.BOM_FLOW_PROCESS_ITEM_USAGE_ID
  ])

  const formatted = useMemo(() => formatNumber(YIELD_ACCUMULATION, 7), [YIELD_ACCUMULATION])
  return <>{formatted}</>
})

export default YieldAccumulation
