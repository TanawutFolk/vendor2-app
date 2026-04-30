import ApprovalQueueAPI from '@_workspace/api/_approval-queue/ApprovalQueueAPI'
import axiosRequest from '@/libs/axios/axiosRequest'
import { AxiosResponse } from 'axios'
import { RegisterRequestResponseI, StatusOption } from '@_workspace/services/_register-request/RegisterRequestServices'

export default class ApprovalQueueServices {
    static getAll(data?: Record<string, any>): Promise<AxiosResponse<RegisterRequestResponseI<any[]>>> {
        return axiosRequest<RegisterRequestResponseI<any[]>>({
            url: `${ApprovalQueueAPI.API_ROOT_URL}/searchRequest`,
            data: data || {},
            method: 'POST'
        })
    }

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
            url: `${ApprovalQueueAPI.API_ROOT_URL}/updateStatus`,
            data,
            method: 'POST'
        })
    }

    static getStatusOptions(): Promise<AxiosResponse<RegisterRequestResponseI<StatusOption[]>>> {
        return axiosRequest<RegisterRequestResponseI<StatusOption[]>>({
            url: `${ApprovalQueueAPI.API_ROOT_URL}/getStatusOptions`,
            method: 'GET'
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
        return axiosRequest<RegisterRequestResponseI<any>>({
            url: `${ApprovalQueueAPI.API_ROOT_URL}/reassign`,
            data,
            method: 'POST'
        })
    }
}
