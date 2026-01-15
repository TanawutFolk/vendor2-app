import { z } from 'zod'

// --- Search Filters Schema ---
export const SearchFiltersSchema = z.object({
    company_name: z.string().optional().or(z.literal('')),
    vendor_type_id: z.number().nullable().optional(),
    province: z.string().optional().or(z.literal('')),
    status: z.object({
        value: z.string(),
        label: z.string()
    }).nullable().optional()
})

// --- Main Page Schema ---
export const FindVendorSchema = z.object({
    searchFilters: SearchFiltersSchema
})

// Types
export type SearchFiltersFormData = z.infer<typeof SearchFiltersSchema>
export type FindVendorFormData = z.infer<typeof FindVendorSchema>

// Default Values
export const defaultSearchFilters: SearchFiltersFormData = {
    company_name: '',
    vendor_type_id: null,
    province: '',
    status: null
}

export const defaultFindVendorValues: FindVendorFormData = {
    searchFilters: defaultSearchFilters
}
