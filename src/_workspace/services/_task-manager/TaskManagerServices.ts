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

// Pass-through transport layer (company pattern): callers build the UPPER_CASE
// DB payload; the service only owns endpoint + method.
export default class TaskManagerServices {
    static searchAllTask(data: Record<string, unknown> = {}): Promise<AxiosResponse<TaskManagerResponseI<any[]>>> {
        return axiosRequest<TaskManagerResponseI<any[]>>({
            url: `${TaskManagerAPI.API_ROOT_URL}/SearchAllTask`,
            data,
            method: 'POST'
        })
    }
}
