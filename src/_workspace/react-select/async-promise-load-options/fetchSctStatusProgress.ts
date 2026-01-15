import SctStatusProgressServices from '@/_workspace/services/sct/SctStatusProgressServices'
import { SctStatusProgress } from '@/_workspace/types/sct/SctStatusProgress'

export interface SctStatusProgressOption extends SctStatusProgress {
  isDisabled?: boolean
}

export const fetchSctStatusProgressNameAndInuse = ({
  sctStatusProgressName,
  inuse = ''
}: {
  sctStatusProgressName: string
  inuse: number | ''
}) =>
  new Promise<SctStatusProgressOption[]>(resolve => {
    const param = {
      SCT_STATUS_PROGRESS_NAME: sctStatusProgressName,
      INUSE: inuse
    }

    SctStatusProgressServices.getByLikeSctStatusProgressNameAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

export const fetchSctStatusProgressNameAndInuse_withDisabledOption = ({
  listStatusSctProgress,
  inputValue,
  inuse = ''
}: {
  listStatusSctProgress: {
    SCT_STATUS_PROGRESS_ID: number
  }[]
  inuse: number | ''
  inputValue: string
}) =>
  new Promise<SctStatusProgressOption[]>(resolve => {
    const param = {
      listStatusSctProgress,
      INUSE: inuse,
      SCT_STATUS_PROGRESS_NAME: inputValue
    }

    SctStatusProgressServices.getBySctStatusProgressNameAndInuse_withDisabledOption(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
