import { z } from 'zod'

// --- Search Filters Schema ---
export const SearchFiltersSchema = z.object({
    company_name: z.string().optional().or(z.literal('')),
    vendor_type_id: z.object({
        value: z.number(),
        label: z.string()
    }).nullable().optional(),
    province: z.object({
        value: z.string(),
        label: z.string()
    }).nullable().optional(),
    product_group_id: z.object({
        value: z.number(),
        label: z.string()
    }).nullable().optional(),
    status: z.object({
        value: z.string(),
        label: z.string()
    }).nullable().optional(),
    product_name: z.string().optional().or(z.literal('')),
    maker_name: z.string().optional().or(z.literal('')),
    model_list: z.string().optional().or(z.literal(''))
})

// --- Search Results Schema ---
export const SearchResultsSchema = z.object({
    pageSize: z.number().optional(),
    columnFilters: z.array(z.any()).optional(),
    sorting: z.array(z.any()).optional(),
    density: z.string().optional(),
    columnVisibility: z.record(z.boolean()).optional(),
    columnPinning: z.record(z.string()).optional(),
    columnOrder: z.array(z.string()).optional(),
    columnFilterFns: z.record(z.any()).optional()
})

// --- Main Page Schema ---
export const FindVendorSchema = z.object({
    searchFilters: SearchFiltersSchema,
    searchResults: SearchResultsSchema
})

// Types
export type SearchFiltersFormData = z.infer<typeof SearchFiltersSchema>
export type FindVendorFormData = z.infer<typeof FindVendorSchema>

// Default Values
export const defaultSearchFilters: SearchFiltersFormData = {
    company_name: '',
    vendor_type_id: null,
    province: null,
    product_group_id: null,
    status: null,
    product_name: '',
    maker_name: '',
    model_list: ''
}

export const defaultFindVendorValues: FindVendorFormData = {
    searchFilters: defaultSearchFilters,
    searchResults: {
        pageSize: 20
    }
}
