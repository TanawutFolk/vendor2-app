// Shared helpers for the request-register screen.
// Extracted from SearchResult.tsx so the modal/panel components can import them
// without creating a circular dependency back to the page.
import { parseActionRequiredRemark } from '@_workspace/utils/requestWorkflow'

export { default as Transition } from '@components/TransitionDialog'

const API_BASE = (import.meta as any).env?.VITE_API_URL || ''
export const REJECT_REMARK_MAX_LENGTH = 500

export const safeParseJSON = <T,>(input: unknown, fallback: T): T => {
    if (input == null) return fallback
    if (typeof input === 'string') {
        try { return JSON.parse(input) as T }
        catch { return fallback }
    }
    return input as T
}

const toTitleCase = (value: string) =>
    value
        .toLowerCase()
        .split(' ')
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

export const formatActionTypeLabel = (value: unknown) => {
    const action = String(value || '').trim().toLowerCase()

    switch (action) {
        case 'approved':
            return 'Approved'
        case 'rejected':
            return 'Rejected'
        case 'vendor_requested':
            return 'Sent to Vendor'
        case 'submitted_to_requester_head':
            return 'Submitted to Requester Head'
        case 'vendor_disagreed':
            return 'Vendor Disagreed'
        case 'action_required':
            return 'Action Required'
        case 'edited':
            return 'Edited'
        case 'reassigned_pic':
            return 'Reassigned PIC'
        default:
            return toTitleCase(action.replace(/[_-]+/g, ' ')) || 'Updated'
    }
}

export const getActionTypeColor = (value: unknown): 'success' | 'error' | 'warning' | 'info' | 'secondary' => {
    const action = String(value || '').trim().toLowerCase()

    if (action === 'approved') return 'success'
    if (action === 'rejected' || action === 'vendor_disagreed') return 'error'
    if (action === 'action_required') return 'warning'
    if (action === 'vendor_requested' || action === 'submitted_to_requester_head' || action === 'reassigned_pic') return 'info'
    return 'secondary'
}

export const buildActionLogPresentation = (log: any, approvalSteps: any[]) => {
    const parsedRemark = parseActionRequiredRemark(log?.DESCRIPTION)
    const actionType = parsedRemark.isActionRequired ? 'action_required' : log?.ACTION_TYPE
    const detailParts = [
        parsedRemark.owner ? `owner: ${parsedRemark.owner}` : '',
        parsedRemark.dueDate ? `due: ${parsedRemark.dueDate}` : '',
        parsedRemark.note ? `note: ${parsedRemark.note}` : '',
    ].filter(Boolean)
    const actorName = String(log?.ACTION_BY_NAME || '').trim()
    const actorCode = String(log?.ACTION_BY || '').trim()
    const matchedStep = approvalSteps.find((step: any) => String(step.REQUEST_APPROVAL_STEP_ID) === String(log?.REQUEST_APPROVAL_STEP_ID))

    return {
        parsedRemark,
        actionTypeLabel: formatActionTypeLabel(actionType),
        actionColor: getActionTypeColor(actionType),
        detailText: detailParts.length > 0 ? detailParts.join(' | ') : (parsedRemark.rawRemark || ''),
        actorLabel: actorName ? `${actorName}${actorCode ? ` (${actorCode})` : ''}` : (actorCode || '-'),
        stepDescription: String(matchedStep?.DESCRIPTION || '').trim(),
    }
}

// Request attachments now live in the request's 02.Request Documents network folder (moved out
// of uploads/documents). Those are streamed through the managed download route; only legacy rows
// whose FILE_PATH is still a bare uploads filename fall back to /uploads/documents.
const isNetworkStoredPath = (filePath: string) =>
    filePath.includes('02.Request Documents') || filePath.includes('\\') || /^[a-zA-Z]:[\\/]/.test(filePath)

// Streaming URL for one selection-sheet criteria file — same managed download route the
// request attachments use, so FileViewerDialog can preview it inline.
export const buildSelectionFileUrl = (filePath: string, fileName: string, requestNumber?: string) => {
    const params = new URLSearchParams({
        FILE_PATH: filePath,
        FILE_NAME: fileName,
        REQUEST_NUMBER: requestNumber || ''
    })

    return `${API_BASE}/register-request/downloadSelectionDocument?${params.toString()}`
}

export const buildFileUrls = (documents: any, requestNumber?: string): { name: string; url: string }[] => {
    const docs = safeParseJSON<any[]>(documents, [])

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
