import ReRegisterServices from '@/_workspace/services/_Re-register/ReRegisterServices'

type ProvinceOption = { value: string; label: string }

export const fetchProvinces = async (inputValue: string): Promise<ProvinceOption[]> => {
  const response = await ReRegisterServices.getProvinces()
  const options = response.data?.Status
    ? (response.data.ResultOnDb || []).map(option => ({ label: option.label, value: String(option.value) }))
    : []
  const keyword = inputValue.trim().toLowerCase()
  return keyword ? options.filter(option => option.label.toLowerCase().includes(keyword)) : options
}
