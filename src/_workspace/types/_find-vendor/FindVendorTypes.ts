import type { AuditFields } from '../AuditFields'
import type { ICellRendererParams } from 'ag-grid-community'
import type { IconButtonProps } from '@mui/material/IconButton'

// Vendor result type matching API response
export interface VendorResultI extends AuditFields {
    VENDORS_ID: number
    FFT_VENDOR_CODE?: string | null
    FFT_STATUS?: string | null
    STATUS_CHECK?: string
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
    fft_vendor_code?: string | null
    fft_status?: string | null
    status_check?: string
    reject_reason?: string
    company_name: string
    vendor_type_id?: number
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

export interface UpdateVendorParamsI {
    vendorId: number
    data: any // Using any to avoid circular dependency with Schema, or redefine needed fields
    originalData: VendorComprehensiveI
    deletedContactIds: number[]
    deletedProductIds: number[]
    userCode: string
}

export type VendorActionRow = {
  VENDORS_ID?: number;
  STATUS_CHECK?: string;
  INUSE?: number;
  [key: string]: unknown;
};

export interface ActionCellRendererProps extends ICellRendererParams<VendorActionRow> {
  onEditClick?: (vendorId: number, data: VendorActionRow) => void;
  onRegisterClick?: (vendorId: number, data: VendorActionRow) => void;
  onVendorEditClick?: (vendorId: number, data: VendorActionRow) => void;
  onVendorDeleteClick?: (vendorId: number, data: VendorActionRow) => void;
  canRegister?: (data: VendorActionRow) => boolean;
  registerDisabled?: (data: VendorActionRow) => boolean;
  registerColor?: IconButtonProps['color'];
  registerTitle?: string;
  showMoreActions?: boolean;
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

export interface StatusCheckChipProps {
    value: string | undefined
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
    vendorStatusCheck: string | undefined
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
}

export interface EditVendorModalProps {
    open: boolean
    onClose: () => void
    vendorId: number | null
    rowData?: Record<string, any>
    forceRefreshOnEdit?: boolean
    onSuccess?: () => void
}

export type UseEditVendorFormArgs = {
    open: boolean
    vendorId: number | null
    rowData?: Record<string, any>
    forceRefreshOnEdit?: boolean
    initialMode?: 'view' | 'edit'
    onClose: () => void
    onSaveSuccess?: () => void
}

export type VendorDetailsModalProps = {
    open: boolean
    onClose: () => void
    data?: Record<string, any> | null
}

export type VendorContactOption = {
    VENDOR_CONTACT_ID?: number | string
    CONTACT_NAME?: string
    EMAIL?: string
    TEL_PHONE?: string
    POSITION?: string
}

export type RegisterVendorData = VendorContactOption & {
    CONTACTS?: VendorContactOption[] | string
    COMPANY_NAME?: string
    VENDOR_TYPE_NAME?: string
    VENDOR_REGION?: string
    PROVINCE?: string
    POSTAL_CODE?: string
    COUNTRY?: string
    WEBSITE?: string
    TEL_CENTER?: string
    STATUS_CHECK?: string
    ADDRESS?: string
    GROUP_NAME?: string
    MAKER_NAME?: string
    PRODUCT_NAME?: string
    MODEL_LIST?: string
}

export interface RegisterConfirmModalProps {
    open: boolean
    vendorData?: RegisterVendorData
    skipAdditionalInfo?: boolean
    contactSelectionOnly?: boolean
    onClose: () => void
    onConfirm: (formData?: { supportType: string; purchaseFreq: string; vendorContactIds: string[]; files: File[] }) => void
}
