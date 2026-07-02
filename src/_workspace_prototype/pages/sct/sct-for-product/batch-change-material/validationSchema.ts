import {
  maxLengthFieldMessage,
  minLengthFieldMessage,
  requiredFieldMessage
} from '@/libs/valibot/error-message/errorMessage'

import { z } from 'zod'

// Main Validation Schema
export const validationSchema = z.object({
  // (1) searchFilters
  searchFilters: z.object({
    // product group
    productCategory: z
      .object({
        PRODUCT_CATEGORY_ID: z
          .number({
            required_error: requiredFieldMessage({ fieldName: 'Product Category' }),
            invalid_type_error: requiredFieldMessage({ fieldName: 'Product Category' })
          })
          .int({ message: requiredFieldMessage({ fieldName: 'Product Category' }) })
          .positive({ message: requiredFieldMessage({ fieldName: 'Product Category' }) }),
        PRODUCT_CATEGORY_NAME: z.string().min(1, requiredFieldMessage({ fieldName: 'Product Category' }))
      })
      .optional()
      .nullable(),
    productMain: z
      .object({
        PRODUCT_MAIN_ID: z
          .number({
            required_error: requiredFieldMessage({ fieldName: 'Product Main' }),
            invalid_type_error: requiredFieldMessage({ fieldName: 'Product Main' })
          })
          .int({ message: requiredFieldMessage({ fieldName: 'Product Main' }) })
          .positive({ message: requiredFieldMessage({ fieldName: 'Product Main' }) }),
        PRODUCT_MAIN_NAME: z.string().min(1, requiredFieldMessage({ fieldName: 'Product Main' }))
      })
      .optional()
      .nullable(),
    productSub: z
      .object({
        PRODUCT_SUB_ID: z
          .number({
            required_error: requiredFieldMessage({ fieldName: 'Product Sub' }),
            invalid_type_error: requiredFieldMessage({ fieldName: 'Product Sub' })
          })
          .int({ message: requiredFieldMessage({ fieldName: 'Product Sub' }) })
          .positive({ message: requiredFieldMessage({ fieldName: 'Product Sub' }) })
      })
      .optional()
      .nullable(),
    productType: z
      .object({
        PRODUCT_TYPE_ID: z
          .number({
            required_error: requiredFieldMessage({ fieldName: 'Product Type' }),
            invalid_type_error: requiredFieldMessage({ fieldName: 'Product Type' })
          })
          .int({ message: requiredFieldMessage({ fieldName: 'Product Type' }) })
          .positive({ message: requiredFieldMessage({ fieldName: 'Product Type' }) })
      })
      .optional()
      .nullable(),

    // other
    itemCodeForSupportMes: z
      .string({
        required_error: requiredFieldMessage({ fieldName: 'Item Code' }),
        invalid_type_error: requiredFieldMessage({ fieldName: 'Item Code' })
      })
      .min(3, minLengthFieldMessage({ fieldName: 'Item Code', minLength: 3 }))
      .max(100, maxLengthFieldMessage({ fieldName: 'Item Code', maxLength: 100 }))
      .optional()
      .nullable()
  })
})

export type FormData = z.infer<typeof validationSchema>
