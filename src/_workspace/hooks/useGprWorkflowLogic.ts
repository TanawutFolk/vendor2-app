import { useMemo } from 'react'
import { isIssueGprBStep, isIssueGprCStep, isPicStep } from '@_workspace/utils/requestWorkflow'

interface StatusOptionLike {
    value?: string
    label?: string
}

interface UseGprWorkflowLogicParams {
    currentStep: any
    approvalSteps: any[]
    hasSentGprCInSession?: boolean
    isActionable: boolean
    isAssignedPicUser: boolean
    isPicOwnedNegotiationStep: boolean
    everRequestedVendor: boolean
    gprFormFilled: boolean
    gprEvalPassed: boolean
    allowApproveBypass: boolean
    statusOptions?: StatusOptionLike[]
}

const resolveStatusValueByKeyword = (
    statusOptions: StatusOptionLike[] = [],
    keyword: string,
    fallback: string
) => {
    const normalizedKeyword = keyword.trim().toLowerCase()
    const matched = statusOptions.find((so: StatusOptionLike) => {
        const value = String(so?.value || '').trim().toLowerCase()
        const label = String(so?.label || '').trim().toLowerCase()
        return value.includes(normalizedKeyword) || label.includes(normalizedKeyword)
    })

    return matched?.value || fallback
}

const useGprWorkflowLogic = ({
    currentStep,
    approvalSteps,
    hasSentGprCInSession = false,
    isActionable,
    isAssignedPicUser,
    isPicOwnedNegotiationStep,
    everRequestedVendor,
    gprFormFilled,
    gprEvalPassed,
    allowApproveBypass,
    statusOptions = [],
}: UseGprWorkflowLogicParams) => {
    return useMemo(() => {
        const completedStatuses = new Set(['approved', 'completed'])
        const rejectedStatuses = new Set(['rejected'])

        const isPicPostVendorStep =
            isActionable
            && !!currentStep
            && isAssignedPicUser
            && (isPicStep(currentStep) || isPicOwnedNegotiationStep)
            && everRequestedVendor

        const isCurrentIssueGprBStep = !!currentStep && isIssueGprBStep(currentStep)
        const isCurrentIssueGprCStep = !!currentStep && isIssueGprCStep(currentStep)
        const isApproveBypassEnabled = isCurrentIssueGprBStep || allowApproveBypass
        const isPostSendGprBFlow = isCurrentIssueGprBStep || isCurrentIssueGprCStep || allowApproveBypass || hasSentGprCInSession

        const agreementReachedStatusValue = resolveStatusValueByKeyword(statusOptions, 'agreement reached', 'Agreement Reached')
        const issueGprBStatusValue = resolveStatusValueByKeyword(statusOptions, 'issue gpr b', 'Issue GPR B')
        const issueGprCStatusValue = resolveStatusValueByKeyword(statusOptions, 'issue gpr c', 'Issue GPR C')
        const vendorDisagreedStatusValue = resolveStatusValueByKeyword(statusOptions, 'vendor disagreed', 'Vendor Disagreed')

        const gprCSteps = (approvalSteps || []).filter((step: any) => isIssueGprCStep(step))
        const hasGprCApproved = gprCSteps.some((step: any) => completedStatuses.has(String(step?.step_status || '').toLowerCase()))
        const hasGprCRejected = gprCSteps.some((step: any) => rejectedStatuses.has(String(step?.step_status || '').toLowerCase()))
        const hasGprCInProgress = gprCSteps.some((step: any) => ['in_progress', 'current'].includes(String(step?.step_status || '').toLowerCase()))
        const hasGprCSent = hasGprCApproved || hasGprCRejected || hasGprCInProgress || hasSentGprCInSession

        const showSendToCheckerBtn = isPicPostVendorStep
        const showSendToVendorBtn = isPicPostVendorStep && !isPostSendGprBFlow
        const showSendToRequesterBtn = isPicPostVendorStep && isCurrentIssueGprBStep && !hasGprCSent
        const showRejectBtn = isPicPostVendorStep && isPostSendGprBFlow

        const showMissingSheetWarning = isPicPostVendorStep && !gprFormFilled
        const shouldEnforceGprACriteria = !isPostSendGprBFlow && !isApproveBypassEnabled
        const showCriteriaWarning = isPicPostVendorStep && gprFormFilled && !gprEvalPassed && shouldEnforceGprACriteria
        const showGprCDecisionStatus = isPicPostVendorStep && isPostSendGprBFlow

        const disableSendToCheckerBtn = !gprFormFilled
            || (!gprEvalPassed && shouldEnforceGprACriteria)
            || (isPostSendGprBFlow && !hasGprCApproved)
        const disableSendToVendorBtn = !gprFormFilled
        const disableSendToRequesterBtn = !gprFormFilled
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
            agreementReachedStatusValue,
            issueGprBStatusValue,
            issueGprCStatusValue,
            vendorDisagreedStatusValue,
            approveLabel: isCurrentIssueGprCStep
                ? 'Approve GPR C'
                : (isPostSendGprBFlow ? 'Approve and Send to Doc Checker' : 'Approve and Send to Doc Checker'),
            sendToVendorLabel: 'Send GPR B to Vendor',
            sendToRequesterLabel: 'Send GPR C to Requester Approval',
            rejectLabel: 'Reject',
        }
    }, [
        approvalSteps,
        allowApproveBypass,
        currentStep,
        everRequestedVendor,
        gprEvalPassed,
        gprFormFilled,
        hasSentGprCInSession,
        isActionable,
        isAssignedPicUser,
        isPicOwnedNegotiationStep,
        statusOptions,
    ])
}

export default useGprWorkflowLogic
