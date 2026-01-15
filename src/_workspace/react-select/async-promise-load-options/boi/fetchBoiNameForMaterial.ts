import type { BoiNameForMaterialConsumableI } from '@/_workspace/types/boi/BoiNameForMaterialConsumable'
import BoiNameForMaterialConsumableServices from '@/_workspace/services/boi/BoiNameForMaterialConsumableServices'

export interface BoiNameForMaterialConsumableOption extends BoiNameForMaterialConsumableI {}

const fetchBoiNameForMaterialConsumableByLikeBoiNameForMaterialConsumableAndInuse = (
  inputValue: string,
  inuse: number | '' = ''
) =>
  new Promise<BoiNameForMaterialConsumableOption[]>(resolve => {
    const param = {
      BOI_GROUP_NO: inputValue,
      INUSE: inuse
    }

    BoiNameForMaterialConsumableServices.getByLikeBoiGroupNoAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

const fetchBoiSearchDescriptionSubName = (
  boiDescriptionSubName: string,
  boiNameForMaterialConsumableId: number,
  boiProjectId: number
) =>
  new Promise<BoiNameForMaterialConsumableOption[]>(resolve => {
    const param = {
      BOI_DESCRIPTION_SUB_NAME: `${boiDescriptionSubName}`,
      BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID: `${boiNameForMaterialConsumableId}`,
      BOI_PROJECT_ID: `${boiProjectId}`
    }

    BoiNameForMaterialConsumableServices.fetchBoiSearchDescriptionSubName(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

const fetchBoiDescriptionMainNameByDescriptionManNameBoiGroupNoAndProjectId = (
  boiDescriptionMainName: string,
  boiGroupNo: string,
  boiProjectId: number
) =>
  new Promise<BoiNameForMaterialConsumableOption[]>(resolve => {
    const param = {
      BOI_DESCRIPTION_MAIN_NAME: `${boiDescriptionMainName}`,
      BOI_GROUP_NO: `${boiGroupNo}`,
      BOI_PROJECT_ID: `${boiProjectId}`
    }
    console.log(
      'Fetch',
      BoiNameForMaterialConsumableServices.fetchBoiDescriptionMainNameByDescriptionManNameBoiGroupNoAndProjectId(param)
    )

    BoiNameForMaterialConsumableServices.fetchBoiDescriptionMainNameByDescriptionManNameBoiGroupNoAndProjectId(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

const fetchBoiGroupNo = (boiGroupNo: string, boiProjectId: number) =>
  new Promise<BoiNameForMaterialConsumableOption[]>(resolve => {
    const param = {
      BOI_GROUP_NO: `${boiGroupNo}`,
      BOI_PROJECT_ID: `${boiProjectId}`
    }

    BoiNameForMaterialConsumableServices.fetchBoiGroupNoByBoiGroupNoAndProjectId(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

export {
  fetchBoiGroupNo,
  fetchBoiDescriptionMainNameByDescriptionManNameBoiGroupNoAndProjectId,
  fetchBoiNameForMaterialConsumableByLikeBoiNameForMaterialConsumableAndInuse,
  fetchBoiSearchDescriptionSubName
}
