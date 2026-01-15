import MachineSystemRegisterAPI from '@/_workspace/api/MachineSystemApi'
import axiosRequest from '@/libs/axios/axiosRequest'

export default class MachineSystemRegisterServices {
  static SearchMachineSystemRegister(params: string) {
    return axiosRequest({
      url: `${MachineSystemRegisterAPI.API_ROOT_URL}/SearchMachineSystemRegister`,
      params: { data: params },
      method: 'GET'
    })
  }
  static InsertProcessTimeStudy(MachineSystemProperty: object) {
    return axiosRequest({
      url: `${MachineSystemRegisterAPI.API_ROOT_URL}/InsertMachineSystemRegister`,
      method: 'POST',
      data: MachineSystemProperty
    })
  }
  static UpdateMachineSystemRegister(MachineSystemProperty: object) {
    return axiosRequest({
      url: `${MachineSystemRegisterAPI.API_ROOT_URL}/UpdateMachineSystemRegister`,
      method: 'POST',
      data: MachineSystemProperty
    })
  }
  static DeleteMachineSystemRegister(MachineSystemProperty: object) {
    return axiosRequest({
      url: `${MachineSystemRegisterAPI.API_ROOT_URL}/DeleteMachineSystemRegister`,
      method: 'POST',
      data: MachineSystemProperty
    })
  }
}
