import ReRegisterServices from '@/_workspace/services/_Re-register/ReRegisterServices'
import type { ProductGroupI } from '@/_workspace/types/vendor/VendorTypes'

export interface ProductGroupOption extends ProductGroupI {}

const fetchProductGroups = (inputValue: string) =>
  new Promise<ProductGroupOption[]>(resolve => {
    const param = {
      GROUP_NAME: inputValue
    }

    ReRegisterServices.getProductGroups(param)
      .then(responseJson => {
        resolve(responseJson.data.Status ? responseJson.data.ResultOnDb : [])
      })
      .catch(error => {
        console.log(error)
        resolve([])
      })
  })

export { fetchProductGroups }
