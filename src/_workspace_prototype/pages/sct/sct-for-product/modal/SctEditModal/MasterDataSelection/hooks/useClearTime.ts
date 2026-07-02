import { useCallback, useState, useRef, useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { toast } from 'react-toastify'
import { FormDataPage } from '../../validationSchema'
import getErrorMessage from '@/utils/getErrorMessage'
import ClearTimeProcessForSctServices from '@/_workspace/services/_ClearTimeSystem/ClearTimeProcessForSctServices'
import ClearTimeTotalForSctServices from '@/_workspace/services/_ClearTimeSystem/ClearTimeTotalForSctServices'

const SCT_MASTER_DATA_SETTING_ID = 6 // clear time
const SERVICE_TOTAL = ClearTimeTotalForSctServices
const SERVICE_PROCESS = ClearTimeProcessForSctServices
const TARGET_NAME_TOTAL = 'directCost.flowProcess.total.main.clearTime'
const TARGET_NAME_PROCESS = 'directCost.flowProcess.body.clearTimeForSctProcess.main'
const MENU_NAME = 'Clear Time'

interface DataReturn {
  total: {
    fiscalYear: number | undefined | null
    version: number | undefined | null
    flowId: number | undefined | null
    flowCode: string | undefined | null
    flowName: string | undefined | null
    totalClearTime: number | undefined | null
  }
  process: {
    clearTimeForSctProcessId: string | undefined | null
    fiscalYear: number | undefined | null
    version: number | undefined | null
    productTypeId: number | undefined | null
    flowId: number | undefined | null
    flowCode: string | undefined | null
    flowName: string | undefined | null
    flowProcessId: number | undefined | null
    flowProcessNo: number | undefined | null
    processId: number | undefined | null
    clearTimeForSct: number | undefined | null
  }[]
  fiscalYear: number | undefined | null
  version: number | undefined | null
}

interface FetchState {
  isFetching: boolean
  error: string | null
}

export function useClearTime(isLoading: boolean) {
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
    sctResourceOptionId,
    version,
    fiscalYear,
    productTypeId,
    SCT_ID
  ] = useWatch({
    control,
    name: [
      'isCalculationAlready',
      'listSctMasterDataHistory',
      'masterDataSelection.clearTime.SCT_RESOURCE_OPTION_ID',
      'directCost.flowProcess.total.main.clearTime.version',
      'header.fiscalYear.value',
      'product.productType.PRODUCT_TYPE_ID',
      'product.itemCategory.ITEM_CATEGORY_ID',
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
  const handleCalculationAlreadyCase = useCallback(
    async (signal: AbortSignal): Promise<DataReturn | null> => {
      const version = listSctMasterDataHistory.find(
        item => item.IS_FROM_SCT_COPY == 0 && item.SCT_MASTER_DATA_SETTING_ID == SCT_MASTER_DATA_SETTING_ID
      )?.VERSION_NO

      if (!fiscalYear || !productTypeId || !version) {
        return null
      }

      try {
        const [total, process] = await Promise.all([
          SERVICE_TOTAL.getByProductTypeIdAndFiscalYearAndRevisionNo({
            FISCAL_YEAR: fiscalYear,
            PRODUCT_TYPE_ID: productTypeId,
            REVISION_NO: version,
            signal
          }).then(res => res.data.ResultOnDb?.[0] ?? {}),

          SERVICE_PROCESS.getByProductTypeIdAndFiscalYearAndRevisionNo({
            FISCAL_YEAR: fiscalYear,
            PRODUCT_TYPE_ID: productTypeId,
            REVISION_NO: version,
            signal
          }).then(res => res.data.ResultOnDb)
        ])

        previousCriticalDepsRef.current = JSON.stringify({
          fiscalYear,
          version,
          sctResourceOptionId
        })

        return {
          total: {
            fiscalYear: fiscalYear as number | undefined | null,
            version: version as number | undefined | null,
            flowId: total.FLOW_ID as number | undefined | null,
            flowName: total.FLOW_NAME as string | undefined | null,
            flowCode: total.FLOW_CODE as string | undefined | null,
            totalClearTime: total.TOTAL_CLEAR_TIME_FOR_SCT as number | undefined | null
          },
          process: process.map(item => ({
            clearTimeForSctProcessId: item.CLEAR_TIME_FOR_SCT_PROCESS_ID,
            fiscalYear: item.FISCAL_YEAR as number | undefined | null,
            version: version as number | undefined | null,
            productTypeId: item.PRODUCT_TYPE_ID as number | undefined | null,
            flowId: item.FLOW_ID as number | undefined | null,
            flowCode: item.FLOW_CODE as string | undefined | null,
            flowName: item.FLOW_NAME as string | undefined | null,
            flowProcessId: item.FLOW_PROCESS_ID as number | undefined | null,
            flowProcessNo: item.FLOW_PROCESS_NO as number | undefined | null,
            processId: item.PROCESS_ID as number | undefined | null,
            clearTimeForSct: item.CLEAR_TIME_FOR_SCT as number | undefined | null
          })),
          fiscalYear: fiscalYear as number | undefined | null,
          version: version as number | undefined | null
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
    [fiscalYear, productTypeId, sctResourceOptionId, listSctMasterDataHistory]
  )

  // ✅ 2. handleMasterDataCase
  const handleMasterDataCase = useCallback(
    async (signal: AbortSignal): Promise<DataReturn | null> => {
      if (!fiscalYear || !productTypeId) {
        return null
      }

      try {
        const [total, process] = await Promise.all([
          SERVICE_TOTAL.getByProductTypeIdAndFiscalYear_MasterDataLatest({
            FISCAL_YEAR: fiscalYear,
            PRODUCT_TYPE_ID: productTypeId,
            signal
          }).then(res => res.data.ResultOnDb?.[0] ?? {}),

          SERVICE_PROCESS.getByProductTypeIdAndFiscalYear_MasterDataLatest({
            FISCAL_YEAR: fiscalYear,
            PRODUCT_TYPE_ID: productTypeId,
            signal
          }).then(res => res.data.ResultOnDb)
        ])

        previousCriticalDepsRef.current = JSON.stringify({
          fiscalYear,
          version: total.REVISION_NO,
          sctResourceOptionId
        })

        return {
          total: {
            fiscalYear: fiscalYear as number | undefined | null,
            version: total.REVISION_NO as number | undefined | null,
            flowId: total.FLOW_ID as number | undefined | null,
            flowName: total.FLOW_NAME as string | undefined | null,
            flowCode: total.FLOW_CODE as string | undefined | null,
            totalClearTime: total.TOTAL_CLEAR_TIME_FOR_SCT as number | undefined | null
          },
          process: process.map(item => ({
            clearTimeForSctProcessId: item.CLEAR_TIME_FOR_SCT_PROCESS_ID,
            fiscalYear: item.FISCAL_YEAR as number | undefined | null,
            version: total.REVISION_NO as number | undefined | null,
            productTypeId: item.PRODUCT_TYPE_ID as number | undefined | null,
            flowId: item.FLOW_ID as number | undefined | null,
            flowCode: item.FLOW_CODE as string | undefined | null,
            flowName: item.FLOW_NAME as string | undefined | null,
            flowProcessId: item.FLOW_PROCESS_ID as number | undefined | null,
            flowProcessNo: item.FLOW_PROCESS_NO as number | undefined | null,
            processId: item.PROCESS_ID as number | undefined | null,
            clearTimeForSct: item.CLEAR_TIME_FOR_SCT as number | undefined | null
          })),
          fiscalYear: fiscalYear as number | undefined | null,
          version: total.REVISION_NO as number | undefined | null
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
    [fiscalYear, productTypeId, sctResourceOptionId]
  )

  // ✅ 3. handleRevisionCase
  const handleRevisionCase = useCallback(
    async (signal: AbortSignal): Promise<DataReturn | null> => {
      if (!fiscalYear || !productTypeId || !version) {
        return null
      }

      try {
        const [total, process] = await Promise.all([
          SERVICE_TOTAL.getByProductTypeIdAndFiscalYearAndRevisionNo({
            FISCAL_YEAR: fiscalYear,
            PRODUCT_TYPE_ID: productTypeId,
            REVISION_NO: version,
            signal
          }).then(res => res.data.ResultOnDb?.[0] ?? {}),

          SERVICE_PROCESS.getByProductTypeIdAndFiscalYearAndRevisionNo({
            FISCAL_YEAR: fiscalYear,
            PRODUCT_TYPE_ID: productTypeId,
            REVISION_NO: version,
            signal
          }).then(res => res.data.ResultOnDb)
        ])

        previousCriticalDepsRef.current = JSON.stringify({
          fiscalYear,
          version,
          sctResourceOptionId
        })

        return {
          total: {
            fiscalYear: fiscalYear as number | undefined | null,
            version: version as number | undefined | null,
            flowId: total.FLOW_ID as number | undefined | null,
            flowName: total.FLOW_NAME as string | undefined | null,
            flowCode: total.FLOW_CODE as string | undefined | null,
            totalClearTime: total.TOTAL_CLEAR_TIME_FOR_SCT as number | undefined | null
          },
          process: process.map(item => ({
            clearTimeForSctProcessId: item.CLEAR_TIME_FOR_SCT_PROCESS_ID,
            fiscalYear: item.FISCAL_YEAR as number | undefined | null,
            version: version as number | undefined | null,
            productTypeId: item.PRODUCT_TYPE_ID as number | undefined | null,
            flowId: item.FLOW_ID as number | undefined | null,
            flowCode: item.FLOW_CODE as string | undefined | null,
            flowName: item.FLOW_NAME as string | undefined | null,
            flowProcessId: item.FLOW_PROCESS_ID as number | undefined | null,
            flowProcessNo: item.FLOW_PROCESS_NO as number | undefined | null,
            processId: item.PROCESS_ID as number | undefined | null,
            clearTimeForSct: item.CLEAR_TIME_FOR_SCT as number | undefined | null
          })),
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
    [fiscalYear, productTypeId, version, sctResourceOptionId]
  )

  // ✅ 4. handleSCTSelectionCase
  const handleSCTSelectionCase = useCallback(
    async (signal: AbortSignal): Promise<DataReturn | null> => {
      const version_sctCopy = listSctMasterDataHistory?.find(
        item => item.SCT_MASTER_DATA_SETTING_ID == SCT_MASTER_DATA_SETTING_ID && item.IS_FROM_SCT_COPY == 1
      )?.VERSION_NO

      if (!fiscalYear || !productTypeId || !version_sctCopy) {
        return null
      }

      try {
        const [total, process] = await Promise.all([
          SERVICE_TOTAL.getByProductTypeIdAndFiscalYearAndRevisionNo({
            FISCAL_YEAR: fiscalYear,
            PRODUCT_TYPE_ID: productTypeId,
            REVISION_NO: version_sctCopy,
            signal
          }).then(res => res.data.ResultOnDb?.[0] ?? {}),

          SERVICE_PROCESS.getByProductTypeIdAndFiscalYearAndRevisionNo({
            FISCAL_YEAR: fiscalYear,
            PRODUCT_TYPE_ID: productTypeId,
            REVISION_NO: version_sctCopy,
            signal
          }).then(res => res.data.ResultOnDb)
        ])

        previousCriticalDepsRef.current = JSON.stringify({
          fiscalYear,
          version: version_sctCopy,
          sctResourceOptionId
        })

        return {
          total: {
            fiscalYear: fiscalYear as number | undefined | null,
            version: version_sctCopy as number | undefined | null,
            flowId: total.FLOW_ID as number | undefined | null,
            flowName: total.FLOW_NAME as string | undefined | null,
            flowCode: total.FLOW_CODE as string | undefined | null,
            totalClearTime: total.TOTAL_CLEAR_TIME_FOR_SCT as number | undefined | null
          },
          process: process.map(item => ({
            clearTimeForSctProcessId: item.CLEAR_TIME_FOR_SCT_PROCESS_ID,
            fiscalYear: item.FISCAL_YEAR as number | undefined | null,
            version: version_sctCopy as number | undefined | null,
            productTypeId: item.PRODUCT_TYPE_ID as number | undefined | null,
            flowId: item.FLOW_ID as number | undefined | null,
            flowCode: item.FLOW_CODE as string | undefined | null,
            flowName: item.FLOW_NAME as string | undefined | null,
            flowProcessId: item.FLOW_PROCESS_ID as number | undefined | null,
            flowProcessNo: item.FLOW_PROCESS_NO as number | undefined | null,
            processId: item.PROCESS_ID as number | undefined | null,
            clearTimeForSct: item.CLEAR_TIME_FOR_SCT as number | undefined | null
          })),
          fiscalYear: fiscalYear as number | undefined | null,
          version: version_sctCopy as number | undefined | null
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
    [fiscalYear, listSctMasterDataHistory, productTypeId, sctResourceOptionId]
  )

  // ✅ Main fetch function
  const fetchData = useCallback(async (): Promise<void> => {
    if (isLoading || fetchState.isFetching || !SCT_ID || !productTypeId) {
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

      if (isCalculationAlready) {
        result = await handleCalculationAlreadyCase(signal)
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
        setValue(TARGET_NAME_TOTAL, {
          totalClearTime: result.total.totalClearTime,
          flowId: result.total.flowId,
          flowName: result.total.flowName,
          flowCode: result.total.flowCode,
          fiscalYear: result.fiscalYear,
          version: result.version
        })

        setValue(TARGET_NAME_PROCESS, result.process)
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }

      const errorMessage = getErrorMessage(error)
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
    // productMainId,
    // itemCategoryId,
    productTypeId,
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
    //previousCriticalDepsRef.current = criticalDependencyKey

    // Set new timeout with debounce
    fetchTimeoutRef.current = setTimeout(() => {
      fetchData()
    }, 1000) // Debounce 150ms

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
