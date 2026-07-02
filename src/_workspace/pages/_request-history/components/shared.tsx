// Shared helpers + Transition for the request-history screen.
// Extracted from SearchResult.tsx so the modal/panel components can import them
// without creating a circular dependency back to the page.
import { forwardRef } from 'react'
import type { ReactElement, Ref } from 'react'
import { Slide } from '@mui/material'
import type { SlideProps } from '@mui/material'

export const Transition = forwardRef(function Transition(
    props: SlideProps & { children?: ReactElement<any, any> },
    ref: Ref<unknown>
) {
    return <Slide direction='down' ref={ref} {...props} />
})

const API_BASE = (import.meta as any).env?.VITE_API_URL || ''

// Build accessible file URLs from comma-separated filenames stored in DB
export const buildFileUrls = (documents: any): { name: string; url: string }[] => {
    try {
        const docs = typeof documents === 'string' ? JSON.parse(documents) : (documents || [])
        return docs.filter(Boolean).map((d: any) => ({
            name: d.file_name || d.file_path || 'Unnamed File',
            url: `${API_BASE}/uploads/documents/${d.file_path}`
        }))
    } catch { return [] }
}

const parseGprCCircularList = (raw: unknown): unknown[] => {
    try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw

        return Array.isArray(parsed) ? parsed.filter(Boolean) : []
    } catch {
        return []
    }
}

export const hasCompletedGprCSetup = (row: Record<string, unknown>) => {
    const directFlag = row?.GPR_C_SETUP_COMPLETED ?? row?.gpr_c_setup_completed
    if (directFlag !== undefined && directFlag !== null) {
        return directFlag === true || Number(directFlag) === 1 || String(directFlag).trim().toLowerCase() === 'true'
    }

    const hasText = (value: unknown) => String(value || '').trim().length > 0

    return (
        hasText(row?.GPR_C_APPROVER_NAME) &&
        hasText(row?.GPR_C_APPROVER_EMAIL) &&
        hasText(row?.GPR_C_PC_PIC_NAME) &&
        hasText(row?.GPR_C_PC_PIC_EMAIL) &&
        parseGprCCircularList(row?.GPR_C_CIRCULAR_JSON).length > 0
    )
}
