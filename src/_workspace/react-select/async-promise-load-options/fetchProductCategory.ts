import type { ProductCategoryI } from '@/_workspace/types/productGroup/ProductCategory'
import ProductCategoryServices from '@/_workspace/services/productGroup/ProductCategoryServices'

// export interface ProductCategoryOption extends ProductCategoryI {}

const fetchProductCategoryByLikeProductCategoryNameAndInuse = (inputValue: string, inuse = '') =>
  new Promise<ProductCategoryI[]>(resolve => {
    const param = {
      PRODUCT_CATEGORY_NAME: inputValue,
      INUSE: inuse
    }
    ProductCategoryServices.getByLikeProductCategoryNameAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

export { fetchProductCategoryByLikeProductCategoryNameAndInuse }
