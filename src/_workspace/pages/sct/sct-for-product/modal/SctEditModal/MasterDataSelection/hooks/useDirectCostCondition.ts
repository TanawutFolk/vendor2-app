import { useCallback, useState, useRef, useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { toast } from 'react-toastify'

import getErrorMessage from '@/utils/getErrorMessage'
import DirectCostConditionServices from '@/_workspace/services/cost-condition/DirectCostConditionServices'
import { FormDataPage } from '../../validationSchema'

const SCT_MASTER_DATA_SETTING_ID = 1 // direct cost
const SERVICE = DirectCostConditionServices
const TARGET_NAME = 'indirectCost.main.costCondition.directCostCondition'
const MENU_NAME = 'Direct Cost Condition'
interface DataReturn {
  directUnitProcessCost: number | undefined | null
  indirectRateOfDirectProcessCost: number | undefined | null
  fiscalYear: number | undefined | null
  version: number | undefined | null
}

interface FetchState {
  isFetching: boolean
  error: string | null
}

export function useDirectCostCondition(isLoading: boolean) {
  const { control, setValue } = useFormContext<FormDataPage>()
  const [fetchState, setFetchState] = useState<FetchState>({
    isFetching: false,
    error: null
  })

  const abortControllerRef = useRef<AbortController | null>(null)
  const fetchTimeoutRef = useRef<NodeJS.Timeout>()
  const previousCriticalDepsRef = useRef<string>('')

  // ✅ Watch all dependencies that should trigger re-fetch
  const [
    isCalculationAlready,
    listSctMasterDataHistory,
    sctTotalCost,
    sctResourceOptionId,
    version,
    //sctDetailForAdjust,
    fiscalYear,
    productMainId,
    itemCategoryId,
    CREATE_FROM_isCalculationAlready,
    SCT_ID
  ] = useWatch({
    control,
    name: [
      'isCalculationAlready',
      'listSctMasterDataHistory',
      'sctTotalCost',
      'masterDataSelection.directCostCondition.SCT_RESOURCE_OPTION_ID',
      'indirectCost.main.costCondition.directCostCondition.version',
      //'sctDetailForAdjust',
      'header.fiscalYear.value',
      'product.productMain.PRODUCT_MAIN_ID',
      'product.itemCategory.ITEM_CATEGORY_ID',
      'header.sctCreateFrom.CREATE_FROM_isCalculationAlready',
      'header.SCT_ID'
    ]
  })

  // ✅ Create critical dependency key (เฉพาะ field ที่ต้องการ track)
  const criticalDependencyKey = JSON.stringify({
    fiscalYear,
    version,
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
  const handleCalculationAlreadyCase = useCallback(async (): Promise<DataReturn | null> => {
    //console.log(fiscalYear, version)
    const version = listSctMasterDataHistory.find(
      item => item.IS_FROM_SCT_COPY == 0 && item.SCT_MASTER_DATA_SETTING_ID == SCT_MASTER_DATA_SETTING_ID
    )?.VERSION_NO

    if (!fiscalYear || !version) {
      return null
    }

    const { DIRECT_UNIT_PROCESS_COST, INDIRECT_RATE_OF_DIRECT_PROCESS_COST } =
      sctTotalCost.find(item => item.IS_FROM_SCT_COPY == 0) ?? {}

    previousCriticalDepsRef.current = JSON.stringify({
      fiscalYear,
      version,
      sctResourceOptionId
    })

    try {
      return {
        directUnitProcessCost: DIRECT_UNIT_PROCESS_COST,
        indirectRateOfDirectProcessCost: INDIRECT_RATE_OF_DIRECT_PROCESS_COST,
        fiscalYear,
        version
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      toast.error(`Error in calculation already case: ${errorMessage}`)
      return null
    }
  }, [fiscalYear, sctTotalCost, sctResourceOptionId, listSctMasterDataHistory])

  // ✅ 2. handleMasterDataCase
  const handleMasterDataCase = useCallback(
    async (signal: AbortSignal): Promise<DataReturn | null> => {
      if (!fiscalYear || !productMainId || !itemCategoryId) {
        console.warn('Missing required data for master data case')
        return null
      }

      try {
        const res = await SERVICE.getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest({
          FISCAL_YEAR: fiscalYear,
          PRODUCT_MAIN_ID: productMainId,
          ITEM_CATEGORY_ID: itemCategoryId,
          signal
        })

        if (res?.data?.ResultOnDb?.length === 0) {
          toast.error(`ไม่พบข้อมูล ${MENU_NAME} ในระบบ`, { autoClose: 10000 })
          return null
        }

        if (res?.data?.ResultOnDb?.length > 1) {
          toast.error(`มีข้อมูล ${MENU_NAME} มากกว่า 1 ในระบบ`, { autoClose: 10000 })
          return null
        }

        const { DIRECT_UNIT_PROCESS_COST, INDIRECT_RATE_OF_DIRECT_PROCESS_COST, VERSION } =
          res?.data?.ResultOnDb?.[0] ?? {}

        previousCriticalDepsRef.current = JSON.stringify({
          fiscalYear,
          version: VERSION,
          sctResourceOptionId
        })

        return {
          directUnitProcessCost: DIRECT_UNIT_PROCESS_COST as number | undefined | null,
          indirectRateOfDirectProcessCost: INDIRECT_RATE_OF_DIRECT_PROCESS_COST as number | undefined | null,
          fiscalYear: fiscalYear as number | undefined | null,
          version: VERSION as number | undefined | null
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return null
        }
        const errorMessage = getErrorMessage(error)
        toast.error(`Error in master data case: ${errorMessage}`)
        return null
      }
    },
    [fiscalYear, productMainId, itemCategoryId, sctResourceOptionId]
  )

  // ✅ 3. handleRevisionCase
  const handleRevisionCase = useCallback(
    async (signal: AbortSignal): Promise<DataReturn | null> => {
      if (!fiscalYear || !productMainId || !itemCategoryId || !version) {
        console.warn('Missing required data for revision case')
        return null
      }

      try {
        const res = await SERVICE.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo({
          FISCAL_YEAR: fiscalYear,
          PRODUCT_MAIN_ID: productMainId,
          ITEM_CATEGORY_ID: itemCategoryId,
          VERSION: version,
          signal
        })

        if (res?.data?.ResultOnDb?.length === 0) {
          toast.error(`ไม่พบข้อมูล ${MENU_NAME} ในระบบ`, { autoClose: 10000 })
          return null
        }

        if (res?.data?.ResultOnDb?.length > 1) {
          toast.error(`มีข้อมูล ${MENU_NAME} มากกว่า 1 ในระบบ`, { autoClose: 10000 })
          return null
        }

        const { DIRECT_UNIT_PROCESS_COST, INDIRECT_RATE_OF_DIRECT_PROCESS_COST } = res?.data?.ResultOnDb?.[0] ?? {}

        previousCriticalDepsRef.current = JSON.stringify({
          fiscalYear,
          version,
          sctResourceOptionId
        })

        return {
          directUnitProcessCost: DIRECT_UNIT_PROCESS_COST as number | undefined | null,
          indirectRateOfDirectProcessCost: INDIRECT_RATE_OF_DIRECT_PROCESS_COST as number | undefined | null,
          fiscalYear: fiscalYear as number | undefined | null,
          version: version as number | undefined | null
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return null
        }
        const errorMessage = getErrorMessage(error)
        toast.error(`Error in revision case: ${errorMessage}`)
        return null
      }
    },
    [fiscalYear, productMainId, itemCategoryId, version, sctResourceOptionId]
  )

  // ✅ 4. handleSCTSelectionCase
  const handleSCTSelectionCase = useCallback(
    async (signal: AbortSignal): Promise<DataReturn | null> => {
      if (!fiscalYear || !productMainId || !itemCategoryId) {
        console.warn('Missing required data for SCT selection case')
        return null
      }

      try {
        // from sct copy - after cal already
        if (CREATE_FROM_isCalculationAlready) {
          const { DIRECT_UNIT_PROCESS_COST, INDIRECT_RATE_OF_DIRECT_PROCESS_COST } =
            sctTotalCost?.find(item => item.IS_FROM_SCT_COPY == 1) ?? {}

          previousCriticalDepsRef.current = JSON.stringify({
            fiscalYear,
            version: listSctMasterDataHistory?.find(
              item => item.SCT_MASTER_DATA_SETTING_ID == SCT_MASTER_DATA_SETTING_ID && item.IS_FROM_SCT_COPY == 1
            )?.VERSION_NO,
            sctResourceOptionId
          })

          return {
            directUnitProcessCost: DIRECT_UNIT_PROCESS_COST,
            indirectRateOfDirectProcessCost: INDIRECT_RATE_OF_DIRECT_PROCESS_COST,
            fiscalYear,
            version: listSctMasterDataHistory?.find(
              item => item.SCT_MASTER_DATA_SETTING_ID == SCT_MASTER_DATA_SETTING_ID && item.IS_FROM_SCT_COPY == 1
            )?.VERSION_NO
          }
        } else {
          const res = await SERVICE.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo({
            FISCAL_YEAR: fiscalYear,
            PRODUCT_MAIN_ID: productMainId,
            ITEM_CATEGORY_ID: itemCategoryId,
            VERSION:
              listSctMasterDataHistory?.find(
                item => item.SCT_MASTER_DATA_SETTING_ID == SCT_MASTER_DATA_SETTING_ID && item.IS_FROM_SCT_COPY == 1
              )?.VERSION_NO ?? 0,
            signal
          })

          if (res?.data?.ResultOnDb?.length === 0) {
            toast.error(`ไม่พบข้อมูล ${MENU_NAME} ในระบบ`, { autoClose: 10000 })
            return null
          }

          if (res?.data?.ResultOnDb?.length > 1) {
            toast.error(`มีข้อมูล ${MENU_NAME} มากกว่า 1 ในระบบ`, { autoClose: 10000 })
            return null
          }

          const { DIRECT_UNIT_PROCESS_COST, INDIRECT_RATE_OF_DIRECT_PROCESS_COST } = res?.data?.ResultOnDb?.[0] ?? {}

          previousCriticalDepsRef.current = JSON.stringify({
            fiscalYear,
            version:
              listSctMasterDataHistory?.find(
                item => item.SCT_MASTER_DATA_SETTING_ID == SCT_MASTER_DATA_SETTING_ID && item.IS_FROM_SCT_COPY == 1
              )?.VERSION_NO ?? 0,
            sctResourceOptionId
          })

          return {
            directUnitProcessCost: DIRECT_UNIT_PROCESS_COST,
            indirectRateOfDirectProcessCost: INDIRECT_RATE_OF_DIRECT_PROCESS_COST,
            fiscalYear,
            version:
              listSctMasterDataHistory?.find(
                item => item.SCT_MASTER_DATA_SETTING_ID == SCT_MASTER_DATA_SETTING_ID && item.IS_FROM_SCT_COPY == 1
              )?.VERSION_NO ?? 0
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return null
        }
        const errorMessage = getErrorMessage(error)
        toast.error(`Error in SCT selection case: ${errorMessage}`)
        return null
      }
    },
    [
      fiscalYear,
      sctTotalCost,
      listSctMasterDataHistory,
      CREATE_FROM_isCalculationAlready,
      productMainId,
      itemCategoryId,
      sctResourceOptionId
    ]
  )

  // ✅ Main fetch function
  const fetchData = useCallback(async (): Promise<void> => {
    if (isLoading || fetchState.isFetching || !SCT_ID || !productMainId || !itemCategoryId) {
      return
    }

    // Abort any ongoing request
    abortRequest()

    // Set up new abort controller
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    setFetchState(prev => ({ ...prev, isFetching: true, error: null }))

    try {
      let result: DataReturn | null = null
      console.log(isCalculationAlready)

      if (isCalculationAlready) {
        result = await handleCalculationAlreadyCase()
      } else {
        switch (sctResourceOptionId) {
          case 1:
            result = await handleMasterDataCase(signal)
            break
          case 2:
            result = await handleRevisionCase(signal)
            break
          case 4:
            result = await handleSCTSelectionCase(signal)
            break
          default:
            toast.error(`${MENU_NAME} not found`, { autoClose: 10000 })
        }
      }

      // Only update form if we have result and request wasn't aborted
      if (result && !signal.aborted) {
        setValue(TARGET_NAME, {
          directUnitProcessCost: result.directUnitProcessCost,
          indirectRateOfDirectProcessCost: result.indirectRateOfDirectProcessCost,
          fiscalYear: result.fiscalYear,
          version: result.version
        })
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
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
    handleRevisionCase,
    handleSCTSelectionCase,
    setValue
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

    // Update previous deps
    previousCriticalDepsRef.current = criticalDependencyKey

    // Set new timeout with debounce
    fetchTimeoutRef.current = setTimeout(() => {
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
    fiscalYear,
    version,
    sctResourceOptionId
  ])

  // ✅ Manual refetch function
  const refetch = useCallback(() => {
    clearFetchTimeout()
    fetchData()
  }, [fetchData, clearFetchTimeout])

  // ✅ Cleanup on unmount
  useEffect(() => {
    return () => {
      clearFetchTimeout()
      abortRequest()
    }
  }, [clearFetchTimeout, abortRequest])

  return {
    refetch,
    isFetching: fetchState.isFetching,
    error: fetchState.error,
    criticalDependencies: {
      fiscalYear,
      version,
      sctResourceOptionId
    }
  }
}
