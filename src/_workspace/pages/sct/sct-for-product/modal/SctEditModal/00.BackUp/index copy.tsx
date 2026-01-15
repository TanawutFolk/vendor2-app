import { Dispatch, forwardRef, ReactElement, Ref, SetStateAction, useEffect, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, FormProvider, SubmitErrorHandler, useForm, useFormState } from 'react-hook-form'

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
  rowSelected?: MRT_Row<StandardCostI> | null
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
    // shouldFocusError: true,
    // reValidateMode: 'onChange',
    defaultValues: async (): Promise<FormDataPage> => {
      if (!rowSelected?.original?.SCT_ID) {
        setIsOpenModal(false)
        toast.error(`Not found data for SCT ID: ${rowSelected?.original.SCT_ID}. Please check your data.`, {
          autoClose: 10000
        })
      }

      // ? Fetch SCT data
      const sctData = (await StandardCostForProductServices.getSctDataDetail({
        SCT_ID: rowSelected?.original?.SCT_ID ?? ''
      }).then(res => {
        return res.data.ResultOnDb[0]
      })) as StandardCostI &
        SctCreateFromHistoryI & { BOM_CODE_ACTUAL: string; BOM_NAME_ACTUAL: string } & {
          SCT_CREATE_FROM_NAME: string
          CREATE_FROM_SCT_REVISION_CODE: string
          CREATE_FROM_SCT_PATTERN_NAME: string
          CREATE_FROM_SCT_STATUS_PROGRESS_NAME: string
        }

      if (!sctData) {
        setIsOpenModal(false)
        toast.error(`Not found data for SCT ID: ${rowSelected?.original.SCT_ID}. Please check your data.`, {
          autoClose: 10000
        })
      }

      // ? Fetch SCT compare
      const sctCompare = (await SctCompareServices.getBySctId({
        SCT_ID: rowSelected?.original?.SCT_ID ?? ''
      }).then(res => {
        return res.data.ResultOnDb
      })) as {
        SCT_ID: string
        SCT_COMPARE_NO: number
        SCT_ID_FOR_COMPARE: string
        IS_DEFAULT_EXPORT_COMPARE: 1 | 0
        SCT_REVISION_CODE: string
        BOM_CODE: string
        BOM_NAME: string
        BOM_ID: number
        FLOW_ID: number
        FLOW_CODE: string
        FLOW_NAME: string
        TOTAL_COUNT_PROCESS: number
      }[]

      const sctCompareNo1 = sctCompare.find(item => item.SCT_COMPARE_NO == 1)
      const sctCompareNo2 = sctCompare.find(item => item.SCT_COMPARE_NO == 2)

      // ? Fetch flow process
      const listFlowProcess = (await FlowProcessServices.getByFlowId({
        FLOW_ID: sctData.FLOW_ID
      })
        .then(res => {
          return res.data.ResultOnDb
        })
        .catch(error => console.info(error))) as {
        FLOW_ID: number
        PROCESS_ID: number
        PROCESS_NAME: string
        PROCESS_CODE: string
        PROCESS_NO: number
        FLOW_PROCESS_ID: number
        FLOW_CODE: string
        FLOW_NAME: string
      }[]

      if (!listFlowProcess || listFlowProcess?.length === 0) {
        setIsOpenModal(false)
        toast.error(`Flow Process not found for SCT ID: ${rowSelected?.original.SCT_ID}. Please check your data.`, {
          autoClose: 10000
        })
      }

      // ? Fetch flow process
      const listBomFlowProcessItemUsage = await BomFlowProcessItemUsageServices.getByBomId({
        BOM_ID: sctData.BOM_ID
      })
        .then(res => {
          return res.data.ResultOnDb
        })
        .catch(err => {
          setIsOpenModal(false)
          toast.error(`Error: ${err?.response?.data?.Message ?? err?.message}`)
          return
        })

      if (!listBomFlowProcessItemUsage) {
        setIsOpenModal(false)
        toast.error(
          `BOM Flow Process Item Usage not found for SCT ID: ${rowSelected?.original.SCT_ID}. Please check your data.`,
          {
            autoClose: 10000
          }
        )
      }

      const sctDetailForAdjust = (await SctDetailForAdjustService.getBySctId({
        SCT_ID: rowSelected?.original?.SCT_ID ?? ''
      }).then(res => {
        return res?.data?.ResultOnDb ?? {}
      })) as {
        TOTAL_INDIRECT_COST: number
        CIT: number
        VAT: number
        GA: number
        MARGIN: number
        SELLING_EXPENSE: number
        ADJUST_PRICE: number
        REMARK_FOR_ADJUST_PRICE: string
        IS_FROM_SCT_COPY: number

        TOTAL_INDIRECT_COST_SCT_RESOURCE_OPTION_ID: number
        CIT_SCT_RESOURCE_OPTION_ID: number
        VAT_SCT_RESOURCE_OPTION_ID: number
        GA_SCT_RESOURCE_OPTION_ID: number
        MARGIN_SCT_RESOURCE_OPTION_ID: number
        SELLING_EXPENSE_SCT_RESOURCE_OPTION_ID: number
        ADJUST_PRICE_SCT_RESOURCE_OPTION_ID: number
      }[]

      const sctTotalCost = (await SctTotalCostService.getBySctId({
        SCT_ID: rowSelected?.original?.SCT_ID ?? ''
      }).then(res => {
        return res?.data?.ResultOnDb?.[0] ?? {}
      })) as {
        SCT_TOTAL_COST_ID: number
        SCT_ID: string
        DIRECT_UNIT_PROCESS_COST: number
        INDIRECT_RATE_OF_DIRECT_PROCESS_COST: number
        TOTAL_PROCESSING_TIME: number
        TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE: number
        TOTAL_DIRECT_COST: number
        DIRECT_PROCESS_COST: number
        IMPORTED_FEE: number
        IMPORTED_COST: number
        TOTAL: number
        TOTAL_PRICE_OF_RAW_MATERIAL: number
        TOTAL_PRICE_OF_SUB_ASSY: number
        TOTAL_PRICE_OF_SEMI_FINISHED_GOODS: number
        TOTAL_PRICE_OF_CONSUMABLE: number
        TOTAL_PRICE_OF_PACKING: number
        TOTAL_PRICE_OF_ALL_OF_ITEMS: number
        RM_INCLUDE_IMPORTED_COST: number
        CONSUMABLE_PACKING: number
        MATERIALS_COST: number
        INDIRECT_COST_SALE_AVE: number
        SELLING_EXPENSE: number
        GA: number
        MARGIN: number
        ESTIMATE_PERIOD_START_DATE: string
        TOTAL_YIELD_RATE: number
        TOTAL_CLEAR_TIME: number
        ADJUST_PRICE: number
        REMARK_FOR_ADJUST_PRICE: string
        NOTE: string
        SELLING_EXPENSE_FOR_SELLING_PRICE: number
        GA_FOR_SELLING_PRICE: number
        MARGIN_FOR_SELLING_PRICE: number
        IS_ADJUST_IMPORTED_COST: number
        IMPORTED_COST_DEFAULT: number
        TOTAL_GO_STRAIGHT_RATE: number
        CIT_FOR_SELLING_PRICE: number
        RAW_MATERIAL_SUB_ASSY_SEMI_FINISHED_GOODS: number
        ASSEMBLY_GROUP_FOR_SUPPORT_MES: number
        VAT_FOR_SELLING_PRICE: number
        CIT: number
        VAT: number
        TOTAL_PRICE_OF_ALL_OF_ITEMS_INCLUDE_IMPORTED_COST: number
        ESTIMATE_PERIOD_END_DATE: string
        TOTAL_ESSENTIAL_TIME: number
        SELLING_PRICE_BY_FORMULA: number
        SELLING_PRICE: number
        DESCRIPTION: string
        CREATE_BY: string
        CREATE_DATE: string
        UPDATE_BY: string
        UPDATE_DATE: string
        INUSE: number
        IS_FROM_SCT_COPY: number
      }[]

      // ? Fetch SCT Component Type
      const listSctComponentTypeResourceOptionSelect = (await SctComponentTypeResourceOptionSelectServices.getBySctId({
        SCT_ID: rowSelected?.original?.SCT_ID ?? ''
      }).then(res => {
        return res.data.ResultOnDb
      })) as {
        SCT_ID: string
        SCT_RESOURCE_OPTION_ID: number
        SCT_COMPONENT_TYPE_ID: number
      }[]

      if (!listSctComponentTypeResourceOptionSelect || listSctComponentTypeResourceOptionSelect?.length !== 8) {
        setIsOpenModal(false)
        toast.error(
          `Please complete all 8 required sections before proceeding:
              Direct Cost Condition, Indirect Cost Condition, Other Cost Condition, Special Cost Condition, Yield Rate & Go Straight Rate, Clear Time, Manufacturing Item Price, and Yield Rate Material.
              ข้อมูลไม่ครบ กรุณากรอกให้ครบทั้ง 8 ส่วนก่อนดำเนินการต่อ`,
          { autoClose: 10000 }
        )
      }

      // 1	Direct Cost Condition
      // 2	Indirect Cost Condition
      // 3	Other Cost Condition
      // 4	Special Cost Condition
      // 5	Yield Rate & Go Straight Rate
      // 6	Clear Time

      const listSctMasterDataHistory = (await SctMasterDataHistoryServices.getBySctIdAndIsFromSctCopy({
        SCT_ID: rowSelected?.original?.SCT_ID ?? '',
        IS_FROM_SCT_COPY: ''
      }).then(res => {
        return res.data.ResultOnDb
      })) as {
        SCT_MASTER_DATA_SETTING_ID: number
        FISCAL_YEAR: number
        VERSION_NO: number
        SCT_MASTER_DATA_SETTING_NAME: string
        IS_FROM_SCT_COPY: number
      }[]

      // declare variable

      //#region for ref
      // ? Table : sct_component_type
      // 1	Direct Cost Condition
      let directCostCondition: directCostConditionType = {
        DIRECT_UNIT_PROCESS_COST: 0,
        INDIRECT_RATE_OF_DIRECT_PROCESS_COST: 0,
        FISCAL_YEAR: 0,
        VERSION: 0,
        PRODUCT_MAIN_ID: 0,
        DIRECT_COST_CONDITION_ID: 0
      }
      // 2	Indirect Cost Condition
      let inDirectCostCondition: inDirectCostConditionType = {
        LABOR: 0,
        DEPRECIATION: 0,
        OTHER_EXPENSE: 0,
        FISCAL_YEAR: 0,
        VERSION: 0,
        PRODUCT_MAIN_ID: 0,
        INDIRECT_COST_CONDITION_ID: 0,
        TOTAL_INDIRECT_COST: 0
      }
      // 3	Other Cost Condition
      let otherCostCondition: otherCostConditionType = {
        GA: 0,
        MARGIN: 0,
        SELLING_EXPENSE: 0,
        VAT: 0,
        CIT: 0,
        FISCAL_YEAR: 0,
        VERSION: 0,
        PRODUCT_MAIN_ID: 0,
        OTHER_COST_CONDITION_ID: 0
      }
      // 4	Special Cost Condition
      let specialCostCondition: specialCostConditionType = {
        ADJUST_PRICE: 0,
        FISCAL_YEAR: 0,
        VERSION: 0,
        PRODUCT_MAIN_ID: 0,
        SPECIAL_COST_CONDITION_ID: 0
      }
      // 5	Yield Rate & Go Straight Rate
      let yieldRateGoStraightRateTotal: yieldRateGoStraightRateTotalType = {
        FISCAL_YEAR: 0,
        FLOW_ID: 0,
        FLOW_CODE: '',
        FLOW_NAME: '',
        TOTAL_YIELD_RATE_FOR_SCT: 0,
        TOTAL_GO_STRAIGHT_RATE_FOR_SCT: 0,
        PRODUCT_TYPE_ID: 0,
        REVISION_NO: 0,
        YIELD_RATE_GO_STRAIGHT_RATE_TOTAL_FOR_SCT_ID: ''
      }
      // let listYieldRateGoStraightRateProcessForSct: yieldRateGoStraightRateProcessForSctType[] = []

      // 6	Clear Time
      let clearTimeForSctTotal: clearTimeForSctTotalType = {
        FISCAL_YEAR: 0,
        FLOW_ID: 0,
        FLOW_CODE: '',
        FLOW_NAME: '',
        TOTAL_CLEAR_TIME_FOR_SCT: 0,
        PRODUCT_TYPE_ID: 0,
        REVISION_NO: 0,
        CLEAR_TIME_FOR_SCT_ID: ''
      }

      // 7	Manufacturing Item Price
      // 8	Yield Rate Material
      // ! use for SCT Selection
      let listSctBomFlowProcessItemUsagePrice: SctBomFlowProcessItemUsagePriceType[] = []
      let listSctBomFlowProcessItemUsagePriceAdjust: SctBomFlowProcessItemUsagePriceAdjustType[] = []
      // (X)	Import Fee Rate
      let importFeeRate: importFeeRateType = {
        FISCAL_YEAR: 0,
        VERSION: 0,
        ITEM_IMPORT_TYPE_ID: 0,
        IMPORT_FEE_ID: 0,
        IMPORT_FEE_RATE: 0
      }

      // ? Table : sct_resource_option
      // 1	Master Data (Latest)
      // 2	Revision Master Data
      // 3	SCT (Latest)
      // 4	SCT Selection
      // 5	Manual Input
      //#endregion for ref

      // ??? 1	Direct Cost Condition

      //#region Direct Cost Condition
      if (isCalculationAlready) {
        directCostCondition =
          await DirectCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo({
            FISCAL_YEAR: sctData.FISCAL_YEAR,
            PRODUCT_MAIN_ID: sctData.PRODUCT_MAIN_ID,
            ITEM_CATEGORY_ID: sctData.ITEM_CATEGORY_ID,
            VERSION:
              listSctMasterDataHistory.find(item => item.SCT_MASTER_DATA_SETTING_ID == 1 && item.IS_FROM_SCT_COPY == 0)
                ?.VERSION_NO ?? 0
          })
            .then(res => {
              return res?.data?.ResultOnDb?.[0] ?? []
            })
            .catch(err => {
              setIsOpenModal(false)
              toast.error(`Error: ${err?.response?.data?.Message ?? err?.message}`)
              return
            })
      } else {
        switch (
          listSctComponentTypeResourceOptionSelect.find(item => item.SCT_COMPONENT_TYPE_ID == 1)?.SCT_RESOURCE_OPTION_ID
        ) {
          case 1: {
            // Master Data (Latest)
            directCostCondition =
              await DirectCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest({
                FISCAL_YEAR: sctData.FISCAL_YEAR,
                PRODUCT_MAIN_ID: sctData.PRODUCT_MAIN_ID,
                ITEM_CATEGORY_ID: sctData.ITEM_CATEGORY_ID
              })
                .then(res => {
                  return res?.data?.ResultOnDb?.[0] ?? []
                })
                .catch(err => {
                  setIsOpenModal(false)
                  toast.error(`Error: ${err?.response?.data?.Message ?? err?.message}`)
                  return
                })
            break
          }
          case 2: {
            // 2	Revision Master Data
            directCostCondition =
              await DirectCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo({
                FISCAL_YEAR: sctData.FISCAL_YEAR,
                PRODUCT_MAIN_ID: sctData.PRODUCT_MAIN_ID,
                ITEM_CATEGORY_ID: sctData.ITEM_CATEGORY_ID,
                VERSION:
                  listSctMasterDataHistory.find(
                    item => item.SCT_MASTER_DATA_SETTING_ID == 1 && item.IS_FROM_SCT_COPY == 0
                  )?.VERSION_NO ?? 0
              })
                .then(res => {
                  return res?.data?.ResultOnDb?.[0] ?? []
                })
                .catch(err => {
                  setIsOpenModal(false)
                  toast.error(`Error: ${err?.response?.data?.Message ?? err?.message}`)
                  return
                })
            break
          }
          case 4: {
            //  4	SCT Selection
            const dataItem = sctTotalCost.find(item => item.IS_FROM_SCT_COPY == 1)

            if (dataItem?.DIRECT_PROCESS_COST) {
              directCostCondition = {
                DIRECT_COST_CONDITION_ID: 0,
                FISCAL_YEAR:
                  listSctMasterDataHistory.find(
                    item => item.SCT_MASTER_DATA_SETTING_ID == 1 && item.IS_FROM_SCT_COPY == 1
                  )?.FISCAL_YEAR ?? 0,
                VERSION:
                  listSctMasterDataHistory.find(
                    item => item.SCT_MASTER_DATA_SETTING_ID == 1 && item.IS_FROM_SCT_COPY == 1
                  )?.VERSION_NO ?? 0,
                DIRECT_UNIT_PROCESS_COST: dataItem?.DIRECT_PROCESS_COST,
                INDIRECT_RATE_OF_DIRECT_PROCESS_COST: dataItem?.INDIRECT_RATE_OF_DIRECT_PROCESS_COST,
                PRODUCT_MAIN_ID: sctData.PRODUCT_MAIN_ID
              }
            } else {
              await DirectCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo({
                FISCAL_YEAR: sctData.FISCAL_YEAR,
                PRODUCT_MAIN_ID: sctData.PRODUCT_MAIN_ID,
                ITEM_CATEGORY_ID: sctData.ITEM_CATEGORY_ID,
                VERSION:
                  listSctMasterDataHistory.find(
                    item => item.SCT_MASTER_DATA_SETTING_ID == 1 && item.IS_FROM_SCT_COPY == 1
                  )?.VERSION_NO ?? 0
              })
                .then(res => {
                  const dataItem = res?.data?.ResultOnDb?.[0]
                  //const dataItemAdjust = sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 1)

                  directCostCondition = {
                    DIRECT_COST_CONDITION_ID: dataItem?.DIRECT_COST_CONDITION_ID,
                    FISCAL_YEAR:
                      listSctMasterDataHistory.find(
                        item => item.SCT_MASTER_DATA_SETTING_ID == 1 && item.IS_FROM_SCT_COPY == 1
                      )?.FISCAL_YEAR ?? 0,
                    VERSION:
                      listSctMasterDataHistory.find(
                        item => item.SCT_MASTER_DATA_SETTING_ID == 1 && item.IS_FROM_SCT_COPY == 1
                      )?.VERSION_NO ?? 0,
                    DIRECT_UNIT_PROCESS_COST: dataItem?.DIRECT_PROCESS_COST,
                    INDIRECT_RATE_OF_DIRECT_PROCESS_COST: dataItem?.INDIRECT_RATE_OF_DIRECT_PROCESS_COST,
                    PRODUCT_MAIN_ID: sctData.PRODUCT_MAIN_ID
                  }
                })
                .catch(() => {
                  setIsOpenModal(false)
                  toast.error(
                    `Direct Cost Condition not found for SCT ID: ${rowSelected?.original.SCT_ID}. Please check your data.`,
                    { autoClose: 10000 }
                  )
                })
            }

            break
          }
          default: {
            setIsOpenModal(false)
            toast.error(
              `Direct Cost Condition not found for SCT ID: ${rowSelected?.original.SCT_ID}. Please check your data.`,
              { autoClose: 10000 }
            )

            break
          }
        }
      }

      //#endregion Direct Cost Condition

      // ??? 2	Indirect Cost Condition
      //#region Indirect Cost Condition
      switch (
        listSctComponentTypeResourceOptionSelect.find(item => item.SCT_COMPONENT_TYPE_ID == 2)?.SCT_RESOURCE_OPTION_ID
      ) {
        case 1: {
          // Master Data (Latest)
          inDirectCostCondition =
            await IndirectCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest({
              FISCAL_YEAR: sctData.FISCAL_YEAR,
              PRODUCT_MAIN_ID: sctData.PRODUCT_MAIN_ID,
              ITEM_CATEGORY_ID: sctData.ITEM_CATEGORY_ID
            })
              .then(res => {
                return res?.data?.ResultOnDb?.[0]
              })
              .catch(() => {
                setIsOpenModal(false)
                toast.error(
                  `Direct Cost Condition not found for SCT ID: ${rowSelected?.original.SCT_ID}. Please check your data.`,
                  { autoClose: 10000 }
                )
              })
          break
        }
        case 2: {
          // 2	Revision Master Data
          inDirectCostCondition =
            await IndirectCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo({
              FISCAL_YEAR: sctData.FISCAL_YEAR,
              PRODUCT_MAIN_ID: sctData.PRODUCT_MAIN_ID,
              ITEM_CATEGORY_ID: sctData.ITEM_CATEGORY_ID,
              VERSION:
                listSctMasterDataHistory.find(
                  item => item.SCT_MASTER_DATA_SETTING_ID == 2 && item.IS_FROM_SCT_COPY == 0
                )?.VERSION_NO ?? 0
            })
              .then(res => {
                return res?.data?.ResultOnDb?.[0]
              })
              .catch(() => {
                setIsOpenModal(false)
                toast.error(
                  `Direct Cost Condition not found for SCT ID: ${rowSelected?.original.SCT_ID}. Please check your data.`,
                  { autoClose: 10000 }
                )
              })
          break
        }
        case 4: {
          //  4	SCT Selection
          inDirectCostCondition =
            await IndirectCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo({
              FISCAL_YEAR: sctData.FISCAL_YEAR,
              PRODUCT_MAIN_ID: sctData.PRODUCT_MAIN_ID,
              ITEM_CATEGORY_ID: sctData.ITEM_CATEGORY_ID,
              VERSION:
                listSctMasterDataHistory.find(
                  item => item.SCT_MASTER_DATA_SETTING_ID == 2 && item.IS_FROM_SCT_COPY == 1
                )?.VERSION_NO ?? 0
            })
              .then(res => {
                return res?.data?.ResultOnDb?.[0]
              })
              .catch(() => {
                setIsOpenModal(false)
                toast.error(
                  `Direct Cost Condition not found for SCT ID: ${rowSelected?.original.SCT_ID}. Please check your data.`,
                  { autoClose: 10000 }
                )
              })
          break
        }
        default: {
          setIsOpenModal(false)
          toast.error(
            `Direct Cost Condition not found for SCT ID: ${rowSelected?.original.SCT_ID}. Please check your data.`,
            { autoClose: 10000 }
          )
          break
        }
      }
      //#endregion Indirect Cost Condition

      // ??? 3	Other Cost Condition
      //#region Other Cost Condition
      switch (
        listSctComponentTypeResourceOptionSelect.find(item => item.SCT_COMPONENT_TYPE_ID == 3)?.SCT_RESOURCE_OPTION_ID
      ) {
        case 1: {
          // Master Data (Latest)
          otherCostCondition =
            await OtherCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest({
              FISCAL_YEAR: sctData.FISCAL_YEAR,
              PRODUCT_MAIN_ID: sctData.PRODUCT_MAIN_ID,
              ITEM_CATEGORY_ID: sctData.ITEM_CATEGORY_ID
            }).then(res => {
              return res?.data?.ResultOnDb?.[0] ?? []
            })
          break
        }
        case 2: {
          // 2	Revision Master Data
          otherCostCondition =
            await OtherCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo({
              FISCAL_YEAR: sctData.FISCAL_YEAR,
              PRODUCT_MAIN_ID: sctData.PRODUCT_MAIN_ID,
              ITEM_CATEGORY_ID: sctData.ITEM_CATEGORY_ID,
              VERSION:
                listSctMasterDataHistory.find(
                  item => item.SCT_MASTER_DATA_SETTING_ID == 3 && item.IS_FROM_SCT_COPY == 0
                )?.VERSION_NO ?? 0
            }).then(res => {
              return res?.data?.ResultOnDb?.[0] ?? []
            })
          break
        }
        case 4: {
          //  4	SCT Selection
          otherCostCondition =
            await OtherCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo({
              FISCAL_YEAR: sctData.FISCAL_YEAR,
              PRODUCT_MAIN_ID: sctData.PRODUCT_MAIN_ID,
              ITEM_CATEGORY_ID: sctData.ITEM_CATEGORY_ID,
              VERSION:
                listSctMasterDataHistory.find(
                  item => item.SCT_MASTER_DATA_SETTING_ID == 3 && item.IS_FROM_SCT_COPY == 1
                )?.VERSION_NO ?? 0
            })
              .then(res => {
                return res?.data?.ResultOnDb?.[0] ?? []
              })
              .catch(() => {
                setIsOpenModal(false)
                toast.error(
                  `Direct Cost Condition not found for SCT ID: ${rowSelected?.original.SCT_ID}. Please check your data.`,
                  { autoClose: 10000 }
                )
              })
          break
        }
        default: {
          setIsOpenModal(false)
          toast.error(
            `Direct Cost Condition not found for SCT ID: ${rowSelected?.original.SCT_ID}. Please check your data.`,
            { autoClose: 10000 }
          )
          break
        }
      }
      //#endregion Other Cost Condition

      // ??? 4 Special Cost Condition
      //#region Special Cost Condition
      switch (
        listSctComponentTypeResourceOptionSelect.find(item => item.SCT_COMPONENT_TYPE_ID == 4)?.SCT_RESOURCE_OPTION_ID
      ) {
        case 1: {
          // Master Data (Latest)
          specialCostCondition =
            await SpecialCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest({
              FISCAL_YEAR: sctData.FISCAL_YEAR,
              PRODUCT_MAIN_ID: sctData.PRODUCT_MAIN_ID,
              ITEM_CATEGORY_ID: sctData.ITEM_CATEGORY_ID
            }).then(res => {
              return res?.data?.ResultOnDb?.[0] ?? []
            })
          break
        }
        case 2: {
          // 2	Revision Master Data
          specialCostCondition =
            await SpecialCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo({
              FISCAL_YEAR: sctData.FISCAL_YEAR,
              PRODUCT_MAIN_ID: sctData.PRODUCT_MAIN_ID,
              ITEM_CATEGORY_ID: sctData.ITEM_CATEGORY_ID,
              VERSION:
                listSctMasterDataHistory.find(
                  item => item.SCT_MASTER_DATA_SETTING_ID == 4 && item.IS_FROM_SCT_COPY == 0
                )?.VERSION_NO ?? 0
            }).then(res => {
              return res?.data?.ResultOnDb?.[0] ?? []
            })
          break
        }
        case 4: {
          //  4	SCT Selection
          specialCostCondition =
            await SpecialCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo({
              FISCAL_YEAR: sctData.FISCAL_YEAR,
              PRODUCT_MAIN_ID: sctData.PRODUCT_MAIN_ID,
              ITEM_CATEGORY_ID: sctData.ITEM_CATEGORY_ID,
              VERSION:
                listSctMasterDataHistory.find(
                  item => item.SCT_MASTER_DATA_SETTING_ID == 4 && item.IS_FROM_SCT_COPY == 1
                )?.VERSION_NO ?? 0
            })
              .then(res => {
                return res?.data?.ResultOnDb?.[0] ?? []
              })
              .catch(() => {
                setIsOpenModal(false)
                toast.error(
                  `Direct Cost Condition not found for SCT ID: ${rowSelected?.original.SCT_ID}. Please check your data.`,
                  { autoClose: 10000 }
                )
              })
          break
        }
        default: {
          setIsOpenModal(false)
          toast.error(
            `Direct Cost Condition not found for SCT ID: ${rowSelected?.original.SCT_ID}. Please check your data.`,
            { autoClose: 10000 }
          )
          break
        }
      }
      //#endregion Special Cost Condition

      // ??? 5	Yield Rate & Go Straight Rate
      //#region Yield Rate & Go Straight Rate

      if (isCalculationAlready) {
        yieldRateGoStraightRateTotal =
          await YieldRateGoStraightRateTotalForSctServices.getByProductTypeIdAndFiscalYearAndRevisionNo({
            FISCAL_YEAR: sctData.FISCAL_YEAR,
            PRODUCT_TYPE_ID: sctData.PRODUCT_TYPE_ID,
            REVISION_NO:
              listSctMasterDataHistory.find(item => item.SCT_MASTER_DATA_SETTING_ID == 5 && item.IS_FROM_SCT_COPY == 0)
                ?.VERSION_NO ?? 0
          })
            .then(res => {
              return res.data.ResultOnDb?.[0]
            })
            .catch(() => {
              setIsOpenModal(false)
              toast.error(
                `Yield Rate & Go Straight Rate not found for SCT ID: ${rowSelected?.original.SCT_ID}. Please check your data.`,
                { autoClose: 10000 }
              )
            })
      } else {
        switch (
          listSctComponentTypeResourceOptionSelect.find(item => item.SCT_COMPONENT_TYPE_ID == 5)?.SCT_RESOURCE_OPTION_ID
        ) {
          case 1: {
            // Master Data (Latest)

            yieldRateGoStraightRateTotal =
              await YieldRateGoStraightRateTotalForSctServices.getByProductTypeIdAndFiscalYear_MasterDataLatest({
                FISCAL_YEAR: sctData.FISCAL_YEAR,
                PRODUCT_TYPE_ID: sctData.PRODUCT_TYPE_ID
              })
                .then(res => {
                  return res.data.ResultOnDb?.[0]
                })
                .catch(() => {
                  setIsOpenModal(false)
                  toast.error(
                    `Yield Rate & Go Straight Rate not found for SCT ID: ${rowSelected?.original.SCT_ID}. Please check your data.`,
                    { autoClose: 10000 }
                  )
                })

            // listYieldRateGoStraightRateProcessForSct =
            //   await YieldRateGoStraightRateProcessForSctServices.getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest({
            //     FISCAL_YEAR: sctData.FISCAL_YEAR,
            //     PRODUCT_TYPE_ID: sctData.PRODUCT_TYPE_ID
            //   })
            //     .then(res => {
            //       return res.data.ResultOnDb
            //     })
            //     .catch(() => {
            //       setIsOpenModal(false)
            //       toast.error(
            //         `Yield Rate & Go Straight Rate not found for SCT ID: ${rowSelected?.original.SCT_ID}. Please check your data.`,
            //         { autoClose: 10000 }
            //       )
            //     })

            break
          }
          case 2: {
            // 2	Revision Master Data
            yieldRateGoStraightRateTotal =
              await YieldRateGoStraightRateTotalForSctServices.getByProductTypeIdAndFiscalYearAndRevisionNo({
                FISCAL_YEAR: sctData.FISCAL_YEAR,
                PRODUCT_TYPE_ID: sctData.PRODUCT_TYPE_ID,
                REVISION_NO:
                  listSctMasterDataHistory.find(
                    item => item.SCT_MASTER_DATA_SETTING_ID == 5 && item.IS_FROM_SCT_COPY == 0
                  )?.VERSION_NO ?? 0
              })
                .then(res => {
                  return res.data.ResultOnDb?.[0]
                })
                .catch(() => {
                  setIsOpenModal(false)
                  toast.error(
                    `Yield Rate & Go Straight Rate not found for SCT ID: ${rowSelected?.original.SCT_ID}. Please check your data.`,
                    { autoClose: 10000 }
                  )
                })

            // listYieldRateGoStraightRateProcessForSct =
            //   await YieldRateGoStraightRateProcessForSctServices.getByProductTypeIdAndFiscalYearAndRevisionNo({
            //     FISCAL_YEAR: sctData.FISCAL_YEAR,
            //     PRODUCT_TYPE_ID: sctData.PRODUCT_TYPE_ID,
            //     REVISION_NO:
            //       listSctMasterDataHistory.find(
            //         item => item.SCT_MASTER_DATA_SETTING_ID == 5 && item.IS_FROM_SCT_COPY == 0
            //       )?.VERSION_NO ?? 0
            //   }).then(res => {
            //     return res.data.ResultOnDb
            //   })
            break
          }
          case 4: {
            //  4	SCT Selection
            yieldRateGoStraightRateTotal =
              await YieldRateGoStraightRateTotalForSctServices.getByProductTypeIdAndFiscalYearAndRevisionNo({
                FISCAL_YEAR: sctData.FISCAL_YEAR,
                PRODUCT_TYPE_ID: sctData.PRODUCT_TYPE_ID,
                REVISION_NO:
                  listSctMasterDataHistory.find(
                    item => item.SCT_MASTER_DATA_SETTING_ID == 5 && item.IS_FROM_SCT_COPY == 0
                  )?.VERSION_NO ?? 0
              })
                .then(res => {
                  return res.data.ResultOnDb?.[0]
                })
                .catch(() => {
                  setIsOpenModal(false)
                  toast.error(
                    `Yield Rate & Go Straight Rate not found for SCT ID: ${rowSelected?.original.SCT_ID}. Please check your data.`,
                    { autoClose: 10000 }
                  )
                })

            // listYieldRateGoStraightRateProcessForSct =
            //   await YieldRateGoStraightRateProcessForSctServices.getByProductTypeIdAndFiscalYearAndRevisionNo({
            //     FISCAL_YEAR: sctData.FISCAL_YEAR,
            //     PRODUCT_TYPE_ID: sctData.PRODUCT_TYPE_ID,
            //     REVISION_NO:
            //       listSctMasterDataHistory.find(
            //         item => item.SCT_MASTER_DATA_SETTING_ID == 5 && item.IS_FROM_SCT_COPY == 1
            //       )?.VERSION_NO ?? 0
            //   }).then(res => {
            //     return res.data.ResultOnDb
            //   })
            break
          }
          default: {
            setIsOpenModal(false)
            toast.error(
              `Yield Rate & Go Straight Rate not found for SCT ID: ${rowSelected?.original.SCT_ID}. Please check your data.`,
              { autoClose: 10000 }
            )
            break
          }
        }
      }

      //#endregion Yield Rate & Go Straight Rate

      // ??? 6	Clear Time
      //#region Clear Time
      if (isCalculationAlready) {
        clearTimeForSctTotal = await ClearTimeTotalForSctServices.getByProductTypeIdAndFiscalYearAndRevisionNo({
          FISCAL_YEAR: sctData.FISCAL_YEAR,
          PRODUCT_TYPE_ID: sctData.PRODUCT_TYPE_ID,
          REVISION_NO:
            listSctMasterDataHistory.find(item => item.SCT_MASTER_DATA_SETTING_ID == 6 && item.IS_FROM_SCT_COPY == 0)
              ?.VERSION_NO ?? 0
        })
          .then(res => {
            return res.data.ResultOnDb?.[0]
          })
          .catch(() => {
            setIsOpenModal(false)
            toast.error(`Clear Time not found for SCT ID: ${rowSelected?.original.SCT_ID}. Please check your data.`, {
              autoClose: 10000
            })
          })
      } else {
        switch (
          listSctComponentTypeResourceOptionSelect.find(item => item.SCT_COMPONENT_TYPE_ID == 6)?.SCT_RESOURCE_OPTION_ID
        ) {
          case 1: {
            // Master Data (Latest)
            clearTimeForSctTotal = await ClearTimeTotalForSctServices.getByProductTypeIdAndFiscalYear_MasterDataLatest({
              FISCAL_YEAR: sctData.FISCAL_YEAR,
              PRODUCT_TYPE_ID: sctData.PRODUCT_TYPE_ID
            })
              .then(res => {
                console.log(res.data.ResultOnDb?.[0])

                return res.data.ResultOnDb?.[0]
              })
              .catch(() => {
                setIsOpenModal(false)
                toast.error(
                  `Clear Time not found for SCT ID: ${rowSelected?.original.SCT_ID}. Please check your data.`,
                  {
                    autoClose: 10000
                  }
                )
              })

            // listClearTimeForSctProcess =
            //   await ClearTimeProcessForSctServices.getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest({
            //     FISCAL_YEAR: sctData.FISCAL_YEAR,
            //     PRODUCT_TYPE_ID: sctData.PRODUCT_TYPE_ID
            //   }).then(res => {
            //     return res.data.ResultOnDb
            //   })
            break
          }
          case 2: {
            // 2	Revision Master Data
            clearTimeForSctTotal = await ClearTimeTotalForSctServices.getByProductTypeIdAndFiscalYearAndRevisionNo({
              FISCAL_YEAR: sctData.FISCAL_YEAR,
              PRODUCT_TYPE_ID: sctData.PRODUCT_TYPE_ID,
              REVISION_NO:
                listSctMasterDataHistory.find(
                  item => item.SCT_MASTER_DATA_SETTING_ID == 6 && item.IS_FROM_SCT_COPY == 0
                )?.VERSION_NO ?? 0
            })
              .then(res => {
                return res.data.ResultOnDb?.[0]
              })
              .catch(() => {
                setIsOpenModal(false)
                toast.error(
                  `Clear Time not found for SCT ID: ${rowSelected?.original.SCT_ID}. Please check your data.`,
                  {
                    autoClose: 10000
                  }
                )
              })

            // listClearTimeForSctProcess =
            //   await ClearTimeProcessForSctServices.getByProductTypeIdAndFiscalYearAndRevisionNo({
            //     FISCAL_YEAR: sctData.FISCAL_YEAR,
            //     PRODUCT_TYPE_ID: sctData.PRODUCT_TYPE_ID,
            //     REVISION_NO:
            //       listSctMasterDataHistory.find(
            //         item => item.SCT_MASTER_DATA_SETTING_ID == 6 && item.IS_FROM_SCT_COPY == 0
            //       )?.VERSION_NO ?? 0
            //   }).then(res => {
            //     return res.data.ResultOnDb
            //   })
            break
          }
          case 4: {
            //  4	SCT Selection
            clearTimeForSctTotal = await ClearTimeTotalForSctServices.getByProductTypeIdAndFiscalYearAndRevisionNo({
              FISCAL_YEAR: sctData.FISCAL_YEAR,
              PRODUCT_TYPE_ID: sctData.PRODUCT_TYPE_ID,
              REVISION_NO:
                listSctMasterDataHistory.find(
                  item => item.SCT_MASTER_DATA_SETTING_ID == 6 && item.IS_FROM_SCT_COPY == 0
                )?.VERSION_NO ?? 0
            })
              .then(res => {
                return res.data.ResultOnDb?.[0]
              })
              .catch(() => {
                setIsOpenModal(false)
                toast.error(
                  `Clear Time not found for SCT ID: ${rowSelected?.original.SCT_ID}. Please check your data.`,
                  {
                    autoClose: 10000
                  }
                )
              })

            // listClearTimeForSctProcess =
            //   await ClearTimeProcessForSctServices.getByProductTypeIdAndFiscalYearAndRevisionNo({
            //     FISCAL_YEAR: sctData.FISCAL_YEAR,
            //     PRODUCT_TYPE_ID: sctData.PRODUCT_TYPE_ID,
            //     REVISION_NO:
            //       listSctMasterDataHistory.find(
            //         item => item.SCT_MASTER_DATA_SETTING_ID == 6 && item.IS_FROM_SCT_COPY == 1
            //       )?.VERSION_NO ?? 0
            //   }).then(res => {
            //     return res.data.ResultOnDb
            //   })
            break
          }
          default: {
            setIsOpenModal(false)
            toast.error(
              `Yield Rate & Go Straight Rate not found for SCT ID: ${rowSelected?.original.SCT_ID}. Please check your data.`,
              { autoClose: 10000 }
            )
            break
          }
        }
      }

      //#endregion Clear Time

      // ??? 7 , 8 Manufacturing Item Price , Yield Rate Material

      listSctBomFlowProcessItemUsagePrice = await SctBomFlowProcessItemUsagePriceServices.getBySctId({
        SCT_ID: sctData.SCT_ID
      })
        .then(res => {
          return res.data.ResultOnDb
        })
        .catch(() => {
          setIsOpenModal(false)
          toast.error(
            `BOM Flow Process Item Usage Price not found for SCT ID: ${rowSelected?.original.SCT_ID}. Please check your data.`,
            { autoClose: 10000 }
          )
        })

      listSctBomFlowProcessItemUsagePriceAdjust = await SctBomFlowProcessItemUsagePriceAdjustServices.getBySctId({
        SCT_ID: sctData.SCT_ID
      })
        .then(res => {
          return res.data.ResultOnDb
        })
        .catch(() => {
          setIsOpenModal(false)
          toast.error(
            `BOM Flow Process Item Usage Price Adjust not found for SCT ID: ${rowSelected?.original.SCT_ID}. Please check your data.`,
            { autoClose: 10000 }
          )
        })
      // ? Fetch Import Fee Rate
      //#region Import Fee Rate
      importFeeRate = await ImportFeeServices.getByFiscalYear_MasterDataLatest({
        FISCAL_YEAR: sctData.FISCAL_YEAR
      })
        .then(res => {
          return res?.data?.ResultOnDb?.[0]
        })
        .catch(() => {
          setIsOpenModal(false)
          toast.error(`Import Fee not found for SCT ID: ${rowSelected?.original.SCT_ID}. Please check your data.`, {
            autoClose: 10000
          })
        })
      //#endregion Import Fee Rate

      return {
        mode,
        isCalculationAlready,
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
            ITEM_CATEGORY_ID: Number(sctData.ITEM_CATEGORY_ID),
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
        sctComPareNo1: {
          sctCompareNo: 1,
          SCT_ID: sctCompareNo1?.SCT_ID,
          sctRevisionCode: sctCompareNo1?.SCT_REVISION_CODE,
          bom: {
            BOM_ID: sctCompareNo1?.BOM_ID,
            BOM_CODE: sctCompareNo1?.BOM_CODE,
            BOM_NAME: sctCompareNo1?.BOM_NAME,
            FLOW_ID: sctCompareNo1?.FLOW_ID,
            FLOW_CODE: sctCompareNo1?.FLOW_CODE,
            FLOW_NAME: sctCompareNo1?.FLOW_NAME,
            TOTAL_COUNT_PROCESS: sctCompareNo1?.TOTAL_COUNT_PROCESS
          },
          isDefaultExportCompare: sctCompareNo1?.IS_DEFAULT_EXPORT_COMPARE
        },
        sctComPareNo2: {
          sctCompareNo: 2,
          SCT_ID: sctCompareNo2?.SCT_ID,
          sctRevisionCode: sctCompareNo2?.SCT_REVISION_CODE,
          bom: {
            BOM_ID: sctCompareNo2?.BOM_ID,
            BOM_CODE: sctCompareNo2?.BOM_CODE,
            BOM_NAME: sctCompareNo2?.BOM_NAME,
            FLOW_ID: sctCompareNo2?.FLOW_ID,
            FLOW_CODE: sctCompareNo2?.FLOW_CODE,
            FLOW_NAME: sctCompareNo2?.FLOW_NAME,
            TOTAL_COUNT_PROCESS: sctCompareNo2?.TOTAL_COUNT_PROCESS
          },
          isDefaultExportCompare: sctCompareNo2?.IS_DEFAULT_EXPORT_COMPARE
        },
        directCost: {
          flowProcess: {
            // header: {
            //   bomCode: sctData.BOM_CODE,
            //   bomName: sctData.BOM_NAME,
            //   flowCode: sctData.FLOW_CODE,
            //   flowName: sctData.FLOW_NAME,
            // },
            total: {
              main: {
                totalCountProcess: sctData.TOTAL_COUNT_PROCESS,
                yieldRateAndGoStraightRate: {
                  fiscalYear: yieldRateGoStraightRateTotal.FISCAL_YEAR,
                  revisionNo: yieldRateGoStraightRateTotal.REVISION_NO,
                  totalYieldRate: yieldRateGoStraightRateTotal.TOTAL_YIELD_RATE_FOR_SCT,
                  totalGoStraightRate: yieldRateGoStraightRateTotal.TOTAL_GO_STRAIGHT_RATE_FOR_SCT,
                  flowId: yieldRateGoStraightRateTotal.FLOW_ID,
                  flowCode: yieldRateGoStraightRateTotal.FLOW_CODE,
                  flowName: yieldRateGoStraightRateTotal.FLOW_NAME
                },
                clearTime: {
                  fiscalYear: clearTimeForSctTotal.FISCAL_YEAR,
                  revisionNo: clearTimeForSctTotal.REVISION_NO,
                  flowId: clearTimeForSctTotal.FLOW_ID,
                  flowCode: clearTimeForSctTotal.FLOW_CODE,
                  flowName: clearTimeForSctTotal.FLOW_NAME,
                  totalClearTime: clearTimeForSctTotal.TOTAL_CLEAR_TIME_FOR_SCT
                }
                // fiscalYearYieldRateAndGoStraightRate: yieldRateGoStraightRateTotal.FISCAL_YEAR,
                // revisionNoYieldRateAndGoStraightRate: yieldRateGoStraightRateTotal.REVISION_NO,
                // totalYieldRate: yieldRateGoStraightRateTotal.TOTAL_YIELD_RATE_FOR_SCT,
                //totalGoStraightRate: yieldRateGoStraightRateTotal.TOTAL_GO_STRAIGHT_RATE_FOR_SCT,
                // totalClearTime: clearTimeForSctTotal.TOTAL_CLEAR_TIME_FOR_SCT,
                // fiscalYearClearTime: clearTimeForSctTotal.FISCAL_YEAR,
                // revisionNoClearTime: clearTimeForSctTotal.REVISION_NO
              }
            },
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
              directCostCondition: {
                directUnitProcessCost: directCostCondition?.DIRECT_UNIT_PROCESS_COST ?? 0,
                indirectRateOfDirectProcessCost: directCostCondition?.INDIRECT_RATE_OF_DIRECT_PROCESS_COST ?? 0,
                FISCAL_YEAR: directCostCondition?.FISCAL_YEAR ?? 0,
                VERSION: directCostCondition?.VERSION ?? 0
              },
              indirectCostCondition: {
                labor: inDirectCostCondition.LABOR,
                depreciation: inDirectCostCondition.DEPRECIATION,
                otherExpense: inDirectCostCondition.OTHER_EXPENSE,
                totalIndirectCost: inDirectCostCondition.TOTAL_INDIRECT_COST,
                FISCAL_YEAR: inDirectCostCondition.FISCAL_YEAR,
                VERSION: inDirectCostCondition.VERSION
              },
              otherCostCondition: {
                ga: otherCostCondition.GA,
                margin: otherCostCondition.MARGIN,
                sellingExpense: otherCostCondition.SELLING_EXPENSE,
                vat: otherCostCondition.VAT,
                cit: otherCostCondition.CIT,
                FISCAL_YEAR: otherCostCondition.FISCAL_YEAR,
                VERSION: otherCostCondition.VERSION
              },
              specialCostCondition: {
                adjustPrice: specialCostCondition?.ADJUST_PRICE,
                FISCAL_YEAR: specialCostCondition?.FISCAL_YEAR,
                VERSION: specialCostCondition?.VERSION
              },
              importFeeRate: {
                importFeeRate: importFeeRate?.IMPORT_FEE_RATE,
                FISCAL_YEAR: importFeeRate?.FISCAL_YEAR,
                VERSION: importFeeRate?.VERSION
              }
            }
          }
        },
        masterDataSelection: {
          directCostCondition: {
            SCT_COMPONENT_TYPE_ID: 1,
            SCT_RESOURCE_OPTION_ID:
              listSctComponentTypeResourceOptionSelect.find(item => item.SCT_COMPONENT_TYPE_ID === 1)
                ?.SCT_RESOURCE_OPTION_ID ?? 0
          },
          indirectCostCondition: {
            SCT_COMPONENT_TYPE_ID: 2,
            SCT_RESOURCE_OPTION_ID:
              listSctComponentTypeResourceOptionSelect.find(item => item.SCT_COMPONENT_TYPE_ID === 2)
                ?.SCT_RESOURCE_OPTION_ID ?? 0
          },
          otherCostCondition: {
            SCT_COMPONENT_TYPE_ID: 3,
            SCT_RESOURCE_OPTION_ID:
              listSctComponentTypeResourceOptionSelect.find(item => item.SCT_COMPONENT_TYPE_ID === 3)
                ?.SCT_RESOURCE_OPTION_ID ?? 0
          },
          specialCostCondition: {
            SCT_COMPONENT_TYPE_ID: 4,
            SCT_RESOURCE_OPTION_ID:
              listSctComponentTypeResourceOptionSelect.find(item => item.SCT_COMPONENT_TYPE_ID === 4)
                ?.SCT_RESOURCE_OPTION_ID ?? 0
          },
          yieldRateAndGoStraightRate: {
            SCT_COMPONENT_TYPE_ID: 5,
            SCT_RESOURCE_OPTION_ID:
              listSctComponentTypeResourceOptionSelect.find(item => item.SCT_COMPONENT_TYPE_ID === 5)
                ?.SCT_RESOURCE_OPTION_ID ?? 0
          },
          clearTime: {
            SCT_COMPONENT_TYPE_ID: 6,
            SCT_RESOURCE_OPTION_ID:
              listSctComponentTypeResourceOptionSelect.find(item => item.SCT_COMPONENT_TYPE_ID === 6)
                ?.SCT_RESOURCE_OPTION_ID ?? 0
          },
          manufacturingItemPrice: {
            SCT_COMPONENT_TYPE_ID: 7,
            SCT_RESOURCE_OPTION_ID:
              listSctComponentTypeResourceOptionSelect.find(item => item.SCT_COMPONENT_TYPE_ID === 7)
                ?.SCT_RESOURCE_OPTION_ID ?? 0
          },
          yieldRateMaterial: {
            SCT_COMPONENT_TYPE_ID: 8,
            SCT_RESOURCE_OPTION_ID:
              listSctComponentTypeResourceOptionSelect.find(item => item.SCT_COMPONENT_TYPE_ID === 8)
                ?.SCT_RESOURCE_OPTION_ID ?? 0
          }
        },
        adjust: {
          indirectCostCondition: {
            totalIndirectCost: {
              isAdjust: is_Null_Undefined_Blank(
                sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.TOTAL_INDIRECT_COST
              )
                ? false
                : true,
              isDisabledInput: true,
              dataFrom:
                sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)
                  ?.TOTAL_INDIRECT_COST_SCT_RESOURCE_OPTION_ID == 1
                  ? 1
                  : sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)
                        ?.TOTAL_INDIRECT_COST_SCT_RESOURCE_OPTION_ID == 4
                    ? 4
                    : is_Null_Undefined_Blank(
                          sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.TOTAL_INDIRECT_COST
                        )
                      ? null
                      : 5
            }
          },
          otherCostCondition: {
            cit: {
              isAdjust: is_Null_Undefined_Blank(sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.CIT)
                ? false
                : true,
              isDisabledInput: true,
              dataFrom:
                sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.CIT_SCT_RESOURCE_OPTION_ID == 1
                  ? 1
                  : sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.CIT_SCT_RESOURCE_OPTION_ID == 4
                    ? 4
                    : is_Null_Undefined_Blank(sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.CIT)
                      ? null
                      : 5
            },
            ga: {
              isAdjust: is_Null_Undefined_Blank(sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.GA)
                ? false
                : true,
              isDisabledInput: true,
              dataFrom:
                sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.GA_SCT_RESOURCE_OPTION_ID == 1
                  ? 1
                  : sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.GA_SCT_RESOURCE_OPTION_ID == 4
                    ? 4
                    : is_Null_Undefined_Blank(sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.GA)
                      ? null
                      : 5
            },
            vat: {
              isAdjust: is_Null_Undefined_Blank(sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.VAT)
                ? false
                : true,
              isDisabledInput: true,
              dataFrom:
                sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.VAT_SCT_RESOURCE_OPTION_ID == 1
                  ? 1
                  : sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.VAT_SCT_RESOURCE_OPTION_ID == 4
                    ? 4
                    : is_Null_Undefined_Blank(sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.VAT)
                      ? null
                      : 5
            },
            margin: {
              isAdjust: is_Null_Undefined_Blank(sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.MARGIN)
                ? false
                : true,
              isDisabledInput: true,
              dataFrom:
                sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.MARGIN_SCT_RESOURCE_OPTION_ID == 1
                  ? 1
                  : sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.MARGIN_SCT_RESOURCE_OPTION_ID == 4
                    ? 4
                    : is_Null_Undefined_Blank(sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.MARGIN)
                      ? null
                      : 5
            },
            sellingExpense: {
              isAdjust: is_Null_Undefined_Blank(
                sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.SELLING_EXPENSE
              )
                ? false
                : true,
              isDisabledInput: true,
              dataFrom:
                sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.SELLING_EXPENSE_SCT_RESOURCE_OPTION_ID == 1
                  ? 1
                  : sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)
                        ?.SELLING_EXPENSE_SCT_RESOURCE_OPTION_ID == 4
                    ? 4
                    : is_Null_Undefined_Blank(
                          sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.SELLING_EXPENSE
                        )
                      ? null
                      : 5
            }
          },
          specialCostCondition: {
            adjustPrice: {
              isAdjust: is_Null_Undefined_Blank(
                sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.ADJUST_PRICE
              )
                ? false
                : true,
              isDisabledInput: true,
              dataFrom:
                sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.ADJUST_PRICE_SCT_RESOURCE_OPTION_ID == 1
                  ? 1
                  : sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.ADJUST_PRICE_SCT_RESOURCE_OPTION_ID ==
                      4
                    ? 4
                    : is_Null_Undefined_Blank(sctDetailForAdjust.find(item => item.IS_FROM_SCT_COPY == 0)?.ADJUST_PRICE)
                      ? null
                      : 5
            }
          },
          remarkForAdjustPrice: ''
        }
        // sctDetailForAdjust: {
        //   indirectCostCondition: {
        //     totalIndirectCost: {
        //       isAdjust: false,
        //       isDisabledInput: true
        //     }
        //   },
        //   otherCostCondition: {
        //     cit: {
        //       isAdjust: false,
        //       isDisabledInput: true
        //     },
        //     ga: {
        //       isAdjust: false,
        //       isDisabledInput: true
        //     },
        //     margin: {
        //       isAdjust: false,
        //       isDisabledInput: true
        //     },
        //     sellingExpense: {
        //       isAdjust: false,
        //       isDisabledInput: true
        //     },
        //     vat: {
        //       isAdjust: false,
        //       isDisabledInput: true
        //     }
        //   },
        //   specialCostCondition: {
        //     adjustPrice: {
        //       isAdjust: false,
        //       isDisabledInput: true
        //     }
        //   },
        //   remarkForAdjustPrice: ''
        // }
      }
    }
    // defaultValues: async (): Promise<FormDataPage> => {
    //   const sctData = await StandardCostForProductServices.getSctDataDetail({
    //     SCT_ID: rowSelected?.original.SCT_ID
    //   })

    //   const data = sctData.data.ResultOnDb[0]

    //   // Realtime Data
    //   // 1	Preparing
    //   // 2	Prepared
    //   if (rowSelected?.original.SCT_STATUS_PROGRESS_NO < 3 && !rowSelected?.original.SELLING_PRICE) {
    //     // Option Selection

    //     const sctDataOptionSelection = (await StandardCostForProductServices.getSctDataOptionSelection({
    //       SCT_ID: rowSelected?.original.SCT_ID
    //     })) as {
    //       data: {
    //         Status: boolean
    //         Message: string
    //         MethodOnDb: string
    //         ResultOnDb: {
    //           SCT_COMPONENT_TYPE_ID: number
    //           SCT_ID: string
    //           SCT_ID_SELECTION: string
    //           SCT_RESOURCE_OPTION_ID: number
    //           SCT_STATUS_PROGRESS_ID_SELECTION: number
    //         }[]
    //         TotalCountOnDb: number
    //       }
    //     }

    //     console.log(sctDataOptionSelection)

    //     // Flow Process
    //     const sctDataFlowProcess = await StandardCostForProductServices.getSctDataFlowProcess({
    //       SCT_ID: rowSelected?.original.SCT_ID
    //     })

    //     // Material
    //     const sctDataMaterial = await StandardCostForProductServices.getSctDataMaterial({
    //       SCT_ID: rowSelected?.original.SCT_ID
    //     })

    //     const resourceOption = [
    //       'COST_CONDITION',
    //       'YR_GR_FROM_ENGINEER',
    //       'TIME_FROM_MFG',
    //       'MATERIAL_PRICE',
    //       'YR_ACCUMULATION_MATERIAL_FROM_ENGINEER'
    //     ]

    //     let sctOptionSelection = {}
    //     let sctCompareNo1 = null
    //     let sctCompareNo2 = null
    //     let sctCompareNo1Data
    //     let sctCompareNo2Data
    //     let isDefaultExportCompareNo1
    //     let isDefaultExportCompareNo2

    //     let costConditionData = {}
    //     let yrGrData
    //     let timeData
    //     let materialPriceData
    //     let yieldMaterialData
    //     let yrGrSelection = null
    //     let timeSelection = null

    //     const sctMasterDataHistory = (await SctMasterDataHistoryServices.getBySctIdAndIsFromSctCopy({
    //       SCT_ID: rowSelected?.original.SCT_ID
    //     })) as {
    //       data: {
    //         Status: boolean
    //         Message: string
    //         MethodOnDb: string
    //         ResultOnDb: {
    //           SCT_ID: string
    //           FISCAL_YEAR: number
    //           VERSION_NO: number
    //           IS_FROM_SCT_COPY: 0 | 1
    //         }[]
    //         TotalCountOnDb: number
    //       }
    //     }

    //     // list - SCT_COMPONENT_TYPE_ID	SCT_COMPONENT_TYPE_NAME
    //     // 1	Direct Cost Condition
    //     // 2	Indirect Cost Condition
    //     // 3	Other Cost Condition
    //     // 4	Special Cost Condition
    //     // 5	Yield Rate & Go Straight Rate
    //     // 6	Clear Time
    //     // 7	Manufacturing Item Price
    //     // 8	Yield Rate Material

    //     // list - SCT_RESOURCE_OPTION_ID	SCT_RESOURCE_OPTION_NAME
    //     // 1	Master Data (Latest)
    //     // 2	Revision Master Data
    //     // 3	SCT (Latest)
    //     // 4	SCT Selection
    //     // 5	Manual Input

    //     let directCostCondition: {
    //       FISCAL_YEAR: number
    //       VERSION_NO: number
    //       IS_FROM_SCT_COPY: 0 | 1
    //       VALUE: number | null
    //     }

    //     for (let i = 0; i < sctDataOptionSelection.data.ResultOnDb.length; i++) {
    //       const dataOption = sctDataOptionSelection.data.ResultOnDb[i]

    //       switch (dataOption.SCT_COMPONENT_TYPE_ID) {
    //         case 1: {
    //           // Direct Cost Condition
    //           // Master data

    //           if (rowSelected?.original.SELLING_PRICE) {
    //           } else {
    //             switch (dataOption.SCT_RESOURCE_OPTION_ID) {
    //               case 1:
    //                 {
    //                   // Master Data (Latest)
    //                 }
    //                 break
    //               case 3: {
    //                 // SCT Selection

    //                 const directCostConditionVersion = sctMasterDataHistory.data.ResultOnDb.filter(
    //                   x => x.SCT_ID == rowSelected?.original.SCT_ID
    //                 )

    //                 directCostCondition = {
    //                   ...directCostConditionVersion[0],
    //                   VALUE: null
    //                 }

    //                 break
    //               }
    //               case 2: {
    //                 // Revision Master Data

    //                 break
    //               }
    //               default:
    //                 throw new Error('Master Data Selection is required')
    //                 break
    //             }
    //           }

    //           if (dataOption.SCT_RESOURCE_OPTION_ID === 4) {
    //             // sctOptionSelection[resourceOption[0]] = dataOption.SCT_RESOURCE_OPTION_ID
    //             // sctOptionSelection[`${resourceOption[0]}_RESOURCE_OPTION_ID`] = dataOption.SCT_RESOURCE_OPTION_ID

    //             costConditionData = await _CostConditionServices.getAllByProductMainIdAndFiscalYear_MasterDataLatest({
    //               FISCAL_YEAR: data.FISCAL_YEAR,
    //               PRODUCT_TYPE_ID: data.PRODUCT_TYPE_ID,
    //               PRODUCT_MAIN_ID: data.PRODUCT_MAIN_ID,
    //               PRODUCT_MAIN_NAME: data.PRODUCT_MAIN_NAME,
    //               ITEM_CATEGORY_NAME: data.ITEM_CATEGORY_NAME
    //             })

    //             console.log(costConditionData)
    //           } else if (dataOption.SCT_RESOURCE_OPTION_ID === 4) {
    //             // SCT (select)
    //             if ([2, 3, 5].includes(dataOption.SCT_STATUS_PROGRESS_ID_SELECTION)) {
    //               // Preparing
    //               // Prepared
    //               // Checking
    //               // ! Adjust Data in below
    //               costConditionData = await _CostConditionServices.getAllByProductMainIdAndFiscalYear_MasterDataLatest({
    //                 FISCAL_YEAR: data.FISCAL_YEAR,
    //                 PRODUCT_TYPE_ID: data.PRODUCT_TYPE_ID,
    //                 PRODUCT_MAIN_ID: data.PRODUCT_MAIN_ID,
    //                 PRODUCT_MAIN_NAME: data.PRODUCT_MAIN_NAME,
    //                 ITEM_CATEGORY_NAME: data.ITEM_CATEGORY_NAME
    //               })
    //             } else if ([1, 4, 6, 7].includes(dataOption.SCT_RESOURCE_OPTION_ID)) {
    //               // Cancelled
    //               // Completed
    //               // Waiting Approve
    //               // Can use
    //               costConditionData = await _CostConditionServices.getAllByProductMainIdAndFiscalYear_MasterDataLatest({
    //                 FISCAL_YEAR: data.FISCAL_YEAR,
    //                 PRODUCT_TYPE_ID: data.PRODUCT_TYPE_ID,
    //                 PRODUCT_MAIN_ID: data.PRODUCT_MAIN_ID,
    //                 PRODUCT_MAIN_NAME: data.PRODUCT_MAIN_NAME,
    //                 ITEM_CATEGORY_NAME: data.ITEM_CATEGORY_NAME
    //               })
    //             } else {
    //               throw new Error('Invalid SCT_RESOURCE_OPTION_ID')
    //             }
    //             // sctOptionSelection[resourceOption[0]] = dataOption.SCT_RESOURCE_OPTION_ID
    //             // sctOptionSelection[`${resourceOption[0]}_RESOURCE_OPTION_ID`] = dataOption.SCT_RESOURCE_OPTION_ID
    //           }

    //           // if (dataOption.SCT_RESOURCE_OPTION_ID === 2) {
    //           //   sctOptionSelection[resourceOption[0]] = dataOption.SCT_RESOURCE_OPTION_ID
    //           //   sctOptionSelection[`${resourceOption[0]}_RESOURCE_OPTION_ID`] = dataOption.SCT_RESOURCE_OPTION_ID

    //           //   costConditionData = await StandardCostForProductServices.getCostConditionData({
    //           //     RESOURCE_OPTION_ID: dataOption.SCT_RESOURCE_OPTION_ID,
    //           //     SCT_ID: data.SCT_ID
    //           //   })
    //           // }
    //           break

    //           // case 2:
    //           //   if (dataOption.SCT_RESOURCE_OPTION_ID === 1 || dataOption.SCT_RESOURCE_OPTION_ID === 3) {
    //           //     sctOptionSelection[resourceOption[3]] = dataOption.SCT_RESOURCE_OPTION_ID
    //           //     sctOptionSelection[`${resourceOption[3]}_RESOURCE_OPTION_ID`] = dataOption.SCT_RESOURCE_OPTION_ID

    //           //     materialPriceData = await StandardCostForProductServices.getMaterialPriceData({
    //           //       RESOURCE_OPTION_ID: dataOption.SCT_RESOURCE_OPTION_ID,
    //           //       FISCAL_YEAR: data.SCT_PATTERN_ID === 1 ? Number(data.FISCAL_YEAR) - 1 : Number(data.FISCAL_YEAR),
    //           //       SCT_ID: data.SCT_ID,
    //           //       PRODUCT_TYPE_ID: data.PRODUCT_TYPE_ID
    //           //     })
    //           //   }

    //           //   if (dataOption.SCT_RESOURCE_OPTION_ID === 2) {
    //           //     sctOptionSelection[resourceOption[3]] = dataOption.SCT_RESOURCE_OPTION_ID
    //           //     sctOptionSelection[`${resourceOption[3]}_RESOURCE_OPTION_ID`] = dataOption.SCT_RESOURCE_OPTION_ID

    //           //     //const fiscalYear = JSON.parse(dataOption.RESOURCE_OPTION_DESCRIPTION)

    //           //     materialPriceData = await StandardCostForProductServices.getMaterialPriceData({
    //           //       RESOURCE_OPTION_ID: dataOption.SCT_RESOURCE_OPTION_ID,
    //           //       SCT_ID: data.SCT_ID
    //           //     })
    //           //   }

    //           //   break

    //           // case 3:
    //           //   if (dataOption.SCT_RESOURCE_OPTION_ID === 1 || dataOption.SCT_RESOURCE_OPTION_ID === 3) {
    //           //     sctOptionSelection[resourceOption[1]] = dataOption.SCT_RESOURCE_OPTION_ID
    //           //     sctOptionSelection[`${resourceOption[1]}_RESOURCE_OPTION_ID`] = dataOption.SCT_RESOURCE_OPTION_ID

    //           //     yrGrData = await StandardCostForProductServices.getYrGrData({
    //           //       RESOURCE_OPTION_ID: dataOption.SCT_RESOURCE_OPTION_ID,
    //           //       FISCAL_YEAR: data.FISCAL_YEAR,
    //           //       PRODUCT_TYPE_ID: data.PRODUCT_TYPE_ID,
    //           //       SCT_REASON_SETTING_ID: data.SCT_REASON_SETTING_ID,
    //           //       SCT_TAG_SETTING_ID: data?.SCT_TAG_SETTING_ID ?? null,
    //           //       BOM_ID: data.BOM_ID
    //           //     })
    //           //   }

    //           //   if (dataOption.SCT_RESOURCE_OPTION_ID === 2) {
    //           //     sctOptionSelection[resourceOption[1]] = dataOption.SCT_RESOURCE_OPTION_ID
    //           //     sctOptionSelection[`${resourceOption[1]}_RESOURCE_OPTION_ID`] = dataOption.SCT_RESOURCE_OPTION_ID

    //           //     //const fiscalYear = JSON.parse(dataOption.RESOURCE_OPTION_DESCRIPTION)

    //           //     yrGrData = await StandardCostForProductServices.getYrGrData({
    //           //       RESOURCE_OPTION_ID: dataOption.SCT_RESOURCE_OPTION_ID,
    //           //       SCT_ID: data.SCT_ID
    //           //     })
    //           //   }

    //           //   if (dataOption.SCT_RESOURCE_OPTION_ID == 4) {
    //           //     sctOptionSelection[resourceOption[1]] = dataOption.SCT_RESOURCE_OPTION_ID
    //           //     sctOptionSelection[`${resourceOption[1]}_RESOURCE_OPTION_ID`] = dataOption.SCT_RESOURCE_OPTION_ID

    //           //     yrGrSelection = {
    //           //       value: dataOption.RESOURCE_OPTION_DESCRIPTION,
    //           //       label: `${dataOption.YR_GR_FISCAL_YEAR} / ${dataOption.YR_GR_REVISION_NO}`
    //           //     }

    //           //     //const fiscalYear = JSON.parse(dataOption.RESOURCE_OPTION_DESCRIPTION)

    //           //     yrGrData = await StandardCostForProductServices.getYrGrData({
    //           //       RESOURCE_OPTION_ID: dataOption.SCT_RESOURCE_OPTION_ID,
    //           //       SCT_ID: data.SCT_ID
    //           //     })
    //           //   }
    //           //   break
    //           // case 4:
    //           //   if (dataOption.SCT_RESOURCE_OPTION_ID === 1 || dataOption.SCT_RESOURCE_OPTION_ID === 3) {
    //           //     sctOptionSelection[resourceOption[2]] = dataOption.SCT_RESOURCE_OPTION_ID
    //           //     sctOptionSelection[`${resourceOption[2]}_RESOURCE_OPTION_ID`] = dataOption.SCT_RESOURCE_OPTION_ID

    //           //     timeData = await StandardCostForProductServices.getTimeData({
    //           //       RESOURCE_OPTION_ID: dataOption.SCT_RESOURCE_OPTION_ID,
    //           //       FISCAL_YEAR: data.FISCAL_YEAR,
    //           //       PRODUCT_TYPE_ID: data.PRODUCT_TYPE_ID,
    //           //       SCT_REASON_SETTING_ID: data.SCT_REASON_SETTING_ID ?? '',
    //           //       SCT_TAG_SETTING_ID: data?.SCT_TAG_SETTING_ID ?? null,
    //           //       BOM_ID: data.BOM_ID
    //           //     })
    //           //   }

    //           //   if (dataOption.SCT_RESOURCE_OPTION_ID === 2) {
    //           //     sctOptionSelection[resourceOption[2]] = dataOption.SCT_RESOURCE_OPTION_ID
    //           //     sctOptionSelection[`${resourceOption[2]}_RESOURCE_OPTION_ID`] = dataOption.SCT_RESOURCE_OPTION_ID

    //           //     //const fiscalYear = JSON.parse(dataOption.RESOURCE_OPTION_DESCRIPTION)

    //           //     timeData = await StandardCostForProductServices.getTimeData({
    //           //       RESOURCE_OPTION_ID: dataOption.SCT_RESOURCE_OPTION_ID,
    //           //       SCT_ID: data.SCT_ID
    //           //     })
    //           //   }

    //           //   if (dataOption.SCT_RESOURCE_OPTION_ID == 4) {
    //           //     sctOptionSelection[resourceOption[2]] = dataOption.SCT_RESOURCE_OPTION_ID
    //           //     sctOptionSelection[`${resourceOption[2]}_RESOURCE_OPTION_ID`] = dataOption.SCT_RESOURCE_OPTION_ID

    //           //     //const fiscalYear = JSON.parse(dataOption.RESOURCE_OPTION_DESCRIPTION)

    //           //     timeSelection = {
    //           //       value: dataOption.RESOURCE_OPTION_DESCRIPTION,
    //           //       label: `${dataOption.CLEAR_TIME_FISCAL_YEAR} / ${dataOption.CLEAR_TIME_REVISION_NO}`
    //           //     }

    //           //     timeData = await StandardCostForProductServices.getTimeData({
    //           //       RESOURCE_OPTION_ID: dataOption.SCT_RESOURCE_OPTION_ID,
    //           //       SCT_ID: data.SCT_ID
    //           //     })
    //           //   }
    //           //   break
    //           // case 5:
    //           //   if (dataOption.SCT_RESOURCE_OPTION_ID === 1 || dataOption.SCT_RESOURCE_OPTION_ID === 3) {
    //           //     sctOptionSelection[resourceOption[4]] = dataOption.SCT_RESOURCE_OPTION_ID
    //           //     sctOptionSelection[`${resourceOption[4]}_RESOURCE_OPTION_ID`] = dataOption.SCT_RESOURCE_OPTION_ID

    //           //     yieldMaterialData = await StandardCostForProductServices.getYrAccumulationMaterialData({
    //           //       RESOURCE_OPTION_ID: dataOption.SCT_RESOURCE_OPTION_ID,
    //           //       FISCAL_YEAR: data.FISCAL_YEAR,
    //           //       PRODUCT_TYPE_ID: data.PRODUCT_TYPE_ID,
    //           //       SCT_REASON_SETTING_ID: data.SCT_REASON_SETTING_ID,
    //           //       SCT_TAG_SETTING_ID: data?.SCT_TAG_SETTING_ID ?? null,
    //           //       BOM_ID: data.BOM_ID
    //           //     })
    //           //   }

    //           //   if (dataOption.SCT_RESOURCE_OPTION_ID === 2) {
    //           //     sctOptionSelection[resourceOption[4]] = dataOption.SCT_RESOURCE_OPTION_ID
    //           //     sctOptionSelection[`${resourceOption[4]}_RESOURCE_OPTION_ID`] = dataOption.SCT_RESOURCE_OPTION_ID

    //           //     //const fiscalYear = JSON.parse(dataOption.RESOURCE_OPTION_DESCRIPTION)

    //           //     yieldMaterialData = await StandardCostForProductServices.getYrAccumulationMaterialData({
    //           //       RESOURCE_OPTION_ID: dataOption.SCT_RESOURCE_OPTION_ID,
    //           //       SCT_ID: data.SCT_ID
    //           //     })
    //           //   }
    //           //   break
    //           // default:
    //           //   break
    //         }
    //       }
    //     }

    //     if (data?.SCT_REVISION_CODE_COMPARE) {
    //       sctCompareNo1 = {
    //         SCT_ID: data.SCT_ID_FOR_COMPARE,
    //         SCT_REVISION_CODE: data.SCT_REVISION_CODE_COMPARE,
    //         BOM_CODE: data.BOM_CODE_COMPARE,
    //         BOM_NAME: data.BOM_NAME_COMPARE,
    //         BOM_ID: data.BOM_ID_COMPARE,
    //         PRODUCT_TYPE_CODE: data.PRODUCT_TYPE_CODE_COMPARE,
    //         FLOW_CODE: data.FLOW_CODE_COMPARE,
    //         TOTAL_COUNT_PROCESS: data.TOTAL_COUNT_PROCESS_COMPARE
    //       }

    //       isDefaultExportCompareNo1 = data.IS_DEFAULT_EXPORT_COMPARE

    //       sctCompareNo1Data = await StandardCostForProductServices.getSctCompareData({
    //         SCT_ID: data.SCT_ID_FOR_COMPARE
    //       })
    //     }

    //     if (sctData.data.ResultOnDb?.[1]?.SCT_REVISION_CODE_COMPARE) {
    //       sctCompareNo2 = {
    //         SCT_ID: sctData.data.ResultOnDb[1].SCT_ID_FOR_COMPARE,
    //         SCT_REVISION_CODE: sctData.data.ResultOnDb[1].SCT_REVISION_CODE_COMPARE,
    //         BOM_CODE: sctData.data.ResultOnDb[1].BOM_CODE_COMPARE,
    //         BOM_NAME: sctData.data.ResultOnDb[1].BOM_NAME_COMPARE,
    //         BOM_ID: sctData.data.ResultOnDb[1].BOM_ID_COMPARE,
    //         PRODUCT_TYPE_CODE: sctData.data.ResultOnDb[1].PRODUCT_TYPE_CODE_COMPARE,
    //         FLOW_CODE: sctData.data.ResultOnDb[1].FLOW_CODE_COMPARE,
    //         TOTAL_COUNT_PROCESS: sctData.data.ResultOnDb[1].TOTAL_COUNT_PROCESS_COMPARE
    //       }

    //       isDefaultExportCompareNo2 = sctData.data.ResultOnDb[1].IS_DEFAULT_EXPORT_COMPARE

    //       sctCompareNo2Data = await StandardCostForProductServices.getSctCompareData({
    //         SCT_ID: sctData.data.ResultOnDb[1].SCT_ID_FOR_COMPARE
    //       })
    //     }

    //     const sctDetailForAdjust = await StandardCostForProductServices.getSctDetailForAdjust({
    //       SCT_ID: data.SCT_ID
    //     })

    //     let adjustPrice = 0
    //     if (!sctDetailForAdjust?.data.ResultOnDb[0]?.ADJUST_PRICE) {
    //       let result = await SpecialCostConditionServices.getAdjustPrice({
    //         PRODUCT_MAIN_ID: data.PRODUCT_MAIN_ID,
    //         FISCAL_YEAR: data.FISCAL_YEAR
    //       })

    //       adjustPrice = result?.data?.ResultOnDb?.[0]?.ADJUST_PRICE ?? 0
    //     }

    //     let indirectCostCondition = costConditionData?.data.ResultOnDb[1]?.[0] ?? {}
    //     let otherCostCondition = costConditionData?.data.ResultOnDb[2]?.[0] ?? {}

    //     indirectCostCondition = {
    //       ...indirectCostCondition,
    //       TOTAL_INDIRECT_COST:
    //         sctDetailForAdjust.data.ResultOnDb[0]?.TOTAL_INDIRECT_COST ?? indirectCostCondition.TOTAL_INDIRECT_COST,
    //       IS_MANUAL_TOTAL_INDIRECT_COST:
    //         sctDetailForAdjust.data.ResultOnDb[0]?.TOTAL_INDIRECT_COST != null &&
    //         sctDetailForAdjust.data.ResultOnDb[0]?.TOTAL_INDIRECT_COST !== undefined
    //     }

    //     otherCostCondition = {
    //       ...otherCostCondition,
    //       // CIT: sctDetailForAdjust.data.ResultOnDb[0]?.CIT,
    //       CIT: sctDetailForAdjust.data.ResultOnDb[0]?.CIT
    //         ? Number(sctDetailForAdjust.data.ResultOnDb[0].CIT)
    //         : Number(otherCostCondition.CIT),
    //       VAT: sctDetailForAdjust.data.ResultOnDb[0]?.VAT
    //         ? sctDetailForAdjust.data.ResultOnDb[0].VAT
    //         : Number(otherCostCondition.VAT),
    //       GA: sctDetailForAdjust.data.ResultOnDb[0]?.GA
    //         ? sctDetailForAdjust.data.ResultOnDb[0].GA
    //         : Number(otherCostCondition.GA),
    //       MARGIN: sctDetailForAdjust.data.ResultOnDb[0]?.MARGIN
    //         ? sctDetailForAdjust.data.ResultOnDb[0].MARGIN
    //         : Number(otherCostCondition.MARGIN),
    //       SELLING_EXPENSE: sctDetailForAdjust.data.ResultOnDb[0]?.SELLING_EXPENSE
    //         ? sctDetailForAdjust.data.ResultOnDb[0].SELLING_EXPENSE
    //         : Number(otherCostCondition.SELLING_EXPENSE),

    //       IS_MANUAL_CIT: sctDetailForAdjust.data.ResultOnDb[0]?.CIT ? true : false,
    //       IS_MANUAL_VAT: sctDetailForAdjust.data.ResultOnDb[0]?.VAT ? true : false,
    //       IS_MANUAL_GA: sctDetailForAdjust.data.ResultOnDb[0]?.GA ? true : false,
    //       IS_MANUAL_MARGIN: sctDetailForAdjust.data.ResultOnDb[0]?.MARGIN ? true : false,
    //       IS_MANUAL_SELLING_EXPENSE: sctDetailForAdjust.data.ResultOnDb[0]?.SELLING_EXPENSE ? true : false
    //     }

    //     return {
    //       mode: mode,
    //       IMPORT_FEE_RATE: data.IMPORT_FEE_RATE,
    //       SCT_ID: data.SCT_ID,
    //       SCT_STATUS_PROGRESS_ID: data.SCT_STATUS_PROGRESS_ID,
    //       SCT_STATUS_PROGRESS: {
    //         SCT_STATUS_PROGRESS_ID: data.SCT_STATUS_PROGRESS_ID,
    //         SCT_STATUS_PROGRESS_NAME: data.SCT_STATUS_PROGRESS_NAME
    //       },
    //       BOM_ID: data.BOM_ID,
    //       TOTAL_COUNT_PROCESS: data.TOTAL_COUNT_PROCESS,
    //       FLOW_CODE: data.FLOW_CODE,
    //       PRODUCT_CATEGORY: {
    //         PRODUCT_CATEGORY_ID: data.PRODUCT_CATEGORY_ID,
    //         PRODUCT_CATEGORY_NAME: data.PRODUCT_CATEGORY_NAME,
    //         PRODUCT_CATEGORY_ALPHABET: data.PRODUCT_CATEGORY_ALPHABET
    //       },
    //       PRODUCT_MAIN: {
    //         PRODUCT_MAIN_ID: data.PRODUCT_MAIN_ID,
    //         PRODUCT_MAIN_NAME: data.PRODUCT_MAIN_NAME,
    //         PRODUCT_MAIN_ALPHABET: data.PRODUCT_MAIN_ALPHABET
    //       },
    //       PRODUCT_SUB: {
    //         PRODUCT_SUB_ID: data.PRODUCT_SUB_ID,
    //         PRODUCT_SUB_NAME: data.PRODUCT_SUB_NAME,
    //         PRODUCT_SUB_ALPHABET: data.PRODUCT_SUB_ALPHABET
    //       },
    //       PRODUCT_TYPE: {
    //         PRODUCT_TYPE_ID: data.PRODUCT_TYPE_ID,
    //         PRODUCT_TYPE_NAME: data.PRODUCT_TYPE_NAME,
    //         PRODUCT_TYPE_CODE: data.PRODUCT_TYPE_CODE
    //       },
    //       ITEM_CATEGORY: data.ITEM_CATEGORY_NAME,
    //       PRODUCT_SPECIFICATION_TYPE: data.PRODUCT_SPECIFICATION_TYPE_NAME,
    //       NOTE: data.NOTE || '',
    //       FISCAL_YEAR: {
    //         value: data.FISCAL_YEAR,
    //         label: data.FISCAL_YEAR
    //       },
    //       SCT_PATTERN_NO: {
    //         value: data.SCT_PATTERN_ID,
    //         label: data.SCT_PATTERN_NAME
    //       },
    //       SCT_REASON_SETTING: {
    //         SCT_REASON_SETTING_ID: data.SCT_REASON_SETTING_ID,
    //         SCT_REASON_SETTING_NAME: data.SCT_REASON_SETTING_NAME
    //       },
    //       SCT_TAG_SETTING: {
    //         SCT_TAG_SETTING_ID: data?.SCT_TAG_SETTING_ID ?? null,
    //         SCT_TAG_SETTING_NAME: data.SCT_TAG_SETTING_NAME
    //       },
    //       SCT_REVISION_CODE: data.SCT_REVISION_CODE,
    //       START_DATE: new Date(data.ESTIMATE_PERIOD_START_DATE),
    //       END_DATE: new Date(data.ESTIMATE_PERIOD_END_DATE),
    //       BOM_CODE_ACTUAL: data.BOM_CODE_ACTUAL,
    //       BOM_NAME_ACTUAL: data.BOM_NAME_ACTUAL,
    //       BOM_CODE: data.BOM_CODE,
    //       BOM_NAME: data.BOM_NAME,
    //       SCT_COMPARE_NO_1: sctCompareNo1,
    //       SCT_COMPARE_NO_2: sctCompareNo2,
    //       IS_DEFAULT_EXPORT_COMPARE_NO_1: isDefaultExportCompareNo1,
    //       IS_DEFAULT_EXPORT_COMPARE_NO_2: isDefaultExportCompareNo2,
    //       ...sctOptionSelection,
    //       SCT_FLOW_PROCESS: sctDataFlowProcess.data.ResultOnDb,
    //       SCT_MATERIAL: sctDataMaterial.data.ResultOnDb,
    //       // DIRECT_COST_CONDITION: costConditionData.data.ResultOnDb[0]?.[0] ?? null,
    //       DIRECT_COST_CONDITION: costConditionData?.data.ResultOnDb[0]?.[0]
    //         ? {
    //             ...costConditionData.data.ResultOnDb[0]?.[0],
    //             INDIRECT_RATE_OF_DIRECT_PROCESS_COST:
    //               Number(costConditionData.data.ResultOnDb[0]?.[0].INDIRECT_RATE_OF_DIRECT_PROCESS_COST) / 100
    //           }
    //         : null,
    //       INDIRECT_COST_CONDITION: indirectCostCondition,
    //       OTHER_COST_CONDITION: otherCostCondition,
    //       SPECIAL_COST_CONDITION: costConditionData?.data.ResultOnDb[3]?.[0] ?? null,
    //       YR_GR: yrGrData?.data.ResultOnDb[0] ?? null,
    //       YR_GR_TOTAL: yrGrData?.data.ResultOnDb[1]?.[0] ?? null,
    //       CLEAR_TIME: timeData?.data.ResultOnDb[0] ?? null,
    //       CLEAR_TIME_TOTAL: timeData?.data.ResultOnDb[1]?.[0] ?? null,
    //       MATERIAL_PRICE_DATA: materialPriceData?.data.ResultOnDb ?? null,
    //       YIELD_MATERIAL_DATA: yieldMaterialData?.data.ResultOnDb ?? null,
    //       SCT_COMPARE_NO_1_DATA: sctCompareNo1Data?.data.ResultOnDb ?? null,
    //       SCT_COMPARE_NO_2_DATA: sctCompareNo2Data?.data.ResultOnDb ?? null,
    //       NOTE_PRICE: data.NOTE_PRICE,
    //       REMARK_FOR_ADJUST_PRICE: data.REMARK_FOR_ADJUST_PRICE,
    //       ADJUST_PRICE: sctDetailForAdjust?.data.ResultOnDb[0]?.ADJUST_PRICE || adjustPrice,
    //       IS_MANUAL_ADJUST_PRICE: sctDetailForAdjust?.data.ResultOnDb[0]?.ADJUST_PRICE ? true : false,
    //       YR_GR_FROM_ENGINEER_SELECTION: yrGrSelection
    //         ? {
    //             value: yrGrSelection.value,
    //             label: yrGrSelection.label
    //           }
    //         : null,
    //       TIME_FROM_MFG_SELECTION: timeSelection
    //         ? {
    //             value: timeSelection.value,
    //             label: timeSelection.label
    //           }
    //         : null
    //     }
    //   } else {
    //     const sctAllData = await StandardCostForProductServices.getCompletedSctAllData({
    //       SCT_ID: rowSelected?.original.SCT_ID
    //     })

    //     //merge declare variables
    //     const {
    //       dataHeader,
    //       dataHeader_2,
    //       flowProcess,
    //       indirectCostPriceTabsData,
    //       material,
    //       sctDataSelection,
    //       sellingPrice,
    //       totalFlowProcess,
    //       totalMaterial
    //     } = sctAllData.data.ResultOnDb?.[0]

    //     let sctCompareNo1AllData = undefined
    //     let sctCompareNo2AllData = undefined

    //     if (dataHeader?.SCT_ID_FOR_COMPARE) {
    //       sctCompareNo1AllData = await StandardCostForProductServices.getCompletedSctAllData({
    //         SCT_ID: rowSelected?.original.SCT_ID
    //       })
    //     }
    //     if (dataHeader_2?.SCT_ID_FOR_COMPARE) {
    //       sctCompareNo2AllData = await StandardCostForProductServices.getCompletedSctAllData({
    //         SCT_ID: rowSelected?.original.SCT_ID
    //       })
    //     }

    //     let sctOptionSelection: any = {}

    //     for (let i = 0; i < sctDataSelection?.length || 0; i++) {
    //       const dataOption = sctDataSelection[i]

    //       switch (dataOption.SCT_COMPONENT_TYPE_ID) {
    //         case 1:
    //           sctOptionSelection.COST_CONDITION = dataOption.SCT_RESOURCE_OPTION_ID
    //           sctOptionSelection.COST_CONDITION_RESOURCE_OPTION_ID = dataOption.SCT_RESOURCE_OPTION_ID
    //           break
    //         case 3:
    //           sctOptionSelection.YR_GR_FROM_ENGINEER = dataOption.SCT_RESOURCE_OPTION_ID
    //           sctOptionSelection.YR_GR_FROM_ENGINEER_RESOURCE_OPTION_ID = dataOption.SCT_RESOURCE_OPTION_ID
    //           break
    //         case 4:
    //           sctOptionSelection.TIME_FROM_MFG = dataOption.SCT_RESOURCE_OPTION_ID
    //           sctOptionSelection.TIME_FROM_MFG_RESOURCE_OPTION_ID = dataOption.SCT_RESOURCE_OPTION_ID
    //           break
    //         case 2:
    //           sctOptionSelection.MATERIAL_PRICE = dataOption.SCT_RESOURCE_OPTION_ID
    //           sctOptionSelection.MATERIAL_PRICE_RESOURCE_OPTION_ID = dataOption.SCT_RESOURCE_OPTION_ID
    //           break
    //         case 5:
    //           sctOptionSelection.YR_ACCUMULATION_MATERIAL_FROM_ENGINEER = dataOption.SCT_RESOURCE_OPTION_ID
    //           sctOptionSelection.YR_ACCUMULATION_MATERIAL_FROM_ENGINEER_RESOURCE_OPTION_ID =
    //             dataOption.SCT_RESOURCE_OPTION_ID
    //           break
    //         default:
    //           break
    //       }
    //     }

    //     const result = {
    //       mode: mode,
    //       SCT_ID: dataHeader.SCT_ID,
    //       SCT_STATUS_PROGRESS_ID: dataHeader.SCT_STATUS_PROGRESS_ID,
    //       SCT_STATUS_PROGRESS: {
    //         SCT_STATUS_PROGRESS_ID: dataHeader.SCT_STATUS_PROGRESS_ID,
    //         SCT_STATUS_PROGRESS_NAME: dataHeader.SCT_STATUS_PROGRESS_NAME
    //       },
    //       BOM_ID: dataHeader.BOM_ID,
    //       TOTAL_COUNT_PROCESS: totalFlowProcess.TOTAL_COUNT_PROCESS,
    //       FLOW_CODE: totalFlowProcess.FLOW_CODE,

    //       PRODUCT_CATEGORY: {
    //         PRODUCT_CATEGORY_ID: dataHeader.PRODUCT_CATEGORY_ID,
    //         PRODUCT_CATEGORY_NAME: dataHeader.PRODUCT_CATEGORY_NAME,
    //         PRODUCT_CATEGORY_ALPHABET: dataHeader.PRODUCT_CATEGORY_ALPHABET
    //       },
    //       PRODUCT_MAIN: {
    //         PRODUCT_MAIN_ID: dataHeader.PRODUCT_MAIN_ID,
    //         PRODUCT_MAIN_NAME: dataHeader.PRODUCT_MAIN_NAME,
    //         PRODUCT_MAIN_ALPHABET: dataHeader.PRODUCT_MAIN_ALPHABET
    //       },
    //       PRODUCT_SUB: {
    //         PRODUCT_SUB_ID: dataHeader.PRODUCT_SUB_ID,
    //         PRODUCT_SUB_NAME: dataHeader.PRODUCT_SUB_NAME,
    //         PRODUCT_SUB_ALPHABET: dataHeader.PRODUCT_SUB_ALPHABET
    //       },
    //       PRODUCT_TYPE: {
    //         PRODUCT_TYPE_ID: dataHeader.PRODUCT_TYPE_ID,
    //         PRODUCT_TYPE_NAME: dataHeader.PRODUCT_TYPE_NAME,
    //         PRODUCT_TYPE_CODE: dataHeader.PRODUCT_TYPE_CODE_FOR_SCT
    //       },
    //       ITEM_CATEGORY: dataHeader.ITEM_CATEGORY_NAME,
    //       PRODUCT_SPECIFICATION_TYPE: dataHeader.PRODUCT_SPECIFICATION_TYPE_NAME,
    //       NOTE: dataHeader?.NOTE || '',
    //       FISCAL_YEAR: {
    //         value: dataHeader.FISCAL_YEAR,
    //         label: dataHeader.FISCAL_YEAR
    //       },
    //       SCT_PATTERN_NO: {
    //         value: dataHeader.SCT_PATTERN_ID,
    //         label: dataHeader.SCT_PATTERN_NAME
    //       },
    //       SCT_REASON_SETTING: dataHeader?.SCT_REASON_SETTING_ID
    //         ? {
    //             SCT_REASON_SETTING_ID: dataHeader.SCT_REASON_SETTING_ID,
    //             SCT_REASON_SETTING_NAME: dataHeader.SCT_REASON_SETTING_NAME
    //           }
    //         : null,
    //       SCT_TAG_SETTING: dataHeader?.SCT_TAG_SETTING_ID
    //         ? {
    //             SCT_TAG_SETTING_ID: dataHeader.SCT_TAG_SETTING_ID,
    //             SCT_TAG_SETTING_NAME: dataHeader.SCT_TAG_SETTING_NAME
    //           }
    //         : null,
    //       SCT_REVISION_CODE: dataHeader.SCT_REVISION_CODE,
    //       START_DATE: new Date(dataHeader.ESTIMATE_PERIOD_START_DATE),
    //       END_DATE: new Date(dataHeader.ESTIMATE_PERIOD_END_DATE),
    //       BOM_CODE_ACTUAL: dataHeader.BOM_CODE_ACTUAL,
    //       BOM_NAME_ACTUAL: dataHeader.BOM_NAME_ACTUAL,
    //       BOM_CODE: dataHeader.BOM_CODE,
    //       BOM_NAME: dataHeader.BOM_NAME,
    //       SCT_COMPARE_NO_1: dataHeader?.SCT_REVISION_CODE_FOR_COMPARE
    //         ? {
    //             SCT_ID: dataHeader.SCT_ID_FOR_COMPARE,
    //             SCT_REVISION_CODE: dataHeader.SCT_REVISION_CODE_FOR_COMPARE,
    //             BOM_CODE: dataHeader.BOM_CODE_FOR_COMPARE,
    //             BOM_NAME: dataHeader.BOM_NAME_FOR_COMPARE,
    //             BOM_ID: dataHeader.BOM_ID_FOR_COMPARE,
    //             PRODUCT_TYPE_CODE: dataHeader.PRODUCT_TYPE_CODE_FOR_COMPARE,
    //             FLOW_CODE: dataHeader.FLOW_CODE_FOR_COMPARE,
    //             TOTAL_COUNT_PROCESS: dataHeader.TOTAL_COUNT_PROCESS_FOR_COMPARE
    //           }
    //         : null,
    //       SCT_COMPARE_NO_2: dataHeader_2?.SCT_REVISION_CODE_FOR_COMPARE
    //         ? {
    //             SCT_ID: dataHeader_2.SCT_ID_FOR_COMPARE,
    //             SCT_REVISION_CODE: dataHeader_2.SCT_REVISION_CODE_FOR_COMPARE,
    //             BOM_CODE: dataHeader_2.BOM_CODE_FOR_COMPARE,
    //             BOM_NAME: dataHeader_2.BOM_NAME_FOR_COMPARE,
    //             BOM_ID: dataHeader_2.BOM_ID_FOR_COMPARE,
    //             PRODUCT_TYPE_CODE: dataHeader_2.PRODUCT_TYPE_CODE_FOR_COMPARE,
    //             FLOW_CODE: dataHeader_2.FLOW_CODE_FOR_COMPARE,
    //             TOTAL_COUNT_PROCESS: dataHeader_2.TOTAL_COUNT_PROCESS_FOR_COMPARE
    //           }
    //         : null,
    //       IS_DEFAULT_EXPORT_COMPARE_NO_1: dataHeader?.IS_DEFAULT_EXPORT_COMPARE,
    //       IS_DEFAULT_EXPORT_COMPARE_NO_2: dataHeader_2?.IS_DEFAULT_EXPORT_COMPARE,
    //       ...sctOptionSelection,
    //       SCT_MAIN_FULL_DATA: sctAllData?.data.ResultOnDb,
    //       SCT_COMPARE_NO_1_FULL_DATA: sctCompareNo1AllData?.data.ResultOnDb,
    //       SCT_COMPARE_NO_2_FULL_DATA: sctCompareNo2AllData?.data.ResultOnDb,
    //       SCT_FLOW_PROCESS: flowProcess,
    //       SCT_MATERIAL: material,
    //       // DIRECT_COST_CONDITION: '',
    //       // INDIRECT_COST_CONDITION: '',
    //       // OTHER_COST_CONDITION: '',
    //       // SPECIAL_COST_CONDITION: '',
    //       // YR_GR: '',
    //       YR_GR_TOTAL: {
    //         TOTAL_YIELD_RATE_FOR_SCT: totalFlowProcess.TOTAL_YIELD_RATE,
    //         TOTAL_GO_STRAIGHT_RATE_FOR_SCT: totalFlowProcess.TOTAL_GO_STRAIGHT_RATE,
    //         TOTAL_ESSENTIAL_TIME_FOR_SCT: totalFlowProcess.TOTAL_ESSENTIAL_TIME
    //       },
    //       // CLEAR_TIME: '',
    //       CLEAR_TIME_TOTAL: {
    //         TOTAL_CLEAR_TIME_FOR_SCT: totalFlowProcess.TOTAL_CLEAR_TIME
    //       },
    //       TOTAL_MATERIAL: {
    //         ...totalMaterial
    //       },
    //       ADJUST_PRICE: sellingPrice?.ADJUST_PRICE ?? 0,
    //       REMARK_FOR_ADJUST_PRICE: sellingPrice?.REMARK_FOR_ADJUST_PRICE ?? '',
    //       NOTE_PRICE: sellingPrice?.NOTE_PRICE ?? '',
    //       SELLING_PRICE: {
    //         ...sellingPrice
    //       },
    //       // MATERIAL_PRICE_DATA: '',
    //       // YIELD_MATERIAL_DATA: '',
    //       // SCT_COMPARE_NO_1_DATA: '',
    //       // SCT_COMPARE_NO_2_DATA: '',
    //       // NOTE_PRICE: '',
    //       // REMARK_FOR_ADJUST_PRICE: '',
    //       // ADJUST_PRICE: '',
    //       DIRECT_COST_CONDITION: {
    //         DIRECT_UNIT_PROCESS_COST: indirectCostPriceTabsData.DIRECT_UNIT_PROCESS_COST,
    //         INDIRECT_RATE_OF_DIRECT_PROCESS_COST: indirectCostPriceTabsData.INDIRECT_RATE_OF_DIRECT_PROCESS_COST
    //       },
    //       INDIRECT_COST_CONDITION: {
    //         TOTAL_INDIRECT_COST: indirectCostPriceTabsData.TOTAL_INDIRECT_COST
    //       },
    //       IMPORT_FEE_RATE: indirectCostPriceTabsData.IMPORT_FEE_RATE,
    //       OTHER_COST_CONDITION: {
    //         SELLING_EXPENSE: indirectCostPriceTabsData.SELLING_EXPENSE,
    //         GA: indirectCostPriceTabsData.GA,
    //         MARGIN: indirectCostPriceTabsData.MARGIN,
    //         CIT: indirectCostPriceTabsData.CIT,
    //         VAT: indirectCostPriceTabsData.VAT
    //       },
    //       TOTAL_PROCESSING_TIME: indirectCostPriceTabsData.TOTAL_PROCESSING_TIME,
    //       TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE:
    //         indirectCostPriceTabsData.TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE,
    //       DIRECT_PROCESS_COST: indirectCostPriceTabsData.DIRECT_PROCESS_COST,
    //       TOTAL_DIRECT_COST: indirectCostPriceTabsData.TOTAL_DIRECT_COST,
    //       TOTAL: indirectCostPriceTabsData.TOTAL,
    //       PRICE: {
    //         TOTAL_PRICE_OF_RAW_MATERIAL: indirectCostPriceTabsData.TOTAL_PRICE_OF_RAW_MATERIAL,
    //         TOTAL_PRICE_OF_CONSUMABLE: indirectCostPriceTabsData.TOTAL_PRICE_OF_CONSUMABLE,
    //         TOTAL_PRICE_OF_PACKING: indirectCostPriceTabsData.TOTAL_PRICE_OF_PACKING,
    //         TOTAL_PRICE_OF_SUB_ASSY: indirectCostPriceTabsData.TOTAL_PRICE_OF_SUB_ASSY,
    //         TOTAL_PRICE_OF_SEMI_FINISED_GOODS: indirectCostPriceTabsData.TOTAL_PRICE_OF_SEMI_FINISED_GOODS,
    //         TOTAL_PRICE_OF_ALL_OF_ITEMS: indirectCostPriceTabsData.TOTAL_PRICE_OF_ALL_OF_ITEMS,
    //         RAW_MATERIAL_SUB_ASSY_SEMI_FINISHED_GOODS:
    //           indirectCostPriceTabsData.RAW_MATERIAL_SUB_ASSY_SEMI_FINISHED_GOODS,
    //         CONSUMABLE_PACKING: indirectCostPriceTabsData.CONSUMABLE_PACKING,
    //         MATERIAL_COST: indirectCostPriceTabsData.TOTAL_PRICE_OF_ALL_OF_ITEMS
    //       }
    //     }

    //     return result
    //   }
    // }
  })

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
