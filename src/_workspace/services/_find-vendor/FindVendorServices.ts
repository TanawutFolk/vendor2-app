import FindVendorAPI from '@_workspace/api/_find-vendor/FindVendorAPI'
import axiosRequest from '@/libs/axios/axiosRequest'
import { AxiosResponse } from 'axios'
import type {
    FindVendorSearchRequestI,
    FindVendorApiResponseI,
    VendorResultI
} from '@_workspace/types/_find-vendor/FindVendorTypes'

export default class FindVendorServices {
    // Search vendors
    static search(params: FindVendorSearchRequestI): Promise<AxiosResponse<FindVendorApiResponseI<VendorResultI[]>>> {
        return axiosRequest<FindVendorApiResponseI<VendorResultI[]>>({
            url: `${FindVendorAPI.API_ROOT_URL}/search`,
            data: params,
            method: 'POST'
        })
    }
}
