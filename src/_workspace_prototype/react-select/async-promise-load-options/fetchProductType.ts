import ProductTypeServices from '@/_workspace/services/productGroup/ProductTypeServices'
import { ProductTypeI } from '@/_workspace/types/productGroup/ProductType'

export interface ProductTypeOption extends ProductTypeI {
  ITEM_CATEGORY_NAME: string
  ITEM_CATEGORY_ID: number
  PRODUCT_SPECIFICATION_TYPE_NAME: string
  PRODUCT_SPECIFICATION_TYPE_ALPHABET: string
}

const fetchProductTypeByLikeProductTypeCodeAndProductMainIdAndInuse = (
  inputValue: string,
  productMainId: number,
  inuse: number | '' = ''
) =>
  new Promise<ProductTypeOption[]>(resolve => {
    const param = {
      PRODUCT_TYPE_CODE: inputValue,
      PRODUCT_MAIN_ID: productMainId,
      INUSE: inuse
    }

    ProductTypeServices.getByLikeProductTypeCodeAndProductMainIdAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
const fetchProductTypeByLikeProductTypeNameAndProductMainIdAndInuse = (
  inputValue: string,
  productMainId: number,
  inuse: number | '' = ''
) =>
  new Promise<ProductTypeOption[]>(resolve => {
    const param = {
      PRODUCT_TYPE_NAME: inputValue,
      PRODUCT_MAIN_ID: productMainId,
      INUSE: inuse
    }

    ProductTypeServices.getByLikeProductTypeNameAndProductMainIdAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
const fetchProductTypeByLikeProductTypeNameAndProductMainIdAndInuseAndFinishedGoods = (
  inputValue: string,
  productMainId: number,
  inuse: number | '' = ''
) =>
  new Promise<ProductTypeOption[]>(resolve => {
    const param = {
      PRODUCT_TYPE_NAME: inputValue,
      PRODUCT_MAIN_ID: productMainId,
      INUSE: inuse
    }

    ProductTypeServices.getByLikeProductTypeNameAndProductMainIdAndInuseAndFinishedGoods(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
// const fetchProductTypeByLikeProductTypeNameAndProductSubIdAndInuse = (
//   inputValue: string,
//   productMainId: number,
//   inuse: number | '' = ''
// ) =>
//   new Promise<ProductTypeOption[]>(resolve => {
//     const param = {
//       PRODUCT_TYPE_NAME: inputValue,
//       PRODUCT_MAIN_ID: productMainId,
//       INUSE: inuse
//     }

//     ProductTypeServices.getByLikeProductTypeNameAndProductMainIdAndInuse(param)
//       .then(responseJson => {
//         resolve(responseJson.data.ResultOnDb)
//       })
//       .catch(error => console.log(error))
//   })
const fetchProductTypeByLikeProductTypeNameAndProductCategoryIdAndInuseAndFinishedGoods = (
  inputValue: string,
  productCategoryId: number,
  inuse: number | '' = ''
) =>
  new Promise<ProductTypeOption[]>(resolve => {
    const param = {
      PRODUCT_TYPE_NAME: inputValue,
      PRODUCT_CATEGORY_ID: productCategoryId,
      INUSE: inuse
    }

    ProductTypeServices.getByLikeProductTypeNameAndProductCategoryIdAndInuseAndFinishedGoods(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
const fetchProductTypeByLikeProductTypeNameAndProductCategoryIdAndInuse = (
  inputValue: string,
  productCategoryId: number,
  inuse: number | '' = ''
) =>
  new Promise<ProductTypeOption[]>(resolve => {
    const param = {
      PRODUCT_TYPE_NAME: inputValue,
      PRODUCT_CATEGORY_ID: productCategoryId,
      INUSE: inuse
    }

    ProductTypeServices.getByLikeProductTypeNameAndProductCategoryIdAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
const fetchProductTypeByLikeProductTypeNameAndProductSubIdAndInuseAndFinishedGoods = (
  inputValue: string,
  productSubId: number,
  inuse: number | '' = ''
) =>
  new Promise<ProductTypeOption[]>(resolve => {
    const param = {
      PRODUCT_TYPE_NAME: inputValue,
      PRODUCT_SUB_ID: productSubId,
      INUSE: inuse
    }

    ProductTypeServices.getByLikeProductTypeNameAndProductSubIdAndInuseAndFinishedGoods(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
const fetchProductTypeByLikeProductTypeNameAndProductSubIdAndInuse = (
  inputValue: string,
  productSubId: number,
  inuse: number | '' = ''
) =>
  new Promise<ProductTypeOption[]>(resolve => {
    const param = {
      PRODUCT_TYPE_NAME: inputValue,
      PRODUCT_SUB_ID: productSubId,
      INUSE: inuse
    }

    ProductTypeServices.getByLikeProductTypeNameAndProductSubIdAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

const fetchProductTypeByLikeProductTypeNameAndInuseForPriceList = (inputValue: string, inuse: number | '' = '') =>
  new Promise<ProductTypeOption[]>(resolve => {
    const param = {
      PRODUCT_TYPE_NAME: inputValue,
      INUSE: inuse
    }

    ProductTypeServices.getByLikeProductTypeNameAndInuseForPriceList(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

const fetchProductTypeByLikeProductTypeNameAndInuse = ({
  PRODUCT_TYPE_NAME = '',
  INUSE = '',
  PRODUCT_TYPE_CODE = '',
  PRODUCT_SUB_ID = '',
  PRODUCT_MAIN_ID = '',
  PRODUCT_CATEGORY_ID = ''
}: {
  PRODUCT_TYPE_NAME: string
  INUSE: number | ''
  PRODUCT_TYPE_CODE: string
  PRODUCT_SUB_ID: number | ''
  PRODUCT_MAIN_ID: number | ''
  PRODUCT_CATEGORY_ID: number | ''
}) =>
  new Promise<ProductTypeOption[]>(resolve => {
    const param = {
      PRODUCT_TYPE_NAME,
      PRODUCT_TYPE_CODE,
      PRODUCT_SUB_ID,
      PRODUCT_MAIN_ID,
      PRODUCT_CATEGORY_ID,
      INUSE
    }

    ProductTypeServices.getByLikeProductTypeNameAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

const fetchProductTypeForSctByLikeProductTypeNameAndInuse = (inputValue: string, inuse: number | '' = '') =>
  new Promise<ProductTypeOption[]>(resolve => {
    const param = {
      PRODUCT_TYPE_NAME: inputValue,
      PRODUCT_TYPE_CODE: '',
      PRODUCT_SUB_ID: '',
      PRODUCT_MAIN_ID: '',
      PRODUCT_CATEGORY_ID: ''
    }

    ProductTypeServices.getProductTypeForSctByLikeProductTypeNameAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

const fetchProductTypeForSctByLikeProductTypeCodeAndInuse = (inputValue: string, inuse: number | '' = '') =>
  new Promise<ProductTypeOption[]>(resolve => {
    const param = {
      PRODUCT_TYPE_CODE: inputValue,
      PRODUCT_TYPE_NAME: '',
      PRODUCT_TYPE_ID: '',
      PRODUCT_SUB_ID: '',
      PRODUCT_MAIN_ID: '',
      PRODUCT_CATEGORY_ID: ''
    }

    ProductTypeServices.getProductTypeForSctByLikeProductTypeCodeAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

const fetchProductTypeStatusWorkingByLikeProductTypeStatusWorkingNameAndInuse = (inputValue: string, inuse = '') =>
  new Promise<ProductTypeOption[]>(resolve => {
    const param = {
      PRODUCT_TYPE_STATUS_WORKING_NAME: inputValue,
      INUSE: inuse
    }
    ProductTypeServices.getByLikeProductTypeStatusWorkingNameAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
const fetchProductTypeExport = (data: object) => {
  return new Promise<Blob | null>(resolve => {
    ProductTypeServices.downloadFileForExportProductType(data)
      .then(responseJson => {
        resolve(responseJson.data)
      })
      .catch(error => {
        console.log(error)
        resolve(null)
      })
  })
}

const fetchProductTypeBOMExport = (data: object) => {
  return new Promise<Blob | null>(resolve => {
    ProductTypeServices.downloadFileForExportProductTypeBOM(data)
      .then(responseJson => {
        resolve(responseJson.data)
      })
      .catch(error => {
        console.log(error)
        resolve(null)
      })
  })
}

export {
  fetchProductTypeBOMExport,
  fetchProductTypeByLikeProductTypeCodeAndProductMainIdAndInuse,
  fetchProductTypeByLikeProductTypeNameAndInuse,
  fetchProductTypeByLikeProductTypeNameAndInuseForPriceList,
  fetchProductTypeByLikeProductTypeNameAndProductCategoryIdAndInuse,
  fetchProductTypeByLikeProductTypeNameAndProductCategoryIdAndInuseAndFinishedGoods,
  fetchProductTypeByLikeProductTypeNameAndProductMainIdAndInuse,
  fetchProductTypeByLikeProductTypeNameAndProductMainIdAndInuseAndFinishedGoods,
  fetchProductTypeByLikeProductTypeNameAndProductSubIdAndInuse,
  fetchProductTypeByLikeProductTypeNameAndProductSubIdAndInuseAndFinishedGoods,
  fetchProductTypeExport,
  fetchProductTypeForSctByLikeProductTypeCodeAndInuse,
  fetchProductTypeForSctByLikeProductTypeNameAndInuse,
  fetchProductTypeStatusWorkingByLikeProductTypeStatusWorkingNameAndInuse
}
