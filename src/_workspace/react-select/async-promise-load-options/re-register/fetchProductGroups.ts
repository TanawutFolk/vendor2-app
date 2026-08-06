import ReRegisterServices from '@/_workspace/services/_Re-register/ReRegisterServices'

type ProductGroupOption = { value: number; label: string }

export const fetchProductGroups = async (inputValue: string): Promise<ProductGroupOption[]> => {
  const response = await ReRegisterServices.getProductGroups()
  const options = response.data?.Status
    ? (response.data.ResultOnDb || []).map(option => ({ label: option.label, value: Number(option.value) }))
    : []
  const keyword = inputValue.trim().toLowerCase()
  return keyword ? options.filter(option => option.label.toLowerCase().includes(keyword)) : options
}
