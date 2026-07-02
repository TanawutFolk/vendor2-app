import EnvironmentCertificateAPI from '@/_workspace/api/environment-certificate/EnvironmentCertificateAPI'
import AxiosRequest from '@/libs/axios/axiosRequest'

export default class EnvironmentCertificateServices {
  static create(ProductMainProperty: string) {
    return AxiosRequest({
      url: `${EnvironmentCertificateAPI.API_ROOT_URL}/create`,
      method: 'POST',
      data: ProductMainProperty
    })
  }

  static search(params: string) {
    return AxiosRequest({
      url: `${EnvironmentCertificateAPI.API_ROOT_URL}/search`,
      params,
      method: 'GET'
    })
  }

  static get(ProductMainProperty: string) {
    return AxiosRequest({
      url: `${EnvironmentCertificateAPI.API_ROOT_URL}/get`,
      params: { data: JSON.stringify(ProductMainProperty) },
      method: 'GET'
    })
  }

  static update(ProductMainProperty: string) {
    return AxiosRequest({
      url: `${EnvironmentCertificateAPI.API_ROOT_URL}/update`,
      method: 'PATCH',
      data: ProductMainProperty
    })
  }

  static delete(ProductMainProperty: string) {
    return AxiosRequest({
      url: `${EnvironmentCertificateAPI.API_ROOT_URL}/delete`,
      data: ProductMainProperty,
      method: 'DELETE'
    })
  }

  static getByLikeEnvironmentCertificateNameAndInuse(params: object) {
    return AxiosRequest({
      url: `${EnvironmentCertificateAPI.API_ROOT_URL}/getByLikeEnvironmentCertificateNameAndInuse`,
      params,
      method: 'GET'
    })
  }

  static getAllByLikeInuse(data: object) {
    return AxiosRequest({
      url: `${EnvironmentCertificateAPI.API_ROOT_URL}/getAllByLikeInuse`,
      method: 'POST',
      data: data
    })
  }
}
