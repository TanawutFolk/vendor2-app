import RegisterRequestServices from '@/_workspace/services/_register-request/RegisterRequestServices'
import type { GprCSectionI } from '@/_workspace/types/_request-history/RequestHistoryTypes'

export interface GprCSectionOption extends GprCSectionI {}

const fetchGprCSections = (inputValue: string) =>
  new Promise<GprCSectionOption[]>(resolve => {
    const param = {
      SEARCH_TEXT: inputValue
    }

    RegisterRequestServices.getGprCSections(param)
      .then(responseJson => {
        resolve(responseJson.data.Status ? responseJson.data.ResultOnDb : [])
      })
      .catch(error => {
        console.log(error)
        resolve([])
      })
  })

export { fetchGprCSections }
