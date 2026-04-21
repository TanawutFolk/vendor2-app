export const WORKFLOW_STEP_CODE = {
    PIC_REVIEW: 'PIC_REVIEW',
    DOC_CHECK: 'DOC_CHECK',
    MD_APPROVAL: 'MD_APPROVAL',
    PO_MGR_APPROVAL: 'PO_MGR_APPROVAL',
    PO_GM_APPROVAL: 'PO_GM_APPROVAL',
    ACCOUNT_REGISTERED: 'ACCOUNT_REGISTERED'
} as const

export const ASSIGNEE_GROUPS = [
    { label: 'Local PO PIC', value: 'LOCAL_PO_PIC' },
    { label: 'Oversea PO PIC', value: 'OVERSEA_PO_PIC' },
    { label: 'PO Checker (Main)', value: 'PO_CHECKER_MAIN' },
    { label: 'MD', value: 'MD' },
    { label: 'PO Manager', value: 'PO_MGR' },
    { label: 'PO GM', value: 'PO_GM' },
    { label: 'Account Local Main', value: 'ACC_LOCAL_MAIN' },
    { label: 'Account Oversea Main', value: 'ACC_OVERSEA_MAIN' }
] as const

export const ASSIGNEE_GROUP_LABEL_MAP = ASSIGNEE_GROUPS.reduce<Record<string, string>>((acc, item) => {
    acc[item.value] = item.label
    return acc
}, {})

const normalizeText = (value: any) => String(value || '').trim().toLowerCase()

export const normalizeWorkflowText = (value: any) => normalizeText(String(value || '').replace(/[_-]+/g, ' '))

export const inferStepCode = (step: any) => {
    if (step?.step_code) return String(step.step_code).trim().toUpperCase()
    if (step?.stepCode) return String(step.stepCode).trim().toUpperCase()

    const source = normalizeText(`${step?.DESCRIPTION || ''} ${step?.description || ''} ${step?.label || ''}`)

    if (source.includes('checker') || source.includes('check document') || source.includes('check all document')) {
        return WORKFLOW_STEP_CODE.DOC_CHECK
    }
    if (source.includes('general manager') || source.includes('po gm')) {
        return WORKFLOW_STEP_CODE.PO_GM_APPROVAL
    }
    if (source.includes('mgr') || source.includes('manager')) {
        return WORKFLOW_STEP_CODE.PO_MGR_APPROVAL
    }
    if (source.includes('director') || source === 'md' || source.includes(' md ')) {
        return WORKFLOW_STEP_CODE.MD_APPROVAL
    }
    if (source.includes('account')) {
        return WORKFLOW_STEP_CODE.ACCOUNT_REGISTERED
    }
    if (source.includes('pic') || source.includes('sent to po')) {
        return WORKFLOW_STEP_CODE.PIC_REVIEW
    }

    return ''
}

export const inferActorType = (step: any) => {
    if (step?.actor_type) return String(step.actor_type).trim().toUpperCase()
    if (step?.actorType) return String(step.actorType).trim().toUpperCase()

    const stepCode = inferStepCode(step)
    if (stepCode === WORKFLOW_STEP_CODE.PIC_REVIEW) return 'PIC'
    if (stepCode === WORKFLOW_STEP_CODE.ACCOUNT_REGISTERED) return 'ACCOUNT'
    if ([WORKFLOW_STEP_CODE.DOC_CHECK, WORKFLOW_STEP_CODE.MD_APPROVAL, WORKFLOW_STEP_CODE.PO_MGR_APPROVAL, WORKFLOW_STEP_CODE.PO_GM_APPROVAL].includes(stepCode as any)) {
        return 'APPROVER'
    }

    return ''
}

export const isPicStep = (step: any) => inferActorType(step) === 'PIC'

export const isAccountStep = (step: any) => inferActorType(step) === 'ACCOUNT'

export const requiresVendorReply = (step: any) => {
    if (step?.requiresVendorReply !== undefined && step?.requiresVendorReply !== null) {
        return Number(step.requiresVendorReply) === 1
    }

    return inferStepCode(step) === WORKFLOW_STEP_CODE.PIC_REVIEW
}

export const requiresVendorCode = (step: any) => {
    if (step?.requiresVendorCode !== undefined && step?.requiresVendorCode !== null) {
        return Number(step.requiresVendorCode) === 1
    }

    return inferStepCode(step) === WORKFLOW_STEP_CODE.ACCOUNT_REGISTERED
}

export const resolveNextStatus = (statusOptions: any[], currentStep: any, nextStep: any, hasVendorRequested: boolean = true) => {
    if (requiresVendorReply(currentStep) && !hasVendorRequested) {
        const pendingAgreementVendorComplete = statusOptions.find((so: any) => {
            const normalizedValue = normalizeWorkflowText(so?.value || '')
            const normalizedLabel = normalizeWorkflowText(so?.label || '')
            const source = `${normalizedValue} ${normalizedLabel}`
            return source.includes('pending agreement') && source.includes('vendor') && source.includes('complete')
        })
        if (pendingAgreementVendorComplete?.value) return pendingAgreementVendorComplete.value

        const pendingAgreement = statusOptions.find((so: any) => {
            const normalizedValue = normalizeWorkflowText(so?.value || '')
            const normalizedLabel = normalizeWorkflowText(so?.label || '')
            return normalizedValue.includes('pending agreement') || normalizedLabel.includes('pending agreement')
        })
        if (pendingAgreement?.value) return pendingAgreement.value
    }

    const targetStepCode = inferStepCode(nextStep || currentStep)
    const fallbackLabel = nextStep?.DESCRIPTION || currentStep?.DESCRIPTION || ''

    const byStepCode = statusOptions.find((so: any) => inferStepCode(so) === targetStepCode)
    if (byStepCode?.value) return byStepCode.value

    const byLabel = statusOptions.find((so: any) => so.label === fallbackLabel)
    return byLabel?.value || fallbackLabel
}

export const resolveGroupCodeForStep = (step: any, isOversea: boolean) => {
    if (step?.group_code) return String(step.group_code).trim().toUpperCase()
    if (step?.groupCode) return String(step.groupCode).trim().toUpperCase()

    switch (inferStepCode(step)) {
        case WORKFLOW_STEP_CODE.PIC_REVIEW:
            return isOversea ? 'OVERSEA_PO_PIC' : 'LOCAL_PO_PIC'
        case WORKFLOW_STEP_CODE.DOC_CHECK:
            return 'PO_CHECKER_MAIN'
        case WORKFLOW_STEP_CODE.MD_APPROVAL:
            return 'MD'
        case WORKFLOW_STEP_CODE.PO_MGR_APPROVAL:
            return 'PO_MGR'
        case WORKFLOW_STEP_CODE.PO_GM_APPROVAL:
            return 'PO_GM'
        case WORKFLOW_STEP_CODE.ACCOUNT_REGISTERED:
            return isOversea ? 'ACC_OVERSEA_MAIN' : 'ACC_LOCAL_MAIN'
        default:
            return ''
    }
}

export const isPendingAgreementStep = (step: any) => normalizeWorkflowText(step?.DESCRIPTION || step?.description || step?.label).includes('pending agreement')

export const isAgreementReachedStep = (step: any) => normalizeWorkflowText(step?.DESCRIPTION || step?.description || step?.label).includes('agreement reached')

export const isIssueGprBStep = (step: any) => normalizeWorkflowText(step?.DESCRIPTION || step?.description || step?.label).includes('issue gpr b')

export const isIssueGprCStep = (step: any) => normalizeWorkflowText(step?.DESCRIPTION || step?.description || step?.label).includes('issue gpr c')

export const isVendorDisagreedStep = (step: any) => normalizeWorkflowText(step?.DESCRIPTION || step?.description || step?.label).includes('vendor disagre')

export const getApproveActionLabel = (currentStep: any, hasVendorRequested: boolean) => {
    if (!currentStep) return 'Approve'

    if (isPicStep(currentStep)) {
        if (!hasVendorRequested) return 'Send to Vendor'
        if (isPendingAgreementStep(currentStep)) return 'Vendor Agreed (Continue)'
        if (isIssueGprBStep(currentStep)) return 'Send GPR B to Vendor'
        if (isIssueGprCStep(currentStep)) return 'Send GPR C to Vendor'
        return 'Approve'
    }

    if (isPendingAgreementStep(currentStep)) return 'Confirm Agreement'
    if (isIssueGprBStep(currentStep) || isIssueGprCStep(currentStep)) return 'Continue Negotiation'

    return 'Approve'
}

export const getRejectActionLabel = (currentStep: any) => {
    if (!currentStep) return 'Reject'
    if (isPendingAgreementStep(currentStep) || isIssueGprBStep(currentStep) || isIssueGprCStep(currentStep)) {
        return 'Vendor Disagreed'
    }
    return 'Reject'
}

export const getGprStageLabel = (currentStep: any, hasVendorRequested: boolean) => {
    if (!currentStep) return 'GPR form'
    if (isIssueGprBStep(currentStep)) return 'GPR B'
    if (isIssueGprCStep(currentStep)) return 'GPR C'
    if (isPendingAgreementStep(currentStep) && hasVendorRequested) return 'Pending agreement'
    return 'GPR form'
}

export interface ParsedActionRequiredRemark {
    isActionRequired: boolean
    owner: string
    dueDate: string
    note: string
    actor: string
    capturedAt: string
    rawRemark: string
}

export const parseActionRequiredRemark = (remark: any): ParsedActionRequiredRemark => {
    const rawRemark = String(remark || '').trim()
    if (!rawRemark.toLowerCase().startsWith('action required |')) {
        return {
            isActionRequired: false,
            owner: '',
            dueDate: '',
            note: '',
            actor: '',
            capturedAt: '',
            rawRemark,
        }
    }

    const payloadRaw = rawRemark.split('|').slice(1).join('|').trim()
    try {
        const payload = JSON.parse(payloadRaw)
        return {
            isActionRequired: true,
            owner: String(payload?.owner || ''),
            dueDate: String(payload?.due_date || ''),
            note: String(payload?.note || ''),
            actor: String(payload?.actor || ''),
            capturedAt: String(payload?.captured_at || ''),
            rawRemark,
        }
    } catch {
        return {
            isActionRequired: true,
            owner: '',
            dueDate: '',
            note: '',
            actor: '',
            capturedAt: '',
            rawRemark,
        }
    }
}
