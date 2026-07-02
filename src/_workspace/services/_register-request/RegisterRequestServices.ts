import RegisterRequestAPI from '@_workspace/api/_register-request/RegisterRequest'
import axiosRequest from '@/libs/axios/axiosRequest'
import { AxiosResponse } from 'axios'
import type { AuditFields } from '@_workspace/types/AuditFields'

const APPROVAL_QUEUE_ROOT_URL = 'approval-queue'

export interface RegisterRequestResponseI<T = any> {
    Status: boolean
    ResultOnDb: T
    TotalCountOnDb: number
    MethodOnDb: string
    Message: string
}

type DropdownOption = { value: string; label: string; BUSINESS_CATEGORY_ID?: number; DESCRIPTION?: string | null }
type CurrencyDropdownOption = { value: string; label: string; INFO_CURRENCY_ID?: number }

// Pass-through transport layer (company pattern): callers build the UPPER_CASE
// DB payload; the service only owns endpoint + method.
export default class RegisterRequestServices {
    // Create a new vendor registration request (with file uploads)
    static create(formData: FormData): Promise<AxiosResponse<RegisterRequestResponseI<{ REQUEST_REGISTER_VENDOR_ID: number }>>> {
        return axiosRequest<RegisterRequestResponseI<{ REQUEST_REGISTER_VENDOR_ID: number }>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/createRequestVendor`,
            data: formData,
            method: 'POST',
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    }

    // Get all registration requests (optionally filtered)
    static getAll(data: Record<string, unknown> = {}): Promise<AxiosResponse<RegisterRequestResponseI<any[]>>> {
        return axiosRequest<RegisterRequestResponseI<any[]>>({
            url: `${APPROVAL_QUEUE_ROOT_URL}/searchRequest`,
            data,
            method: 'POST'
        })
    }

    // Get a single registration request by ID
    static getById(data: Record<string, unknown>): Promise<AxiosResponse<RegisterRequestResponseI<any>>> {
        return axiosRequest<RegisterRequestResponseI<any>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/getById`,
            data,
            method: 'POST'
        })
    }

    // Update request details (PIC แก้ไขข้อมูลคำขอ)
    static updateRequest(data: Record<string, unknown>): Promise<AxiosResponse<RegisterRequestResponseI<any>>> {
        return axiosRequest<RegisterRequestResponseI<any>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/updateRequest`,
            data,
            method: 'POST'
        })
    }

    // Update request status (approve/reject)
    static updateStatus(data: Record<string, unknown>): Promise<AxiosResponse<RegisterRequestResponseI<any>>> {
        return axiosRequest<RegisterRequestResponseI<any>>({
            url: `${APPROVAL_QUEUE_ROOT_URL}/updateStatus`,
            data,
            method: 'POST'
        })
    }

    // Send agreement email to vendor
    static sendAgreementEmail(data: Record<string, unknown>): Promise<AxiosResponse<RegisterRequestResponseI<any>>> {
        return axiosRequest<RegisterRequestResponseI<any>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/sendAgreementEmail`,
            data,
            method: 'POST'
        })
    }

    // Get all active status options from m_request_status
    static getStatusOptions(): Promise<AxiosResponse<RegisterRequestResponseI<RawStatusOption[]>>> {
        return axiosRequest<RegisterRequestResponseI<RawStatusOption[]>>({
            url: `${APPROVAL_QUEUE_ROOT_URL}/getStatusOptions`,
            method: 'POST'
        })
    }

    static getBusinessCategories(): Promise<AxiosResponse<RegisterRequestResponseI<DropdownOption[]>>> {
        return axiosRequest<RegisterRequestResponseI<DropdownOption[]>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/dropdown/business-categories`,
            method: 'POST'
        })
    }

    static getCurrencies(): Promise<AxiosResponse<RegisterRequestResponseI<CurrencyDropdownOption[]>>> {
        return axiosRequest<RegisterRequestResponseI<CurrencyDropdownOption[]>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/dropdown/currencies`,
            method: 'POST'
        })
    }

    // Get approval steps for a request
    static getApprovalSteps(data: Record<string, unknown>): Promise<AxiosResponse<RegisterRequestResponseI<ApprovalStep[]>>> {
        return axiosRequest<RegisterRequestResponseI<ApprovalStep[]>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/getApprovalSteps`,
            data,
            method: 'POST'
        })
    }

    // Get approval logs for a request
    static getApprovalLogs(data: Record<string, unknown>): Promise<AxiosResponse<RegisterRequestResponseI<ApprovalLog[]>>> {
        return axiosRequest<RegisterRequestResponseI<ApprovalLog[]>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/getApprovalLogs`,
            data,
            method: 'POST'
        })
    }

    // Create an approval step
    static createApprovalStep(data: Record<string, unknown>): Promise<AxiosResponse<RegisterRequestResponseI<{ REQUEST_APPROVAL_STEP_ID: number }>>> {
        return axiosRequest<RegisterRequestResponseI<{ REQUEST_APPROVAL_STEP_ID: number }>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/createApprovalStep`,
            data,
            method: 'POST'
        })
    }

    // Update an approval step and log the action
    static updateApprovalStep(data: Record<string, unknown>): Promise<AxiosResponse<RegisterRequestResponseI<any>>> {
        return axiosRequest<RegisterRequestResponseI<any>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/updateApprovalStep`,
            data,
            method: 'POST'
        })
    }

    static reassign(data: Record<string, unknown>): Promise<AxiosResponse<RegisterRequestResponseI<any>>> {
        return axiosRequest<RegisterRequestResponseI<any>>({
            url: `${APPROVAL_QUEUE_ROOT_URL}/reassign`,
            data,
            method: 'POST'
        })
    }

    // Account PIC: complete vendor registration and fill vendor code
    static completeRegistration(data: Record<string, unknown>): Promise<AxiosResponse<RegisterRequestResponseI<any>>> {
        return axiosRequest<RegisterRequestResponseI<any>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/completeRegistration`,
            data,
            method: 'POST'
        })
    }

    // Save GPR form (Supplier / Outsourcing Selection Sheet) data
    static saveGprForm(data: Record<string, unknown>): Promise<AxiosResponse<RegisterRequestResponseI<any>>> {
        return axiosRequest<RegisterRequestResponseI<any>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/saveGprForm`,
            data,
            method: 'POST'
        })
    }

    // Save requester-only GPR C notification setup
    static saveGprCNotification(data: Record<string, unknown>): Promise<AxiosResponse<RegisterRequestResponseI<any>>> {
        return axiosRequest<RegisterRequestResponseI<any>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/saveGprCNotification`,
            data,
            method: 'POST'
        })
    }

    static gprCGetFlow(data: Record<string, unknown>): Promise<AxiosResponse<RegisterRequestResponseI<unknown>>> {
        return axiosRequest<RegisterRequestResponseI<unknown>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/gpr-c/get-flow`,
            data,
            method: 'POST'
        })
    }

    static gprCSubmitSetup(data: Record<string, unknown>): Promise<AxiosResponse<RegisterRequestResponseI<unknown>>> {
        return axiosRequest<RegisterRequestResponseI<unknown>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/gpr-c/submit-setup`,
            data,
            method: 'POST'
        })
    }

    static gprCQueue(data: Record<string, unknown>): Promise<AxiosResponse<RegisterRequestResponseI<Record<string, unknown>[]>>> {
        return axiosRequest<RegisterRequestResponseI<Record<string, unknown>[]>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/gpr-c/queue`,
            data,
            method: 'POST'
        })
    }

    static gprCTaskManagerQueue(): Promise<AxiosResponse<RegisterRequestResponseI<Record<string, unknown>[]>>> {
        return axiosRequest<RegisterRequestResponseI<Record<string, unknown>[]>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/gpr-c/task-manager-queue`,
            data: {},
            method: 'POST'
        })
    }

    static gprCApproveStep(data: Record<string, unknown>): Promise<AxiosResponse<RegisterRequestResponseI<unknown>>> {
        return axiosRequest<RegisterRequestResponseI<unknown>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/gpr-c/approve-step`,
            data,
            method: 'POST'
        })
    }

    static gprCRejectStep(data: Record<string, unknown>): Promise<AxiosResponse<RegisterRequestResponseI<unknown>>> {
        return axiosRequest<RegisterRequestResponseI<unknown>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/gpr-c/reject-step`,
            data,
            method: 'POST'
        })
    }

    static gprCActionRequired(data: Record<string, unknown>): Promise<AxiosResponse<RegisterRequestResponseI<unknown>>> {
        return axiosRequest<RegisterRequestResponseI<unknown>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/gpr-c/action-required`,
            data,
            method: 'POST'
        })
    }

    static gprCRecordActionResult(data: Record<string, unknown>): Promise<AxiosResponse<RegisterRequestResponseI<unknown>>> {
        return axiosRequest<RegisterRequestResponseI<unknown>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/gpr-c/record-action-result`,
            data,
            method: 'POST'
        })
    }

    static gprCActionRequiredQueue(data: Record<string, unknown>): Promise<AxiosResponse<RegisterRequestResponseI<Record<string, unknown>[]>>> {
        return axiosRequest<RegisterRequestResponseI<Record<string, unknown>[]>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/gpr-c/action-required-queue`,
            data,
            method: 'POST'
        })
    }

    static resolveEmployeeProfile(data: Record<string, unknown>): Promise<AxiosResponse<RegisterRequestResponseI<{
        empcode: string
        name: string
        email: string
    }>>> {
        return axiosRequest<RegisterRequestResponseI<{
            empcode: string
            name: string
            email: string
        }>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/resolveEmployeeProfile`,
            data,
            method: 'POST'
        })
    }

    // Get Supplier / Outsourcing Selection Sheet data via new database
    static getGprForm(data: Record<string, unknown>): Promise<AxiosResponse<RegisterRequestResponseI<any>>> {
        return axiosRequest<RegisterRequestResponseI<any>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/getSelectionSheet`,
            data,
            method: 'POST'
        })
    }

    // Attach a single document file to an existing request
    // Used for: GPR criteria per-row uploads, generated Form A PDF attachment
    static addDocument(formData: FormData): Promise<AxiosResponse<RegisterRequestResponseI<{ document_id: number; file_path: string; file_name: string }>>> {
        return axiosRequest<RegisterRequestResponseI<{ document_id: number; file_path: string; file_name: string }>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/addDocument`,
            data: formData,
            method: 'POST',
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    }

    static downloadSelectionDocument(data: Record<string, unknown>): Promise<AxiosResponse<Blob>> {
        return axiosRequest({
            url: `${RegisterRequestAPI.API_ROOT_URL}/downloadSelectionDocument`,
            data,
            method: 'POST',
            responseType: 'blob'
        })
    }

    static deleteSelectionDocument(data: Record<string, unknown>): Promise<AxiosResponse<RegisterRequestResponseI<any>>> {
        return axiosRequest<RegisterRequestResponseI<any>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/deleteSelectionDocument`,
            data,
            method: 'POST'
        })
    }
}

export interface StatusOption {
    workflowStepId?: number
    statusId: number
    value: string
    label: string
    stepCode?: string
    actorType?: string
    defaultGroupCodeLocal?: string
    defaultGroupCodeOversea?: string
    requiresVendorReply?: number
    requiresVendorCode?: number
    chipColor: string
    accent: string
    icon?: string
    sortOrder: number
}

export type RawStatusOption = Omit<StatusOption, 'chipColor' | 'accent' | 'icon'> & Partial<Pick<StatusOption, 'chipColor' | 'accent' | 'icon'>>

export interface ApprovalStep extends AuditFields {
    REQUEST_APPROVAL_STEP_ID: number
    REQUEST_REGISTER_VENDOR_ID: number
    WORKFLOW_STEP_MASTER_ID: number
    M_REQUEST_STATUS_ID: number
    STEP_ORDER: number
    APPROVER_EMPCODE: string
    STEP_STATUS: string
    DESCRIPTION: string
    STEP_CODE?: string
    ACTOR_TYPE?: string
    GROUP_CODE?: string
    ASSIGNMENT_MODE?: string
    master_status_value?: string
    master_status_label?: string
    approver_name?: string
}

export interface ApprovalLog extends AuditFields {
    REQUEST_APPROVAL_LOG_ID: number
    REQUEST_REGISTER_VENDOR_ID: number
    REQUEST_APPROVAL_STEP_ID: number
    ACTION_BY: string
    ACTION_TYPE: string
    DESCRIPTION: string
    CREATE_DATE: string
    ACTION_BY_NAME?: string
}
