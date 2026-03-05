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
            url: `${RegisterRequestAPI.API_ROOT_URL}/create`,
            data: formData,
            method: 'POST',
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    }

    // Get all registration requests (optionally filtered)
    static getAll(data?: Record<string, any>): Promise<AxiosResponse<RegisterRequestResponseI<any[]>>> {
        return axiosRequest<RegisterRequestResponseI<any[]>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/getAll`,
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

    // Update request status (approve/reject)
    static updateStatus(data: {
        request_id: number
        request_status: string
        approve_by?: string
        approver_remark?: string
        UPDATE_BY?: string
    }): Promise<AxiosResponse<RegisterRequestResponseI<any>>> {
        return axiosRequest<RegisterRequestResponseI<any>>({
            url: `${RegisterRequestAPI.API_ROOT_URL}/updateStatus`,
            data,
            method: 'POST'
        })
    }
}
