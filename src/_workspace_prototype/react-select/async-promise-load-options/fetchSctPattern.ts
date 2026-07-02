import SctPatternServices from '@/_workspace/services/sct/SctPatternServices'
import { SctPatternI } from '@/_workspace/types/sct/SctPattern'

export interface SctPatternOption extends SctPatternI {
  SCT_PATTERN_NAME: string
  SCT_PATTERN_ID: number
}

export const fetchSctPatternByLikePatternNameAndInuse = (inputValue: string, inuse: number | '' = '') =>
  new Promise<SctPatternOption[]>(resolve => {
    const param = {
      SCT_PATTERN_NAME: inputValue,
      INUSE: inuse
    }

    SctPatternServices.getByLikePatternNameAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
