import { useMemo } from 'react'
import {
    isAgreementReachedStep,
    isIssueGprBStep,
    isIssueGprCStep,
    isPendingAgreementStep,
    normalizeWorkflowText,
} from '@_workspace/utils/requestWorkflow'

type ButtonColor = 'success' | 'warning' | 'error' | 'primary' | 'secondary' | 'info'

export interface ApprovalWorkflowAction {
    key: 'agree' | 'disagree'
    label: string
    color: ButtonColor
    nextStatus: string
    isFinalStep: boolean
}

export interface UseApprovalWorkflowResult {
    isNegotiationStep: boolean
    actions: ApprovalWorkflowAction[]
}

interface StatusOptionLike {
    value?: string
    label?: string
    status_value?: string
    status_label?: string
    DESCRIPTION?: string
    description?: string
}

interface UseApprovalWorkflowOptions {
    isRequesterGprCSetupPhase?: boolean
}

const normalize = (value: unknown) => normalizeWorkflowText(String(value || ''))

const resolveStatusValue = (
    statusOptions: StatusOptionLike[] | undefined,
    preferredText: string,
    fallbackValue: string
) => {
    const options = statusOptions || []
    const target = normalize(preferredText)

    const matched = options.find(option => {
        const candidates = [
            option.value,
            option.label,
            option.status_value,
            option.status_label,
            option.DESCRIPTION,
            option.description,
        ]
        return candidates.some(candidate => normalize(candidate) === target)
    })

    return matched?.value || fallbackValue
}

export const useApprovalWorkflow = (
    currentStep: unknown,
    statusOptions: StatusOptionLike[] = [],
    options: UseApprovalWorkflowOptions = {}
): UseApprovalWorkflowResult => {
    return useMemo(() => {
        const { isRequesterGprCSetupPhase = false } = options
        const agreementReachedStatus = resolveStatusValue(statusOptions, 'Agreement Reached', 'Agreement Reached')
        const issueGprBStatus = resolveStatusValue(statusOptions, 'Issue GPR B', 'Issue GPR B')
        const issueGprCStatus = resolveStatusValue(statusOptions, 'Issue GPR C', 'Issue GPR C')
        const vendorDisagreedStatus = resolveStatusValue(statusOptions, 'Vendor Disagreed', 'Vendor Disagreed')
        const documentCheckStatus =
            resolveStatusValue(statusOptions, 'PO & SCM Check All Document', '')
            || resolveStatusValue(statusOptions, 'PO & SCM Checker', '')
            || resolveStatusValue(statusOptions, 'Check All Document', '')
            || resolveStatusValue(statusOptions, 'Document Checker', '')

        if (isPendingAgreementStep(currentStep)) {
            return {
                isNegotiationStep: true,
                actions: [
                    {
                        key: 'agree',
                        label: 'Approve',
                        color: 'success',
                        nextStatus: agreementReachedStatus,
                        isFinalStep: false,
                    },
                    {
                        key: 'disagree',
                        label: 'Send GPR B to Vendor',
                        color: 'warning',
                        nextStatus: issueGprBStatus,
                        isFinalStep: false,
                    },
                ],
            }
        }

        if (isIssueGprBStep(currentStep)) {
            return {
                isNegotiationStep: true,
                actions: [
                    {
                        key: 'agree',
                        label: 'Send GPR C to Requester Approval',
                        color: 'warning',
                        nextStatus: issueGprCStatus,
                        isFinalStep: false,
                    },
                    {
                        key: 'disagree',
                        label: 'Reject',
                        color: 'error',
                        nextStatus: vendorDisagreedStatus,
                        isFinalStep: true,
                    },
                ],
            }
        }

        if (isIssueGprCStep(currentStep)) {
            return {
                isNegotiationStep: true,
                actions: [
                    {
                        key: 'agree',
                        label: isRequesterGprCSetupPhase ? 'Submit to Requester Head Approval' : 'Approve GPR C',
                        color: 'success',
                        nextStatus: agreementReachedStatus,
                        isFinalStep: false,
                    },
                    {
                        key: 'disagree',
                        label: 'Vendor Disagreed (Close)',
                        color: 'error',
                        nextStatus: vendorDisagreedStatus,
                        isFinalStep: true,
                    },
                ],
            }
        }

        if (isAgreementReachedStep(currentStep)) {
            return {
                isNegotiationStep: true,
                actions: [
                    {
                        key: 'agree',
                        label: 'Approve and Send to Doc Checker',
                        color: 'success',
                        nextStatus: documentCheckStatus || agreementReachedStatus,
                        isFinalStep: false,
                    },
                    {
                        key: 'disagree',
                        label: 'Send GPR B to Vendor',
                        color: 'warning',
                        nextStatus: issueGprBStatus,
                        isFinalStep: false,
                    },
                ],
            }
        }

        return {
            isNegotiationStep: false,
            actions: [],
        }
    }, [currentStep, options, statusOptions])
}

export default useApprovalWorkflow
