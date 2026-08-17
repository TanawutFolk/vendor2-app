import RegisterRequestServices from '@/_workspace/services/_register-request/RegisterRequestServices'
import type { SelectionBusinessCategoryI } from '@/_workspace/types/_request-register/RequestRegisterTypes'

export interface BusinessCategoryOption extends SelectionBusinessCategoryI {}

const fetchBusinessCategories = (inputValue: string) =>
  new Promise<BusinessCategoryOption[]>(resolve => {
    const param = {
      BUSINESS_CATEGORY_NAME: inputValue
    }

    RegisterRequestServices.getBusinessCategories(param)
      .then(responseJson => {
        resolve(responseJson.data.Status ? responseJson.data.ResultOnDb : [])
      })
      .catch(error => {
        console.log(error)
        resolve([])
      })
  })

export { fetchBusinessCategories }
