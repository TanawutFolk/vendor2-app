export interface BomFlowProcessItemUsageI {
  // Row number
  ITEM_NO: number

  // BOM Information
  BOM_ID: number
  BOM_NAME: string
  BOM_CODE: string

  // Process Information
  BOM_FLOW_PROCESS_ITEM_USAGE_ID: number
  FLOW_PROCESS_ID: number
  PROCESS_ID: number
  PROCESS_NAME: string
  PROCESS_CODE: string
  PROCESS_NO: number

  // Flow Information
  FLOW_ID: number
  FLOW_NAME: string
  FLOW_CODE: string

  // Item Information
  ITEM_ID: number
  USAGE_QUANTITY: number

  // Item Category from Master
  ITEM_CATEGORY_NAME_FROM_MASTER: string
  ITEM_CATEGORY_ID_FROM_MASTER: number
  ITEM_CATEGORY_ALPHABET_FROM_MASTER: string
  ITEM_CATEGORY_SHORT_NAME_FROM_MASTER: string

  // Item Category from BOM
  ITEM_CATEGORY_NAME_FROM_BOM: string
  ITEM_CATEGORY_ID_FROM_BOM: number
  ITEM_CATEGORY_ALPHABET_FROM_BOM: string
  ITEM_CATEGORY_SHORT_NAME_FROM_BOM: string

  // Item Details
  ITEM_CODE_FOR_SUPPORT_MES: string
  ITEM_EXTERNAL_FULL_NAME: string
  ITEM_EXTERNAL_SHORT_NAME: string

  // Unit Information from Master
  PURCHASE_UNIT_ID_FROM_MASTER: number
  USAGE_UNIT_ID_FROM_MASTER: number
  USAGE_UNIT_RATIO_FROM_MASTER: number
  PURCHASE_UNIT_RATIO_FROM_MASTER: number

  // Unit Names from Master
  USAGE_UNIT_NAME_FROM_MASTER: string
  PURCHASE_UNIT_NAME_FROM_MASTER: string
  USAGE_UNIT_CODE_FROM_MASTER: string
  PURCHASE_UNIT_CODE_FROM_MASTER: string

  // Price Information
  ITEM_M_S_PRICE_ID: string
  ITEM_M_S_PRICE_VALUE: number
  PURCHASE_PRICE_CURRENCY_ID: number
  PURCHASE_PRICE: number
  PURCHASE_PRICE_UNIT_ID: number
  PURCHASE_PRICE_CURRENCY_CODE: string

  YIELD_ACCUMULATION_OF_ITEM_FOR_SCT: number | null | undefined

  // Status
  ITEM_IS_CURRENT: number
  ITEM_VERSION_NO: number
}
