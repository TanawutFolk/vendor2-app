import { z } from 'zod'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_FILE_TYPES = [
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg'
]

export const RegisterConfirmSchema = z.object({
    supportType: z.string().min(1, 'Support product/process is required'),
    purchaseFreq: z.string().min(1, 'Purchase frequency is required'),
    vendorContactId: z.string().min(1, 'Please select a target contact'),
    files: z.array(z.any())
        .min(1, 'Please upload at least one file')
        .refine(
            files => files.every(file => file.size <= MAX_FILE_SIZE),
            { message: `Max file size is 10MB.` }
        )
        .refine(
            files => files.every(file => ACCEPTED_FILE_TYPES.includes(file.type)),
            { message: 'Only PDF, Excel, PNG, and JPEG files are allowed.' }
        )
})

export type RegisterConfirmFormData = z.infer<typeof RegisterConfirmSchema>

export const defaultRegisterConfirmValues: RegisterConfirmFormData = {
    supportType: '',
    purchaseFreq: '',
    vendorContactId: '',
    files: []
}
