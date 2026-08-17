import ReRegisterServices from '@/_workspace/services/_Re-register/ReRegisterServices'
import type { CountryI } from '@/_workspace/types/vendor/VendorTypes'

export interface CountryOption extends CountryI {}

const fetchCountries = (inputValue: string) =>
  new Promise<CountryOption[]>(resolve => {
    const param = {
      INFO_COUNTRY_NAME: inputValue
    }

    ReRegisterServices.getCountries(param)
      .then(responseJson => {
        resolve(responseJson.data.Status ? responseJson.data.ResultOnDb : [])
      })
      .catch(error => {
        console.log(error)
        resolve([])
      })
  })

export { fetchCountries }
