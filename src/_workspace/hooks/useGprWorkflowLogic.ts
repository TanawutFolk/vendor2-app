import { useMemo } from 'react'
import { isIssueGprBStep, isIssueGprCStep, isPoPicInProgressStep, isPicStep } from '@/_workspace/utils/requestWorkflow'
import type {
  ApprovalStepStatusMasterIds,
  WorkflowStepMasterIds
} from '@/_workspace/utils/workflowIdentity'
import { isApprovalStepStatusMaster } from '@/_workspace/utils/workflowIdentity'

interface UseGprWorkflowLogicParams {
  currentStep: any
  approvalSteps: any[]
  hasSentGprCInSession?: boolean
  isActionable: boolean
  isAssignedPicUser: boolean
  isPicOwnedNegotiationStep: boolean
  everRequestedVendor: boolean
  selectionFormFilled: boolean
  gprEvalPassed: boolean
  isGprBRequired: boolean
  allowApproveBypass: boolean
  workflowStepIds: WorkflowStepMasterIds
  approvalStepStatusIds: ApprovalStepStatusMasterIds
}

const useGprWorkflowLogic = ({
  currentStep,
  approvalSteps,
  hasSentGprCInSession = false,
  isActionable,
  isAssignedPicUser,
  isPicOwnedNegotiationStep,
  everRequestedVendor,
  selectionFormFilled,
  gprEvalPassed,
  isGprBRequired,
  allowApproveBypass,
  workflowStepIds,
  approvalStepStatusIds
}: UseGprWorkflowLogicParams) => {
  return useMemo(() => {
    const isPicPostVendorStep =
      isActionable &&
      !!currentStep &&
      isAssignedPicUser &&
      (isPicStep(currentStep) || isPicOwnedNegotiationStep) &&
      everRequestedVendor &&
      !isPoPicInProgressStep(currentStep, workflowStepIds)

    const isCurrentIssueGprBStep = !!currentStep && isIssueGprBStep(currentStep, workflowStepIds)
    const isCurrentIssueGprCStep = !!currentStep && isIssueGprCStep(currentStep, workflowStepIds)
    const isApproveBypassEnabled = isCurrentIssueGprBStep || allowApproveBypass
    const isPostSendGprBFlow =
      isCurrentIssueGprBStep || isCurrentIssueGprCStep || allowApproveBypass || hasSentGprCInSession

    const gprCSteps = (approvalSteps || []).filter((step: any) => isIssueGprCStep(step, workflowStepIds))
    const hasGprCApproved = gprCSteps.some((step: any) =>
      isApprovalStepStatusMaster(step, approvalStepStatusIds.APPROVED)
    )
    const hasGprCRejected = gprCSteps.some((step: any) =>
      isApprovalStepStatusMaster(step, approvalStepStatusIds.REJECTED)
    )
    const hasGprCInProgress = gprCSteps.some((step: any) =>
      isApprovalStepStatusMaster(step, approvalStepStatusIds.IN_PROGRESS)
    )
    const hasGprCSent = hasGprCApproved || hasGprCRejected || hasGprCInProgress || hasSentGprCInSession

    const showSendToCheckerBtn = isPicPostVendorStep && isCurrentIssueGprCStep && hasGprCApproved
    const showSendToVendorBtn = isPicPostVendorStep && !isPostSendGprBFlow && isGprBRequired
    const showSendToRequesterBtn = isPicPostVendorStep && isCurrentIssueGprBStep && !hasGprCSent
    // Once GPR C has been sent for approval (Issue GPR C phase), the GPR C sub-workflow owns the
    // reject decision — a GPR C rejection auto-cancels the request — so the PIC no longer needs a
    // manual Reject button here.
    const showRejectBtn = isPicPostVendorStep && isPostSendGprBFlow && !isCurrentIssueGprCStep

    const showMissingSheetWarning = isPicPostVendorStep && !selectionFormFilled
    const shouldEnforceGprACriteria = !isPostSendGprBFlow && !isApproveBypassEnabled
    const showCriteriaWarning = isPicPostVendorStep && selectionFormFilled && !gprEvalPassed && shouldEnforceGprACriteria
    const showGprCDecisionStatus = isPicPostVendorStep && isPostSendGprBFlow

    const disableSendToCheckerBtn =
      !selectionFormFilled ||
      (!gprEvalPassed && shouldEnforceGprACriteria) ||
      (isPostSendGprBFlow && !isCurrentIssueGprBStep && !hasGprCApproved)
    const disableSendToVendorBtn = !selectionFormFilled || !isGprBRequired
    const disableSendToRequesterBtn = !selectionFormFilled
    const disableRejectBtn = false

    return {
      isPicPostVendorStep,
      isCurrentIssueGprBStep,
      isCurrentIssueGprCStep,
      isPostSendGprBFlow,
      isApproveBypassEnabled,
      showSendToCheckerBtn,
      showSendToVendorBtn,
      showSendToRequesterBtn,
      showRejectBtn,
      showMissingSheetWarning,
      showCriteriaWarning,
      showGprCDecisionStatus,
      hasGprCApproved,
      hasGprCRejected,
      hasGprCInProgress,
      hasGprCSent,
      disableSendToCheckerBtn,
      disableSendToVendorBtn,
      disableSendToRequesterBtn,
      disableRejectBtn,
      approveLabel: isCurrentIssueGprCStep
        ? hasGprCApproved
          ? 'Approve and Send to Doc Checker'
          : 'Approve GPR C'
        : isPostSendGprBFlow
          ? 'Approve and Send to Doc Checker'
          : 'Approve and Send to Doc Checker',
      sendToVendorLabel: 'Send GPR B to Vendor',
      sendToRequesterLabel: 'Send GPR C to Requester Approval',
      rejectLabel: 'Reject'
    }
  }, [
    approvalSteps,
    allowApproveBypass,
    currentStep,
    everRequestedVendor,
    gprEvalPassed,
    selectionFormFilled,
    isGprBRequired,
    hasSentGprCInSession,
    isActionable,
    isAssignedPicUser,
    isPicOwnedNegotiationStep,
    workflowStepIds,
    approvalStepStatusIds
  ])
}

export default useGprWorkflowLogic
