import { formatNumber, is_Null_Undefined_Blank } from '@/utils/formatting-checking-value/checkingValueTypes'
import { CustomCellRendererProps } from 'ag-grid-react'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { FormDataPage } from '../../../validationSchema'
import { toast } from 'react-toastify'
import YieldAccumulationOfItemForSctServices from '@/_workspace/services/yield-accumulation-of-item-for-sct/YieldAccumulationOfItemForSctServices'
import { useEffect, useMemo } from 'react'

const YieldAccumulation = (params: CustomCellRendererProps) => {
  const { getValues, setValue, control } = useFormContext<FormDataPage>()

  const { fields: fields_listMaterialInProcess } = useFieldArray({
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
      fields_listMaterialInProcess.findIndex(
        f => f.BOM_FLOW_PROCESS_ITEM_USAGE_ID == params.data.BOM_FLOW_PROCESS_ITEM_USAGE_ID
      ),
    [fields_listMaterialInProcess, params.data.BOM_FLOW_PROCESS_ITEM_USAGE_ID]
  )

  const YIELD_ACCUMULATION = useWatch({
    control,
    name: `directCost.materialInProcess.main.body.${index_listMaterialInProcess}.price.YIELD_ACCUMULATION`,
    defaultValue: 0
  })

  useEffect(
    () => {
      if (!SCT_RESOURCE_OPTION_ID_YieldRateMaterial || !SCT_RESOURCE_OPTION_ID_YR) return
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

      if (isCalculationAlready) {
        const v =
          getValues('listSctBomFlowProcessItemUsagePrice')?.find(
            x =>
              x.BOM_FLOW_PROCESS_ITEM_USAGE_ID == params.data.BOM_FLOW_PROCESS_ITEM_USAGE_ID && x.IS_FROM_SCT_COPY == 0
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

      let alive = true

      if (SCT_RESOURCE_OPTION_ID_YieldRateMaterial === 1) {
        const FISCAL_YEAR = getValues('header.fiscalYear.value')
        const PRODUCT_TYPE_ID = getValues('product.productType.PRODUCT_TYPE_ID')
        const ITEM_ID = params.data.ITEM_ID

        const fetchYieldAccumulationOfItemForSct = async () => {
          try {
            const res =
              await YieldAccumulationOfItemForSctServices.getByFiscalYearAndProductTypeIdAndItemId_MasterDataLatest({
                FISCAL_YEAR,
                PRODUCT_TYPE_ID,
                ITEM_ID
              }).catch(() => {
                alive = false
                toast.error('Failed to fetch Yield Accumulation of Item for SCT. Please check your data.', {
                  autoClose: 10000
                })
              })

            if (!alive) return

            if (res?.data?.ResultOnDb?.length > 0) {
              const dbVal: number | null =
                (res?.data?.ResultOnDb?.[0]?.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT as number | undefined) ?? null

              if (dbVal != null) {
                setIfChanged(dbVal)
                return
              }
            } else {
              const fallback =
                getValues('directCost.flowProcess.body.yieldRateGoStraightRateProcessForSct.main')?.find(
                  v => v.FLOW_ID == params.data.FLOW_ID && v.PROCESS_ID == params.data.PROCESS_ID
                )?.YIELD_ACCUMULATION_FOR_SCT ?? null

              setIfChanged(fallback)
            }
          } catch (e) {
            if (!alive) return
            toast.error('Failed to fetch Yield Accumulation of Item for SCT. Please check your data.', {
              autoClose: 10000
            })
            // const fallback =
            //   getValues('directCost.flowProcess.body.yieldRateGoStraightRateProcessForSct.main')?.find(
            //     v => v.FLOW_PROCESS_ID == params.data.FLOW_PROCESS_ID
            //   )?.YIELD_ACCUMULATION_FOR_SCT ?? null
            // setIfChanged(fallback)
          }
        }

        fetchYieldAccumulationOfItemForSct()
      } else if (SCT_RESOURCE_OPTION_ID_YieldRateMaterial === 4) {
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

      // option อื่นๆ → เซ็ต null
      setIfChanged(null)

      return () => {
        alive = false
      }
    },
    [
      // SCT_RESOURCE_OPTION_ID_YieldRateMaterial,
      // SCT_RESOURCE_OPTION_ID_YR
      // index_listMaterialInProcess,
      // params.data.BOM_FLOW_PROCESS_ITEM_USAGE_ID,
      // params.data.ITEM_ID,
      //YIELD_ACCUMULATION_FROM_FLOW_PROCESS
    ]
  )

  return <>{formatNumber(YIELD_ACCUMULATION, 7)}</>
}

export default YieldAccumulation
