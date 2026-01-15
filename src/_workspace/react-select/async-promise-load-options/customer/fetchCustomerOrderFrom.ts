import type { CustomerOrderFromInterface } from '@/_workspace/types/customer/CustomerOrderFrom'
import CustomerOrderFromServices from '@/_workspace/services/customer/CustomerOrderFromServices'

export interface CustomerOrderFromOption extends CustomerOrderFromInterface {}

const fetchCustomerOrderFromByLikeCustomerOrderFromNameAndInuse = (inputValue: string, inuse: number | '' = '') =>
  new Promise<CustomerOrderFromOption[]>(resolve => {
    const param = {
      CUSTOMER_ORDER_FROM_NAME: inputValue,
      INUSE: inuse
    }

    CustomerOrderFromServices.getByLikeCustomerOrderFromNameAndInuse(param)
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

export { fetchCustomerOrderFromByLikeCustomerOrderFromNameAndInuse }
