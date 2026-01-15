import { requiredFieldMessage } from '@/libs/valibot/error-message/errorMessage'

import {
  array,
  forward,
  lazy,
  literal,
  nonEmpty,
  nullable,
  number,
  object,
  pipe,
  record,
  regex,
  string,
  transform,
  union
} from 'valibot'

export const saveSchema = object({
  PRODUCT_TYPE: object(
    {
      BOM_ID: number(),
      ITEM_CATEGORY_ID: number(),
      ITEM_CATEGORY_NAME: string(),
      PRODUCT_MAIN_ALPHABET: string(),
      PRODUCT_MAIN_ID: number(),
      PRODUCT_SPECIFICATION_TYPE_ALPHABET: string(),
      PRODUCT_SPECIFICATION_TYPE_NAME: string(),
      PRODUCT_SUB_ID: number(),
      PRODUCT_TYPE_CODE: string(),
      PRODUCT_TYPE_ID: number(),
      PRODUCT_TYPE_NAME: string()
    },
    'Product Type is required'
  ),
  FISCAL_YEAR: object(
    {
      value: number(),
      label: number()
    },
    'Fiscal Year is required'
  ),
  SCT_PATTERN_NO: object(
    {
      value: number(),
      label: string()
    },
    'Sct Pattern No is required'
  ),
  SCT_REASON_SETTING: object(
    {
      SCT_REASON_SETTING_ID: number(),
      SCT_REASON_SETTING_NAME: string()
    },
    'Sct Reason is required'
  ),
  START_DATE: object({}, 'Start Date is required'),
  END_DATE: object({}, 'End Date is required'),
  // FLOW_PROCESS: array(
  //   object({
  //     NO: number(),
  //     PROCESS_ID: number(),
  //     PROCESS_NAME: string()
  //   }),
  //   'Flow Process is required, Please Select Product Type or Select Copy & Edit Bom'
  // )
  MATERIAL_IN_PROCESS: record(
    string(),
    object({
      ITEM: object(
        {
          ITEM_CATEGORY_ALPHABET: string(),
          ITEM_CATEGORY_ID: number(),
          ITEM_CATEGORY_NAME: string(),
          ITEM_CATEGORY_SHORT_NAME: string(),
          ITEM_CODE_FOR_SUPPORT_MES: string(),
          ITEM_ID: number(),
          ITEM_INTERNAL_FULL_NAME: string(),
          UNIT_OF_MEASUREMENT_NAME: string()
        },
        'Item is required'
      ),
      ITEM_CATEGORY: object(
        {
          ITEM_CATEGORY_ID: number(),
          ITEM_CATEGORY_NAME: string(),
          ITEM_CATEGORY_ALPHABET: string()
        },
        'Item Category is required'
      ),
      PROCESS: object(
        {
          value: number(),
          label: string()
        },
        'Process is required'
      ),
      USAGE_QUANTITY: pipe(
        string(requiredFieldMessage({ fieldName: 'Usage Quantity' })),
        // nonEmpty('Usage Quantity is required'),
        regex(/^\d+(\.\d+)?$/, 'Usage Quantity must be a number'),
        transform((value: string) => {
          return parseFloat(value)
        })
      )
    })
  ),
  COST_CONDITION_RESOURCE_OPTION_ID: pipe(
    string(requiredFieldMessage({ fieldName: 'Cost Condition Resource Option' })),
    nonEmpty('Cost Condition Resource Option is required')
  ),
  MATERIAL_PRICE_RESOURCE_OPTION_ID: pipe(
    string(requiredFieldMessage({ fieldName: 'Manufacturing Item Price Resource Option' })),
    nonEmpty('Manufacturing Item Price Resource Option is required')
  ),
  YR_GR_FROM_ENGINEER_RESOURCE_OPTION_ID: pipe(
    string(requiredFieldMessage({ fieldName: 'Yield Rate & Go Straight Rate Resource Option' })),
    nonEmpty('Yield Rate & Go Straight Rate Resource Option is required')
  ),
  TIME_FROM_MFG_RESOURCE_OPTION_ID: pipe(
    string(requiredFieldMessage({ fieldName: 'Clear Time Resource Option' })),
    nonEmpty('Clear Time Resource Option is required')
  ),
  YR_ACCUMULATION_MATERIAL_FROM_ENGINEER_RESOURCE_OPTION_ID: pipe(
    string(requiredFieldMessage({ fieldName: 'Yield Rate Material Resource Option' })),
    nonEmpty('Yield Rate Material Resource Option is required')
  ),
  COST_CONDITION: union(
    [
      literal('1'),
      literal('3'),

      object(
        {
          DIRECT_COST_CONDITION: object(
            {
              DIRECT_COST_CONDITION_ID: string(),
              DIRECT_UNIT_PROCESS_COST: number(),
              INDIRECT_RATE_OF_DIRECT_PROCESS_COST: number(),
              FISCAL_YEAR: string(),
              PRODUCT_MAIN_ID: number(),
              PRODUCT_MAIN_NAME: string(),
              UPDATE_BY: string(),
              UPDATE_DATE: string(),
              VERSION: number()
            },
            'Direct Cost Condition is required'
          ),
          INDIRECT_COST_CONDITION: object(
            {
              INDIRECT_COST_CONDITION_ID: string(),
              DEPRECIATION: number(),
              LABOR: number(),
              OTHER_EXPENSE: number(),
              FISCAL_YEAR: string(),
              PRODUCT_MAIN_ID: number(),
              PRODUCT_MAIN_NAME: string(),
              UPDATE_BY: string(),
              UPDATE_DATE: string(),
              VERSION: number()
            },
            'Indirect Cost Condition is required'
          ),
          OTHER_COST_CONDITION: object(
            {
              OTHER_COST_CONDITION_ID: string(),
              CIT: number(),
              FISCAL_YEAR: string(),
              GA: number(),
              MARGIN: number(),
              SELLING_EXPENSE: number(),
              VAT: number(),
              PRODUCT_MAIN_ID: number(),
              PRODUCT_MAIN_NAME: string(),
              UPDATE_BY: string(),
              UPDATE_DATE: string(),
              VERSION: number()
            },
            'Other Cost Condition is required'
          ),
          SPECIAL_COST_CONDITION: object(
            {
              SPECIAL_COST_CONDITION_ID: string(),
              ADJUST_PRICE: number(),
              FISCAL_YEAR: string(),
              PRODUCT_MAIN_ID: number(),
              PRODUCT_MAIN_NAME: string(),
              UPDATE_BY: string(),
              UPDATE_DATE: string(),
              VERSION: number()
            },
            'Special Cost Condition is required'
          )
        },
        'Cost Condition is required'
      ),
      object(
        {
          SCT_ID: string(),
          SCT_REVISION_CODE: string(),
          SCT_F_ID: string()
        },
        'Cost Condition is required'
      ),
      object({}, 'Cost Condition is required')
    ],
    'Please click the option again and Select the data'
  ),
  MATERIAL_PRICE: union(
    [
      literal('1'),
      literal('3'),
      object({
        FISCAL_YEAR: number()
      }),
      object({
        SCT_ID: string(),
        SCT_REVISION_CODE: string(),
        SCT_F_ID: string()
      })
    ],
    'Please click the option again and Select the data'
  ),
  YR_GR_FROM_ENGINEER: union(
    [
      literal('1'),
      literal('3'),
      object({
        FISCAL_YEAR: number()
      }),
      object({
        SCT_ID: string(),
        SCT_REVISION_CODE: string(),
        SCT_F_ID: string()
      })
    ],
    'Please click the option again and Select the data'
  ),
  TIME_FROM_MFG: union(
    [
      literal('1'),
      literal('3'),
      object({
        FISCAL_YEAR: number()
      }),
      object({
        SCT_ID: string(),
        SCT_REVISION_CODE: string(),
        SCT_F_ID: string()
      })
    ],
    'Please click the option again and Select the data'
  ),
  YR_ACCUMULATION_MATERIAL_FROM_ENGINEER: union(
    [
      literal('1'),
      literal('3'),
      object({
        FISCAL_YEAR: number()
      }),
      object({
        SCT_ID: string(),
        SCT_REVISION_CODE: string(),
        SCT_F_ID: string()
      })
    ],
    'Please click the option again and Select the data'
  )
})

export const draftSchema = object({
  PRODUCT_TYPE: object(
    {
      BOM_ID: number(),
      ITEM_CATEGORY_ID: number(),
      ITEM_CATEGORY_NAME: string(),
      PRODUCT_MAIN_ALPHABET: string(),
      PRODUCT_MAIN_ID: number(),
      PRODUCT_SPECIFICATION_TYPE_ALPHABET: string(),
      PRODUCT_SPECIFICATION_TYPE_NAME: string(),
      PRODUCT_SUB_ID: number(),
      PRODUCT_TYPE_CODE: string(),
      PRODUCT_TYPE_ID: number(),
      PRODUCT_TYPE_NAME: string()
    },
    'Product Type is required'
  ),
  FISCAL_YEAR: object(
    {
      value: number(),
      label: number()
    },
    'Fiscal Year is required'
  ),
  SCT_PATTERN_NO: object(
    {
      value: number(),
      label: string()
    },
    'Sct Pattern No is required'
  ),
  SCT_REASON_SETTING: object(
    {
      SCT_REASON_SETTING_ID: number(),
      SCT_REASON_SETTING_NAME: string()
    },
    'Sct Reason is required'
  )
})
