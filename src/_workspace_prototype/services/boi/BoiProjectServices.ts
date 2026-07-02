import BoiProjectAPI from '@/_workspace/api/boi/BoiProjectAPI'
import AxiosRequest from '@/libs/axios/axiosRequest'

export default class BoiProjectServices {
  static create(ProductMainProperty: string) {
    return AxiosRequest({
      url: `${BoiProjectAPI.API_ROOT_URL}/create`,
      method: 'POST',
      data: ProductMainProperty
    })
  }

  static search(ProductMainProperty: string) {
    return AxiosRequest({
      url: `${BoiProjectAPI.API_ROOT_URL}/search`,
      method: 'POST',
      data: ProductMainProperty
    })
  }

  static get(ProductMainProperty: string) {
    return AxiosRequest({
      url: `${BoiProjectAPI.API_ROOT_URL}/get`,
      params: { data: JSON.stringify(ProductMainProperty) },
      method: 'GET'
    })
  }

  static update(ProductMainProperty: string) {
    return AxiosRequest({
      url: `${BoiProjectAPI.API_ROOT_URL}/update`,
      method: 'PATCH',
      data: ProductMainProperty
    })
  }

  static delete(ProductMainProperty: string) {
    return AxiosRequest({
      url: `${BoiProjectAPI.API_ROOT_URL}/delete`,
      data: ProductMainProperty,
      method: 'DELETE'
    })
  }

  static getByLikeBoiProjectNameAndInuse(params: object) {
    return AxiosRequest({
      url: `${BoiProjectAPI.API_ROOT_URL}/getByLikeBoiProjectNameAndInuse`,
      params,
      method: 'GET'
    })
  }
  static getByLikeBoiProjectCodeAndInuse(params: object) {
    return AxiosRequest({
      url: `${BoiProjectAPI.API_ROOT_URL}/getByLikeBoiProjectCodeAndInuse`,
      params,
      method: 'GET'
    })
  }
  static getByLikeBoiProductGroupAndInuse(params: object) {
    return AxiosRequest({
      url: `${BoiProjectAPI.API_ROOT_URL}/getByLikeBoiProductGroupAndInuse`,
      params,
      method: 'GET'
    })
  }
  static getBoiProjectGroupNameByLike(params: object) {
    return AxiosRequest({
      url: `${BoiProjectAPI.API_ROOT_URL}/getBoiProjectGroupNameByLike`,
      params,
      method: 'GET'
    })
  }
}
