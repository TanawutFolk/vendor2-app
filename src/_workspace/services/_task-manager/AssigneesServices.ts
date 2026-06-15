import AssigneesAPI from '@_workspace/api/_task-manager/AssigneesAPI'
import axiosRequest from '@/libs/axios/axiosRequest'
import { AxiosResponse } from 'axios'
import type { AuditFields } from '@_workspace/types/AuditFields'

export interface AssigneesResponseI<T = unknown> {
    Status: boolean
    ResultOnDb: T
    TotalCountOnDb: number
    MethodOnDb: string
    Message: string
}

export interface AssigneeRowI extends Record<string, unknown>, Partial<AuditFields> {
    ASSIGNEES_ID?: number
    Assignees_id?: number
    EMPCODE?: string
    empcode?: string
    EMPNAME?: string
    empName?: string
    EMPEMAIL?: string
    empEmail?: string
    GROUP_CODE?: string
    group_code?: string
    GROUP_NAME?: string
    group_name?: string
    inuse?: number
}

interface AssigneeSearchParams {
    SearchFilters?: unknown
    SEARCHFILTERS?: unknown
    ColumnFilters?: unknown
    COLUMNFILTERS?: unknown
    Order?: unknown
    ORDER?: unknown
    Start?: number
    START?: number
    Limit?: number
    LIMIT?: number
    keyword?: string
    KEYWORD?: string
    group_code?: string
    GROUP_CODE?: string
    in_use?: string | number
    IN_USE?: string | number
}

interface AssigneeSaveParams {
    Assignees_id?: number
    ASSIGNEES_ID?: number
    empcode?: string
    EMPCODE?: string
    empName?: string
    EMPNAME?: string
    empEmail?: string
    EMPEMAIL?: string
    group_code?: string
    GROUP_CODE?: string
    group_name?: string
    GROUP_NAME?: string
    CREATE_BY?: string
    UPDATE_BY?: string
    INUSE?: number
}

export default class AssigneesServices {
    static getGroups(data?: { keyword?: string }): Promise<AxiosResponse<AssigneesResponseI<AssigneeRowI[]>>> {
        const payload = data ? {
            KEYWORD: data.keyword
        } : {}

        return axiosRequest<AssigneesResponseI<AssigneeRowI[]>>({
            url: `${AssigneesAPI.API_ROOT_URL}/groups`,
            data: payload,
            method: 'POST'
        })
    }

    static search(data: AssigneeSearchParams = {}): Promise<AxiosResponse<AssigneesResponseI<AssigneeRowI[]>>> {
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

        return axiosRequest<AssigneesResponseI<AssigneeRowI[]>>({
            url: `${AssigneesAPI.API_ROOT_URL}/search`,
            data: payload,
            method: 'POST'
        })
    }

    static async searchAll(data: AssigneeSearchParams = {}, pageSize = 500): Promise<AssigneeRowI[]> {
        const rows: AssigneeRowI[] = []
        let start = 0
        let totalCount = 0

        do {
            const response = await AssigneesServices.search({
                ...data,
                Start: start,
                Limit: pageSize,
            })

            if (!response.data?.Status) {
                throw new Error(response.data?.Message || 'Failed to load assignees')
            }

            const pageRows = (response.data.ResultOnDb || []).map(row => ({
                ...row,
                empcode: String(row.empcode ?? row.EMPCODE ?? '').trim(),
                empName: String(row.empName ?? row.EMPNAME ?? '').trim(),
                empEmail: String(row.empEmail ?? row.EMPEMAIL ?? '').trim(),
                group_code: String(row.group_code ?? row.GROUP_CODE ?? '').trim(),
                group_name: String(row.group_name ?? row.GROUP_NAME ?? '').trim(),
                INUSE: Number(row.INUSE ?? row.inuse ?? 0),
            }))
            rows.push(...pageRows)
            totalCount = Number(response.data.TotalCountOnDb || 0)

            if (pageRows.length === 0) break
            start += pageRows.length
        } while (start < totalCount)

        return rows
    }

    static save(data: AssigneeSaveParams): Promise<AxiosResponse<AssigneesResponseI<Record<string, unknown>>>> {
        const payload = {
            ASSIGNEES_ID: data.Assignees_id ?? data.ASSIGNEES_ID,
            EMPCODE: data.empcode ?? data.EMPCODE,
            EMPNAME: data.empName ?? data.EMPNAME,
            EMPEMAIL: data.empEmail ?? data.EMPEMAIL,
            GROUP_CODE: data.group_code ?? data.GROUP_CODE,
            GROUP_NAME: data.group_name ?? data.GROUP_NAME,
            CREATE_BY: data.CREATE_BY ?? data.UPDATE_BY,
            UPDATE_BY: data.UPDATE_BY ?? data.CREATE_BY,
            INUSE: data.INUSE
        }

        return axiosRequest<AssigneesResponseI<Record<string, unknown>>>({
            url: `${AssigneesAPI.API_ROOT_URL}/save`,
            data: payload,
            method: 'POST'
        })
    }
}
