import CustomerInvoiceToAPI from '@/_workspace/api/customer/CustomerInvoiceToAPI'
import axiosRequest from '@/libs/axios/axiosRequest'

export default class CustomerInvoiceToServices {
  static create(CustomerOrderFromProperty: string) {
    return axiosRequest({
      url: `${CustomerInvoiceToAPI.API_ROOT_URL}/create`,
      method: 'POST',
      data: CustomerOrderFromProperty
    })
  }

  static search(CustomerOrderFromProperty: string) {
    return axiosRequest({
      url: `${CustomerInvoiceToAPI.API_ROOT_URL}/search`,
      method: 'POST',
      data: CustomerOrderFromProperty
    })
  }

  static get(CustomerOrderFromProperty: string) {
    return axiosRequest({
      url: `${CustomerInvoiceToAPI.API_ROOT_URL}/get`,
      params: { data: JSON.stringify(CustomerOrderFromProperty) },
      method: 'GET'
    })
  }

  static update(CustomerOrderFromProperty: string) {
    return axiosRequest({
      url: `${CustomerInvoiceToAPI.API_ROOT_URL}/update`,
      method: 'PATCH',
      data: CustomerOrderFromProperty
    })
  }

  static delete(CustomerOrderFromProperty: string) {
    return axiosRequest({
      url: `${CustomerInvoiceToAPI.API_ROOT_URL}/delete`,
      data: CustomerOrderFromProperty,
      method: 'DELETE'
    })
  }
  static getByLikeCustomerInvoiceToAndInuse(params: object) {
    return axiosRequest({
      url: `${CustomerInvoiceToAPI.API_ROOT_URL}/getByLikeCustomerInvoiceToName`,
      data: params,
      method: 'POST'
    })
  }
  static getByLikeCustomerInvoiceToAlphabet(params: object) {
    return axiosRequest({
      url: `${CustomerInvoiceToAPI.API_ROOT_URL}/getByLikeCustomerInvoiceToAlphabet`,
      data: params,
      method: 'POST'
    })
  }

  static getByLikeCustomerInvoiceToAlphabetAndInuse(params: object) {
    return axiosRequest({
      url: `${CustomerInvoiceToAPI.API_ROOT_URL}/getByLikeCustomerInvoiceToAlphabetAndInuse`,
      data: params,
      method: 'POST'
    })
  }
}
