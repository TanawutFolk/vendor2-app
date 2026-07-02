import BoiUnitAPI from '@/_workspace/api/boi/BoiUnitAPI'
import AxiosRequest from '@/libs/axios/axiosRequest'

export default class BoiUnitServices {
  static create(ProductMainProperty: string) {
    return AxiosRequest({
      url: `${BoiUnitAPI.API_ROOT_URL}/create`,
      method: 'POST',
      data: ProductMainProperty
    })
  }

  static search(ProductMainProperty: string) {
    return AxiosRequest({
      url: `${BoiUnitAPI.API_ROOT_URL}/search`,
      method: 'POST',
      data: ProductMainProperty
    })
  }

  static get(ProductMainProperty: string) {
    return AxiosRequest({
      url: `${BoiUnitAPI.API_ROOT_URL}/get`,
      params: { data: JSON.stringify(ProductMainProperty) },
      method: 'GET'
    })
  }

  static update(ProductMainProperty: string) {
    return AxiosRequest({
      url: `${BoiUnitAPI.API_ROOT_URL}/update`,
      method: 'PATCH',
      data: ProductMainProperty
    })
  }

  static delete(ProductMainProperty: string) {
    return AxiosRequest({
      url: `${BoiUnitAPI.API_ROOT_URL}/delete`,
      data: ProductMainProperty,
      method: 'DELETE'
    })
  }

  static getByLikeSymbol(params: object) {
    return AxiosRequest({
      url: `${BoiUnitAPI.API_ROOT_URL}/getByLikeSymbol`,
      params,
      method: 'GET'
    })
  }
  static getByLikeBoiProjectNameAndInuse(params: object) {
    return AxiosRequest({
      url: `${BoiUnitAPI.API_ROOT_URL}/getByLikeBoiProjectNameAndInuse`,
      params,
      method: 'GET'
    })
  }
  static getByLikeBoiUnitNameAndInuse(params: object) {
    return AxiosRequest({
      url: `${BoiUnitAPI.API_ROOT_URL}/getByLikeBoiUnitNameAndInuse`,
      params,
      method: 'GET'
    })
  }
  static getByLikeBoiSymbolAndInuse(params: object) {
    return AxiosRequest({
      url: `${BoiUnitAPI.API_ROOT_URL}/getByLikeBoiSymbolAndInuse`,
      params,
      method: 'GET'
    })
  }

  // static getByLikeProductMainNameAndProductCategoryIdAndInuse(params: object) {
  //   return AxiosRequest({
  //     url: `${ProductMainAPI.API_ROOT_URL}/getByLikeProductMainNameAndProductCategoryIdAndInuse`,
  //     params,
  //     method: 'GET'
  //   })
  // }
}
