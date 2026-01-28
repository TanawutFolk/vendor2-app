import { z } from 'zod';

export const editVendorSchema = z.object({
    company_name: z.string().min(3, 'Company Name is required at least 3 characters'),
    vendor_type_id: z.number().nullable().optional(),
    vendor_type_name: z.string().nullable().optional(),
    province: z.string().nullable().optional(),
    postal_code: z.string().nullable().optional(),
    website: z.string().nullable().optional(),
    tel_center: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    INUSE: z.number().nullable().optional(), // 1=Active, 0=Inactive
    contacts: z.array(
        z.object({
            vendor_contact_id: z.number().optional(), // Hidden ID
            contact_name: z.string().min(1, "Contact Name is required"),
            email: z.string().email("Invalid email format").nullable().optional().or(z.literal('')),
            tel_phone: z.string().nullable().optional(),
            position: z.string().nullable().optional(),
            INUSE: z.number().nullable().optional(),
            // Audit fields (optional, for display/preservation)
            CREATE_BY: z.string().nullable().optional(),
            UPDATE_BY: z.string().nullable().optional(),
            CREATE_DATE: z.string().nullable().optional(),
            UPDATE_DATE: z.string().nullable().optional()
        })
    ).optional(),
    products: z.array(
        z.object({
            vendor_product_id: z.number().optional(), // Hidden ID
            product_name: z.string().min(1, "Product Name is required"),
            product_group_id: z.number().nullable().optional(),
            group_name: z.string().nullable().optional(), // Ensure availability for display/state
            maker_name: z.string().nullable().optional(),
            model_list: z.string().nullable().optional(),
            INUSE: z.number().nullable().optional(),
            // Audit fields
            CREATE_BY: z.string().nullable().optional(),
            UPDATE_BY: z.string().nullable().optional(),
            CREATE_DATE: z.string().nullable().optional(),
            UPDATE_DATE: z.string().nullable().optional()
        })
    ).optional()
});

export type EditVendorSchemaType = z.infer<typeof editVendorSchema>;
