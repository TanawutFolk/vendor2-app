import SctReasonSettingServices from '@/_workspace/services/sct/SctReasonSettingServices'
import { SctReasonSettingI } from '@/_workspace/types/sct/SctReasonSetting'

//export interface SctReasonSettingOption extends SctReasonSettingI {}

const fetchSctReasonByLikeSctReasonNameAndInuse = (inputValue: string, inuse: number) =>
  new Promise<SctReasonSettingI[]>(resolve => {
    const param = {
      SCT_REASON_SETTING_NAME: inputValue,
      INUSE: inuse
    }
    SctReasonSettingServices.getByLikeSctReasonSettingNameAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

export { fetchSctReasonByLikeSctReasonNameAndInuse }
