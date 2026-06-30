import AccRegisterAPI from '@_workspace/api/_Acc-register/AccRegisterAPI'
import axiosRequest from '@/libs/axios/axiosRequest'
import { AxiosResponse } from 'axios'
import { RegisterRequestResponseI } from '@_workspace/services/_register-request/RegisterRequestServices'

export default class AccRegisterServices {
    static completeRegistration(data: {
        request_id: number
        UPDATE_BY?: string
    }): Promise<AxiosResponse<RegisterRequestResponseI<any>>> {
        return axiosRequest<RegisterRequestResponseI<any>>({
            url: `${AccRegisterAPI.API_ROOT_URL}/completeRegistration`,
            data: {
                REQUEST_REGISTER_VENDOR_ID: data.request_id,
                UPDATE_BY: data.UPDATE_BY
            },
            method: 'POST'
        })
    }
}