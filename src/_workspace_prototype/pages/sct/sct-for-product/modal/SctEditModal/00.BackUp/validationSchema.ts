// Import Validation Schema
import { z } from 'zod'

// Validation Schema
export const draftValidationSchema = z.object({})

const MaterialPriceSchema = z
  .object({
    BOM_FLOW_PROCESS_ITEM_USAGE_ID: z.number(),
    ITEM_CATEGORY_ID: z.number(),
    ITEM_CODE_FOR_SUPPORT_MES: z.string(),
    ITEM_INTERNAL_SHORT_NAME: z.string(),
    SCT_ID: z.string(),
    PURCHASE_UNIT_RATIO: z.number(),
    USAGE_UNIT_RATIO: z.number(),
    ITEM_M_S_PRICE_VALUE: z.number().nullish()
  })
  .superRefine((data, ctx) => {
    if (
      [2, 3].includes(data.ITEM_CATEGORY_ID) == false &&
      (data.ITEM_M_S_PRICE_VALUE === null ||
        isNaN(data.ITEM_M_S_PRICE_VALUE) ||
        typeof data.ITEM_M_S_PRICE_VALUE === 'undefined')
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['MATERIAL_PRICE_DATA'],
        message: 'Please enter a valid number only'
      })
    }
  })

export const saveValidationSchema = z.object({
  BOM_CODE: z.string({
    message: 'ไม่มี Bom Code'
  }),
  BOM_CODE_ACTUAL: z.string({
    message: 'ไม่มี Bom Code Actual'
  }),
  BOM_NAME: z.string({
    message: 'ไม่มี Bom Name'
  }),
  BOM_NAME_ACTUAL: z.string({
    message: 'ไม่มี Bom Name Actual'
  }),
  CLEAR_TIME: z
    .array(
      z.object({
        PROCESS_ID: z.number(),
        CLEAR_TIME_FOR_SCT: z.number()
      })
    )
    .min(1, {
      message: 'ไม่มีข้อมูล Clear Time'
    }),
  CLEAR_TIME_TOTAL: z.object(
    {
      TOTAL_CLEAR_TIME_FOR_SCT: z.number({ message: 'ไม่มีข้อมูล Clear Time' })
    },
    {
      message: 'ไม่มีข้อมูล Clear Time'
    }
  ),
  COST_CONDITION: z.number({
    message: 'โปรดเลือก Cost Condition'
  }),
  COST_CONDITION_RESOURCE_OPTION_ID: z.number({
    message: 'โปรดเลือก Cost Condition'
  }),
  // DIRECT_COST_CONDITION: z.object(
  //   {
  //     DIRECT_COST_CONDITION_ID: z.string(),
  //     DIRECT_UNIT_PROCESS_COST: z.number(),
  //     FISCAL_YEAR: z.string(),
  //     INDIRECT_RATE_OF_DIRECT_PROCESS_COST: z.number(),
  //     VERSION: z.number()
  //   },
  //   {
  //     message: 'ไม่พบข้อมูล Direct Cost Condition'
  //   }
  // ),
  START_DATE: z.any().refine(val => val !== null && val !== undefined, {
    message: 'โปรดเลือกวันที่'
  }),
  END_DATE: z.any().refine(val => val !== null && val !== undefined, {
    message: 'โปรดเลือกวันที่'
  }),
  FISCAL_YEAR: z.object({
    value: z.string(),
    label: z.string()
  }),
  FLOW_CODE: z.string(),
  IMPORT_FEE_RATE: z.number(),
  // INDIRECT_COST_CONDITION: z.object(
  //   {
  //     INDIRECT_COST_CONDITION_ID: z.string(),
  //     DEPRECIATION: z.number(),
  //     LABOR: z.number(),
  //     OTHER_EXPENSE: z.number(),
  //     TOTAL_INDIRECT_COST: z.number(),
  //     FISCAL_YEAR: z.string(),
  //     VERSION: z.number()
  //   },
  //   {
  //     message: 'ไม่พบข้อมูล Indirect Cost Condition'
  //   }
  // ),

  //   ADJUST_PRICE: z.any().refine(
  //   val => {
  //     if (val === 0) return true

  //     if (val === '') return true
  //     const num = Number(val)
  //     return !isNaN(num) && val.trim() === val
  //   },
  //   {
  //     message: 'ต้องเป็นตัวเลข'
  //   }
  // ),

  ADJUST_PRICE: z
    .union([
      z.string().refine(val => val.trim() !== '', {
        message: 'Adjust Price is required'
      }),
      z.number()
    ])
    .transform(val => Number(val))
    .refine(val => !isNaN(val), {
      message: 'Please enter a valid number only'
    }),
  INDIRECT_COST_CONDITION: z.object({
    TOTAL_INDIRECT_COST: z
      .union([
        z.string().refine(val => val.trim() !== '', {
          message: 'Indirect Cost (Sale Ave.) is required'
        }),
        z.number()
      ])
      .transform(val => Number(val))
      .refine(val => !isNaN(val), {
        message: 'Please enter a valid number only'
      })
  }),
  ITEM_CATEGORY: z.string(),
  MATERIAL_AMOUNT: z.array(
    z.object({
      AMOUNT: z.number(),
      ITEM_CATEGORY_ID: z.number(),
      ITEM_NO: z.number()
    })
  ),
  MATERIAL_PRICE: z.number(),
  MATERIAL_PRICE_RESOURCE_OPTION_ID: z.number(),
  MATERIAL_PRICE_DATA: z.array(MaterialPriceSchema),
  // OTHER_COST_CONDITION: z.object(
  //   {
  //     CIT: z.number(),
  //     FISCAL_YEAR: z.string(),
  //     GA: z.number(),
  //     MARGIN: z.number(),
  //     OTHER_COST_CONDITION_ID: z.string(),
  //     SELLING_EXPENSE: z.number(),
  //     VAT: z.number(),
  //     VERSION: z.number()
  //   },
  //   {
  //     message: 'ไม่พบข้อมูล Other Cost Condition'
  //   }
  // ),
  PRODUCT_CATEGORY: z.object({
    PRODUCT_CATEGORY_ID: z.number(),
    PRODUCT_CATEGORY_NAME: z.string(),
    PRODUCT_CATEGORY_ALPHABET: z.string()
  }),
  PRODUCT_MAIN: z.object({
    PRODUCT_MAIN_ID: z.number(),
    PRODUCT_MAIN_NAME: z.string(),
    PRODUCT_MAIN_ALPHABET: z.string()
  }),
  PRODUCT_SPECIFICATION_TYPE: z.string(),
  PRODUCT_SUB: z.object({
    PRODUCT_SUB_ID: z.number(),
    PRODUCT_SUB_NAME: z.string(),
    PRODUCT_SUB_ALPHABET: z.string()
  }),
  PRODUCT_TYPE: z.object({
    PRODUCT_TYPE_ID: z.number(),
    PRODUCT_TYPE_NAME: z.string(),
    PRODUCT_TYPE_CODE: z.string()
  }),
  SCT_FLOW_PROCESS: z
    .array(
      z.object({
        ESSENTIAL_TIME: z.number(),
        FLOW_PROCESS_ID: z.number(),
        PROCESS_CODE: z.string(),
        PROCESS_ID: z.number(),
        PROCESS_NAME: z.string(),
        PROCESS_NO: z.number(),
        SCT_ID: z.string()
      })
    )
    .min(1, {
      message: 'ไม่มีข้อมูล Flow Process'
    }),
  SCT_ID: z.string(),
  SCT_MATERIAL: z
    .array(
      z.object({
        BOM_FLOW_PROCESS_ITEM_USAGE_ID: z.number(),
        ITEM_CATEGORY_ID: z.number(),
        ITEM_CATEGORY_NAME: z.string(),
        ITEM_CODE_FOR_SUPPORT_MES: z.string(),
        ITEM_ID: z.number(),
        ITEM_INTERNAL_SHORT_NAME: z.string(),
        ITEM_NO: z.number(),
        PROCESS_ID: z.number(),
        PROCESS_NAME: z.string(),
        PROCESS_NO: z.number(),
        SCT_ID: z.string(),
        USAGE_QUANTITY: z.number()
      })
    )
    .min(1, {
      message: 'ไม่มีข้อมูล Material'
    }),
  SCT_PATTERN_NO: z.object({
    value: z.number(),
    label: z.string()
  }),
  SCT_REASON_SETTING: z.object(
    {
      SCT_REASON_SETTING_ID: z.number(),
      SCT_REASON_SETTING_NAME: z.string()
    },
    {
      message: 'ไม่พบข้อมูล SCT Reason Setting'
    }
  ),
  SCT_REVISION_CODE: z.string({
    message: 'ไม่มี SCT Revision Code'
  }),
  SCT_STATUS_PROGRESS: z.object({
    SCT_STATUS_PROGRESS_ID: z.number(),
    SCT_STATUS_PROGRESS_NAME: z.string()
  }),
  // SPECIAL_COST_CONDITION: z.object({
  //   ADJUST_PRICE: z.number(),
  //   FISCAL_YEAR: z.string(),
  //   SPECIAL_COST_CONDITION_ID: z.any(),
  //   VERSION: z.number()
  // }),
  TIME_FROM_MFG: z.number(),
  TIME_FROM_MFG_RESOURCE_OPTION_ID: z.number(),
  TOTAL_COUNT_PROCESS: z.number(),
  TOTAL_ESSENTIAL_TIME: z.number(),
  YR_ACCUMULATION_MATERIAL_FROM_ENGINEER: z.number(),
  YR_ACCUMULATION_MATERIAL_FROM_ENGINEER_RESOURCE_OPTION_ID: z.number(),
  YR_GR: z.array(
    z.object({
      COLLECTION_POINT_FOR_SCT: z.number(),
      GO_STRAIGHT_RATE_FOR_SCT: z.number(),
      PROCESS_ID: z.number(),
      YIELD_ACCUMULATION_FOR_SCT: z.number(),
      YIELD_RATE_FOR_SCT: z.number()
    })
  ),
  YR_GR_FROM_ENGINEER: z.number(),
  YR_GR_FROM_ENGINEER_RESOURCE_OPTION_ID: z.number(),
  YR_GR_TOTAL: z.object({
    TOTAL_GO_STRAIGHT_RATE_FOR_SCT: z.number(),
    TOTAL_YIELD_RATE_FOR_SCT: z.number()
  }),

  SctMasterDataHistory: z.array(
    z.object({
      FISCAL_YEAR: z.string(),
      VERSION: z.number()
    })
  )
})

// FormData Type
export type DraftFormData = z.infer<typeof draftValidationSchema>
export type SaveFormData = z.infer<typeof saveValidationSchema>
