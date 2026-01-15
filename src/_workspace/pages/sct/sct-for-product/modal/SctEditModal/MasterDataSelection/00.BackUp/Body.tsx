import { FormControl, FormControlLabel, Radio, TableCell, Typography } from '@mui/material'
import { Controller, useFormContext, useFormState } from 'react-hook-form'
import { FormDataPage } from '../validationSchema'
import DirectCostCondition from './Direct Cost Condition'
import { useState } from 'react'
import DirectCostConditionServices from '@/_workspace/services/cost-condition/DirectCostConditionServices'
import { toast } from 'react-toastify'
import IndirectCostConditionServices from '@/_workspace/services/cost-condition/IndirectCostConditionServices'
import SpecialCostConditionServices from '@/_workspace/services/cost-condition/SpecialCostConditionServices'
import OtherCostConditionServices from '@/_workspace/services/cost-condition/OtherCostConditionServices'
import IndirectCostCondition from './Indirect Cost Condition'
import OtherCostCondition from './Other Cost Condition'
import SpecialCostCondition from './Special Cost Condition'
import YieldRateGoStraightRate from './Yield Rate Go Straight Rate'
import YieldRateGoStraightRateTotalForSctServices from '@/_workspace/services/yield-rate/YieldRateGoStraightRateTotalForSctServices'
import ClearTime from './Clear Time'
import ClearTimeTotalForSctServices from '@/_workspace/services/_ClearTimeSystem/ClearTimeTotalForSctServices'

interface Props {
  name:
    | 'masterDataSelection.directCostCondition'
    | 'masterDataSelection.indirectCostCondition'
    | 'masterDataSelection.specialCostCondition'
    | 'masterDataSelection.otherCostCondition'
    | 'masterDataSelection.yieldRateAndGoStraightRate'
    | 'masterDataSelection.manufacturingItemPrice'
    | 'masterDataSelection.clearTime'
    | 'masterDataSelection.yieldRateMaterial'
  SCT_COMPONENT_TYPE_ID: number
}

const Body = ({ name, SCT_COMPONENT_TYPE_ID }: Props) => {
  const formContext = useFormContext<FormDataPage>()
  const { control, getValues, setValue } = formContext

  const { errors } = useFormState({
    control
  })

  const [isOpenModal_RevisionMasterData, setIsOpenModal_RevisionMasterData] = useState<boolean>(false)

  return (
    <>
      {/* 1.Manual Input */}
      <TableCell align='center'>
        <Radio value={1} disabled />
      </TableCell>

      {/* 2.Master Data (Latest) */}
      <TableCell align='center'>
        <FormControl error={!!errors?.masterDataSelection || !!errors?.[name as keyof FormDataPage]}>
          <Controller
            name={`${name}`}
            control={control}
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <>
                <FormControlLabel
                  {...fieldProps}
                  value={1}
                  checked={value?.SCT_RESOURCE_OPTION_ID == 1}
                  onChange={() => {
                    // onChange(
                    //   name,
                    //   { SCT_COMPONENT_TYPE_ID, SCT_RESOURCE_OPTION_ID: 1 },
                    //   { shouldDirty: true, shouldTouch: true, shouldValidate: true }
                    // )

                    setValue(
                      name,
                      { SCT_COMPONENT_TYPE_ID, SCT_RESOURCE_OPTION_ID: 1 },
                      { shouldDirty: true, shouldTouch: true, shouldValidate: true }
                    )

                    // switch (name) {
                    //   // ? Direct Cost Condition
                    //   case 'masterDataSelection.directCostCondition': {
                    //     setValue(
                    //       name,
                    //       { SCT_COMPONENT_TYPE_ID, SCT_RESOURCE_OPTION_ID: 1 },
                    //       { shouldDirty: true, shouldTouch: true, shouldValidate: true }
                    //     )
                    //     // await DirectCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest(
                    //     //   {
                    //     //     FISCAL_YEAR: getValues('header.fiscalYear.value'),
                    //     //     PRODUCT_MAIN_ID: getValues('product.productMain.PRODUCT_MAIN_ID'),
                    //     //     ITEM_CATEGORY_ID: getValues('product.itemCategory.ITEM_CATEGORY_ID')
                    //     //   }
                    //     // )
                    //     //   .then(res => {
                    //     //     setValue(
                    //     //       'indirectCost.main.costCondition.directCostCondition',
                    //     //       {
                    //     //         directUnitProcessCost: res?.data?.ResultOnDb?.[0]?.DIRECT_UNIT_PROCESS_COST,
                    //     //         FISCAL_YEAR: res?.data?.ResultOnDb?.[0]?.FISCAL_YEAR,
                    //     //         indirectRateOfDirectProcessCost:
                    //     //           res?.data?.ResultOnDb?.[0]?.INDIRECT_RATE_OF_DIRECT_PROCESS_COST,
                    //     //         VERSION: res?.data?.ResultOnDb?.[0]?.VERSION
                    //     //       },
                    //     //       {
                    //     //         shouldDirty: true,
                    //     //         shouldTouch: true,
                    //     //         shouldValidate: true
                    //     //       }
                    //     //     )
                    //     //     onChange({
                    //     //       SCT_COMPONENT_TYPE_ID,
                    //     //       SCT_RESOURCE_OPTION_ID: 1
                    //     //     })
                    //     //   })
                    //     //   .catch(err => {
                    //     //     toast.error(`Error: ${err?.response?.data?.Message ?? err?.message}`)
                    //     //     return
                    //     //   })
                    //     break
                    //   }

                    //   // ? Indirect Cost Condition
                    //   case 'masterDataSelection.indirectCostCondition': {
                    //     setValue(
                    //       name,
                    //       { SCT_COMPONENT_TYPE_ID, SCT_RESOURCE_OPTION_ID: 1 },
                    //       { shouldDirty: true, shouldTouch: true, shouldValidate: true }
                    //     )
                    //     // await IndirectCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest(
                    //     //   {
                    //     //     FISCAL_YEAR: getValues('header.fiscalYear.value'),
                    //     //     PRODUCT_MAIN_ID: getValues('product.productMain.PRODUCT_MAIN_ID'),
                    //     //     ITEM_CATEGORY_ID: getValues('product.itemCategory.ITEM_CATEGORY_ID')
                    //     //   }
                    //     // )
                    //     // .then(res => {
                    //     //   setValue(
                    //     //     'indirectCost.main.costCondition.indirectCostCondition',
                    //     //     {
                    //     //       depreciation: res?.data?.ResultOnDb?.[0]?.DEPRECIATION,
                    //     //       labor: res?.data?.ResultOnDb?.[0]?.LABOR,
                    //     //       otherExpense: res?.data?.ResultOnDb?.[0]?.OTHER_EXPENSE,
                    //     //       totalIndirectCost: res?.data?.ResultOnDb?.[0]?.TOTAL_INDIRECT_COST,
                    //     //       FISCAL_YEAR: res?.data?.ResultOnDb?.[0]?.FISCAL_YEAR,
                    //     //       VERSION: res?.data?.ResultOnDb?.[0]?.VERSION
                    //     //     },
                    //     //     {
                    //     //       shouldDirty: true,
                    //     //       shouldTouch: true,
                    //     //       shouldValidate: true
                    //     //     }
                    //     //   )
                    //     //   onChange({
                    //     //     SCT_COMPONENT_TYPE_ID,
                    //     //     SCT_RESOURCE_OPTION_ID: 1
                    //     //   })
                    //     // })
                    //     // .catch(err => {
                    //     //   toast.error(`Error: ${err?.response?.data?.Message ?? err?.message}`)
                    //     //   return
                    //     // })
                    //     break
                    //   }

                    //   // ? Other Cost Condition
                    //   case 'masterDataSelection.otherCostCondition': {
                    //     await OtherCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest(
                    //       {
                    //         FISCAL_YEAR: getValues('header.fiscalYear.value'),
                    //         PRODUCT_MAIN_ID: getValues('product.productMain.PRODUCT_MAIN_ID'),
                    //         ITEM_CATEGORY_ID: getValues('product.itemCategory.ITEM_CATEGORY_ID')
                    //       }
                    //     )
                    //       .then(res => {
                    //         setValue(
                    //           'indirectCost.main.costCondition.otherCostCondition',
                    //           {
                    //             cit: res?.data?.ResultOnDb?.[0]?.CIT,
                    //             ga: res?.data?.ResultOnDb?.[0]?.GA,
                    //             margin: res?.data?.ResultOnDb?.[0]?.MARGIN,
                    //             sellingExpense: res?.data?.ResultOnDb?.[0]?.SELLING_EXPENSE,
                    //             vat: res?.data?.ResultOnDb?.[0]?.VAT,
                    //             FISCAL_YEAR: res?.data?.ResultOnDb?.[0]?.FISCAL_YEAR,
                    //             VERSION: res?.data?.ResultOnDb?.[0]?.VERSION
                    //           },
                    //           {
                    //             shouldDirty: true,
                    //             shouldTouch: true,
                    //             shouldValidate: true
                    //           }
                    //         )
                    //         onChange({
                    //           SCT_COMPONENT_TYPE_ID,
                    //           SCT_RESOURCE_OPTION_ID: 1
                    //         })
                    //       })
                    //       .catch(err => {
                    //         toast.error(`Error: ${err?.response?.data?.Message ?? err?.message}`)
                    //         return
                    //       })
                    //     break
                    //   }

                    //   // ? Special Cost Condition
                    //   case 'masterDataSelection.specialCostCondition': {
                    //     await SpecialCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest(
                    //       {
                    //         FISCAL_YEAR: getValues('header.fiscalYear.value'),
                    //         PRODUCT_MAIN_ID: getValues('product.productMain.PRODUCT_MAIN_ID'),
                    //         ITEM_CATEGORY_ID: getValues('product.itemCategory.ITEM_CATEGORY_ID')
                    //       }
                    //     )
                    //       .then(res => {
                    //         setValue(
                    //           'indirectCost.main.costCondition.specialCostCondition',
                    //           {
                    //             adjustPrice: res?.data?.ResultOnDb?.[0]?.ADJUST_PRICE,
                    //             FISCAL_YEAR: res?.data?.ResultOnDb?.[0]?.FISCAL_YEAR,
                    //             VERSION: res?.data?.ResultOnDb?.[0]?.VERSION
                    //           },
                    //           {
                    //             shouldDirty: true,
                    //             shouldTouch: true,
                    //             shouldValidate: true
                    //           }
                    //         )
                    //         onChange({
                    //           SCT_COMPONENT_TYPE_ID,
                    //           SCT_RESOURCE_OPTION_ID: 1
                    //         })
                    //       })
                    //       .catch(err => {
                    //         toast.error(`Error: ${err?.response?.data?.Message ?? err?.message}`)
                    //         return
                    //       })
                    //     break
                    //   }

                    //   // ? Yield Rate Go Straight Rate
                    //   case 'masterDataSelection.yieldRateAndGoStraightRate': {
                    //     await YieldRateGoStraightRateTotalForSctServices.getByProductTypeIdAndFiscalYear_MasterDataLatest(
                    //       {
                    //         FISCAL_YEAR: getValues('header.fiscalYear.value'),
                    //         PRODUCT_TYPE_ID: getValues('product.productType.PRODUCT_TYPE_ID')
                    //       }
                    //     )
                    //       .then(res => {
                    //         onChange({
                    //           SCT_COMPONENT_TYPE_ID,
                    //           SCT_RESOURCE_OPTION_ID: 1
                    //         })
                    //         setValue(
                    //           'directCost.flowProcess.total.main.yieldRateAndGoStraightRate',
                    //           {
                    //             fiscalYear: res?.data?.ResultOnDb?.[0]?.FISCAL_YEAR,
                    //             revisionNo: res?.data?.ResultOnDb?.[0]?.REVISION_NO,
                    //             totalYieldRate: res?.data?.ResultOnDb?.[0]?.TOTAL_YIELD_RATE_FOR_SCT,
                    //             totalGoStraightRate: res?.data?.ResultOnDb?.[0]?.TOTAL_GO_STRAIGHT_RATE_FOR_SCT,
                    //             flowCode: res?.data?.ResultOnDb?.[0]?.FLOW_CODE,
                    //             flowName: res?.data?.ResultOnDb?.[0]?.FLOW_NAME,
                    //             flowId: res?.data?.ResultOnDb?.[0]?.FLOW_ID
                    //           },
                    //           { shouldDirty: true, shouldTouch: true, shouldValidate: true }
                    //         )
                    //       })
                    //       .catch(err => {
                    //         toast.error(`Error: ${err?.response?.data?.Message ?? err?.message}`)
                    //         return
                    //       })
                    //     break
                    //   }

                    //   case 'masterDataSelection.clearTime': {
                    //     await ClearTimeTotalForSctServices.getByProductTypeIdAndFiscalYear_MasterDataLatest({
                    //       FISCAL_YEAR: getValues('header.fiscalYear.value'),
                    //       PRODUCT_TYPE_ID: getValues('product.productType.PRODUCT_TYPE_ID')
                    //     })
                    //       .then(res => {
                    //         setValue(
                    //           'directCost.flowProcess.total.main.clearTime',
                    //           {
                    //             fiscalYear: res?.data?.ResultOnDb?.[0]?.FISCAL_YEAR,
                    //             revisionNo: res?.data?.ResultOnDb?.[0]?.REVISION_NO,
                    //             totalClearTime: res?.data?.ResultOnDb?.[0]?.TOTAL_CLEAR_TIME_FOR_SCT,
                    //             flowCode: res?.data?.ResultOnDb?.[0]?.FLOW_CODE,
                    //             flowName: res?.data?.ResultOnDb?.[0]?.FLOW_NAME,
                    //             flowId: res?.data?.ResultOnDb?.[0]?.FLOW_ID
                    //           },
                    //           {
                    //             shouldDirty: true,
                    //             shouldTouch: true,
                    //             shouldValidate: true
                    //           }
                    //         )
                    //         onChange({
                    //           SCT_COMPONENT_TYPE_ID,
                    //           SCT_RESOURCE_OPTION_ID: 1
                    //         })
                    //       })
                    //       .catch(err => {
                    //         toast.error(`Error: ${err?.response?.data?.Message ?? err?.message}`)
                    //         return
                    //       })
                    //     break
                    //   }

                    //   case 'masterDataSelection.manufacturingItemPrice': {
                    //     setValue(
                    //       `${name}`,
                    //       {
                    //         SCT_COMPONENT_TYPE_ID,
                    //         SCT_RESOURCE_OPTION_ID: 1
                    //       },
                    //       {
                    //         shouldDirty: true,
                    //         shouldTouch: true,
                    //         shouldValidate: true
                    //       }
                    //     )
                    //     break
                    //   }

                    //   case 'masterDataSelection.yieldRateMaterial': {
                    //     setValue(
                    //       `${name}`,
                    //       {
                    //         SCT_COMPONENT_TYPE_ID,
                    //         SCT_RESOURCE_OPTION_ID: 1
                    //       },
                    //       {
                    //         shouldDirty: true,
                    //         shouldTouch: true,
                    //         shouldValidate: true
                    //       }
                    //     )
                    //     break
                    //   }

                    //   default:
                    //     toast.error('Error')
                    //     break
                    // }
                  }}
                  disabled={getValues('mode') == 'view' || getValues('isCalculationAlready')}
                  control={<Radio />}
                  label=''
                />
              </>
            )}
          />
        </FormControl>
      </TableCell>

      {/* 3.SCT Selection */}
      <TableCell align='center'>
        <FormControl
          error={!!errors?.masterDataSelection || !!errors?.[name as keyof FormDataPage]}
          disabled={[1, 2].includes(getValues('header.sctCreateFrom.SCT_CREATE_FROM_SETTING_ID')) || false}
        >
          <Controller
            name={`${name}`}
            control={control}
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <>
                <FormControlLabel
                  {...fieldProps}
                  value={4}
                  checked={value?.SCT_RESOURCE_OPTION_ID == 4}
                  onChange={() => {
                    // onChange(
                    //   name,
                    //   { SCT_COMPONENT_TYPE_ID, SCT_RESOURCE_OPTION_ID: 4 },
                    //   { shouldDirty: true, shouldTouch: true, shouldValidate: true }
                    // )

                    setValue(
                      name,
                      { SCT_COMPONENT_TYPE_ID, SCT_RESOURCE_OPTION_ID: 4 },
                      { shouldDirty: true, shouldTouch: true, shouldValidate: true }
                    )
                  }}
                  // onChange={async () => {
                  //   switch (name) {
                  //     // ? Direct Cost
                  //     case 'masterDataSelection.directCostCondition': {
                  //       const VERSION_NO = getValues('listSctMasterDataHistory')?.find(
                  //         item => item.SCT_MASTER_DATA_SETTING_ID == 1 && item.IS_FROM_SCT_COPY == 1
                  //       )?.VERSION_NO

                  //       if (!VERSION_NO) {
                  //         toast.error(`Error: Can not find data. Please check your data.`, { autoClose: 10000 })
                  //         return
                  //       } else {
                  //         await DirectCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo(
                  //           {
                  //             FISCAL_YEAR: getValues('header.fiscalYear').value,
                  //             PRODUCT_MAIN_ID: getValues('product.productMain').PRODUCT_MAIN_ID,
                  //             ITEM_CATEGORY_ID: getValues('product.itemCategory').ITEM_CATEGORY_ID,
                  //             VERSION: VERSION_NO
                  //           }
                  //         )
                  //           .then(res => {
                  //             setValue(
                  //               'indirectCost.main.costCondition.directCostCondition',
                  //               {
                  //                 directUnitProcessCost: res?.data?.ResultOnDb?.[0]?.DIRECT_UNIT_PROCESS_COST,
                  //                 indirectRateOfDirectProcessCost:
                  //                   res?.data?.ResultOnDb?.[0]?.INDIRECT_RATE_OF_DIRECT_PROCESS_COST,
                  //                 FISCAL_YEAR: res?.data?.ResultOnDb?.[0]?.FISCAL_YEAR,
                  //                 VERSION: res?.data?.ResultOnDb?.[0]?.VERSION
                  //               },
                  //               { shouldDirty: true, shouldTouch: true, shouldValidate: true }
                  //             )
                  //             // ? onChange
                  //             onChange({
                  //               SCT_COMPONENT_TYPE_ID,
                  //               SCT_RESOURCE_OPTION_ID: 4
                  //             })
                  //           })
                  //           .catch(() => {
                  //             toast.error(`Error: Can not find data. Please check your data.`, { autoClose: 10000 })
                  //           })

                  //         break
                  //       }
                  //     }

                  //     // ? Indirect Cost
                  //     case 'masterDataSelection.indirectCostCondition': {
                  //       const VERSION_NO = getValues('listSctMasterDataHistory')?.find(
                  //         item => item.SCT_MASTER_DATA_SETTING_ID == 2 && item.IS_FROM_SCT_COPY == 1
                  //       )?.VERSION_NO

                  //       if (!VERSION_NO) {
                  //         toast.error(`Error: Can not find data. Please check your data.`, { autoClose: 10000 })
                  //         return
                  //       } else {
                  //         await IndirectCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo(
                  //           {
                  //             FISCAL_YEAR: getValues('header.fiscalYear').value,
                  //             PRODUCT_MAIN_ID: getValues('product.productMain').PRODUCT_MAIN_ID,
                  //             ITEM_CATEGORY_ID: getValues('product.itemCategory').ITEM_CATEGORY_ID,
                  //             VERSION: VERSION_NO
                  //           }
                  //         )
                  //           .then(res => {
                  //             setValue(
                  //               'indirectCost.main.costCondition.indirectCostCondition',
                  //               {
                  //                 depreciation: res?.data?.ResultOnDb?.[0]?.DEPRECIATION,
                  //                 labor: res?.data?.ResultOnDb?.[0]?.LABOR,
                  //                 FISCAL_YEAR: res?.data?.ResultOnDb?.[0]?.FISCAL_YEAR,
                  //                 VERSION: res?.data?.ResultOnDb?.[0]?.VERSION,
                  //                 otherExpense: res?.data?.ResultOnDb?.[0]?.OTHER_EXPENSE,
                  //                 totalIndirectCost: res?.data?.ResultOnDb?.[0]?.TOTAL_INDIRECT_COST
                  //               },
                  //               { shouldDirty: true, shouldTouch: true, shouldValidate: true }
                  //             )
                  //             // ? onChange
                  //             onChange({
                  //               SCT_COMPONENT_TYPE_ID,
                  //               SCT_RESOURCE_OPTION_ID: 4
                  //             })
                  //           })
                  //           .catch(() => {
                  //             toast.error(`Error: Can not find data. Please check your data.`, { autoClose: 10000 })
                  //           })
                  //         break
                  //       }
                  //     }

                  //     // ? Other Cost
                  //     case 'masterDataSelection.otherCostCondition': {
                  //       const VERSION_NO = getValues('listSctMasterDataHistory')?.find(
                  //         item => item.SCT_MASTER_DATA_SETTING_ID == 3 && item.IS_FROM_SCT_COPY == 1
                  //       )?.VERSION_NO

                  //       if (!VERSION_NO) {
                  //         toast.error(`Error: Can not find data. Please check your data.`, { autoClose: 10000 })
                  //         return
                  //       } else {
                  //         await OtherCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo(
                  //           {
                  //             FISCAL_YEAR: getValues('header.fiscalYear').value,
                  //             PRODUCT_MAIN_ID: getValues('product.productMain').PRODUCT_MAIN_ID,
                  //             ITEM_CATEGORY_ID: getValues('product.itemCategory').ITEM_CATEGORY_ID,
                  //             VERSION: VERSION_NO
                  //           }
                  //         )
                  //           .then(res => {
                  //             setValue(
                  //               'indirectCost.main.costCondition.otherCostCondition',
                  //               {
                  //                 cit: res?.data?.ResultOnDb?.[0]?.CIT,
                  //                 FISCAL_YEAR: res?.data?.ResultOnDb?.[0]?.FISCAL_YEAR,
                  //                 ga: res?.data?.ResultOnDb?.[0]?.GA,
                  //                 margin: res?.data?.ResultOnDb?.[0]?.MARGIN,
                  //                 sellingExpense: res?.data?.ResultOnDb?.[0]?.SELLING_EXPENSE,
                  //                 VERSION: res?.data?.ResultOnDb?.[0]?.VERSION,
                  //                 vat: res?.data?.ResultOnDb?.[0]?.VAT
                  //               },
                  //               { shouldDirty: true, shouldTouch: true, shouldValidate: true }
                  //             )
                  //             // ? onChange
                  //             onChange({
                  //               SCT_COMPONENT_TYPE_ID,
                  //               SCT_RESOURCE_OPTION_ID: 4
                  //             })
                  //           })
                  //           .catch(() => {
                  //             toast.error(`Error: Can not find data. Please check your data.`, { autoClose: 10000 })
                  //           })
                  //         break
                  //       }
                  //     }

                  //     // ? Special Cost
                  //     case 'masterDataSelection.specialCostCondition': {
                  //       const VERSION_NO = getValues('listSctMasterDataHistory')?.find(
                  //         item => item.SCT_MASTER_DATA_SETTING_ID == 4 && item.IS_FROM_SCT_COPY == 1
                  //       )?.VERSION_NO

                  //       if (!VERSION_NO) {
                  //         toast.error(`Error: Can not find data. Please check your data.`, { autoClose: 10000 })
                  //         return
                  //       } else {
                  //         await SpecialCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo(
                  //           {
                  //             FISCAL_YEAR: getValues('header.fiscalYear').value,
                  //             PRODUCT_MAIN_ID: getValues('product.productMain').PRODUCT_MAIN_ID,
                  //             ITEM_CATEGORY_ID: getValues('product.itemCategory').ITEM_CATEGORY_ID,
                  //             VERSION: VERSION_NO
                  //           }
                  //         )
                  //           .then(res => {
                  //             setValue(
                  //               'indirectCost.main.costCondition.specialCostCondition',
                  //               {
                  //                 adjustPrice: res?.data?.ResultOnDb?.[0]?.ADJUST_PRICE,
                  //                 FISCAL_YEAR: res?.data?.ResultOnDb?.[0]?.FISCAL_YEAR,
                  //                 VERSION: res?.data?.ResultOnDb?.[0]?.VERSION
                  //               },
                  //               { shouldDirty: true, shouldTouch: true, shouldValidate: true }
                  //             )
                  //             // ? onChange
                  //             onChange({
                  //               SCT_COMPONENT_TYPE_ID,
                  //               SCT_RESOURCE_OPTION_ID: 4
                  //             })
                  //           })
                  //           .catch(() => {
                  //             toast.error(`Error: Can not find data. Please check your data.`, { autoClose: 10000 })
                  //           })
                  //         break
                  //       }
                  //     }

                  //     // ? Yield Rate & Go Straight Rate
                  //     case 'masterDataSelection.yieldRateAndGoStraightRate': {
                  //       const VERSION_NO = getValues('listSctMasterDataHistory')?.find(
                  //         item => item.SCT_MASTER_DATA_SETTING_ID == 5 && item.IS_FROM_SCT_COPY == 1
                  //       )?.VERSION_NO

                  //       if (!VERSION_NO) {
                  //         toast.error(`Error: Can not find data. Please check your data.`, { autoClose: 10000 })
                  //         return
                  //       } else {
                  //         await YieldRateGoStraightRateTotalForSctServices.getByProductTypeIdAndFiscalYearAndRevisionNo(
                  //           {
                  //             FISCAL_YEAR: getValues('header.fiscalYear').value,
                  //             PRODUCT_TYPE_ID: getValues('product.productType').PRODUCT_TYPE_ID,
                  //             REVISION_NO: VERSION_NO
                  //           }
                  //         )
                  //           .then(res => {
                  //             setValue(
                  //               'directCost.flowProcess.total.main.yieldRateAndGoStraightRate',
                  //               {
                  //                 fiscalYear: res?.data?.ResultOnDb?.[0]?.FISCAL_YEAR,
                  //                 revisionNo: res?.data?.ResultOnDb?.[0]?.REVISION_NO,
                  //                 totalYieldRate: res?.data?.ResultOnDb?.[0]?.TOTAL_YIELD_RATE_FOR_SCT,
                  //                 totalGoStraightRate: res?.data?.ResultOnDb?.[0]?.TOTAL_GO_STRAIGHT_RATE_FOR_SCT,
                  //                 flowCode: res?.data?.ResultOnDb?.[0]?.FLOW_CODE,
                  //                 flowName: res?.data?.ResultOnDb?.[0]?.FLOW_NAME,
                  //                 flowId: res?.data?.ResultOnDb?.[0]?.FLOW_ID
                  //               },
                  //               { shouldDirty: true, shouldTouch: true, shouldValidate: true }
                  //             )
                  //             // ? onChange
                  //             onChange({
                  //               SCT_COMPONENT_TYPE_ID,
                  //               SCT_RESOURCE_OPTION_ID: 4
                  //             })
                  //           })
                  //           .catch(() => {
                  //             toast.error(`Error: Can not find data. Please check your data.`, { autoClose: 10000 })
                  //           })
                  //         break
                  //       }
                  //     }

                  //     // ? Clear Time
                  //     case 'masterDataSelection.clearTime': {
                  //       const VERSION_NO = getValues('listSctMasterDataHistory')?.find(
                  //         item => item.SCT_MASTER_DATA_SETTING_ID == 6 && item.IS_FROM_SCT_COPY == 1
                  //       )?.VERSION_NO

                  //       if (!VERSION_NO) {
                  //         toast.error(`Error: Can not find data. Please check your data.`, { autoClose: 10000 })
                  //         return
                  //       } else {
                  //         await ClearTimeTotalForSctServices.getByProductTypeIdAndFiscalYearAndRevisionNo({
                  //           FISCAL_YEAR: getValues('header.fiscalYear').value,
                  //           PRODUCT_TYPE_ID: getValues('product.productType').PRODUCT_TYPE_ID,
                  //           REVISION_NO: VERSION_NO
                  //         })
                  //           .then(res => {
                  //             setValue(
                  //               'directCost.flowProcess.total.main.clearTime',
                  //               {
                  //                 fiscalYear: res?.data?.ResultOnDb?.[0]?.FISCAL_YEAR,
                  //                 revisionNo: res?.data?.ResultOnDb?.[0]?.REVISION_NO,
                  //                 totalClearTime: res?.data?.ResultOnDb?.[0]?.TOTAL_CLEAR_TIME_FOR_SCT,
                  //                 flowCode: res?.data?.ResultOnDb?.[0]?.FLOW_CODE,
                  //                 flowName: res?.data?.ResultOnDb?.[0]?.FLOW_NAME,
                  //                 flowId: res?.data?.ResultOnDb?.[0]?.FLOW_ID
                  //               },
                  //               { shouldDirty: true, shouldTouch: true, shouldValidate: true }
                  //             )
                  //             // ? onChange
                  //             onChange({
                  //               SCT_COMPONENT_TYPE_ID,
                  //               SCT_RESOURCE_OPTION_ID: 4
                  //             })
                  //           })
                  //           .catch(() => {
                  //             toast.error(`Error: Can not find data. Please check your data.`, { autoClose: 10000 })
                  //           })
                  //       }
                  //       break
                  //     }

                  //     case 'masterDataSelection.manufacturingItemPrice': {
                  //       setValue(
                  //         `${name}`,
                  //         {
                  //           SCT_COMPONENT_TYPE_ID,
                  //           SCT_RESOURCE_OPTION_ID: 4
                  //         },
                  //         {
                  //           shouldDirty: true,
                  //           shouldTouch: true,
                  //           shouldValidate: true
                  //         }
                  //       )
                  //       break
                  //     }

                  //     case 'masterDataSelection.yieldRateMaterial': {
                  //       setValue(
                  //         `${name}`,
                  //         {
                  //           SCT_COMPONENT_TYPE_ID,
                  //           SCT_RESOURCE_OPTION_ID: 4
                  //         },
                  //         {
                  //           shouldDirty: true,
                  //           shouldTouch: true,
                  //           shouldValidate: true
                  //         }
                  //       )
                  //       break
                  //     }

                  //     default:
                  //       toast.error(`Error: Can not find data. Please check your data.`, { autoClose: 10000 })
                  //       break
                  //   }
                  // }}
                  control={<Radio />}
                  disabled={
                    getValues('mode') == 'view' ||
                    getValues('isCalculationAlready') ||
                    [1, 2].includes(getValues('header.sctCreateFrom.SCT_CREATE_FROM_SETTING_ID'))
                  }
                  label=''
                />
              </>
            )}
          />
        </FormControl>
      </TableCell>

      {/* 4.Revision Master Data */}
      <TableCell align='center'>
        <>
          <FormControl error={!!errors?.masterDataSelection || !!errors?.[name as keyof FormDataPage]}>
            <Controller
              name={`${name}`}
              control={control}
              render={({ field: { value, name, onChange, ...fieldProps } }) => (
                <>
                  <FormControlLabel
                    {...fieldProps}
                    value={4}
                    checked={value?.SCT_RESOURCE_OPTION_ID == 2}
                    // onChange={() => {
                    //   setIsOpenModal_RevisionMasterData(true)
                    // }}
                    onClick={() => {
                      setIsOpenModal_RevisionMasterData(true)
                    }}
                    disabled={
                      ['masterDataSelection.manufacturingItemPrice', 'masterDataSelection.yieldRateMaterial'].includes(
                        name
                      ) ||
                      getValues('mode') == 'view' ||
                      getValues('isCalculationAlready')
                    }
                    control={<Radio />}
                    label=''
                  />
                  {isOpenModal_RevisionMasterData && name == 'masterDataSelection.directCostCondition' ? (
                    <DirectCostCondition
                      isOpenModal={isOpenModal_RevisionMasterData}
                      setIsOpenModal={setIsOpenModal_RevisionMasterData}
                      PRODUCT_MAIN={getValues('product.productMain')}
                      FISCAL_YEAR={getValues('header.fiscalYear')}
                      RHF_parent={formContext}
                      onChange={() =>
                        onChange({
                          SCT_COMPONENT_TYPE_ID,
                          SCT_RESOURCE_OPTION_ID: 2
                        })
                      }
                    />
                  ) : null}

                  {isOpenModal_RevisionMasterData && name == 'masterDataSelection.indirectCostCondition' ? (
                    <IndirectCostCondition
                      isOpenModal={isOpenModal_RevisionMasterData}
                      setIsOpenModal={setIsOpenModal_RevisionMasterData}
                      PRODUCT_MAIN={getValues('product.productMain')}
                      FISCAL_YEAR={getValues('header.fiscalYear')}
                      RHF_parent={formContext}
                      onChange={() =>
                        onChange({
                          SCT_COMPONENT_TYPE_ID,
                          SCT_RESOURCE_OPTION_ID: 2
                        })
                      }
                    />
                  ) : null}

                  {isOpenModal_RevisionMasterData && name == 'masterDataSelection.otherCostCondition' ? (
                    <OtherCostCondition
                      isOpenModal={isOpenModal_RevisionMasterData}
                      setIsOpenModal={setIsOpenModal_RevisionMasterData}
                      PRODUCT_MAIN={getValues('product.productMain')}
                      FISCAL_YEAR={getValues('header.fiscalYear')}
                      RHF_parent={formContext}
                      onChange={() =>
                        onChange({
                          SCT_COMPONENT_TYPE_ID,
                          SCT_RESOURCE_OPTION_ID: 2
                        })
                      }
                    />
                  ) : null}

                  {isOpenModal_RevisionMasterData && name == 'masterDataSelection.specialCostCondition' ? (
                    <SpecialCostCondition
                      isOpenModal={isOpenModal_RevisionMasterData}
                      setIsOpenModal={setIsOpenModal_RevisionMasterData}
                      PRODUCT_MAIN={getValues('product.productMain')}
                      FISCAL_YEAR={getValues('header.fiscalYear')}
                      RHF_parent={formContext}
                      onChange={() =>
                        onChange({
                          SCT_COMPONENT_TYPE_ID,
                          SCT_RESOURCE_OPTION_ID: 2
                        })
                      }
                    />
                  ) : null}

                  {isOpenModal_RevisionMasterData && name == 'masterDataSelection.yieldRateAndGoStraightRate' ? (
                    <YieldRateGoStraightRate
                      isOpenModal={isOpenModal_RevisionMasterData}
                      setIsOpenModal={setIsOpenModal_RevisionMasterData}
                      PRODUCT_TYPE={getValues('product.productType')}
                      FISCAL_YEAR={getValues('header.fiscalYear')}
                      RHF_parent={formContext}
                      onChange={() =>
                        onChange({
                          SCT_COMPONENT_TYPE_ID,
                          SCT_RESOURCE_OPTION_ID: 2
                        })
                      }
                    />
                  ) : null}

                  {isOpenModal_RevisionMasterData && name == 'masterDataSelection.clearTime' ? (
                    <ClearTime
                      isOpenModal={isOpenModal_RevisionMasterData}
                      setIsOpenModal={setIsOpenModal_RevisionMasterData}
                      PRODUCT_TYPE={getValues('product.productType')}
                      FISCAL_YEAR={getValues('header.fiscalYear')}
                      RHF_parent={formContext}
                      onChange={() =>
                        onChange({
                          SCT_COMPONENT_TYPE_ID,
                          SCT_RESOURCE_OPTION_ID: 2
                        })
                      }
                    />
                  ) : null}
                </>
              )}
            />
          </FormControl>
        </>
      </TableCell>

      {/* Revision No.*/}
      <TableCell align='center'>
        {name === 'masterDataSelection.directCostCondition' ? (
          <Typography>
            {getValues('indirectCost.main.costCondition.directCostCondition.FISCAL_YEAR') ?? ''} Rev.
            {getValues('indirectCost.main.costCondition.directCostCondition.VERSION') ?? ''}
          </Typography>
        ) : null}
        {name === 'masterDataSelection.indirectCostCondition' ? (
          <Typography>
            {getValues('indirectCost.main.costCondition.indirectCostCondition.FISCAL_YEAR') ?? ''} Rev.
            {getValues('indirectCost.main.costCondition.indirectCostCondition.VERSION') ?? ''}
          </Typography>
        ) : null}
        {name === 'masterDataSelection.specialCostCondition' ? (
          <Typography>
            {getValues('indirectCost.main.costCondition.specialCostCondition.FISCAL_YEAR') ?? ''} Rev.
            {getValues('indirectCost.main.costCondition.specialCostCondition.VERSION') ?? ''}
          </Typography>
        ) : null}
        {name === 'masterDataSelection.otherCostCondition' ? (
          <Typography>
            {getValues('indirectCost.main.costCondition.otherCostCondition.FISCAL_YEAR') ?? ''} Rev.
            {getValues('indirectCost.main.costCondition.otherCostCondition.VERSION') ?? ''}
          </Typography>
        ) : null}
        {name === 'masterDataSelection.yieldRateAndGoStraightRate' ? (
          <Typography>
            {getValues('directCost.flowProcess.total.main.yieldRateAndGoStraightRate.fiscalYear') ?? ''} Rev.
            {getValues('directCost.flowProcess.total.main.yieldRateAndGoStraightRate.revisionNo') ?? ''}
          </Typography>
        ) : null}
        {name === 'masterDataSelection.clearTime' ? (
          <Typography>
            {getValues('directCost.flowProcess.total.main.clearTime.fiscalYear') ?? ''} Rev.
            {getValues('directCost.flowProcess.total.main.clearTime.revisionNo') ?? ''}
          </Typography>
        ) : null}
        {name === 'masterDataSelection.manufacturingItemPrice' && <Typography>-</Typography>}
        {name === 'masterDataSelection.yieldRateMaterial' && <Typography>-</Typography>}
      </TableCell>
    </>
  )
}

export default Body
