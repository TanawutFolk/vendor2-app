import ApprovalQueueAPI from '@_workspace/api/_approval-queue/ApprovalQueueAPI'
import axiosRequest from '@/libs/axios/axiosRequest'
import { AxiosResponse } from 'axios'
import { RawStatusOption, RegisterRequestResponseI } from '@_workspace/services/_register-request/RegisterRequestServices'

// Pass-through transport layer (company pattern): callers build the UPPER_CASE
// DB payload themselves and hand it in ready to send. The service only owns the
// endpoint + method and forwards the payload as-is.
type ApprovalQueuePayload = Record<string, unknown>

export default class ApprovalQueueServices {
    static getAll(data?: ApprovalQueuePayload): Promise<AxiosResponse<RegisterRequestResponseI<ApprovalQueuePayload[]>>> {
        return axiosRequest<RegisterRequestResponseI<ApprovalQueuePayload[]>>({
            url: `${ApprovalQueueAPI.API_ROOT_URL}/searchRequest`,
            data: data ?? {},
            method: 'POST'
        })
    }

    static getById(data: ApprovalQueuePayload): Promise<AxiosResponse<RegisterRequestResponseI<ApprovalQueuePayload | null>>> {
        return axiosRequest<RegisterRequestResponseI<ApprovalQueuePayload | null>>({
            url: `${ApprovalQueueAPI.API_ROOT_URL}/getRequestDetails`,
            data,
            method: 'POST'
        })
    }

    static updateStatus(data: ApprovalQueuePayload): Promise<AxiosResponse<RegisterRequestResponseI<unknown>>> {
        return axiosRequest<RegisterRequestResponseI<unknown>>({
            url: `${ApprovalQueueAPI.API_ROOT_URL}/updateStatus`,
            data,
            method: 'POST'
        })
    }

    static getStatusOptions(): Promise<AxiosResponse<RegisterRequestResponseI<RawStatusOption[]>>> {
        return axiosRequest<RegisterRequestResponseI<RawStatusOption[]>>({
            url: `${ApprovalQueueAPI.API_ROOT_URL}/getStatusOptions`,
            method: 'POST'
        })
    }

    static reassign(data: ApprovalQueuePayload): Promise<AxiosResponse<RegisterRequestResponseI<unknown>>> {
        return axiosRequest<RegisterRequestResponseI<unknown>>({
            url: `${ApprovalQueueAPI.API_ROOT_URL}/reassign`,
            data,
            method: 'POST'
        })
    }
}
