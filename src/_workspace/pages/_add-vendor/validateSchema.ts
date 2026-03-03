import { z } from 'zod'
import {
    maxLengthFieldMessage,
    minLengthFieldMessage,
    typeFieldMessage,
    requiredFieldMessage
} from '@/libs/valibot/error-message/errorMessage'

// --- Contact Schema (สำหรับ vendor_contacts table) ---
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
            invalid_type_error: typeFieldMessage({ fieldName: 'Phone', typeName: 'String' })
        })
        .max(30, maxLengthFieldMessage({ fieldName: 'Phone', maxLength: 30 }))
        .optional()
        .or(z.literal('')),
    email: z
        .string({
            invalid_type_error: typeFieldMessage({ fieldName: 'Email', typeName: 'String' })
        })
        .max(100, maxLengthFieldMessage({ fieldName: 'Email', maxLength: 100 }))
        .optional()
        .or(z.literal('')),
    position: z
        .string({
            invalid_type_error: typeFieldMessage({ fieldName: 'Position', typeName: 'String' })
        })
        .max(50, maxLengthFieldMessage({ fieldName: 'Position', maxLength: 50 }))
        .optional()
        .or(z.literal(''))
})

// --- Product Schema (สำหรับ vendor_products table) ---
// Option object type for AsyncSelectCustom
const ProductGroupOptionSchema = z.object({
    value: z.number(),
    label: z.string()
})

export const ProductSchema = z.object({
    product_group: ProductGroupOptionSchema.refine(val => val !== null && val !== undefined, {
        message: requiredFieldMessage({ fieldName: 'Product Group' })
    }),
    maker_name: z
        .string({
            required_error: requiredFieldMessage({ fieldName: 'Maker Name' }),
            invalid_type_error: typeFieldMessage({ fieldName: 'Maker Name', typeName: 'String' })
        })
        .min(2, minLengthFieldMessage({ fieldName: 'Maker Name', minLength: 2 }))
        .max(100, maxLengthFieldMessage({ fieldName: 'Maker Name', maxLength: 100 })),
    product_name: z
        .string({
            required_error: requiredFieldMessage({ fieldName: 'Product Name' }),
            invalid_type_error: typeFieldMessage({ fieldName: 'Product Name', typeName: 'String' })
        })
        .min(2, minLengthFieldMessage({ fieldName: 'Product Name', minLength: 2 }))
        .max(150, maxLengthFieldMessage({ fieldName: 'Product Name', maxLength: 150 })),
    model_list: z.string().optional().or(z.literal(''))
})

// --- Main Add Vendor Schema (email removed from vendors table) ---
export const AddVendorSchema = z.object({
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
            required_error: requiredFieldMessage({ fieldName: 'Province' }),
            invalid_type_error: typeFieldMessage({ fieldName: 'Province', typeName: 'String' })
        })
        .min(1, requiredFieldMessage({ fieldName: 'Province' }))
        .max(50, maxLengthFieldMessage({ fieldName: 'Province', maxLength: 50 })),
    postal_code: z
        .string({
            required_error: requiredFieldMessage({ fieldName: 'Postal Code' }),
            invalid_type_error: typeFieldMessage({ fieldName: 'Postal Code', typeName: 'String' })
        })
        .min(1, requiredFieldMessage({ fieldName: 'Postal Code' }))
        .max(10, maxLengthFieldMessage({ fieldName: 'Postal Code', maxLength: 10 })),

    // Profile Section
    // Profile Section
    vendor_type: z.object({
        value: z.number(),
        label: z.string()
    }).nullable().optional(),
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
            invalid_type_error: typeFieldMessage({ fieldName: 'Email (Main)', typeName: 'String' })
        })
        .email('Invalid email format')
        .max(100, maxLengthFieldMessage({ fieldName: 'Email (Main)', maxLength: 100 }))
        .optional()
        .or(z.literal('')),
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

// --- Types ---
export type AddVendorFormData = z.infer<typeof AddVendorSchema>
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
    product_group: undefined as any, // Will be set by user
    maker_name: '',
    product_name: '',
    model_list: ''
}

export const defaultAddVendorValues: AddVendorFormData = {
    company_name: '',
    province: '',
    postal_code: '',
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
