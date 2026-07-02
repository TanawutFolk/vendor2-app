import { useCallback, useState, useRef, useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { toast } from 'react-toastify'

import getErrorMessage from '@/utils/getErrorMessage'
import { FormDataPage } from '../../validationSchema'

const MENU_NAME = 'Direct Cost Condition'

interface FetchState {
  isFetching: boolean
  error: string | null
}

export function useManufacturingItemPrice(isLoading: boolean) {
  const { control, setValue, getValues } = useFormContext<FormDataPage>()
  const [fetchState, setFetchState] = useState<FetchState>({
    isFetching: false,
    error: null
  })

  const abortControllerRef = useRef<AbortController | null>(null)
  const fetchTimeoutRef = useRef<NodeJS.Timeout>()
  const previousCriticalDepsRef = useRef<string>('')

  // ✅ Watch all dependencies that should trigger re-fetch
  const [isCalculationAlready, sctResourceOptionId, productMainId, itemCategoryId, SCT_ID] = useWatch({
    control,
    name: [
      'isCalculationAlready',
      'masterDataSelection.manufacturingItemPrice.SCT_RESOURCE_OPTION_ID',
      'product.productMain.PRODUCT_MAIN_ID',
      'product.itemCategory.ITEM_CATEGORY_ID',
      'header.SCT_ID'
    ]
  })

  // ✅ Create critical dependency key (เฉพาะ field ที่ต้องการ track)
  const criticalDependencyKey = JSON.stringify({
    sctResourceOptionId
    // ไม่รวม fields อื่นที่ไม่ต้องการ track
  })

  // ✅ Abort ongoing request
  const abortRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  // ✅ Clear timeout
  const clearFetchTimeout = useCallback(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current)
      fetchTimeoutRef.current = undefined
    }
  }, [])

  // ✅ 1. handleCalculationAlreadyCase
  const handleCalculationAlreadyCase = useCallback(async () => {
    const listSctBomFlowProcessItemUsagePrice = getValues('listSctBomFlowProcessItemUsagePrice')?.filter(
      f => f.IS_FROM_SCT_COPY == 0
    )

    for (let i = 0; i < listSctBomFlowProcessItemUsagePrice.length; i++) {
      const index_listMaterialInProcess = listSctBomFlowProcessItemUsagePrice?.findIndex(
        f => f.BOM_FLOW_PROCESS_ITEM_USAGE_ID == listSctBomFlowProcessItemUsagePrice[i].BOM_FLOW_PROCESS_ITEM_USAGE_ID
      )

      setValue(
        `directCost.materialInProcess.main.body.${index_listMaterialInProcess}.price.usagePrice`,
        listSctBomFlowProcessItemUsagePrice[i].ITEM_M_S_PRICE_VALUE,
        {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true
        }
      )

      setValue(
        `directCost.materialInProcess.main.body.${index_listMaterialInProcess}.price.purchasePrice`,
        listSctBomFlowProcessItemUsagePrice[i].PURCHASE_PRICE,
        {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true
        }
      )

      setValue(
        `directCost.materialInProcess.main.body.${index_listMaterialInProcess}.price.purchasePriceCurrencyCode`,
        listSctBomFlowProcessItemUsagePrice[i].PURCHASE_PRICE_CURRENCY_CODE,
        {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true
        }
      )

      previousCriticalDepsRef.current = JSON.stringify({
        sctResourceOptionId
      })
    }
  }, [sctResourceOptionId, getValues, setValue])

  // ✅ 2. handleMasterDataCase
  const handleMasterDataCase = useCallback(async () => {
    const materialInProcess = getValues('directCost.materialInProcess.main.body')

    for (let i = 0; i < materialInProcess.length; i++) {
      const index_listMaterialInProcess = materialInProcess?.findIndex(
        f => f.BOM_FLOW_PROCESS_ITEM_USAGE_ID == materialInProcess[i].BOM_FLOW_PROCESS_ITEM_USAGE_ID
      )

      setValue(
        `directCost.materialInProcess.main.body.${index_listMaterialInProcess}.price.usagePrice`,
        materialInProcess[i].ITEM_M_S_PRICE_VALUE,
        {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true
        }
      )

      setValue(
        `directCost.materialInProcess.main.body.${index_listMaterialInProcess}.price.purchasePrice`,
        materialInProcess[i].PURCHASE_PRICE,
        {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true
        }
      )

      setValue(
        `directCost.materialInProcess.main.body.${index_listMaterialInProcess}.price.purchasePriceCurrencyCode`,
        materialInProcess[i].PURCHASE_PRICE_CURRENCY_CODE,
        {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true
        }
      )

      previousCriticalDepsRef.current = JSON.stringify({
        sctResourceOptionId
      })
    }
  }, [sctResourceOptionId, getValues, setValue])

  // ✅ 1. handleSCTSelectionCase
  const handleSCTSelectionCase = useCallback(async () => {
    const listSctBomFlowProcessItemUsagePrice = getValues('listSctBomFlowProcessItemUsagePrice')?.filter(
      f => f.IS_FROM_SCT_COPY == 1
    )

    for (let i = 0; i < listSctBomFlowProcessItemUsagePrice.length; i++) {
      const index_listMaterialInProcess = listSctBomFlowProcessItemUsagePrice?.findIndex(
        f => f.BOM_FLOW_PROCESS_ITEM_USAGE_ID == listSctBomFlowProcessItemUsagePrice[i].BOM_FLOW_PROCESS_ITEM_USAGE_ID
      )

      setValue(
        `directCost.materialInProcess.main.body.${index_listMaterialInProcess}.price.usagePrice`,
        listSctBomFlowProcessItemUsagePrice[i].ITEM_M_S_PRICE_VALUE,
        {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true
        }
      )

      setValue(
        `directCost.materialInProcess.main.body.${index_listMaterialInProcess}.price.purchasePrice`,
        listSctBomFlowProcessItemUsagePrice[i].PURCHASE_PRICE,
        {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true
        }
      )

      setValue(
        `directCost.materialInProcess.main.body.${index_listMaterialInProcess}.price.purchasePriceCurrencyCode`,
        listSctBomFlowProcessItemUsagePrice[i].PURCHASE_PRICE_CURRENCY_CODE,
        {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true
        }
      )

      previousCriticalDepsRef.current = JSON.stringify({
        sctResourceOptionId
      })
    }
  }, [sctResourceOptionId, getValues, setValue])

  // ✅ Main fetch function
  const fetchData = useCallback(async (): Promise<void> => {
    if (isLoading || fetchState.isFetching || !SCT_ID) {
      console.log('Skipping fetch - conditions not met', {
        isLoading,
        isFetching: fetchState.isFetching,
        SCT_ID,
        productMainId,
        itemCategoryId
      })
      return
    }

    // Abort any ongoing request
    abortRequest()

    // Set up new abort controller
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    console.log('🔄 Fetching indirect cost condition...', {
      //fiscalYear,
      sctResourceOptionId,
      isCalculationAlready
    })

    setFetchState(prev => ({ ...prev, isFetching: true, error: null }))

    try {
      if (isCalculationAlready) {
        await handleCalculationAlreadyCase()
      } else {
        console.log('fetchData - sctResourceOptionId:', sctResourceOptionId)

        switch (sctResourceOptionId) {
          case 1:
            await handleMasterDataCase()
            break
          case 4:
            await handleSCTSelectionCase()
            break
          default:
            toast.error(`${MENU_NAME} not found`, { autoClose: 10000 })
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🔴 Fetch indirect cost condition aborted')
        return
      }

      const errorMessage = getErrorMessage(error)
      console.error('🔴 Fetch error:', errorMessage)
      setFetchState(prev => ({ ...prev, error: errorMessage }))
      toast.error(`Error fetching indirect cost condition: ${errorMessage}`)
    } finally {
      if (!signal.aborted) {
        setFetchState(prev => ({ ...prev, isFetching: false }))
        abortControllerRef.current = null
      }
    }
  }, [
    isLoading,
    fetchState.isFetching,
    SCT_ID,
    productMainId,
    itemCategoryId,
    abortRequest,
    isCalculationAlready,
    sctResourceOptionId,
    handleCalculationAlreadyCase,
    handleMasterDataCase,
    handleSCTSelectionCase
  ])

  // ✅ Auto-fetch when CRITICAL dependencies change (ด้วย Debounce)
  useEffect(() => {
    // Clear previous timeout
    clearFetchTimeout()

    // Don't fetch if loading or already fetching
    if (isLoading || fetchState.isFetching) {
      return
    }

    // Don't fetch if critical dependencies haven't changed
    if (criticalDependencyKey === previousCriticalDepsRef.current) {
      return
    }

    console.log('🎯 Critical dependencies changed:', {
      //fiscalYear,
      sctResourceOptionId,
      previous: previousCriticalDepsRef.current,
      current: criticalDependencyKey
    })

    // Update previous deps
    previousCriticalDepsRef.current = criticalDependencyKey

    // Set new timeout with debounce
    fetchTimeoutRef.current = setTimeout(() => {
      console.log('🚀 Executing debounced fetch...')
      fetchData()
    }, 150) // Debounce 150ms

    // Cleanup timeout
    return () => {
      clearFetchTimeout()
    }
  }, [
    criticalDependencyKey,
    isLoading,
    fetchState.isFetching,
    fetchData,
    clearFetchTimeout,
    //fiscalYear,
    sctResourceOptionId
  ])

  // ✅ Manual refetch function
  const refetch = useCallback(() => {
    console.log('🔄 Manual refetch triggered')
    clearFetchTimeout()
    fetchData()
  }, [fetchData, clearFetchTimeout])

  // ✅ Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up indirect cost hook')
      clearFetchTimeout()
      abortRequest()
    }
  }, [clearFetchTimeout, abortRequest])

  return {
    refetch,
    isFetching: fetchState.isFetching,
    error: fetchState.error,
    criticalDependencies: {
      sctResourceOptionId
    }
  }
}
