import SctForProductAPI from '@/_workspace/api/standard-cost/SctForProductAPI'
import StandardCostAPI from '@/_workspace/api/standard-cost/StandardCostAPI'
import AxiosRequest from '@/libs/axios/axiosRequest'

export default class StandardCostServices {
  static getByLikeSctPatternName(property: any) {
    return AxiosRequest({
      url: `${StandardCostAPI.API_ROOT_URL}/getByLikeSctPatternName`,
      data: property,
      method: 'POST'
    })
  }

  static getSctByLikeProductTypeIdAndCondition(property: any) {
    return AxiosRequest({
      url: `${StandardCostAPI.API_ROOT_URL}/getSctByLikeProductTypeIdAndCondition`,
      data: property,
      method: 'POST'
    })
  }
  static getSctByLikeProductTypeCodeAndCondition(property: any) {
    return AxiosRequest({
      url: `${SctForProductAPI.API_ROOT_URL}/getSctByLikeProductTypeCodeAndCondition`,
      data: property,
      method: 'POST'
    })
  }

  static searchSctCodeForSelectionMaterialPrice(property: any) {
    return AxiosRequest({
      url: `${StandardCostAPI.API_ROOT_URL}/searchSctCodeForSelectionMaterialPrice`,
      data: property,
      method: 'POST'
    })
  }

  static searchSct(property: any) {
    return AxiosRequest({
      url: `${StandardCostAPI.API_ROOT_URL}/searchSct`,
      data: JSON.stringify(property),
      method: 'POST'
    })
  }

  static searchSctCodeForSelection(params: any) {
    return AxiosRequest({
      url: `${StandardCostAPI.API_ROOT_URL}/searchSctCodeForSelection`,
      params,
      method: 'GET'
    })
  }

  static searchSctByItemCode(property: any) {
    return AxiosRequest({
      url: `${StandardCostAPI.API_ROOT_URL}/searchSctByItemCode`,
      data: JSON.stringify(property),
      method: 'POST'
    })
  }

  static searchSctBySctSelectedWithCondition(property: any) {
    return AxiosRequest({
      url: `${StandardCostAPI.API_ROOT_URL}/searchSctBySctSelectedWithCondition`,
      data: JSON.stringify(property),
      method: 'POST'
    })
  }

  static get(data: object) {
    return AxiosRequest({
      url: `${StandardCostAPI.API_ROOT_URL}/get`,
      data,
      method: 'POST'
    })
  }
}
