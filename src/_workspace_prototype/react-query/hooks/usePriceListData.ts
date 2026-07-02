import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import PriceListServices from '@/_workspace/services/price-list/PriceListServices'

export const PREFIX_QUERY_KEY = 'PRICE_LIST'

const exportToFile = async (params: any) => {
  return await PriceListServices.exportToFile(params)
}

const useExportToFileForNew = (onSuccess, onError) => {
  return useMutation({
    mutationFn: exportToFile,
    onSuccess,
    onError
  })
}

const exportToFileNewTemplate = async (params: any) => {
  return await PriceListServices.exportToFileNewApi(params)
}

const useExportToFileForNewApi = (onSuccess, onError) => {
  return useMutation({
    mutationFn: exportToFileNewTemplate,
    onSuccess,
    onError
  })
}

// const exportToFile = async (params) => {
//   const data = PriceListServices.exportToFile(params);
//   return data;
// };

// const useExportToFile = (onSuccess, onError) => {
//   return useMutation(exportToFile, {
//     onSuccess,
//     onError,
//   });
// };

export { useExportToFileForNew, useExportToFileForNewApi }
