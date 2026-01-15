import AccountDepartmentCodeAPI from '@/_workspace/api/account/AccountDepartmentCodeAPI'
import axiosRequest from '@/libs/axios/axiosRequest'

export default class AccountDepartmentCodeServices {
  static create(AccountDepartmentCodeProperty: string) {
    return axiosRequest({
      url: `${AccountDepartmentCodeAPI.API_ROOT_URL}/create`,
      method: 'POST',
      data: AccountDepartmentCodeProperty
    })
  }

  static search(AccountDepartmentCodeProperty: string) {
    return axiosRequest({
      url: `${AccountDepartmentCodeAPI.API_ROOT_URL}/search`,
      method: 'POST',
      data: AccountDepartmentCodeProperty
    })
  }

  static get(AccountDepartmentCodeProperty: string) {
    return axiosRequest({
      url: `${AccountDepartmentCodeAPI.API_ROOT_URL}/get`,
      params: { data: JSON.stringify(AccountDepartmentCodeProperty) },
      method: 'GET'
    })
  }

  static update(AccountDepartmentCodeProperty: string) {
    return axiosRequest({
      url: `${AccountDepartmentCodeAPI.API_ROOT_URL}/update`,
      method: 'PATCH',
      data: AccountDepartmentCodeProperty
    })
  }

  static delete(AccountDepartmentCodeProperty: string) {
    return axiosRequest({
      url: `${AccountDepartmentCodeAPI.API_ROOT_URL}/delete`,
      data: AccountDepartmentCodeProperty,
      method: 'DELETE'
    })
  }

  static getByLikeAccountDepartmentCodeAndInuse(params: object) {
    return axiosRequest({
      url: `${AccountDepartmentCodeAPI.API_ROOT_URL}/getByLikeAccountDepartmentCodeAndInuse`,
      params,
      method: 'GET'
    })
  }
}
