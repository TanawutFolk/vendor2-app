import type { BoiUnitI } from '@/_workspace/types/boi/BoiUnit'
import BoiUnitServices from '@/_workspace/services/boi/BoiUnitServices'

export interface BoiUnitOption extends BoiUnitI {}

const fetchBoiUnitNameByLikeBoiUnitNameAndInuse = (inputValue: string, inuse: number | '' = '') =>
  new Promise<BoiUnitOption[]>(resolve => {
    const param = {
      BOI_UNIT_NAME: inputValue,
      INUSE: inuse
    }

    BoiUnitServices.getByLikeBoiUnitNameAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
const fetchBoiUnitSymbolByLikeBoiUnitSymbolAndInuse = (inputValue: string, inuse: number | '' = '') =>
  new Promise<BoiUnitOption[]>(resolve => {
    const param = {
      BOI_UNIT_SYMBOL: inputValue,
      INUSE: inuse
    }

    BoiUnitServices.getByLikeBoiSymbolAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
const fetchBoiUnit = (inputValue: string, inuse: number | '' = '') =>
  new Promise<BoiUnitOption[]>(resolve => {
    const param = {
      BOI_UNIT_SYMBOL: inputValue,
      INUSE: inuse
    }

    BoiUnitServices.getByLikeSymbol(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

// const fetchBoiProductGroupByLikeBoiProductGroupAndInuse = (inputValue: string, inuse: number | '' = '') =>
//   new Promise<BoiUnitOption[]>(resolve => {
//     const param = {
//       BOI_PRODUCT_GROUP_NAME: inputValue,
//       INUSE: inuse
//     }

//     BoiProjectServices.getByLikeBoiProductGroupAndInuse(param)
//       .then(responseJson => {
//         resolve(responseJson.data.ResultOnDb)
//       })
//       .catch(error => console.log(error))
//   })
// const fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse = (
//   inputValue: string,
//   inuse: number | '',
//   productCategory: number | '' = ''
// ) =>
//   new Promise<ProductMainOption[]>(resolve => {
//     const param = {
//       PRODUCT_MAIN_NAME: inputValue,
//       INUSE: inuse,
//       PRODUCT_CATEGORY_ID: productCategory
//     }
//     console.log('input', inputValue)
//     // console.log();

//     ProductMainServices.getByLikeProductMainNameAndProductCategoryIdAndInuse(param)
//       .then(responseJson => {
//         resolve(responseJson.data.ResultOnDb)
//       })
//       .catch(error => console.log(error))
//   })

export { fetchBoiUnit, fetchBoiUnitNameByLikeBoiUnitNameAndInuse, fetchBoiUnitSymbolByLikeBoiUnitSymbolAndInuse }
