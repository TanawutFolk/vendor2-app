import ReRegisterServices from '@/_workspace/services/_Re-register/ReRegisterServices'

type VendorTypeOption = { value: number; label: string }

export const fetchVendorTypes = async (inputValue: string): Promise<VendorTypeOption[]> => {
  const response = await ReRegisterServices.getVendorTypes()
  const options = response.data?.Status
    ? (response.data.ResultOnDb || []).map(option => ({ label: option.label, value: Number(option.value) }))
    : []
  const keyword = inputValue.trim().toLowerCase()
  return keyword ? options.filter(option => option.label.toLowerCase().includes(keyword)) : options
}
