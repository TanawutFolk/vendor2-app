import BomServices from '@/_workspace/services/bom/BomServices'
import type { BomI } from './../../types/bom/Bom'

type Item = {
  ITEM_CATEGORY_NAME: string
  ITEM_CATEGORY_ID: number
  ITEM_CATEGORY_ALPHABET: string
  ITEM_CATEGORY_SHORT_NAME: string
  ITEM_CODE_FOR_SUPPORT_MES: string
  ITEM_ID: number
  ITEM_INTERNAL_FULL_NAME: string
  UNIT_OF_MEASUREMENT_NAME: string
}

type ItemCategory = {
  ITEM_CATEGORY_NAME: string
  ITEM_CATEGORY_ID: number
  ITEM_CATEGORY_ALPHABET: string
}

type Process = {
  value: number
  label: string
}

export interface BomOption extends BomI {
  ITEM: Item[]
  ITEM_CATEGORY: ItemCategory
  PROCESS: Process
  productMain: {
    PRODUCT_MAIN_ID: number
    PRODUCT_MAIN_NAME: string
    PRODUCT_MAIN_ALPHABET: string
  }
  bomName: string
  bomCode: string
  flowName: string
  flowCode: string
}

const fetchBomDetailsByBomIdAndProductTypeId = (bomId: number, productTypeId: number) =>
  new Promise<BomOption>(resolve => {
    const param = {
      BOM_ID: bomId || 0,
      PRODUCT_TYPE_ID: productTypeId || 0
    }

    BomServices.searchBomDetailsByBomIdAndProductTypeId(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

const fetchBomDetailsByBomId = (bomId: number) =>
  new Promise<BomOption>(resolve => {
    const param = {
      BOM_ID: bomId || 0
    }

    BomServices.searchBomDetailsByBomId(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

const fetchBomByLikeBomNameAndInuse = (inputValue: string, inuse: number | '' = '') =>
  new Promise<BomOption[]>(resolve => {
    const param = {
      BOM_NAME: `${inputValue}`,
      INUSE: `${inuse}`
    }
    BomServices.getByLikeBomNameAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
const fetchBomByBomNameAndProductMainIdAndInuse = (
  inputValue: string,
  inuse: number | '' = '',
  productMainId: number
) =>
  new Promise<BomOption[]>(resolve => {
    const param = {
      BOM_NAME: `${inputValue}`,
      INUSE: `${inuse}`,
      PRODUCT_MAIN_ID: `${productMainId}`
    }
    BomServices.getByBomNameAndProductMainIdAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
const fetchBomByBomCodeAndProductMainIdAndInuse = (
  inputValue: string,
  inuse: number | '' = '',
  productMainId: number
) =>
  new Promise<BomOption[]>(resolve => {
    const param = {
      BOM_CODE: `${inputValue}`,
      INUSE: `${inuse}`,
      PRODUCT_MAIN_ID: `${productMainId}`
    }
    BomServices.getByBomCodeAndProductMainIdAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

const fetchBomDetailsByListBomId = async (params: object) =>
  new Promise<BomOption>(resolve => {
    BomServices.getBomDetailByBomId(params)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

const fetchBomByLikeProductTypeIdAndCondition = (params: { PRODUCT_TYPE_ID: number; CONDITION: 'BOM_ACTUAL' }) =>
  new Promise<BomOption>(resolve => {
    BomServices.getBomByLikeProductTypeIdAndCondition(params)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb[0])
      })
      .catch(error => console.log(error))
  })

const fetchBomByLikeProductTypeCodeAndCondition = (params: { PRODUCT_TYPE_CODE: string; CONDITION: 'BOM_ACTUAL' }) =>
  new Promise<BomOption>(resolve => {
    BomServices.getBomByLikeProductTypeCodeAndCondition(params)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb[0])
      })
      .catch(error => console.log(error))
  })
const fetchByLikeBomCodeAndProductMainIdAndInuse = (
  inputValue: string,
  inuse: number | '' = '',
  productMainId: number
) =>
  new Promise<BomOption[]>(resolve => {
    const param = {
      BOM_CODE: `${inputValue}`,
      PRODUCT_MAIN_ID: `${productMainId}`,
      INUSE: `${inuse}`
    }
    BomServices.getByLikeBomCodeAndProductMainIdAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

const fetchBomByLikeBomCodeAndInuse = ({ bomCode, inuse = '' }: { bomCode: string; inuse: number | '' }) =>
  new Promise<BomOption[]>(resolve => {
    const param = {
      BOM_CODE: `${bomCode}`,
      INUSE: `${inuse}`
    }
    BomServices.getByLikeBomCodeAndInuse(param)
      .then(responseJson => {
        resolve(responseJson?.data?.ResultOnDb ?? [])
      })
      .catch(error => console.log(error))
  })
export {
  fetchBomByBomCodeAndProductMainIdAndInuse,
  fetchBomByBomNameAndProductMainIdAndInuse,
  fetchBomByLikeBomNameAndInuse,
  fetchBomByLikeProductTypeIdAndCondition,
  fetchBomDetailsByBomId,
  fetchBomDetailsByBomIdAndProductTypeId,
  fetchBomDetailsByListBomId,
  fetchByLikeBomCodeAndProductMainIdAndInuse,
  fetchBomByLikeProductTypeCodeAndCondition,
  fetchBomByLikeBomCodeAndInuse
}
