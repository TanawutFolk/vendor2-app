import { z } from 'zod'

export const validationSchemaPage = z.object({
  searchFilters: z.object({
    PRODUCT_TYPE: z
      .object({
        PRODUCT_TYPE_ID: z.number(),
        PRODUCT_TYPE_NAME: z.string(),
        PRODUCT_TYPE_CODE: z.string()
      })
      .nullable(),
    PRODUCT_CATEGORY: z
      .object({
        PRODUCT_CATEGORY_ID: z.number(),
        PRODUCT_CATEGORY_NAME: z.string()
      })
      .nullable(),
    PRODUCT_MAIN: z
      .object({
        PRODUCT_MAIN_ID: z.number(),
        PRODUCT_MAIN_NAME: z.string()
      })
      .nullable(),
    PRODUCT_SUB: z
      .object({
        PRODUCT_SUB_ID: z.number(),
        PRODUCT_SUB_NAME: z.string()
      })
      .nullable(),
    FISCAL_YEAR: z
      .object({
        value: z.number(),
        label: z.string()
      })
      .nullable(),
    SCT_PATTERN_NO: z
      .object({
        SCT_PATTERN_ID: z.number(),
        SCT_PATTERN_NAME: z.string()
      })
      .nullable(),
    BOM: z
      .object({
        BOM_ID: z.number(),
        BOM_CODE: z.string(),
        BOM_NAME: z.string()
      })
      .nullable()
  }),

  searchResults: z.object({
    pageSize: z.number(),
    columnFilters: z.array(
      z.object({
        id: z.string(),
        value: z.union([z.string(), z.unknown()])
      })
    ),
    sorting: z.array(
      z.object({
        desc: z.boolean(),
        id: z.string()
      })
    ),
    density: z.enum(['comfortable', 'compact', 'spacious']),
    columnVisibility: z.record(z.string(), z.boolean()),
    columnPinning: z.object({
      left: z.array(z.string()).optional(),
      right: z.array(z.string()).optional()
    }),
    columnOrder: z.array(z.string()),
    columnFilterFns: z.record(z.string(), z.any())
  })
})

export type FormDataPage = z.infer<typeof validationSchemaPage>
