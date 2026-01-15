export interface SctTotalCostI {
  SCT_TOTAL_COST_ID: string
  SCT_ID: string
  DIRECT_UNIT_PROCESS_COST: number
  INDIRECT_RATE_OF_DIRECT_PROCESS_COST: number
  TOTAL_PROCESSING_TIME: number
  TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE: number
  TOTAL_DIRECT_COST: number
  DIRECT_PROCESS_COST: number
  IMPORTED_FEE: number
  IMPORTED_COST: number
  TOTAL: number
  TOTAL_PRICE_OF_RAW_MATERIAL: number
  TOTAL_PRICE_OF_SUB_ASSY: number
  TOTAL_PRICE_OF_SEMI_FINISHED_GOODS: number
  TOTAL_PRICE_OF_CONSUMABLE: number
  TOTAL_PRICE_OF_PACKING: number
  TOTAL_PRICE_OF_ALL_OF_ITEMS: number
  RM_INCLUDE_IMPORTED_COST: number
  CONSUMABLE_PACKING: number
  MATERIALS_COST: number
  INDIRECT_COST_SALE_AVE: number
  SELLING_EXPENSE: number
  GA: number
  MARGIN: number
  ESTIMATE_PERIOD_START_DATE: string
  TOTAL_YIELD_RATE: number
  TOTAL_CLEAR_TIME: number
  ADJUST_PRICE: number
  REMARK_FOR_ADJUST_PRICE: string | null | undefined
  NOTE: string
  SELLING_EXPENSE_FOR_SELLING_PRICE: number
  GA_FOR_SELLING_PRICE: number
  MARGIN_FOR_SELLING_PRICE: number
  IS_ADJUST_IMPORTED_COST: number
  IMPORTED_COST_DEFAULT: number
  TOTAL_GO_STRAIGHT_RATE: number
  CIT_FOR_SELLING_PRICE: number
  RAW_MATERIAL_SUB_ASSY_SEMI_FINISHED_GOODS: number
  ASSEMBLY_GROUP_FOR_SUPPORT_MES: string
  VAT_FOR_SELLING_PRICE: number
  CIT: number
  VAT: number
  TOTAL_PRICE_OF_ALL_OF_ITEMS_INCLUDE_IMPORTED_COST: number
  TOTAL_ESSENTIAL_TIME: number
  SELLING_PRICE_BY_FORMULA: number | null | undefined
  SELLING_PRICE: number | null | undefined
  CREATE_BY: string
  CREATE_DATE: string
  UPDATE_BY: string
  UPDATE_DATE: string
  INUSE: number
  IS_FROM_SCT_COPY: number
  ESTIMATE_PERIOD_END_DATE: string
  //  SCT_TOTAL_COST_ID: z.number(),
  //         SCT_ID: z.string(),
  //         DIRECT_UNIT_PROCESS_COST: z.number(),
  //         INDIRECT_RATE_OF_DIRECT_PROCESS_COST: z.number(),
  //         TOTAL_PROCESSING_TIME: z.number(),
  //         TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE: z.number(),
  //         TOTAL_DIRECT_COST: z.number(),
  //         DIRECT_PROCESS_COST: z.number(),
  //         IMPORTED_FEE: z.number(),
  //         IMPORTED_COST: z.number(),
  //         TOTAL: z.number(),
  //         TOTAL_PRICE_OF_RAW_MATERIAL: z.number(),
  //         TOTAL_PRICE_OF_SUB_ASSY: z.number(),
  //         TOTAL_PRICE_OF_SEMI_FINISHED_GOODS: z.number(),
  //         TOTAL_PRICE_OF_CONSUMABLE: z.number(),
  //         TOTAL_PRICE_OF_PACKING: z.number(),
  //         TOTAL_PRICE_OF_ALL_OF_ITEMS: z.number(),
  //         RM_INCLUDE_IMPORTED_COST: z.number(),
  //         CONSUMABLE_PACKING: z.number(),
  //         MATERIALS_COST: z.number(),
  //         INDIRECT_COST_SALE_AVE: z.number(),
  //         SELLING_EXPENSE: z.number(),
  //         GA: z.number(),
  //         MARGIN: z.number(),
  //         ESTIMATE_PERIOD_START_DATE: z.string(),
  //         TOTAL_YIELD_RATE: z.number(),
  //         TOTAL_CLEAR_TIME: z.number(),
  //         ADJUST_PRICE: z.number(),
  //         REMARK_FOR_ADJUST_PRICE: z.string(),
  //         NOTE: z.string(),
  //         SELLING_EXPENSE_FOR_SELLING_PRICE: z.number(),
  //         GA_FOR_SELLING_PRICE: z.number(),
  //         MARGIN_FOR_SELLING_PRICE: z.number(),
  //         IS_ADJUST_IMPORTED_COST: z.number(),
  //         IMPORTED_COST_DEFAULT: z.number(),
  //         TOTAL_GO_STRAIGHT_RATE: z.number(),
  //         CIT_FOR_SELLING_PRICE: z.number(),
  //         RAW_MATERIAL_SUB_ASSY_SEMI_FINISHED_GOODS: z.number(),
  //         ASSEMBLY_GROUP_FOR_SUPPORT_MES: z.number(),
  //         VAT_FOR_SELLING_PRICE: z.number(),
  //         CIT: z.number(),
  //         VAT: z.number(),
  //         TOTAL_PRICE_OF_ALL_OF_ITEMS_INCLUDE_IMPORTED_COST: z.number(),
  //         ESTIMATE_PERIOD_END_DATE: z.string(),
  //         TOTAL_ESSENTIAL_TIME: z.number(),
  //         SELLING_PRICE_BY_FORMULA: z.number(),
  //         SELLING_PRICE: z.number(),
  //         DESCRIPTION: z.string(),
  //         CREATE_BY: z.string(),
  //         CREATE_DATE: z.string(),
  //         UPDATE_BY: z.string(),
  //         UPDATE_DATE: z.string(),
  //         INUSE: z.number(),
  //         IS_FROM_SCT_COPY: z.number()
}
