import { useCallback } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { toast } from 'react-toastify'
import { FormDataPage } from '../validationSchema'
import getErrorMessage from '@/utils/getErrorMessage'
import IndirectCostConditionServices from '@/_workspace/services/cost-condition/IndirectCostConditionServices'

export function useIndirectCostCondition() {
  const { control, getValues, setValue } = useFormContext<FormDataPage>()

  const [
    sctData,
    product,
    listSctComponentTypeResourceOptionSelect,
    isCalculationAlready,
    listSctMasterDataHistory,
    sctTotalCost
  ] = useWatch({
    control,
    name: [
      'sctData',
      'product',
      'listSctComponentTypeResourceOptionSelect',
      'isCalculationAlready',
      'listSctMasterDataHistory',
      'sctTotalCost'
    ]
  })

  // ✅ 1. handleCalculationAlreadyCase
  const handleCalculationAlreadyCase = useCallback(async () => {
    if (!sctData?.FISCAL_YEAR || !product?.productMain?.PRODUCT_MAIN_ID || !product?.itemCategory?.ITEM_CATEGORY_ID) {
      console.warn('Missing required data for calculation already case')
      return null
    }

    try {
      // const res = await IndirectCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo({
      //   FISCAL_YEAR: sctData.FISCAL_YEAR,
      //   PRODUCT_MAIN_ID: product.productMain.PRODUCT_MAIN_ID,
      //   ITEM_CATEGORY_ID: product.itemCategory.ITEM_CATEGORY_ID,
      //   VERSION:
      //     listSctMasterDataHistory?.find(item => item.SCT_MASTER_DATA_SETTING_ID == 2 && item.IS_FROM_SCT_COPY == 0)
      //       ?.VERSION_NO ?? 0,
      //   signal
      // })

      // if (res?.data?.ResultOnDb?.length === 0) {
      //   toast.error(`ไม่พบข้อมูล Indirect Cost Condition ในระบบ`, { autoClose: 10000 })
      //   return null
      // }

      // if (res?.data?.ResultOnDb?.length > 1) {
      //   toast.error(`มีข้อมูล Indirect Cost Condition มากกว่า 1 ในระบบ`, { autoClose: 10000 })
      //   return null
      // }

      const sctDetailForAdjust = getValues('sctDetailForAdjust')

      return {
        // labor: res?.data?.ResultOnDb?.[0]?.LABOR ?? 0,
        // depreciation: res?.data?.ResultOnDb?.[0]?.DEPRECIATION ?? 0,
        // otherExpense: res?.data?.ResultOnDb?.[0]?.OTHER_EXPENSE ?? 0,
        totalIndirectCost: sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.ADJUST_PRICE ?? 0,
        fiscalYear: sctData.FISCAL_YEAR,
        version:
          listSctMasterDataHistory?.find(item => item.SCT_MASTER_DATA_SETTING_ID == 2 && item.IS_FROM_SCT_COPY == 0)
            ?.VERSION_NO ?? 0
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      toast.error(`Error in calculation already case: ${errorMessage}`)
      return null
    }
  }, [sctData, product, listSctMasterDataHistory, getValues])

  // ✅ 2. handleMasterDataCase
  const handleMasterDataCase = useCallback(
    async (signal: AbortSignal) => {
      if (!sctData?.FISCAL_YEAR || !product?.productMain?.PRODUCT_MAIN_ID || !product?.itemCategory?.ITEM_CATEGORY_ID) {
        console.warn('Missing required data for master data case')
        return null
      }

      try {
        const res =
          await IndirectCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest({
            FISCAL_YEAR: sctData.FISCAL_YEAR,
            PRODUCT_MAIN_ID: product.productMain.PRODUCT_MAIN_ID,
            ITEM_CATEGORY_ID: product.itemCategory.ITEM_CATEGORY_ID,
            signal
          })

        if (res?.data?.ResultOnDb?.length === 0) {
          toast.error(`ไม่พบข้อมูล Indirect Cost Condition ในระบบ`, { autoClose: 10000 })
          return null
        }

        if (res?.data?.ResultOnDb?.length > 1) {
          toast.error(`มีข้อมูล Indirect Cost Condition มากกว่า 1 ในระบบ`, { autoClose: 10000 })
          return null
        }

        return {
          // labor: res?.data?.ResultOnDb?.[0]?.LABOR ?? 0,
          // depreciation: res?.data?.ResultOnDb?.[0]?.DEPRECIATION ?? 0,
          // otherExpense: res?.data?.ResultOnDb?.[0]?.OTHER_EXPENSE ?? 0,
          totalIndirectCost: res?.data?.ResultOnDb?.[0]?.TOTAL_INDIRECT_COST ?? 0,
          fiscalYear: Number(res?.data?.ResultOnDb?.[0]?.FISCAL_YEAR) ?? 0,
          version: res?.data?.ResultOnDb?.[0]?.VERSION ?? 0
        }
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
        const res = await IndirectCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo({
          FISCAL_YEAR: sctData.FISCAL_YEAR,
          PRODUCT_MAIN_ID: product.productMain.PRODUCT_MAIN_ID,
          ITEM_CATEGORY_ID: product.itemCategory.ITEM_CATEGORY_ID,
          VERSION:
            listSctMasterDataHistory?.find(item => item.SCT_MASTER_DATA_SETTING_ID == 2 && item.IS_FROM_SCT_COPY == 0)
              ?.VERSION_NO ?? 0,
          signal
        })

        if (res?.data?.ResultOnDb?.length === 0) {
          toast.error(`ไม่พบข้อมูล Indirect Cost Condition ในระบบ`, { autoClose: 10000 })
          return null
        }

        if (res?.data?.ResultOnDb?.length > 1) {
          toast.error(`มีข้อมูล Indirect Cost Condition มากกว่า 1 ในระบบ`, { autoClose: 10000 })
          return null
        }

        return {
          // labor: res?.data?.ResultOnDb?.[0]?.LABOR ?? 0,
          // depreciation: res?.data?.ResultOnDb?.[0]?.DEPRECIATION ?? 0,
          // otherExpense: res?.data?.ResultOnDb?.[0]?.OTHER_EXPENSE ?? 0,
          totalIndirectCost: res?.data?.ResultOnDb?.[0]?.TOTAL_INDIRECT_COST ?? 0,
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
            totalIndirectCost: dataItem.INDIRECT_COST_SALE_AVE,
            fiscalYear: sctData.FISCAL_YEAR,
            version:
              getValues('listSctMasterDataHistory')?.find(
                item => item.SCT_MASTER_DATA_SETTING_ID == 2 && item.IS_FROM_SCT_COPY == 1
              )?.VERSION_NO || 0
          }
        } else {
          const res = await IndirectCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo(
            {
              FISCAL_YEAR: sctData.FISCAL_YEAR,
              PRODUCT_MAIN_ID: product.productMain.PRODUCT_MAIN_ID,
              ITEM_CATEGORY_ID: product.itemCategory.ITEM_CATEGORY_ID,
              VERSION:
                listSctMasterDataHistory?.find(
                  item => item.SCT_MASTER_DATA_SETTING_ID == 2 && item.IS_FROM_SCT_COPY == 1
                )?.VERSION_NO ?? 0,
              signal
            }
          )

          if (res?.data?.ResultOnDb?.length === 0) {
            toast.error(`ไม่พบข้อมูล Indirect Cost Condition ในระบบ`, { autoClose: 10000 })
            return null
          }

          if (res?.data?.ResultOnDb?.length > 1) {
            toast.error(`มีข้อมูล Indirect Cost Condition มากกว่า 1 ในระบบ`, { autoClose: 10000 })
            return null
          }

          // SCT Create From Preparing & Prepared
          if (
            [2, 3].includes(sctData.CREATE_FROM_SCT_STATUS_PROGRESS_ID) &&
            (sctData?.CREATE_FROM_SELLING_PRICE === null || typeof sctData?.CREATE_FROM_SELLING_PRICE === 'undefined')
          ) {
            const sctDetailForAdjust = getValues('sctDetailForAdjust')

            return {
              totalIndirectCost:
                sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 1)?.TOTAL_INDIRECT_COST ??
                res?.data?.ResultOnDb?.[0]?.TOTAL_INDIRECT_COST ??
                0,
              fiscalYear: Number(res?.data?.ResultOnDb?.[0]?.FISCAL_YEAR) ?? 0,
              version: res?.data?.ResultOnDb?.[0]?.VERSION ?? 0
            }
          }

          return {
            // labor: res?.data?.ResultOnDb?.[0]?.LABOR ?? 0,
            // depreciation: res?.data?.ResultOnDb?.[0]?.DEPRECIATION ?? 0,
            // otherExpense: res?.data?.ResultOnDb?.[0]?.OTHER_EXPENSE ?? 0,
            totalIndirectCost: res?.data?.ResultOnDb?.[0]?.TOTAL_INDIRECT_COST ?? 0,
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

  const fetchIndirectCostCondition = useCallback(
    (isLoading: boolean) => {
      console.log(
        '1) fetchIndirectCostCondition',
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

            console.log('2) fetchIndirectCostCondition', sctResourceOptionId)

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
                toast.error(`Indirect Cost Condition not found`, { autoClose: 10000 })
            }
          }

          if (result) {
            setValue('indirectCost.main.costCondition.indirectCostCondition', {
              totalIndirectCost: result.totalIndirectCost,
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
    fetchIndirectCostCondition
  }
}
