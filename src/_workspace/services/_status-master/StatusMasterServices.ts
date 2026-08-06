import type { AxiosResponse } from 'axios'

import axiosRequest from '@/libs/axios/axiosRequest'
import StatusMasterAPI from '@/_workspace/api/_status-master/StatusMasterAPI'
import type {
  StatusMasterResponseI,
  StatusMasterType
} from '@/_workspace/types/StatusMasterTypes'

export default class StatusMasterServices {
  static getStatusMasters(data: {
    MASTER_TYPE: StatusMasterType
  }): Promise<AxiosResponse<StatusMasterResponseI>> {
    return axiosRequest<StatusMasterResponseI>({
      url: `${StatusMasterAPI.API_ROOT_URL}/getStatusMasters`,
      data,
      method: 'POST'
    })
  }
}
