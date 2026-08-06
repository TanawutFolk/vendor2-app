import type { AxiosProgressEvent } from 'axios'

import BlacklistAPI from '@/_workspace/api/_black-list/BlacklistAPI'
import axiosRequest from '@/libs/axios/axiosRequest'

export default class BlacklistServices {
  static search(BlacklistProperty: object) {
    return axiosRequest({
      url: `${BlacklistAPI.API_ROOT_URL}/search`,
      method: 'POST',
      data: BlacklistProperty
    })
  }

  static importFileUS(formData: FormData, onUploadProgress?: (progressEvent: AxiosProgressEvent) => void) {
    return axiosRequest({
      url: `${BlacklistAPI.API_ROOT_URL}/us/import`,
      method: 'POST',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress
    })
  }

  static importFileCN(formData: FormData, onUploadProgress?: (progressEvent: AxiosProgressEvent) => void) {
    return axiosRequest({
      url: `${BlacklistAPI.API_ROOT_URL}/cn/import`,
      method: 'POST',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress
    })
  }
}
