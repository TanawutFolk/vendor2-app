export interface ProductCategoryI {
  id: number
  PRODUCT_CATEGORY_ID: number
  PRODUCT_CATEGORY_CODE: string
  PRODUCT_CATEGORY_NAME: string
  PRODUCT_CATEGORY_ALPHABET: string
  CREATE_BY: string
  CREATE_DATE: string
  UPDATE_BY: string
  UPDATE_DATE: string
  DESCRIPTION: string
  INUSE: string // 0 , 1
  inuseForSearch?: number
}
