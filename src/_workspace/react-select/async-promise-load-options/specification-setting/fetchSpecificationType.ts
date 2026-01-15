import { ProductSpecificationTypeI } from '@/_workspace/types/specification-setting/ProductSpecificationType'
import ProductSpecificationTypeServices from '@/_workspace/services/specification-setting/ProductSpecificationTypeServices'

export interface ProductSpecificationTypeOption extends ProductSpecificationTypeI {}

const fetchProductSpecificationTypeByLikeProductSpecificationTypeNameAndInuse = (
  inputValue: string,
  inuse: number | '' = ''
) =>
  new Promise<ProductSpecificationTypeOption[]>(resolve => {
    const param = {
      PRODUCT_SPECIFICATION_TYPE_NAME: inputValue,
      INUSE: inuse
    }

    ProductSpecificationTypeServices.getByLikeProductSpecificationTypeAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
// const fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse = (
//   inputValue: string,
//   inuse: number | '',
//   productCategory: number | '' = ''
// ) =>
//   new Promise<SpecificationSettingOption[]>(resolve => {
//     const param = {
//       PRODUCT_MAIN_NAME: inputValue,
//       INUSE: inuse,
//       PRODUCT_CATEGORY_ID: productCategory
//     }
//     console.log('input', inputValue)
//     // console.log();

//     SpecificationSettingServices.getByLikeProductMainNameAndProductCategoryIdAndInuse(param)
//       .then(responseJson => {
//         resolve(responseJson.data.ResultOnDb)
//       })
//       .catch(error => console.log(error))
//   })

export { fetchProductSpecificationTypeByLikeProductSpecificationTypeNameAndInuse }
