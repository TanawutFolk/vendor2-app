import { FlowProcessI } from '@/_workspace/types/flow/FlowProcess'
import FlowProcessServices from '@/_workspace/services/flow/FlowProcessServices'
// import { FlowProcessI } from ''

interface ProcessOption extends FlowProcessI {}

const fetchProcessByFlowProcessId = (flowId: string) =>
  new Promise<ProcessOption[]>(resolve => {
    const param = {
      FLOW_ID: flowId
    }

    FlowProcessServices.searchProcessByFlowProcessId(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

const fetchFlowByLikeFlowNameAndInuse = (inputValue: string, inuse: number | '' = '') =>
  new Promise<ProcessOption[]>(resolve => {
    const param = {
      FLOW_NAME: `${inputValue}`,
      INUSE: `${inuse}`
    }
    FlowProcessServices.getByLikeFlowNameAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

const fetchFlowByLikeFlowNameAndProductMainIdAndInuse = (
  inputValue: string,
  inuse: number | '' = '',
  productMainId: number
) =>
  new Promise<ProcessOption[]>(resolve => {
    const param = {
      FLOW_NAME: `${inputValue}`,
      INUSE: `${inuse}`,
      PRODUCT_MAIN_ID: `${productMainId}`
    }

    FlowProcessServices.getByLikeFlowNameAndProductMainIdAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

const fetchFlowByLikeFlowCodeAndInuse = ({ flowCode, inuse = '' }: { flowCode: string; inuse: number | '' }) =>
  new Promise<ProcessOption[]>(resolve => {
    const param = {
      FLOW_CODE: `${flowCode}`,
      INUSE: `${inuse}`
    }
    FlowProcessServices.getByLikeFlowCodeAndInuse(param)
      .then(responseJson => {
        resolve(responseJson?.data?.ResultOnDb ?? [])
      })
      .catch(error => console.log(error))
  })

export {
  fetchProcessByFlowProcessId,
  fetchFlowByLikeFlowNameAndInuse,
  fetchFlowByLikeFlowNameAndProductMainIdAndInuse,
  fetchFlowByLikeFlowCodeAndInuse
}
