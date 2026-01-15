import SctTagSettingServices from '@/_workspace/services/sct/SctTagSettingServices'
import { SctTagSettingI } from '@/_workspace/types/sct/SctTagSetting'

export interface SctTagSettingOption extends SctTagSettingI {}

const fetchSctTagByLikeSctTagNameAndInuse = (inputValue: string, inuse: number) =>
  new Promise<SctTagSettingOption[]>(resolve => {
    const param = {
      SCT_TAG_SETTING_NAME: inputValue,
      INUSE: inuse
    }
    SctTagSettingServices.getByLikeSctTagSettingNameAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

export { fetchSctTagByLikeSctTagNameAndInuse }
