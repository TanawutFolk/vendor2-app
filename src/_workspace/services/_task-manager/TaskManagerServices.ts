import TaskManagerAPI from '@_workspace/api/_task-manager/TaskManagerAPI'
import axiosRequest from '@/libs/axios/axiosRequest'
import { AxiosResponse } from 'axios'

export interface TaskManagerResponseI<T = any> {
    Status: boolean
    ResultOnDb: T
    TotalCountOnDb: number
    MethodOnDb: string
    Message: string
}

export default class TaskManagerServices {
    static searchAllTask(data?: Record<string, any>): Promise<AxiosResponse<TaskManagerResponseI<any[]>>> {
        const payload = data ? {
            SEARCHFILTERS: data.SearchFilters ?? data.SEARCHFILTERS,
            COLUMNFILTERS: data.ColumnFilters ?? data.COLUMNFILTERS,
            ORDER: data.Order ?? data.ORDER,
            START: data.Start ?? data.START,
            LIMIT: data.Limit ?? data.LIMIT,
            OFFSET: data.Offset ?? data.OFFSET,
            SQLWHERE: data.sqlWhere ?? data.SQLWHERE,
            SQLWHERECOLUMNFILTER: data.sqlWhereColumnFilter ?? data.SQLWHERECOLUMNFILTER
        } : {}

        return axiosRequest<TaskManagerResponseI<any[]>>({
            url: `${TaskManagerAPI.API_ROOT_URL}/SearchAllTask`,
            data: payload,
            method: 'POST'
        })
    }
}
