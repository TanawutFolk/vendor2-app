// Shared helpers for the check-document approval screen.
// Extracted from SearchResult.tsx so the modal/panel components can import them
// without creating a circular dependency back to the page.
import {
  isIssueGprBStep,
  isIssueGprCStep,
  isPoPicInProgressStep
} from '@/_workspace/utils/requestWorkflow'
import type { NegotiationAction } from '@/_workspace/types/_check-document/CheckDocumentTypes'
import type {
  ApprovalStepStatusMasterIds,
  WorkflowStepMasterIds
} from '@/_workspace/utils/workflowIdentity'
import {
  getApprovalStepStatusMasterId,
  isApprovalStepStatusMaster,
  isWorkflowStepMaster
} from '@/_workspace/utils/workflowIdentity'

export { default as Transition } from '@components/TransitionDialog'

const API_BASE = (import.meta as any).env?.VITE_API_URL || ''

// Request attachments live in the request's 02.Request Documents network folder (moved out
// of uploads/documents). Those are streamed through the managed download route; only legacy rows
// whose FILE_PATH is still a bare uploads filename fall back to /uploads/documents.
const isNetworkStoredPath = (filePath: string) =>
  filePath.includes('02.Request Documents') || filePath.includes('\\') || /^[a-zA-Z]:[\\/]/.test(filePath)

export const buildFileUrls = (documents: any, requestNumber?: string): { name: string; url: string }[] => {
  let docs: any[] = []
  try {
    docs = typeof documents === 'string' ? JSON.parse(documents) : documents || []
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
      const params = new URLSearchParams({
        FILE_PATH: filePath,
        FILE_NAME: fileName,
        REQUEST_NUMBER: requestNumber || ''
      })
      return `${API_BASE}/register-request/downloadSelectionDocument?${params.toString()}`
    }

    return `${API_BASE}/uploads/documents/${filePath}`
  }

  return docs
    .filter((d: any) => Boolean(d) && isRequestAttachment(d))
    .map((d: any) => ({
      name: d.FILE_NAME || d.FILE_PATH || 'Unnamed File',
      url: buildUrl(d)
    }))
}

export const parseApprovalSteps = (approvalStepsRaw: any): any[] => {
  try {
    const parsed = typeof approvalStepsRaw === 'string' ? JSON.parse(approvalStepsRaw) : approvalStepsRaw || []
    return Array.isArray(parsed) ? parsed.filter(Boolean) : []
  } catch {
    return []
  }
}

export const getMyQueueStepStatus = (
  row: any,
  empCode?: string,
  queueWorkflowStepMasterId?: number | null,
  approvalStepStatusIds?: ApprovalStepStatusMasterIds
): 'in_progress' | 'approved' | 'rejected' | 'pending' => {
  const directStatusId = getApprovalStepStatusMasterId({
    M_APPROVAL_STEP_STATUS_ID: row?.MY_APPROVAL_STATUS_ID
  })
  if (directStatusId && approvalStepStatusIds) {
    if (directStatusId === approvalStepStatusIds.IN_PROGRESS) return 'in_progress'
    if (directStatusId === approvalStepStatusIds.APPROVED) return 'approved'
    if (directStatusId === approvalStepStatusIds.REJECTED) return 'rejected'
  }

  const steps = parseApprovalSteps(row?.APPROVAL_STEPS)
  const myQueueSteps = steps.filter((step: any) => {
    if (!step || step.APPROVER_EMPCODE !== empCode) return false
    if (!queueWorkflowStepMasterId) return true
    return isWorkflowStepMaster(step, queueWorkflowStepMasterId)
  })

  if (approvalStepStatusIds) {
    if (myQueueSteps.some((step: any) => isApprovalStepStatusMaster(step, approvalStepStatusIds.IN_PROGRESS)))
      return 'in_progress'
    if (myQueueSteps.some((step: any) => isApprovalStepStatusMaster(step, approvalStepStatusIds.APPROVED)))
      return 'approved'
    if (myQueueSteps.some((step: any) => isApprovalStepStatusMaster(step, approvalStepStatusIds.REJECTED)))
      return 'rejected'
  }

  return 'pending'
}

export const getNegotiationWorkflowState = (
  currentStep: any,
  workflowStepIds: WorkflowStepMasterIds
): {
  isNegotiationStep: boolean
  actions: NegotiationAction[]
} => {
  if (isPoPicInProgressStep(currentStep, workflowStepIds)) {
    return {
      isNegotiationStep: true,
      actions: [
        {
          key: 'agree',
          label: 'Approve and Send to Doc Checker',
          color: 'success',
          nextStatusId: workflowStepIds.DOC_CHECK,
          isFinalStep: false
        },
        {
          key: 'disagree',
          label: 'Send GPR B to Vendor',
          color: 'warning',
          nextStatusId: workflowStepIds.ISSUE_GPR_B,
          isFinalStep: false
        }
      ]
    }
  }

  if (isIssueGprBStep(currentStep, workflowStepIds)) {
    return {
      isNegotiationStep: true,
      actions: [
        {
          key: 'agree',
          label: 'Send GPR C to Requester Approval',
          color: 'warning',
          nextStatusId: workflowStepIds.ISSUE_GPR_C,
          isFinalStep: false
        },
        { key: 'disagree', label: 'Reject', color: 'error', nextStatusId: workflowStepIds.VENDOR_DISAGREED, isFinalStep: true }
      ]
    }
  }

  if (isIssueGprCStep(currentStep, workflowStepIds)) {
    return {
      isNegotiationStep: true,
      actions: [
        { key: 'agree', label: 'Approve GPR C', color: 'success', nextStatusId: workflowStepIds.DOC_CHECK, isFinalStep: false },
        {
          key: 'disagree',
          label: 'Vendor Disagreed (Close)',
          color: 'error',
          nextStatusId: workflowStepIds.VENDOR_DISAGREED,
          isFinalStep: true
        }
      ]
    }
  }

  return {
    isNegotiationStep: false,
    actions: []
  }
}
