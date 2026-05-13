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
    static getGroups(data?: { keyword?: string }): Promise<AxiosResponse<AssigneesResponseI<any[]>>> {
        const payload = data ? {
            KEYWORD: data.keyword
        } : {}

        return axiosRequest<AssigneesResponseI<any[]>>({
            url: `${AssigneesAPI.API_ROOT_URL}/groups`,
            data: payload,
            method: 'POST'
        })
    }

    static search(data: any): Promise<AxiosResponse<AssigneesResponseI<any[]>>> {
        const payload = data ? {
            SEARCHFILTERS: data.SearchFilters ?? data.SEARCHFILTERS,
            COLUMNFILTERS: data.ColumnFilters ?? data.COLUMNFILTERS,
            ORDER: data.Order ?? data.ORDER,
            START: data.Start ?? data.START,
            LIMIT: data.Limit ?? data.LIMIT,
            KEYWORD: data.keyword ?? data.KEYWORD,
            GROUP_CODE: data.group_code ?? data.GROUP_CODE,
            IN_USE: data.in_use ?? data.IN_USE
        } : {}

        return axiosRequest<AssigneesResponseI<any[]>>({
            url: `${AssigneesAPI.API_ROOT_URL}/search`,
            data: payload,
            method: 'POST'
        })
    }

    static save(data: any): Promise<AxiosResponse<AssigneesResponseI<any>>> {
        const payload = {
            ASSIGNEES_ID: data.Assignees_id ?? data.ASSIGNEES_ID,
            EMPCODE: data.empcode ?? data.EMPCODE,
            EMPNAME: data.empName ?? data.EMPNAME,
            EMPEMAIL: data.empEmail ?? data.EMPEMAIL,
            GROUP_CODE: data.group_code ?? data.GROUP_CODE,
            GROUP_NAME: data.group_name ?? data.GROUP_NAME,
            INUSE: data.INUSE
        }

        return axiosRequest<AssigneesResponseI<any>>({
            url: `${AssigneesAPI.API_ROOT_URL}/save`,
            data: payload,
            method: 'POST'
        })
    }
}
