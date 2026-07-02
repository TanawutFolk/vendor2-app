import StandardCostForProductServices from '@/_workspace/services/sct/StandardCostForProductServices'
import { SctStatusProgress } from '@/_workspace/types/sct/SctStatusProgress'

export interface SctStatusProgressOption extends SctStatusProgress {}

export const fetchSctReCalButton = ({
  SCT_ID,
  FISCAL_YEAR,
  SCT_PATTERN_ID,
  SCT_STATUS_PROGRESS_ID,
  IS_REFRESH_DATA_MASTER,
  SELLING_PRICE,
  SCT_REASON_SETTING_ID,
  SCT_TAG_SETTING_ID
}: {
  SCT_ID: string
  FISCAL_YEAR: number
  SCT_PATTERN_ID: number
  SCT_STATUS_PROGRESS_ID: number
  IS_REFRESH_DATA_MASTER: boolean
  SELLING_PRICE: number
  SCT_REASON_SETTING_ID: number
  SCT_TAG_SETTING_ID: number
}) =>
  new Promise<SctStatusProgressOption[]>(resolve => {
    const param = {
      SCT_ID: SCT_ID,
      FISCAL_YEAR: FISCAL_YEAR,
      SCT_PATTERN_ID: SCT_PATTERN_ID,
      SCT_STATUS_PROGRESS_ID: SCT_STATUS_PROGRESS_ID,
      IS_REFRESH_DATA_MASTER: IS_REFRESH_DATA_MASTER,
      SELLING_PRICE: SELLING_PRICE,
      SCT_REASON_SETTING_ID: SCT_REASON_SETTING_ID,
      SCT_TAG_SETTING_ID: SCT_TAG_SETTING_ID
    }

    StandardCostForProductServices.getSctReCalButton(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
