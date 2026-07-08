import { z } from 'zod'

const MAX_TOTAL_SIZE = 10 * 1024 * 1024 // 10MB total across all files
const ACCEPTED_FILE_TYPES = [
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg'
]

export const RegisterConfirmSchema = z.object({
    supportType: z.string().min(1, 'Support product/process is required'),
    purchaseFreq: z
        .string()
        .min(1, 'Purchase frequency is required')
        .regex(/^\d+$/, 'Purchase frequency must be a number'),
    vendorContactIds: z.array(z.string()).min(1, 'Please select at least one target contact'),
    files: z.array(z.any())
        .min(1, 'Please upload at least one file')
        .refine(
            files => files.reduce((total, file) => total + (file?.size || 0), 0) <= MAX_TOTAL_SIZE,
            { message: 'Total file size must not exceed 10MB.' }
        )
        .refine(
            files => files.every(file => ACCEPTED_FILE_TYPES.includes(file.type)),
            { message: 'Only PDF, Excel, PNG, and JPEG files are allowed.' }
        )
})

export const RegisterContactSelectionSchema = z.object({
    supportType: z.string().optional().default(''),
    purchaseFreq: z.string().optional().default(''),
    vendorContactIds: z.array(z.string()).min(1, 'Please select at least one target contact'),
    files: z.array(z.any()).optional().default([])
})

export type RegisterConfirmFormData = z.infer<typeof RegisterConfirmSchema>

export const defaultRegisterConfirmValues: RegisterConfirmFormData = {
    supportType: '',
    purchaseFreq: '',
    vendorContactIds: [],
    files: []
}
