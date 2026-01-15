import { z } from 'zod'

export const validationSchemaPage = z.object({
  searchFilters: z.object({
    PRODUCT_TYPE: z
      .object({
        PRODUCT_TYPE_ID: z.number(),
        PRODUCT_TYPE_CODE: z.string(),
        PRODUCT_TYPE_NAME: z.string()
      })
      .nullable(),
    FISCAL_YEAR: z
      .object({
        value: z.number(),
        label: z.string()
      })
      .nullable()
  }),
  searchResults: z.object({
    pageSize: z.number(),
    columnFilters: z.array(
      z.object({
        id: z.string(),
        value: z.unknown()
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
