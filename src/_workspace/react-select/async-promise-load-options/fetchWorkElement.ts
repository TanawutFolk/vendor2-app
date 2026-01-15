import WorkElementServices from '@/_workspace/services/WorkElementServices'
import { WorkElementInterface } from '@/_workspace/types/WorkElementType'

interface WorkElementOption extends WorkElementInterface {}

const fetchWorkElement = (inputValue: string, productMainId: number) =>
  new Promise<WorkElementOption[]>(resolve => {
    console.log('PARAMS', productMainId)
    const param = {
      WORK_ELEMENT_NAME: `${inputValue}`,
      PRODUCT_MAIN_ID: `${productMainId}`
    }

    WorkElementServices.getWorkElement(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
export { fetchWorkElement }
