import ThemeColorAPI from '@/_workspace/api/theme-color/ThemeColorAPI'
import axiosRequest from '@/libs/axios/axiosRequest'

export default class ThemeColorServices {
  static getThemeColor(params: any) {
    return axiosRequest({
      url: `${ThemeColorAPI.API_ROOT_URL}/getThemeColor`,
      params,
      method: 'GET'
    })
  }
}
