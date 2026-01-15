import UnitOfMeasurementAPI from '@/_workspace/api/unit/UnitOfMeasurementAPI'
import { ReturnApiSearchUnitOfMeasurementI } from '@/app/[lang]/(_workspace)/(units)/unit-of-measurement/UnitOfMeasurementTableData'
import axiosRequest from '@/libs/axios/axiosRequest'

export default class UnitOfMeasurementServices {
  static getByLikeSymbol(params: any) {
    return axiosRequest({
      url: `${UnitOfMeasurementAPI.API_ROOT_URL}/getByLikeSymbol`,
      params,
      method: 'GET'
    })
  }

  static SearchUnitOfMeasurement(property: ReturnApiSearchUnitOfMeasurementI) {
    return axiosRequest({
      url: `${UnitOfMeasurementAPI.API_ROOT_URL}/search`,
      data: property,
      method: 'POST'
    })
  }

  static createUnitOfMeasurement(property: string) {
    return axiosRequest({
      url: `${UnitOfMeasurementAPI.API_ROOT_URL}/create`,
      data: property,
      method: 'POST'
    })
  }

  static updateUnitOfMeasurement(property: string) {
    return axiosRequest({
      url: `${UnitOfMeasurementAPI.API_ROOT_URL}/update`,
      data: property,
      method: 'PATCH'
    })
  }

  static deleteUnitOfMeasurement(property: string) {
    return axiosRequest({
      url: `${UnitOfMeasurementAPI.API_ROOT_URL}/delete`,
      data: property,
      method: 'DELETE'
    })
  }
}
