import { useCallback, useMemo, useState, useEffect } from 'react'
import { FormDataPage } from '../../validationSchema'
import { useFormContext } from 'react-hook-form'

interface YieldRateDataItem {
  flowId?: string
  processId?: string
  yieldAccumulationForSct?: number | string
}

// interface SctBomFlowProcessItem {
//   BOM_FLOW_PROCESS_ITEM_USAGE_ID?: string
//   IS_FROM_SCT_COPY?: number
//   YIELD_ACCUMULATION?: number | string
// }

interface UseCalculateYieldAccumulationProps {
  listMaterialInProcess: FormDataPage['directCost']['materialInProcess']['main']['body'] | []
  isCalculationAlready: boolean
  sctResourceOptionYieldRateMaterial: number | string
  listSctBomFlowProcessItemUsagePrice: FormDataPage['listSctBomFlowProcessItemUsagePrice']
  yieldRateData: FormDataPage['directCost']['flowProcess']['body']['yieldRateGoStraightRateProcessForSct']['main']
  // setValue: (path: string, value: any) => void
  // getValues?: any
}

interface UseCalculateYieldAccumulationReturn {
  isCalculating: boolean
  calculateYieldAccumulation: () => Promise<void>
  calculationStatus: {
    totalItems: number
    processedItems: number
    hasError: boolean
  }
}

export const useCalculateYieldAccumulation = ({
  listMaterialInProcess,
  isCalculationAlready,
  sctResourceOptionYieldRateMaterial,
  listSctBomFlowProcessItemUsagePrice,
  yieldRateData
}: UseCalculateYieldAccumulationProps): UseCalculateYieldAccumulationReturn => {
  const { getValues, setValue } = useFormContext<FormDataPage>()

  const [isCalculating, setIsCalculating] = useState(false)
  const [calculationStatus, setCalculationStatus] = useState({
    totalItems: 0,
    processedItems: 0,
    hasError: false
  })

  // Helper functions
  const findYieldFromPriceList = useCallback(
    (
      params: FormDataPage['directCost']['materialInProcess']['main']['body'][0],
      isFromSctCopy: number = 0
    ): number | string => {
      if (!listSctBomFlowProcessItemUsagePrice || !params?.BOM_FLOW_PROCESS_ITEM_USAGE_ID) {
        return ''
      }

      const found = listSctBomFlowProcessItemUsagePrice.find(
        x =>
          x.BOM_FLOW_PROCESS_ITEM_USAGE_ID === params.BOM_FLOW_PROCESS_ITEM_USAGE_ID &&
          x.IS_FROM_SCT_COPY === isFromSctCopy
      )

      return found?.YIELD_ACCUMULATION ?? ''
    },
    [listSctBomFlowProcessItemUsagePrice]
  )

  const getProcessYield = useCallback(
    (params: FormDataPage['directCost']['materialInProcess']['main']['body'][0]): number | string => {
      if (!yieldRateData || !params?.FLOW_ID || !params?.PROCESS_ID) {
        return ''
      }

      const found = yieldRateData.find(v => v.flowId === params.FLOW_ID && v.processId === params.PROCESS_ID)

      return found?.yieldAccumulationForSct ?? ''
    },
    [yieldRateData]
  )

  const isConsumableItem = useCallback(
    (params: FormDataPage['directCost']['materialInProcess']['main']['body'][0]): boolean => {
      return params.ITEM_CATEGORY_ID_FROM_BOM === 5
    },
    []
  )

  const isSpecialCItem = useCallback(
    (params: FormDataPage['directCost']['materialInProcess']['main']['body'][0]): boolean => {
      return (
        !!params.ITEM_CODE_FOR_SUPPORT_MES?.startsWith('C') &&
        (params.ITEM_CATEGORY_ID_FROM_BOM === 4 || params.ITEM_CATEGORY_ID_FROM_BOM === 6)
      )
    },
    []
  )

  // Main calculation function
  const calculateYieldAccumulation = useCallback(async () => {
    // Validation
    if (!Array.isArray(listMaterialInProcess) || listMaterialInProcess.length === 0) {
      console.warn('No material in process data to calculate')
      return
    }

    if (!yieldRateData || !listSctBomFlowProcessItemUsagePrice) {
      console.warn('Missing required data for calculation')
      // Set default values
      listMaterialInProcess.forEach((params, index) => {
        setValue(`directCost.materialInProcess.main.body.${index}.price.yieldAccumulation`, 0)
      })
      return
    }

    setIsCalculating(true)
    setCalculationStatus(prev => ({
      ...prev,
      totalItems: listMaterialInProcess.length,
      processedItems: 0,
      hasError: false
    }))

    try {
      // Process each item
      for (let i = 0; i < listMaterialInProcess.length; i++) {
        const params = listMaterialInProcess[i]
        let yieldValue: number

        try {
          // Condition 1: Calculation already exists
          if (isCalculationAlready) {
            yieldValue = findYieldFromPriceList(params, 0)
          }
          // Condition 2: SCT Selection
          else if (sctResourceOptionYieldRateMaterial === 4) {
            yieldValue = findYieldFromPriceList(params, 1)
          }
          // Condition 3: Consumable items
          else if (isConsumableItem(params)) {
            yieldValue = 100
          }
          // Condition 4: Special C items
          else if (isSpecialCItem(params)) {
            yieldValue = 100
          }
          // Condition 5: Engineer adjustment
          else if (typeof params.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT === 'number') {
            yieldValue = params.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT
          }
          // Condition 6: Process yield rate
          else {
            yieldValue = getProcessYield(params)
          }

          // Set the calculated value
          setValue(`directCost.materialInProcess.main.body.${i}.price.yieldAccumulation`, yieldValue)

          const calculatedAmount =
            (params.USAGE_QUANTITY * (getValues(`directCost.materialInProcess.main.body.${i}.price.usagePrice`) ?? 0)) /
            ((yieldValue ?? 1) / 100)

          setValue(
            `directCost.materialInProcess.main.body.${i}.price.amount`,
            getValues(`directCost.materialInProcess.main.body.${i}.price.usagePrice`) === null ? '' : calculatedAmount
          )

          // Update progress
          setCalculationStatus(prev => ({
            ...prev,
            processedItems: i + 1
          }))
        } catch (error) {
          console.error(`Error calculating yield for item ${i}:`, error)
          setValue(`directCost.materialInProcess.main.body.${i}.price.yieldAccumulation`, 0)

          setCalculationStatus(prev => ({
            ...prev,
            hasError: true
          }))
        }
      }
    } catch (error) {
      console.error('Error in calculateYieldAccumulation:', error)
      setCalculationStatus(prev => ({
        ...prev,
        hasError: true
      }))
    } finally {
      setIsCalculating(false)
    }
  }, [
    listMaterialInProcess,
    isCalculationAlready,
    sctResourceOptionYieldRateMaterial,
    listSctBomFlowProcessItemUsagePrice,
    yieldRateData,
    setValue,
    findYieldFromPriceList,
    getProcessYield,
    isConsumableItem,
    isSpecialCItem
  ])

  // Auto-calculate when dependencies change (optional)
  useEffect(() => {
    const shouldAutoCalculate =
      Array.isArray(listMaterialInProcess) &&
      listMaterialInProcess.length > 0 &&
      yieldRateData &&
      listSctBomFlowProcessItemUsagePrice

    if (shouldAutoCalculate && !isCalculating) {
      calculateYieldAccumulation()
    }
  }, [
    listMaterialInProcess,
    isCalculationAlready,
    sctResourceOptionYieldRateMaterial,
    calculateYieldAccumulation,
    isCalculating
  ])

  // Memoized status summary
  const memoizedStatus = useMemo(
    () => calculationStatus,
    [calculationStatus.totalItems, calculationStatus.processedItems, calculationStatus.hasError]
  )

  return {
    isCalculating,
    calculateYieldAccumulation,
    calculationStatus: memoizedStatus
  }
}

// Hook สำหรับใช้งานใน component
// export const useMaterialYieldCalculation = () => {
//   const [isLoading, setIsLoading] = useState(false)

//   const calculateYield = useCallback(
//     async (
//       props: Omit<UseCalculateYieldAccumulationProps, 'setValue'> & {
//         setValue: (path: string, value: any) => void
//       }
//     ) => {
//       setIsLoading(true)

//       const { calculateYieldAccumulation } = useCalculateYieldAccumulation(props)

//       try {
//         await calculateYieldAccumulation()
//       } finally {
//         setIsLoading(false)
//       }
//     },
//     []
//   )

//   return {
//     isLoading,
//     calculateYield
//   }
// }

// ตัวอย่างการใช้งานใน component:
/*
const YourComponent = () => {
  const { setValue, getValues, watch } = useForm()

  // ดึงค่าจาก form
  const listMaterialInProcess = getValues('directCost.materialInProcess.main.body')
  const isCalculationAlready = getValues('isCalculationAlready')
  const sctResourceOptionYieldRateMaterial = getValues('masterDataSelection.yieldRateMaterial.SCT_RESOURCE_OPTION_ID')
  const listSctBomFlowProcessItemUsagePrice = getValues('listSctBomFlowProcessItemUsagePrice')
  const yieldRateData = getValues('directCost.flowProcess.body.yieldRateGoStraightRateProcessForSct.main')

  // ใช้ hook
  const {
    isCalculating,
    calculateYieldAccumulation,
    calculationStatus
  } = useCalculateYieldAccumulation({
    listMaterialInProcess,
    isCalculationAlready,
    sctResourceOptionYieldRateMaterial,
    listSctBomFlowProcessItemUsagePrice,
    yieldRateData,
    setValue
  })

  // หรือใช้แบบมี loading state แยก
  const { isLoading, calculateYield } = useMaterialYieldCalculation()

  const handleManualCalculate = async () => {
    await calculateYield({
      listMaterialInProcess,
      isCalculationAlready,
      sctResourceOptionYieldRateMaterial,
      listSctBomFlowProcessItemUsagePrice,
      yieldRateData,
      setValue
    })
  }

  return (
    <div>
      {isCalculating && <div>กำลังคำนวณ... {calculationStatus.processedItems}/{calculationStatus.totalItems}</div>}
      <button onClick={calculateYieldAccumulation} disabled={isCalculating}>
        คำนวณ Yield
      </button>
    </div>
  )
}
*/
