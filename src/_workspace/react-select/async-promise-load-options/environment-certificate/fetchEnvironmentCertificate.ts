import type { EnvironmentCertificateI } from '@/_workspace/types/environment-certificate/EnvironmentCertificate'
import EnvironmentCertificateServices from '@/_workspace/services/environment-certificate/EnvironmentCertificateServices'

export interface EnvironmentCertificateOption extends EnvironmentCertificateI {}

const fetchEnvironmentCertificateByLikeEnvironmentCertificateAndInuse = (inputValue: string, inuse: number | '' = '') =>
  new Promise<EnvironmentCertificateOption[]>(resolve => {
    const param = {
      ENVIRONMENT_CERTIFICATE_NAME: inputValue,
      INUSE: inuse
    }

    EnvironmentCertificateServices.getByLikeEnvironmentCertificateNameAndInuse(param)
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
//   new Promise<ProductMainOption[]>(resolve => {
//     const param = {
//       PRODUCT_MAIN_NAME: inputValue,
//       INUSE: inuse,
//       PRODUCT_CATEGORY_ID: productCategory
//     }
//     console.log('input', inputValue)
//     // console.log();

//     ProductMainServices.getByLikeProductMainNameAndProductCategoryIdAndInuse(param)
//       .then(responseJson => {
//         resolve(responseJson.data.ResultOnDb)
//       })
//       .catch(error => console.log(error))
//   })

export { fetchEnvironmentCertificateByLikeEnvironmentCertificateAndInuse }
