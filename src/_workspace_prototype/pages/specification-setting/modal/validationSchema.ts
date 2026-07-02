// Import Validation Schema
import { z } from 'zod'
import {
  maxLengthFieldMessage,
  minLengthFieldMessage,
  requiredFieldMessage
} from '@/libs/valibot/error-message/errorMessage'

// Validation Schema
export const validationSchema = z.object({
  searchFilters: z.object({
    // Other
    specificationSetting: z
      .string({
        required_error: requiredFieldMessage({ fieldName: 'Product Specification Document Setting Name' }),
        invalid_type_error: requiredFieldMessage({ fieldName: 'Product Specification Document Setting Name' })
      })
      .min(3, minLengthFieldMessage({ fieldName: 'Product Specification Document Setting Name', minLength: 3 }))
      .max(100, maxLengthFieldMessage({ fieldName: 'Product Specification Document Setting Name', maxLength: 100 })),

    specificationSettingNumber: z
      .string({
        required_error: requiredFieldMessage({ fieldName: 'Product Specification Document Setting Number' }),
        invalid_type_error: requiredFieldMessage({ fieldName: 'Product Specification Document Setting Number' })
      })
      .min(3, minLengthFieldMessage({ fieldName: 'Product Specification Document Setting Number', minLength: 3 }))
      .max(100, maxLengthFieldMessage({ fieldName: 'Product Specification Document Setting Number', maxLength: 100 }))
  })
})

// FormData Type
export type FormData = z.infer<typeof validationSchema>
