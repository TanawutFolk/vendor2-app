import { AxiosProgressEvent, AxiosResponse } from 'axios'
import axiosRequest from '@/libs/axios/axiosRequest'
import BlacklistAPI from '@_workspace/api/_black-list/BlacklistAPI'

export interface BlacklistResponseI<T = unknown> {
    Status: boolean
    ResultOnDb: T
    TotalCountOnDb: number
    MethodOnDb: string
    Message: string
}

export default class BlacklistServices {
    static search(data: Record<string, unknown>): Promise<AxiosResponse<BlacklistResponseI<Record<string, unknown>[]>>> {
        return axiosRequest<BlacklistResponseI<Record<string, unknown>[]>>({
            url: `${BlacklistAPI.API_ROOT_URL}/search`,
            data,
            method: 'POST',
        })
    }

    static importFileUS(
        formData: FormData,
        onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
    ): Promise<AxiosResponse<BlacklistResponseI<Record<string, unknown>>>> {
        return axiosRequest<BlacklistResponseI<Record<string, unknown>>>({
            url: `${BlacklistAPI.API_ROOT_URL}/us/import`,
            data: formData,
            method: 'POST',
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress,
        })
    }

    static importFileCN(
        formData: FormData,
        onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
    ): Promise<AxiosResponse<BlacklistResponseI<Record<string, unknown>>>> {
        return axiosRequest<BlacklistResponseI<Record<string, unknown>>>({
            url: `${BlacklistAPI.API_ROOT_URL}/cn/import`,
            data: formData,
            method: 'POST',
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress,
        })
    }
}
