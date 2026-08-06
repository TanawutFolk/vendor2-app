import type { SignatureSlot } from '@/_workspace/types/_request-register/RequestRegisterTypes'
import type {
  ApprovalStepStatusMasterIds,
  WorkflowStepMasterIds
} from '@/_workspace/utils/workflowIdentity'
import {
  isApprovalStepStatusMaster,
  isWorkflowStepMaster
} from '@/_workspace/utils/workflowIdentity'
import { formatSelectionSheetSignatureName } from '@/_workspace/utils/signatureName'

const parseRows = (value: unknown): any[] => {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value !== 'string') return []

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter(Boolean) : []
  } catch {
    return []
  }
}

const toTime = (value: unknown) => {
  const time = new Date(String(value || 0)).getTime()
  return Number.isNaN(time) ? 0 : time
}

const formatDate = (value: unknown, emptyValue: string) => {
  if (!value) return emptyValue
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return emptyValue

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${date.getFullYear()}`
}

export const buildSelectionSignatureSlots = ({
  approvalSteps: approvalStepsValue,
  approvalLogs: approvalLogsValue,
  workflowStepIds,
  approvalStepStatusIds,
  emptyDate = ''
}: {
  approvalSteps: unknown
  approvalLogs: unknown
  workflowStepIds: WorkflowStepMasterIds
  approvalStepStatusIds: ApprovalStepStatusMasterIds
  emptyDate?: string
}): SignatureSlot[] => {
  const approvalSteps = parseRows(approvalStepsValue)
  const approvalLogs = parseRows(approvalLogsValue)

  const findLatestApprovedStep = (workflowStepMasterId: number | null) =>
    approvalSteps
      .filter(
        step =>
          isWorkflowStepMaster(step, workflowStepMasterId) &&
          isApprovalStepStatusMaster(step, approvalStepStatusIds.APPROVED)
      )
      .sort((a, b) => {
        const iterationDiff = Number(b?.ITERATION_NO || 0) - Number(a?.ITERATION_NO || 0)
        if (iterationDiff !== 0) return iterationDiff
        return toTime(b?.UPDATE_DATE || b?.CREATE_DATE) - toTime(a?.UPDATE_DATE || a?.CREATE_DATE)
      })[0]

  const findLatestLogForStep = (requestApprovalStepId: unknown) =>
    approvalLogs
      .filter(
        log =>
          Number(log?.REQUEST_APPROVAL_STEP_ID ?? log?.request_approval_step_id ?? 0) ===
          Number(requestApprovalStepId || 0)
      )
      .sort(
        (a, b) =>
          toTime(b?.CREATE_DATE || b?.create_date) - toTime(a?.CREATE_DATE || a?.create_date)
      )[0]

  return [
    { role: 'Issuer', workflowStepMasterId: workflowStepIds.PO_PIC_IN_PROGRESS },
    { role: 'Manager', workflowStepMasterId: workflowStepIds.PO_MGR_APPROVAL },
    { role: 'General Manager', workflowStepMasterId: workflowStepIds.PO_GM_APPROVAL },
    { role: 'Managing Director', workflowStepMasterId: workflowStepIds.MD_APPROVAL }
  ].map(item => {
    const step = findLatestApprovedStep(item.workflowStepMasterId)
    const latestLog = findLatestLogForStep(step?.REQUEST_APPROVAL_STEP_ID)
    const code = String(step?.APPROVER_EMPCODE || latestLog?.ACTION_BY || '').trim()
    const fullName = String(step?.APPROVER_NAME || latestLog?.ACTION_BY_NAME || '').trim()

    return {
      role: item.role,
      code,
      signature: formatSelectionSheetSignatureName(fullName, code),
      date: formatDate(
        step?.UPDATE_DATE ||
          step?.update_date ||
          latestLog?.CREATE_DATE ||
          latestLog?.create_date ||
          step?.CREATE_DATE ||
          step?.create_date,
        emptyDate
      )
    }
  })
}

