import AssigneesAPI from '@_workspace/api/_task-manager/AssigneesAPI'
import axiosRequest from '@/libs/axios/axiosRequest'
import { AxiosResponse } from 'axios'

export interface AssigneesResponseI<T = any> {
    Status: boolean
    ResultOnDb: T
    TotalCountOnDb: number
    MethodOnDb: string
    Message: string
}

export default class AssigneesServices {
    static search(data: any): Promise<AxiosResponse<AssigneesResponseI<any[]>>> {
        return axiosRequest<AssigneesResponseI<any[]>>({
            url: `${AssigneesAPI.API_ROOT_URL}/search`,
            data: data || {},
            method: 'POST'
        })
    }

    static save(data: any): Promise<AxiosResponse<AssigneesResponseI<any>>> {
        return axiosRequest<AssigneesResponseI<any>>({
            url: `${AssigneesAPI.API_ROOT_URL}/save`,
            data,
            method: 'POST'
        })
    }

    static delete(id: number): Promise<AxiosResponse<AssigneesResponseI<any>>> {
        return axiosRequest<AssigneesResponseI<any>>({
            url: `${AssigneesAPI.API_ROOT_URL}/${id}`,
            method: 'DELETE'
        })
    }
}
