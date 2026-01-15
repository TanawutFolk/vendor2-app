export interface SpecificationSettingI {
  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID: number
  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME: string
  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER: number
  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION: number
  PRODUCT_PART_NUMBER: number
  CREATE_BY: string
  CREATE_DATE: string
  UPDATE_BY: string
  UPDATE_DATE: string
  DESCRIPTION: string
  INUSE: string // 0 , 1
  //-----------------------------------------------------------
  PRODUCT_MAIN_ID: number
  PRODUCT_MAIN_NAME: string
  CUSTOMER_ORDER_FROM_ID?: number
  CUSTOMER_ORDER_FROM_NAME: string
  PRODUCT_SPECIFICATION_TYPE_ID: number
  PRODUCT_SPECIFICATION_TYPE_NAME: string
}

//  customerOrderFrom: null,
// specificationSetting: null,
// productMain: null,
// specificationSettingNumber: '',
// specificationSettingVersionRevision: '',
// partNumber: '',
// status: null
