import { useFormContext, useWatch } from 'react-hook-form'
import React, { useMemo, useEffect, useRef } from 'react'
import { formatNumber } from '@/utils/formatting-checking-value/checkingValueTypes'
import { FormDataPage } from '../../../../validationSchema'

interface Props {
  params: FormDataPage['directCost']['materialInProcess']['main']['body'][0]
}

const YieldAccumulation: React.FC<Props> = ({ params }) => {
  const { control, setValue } = useFormContext<FormDataPage>()
  const previousCalculatedValueRef = useRef<string | number>('')

  const listMaterialInProcess = useWatch({
    control,
    name: 'directCost.materialInProcess.main.body'
  })

  const index_listMaterialInProcess = useMemo(
    () =>
      listMaterialInProcess?.findIndex(f => f.BOM_FLOW_PROCESS_ITEM_USAGE_ID == params?.BOM_FLOW_PROCESS_ITEM_USAGE_ID),
    [listMaterialInProcess, params?.BOM_FLOW_PROCESS_ITEM_USAGE_ID]
  )

  const [
    isCalculationAlready,
    sctResourceOptionYieldRateMaterial,
    listSctBomFlowProcessItemUsagePrice,
    yieldRateData,
    yieldAccumulation
  ] = useWatch({
    control,
    name: [
      'isCalculationAlready',
      'masterDataSelection.yieldRateMaterial.SCT_RESOURCE_OPTION_ID',
      'listSctBomFlowProcessItemUsagePrice',
      'directCost.flowProcess.body.yieldRateGoStraightRateProcessForSct.main',
      `directCost.materialInProcess.main.body.${index_listMaterialInProcess}.price.yieldAccumulation`
    ]
  })

  const specificYieldRate = useMemo(() => {
    return (
      yieldRateData?.find(v => v.flowId === params?.FLOW_ID && v.processId === params?.PROCESS_ID)
        ?.yieldAccumulationForSct ?? ''
    )
  }, [yieldRateData, params?.FLOW_ID, params?.PROCESS_ID])

  const calculatedValue = useMemo(() => {
    try {
      if (!params) {
        return ''
      }

      // 1. Cal already
      if (isCalculationAlready) {
        const foundItem = listSctBomFlowProcessItemUsagePrice?.find(
          x => x.BOM_FLOW_PROCESS_ITEM_USAGE_ID === params?.BOM_FLOW_PROCESS_ITEM_USAGE_ID && x.IS_FROM_SCT_COPY === 0
        )
        return foundItem?.YIELD_ACCUMULATION ?? ''
      }

      // 2. SCT Selection
      if (sctResourceOptionYieldRateMaterial === 4) {
        const foundItem = listSctBomFlowProcessItemUsagePrice?.find(
          x => x.BOM_FLOW_PROCESS_ITEM_USAGE_ID === params?.BOM_FLOW_PROCESS_ITEM_USAGE_ID && x.IS_FROM_SCT_COPY === 1
        )
        return foundItem?.YIELD_ACCUMULATION ?? ''
      }

      // 3. Item Category ของ BOM = 'Consumable'
      if (params.ITEM_CATEGORY_ID_FROM_BOM === 5) {
        return 100
      }

      // 4. ITEM_CODE ขึ้นต้นด้วย 'C'
      if (
        params.ITEM_CODE_FOR_SUPPORT_MES?.startsWith('C') &&
        (params.ITEM_CATEGORY_ID_FROM_BOM === 4 || params.ITEM_CATEGORY_ID_FROM_BOM === 6)
      ) {
        return 100
      }

      // 5. Item - Material Yield Accumulation rate นั้น ถูก Adjust ด้วย Engineer
      if (typeof params.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT === 'number') {
        return params.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT
      }

      // 6. ใช้ Yield Accumulation rate ของ Process
      return specificYieldRate ?? ''
    } catch (error) {
      console.error('Error calculating yield accumulation:', error)
      return ''
    }
  }, [
    sctResourceOptionYieldRateMaterial,
    isCalculationAlready,
    listSctBomFlowProcessItemUsagePrice,
    specificYieldRate,
    params
  ])

  // ใช้ useEffect เพื่อ setValue แบบปลอดภัย
  useEffect(() => {
    if (index_listMaterialInProcess === -1) return

    // ตรวจสอบว่า calculatedValue เปลี่ยนแปลงจริงๆ และไม่ใช่ค่าเดิม
    if (calculatedValue != previousCalculatedValueRef.current) {
      setValue(
        `directCost.materialInProcess.main.body.${index_listMaterialInProcess}.price.yieldAccumulation`,
        calculatedValue as number | undefined | null,
        {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        }
      )
      previousCalculatedValueRef.current = calculatedValue
    }
  }, [calculatedValue, index_listMaterialInProcess, setValue])

  return formatNumber(yieldAccumulation, 2, true, '%')
}

export default YieldAccumulation
