import { z } from 'zod'

export const SearchFiltersSchema = z.object({
    vendor_name: z.string().trim().max(120, 'Vendor name is too long').default(''),
    group_code: z.enum(['ALL', 'US', 'CN']).default('ALL'),
})

export const SearchResultsSchema = z.object({
    agGridState: z.any().optional(),
})

export const BlacklistSchema = z.object({
    searchFilters: SearchFiltersSchema,
    searchResults: SearchResultsSchema,
})

export const UploadBlacklistSchema = z.object({
    format: z.enum(['US', 'CN'], {
        required_error: 'Please select format',
    }),
    file: z
        .custom<File>((value) => value instanceof File, {
            message: 'Please select an Excel file',
        })
        .refine((file) => {
            const lowerName = String(file?.name || '').toLowerCase()
            return lowerName.endsWith('.xls') || lowerName.endsWith('.xlsx')
        }, 'Only .xls or .xlsx files are allowed'),
})

export type SearchFiltersFormData = z.infer<typeof SearchFiltersSchema>
export type BlacklistFormData = z.infer<typeof BlacklistSchema>
export type UploadBlacklistFormData = z.infer<typeof UploadBlacklistSchema>

export const defaultSearchFilters: SearchFiltersFormData = {
    vendor_name: '',
    group_code: 'ALL',
}

export const defaultBlacklistValues: BlacklistFormData = {
    searchFilters: defaultSearchFilters,
    searchResults: {},
}
