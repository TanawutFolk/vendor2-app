import type { AccountDepartmentCodeI } from '@_workspace/types/account/AccountDepartmentCode'
import AccountDepartmentCodeServices from '@_workspace/services/account/AccountDepartmentCodeServices'

export interface DepartmentCodeOption extends AccountDepartmentCodeI {}

const fetchAccountDepartmentCodeByLikeAccountDepartmentCodeAndInuse = (inputValue: string, inuse: number | '' = '') =>
  new Promise<DepartmentCodeOption[]>(resolve => {
    const param = {
      ACCOUNT_DEPARTMENT_CODE: inputValue,
      INUSE: inuse
    }

    AccountDepartmentCodeServices.getByLikeAccountDepartmentCodeAndInuse(param)
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

export { fetchAccountDepartmentCodeByLikeAccountDepartmentCodeAndInuse }
