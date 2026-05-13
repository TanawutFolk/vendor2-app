import ApprovalQueueAPI from '@_workspace/api/_approval-queue/ApprovalQueueAPI'
import axiosRequest from '@/libs/axios/axiosRequest'
import { AxiosResponse } from 'axios'
import { RegisterRequestResponseI, StatusOption } from '@_workspace/services/_register-request/RegisterRequestServices'

type ApprovalQueuePayload = Record<string, unknown>

export default class ApprovalQueueServices {
    static getAll(data?: ApprovalQueuePayload): Promise<AxiosResponse<RegisterRequestResponseI<ApprovalQueuePayload[]>>> {
        const payload = data ? {
            SEARCHFILTERS: data.SearchFilters ?? data.SEARCHFILTERS,
            COLUMNFILTERS: data.ColumnFilters ?? data.COLUMNFILTERS,
            ORDER: data.Order ?? data.ORDER,
            START: data.Start ?? data.START,
            LIMIT: data.Limit ?? data.LIMIT,
            OFFSET: data.Offset ?? data.OFFSET,
            SQLWHERE: data.sqlWhere ?? data.SQLWHERE,
            SQLWHERECOLUMNFILTER: data.sqlWhereColumnFilter ?? data.SQLWHERECOLUMNFILTER,
            REQUEST_ID: data.request_id ?? data.REQUEST_ID,
            REQUEST_STATUS: data.request_status ?? data.REQUEST_STATUS,
            APPROVER_ID: data.approver_id ?? data.APPROVER_ID,
            ASSIGN_TO: data.assign_to ?? data.ASSIGN_TO,
            QUEUE_STEP_CODE: data.queue_step_code ?? data.QUEUE_STEP_CODE,
            REQUEST_BY_EMPLOYEECODE: data.Request_By_EmployeeCode ?? data.REQUEST_BY_EMPLOYEECODE
        } : {}

        return axiosRequest<RegisterRequestResponseI<ApprovalQueuePayload[]>>({
            url: `${ApprovalQueueAPI.API_ROOT_URL}/searchRequest`,
            data: payload,
            method: 'POST'
        })
    }

    static getById(request_id: number): Promise<AxiosResponse<RegisterRequestResponseI<ApprovalQueuePayload | null>>> {
        return axiosRequest<RegisterRequestResponseI<ApprovalQueuePayload | null>>({
            url: `${ApprovalQueueAPI.API_ROOT_URL}/getById`,
            data: { REQUEST_ID: request_id },
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
    }): Promise<AxiosResponse<RegisterRequestResponseI<unknown>>> {
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

        return axiosRequest<RegisterRequestResponseI<unknown>>({
            url: `${ApprovalQueueAPI.API_ROOT_URL}/updateStatus`,
            data: payload,
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
        scope: 'REQUEST_PIC'
        group_code?: string
        to_empcode: string
        reason?: string
        UPDATE_BY?: string
    }): Promise<AxiosResponse<RegisterRequestResponseI<unknown>>> {
        const payload = {
            REQUEST_ID: data.request_id,
            SCOPE: data.scope,
            GROUP_CODE: data.group_code,
            TO_EMPCODE: data.to_empcode,
            REASON: data.reason,
            UPDATE_BY: data.UPDATE_BY
        }

        return axiosRequest<RegisterRequestResponseI<unknown>>({
            url: `${ApprovalQueueAPI.API_ROOT_URL}/reassign`,
            data: payload,
            method: 'POST'
        })
    }
}
