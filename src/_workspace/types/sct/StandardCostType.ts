import { ProductSpecificationTypeI } from '../specification-setting/ProductSpecificationType'
import { SctPatternI } from './SctPattern'
import { SctReasonSettingI } from './SctReasonSetting'
import { SctTagSettingI } from './SctTagSetting'

export interface StandardCostI extends SctPatternI, SctReasonSettingI, SctTagSettingI, ProductSpecificationTypeI {
  SCT_ID: string
  PRODUCT_TYPE_ID: number
  CUSTOMER_INVOICE_TO_ID: string
  SCT_PATTERN_ID: number
  ITEM_CATEGORY_ID: number
  PRODUCTION_PURPOSE_ID: string
  ORDER_TYPE_ID: string
  SCT_REASON_CODE_ID: string
  SCT_REVISION_CODE: string
  FISCAL_YEAR: number
  REVISION: string
  EFFECTIVE_DATE: string
  EXPIRATION_DATE: string
  EFFECTIVE_DATE_WITHOUT_FORMAT: string
  EXPIRATION_DATE_WITHOUT_FORMAT: string
  SCT_CODE_FOR_SUPPORT_MES: string
  CUSTOMER_INVOICE_TO_ALPHABET: string
  ITEM_CATEGORY_NAME: string
  ITEM_CATEGORY_ALPHABET: string
  PRODUCTION_PURPOSE_NAME: string
  PRODUCTION_PURPOSE_ALPHABET: string
  ORDER_TYPE_NAME: string
  ORDER_TYPE_ALPHABET: string
  SCT_REASON_CODE_NAME: string
  SCT_REASON_CODE_ALPHABET: string
  PRODUCT_TYPE_CODE: string
  PRODUCT_TYPE_CODE_FOR_SCT: string
  PRODUCT_TYPE_NAME: string
  PRODUCT_SUB_ID: number
  PRODUCT_SUB_NAME: string
  PRODUCT_SUB_ALPHABET: string
  PRODUCT_MAIN_ID: number
  PRODUCT_MAIN_NAME: string
  PRODUCT_MAIN_ALPHABET: string
  PRODUCT_CATEGORY_NAME: string
  PRODUCT_CATEGORY_ALPHABET: string
  BOM_ID: number
  BOM_CODE: string
  BOM_NAME: string
  FLOW_ID: number
  FLOW_CODE: string
  FLOW_NAME: string
  TOTAL_COUNT_PROCESS: number
  SCT_PREVIOUS_CURRENT_YEAR_ID: string
  SCT_LAST_YEAR_ID: string
  SELLING_PRICE: string
  SCT_RESOURCE_OPTION_ID: string
  SCT_COPY_ID: string

  CREATE_BY: string
  CREATE_DATE: string
  UPDATE_BY: string
  UPDATE_DATE: string
  DESCRIPTION: string

  PRODUCT_CATEGORY_ID: number
  SCT_STATUS_PROGRESS_NAME: string
  SCT_STATUS_PROGRESS_ID: number
  SCT_PATTERN_NAME: string

  ESTIMATE_PERIOD_START_DATE: string
  ESTIMATE_PERIOD_END_DATE: string
  NOTE: string

  SCT_STATUS_PROGRESS_NO: number
}

// export interface SctCodeForSelection {
//   SCT_CODE_FOR_SUPPORT_MES: string
//   SCT_ID: number
//   BOM_ID: number
//   SCT_REVISION_CODE: string
// }
