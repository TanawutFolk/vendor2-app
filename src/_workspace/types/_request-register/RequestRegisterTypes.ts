import type { AuditFields } from '@/_workspace/types/AuditFields'

export type RequestStatus = 'new' | 'in_progress' | 'pending_docs' | 'approved' | 'rejected'
export type RequestStateId = number

export interface SelectionBusinessCategoryI {
  BUSINESS_CATEGORY_ID: number
  BUSINESS_CATEGORY_NAME: string
  DESCRIPTION?: string | null
}

export interface CurrencyI {
  INFO_CURRENCY_ID: number
  CURRENCY_NAME: string
}

export interface VendorContact {
  contact_name: string
  tel_phone: string
  email: string
  position?: string
}

export interface VendorProduct {
  product_group: string
  product_main: string
  product_sub: string
  note?: string
}

export interface ApprovalStepItem extends AuditFields {
  REQUEST_APPROVAL_STEP_ID: number
  WORKFLOW_STEP_MASTER_ID?: number
  M_REQUEST_STATUS_ID?: number
  M_APPROVAL_STEP_STATUS_ID: number
  APPROVAL_GROUP_ID?: number | null
  APPROVAL_GROUP_MEMBER_ID?: number | null
  STEP_ORDER: number
  APPROVER_EMPCODE: string
  STEP_STATUS: string
  DESCRIPTION: string
  STEP_CODE?: string
  GROUP_CODE?: string
  MASTER_STATUS_VALUE?: string
  MASTER_STATUS_LABEL?: string
}

export interface ApprovalLogItem extends AuditFields {
  REQUEST_APPROVAL_LOG_ID: number
  REQUEST_APPROVAL_STEP_ID: number
  ACTION_BY: string
  ACTION_TYPE: string
  REJECT_REASON?: string | null
  RECHECK_REASON?: string | null
  DESCRIPTION: string
  CREATE_DATE: string
}

export interface RegistrationRequest extends Partial<AuditFields> {
  request_id: number
  vendor_id: number
  status: RequestStatus
  request_state_id?: RequestStateId
  request_state?: 'in_progress' | 'completed' | 'rejected' | 'cancelled'
  current_status_id?: number | null
  current_step_id?: number | null
  submitted_by: string
  submitted_date: string
  support_type?: string // For support product / process
  purchase_frequency?: string // Purchase Frequency / Year

  // Vendor profile (from _add-vendor form)
  company_name: string
  vendor_type: string
  province: string
  postal_code: string
  country?: string | null
  tel_center: string
  website?: string
  address: string
  note?: string

  // Relations
  contacts: VendorContact[]
  products: VendorProduct[]
  approval_steps: ApprovalStepItem[]
  approval_logs: ApprovalLogItem[]
}

export type SignatureSlot = {
  role: string
  code: string
  signature: string
  date: string
}

export type SelectionFormMode = 'Edit' | 'View'

export interface CriteriaSectionProps {
  mode: SelectionFormMode
  criteriaUploading: Record<number, boolean>
  criteriaDeleting: Record<number, boolean>
  criteriaError: Record<number, string>
  onUploadClick: (idx: number) => void
  onRemoveUpload: (idx: number, fileIdx: number) => void
  onDownloadUpload: (filePath?: string, fileName?: string) => void
  onPreviewUpload: (filePath?: string, fileName?: string) => void
}

export interface SalesProfitYear {
  year: string
  sales: string
  profit: string
}

export interface GprCriteria {
  id: string
  label: string
  score: number
  maxScore: number
  note?: string
}

export interface ActionRequiredStageConfig {
  label: string
  value: string
}

export interface ActionRequiredSetup {
  pic_empcode: string
  pic_name: string
  pic_email: string
  required_detail: string
}

export interface SelectionFormData {
  gpr_c_approver_name?: string
  gpr_c_approver_email?: string
  gpr_c_pc_pic_name?: string
  gpr_c_pc_pic_email?: string
  gpr_c_circular_json?: string
  business_background?: string
  registered_capital?: string
  sales_profit_json?: string
  payment_term?: string
  delivery_term?: string
  gpr_criteria_json?: string
  gpr_score?: number
  conclusion_summary?: string
  action_required_json?: string
}

export interface SelectionFormDialongProps {
  open: boolean
  rowData: any
  onClose: () => void
  onSaved?: () => void
  mode?: SelectionFormMode
}

export interface SanctionsCheckState {
  ofac: boolean
  un: boolean
  eu: boolean
  uk: boolean
  others: boolean
}

export type UseSelectionFormArgs = Pick<
  SelectionFormDialongProps,
  'open' | 'rowData' | 'onClose' | 'onSaved' | 'mode'
> & {
  accountVendorCodeOnly?: boolean
}

export interface RegisterRequestRow {
  REQUEST_REGISTER_VENDOR_ID: number
  REQUEST_STATUS: string
  M_REQUEST_STATE_ID?: RequestStateId
  COMPANY_NAME?: string
  SUPPORTPRODUCT_PROCESS?: string
  PURCHASE_FREQUENCY?: string
  FULL_NAME?: string
  EMPLOYEE_CODE?: string
  DOCUMENTS?: unknown
  DOCUMENTS_COUNT?: number
  GPR_B_FILE_PATH?: string
  GPR_B_FILE_NAME?: string
  CREATE_DATE?: string
  [key: string]: unknown
}

export interface EditRequestForm {
  supportProduct_Process: string
  purchase_frequency: string
  requester_remark: string
}

export interface ActionDialogForm {
  remark: string
}

export type WorkflowActionCode = 'APPROVE' | 'DISAGREE' | 'ACTION_REQUIRED' | 'REJECT'

export interface ActionDialogProps {
  open: boolean
  mode: 'approve' | 'reject'
  requestId: number | null
  currentTaskId: number
  lockVersion: number
  workflowTransitionId: number
  approveActionLabel: string
  rejectActionLabel: string
  onClose: () => void
  onSuccess: () => void
}

export interface DetailPanelProps {
  data: any
  onApprove: (
    actionCode: Extract<WorkflowActionCode, 'APPROVE' | 'DISAGREE' | 'ACTION_REQUIRED'>,
    approveActionLabel: string
  ) => void
  onReject: (rejectActionLabel: string, actionCode?: Extract<WorkflowActionCode, 'DISAGREE' | 'REJECT'>) => void
  onEmailSent: (data?: RegisterRequestRow) => void
  onCompleted?: () => void
}

export interface GprPdfDocumentProps {
  form: SelectionFormData
  rowData: any
  chartDataUri?: string
}
