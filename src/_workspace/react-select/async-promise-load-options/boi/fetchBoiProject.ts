import BoiProjectServices from '@/_workspace/services/boi/BoiProjectServices'
import type { BoiProjectI } from '@/_workspace/types/boi/BoiProject'

export interface BoiProjectOption extends BoiProjectI {}

const fetchBoiProjectByLikeBoiProjectAndInuse = (inputValue: string, inuse: number | '' = '') =>
  new Promise<BoiProjectOption[]>(resolve => {
    const param = {
      BOI_PROJECT_NAME: inputValue,
      INUSE: inuse
    }

    BoiProjectServices.getByLikeBoiProjectNameAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
const fetchBoiProjectCodeByLikeBoiProjectCodeAndInuse = (inputValue: string, inuse: number | '' = '') =>
  new Promise<BoiProjectOption[]>(resolve => {
    const param = {
      BOI_PROJECT_CODE: inputValue,
      INUSE: inuse
    }

    BoiProjectServices.getByLikeBoiProjectCodeAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
const fetchBoiProductGroupByLikeBoiProductGroupAndInuse = (inputValue: string, inuse: number | '' = '') =>
  new Promise<BoiProjectOption[]>(resolve => {
    const param = {
      BOI_PRODUCT_GROUP_NAME: inputValue,
      INUSE: inuse
    }

    BoiProjectServices.getByLikeBoiProductGroupAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
const fetchBoiProductGroupByLikeBoiProductGroup = (inputValue: string, inuse: number | '' = '') =>
  new Promise<BoiProjectOption[]>(resolve => {
    const param = {
      BOI_PRODUCT_GROUP_NAME: inputValue
    }

    BoiProjectServices.getBoiProjectGroupNameByLike(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
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

export {
  fetchBoiProductGroupByLikeBoiProductGroup,
  fetchBoiProductGroupByLikeBoiProductGroupAndInuse,
  fetchBoiProjectByLikeBoiProjectAndInuse,
  fetchBoiProjectCodeByLikeBoiProjectCodeAndInuse
}
