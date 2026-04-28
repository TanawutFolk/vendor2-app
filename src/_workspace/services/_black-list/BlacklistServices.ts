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

export interface BlacklistSearchRequestI {
    SearchFilters: Array<{ id: string; value: unknown }>
    ColumnFilters?: Array<{ column: string; value: unknown; columnFns?: string }>
    Order: Array<{ id: string; desc: boolean }>
    Start: number
    Limit: number
}

export default class BlacklistServices {
    static search(data: BlacklistSearchRequestI): Promise<AxiosResponse<BlacklistResponseI<Record<string, unknown>[]>>> {
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
