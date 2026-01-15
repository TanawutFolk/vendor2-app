import axiosRequest from '@/libs/axios/axiosRequest'
import _CostConditionAPI from '@/_workspace/api/cost-condition/_CostConditionAPI'

export default class _CostConditionServices {
  static getAllByProductMainIdAndFiscalYear_MasterDataLatest(dataItem: object) {
    return axiosRequest({
      url: `${_CostConditionAPI.API_ROOT_URL}/getAllByProductMainIdAndFiscalYear_MasterDataLatest`,
      data: dataItem,
      method: 'post'
    })
  }
}
