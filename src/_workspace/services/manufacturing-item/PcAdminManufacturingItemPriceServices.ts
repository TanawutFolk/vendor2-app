import AxiosRequest from '@/libs/axios/axiosRequest'

import PcAdminManufacturingItemPriceAPI from '@/_workspace/api/manufacturing-item/PcAdminManufacturingItemPriceAPI'

export default class PcAdminManufacturingItemPriceServices {
  // Main Services

  static create(dataItem: Record<string, any>) {
    return AxiosRequest({
      url: `${PcAdminManufacturingItemPriceAPI.API_ROOT_URL}/create`,
      method: 'POST',
      data: dataItem
    })
  }
}
