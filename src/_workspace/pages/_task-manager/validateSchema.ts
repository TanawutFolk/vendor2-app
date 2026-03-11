import { z } from 'zod'

export const AssigneesSchema = z.object({
    keyword: z.string().optional(),
    group_name: z.string().optional(),
    in_use: z.string().optional()
})

export type AssigneesFormData = z.infer<typeof AssigneesSchema>

export const fetchDefaultValues = async (): Promise<AssigneesFormData> => {
    return {
        keyword: '',
        group_name: '',
        in_use: ''
    }
}
