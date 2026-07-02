import { Dispatch, forwardRef, ReactElement, Ref, SetStateAction, useEffect, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, FormProvider, SubmitErrorHandler, useForm, useFormState, useWatch } from 'react-hook-form'

import { useQueryClient } from '@tanstack/react-query'

import {
  PREFIX_QUERY_KEY,
  useChangeSctProgress,
  useReCal,
  useUpdateSctData
} from '@/_workspace/react-query/hooks/useStandardCostForProduct'

import ConfirmModal from '@/components/ConfirmModal'

import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import {
  Button,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Slide,
  SlideProps,
  Typography
} from '@mui/material'

import { MRT_Row } from 'material-react-table'

import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'

import CostPriceTab from './CostPriceTab'
import Header from './Header'
import Product from './Product'
import SctCompare from './SctCompare/SctCompare'
import SellingPrice from './SellingPrice'

import { getUserData } from '@/utils/user-profile/userLoginProfile'

import StandardCostForProductServices from '@/_workspace/services/sct/StandardCostForProductServices'

import { fetchSctStatusProgressNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchSctStatusProgress'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'

import ConfirmModalForSctForProduct from '../ConfirmModalForSctForProduct'

import { fetchSctReCalButton } from '@/_workspace/react-select/async-promise-load-options/fetchSctReCalButton'

import SpecialCostConditionServices from '@/_workspace/services/cost-condition/SpecialCostConditionServices'
import { canSeeCol } from '../../SearchResult'
import { useDxContext } from '@/_template/DxContextProvider'
import SctMasterDataHistoryServices from '@/_workspace/services/sct/SctMasterDataHistoryServices'
import { FormDataPage, validationSchemaPage } from './validationSchema'
import { StandardCostI } from '@/_workspace/types/sct/StandardCostType'
import SctCompareServices from '@/_workspace/services/sct/SctCompareServices'
import FlowProcessServices from '@/_workspace/services/flow/FlowProcessServices'
import { toast } from 'react-toastify'

import SkeletonCustom from '@/components/SkeletonCustom'
import DirectCostConditionServices from '@/_workspace/services/cost-condition/DirectCostConditionServices'
import IndirectCostConditionServices from '@/_workspace/services/cost-condition/IndirectCostConditionServices'
import OtherCostConditionServices from '@/_workspace/services/cost-condition/OtherCostConditionServices'
import ImportFeeServices from '@/_workspace/services/cost-condition/ImportFeeServices'
import SctComponentTypeResourceOptionSelectServices from '@/_workspace/services/sct/SctComponentTypeResourceOptionSelectServices'
import YieldRateGoStraightRateTotalForSctServices from '@/_workspace/services/yield-rate/YieldRateGoStraightRateTotalForSctServices'
import ClearTimeTotalForSctServices from '@/_workspace/services/_ClearTimeSystem/ClearTimeTotalForSctServices'
import { SctCreateFromHistoryI } from '@/_workspace/types/sct/SctCreateFromHistoryI'
import MasterDataSelection from './MasterDataSelection'
import SctCreateFrom from './SctCreateFrom'
import SctBomFlowProcessItemUsagePriceServices from '@/_workspace/services/sct/SctBomFlowProcessItemUsagePriceServices'
import BomFlowProcessItemUsageServices from '@/_workspace/services/bom/BomFlowProcessItemUsageServices'
import SctDetailForAdjustService from '@/_workspace/services/sct/SctDetailForAdjustService'
import SctTotalCostService from '@/_workspace/services/sct/SctTotalCostService'
import { is_Null_Undefined_Blank } from '@/utils/formatting-checking-value/checkingValueTypes'
import SctBomFlowProcessItemUsagePriceAdjustServices from '@/_workspace/services/sct/SctBomFlowProcessItemUsagePriceAdjustServices'

// Dialog
const Transition = forwardRef(function Transition(props: SlideProps & { children?: ReactElement }, ref: Ref<unknown>) {
  return <Slide direction='up' ref={ref} {...props} />
})

interface Props {
  isOpenModal: boolean
  setRowSelected?: Dispatch<SetStateAction<MRT_Row<StandardCostI> | null>>
  setIsOpenModal: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<StandardCostI>
  mode: 'edit' | 'view'
  isCalculationAlready: boolean
}

// const toDateOrNull = (s?: string | null) =>
//   s ? (dayjs(s, 'YYYY-MM-DD', true).isValid() ? dayjs(s, 'YYYY-MM-DD').toDate() : null) : null

type yieldRateGoStraightRateTotalType = {
  YIELD_RATE_GO_STRAIGHT_RATE_TOTAL_FOR_SCT_ID: string
  FISCAL_YEAR: number
  REVISION_NO: number
  PRODUCT_TYPE_ID: number
  FLOW_ID: number
  FLOW_CODE: string
  FLOW_NAME: string
  TOTAL_YIELD_RATE_FOR_SCT: number
  TOTAL_GO_STRAIGHT_RATE_FOR_SCT: number
}

// type yieldRateGoStraightRateProcessForSctType = {
//   YIELD_RATE_GO_STRAIGHT_RATE_PROCESS_FOR_SCT_ID: string
//   FISCAL_YEAR: number
//   REVISION_NO: number
//   PRODUCT_TYPE_ID: number
//   FLOW_ID: number
//   FLOW_PROCESS_ID: number
//   FLOW_PROCESS_NO: number
//   PROCESS_ID: number
//   YIELD_RATE_FOR_SCT: number
//   YIELD_ACCUMULATION_FOR_SCT: number
//   GO_STRAIGHT_RATE_FOR_SCT: number
//   COLLECTION_POINT_FOR_SCT: 0 | 1
// }

type clearTimeForSctTotalType = {
  CLEAR_TIME_FOR_SCT_ID: string
  FISCAL_YEAR: number
  REVISION_NO: number
  PRODUCT_TYPE_ID: number
  FLOW_ID: number
  FLOW_CODE: string
  FLOW_NAME: string
  TOTAL_CLEAR_TIME_FOR_SCT: number
}

// type clearTimeForSctProcessType = {
//   CLEAR_TIME_FOR_SCT_PROCESS_ID: string
//   FISCAL_YEAR: number
//   REVISION_NO: number
//   PRODUCT_TYPE_ID: number
//   FLOW_ID: number
//   FLOW_PROCESS_ID: number
//   FLOW_PROCESS_NO: number
//   PROCESS_ID: number
//   CLEAR_TIME_FOR_SCT: number
// }

type directCostConditionType = {
  FISCAL_YEAR: number
  VERSION: number
  PRODUCT_MAIN_ID: number
  DIRECT_COST_CONDITION_ID: number

  DIRECT_UNIT_PROCESS_COST: number
  INDIRECT_RATE_OF_DIRECT_PROCESS_COST: number
}
type inDirectCostConditionType = {
  FISCAL_YEAR: number
  VERSION: number
  PRODUCT_MAIN_ID: number
  INDIRECT_COST_CONDITION_ID: number

  LABOR: number
  DEPRECIATION: number
  OTHER_EXPENSE: number
  TOTAL_INDIRECT_COST: number
}

type otherCostConditionType = {
  OTHER_COST_CONDITION_ID: number
  PRODUCT_MAIN_ID: number
  FISCAL_YEAR: number
  GA: number
  MARGIN: number
  SELLING_EXPENSE: number
  VAT: number
  CIT: number
  VERSION: number
}

type specialCostConditionType = {
  SPECIAL_COST_CONDITION_ID: number
  PRODUCT_MAIN_ID: number
  ADJUST_PRICE: number
  FISCAL_YEAR: number
  VERSION: number
}

type importFeeRateType = {
  IMPORT_FEE_ID: number
  IMPORT_FEE_RATE: number
  FISCAL_YEAR: number
  VERSION: number
  ITEM_IMPORT_TYPE_ID: number
}

export type SctBomFlowProcessItemUsagePriceType = {
  SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ID: string
  SCT_ID: string
  BOM_FLOW_PROCESS_ITEM_USAGE_ID: number
  ITEM_M_S_PRICE_ID: string
  PRICE: number
  YIELD_ACCUMULATION: number
  AMOUNT: number
  IS_ADJUST_YIELD_ACCUMULATION: number
  YIELD_ACCUMULATION_DEFAULT: number
  CREATE_BY: string
  CREATE_DATE: string
  UPDATE_BY: string
  UPDATE_DATE: string
  INUSE: number
  ADJUST_YIELD_ACCUMULATION_VERSION_NO: number
  SCT_ID_SELECTION: string
  PURCHASE_UNIT_ID: number
  PURCHASE_UNIT_NAME: string
  USAGE_UNIT_ID: number
  USAGE_UNIT_NAME: string
  PURCHASE_PRICE: number
  PURCHASE_UNIT_RATIO: number
  EXCHANGE_RATE_VALUE: number
  USAGE_UNIT_RATIO: number
  FISCAL_YEAR: number
  SCT_PATTERN_ID: number
  ITEM_M_S_PRICE_VALUE: number
  ITEM_M_S_PRICE_VERSION: number
  PURCHASE_PRICE_CURRENCY_NAME: string
  PURCHASE_PRICE_CURRENCY_SYMBOL: string
  IS_FROM_SCT_COPY: number
}

type SctBomFlowProcessItemUsagePriceAdjustType = {
  BOM_FLOW_PROCESS_ITEM_USAGE_ID: number
  SCT_ID: string
  SCT_ID_SELECTION: string
  IS_FROM_SCT_COPY: number
}

export default function SctForProductEditModal({
  isOpenModal,
  setIsOpenModal,
  rowSelected,
  mode,
  setRowSelected,
  isCalculationAlready
}: Props) {
  const [confirmModal, setConfirmModal] = useState(false)
  const [confirmChangeProgressModal, setConfirmChangeProgressModal] = useState(false)
  const [openConfirmReCalModal, setOpenConfirmReCalModal] = useState(false)
  const [isDraft, setIsDraft] = useState(false)

  const { setPagination, setIsEnableFetching } = useDxContext()

  // react-hook-form
  const reactHookFormMethods = useForm<FormDataPage>({
    resolver: zodResolver(validationSchemaPage),
    mode: 'onSubmit',
    shouldUnregister: true,
    defaultValues: async (): Promise<FormDataPage> => {
      try {
        // 🔸 ขั้นตอนที่ 1: ต้องได้ sctData ก่อน เพราะใช้ใน API อื่นๆ
        const sctData = await StandardCostForProductServices.getSctDataDetail({
          SCT_ID: rowSelected.original.SCT_ID
        }).then(res => res.data.ResultOnDb[0])

        // 🔸 ขั้นตอนที่ 2: เรียก API ทั้งหมดที่ต้องใช้ sctData พร้อมกัน
        const [
          sctCompare,
          listFlowProcess,
          listBomFlowProcessItemUsage,
          sctDetailForAdjust,
          sctTotalCost,
          listSctComponentTypeResourceOptionSelect,
          listSctMasterDataHistory,
          listSctBomFlowProcessItemUsagePrice,
          listSctBomFlowProcessItemUsagePriceAdjust,
          importFeeRate
        ] = await Promise.all([
          // API ที่ใช้ SCT_ID เท่านั้น
          SctCompareServices.getBySctId({
            SCT_ID: rowSelected.original.SCT_ID
          }).then(res => res.data.ResultOnDb),

          // API ที่ใช้ FLOW_ID จาก sctData
          FlowProcessServices.getByFlowId({
            FLOW_ID: sctData.FLOW_ID
          }).then(res => res.data.ResultOnDb),

          // API ที่ใช้ BOM_ID จาก sctData
          BomFlowProcessItemUsageServices.getByBomIdAndFiscalYearAndSctPatternIdAndProductTypeId({
            BOM_ID: sctData.BOM_ID,
            FISCAL_YEAR: sctData.FISCAL_YEAR,
            SCT_PATTERN_ID: sctData.SCT_PATTERN_ID,
            PRODUCT_TYPE_ID: sctData.PRODUCT_TYPE_ID
          }).then(res => res.data.ResultOnDb),

          // API ที่ใช้ SCT_ID เท่านั้น
          SctDetailForAdjustService.getBySctId({
            SCT_ID: rowSelected.original.SCT_ID
          }).then(res => res.data.ResultOnDb),

          SctTotalCostService.getBySctId({
            SCT_ID: rowSelected.original.SCT_ID
          }).then(res => res.data.ResultOnDb),

          SctComponentTypeResourceOptionSelectServices.getBySctId({
            SCT_ID: rowSelected.original.SCT_ID
          }).then(res => res.data.ResultOnDb),

          SctMasterDataHistoryServices.getBySctIdAndIsFromSctCopy({
            SCT_ID: rowSelected.original.SCT_ID,
            IS_FROM_SCT_COPY: ''
          }).then(res => res.data.ResultOnDb),

          SctBomFlowProcessItemUsagePriceServices.getBySctId({
            SCT_ID: sctData.SCT_ID
          }).then(res => res.data.ResultOnDb),

          SctBomFlowProcessItemUsagePriceAdjustServices.getBySctId({
            SCT_ID: sctData.SCT_ID
          }).then(res => res.data.ResultOnDb),

          ImportFeeServices.getByFiscalYear_MasterDataLatest({
            FISCAL_YEAR: sctData.FISCAL_YEAR
          }).then(res => res.data.ResultOnDb)
        ])

        //#endregion Import Fee Rate

        // ? Table : sct_resource_option
        // 1	Master Data (Latest)
        // 2	Revision Master Data
        // 3	SCT (Latest)
        // 4	SCT Selection
        // 5	Manual Input
        //#endregion for ref

        const sctCompareNo1 = sctCompare.find(s => s.SCT_COMPARE_NO == 1)
        const sctCompareNo2 = sctCompare.find(s => s.SCT_COMPARE_NO == 2)

        return {
          mode,
          isCalculationAlready,
          listSctComponentTypeResourceOptionSelect,
          listSctBomFlowProcessItemUsagePrice,
          listSctBomFlowProcessItemUsagePriceAdjust,
          listSctMasterDataHistory,
          sctDetailForAdjust,
          sctTotalCost,
          // UI
          product: {
            productCategory: {
              PRODUCT_CATEGORY_ID: sctData.PRODUCT_CATEGORY_ID,
              PRODUCT_CATEGORY_NAME: sctData.PRODUCT_CATEGORY_NAME,
              PRODUCT_CATEGORY_ALPHABET: sctData.PRODUCT_CATEGORY_ALPHABET
            },
            productMain: {
              PRODUCT_MAIN_ID: sctData.PRODUCT_MAIN_ID,
              PRODUCT_MAIN_NAME: sctData.PRODUCT_MAIN_NAME,
              PRODUCT_MAIN_ALPHABET: sctData.PRODUCT_MAIN_ALPHABET
            },
            productSub: {
              PRODUCT_SUB_ID: sctData.PRODUCT_SUB_ID,
              PRODUCT_SUB_NAME: sctData.PRODUCT_SUB_NAME,
              PRODUCT_SUB_ALPHABET: sctData.PRODUCT_SUB_ALPHABET
            },
            productType: {
              PRODUCT_TYPE_ID: sctData.PRODUCT_TYPE_ID,
              PRODUCT_TYPE_NAME: sctData.PRODUCT_TYPE_NAME,
              PRODUCT_TYPE_CODE: sctData.PRODUCT_TYPE_CODE
            },
            itemCategory: {
              ITEM_CATEGORY_ID: sctData.ITEM_CATEGORY_ID,
              ITEM_CATEGORY_NAME: sctData.ITEM_CATEGORY_NAME,
              ITEM_CATEGORY_ALPHABET: sctData.ITEM_CATEGORY_ALPHABET
            },
            productSpecificationType: {
              PRODUCT_SPECIFICATION_TYPE_ID: sctData.PRODUCT_SPECIFICATION_TYPE_ID,
              PRODUCT_SPECIFICATION_TYPE_NAME: sctData.PRODUCT_SPECIFICATION_TYPE_NAME,
              PRODUCT_SPECIFICATION_TYPE_ALPHABET: sctData.PRODUCT_SPECIFICATION_TYPE_ALPHABET
            }
          },
          header: {
            SCT_ID: sctData.SCT_ID,
            estimatePeriodEndDate: new Date(sctData.ESTIMATE_PERIOD_END_DATE),
            estimatePeriodStartDate: new Date(sctData.ESTIMATE_PERIOD_START_DATE),
            note: sctData.NOTE,
            fiscalYear: {
              label: sctData.FISCAL_YEAR.toString(),
              value: Number(sctData.FISCAL_YEAR)
            },
            sctPatternNo: {
              value: sctData.SCT_PATTERN_ID,
              label: sctData.SCT_PATTERN_NAME
            },
            sctReason: {
              SCT_REASON_SETTING_ID: sctData.SCT_REASON_SETTING_ID,
              SCT_REASON_SETTING_NAME: sctData.SCT_REASON_SETTING_NAME
            },
            sctTagSetting: {
              SCT_TAG_SETTING_ID: sctData.SCT_TAG_SETTING_ID,
              SCT_TAG_SETTING_NAME: sctData.SCT_TAG_SETTING_NAME
            },
            sctRevisionCode: sctData.SCT_REVISION_CODE,
            sctStatusProgress: {
              SCT_STATUS_PROGRESS_ID: sctData.SCT_STATUS_PROGRESS_ID,
              SCT_STATUS_PROGRESS_NAME: sctData.SCT_STATUS_PROGRESS_NAME
            },
            bom: {
              BOM_ID: sctData.BOM_ID,
              BOM_CODE: sctData.BOM_CODE,
              BOM_NAME: sctData.BOM_NAME,
              BOM_CODE_ACTUAL: sctData.BOM_CODE_ACTUAL,
              BOM_NAME_ACTUAL: sctData.BOM_NAME_ACTUAL,
              FLOW_ID: sctData.FLOW_ID,
              FLOW_CODE: sctData.FLOW_CODE,
              FLOW_NAME: sctData.FLOW_NAME,
              TOTAL_COUNT_PROCESS: sctData.TOTAL_COUNT_PROCESS
            },
            sctCreateFrom: {
              SCT_CREATE_FROM_SETTING_ID: sctData.SCT_CREATE_FROM_SETTING_ID,
              SCT_CREATE_FROM_NAME: sctData.SCT_CREATE_FROM_NAME,
              CREATE_FROM_SCT_FISCAL_YEAR: sctData.CREATE_FROM_SCT_FISCAL_YEAR,
              CREATE_FROM_SCT_ID: sctData.CREATE_FROM_SCT_ID,
              CREATE_FROM_SCT_PATTERN_ID: sctData.CREATE_FROM_SCT_PATTERN_ID,
              CREATE_FROM_SCT_STATUS_PROGRESS_ID: sctData.CREATE_FROM_SCT_STATUS_PROGRESS_ID,
              CREATE_FROM_SCT_PATTERN_NAME: sctData.CREATE_FROM_SCT_PATTERN_NAME,
              CREATE_FROM_SCT_REVISION_CODE: sctData.CREATE_FROM_SCT_REVISION_CODE,
              CREATE_FROM_SCT_STATUS_PROGRESS_NAME: sctData.CREATE_FROM_SCT_STATUS_PROGRESS_NAME
            }
          },
          sctComPareNo1:
            typeof sctCompareNo1 !== 'undefined'
              ? {
                  sctCompareNo: 1,
                  SCT_ID: sctCompareNo1.SCT_ID,
                  sctRevisionCode: sctCompareNo1.SCT_REVISION_CODE,
                  bom: {
                    BOM_ID: sctCompareNo1.BOM_ID,
                    BOM_CODE: sctCompareNo1.BOM_CODE,
                    BOM_NAME: sctCompareNo1.BOM_NAME,
                    FLOW_ID: sctCompareNo1.FLOW_ID,
                    FLOW_CODE: sctCompareNo1.FLOW_CODE,
                    FLOW_NAME: sctCompareNo1.FLOW_NAME,
                    TOTAL_COUNT_PROCESS: sctCompareNo1.TOTAL_COUNT_PROCESS
                  },
                  isDefaultExportCompare: sctCompareNo1.IS_DEFAULT_EXPORT_COMPARE
                }
              : null,
          sctComPareNo2:
            typeof sctCompareNo2 !== 'undefined'
              ? {
                  sctCompareNo: 2,
                  SCT_ID: sctCompareNo2.SCT_ID,
                  sctRevisionCode: sctCompareNo2.SCT_REVISION_CODE,
                  bom: {
                    BOM_ID: sctCompareNo2.BOM_ID,
                    BOM_CODE: sctCompareNo2.BOM_CODE,
                    BOM_NAME: sctCompareNo2.BOM_NAME,
                    FLOW_ID: sctCompareNo2.FLOW_ID,
                    FLOW_CODE: sctCompareNo2.FLOW_CODE,
                    FLOW_NAME: sctCompareNo2.FLOW_NAME,
                    TOTAL_COUNT_PROCESS: sctCompareNo2.TOTAL_COUNT_PROCESS
                  },
                  isDefaultExportCompare: sctCompareNo2.IS_DEFAULT_EXPORT_COMPARE
                }
              : null,
          directCost: {
            flowProcess: {
              // total: {
              //   main: {
              //     totalCountProcess: sctData.TOTAL_COUNT_PROCESS,
              //     yieldRateAndGoStraightRate: {
              //       fiscalYear: yieldRateGoStraightRateTotal.FISCAL_YEAR,
              //       revisionNo: yieldRateGoStraightRateTotal.REVISION_NO,
              //       totalYieldRate: yieldRateGoStraightRateTotal.TOTAL_YIELD_RATE_FOR_SCT,
              //       totalGoStraightRate: yieldRateGoStraightRateTotal.TOTAL_GO_STRAIGHT_RATE_FOR_SCT,
              //       flowId: yieldRateGoStraightRateTotal.FLOW_ID,
              //       flowCode: yieldRateGoStraightRateTotal.FLOW_CODE,
              //       flowName: yieldRateGoStraightRateTotal.FLOW_NAME
              //     },
              //     clearTime: {
              //       fiscalYear: clearTimeForSctTotal.FISCAL_YEAR,
              //       revisionNo: clearTimeForSctTotal.REVISION_NO,
              //       flowId: clearTimeForSctTotal.FLOW_ID,
              //       flowCode: clearTimeForSctTotal.FLOW_CODE,
              //       flowName: clearTimeForSctTotal.FLOW_NAME,
              //       totalClearTime: clearTimeForSctTotal.TOTAL_CLEAR_TIME_FOR_SCT
              //     }
              //     // fiscalYearYieldRateAndGoStraightRate: yieldRateGoStraightRateTotal.FISCAL_YEAR,
              //     // revisionNoYieldRateAndGoStraightRate: yieldRateGoStraightRateTotal.REVISION_NO,
              //     // totalYieldRate: yieldRateGoStraightRateTotal.TOTAL_YIELD_RATE_FOR_SCT,
              //     //totalGoStraightRate: yieldRateGoStraightRateTotal.TOTAL_GO_STRAIGHT_RATE_FOR_SCT,
              //     // totalClearTime: clearTimeForSctTotal.TOTAL_CLEAR_TIME_FOR_SCT,
              //     // fiscalYearClearTime: clearTimeForSctTotal.FISCAL_YEAR,
              //     // revisionNoClearTime: clearTimeForSctTotal.REVISION_NO
              //   }
              // },
              body: {
                flowProcess: {
                  main: listFlowProcess
                },
                clearTimeForSctProcess: {
                  main: []
                },
                sctFlowProcessSequence: {
                  main: []
                },
                yieldRateGoStraightRateProcessForSct: {
                  main: []
                }
              }
            },
            materialInProcess: {
              main: {
                total: {
                  Consumable: 0,
                  Packing: 0,
                  RawMaterial: 0,
                  SemiFinishedGoods: 0,
                  SubAssy: 0,
                  Total: 0
                },
                body: listBomFlowProcessItemUsage
              }
            }
            // body: {
            //   flowProcess: {
            //     flowProcess: {
            //       main: [{ FLOW_ID: 0, PROCESS_ID: 0, PROCESS_CODE: '', FLOW_PROCESS_NO: 0, FLOW_PROCESS_ID: 0 }]
            //     }
            //   }
            // }
          },
          // indirectCost: {
          //   main: {
          //     costCondition: {
          //       directCostCondition: {
          //         directUnitProcessCost: directCostCondition?.DIRECT_UNIT_PROCESS_COST ?? 0,
          //         indirectRateOfDirectProcessCost: directCostCondition?.INDIRECT_RATE_OF_DIRECT_PROCESS_COST ?? 0,
          //         FISCAL_YEAR: directCostCondition?.FISCAL_YEAR ?? 0,
          //         VERSION: directCostCondition?.VERSION ?? 0
          //       },
          //       indirectCostCondition: {
          //         labor: inDirectCostCondition.LABOR,
          //         depreciation: inDirectCostCondition.DEPRECIATION,
          //         otherExpense: inDirectCostCondition.OTHER_EXPENSE,
          //         totalIndirectCost: inDirectCostCondition.TOTAL_INDIRECT_COST,
          //         FISCAL_YEAR: inDirectCostCondition.FISCAL_YEAR,
          //         VERSION: inDirectCostCondition.VERSION
          //       },
          //       otherCostCondition: {
          //         ga: otherCostCondition.GA,
          //         margin: otherCostCondition.MARGIN,
          //         sellingExpense: otherCostCondition.SELLING_EXPENSE,
          //         vat: otherCostCondition.VAT,
          //         cit: otherCostCondition.CIT,
          //         FISCAL_YEAR: otherCostCondition.FISCAL_YEAR,
          //         VERSION: otherCostCondition.VERSION
          //       },
          //       specialCostCondition: {
          //         adjustPrice: specialCostCondition?.ADJUST_PRICE,
          //         FISCAL_YEAR: specialCostCondition?.FISCAL_YEAR,
          //         VERSION: specialCostCondition?.VERSION
          //       },
          //       importFeeRate: {
          //         importFeeRate: importFeeRate?.IMPORT_FEE_RATE,
          //         FISCAL_YEAR: importFeeRate?.FISCAL_YEAR,
          //         VERSION: importFeeRate?.VERSION
          //       }
          //     }
          //   }
          // },
          masterDataSelection: {
            directCostCondition: {
              SCT_COMPONENT_TYPE_ID: 1,
              SCT_RESOURCE_OPTION_ID:
                listSctComponentTypeResourceOptionSelect.find(
                  item => item.SCT_COMPONENT_TYPE_ID === 1 && item.IS_FROM_SCT_COPY === 0
                )?.SCT_RESOURCE_OPTION_ID ?? 0
            },
            indirectCostCondition: {
              SCT_COMPONENT_TYPE_ID: 2,
              SCT_RESOURCE_OPTION_ID:
                listSctComponentTypeResourceOptionSelect.find(
                  item => item.SCT_COMPONENT_TYPE_ID === 2 && item.IS_FROM_SCT_COPY === 0
                )?.SCT_RESOURCE_OPTION_ID ?? 0
            },
            otherCostCondition: {
              SCT_COMPONENT_TYPE_ID: 3,
              SCT_RESOURCE_OPTION_ID:
                listSctComponentTypeResourceOptionSelect.find(
                  item => item.SCT_COMPONENT_TYPE_ID === 3 && item.IS_FROM_SCT_COPY === 0
                )?.SCT_RESOURCE_OPTION_ID ?? 0
            },
            specialCostCondition: {
              SCT_COMPONENT_TYPE_ID: 4,
              SCT_RESOURCE_OPTION_ID:
                listSctComponentTypeResourceOptionSelect.find(
                  item => item.SCT_COMPONENT_TYPE_ID === 4 && item.IS_FROM_SCT_COPY === 0
                )?.SCT_RESOURCE_OPTION_ID ?? 0
            },
            yieldRateAndGoStraightRate: {
              SCT_COMPONENT_TYPE_ID: 5,
              SCT_RESOURCE_OPTION_ID:
                listSctComponentTypeResourceOptionSelect.find(
                  item => item.SCT_COMPONENT_TYPE_ID === 5 && item.IS_FROM_SCT_COPY === 0
                )?.SCT_RESOURCE_OPTION_ID ?? 0
            },
            clearTime: {
              SCT_COMPONENT_TYPE_ID: 6,
              SCT_RESOURCE_OPTION_ID:
                listSctComponentTypeResourceOptionSelect.find(
                  item => item.SCT_COMPONENT_TYPE_ID === 6 && item.IS_FROM_SCT_COPY === 0
                )?.SCT_RESOURCE_OPTION_ID ?? 0
            },
            manufacturingItemPrice: {
              SCT_COMPONENT_TYPE_ID: 7,
              SCT_RESOURCE_OPTION_ID:
                listSctComponentTypeResourceOptionSelect.find(
                  item => item.SCT_COMPONENT_TYPE_ID === 7 && item.IS_FROM_SCT_COPY === 0
                )?.SCT_RESOURCE_OPTION_ID ?? 0
            },
            yieldRateMaterial: {
              SCT_COMPONENT_TYPE_ID: 8,
              SCT_RESOURCE_OPTION_ID:
                listSctComponentTypeResourceOptionSelect.find(
                  item => item.SCT_COMPONENT_TYPE_ID === 8 && item.IS_FROM_SCT_COPY === 0
                )?.SCT_RESOURCE_OPTION_ID ?? 0
            }
          }
          // adjust: {
          //   indirectCostCondition: {
          //     totalIndirectCost: {
          //       isAdjust: is_Null_Undefined_Blank(
          //         sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.TOTAL_INDIRECT_COST
          //       )
          //         ? false
          //         : true,
          //       isDisabledInput: true,
          //       dataFrom:
          //         sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)
          //           ?.TOTAL_INDIRECT_COST_SCT_RESOURCE_OPTION_ID == 1
          //           ? 1
          //           : sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)
          //                 ?.TOTAL_INDIRECT_COST_SCT_RESOURCE_OPTION_ID == 4
          //             ? 4
          //             : is_Null_Undefined_Blank(
          //                   sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.TOTAL_INDIRECT_COST
          //                 )
          //               ? null
          //               : 5
          //     }
          //   },
          //   otherCostCondition: {
          //     cit: {
          //       isAdjust: is_Null_Undefined_Blank(sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.CIT)
          //         ? false
          //         : true,
          //       isDisabledInput: true,
          //       dataFrom:
          //         sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.CIT_SCT_RESOURCE_OPTION_ID == 1
          //           ? 1
          //           : sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.CIT_SCT_RESOURCE_OPTION_ID == 4
          //             ? 4
          //             : is_Null_Undefined_Blank(sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.CIT)
          //               ? null
          //               : 5
          //     },
          //     ga: {
          //       isAdjust: is_Null_Undefined_Blank(sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.GA)
          //         ? false
          //         : true,
          //       isDisabledInput: true,
          //       dataFrom:
          //         sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.GA_SCT_RESOURCE_OPTION_ID == 1
          //           ? 1
          //           : sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.GA_SCT_RESOURCE_OPTION_ID == 4
          //             ? 4
          //             : is_Null_Undefined_Blank(sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.GA)
          //               ? null
          //               : 5
          //     },
          //     vat: {
          //       isAdjust: is_Null_Undefined_Blank(sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.VAT)
          //         ? false
          //         : true,
          //       isDisabledInput: true,
          //       dataFrom:
          //         sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.VAT_SCT_RESOURCE_OPTION_ID == 1
          //           ? 1
          //           : sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.VAT_SCT_RESOURCE_OPTION_ID == 4
          //             ? 4
          //             : is_Null_Undefined_Blank(sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.VAT)
          //               ? null
          //               : 5
          //     },
          //     margin: {
          //       isAdjust: is_Null_Undefined_Blank(sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.MARGIN)
          //         ? false
          //         : true,
          //       isDisabledInput: true,
          //       dataFrom:
          //         sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.MARGIN_SCT_RESOURCE_OPTION_ID == 1
          //           ? 1
          //           : sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.MARGIN_SCT_RESOURCE_OPTION_ID == 4
          //             ? 4
          //             : is_Null_Undefined_Blank(sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.MARGIN)
          //               ? null
          //               : 5
          //     },
          //     sellingExpense: {
          //       isAdjust: is_Null_Undefined_Blank(
          //         sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.SELLING_EXPENSE
          //       )
          //         ? false
          //         : true,
          //       isDisabledInput: true,
          //       dataFrom:
          //         sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.SELLING_EXPENSE_SCT_RESOURCE_OPTION_ID ==
          //         1
          //           ? 1
          //           : sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)
          //                 ?.SELLING_EXPENSE_SCT_RESOURCE_OPTION_ID == 4
          //             ? 4
          //             : is_Null_Undefined_Blank(
          //                   sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.SELLING_EXPENSE
          //                 )
          //               ? null
          //               : 5
          //     }
          //   },
          //   specialCostCondition: {
          //     adjustPrice: {
          //       isAdjust: is_Null_Undefined_Blank(
          //         sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.ADJUST_PRICE
          //       )
          //         ? false
          //         : true,
          //       isDisabledInput: true,
          //       dataFrom:
          //         sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.ADJUST_PRICE_SCT_RESOURCE_OPTION_ID == 1
          //           ? 1
          //           : sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)
          //                 ?.ADJUST_PRICE_SCT_RESOURCE_OPTION_ID == 4
          //             ? 4
          //             : is_Null_Undefined_Blank(
          //                   sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.ADJUST_PRICE
          //                 )
          //               ? null
          //               : 5
          //     }
          //   },
          //   remarkForAdjustPrice: ''
          // }
        }
      } catch (error) {
        toast.error(error?.message ?? 'Error', { autoClose: 10000 })
        setIsOpenModal(false)
      }
    }
  })

  const { control, getValues, setValue } = reactHookFormMethods

  const sctData = useWatch({ control, name: 'header' })
  const product = useWatch({ control, name: 'product' })

  const listSctComponentTypeResourceOptionSelect = useWatch({
    control,
    name: 'listSctComponentTypeResourceOptionSelect',
    defaultValue: []
  })

  useEffect(() => {
    console.log(
      isLoading,
      sctData?.SCT_ID,
      product?.productMain?.PRODUCT_MAIN_ID,
      product?.itemCategory?.ITEM_CATEGORY_ID
    )

    if (
      isLoading === true ||
      !sctData?.SCT_ID ||
      !product?.productMain?.PRODUCT_MAIN_ID ||
      !product?.itemCategory?.ITEM_CATEGORY_ID
    )
      return

    const controller = new AbortController()
    const signal = controller.signal

    const listSctComponentTypeResourceOptionSelect = getValues('listSctComponentTypeResourceOptionSelect')
    const listSctMasterDataHistory = getValues('listSctMasterDataHistory')
    const sctTotalCost = getValues('sctTotalCost')
    const targetName = 'indirectCost.main.costCondition.directCostCondition'

    console.log(listSctComponentTypeResourceOptionSelect)

    if (isCalculationAlready) {
      const fetchData = async () =>
        await DirectCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo({
          FISCAL_YEAR: sctData.fiscalYear.value,
          PRODUCT_MAIN_ID: product.productMain.PRODUCT_MAIN_ID,
          ITEM_CATEGORY_ID: product.itemCategory.ITEM_CATEGORY_ID,
          VERSION:
            listSctMasterDataHistory.find(item => item.SCT_MASTER_DATA_SETTING_ID == 1 && item.IS_FROM_SCT_COPY == 0)
              ?.VERSION_NO ?? 0,
          signal
        })
          .then(res => {
            if (res?.data?.ResultOnDb?.length == 0) {
              toast.error(`ไม่พบข้อมูล Direct Cost Condition ในระบบ`, {
                autoClose: 10000
              })
              return
            }

            if (res?.data?.ResultOnDb?.length > 1) {
              toast.error(`มีข้อมูล Direct Cost Condition มากกว่า 1 ในระบบ`, {
                autoClose: 10000
              })
              return
            }

            setValue(targetName, {
              directUnitProcessCost: res?.data?.ResultOnDb?.[0]?.DIRECT_UNIT_PROCESS_COST ?? 0,
              indirectRateOfDirectProcessCost: res?.data?.ResultOnDb?.[0]?.INDIRECT_RATE_OF_DIRECT_PROCESS_COST ?? 0,
              fiscalYear: res?.data?.ResultOnDb?.[0]?.FISCAL_YEAR ?? 0,
              version: res?.data?.ResultOnDb?.[0]?.VERSION ?? 0
            })
            return
          })
          .catch(err => {
            toast.error(`Error: ${err?.response?.data?.Message ?? err?.message}`)
            return
          })

      fetchData()
    } else {
      switch (
        listSctComponentTypeResourceOptionSelect.find(
          item => item.SCT_COMPONENT_TYPE_ID == 1 && item.IS_FROM_SCT_COPY === 0
        )?.SCT_RESOURCE_OPTION_ID
      ) {
        // 1	Master Data
        case 1: {
          const fetchData = async () => {
            return await DirectCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest({
              FISCAL_YEAR: sctData.fiscalYear.value,
              PRODUCT_MAIN_ID: product.productMain.PRODUCT_MAIN_ID,
              ITEM_CATEGORY_ID: product.itemCategory.ITEM_CATEGORY_ID,
              signal
            })
              .then(res => {
                if (res?.data?.ResultOnDb?.length == 0) {
                  toast.error(`ไม่พบข้อมูล Direct Cost Condition ในระบบ`, {
                    autoClose: 10000
                  })
                  return
                }

                if (res?.data?.ResultOnDb?.length > 1) {
                  toast.error(`มีข้อมูล Direct Cost Condition มากกว่า 1 ในระบบ`, {
                    autoClose: 10000
                  })
                  return
                }

                console.log(res?.data?.ResultOnDb?.[0]?.DIRECT_UNIT_PROCESS_COST)

                setValue(targetName, {
                  directUnitProcessCost: res?.data?.ResultOnDb?.[0]?.DIRECT_UNIT_PROCESS_COST ?? 0,
                  indirectRateOfDirectProcessCost:
                    res?.data?.ResultOnDb?.[0]?.INDIRECT_RATE_OF_DIRECT_PROCESS_COST ?? 0,
                  fiscalYear: res?.data?.ResultOnDb?.[0]?.FISCAL_YEAR ?? 0,
                  version: res?.data?.ResultOnDb?.[0]?.VERSION ?? 0
                })
                return
              })
              .catch(err => {
                toast.error(`Error: ${err?.response?.data?.Message ?? err?.message}`)
                return
              })
          }

          fetchData()
          break
        }
        case 2: {
          // 2	Revision Master Data
          const fetchData = async () =>
            await DirectCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo({
              FISCAL_YEAR: sctData.fiscalYear.value,
              PRODUCT_MAIN_ID: product.productMain.PRODUCT_MAIN_ID,
              ITEM_CATEGORY_ID: product.itemCategory.ITEM_CATEGORY_ID,
              VERSION:
                listSctMasterDataHistory.find(
                  item => item.SCT_MASTER_DATA_SETTING_ID == 1 && item.IS_FROM_SCT_COPY == 0
                )?.VERSION_NO ?? 0,
              signal
            })
              .then(res => {
                if (res?.data?.ResultOnDb?.length == 0) {
                  toast.error(`ไม่พบข้อมูล Direct Cost Condition ในระบบ`, {
                    autoClose: 10000
                  })
                  return
                }

                if (res?.data?.ResultOnDb?.length > 1) {
                  toast.error(`มีข้อมูล Direct Cost Condition มากกว่า 1 ในระบบ`, {
                    autoClose: 10000
                  })
                  return
                }

                setValue(targetName, {
                  directUnitProcessCost: res?.data?.ResultOnDb?.[0]?.DIRECT_UNIT_PROCESS_COST ?? 0,
                  indirectRateOfDirectProcessCost:
                    res?.data?.ResultOnDb?.[0]?.INDIRECT_RATE_OF_DIRECT_PROCESS_COST ?? 0,
                  fiscalYear: res?.data?.ResultOnDb?.[0]?.FISCAL_YEAR ?? 0,
                  version: res?.data?.ResultOnDb?.[0]?.VERSION ?? 0
                })
                return
              })
              .catch(err => {
                toast.error(`Error: ${err?.response?.data?.Message ?? err?.message}`)
                return
              })

          fetchData()
          break
        }
        case 4: {
          //  4	SCT Selection
          const dataItem = sctTotalCost.find(item => item.IS_FROM_SCT_COPY == 1)

          // from sct copy - after cal already
          if (dataItem) {
            setValue('indirectCost.main.costCondition.directCostCondition', {
              directUnitProcessCost: dataItem?.DIRECT_PROCESS_COST,
              indirectRateOfDirectProcessCost: dataItem?.INDIRECT_RATE_OF_DIRECT_PROCESS_COST,
              fiscalYear: sctData.fiscalYear.value,
              version:
                getValues('listSctMasterDataHistory')?.find(
                  item => item.SCT_MASTER_DATA_SETTING_ID == 1 && item.IS_FROM_SCT_COPY == 1
                )?.VERSION_NO || 0
            })
          } else {
            const fetchData = async () =>
              await DirectCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo({
                FISCAL_YEAR: sctData.fiscalYear.value,
                PRODUCT_MAIN_ID: product.productMain.PRODUCT_MAIN_ID,
                ITEM_CATEGORY_ID: product.itemCategory.ITEM_CATEGORY_ID,
                VERSION:
                  listSctMasterDataHistory.find(
                    item => item.SCT_MASTER_DATA_SETTING_ID == 1 && item.IS_FROM_SCT_COPY == 1
                  )?.VERSION_NO ?? 0,
                signal
              })
                .then(res => {
                  if (res?.data?.ResultOnDb?.length == 0) {
                    toast.error(`ไม่พบข้อมูล Direct Cost Condition ในระบบ`, {
                      autoClose: 10000
                    })
                    return
                  }

                  if (res?.data?.ResultOnDb?.length > 1) {
                    toast.error(`มีข้อมูล Direct Cost Condition มากกว่า 1 ในระบบ`, {
                      autoClose: 10000
                    })
                    return
                  }

                  // ! No adjust
                  // const sctDetailForAdjust = getValues('sctDetailForAdjust')

                  setValue(targetName, {
                    directUnitProcessCost: res?.data?.ResultOnDb?.[0]?.DIRECT_UNIT_PROCESS_COST ?? 0,
                    indirectRateOfDirectProcessCost:
                      res?.data?.ResultOnDb?.[0]?.INDIRECT_RATE_OF_DIRECT_PROCESS_COST ?? 0,
                    fiscalYear: res?.data?.ResultOnDb?.[0]?.FISCAL_YEAR ?? 0,
                    version: res?.data?.ResultOnDb?.[0]?.VERSION ?? 0
                  })
                  return
                })
                .catch(err => {
                  toast.error(`Error: ${err?.response?.data?.Message ?? err?.message}`)
                  return
                })

            fetchData()
          }

          break
        }
        default: {
          toast.error(
            `Direct Cost Condition not found for SCT ID: ${rowSelected?.original.SCT_ID}. Please check your data.`,
            { autoClose: 10000 }
          )
          break
        }
      }
    }

    return () => {
      controller.abort()
    }
    // ??? 7 , 8 Manufacturing Item Price , Yield Rate Material
  }, [listSctComponentTypeResourceOptionSelect.find(item => item.SCT_COMPONENT_TYPE_ID == 1)?.SCT_RESOURCE_OPTION_ID])

  const queryClient = useQueryClient()

  const onSubmit = () => {
    setConfirmModal(true)
  }

  const onDraft = () => {
    setConfirmModal(true)
  }

  const onError: SubmitErrorHandler<DraftFormData | SaveFormData> = data => {
    const CLEAR_TIME = data?.CLEAR_TIME
      ? 'Clear Time data not found in the system. Please try again. ไม่พบข้อมูล Clear Time ในระบบ กรุณาตรวจสอบข้อมูลอีกครั้ง'
      : ''
    const YR_GR_TOTAL = data?.YR_GR_TOTAL
      ? 'YR GSR data not found in the system. Please try again. ไม่พบข้อมูล YR GSR ในระบบ กรุณาตรวจสอบข้อมูลอีกครั้ง'
      : ''

    const MATERIAL_PRICE_DATA = data?.MATERIAL_PRICE_DATA
      ? 'Material Price data not found in the system. Please try again. ไม่พบข้อมูล ราคา Material ในระบบ กรุณาตรวจสอบข้อมูลอีกครั้ง'
      : ''

    setMasterDataMaterialPrice_ErrorMessage(MATERIAL_PRICE_DATA)
    setMasterDataYR_ErrorMessage(CLEAR_TIME)
    setMasterDataClearTime_ErrorMessage(YR_GR_TOTAL)

    setOpenMasterDataNotFoundModal(true)
  }

  const handleClose = () => {
    setIsOpenModal(false)
  }

  const onMutateSuccess = (data: any) => {
    if (data.data && data.data.Status == true) {
      if (data.data.ResultOnDb.affectedRows === 0) {
        const message = {
          title: 'SCT Data',
          message: 'ข้อมูลที่คุณต้องการบันทึก มีอยู่แล้ว Data already exists'
        }

        ToastMessageError(message)

        return
      }

      const message = {
        message: data.data.Message,
        title: 'SCT Data'
      }

      ToastMessageSuccess(message)

      setPagination({ pageIndex: 0, pageSize: getValues('searchResults.pageSize') ?? 10 })
      if (setIsEnableFetching) {
        setIsEnableFetching(true)
      }
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      //reset()
      handleClose()
    } else {
      const message = {
        title: 'SCT Data',
        message: data.data.Message
      }

      ToastMessageError(message)
    }
  }

  const onMutateError = (err: any) => {
    console.log('onMutateError')
    console.log(err)

    const message = {
      title: 'SCT Data',
      message: err?.response?.data?.Message ?? 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง'
    }

    ToastMessageError(message)
  }

  const updateMutation = useUpdateSctData(onMutateSuccess, onMutateError)

  const changeProgressMutation = useChangeSctProgress(onMutateSuccess, onMutateError)

  const handleSaveComplete = () => {
    setConfirmModal(false)

    // const dataItem = {
    //   ...reactHookFormMethods.getValues(),
    //   IS_DRAFT: false,
    //   CREATE_BY: getUserData().EMPLOYEE_CODE
    // }
    //console.log(reactHookFormMethods.getValues('SCT_STATUS_PROGRESS_ID'))

    if (reactHookFormMethods.getValues('SCT_STATUS_PROGRESS_ID') === 2) {
      // let detailAdjust = {}

      // if (reactHookFormMethods.getValues('INDIRECT_COST_CONDITION.IS_MANUAL_TOTAL_INDIRECT_COST')) {
      //   detailAdjust.TOTAL_INDIRECT_COST = reactHookFormMethods.getValues('INDIRECT_COST_CONDITION.TOTAL_INDIRECT_COST')
      //   detailAdjust.CIT = reactHookFormMethods.getValues('OTHER_COST_CONDITION.CIT_MANUAL')
      //   detailAdjust.VAT = reactHookFormMethods.getValues('OTHER_COST_CONDITION.VAT_MANUAL')
      // }

      // console.log(detailAdjust)

      const dataItem = {
        ...reactHookFormMethods.getValues(),
        SCT_ID: reactHookFormMethods.getValues('SCT_ID'),
        SCT_STATUS_WORKING_ID: 1,
        SCT_STATUS_PROGRESS_ID: Number(reactHookFormMethods.getValues('SCT_STATUS_PROGRESS_ID')) + 1,
        CREATE_BY: getUserData().EMPLOYEE_CODE,
        UPDATE_BY: getUserData().EMPLOYEE_CODE,

        NOTE: reactHookFormMethods.getValues('NOTE'),
        INUSE: 1,

        ESTIMATE_PERIOD_START_DATE: reactHookFormMethods.getValues('START_DATE'),
        ESTIMATE_PERIOD_END_DATE: reactHookFormMethods.getValues('END_DATE'),

        SCT_ID_FOR_COMPARE_NO_1: reactHookFormMethods.getValues('SCT_COMPARE_NO_1.SCT_ID') ?? '',
        IS_DEFAULT_EXPORT_COMPARE_NO_1: reactHookFormMethods.getValues('IS_DEFAULT_EXPORT_COMPARE_NO_1') ?? 0,

        SCT_ID_FOR_COMPARE_NO_2: reactHookFormMethods.getValues('SCT_COMPARE_NO_2.SCT_ID') ?? '',
        IS_DEFAULT_EXPORT_COMPARE_NO_2: reactHookFormMethods.getValues('IS_DEFAULT_EXPORT_COMPARE_NO_2') ?? 0,

        TOTAL_INDIRECT_COST: reactHookFormMethods.getValues('INDIRECT_COST_CONDITION.IS_MANUAL_TOTAL_INDIRECT_COST')
          ? reactHookFormMethods.getValues('INDIRECT_COST_CONDITION.TOTAL_INDIRECT_COST')
          : undefined,
        CIT: reactHookFormMethods.getValues('OTHER_COST_CONDITION.IS_MANUAL_CIT')
          ? reactHookFormMethods.getValues('OTHER_COST_CONDITION.CIT')
          : undefined,
        VAT: reactHookFormMethods.getValues('OTHER_COST_CONDITION.IS_MANUAL_VAT')
          ? reactHookFormMethods.getValues('OTHER_COST_CONDITION.VAT')
          : undefined,
        SELLING_EXPENSE: reactHookFormMethods.getValues('OTHER_COST_CONDITION.IS_MANUAL_SELLING_EXPENSE')
          ? reactHookFormMethods.getValues('OTHER_COST_CONDITION.SELLING_EXPENSE')
          : undefined,
        GA: reactHookFormMethods.getValues('OTHER_COST_CONDITION.IS_MANUAL_GA')
          ? reactHookFormMethods.getValues('OTHER_COST_CONDITION.GA')
          : undefined,
        MARGIN: reactHookFormMethods.getValues('OTHER_COST_CONDITION.IS_MANUAL_MARGIN')
          ? reactHookFormMethods.getValues('OTHER_COST_CONDITION.MARGIN')
          : undefined,
        // ...detailAdjust,

        ADJUST_PRICE: reactHookFormMethods.getValues('ADJUST_PRICE') ?? 0,
        REMARK_FOR_ADJUST_PRICE: reactHookFormMethods.getValues('REMARK_FOR_ADJUST_PRICE') ?? '',
        NOTE_PRICE: reactHookFormMethods.getValues('NOTE_PRICE') ?? '',

        ITEM_ADJUST: reactHookFormMethods.getValues('ITEM_ADJUST') ?? [],

        YR_GR_FROM_ENGINEER_SELECTION: reactHookFormMethods.getValues('YR_GR_FROM_ENGINEER_SELECTION'),
        TIME_FROM_MFG_SELECTION: reactHookFormMethods.getValues('TIME_FROM_MFG_SELECTION')
      }

      // console.log('-----------------SAVE COMPLETE------------------')

      // console.log(dataItem)

      updateMutation.mutate(dataItem)
    }
  }

  const handleDraft = () => {
    setConfirmModal(false)

    const dataItem = {
      ...reactHookFormMethods.getValues(),
      SCT_ID: reactHookFormMethods.getValues('SCT_ID'),
      SCT_STATUS_WORKING_ID: 1,
      SCT_STATUS_PROGRESS_ID: Number(reactHookFormMethods.getValues('SCT_STATUS_PROGRESS_ID')),

      ESTIMATE_PERIOD_START_DATE: reactHookFormMethods.getValues('START_DATE'),
      ESTIMATE_PERIOD_END_DATE: reactHookFormMethods.getValues('END_DATE'),
      IS_DRAFT: true,
      CREATE_BY: getUserData().EMPLOYEE_CODE,
      UPDATE_BY: getUserData().EMPLOYEE_CODE,
      ITEM_ADJUST: reactHookFormMethods.getValues('ITEM_ADJUST') ?? [],

      SCT_ID_FOR_COMPARE_NO_1: reactHookFormMethods.getValues('SCT_COMPARE_NO_1.SCT_ID') ?? '',
      IS_DEFAULT_EXPORT_COMPARE_NO_1: reactHookFormMethods.getValues('IS_DEFAULT_EXPORT_COMPARE_NO_1') ?? 0,

      SCT_ID_FOR_COMPARE_NO_2: reactHookFormMethods.getValues('SCT_COMPARE_NO_2.SCT_ID') ?? '',
      IS_DEFAULT_EXPORT_COMPARE_NO_2: reactHookFormMethods.getValues('IS_DEFAULT_EXPORT_COMPARE_NO_2') ?? 0,

      TOTAL_INDIRECT_COST: reactHookFormMethods.getValues('INDIRECT_COST_CONDITION.IS_MANUAL_TOTAL_INDIRECT_COST')
        ? reactHookFormMethods.getValues('INDIRECT_COST_CONDITION.TOTAL_INDIRECT_COST')
        : undefined,
      CIT: reactHookFormMethods.getValues('OTHER_COST_CONDITION.IS_MANUAL_CIT')
        ? reactHookFormMethods.getValues('OTHER_COST_CONDITION.CIT')
        : undefined,
      VAT: reactHookFormMethods.getValues('OTHER_COST_CONDITION.IS_MANUAL_VAT')
        ? reactHookFormMethods.getValues('OTHER_COST_CONDITION.VAT')
        : undefined,
      SELLING_EXPENSE: reactHookFormMethods.getValues('OTHER_COST_CONDITION.IS_MANUAL_SELLING_EXPENSE')
        ? reactHookFormMethods.getValues('OTHER_COST_CONDITION.SELLING_EXPENSE')
        : undefined,
      GA: reactHookFormMethods.getValues('OTHER_COST_CONDITION.IS_MANUAL_GA')
        ? reactHookFormMethods.getValues('OTHER_COST_CONDITION.GA')
        : undefined,
      MARGIN: reactHookFormMethods.getValues('OTHER_COST_CONDITION.IS_MANUAL_MARGIN')
        ? reactHookFormMethods.getValues('OTHER_COST_CONDITION.MARGIN')
        : undefined,
      ADJUST_PRICE: reactHookFormMethods.getValues('ADJUST_PRICE') ?? 0,

      REMARK_FOR_ADJUST_PRICE: reactHookFormMethods.getValues('REMARK_FOR_ADJUST_PRICE') ?? '',
      NOTE_PRICE: reactHookFormMethods.getValues('NOTE_PRICE') ?? '',
      NOTE: reactHookFormMethods.getValues('NOTE'),
      INUSE: 1,
      YR_GR_FROM_ENGINEER_SELECTION: reactHookFormMethods.getValues('YR_GR_FROM_ENGINEER_SELECTION'),
      TIME_FROM_MFG_SELECTION: reactHookFormMethods.getValues('TIME_FROM_MFG_SELECTION')
    }

    // console.log('-----------------DRAFT------------------')
    // console.log(dataItem)

    updateMutation.mutate(dataItem)
  }

  // Button
  const [button, setButton] = useState<any>({})

  useEffect(() => {
    fetchSctReCalButton({
      SCT_ID: rowSelected?.original.SCT_ID,
      FISCAL_YEAR: rowSelected?.original.FISCAL_YEAR,
      SCT_PATTERN_ID: rowSelected?.original.SCT_PATTERN_ID,
      SCT_STATUS_PROGRESS_ID: rowSelected?.original.SCT_STATUS_PROGRESS_ID,
      SCT_REASON_SETTING_ID: rowSelected?.original.SCT_REASON_SETTING_ID,
      SCT_TAG_SETTING_ID: rowSelected?.original.SCT_TAG_SETTING_ID,
      IS_REFRESH_DATA_MASTER: rowSelected?.original?.IS_REFRESH_DATA_MASTER ? true : false,
      SELLING_PRICE: rowSelected?.original.SELLING_PRICE || 0
    }).then(res => {
      // console.log(res)
      setButton(() => {
        return res[0]
      })
    })
  }, [])
  // Button

  const onMutateReCalSuccess = (data: any) => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'SCT Data'
      }

      ToastMessageSuccess(message)

      setPagination({ pageIndex: 0, pageSize: getValues('searchResults.pageSize') ?? 10 })
      if (setIsEnableFetching) {
        setIsEnableFetching(true)
      }
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      //reset()

      setOpenConfirmReCalModal(false)
    } else {
      const message = {
        title: 'SCT Data',
        message: data.data.Message
      }

      ToastMessageError(message)
    }
  }

  const onMutateReCalError = (err: any) => {
    console.log('onMutateError')
    console.log(err)

    const message = {
      title: 'SCT Data',
      message: err.Message
    }

    ToastMessageError(message)
  }

  const reCalMutation = useReCal(onMutateReCalSuccess, onMutateReCalError)

  const [masterDataYR_ErrorMessage, setMasterDataYR_ErrorMessage] = useState<string>('')
  const [masterDataClearTime_ErrorMessage, setMasterDataClearTime_ErrorMessage] = useState<string>('')
  const [masterDataMaterialPrice_ErrorMessage, setMasterDataMaterialPrice_ErrorMessage] = useState<string>('')

  const [openMasterDataNotFoundModal, setOpenMasterDataNotFoundModal] = useState<boolean>(false)

  const handleMasterDataNotFound = () => {
    setOpenMasterDataNotFoundModal(false)
  }

  const { isLoading } = useFormState({
    control: reactHookFormMethods.control
  })
  return (
    <>
      <Dialog
        open={openMasterDataNotFoundModal}
        disableEscapeKeyDown
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleMasterDataNotFound()
          }
        }}
        closeAfterTransition={false}
      >
        <DialogTitle id='alert-dialog-title'>Notification การแจ้งเตือน</DialogTitle>
        <DialogContent>
          {masterDataYR_ErrorMessage && (
            <DialogContentText id='alert-dialog-description'>{masterDataYR_ErrorMessage}</DialogContentText>
          )}
          {masterDataYR_ErrorMessage && <br />}
          {masterDataClearTime_ErrorMessage && (
            <DialogContentText id='alert-dialog-description'>{masterDataClearTime_ErrorMessage}</DialogContentText>
          )}
          {masterDataYR_ErrorMessage || (masterDataClearTime_ErrorMessage && <br />)}
          {masterDataMaterialPrice_ErrorMessage && (
            <DialogContentText id='alert-dialog-description'>{masterDataMaterialPrice_ErrorMessage}</DialogContentText>
          )}
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button onClick={handleMasterDataNotFound} variant='contained'>
            OK
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        fullWidth={true}
        maxWidth={false}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose()
          }
        }}
        TransitionComponent={Transition}
        open={isOpenModal}
        // keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span' color='primary'>
            {mode.charAt(0).toUpperCase() + mode.slice(1)} Standard Cost Data
          </Typography>

          <DialogCloseButton
            onClick={() => {
              handleClose()

              if (mode === 'view' && setRowSelected) {
                setRowSelected(null)
              }
            }}
            disableRipple
          >
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          {isLoading ? (
            <SkeletonCustom />
          ) : (
            <FormProvider {...reactHookFormMethods}>
              <Grid container spacing={6} className='mb-5'>
                <Grid item xs={12} sm={6} lg={6}>
                  <Grid container item spacing={4}>
                    <Product />
                    <SctCreateFrom />
                  </Grid>
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                  <Grid container item spacing={4}>
                    <Header />
                  </Grid>
                </Grid>
              </Grid>
              <Grid container spacing={6} className='mb-7'>
                <SctCompare />
              </Grid>
              <Grid container spacing={6} className='mb-7'>
                <SellingPrice />
              </Grid>
              <Grid container spacing={6} className='mb-7'>
                <CostPriceTab />
              </Grid>
              <Grid container spacing={6} className='mb-7'>
                <Grid item xs={12}>
                  <MasterDataSelection />
                </Grid>
              </Grid>
            </FormProvider>
          )}
        </DialogContent>
        <DialogActions>
          {mode !== 'view' && (
            <>
              {Object.keys(button).length <= 0 || canSeeCol === false ? null : button.IS_HAS_BUTTON ? (
                <Button
                  onClick={() => {
                    // setRowSelection(dataItem)

                    setOpenConfirmReCalModal(true)

                    // reCalMutation.mutate(dataItem)
                  }}
                  variant='contained'
                  color={button.IS_GENERATE_BUTTON ? 'success' : 'warning'}
                  disabled={button.IS_DISABLE || !rowSelected?.original.SCT_ID}
                >
                  {button.IS_GENERATE_BUTTON ? 'Cal SCT' : 'Re-Cal SCT'}
                </Button>
              ) : null}
              {openConfirmReCalModal ? (
                <ConfirmModal
                  show={openConfirmReCalModal}
                  onConfirmClick={() => {
                    const dataItem = [
                      {
                        SCT_ID: rowSelected?.original.SCT_ID,
                        UPDATE_BY: getUserData().EMPLOYEE_CODE
                        // SCT_REVISION_CODE: row.original.SCT_REVISION_CODE,
                        // SCT_TAG_SETTING_ID: row.original.SCT_TAG_SETTING_ID
                      }
                    ]

                    reCalMutation.mutate(dataItem)
                  }}
                  isLoading={reCalMutation.isPending}
                  onCloseClick={() => {
                    setOpenConfirmReCalModal(false)

                    // if (rowSelection?.length > 0) {
                    //   setRowSelection({})
                    // }
                  }}
                  isDelete={false}
                />
              ) : null}
              {rowSelected?.original.SCT_STATUS_PROGRESS_ID !== 2 && (
                <ButtonGroup variant='outlined' color='secondary' size='small'>
                  <Button
                    variant='outlined'
                    sx={{
                      cursor: 'default',
                      color: 'var(--mui-palette-text-secondary) !important'
                    }}
                    disabled
                  >
                    Change to
                  </Button>
                  <Button
                    variant='outlined'
                    sx={{
                      cursor: 'default',
                      padding: '0'
                    }}
                  >
                    <Controller
                      name='CHANGE_STATUS_TO'
                      control={reactHookFormMethods.control}
                      render={({ field: { ref, ...fieldProps } }) => (
                        <AsyncSelectCustom
                          {...fieldProps}
                          // label='SCT Status Progress'
                          isClearable
                          cacheOptions
                          defaultOptions
                          loadOptions={inputValue => {
                            return fetchSctStatusProgressNameAndInuse({
                              sctStatusProgressName: inputValue,
                              inuse: 1
                            })
                          }}
                          getOptionLabel={data => data?.SCT_STATUS_PROGRESS_NAME.toString()}
                          getOptionValue={data => data.SCT_STATUS_PROGRESS_ID.toString()}
                          classNamePrefix='select'
                          placeholder='Select SCT Status Progress ...'
                          isOptionDisabled={option => {
                            if (option?.SCT_STATUS_PROGRESS_NO === 7) return false

                            if (rowSelected?.original.SCT_STATUS_PROGRESS_NO == 3) {
                              return option?.SCT_STATUS_PROGRESS_NO !== 4
                            } else {
                              if (rowSelected?.original.SCT_STATUS_PROGRESS_NO === 5) {
                                return (
                                  !(
                                    option?.SCT_STATUS_PROGRESS_NO ===
                                    rowSelected?.original.SCT_STATUS_PROGRESS_NO - 2
                                  ) &&
                                  !(
                                    option?.SCT_STATUS_PROGRESS_NO ===
                                    rowSelected?.original.SCT_STATUS_PROGRESS_NO - 1
                                  ) &&
                                  !(option?.SCT_STATUS_PROGRESS_NO === rowSelected?.original.SCT_STATUS_PROGRESS_NO + 1)
                                )
                              } else if (rowSelected?.original.SCT_STATUS_PROGRESS_NO === 6) {
                                return (
                                  !(
                                    option?.SCT_STATUS_PROGRESS_NO ===
                                    rowSelected?.original.SCT_STATUS_PROGRESS_NO - 3
                                  ) &&
                                  !(
                                    option?.SCT_STATUS_PROGRESS_NO ===
                                    rowSelected?.original.SCT_STATUS_PROGRESS_NO - 2
                                  ) &&
                                  !(
                                    option?.SCT_STATUS_PROGRESS_NO ===
                                    rowSelected?.original.SCT_STATUS_PROGRESS_NO - 1
                                  ) &&
                                  !(option?.SCT_STATUS_PROGRESS_NO === rowSelected?.original.SCT_STATUS_PROGRESS_NO + 1)
                                )
                              } else {
                                return (
                                  !(
                                    option?.SCT_STATUS_PROGRESS_NO ===
                                    rowSelected?.original.SCT_STATUS_PROGRESS_NO - 1
                                  ) &&
                                  !(option?.SCT_STATUS_PROGRESS_NO === rowSelected?.original.SCT_STATUS_PROGRESS_NO + 1)
                                )
                              }
                            }
                          }}
                          isDisabled={!reactHookFormMethods.getValues('SCT_ID')}
                        />
                      )}
                    />
                  </Button>

                  <Button
                    variant='contained'
                    color='success'
                    disabled={!reactHookFormMethods.getValues('SCT_ID')}
                    onClick={() => {
                      if (!reactHookFormMethods.getValues('CHANGE_STATUS_TO')?.SCT_STATUS_PROGRESS_ID) {
                        const message = {
                          title: 'SCT Data',
                          message: 'Please select SCT Status Progress'
                        }

                        ToastMessageError(message)
                        return
                      }
                      if (!reactHookFormMethods.getValues('SCT_ID')) {
                        const message = {
                          title: 'SCT Data',
                          message: 'Loading SCT Data, Please try again'
                        }

                        ToastMessageError(message)
                        return
                      }

                      setConfirmChangeProgressModal(true)
                    }}
                  >
                    Confirm
                  </Button>
                </ButtonGroup>
              )}

              {rowSelected?.original.SCT_STATUS_PROGRESS_ID === 2 && (
                <Button
                  disabled={!reactHookFormMethods.getValues('SCT_ID')}
                  onMouseEnter={() => setIsDraft(true)}
                  onClick={() => {
                    return reactHookFormMethods.handleSubmit(onDraft, onError)()
                  }}
                  variant='contained'
                >
                  Save Draft
                </Button>
              )}
              {rowSelected?.original.SCT_STATUS_PROGRESS_ID === 2 && (
                <Button
                  disabled={!reactHookFormMethods.getValues('SCT_ID')}
                  onMouseEnter={() => setIsDraft(false)}
                  onClick={() => {
                    if (!reactHookFormMethods.getValues('SCT_ID')) {
                      const message = {
                        title: 'SCT Data',
                        message: 'Loading SCT Data, Please try again'
                      }

                      ToastMessageError(message)
                      return
                    }

                    return reactHookFormMethods.handleSubmit(onSubmit, onError)()
                  }}
                  variant='contained'
                >
                  Save & Complete
                </Button>
              )}
            </>
          )}
          <Button onClick={handleClose} variant='tonal' color='secondary'>
            Close
          </Button>
        </DialogActions>
        <ConfirmModal
          show={confirmModal}
          onConfirmClick={isDraft ? handleDraft : handleSaveComplete}
          onCloseClick={() => setConfirmModal(false)}
          isDelete={false}
        />
        {/* {JSON.stringify(reactHookFormMethods.getValues('SCT_STATUS_PROGRESS_ID'))} */}
        {/* {reactHookFormMethods.getValues('SCT_STATUS_PROGRESS.SCT_STATUS_PROGRESS_ID')} */}
        <ConfirmModalForSctForProduct
          show={confirmChangeProgressModal}
          setValue={reactHookFormMethods.setValue}
          sctStatusProgressId={reactHookFormMethods.getValues('CHANGE_STATUS_TO')?.SCT_STATUS_PROGRESS_ID}
          onConfirmClick={() => {
            const dataItem = {
              SCT_ID: [reactHookFormMethods.getValues('SCT_ID')],
              SCT_STATUS_PROGRESS_ID: reactHookFormMethods.getValues('CHANGE_STATUS_TO')?.SCT_STATUS_PROGRESS_ID,
              UPDATE_BY: getUserData().EMPLOYEE_CODE,
              CANCEL_REASON: reactHookFormMethods.getValues('cancelReason') ?? '',
              //listStatusSctProgress: selectedRows.map((item: any) => item.original.SCT_STATUS_PROGRESS_ID)
              listStatusSctProgress: [
                {
                  SCT_STATUS_PROGRESS_ID: reactHookFormMethods.getValues('SCT_STATUS_PROGRESS.SCT_STATUS_PROGRESS_ID')
                }
              ]
            }

            if (
              reactHookFormMethods.getValues('CHANGE_STATUS_TO')?.SCT_STATUS_PROGRESS_ID === 1 &&
              !reactHookFormMethods.getValues('cancelReason')
            ) {
              const message = {
                title: 'SCT Data',
                message: 'โปรดกรอกเหตุผลในการยกเลิก'
              }

              ToastMessageError(message)

              return
            }

            changeProgressMutation.mutate(dataItem)
          }}
          onCloseClick={() => setConfirmChangeProgressModal(false)}
          isDelete={false}
        />
      </Dialog>
    </>
  )
}
