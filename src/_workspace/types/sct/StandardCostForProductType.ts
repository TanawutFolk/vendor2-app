// export interface SCT {
//   SCT_ID: string
//   SCT_REVISION_CODE: string
//   IS_REFRESH_DATA_MASTER: number
//   ESTIMATE_PERIOD_START_DATE: string
//   ESTIMATE_PERIOD_END_DATE: string
//   CREATE_BY: string
//   CREATE_DATE: string
//   UPDATE_BY: string
//   UPDATE_DATE: string
//   STATUS_UPDATE_BY: string
//   STATUS_UPDATE_DATE: string
//   CANCEL_REASON: string | null
//   NOTE: string
//   DESCRIPTION: string | null
//   INUSE: number
//   SCT_STATUS_PROGRESS_ID: number
//   SCT_STATUS_PROGRESS_NO: number
//   SCT_STATUS_PROGRESS_NAME: string
//   PRODUCT_TYPE_CODE: string
//   PRODUCT_TYPE_NAME: string
//   PRODUCT_SUB_NAME: string
//   PRODUCT_MAIN_NAME: string
//   PRODUCT_CATEGORY_NAME: string
//   FISCAL_YEAR: string
//   PRODUCT_SPECIFICATION_TYPE_NAME: string
//   BOM_CODE: string
//   BOM_NAME: string
//   FLOW_CODE: string
//   FLOW_NAME: string
//   SCT_PATTERN_ID: number
//   SCT_PATTERN_NAME: string
//   ITEM_CATEGORY_NAME: string
//   ITEM_CATEGORY_ID: number
//   SCT_REASON_SETTING_NAME: string
//   SCT_REASON_SETTING_ID: number
//   SCT_TAG_SETTING_NAME: string
//   SCT_TAG_SETTING_ID: number
//   CUSTOMER_INVOICE_TO_NAME: string
//   CUSTOMER_INVOICE_TO_ID: number
//   CUSTOMER_INVOICE_TO_ALPHABET: string
//   SELLING_PRICE: number | null
//   ADJUST_PRICE: number | null
//   ASSEMBLY_GROUP_FOR_SUPPORT_MES: string | null
//   RE_CAL_UPDATE_DATE: string
//   RE_CAL_UPDATE_BY: string | null
//   INDIRECT_COST_MODE: string
//   SCT_STATUS_WORKING_ID: number
//   TOTAL_INDIRECT_COST: number | null
// }

// export interface StandardCostAddModalProductTypeI {
//   PRODUCT_TYPE_NAME: string
//   PRODUCT_TYPE_CODE: string
//   BOM_CODE: string
//   BOM_NAME: string
//   SCT_REVISION_CODE: string
// }

export interface StandardCostFormI {
  SCT_CREATE_TYPE_NAME: string
  SCT_F_CODE: string
  PRODUCT_TYPE_CODE: string
  PRODUCT_TYPE_NAME: string
  BOM_CODE: string
  BOM_NAME: string
  SCT_F_ID: string
}
