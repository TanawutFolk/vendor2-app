export type SctDataType = {
  //#region Header
  IS_SAVE_DRAFT: boolean

  SCT_ID: string

  ESTIMATE_PERIOD_START_DATE: string
  ESTIMATE_PERIOD_END_DATE: string

  NOTE: string

  UPDATE_BY: string
  CREATE_BY: string

  SCT_STATUS_PROGRESS_ID: number
  //#endregion Header

  LIST_SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST: SctBomFlowProcessItemUsagePriceAdjustType[]
  LIST_SCT_COMPARE: SctCompareType[]
  LIST_SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT: SctComponentTypeResourceOptionSelect[]
  LIST_SCT_MASTER_DATA_HISTORY: SctMasterDataHistory[]

  SCT_DETAIL_FOR_ADJUST: SctDetailForAdjust
}

type SctBomFlowProcessItemUsagePriceAdjustType = {
  SCT_ID: string
  SCT_ID_SELECTION: string
  BOM_FLOW_PROCESS_ITEM_USAGE_ID: string
}

type SctCompareType = {
  SCT_ID: string
  SCT_COMPARE_NO: number
  SCT_ID_FOR_COMPARE: string
  IS_DEFAULT_EXPORT_COMPARE: 1 | 0
}

type SctComponentTypeResourceOptionSelect = {
  SCT_ID: string
  SCT_COMPONENT_TYPE_ID: number
  SCT_RESOURCE_OPTION_ID: number
}

type SctDetailForAdjust = {
  TOTAL_INDIRECT_COST: number | ''
  CIT: number | ''
  VAT: number | ''
  GA: number | ''
  MARGIN: number | ''
  SELLING_EXPENSE: number | ''
  ADJUST_PRICE: number | ''
  REMARK_FOR_ADJUST_PRICE: string
}

type SctMasterDataHistory = {
  SCT_ID: string
  SCT_MASTER_DATA_SETTING_ID: number
  FISCAL_YEAR: number
  VERSION_NO: number
}
