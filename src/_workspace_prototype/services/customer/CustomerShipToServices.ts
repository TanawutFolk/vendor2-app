import CustomerShipToAPI from '@/_workspace/api/customer/CustomerShipToAPI'
import axiosRequest from '@/libs/axios/axiosRequest'

export default class CustomerShipToServices {
  static create(CustomerShipToProperty: string) {
    return axiosRequest({
      url: `${CustomerShipToAPI.API_ROOT_URL}/create`,
      method: 'POST',
      data: CustomerShipToProperty
    })
  }

  static search(CustomerShipToProperty: string) {
    return axiosRequest({
      url: `${CustomerShipToAPI.API_ROOT_URL}/search`,
      method: 'POST',
      data: CustomerShipToProperty
    })
  }

  static get(CustomerShipToProperty: string) {
    return axiosRequest({
      url: `${CustomerShipToAPI.API_ROOT_URL}/get`,
      params: { data: JSON.stringify(CustomerShipToProperty) },
      method: 'GET'
    })
  }

  static update(CustomerShipToProperty: string) {
    return axiosRequest({
      url: `${CustomerShipToAPI.API_ROOT_URL}/update`,
      method: 'PATCH',
      data: CustomerShipToProperty
    })
  }

  static delete(CustomerShipToProperty: string) {
    return axiosRequest({
      url: `${CustomerShipToAPI.API_ROOT_URL}/delete`,
      data: CustomerShipToProperty,
      method: 'DELETE'
    })
  }

  static getByLikeProductMainNameAndInuse(params: object) {
    return axiosRequest({
      url: `${CustomerShipToAPI.API_ROOT_URL}/getByLikeProductMainNameAndInuse`,
      params: { data: JSON.stringify(params) },
      method: 'GET'
    })
  }
  static getByLikeProductCategoryNameAndInuse(params: object) {
    return axiosRequest({
      url: `${CustomerShipToAPI.API_ROOT_URL}/getByLikeProductCategoryNameAndInuse`,
      params: { data: JSON.stringify(params) },
      method: 'GET'
    })
  }
}
