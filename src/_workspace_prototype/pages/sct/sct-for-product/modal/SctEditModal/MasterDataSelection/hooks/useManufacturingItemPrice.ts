import { useCallback, useState, useRef, useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { toast } from 'react-toastify'
import { FormDataPage } from '../../validationSchema'
import getErrorMessage from '@/utils/getErrorMessage'

export function useManufacturingItemPrice(isLoading: boolean) {
  const { control, setValue, getValues } = useFormContext<FormDataPage>()
  const [isFetching, setIsFetching] = useState(false)

  const abortControllerRef = useRef<AbortController | null>(null)
  const isProcessingRef = useRef(false)

  // ✅ ใช้ type ที่ถูกต้อง
  const [isCalculationAlready, sctResourceOptionId, SCT_ID] = useWatch({
    control,
    name: ['isCalculationAlready', 'masterDataSelection.manufacturingItemPrice.SCT_RESOURCE_OPTION_ID', 'header.SCT_ID']
  })

  // const listMaterialInProcess = useWatch({
  //   control,
  //   name: 'directCost.materialInProcess.main.body'
  // })

  // ✅ ฟังก์ชันที่เหลือตามเดิม...
  const updateMaterialPrices = useCallback(
    (
      data: {
        BOM_FLOW_PROCESS_ITEM_USAGE_ID: number
        ITEM_M_S_PRICE_VALUE: number | null
        ITEM_CATEGORY_ID_FROM_BOM: number
        PURCHASE_PRICE: number | null
        PURCHASE_PRICE_CURRENCY_CODE: string | null
      }[]
    ) => {
      if (isProcessingRef.current || !data?.length) return

      isProcessingRef.current = true

      try {
        data.forEach(item => {
          if (item.BOM_FLOW_PROCESS_ITEM_USAGE_ID !== undefined) {
            const index_listMaterialInProcess = getValues('directCost.materialInProcess.main.body')?.findIndex(
              f => f.BOM_FLOW_PROCESS_ITEM_USAGE_ID == item.BOM_FLOW_PROCESS_ITEM_USAGE_ID
            )

            setValue(
              `directCost.materialInProcess.main.body.${index_listMaterialInProcess}.price.usagePrice`,

              isCalculationAlready === false &&
                sctResourceOptionId == 1 &&
                [2, 3].includes(item.ITEM_CATEGORY_ID_FROM_BOM)
                ? ''
                : item.ITEM_M_S_PRICE_VALUE,

              { shouldDirty: false, shouldTouch: false, shouldValidate: false }
            )
            setValue(
              `directCost.materialInProcess.main.body.${index_listMaterialInProcess}.price.purchasePrice`,

              sctResourceOptionId == 1 && [2, 3].includes(item.ITEM_CATEGORY_ID_FROM_BOM) ? '' : item.PURCHASE_PRICE,
              { shouldDirty: false, shouldTouch: false, shouldValidate: false }
            )
            setValue(
              `directCost.materialInProcess.main.body.${index_listMaterialInProcess}.price.purchasePriceCurrencyCode`,
              sctResourceOptionId == 1 && [2, 3].includes(item.ITEM_CATEGORY_ID_FROM_BOM)
                ? ''
                : item.PURCHASE_PRICE_CURRENCY_CODE,
              { shouldDirty: false, shouldTouch: false, shouldValidate: false }
            )
          }
        })
      } finally {
        setTimeout(() => {
          isProcessingRef.current = false
        }, 0)
      }
    },
    [setValue, sctResourceOptionId, getValues, isCalculationAlready]
  )

  const handleCalculationAlreadyCase = useCallback(() => {
    const listData = getValues('listSctBomFlowProcessItemUsagePrice')?.filter(f => f.IS_FROM_SCT_COPY === 0)
    if (listData?.length) {
      updateMaterialPrices(
        listData.map(dataItem => ({
          ITEM_CATEGORY_ID_FROM_BOM: 0, // no need to control
          PURCHASE_PRICE: dataItem.PURCHASE_PRICE,
          PURCHASE_PRICE_CURRENCY_CODE: dataItem.PURCHASE_PRICE_CURRENCY_CODE,
          BOM_FLOW_PROCESS_ITEM_USAGE_ID: dataItem.BOM_FLOW_PROCESS_ITEM_USAGE_ID,
          ITEM_M_S_PRICE_VALUE: dataItem.ITEM_M_S_PRICE_VALUE
        }))
      )
    }
  }, [getValues, updateMaterialPrices])

  const handleMasterDataCase = useCallback(() => {
    const materialInProcess = getValues('directCost.materialInProcess.main.body')
    if (materialInProcess?.length) {
      updateMaterialPrices(
        materialInProcess.map(dataItem => ({
          ITEM_CATEGORY_ID_FROM_BOM: dataItem.ITEM_CATEGORY_ID_FROM_BOM,
          PURCHASE_PRICE: dataItem.PURCHASE_PRICE,
          PURCHASE_PRICE_CURRENCY_CODE: dataItem.PURCHASE_PRICE_CURRENCY_CODE,
          BOM_FLOW_PROCESS_ITEM_USAGE_ID: dataItem.BOM_FLOW_PROCESS_ITEM_USAGE_ID,
          ITEM_M_S_PRICE_VALUE: dataItem.ITEM_M_S_PRICE_VALUE
        }))
      )
    }
  }, [getValues, updateMaterialPrices])

  const handleSCTSelectionCase = useCallback(() => {
    const listData = getValues('listSctBomFlowProcessItemUsagePrice')?.filter(f => f.IS_FROM_SCT_COPY === 1)
    if (listData?.length) {
      updateMaterialPrices(
        listData.map(dataItem => ({
          ITEM_CATEGORY_ID_FROM_BOM: 0, // no need to control
          PURCHASE_PRICE: dataItem.PURCHASE_PRICE,
          PURCHASE_PRICE_CURRENCY_CODE: dataItem.PURCHASE_PRICE_CURRENCY_CODE,
          BOM_FLOW_PROCESS_ITEM_USAGE_ID: dataItem.BOM_FLOW_PROCESS_ITEM_USAGE_ID,
          ITEM_M_S_PRICE_VALUE: dataItem.ITEM_M_S_PRICE_VALUE
        }))
      )
    }
  }, [getValues, updateMaterialPrices])

  const fetchData = useCallback(async () => {
    if (isLoading || isFetching || !SCT_ID || isProcessingRef.current) {
      return
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    setIsFetching(true)

    try {
      if (isCalculationAlready) {
        await handleCalculationAlreadyCase()
      } else {
        switch (sctResourceOptionId) {
          case 1:
            await handleMasterDataCase()
            break
          case 4:
            await handleSCTSelectionCase()
            break
          default:
            console.warn('No matching case for sctResourceOptionId:', sctResourceOptionId)
            toast.error('Direct Cost Condition not found')
        }
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      toast.error(`Error in calculation already case: ${errorMessage}`)
    } finally {
      setIsFetching(false)
    }
  }, [
    isLoading,
    isFetching,
    SCT_ID,
    isCalculationAlready,
    sctResourceOptionId,
    handleCalculationAlreadyCase,
    handleMasterDataCase,
    handleSCTSelectionCase
  ])

  useEffect(() => {
    if (!SCT_ID || sctResourceOptionId === undefined) {
      return
    }

    const timer = setTimeout(() => {
      fetchData()
    }, 200)

    return () => {
      clearTimeout(timer)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [sctResourceOptionId, SCT_ID, isCalculationAlready, fetchData])

  return {
    refetch: fetchData,
    isFetching
  }
}
