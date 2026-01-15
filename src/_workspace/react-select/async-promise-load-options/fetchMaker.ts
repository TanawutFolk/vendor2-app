import MakerServices from '@/_workspace/services/item-master/MakerServices'
import { MakerI } from '@/_workspace/types/item-master/Maker'

export interface MakerOption extends MakerI {}

const fetchMakerByMakerNameAndInuse = (makerName: string) =>
  new Promise<MakerOption[]>(resolve => {
    const param = {
      MAKER_NAME: makerName,
      INUSE: 1
    }

    MakerServices.getByLikeMakerNameAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

export { fetchMakerByMakerNameAndInuse }
