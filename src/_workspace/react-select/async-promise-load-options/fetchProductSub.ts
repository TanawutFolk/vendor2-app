import type { ProductSubI } from '@/_workspace/types/productGroup/ProductSub'
import ProductSubServices from '@/_workspace/services/productGroup/ProductSubServices'

export interface ProductSubOption extends ProductSubI {}

const fetchProductSubByLikeProductSubNameAndInuse = (inputValue: string, inuse: number | '' = '') =>
  new Promise<ProductSubOption[]>(resolve => {
    const param = {
      PRODUCT_SUB_NAME: `${inputValue}`,
      INUSE: `${inuse}`
    }

    ProductSubServices.getByLikeProductSubNameAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

const fetchProductSubByLikeProductSubNameAndProductMainIdAndInuse = (
  inputValue: string,
  productMainId: number,
  inuse: number | '' = ''
) =>
  new Promise<ProductSubOption[]>(resolve => {
    const param = {
      PRODUCT_SUB_NAME: `${inputValue}`,
      PRODUCT_MAIN_ID: `${productMainId}`,
      INUSE: `${inuse}`
    }

    ProductSubServices.getByLikeProductSubNameAndProductMainIdAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
const fetchProductSubByLikeProductSubNameAndProductCategoryIdAndInuse = (
  inputValue: string,
  productCategoryId: number,
  inuse: number | '' = ''
) =>
  new Promise<ProductSubOption[]>(resolve => {
    const param = {
      PRODUCT_SUB_NAME: `${inputValue}`,
      PRODUCT_CATEGORY_ID: `${productCategoryId}`,
      INUSE: `${inuse}`
    }

    ProductSubServices.getByLikeProductSubNameAndProductCategoryIdAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

export {
  fetchProductSubByLikeProductSubNameAndInuse,
  fetchProductSubByLikeProductSubNameAndProductMainIdAndInuse,
  fetchProductSubByLikeProductSubNameAndProductCategoryIdAndInuse
}
