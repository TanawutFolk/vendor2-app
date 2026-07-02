// Import Validation Schema
import {
  maxLengthFieldMessage,
  minLengthFieldMessage,
  requiredFieldMessage
} from '@/libs/valibot/error-message/errorMessage'
import { z } from 'zod'

// Validation Schema
export const validationSchema = z
  .object({
    // Header
    // isBoi: z.string().optional(),
    productCategory: z.object(
      {
        PRODUCT_CATEGORY_ID: z
          .number({
            required_error: requiredFieldMessage({ fieldName: 'Product Category' }),
            invalid_type_error: requiredFieldMessage({ fieldName: 'Product Category' })
          })
          .int({ message: requiredFieldMessage({ fieldName: 'Product Category' }) })
          .positive({ message: requiredFieldMessage({ fieldName: 'Product Category' }) }),
        PRODUCT_CATEGORY_NAME: z.string().min(1, requiredFieldMessage({ fieldName: 'Product Category' }))
      },
      {
        required_error: requiredFieldMessage({ fieldName: 'Product Category' }),
        invalid_type_error: requiredFieldMessage({ fieldName: 'Product Category' })
      }
    ),
    // Product Main Detail
    productMainName: z
      .string({
        required_error: requiredFieldMessage({ fieldName: 'Product Main Name' }),
        invalid_type_error: requiredFieldMessage({ fieldName: 'Product Main Name' })
      })
      .min(3, minLengthFieldMessage({ fieldName: 'Product Main Name', minLength: 3 }))
      .max(100, maxLengthFieldMessage({ fieldName: 'Product Main Name', maxLength: 100 }))
      .regex(/^\S+$/, { message: 'Product Main Name must not contain spaces' }),
    productMainAlphabet: z
      .string({
        required_error: requiredFieldMessage({ fieldName: 'Product Main Alphabet' }),
        invalid_type_error: requiredFieldMessage({ fieldName: 'Product Main Alphabet' })
      })
      .length(2, 'Must be 2 characters long only.')
      .regex(/^[A-Z0-9]+$/, 'Must be uppercase letters or numbers only.'),

    productMainCode: z
      .string({
        required_error: requiredFieldMessage({ fieldName: 'Product Main Code' }),
        invalid_type_error: requiredFieldMessage({ fieldName: 'Product Main Code' })
      })
      .optional(),

    // Other
    // loc: z
    //   .string({
    //     required_error: requiredFieldMessage({ fieldName: 'LOC Name' }),
    //     invalid_type_error: requiredFieldMessage({ fieldName: 'LOC Name' })
    //   })
    //   .min(1, minLengthFieldMessage({ fieldName: 'LOC Name', minLength: 1 }))
    //   .max(100, maxLengthFieldMessage({ fieldName: 'LOC Name', maxLength: 100 })),

    // pod: z
    //   .string({
    //     required_error: requiredFieldMessage({ fieldName: 'POD Name' }),
    //     invalid_type_error: requiredFieldMessage({ fieldName: 'POD Name' })
    //   })
    //   .min(1, minLengthFieldMessage({ fieldName: 'POD Name', minLength: 1 }))
    //   .max(100, maxLengthFieldMessage({ fieldName: 'POD Name', maxLength: 100 })),

    // pd: z
    //   .string({
    //     required_error: requiredFieldMessage({ fieldName: 'PD Name' }),
    //     invalid_type_error: requiredFieldMessage({ fieldName: 'PD Name' })
    //   })
    //   .min(1, minLengthFieldMessage({ fieldName: 'PD Name', minLength: 1 }))
    //   .max(100, maxLengthFieldMessage({ fieldName: 'PD Name', maxLength: 100 })),
    loc: z
      .array(
        z.object({
          NO: z.number(),
          LOC_ID: z.number().nullable(), // (ถ้า select ส่ง string แนะนำ z.coerce.number().nullable())
          LOC_CODE: z.string().nullable(),
          LOC_NAME: z.string().nullable()
        })
      )
      .default([])
      .superRefine((arr, ctx) => {
        // A) แถวไหนมี ต้องเลือกให้ครบ (ไม่มีการข้ามแถวว่างอีกต่อไป)
        arr.forEach((row, idx) => {
          const hasId = row.LOC_ID != null
          const hasCode = row.LOC_CODE != null && String(row.LOC_CODE).trim() !== ''
          if (!hasId || !hasCode) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select LOC', path: [idx, 'LOC_ID'] })
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select LOC', path: [idx, 'LOC_CODE'] })
          }
        })

        // B) กันซ้ำตาม LOC_ID
        const seen = new Set<number>()
        arr.forEach((row, idx) => {
          if (row.LOC_ID != null) {
            if (seen.has(row.LOC_ID)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Duplicate LOC is not allowed',
                path: [idx, 'LOC_ID']
              })
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Duplicate LOC is not allowed',
                path: [idx, 'LOC_CODE']
              })
            } else {
              seen.add(row.LOC_ID)
            }
          }
        })
      }),

    // Account
    accountDepartmentCode: z
      .object({
        ACCOUNT_DEPARTMENT_CODE_ID: z
          .number()
          .int({ message: requiredFieldMessage({ fieldName: 'Account Department Code' }) })
          .positive({ message: requiredFieldMessage({ fieldName: 'Account Department Code' }) }),
        ACCOUNT_DEPARTMENT_CODE: z
          .string({
            required_error: requiredFieldMessage({ fieldName: 'Account Department Code' }),
            invalid_type_error: requiredFieldMessage({ fieldName: 'Account Department Code' })
          })
          .min(1, requiredFieldMessage({ fieldName: 'Account Department Code' })),
        ACCOUNT_DEPARTMENT_NAME: z
          .string({
            required_error: requiredFieldMessage({ fieldName: 'Account Department Code' }),
            invalid_type_error: requiredFieldMessage({ fieldName: 'Account Department Code' })
          })
          .min(1, requiredFieldMessage({ fieldName: 'Account Department Code' }))
      })
      .nullable() // 👉 สามารถส่งค่า null ได้
      .optional(), // 👉 หรือจะไม่ส่ง field นี้มาเลยก็ได้

    // BOI
    // isBoi: z
    //   .string({
    //     required_error: requiredFieldMessage({ fieldName: 'BOI' }),
    //     invalid_type_error: requiredFieldMessage({ fieldName: 'BOI' })
    //   })
    //   .refine(val => ['0', '1'].includes(val), {
    //     message: requiredFieldMessage({ fieldName: 'BOI' })
    //   }),

    boiProject: z
      .object(
        {
          BOI_PROJECT_ID: z
            .number({
              required_error: requiredFieldMessage({ fieldName: 'BOI Project Name' }),
              invalid_type_error: requiredFieldMessage({ fieldName: 'BOI Project Name' })
            })
            .int({ message: requiredFieldMessage({ fieldName: 'BOI Project Name' }) })
            .positive({ message: requiredFieldMessage({ fieldName: 'BOI Project Name' }) })
            .optional()
            .nullable(),
          BOI_PROJECT_NAME: z
            .string({
              required_error: requiredFieldMessage({ fieldName: 'BOI Project Name' }),
              invalid_type_error: requiredFieldMessage({ fieldName: 'BOI Project Name' })
            })
            .optional()
            .nullable(),
          BOI_PROJECT_CODE: z
            .string({
              required_error: requiredFieldMessage({ fieldName: 'BOI Project Code' }),
              invalid_type_error: requiredFieldMessage({ fieldName: 'BOI Project Code' })
            })
            .optional()
            .nullable()
        },
        {
          required_error: requiredFieldMessage({ fieldName: 'Boi Project' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Boi Project' })
        }
      )
      .nullish(),
    isBoi: z.string().optional().nullish()
  })
  .superRefine((data, ctx) => {
    if (data.isBoi === '1' && !!data.boiProject?.BOI_PROJECT_ID === false) {
      ctx.addIssue({
        code: 'custom',
        message: 'Please select BOI Project',
        path: ['boiProject']
      })
    }
  })

// FormData Type
export type FormData = z.infer<typeof validationSchema>
