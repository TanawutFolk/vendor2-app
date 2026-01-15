import CustomerOrderFromAPI from '@/_workspace/api/customer/CustomerOrderFromAPI'
import axiosRequest from '@/libs/axios/axiosRequest'

export default class CustomerOrderFromServices {
  static create(CustomerOrderFromProperty: string) {
    return axiosRequest({
      url: `${CustomerOrderFromAPI.API_ROOT_URL}/create`,
      method: 'POST',
      data: CustomerOrderFromProperty
    })
  }

  static search(CustomerOrderFromProperty: string) {
    return axiosRequest({
      url: `${CustomerOrderFromAPI.API_ROOT_URL}/search`,
      method: 'POST',
      data: CustomerOrderFromProperty
    })
  }

  static get(CustomerOrderFromProperty: string) {
    return axiosRequest({
      url: `${CustomerOrderFromAPI.API_ROOT_URL}/get`,
      params: { data: JSON.stringify(CustomerOrderFromProperty) },
      method: 'GET'
    })
  }

  static update(CustomerOrderFromProperty: string) {
    return axiosRequest({
      url: `${CustomerOrderFromAPI.API_ROOT_URL}/update`,
      method: 'PATCH',
      data: CustomerOrderFromProperty
    })
  }

  static delete(CustomerOrderFromProperty: string) {
    return axiosRequest({
      url: `${CustomerOrderFromAPI.API_ROOT_URL}/delete`,
      data: CustomerOrderFromProperty,
      method: 'DELETE'
    })
  }

  static getByLikeCustomerOrderFromNameAndInuse(params: object) {
    return axiosRequest({
      url: `${CustomerOrderFromAPI.API_ROOT_URL}/getByLikeCustomerOrderFromNameAndInuse`,
      params,
      method: 'GET'
    })
  }
  // static getByLikeProductCategoryNameAndInuse(params: object) {
  //   return axiosRequest({
  //     url: `${CustomerOrderFromAPI.API_ROOT_URL}/getByLikeProductCategoryNameAndInuse`,
  //     params: { data: JSON.stringify(params) },
  //     method: 'GET'
  //   })
  // }
}
