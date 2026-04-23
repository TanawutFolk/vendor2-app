import RegisterRequestAPI from '@_workspace/api/_register-request/RegisterRequest'
import axiosRequest from '@/libs/axios/axiosRequest'
import { AxiosResponse } from 'axios'

export interface RegisterRequestResponseI<T = any> {
    Status: boolean
    ResultOnDb: T
    TotalCountOnDb: number
    MethodOnDb: string
    Message: string
}

export default class RegisterRequestServices {
    // Create a new vendor registration request (with file uploads)
    static create(formData: FormData): Promise<AxiosResponse<RegisterRequestResponseI<{ request_id: number }>>> {
        return axiosRequest<RegisterRequestResponseI<{ request_id: number }>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/createRequestVendor`,
            data: formData,
            method: 'POST',
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    }

    // Get all registration requests (optionally filtered)
    static getAll(data?: Record<string, any>): Promise<AxiosResponse<RegisterRequestResponseI<any[]>>> {
        return axiosRequest<RegisterRequestResponseI<any[]>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/searchRequest`,
            data: data || {},
            method: 'POST'
        })
    }

    // Get a single registration request by ID
    static getById(request_id: number): Promise<AxiosResponse<RegisterRequestResponseI<any>>> {
        return axiosRequest<RegisterRequestResponseI<any>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/getById`,
            data: { request_id },
            method: 'POST'
        })
    }

    // Update request details (PIC แก้ไขข้อมูลคำขอ)
    static updateRequest(data: {
        request_id: number
        vendor_contact_id?: number | null
        supportProduct_Process?: string
        purchase_frequency?: string
        requester_remark?: string
        UPDATE_BY?: string
    }): Promise<AxiosResponse<RegisterRequestResponseI<any>>> {
        return axiosRequest<RegisterRequestResponseI<any>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/updateRequest`,
            data,
            method: 'POST'
        })
    }

    // Update request status (approve/reject)
    static updateStatus(data: {
        request_id: number
        request_status: string
        workflow_action?: 'APPROVE' | 'DISAGREE' | 'ACTION_REQUIRED' | 'REJECT'
        approve_by?: string
        approver_remark?: string
        UPDATE_BY?: string
        isFinalStep?: boolean
    }): Promise<AxiosResponse<RegisterRequestResponseI<any>>> {
        return axiosRequest<RegisterRequestResponseI<any>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/updateStatus`,
            data,
            method: 'POST'
        })
    }

    // Send agreement email to vendor
    static sendAgreementEmail(data: any): Promise<AxiosResponse<RegisterRequestResponseI<any>>> {
        return axiosRequest<RegisterRequestResponseI<any>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/sendAgreementEmail`,
            data,
            method: 'POST'
        })
    }

    // Get all active status options from m_request_status
    static getStatusOptions(): Promise<AxiosResponse<RegisterRequestResponseI<StatusOption[]>>> {
        return axiosRequest<RegisterRequestResponseI<StatusOption[]>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/getStatusOptions`,
            method: 'GET'
        })
    }

    // Get approval steps for a request
    static getApprovalSteps(request_id: number): Promise<AxiosResponse<RegisterRequestResponseI<ApprovalStep[]>>> {
        return axiosRequest<RegisterRequestResponseI<ApprovalStep[]>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/getApprovalSteps`,
            data: { request_id },
            method: 'POST'
        })
    }

    // Get approval logs for a request
    static getApprovalLogs(request_id: number): Promise<AxiosResponse<RegisterRequestResponseI<ApprovalLog[]>>> {
        return axiosRequest<RegisterRequestResponseI<ApprovalLog[]>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/getApprovalLogs`,
            data: { request_id },
            method: 'POST'
        })
    }

    // Create an approval step
    static createApprovalStep(data: {
        request_id: number
        step_order: number
        approver_id: string
        step_status: string
        DESCRIPTION: string
        step_code?: string
        actor_type?: string
        group_code?: string
        assignment_mode?: string
        CREATE_BY: string
    }): Promise<AxiosResponse<RegisterRequestResponseI<{ step_id: number }>>> {
        return axiosRequest<RegisterRequestResponseI<{ step_id: number }>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/createApprovalStep`,
            data,
            method: 'POST'
        })
    }

    // Update an approval step and log the action
    static updateApprovalStep(data: {
        step_id: number
        request_id: number
        step_status: string
        action_by?: string
        action_type?: string
        remark?: string
        UPDATE_BY?: string
    }): Promise<AxiosResponse<RegisterRequestResponseI<any>>> {
        return axiosRequest<RegisterRequestResponseI<any>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/updateApprovalStep`,
            data,
            method: 'POST'
        })
    }


    static reassign(data: {
        request_id: number
        scope: 'REQUEST_PIC' | 'CURRENT_STEP'
        to_empcode: string
        reason?: string
        UPDATE_BY?: string
    }): Promise<AxiosResponse<RegisterRequestResponseI<any>>> {
        return axiosRequest<RegisterRequestResponseI<any>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/reassign`,
            data,
            method: 'POST'
        })
    }

    // Account PIC: complete vendor registration and fill vendor code
    static completeRegistration(data: {
        request_id: number
        vendor_code: string
        UPDATE_BY?: string
    }): Promise<AxiosResponse<RegisterRequestResponseI<any>>> {
        return axiosRequest<RegisterRequestResponseI<any>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/completeRegistration`,
            data,
            method: 'POST'
        })
    }

    // Save GPR form (Supplier / Outsourcing Selection Sheet) data
    static saveGprForm(data: {
        request_id: number
        gpr_data: Record<string, any>
        UPDATE_BY?: string
    }): Promise<AxiosResponse<RegisterRequestResponseI<any>>> {
        return axiosRequest<RegisterRequestResponseI<any>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/saveGprForm`,
            data,
            method: 'POST'
        })
    }

    // Save requester-only GPR C notification setup
    static saveGprCNotification(data: {
        request_id: number
        gpr_c_data: {
            gpr_c_approver_empcode?: string
            gpr_c_pc_pic_name?: string
            gpr_c_pc_pic_email?: string
            gpr_c_circular_empcodes?: string[]
        }
        UPDATE_BY?: string
    }): Promise<AxiosResponse<RegisterRequestResponseI<any>>> {
        return axiosRequest<RegisterRequestResponseI<any>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/saveGprCNotification`,
            data,
            method: 'POST'
        })
    }

    // Get GPR form data via new database
    static getGprForm(request_id: number): Promise<AxiosResponse<RegisterRequestResponseI<any>>> {
        return axiosRequest<RegisterRequestResponseI<any>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/getGprForm`,
            data: { request_id },
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
}

export interface StatusOption {
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

export interface ApprovalStep {
    step_id: number
    request_id: number
    step_order: number
    approver_id: string
    step_status: string
    DESCRIPTION: string
    step_code?: string
    actor_type?: string
    group_code?: string
    assignment_mode?: string
    CREATE_DATE: string
    UPDATE_BY: string
    UPDATE_DATE: string
    approver_name?: string
}

export interface ApprovalLog {
    log_id: number
    request_id: number
    step_id: number
    action_by: string
    action_type: string
    remark: string
    action_date: string
    action_by_name?: string
}
