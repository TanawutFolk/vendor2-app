import AccRegisterAPI from '@_workspace/api/_Acc-register/AccRegisterAPI'
import axiosRequest from '@/libs/axios/axiosRequest'
import { AxiosResponse } from 'axios'
import { RegisterRequestResponseI } from '@_workspace/services/_register-request/RegisterRequestServices'

// Pass-through transport layer (company pattern): callers build the UPPER_CASE
// DB payload; the service only owns endpoint + method.
export default class AccRegisterServices {
    static completeRegistration(data: Record<string, unknown>): Promise<AxiosResponse<RegisterRequestResponseI<any>>> {
        return axiosRequest<RegisterRequestResponseI<any>>({
            url: `${AccRegisterAPI.API_ROOT_URL}/completeRegistration`,
            data,
            method: 'POST'
        })
    }
}