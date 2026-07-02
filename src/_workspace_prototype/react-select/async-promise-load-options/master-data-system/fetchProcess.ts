import type { ProcessI } from '@/_workspace/types/master-data-system/Process'
import ProcessServices from '@/_workspace/services/master-data-system/ProcessServices'

interface ProcessOption extends ProcessI {}

const fetchProcessByLikeProcess = (inputValue: string, inuse: string = '') =>
  new Promise<ProcessOption[]>(resolve => {
    const param = {
      PROCESS_NAME: `${inputValue}`,
      INUSE: inuse,
      Start: 0,
      Limit: 50
    }

    ProcessServices.getByLikeProcessName(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

const fetchProcessByLikeProcessAndInuse = (inputValue: string, inuse: string = '') =>
  new Promise<ProcessOption[]>(resolve => {
    const param = {
      PROCESS_NAME: `${inputValue}`,
      INUSE: inuse,
      Start: 0,
      Limit: 50
    }

    ProcessServices.getByLikeProcessAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

const fetchProcessByLikeProcessNameAndProductMainIdAndInuse = (
  inputValue: string,
  productMainId: number | '',
  inuse: number | ''
) =>
  new Promise<ProcessOption[]>(resolve => {
    const param = {
      PROCESS_NAME: `${inputValue}`,
      PRODUCT_MAIN_ID: `${productMainId}`,
      INUSE: inuse
    }

    ProcessServices.getByLikeProcessNameAndProductMainIdAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
export {
  fetchProcessByLikeProcess,
  fetchProcessByLikeProcessAndInuse,
  fetchProcessByLikeProcessNameAndProductMainIdAndInuse
}
