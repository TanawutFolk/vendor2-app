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
        return axiosRequest<TaskManagerResponseI<any[]>>({
            url: `${TaskManagerAPI.API_ROOT_URL}/SearchAllTask`,
            data: data || {},
            method: 'POST'
        })
    }
}
