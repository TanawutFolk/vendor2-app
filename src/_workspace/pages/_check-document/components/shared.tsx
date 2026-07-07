// Shared helpers + Transition for the check-document approval screen.
// Extracted from SearchResult.tsx so the modal/panel components can import them
// without creating a circular dependency back to the page.
import { forwardRef } from 'react'
import type { ReactElement, Ref } from 'react'
import { Slide } from '@mui/material'
import type { SlideProps } from '@mui/material'

import {
    inferStepCode,
    isIssueGprBStep,
    isIssueGprCStep,
    isPendingAgreementStep,
    normalizeWorkflowText,
} from '@_workspace/utils/requestWorkflow'
import type { NegotiationAction } from '@_workspace/types/_check-document/CheckDocumentTypes'

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

export const parseApprovalSteps = (approvalStepsRaw: any): any[] => {
    try {
        const parsed = typeof approvalStepsRaw === 'string' ? JSON.parse(approvalStepsRaw) : (approvalStepsRaw || [])
        return Array.isArray(parsed) ? parsed.filter(Boolean) : []
    } catch {
        return []
    }
}

export const getMyQueueStepStatus = (row: any, empCode?: string, queueStepCode?: string): 'in_progress' | 'approved' | 'rejected' | 'pending' => {
    const directStatus = String(row?.MY_APPROVAL_STATUS || '').trim().toLowerCase()
    if (['in_progress', 'approved', 'rejected'].includes(directStatus)) {
        return directStatus as 'in_progress' | 'approved' | 'rejected'
    }

    const normalizedQueueStepCode = String(queueStepCode || '').trim().toUpperCase()
    const steps = parseApprovalSteps(row?.APPROVAL_STEPS)
    const myQueueSteps = steps.filter((step: any) => {
        if (!step || step.APPROVER_EMPCODE !== empCode) return false
        if (!normalizedQueueStepCode) return true
        return inferStepCode(step) === normalizedQueueStepCode
    })

    if (myQueueSteps.some((step: any) => step.STEP_STATUS === 'in_progress')) return 'in_progress'
    if (myQueueSteps.some((step: any) => step.STEP_STATUS === 'approved')) return 'approved'
    if (myQueueSteps.some((step: any) => step.STEP_STATUS === 'rejected')) return 'rejected'

    return 'pending'
}

const normalizeStatusText = (value: unknown) => normalizeWorkflowText(String(value || ''))

const resolveWorkflowStatusValue = (statusOptions: any[] = [], preferredText: string, fallbackValue: string) => {
    const target = normalizeStatusText(preferredText)
    const matched = statusOptions.find(option => {
        const candidates = [
            option?.value,
            option?.label,
            option?.status_value,
            option?.status_label,
            option?.DESCRIPTION,
            option?.description,
        ]
        return candidates.some(candidate => normalizeStatusText(candidate) === target)
    })

    return matched?.value || fallbackValue
}

export const getNegotiationWorkflowState = (currentStep: any, statusOptions: any[] = []): {
    isNegotiationStep: boolean
    actions: NegotiationAction[]
} => {
    const issueGprBStatus = resolveWorkflowStatusValue(statusOptions, 'Issue GPR B', 'Issue GPR B')
    const issueGprCStatus = resolveWorkflowStatusValue(statusOptions, 'Issue GPR C', 'Issue GPR C')
    const vendorDisagreedStatus = resolveWorkflowStatusValue(statusOptions, 'Vendor Disagreed', 'Vendor Disagreed')
    const documentCheckStatus =
        resolveWorkflowStatusValue(statusOptions, 'PO & SCM Check All Document', '')
        || resolveWorkflowStatusValue(statusOptions, 'PO & SCM Checker', '')
        || resolveWorkflowStatusValue(statusOptions, 'Check All Document', '')
        || resolveWorkflowStatusValue(statusOptions, 'Document Checker', '')
        || 'PO & SCM Check All Document'

    if (isPendingAgreementStep(currentStep)) {
        return {
            isNegotiationStep: true,
            actions: [
                { key: 'agree', label: 'Approve and Send to Doc Checker', color: 'success', nextStatus: documentCheckStatus, isFinalStep: false },
                { key: 'disagree', label: 'Send GPR B to Vendor', color: 'warning', nextStatus: issueGprBStatus, isFinalStep: false },
            ],
        }
    }

    if (isIssueGprBStep(currentStep)) {
        return {
            isNegotiationStep: true,
            actions: [
                { key: 'agree', label: 'Send GPR C to Requester Approval', color: 'warning', nextStatus: issueGprCStatus, isFinalStep: false },
                { key: 'disagree', label: 'Reject', color: 'error', nextStatus: vendorDisagreedStatus, isFinalStep: true },
            ],
        }
    }

    if (isIssueGprCStep(currentStep)) {
        return {
            isNegotiationStep: true,
            actions: [
                { key: 'agree', label: 'Approve GPR C', color: 'success', nextStatus: documentCheckStatus, isFinalStep: false },
                { key: 'disagree', label: 'Vendor Disagreed (Close)', color: 'error', nextStatus: vendorDisagreedStatus, isFinalStep: true },
            ],
        }
    }

    return {
        isNegotiationStep: false,
        actions: [],
    }
}
