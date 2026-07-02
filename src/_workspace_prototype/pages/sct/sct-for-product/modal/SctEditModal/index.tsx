import { Dispatch, forwardRef, ReactElement, Ref, SetStateAction, useEffect, useMemo, useState } from 'react'

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

import { canSeeCol } from '../../SearchResult'
import { useDxContext } from '@/_template/DxContextProvider'
import SctMasterDataHistoryServices from '@/_workspace/services/sct/SctMasterDataHistoryServices'
import { FormDataPage, validationSchemaPage } from './validationSchema'
import { StandardCostI } from '@/_workspace/types/sct/StandardCostType'
import SctCompareServices from '@/_workspace/services/sct/SctCompareServices'
import FlowProcessServices from '@/_workspace/services/flow/FlowProcessServices'
import { toast } from 'react-toastify'

import SkeletonCustom from '@/components/SkeletonCustom'
import ImportFeeServices from '@/_workspace/services/cost-condition/ImportFeeServices'
import SctComponentTypeResourceOptionSelectServices from '@/_workspace/services/sct/SctComponentTypeResourceOptionSelectServices'
import MasterDataSelection from './MasterDataSelection'
import SctCreateFrom from './SctCreateFrom'
import SctBomFlowProcessItemUsagePriceServices from '@/_workspace/services/sct/SctBomFlowProcessItemUsagePriceServices'
import BomFlowProcessItemUsageServices from '@/_workspace/services/bom/BomFlowProcessItemUsageServices'
import SctDetailForAdjustService from '@/_workspace/services/sct/SctDetailForAdjustService'
import SctTotalCostService from '@/_workspace/services/sct/SctTotalCostService'
import SctBomFlowProcessItemUsagePriceAdjustServices from '@/_workspace/services/sct/SctBomFlowProcessItemUsagePriceAdjustServices'
import getErrorMessage from '@/utils/getErrorMessage'

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
  //const [isDraft, setIsDraft] = useState(false)

  const { setPagination, setIsEnableFetching } = useDxContext()

  // react-hook-form
  const reactHookFormMethods = useForm<FormDataPage>({
    resolver: zodResolver(validationSchemaPage),
    mode: 'onSubmit',
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
          }).then(res => res.data.ResultOnDb?.[0] ?? {})
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
          isSaveDraft: undefined,
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
              CREATE_FROM_SCT_STATUS_PROGRESS_NAME: sctData.CREATE_FROM_SCT_STATUS_PROGRESS_NAME,
              CREATE_FROM_isCalculationAlready:
                typeof sctData.CREATE_FROM_SELLING_PRICE === 'undefined' || sctData.CREATE_FROM_SELLING_PRICE === null
                  ? false
                  : true
            }
          },
          sctComPareNo1:
            typeof sctCompareNo1 !== 'undefined'
              ? {
                  sctCompareNo: 1,
                  SCT_ID: sctCompareNo1.SCT_ID_FOR_COMPARE,
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
          indirectCost: {
            main: {
              costCondition: {
                // directCostCondition: {
                //   fiscalYear: listSctMasterDataHistory.find(item => item.SCT_MASTER_DATA_SETTING_ID == 1)?.FISCAL_YEAR,
                //   version: listSctMasterDataHistory.find(item => item.SCT_MASTER_DATA_SETTING_ID == 1)?.VERSION_NO
                // },
                // indirectCostCondition: {
                //   fiscalYear: listSctMasterDataHistory.find(item => item.SCT_MASTER_DATA_SETTING_ID == 2)?.FISCAL_YEAR,
                //   version: listSctMasterDataHistory.find(item => item.SCT_MASTER_DATA_SETTING_ID == 2)?.VERSION_NO
                // },
                // otherCostCondition: {
                //   fiscalYear: listSctMasterDataHistory.find(item => item.SCT_MASTER_DATA_SETTING_ID == 3)?.FISCAL_YEAR,
                //   version: listSctMasterDataHistory.find(item => item.SCT_MASTER_DATA_SETTING_ID == 3)?.VERSION_NO
                // },
                // specialCostCondition: {
                //   fiscalYear: listSctMasterDataHistory.find(item => item.SCT_MASTER_DATA_SETTING_ID == 4)?.FISCAL_YEAR,
                //   version: listSctMasterDataHistory.find(item => item.SCT_MASTER_DATA_SETTING_ID == 4)?.VERSION_NO
                // },
                importFeeRate: {
                  importFeeRate: importFeeRate.IMPORT_FEE_RATE,
                  fiscalYear: listSctMasterDataHistory.find(item => item.SCT_MASTER_DATA_SETTING_ID == 5)?.FISCAL_YEAR,
                  version: listSctMasterDataHistory.find(item => item.SCT_MASTER_DATA_SETTING_ID == 5)?.VERSION_NO
                }
              },
              directProcessCost: 0,
              total: 0,
              totalDirectCost: 0,
              totalProcessingTimeIncludingIndirectRateOfDirectProcessCostMh: 0,
              totalProcessingTimeMh: 0
            }
          },
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
          },
          adjust: {
            indirectCostCondition: {
              totalIndirectCost: {
                isAdjust:
                  typeof sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.TOTAL_INDIRECT_COST === 'number'
                    ? true
                    : false,
                isDisabledInput: true,
                dataFromSctResourceOptionId:
                  sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)
                    ?.TOTAL_INDIRECT_COST_SCT_RESOURCE_OPTION_ID ??
                  listSctComponentTypeResourceOptionSelect.find(
                    item => item.SCT_COMPONENT_TYPE_ID === 2 && item.IS_FROM_SCT_COPY === 0
                  )?.SCT_RESOURCE_OPTION_ID ??
                  0
              }
            },
            otherCostCondition: {
              ga: {
                isAdjust:
                  typeof sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.GA === 'number' ? true : false,
                isDisabledInput: true,
                dataFromSctResourceOptionId:
                  sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.GA_SCT_RESOURCE_OPTION_ID ??
                  listSctComponentTypeResourceOptionSelect.find(
                    item => item.SCT_COMPONENT_TYPE_ID === 3 && item.IS_FROM_SCT_COPY === 0
                  )?.SCT_RESOURCE_OPTION_ID ??
                  0
              },
              margin: {
                isAdjust:
                  typeof sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.MARGIN === 'number'
                    ? true
                    : false,
                isDisabledInput: true,
                dataFromSctResourceOptionId:
                  sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.MARGIN_SCT_RESOURCE_OPTION_ID ??
                  listSctComponentTypeResourceOptionSelect.find(
                    item => item.SCT_COMPONENT_TYPE_ID === 3 && item.IS_FROM_SCT_COPY === 0
                  )?.SCT_RESOURCE_OPTION_ID ??
                  0
              },
              sellingExpense: {
                isAdjust:
                  typeof sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.SELLING_EXPENSE === 'number'
                    ? true
                    : false,
                isDisabledInput: true,
                dataFromSctResourceOptionId:
                  sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.SELLING_EXPENSE_SCT_RESOURCE_OPTION_ID ??
                  listSctComponentTypeResourceOptionSelect.find(
                    item => item.SCT_COMPONENT_TYPE_ID === 3 && item.IS_FROM_SCT_COPY === 0
                  )?.SCT_RESOURCE_OPTION_ID ??
                  0
              },
              cit: {
                isAdjust:
                  typeof sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.CIT === 'number' ? true : false,
                isDisabledInput: true,
                dataFromSctResourceOptionId:
                  sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.CIT_SCT_RESOURCE_OPTION_ID ??
                  listSctComponentTypeResourceOptionSelect.find(
                    item => item.SCT_COMPONENT_TYPE_ID === 3 && item.IS_FROM_SCT_COPY === 0
                  )?.SCT_RESOURCE_OPTION_ID ??
                  0
              },
              vat: {
                isAdjust:
                  typeof sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.VAT === 'number' ? true : false,
                isDisabledInput: true,
                dataFromSctResourceOptionId:
                  sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.VAT_SCT_RESOURCE_OPTION_ID ??
                  listSctComponentTypeResourceOptionSelect.find(
                    item => item.SCT_COMPONENT_TYPE_ID === 3 && item.IS_FROM_SCT_COPY === 0
                  )?.SCT_RESOURCE_OPTION_ID ??
                  0
              }
            },
            specialCostCondition: {
              adjustPrice: {
                isAdjust:
                  typeof sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.ADJUST_PRICE === 'number'
                    ? true
                    : false,
                isDisabledInput: true,
                dataFromSctResourceOptionId:
                  sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.ADJUST_PRICE_SCT_RESOURCE_OPTION_ID ??
                  listSctComponentTypeResourceOptionSelect.find(
                    item => item.SCT_COMPONENT_TYPE_ID === 4 && item.IS_FROM_SCT_COPY === 0
                  )?.SCT_RESOURCE_OPTION_ID ??
                  0
              }
            },
            remarkForAdjustPrice:
              sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.REMARK_FOR_ADJUST_PRICE ?? ''
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
        toast.error(getErrorMessage(error), { autoClose: 10000 })
        setIsOpenModal(false)
      }
    }
  })

  const { control, getValues, setValue, handleSubmit } = reactHookFormMethods

  const { isLoading, errors } = useFormState({
    control
  })

  // const sctData = useWatch({ control, name: 'header' })
  // const product = useWatch({ control, name: 'product' })

  // const listSctComponentTypeResourceOptionSelect = useWatch({
  //   control,
  //   name: 'listSctComponentTypeResourceOptionSelect',
  //   defaultValue: []
  // })

  //#region Direct Cost Condition

  //#endregion Direct Cost Condition
  const queryClient = useQueryClient()

  const [
    clearTimeForSctProcess,
    yieldRateGoStraightRateProcessForSct,
    indirectRateOfDirectProcessCost,
    directUnitProcessCost,
    totalMatPrice
  ] = useWatch({
    control,
    name: [
      'directCost.flowProcess.body.clearTimeForSctProcess.main',
      'directCost.flowProcess.body.yieldRateGoStraightRateProcessForSct.main',
      'indirectCost.main.costCondition.directCostCondition.indirectRateOfDirectProcessCost',
      'indirectCost.main.costCondition.directCostCondition.directUnitProcessCost',
      'directCost.materialInProcess.main.total.Total'
    ]
  })

  const TOTAL_ESSENTIAL_TIME = useMemo(() => {
    // 1. Handle undefined/null cases
    if (!yieldRateGoStraightRateProcessForSct || !clearTimeForSctProcess) {
      return 0
    }

    // 2. Handle empty arrays
    if (!yieldRateGoStraightRateProcessForSct.length || !clearTimeForSctProcess.length) {
      return 0
    }

    // 3. สร้าง lookup table
    const lookup = Object.create(null)

    // ใช้ for loop สำหรับ performance
    for (let i = 0; i < clearTimeForSctProcess.length; i++) {
      const item = clearTimeForSctProcess[i]
      if (item?.flowProcessId != null) {
        lookup[item.flowProcessId] = item.clearTimeForSct || 0
      }
    }

    // 4. คำนวณผลลัพธ์
    let total = 0

    for (let i = 0; i < yieldRateGoStraightRateProcessForSct.length; i++) {
      const cur = yieldRateGoStraightRateProcessForSct[i]

      // ตรวจสอบว่า item มีค่าที่ถูกต้อง
      if (!cur || cur.flowProcessId == null) continue

      const clearTime = lookup[cur.flowProcessId] ?? 0
      const yieldRate = cur.yieldAccumulationForSct || 1
      const goStraightRate = cur.goStraightRateForSct || 1

      // ป้องกัน NaN และ Infinity
      const denominator = yieldRate * goStraightRate
      if (denominator === 0) continue

      total += (clearTime / denominator) * 10000
    }

    return total
  }, [yieldRateGoStraightRateProcessForSct, clearTimeForSctProcess])

  useEffect(() => {
    const totalProcessingTime = (TOTAL_ESSENTIAL_TIME ?? 0) / 60

    setValue('indirectCost.main.totalProcessingTimeMh', totalProcessingTime)

    const totalProcessingTimeIncludingIndirectRateOfDirectProcessCost =
      totalProcessingTime * (1 + (indirectRateOfDirectProcessCost ?? 0) / 100)

    setValue(
      'indirectCost.main.totalProcessingTimeIncludingIndirectRateOfDirectProcessCostMh',
      totalProcessingTimeIncludingIndirectRateOfDirectProcessCost
    )

    const directProcessCost = totalProcessingTimeIncludingIndirectRateOfDirectProcessCost * (directUnitProcessCost ?? 1)

    setValue('indirectCost.main.directProcessCost', directProcessCost)
    setValue('indirectCost.main.totalDirectCost', totalMatPrice + directProcessCost)
    setValue('indirectCost.main.total', totalMatPrice + directProcessCost)
  }, [TOTAL_ESSENTIAL_TIME, indirectRateOfDirectProcessCost, directUnitProcessCost, totalMatPrice, setValue])

  const onSubmit = () => {
    setConfirmModal(true)
  }

  const onDraft = () => {
    setConfirmModal(true)
  }

  const onError: SubmitErrorHandler<FormDataPage> = data => {
    console.log(data)

    // ค้นหา error messages ทั้งหมด
    const errorMessages: string[] = []

    const findMessages = (obj: any) => {
      if (!obj) return

      if (obj.message && typeof obj.message === 'string') {
        errorMessages.push(obj.message)
      }

      if (typeof obj === 'object') {
        Object.values(obj).forEach(findMessages)
      }
    }

    // ใช้ data แทน errors
    findMessages(data)

    // แสดงผลพร้อมเลขลำดับ
    if (errorMessages.length > 0) {
      const finalMessage = errorMessages.map((msg, index) => `${index + 1}. ${msg}`).join('\n\n')
      console.log(finalMessage)
      setIsOpenModalErrorMessage(true)
      setErrorMessage(finalMessage)
    }
  }

  const handleClose = () => {
    setIsOpenModal(false)
  }

  const onMutateSuccess = data => {
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

  const handleSaveData = () => {
    if ([4, 5, 6, 7].includes(Number(getValues('header.sctStatusProgress.SCT_STATUS_PROGRESS_ID')))) {
      const dataItem: {
        saveMode: string
        sct: {
          SCT_ID: string
          CREATE_BY: string
          UPDATE_BY: string
          ESTIMATE_PERIOD_START_DATE: string
          ESTIMATE_PERIOD_END_DATE: string
          NOTE: string
        }
        sct_compare: {
          SCT_COMPARE_NO: number
          SCT_ID: string
          SCT_ID_FOR_COMPARE: string
          IS_DEFAULT_EXPORT_COMPARE: number
          CREATE_BY: string
          UPDATE_BY: string
        }[]
      } = {
        saveMode: 'Save Detail Only', // Note , EstimatePeriodStartDate , EstimatePeriodEndDate , sctCompare
        sct: {
          SCT_ID: getValues('header.SCT_ID'),
          CREATE_BY: getUserData().EMPLOYEE_CODE,
          UPDATE_BY: getUserData().EMPLOYEE_CODE,
          ESTIMATE_PERIOD_START_DATE: getValues('header.estimatePeriodStartDate').toLocaleDateString('en-CA'),
          ESTIMATE_PERIOD_END_DATE: getValues('header.estimatePeriodEndDate').toLocaleDateString('en-CA'),
          NOTE: getValues('header.note') ?? ''
        },
        sct_compare: [
          {
            SCT_COMPARE_NO: 1,
            SCT_ID: getValues('header.SCT_ID'),
            SCT_ID_FOR_COMPARE: getValues('sctComPareNo1.SCT_ID') ?? '',
            IS_DEFAULT_EXPORT_COMPARE: getValues('sctComPareNo1.isDefaultExportCompare') ?? 0,
            CREATE_BY: getUserData().EMPLOYEE_CODE,
            UPDATE_BY: getUserData().EMPLOYEE_CODE
          },
          {
            SCT_COMPARE_NO: 2,
            SCT_ID: getValues('header.SCT_ID'),
            SCT_ID_FOR_COMPARE: getValues('sctComPareNo2.SCT_ID') ?? '',
            IS_DEFAULT_EXPORT_COMPARE: getValues('sctComPareNo2.isDefaultExportCompare') ?? 0,
            CREATE_BY: getUserData().EMPLOYEE_CODE,
            UPDATE_BY: getUserData().EMPLOYEE_CODE
          }
        ]
      }
      updateMutation.mutate(dataItem)
    } else {
      const dataItem: {
        saveMode: string
        isDraft: boolean
        sct: {
          SCT_ID: string
          CREATE_BY: string
          UPDATE_BY: string
          ESTIMATE_PERIOD_START_DATE: string
          ESTIMATE_PERIOD_END_DATE: string
          NOTE: string
        }
        sct_progress_working: {
          SCT_ID: string
          SCT_STATUS_WORKING_ID: number
          SCT_STATUS_PROGRESS_ID: number
          CREATE_BY: string
          UPDATE_BY: string
        }
        sct_compare: {
          SCT_COMPARE_NO: number
          SCT_ID: string
          SCT_ID_FOR_COMPARE: string
          IS_DEFAULT_EXPORT_COMPARE: number
          CREATE_BY: string
          UPDATE_BY: string
        }[]
        sct_detail_for_adjust: {
          SCT_ID: string
          IS_FROM_SCT_COPY: number

          TOTAL_INDIRECT_COST: number | ''
          CIT: number | ''
          VAT: number | ''
          GA: number | ''
          MARGIN: number | ''
          SELLING_EXPENSE: number | ''
          ADJUST_PRICE: number | ''
          REMARK_FOR_ADJUST_PRICE: string | ''

          TOTAL_INDIRECT_COST_SCT_RESOURCE_OPTION_ID: number | ''
          CIT_SCT_RESOURCE_OPTION_ID: number | ''
          VAT_SCT_RESOURCE_OPTION_ID: number | ''
          GA_SCT_RESOURCE_OPTION_ID: number | ''
          MARGIN_SCT_RESOURCE_OPTION_ID: number | ''
          SELLING_EXPENSE_SCT_RESOURCE_OPTION_ID: number | ''
          ADJUST_PRICE_SCT_RESOURCE_OPTION_ID: number | ''

          CREATE_BY: string
          UPDATE_BY: string
        }
        sct_master_data_history: {
          SCT_ID: string
          IS_FROM_SCT_COPY: number
          SCT_MASTER_DATA_SETTING_ID: number
          FISCAL_YEAR: number
          VERSION_NO: number
          CREATE_BY: string
          UPDATE_BY: string
        }[]
        sct_component_type_resource_option_select: {
          SCT_ID: string
          SCT_COMPONENT_TYPE_ID: number
          SCT_RESOURCE_OPTION_ID: number
          IS_FROM_SCT_COPY: number
          CREATE_BY: string
          UPDATE_BY: string
        }[]
      } = {
        saveMode: 'Save Data for Cal', // Note , EstimatePeriodStartDate , EstimatePeriodEndDate , sctCompare
        isDraft: getValues('isSaveDraft') ?? false,
        sct: {
          SCT_ID: getValues('header.SCT_ID'),
          CREATE_BY: getUserData().EMPLOYEE_CODE,
          UPDATE_BY: getUserData().EMPLOYEE_CODE,
          ESTIMATE_PERIOD_START_DATE: getValues('header.estimatePeriodStartDate').toLocaleDateString('en-CA'),
          ESTIMATE_PERIOD_END_DATE: getValues('header.estimatePeriodEndDate').toLocaleDateString('en-CA'),
          NOTE: getValues('header.note') ?? ''
        },
        sct_progress_working: {
          SCT_ID: getValues('header.SCT_ID'),
          SCT_STATUS_WORKING_ID: 1,
          SCT_STATUS_PROGRESS_ID:
            Number(getValues('header.sctStatusProgress.SCT_STATUS_PROGRESS_ID')) + (getValues('isSaveDraft') ? 0 : 1),
          CREATE_BY: getUserData().EMPLOYEE_CODE,
          UPDATE_BY: getUserData().EMPLOYEE_CODE
        },
        sct_compare: [
          {
            SCT_COMPARE_NO: 1,
            SCT_ID: getValues('header.SCT_ID'),
            SCT_ID_FOR_COMPARE: getValues('sctComPareNo1.SCT_ID') ?? '',
            IS_DEFAULT_EXPORT_COMPARE: getValues('sctComPareNo1.isDefaultExportCompare') ?? 0,
            CREATE_BY: getUserData().EMPLOYEE_CODE,
            UPDATE_BY: getUserData().EMPLOYEE_CODE
          },
          {
            SCT_COMPARE_NO: 2,
            SCT_ID: getValues('header.SCT_ID'),
            SCT_ID_FOR_COMPARE: getValues('sctComPareNo2.SCT_ID') ?? '',
            IS_DEFAULT_EXPORT_COMPARE: getValues('sctComPareNo2.isDefaultExportCompare') ?? 0,
            CREATE_BY: getUserData().EMPLOYEE_CODE,
            UPDATE_BY: getUserData().EMPLOYEE_CODE
          }
        ],
        sct_detail_for_adjust: {
          SCT_ID: getValues('header.SCT_ID'),
          TOTAL_INDIRECT_COST: getValues('adjust.indirectCostCondition.totalIndirectCost.isAdjust')
            ? (getValues('indirectCost.main.costCondition.indirectCostCondition.totalIndirectCost') ?? '')
            : '',
          CIT: getValues('adjust.otherCostCondition.cit.isAdjust')
            ? (getValues('indirectCost.main.costCondition.otherCostCondition.cit') ?? '')
            : '',
          VAT: getValues('adjust.otherCostCondition.vat.isAdjust')
            ? (getValues('indirectCost.main.costCondition.otherCostCondition.vat') ?? '')
            : '',
          SELLING_EXPENSE: getValues('adjust.otherCostCondition.sellingExpense.isAdjust')
            ? (getValues('indirectCost.main.costCondition.otherCostCondition.sellingExpense') ?? '')
            : '',
          GA: getValues('adjust.otherCostCondition.ga.isAdjust')
            ? (getValues('indirectCost.main.costCondition.otherCostCondition.ga') ?? '')
            : '',
          MARGIN: getValues('adjust.otherCostCondition.margin.isAdjust')
            ? (getValues('indirectCost.main.costCondition.otherCostCondition.margin') ?? '')
            : '',
          ADJUST_PRICE: getValues('adjust.specialCostCondition.adjustPrice.isAdjust')
            ? (getValues('indirectCost.main.costCondition.specialCostCondition.adjustPrice') ?? '')
            : '',
          REMARK_FOR_ADJUST_PRICE: getValues('adjust.remarkForAdjustPrice') ?? '',

          TOTAL_INDIRECT_COST_SCT_RESOURCE_OPTION_ID: getValues(
            'adjust.indirectCostCondition.totalIndirectCost.isAdjust'
          )
            ? (getValues('adjust.indirectCostCondition.totalIndirectCost.dataFromSctResourceOptionId') ?? '')
            : '',
          CIT_SCT_RESOURCE_OPTION_ID: getValues('adjust.otherCostCondition.cit.isAdjust')
            ? (getValues('adjust.otherCostCondition.cit.dataFromSctResourceOptionId') ?? '')
            : '',
          VAT_SCT_RESOURCE_OPTION_ID: getValues('adjust.otherCostCondition.vat.isAdjust')
            ? (getValues('adjust.otherCostCondition.vat.dataFromSctResourceOptionId') ?? '')
            : '',
          GA_SCT_RESOURCE_OPTION_ID: getValues('adjust.otherCostCondition.ga.isAdjust')
            ? (getValues('adjust.otherCostCondition.ga.dataFromSctResourceOptionId') ?? '')
            : '',
          MARGIN_SCT_RESOURCE_OPTION_ID: getValues('adjust.otherCostCondition.margin.isAdjust')
            ? (getValues('adjust.otherCostCondition.margin.dataFromSctResourceOptionId') ?? '')
            : '',
          SELLING_EXPENSE_SCT_RESOURCE_OPTION_ID: getValues('adjust.otherCostCondition.sellingExpense.isAdjust')
            ? (getValues('adjust.otherCostCondition.sellingExpense.dataFromSctResourceOptionId') ?? '')
            : '',
          ADJUST_PRICE_SCT_RESOURCE_OPTION_ID: getValues('adjust.specialCostCondition.adjustPrice.isAdjust')
            ? (getValues('adjust.specialCostCondition.adjustPrice.dataFromSctResourceOptionId') ?? '')
            : '',
          IS_FROM_SCT_COPY: 0,
          CREATE_BY: getUserData().EMPLOYEE_CODE,
          UPDATE_BY: getUserData().EMPLOYEE_CODE
        },
        sct_master_data_history: [
          {
            SCT_MASTER_DATA_SETTING_ID: 1, // Direct Cost Condition
            SCT_ID: getValues('header.SCT_ID'),
            FISCAL_YEAR: getValues('indirectCost.main.costCondition.directCostCondition.fiscalYear') ?? 0,
            VERSION_NO: getValues('indirectCost.main.costCondition.directCostCondition.version') ?? 0,
            IS_FROM_SCT_COPY: 0,
            CREATE_BY: getUserData().EMPLOYEE_CODE,
            UPDATE_BY: getUserData().EMPLOYEE_CODE
          },
          {
            SCT_MASTER_DATA_SETTING_ID: 2, // Indirect Cost Condition
            SCT_ID: getValues('header.SCT_ID'),
            FISCAL_YEAR: getValues('indirectCost.main.costCondition.indirectCostCondition.fiscalYear') ?? 0,
            VERSION_NO: getValues('indirectCost.main.costCondition.indirectCostCondition.version') ?? 0,
            IS_FROM_SCT_COPY: 0,
            CREATE_BY: getUserData().EMPLOYEE_CODE,
            UPDATE_BY: getUserData().EMPLOYEE_CODE
          },
          {
            SCT_MASTER_DATA_SETTING_ID: 3, // Other Cost Condition
            SCT_ID: getValues('header.SCT_ID'),
            FISCAL_YEAR: getValues('indirectCost.main.costCondition.otherCostCondition.fiscalYear') ?? 0,
            VERSION_NO: getValues('indirectCost.main.costCondition.otherCostCondition.version') ?? 0,
            IS_FROM_SCT_COPY: 0,
            CREATE_BY: getUserData().EMPLOYEE_CODE,
            UPDATE_BY: getUserData().EMPLOYEE_CODE
          },
          {
            SCT_MASTER_DATA_SETTING_ID: 4, // Special Cost Condition
            SCT_ID: getValues('header.SCT_ID'),
            FISCAL_YEAR: getValues('indirectCost.main.costCondition.specialCostCondition.fiscalYear') ?? 0,
            VERSION_NO: getValues('indirectCost.main.costCondition.specialCostCondition.version') ?? 0,
            IS_FROM_SCT_COPY: 0,
            CREATE_BY: getUserData().EMPLOYEE_CODE,
            UPDATE_BY: getUserData().EMPLOYEE_CODE
          },
          {
            SCT_MASTER_DATA_SETTING_ID: 5, // Yield Rate & Go Straight Rate
            SCT_ID: getValues('header.SCT_ID'),
            FISCAL_YEAR: getValues('directCost.flowProcess.total.main.yieldRateAndGoStraightRate.fiscalYear') ?? 0,
            VERSION_NO: getValues('directCost.flowProcess.total.main.yieldRateAndGoStraightRate.version') ?? 0,
            IS_FROM_SCT_COPY: 0,
            CREATE_BY: getUserData().EMPLOYEE_CODE,
            UPDATE_BY: getUserData().EMPLOYEE_CODE
          },
          {
            SCT_MASTER_DATA_SETTING_ID: 6, //Clear Time
            SCT_ID: getValues('header.SCT_ID'),
            FISCAL_YEAR: getValues('directCost.flowProcess.total.main.clearTime.fiscalYear') ?? 0,
            VERSION_NO: getValues('directCost.flowProcess.total.main.clearTime.version') ?? 0,
            IS_FROM_SCT_COPY: 0,
            CREATE_BY: getUserData().EMPLOYEE_CODE,
            UPDATE_BY: getUserData().EMPLOYEE_CODE
          }
        ],
        sct_component_type_resource_option_select: [
          {
            SCT_ID: getValues('header.SCT_ID'),
            SCT_COMPONENT_TYPE_ID: getValues('masterDataSelection.directCostCondition').SCT_COMPONENT_TYPE_ID,
            SCT_RESOURCE_OPTION_ID: getValues('masterDataSelection.directCostCondition').SCT_RESOURCE_OPTION_ID,
            IS_FROM_SCT_COPY: 0,
            CREATE_BY: getUserData().EMPLOYEE_CODE,
            UPDATE_BY: getUserData().EMPLOYEE_CODE
          },
          {
            SCT_ID: getValues('header.SCT_ID'),
            SCT_COMPONENT_TYPE_ID: getValues('masterDataSelection.indirectCostCondition').SCT_COMPONENT_TYPE_ID,
            SCT_RESOURCE_OPTION_ID: getValues('masterDataSelection.indirectCostCondition').SCT_RESOURCE_OPTION_ID,
            IS_FROM_SCT_COPY: 0,
            CREATE_BY: getUserData().EMPLOYEE_CODE,
            UPDATE_BY: getUserData().EMPLOYEE_CODE
          },
          {
            SCT_ID: getValues('header.SCT_ID'),
            SCT_COMPONENT_TYPE_ID: getValues('masterDataSelection.otherCostCondition').SCT_COMPONENT_TYPE_ID,
            SCT_RESOURCE_OPTION_ID: getValues('masterDataSelection.otherCostCondition').SCT_RESOURCE_OPTION_ID,
            IS_FROM_SCT_COPY: 0,
            CREATE_BY: getUserData().EMPLOYEE_CODE,
            UPDATE_BY: getUserData().EMPLOYEE_CODE
          },
          {
            SCT_ID: getValues('header.SCT_ID'),
            SCT_COMPONENT_TYPE_ID: getValues('masterDataSelection.specialCostCondition').SCT_COMPONENT_TYPE_ID,
            SCT_RESOURCE_OPTION_ID: getValues('masterDataSelection.specialCostCondition').SCT_RESOURCE_OPTION_ID,
            IS_FROM_SCT_COPY: 0,
            CREATE_BY: getUserData().EMPLOYEE_CODE,
            UPDATE_BY: getUserData().EMPLOYEE_CODE
          },
          {
            SCT_ID: getValues('header.SCT_ID'),
            SCT_COMPONENT_TYPE_ID: getValues('masterDataSelection.yieldRateAndGoStraightRate').SCT_COMPONENT_TYPE_ID,
            SCT_RESOURCE_OPTION_ID: getValues('masterDataSelection.yieldRateAndGoStraightRate').SCT_RESOURCE_OPTION_ID,
            IS_FROM_SCT_COPY: 0,
            CREATE_BY: getUserData().EMPLOYEE_CODE,
            UPDATE_BY: getUserData().EMPLOYEE_CODE
          },
          {
            SCT_ID: getValues('header.SCT_ID'),
            SCT_COMPONENT_TYPE_ID: getValues('masterDataSelection.clearTime').SCT_COMPONENT_TYPE_ID,
            SCT_RESOURCE_OPTION_ID: getValues('masterDataSelection.clearTime').SCT_RESOURCE_OPTION_ID,
            IS_FROM_SCT_COPY: 0,
            CREATE_BY: getUserData().EMPLOYEE_CODE,
            UPDATE_BY: getUserData().EMPLOYEE_CODE
          },
          {
            SCT_ID: getValues('header.SCT_ID'),
            SCT_COMPONENT_TYPE_ID: getValues('masterDataSelection.manufacturingItemPrice').SCT_COMPONENT_TYPE_ID,
            SCT_RESOURCE_OPTION_ID: getValues('masterDataSelection.manufacturingItemPrice').SCT_RESOURCE_OPTION_ID,
            IS_FROM_SCT_COPY: 0,
            CREATE_BY: getUserData().EMPLOYEE_CODE,
            UPDATE_BY: getUserData().EMPLOYEE_CODE
          },
          {
            SCT_ID: getValues('header.SCT_ID'),
            SCT_COMPONENT_TYPE_ID: getValues('masterDataSelection.yieldRateMaterial').SCT_COMPONENT_TYPE_ID,
            SCT_RESOURCE_OPTION_ID: getValues('masterDataSelection.yieldRateMaterial').SCT_RESOURCE_OPTION_ID,
            IS_FROM_SCT_COPY: 0,
            CREATE_BY: getUserData().EMPLOYEE_CODE,
            UPDATE_BY: getUserData().EMPLOYEE_CODE
          }
        ]
      }
      updateMutation.mutate(dataItem)
    }
  }

  // Button
  const [button, setButton] = useState<any>({})

  useEffect(() => {
    fetchSctReCalButton({
      SCT_ID: rowSelected?.original.SCT_ID,
      FISCAL_YEAR: Number(rowSelected?.original.FISCAL_YEAR),
      SCT_PATTERN_ID: rowSelected?.original.SCT_PATTERN_ID,
      SCT_STATUS_PROGRESS_ID: rowSelected?.original.SCT_STATUS_PROGRESS_ID,
      SCT_REASON_SETTING_ID: rowSelected?.original.SCT_REASON_SETTING_ID,
      SCT_TAG_SETTING_ID: rowSelected?.original.SCT_TAG_SETTING_ID,
      IS_REFRESH_DATA_MASTER: rowSelected?.original?.IS_REFRESH_DATA_MASTER ? true : false,
      SELLING_PRICE: rowSelected?.original.SELLING_PRICE
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

  const [errorMessage, setErrorMessage] = useState<string>('')
  const [isOpenModalErrorMessage, setIsOpenModalErrorMessage] = useState<boolean>(false)

  return (
    <>
      <Dialog
        open={isOpenModalErrorMessage}
        disableEscapeKeyDown
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            setIsOpenModalErrorMessage(false)
          }
        }}
        closeAfterTransition={false}
      >
        <DialogTitle id='alert-dialog-title'>Notification การแจ้งเตือน</DialogTitle>
        <DialogContent>
          {errorMessage.split('\n').map((item: string, index: number) => {
            return (
              <DialogContentText key={index} id='alert-dialog-description'>
                {item}
              </DialogContentText>
            )
          })}
          {/* <DialogContentText id='alert-dialog-description'>{errorMessage}</DialogContentText> */}
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button onClick={() => setIsOpenModalErrorMessage(false)} variant='contained'>
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
                        SCT_REVISION_CODE: rowSelected?.original.SCT_REVISION_CODE,
                        CREATE_BY: getUserData().EMPLOYEE_CODE,
                        UPDATE_BY: getUserData().EMPLOYEE_CODE
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
                      name='changeStatusTo'
                      control={control}
                      render={({ field: { ref, ...fieldProps } }) => (
                        <AsyncSelectCustom
                          {...fieldProps}
                          label=''
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
                          // isOptionDisabled={option => {
                          //   if (option?.SCT_STATUS_PROGRESS_NO === 7) return false

                          //   if (rowSelected?.original.SCT_STATUS_PROGRESS_NO == 3) {
                          //     return option?.SCT_STATUS_PROGRESS_NO !== 4
                          //   } else {
                          //     if (rowSelected?.original.SCT_STATUS_PROGRESS_NO === 5) {
                          //       return (
                          //         !(
                          //           option?.SCT_STATUS_PROGRESS_NO ===
                          //           rowSelected?.original.SCT_STATUS_PROGRESS_NO - 2
                          //         ) &&
                          //         !(
                          //           option?.SCT_STATUS_PROGRESS_NO ===
                          //           rowSelected?.original.SCT_STATUS_PROGRESS_NO - 1
                          //         ) &&
                          //         !(option?.SCT_STATUS_PROGRESS_NO === rowSelected?.original.SCT_STATUS_PROGRESS_NO + 1)
                          //       )
                          //     } else if (rowSelected?.original.SCT_STATUS_PROGRESS_NO === 6) {
                          //       return (
                          //         !(
                          //           option?.SCT_STATUS_PROGRESS_NO ===
                          //           rowSelected?.original.SCT_STATUS_PROGRESS_NO - 3
                          //         ) &&
                          //         !(
                          //           option?.SCT_STATUS_PROGRESS_NO ===
                          //           rowSelected?.original.SCT_STATUS_PROGRESS_NO - 2
                          //         ) &&
                          //         !(
                          //           option?.SCT_STATUS_PROGRESS_NO ===
                          //           rowSelected?.original.SCT_STATUS_PROGRESS_NO - 1
                          //         ) &&
                          //         !(option?.SCT_STATUS_PROGRESS_NO === rowSelected?.original.SCT_STATUS_PROGRESS_NO + 1)
                          //       )
                          //     } else {
                          //       return (
                          //         !(
                          //           option?.SCT_STATUS_PROGRESS_NO ===
                          //           rowSelected?.original.SCT_STATUS_PROGRESS_NO - 1
                          //         ) &&
                          //         !(option?.SCT_STATUS_PROGRESS_NO === rowSelected?.original.SCT_STATUS_PROGRESS_NO + 1)
                          //       )
                          //     }
                          //   }
                          // }}
                          isDisabled={!getValues('header.SCT_ID')}
                        />
                      )}
                    />
                  </Button>

                  <Button
                    variant='contained'
                    color='success'
                    disabled={!getValues('header.SCT_ID')}
                    onClick={() => {
                      if (!getValues('changeStatusTo')?.SCT_STATUS_PROGRESS_ID) {
                        const message = {
                          title: 'SCT Data',
                          message: 'Please select SCT Status Progress'
                        }

                        ToastMessageError(message)
                        return
                      }
                      if (!getValues('header.SCT_ID')) {
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
                  disabled={!getValues('header.SCT_ID')}
                  //onMouseEnter={() => setIsDraft(true)}
                  onClick={() => {
                    setValue('isSaveDraft', true)
                    handleSubmit(onDraft, onError)()
                  }}
                  variant='contained'
                >
                  Save Draft
                </Button>
              )}
              {rowSelected?.original.SCT_STATUS_PROGRESS_ID === 2 && (
                <Button
                  disabled={!getValues('header.SCT_ID')}
                  //onMouseEnter={() => setIsDraft(false)}
                  onClick={() => {
                    setValue('isSaveDraft', false)
                    handleSubmit(onSubmit, onError)()
                  }}
                  variant='contained'
                >
                  Save & Complete
                </Button>
              )}
              {[4, 5, 6, 7].includes(rowSelected?.original.SCT_STATUS_PROGRESS_ID) && (
                <Button
                  disabled={!getValues('header.SCT_ID')}
                  //onMouseEnter={() => setIsDraft(false)}
                  onClick={() => {
                    setValue('isSaveDraft', false)
                    handleSubmit(onSubmit, onError)()
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
          onConfirmClick={handleSaveData}
          onCloseClick={() => setConfirmModal(false)}
          isDelete={false}
          isLoading={updateMutation.isPending}
        />
        {/* {JSON.stringify(getValues('SCT_STATUS_PROGRESS_ID'))} */}
        {/* {getValues('SCT_STATUS_PROGRESS.SCT_STATUS_PROGRESS_ID')} */}
        <ConfirmModalForSctForProduct
          show={confirmChangeProgressModal}
          setValue={setValue}
          sctStatusProgressId={getValues('changeStatusTo')?.SCT_STATUS_PROGRESS_ID}
          onConfirmClick={() => {
            const dataItem = {
              SCT_ID: [getValues('header.SCT_ID')],
              SCT_STATUS_PROGRESS_ID: getValues('changeStatusTo')?.SCT_STATUS_PROGRESS_ID,
              UPDATE_BY: getUserData().EMPLOYEE_CODE,
              CANCEL_REASON: getValues('cancelReason') ?? '',
              //listStatusSctProgress: selectedRows.map((item: any) => item.original.SCT_STATUS_PROGRESS_ID)
              listStatusSctProgress: [
                {
                  SCT_STATUS_PROGRESS_ID: getValues('header.sctStatusProgress.SCT_STATUS_PROGRESS_ID')
                }
              ]
            }

            if (getValues('changeStatusTo')?.SCT_STATUS_PROGRESS_ID === 1 && !getValues('cancelReason')) {
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
          isLoading={changeProgressMutation.isPending}
        />
      </Dialog>
    </>
  )
}
