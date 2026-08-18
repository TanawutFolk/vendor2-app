import { useMemo } from 'react'
import { isIssueGprBStep, isIssueGprCStep, isPoPicInProgressStep } from '@/_workspace/utils/requestWorkflow'
import type { WorkflowStepMasterIds } from '@/_workspace/utils/workflowIdentity'

type ButtonColor = 'success' | 'warning' | 'error' | 'primary' | 'secondary' | 'info'

export interface ApprovalWorkflowAction {
  key: 'agree' | 'disagree'
  label: string
  color: ButtonColor
  nextStatusId: number | null
  isFinalStep: boolean
}

export interface UseApprovalWorkflowResult {
  isNegotiationStep: boolean
  actions: ApprovalWorkflowAction[]
}

interface UseApprovalWorkflowOptions {
  isRequesterGprCSetupPhase?: boolean
  directToDocCheckerOnApprove?: boolean
}

export const useApprovalWorkflow = (
  currentStep: unknown,
  workflowStepIds: WorkflowStepMasterIds,
  options: UseApprovalWorkflowOptions = {}
): UseApprovalWorkflowResult => {
  return useMemo(() => {
    const { isRequesterGprCSetupPhase = false, directToDocCheckerOnApprove = false } = options

    if (isPoPicInProgressStep(currentStep, workflowStepIds)) {
      return {
        isNegotiationStep: true,
        actions: [
          {
            key: 'agree',
            label: workflowStepIds.DOC_CHECK ? 'Approve and Send to Doc Checker' : 'Approve and Continue',
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
          {
            key: 'disagree',
            label: 'Reject',
            color: 'error',
            nextStatusId: workflowStepIds.VENDOR_DISAGREED,
            isFinalStep: true
          }
        ]
      }
    }

    if (isIssueGprCStep(currentStep, workflowStepIds)) {
      return {
        isNegotiationStep: true,
        actions: [
          {
            key: 'agree',
            label: isRequesterGprCSetupPhase
              ? 'Submit to Requester Head Approval'
              : directToDocCheckerOnApprove && workflowStepIds.DOC_CHECK
                ? 'Approve and Send to Doc Checker'
                : 'Approve GPR C',
            color: 'success',
            nextStatusId: isRequesterGprCSetupPhase ? workflowStepIds.ISSUE_GPR_C : workflowStepIds.DOC_CHECK,
            isFinalStep: false
          },
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
  }, [currentStep, options, workflowStepIds])
}

export default useApprovalWorkflow
