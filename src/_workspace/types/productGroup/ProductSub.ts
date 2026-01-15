export interface ProductSubI {
  PRODUCT_SUB_ID: number
  // PRODUCT_CATEGORY_ID: number;
  PRODUCT_SUB_CODE: string
  PRODUCT_SUB_NAME: string
  PRODUCT_SUB_ALPHABET: string
  CREATE_BY: string
  CREATE_DATE: string
  UPDATE_BY: string
  UPDATE_DATE: string
  DESCRIPTION: string
  INUSE: string // 0 , 1

  // ------
  PRODUCT_CATEGORY_ID: number
  PRODUCT_CATEGORY_NAME: string
  PRODUCT_MAIN_ID: number
  PRODUCT_MAIN_NAME: string
}
