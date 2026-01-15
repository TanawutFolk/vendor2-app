import type { ProductMainI } from '@/_workspace/types/productGroup/product-main/ProductMain'
import ProductMainServices from '@/_workspace/services/productGroup/ProductMainServices'

export interface ProductMainOption extends ProductMainI {}

const fetchByLikeProductMainNameAndInuse = (inputValue: string, inuse: number | '' = '') =>
  new Promise<ProductMainOption[]>(resolve => {
    const param = {
      PRODUCT_MAIN_NAME: inputValue,
      INUSE: inuse
    }

    ProductMainServices.getProductMainByLikeProductMainNameAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

const fetchProductMainByLikeProductMainNameAndInuse = (inputValue: string, inuse: number | '' = '') =>
  new Promise<ProductMainOption[]>(resolve => {
    const param = {
      PRODUCT_MAIN_NAME: inputValue,
      INUSE: inuse
    }

    ProductMainServices.getByLikeProductMainNameAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

const fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse = (
  inputValue: string,
  inuse: number,
  productCategoryId: number
) =>
  new Promise<ProductMainOption[]>(resolve => {
    const param = {
      PRODUCT_MAIN_NAME: inputValue,
      INUSE: inuse,
      PRODUCT_CATEGORY_ID: productCategoryId
    }
    // console.log();

    ProductMainServices.getByLikeProductMainNameAndProductCategoryIdAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

export {
  fetchProductMainByLikeProductMainNameAndInuse,
  fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse,
  fetchByLikeProductMainNameAndInuse
}
