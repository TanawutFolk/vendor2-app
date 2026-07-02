import UnitOfMeasurementServices from '@/_workspace/services/unit/UnitOfMeasurementServices'

import { UnitOfMeasurementI } from '@/_workspace/types/unit/UnitOfMeasurement'

export interface UnitOfMeasurementOption extends UnitOfMeasurementI {}

const fetchSymbolBySymbolAndInuse = (symbol: string) =>
  new Promise<UnitOfMeasurementOption[]>(resolve => {
    const param = {
      SYMBOL: symbol,
      INUSE: 1
    }

    UnitOfMeasurementServices.getByLikeSymbol(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

export { fetchSymbolBySymbolAndInuse }
