import { z } from 'zod'
import { requiredFieldMessage } from '@/libs/valibot/error-message/errorMessage'

export const validationSchemaPage = z.object({
  searchFilters: z.object({
    // Header
    productCategory: z
      .object({
        PRODUCT_CATEGORY_ID: z
          .number({
            required_error: requiredFieldMessage({ fieldName: 'Product Category' }),
            invalid_type_error: requiredFieldMessage({ fieldName: 'Product Category' })
          })
          .int({ message: requiredFieldMessage({ fieldName: 'Product Category' }) }) // value must be an integer
          .positive({ message: requiredFieldMessage({ fieldName: 'Product Category' }) }), // > 0)
        PRODUCT_CATEGORY_NAME: z
          .string({
            required_error: requiredFieldMessage({ fieldName: 'Product Category' }),
            invalid_type_error: requiredFieldMessage({ fieldName: 'Product Category' })
          })
          .min(1, requiredFieldMessage({ fieldName: 'Product Category' }))
      })
      .nullish(),
    productMain: z
      .object({
        PRODUCT_MAIN_ID: z
          .number({
            required_error: requiredFieldMessage({ fieldName: 'Product Main' }),
            invalid_type_error: requiredFieldMessage({ fieldName: 'Product Main' })
          })
          .int({ message: requiredFieldMessage({ fieldName: 'Product Main' }) }) // value must be an integer
          .positive({ message: requiredFieldMessage({ fieldName: 'Product Main' }) }), // > 0)
        PRODUCT_MAIN_NAME: z
          .string({
            required_error: requiredFieldMessage({ fieldName: 'Product Main' }),
            invalid_type_error: requiredFieldMessage({ fieldName: 'Product Main' })
          })
          .min(1, requiredFieldMessage({ fieldName: 'Product Main' }))
      })
      .nullish(),
    productSub: z
      .object({
        PRODUCT_SUB_ID: z
          .number({
            required_error: requiredFieldMessage({ fieldName: 'Product Sub' }),
            invalid_type_error: requiredFieldMessage({ fieldName: 'Product Sub' })
          })
          .int({ message: requiredFieldMessage({ fieldName: 'Product Sub' }) }) // value must be an integer
          .positive({ message: requiredFieldMessage({ fieldName: 'Product Sub' }) }), // > 0)
        PRODUCT_SUB_NAME: z
          .string({
            required_error: requiredFieldMessage({ fieldName: 'Product Sub' }),
            invalid_type_error: requiredFieldMessage({ fieldName: 'Product Sub' })
          })
          .min(1, requiredFieldMessage({ fieldName: 'Product Sub' }))
      })
      .nullish(),

    // Product Type
    productType: z
      .object({
        PRODUCT_TYPE_ID: z
          .number({
            required_error: requiredFieldMessage({ fieldName: 'Product Type' }),
            invalid_type_error: requiredFieldMessage({ fieldName: 'Product Type' })
          })
          .int({ message: requiredFieldMessage({ fieldName: 'Product Type' }) }) // value must be an integer
          .positive({ message: requiredFieldMessage({ fieldName: 'Product Type' }) }), // > 0)
        PRODUCT_TYPE_CODE: z.string({
          required_error: requiredFieldMessage({ fieldName: 'Product Type' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Product Type' })
        }),
        PRODUCT_TYPE_NAME: z
          .string({
            required_error: requiredFieldMessage({ fieldName: 'Product Type' }),
            invalid_type_error: requiredFieldMessage({ fieldName: 'Product Type' })
          })
          .min(1, requiredFieldMessage({ fieldName: 'Product Type' }))
      })
      .nullish(),
    ItemCategory: z
      .object({
        ITEM_CATEGORY_ID: z
          .number({
            required_error: requiredFieldMessage({ fieldName: 'Item Category' }),
            invalid_type_error: requiredFieldMessage({ fieldName: 'Item Category' })
          })
          .int({ message: requiredFieldMessage({ fieldName: 'Item Category' }) }) // value must be an integer
          .positive({ message: requiredFieldMessage({ fieldName: 'Item Category' }) }), // > 0)
        ITEM_CATEGORY_NAME: z
          .string({
            required_error: requiredFieldMessage({ fieldName: 'Item Category' }),
            invalid_type_error: requiredFieldMessage({ fieldName: 'Item Category' })
          })
          .min(1, requiredFieldMessage({ fieldName: 'Item Category' }))
      })
      .nullish(),
    customerInvoiceTo: z
      .object({
        CUSTOMER_INVOICE_TO_ID: z
          .number({
            required_error: requiredFieldMessage({ fieldName: 'Customer Invoice To' }),
            invalid_type_error: requiredFieldMessage({ fieldName: 'Customer Invoice To' })
          })
          .int({ message: requiredFieldMessage({ fieldName: 'Customer Invoice To' }) }) // value must be an integer
          .positive({ message: requiredFieldMessage({ fieldName: 'Customer Invoice To' }) }), // > 0)
        CUSTOMER_INVOICE_TO_NAME: z
          .string({
            required_error: requiredFieldMessage({ fieldName: 'Customer Invoice To' }),
            invalid_type_error: requiredFieldMessage({ fieldName: 'Customer Invoice To' })
          })
          .min(1, requiredFieldMessage({ fieldName: 'Customer Invoice To' }))
      })
      .nullish()
  })
})

export type FormDataPage = z.infer<typeof validationSchemaPage>
