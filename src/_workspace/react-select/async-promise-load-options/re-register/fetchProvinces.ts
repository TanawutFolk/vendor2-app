import ReRegisterServices from '@/_workspace/services/_Re-register/ReRegisterServices'
import type { ProvinceI } from '@/_workspace/types/vendor/VendorTypes'

export interface ProvinceOption extends ProvinceI {}

const fetchProvinces = (inputValue: string) =>
  new Promise<ProvinceOption[]>(resolve => {
    const param = {
      PROVINCE: inputValue
    }

    ReRegisterServices.getProvinces(param)
      .then(responseJson => {
        resolve(responseJson.data.Status ? responseJson.data.ResultOnDb : [])
      })
      .catch(error => {
        console.log(error)
        resolve([])
      })
  })

export { fetchProvinces }
