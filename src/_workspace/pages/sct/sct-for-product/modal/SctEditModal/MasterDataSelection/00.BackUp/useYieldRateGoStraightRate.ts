import { useCallback } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { toast } from 'react-toastify'
import { FormDataPage } from '../../validationSchema'
import getErrorMessage from '@/utils/getErrorMessage'
import YieldRateGoStraightRateServices from '@/_workspace/services/yield-rate/YieldRateGoStraightRateProcessForSctServices'
import YieldRateGoStraightRateProcessForSctServices from '@/_workspace/services/yield-rate/YieldRateGoStraightRateProcessForSctServices'

export function useYieldRateGoStraightRate() {
  const { control, getValues, setValue } = useFormContext<FormDataPage>()

  const [
    sctData,
    product,
    listSctComponentTypeResourceOptionSelect,
    isCalculationAlready,
    listSctMasterDataHistory,
    sctTotalCost,
    sctResourceOptionId
  ] = useWatch({
    control,
    name: [
      'sctData',
      'product',
      'listSctComponentTypeResourceOptionSelect',
      'isCalculationAlready',
      'listSctMasterDataHistory',
      'sctTotalCost',
      'masterDataSelection.yieldRateAndGoStraightRate.SCT_RESOURCE_OPTION_ID'
    ]
  })

  // ✅ 1. handleCalculationAlreadyCase
  const handleCalculationAlreadyCase = useCallback(
    async (signal: AbortSignal) => {
      if (!sctData?.FISCAL_YEAR || !product?.productMain?.PRODUCT_MAIN_ID || !product?.itemCategory?.ITEM_CATEGORY_ID) {
        console.warn('Missing required data for calculation already case')
        return null
      }

      try {
        const res = await YieldRateGoStraightRateProcessForSctServices.getByProductTypeIdAndFiscalYearAndRevisionNo({
          FISCAL_YEAR: sctData.FISCAL_YEAR,
          REVISION_NO:
            listSctMasterDataHistory?.find(item => item.SCT_MASTER_DATA_SETTING_ID == 2 && item.IS_FROM_SCT_COPY == 0)
              ?.VERSION_NO ?? 0,
          PRODUCT_TYPE_ID: product.productType.PRODUCT_TYPE_ID,
          signal
        })

        if (res?.data?.ResultOnDb?.length === 0) {
          toast.error(`ไม่พบข้อมูล Special Cost Condition ในระบบ`, { autoClose: 10000 })
          return null
        }

        return res.data.ResultOnDb.map(item => ({
          YIELD_RATE_GO_STRAIGHT_RATE_PROCESS_FOR_SCT_ID: item.YIELD_RATE_GO_STRAIGHT_RATE_PROCESS_FOR_SCT_ID,
          FISCAL_YEAR: item.FISCAL_YEAR,
          REVISION_NO: item.REVISION_NO,
          PRODUCT_TYPE_ID: item.PRODUCT_TYPE_ID,
          FLOW_ID: item.FLOW_ID,
          FLOW_CODE: item.FLOW_CODE,
          FLOW_NAME: item.FLOW_NAME,
          FLOW_PROCESS_ID: item.FLOW_PROCESS_ID,
          FLOW_PROCESS_NO: item.FLOW_PROCESS_NO,
          PROCESS_ID: item.PROCESS_ID,
          YIELD_RATE_FOR_SCT: item.YIELD_RATE_FOR_SCT,
          YIELD_ACCUMULATION_FOR_SCT: item.YIELD_ACCUMULATION_FOR_SCT,
          GO_STRAIGHT_RATE_FOR_SCT: item.GO_STRAIGHT_RATE_FOR_SCT,
          COLLECTION_POINT_FOR_SCT: item.COLLECTION_POINT_FOR_SCT
        }))
      } catch (error) {
        const errorMessage = getErrorMessage(error)
        toast.error(`Error in calculation already case: ${errorMessage}`)
        return null
      }
    },
    [sctData, product, listSctMasterDataHistory]
  )

  // ✅ 2. handleMasterDataCase
  const handleMasterDataCase = useCallback(
    async (signal: AbortSignal) => {
      if (!sctData?.FISCAL_YEAR || !product?.productMain?.PRODUCT_MAIN_ID || !product?.itemCategory?.ITEM_CATEGORY_ID) {
        console.warn('Missing required data for master data case')
        return null
      }

      try {
        const res = await YieldRateGoStraightRateServices.getByProductTypeIdAndFiscalYear_MasterDataLatest({
          FISCAL_YEAR: sctData.FISCAL_YEAR,
          PRODUCT_TYPE_ID: product.productType.PRODUCT_TYPE_ID,
          signal
        })

        if (res?.data?.ResultOnDb?.length === 0) {
          toast.error(`ไม่พบข้อมูล Special Cost Condition ในระบบ`, { autoClose: 10000 })
          return null
        }

        return res.data.ResultOnDb.map(item => ({
          YIELD_RATE_GO_STRAIGHT_RATE_PROCESS_FOR_SCT_ID: item.YIELD_RATE_GO_STRAIGHT_RATE_PROCESS_FOR_SCT_ID,
          FISCAL_YEAR: item.FISCAL_YEAR,
          REVISION_NO: item.REVISION_NO,
          PRODUCT_TYPE_ID: item.PRODUCT_TYPE_ID,
          FLOW_ID: item.FLOW_ID,
          FLOW_CODE: item.FLOW_CODE,
          FLOW_NAME: item.FLOW_NAME,
          FLOW_PROCESS_ID: item.FLOW_PROCESS_ID,
          FLOW_PROCESS_NO: item.FLOW_PROCESS_NO,
          PROCESS_ID: item.PROCESS_ID,
          YIELD_RATE_FOR_SCT: item.YIELD_RATE_FOR_SCT,
          YIELD_ACCUMULATION_FOR_SCT: item.YIELD_ACCUMULATION_FOR_SCT,
          GO_STRAIGHT_RATE_FOR_SCT: item.GO_STRAIGHT_RATE_FOR_SCT,
          COLLECTION_POINT_FOR_SCT: item.COLLECTION_POINT_FOR_SCT
        }))
      } catch (error) {
        const errorMessage = getErrorMessage(error)
        toast.error(`Error in calculation already case: ${errorMessage}`)
        return null
      }
    },
    [sctData, product]
  )

  // ✅ 3. handleRevisionCase
  const handleRevisionCase = useCallback(
    async (signal: AbortSignal) => {
      if (!sctData?.FISCAL_YEAR || !product?.productMain?.PRODUCT_MAIN_ID || !product?.itemCategory?.ITEM_CATEGORY_ID) {
        console.warn('Missing required data for revision case')
        return null
      }

      try {
        const res = await YieldRateGoStraightRateServices.getByProductTypeIdAndFiscalYearAndRevisionNo({
          FISCAL_YEAR: sctData.FISCAL_YEAR,
          REVISION_NO:
            listSctMasterDataHistory?.find(item => item.SCT_MASTER_DATA_SETTING_ID == 2 && item.IS_FROM_SCT_COPY == 0)
              ?.VERSION_NO ?? 0,
          PRODUCT_TYPE_ID: product.productType.PRODUCT_TYPE_ID,
          signal
        })

        if (res?.data?.ResultOnDb?.length === 0) {
          toast.error(`ไม่พบข้อมูล Special Cost Condition ในระบบ`, { autoClose: 10000 })
          return null
        }

        if (res?.data?.ResultOnDb?.length > 1) {
          toast.error(`มีข้อมูล Special Cost Condition มากกว่า 1 ในระบบ`, { autoClose: 10000 })
          return null
        }

        return {
          adjustPrice: res?.data?.ResultOnDb?.[0]?.ADJUST_PRICE ?? 0,
          fiscalYear: Number(res?.data?.ResultOnDb?.[0]?.FISCAL_YEAR) ?? 0,
          version: res?.data?.ResultOnDb?.[0]?.VERSION ?? 0
        }
      } catch (error) {
        const errorMessage = getErrorMessage(error)
        toast.error(`Error in calculation already case: ${errorMessage}`)
        return null
      }
    },
    [sctData, product, listSctMasterDataHistory]
  )

  // ✅ 4. handleSCTSelectionCase
  const handleSCTSelectionCase = useCallback(
    async (signal: AbortSignal) => {
      if (!sctData?.FISCAL_YEAR || !product?.productMain?.PRODUCT_MAIN_ID || !product?.itemCategory?.ITEM_CATEGORY_ID) {
        console.warn('Missing required data for SCT selection case')
        return null
      }

      try {
        const dataItem = sctTotalCost?.find(item => item.IS_FROM_SCT_COPY == 1)

        // from sct copy - after cal already
        if (dataItem) {
          return {
            adjustPrice: dataItem.ADJUST_PRICE ?? 0,
            fiscalYear: sctData.FISCAL_YEAR,
            version:
              getValues('listSctMasterDataHistory')?.find(
                item => item.SCT_MASTER_DATA_SETTING_ID == 2 && item.IS_FROM_SCT_COPY == 1
              )?.VERSION_NO || 0
          }
        } else {
          const res =
            await YieldRateGoStraightRateServices.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo({
              FISCAL_YEAR: sctData.FISCAL_YEAR,
              PRODUCT_MAIN_ID: product.productMain.PRODUCT_MAIN_ID,
              ITEM_CATEGORY_ID: product.itemCategory.ITEM_CATEGORY_ID,
              VERSION:
                listSctMasterDataHistory?.find(
                  item => item.SCT_MASTER_DATA_SETTING_ID == 2 && item.IS_FROM_SCT_COPY == 1
                )?.VERSION_NO ?? 0,
              signal
            })

          if (res?.data?.ResultOnDb?.length === 0) {
            toast.error(`ไม่พบข้อมูล Special Cost Condition ในระบบ`, { autoClose: 10000 })
            return null
          }

          if (res?.data?.ResultOnDb?.length > 1) {
            toast.error(`มีข้อมูล Special Cost Condition มากกว่า 1 ในระบบ`, { autoClose: 10000 })
            return null
          }

          // SCT Create From Preparing & Prepared
          if (
            [2, 3].includes(sctData.CREATE_FROM_SCT_STATUS_PROGRESS_ID) &&
            (sctData?.CREATE_FROM_SELLING_PRICE === null || typeof sctData?.CREATE_FROM_SELLING_PRICE === 'undefined')
          ) {
            const sctDetailForAdjust = getValues('sctDetailForAdjust')

            return {
              adjustPrice:
                sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 1)?.TOTAL_INDIRECT_COST ??
                res?.data?.ResultOnDb?.[0]?.ADJUST_PRICE ??
                0,
              fiscalYear: Number(res?.data?.ResultOnDb?.[0]?.FISCAL_YEAR) ?? 0,
              version: res?.data?.ResultOnDb?.[0]?.VERSION ?? 0
            }
          }

          return {
            adjustPrice: res?.data?.ResultOnDb?.[0]?.ADJUST_PRICE ?? 0,
            fiscalYear: Number(res?.data?.ResultOnDb?.[0]?.FISCAL_YEAR) ?? 0,
            version: res?.data?.ResultOnDb?.[0]?.VERSION ?? 0
          }
        }
      } catch (error) {
        const errorMessage = getErrorMessage(error)
        toast.error(`Error in calculation already case: ${errorMessage}`)
        return null
      }
    },
    [sctData, product, listSctMasterDataHistory, sctTotalCost, getValues]
  )

  const fetchYieldRateGoStraightRate = useCallback(
    (isLoading: boolean) => {
      console.log(
        '1) fetchYieldRateGoStraightRate',
        isLoading,
        sctData?.SCT_ID,
        product?.productMain?.PRODUCT_MAIN_ID,
        product?.itemCategory?.ITEM_CATEGORY_ID
      )

      if (
        isLoading ||
        !sctData?.SCT_ID ||
        !product?.productMain?.PRODUCT_MAIN_ID ||
        !product?.itemCategory?.ITEM_CATEGORY_ID
      ) {
        return undefined
      }

      const controller = new AbortController()

      // ✅ Execute fetch without waiting
      const executeFetch = async () => {
        try {
          let result = null

          if (isCalculationAlready) {
            result = await handleCalculationAlreadyCase()
          } else {
            const sctResourceOptionId = listSctComponentTypeResourceOptionSelect?.find(
              item => item.SCT_COMPONENT_TYPE_ID === 1
            )?.SCT_RESOURCE_OPTION_ID

            console.log('2) fetchYieldRateGoStraightRate', sctResourceOptionId)

            switch (sctResourceOptionId) {
              case 1:
                result = await handleMasterDataCase(controller.signal)
                break
              case 2:
                result = await handleRevisionCase(controller.signal)
                break
              case 4:
                result = await handleSCTSelectionCase(controller.signal)
                break
              default:
                toast.error(`Special Cost Condition not found`, { autoClose: 10000 })
            }
          }

          if (result) {
            setValue('directCost.flowProcess.body.yieldRateGoStraightRateProcessForSct.main', {
              fiscalYear: result.fiscalYear,
              version: result.version
            })
          }
        } catch (error) {
          const errorMessage = getErrorMessage(error)
          toast.error(`Error: ${errorMessage}`)
        }
      }

      executeFetch()

      return () => controller.abort()
    },
    [
      sctData,
      product,
      isCalculationAlready,
      listSctComponentTypeResourceOptionSelect,
      handleCalculationAlreadyCase,
      handleMasterDataCase,
      handleRevisionCase,
      handleSCTSelectionCase,
      setValue
    ]
  )

  return {
    fetchYieldRateGoStraightRate
  }
}
