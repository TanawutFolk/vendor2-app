import FindVendorServices from '@/_workspace/services/_find-vendor/FindVendorServices'
import type { BusinessCategoryI } from '@/_workspace/types/vendor/VendorTypes'

export interface VendorTypeOption extends BusinessCategoryI {}

const fetchVendorTypes = (inputValue: string) =>
  new Promise<VendorTypeOption[]>(resolve => {
    const param = {
      BUSINESS_CATEGORY_NAME: inputValue
    }

    FindVendorServices.getVendorBusinessCategoryName(param)
      .then(responseJson => {
        resolve(responseJson.data.Status ? responseJson.data.ResultOnDb : [])
      })
      .catch(error => {
        console.log(error)
        resolve([])
      })
  })

export { fetchVendorTypes }
