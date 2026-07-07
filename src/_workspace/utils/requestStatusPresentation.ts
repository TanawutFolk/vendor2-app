import type { RawStatusOption, StatusOption } from '../services/_register-request/RegisterRequestServices'

type RequestStatusPresentation = Pick<StatusOption, 'chipColor' | 'accent' | 'icon'>

const DEFAULT_STATUS_PRESENTATION: RequestStatusPresentation = {
    chipColor: 'default',
    accent: '#8A8D99',
    icon: 'tabler-file'
}

const PRESENTATION_BY_STEP_CODE: Record<string, RequestStatusPresentation> = {
    REQUEST_SUBMITTED: { chipColor: 'info', accent: '#00CFE8', icon: 'tabler-send' },
    PIC_REVIEW: { chipColor: 'primary', accent: '#7367F0', icon: 'tabler-file' },
    PENDING_AGREEMENT: { chipColor: 'warning', accent: '#FF9F43', icon: 'tabler-mail' },
    DOC_CHECK: { chipColor: 'secondary', accent: '#A8AAAE', icon: 'tabler-file-check' },
    PO_MGR_APPROVAL: { chipColor: 'primary', accent: '#7367F0', icon: 'tabler-user-star' },
    PO_GM_APPROVAL: { chipColor: 'primary', accent: '#7367F0', icon: 'tabler-user-check' },
    MD_APPROVAL: { chipColor: 'success', accent: '#28C76F', icon: 'tabler-award' },
    ACCOUNT_REGISTERED: { chipColor: '#FFC107', accent: '#FFA000', icon: 'hourglass_empty' },
    VENDOR_DISAGREED: { chipColor: '#EA5455', accent: '#EA5455', icon: 'tabler-file' },
    ISSUE_GPR_B: { chipColor: '#FF9F43', accent: '#FF9F43', icon: 'tabler-file' },
    ISSUE_GPR_C: { chipColor: '#FF9F43', accent: '#FF9F43', icon: 'tabler-file' }
}

const STEP_CODE_BY_STATUS_VALUE: Record<string, string> = {
    'sent to po & scm (pic)': 'REQUEST_SUBMITTED',
    'sent to po & scm(pic)': 'REQUEST_SUBMITTED',
    'po & scm approved (pic)': 'PIC_REVIEW',
    'po & scm approve (pic)': 'PIC_REVIEW',
    'pending agreement to vendor': 'PENDING_AGREEMENT',
    'po & scm check all document': 'DOC_CHECK',
    'po mgr approve': 'PO_MGR_APPROVAL',
    'po gm approve': 'PO_GM_APPROVAL',
    'md approve': 'MD_APPROVAL',
    'account registered': 'ACCOUNT_REGISTERED',
    'vendor disagreed': 'VENDOR_DISAGREED',
    'issue gpr b': 'ISSUE_GPR_B',
    'issue gpr c': 'ISSUE_GPR_C'
}

const normalize = (value: unknown) => String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ')

export const getRequestStatusPresentation = (option?: Partial<RawStatusOption>): RequestStatusPresentation => {
    if (!option) return DEFAULT_STATUS_PRESENTATION
    const stepCode = String(option.STEP_CODE ?? '').trim().toUpperCase()
    const resolvedStepCode = stepCode || STEP_CODE_BY_STATUS_VALUE[normalize(option.value || option.label)]

    return PRESENTATION_BY_STEP_CODE[resolvedStepCode] ?? DEFAULT_STATUS_PRESENTATION
}

export const applyRequestStatusPresentation = (option: RawStatusOption): StatusOption => {
    if (!option) {
        return {
            label: '',
            value: '',
            M_REQUEST_STATUS_ID: 0,
            DEFAULT_STEP_ORDER: 0,
            chipColor: 'default',
            accent: '#8A8D99',
            icon: 'tabler-file'
        }
    }
    return {
        ...option,
        label: option.label ?? option.value ?? '',
        ...getRequestStatusPresentation(option)
    }
}
