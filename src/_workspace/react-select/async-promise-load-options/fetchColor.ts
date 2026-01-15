import ColorServices from '@/_workspace/services/item-master/item-property/ColorServices'
import { ColorI } from '@/_workspace/types/item-master/item-property/Color'

export interface ColorOption extends ColorI {}

const fetchColorByColorNameAndInuse = (colorName: string) =>
  new Promise<ColorOption[]>(resolve => {
    const param = {
      ITEM_PROPERTY_COLOR_NAME: colorName,
      INUSE: 1
    }

    ColorServices.getByLikeColorNameAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

export { fetchColorByColorNameAndInuse }
