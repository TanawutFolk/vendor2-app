// Shared vendor contracts used by Find Vendor, Re-register and vendor modals.
import type { AuditFields } from '../AuditFields'
import type { ICellRendererParams } from 'ag-grid-community'
import type { IconButtonProps } from '@mui/material/IconButton'

// Vendor result type matching API response
export interface VendorResultI extends AuditFields {
  VENDORS_ID: number
  FFT_VENDOR_CODE?: string | null
  FFT_STATUS?: string | null
  M_VENDOR_STATUS_ID?: number
  VENDOR_STATUS_CODE?: string
  VENDOR_STATUS_LABEL?: string
  COMPANY_NAME: string
  MASTER_VENDOR_TYPES_ID?: number
  VENDOR_TYPE_NAME: string
  VENDOR_REGION?: 'Local' | 'Oversea' | null
  PROVINCE: string
  POSTAL_CODE: string
  COUNTRY?: string | null
  WEBSITE: string
  ADDRESS: string
  TEL_CENTER: string
  EMAILMAIN?: string | null
  GROUP_NAME: string
  MAKER_NAME: string
  PRODUCT_NAME: string
  MODEL_LIST: string
  VENDOR_CONTACTS_ID?: number
  VENDOR_PRODUCTS_ID?: number
  MASTER_PRODUCT_GROUPS_ID?: number
  CONTACT_NAME: string
  TEL_PHONE: string
  EMAIL: string
  POSITION: string
  // Contact Audit
  CONTACT_CREATE_BY?: string
  CONTACT_UPDATE_BY?: string
  CONTACT_CREATE_DATE?: string
  CONTACT_UPDATE_DATE?: string

  // Product Audit
  PRODUCT_CREATE_BY?: string
  PRODUCT_CREATE_DATE?: string
  PRODUCT_UPDATE_BY?: string
  PRODUCT_UPDATE_DATE?: string

  CONTACTS?: VendorContactI[]
  PRODUCTS?: VendorProductI[]

  [key: string]: unknown
}

// Vendor update request interface
export interface VendorUpdateRequestI {
  vendor_id: number
  company_name?: string
  vendor_type_id?: number | null
  province?: string
  postal_code?: string
  country?: string | null
  website?: string
  address?: string
  tel_center?: string
  group_name?: string
  maker_name?: string
  product_name?: string
  model_list?: string
  vendor_contact_id?: number

  vendor_product_id?: number | null
  product_group_id?: number | null
  contact_name?: string
  tel_phone?: string
  email?: string
  position?: string
  UPDATE_BY?: string
  INUSE?: number
}

// Search filter item interface
export interface SearchFilterItemI {
  id: string
  value: string | number | null
}

// Order item interface
export interface OrderItemI {
  id: string
  desc: boolean
}

// Search request interface (new format with SearchFilters array)
export interface FindVendorSearchRequestI {
  SearchFilters: SearchFilterItemI[]
  ColumnFilters?: any[]
  Limit: number
  Order: OrderItemI[]
  Start: number
}

// API Response interface
export interface FindVendorApiResponseI<T> {
  Status: boolean
  ResultOnDb: T
  TotalCountOnDb: number
  MethodOnDb: string
  Message: string
}
// Dropdown item interface
export interface DropdownItemI {
  value: number | string
  label: string
}

// Dropdown Response interface
export interface DropdownResponseI {
  Status: boolean
  ResultOnDb: DropdownItemI[]
  TotalCountOnDb: number
  MethodOnDb: string
  Message: string
}

// Contact information interface
export interface VendorContactI extends Partial<AuditFields> {
  vendor_contact_id?: number
  contact_name: string
  position: string
  tel_phone: string
  email: string
}

// Product information interface
export interface VendorProductI extends Partial<AuditFields> {
  vendor_product_id?: number
  product_group_id?: number
  group_name: string
  maker_name: string
  product_name: string
  model_list: string
}

// Comprehensive vendor data interface
export interface VendorComprehensiveI extends AuditFields {
  vendor_id: number
  vendor_status_id?: number
  fft_vendor_code?: string | null
  fft_status?: string | null
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
  COUNTRY?: string | null
  website: string
  address: string
  tel_center: string
  emailmain?: string | null
  contacts: VendorContactI[]
  products: VendorProductI[]
}

export type VendorDropdownRequest = () => Promise<{
  data: FindVendorApiResponseI<DropdownItemI[]>
}>

export type VendorUpdateRequest = (
  data: Record<string, unknown>
) => Promise<{ data: FindVendorApiResponseI<unknown> }>

export interface UpdateVendorParamsI {
  vendorId: number
  data: any // Using any to avoid circular dependency with Schema, or redefine needed fields
  originalData: VendorComprehensiveI
  deletedContactIds: number[]
  deletedProductIds: number[]
  userCode: string
  updateRequest: VendorUpdateRequest
}

export type VendorActionRow = {
  VENDORS_ID?: number
  M_VENDOR_STATUS_ID?: number
  VENDOR_STATUS_CODE?: string
  VENDOR_STATUS_LABEL?: string
  INUSE?: number
  [key: string]: unknown
}

export interface ActionCellRendererProps extends ICellRendererParams<VendorActionRow> {
  vendorStatusIds?: import('@/_workspace/utils/vendorStatusIdentity').VendorStatusMasterIds
  onEditClick?: (vendorId: number, data: VendorActionRow) => void
  onRegisterClick?: (vendorId: number, data: VendorActionRow) => void
  onVendorEditClick?: (vendorId: number, data: VendorActionRow) => void
  onVendorDeleteClick?: (vendorId: number, data: VendorActionRow) => void
  canRegister?: (data: VendorActionRow) => boolean
  registerDisabled?: (data: VendorActionRow) => boolean
  /** Restrict which vendors can be edited. Defaults to all of them. */
  canEdit?: (data: VendorActionRow) => boolean
  /** Tooltip/toast shown when canEdit returns false. */
  editDisabledReason?: string
  registerColor?: IconButtonProps['color']
  registerTitle?: string
  showMoreActions?: boolean
}

export interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
  loading?: boolean
}

export interface EmailActionButtonsProps {
  email: string
  contactName: string
}

export interface FftStatusChipProps {
  value: number | string | undefined
  variant?: 'filled' | 'tonal'
}

export interface VendorStatusChipProps {
  value: string | number | undefined
  label?: string
  variant?: 'filled' | 'tonal'
}

export type ContactsSectionProps = {
  editingMode: 'view' | 'edit'
  contactFields: any[]
  removeContact: (index: number) => void
  appendContact: (value: any) => void
}

export type ProductsSectionProps = {
  editingMode: 'view' | 'edit'
  productFields: any[]
  removeProduct: (index: number) => void
  appendProduct: (value: any) => void
  productGroupRefreshKey: number
  onOpenAddProductGroup: () => void
  fetchProductGroups: (inputValue: string) => Promise<DropdownItemI[]>
}

export type SectionHeaderProps = {
  icon: string
  title: string
}

export interface VendorModalFooterActionsProps {
  editingMode: 'view' | 'edit'
  loading: boolean
  saving: boolean
  onSaveClick: () => void
  onClose: () => void
}

export type VendorModalHeaderBarProps = {
  control: any // Use any to avoid circular imports of Control
  originalData: VendorComprehensiveI | null
  vendorFftCode: string | null | undefined
  vendorStatusLabel: string | undefined
  editingMode: 'view' | 'edit'
  loading: boolean
  onToggleEditMode: () => void
  hideModeButton?: boolean
  hideVendorCode?: boolean
}

export type VendorProfileSectionProps = {
  editingMode: 'view' | 'edit'
  originalData: VendorComprehensiveI | null
  fetchVendorTypes: (inputValue: string) => Promise<any[]>
  fetchCountries: (inputValue: string) => Promise<Array<{ value: string; label: string }>>
}

export interface EditVendorModalProps {
  open: boolean
  onClose: () => void
  vendorId: number | null
  rowData?: VendorComprehensiveI | null
  loading?: boolean
  errorMessage?: string
  updateRequest: VendorUpdateRequest
  vendorTypesRequest: VendorDropdownRequest
  countriesRequest: VendorDropdownRequest
  productGroupsRequest: VendorDropdownRequest
  onSuccess?: () => void
}

export type UseEditVendorFormArgs = {
  open: boolean
  vendorId: number | null
  rowData?: VendorComprehensiveI | null
  updateRequest: VendorUpdateRequest
  initialMode?: 'view' | 'edit'
  onClose: () => void
  onSaveSuccess?: () => void
}

export type VendorDetailsModalProps = {
  open: boolean
  onClose: () => void
  data?: VendorComprehensiveI | null
  loading?: boolean
  errorMessage?: string
}

export type VendorContactOption = VendorContactI

export type RegisterVendorData = VendorComprehensiveI

export interface RegisterConfirmModalProps {
  open: boolean
  vendorData?: RegisterVendorData
  loading?: boolean
  errorMessage?: string
  skipAdditionalInfo?: boolean
  contactSelectionOnly?: boolean
  requestType?: 'REGISTER' | 'RE_REGISTER'
  onClose: () => void
  onSuccess: (data: {
    Message?: string
    ResultOnDb?: { REQUEST_NUMBER?: string; REQUESTS_AHEAD?: number }
  }) => void
}
