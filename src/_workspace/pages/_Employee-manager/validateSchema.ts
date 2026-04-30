import { z } from 'zod'

export const AssigneesSearchSchema = z.object({
    keyword: z.string().optional(),
    group_code: z.string().optional(),
    in_use: z.string().optional()
})

export const AssigneesSearchResultSchema = z.object({
    agGridState: z.unknown().optional()
})

export const AssigneesSchema = z.object({
    searchFilters: AssigneesSearchSchema,
    searchResults: AssigneesSearchResultSchema
})

export const AssigneesFormSchema = z.object({
    Assignees_id: z.number().optional(),
    empcode: z.string().trim().min(1, 'EmpCode is required'),
    empName: z.string().trim().min(1, 'Name is required'),
    empEmail: z.string().trim().min(1, 'Email is required').email('Invalid email format'),
    group_code: z.string().trim().min(1, 'Group is required'),
    group_name: z.string().trim().min(1, 'Group is required'),
    INUSE: z.number()
})

export type AssigneesSearchFiltersFormData = z.infer<typeof AssigneesSearchSchema>
export type AssigneesFormData = z.infer<typeof AssigneesSchema>
export type AssigneeFormData = z.infer<typeof AssigneesFormSchema>

export type AssigneeRow = {
    empcode?: string
    empName?: string
    empEmail?: string
    group_code?: string
    group_name?: string
    INUSE?: number | string
    Assignees_id?: number
}

export const defaultSearchFilters: AssigneesSearchFiltersFormData = {
    keyword: '',
    group_code: '',
    in_use: ''
}

export const defaultAssigneeFormValues: AssigneeFormData = {
    Assignees_id: undefined,
    empcode: '',
    empName: '',
    empEmail: '',
    group_code: '',
    group_name: '',
    INUSE: 1
}

export const fetchDefaultValues = async (): Promise<AssigneesFormData> => {
    return {
        searchFilters: defaultSearchFilters,
        searchResults: {}
    }
}
