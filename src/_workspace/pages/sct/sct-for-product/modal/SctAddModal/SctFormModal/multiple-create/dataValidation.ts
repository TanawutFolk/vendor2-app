import { z } from 'zod'

const PerProductType = z
  .object(
    {
      sctCreateFrom: z.enum(['BOM - BOM Actual', 'SCT Last Revision', 'SCT Selection']).nullish(),
      bomId: z.number().int().positive().nullish(),
      bomCode: z.string().nullish(),
      bomName: z.string().nullish(),

      // SCT Selection
      sctSelectId: z.string().nullish(),
      sctSelectStatusProgress: z
        .object({
          SCT_STATUS_PROGRESS_ID: z.number().nullish(),
          SCT_STATUS_PROGRESS_NAME: z.string().nullish()
        })
        .nullish(),
      sctRevisionCode: z.string().nullish(),
      sctSelectFiscalYear: z
        .object({
          value: z.number(),
          label: z.string()
        })
        .nullish(),
      sctSelectPattern: z
        .object({
          SCT_PATTERN_ID: z.number(),
          SCT_PATTERN_NAME: z.string()
        })
        .nullish(),
      fiscalYearForSelection: z
        .object(
          {
            value: z.number(),
            label: z.string()
          },
          {
            required_error: 'Fiscal Year is required',
            invalid_type_error: 'Fiscal Year is required'
          }
        )
        .nullish(),
      sctPatternNameForSelection: z
        .object(
          {
            SCT_PATTERN_ID: z.number(),
            SCT_PATTERN_NAME: z.string()
          },
          {
            required_error: 'SCT Pattern No is required',
            invalid_type_error: 'SCT Pattern No is required'
          }
        )
        .nullish()
    },
    {
      required_error: 'กรุณากรอกข้อมูล Product Type',
      invalid_type_error: 'กรุณากรอกข้อมูล Product Type'
    }
  )
  .nullish()
  .superRefine((v, ctx) => {
    if (!v?.sctCreateFrom) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sctCreateFrom'],
        message: 'Please complete all required fields.'
      })
    }

    if (!v?.bomId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sctCreateFrom'],
        message: 'Please complete all required fields.'
      })
    }

    if ((v?.sctCreateFrom === 'SCT Last Revision' || v?.sctCreateFrom === 'SCT Selection') && !v?.sctSelectId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sctSelectId'],
        message: 'SCT Last Revision not found.'
      })
    }

    // if (
    //   v?.sctCreateFrom === 'SCT Last Revision' &&
    //   (!v?.SwitchFiscalYearForSelection?.value || !v?.sctSelectPattern?.SCT_PATTERN_ID)
    // ) {
    //   ctx.addIssue({
    //     code: z.ZodIssueCode.custom,
    //     path: ['sctSelectId'],
    //     message: 'Please select a Fiscal Year and SCT Pattern Name'
    //   })
    // }

    if (v?.sctCreateFrom === 'SCT Selection' && !v?.sctSelectId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sctSelectId'],
        message: 'Please select a SCT Selection'
      })
    }
  })

export const validationSchemaPage = z
  .object({
    header: z.object({
      fiscalYear: z.object(
        {
          value: z.number(),
          label: z.string()
        },
        {
          required_error: 'Fiscal Year is required',
          invalid_type_error: 'Fiscal Year is required'
        }
      ),
      sctPatternNo: z
        .object(
          {
            value: z.number(),
            label: z.string()
          },
          {
            required_error: 'SCT Pattern No is required',
            invalid_type_error: 'SCT Pattern No is required'
          }
        )
        .nullish(),
      sctReason: z.object(
        {
          SCT_REASON_SETTING_ID: z.number(),
          SCT_REASON_SETTING_NAME: z.string()
        },
        {
          required_error: 'SCT Reason is required',
          invalid_type_error: 'SCT Reason is required'
        }
      ),
      sctTag: z
        .object({
          SCT_TAG_SETTING_ID: z.number(),
          SCT_TAG_SETTING_NAME: z.string()
        })
        .nullish(),
      estimatePeriodStartDate: z
        .date({
          required_error: 'Estimate Period Start Date is required',
          invalid_type_error: 'Estimate Period Start Date is required'
        })
        .nullish(),
      estimatePeriodEndDate: z
        .date({
          required_error: 'Estimate Period End Date is required',
          invalid_type_error: 'Estimate Period End Date is required'
        })
        .nullish(),
      note: z.string().nullish()
    }),

    productType: z.object({
      header: z.object({
        switchBomActualAll: z.boolean(),

        SwitchFiscalYearForSelection: z
          .object({
            value: z.number(),
            label: z.string()
          })
          .nullish(),
        SwitchSctPatternNameForSelection: z
          .object({
            SCT_PATTERN_ID: z.number(),
            SCT_PATTERN_NAME: z.string()
          })
          .nullish(),

        switchSctLatestRevisionAll: z.boolean()
        //switchSctSelectionAll: z.boolean()
      }),
      body: z.record(z.string(), PerProductType)
    }),
    //.nullish(),
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
    )
    //.nullish()
  })
  .superRefine((v, ctx) => {
    if (!v?.header.estimatePeriodStartDate || !v?.header.estimatePeriodEndDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['estimatePeriodStartDate', 'estimatePeriodEndDate'],
        message: 'Estimate Period Start Date and Estimate Period End Date is required.'
      })
    }

    if (!v?.header.sctPatternNo?.value) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sctPatternNo'],
        message: 'SCT Pattern No is required.'
      })
    }
  })

// COST_CONDITION_RESOURCE_OPTION_ID: z
//   .string({
//     required_error: requiredFieldMessage({ fieldName: 'Cost Condition Resource Option' })
//   })
//   .min(1, 'Cost Condition Resource Option is required'),

// MATERIAL_PRICE_RESOURCE_OPTION_ID: z
//   .string({
//     required_error: requiredFieldMessage({ fieldName: 'Manufacturing Item Price Resource Option' })
//   })
//   .min(1, 'Manufacturing Item Price Resource Option is required'),

// YR_GR_FROM_ENGINEER_RESOURCE_OPTION_ID: z
//   .string({
//     required_error: requiredFieldMessage({ fieldName: 'Yield Rate & Go Straight Rate Resource Option' })
//   })
//   .min(1, 'Yield Rate & Go Straight Rate Resource Option is required'),

// TIME_FROM_MFG_RESOURCE_OPTION_ID: z
//   .string({
//     required_error: requiredFieldMessage({ fieldName: 'Clear Time Resource Option' })
//   })
//   .min(1, 'Clear Time Resource Option is required'),

// YR_ACCUMULATION_MATERIAL_FROM_ENGINEER_RESOURCE_OPTION_ID: z
//   .string({
//     required_error: requiredFieldMessage({ fieldName: 'Yield Rate Material Resource Option' })
//   })
//   .min(1, 'Yield Rate Material Resource Option is required')
// })

// export const draftSchema = z.object({
//   PRODUCT_TYPE: z.object(
//     {
//       BOM_ID: z.number(),
//       ITEM_CATEGORY_ID: z.number(),
//       ITEM_CATEGORY_NAME: z.string(),
//       PRODUCT_MAIN_ALPHABET: z.string(),
//       PRODUCT_MAIN_ID: z.number(),
//       PRODUCT_SPECIFICATION_TYPE_ALPHABET: z.string(),
//       PRODUCT_SPECIFICATION_TYPE_NAME: z.string(),
//       PRODUCT_SUB_ID: z.number(),
//       PRODUCT_TYPE_CODE: z.string(),
//       PRODUCT_TYPE_ID: z.number(),
//       PRODUCT_TYPE_NAME: z.string()
//     },
//     { required_error: 'Product Type is required' }
//   ),

//   FISCAL_YEAR: z.object(
//     {
//       value: z.number(),
//       label: z.number()
//     },
//     { required_error: 'Fiscal Year is required' }
//   ),

//   SCT_PATTERN_NO: z.object(
//     {
//       value: z.number(),
//       label: z.string()
//     },
//     { required_error: 'SCT Pattern No is required' }
//   )
// })

export type FormDataPage = z.infer<typeof validationSchemaPage>
