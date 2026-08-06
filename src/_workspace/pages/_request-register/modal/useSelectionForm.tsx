import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { pdf } from '@react-pdf/renderer'
import ApexCharts from 'apexcharts'
import { GprPdfDocument } from './GprPdfDocument'
import RegisterRequestServices from '@/_workspace/services/_register-request/RegisterRequestServices'
import AddVendorServices from '@/_workspace/services/_add-vendor/AddVendorServices'
import type { BlacklistMatchI } from '@/_workspace/types/_add-vendor/AddVendorTypes'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import type {
  SelectionFormDialongProps,
  SelectionFormMode,
  UseSelectionFormArgs
} from '@/_workspace/types/_request-register/RequestRegisterTypes'
import {
  useAddDocumentMutation,
  useDeleteSelectionDocumentMutation,
  useSaveAccountVendorCodeMutation,
  useSaveSelectionFormMutation
} from '@/_workspace/react-query/hooks/useRegisterRequest'
import { isVendorCodeComplete } from '@/_workspace/utils/requestWorkflow'
import useWorkflowIdentity from '@/_workspace/hooks/useWorkflowIdentity'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SalesProfitYear {
  year: string
  total_revenue: string
  net_profit: string
}

export interface GprCriteria {
  no: string
  detail: string
  criteria: 'Need' | 'Optional'
  remark: string
  files: GprCriteriaFile[]
}

export interface GprCriteriaFile {
  criteria_file_id?: number
  file_order: number
  file_path: string
  file_name: string
  file_size?: number | null
  file_type?: string | null
  pending_key?: string
}

export interface ActionRequiredStageConfig {
  pic_name: string
  pic_email: string
  result_status: 'pending' | 'completed' | ''
  result_note: string
  result_updated_at: string
}

export interface ActionRequiredSetup {
  engineer: ActionRequiredStageConfig
  emr: ActionRequiredStageConfig
  qms: ActionRequiredStageConfig
  pm_manager: ActionRequiredStageConfig
}

export interface SelectionFormData {
  company_name: string
  pic_name: string
  tel: string
  email: string
  sanctions: 'non-concerned' | 'concerned' | ''
  address: string
  business_category: string
  start_year: string
  authorized_capital: string
  establish: string
  number_of_employees: string
  manufactured_country: string
  main_product: string
  sales_profit: SalesProfitYear[]
  vendor_original_country: string
  currency: string
  criteria: GprCriteria[]
  suggestion: string
  result: 'approval' | 'disapproval' | ''
  path: string
  gpr_c_approver_name: string
  gpr_c_approver_email: string
  gpr_c_pc_pic_name: string
  gpr_c_pc_pic_email: string
  gpr_c_circular_list: string[]
  action_required_setup: ActionRequiredSetup
  gpr_43_acceptance_status: 'ACCEPT' | 'NOT_ACCEPT' | ''
  vendor_code_selector: string
  completion_date: string
}

export type { SelectionFormDialongProps, SelectionFormMode }

export interface SanctionsCheckState {
  checkedAt: string
  matches: BlacklistMatchI[]
  message: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const THIS_YEAR = new Date().getFullYear()

export const DEFAULT_SALES_PROFIT: SalesProfitYear[] = Array.from({ length: 5 }, (_, i) => ({
  year: String(THIS_YEAR - 4 + i),
  total_revenue: '',
  net_profit: ''
}))

export const CRITERIA_MASTER: Pick<GprCriteria, 'no' | 'detail' | 'criteria'>[] = [
  { no: '4.1', detail: 'Compliant of the law', criteria: 'Need' },
  { no: '4.2', detail: 'Anti-Bribery Policy Communication', criteria: 'Need' },
  { no: '4.3', detail: 'General Purchase Specification Requirement', criteria: 'Need' },
  { no: '4.4', detail: 'Manufacture location survey', criteria: 'Need' },
  { no: '4.5', detail: 'Company Environmental and Energy Policy', criteria: 'Need' },
  { no: '4.6', detail: 'Quality Management Certification', criteria: 'Optional' },
  { no: '4.7', detail: 'Environmental Certification such as RoHS, REACH, etc.', criteria: 'Optional' },
  { no: '4.8', detail: 'Environmental Management Certification', criteria: 'Optional' },
  { no: '4.9', detail: 'History reliability', criteria: 'Optional' },
  { no: '4.10', detail: 'Reliable performance', criteria: 'Optional' },
  { no: '4.11', detail: 'Advised by Customer, Parent Company or Manager up', criteria: 'Optional' },
  { no: '4.12', detail: 'Low Price', criteria: 'Optional' },
  { no: '4.13', detail: 'Document to request for Automatic Account Transfer', criteria: 'Optional' },
  { no: '4.14', detail: 'Other', criteria: 'Optional' }
]

export const PENDING_UPLOAD_PREFIX = '__pending__/'
export const MAX_CRITERIA_FILES = 3

const normalizeGpr43AcceptanceStatus = (value: unknown): 'ACCEPT' | 'NOT_ACCEPT' | '' => {
  const normalized = String(value || '')
    .trim()
    .replace(/[_-]+/g, ' ')
    .toUpperCase()
  if (['ACCEPT', 'ACCEPTED', 'AGREE', 'AGREED'].includes(normalized)) return 'ACCEPT'
  if (['NOT ACCEPT', 'NOT ACCEPTED', 'DISAGREE', 'DISAGREED', 'REJECT', 'REJECTED'].includes(normalized))
    return 'NOT_ACCEPT'
  return ''
}

const normalizeSanctionsStatus = (value: unknown): 'non-concerned' | 'concerned' | '' => {
  const normalized = String(value || '')
    .trim()
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
  if (['non concerned', 'nonconcerned', 'not concerned', 'not concern', 'no concern'].includes(normalized))
    return 'non-concerned'
  if (['concerned', 'concern'].includes(normalized)) return 'concerned'
  return ''
}

// Convert any saved date (e.g. ISO "2026-07-05T17:00:00.000Z" from the DB) to
// the local-timezone "YYYY-MM-DD" value required by <input type="date">.
const toDateInputValue = (value: unknown): string => {
  const raw = String(value ?? '').trim()
  if (!raw) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return ''
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')
  return `${parsed.getFullYear()}-${month}-${day}`
}

const gpr43StatusToRemark = (status: unknown) => {
  const normalized = normalizeGpr43AcceptanceStatus(status)
  if (normalized === 'ACCEPT') return 'Accept'
  if (normalized === 'NOT_ACCEPT') return 'Not Accept'
  return ''
}

const createActionRequiredStage = (): ActionRequiredStageConfig => ({
  pic_name: '',
  pic_email: '',
  result_status: '',
  result_note: '',
  result_updated_at: ''
})

export const buildDefaultActionRequiredSetup = (saved?: Partial<ActionRequiredSetup>): ActionRequiredSetup => ({
  engineer: { ...createActionRequiredStage(), ...(saved?.engineer || {}) },
  emr: { ...createActionRequiredStage(), ...(saved?.emr || {}) },
  qms: { ...createActionRequiredStage(), ...(saved?.qms || {}) },
  pm_manager: { ...createActionRequiredStage(), ...(saved?.pm_manager || {}) }
})

// ── Helper Functions ──────────────────────────────────────────────────────────

export const buildDefaultCriteria = (existing?: GprCriteria[]): GprCriteria[] =>
  CRITERIA_MASTER.map(master => {
    const found = existing?.find(item => item.no === master.no)

    return {
      ...master,
      remark: found?.remark || '',
      files: [...(found?.files || [])].sort((a, b) => a.file_order - b.file_order)
    }
  })

const parseCriteriaFiles = (item: any): GprCriteriaFile[] => {
  let rawFiles = item?.FILES ?? item?.files ?? []

  if (typeof rawFiles === 'string') {
    try {
      rawFiles = JSON.parse(rawFiles)
    } catch {
      rawFiles = []
    }
  }

  const files = (Array.isArray(rawFiles) ? rawFiles : [])
    .map((file: any, index: number) => ({
      criteria_file_id:
        Number(file?.CRITERIA_FILE_ID ?? file?.VENDOR_SELECTION_CRITERIA_FILE_ID ?? file?.criteria_file_id ?? 0) ||
        undefined,
      file_order: Number(file?.FILE_ORDER ?? file?.file_order ?? index + 1) || index + 1,
      file_path: String(file?.FILE_PATH ?? file?.file_path ?? ''),
      file_name: String(file?.FILE_NAME ?? file?.file_name ?? ''),
      file_size: Number(file?.FILE_SIZE ?? file?.file_size ?? 0) || null,
      file_type: String(file?.FILE_TYPE ?? file?.file_type ?? '') || null
    }))
    .filter(file => file.file_path)

  if (!files.length) {
    const legacyPath = String(item?.UPLOADED_FILE ?? item?.UPLOADED_FILE_PATH ?? item?.uploaded_file ?? '')
    const legacyName = String(item?.UPLOADED_NAME ?? item?.UPLOADED_FILE_NAME ?? item?.uploaded_name ?? '')
    if (legacyPath) {
      files.push({
        criteria_file_id: undefined,
        file_order: 1,
        file_path: legacyPath,
        file_name: legacyName,
        file_size: null,
        file_type: null
      })
    }
  }

  return files.sort((a, b) => a.file_order - b.file_order).slice(0, MAX_CRITERIA_FILES)
}

export const normalizeSavedSelectionForm = (raw: any): Partial<SelectionFormData> | undefined => {
  if (!raw) return undefined

  const source = Array.isArray(raw) ? raw[0] : raw
  if (!source || typeof source !== 'object') return undefined

  const getSourceValue = (...keys: string[]) => {
    for (const key of keys) {
      const value = source[key]
      if (value !== undefined && value !== null) return value
    }
    return undefined
  }

  const salesProfitRaw = Array.isArray(getSourceValue('SALES_PROFIT')) ? getSourceValue('SALES_PROFIT') : []
  const sales_profit = (salesProfitRaw as any[]).map(item => ({
    year: String(item?.YEAR ?? ''),
    total_revenue: String(item?.TOTAL_REVENUE ?? ''),
    net_profit: String(item?.NET_PROFIT ?? '')
  }))

  const criteriaRaw = Array.isArray(getSourceValue('CRITERIA')) ? getSourceValue('CRITERIA') : []
  const criteria = (criteriaRaw as any[]).map(item => ({
    no: String(item?.NO ?? ''),
    detail: String(item?.DETAIL ?? ''),
    criteria: (item?.CRITERIA ?? item?.CRITERIA_VALUE ?? '') as 'Need' | 'Optional',
    remark: String(item?.REMARK ?? ''),
    files: parseCriteriaFiles(item)
  }))

  return {
    company_name: getSourceValue('COMPANY_NAME') as string | undefined,
    pic_name: getSourceValue('PIC_NAME') as string | undefined,
    tel: getSourceValue('TEL') as string | undefined,
    email: getSourceValue('EMAIL') as string | undefined,
    address: getSourceValue('ADDRESS') as string | undefined,
    business_category: getSourceValue('BUSINESS_CATEGORY') as string | undefined,
    start_year: getSourceValue('START_YEAR') as string | undefined,
    authorized_capital: getSourceValue('AUTHORIZED_CAPITAL') as string | undefined,
    establish: getSourceValue('ESTABLISH', 'ESTABLISH_YEARS') as string | undefined,
    number_of_employees: getSourceValue('NUMBER_OF_EMPLOYEES') as string | undefined,
    manufactured_country: getSourceValue('MANUFACTURED_COUNTRY') as string | undefined,
    vendor_original_country: getSourceValue('VENDOR_ORIGINAL_COUNTRY') as string | undefined,
    sanctions: normalizeSanctionsStatus(getSourceValue('SANCTIONS', 'SANCTIONS_STATUS')),
    currency: getSourceValue('CURRENCY') as string | undefined,
    suggestion: getSourceValue('SUGGESTION') as string | undefined,
    result: getSourceValue('RESULT', 'RESULT_STATUS') as 'approval' | 'disapproval' | '' | undefined,
    path: getSourceValue('PATH', 'DOCUMENT_PATH') as string | undefined,
    gpr_c_approver_name: getSourceValue('GPR_C_APPROVER_NAME') as string | undefined,
    gpr_c_approver_email: getSourceValue('GPR_C_APPROVER_EMAIL') as string | undefined,
    gpr_c_pc_pic_name: getSourceValue('GPR_C_PC_PIC_NAME') as string | undefined,
    gpr_c_pc_pic_email: getSourceValue('GPR_C_PC_PIC_EMAIL') as string | undefined,
    gpr_c_circular_list: (() => {
      try {
        const circularJson = getSourceValue('GPR_C_CIRCULAR_JSON', 'GPR_C_CIRCULAR_MEMBERS')
        const parsed = typeof circularJson === 'string' ? JSON.parse(circularJson) : circularJson
        if (!Array.isArray(parsed)) return []
        return parsed.map((item: any) => String(item?.email || item || '').trim()).filter(Boolean)
      } catch {
        return []
      }
    })(),
    action_required_setup: (() => {
      try {
        const actionRequiredJson = getSourceValue('ACTION_REQUIRED_JSON')
        const parsed = typeof actionRequiredJson === 'string' ? JSON.parse(actionRequiredJson) : actionRequiredJson
        return buildDefaultActionRequiredSetup(parsed || {})
      } catch {
        return buildDefaultActionRequiredSetup()
      }
    })(),
    gpr_43_acceptance_status: normalizeGpr43AcceptanceStatus(getSourceValue('GPR_43_ACCEPTANCE_STATUS')),
    vendor_code_selector: getSourceValue('VENDOR_CODE_SELECTOR') as string | undefined,
    completion_date: toDateInputValue(getSourceValue('COMPLETION_DATE')),
    sales_profit,
    criteria
  }
}

export const buildDefault = (rowData: any, saved?: Partial<SelectionFormData>): SelectionFormData => {
  const products = (() => {
    try {
      return typeof rowData?.PRODUCTS === 'string' ? JSON.parse(rowData.PRODUCTS) : rowData?.PRODUCTS || []
    } catch {
      return []
    }
  })()

  const contacts = (() => {
    try {
      return typeof rowData?.CONTACTS === 'string' ? JSON.parse(rowData.CONTACTS) : rowData?.CONTACTS || []
    } catch {
      return []
    }
  })().filter(Boolean)

  const firstContact = contacts[0] || {}
  const mainProduct = products
    .map((item: any) => item.PRODUCT_NAME || item.MAKER_NAME)
    .filter(Boolean)
    .join(', ')

  const savedGpr43Status =
    saved?.gpr_43_acceptance_status || normalizeGpr43AcceptanceStatus(rowData?.GPR_43_ACCEPTANCE_STATUS)
  const criteria = buildDefaultCriteria(saved?.criteria)
  const gpr43Criterion = criteria.find(item => item.no === '4.3')
  if (gpr43Criterion && !gpr43Criterion.remark) {
    gpr43Criterion.remark = gpr43StatusToRemark(savedGpr43Status)
  }

  return {
    company_name: saved?.company_name ?? (rowData?.COMPANY_NAME || ''),
    pic_name: saved?.pic_name ?? (firstContact.CONTACT_NAME || ''),
    tel: saved?.tel ?? (firstContact.TEL_PHONE || ''),
    email: saved?.email ?? (firstContact.EMAIL || ''),
    sanctions: saved?.sanctions || '',
    address: saved?.address ?? (rowData?.ADDRESS || ''),
    business_category: saved?.business_category || '',
    start_year: saved?.start_year || '',
    authorized_capital: saved?.authorized_capital || '',
    establish: saved?.establish || '',
    number_of_employees: saved?.number_of_employees || '',
    manufactured_country: saved?.manufactured_country || '',
    main_product: saved?.main_product ?? mainProduct,
    sales_profit: saved?.sales_profit || DEFAULT_SALES_PROFIT,
    vendor_original_country: saved?.vendor_original_country || '',
    currency: saved?.currency ?? 'THB',
    criteria,
    suggestion: saved?.suggestion || '',
    result: saved?.result || '',
    path: saved?.path || '',
    gpr_c_approver_name: saved?.gpr_c_approver_name || '',
    gpr_c_approver_email: saved?.gpr_c_approver_email || '',
    gpr_c_pc_pic_name: saved?.gpr_c_pc_pic_name || '',
    gpr_c_pc_pic_email: saved?.gpr_c_pc_pic_email || '',
    gpr_c_circular_list: Array.from({ length: 6 }, (_, index) => saved?.gpr_c_circular_list?.[index] || ''),
    action_required_setup: buildDefaultActionRequiredSetup(saved?.action_required_setup),
    gpr_43_acceptance_status: savedGpr43Status,
    vendor_code_selector: saved?.vendor_code_selector || rowData?.VENDOR_CODE || '',
    completion_date: toDateInputValue(saved?.completion_date)
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

const buildSelectionSheetPdfFileName = (requestNumber: unknown, requestId: unknown) => {
  const requestKey = String(requestNumber || requestId || 'REQUEST')
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
  return `Supplier - Outsourcing Selection Sheet_${requestKey}.pdf`
}

export const useSelectionForm = ({
  open,
  rowData,
  onClose,
  onSaved,
  mode = 'Edit',
  accountVendorCodeOnly = false
}: UseSelectionFormArgs) => {
  const isViewMode = mode === 'View'
  const user = getUserData()
  const { workflowStepIds, approvalStepStatusIds } = useWorkflowIdentity()
  const methods = useForm<SelectionFormData>({ defaultValues: buildDefault(rowData) })
  const { reset, getValues, setValue } = methods
  const saveSelectionMutation = useSaveSelectionFormMutation()
  const saveAccountVendorCodeMutation = useSaveAccountVendorCodeMutation()
  const addDocumentMutation = useAddDocumentMutation()
  const deleteSelectionDocumentMutation = useDeleteSelectionDocumentMutation()

  const resolvedRequestId = rowData?.REQUEST_REGISTER_VENDOR_ID
  const resolvedRequestNumber = rowData?.REQUEST_NUMBER

  const [initializing, setInitializing] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [sanctionsChecking, setSanctionsChecking] = useState(false)
  const [sanctionsCheck, setSanctionsCheck] = useState<SanctionsCheckState | null>(null)
  const [criteriaUploading, setCriteriaUploading] = useState<Record<number, boolean>>({})
  const [criteriaDeleting, setCriteriaDeleting] = useState<Record<number, boolean>>({})
  const [criteriaError, setCriteriaError] = useState<Record<number, string>>({})
  const [pendingCriteriaFiles, setPendingCriteriaFiles] = useState<Record<string, File>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadTargetRef = useRef<number>(-1)
  const latestRowDataRef = useRef(rowData)
  const isViewModeRef = useRef(isViewMode)

  useEffect(() => {
    latestRowDataRef.current = rowData
  }, [rowData])

  useEffect(() => {
    isViewModeRef.current = isViewMode
  }, [isViewMode])

  const checkSanctions = useCallback(
    async (companyName?: string) => {
      const name = String(companyName ?? getValues('company_name') ?? '').trim()

      if (!name) {
        setValue('sanctions', '', { shouldDirty: true })
        setSanctionsCheck({
          checkedAt: new Date().toISOString(),
          matches: [],
          message: 'Company name is required before blacklist checking.'
        })
        return false
      }

      setSanctionsChecking(true)

      try {
        const response = await AddVendorServices.checkBlacklist({
          COMPANY_NAME: name
        })
        const result = response.data
        const matches = result.blacklistMatches || []
        const isConcerned = Boolean(result.isBlacklisted && matches.length)

        setValue('sanctions', isConcerned ? 'concerned' : 'non-concerned', { shouldDirty: true })
        setSanctionsCheck({
          checkedAt: new Date().toISOString(),
          matches,
          message: isConcerned
            ? result.Message || `Vendor name matches ${matches.length} record(s) in the Blacklist`
            : 'No blacklist match found.'
        })
        return true
      } catch (error: any) {
        setSanctionsCheck({
          checkedAt: new Date().toISOString(),
          matches: [],
          message: error?.response?.data?.Message || error?.message || 'Failed to check blacklist.'
        })
        return false
      } finally {
        setSanctionsChecking(false)
      }
    },
    [getValues, setValue]
  )

  useEffect(() => {
    if (!open) {
      setInitializing(true)
      return
    }

    if (!resolvedRequestId) {
      setInitializing(false)
      return
    }

    let active = true
    setInitializing(true)
    setCriteriaError({})
    setSanctionsCheck(null)
    setPendingCriteriaFiles({})

    const loadForm = async () => {
      try {
        const response = await RegisterRequestServices.getSelectionForm({
          REQUEST_REGISTER_VENDOR_ID: resolvedRequestId
        })
        if (!active) return

        const currentRowData = latestRowDataRef.current
        const saved =
          response.data.Status && response.data.ResultOnDb
            ? normalizeSavedSelectionForm(response.data.ResultOnDb)
            : undefined
        const defaults = buildDefault(currentRowData, saved)

        if (response.data.Status && response.data.ResultOnDb) {
          reset(defaults)
        } else {
          reset(defaults)
        }

        if (saved?.sanctions) {
          setSanctionsCheck({
            checkedAt: new Date().toISOString(),
            matches: saved.sanctions === 'concerned' ? [{ name: 'Blacklisted' } as any] : [],
            message: 'Loaded from saved selection sheet.'
          })
        }

        if (!isViewModeRef.current && !accountVendorCodeOnly && !saved?.sanctions) {
          await checkSanctions(defaults.company_name)
        }
      } catch {
        if (active) reset(buildDefault(latestRowDataRef.current))
      } finally {
        if (active) setInitializing(false)
      }
    }

    loadForm()

    return () => {
      active = false
    }
  }, [accountVendorCodeOnly, checkSanctions, open, reset, resolvedRequestId])

  const handleCriteriaUploadClick = useCallback(
    (index: number) => {
      if (isViewMode) return
      uploadTargetRef.current = index
      fileInputRef.current?.click()
    },
    [isViewMode]
  )

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      if (isViewMode) {
        event.target.value = ''
        return
      }

      const selectedFiles = Array.from(event.target.files || [])
      if (!selectedFiles.length) return

      const index = uploadTargetRef.current
      if (index < 0) return

      event.target.value = ''
      const currentRow = getValues(`criteria.${index}` as any) as GprCriteria | undefined
      const currentFiles = Array.isArray(currentRow?.files) ? currentRow.files : []

      if (currentFiles.length + selectedFiles.length > MAX_CRITERIA_FILES) {
        setCriteriaError(prev => ({
          ...prev,
          [index]: `Each criterion supports up to ${MAX_CRITERIA_FILES} files. You can select ${MAX_CRITERIA_FILES - currentFiles.length} more.`
        }))
        return
      }

      const additions = selectedFiles.map((file, fileIndex): GprCriteriaFile => {
        const pendingKey = `${Date.now()}-${index}-${fileIndex}-${Math.random().toString(36).slice(2)}`
        setPendingCriteriaFiles(prev => ({ ...prev, [pendingKey]: file }))

        return {
          file_order: currentFiles.length + fileIndex + 1,
          file_path: `${PENDING_UPLOAD_PREFIX}${pendingKey}`,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type || null,
          pending_key: pendingKey
        }
      })

      setCriteriaError(prev => ({ ...prev, [index]: '' }))
      setValue(`criteria.${index}.files` as any, [...currentFiles, ...additions], { shouldDirty: true })
    },
    [getValues, isViewMode, setValue]
  )

  const removeCriteriaUpload = useCallback(
    async (index: number, fileIndex: number) => {
      if (isViewMode) {
        ToastMessageError({
          title: 'Delete File',
          message: 'Selection Sheet can only be edited during PO PIC In Progress or PO & SCM Check All Document.'
        })
        return
      }

      const currentRow = getValues(`criteria.${index}` as any) as GprCriteria | undefined
      const currentFiles = Array.isArray(currentRow?.files) ? currentRow.files : []
      const currentFile = currentFiles[fileIndex]
      const requestId = Number(resolvedRequestId) || 0

      if (!currentFile) return

      const removeLocalCriteriaFile = () => {
        if (currentFile.pending_key) {
          setPendingCriteriaFiles(prev => {
            const next = { ...prev }
            delete next[currentFile.pending_key!]
            return next
          })
        }
        setValue(
          `criteria.${index}.files` as any,
          currentFiles.filter((_, idx) => idx !== fileIndex),
          { shouldDirty: true }
        )
        setCriteriaError(prev => ({ ...prev, [index]: '' }))
      }

      if (currentFile.pending_key || currentFile.file_path.startsWith(PENDING_UPLOAD_PREFIX)) {
        removeLocalCriteriaFile()
        return
      }

      if (!requestId || !currentFile.criteria_file_id) {
        ToastMessageError({
          title: 'Delete File',
          message: 'Cannot delete this file because its database ID is missing.'
        })
        return
      }

      setCriteriaDeleting(prev => ({ ...prev, [index]: true }))

      try {
        const result = await deleteSelectionDocumentMutation.mutateAsync({
          REQUEST_REGISTER_VENDOR_ID: requestId,
          CRITERIA_FILE_ID: currentFile.criteria_file_id,
          REQUEST_NUMBER: String(resolvedRequestNumber || ''),
          UPDATE_BY: user?.EMPLOYEE_CODE || 'SYSTEM'
        })

        removeLocalCriteriaFile()
        ToastMessageSuccess({
          title: 'Delete File',
          message: result.Message || 'File deleted successfully.'
        })
        onSaved?.()
      } catch (error: any) {
        ToastMessageError({
          title: 'Delete File',
          message: error?.response?.data?.Message || error?.message || 'Failed to delete file'
        })
      } finally {
        setCriteriaDeleting(prev => ({ ...prev, [index]: false }))
      }
    },
    [
      deleteSelectionDocumentMutation,
      getValues,
      onSaved,
      isViewMode,
      resolvedRequestId,
      resolvedRequestNumber,
      setValue,
      user?.EMPLOYEE_CODE
    ]
  )

  const downloadCriteriaFile = useCallback(
    async (filePath?: string, fileName?: string) => {
      const normalizedFilePath = String(filePath || '').trim()
      const normalizedFileName = String(fileName || '').trim()

      if (!normalizedFilePath) {
        ToastMessageError({ title: 'Download File', message: 'File path is missing.' })
        return
      }

      if (normalizedFilePath.startsWith(PENDING_UPLOAD_PREFIX)) {
        ToastMessageError({
          title: 'Download File',
          message: 'Please save the selection sheet before downloading this file.'
        })
        return
      }

      try {
        const response = await RegisterRequestServices.downloadSelectionDocument({
          FILE_PATH: normalizedFilePath,
          FILE_NAME: normalizedFileName,
          REQUEST_NUMBER: String(resolvedRequestNumber || '')
        })

        const blob = response.data
        const downloadName = normalizedFileName || normalizedFilePath.split(/[/\\]/).pop() || 'selection-document'
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = downloadName
        anchor.click()
        URL.revokeObjectURL(url)
      } catch (error: any) {
        ToastMessageError({
          title: 'Download File',
          message: error?.response?.data?.Message || error?.message || 'Failed to download file'
        })
      }
    },
    [resolvedRequestNumber]
  )

  const uploadPendingCriteriaFiles = useCallback(
    async (formData: SelectionFormData) => {
      if (isViewMode) return formData

      if (!Object.keys(pendingCriteriaFiles).length) {
        return formData
      }

      const nextForm: SelectionFormData = {
        ...formData,
        criteria: formData.criteria.map(item => ({ ...item, files: [...(item.files || [])] }))
      }

      for (let index = 0; index < nextForm.criteria.length; index += 1) {
        const criteria = nextForm.criteria[index]
        const pendingFiles = criteria.files
          .map((criteriaFile, fileIndex) => ({ criteriaFile, fileIndex }))
          .filter(({ criteriaFile }) =>
            Boolean(criteriaFile.pending_key && pendingCriteriaFiles[criteriaFile.pending_key])
          )

        if (!pendingFiles.length) continue

        setCriteriaUploading(prev => ({ ...prev, [index]: true }))
        setCriteriaError(prev => ({ ...prev, [index]: '' }))

        try {
          for (const { criteriaFile, fileIndex } of pendingFiles) {
            const pendingKey = criteriaFile.pending_key!
            const file = pendingCriteriaFiles[pendingKey]
            const uploadForm = new FormData()
            uploadForm.append('REQUEST_REGISTER_VENDOR_ID', String(Number(resolvedRequestId) || 0))
            uploadForm.append('file', file)
            uploadForm.append('CREATE_BY', user?.EMPLOYEE_CODE || 'SYSTEM')
            uploadForm.append('DOCUMENT_SCOPE', 'GPR_CRITERIA')
            uploadForm.append('CRITERIA_NO', criteria.no || '')
            uploadForm.append('CRITERIA_DETAIL', criteria.detail || '')
            uploadForm.append('REQUEST_NUMBER', resolvedRequestNumber || '')

            const response = await addDocumentMutation.mutateAsync(uploadForm)
            const result = response.ResultOnDb
            criteria.files[fileIndex] = {
              criteria_file_id: Number(result.CRITERIA_FILE_ID || 0) || undefined,
              file_order: Number(result.FILE_ORDER || fileIndex + 1),
              file_path: result.FILE_PATH,
              file_name: result.FILE_NAME || file.name,
              file_size: file.size,
              file_type: file.type || null
            }
            setValue(`criteria.${index}.files` as any, [...criteria.files], { shouldDirty: true })
            setPendingCriteriaFiles(prev => {
              const next = { ...prev }
              delete next[pendingKey]
              return next
            })
          }
        } catch (error: any) {
          const message = error?.response?.data?.Message || error?.message || 'Upload failed'
          setCriteriaError(prev => ({ ...prev, [index]: message }))
          throw new Error(`Criteria ${criteria.no || index + 1}: ${message}`)
        } finally {
          setCriteriaUploading(prev => ({ ...prev, [index]: false }))
        }
      }

      return nextForm
    },
    [
      addDocumentMutation,
      pendingCriteriaFiles,
      isViewMode,
      resolvedRequestId,
      resolvedRequestNumber,
      setValue,
      user?.EMPLOYEE_CODE
    ]
  )

  const persistAccountVendorCode = useCallback(
    async (formData: SelectionFormData) => {
      const vendorCode = String(formData.vendor_code_selector || '')
        .trim()
        .toUpperCase()

      if (!isVendorCodeComplete(vendorCode, rowData?.VENDOR_REGION)) {
        throw new Error('Please enter the Vendor Code after the 20030/20031 prefix.')
      }

      setValue('vendor_code_selector', vendorCode, { shouldDirty: true })
      return saveAccountVendorCodeMutation.mutateAsync({
        request_id: resolvedRequestId,
        vendor_code: vendorCode,
        UPDATE_BY: user?.EMPLOYEE_CODE || ''
      })
    },
    [
      resolvedRequestId,
      rowData?.VENDOR_REGION,
      saveAccountVendorCodeMutation,
      setValue,
      user?.EMPLOYEE_CODE
    ]
  )

  const handleSave = useCallback(async () => {
    if (!resolvedRequestId) return
    if (isViewMode) {
      ToastMessageError({
        title: 'Save Selection Form',
        message: 'Selection Sheet is read-only after Document Checker approval.'
      })
      return
    }

    setSaving(true)

    try {
      let preparedForm = getValues()
      let response

      if (accountVendorCodeOnly) {
        response = await persistAccountVendorCode(preparedForm)
      } else {
        preparedForm.gpr_43_acceptance_status = normalizeGpr43AcceptanceStatus(
          preparedForm.criteria.find(item => item.no === '4.3')?.remark
        )
        response = await saveSelectionMutation.mutateAsync({
          request_id: resolvedRequestId,
          selection_form_data: preparedForm,
          CREATE_BY: user?.EMPLOYEE_CODE || 'SYSTEM',
          UPDATE_BY: user?.EMPLOYEE_CODE || 'SYSTEM'
        })
        preparedForm = await uploadPendingCriteriaFiles(preparedForm)
      }

      const message =
        response.Message ||
        (accountVendorCodeOnly
          ? 'Vendor Code saved successfully.'
          : 'Supplier / Outsourcing Selection Sheet saved successfully.')
      ToastMessageSuccess({
        title: accountVendorCodeOnly ? 'Save Vendor Code' : 'Save Selection Form',
        message
      })
      onSaved?.()
    } catch (error: any) {
      ToastMessageError({
        title: accountVendorCodeOnly ? 'Save Vendor Code' : 'Save Selection Form',
        message:
          error?.response?.data?.Message ||
          error?.message ||
          (accountVendorCodeOnly ? 'Failed to save Vendor Code' : 'Failed to save Supplier / Outsourcing Selection Sheet')
      })
    } finally {
      setSaving(false)
    }
  }, [
    accountVendorCodeOnly,
    getValues,
    onSaved,
    isViewMode,
    persistAccountVendorCode,
    resolvedRequestId,
    saveSelectionMutation,
    uploadPendingCriteriaFiles,
    user?.EMPLOYEE_CODE
  ])

  const handleExportPdf = useCallback(async () => {
    if (!resolvedRequestId) return

    setGeneratingPdf(true)

    try {
      // Read-only (e.g. after completion): export the saved form as-is
      // without uploading, re-checking blacklist, or saving.
      let currentForm = getValues()
      if (!isViewMode && !accountVendorCodeOnly && !normalizeSanctionsStatus(currentForm.sanctions)) {
        const companyName = String(currentForm.company_name || '').trim()
        if (companyName) {
          const blacklistResponse = await AddVendorServices.checkBlacklist({ COMPANY_NAME: companyName })
          const blacklistResult = blacklistResponse.data
          const matches = blacklistResult.blacklistMatches || []

          currentForm.sanctions = blacklistResult.isBlacklisted && matches.length ? 'concerned' : 'non-concerned'
          setValue('sanctions', currentForm.sanctions, { shouldDirty: true })
          setSanctionsCheck({
            checkedAt: new Date().toISOString(),
            matches,
            message:
              currentForm.sanctions === 'concerned'
                ? blacklistResult.Message || `Vendor name matches ${matches.length} record(s) in the Blacklist`
                : 'No blacklist match found.'
          })
        }
      }
      if (accountVendorCodeOnly) {
        await persistAccountVendorCode(currentForm)
      } else if (!isViewMode) {
        currentForm.gpr_43_acceptance_status = normalizeGpr43AcceptanceStatus(
          currentForm.criteria.find(item => item.no === '4.3')?.remark
        )
        await saveSelectionMutation.mutateAsync({
          request_id: resolvedRequestId,
          selection_form_data: currentForm,
          CREATE_BY: user?.EMPLOYEE_CODE || 'SYSTEM',
          UPDATE_BY: user?.EMPLOYEE_CODE || 'SYSTEM'
        })

        currentForm = await uploadPendingCriteriaFiles(currentForm)
      }

      let chartDataUri = ''
      try {
        const chartResult = await ApexCharts.exec('financial-chart-pdf', 'dataURI')
        if (chartResult?.imgURI) chartDataUri = chartResult.imgURI
      } catch (error) {
        console.warn('Failed to extract chart dataURI:', error)
      }

      const blob = await pdf(
        <GprPdfDocument
          form={currentForm}
          rowData={rowData}
          chartDataUri={chartDataUri}
          workflowStepIds={workflowStepIds}
          approvalStepStatusIds={approvalStepStatusIds}
        />
      ).toBlob()

      const fileName = buildSelectionSheetPdfFileName(resolvedRequestNumber, resolvedRequestId)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = fileName
      anchor.click()
      URL.revokeObjectURL(url)

      ToastMessageSuccess({ title: 'Generate PDF', message: 'PDF generated and downloaded.' })
      if (!isViewMode) onSaved?.()
    } catch (error: any) {
      ToastMessageError({
        title: 'Generate PDF',
        message: error?.response?.data?.Message || error?.message || 'Failed to generate PDF'
      })
    } finally {
      setGeneratingPdf(false)
    }
  }, [
    accountVendorCodeOnly,
    approvalStepStatusIds,
    isViewMode,
    persistAccountVendorCode,
    rowData,
    getValues,
    saveSelectionMutation,
    uploadPendingCriteriaFiles,
    workflowStepIds,
    user?.EMPLOYEE_CODE,
    onSaved,
    resolvedRequestId,
    resolvedRequestNumber,
    setValue
  ])

  const criteriaDeletingAny = Object.values(criteriaDeleting).some(Boolean)
  const isBusy = saving || generatingPdf || sanctionsChecking || criteriaDeletingAny

  const handleDialogClose = useCallback(
    (_event: unknown, reason?: string) => {
      if (reason !== 'backdropClick' && !isBusy) onClose()
    },
    [isBusy, onClose]
  )

  const handleCloseClick = useCallback(() => {
    if (!isBusy) onClose()
  }, [isBusy, onClose])

  return {
    methods,
    initializing,
    saving,
    generatingPdf,
    sanctionsChecking,
    sanctionsCheck,
    criteriaUploading,
    criteriaDeleting,
    criteriaError,
    fileInputRef,
    isBusy,
    handleCriteriaUploadClick,
    handleFileChange,
    removeCriteriaUpload,
    downloadCriteriaFile,
    handleSave,
    handleExportPdf,
    checkSanctions,
    handleDialogClose,
    handleCloseClick
  }
}
