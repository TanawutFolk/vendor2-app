import ThemeColorServices from '@/_workspace/services/theme-color/ThemeColorServices'
import { ThemeColorI } from '@/_workspace/types/theme-color/ThemeColor'

export interface ThemeColorOption extends ThemeColorI {}

const fetchGetThemeColor = (colorName: string) => {
  return new Promise<ThemeColorOption[]>(resolve => {
    const param = {
      COLOR_NAME: colorName
    }

    ThemeColorServices.getThemeColor(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
}

export { fetchGetThemeColor }
