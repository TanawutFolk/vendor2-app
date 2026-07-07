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

// Request attachments live in the request's 02.Request Documents network folder (moved out
// of uploads/documents). Those are streamed through the managed download route; only legacy rows
// whose FILE_PATH is still a bare uploads filename fall back to /uploads/documents.
const isNetworkStoredPath = (filePath: string) =>
    filePath.includes('02.Request Documents') || filePath.includes('\\') || /^[a-zA-Z]:[\\/]/.test(filePath)

export const buildFileUrls = (documents: any, requestNumber?: string): { name: string; url: string }[] => {
    let docs: any[] = []
    try {
        docs = typeof documents === 'string' ? JSON.parse(documents) : (documents || [])
    } catch {
        return []
    }

    const isRequestAttachment = (doc: any) => {
        const fileName = String(doc?.FILE_NAME || '').trim()
        const filePath = String(doc?.FILE_PATH || '').trim()

        if (!filePath) return false
        if (fileName.startsWith('[GPR] ')) return false
        if (filePath.includes('00.Sending') || filePath.includes('01.Receiving')) return false

        return true
    }

    const buildUrl = (doc: any) => {
        const filePath = String(doc?.FILE_PATH || '').trim()
        const fileName = String(doc?.FILE_NAME || '').trim()

        if (requestNumber || isNetworkStoredPath(filePath)) {
            // REQUEST_NUMBER lets the API recover the file by scanning the request's network
            // folder if FILE_PATH is stale, missing, or was corrupted on a previous save; the API also falls back to uploads/documents for legacy rows.
            const params = new URLSearchParams({ FILE_PATH: filePath, FILE_NAME: fileName, REQUEST_NUMBER: requestNumber || '' })
            return `${API_BASE}/register-request/downloadSelectionDocument?${params.toString()}`
        }

        return `${API_BASE}/uploads/documents/${filePath}`
    }

    return docs
        .filter((d: any) => Boolean(d) && isRequestAttachment(d))
        .map((d: any) => ({
            name: d.FILE_NAME || d.FILE_PATH || 'Unnamed File',
            url: buildUrl(d),
        }))
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
    const directFlag = row?.GPR_C_SETUP_COMPLETED
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
