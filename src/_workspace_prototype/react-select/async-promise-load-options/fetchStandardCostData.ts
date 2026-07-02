import StandardCostServices from '@/_workspace/services/sct/StandardCostServices'
import { SctPatternI } from '@/_workspace/types/sct/SctPattern'
import { StandardCostI } from '@/_workspace/types/sct/StandardCostType'

const fetchSctPatternNameBySctPatternName = (inputValue: string, inuse: number | '' = '') =>
  new Promise<SctPatternI[]>(resolve => {
    const param = {
      SCT_PATTERN_NAME: `${inputValue}`
    }

    StandardCostServices.getByLikeSctPatternName(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

const fetchSctByLikeProductTypeIdAndCondition = (dataItem: { PRODUCT_TYPE_ID: number; CONDITION: string }) =>
  new Promise(resolve => {
    StandardCostServices.getSctByLikeProductTypeIdAndCondition(dataItem)
      .then(responseJson => {
        resolve(
          responseJson.data.ResultOnDb?.[0] || {
            error: true,
            message: 'No data found'
          }
        )
      })
      .catch(error => {
        resolve({
          error: true,
          message: 'Please Select Fiscal Year and SCT Pattern'
        })
      })
  })
const fetchSctByLikeProductTypeCodeAndCondition = (dataItem: {
  PRODUCT_TYPE_CODE: string
  CONDITION: 'SCT_LATEST_REVISION' | 'MES' | 'BUDGET' | 'PRICE'
  FISCAL_YEAR: number
  SCT_PATTERN_ID: number
}) =>
  new Promise<StandardCostI>(resolve => {
    StandardCostServices.getSctByLikeProductTypeCodeAndCondition(dataItem)
      .then(responseJson => {
        resolve(
          responseJson.data.ResultOnDb?.[0] ?? {
            error: true,
            message: 'No data found'
          }
        )
      })
      .catch(error => {
        resolve({
          error: true,
          message: 'Please Select Fiscal Year and SCT Pattern'
        })
      })
  })

export {
  fetchSctPatternNameBySctPatternName,
  fetchSctByLikeProductTypeIdAndCondition,
  fetchSctByLikeProductTypeCodeAndCondition
}
