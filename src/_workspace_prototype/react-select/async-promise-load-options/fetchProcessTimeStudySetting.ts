import type { ProcessTimeStudyInterface } from '@/_workspace/types/ProcessTimeStudy'
import ProcessTimeStudyServices from '@/_workspace/services/ProcessTimeStudyServices'
interface ProcessTimeStudySettingOption extends ProcessTimeStudyInterface {}

const fetchProcessTimeStudyCodeByProcess = (inputValue: string, processId: number) =>
  new Promise<ProcessTimeStudySettingOption[]>(resolve => {
    const param = {
      PROCESS_TIME_STUDY_SETTING_CODE: `${inputValue}`,
      PROCESS_ID: `${processId}`
    }

    ProcessTimeStudyServices.getProcessTimeStudyCodeByProcess(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
const fetchProcessTimeStudyCodeBySubProcess = (inputValue: string, processId: number, subProcessId: number) =>
  new Promise<ProcessTimeStudySettingOption[]>(resolve => {
    const param = {
      PROCESS_TIME_STUDY_SETTING_CODE: `${inputValue}`,
      PROCESS_ID: `${processId}`,
      SUB_PROCESS_ID: `${subProcessId}`
    }

    ProcessTimeStudyServices.getProcessTimeStudyCodeBySubProcess(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

const fetchProcessTimeStudyNameByProcessTimeStudySettingCode = (
  inputValue: string,
  processTimeStudySettingId: number
) =>
  new Promise<ProcessTimeStudySettingOption[]>(resolve => {
    const param = {
      PROCESS_TIME_STUDY_SETTING_NAME: `${inputValue}`,
      PROCESS_TIME_STUDY_SETTING_ID: `${processTimeStudySettingId}`
    }

    ProcessTimeStudyServices.getProcessTimeStudyNameByProcessTimeStudySettingCode(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
const fetchProcessTimeStudyNameByProcess = (inputValue: string, processId: number) =>
  new Promise<ProcessTimeStudySettingOption[]>(resolve => {
    const param = {
      PROCESS_TIME_STUDY_SETTING_NAME: `${inputValue}`,
      PROCESS_ID: `${processId}`
    }

    ProcessTimeStudyServices.getProcessTimeStudyNameByProcess(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
const fetchProcessTimeStudyNameBySubProcess = (inputValue: string, subProcessId: number) =>
  new Promise<ProcessTimeStudySettingOption[]>(resolve => {
    const param = {
      PROCESS_TIME_STUDY_SETTING_NAME: `${inputValue}`,
      SUB_PROCESS_ID: `${subProcessId}`
    }

    ProcessTimeStudyServices.getProcessTimeStudyNameBySubProcess(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

export {
  fetchProcessTimeStudyCodeByProcess,
  fetchProcessTimeStudyCodeBySubProcess,
  fetchProcessTimeStudyNameByProcessTimeStudySettingCode,
  fetchProcessTimeStudyNameByProcess,
  fetchProcessTimeStudyNameBySubProcess
}
