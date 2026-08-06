export type VendorRow = {
  VENDORS_ID?: number
  M_VENDOR_STATUS_ID?: number
  VENDOR_STATUS_CODE?: string
  VENDOR_STATUS_LABEL?: string
  INUSE?: number
  [key: string]: unknown
}

export type ReRegisterVendorContactI = {
  vendor_contact_id?: number
  contact_name: string
  position: string
  tel_phone: string
  email: string
  CREATE_BY?: string
  UPDATE_BY?: string
  CREATE_DATE?: string
  UPDATE_DATE?: string
}

export type ReRegisterVendorProductI = {
  vendor_product_id?: number
  product_group_id?: number
  group_name: string
  maker_name: string
  product_name: string
  model_list: string
  CREATE_BY?: string
  UPDATE_BY?: string
  CREATE_DATE?: string
  UPDATE_DATE?: string
}

export type ReRegisterVendorDetailI = {
  vendor_id: number
  fft_vendor_code?: string | null
  fft_status?: string | null
  vendor_status_id?: number
  vendor_status_code?: string
  vendor_status_label?: string
  reject_reason?: string | null
  company_name: string
  vendor_type_id?: number | null
  vendor_type_name: string
  vendor_region?: 'Local' | 'Oversea' | null
  province: string
  postal_code: string
  country?: string | null
  website: string
  address: string
  tel_center: string
  emailmain?: string | null
  contacts: ReRegisterVendorContactI[]
  products: ReRegisterVendorProductI[]
  CREATE_BY: string
  UPDATE_BY?: string
  CREATE_DATE?: string
  UPDATE_DATE?: string
  INUSE: number
}

export type ReRegisterApiResponseI<T> = {
  Status: boolean
  ResultOnDb: T
  TotalCountOnDb: number
  MethodOnDb: string
  Message: string
}

export type SortColumnState = {
  colId: string
  sort: 'asc' | 'desc' | null
}
