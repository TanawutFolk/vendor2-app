import LocProjectServices from '@/_workspace/services/LocServices'
import { LocTypeI } from '@/_workspace/types/locProject'

export interface LocTypeOption extends LocTypeI {}

const fetchGetLocTypeByLikeLocTypeNameAndInuseOnlyProductionType = (inputValue: string) =>
  new Promise<LocTypeOption[]>(resolve => {
    const param = {
      LOC_CODE: inputValue
    }

    LocProjectServices.getLocTypeByLikeLocTypeNameAndInuseOnlyProductionType(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

export { fetchGetLocTypeByLikeLocTypeNameAndInuseOnlyProductionType }
