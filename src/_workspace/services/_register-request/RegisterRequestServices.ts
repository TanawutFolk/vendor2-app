import RegisterRequestAPI from '@_workspace/api/_register-request/RegisterRequest'
import axiosRequest from '@/libs/axios/axiosRequest'
import { AxiosResponse } from 'axios'

const APPROVAL_QUEUE_ROOT_URL = 'approval-queue'

export interface RegisterRequestResponseI<T = any> {
    Status: boolean
    ResultOnDb: T
    TotalCountOnDb: number
    MethodOnDb: string
    Message: string
}

type GridSearchFilter = { id: string; value: unknown }
type GridColumnFilter = { id: string; columnFns?: string; value: unknown }
type GridOrder = { id: string; desc?: boolean }

type GprCGridRequest = {
    SearchFilters?: GridSearchFilter[]
    ColumnFilters?: GridColumnFilter[]
    Order?: GridOrder[]
    Start?: number
    Limit?: number
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
        const payload = data ? {
            SEARCHFILTERS: data.SearchFilters ?? data.SEARCHFILTERS,
            COLUMNFILTERS: data.ColumnFilters ?? data.COLUMNFILTERS,
            ORDER: data.Order ?? data.ORDER,
            START: data.Start ?? data.START,
            LIMIT: data.Limit ?? data.LIMIT,
            OFFSET: data.Offset ?? data.OFFSET,
            SQLWHERE: data.sqlWhere ?? data.SQLWHERE,
            SQLWHERECOLUMNFILTER: data.sqlWhereColumnFilter ?? data.SQLWHERECOLUMNFILTER,
            REQUEST_STATUS: data.request_status ?? data.REQUEST_STATUS,
            ASSIGN_TO: data.assign_to ?? data.ASSIGN_TO,
            REQUEST_BY_EMPLOYEECODE: data.Request_By_EmployeeCode ?? data.REQUEST_BY_EMPLOYEECODE
        } : {}

        return axiosRequest<RegisterRequestResponseI<any[]>>({
            url: `${APPROVAL_QUEUE_ROOT_URL}/searchRequest`,
            data: payload,
            method: 'POST'
        })
    }

    // Get a single registration request by ID
    static getById(request_id: number): Promise<AxiosResponse<RegisterRequestResponseI<any>>> {
        return axiosRequest<RegisterRequestResponseI<any>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/getById`,
            data: { REQUEST_ID: request_id },
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
        const payload = {
            REQUEST_ID: data.request_id,
            VENDOR_CONTACT_ID: data.vendor_contact_id,
            SUPPORTPRODUCT_PROCESS: data.supportProduct_Process,
            PURCHASE_FREQUENCY: data.purchase_frequency,
            REQUESTER_REMARK: data.requester_remark,
            UPDATE_BY: data.UPDATE_BY
        }

        return axiosRequest<RegisterRequestResponseI<any>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/updateRequest`,
            data: payload,
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
        const payload = {
            REQUEST_ID: data.request_id,
            REQUEST_STATUS: data.request_status,
            WORKFLOW_ACTION: data.workflow_action,
            ACTION_TYPE: data.workflow_action,
            APPROVE_BY: data.approve_by,
            APPROVER_REMARK: data.approver_remark,
            UPDATE_BY: data.UPDATE_BY,
            ISFINALSTEP: data.isFinalStep
        }

        return axiosRequest<RegisterRequestResponseI<any>>({
            url: `${APPROVAL_QUEUE_ROOT_URL}/updateStatus`,
            data: payload,
            method: 'POST'
        })
    }

    // Send agreement email to vendor
    static sendAgreementEmail(data: any): Promise<AxiosResponse<RegisterRequestResponseI<any>>> {
        const payload = {
            REQUEST_ID: data?.request_id ?? data?.REQUEST_ID,
            EMAILMAIN: data?.emailmain ?? data?.EMAILMAIN,
            VENDOR_ID: data?.vendor_id ?? data?.VENDOR_ID,
            UPDATE_BY: data?.UPDATE_BY,
            CREATE_BY: data?.CREATE_BY
        }

        return axiosRequest<RegisterRequestResponseI<any>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/sendAgreementEmail`,
            data: payload,
            method: 'POST'
        })
    }

    // Get all active status options from m_request_status
    static getStatusOptions(): Promise<AxiosResponse<RegisterRequestResponseI<StatusOption[]>>> {
        return axiosRequest<RegisterRequestResponseI<StatusOption[]>>({
            url: `${APPROVAL_QUEUE_ROOT_URL}/getStatusOptions`,
            method: 'GET'
        })
    }

    // Get approval steps for a request
    static getApprovalSteps(request_id: number): Promise<AxiosResponse<RegisterRequestResponseI<ApprovalStep[]>>> {
        return axiosRequest<RegisterRequestResponseI<ApprovalStep[]>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/getApprovalSteps`,
            data: { REQUEST_ID: request_id },
            method: 'POST'
        })
    }

    // Get approval logs for a request
    static getApprovalLogs(request_id: number): Promise<AxiosResponse<RegisterRequestResponseI<ApprovalLog[]>>> {
        return axiosRequest<RegisterRequestResponseI<ApprovalLog[]>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/getApprovalLogs`,
            data: { REQUEST_ID: request_id },
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
        const payload = {
            REQUEST_ID: data.request_id,
            STEP_ORDER: data.step_order,
            APPROVER_ID: data.approver_id,
            STEP_STATUS: data.step_status,
            DESCRIPTION: data.DESCRIPTION,
            STEP_CODE: data.step_code,
            ACTOR_TYPE: data.actor_type,
            GROUP_CODE: data.group_code,
            ASSIGNMENT_MODE: data.assignment_mode,
            CREATE_BY: data.CREATE_BY
        }

        return axiosRequest<RegisterRequestResponseI<{ step_id: number }>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/createApprovalStep`,
            data: payload,
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
        const payload = {
            STEP_ID: data.step_id,
            REQUEST_ID: data.request_id,
            STEP_STATUS: data.step_status,
            ACTION_BY: data.action_by,
            ACTION_TYPE: data.action_type,
            REMARK: data.remark,
            UPDATE_BY: data.UPDATE_BY
        }

        return axiosRequest<RegisterRequestResponseI<any>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/updateApprovalStep`,
            data: payload,
            method: 'POST'
        })
    }


    static reassign(data: {
        request_id: number
        scope: 'REQUEST_PIC' | 'CURRENT_STEP' | 'GPR_C_STEP'
        gpr_c_step_id?: number
        group_code?: string
        to_empcode: string
        reason?: string
        UPDATE_BY?: string
    }): Promise<AxiosResponse<RegisterRequestResponseI<any>>> {
        const payload = {
            REQUEST_ID: data.request_id,
            SCOPE: data.scope,
            GPR_C_STEP_ID: data.gpr_c_step_id,
            GROUP_CODE: data.group_code,
            TO_EMPCODE: data.to_empcode,
            REASON: data.reason,
            UPDATE_BY: data.UPDATE_BY
        }

        return axiosRequest<RegisterRequestResponseI<any>>({
            url: `${APPROVAL_QUEUE_ROOT_URL}/reassign`,
            data: payload,
            method: 'POST'
        })
    }

    // Account PIC: complete vendor registration and fill vendor code
    static completeRegistration(data: {
        request_id: number
        vendor_code: string
        UPDATE_BY?: string
    }): Promise<AxiosResponse<RegisterRequestResponseI<any>>> {
        const payload = {
            REQUEST_ID: data.request_id,
            VENDOR_CODE: data.vendor_code,
            UPDATE_BY: data.UPDATE_BY
        }

        return axiosRequest<RegisterRequestResponseI<any>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/completeRegistration`,
            data: payload,
            method: 'POST'
        })
    }

    // Save GPR form (Supplier / Outsourcing Selection Sheet) data
    static saveGprForm(data: {
        request_id: number
        gpr_data: Record<string, any>
        CREATE_BY?: string
        UPDATE_BY?: string
    }): Promise<AxiosResponse<RegisterRequestResponseI<any>>> {
        const payload = {
            REQUEST_ID: data.request_id,
            GPR_DATA: data.gpr_data,
            CREATE_BY: data.CREATE_BY,
            UPDATE_BY: data.UPDATE_BY
        }

        return axiosRequest<RegisterRequestResponseI<any>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/saveGprForm`,
            data: payload,
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
            gpr_c_pc_pic_empcode?: string
            gpr_c_circular_empcodes?: string[]
        }
        CREATE_BY?: string
        UPDATE_BY?: string
    }): Promise<AxiosResponse<RegisterRequestResponseI<any>>> {
        const payload = {
            REQUEST_ID: data.request_id,
            GPR_C_DATA: data.gpr_c_data,
            CREATE_BY: data.CREATE_BY,
            UPDATE_BY: data.UPDATE_BY
        }

        return axiosRequest<RegisterRequestResponseI<any>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/saveGprCNotification`,
            data: payload,
            method: 'POST'
        })
    }

    static gprCGetFlow(data: {
        request_id: number
    }): Promise<AxiosResponse<RegisterRequestResponseI<unknown>>> {
        const payload = {
            REQUEST_ID: data.request_id
        }

        return axiosRequest<RegisterRequestResponseI<unknown>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/gpr-c/get-flow`,
            data: payload,
            method: 'POST'
        })
    }

    static gprCSubmitSetup(data: {
        request_id: number
        gpr_c_data: Record<string, unknown>
        UPDATE_BY?: string
    }): Promise<AxiosResponse<RegisterRequestResponseI<unknown>>> {
        const payload = {
            REQUEST_ID: data.request_id,
            GPR_C_DATA: data.gpr_c_data,
            UPDATE_BY: data.UPDATE_BY
        }

        return axiosRequest<RegisterRequestResponseI<unknown>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/gpr-c/submit-setup`,
            data: payload,
            method: 'POST'
        })
    }

    static gprCQueue(data: {
        approver_empcode: string
    } & GprCGridRequest): Promise<AxiosResponse<RegisterRequestResponseI<Record<string, unknown>[]>>> {
        const payload = {
            APPROVER_EMPCODE: data.approver_empcode,
            SEARCHFILTERS: data.SearchFilters,
            COLUMNFILTERS: data.ColumnFilters,
            ORDER: data.Order,
            START: data.Start,
            LIMIT: data.Limit
        }

        return axiosRequest<RegisterRequestResponseI<Record<string, unknown>[]>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/gpr-c/queue`,
            data: payload,
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

    static gprCApproveStep(data: {
        request_id: number
        action_by: string
        remark?: string
        UPDATE_BY?: string
    }): Promise<AxiosResponse<RegisterRequestResponseI<unknown>>> {
        const payload = {
            REQUEST_ID: data.request_id,
            ACTION_BY: data.action_by,
            REMARK: data.remark,
            UPDATE_BY: data.UPDATE_BY
        }

        return axiosRequest<RegisterRequestResponseI<unknown>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/gpr-c/approve-step`,
            data: payload,
            method: 'POST'
        })
    }

    static gprCRejectStep(data: {
        request_id: number
        action_by: string
        remark?: string
        UPDATE_BY?: string
    }): Promise<AxiosResponse<RegisterRequestResponseI<unknown>>> {
        const payload = {
            REQUEST_ID: data.request_id,
            ACTION_BY: data.action_by,
            REMARK: data.remark,
            UPDATE_BY: data.UPDATE_BY
        }

        return axiosRequest<RegisterRequestResponseI<unknown>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/gpr-c/reject-step`,
            data: payload,
            method: 'POST'
        })
    }

    static gprCActionRequired(data: {
        request_id: number
        action_by: string
        pic_name: string
        pic_email: string
        required_detail: string
        UPDATE_BY?: string
    }): Promise<AxiosResponse<RegisterRequestResponseI<unknown>>> {
        const payload = {
            REQUEST_ID: data.request_id,
            ACTION_BY: data.action_by,
            PIC_NAME: data.pic_name,
            PIC_EMAIL: data.pic_email,
            REQUIRED_DETAIL: data.required_detail,
            UPDATE_BY: data.UPDATE_BY
        }

        return axiosRequest<RegisterRequestResponseI<unknown>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/gpr-c/action-required`,
            data: payload,
            method: 'POST'
        })
    }

    static gprCRecordActionResult(data: {
        action_required_id: number
        result_status?: string
        result_remark?: string
        result_by: string
        UPDATE_BY?: string
    }): Promise<AxiosResponse<RegisterRequestResponseI<unknown>>> {
        const payload = {
            ACTION_REQUIRED_ID: data.action_required_id,
            RESULT_STATUS: data.result_status,
            RESULT_REMARK: data.result_remark,
            RESULT_BY: data.result_by,
            UPDATE_BY: data.UPDATE_BY
        }

        return axiosRequest<RegisterRequestResponseI<unknown>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/gpr-c/record-action-result`,
            data: payload,
            method: 'POST'
        })
    }

    static gprCActionRequiredQueue(data: {
        pic_email: string
    } & GprCGridRequest): Promise<AxiosResponse<RegisterRequestResponseI<Record<string, unknown>[]>>> {
        const payload = {
            PIC_EMAIL: data.pic_email,
            SEARCHFILTERS: data.SearchFilters,
            COLUMNFILTERS: data.ColumnFilters,
            ORDER: data.Order,
            START: data.Start,
            LIMIT: data.Limit
        }

        return axiosRequest<RegisterRequestResponseI<Record<string, unknown>[]>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/gpr-c/action-required-queue`,
            data: payload,
            method: 'POST'
        })
    }

    static resolveEmployeeProfile(empcode: string): Promise<AxiosResponse<RegisterRequestResponseI<{
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
            data: { EMPCODE: empcode },
            method: 'POST'
        })
    }

    // Get GPR form data via new database
    static getGprForm(request_id: number): Promise<AxiosResponse<RegisterRequestResponseI<any>>> {
        return axiosRequest<RegisterRequestResponseI<any>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/getGprForm`,
            data: { REQUEST_ID: request_id },
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
