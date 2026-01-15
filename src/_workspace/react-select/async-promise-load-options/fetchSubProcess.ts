import type { SubProcessI } from '@/_workspace/types/SubProcess'
import SubProcessServices from '@/_workspace/services/SubProcessServices'
interface SubProcessOption extends SubProcessI {}

const fetchSubProcessByLikeProcessAndInuse = (inputValue: string, productMainId: number, processId: number) =>
  new Promise<SubProcessOption[]>(resolve => {
    const param = {
      SUB_PROCESS_ID: `${inputValue}`,
      PRODUCT_MAIN_ID: `${productMainId}`,
      PROCESS_ID: `${processId}`
    }

    SubProcessServices.GetSubProcess(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
const fetchSubProcessWithoutProductMainAndProcess = (inputValue: string) =>
  new Promise<SubProcessOption[]>(resolve => {
    const param = {
      SUB_PROCESS_NAME: `${inputValue}`
    }

    SubProcessServices.getSubProcessWithoutProductMainAndProcess(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
const fetchSubProcessByProcess = (inputValue: string, processId: number) =>
  new Promise<SubProcessOption[]>(resolve => {
    const param = {
      SUB_PROCESS_NAME: `${inputValue}`,
      PROCESS_ID: `${processId}`
    }

    SubProcessServices.getSubProcessByProcess(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
export { fetchSubProcessByLikeProcessAndInuse, fetchSubProcessWithoutProductMainAndProcess, fetchSubProcessByProcess }
