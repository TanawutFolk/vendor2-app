import ShapeServices from '@/_workspace/services/item-master/item-property/ShapeServices'
import { ShapeI } from '@/_workspace/types/item-master/item-property/Shape'

export interface ShapeOption extends ShapeI {}

const fetchShapeByShapeNameAndInuse = (shapeName: string) =>
  new Promise<ShapeOption[]>(resolve => {
    const param = {
      ITEM_PROPERTY_SHAPE_NAME: shapeName,
      INUSE: 1
    }

    ShapeServices.getByLikeShapeNameAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

export { fetchShapeByShapeNameAndInuse }
