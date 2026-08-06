import { z } from 'zod'

import {
  maxLengthFieldMessage,
  minLengthFieldMessage,
  typeFieldMessage,
  requiredFieldMessage
} from '@/libs/valibot/error-message/errorMessage'

// --- Contact Schema (for vendor_contacts table) ---
export const ContactSchema = z.object({
  contact_name: z
    .string({
      required_error: requiredFieldMessage({ fieldName: 'Seller Name' }),
      invalid_type_error: typeFieldMessage({ fieldName: 'Seller Name', typeName: 'String' })
    })
    .min(2, minLengthFieldMessage({ fieldName: 'Seller Name', minLength: 2 }))
    .max(100, maxLengthFieldMessage({ fieldName: 'Seller Name', maxLength: 100 })),
  tel_phone: z
    .string({
      required_error: requiredFieldMessage({ fieldName: 'Phone' }),
      invalid_type_error: typeFieldMessage({ fieldName: 'Phone', typeName: 'String' })
    })
    .min(1, requiredFieldMessage({ fieldName: 'Phone' }))
    .max(30, maxLengthFieldMessage({ fieldName: 'Phone', maxLength: 30 })),
  email: z
    .string({
      required_error: requiredFieldMessage({ fieldName: 'Email' }),
      invalid_type_error: typeFieldMessage({ fieldName: 'Email', typeName: 'String' })
    })
    .min(1, requiredFieldMessage({ fieldName: 'Email' }))
    .email('Invalid email format')
    .max(100, maxLengthFieldMessage({ fieldName: 'Email', maxLength: 100 })),
  position: z
    .string({
      invalid_type_error: typeFieldMessage({ fieldName: 'Position', typeName: 'String' })
    })
    .max(50, maxLengthFieldMessage({ fieldName: 'Position', maxLength: 50 }))
    .optional()
    .or(z.literal(''))
})

// --- Product Schema (for vendor_products table) ---
// Option object type for AsyncSelectCustom
const ProductGroupOptionSchema = z.object({
  value: z.number(),
  label: z.string()
})

// Every product field is optional. When one is filled in it still has to satisfy the
// length bounds — the trailing `.or(z.literal(''))` is what lets an empty box through.
export const ProductSchema = z.object({
  product_group: ProductGroupOptionSchema.nullable().optional(),
  maker_name: z
    .string({
      invalid_type_error: typeFieldMessage({ fieldName: 'Maker Name', typeName: 'String' })
    })
    .min(2, minLengthFieldMessage({ fieldName: 'Maker Name', minLength: 2 }))
    .max(100, maxLengthFieldMessage({ fieldName: 'Maker Name', maxLength: 100 }))
    .optional()
    .or(z.literal('')),
  product_name: z
    .string({
      invalid_type_error: typeFieldMessage({ fieldName: 'Product Name', typeName: 'String' })
    })
    .min(2, minLengthFieldMessage({ fieldName: 'Product Name', minLength: 2 }))
    .max(150, maxLengthFieldMessage({ fieldName: 'Product Name', maxLength: 150 }))
    .optional()
    .or(z.literal('')),
  model_list: z.string().optional().or(z.literal(''))
})

// !! Do not change this value
export const validationSchemaPage = z
  .object({
    // Check Section (Required for duplicate check: company_name, province, postal_code)
    company_name: z
      .string({
        required_error: requiredFieldMessage({ fieldName: 'Company Name' }),
        invalid_type_error: typeFieldMessage({ fieldName: 'Company Name', typeName: 'String' })
      })
      .min(3, minLengthFieldMessage({ fieldName: 'Company Name', minLength: 3 }))
      .max(200, maxLengthFieldMessage({ fieldName: 'Company Name', maxLength: 200 })),
    province: z
      .string({
        invalid_type_error: typeFieldMessage({ fieldName: 'Province', typeName: 'String' })
      })
      .max(50, maxLengthFieldMessage({ fieldName: 'Province', maxLength: 50 }))
      .optional()
      .or(z.literal('')),
    postal_code: z
      .string({
        invalid_type_error: typeFieldMessage({ fieldName: 'Postal Code', typeName: 'String' })
      })
      .max(10, maxLengthFieldMessage({ fieldName: 'Postal Code', maxLength: 10 }))
      .optional()
      .or(z.literal('')),
    country: z
      .string({
        invalid_type_error: typeFieldMessage({ fieldName: 'Country', typeName: 'String' })
      })
      .max(100, maxLengthFieldMessage({ fieldName: 'Country', maxLength: 100 }))
      .optional()
      .or(z.literal('')),
    // Profile Section
    // Required: the UI shows 'Vendor Type is required' and the DB stores it as
    // BUSINESS_CATEGORY_ID — leaving it empty would insert a dangling 0.
    vendor_type: z.object(
      {
        value: z.number(),
        label: z.string()
      },
      {
        required_error: requiredFieldMessage({ fieldName: 'Vendor Type' }),
        invalid_type_error: requiredFieldMessage({ fieldName: 'Vendor Type' })
      }
    ),
    vendor_type_name: z.string().optional(), // For display only
    vendor_region: z.enum(['Local', 'Oversea']).default('Local'),
    website: z
      .string({
        invalid_type_error: typeFieldMessage({ fieldName: 'Website', typeName: 'String' })
      })
      .max(200, maxLengthFieldMessage({ fieldName: 'Website', maxLength: 200 }))
      .optional()
      .or(z.literal('')),
    tel_center: z
      .string({
        required_error: requiredFieldMessage({ fieldName: 'Tel Center' }),
        invalid_type_error: typeFieldMessage({ fieldName: 'Tel Center', typeName: 'String' })
      })
      .min(1, requiredFieldMessage({ fieldName: 'Tel Center' }))
      .max(30, maxLengthFieldMessage({ fieldName: 'Tel Center', maxLength: 30 })),
    emailmain: z
      .string({
        required_error: requiredFieldMessage({ fieldName: 'Email (Main)' }),
        invalid_type_error: typeFieldMessage({ fieldName: 'Email (Main)', typeName: 'String' })
      })
      .min(1, requiredFieldMessage({ fieldName: 'Email (Main)' }))
      .email('Invalid email format')
      .max(100, maxLengthFieldMessage({ fieldName: 'Email (Main)', maxLength: 100 })),
    address: z
      .string({
        required_error: requiredFieldMessage({ fieldName: 'Address' }),
        invalid_type_error: typeFieldMessage({ fieldName: 'Address', typeName: 'String' })
      })
      .min(5, minLengthFieldMessage({ fieldName: 'Address', minLength: 5 }))
      .max(500, maxLengthFieldMessage({ fieldName: 'Address', maxLength: 500 })),
    note: z.string().optional().or(z.literal('')),

    // Contacts Array
    contacts: z.array(ContactSchema),

    // Products Array
    products: z.array(ProductSchema),

    // Audit
    CREATE_BY: z.string({
      required_error: requiredFieldMessage({ fieldName: 'Creator' })
    })
  })
  .superRefine((data, ctx) => {
    const isOversea = data.vendor_region === 'Oversea'

    if (isOversea) {
      if (!data.country?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['country'],
          message: requiredFieldMessage({ fieldName: 'Country' })
        })
      }

      return
    }

    if (!data.province?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['province'],
        message: requiredFieldMessage({ fieldName: 'Province' })
      })
    }

    if (!data.postal_code?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['postal_code'],
        message: requiredFieldMessage({ fieldName: 'Postal Code' })
      })
    }
  })

// --- Types ---
export type FormDataPage = z.infer<typeof validationSchemaPage>
export type ContactFormData = z.infer<typeof ContactSchema>
export type ProductFormData = z.infer<typeof ProductSchema>

// --- Default Values ---
export const defaultContactValues: ContactFormData = {
  contact_name: '',
  tel_phone: '',
  email: '',
  position: ''
}

export const defaultProductValues: ProductFormData = {
  product_group: undefined as any,
  maker_name: '',
  product_name: '',
  model_list: ''
}

export const defaultAddVendorValues: FormDataPage = {
  company_name: '',
  province: '',
  postal_code: '',
  country: '',
  vendor_type: undefined as any,
  vendor_type_name: '',
  vendor_region: 'Local',
  website: '',
  tel_center: '',
  emailmain: '',
  address: '',
  note: '',
  contacts: [{ ...defaultContactValues }],
  products: [{ ...defaultProductValues }],
  CREATE_BY: ''
}
