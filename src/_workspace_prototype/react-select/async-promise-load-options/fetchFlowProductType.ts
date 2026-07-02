import FlowProductTypeServices from '@/_workspace/services/flow/FlowProductTypeServices'
import { ProductTypeI } from '@/_workspace/types/productGroup/ProductType'

interface ProductTypeOption extends ProductTypeI {}

const fetchFlowProductTypeByFlowId = (flowId: string) =>
  new Promise<ProductTypeOption[]>(resolve => {
    const param = {
      FLOW_ID: flowId
    }

    FlowProductTypeServices.searchFlowProductTypeByFlowId(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

export { fetchFlowProductTypeByFlowId }
