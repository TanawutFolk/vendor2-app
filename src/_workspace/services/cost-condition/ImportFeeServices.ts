import ImportFeeAPI from '@/_workspace/api/cost-condition/ImportFeeAPI'
import { ImportFeeI } from '@/_workspace/types/cost-condition/ImportFee'
import axiosRequest from '@/libs/axios/axiosRequest'
import { ResultDataResponseI } from '@/libs/axios/types/AxiosResponseInterface'

export default class ImportFeeServices {
  static search(params: object) {
    return axiosRequest({
      url: `${ImportFeeAPI.API_ROOT_URL}/search`,
      data: params,
      method: 'POST'
    })
  }

  static create(property: object) {
    return axiosRequest({
      url: `${ImportFeeAPI.API_ROOT_URL}/create`,
      data: property,
      method: 'POST'
    })
  }

  static getByFiscalYear_MasterDataLatest(data: { FISCAL_YEAR: number }) {
    return axiosRequest<ResultDataResponseI<ImportFeeI>>({
      url: `${ImportFeeAPI.API_ROOT_URL}/getByFiscalYear_MasterDataLatest`,
      data,
      method: 'POST'
    })
  }
}
