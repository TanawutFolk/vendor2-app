import ProductMainServices from '@/_workspace/services/productGroup/ProductMainServices'
import ProductionPurposeServices from '@/_workspace/services/production-purpose/ProductionPurposeServices'
import { ProductionPurposeI } from '@/_workspace/types/production-purpose/ProductionPurpose'

export interface ProductionPurposeOption extends ProductionPurposeI {}

const fetchProductionPurposeByProductionPurposeNameAndInuse = (inputValue: string, inuse: number | '' = '') =>
  new Promise<ProductionPurposeOption[]>(resolve => {
    const param = {
      PRODUCTION_PURPOSE_NAME: inputValue,
      INUSE: inuse
    }

    ProductionPurposeServices.getByLikeProductionPurposeNameAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

export { fetchProductionPurposeByProductionPurposeNameAndInuse }
