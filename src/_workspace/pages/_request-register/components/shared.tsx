// Shared helpers + Transition for the request-register screen.
// Extracted from SearchResult.tsx so the modal/panel components can import them
// without creating a circular dependency back to the page.
import { forwardRef } from 'react'
import type { ReactElement, Ref } from 'react'
import { Slide } from '@mui/material'
import type { SlideProps } from '@mui/material'

import { parseActionRequiredRemark } from '@_workspace/utils/requestWorkflow'
import type { RegisterRequestRow } from '@_workspace/types/_request-register/RequestRegisterTypes'

export const Transition = forwardRef(function Transition(
    props: SlideProps & { children?: ReactElement<any, any> },
    ref: Ref<unknown>
) {
    return <Slide direction='down' ref={ref} {...props} />
})

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
        stepDescription: String(matchedStep?.DESCRIPTION || matchedStep?.description || '').trim(),
    }
}

export const buildFileUrls = (documents: any): { name: string; url: string }[] => {
    const docs = safeParseJSON<any[]>(documents, [])

    const isRequestAttachment = (doc: any) => {
        const fileName = String(doc?.file_name || '').trim()
        const filePath = String(doc?.file_path || '').trim()

        if (!filePath) return false
        if (fileName.startsWith('[GPR] ')) return false
        if (/^[a-zA-Z]:\\/.test(filePath) || /^\\\\/.test(filePath)) return false
        if (filePath.includes('00.Sending') || filePath.includes('01.Receiving')) return false

        return true
    }

    return docs
        .filter((d: any) => Boolean(d) && isRequestAttachment(d))
        .map((d: any) => ({
        name: d.file_name || d.file_path || 'Unnamed File',
        url: `${API_BASE}/uploads/documents/${d.file_path}`
    }))
}



export const normalizeRegisterRequestRow = (row: any): RegisterRequestRow => ({
    ...row,
    request_id: row.request_id ?? row.REQUEST_REGISTER_VENDOR_ID,
    request_number: row.request_number ?? row.REQUEST_NUMBER,
    vendor_id: row.vendor_id ?? row.VENDORS_ID,
    request_status: row.request_status ?? row.REQUEST_STATUS,
    supportProduct_Process: row.supportProduct_Process ?? row.SUPPORTPRODUCT_PROCESS,
    purchase_frequency: row.purchase_frequency ?? row.PURCHASE_FREQUENCY,
    requester_remark: row.requester_remark ?? row.REQUESTER_REMARK,
    approver_remark: row.approver_remark ?? row.APPROVER_REMARK,
    reject_reason: row.reject_reason ?? row.REJECT_REASON,
    approve_by: row.approve_by ?? row.APPROVE_BY,
    approve_date: row.approve_date ?? row.APPROVE_DATE,
    vendor_code: row.vendor_code ?? row.VENDOR_CODE,
    assign_to: row.assign_to ?? row.ASSIGN_TO,
    PIC_Email: row.PIC_Email ?? row.PIC_EMAIL,
    vendor_contact_id: row.vendor_contact_id ?? row.VENDOR_CONTACTS_ID,
    documents_count: row.documents_count ?? row.DOCUMENTS_COUNT,
    Request_By_EmployeeCode: row.Request_By_EmployeeCode ?? row.REQUEST_BY_EMPLOYEECODE ?? row.EMPLOYEE_CODE,
    gpr_c_approver_name: row.gpr_c_approver_name ?? row.GPR_C_APPROVER_NAME,
    gpr_c_approver_email: row.gpr_c_approver_email ?? row.GPR_C_APPROVER_EMAIL,
    gpr_c_pc_pic_name: row.gpr_c_pc_pic_name ?? row.GPR_C_PC_PIC_NAME,
    gpr_c_pc_pic_email: row.gpr_c_pc_pic_email ?? row.GPR_C_PC_PIC_EMAIL,
    gpr_c_circular_json: row.gpr_c_circular_json ?? row.GPR_C_CIRCULAR_JSON,
    action_required_json: row.action_required_json ?? row.ACTION_REQUIRED_JSON,
    gpr_43_acceptance_status: row.gpr_43_acceptance_status ?? row.GPR_43_ACCEPTANCE_STATUS,
    company_name: row.company_name ?? row.COMPANY_NAME,
    fft_vendor_code: row.fft_vendor_code ?? row.FFT_VENDOR_CODE,
    fft_status: row.fft_status ?? row.FFT_STATUS,
    vendor_region: row.vendor_region ?? row.VENDOR_REGION,
    province: row.province ?? row.PROVINCE,
    postal_code: row.postal_code ?? row.POSTAL_CODE,
    country: row.country ?? row.COUNTRY,
    address: row.address ?? row.ADDRESS,
    tel_center: row.tel_center ?? row.TEL_CENTER,
    website: row.website ?? row.WEBSITE,
    emailmain: row.emailmain ?? row.EMAILMAIN,
})
