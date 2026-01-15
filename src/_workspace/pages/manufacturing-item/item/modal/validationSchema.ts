// Import Validation Schema
import { z } from 'zod'
import {
  maxLengthFieldMessage,
  minLengthFieldMessage,
  requiredFieldMessage
} from '@/libs/valibot/error-message/errorMessage'

const MAX_FILE_SIZE = 5000000 // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

const imageSchema = z.object({
  base64: z
    .string()
    .refine(file => file.startsWith('data:image/'), {
      message: 'Invalid image format. Only Base64 images are allowed'
    })
    .refine(file => {
      const mimeType = file.split(';')[0].split(':')[1] // ดึง MIME type
      return ACCEPTED_IMAGE_TYPES.includes(mimeType)
    }, 'Only .jpg, .jpeg, .png, and .webp formats are supported')
    .refine(file => {
      const base64Length = file.split(',')[1]?.length || 0
      const fileSize = (base64Length * 3) / 4 // คำนวณขนาดไฟล์จาก Base64 length
      return fileSize <= MAX_FILE_SIZE
    }, 'Each file size should be less than 5MB'),

  isDefault: z.boolean()
})
// Validation Schema
export const validationSchema = z.object({
  // Header
  // itemCategory: z.object({
  //   ITEM_CATEGORY_ID: z
  //     .number({
  //       required_error: requiredFieldMessage({ fieldName: 'Item Category' }),
  //       invalid_type_error: requiredFieldMessage({ fieldName: 'Item Category' })
  //     })
  //     .int({ message: requiredFieldMessage({ fieldName: 'Item Category' }) }) // value must be an integer
  //     .positive({ message: requiredFieldMessage({ fieldName: 'Item Category' }) }), // > 0)

  //   ITEM_CATEGORY_NAME: z
  //     .string({
  //       required_error: requiredFieldMessage({ fieldName: 'Item Category' }),
  //       invalid_type_error: requiredFieldMessage({ fieldName: 'Item Category' })
  //     })
  //     .min(1, requiredFieldMessage({ fieldName: 'Item Category' })),
  //   ITEM_CATEGORY_ALPHABET: z
  //     .string({
  //       required_error: requiredFieldMessage({ fieldName: 'Item Category' }),
  //       invalid_type_error: requiredFieldMessage({ fieldName: 'Item Category' })
  //     })
  //     .max(1, requiredFieldMessage({ fieldName: 'Item Category' })),
  //   PURCHASE_MODULE_ID: z
  //     .number({
  //       required_error: requiredFieldMessage({ fieldName: 'Item Category' }),
  //       invalid_type_error: requiredFieldMessage({ fieldName: 'Item Category' })
  //     })
  //     .int({ message: requiredFieldMessage({ fieldName: 'Item Category' }) }) // value must be an integer
  //     .positive({ message: requiredFieldMessage({ fieldName: 'Item Category' }) }) // > 0)
  // }),
  itemCategory: z
    .object(
      {
        ITEM_CATEGORY_ID: z.number(),
        ITEM_CATEGORY_NAME: z.string()
      },
      {
        required_error: ' Item Category is required'
      }
    )
    .nullable()
    .refine(val => val !== null, {
      message: ' Item Category is required'
    }),
  // Component
  itemPurpose: z
    .object(
      {
        ITEM_PURPOSE_ID: z.number(),
        ITEM_PURPOSE_NAME: z.string()
      },
      {
        required_error: 'Item Purpose is required'
      }
    )
    .nullable()
    .refine(val => val !== null, {
      message: 'Item Purpose is required'
    }),
  itemGroup: z
    .object(
      {
        ITEM_GROUP_ID: z.number(),
        ITEM_GROUP_NAME: z.string()
      },
      {
        required_error: 'Item Group is required'
      }
    )
    .nullable()
    .refine(val => val !== null, {
      message: 'Item Group is required'
    }),
  // vendor: z
  //   .object(
  //     {
  //       VENDOR_ID: z.number().int().positive(),
  //       VENDOR_ALPHABET: z.string().min(1)
  //     },
  //     {
  //       required_error: 'Vendor is required'
  //     }
  //   )
  //   .nullable()
  //   .refine(val => val !== null, {
  //     message: 'Vendor is required'
  //   }),
  vendor: z
    .object(
      {
        VENDOR_ID: z.number().int().positive(),
        VENDOR_NAME: z.string().min(1)
      },
      {
        required_error: 'Vendor is required'
      }
    )
    .nullable()
    .refine(val => val !== null, {
      message: 'Vendor is required'
    }),
  maker: z
    .object(
      {
        MAKER_ID: z.number().int().positive(),
        MAKER_NAME: z.string().min(1)
      },
      {
        required_error: 'Maker is required'
      }
    )
    .nullable()
    .refine(val => val !== null, {
      message: 'Maker is required'
    }),

  // Property
  color: z
    .object({
      ITEM_PROPERTY_COLOR_ID: z
        .number({
          required_error: requiredFieldMessage({ fieldName: 'Color' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Color' })
        })
        .int({ message: requiredFieldMessage({ fieldName: 'Color' }) }) // value must be an integer
        .positive({ message: requiredFieldMessage({ fieldName: 'Color' }) }), // > 0)
      ITEM_PROPERTY_COLOR_NAME: z
        .string({
          required_error: requiredFieldMessage({ fieldName: 'Color' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Color' })
        })
        .min(1, requiredFieldMessage({ fieldName: 'Color' }))
    })
    .nullable(),
  shape: z
    .object({
      ITEM_PROPERTY_SHAPE_ID: z
        .number({
          required_error: requiredFieldMessage({ fieldName: 'Shape' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Shape' })
        })
        .int({ message: requiredFieldMessage({ fieldName: 'Shape' }) }) // value must be an integer
        .positive({ message: requiredFieldMessage({ fieldName: 'Shape' }) }), // > 0)
      ITEM_PROPERTY_SHAPE_NAME: z
        .string({
          required_error: requiredFieldMessage({ fieldName: 'Shape' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Shape' })
        })
        .min(1, requiredFieldMessage({ fieldName: 'Shape' }))
    })
    .nullable(),

  // Code & Name
  itemInternalCode: z
    .string({
      // required_error: requiredFieldMessage({ fieldName: 'Item External Code' }),
      // invalid_type_error: requiredFieldMessage({ fieldName: 'Item External Code' })
    })
    .optional(),
  // .min(1, requiredFieldMessage({ fieldName: 'Item External Code' }))
  // .max(100, maxLengthFieldMessage({ fieldName: 'Item External Code', maxLength: 100 })),
  itemInternalFullName: z
    .string({
      required_error: requiredFieldMessage({ fieldName: 'Item Internal Full Name' }),
      invalid_type_error: requiredFieldMessage({ fieldName: 'Item Internal Full Name' })
    })
    .min(1, requiredFieldMessage({ fieldName: 'Item Internal Full Name' }))
    .max(500, maxLengthFieldMessage({ fieldName: 'Item Internal Full Name', maxLength: 500 })),
  itemInternalShortName: z
    .string({
      required_error: requiredFieldMessage({ fieldName: 'Item Internal Short Name' })
    })
    .min(1, requiredFieldMessage({ fieldName: 'Item Internal Short Name' }))
    .max(200),
  itemExternalCode: z
    .string({
      required_error: requiredFieldMessage({ fieldName: 'Item External Code' }),
      invalid_type_error: requiredFieldMessage({ fieldName: 'Item External Code' })
    })
    .min(1, requiredFieldMessage({ fieldName: 'Item External Code' }))
    .max(100, maxLengthFieldMessage({ fieldName: 'Item External Code', maxLength: 100 })),
  itemExternalFullName: z
    .string({
      required_error: requiredFieldMessage({ fieldName: 'Item External Full Name' }),
      invalid_type_error: requiredFieldMessage({ fieldName: 'Item External Full Name' })
    })
    .min(1, requiredFieldMessage({ fieldName: 'Item External Full Name' }))
    .max(500, maxLengthFieldMessage({ fieldName: 'Item External Full Name', maxLength: 500 })),
  itemExternalShortName: z
    .string({
      required_error: requiredFieldMessage({ fieldName: 'Item External Short Name' }),
      invalid_type_error: requiredFieldMessage({ fieldName: 'Item External Short Name' })
    })
    .min(1, requiredFieldMessage({ fieldName: 'Item External Short Name' }))
    .max(200, maxLengthFieldMessage({ fieldName: 'Item External Short Name', maxLength: 200 })),

  // Purchase Unit
  purchaseUnitRatio: z
    .string({
      required_error: requiredFieldMessage({ fieldName: 'Purchase Unitdf Ratio' }),
      invalid_type_error: requiredFieldMessage({ fieldName: 'Purchase Uniwefwwft Ratio' })
    })
    .min(1, requiredFieldMessage({ fieldName: 'Purchase Unit Ratio' }))
    .regex(/^[0-9]+$/i, 'Please enter numbers (ex. 1,2,3) only.'),
  purchaseUnit: z
    .object(
      {
        UNIT_OF_MEASUREMENT_ID: z.number().int().positive(),
        SYMBOL: z.string().min(1)
      },
      {
        required_error: 'Purchase Unit is required'
      }
    )
    .nullable()
    .refine(val => val !== null, {
      message: 'Purchase Unit is required'
    }),

  // Usage Unit
  usageUnitRatio: z
    .string({
      required_error: requiredFieldMessage({ fieldName: 'Usage Unit Ratio' }),
      invalid_type_error: requiredFieldMessage({ fieldName: 'Usage Unit Rati ss' })
    })
    .min(1, requiredFieldMessage({ fieldName: 'Usage Unit Ratio' }))
    .regex(/^[0-9]+$/i, 'Please enter numbers (ex. 1,2,3) only.'),
  usageUnit: z
    .object(
      {
        UNIT_OF_MEASUREMENT_ID: z.number().int().positive(),
        SYMBOL: z.string().min(1)
      },
      {
        required_error: 'Usage Unit is required'
      }
    )
    .nullable()
    .refine(val => val !== null, {
      message: 'Usage Unit is required'
    }),

  // Item Stock
  moq: z.preprocess(
    value => (value === '' ? undefined : value), // แปลงค่าที่เป็น "" (ค่าว่าง) เป็น undefined
    z
      .string()
      .regex(
        /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/i,
        'Please enter numbers (ex. 1,2,3) or decimal (ex. 0.125 , 0.458 , 25.456) only.'
      )
      .optional()
  ),
  leadTime: z.preprocess(
    value => (value === '' ? undefined : value), // แปลงค่าที่เป็น "" (ค่าว่าง) เป็น undefined
    z
      .string()
      .regex(
        /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/i,
        'Please enter numbers (ex. 1,2,3) or decimal (ex. 0.125 , 0.458 , 25.456) only.'
      )
      .optional()
  ),
  safetyStock: z.preprocess(
    value => (value === '' ? undefined : value), // แปลงค่าที่เป็น "" (ค่าว่าง) เป็น undefined
    z
      .string()
      .regex(
        /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/i,
        'Please enter numbers (ex. 1,2,3) or decimal (ex. 0.125 , 0.458 , 25.456) only.'
      )
      .optional()
  ),
  width: z.preprocess(
    value => (value === '' ? undefined : value), // แปลงค่าที่เป็น "" (ค่าว่าง) เป็น undefined
    z
      .string()
      .regex(
        /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/i,
        'Please enter numbers (ex. 1,2,3) or decimal (ex. 0.125 , 0.458 , 25.456) only.'
      )
      .optional()
  ),
  height: z.preprocess(
    value => (value === '' ? undefined : value), // แปลงค่าที่เป็น "" (ค่าว่าง) เป็น undefined
    z
      .string()
      .regex(
        /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/i,
        'Please enter numbers (ex. 1,2,3) or decimal (ex. 0.125 , 0.458 , 25.456) only.'
      )
      .optional()
  ),
  depth: z.preprocess(
    value => (value === '' ? undefined : value), // แปลงค่าที่เป็น "" (ค่าว่าง) เป็น undefined
    z
      .string()
      .regex(
        /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/i,
        'Please enter numbers (ex. 1,2,3) or decimal (ex. 0.125 , 0.458 , 25.456) only.'
      )
      .optional()
  ),
  // Item Theme Color
  themeColor: z
    .object({
      COLOR_ID: z
        .number({
          required_error: requiredFieldMessage({ fieldName: 'Theme Color' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Theme Color' })
        })
        .int({ message: requiredFieldMessage({ fieldName: 'Theme Color' }) }) // value must be an integer
        .positive({ message: requiredFieldMessage({ fieldName: 'Theme Color' }) }), // > 0)
      COLOR_NAME: z
        .string({
          required_error: requiredFieldMessage({ fieldName: 'Theme Color' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Theme Color' })
        })
        .min(1, requiredFieldMessage({ fieldName: 'Theme Color' })),
      COLOR_HEX: z
        .string({
          required_error: requiredFieldMessage({ fieldName: 'Theme Color' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Theme Color' })
        })
        .min(1, requiredFieldMessage({ fieldName: 'Theme Color' }))
    })
    .nullable(),
  // Other
  itemCodeForSupportMes: z
    .string({
      required_error: requiredFieldMessage({ fieldName: 'Item Code For Support Mes & Old System' }),
      invalid_type_error: requiredFieldMessage({ fieldName: 'Item Code For Support Mes & Old System' })
    })
    .min(1, requiredFieldMessage({ fieldName: 'Item Code For Support Mes & Old System' })),
  versionNo: z.number().optional(),
  images: z
    .array(imageSchema, {
      required_error: requiredFieldMessage({ fieldName: 'Images' }),
      invalid_type_error: requiredFieldMessage({ fieldName: 'Images' })
    })
    .max(10, 'You can upload a maximum of 10 images')
    .optional()
})

// FormData Type
export type FormData = z.infer<typeof validationSchema>
