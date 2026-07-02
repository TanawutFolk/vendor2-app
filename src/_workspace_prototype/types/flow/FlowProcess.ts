export interface FlowProcessI {
  // FLOW_ID: number
  // FLOW_CODE: string
  // FLOW_NAME: string
  // FLOW_TYPE_ID: number
  // PRODUCT_MAIN_ID: number
  // PRODUCT_MAIN_NAME: string
  // PRODUCT_MAIN_ALPHABET: string
  // PRODUCT_TYPE_CODE: string
  // PRODUCT_TYPE_NAME: string
  // TOTAL_COUNT_PROCESS: number
  // INUSE: number
  // INUSE_RAW_DATA: number
  // MODIFIED_DATE: string
  // UPDATE_BY: string
  // No: number
  // IS_DRAFT: number
  // PROCESS_ID: number
  // PROCESS_NAME: string

  FLOW_ID: number
  PROCESS_ID: number
  PROCESS_CODE: string
  PROCESS_NAME: string
  PROCESS_NO: number
  FLOW_PROCESS_ID: number
  FLOW_CODE: string
  FLOW_NAME: string
}

export interface ProcessI {
  PROCESS_ID: number
  PROCESS_NAME: string
}

export interface ProductTypeOptionI {
  BOM_ID: string
  BOM_CODE: string
  FLOW_CODE: string
  PRODUCT_TYPE_ID: number
  PRODUCT_TYPE_NAME: string
  PRODUCT_TYPE_CODE: string
}
