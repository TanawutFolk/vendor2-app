import SctForProductAPI from '@/_workspace/api/standard-cost/SctForProductAPI'
import StandardCostForProductAPI from '@/_workspace/api/standard-cost/StandardCostForProductAPI'
import axiosRequestForExport from '@/_workspace/axios/sct-export/axiosRequest_ForExport'
import { ReturnApiSearchI } from '@/app/[lang]/(_workspace)/cost-condition/import-fee/ImportFeeTableData'
import axiosRequest from '@/libs/axios/axiosRequest'
import axiosRequest_master_expressjs from '@/_workspace/axios/sct-export/axiosRequest_ForExport'
import SctAPI from '@/_workspace/api/standard-cost/SctAPI'
import { StandardCostI } from '@/_workspace/types/sct/StandardCostType'
import { ResultDataResponseI } from '@/libs/axios/types/AxiosResponseInterface'
import { SctCreateFromHistoryI } from '@/_workspace/types/sct/SctCreateFromHistoryI'

export default class StandardCostForProductServices {
  static getSctCompareData(params: any) {
    return axiosRequest({
      url: `${StandardCostForProductAPI.API_ROOT_URL}/getSctCompareData`,
      params,
      method: 'get'
    })
  }
  static getSctReCalButton(data: any) {
    return axiosRequest({
      url: `${StandardCostForProductAPI.API_ROOT_URL}/getSctReCalButton`,
      data,
      method: 'post'
    })
  }
  // static getCostConditionData(params: any) {
  //   return axiosRequest({
  //     url: `${StandardCostForProductAPI.API_ROOT_URL}/getCostConditionData`,
  //     params,
  //     method: 'get'
  //   })
  // }
  static getSctDetailForAdjust(params: any) {
    return axiosRequest({
      url: `${StandardCostForProductAPI.API_ROOT_URL}/getSctDetailForAdjust`,
      params,
      method: 'get'
    })
  }
  static getYrGrData(params: any) {
    return axiosRequest({
      url: `${StandardCostForProductAPI.API_ROOT_URL}/getYrGrData`,
      params,
      method: 'get'
    })
  }
  static getTimeData(params: any) {
    return axiosRequest({
      url: `${StandardCostForProductAPI.API_ROOT_URL}/getTimeData`,
      params,
      method: 'get'
    })
  }
  static getMaterialPriceData(params: any) {
    return axiosRequest({
      url: `${StandardCostForProductAPI.API_ROOT_URL}/getMaterialPriceData`,
      params,
      method: 'get'
    })
  }
  static getYrAccumulationMaterialData(params: any) {
    return axiosRequest({
      url: `${StandardCostForProductAPI.API_ROOT_URL}/getYrAccumulationMaterialData`,
      params,
      method: 'get'
    })
  }
  static getSctDataFlowProcess(params: any) {
    return axiosRequest({
      url: `${StandardCostForProductAPI.API_ROOT_URL}/getSctDataFlowProcess`,
      params,
      method: 'get'
    })
  }
  static getSctDataMaterial(params: any) {
    return axiosRequest({
      url: `${StandardCostForProductAPI.API_ROOT_URL}/getSctDataMaterial`,
      params,
      method: 'get'
    })
  }
  static getSctDataOptionSelection(params: any) {
    return axiosRequest({
      url: `${StandardCostForProductAPI.API_ROOT_URL}/getSctDataOptionSelection`,
      params,
      method: 'get'
    })
  }
  static getSctFormDetail(params: any) {
    return axiosRequest({
      url: `${StandardCostForProductAPI.API_ROOT_URL}/getSctFormDetail`,
      params,
      method: 'get'
    })
  }

  // static getBySctId(data: { SCT_ID: string }) {
  //   return axiosRequest<ResultDataResponseI<SctCompareI>>({
  //     url: `${SctCompareAPI.API_ROOT_URL}/getBySctId`,
  //     data,
  //     method: 'POST'
  //   })
  // }

  static getSctDataDetail(data: { SCT_ID: string }) {
    return axiosRequest<
      ResultDataResponseI<// StandardCostI &
      //   SctCreateFromHistoryI & { BOM_CODE_ACTUAL: string; BOM_NAME_ACTUAL: string } & {
      //     SCT_CREATE_FROM_NAME: string
      //     CREATE_FROM_SCT_REVISION_CODE: string
      //     CREATE_FROM_SCT_PATTERN_NAME: string
      //     CREATE_FROM_SCT_STATUS_PROGRESS_NAME: string
      //   }
      {
        SCT_ID: string
        NOTE: string
        FISCAL_YEAR: number
        SCT_REVISION_CODE: string
        ESTIMATE_PERIOD_START_DATE: string
        ESTIMATE_PERIOD_END_DATE: string
        PRODUCT_CATEGORY_ID: number
        PRODUCT_CATEGORY_NAME: string
        PRODUCT_CATEGORY_ALPHABET: string
        PRODUCT_MAIN_ID: number
        PRODUCT_MAIN_NAME: string
        PRODUCT_MAIN_ALPHABET: string
        PRODUCT_SUB_ID: number
        PRODUCT_SUB_NAME: string
        PRODUCT_SUB_ALPHABET: string
        PRODUCT_TYPE_ID: number
        PRODUCT_TYPE_CODE: string
        PRODUCT_TYPE_NAME: string
        ITEM_CATEGORY_ID: number
        ITEM_CATEGORY_NAME: string
        ITEM_CATEGORY_ALPHABET: string
        PRODUCT_SPECIFICATION_TYPE_ID: number
        PRODUCT_SPECIFICATION_TYPE_NAME: string
        PRODUCT_SPECIFICATION_TYPE_ALPHABET: string
        SCT_PATTERN_ID: number
        SCT_PATTERN_NAME: string
        SCT_REASON_SETTING_ID: number
        SCT_REASON_SETTING_NAME: string
        SCT_TAG_SETTING_ID: number
        SCT_TAG_SETTING_NAME: string
        BOM_ID_ACTUAL: number
        BOM_CODE_ACTUAL: string
        BOM_NAME_ACTUAL: string
        BOM_ID: number
        BOM_CODE: string
        BOM_NAME: string
        FLOW_ID: number
        FLOW_CODE: string
        FLOW_NAME: string
        TOTAL_COUNT_PROCESS: number
        SCT_STATUS_PROGRESS_ID: number
        SCT_STATUS_PROGRESS_NO: number
        SCT_STATUS_PROGRESS_NAME: string
        SCT_STATUS_WORKING_ID: number
        ADJUST_PRICE: number
        REMARK_FOR_ADJUST_PRICE: string
        NOTE_PRICE: string
        IMPORT_FEE_RATE: number
        SCT_CREATE_FROM_SETTING_ID: number
        SCT_CREATE_FROM_NAME: string
        CREATE_FROM_SCT_ID: string
        CREATE_FROM_SCT_REVISION_CODE: string
        CREATE_FROM_SCT_FISCAL_YEAR: number
        CREATE_FROM_SCT_PATTERN_ID: number
        CREATE_FROM_SCT_PATTERN_NAME: string
        CREATE_FROM_SCT_STATUS_PROGRESS_ID: number
        CREATE_FROM_SCT_STATUS_PROGRESS_NAME: string
        CREATE_FROM_SELLING_PRICE: number
      }>
    >({
      url: `${StandardCostForProductAPI.API_ROOT_URL}/getSctDataDetail`,
      data,
      method: 'POST'
    })
  }

  static getCompletedSctAllData(params: any) {
    return axiosRequest({
      url: `${StandardCostForProductAPI.API_ROOT_URL}/getCompletedSctAllData`,
      params,
      method: 'get'
    })
  }

  static search(params: Record<string, any>) {
    return axiosRequest({
      url: `${StandardCostForProductAPI.API_ROOT_URL}/search`,
      data: params,
      method: 'POST'
    })
  }

  static searchProductType(params: ReturnApiSearchI) {
    return axiosRequest({
      url: `${StandardCostForProductAPI.API_ROOT_URL}/searchProductType`,
      params,
      method: 'get'
    })
  }

  static searchStandardFormProductType(params: ReturnApiSearchI) {
    return axiosRequest({
      url: `${StandardCostForProductAPI.API_ROOT_URL}/searchStandardFormProductType`,
      params,
      method: 'get'
    })
  }

  static createSctForm(property: any) {
    return axiosRequest({
      url: `${StandardCostForProductAPI.API_ROOT_URL}/createSctForm`,
      data: property,
      method: 'POST'
    })
  }

  static updateSctForm(property: any) {
    return axiosRequest({
      url: `${StandardCostForProductAPI.API_ROOT_URL}/updateSctForm`,
      data: property,
      method: 'POST'
    })
  }

  static updateSctData(property: any) {
    return axiosRequest({
      url: `${StandardCostForProductAPI.API_ROOT_URL}/updateSctData`,
      data: property,
      method: 'POST'
    })
  }

  static changeSctProgress(property: any) {
    return axiosRequest({
      url: `${StandardCostForProductAPI.API_ROOT_URL}/changeSctProgress`,
      data: property,
      method: 'POST'
    })
  }

  static deleteSctForm(property: any) {
    return axiosRequest({
      url: `${StandardCostForProductAPI.API_ROOT_URL}/deleteSctForm`,
      data: property,
      method: 'POST'
    })
  }

  static deleteSctData(property: any) {
    return axiosRequest({
      url: `${StandardCostForProductAPI.API_ROOT_URL}/deleteSctData`,
      data: property,
      method: 'POST'
    })
  }

  static createSctFormMultiple(property: any) {
    return axiosRequest({
      url: `${StandardCostForProductAPI.API_ROOT_URL}/createSctFormMultiple`,
      data: property,
      method: 'POST'
    })
  }

  static updateSctTagBudget(property: any) {
    return axiosRequest({
      url: `${StandardCostForProductAPI.API_ROOT_URL}/updateSctTagBudget`,
      data: property,
      method: 'POST'
    })
  }

  static createDraftSctFormMultiple(property: any) {
    return axiosRequest({
      url: `${StandardCostForProductAPI.API_ROOT_URL}/createDraftSctFormMultiple`,
      data: property,
      method: 'POST'
    })
  }

  static reCal(property: any) {
    return axiosRequestForExport({
      url: `${SctAPI.API_ROOT_URL}/calculateSellingPriceBySctIdAndBudget`,
      data: property,
      method: 'POST'
    })
  }

  static calculateSellPriceByItemCategoryAndSctStatusProgressIdAndSctPatternIdAndFiscalYearAndSctReasonSettingId(
    property: any
  ) {
    return axiosRequest_master_expressjs({
      url: `${SctForProductAPI.API_ROOT_URL}/calculateSellPriceByItemCategoryAndSctStatusProgressIdAndSctPatternIdAndFiscalYearAndSctReasonSettingId`,
      data: property,
      method: 'POST'
    })
  }

  static getAllWithWhereCondition(params: Record<string, any>) {
    return axiosRequest({
      url: `${StandardCostForProductAPI.API_ROOT_URL}/getAllWithWhereCondition`,
      data: params,
      method: 'POST'
    })
  }

  static getAllWithWhereCondition_old_version(params: Record<string, any>) {
    return axiosRequest({
      url: `${StandardCostForProductAPI.API_ROOT_URL}/getAllWithWhereCondition_old_version`,
      data: params,
      method: 'POST'
    })
  }

  static getParentProductTypeBySctRevisionCode(params: Record<string, any>) {
    return axiosRequest({
      url: `${SctAPI.API_ROOT_URL}/getParentProductTypeBySctRevisionCode`,
      data: params,
      method: 'POST'
    })
  }
}
