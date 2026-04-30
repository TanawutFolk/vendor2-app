import { z } from 'zod'

export const SearchFiltersSchema = z.object({})

export const SearchResultsSchema = z.object({
    approvalGridState: z.unknown().optional(),
    actionRequiredGridState: z.unknown().optional()
})

export const ApprovalGprCSchema = z.object({
    searchFilters: SearchFiltersSchema,
    searchResults: SearchResultsSchema
})

export type ApprovalGprCFormData = z.infer<typeof ApprovalGprCSchema>

export const defaultFormValues: ApprovalGprCFormData = {
    searchFilters: {},
    searchResults: {}
}

export const fetchDefaultValues = async (): Promise<ApprovalGprCFormData> => defaultFormValues
