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
    ASSIGNEES_TO_ID?: number
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

export default class AssigneesServices {
    static getGroups(data: Record<string, unknown> = {}): Promise<AxiosResponse<AssigneesResponseI<AssigneeRowI[]>>> {
        return axiosRequest<AssigneesResponseI<AssigneeRowI[]>>({
            url: `${AssigneesAPI.API_ROOT_URL}/groups`,
            data,
            method: 'POST'
        })
    }

    static search(data: Record<string, unknown> = {}): Promise<AxiosResponse<AssigneesResponseI<AssigneeRowI[]>>> {
        return axiosRequest<AssigneesResponseI<AssigneeRowI[]>>({
            url: `${AssigneesAPI.API_ROOT_URL}/search`,
            data,
            method: 'POST'
        })
    }

    static async searchAll(data: Record<string, unknown> = {}, pageSize = 500): Promise<AssigneeRowI[]> {
        const rows: AssigneeRowI[] = []
        let start = 0
        let totalCount = 0

        do {
            const response = await AssigneesServices.search({
                ...data,
                START: start,
                LIMIT: pageSize,
            })

            if (!response.data?.Status) {
                throw new Error(response.data?.Message || 'Failed to load assignees')
            }

            const pageRows = (response.data.ResultOnDb || []).map(row => ({
                ...row,
                empcode: String(row.EMPCODE ?? '').trim(),
                empName: String(row.EMPNAME ?? '').trim(),
                empEmail: String(row.EMPEMAIL ?? '').trim(),
                group_code: String(row.GROUP_CODE ?? '').trim(),
                group_name: String(row.GROUP_NAME ?? '').trim(),
                INUSE: Number(row.INUSE ?? row.inuse ?? 0),
            }))
            rows.push(...pageRows)
            totalCount = Number(response.data.TotalCountOnDb || 0)

            if (pageRows.length === 0) break
            start += pageRows.length
        } while (start < totalCount)

        return rows
    }

    static save(data: Record<string, unknown>): Promise<AxiosResponse<AssigneesResponseI<Record<string, unknown>>>> {
        return axiosRequest<AssigneesResponseI<Record<string, unknown>>>({
            url: `${AssigneesAPI.API_ROOT_URL}/save`,
            data,
            method: 'POST'
        })
    }
}
