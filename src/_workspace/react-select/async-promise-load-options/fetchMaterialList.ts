import MaterialListServices from '@/_workspace/services/environment-certificate/MaterialListServices'
import { ReturnApiSearchMaterialListI } from '@/app/[lang]/(_workspace)/environment-certification/material-list/MaterialListTableData'

import { Dispatch, SetStateAction } from 'react'

// const fetchMaterialListExcelFile = (
//   param: ReturnApiSearchMaterialListI,
//   setIsLoading: Dispatch<SetStateAction<boolean>>
// ) => {
//   return new Promise<Blob | null>(resolve => {
//     MaterialListServices.searchExport(param)
//       .then(responseJson => {
//         setIsLoading(false)
//         resolve(responseJson.data)
//       })
//       .catch(error => {
//         setIsLoading(false)
//         console.log(error)
//         resolve(null)
//       })
//   })
// }

const fetchMaterialListExcelFile = async (
  param: ReturnApiSearchMaterialListI,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) => {
  try {
    setIsLoading(true)
    const responseJson = await MaterialListServices.searchExport(param)
    setIsLoading(false)
    return responseJson.data
  } catch (error) {
    setIsLoading(false)
    console.error('Error fetching material list:', error)
    return null
  }
}

export { fetchMaterialListExcelFile }

// background-color: var(--mui-palette-primary-main);
