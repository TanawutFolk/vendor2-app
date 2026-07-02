import type { SpecificationSettingI } from '@/_workspace/types/specification-setting/SpecificationSetting'
import SpecificationSettingServices from '@/_workspace/services/specification-setting/SpecificationSettingServices'

export interface SpecificationSettingOption extends SpecificationSettingI {}

const fetchSpecificationSettingByLikeSpecificationSettingNameAndInuse = (inputValue: string, inuse: number | '' = '') =>
  new Promise<SpecificationSettingOption[]>(resolve => {
    const param = {
      PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME: inputValue,
      INUSE: inuse
    }

    SpecificationSettingServices.getByLikeSpecificationSettingAndInuse(param)
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

export { fetchSpecificationSettingByLikeSpecificationSettingNameAndInuse }
