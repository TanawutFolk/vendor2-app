import { z } from 'zod'

export const validationSchemaPage = z
  .object({
    mode: z.union([z.literal('view'), z.literal('edit')]),
    isSaveDraft: z.boolean().nullish(),
    changeStatusTo: z
      .object({
        SCT_STATUS_PROGRESS_ID: z.number(),
        SCT_STATUS_PROGRESS_NAME: z.string(),
        SCT_STATUS_PROGRESS_NO: z.number()
      })
      .nullish(),
    cancelReason: z.string().nullish(),
    // sctData: z.object({
    //   SCT_ID: z.string(),
    //   NOTE: z.string(),
    //   FISCAL_YEAR: z.number(),
    //   SCT_REVISION_CODE: z.string(),
    //   ESTIMATE_PERIOD_START_DATE: z.string(), // หรือ z.date() ถ้าข้อมูลเป็น Date object
    //   ESTIMATE_PERIOD_END_DATE: z.string(), // หรือ z.date() ถ้าข้อมูลเป็น Date object
    //   PRODUCT_CATEGORY_ID: z.number(),
    //   PRODUCT_CATEGORY_NAME: z.string(),
    //   PRODUCT_CATEGORY_ALPHABET: z.string(),
    //   PRODUCT_MAIN_ID: z.number(),
    //   PRODUCT_MAIN_NAME: z.string(),
    //   PRODUCT_MAIN_ALPHABET: z.string(),
    //   PRODUCT_SUB_ID: z.number(),
    //   PRODUCT_SUB_NAME: z.string(),
    //   PRODUCT_SUB_ALPHABET: z.string(),
    //   PRODUCT_TYPE_ID: z.number(),
    //   PRODUCT_TYPE_CODE: z.string(),
    //   PRODUCT_TYPE_NAME: z.string(),
    //   ITEM_CATEGORY_ID: z.number(),
    //   ITEM_CATEGORY_NAME: z.string(),
    //   ITEM_CATEGORY_ALPHABET: z.string(),
    //   PRODUCT_SPECIFICATION_TYPE_ID: z.number(),
    //   PRODUCT_SPECIFICATION_TYPE_NAME: z.string(),
    //   PRODUCT_SPECIFICATION_TYPE_ALPHABET: z.string(),
    //   SCT_PATTERN_ID: z.number(),
    //   SCT_PATTERN_NAME: z.string(),
    //   SCT_REASON_SETTING_ID: z.number(),
    //   SCT_REASON_SETTING_NAME: z.string(),
    //   SCT_TAG_SETTING_ID: z.number(),
    //   SCT_TAG_SETTING_NAME: z.string(),
    //   BOM_ID_ACTUAL: z.number(),
    //   BOM_CODE_ACTUAL: z.string(),
    //   BOM_NAME_ACTUAL: z.string(),
    //   BOM_ID: z.number(),
    //   BOM_CODE: z.string(),
    //   BOM_NAME: z.string(),
    //   FLOW_ID: z.number(),
    //   FLOW_CODE: z.string(),
    //   TOTAL_COUNT_PROCESS: z.number(),
    //   SCT_STATUS_PROGRESS_ID: z.number(),
    //   SCT_STATUS_PROGRESS_NO: z.number(),
    //   SCT_STATUS_PROGRESS_NAME: z.string(),
    //   SCT_STATUS_WORKING_ID: z.number(),
    //   ADJUST_PRICE: z.number(),
    //   REMARK_FOR_ADJUST_PRICE: z.string(),
    //   NOTE_PRICE: z.string(),
    //   IMPORT_FEE_RATE: z.number()
    //   // SCT_CREATE_FROM_SETTING_ID: z.number(),
    //   // SCT_CREATE_FROM_NAME: z.string(),
    //   // CREATE_FROM_SCT_ID: z.string(),
    //   // CREATE_FROM_SCT_REVISION_CODE: z.string(),
    //   // CREATE_FROM_SCT_FISCAL_YEAR: z.number(),
    //   // CREATE_FROM_SCT_PATTERN_ID: z.number(),
    //   // CREATE_FROM_SCT_PATTERN_NAME: z.string(),
    //   // CREATE_FROM_SCT_STATUS_PROGRESS_ID: z.number(),
    //   // CREATE_FROM_SCT_STATUS_PROGRESS_NAME: z.string(),
    //   // CREATE_FROM_SELLING_PRICE: z.number().nullish(),
    //   // CREATE_FROM_isCalculationAlready: z.boolean().nullish()
    // }),
    isCalculationAlready: z.boolean(),
    listSctComponentTypeResourceOptionSelect: z.array(
      z.object({
        SCT_ID: z.string(),
        SCT_RESOURCE_OPTION_ID: z.number(),
        SCT_COMPONENT_TYPE_ID: z.number(),
        IS_FROM_SCT_COPY: z.number()
      })
    ),
    listSctBomFlowProcessItemUsagePrice: z
      .array(
        // for history (if exist)
        z.object({
          SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ID: z.string(),
          SCT_ID: z.string(),
          BOM_FLOW_PROCESS_ITEM_USAGE_ID: z.number(),
          PRICE: z.number(),
          CREATE_BY: z.string(),
          CREATE_DATE: z.string(),
          UPDATE_BY: z.string(),
          UPDATE_DATE: z.string(),
          INUSE: z.number(),
          IS_FROM_SCT_COPY: z.number(),
          ITEM_M_S_PRICE_ID: z.string(),
          ITEM_M_S_PRICE_VALUE: z.number(),
          ITEM_M_S_PRICE_VERSION: z.number(),
          YIELD_ACCUMULATION: z.number(),
          AMOUNT: z.number(),
          IS_ADJUST_YIELD_ACCUMULATION: z.number().nullish(),
          YIELD_ACCUMULATION_DEFAULT: z.number(),
          ADJUST_YIELD_ACCUMULATION_VERSION_NO: z.number().nullish(),
          SCT_ID_SELECTION: z.string().nullish(),
          PURCHASE_UNIT_ID: z.number(),
          PURCHASE_UNIT_NAME: z.string(),
          USAGE_UNIT_ID: z.number(),
          USAGE_UNIT_NAME: z.string(),
          PURCHASE_PRICE: z.number(),
          PURCHASE_UNIT_RATIO: z.number(),
          EXCHANGE_RATE_VALUE: z.number(),
          USAGE_UNIT_RATIO: z.number(),
          FISCAL_YEAR: z.union([z.number(), z.string()]),
          SCT_PATTERN_ID: z.number().nullish(),
          PURCHASE_PRICE_CURRENCY_NAME: z.string(),
          PURCHASE_PRICE_CURRENCY_CODE: z.string()
        })
      )
      .nullish(),
    listSctBomFlowProcessItemUsagePriceAdjust: z.array(
      z.object({
        BOM_FLOW_PROCESS_ITEM_USAGE_ID: z.number(),
        SCT_ID: z.string(),
        SCT_ID_SELECTION: z.string(),
        IS_FROM_SCT_COPY: z.number()
      })
    ),
    listSctMasterDataHistory: z.array(
      // for history & change
      z.object({
        SCT_MASTER_DATA_SETTING_ID: z.number(),
        FISCAL_YEAR: z.union([z.number(), z.string()]),
        VERSION_NO: z.number(),
        SCT_MASTER_DATA_SETTING_NAME: z.string(),
        IS_FROM_SCT_COPY: z.number()
      })
    ),
    // sctTotalCost: z.object({
    //   sellingExpenseForSellingPrice: z.number(),
    //   gaForSellingPrice: z.number(),
    //   marginForSellingPrice: z.number(),
    //   citForSellingPrice: z.number(),
    //   sellingPriceByFormula: z.number(),
    //   adjustPrice: z.number(),
    //   isManualAdjustPrice: z.boolean(),
    //   remarkForAdjustPrice: z.string(),
    //   sellingPrice: z.number(),
    //   sellingPricePreview: z.number()
    // }),
    sctDetailForAdjust: z.array(
      z.object({
        //       TOTAL_INDIRECT_COST: number
        // CIT: number
        // VAT: number
        // GA: number
        // MARGIN: number
        // SELLING_EXPENSE: number
        // ADJUST_PRICE: number
        // REMARK_FOR_ADJUST_PRICE: string
        // IS_FROM_SCT_COPY: number

        // TOTAL_INDIRECT_COST_SCT_RESOURCE_OPTION_ID: number
        // CIT_SCT_RESOURCE_OPTION_ID: number
        // VAT_SCT_RESOURCE_OPTION_ID: number
        // GA_SCT_RESOURCE_OPTION_ID: number
        // MARGIN_SCT_RESOURCE_OPTION_ID: number
        // SELLING_EXPENSE_SCT_RESOURCE_OPTION_ID: number
        // ADJUST_PRICE_SCT_RESOURCE_OPTION_ID: number

        TOTAL_INDIRECT_COST: z.number().nullish(),
        CIT: z.number().nullish(),
        VAT: z.number().nullish(),
        GA: z.number().nullish(),
        MARGIN: z.number().nullish(),
        SELLING_EXPENSE: z.number().nullish(),
        ADJUST_PRICE: z.number().nullish(),
        REMARK_FOR_ADJUST_PRICE: z.string().nullish(),
        IS_FROM_SCT_COPY: z.number().nullish(),
        TOTAL_INDIRECT_COST_SCT_RESOURCE_OPTION_ID: z.number().nullish(),
        CIT_SCT_RESOURCE_OPTION_ID: z.number().nullish(),
        VAT_SCT_RESOURCE_OPTION_ID: z.number().nullish(),
        GA_SCT_RESOURCE_OPTION_ID: z.number().nullish(),
        MARGIN_SCT_RESOURCE_OPTION_ID: z.number().nullish(),
        SELLING_EXPENSE_SCT_RESOURCE_OPTION_ID: z.number().nullish(),
        ADJUST_PRICE_SCT_RESOURCE_OPTION_ID: z.number().nullish()
      })
    ),
    sctTotalCost: z.array(
      //       SCT_TOTAL_COST_ID: number
      // SCT_ID: string
      // DIRECT_UNIT_PROCESS_COST: number
      // INDIRECT_RATE_OF_DIRECT_PROCESS_COST: number
      // TOTAL_PROCESSING_TIME: number
      // TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE: number
      // TOTAL_DIRECT_COST: number
      // DIRECT_PROCESS_COST: number
      // IMPORTED_FEE: number
      // IMPORTED_COST: number
      // TOTAL: number
      // TOTAL_PRICE_OF_RAW_MATERIAL: number
      // TOTAL_PRICE_OF_SUB_ASSY: number
      // TOTAL_PRICE_OF_SEMI_FINISHED_GOODS: number
      // TOTAL_PRICE_OF_CONSUMABLE: number
      // TOTAL_PRICE_OF_PACKING: number
      // TOTAL_PRICE_OF_ALL_OF_ITEMS: number
      // RM_INCLUDE_IMPORTED_COST: number
      // CONSUMABLE_PACKING: number
      // MATERIALS_COST: number
      // INDIRECT_COST_SALE_AVE: number
      // SELLING_EXPENSE: number
      // GA: number
      // MARGIN: number
      // ESTIMATE_PERIOD_START_DATE: string
      // TOTAL_YIELD_RATE: number
      // TOTAL_CLEAR_TIME: number
      // ADJUST_PRICE: number
      // REMARK_FOR_ADJUST_PRICE: string
      // NOTE: string
      // SELLING_EXPENSE_FOR_SELLING_PRICE: number
      // GA_FOR_SELLING_PRICE: number
      // MARGIN_FOR_SELLING_PRICE: number
      // IS_ADJUST_IMPORTED_COST: number
      // IMPORTED_COST_DEFAULT: number
      // TOTAL_GO_STRAIGHT_RATE: number
      // CIT_FOR_SELLING_PRICE: number
      // RAW_MATERIAL_SUB_ASSY_SEMI_FINISHED_GOODS: number
      // ASSEMBLY_GROUP_FOR_SUPPORT_MES: number
      // VAT_FOR_SELLING_PRICE: number
      // CIT: number
      // VAT: number
      // TOTAL_PRICE_OF_ALL_OF_ITEMS_INCLUDE_IMPORTED_COST: number
      // ESTIMATE_PERIOD_END_DATE: string
      // TOTAL_ESSENTIAL_TIME: number
      // SELLING_PRICE_BY_FORMULA: number
      // SELLING_PRICE: number
      // DESCRIPTION: string
      // CREATE_BY: string
      // CREATE_DATE: string
      // UPDATE_BY: string
      // UPDATE_DATE: string
      // INUSE: number
      // IS_FROM_SCT_COPY: number

      z.object({
        SCT_TOTAL_COST_ID: z.string().nullish(),
        SCT_ID: z.string().nullish(),
        DIRECT_UNIT_PROCESS_COST: z.number().nullish(),
        INDIRECT_RATE_OF_DIRECT_PROCESS_COST: z.number().nullish(),
        TOTAL_PROCESSING_TIME: z.number().nullish(),
        TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE: z.number().nullish(),
        TOTAL_DIRECT_COST: z.number().nullish(),
        DIRECT_PROCESS_COST: z.number().nullish(),
        IMPORTED_FEE: z.number().nullish(),
        IMPORTED_COST: z.number().nullish(),
        TOTAL: z.number().nullish(),
        TOTAL_PRICE_OF_RAW_MATERIAL: z.number().nullish(),
        TOTAL_PRICE_OF_SUB_ASSY: z.number().nullish(),
        TOTAL_PRICE_OF_SEMI_FINISHED_GOODS: z.number().nullish(),
        TOTAL_PRICE_OF_CONSUMABLE: z.number().nullish(),
        TOTAL_PRICE_OF_PACKING: z.number().nullish(),
        TOTAL_PRICE_OF_ALL_OF_ITEMS: z.number().nullish(),
        RM_INCLUDE_IMPORTED_COST: z.number().nullish(),
        CONSUMABLE_PACKING: z.number().nullish(),
        MATERIALS_COST: z.number().nullish(),
        INDIRECT_COST_SALE_AVE: z.number().nullish(),
        SELLING_EXPENSE: z.number().nullish(),
        GA: z.number().nullish(),
        MARGIN: z.number().nullish(),
        ESTIMATE_PERIOD_START_DATE: z.string().nullish(),
        TOTAL_YIELD_RATE: z.number().nullish(),
        TOTAL_CLEAR_TIME: z.number().nullish(),
        ADJUST_PRICE: z.number().nullish(),
        REMARK_FOR_ADJUST_PRICE: z.string().nullish(),
        NOTE: z.string().nullish(),
        SELLING_EXPENSE_FOR_SELLING_PRICE: z.number().nullish(),
        GA_FOR_SELLING_PRICE: z.number().nullish(),
        MARGIN_FOR_SELLING_PRICE: z.number().nullish(),
        IS_ADJUST_IMPORTED_COST: z.number().nullish(),
        IMPORTED_COST_DEFAULT: z.number().nullish(),
        TOTAL_GO_STRAIGHT_RATE: z.number().nullish(),
        CIT_FOR_SELLING_PRICE: z.number().nullish(),
        RAW_MATERIAL_SUB_ASSY_SEMI_FINISHED_GOODS: z.number().nullish(),
        ASSEMBLY_GROUP_FOR_SUPPORT_MES: z.string().nullish(),
        VAT_FOR_SELLING_PRICE: z.number().nullish(),
        CIT: z.number().nullish(),
        VAT: z.number().nullish(),
        TOTAL_PRICE_OF_ALL_OF_ITEMS_INCLUDE_IMPORTED_COST: z.number().nullish(),
        ESTIMATE_PERIOD_END_DATE: z.string().nullish(),
        TOTAL_ESSENTIAL_TIME: z.number().nullish(),
        SELLING_PRICE_BY_FORMULA: z.number().nullish(),
        SELLING_PRICE: z.number().nullish(),
        CREATE_BY: z.string().nullish(),
        CREATE_DATE: z.string().nullish(),
        UPDATE_BY: z.string().nullish(),
        UPDATE_DATE: z.string().nullish(),
        INUSE: z.number().nullish(),
        IS_FROM_SCT_COPY: z.number().nullish()
      })
    ),
    product: z.object({
      productCategory: z.object({
        PRODUCT_CATEGORY_ID: z.number(),
        PRODUCT_CATEGORY_NAME: z.string(),
        PRODUCT_CATEGORY_ALPHABET: z.string()
      }),
      productMain: z.object({
        PRODUCT_MAIN_ID: z.number(),
        PRODUCT_MAIN_NAME: z.string(),
        PRODUCT_MAIN_ALPHABET: z.string()
      }),
      productSub: z.object({
        PRODUCT_SUB_ID: z.number(),
        PRODUCT_SUB_NAME: z.string(),
        PRODUCT_SUB_ALPHABET: z.string()
      }),
      productType: z.object({
        PRODUCT_TYPE_ID: z.number(),
        PRODUCT_TYPE_NAME: z.string(),
        PRODUCT_TYPE_CODE: z.string()
      }),
      itemCategory: z.object({
        ITEM_CATEGORY_ID: z.number(),
        ITEM_CATEGORY_NAME: z.string(),
        ITEM_CATEGORY_ALPHABET: z.string()
      }),
      productSpecificationType: z.object({
        PRODUCT_SPECIFICATION_TYPE_ID: z.number(),
        PRODUCT_SPECIFICATION_TYPE_NAME: z.string(),
        PRODUCT_SPECIFICATION_TYPE_ALPHABET: z.string()
      })
    }),
    header: z.object({
      SCT_ID: z.string(),
      sctRevisionCode: z.string(),
      note: z.string(),
      sctStatusProgress: z.object({
        SCT_STATUS_PROGRESS_ID: z.number(),
        SCT_STATUS_PROGRESS_NAME: z.string()
      }),
      estimatePeriodStartDate: z.date(),
      estimatePeriodEndDate: z.date(),
      fiscalYear: z.object({
        value: z.number(),
        label: z.string()
      }),
      sctPatternNo: z.object({
        value: z.number(),
        label: z.string()
      }),
      sctReason: z.object({
        SCT_REASON_SETTING_ID: z.number(),
        SCT_REASON_SETTING_NAME: z.string()
      }),
      sctTagSetting: z.object({
        SCT_TAG_SETTING_ID: z.number().nullish(),
        SCT_TAG_SETTING_NAME: z.string().nullish()
      }),
      bom: z.object({
        BOM_ID: z.number(),
        BOM_CODE: z.string(),
        BOM_NAME: z.string(),
        BOM_CODE_ACTUAL: z.string(),
        BOM_NAME_ACTUAL: z.string(),
        FLOW_ID: z.number(),
        FLOW_CODE: z.string(),
        FLOW_NAME: z.string(),
        TOTAL_COUNT_PROCESS: z.number()
      }),
      sctCreateFrom: z.object({
        SCT_CREATE_FROM_SETTING_ID: z.number(),
        CREATE_FROM_SCT_ID: z.string().nullish(),
        SCT_CREATE_FROM_NAME: z.string().nullish(),
        CREATE_FROM_SCT_REVISION_CODE: z.string().nullish(),
        CREATE_FROM_SCT_FISCAL_YEAR: z.number().nullish(),
        CREATE_FROM_SCT_PATTERN_ID: z.number().nullish(),
        CREATE_FROM_SCT_PATTERN_NAME: z.string().nullish(),
        CREATE_FROM_SCT_STATUS_PROGRESS_ID: z.number().nullish(),
        CREATE_FROM_SCT_STATUS_PROGRESS_NAME: z.string().nullish(),
        CREATE_FROM_SELLING_PRICE: z.number().nullish(),
        CREATE_FROM_isCalculationAlready: z.boolean().nullish()
      })
    }),
    sctComPareNo1: z
      .object({
        sctCompareNo: z.number().nullish(),
        SCT_ID: z.string().nullish(),
        sctRevisionCode: z.string().nullish(),
        isDefaultExportCompare: z
          .number({
            required_error: 'กรุณาเลือก SCT default export compare',
            invalid_type_error: 'กรุณาเลือก SCT default export compare'
          })
          .nullish(),
        bom: z
          .object({
            BOM_ID: z.number().nullish(),
            BOM_CODE: z.string().nullish(),
            BOM_NAME: z.string().nullish(),
            FLOW_ID: z.number().nullish(),
            FLOW_CODE: z.string().nullish(),
            FLOW_NAME: z.string().nullish(),
            TOTAL_COUNT_PROCESS: z.number().nullish()
          })
          .nullish()
      })
      .nullish(),
    sctComPareNo2: z
      .object({
        sctCompareNo: z.number().nullish(),
        SCT_ID: z.string().nullish(),
        sctRevisionCode: z.string().nullish(),
        isDefaultExportCompare: z
          .number({
            required_error: 'กรุณาเลือก SCT default export compare',
            invalid_type_error: 'กรุณาเลือก SCT default export compare'
          })
          .nullish(),
        bom: z
          .object({
            BOM_ID: z.number().nullish(),
            BOM_CODE: z.string().nullish(),
            BOM_NAME: z.string().nullish(),
            FLOW_ID: z.number().nullish(),
            FLOW_CODE: z.string().nullish(),
            FLOW_NAME: z.string().nullish(),
            TOTAL_COUNT_PROCESS: z.number().nullish()
          })
          .nullish()
      })
      .nullish(),
    directCost: z.object({
      flowProcess: z.object({
        // header: z.object({
        //   bomCode: z.string(),
        //   bomName: z.string(),
        //   flowCode: z.string(),
        //   flowName: z.string()
        // }),
        total: z
          .object({
            main: z
              .object({
                // totalCountProcess: z.number(),
                yieldRateAndGoStraightRate: z.object({
                  fiscalYear: z.number().nullish(),
                  version: z.number().nullish(),
                  flowId: z.number().nullish(),
                  flowCode: z.string().nullish(),
                  flowName: z.string().nullish(),
                  totalYieldRate: z.number().nullish(),
                  totalGoStraightRate: z.number().nullish()
                }),
                clearTime: z.object({
                  fiscalYear: z.number().nullish(),
                  version: z.number().nullish(),
                  flowId: z.number().nullish(),
                  flowCode: z.string().nullish(),
                  flowName: z.string().nullish(),
                  totalClearTime: z.number().nullish()
                })
                // totalYieldRate: z.number(),
                // totalGoStraightRate: z.number(),
                // fiscalYearYieldRateAndGoStraightRate: z.number(),
                // revisionNoYieldRateAndGoStraightRate: z.number(),
                // totalClearTime: z.number(),
                // fiscalYearClearTime: z.number(),
                // revisionNoClearTime: z.number()
              })
              .nullish(),
            sctCompareNo1: z
              .object({
                yieldRateAndGoStraightRate: z.object({
                  fiscalYear: z.number(),
                  version: z.number(),
                  totalYieldRate: z.number(),
                  totalGoStraightRate: z.number()
                }),
                clearTime: z.object({
                  fiscalYear: z.number(),
                  version: z.number(),
                  totalClearTime: z.number()
                })
              })
              .nullish(),
            sctCompareNo2: z
              .object({
                yieldRateAndGoStraightRate: z.object({
                  fiscalYear: z.number(),
                  version: z.number(),
                  totalYieldRate: z.number(),
                  totalGoStraightRate: z.number()
                }),
                clearTime: z.object({
                  fiscalYear: z.number(),
                  version: z.number(),
                  totalClearTime: z.number()
                })
              })
              .nullish()
          })
          .nullish(),
        body: z.object({
          flowProcess: z.object({
            main: z
              .array(
                z.object({
                  FLOW_ID: z.number(),
                  PROCESS_ID: z.number(),
                  PROCESS_NAME: z.string(),
                  PROCESS_CODE: z.string(),
                  PROCESS_NO: z.number(),
                  FLOW_PROCESS_ID: z.number(),
                  FLOW_CODE: z.string(),
                  FLOW_NAME: z.string()
                  // FLOW_PROCESS_NAME: z.string(),
                  // DESCRIPTION: z.string(),
                  // CREATE_BY: z.string(),
                  // CREATE_DATE: z.string(),
                  // UPDATE_BY: z.string(),
                  // UPDATE_DATE: z.string(),
                  // INUSE: z.string()

                  //                   FLOW_ID: number
                  // FLOW_CODE: string
                  // FLOW_NAME: string
                  // FLOW_TYPE_ID: number
                  // PRODUCT_MAIN_ID: number
                  // PRODUCT_MAIN_NAME: string
                  // PRODUCT_MAIN_ALPHABET: string
                  // PRODUCT_TYPE_CODE: string
                  // PRODUCT_TYPE_NAME: string
                  // TOTAL_COUNT_PROCESS: number
                  // INUSE: number
                  // INUSE_RAW_DATA: number
                  // MODIFIED_DATE: string
                  // UPDATE_BY: string
                  // No: number
                  // IS_DRAFT: number
                  // PROCESS_ID: number
                  // PROCESS_NAME: string
                })
              )
              .min(1, {
                message: 'ไม่พบข้อมูล Flow Process'
              }),
            sctCompareNo1: z
              .array(
                z.object({
                  FLOW_ID: z.number(),
                  PROCESS_ID: z.number(),
                  PROCESS_CODE: z.string(),
                  FLOW_PROCESS_NO: z.number(),
                  FLOW_PROCESS_ID: z.number()
                  // FLOW_PROCESS_NAME: z.string(),
                  // DESCRIPTION: z.string(),
                  // CREATE_BY: z.string(),
                  // CREATE_DATE: z.string(),
                  // UPDATE_BY: z.string(),
                  // UPDATE_DATE: z.string(),
                  // INUSE: z.string()
                })
              )
              .nullish(),
            sctCompareNo2: z
              .array(
                z.object({
                  FLOW_ID: z.number(),
                  PROCESS_ID: z.number(),
                  PROCESS_CODE: z.string(),
                  FLOW_PROCESS_NO: z.number(),
                  FLOW_PROCESS_ID: z.number()
                  // FLOW_PROCESS_NAME: z.string(),
                  // DESCRIPTION: z.string(),
                  // CREATE_BY: z.string(),
                  // CREATE_DATE: z.string(),
                  // UPDATE_BY: z.string(),
                  // UPDATE_DATE: z.string(),
                  // INUSE: z.string()
                })
              )
              .nullish()
          }),
          sctFlowProcessSequence: z.object({
            main: z.array(
              z.object({
                SCT_FLOW_PROCESS_SEQUENCE_ID: z.string(),
                SCT_ID: z.string(),
                FLOW_PROCESS_ID: z.number(),
                FLOW_PROCESS_NO: z.number(),
                SCT_PROCESS_SEQUENCE_CODE: z.string(),
                OLD_SYSTEM_PROCESS_SEQUENCE_CODE: z.string(),
                OLD_SYSTEM_COLLECTION_POINT: z.union([z.literal(0), z.literal(1)]),
                PROCESS_ID: z.number(),
                PROCESS_CODE: z.string()
                // DESCRIPTION: z.string(),
                // CREATE_BY: z.string(),
                // CREATE_DATE: z.string(),
                // UPDATE_BY: z.string(),
                // UPDATE_DATE: z.string(),
                // INUSE: z.string()
              })
            ),
            sctCompareNo1: z
              .array(
                z.object({
                  SCT_FLOW_PROCESS_SEQUENCE_ID: z.string(),
                  SCT_ID: z.string(),
                  FLOW_PROCESS_ID: z.number(),
                  FLOW_PROCESS_NO: z.number(),
                  SCT_PROCESS_SEQUENCE_CODE: z.string(),
                  OLD_SYSTEM_PROCESS_SEQUENCE_CODE: z.string(),
                  OLD_SYSTEM_COLLECTION_POINT: z.union([z.literal(0), z.literal(1)]),
                  PROCESS_ID: z.number(),
                  PROCESS_CODE: z.string()
                  // DESCRIPTION: z.string(),
                  // CREATE_BY: z.string(),
                  // CREATE_DATE: z.string(),
                  // UPDATE_BY: z.string(),
                  // UPDATE_DATE: z.string(),
                  // INUSE: z.string()
                })
              )
              .nullish(),
            SctCompareNo2: z
              .array(
                z.object({
                  SCT_FLOW_PROCESS_SEQUENCE_ID: z.string(),
                  SCT_ID: z.string(),
                  FLOW_PROCESS_ID: z.number(),
                  FLOW_PROCESS_NO: z.number(),
                  SCT_PROCESS_SEQUENCE_CODE: z.string(),
                  OLD_SYSTEM_PROCESS_SEQUENCE_CODE: z.string(),
                  OLD_SYSTEM_COLLECTION_POINT: z.union([z.literal(0), z.literal(1)]),
                  PROCESS_ID: z.number(),
                  PROCESS_CODE: z.string()
                  // DESCRIPTION: z.string(),
                  // CREATE_BY: z.string(),
                  // CREATE_DATE: z.string(),
                  // UPDATE_BY: z.string(),
                  // UPDATE_DATE: z.string(),
                  // INUSE: z.string()
                })
              )
              .nullish()
          }),
          yieldRateGoStraightRateProcessForSct: z.object({
            main: z.array(
              z.object({
                yieldRateGoStraightRateProcessForSctId: z.string().nullish(),
                fiscalYear: z.union([z.number(), z.string()]).nullish(),
                version: z.number().nullish(),
                productTypeId: z.number().nullish(),
                flowId: z.number().nullish(),
                flowCode: z.string().nullish(),
                flowName: z.string().nullish(),
                flowProcessId: z.number().nullish(),
                flowProcessNo: z.number().nullish(),
                processId: z.number().nullish(),
                yieldRateForSct: z.number().nullish(),
                yieldAccumulationForSct: z.number().nullish(),
                goStraightRateForSct: z.number().nullish(),
                collectionPointForSct: z.number().nullish()
              })
            ),
            // .min(1, {
            //   message: 'ไม่พบข้อมูล Yield Rate & Go Straight Rate'
            // }),
            SctCompareNo1: z
              .array(
                z.object({
                  yieldRateGoStraightRateProcessForSctId: z.string().nullish(),
                  fiscalYear: z.union([z.number(), z.string()]).nullish(),
                  version: z.number().nullish(),
                  productTypeId: z.number().nullish(),
                  flowId: z.number().nullish(),
                  flowCode: z.string().nullish(),
                  flowName: z.string().nullish(),
                  flowProcessId: z.number().nullish(),
                  flowProcessNo: z.number().nullish(),
                  processId: z.number().nullish(),
                  yieldRateForSct: z.number().nullish(),
                  yieldAccumulationForSct: z.number().nullish(),
                  goStraightRateForSct: z.number().nullish(),
                  collectionPointForSct: z.number().nullish()
                })
              )
              .nullish(),
            SctCompareNo2: z
              .array(
                z.object({
                  yieldRateGoStraightRateProcessForSctId: z.string().nullish(),
                  fiscalYear: z.union([z.number(), z.string()]).nullish(),
                  version: z.number().nullish(),
                  productTypeId: z.number().nullish(),
                  flowId: z.number().nullish(),
                  flowCode: z.string().nullish(),
                  flowName: z.string().nullish(),
                  flowProcessId: z.number().nullish(),
                  flowProcessNo: z.number().nullish(),
                  processId: z.number().nullish(),
                  yieldRateForSct: z.number().nullish(),
                  yieldAccumulationForSct: z.number().nullish(),
                  goStraightRateForSct: z.number().nullish(),
                  collectionPointForSct: z.number().nullish()
                })
              )
              .nullish()
          }),
          clearTimeForSctProcess: z.object({
            main: z.array(
              z.object({
                clearTimeForSctProcessId: z.string().nullish(),
                fiscalYear: z.union([z.number(), z.string()]).nullish(),
                version: z.number().nullish(),
                productTypeId: z.number().nullish(),
                flowId: z.number().nullish(),
                flowCode: z.string().nullish(),
                flowName: z.string().nullish(),
                flowProcessId: z.number().nullish(),
                flowProcessNo: z.number().nullish(),
                processId: z.number().nullish(),
                clearTimeForSct: z.number().nullish()
              })
            ),
            SctCompareNo1: z
              .array(
                z.object({
                  clearTimeForSctProcessId: z.string().nullish(),
                  fiscalYear: z.union([z.number(), z.string()]).nullish(),
                  version: z.number().nullish(),
                  productTypeId: z.number().nullish(),
                  flowId: z.number().nullish(),
                  flowCode: z.string().nullish(),
                  flowName: z.string().nullish(),
                  flowProcessId: z.number().nullish(),
                  flowProcessNo: z.number().nullish(),
                  processId: z.number().nullish(),
                  clearTimeForSct: z.number().nullish()
                })
              )
              .nullish(),
            SctCompareNo2: z
              .array(
                z.object({
                  clearTimeForSctProcessId: z.string().nullish(),
                  fiscalYear: z.union([z.number(), z.string()]).nullish(),
                  version: z.number().nullish(),
                  productTypeId: z.number().nullish(),
                  flowId: z.number().nullish(),
                  flowCode: z.string().nullish(),
                  flowName: z.string().nullish(),
                  flowProcessId: z.number().nullish(),
                  flowProcessNo: z.number().nullish(),
                  processId: z.number().nullish(),
                  clearTimeForSct: z.number().nullish()
                })
              )
              .nullish()
          })
        })
      }),
      materialInProcess: z.object({
        main: z.object({
          total: z.object({
            RawMaterial: z.number(),
            Consumable: z.number(),
            SubAssy: z.number(),
            SemiFinishedGoods: z.number(),
            Packing: z.number(),
            Total: z.number()
          }),
          body: z.array(
            z.object({
              // Row number
              ITEM_NO: z.number(),

              // BOM Information
              BOM_ID: z.number(),
              BOM_NAME: z.string(),
              BOM_CODE: z.string(),

              // Process Information
              BOM_FLOW_PROCESS_ITEM_USAGE_ID: z.number(),
              FLOW_PROCESS_ID: z.number(),
              PROCESS_ID: z.number(),
              PROCESS_NAME: z.string(),
              PROCESS_CODE: z.string(),
              PROCESS_NO: z.number(),

              // Flow Information
              FLOW_ID: z.number(),
              FLOW_NAME: z.string(),
              FLOW_CODE: z.string(),

              // Item Information
              ITEM_ID: z.number(),
              USAGE_QUANTITY: z.number(),

              // Item Category from Master
              ITEM_CATEGORY_NAME_FROM_MASTER: z.string(),
              ITEM_CATEGORY_ID_FROM_MASTER: z.number(),
              ITEM_CATEGORY_ALPHABET_FROM_MASTER: z.string(),
              ITEM_CATEGORY_SHORT_NAME_FROM_MASTER: z.string(),

              // Item Category from BOM
              ITEM_CATEGORY_NAME_FROM_BOM: z.string(),
              ITEM_CATEGORY_ID_FROM_BOM: z.number(),
              ITEM_CATEGORY_ALPHABET_FROM_BOM: z.string(),
              ITEM_CATEGORY_SHORT_NAME_FROM_BOM: z.string(),

              // Item Details
              ITEM_CODE_FOR_SUPPORT_MES: z.string(),
              ITEM_EXTERNAL_FULL_NAME: z.string(),
              ITEM_EXTERNAL_SHORT_NAME: z.string(),

              // Unit Information from Master
              PURCHASE_UNIT_ID_FROM_MASTER: z.number(),
              USAGE_UNIT_ID_FROM_MASTER: z.number(),
              USAGE_UNIT_RATIO_FROM_MASTER: z.number(),
              PURCHASE_UNIT_RATIO_FROM_MASTER: z.number(),

              // Unit Names from Master
              USAGE_UNIT_NAME_FROM_MASTER: z.string(),
              PURCHASE_UNIT_NAME_FROM_MASTER: z.string(),
              USAGE_UNIT_CODE_FROM_MASTER: z.string(),
              PURCHASE_UNIT_CODE_FROM_MASTER: z.string(),

              // Price Information
              ITEM_M_S_PRICE_ID: z.string().nullable(),
              ITEM_M_S_PRICE_VALUE: z.number().nullable(),
              PURCHASE_PRICE_CURRENCY_ID: z.number().nullable(),
              PURCHASE_PRICE: z.number().nullable(),
              PURCHASE_PRICE_UNIT_ID: z.number().nullable(),
              PURCHASE_PRICE_CURRENCY_CODE: z.string().nullable(),

              YIELD_ACCUMULATION_OF_ITEM_FOR_SCT: z.number().nullish(), // Adjust by Engineer

              // Status
              ITEM_IS_CURRENT: z.number(),
              ITEM_VERSION_NO: z.number(),
              price: z
                .object({
                  usagePrice: z.union([z.number(), z.literal('')]).nullish(),
                  purchasePriceCurrencyCode: z.string().nullish(),
                  purchasePrice: z.union([z.number(), z.literal('')]).nullish(),
                  yieldAccumulation: z.union([z.number(), z.literal('')]).nullish(),
                  amount: z.union([z.number(), z.literal('')]).nullish()
                })
                .nullish()
            })
          )
        })
      })
    }),
    indirectCost: z.object({
      main: z.object({
        costCondition: z
          .object({
            directCostCondition: z
              .object({
                directUnitProcessCost: z.number().nullish(),
                indirectRateOfDirectProcessCost: z.number().nullish(),
                fiscalYear: z.number().nullish(),
                version: z.number().nullish()
              })
              .nullish(),
            indirectCostCondition: z
              .object({
                // labor: z.number(),
                // depreciation: z.number(),
                // otherExpense: z.number(),
                totalIndirectCost: z
                  .number({
                    required_error: 'Indirect Cost is required',
                    invalid_type_error: 'Indirect Cost must be a number'
                  })
                  .nullish(),
                fiscalYear: z.number().nullish(),
                version: z.number().nullish()
              })
              .nullish(),
            otherCostCondition: z
              .object({
                ga: z
                  .number({
                    required_error: 'GA is required',
                    invalid_type_error: 'GA must be a number'
                  })
                  .nullish(),
                margin: z
                  .number({
                    required_error: 'Margin is required',
                    invalid_type_error: 'Margin must be a number'
                  })
                  .nullish(),
                sellingExpense: z
                  .number({
                    required_error: 'Selling Expense is required',
                    invalid_type_error: 'Selling Expense must be a number'
                  })
                  .nullish(),
                vat: z
                  .number({
                    required_error: 'VAT is required',
                    invalid_type_error: 'VAT must be a number'
                  })
                  .nullish(),
                cit: z
                  .number({
                    required_error: 'CIT is required',
                    invalid_type_error: 'CIT must be a number'
                  })
                  .nullish(),
                fiscalYear: z.number().nullish(),
                version: z.number().nullish()
              })
              .nullish(),
            specialCostCondition: z
              .object({
                adjustPrice: z
                  .number({
                    required_error: 'Adjust Price is required',
                    invalid_type_error: 'Adjust Price must be a number'
                  })
                  .nullish(),
                fiscalYear: z.number().nullish(),
                version: z.number().nullish()
              })
              .nullish(),
            importFeeRate: z
              .object({
                importFeeRate: z.number().nullish(),
                fiscalYear: z.union([z.number(), z.string()]).nullish(),
                version: z.number().nullish()
              })
              .nullish()
          })
          .nullish(),
        totalProcessingTimeMh: z.number().nullish(),
        totalProcessingTimeIncludingIndirectRateOfDirectProcessCostMh: z.number().nullish(),
        directProcessCost: z.number().nullish(),
        totalDirectCost: z.number().nullish(),
        total: z.number().nullish()
      }),
      sctCompareNo1: z
        .object({
          costCondition: z
            .object({
              directCostCondition: z
                .object({
                  directUnitProcessCost: z.number().nullish(),
                  indirectRateOfDirectProcessCost: z.number().nullish(),
                  fiscalYear: z.number().nullish(),
                  version: z.number().nullish()
                })
                .nullish(),
              indirectCostCondition: z
                .object({
                  // labor: z.number(),
                  // depreciation: z.number(),
                  // otherExpense: z.number(),
                  totalIndirectCost: z.number().nullish(),
                  fiscalYear: z.number().nullish(),
                  version: z.number().nullish()
                })
                .nullish(),
              otherCostCondition: z
                .object({
                  ga: z.number().nullish(),
                  margin: z.number().nullish(),
                  sellingExpense: z.number().nullish(),
                  vat: z.number().nullish(),
                  cit: z.number().nullish(),
                  fiscalYear: z.number().nullish(),
                  version: z.number().nullish()
                })
                .nullish(),
              specialCostCondition: z
                .object({
                  adjustPrice: z.number().nullish(),
                  fiscalYear: z.number().nullish(),
                  version: z.number().nullish()
                })
                .nullish(),
              importFeeRate: z
                .object({
                  importFeeRate: z.number().nullish(),
                  fiscalYear: z.number().nullish(),
                  version: z.number().nullish()
                })
                .nullish()
            })
            .nullish(),
          totalProcessingTimeMh: z.number().nullish(),
          totalProcessingTimeIncludingIndirectRateOfDirectProcessCostMh: z.number().nullish(),
          directProcessCost: z.number().nullish(),
          totalDirectCost: z.number().nullish(),
          total: z.number().nullish()
        })
        .nullish(),
      sctCompareNo2: z
        .object({
          costCondition: z
            .object({
              directCostCondition: z
                .object({
                  directUnitProcessCost: z.number().nullish(),
                  indirectRateOfDirectProcessCost: z.number().nullish(),
                  fiscalYear: z.number().nullish(),
                  version: z.number().nullish()
                })
                .nullish(),
              indirectCostCondition: z
                .object({
                  // labor: z.number(),
                  // depreciation: z.number(),
                  // otherExpense: z.number(),
                  totalIndirectCost: z.number().nullish(),
                  fiscalYear: z.number().nullish(),
                  version: z.number().nullish()
                })
                .nullish(),
              otherCostCondition: z
                .object({
                  ga: z.number().nullish(),
                  margin: z.number().nullish(),
                  sellingExpense: z.number().nullish(),
                  vat: z.number().nullish(),
                  cit: z.number().nullish(),
                  fiscalYear: z.number().nullish(),
                  version: z.number().nullish()
                })
                .nullish(),
              specialCostCondition: z
                .object({
                  adjustPrice: z.number().nullish(),
                  fiscalYear: z.number().nullish(),
                  version: z.number().nullish()
                })
                .nullish(),
              importFeeRate: z
                .object({
                  importFeeRate: z.number().nullish(),
                  fiscalYear: z.number().nullish(),
                  version: z.number().nullish()
                })
                .nullish()
            })
            .nullish(),
          totalProcessingTimeMh: z.number().nullish(),
          totalProcessingTimeIncludingIndirectRateOfDirectProcessCostMh: z.number().nullish(),
          directProcessCost: z.number().nullish(),
          totalDirectCost: z.number().nullish(),
          total: z.number().nullish()
        })
        .nullish()
    }),
    totalCost: z
      .object({
        sellingExpenseForSellingPrice: z.number().nullish(),
        gAForSellingPrice: z.number().nullish(),
        marginForSellingPrice: z.number().nullish(),
        citForSellingPrice: z
          .number({
            required_error: 'CIT For Selling Price is required',
            invalid_type_error: 'CIT For Selling Price must be a number'
          })
          .nullish(),
        sellingPriceByFormula: z
          .number({
            required_error: 'Selling Price By Formula is required',
            invalid_type_error: 'Selling Price By Formula must be a number'
          })
          .nullish(),
        sellingPricePreview: z
          .number({
            required_error: 'Selling Price By Formula is required',
            invalid_type_error: 'Selling Price By Formula must be a number'
          })
          .nullish()
      })
      .nullish(),
    masterDataSelection: z.object(
      {
        directCostCondition: z.object(
          {
            SCT_COMPONENT_TYPE_ID: z.number({
              required_error: 'Master Data Selection is required',
              invalid_type_error: 'Master Data Selection is required'
            }),
            SCT_RESOURCE_OPTION_ID: z.number({
              required_error: 'Master Data Selection is required',
              invalid_type_error: 'Master Data Selection is required'
            })
          },
          {
            required_error: 'Master Data Selection is required',
            invalid_type_error: 'Master Data Selection is required'
          }
        ),
        indirectCostCondition: z.object(
          {
            SCT_COMPONENT_TYPE_ID: z.number({
              required_error: 'Master Data Selection is required',
              invalid_type_error: 'Master Data Selection is required'
            }),
            SCT_RESOURCE_OPTION_ID: z.number({
              required_error: 'Master Data Selection is required',
              invalid_type_error: 'Master Data Selection is required'
            })
          },
          {
            required_error: 'Master Data Selection is required',
            invalid_type_error: 'Master Data Selection is required'
          }
        ),
        specialCostCondition: z.object(
          {
            SCT_COMPONENT_TYPE_ID: z.number({
              required_error: 'Master Data Selection is required',
              invalid_type_error: 'Master Data Selection is required'
            }),
            SCT_RESOURCE_OPTION_ID: z.number({
              required_error: 'Master Data Selection is required',
              invalid_type_error: 'Master Data Selection is required'
            })
          },
          {
            required_error: 'Master Data Selection is required',
            invalid_type_error: 'Master Data Selection is required'
          }
        ),
        otherCostCondition: z.object(
          {
            SCT_COMPONENT_TYPE_ID: z.number({
              required_error: 'Master Data Selection is required',
              invalid_type_error: 'Master Data Selection is required'
            }),
            SCT_RESOURCE_OPTION_ID: z.number({
              required_error: 'Master Data Selection is required',
              invalid_type_error: 'Master Data Selection is required'
            })
          },
          {
            required_error: 'Master Data Selection is required',
            invalid_type_error: 'Master Data Selection is required'
          }
        ),
        yieldRateAndGoStraightRate: z.object(
          {
            SCT_COMPONENT_TYPE_ID: z.number({
              required_error: 'Master Data Selection is required',
              invalid_type_error: 'Master Data Selection is required'
            }),
            SCT_RESOURCE_OPTION_ID: z.number({
              required_error: 'Master Data Selection is required',
              invalid_type_error: 'Master Data Selection is required'
            })
          },
          {
            required_error: 'Master Data Selection is required',
            invalid_type_error: 'Master Data Selection is required'
          }
        ),
        manufacturingItemPrice: z.object(
          {
            SCT_COMPONENT_TYPE_ID: z.number({
              required_error: 'Master Data Selection is required',
              invalid_type_error: 'Master Data Selection is required'
            }),
            SCT_RESOURCE_OPTION_ID: z.number({
              required_error: 'Master Data Selection is required',
              invalid_type_error: 'Master Data Selection is required'
            })
          },
          {
            required_error: 'Master Data Selection is required',
            invalid_type_error: 'Master Data Selection is required'
          }
        ),
        clearTime: z.object(
          {
            SCT_COMPONENT_TYPE_ID: z.number({
              required_error: 'Master Data Selection is required',
              invalid_type_error: 'Master Data Selection is required'
            }),
            SCT_RESOURCE_OPTION_ID: z.number({
              required_error: 'Master Data Selection is required',
              invalid_type_error: 'Master Data Selection is required'
            })
          },
          {
            required_error: 'Master Data Selection is required',
            invalid_type_error: 'Master Data Selection is required'
          }
        ),
        yieldRateMaterial: z.object(
          {
            SCT_COMPONENT_TYPE_ID: z.number({
              required_error: 'Master Data Selection is required',
              invalid_type_error: 'Master Data Selection is required'
            }),
            SCT_RESOURCE_OPTION_ID: z.number({
              required_error: 'Master Data Selection is required',
              invalid_type_error: 'Master Data Selection is required'
            })
          },
          {
            required_error: 'Master Data Selection is required',
            invalid_type_error: 'Master Data Selection is required'
          }
        )
      },
      { required_error: 'Master Data Selection is required', invalid_type_error: 'Master Data Selection is required' }
    ),
    adjust: z.object({
      indirectCostCondition: z.object({
        totalIndirectCost: z.object({
          isAdjust: z.boolean(),
          isDisabledInput: z.boolean(),
          dataFromSctResourceOptionId: z.union([z.number(), z.literal(null)])
        })
      }),
      otherCostCondition: z.object({
        cit: z.object({
          isAdjust: z.boolean(),
          isDisabledInput: z.boolean(),
          dataFromSctResourceOptionId: z.union([z.number(), z.literal(null)])
        }),
        vat: z.object({
          isAdjust: z.boolean(),
          isDisabledInput: z.boolean(),
          dataFromSctResourceOptionId: z.union([z.number(), z.literal(null)])
        }),
        ga: z.object({
          isAdjust: z.boolean(),
          isDisabledInput: z.boolean(),
          dataFromSctResourceOptionId: z.union([z.number(), z.literal(null)])
        }),
        margin: z.object({
          isAdjust: z.boolean(),
          isDisabledInput: z.boolean(),
          dataFromSctResourceOptionId: z.union([z.number(), z.literal(null)])
        }),
        sellingExpense: z.object({
          isAdjust: z.boolean(),
          isDisabledInput: z.boolean(),
          dataFromSctResourceOptionId: z.union([z.number(), z.literal(null)])
        })
      }),
      specialCostCondition: z.object({
        adjustPrice: z.object({
          isAdjust: z.boolean(),
          isDisabledInput: z.boolean(),
          dataFromSctResourceOptionId: z.union([z.number(), z.literal(null)])
        })
      }),
      remarkForAdjustPrice: z.string()
    })
  })
  .superRefine((v, ctx) => {
    // 1. ตรวจสอบวันที่
    if (
      v.header.estimatePeriodStartDate &&
      v.header.estimatePeriodEndDate &&
      v.header.estimatePeriodEndDate <= v.header.estimatePeriodStartDate
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must be after start date',
        path: ['estimatePeriodEndDate']
      })
    }

    // 2. ตรวจสอบ Item version
    const invalidItems = v.directCost.materialInProcess.main.body.some(item => item.ITEM_IS_CURRENT == 0)
    if (invalidItems) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Item Code in BOM is not current version',
        path: ['directCost.materialInProcess.main.body']
      })
    }

    // 3. ตรวจสอบ Price
    const itemsWithoutPrice = v.directCost.materialInProcess.main.body.some(
      item =>
        ![2, 3].includes(item.ITEM_CATEGORY_ID_FROM_BOM) &&
        (typeof item.price?.amount === 'undefined' || item.price?.amount === null || item.price?.amount === '')
    )

    if (v.isSaveDraft === false && itemsWithoutPrice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'ไม่พบข้อมูล ราคา Material ในระบบ หรือ เวอร์ชันของ ราคา Material ไม่ถูกต้อง กรุณาตรวจสอบข้อมูลอีกครั้ง',
        path: ['directCost.materialInProcess.main.body']
      })
    }

    // // 4. ตรวจสอบข้อมูลระบบและความสอดคล้อง
    // if (v.isSaveDraft === false && !v.directCost.flowProcess.total?.main?.yieldRateAndGoStraightRate.version) {
    //   ctx.addIssue({
    //     code: z.ZodIssueCode.custom,
    //     message: 'ไม่พบข้อมูล YR GSR ในระบบ กรุณาตรวจสอบข้อมูลอีกครั้ง',
    //     path: ['directCost.flowProcess.total.main.yieldRateAndGoStraightRate.version']
    //   })
    // }

    // if (v.isSaveDraft === false && !v.directCost.flowProcess.total?.main?.clearTime.version) {
    //   ctx.addIssue({
    //     code: z.ZodIssueCode.custom,
    //     message: 'ไม่พบข้อมูล Clear Time ในระบบ กรุณาตรวจสอบข้อมูลอีกครั้ง',
    //     path: ['directCost.flowProcess.total.main.clearTime.version']
    //   })
    // }

    // 5. ตรวจสอบ Flow Code consistency
    if (
      v.isSaveDraft === false &&
      v.directCost.flowProcess.total?.main?.yieldRateAndGoStraightRate.flowId != v.header.bom.FLOW_ID
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Flow Code ของ YR GSR ไม่ตรงกับ SCT กรุณาตรวจสอบข้อมูลอีกครั้ง',
        path: ['directCost.flowProcess.total.main.yieldRateAndGoStraightRate.flowId']
      })
    }

    if (v.isSaveDraft === false && v.directCost.flowProcess.total?.main?.clearTime.flowId != v.header.bom.FLOW_ID) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Flow Code ของ Clear Time ไม่ตรงกับ SCT กรุณาตรวจสอบข้อมูลอีกครั้ง',
        path: ['directCost.flowProcess.total.main.clearTime.flowId']
      })
    }

    // 6.directCost
    if (v.isSaveDraft === false && !v.indirectCost?.main?.costCondition?.directCostCondition?.version) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Direct Cost Condition data not found in the system. Please try again.',
        path: ['directCost.flowProcess.total.main.directCostCondition.version']
      })
    }

    // 7.indirectCost
    if (v.isSaveDraft === false && !v.indirectCost?.main?.costCondition?.indirectCostCondition?.version) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Indirect Cost Condition data not found in the system. Please try again.',
        path: ['indirectCost.main.costCondition.indirectCostCondition.version']
      })
    }

    // 8.specialCost
    if (v.isSaveDraft === false && !v.indirectCost?.main?.costCondition?.specialCostCondition?.version) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Special Cost Condition data not found in the system. Please try again.',
        path: ['specialCost.main.costCondition.specialCostCondition.version']
      })
    }

    // 9.otherCost
    if (v.isSaveDraft === false && !v.indirectCost?.main?.costCondition?.otherCostCondition?.version) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Other Cost Condition data not found in the system. Please try again.',
        path: ['otherCost.main.costCondition.otherCostCondition.version']
      })
    }

    // 10.SCT COmpare
    if (v.sctComPareNo1?.SCT_ID || v.sctComPareNo2?.SCT_ID) {
      if (!v.sctComPareNo1?.isDefaultExportCompare && !v.sctComPareNo2?.isDefaultExportCompare) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'กรุณาเลือก SCT default export compare',
          path: ['sctComPareNo1', 'sctComPareNo2']
        })
      }
    }

    const flows = v.directCost.flowProcess.body.flowProcess.main

    // 11. Yield Rate
    const yieldRates = v.directCost.flowProcess.body.yieldRateGoStraightRateProcessForSct.main

    if (v.isSaveDraft === false) {
      const missingOrInvalid = flows.some(flow => {
        const match = yieldRates.find(y => y.flowId === flow.FLOW_ID && y.processId === flow.PROCESS_ID)

        if (!match) return true

        if (
          typeof match.yieldRateForSct !== 'number' ||
          isNaN(match.yieldRateForSct) ||
          typeof match.yieldAccumulationForSct !== 'number' ||
          isNaN(match.yieldAccumulationForSct) ||
          typeof match.goStraightRateForSct !== 'number' ||
          isNaN(match.goStraightRateForSct)
        ) {
          return true
        }

        return false
      })

      if (missingOrInvalid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'ข้อมูล Yield Rate ไม่ครบหรือไม่ถูกต้อง กรุณาตรวจสอบข้อมูลอีกครั้ง',
          path: ['directCost.flowProcess.body.yieldRateGoStraightRateProcessForSct.main']
        })
      }
    }

    // 12. Clear Time
    const clearTimes = v.directCost.flowProcess.body.clearTimeForSctProcess.main

    if (v.isSaveDraft === false) {
      const missingOrInvalid = flows.some(flow => {
        const match = clearTimes.find(
          ct => ct.flowId === flow.FLOW_ID && ct.processId === flow.PROCESS_ID // ถ้ามี process ต้องเช็คด้วย
        )

        if (!match) return true

        if (typeof match.clearTimeForSct !== 'number' || isNaN(match.clearTimeForSct)) {
          return true
        }

        return false
      })

      if (missingOrInvalid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'ข้อมูล Clear Time ไม่ครบหรือไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
          path: ['directCost.flowProcess.body.clearTimeForSctProcess.main']
        })
      }
    }

    const sellingPricePreview = v.totalCost?.sellingPricePreview
    if (v.isSaveDraft === false && (typeof sellingPricePreview !== 'number' || isNaN(sellingPricePreview))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ข้อมูล Selling Price Preview ไม่ครบหรือไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
        path: ['sctTotalCost.sellingPricePreview']
      })
    }
  })

export type FormDataPage = z.infer<typeof validationSchemaPage>
