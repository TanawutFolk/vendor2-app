import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { pdf } from '@react-pdf/renderer'
import ApexCharts from 'apexcharts'
import { GprPdfDocument } from './GprPdfDocument'
import RegisterRequestServices from '@_workspace/services/_register-request/RegisterRequestServices'
import AddVendorServices from '@_workspace/services/_add-vendor/AddVendorServices'
import type { BlacklistMatchI } from '@_workspace/types/_add-vendor/AddVendorTypes'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { useSaveGprFormMutation, useAddDocumentMutation } from '@_workspace/react-query/hooks/vendor/useRegisterRequestHooks'

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
    uploaded_file?: string
    uploaded_name?: string
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

export interface GprFormData {
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

export interface GprFormDialogProps {
    open: boolean
    rowData: any
    onClose: () => void
    onSaved?: () => void
    readOnly?: boolean
}

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
    net_profit: '',
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
    { no: '4.11', detail: 'Advised by Customer, Parent Company or Manager up', criteria: 'Need' },
    { no: '4.12', detail: 'Low Price', criteria: 'Optional' },
    { no: '4.13', detail: 'Document to request for Automatic Account Transfer', criteria: 'Optional' },
    { no: '4.14', detail: 'Other', criteria: 'Optional' },
]

const PENDING_UPLOAD_PREFIX = '__pending__/'

const normalizeGpr43AcceptanceStatus = (value: unknown): 'ACCEPT' | 'NOT_ACCEPT' | '' => {
    const normalized = String(value || '').trim().replace(/[_-]+/g, ' ').toUpperCase()
    if (['ACCEPT', 'ACCEPTED', 'AGREE', 'AGREED'].includes(normalized)) return 'ACCEPT'
    if (['NOT ACCEPT', 'NOT ACCEPTED', 'DISAGREE', 'DISAGREED', 'REJECT', 'REJECTED'].includes(normalized)) return 'NOT_ACCEPT'
    return ''
}

const normalizeSanctionsStatus = (value: unknown): 'non-concerned' | 'concerned' | '' => {
    const normalized = String(value || '').trim().replace(/[_-]+/g, ' ').toLowerCase()
    if (['non concerned', 'nonconcerned', 'not concerned', 'not concern', 'no concern'].includes(normalized)) return 'non-concerned'
    if (['concerned', 'concern'].includes(normalized)) return 'concerned'
    return ''
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
    result_updated_at: '',
})

export const buildDefaultActionRequiredSetup = (saved?: Partial<ActionRequiredSetup>): ActionRequiredSetup => ({
    engineer: { ...createActionRequiredStage(), ...(saved?.engineer || {}) },
    emr: { ...createActionRequiredStage(), ...(saved?.emr || {}) },
    qms: { ...createActionRequiredStage(), ...(saved?.qms || {}) },
    pm_manager: { ...createActionRequiredStage(), ...(saved?.pm_manager || {}) },
})

// ── Helper Functions ──────────────────────────────────────────────────────────

export const buildDefaultCriteria = (existing?: GprCriteria[]): GprCriteria[] =>
    CRITERIA_MASTER.map(master => {
        const found = existing?.find(item => item.no === master.no)

        return {
            ...master,
            remark: found?.remark || '',
            uploaded_file: found?.uploaded_file,
            uploaded_name: found?.uploaded_name,
        }
    })

export const normalizeSavedGpr = (raw: any): Partial<GprFormData> | undefined => {
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

    const salesProfitRaw = Array.isArray(getSourceValue('sales_profit', 'SALES_PROFIT'))
        ? getSourceValue('sales_profit', 'SALES_PROFIT')
        : []
    const sales_profit = (salesProfitRaw as any[]).map(item => ({
        year: String(item?.year ?? item?.YEAR ?? ''),
        total_revenue: String(item?.total_revenue ?? item?.TOTAL_REVENUE ?? ''),
        net_profit: String(item?.net_profit ?? item?.NET_PROFIT ?? ''),
    }))

    const criteriaRaw = Array.isArray(getSourceValue('criteria', 'CRITERIA'))
        ? getSourceValue('criteria', 'CRITERIA')
        : []
    const criteria = (criteriaRaw as any[]).map(item => ({
        no: String(item?.no ?? item?.NO ?? ''),
        detail: String(item?.detail ?? item?.DETAIL ?? ''),
        criteria: (item?.criteria ?? item?.CRITERIA ?? item?.criteria_value ?? item?.CRITERIA_VALUE ?? '') as 'Need' | 'Optional',
        remark: String(item?.remark ?? item?.REMARK ?? ''),
        uploaded_file: String(item?.uploaded_file ?? item?.UPLOADED_FILE ?? item?.uploaded_file_path ?? item?.UPLOADED_FILE_PATH ?? ''),
        uploaded_name: String(item?.uploaded_name ?? item?.UPLOADED_NAME ?? item?.uploaded_file_name ?? item?.UPLOADED_FILE_NAME ?? ''),
    }))

    return {
        company_name: getSourceValue('company_name', 'COMPANY_NAME') as string | undefined,
        pic_name: getSourceValue('pic_name', 'PIC_NAME') as string | undefined,
        tel: getSourceValue('tel', 'TEL') as string | undefined,
        email: getSourceValue('email', 'EMAIL') as string | undefined,
        address: getSourceValue('address', 'ADDRESS') as string | undefined,
        business_category: getSourceValue('business_category', 'BUSINESS_CATEGORY') as string | undefined,
        start_year: getSourceValue('start_year', 'START_YEAR') as string | undefined,
        authorized_capital: getSourceValue('authorized_capital', 'AUTHORIZED_CAPITAL') as string | undefined,
        establish: (getSourceValue('establish', 'ESTABLISH', 'establish_years', 'ESTABLISH_YEARS') as string | undefined),
        number_of_employees: getSourceValue('number_of_employees', 'NUMBER_OF_EMPLOYEES') as string | undefined,
        manufactured_country: getSourceValue('manufactured_country', 'MANUFACTURED_COUNTRY') as string | undefined,
        vendor_original_country: getSourceValue('vendor_original_country', 'VENDOR_ORIGINAL_COUNTRY') as string | undefined,
        sanctions: normalizeSanctionsStatus(getSourceValue('sanctions', 'SANCTIONS', 'sanctions_status', 'SANCTIONS_STATUS')),
        currency: getSourceValue('currency', 'CURRENCY') as string | undefined,
        suggestion: getSourceValue('suggestion', 'SUGGESTION') as string | undefined,
        result: (getSourceValue('result', 'RESULT', 'result_status', 'RESULT_STATUS') as 'approval' | 'disapproval' | '' | undefined),
        path: getSourceValue('path', 'PATH', 'document_path', 'DOCUMENT_PATH') as string | undefined,
        gpr_c_approver_name: getSourceValue('gpr_c_approver_name', 'GPR_C_APPROVER_NAME') as string | undefined,
        gpr_c_approver_email: getSourceValue('gpr_c_approver_email', 'GPR_C_APPROVER_EMAIL') as string | undefined,
        gpr_c_pc_pic_name: getSourceValue('gpr_c_pc_pic_name', 'GPR_C_PC_PIC_NAME') as string | undefined,
        gpr_c_pc_pic_email: getSourceValue('gpr_c_pc_pic_email', 'GPR_C_PC_PIC_EMAIL') as string | undefined,
        gpr_c_circular_list: (() => {
            try {
                const circularJson = getSourceValue('gpr_c_circular_json', 'GPR_C_CIRCULAR_JSON')
                const parsed = typeof circularJson === 'string'
                    ? JSON.parse(circularJson)
                    : circularJson
                if (!Array.isArray(parsed)) return []
                return parsed.map((item: any) => String(item?.email || item || '').trim()).filter(Boolean)
            } catch {
                return []
            }
        })(),
        action_required_setup: (() => {
            try {
                const actionRequiredJson = getSourceValue('action_required_json', 'ACTION_REQUIRED_JSON')
                const parsed = typeof actionRequiredJson === 'string'
                    ? JSON.parse(actionRequiredJson)
                    : actionRequiredJson
                return buildDefaultActionRequiredSetup(parsed || {})
            } catch {
                return buildDefaultActionRequiredSetup()
            }
        })(),
        gpr_43_acceptance_status: normalizeGpr43AcceptanceStatus(getSourceValue('gpr_43_acceptance_status', 'GPR_43_ACCEPTANCE_STATUS')),
        vendor_code_selector: getSourceValue('vendor_code_selector', 'VENDOR_CODE_SELECTOR') as string | undefined,
        completion_date: getSourceValue('completion_date', 'COMPLETION_DATE') as string | undefined,
        sales_profit,
        criteria,
    }
}

export const buildDefault = (rowData: any, saved?: Partial<GprFormData>): GprFormData => {
    const products = (() => {
        try {
            return typeof rowData?.products === 'string' ? JSON.parse(rowData.products) : (rowData?.products || [])
        } catch {
            return []
        }
    })()

    const contacts = (() => {
        try {
            return typeof rowData?.contacts === 'string' ? JSON.parse(rowData.contacts) : (rowData?.contacts || [])
        } catch {
            return []
        }
    })().filter(Boolean)

    const firstContact = contacts[0] || {}
    const mainProduct = products.map((item: any) => item.product_name || item.maker_name).filter(Boolean).join(', ')

    const savedGpr43Status = saved?.gpr_43_acceptance_status || normalizeGpr43AcceptanceStatus(rowData?.gpr_43_acceptance_status ?? rowData?.GPR_43_ACCEPTANCE_STATUS)
    const criteria = buildDefaultCriteria(saved?.criteria)
    const gpr43Criterion = criteria.find(item => item.no === '4.3')
    if (gpr43Criterion && !gpr43Criterion.remark) {
        gpr43Criterion.remark = gpr43StatusToRemark(savedGpr43Status)
    }

    return {
        company_name: saved?.company_name ?? (rowData?.company_name || ''),
        pic_name: saved?.pic_name ?? (firstContact.contact_name || ''),
        tel: saved?.tel ?? (firstContact.tel_phone || ''),
        email: saved?.email ?? (firstContact.email || ''),
        sanctions: saved?.sanctions || '',
        address: saved?.address ?? (rowData?.address || ''),
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
        vendor_code_selector: saved?.vendor_code_selector || (rowData?.vendor_code || ''),
        completion_date: saved?.completion_date || '',
    }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

const buildSelectionSheetPdfFileName = (requestNumber: unknown, requestId: unknown) => {
    const requestKey = String(requestNumber || requestId || 'REQUEST').trim().replace(/[\\/:*?"<>|]+/g, '-')
    return `Supplier - Outsourcing Selection Sheet_${requestKey}.pdf`
}

type UseGprFormArgs = Pick<GprFormDialogProps, 'open' | 'rowData' | 'onClose' | 'onSaved' | 'readOnly'>

export const useGprForm = ({ open, rowData, onClose, onSaved, readOnly = false }: UseGprFormArgs) => {
    const user = getUserData()
    const methods = useForm<GprFormData>({ defaultValues: buildDefault(rowData) })
    const { reset, getValues, setValue } = methods

    const [initializing, setInitializing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [generatingPdf, setGeneratingPdf] = useState(false)
    const [sanctionsChecking, setSanctionsChecking] = useState(false)
    const [sanctionsCheck, setSanctionsCheck] = useState<SanctionsCheckState | null>(null)
    const [criteriaUploading, setCriteriaUploading] = useState<Record<number, boolean>>({})
    const [criteriaDeleting, setCriteriaDeleting] = useState<Record<number, boolean>>({})
    const [criteriaError, setCriteriaError] = useState<Record<number, string>>({})
    const [pendingCriteriaFiles, setPendingCriteriaFiles] = useState<Record<number, File>>({})
    const fileInputRef = useRef<HTMLInputElement>(null)
    const uploadTargetRef = useRef<number>(-1)

    const checkSanctions = useCallback(async (companyName?: string) => {
        const name = String(companyName ?? getValues('company_name') ?? '').trim()

        if (!name) {
            setValue('sanctions', '', { shouldDirty: true })
            setSanctionsCheck({
                checkedAt: new Date().toISOString(),
                matches: [],
                message: 'Company name is required before blacklist checking.',
            })
            return false
        }

        setSanctionsChecking(true)

        try {
            const response = await AddVendorServices.checkBlacklist({
                company_name: name,
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
                    : 'No blacklist match found.',
            })
            return true
        } catch (error: any) {
            setSanctionsCheck({
                checkedAt: new Date().toISOString(),
                matches: [],
                message: error?.response?.data?.Message || error?.message || 'Failed to check blacklist.',
            })
            return false
        } finally {
            setSanctionsChecking(false)
        }
    }, [getValues, setValue])

    useEffect(() => {
        if (!open || !rowData?.request_id) return

        let active = true
        setInitializing(true)
        setCriteriaError({})
        setSanctionsCheck(null)
        setPendingCriteriaFiles({})

        const loadForm = async () => {
            try {
                const response = await RegisterRequestServices.getGprForm(rowData.request_id)
                if (!active) return

                const saved = response.data.Status && response.data.ResultOnDb
                    ? normalizeSavedGpr(response.data.ResultOnDb)
                    : undefined
                const defaults = buildDefault(rowData, saved)

                if (response.data.Status && response.data.ResultOnDb) {
                    reset(defaults)
                } else {
                    reset(defaults)
                }

                if (saved?.sanctions) {
                    setSanctionsCheck({
                        checkedAt: new Date().toISOString(),
                        matches: saved.sanctions === 'concerned' ? [{ name: 'Blacklisted' } as any] : [],
                        message: 'Loaded from saved selection sheet.',
                    })
                }

                if (!readOnly && !saved?.sanctions) {
                    await checkSanctions(defaults.company_name)
                }
            } catch {
                if (active) reset(buildDefault(rowData))
            } finally {
                if (active) setInitializing(false)
            }
        }

        loadForm()

        return () => {
            active = false
        }
    }, [checkSanctions, open, reset, rowData, readOnly])

    const handleCriteriaUploadClick = useCallback((index: number) => {
        uploadTargetRef.current = index
        fileInputRef.current?.click()
    }, [])

    const handleFileChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const index = uploadTargetRef.current
        if (index < 0) return

        event.target.value = ''
        setCriteriaError(prev => ({ ...prev, [index]: '' }))
        setPendingCriteriaFiles(prev => ({ ...prev, [index]: file }))
        setValue(`criteria.${index}.uploaded_file` as any, `${PENDING_UPLOAD_PREFIX}${file.name}`, { shouldDirty: true })
        setValue(`criteria.${index}.uploaded_name` as any, file.name, { shouldDirty: true })
    }, [setValue])

    const removeCriteriaUpload = useCallback(async (index: number) => {
        const currentRow = getValues(`criteria.${index}` as any) as GprCriteria | undefined
        const normalizedFilePath = String(currentRow?.uploaded_file || '').trim()
        const normalizedFileName = String(currentRow?.uploaded_name || '').trim()
        const criteriaNo = String(currentRow?.no || '').trim()
        const requestId = Number(rowData?.request_id) || 0

        const clearLocalCriteriaUpload = () => {
            setPendingCriteriaFiles(prev => {
                const next = { ...prev }
                delete next[index]
                return next
            })
            setValue(`criteria.${index}.uploaded_file` as any, '', { shouldDirty: true })
            setValue(`criteria.${index}.uploaded_name` as any, '', { shouldDirty: true })
            setCriteriaError(prev => ({ ...prev, [index]: '' }))
        }

        if (!normalizedFilePath || normalizedFilePath.startsWith(PENDING_UPLOAD_PREFIX)) {
            clearLocalCriteriaUpload()
            return
        }

        if (!requestId || !criteriaNo) {
            ToastMessageError({
                title: 'Delete File',
                message: 'Cannot delete this file because request or criteria data is missing.'
            })
            return
        }

        setCriteriaDeleting(prev => ({ ...prev, [index]: true }))

        try {
            const response = await RegisterRequestServices.deleteSelectionDocument({
                request_id: requestId,
                criteria_no: criteriaNo,
                file_path: normalizedFilePath,
                file_name: normalizedFileName,
                request_number: String(rowData?.request_number || ''),
                update_by: user?.EMPLOYEE_CODE || 'SYSTEM'
            })

            if (!response.data?.Status) {
                throw new Error(response.data?.Message || 'Failed to delete file')
            }

            clearLocalCriteriaUpload()
            ToastMessageSuccess({
                title: 'Delete File',
                message: response.data?.Message || 'File deleted successfully.'
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
    }, [getValues, onSaved, rowData?.request_id, rowData?.request_number, setValue, user?.EMPLOYEE_CODE])

    const downloadCriteriaFile = useCallback(async (filePath?: string, fileName?: string) => {
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
                file_path: normalizedFilePath,
                file_name: normalizedFileName,
                request_number: String(rowData?.request_number || '')
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
    }, [rowData?.request_number])

    const uploadPendingCriteriaFiles = useCallback(async (formData: GprFormData) => {
        const pendingEntries = Object.entries(pendingCriteriaFiles)

        if (!pendingEntries.length) {
            return formData
        }

        const nextForm: GprFormData = {
            ...formData,
            criteria: formData.criteria.map(item => ({ ...item })),
        }

        for (const [indexKey, file] of pendingEntries) {
            const index = Number(indexKey)
            const criteria = nextForm.criteria[index]

            if (!criteria || !file) continue

            setCriteriaUploading(prev => ({ ...prev, [index]: true }))
            setCriteriaError(prev => ({ ...prev, [index]: '' }))

            try {
                const uploadForm = new FormData()
                uploadForm.append('REQUEST_REGISTER_VENDOR_ID', String(Number(rowData?.request_id) || 0))
                uploadForm.append('file', file)
                uploadForm.append('CREATE_BY', user?.EMPLOYEE_CODE || 'SYSTEM')
                uploadForm.append('DOCUMENT_SCOPE', 'GPR_CRITERIA')
                uploadForm.append('CRITERIA_NO', criteria.no || '')
                uploadForm.append('CRITERIA_DETAIL', criteria.detail || '')
                uploadForm.append('REQUEST_NUMBER', rowData?.request_number || '')

                const response = await RegisterRequestServices.addDocument(uploadForm)

                if (!response.data.Status) {
                    throw new Error(response.data.Message || 'Upload failed')
                }

                const { file_path, file_name } = response.data.ResultOnDb
                nextForm.criteria[index] = {
                    ...criteria,
                    uploaded_file: file_path,
                    uploaded_name: file_name || file.name,
                }
                setValue(`criteria.${index}.uploaded_file` as any, file_path, { shouldDirty: true })
                setValue(`criteria.${index}.uploaded_name` as any, file_name || file.name, { shouldDirty: true })
            } catch (error: any) {
                const message = error?.response?.data?.Message || error?.message || 'Upload failed'
                setCriteriaError(prev => ({ ...prev, [index]: message }))
                throw new Error(`Criteria ${criteria.no || index + 1}: ${message}`)
            } finally {
                setCriteriaUploading(prev => ({ ...prev, [index]: false }))
            }
        }

        setPendingCriteriaFiles({})
        return nextForm
    }, [pendingCriteriaFiles, rowData?.request_id, rowData?.request_number, setValue, user?.EMPLOYEE_CODE])

    const handleSave = useCallback(async () => {
        if (!rowData?.request_id) return

        setSaving(true)

        try {
            const preparedForm = await uploadPendingCriteriaFiles(getValues())
            preparedForm.gpr_43_acceptance_status = normalizeGpr43AcceptanceStatus(preparedForm.criteria.find(item => item.no === '4.3')?.remark)
            const response = await RegisterRequestServices.saveGprForm({
                request_id: rowData.request_id,
                gpr_data: preparedForm,
                CREATE_BY: user?.EMPLOYEE_CODE || 'SYSTEM',
                UPDATE_BY: user?.EMPLOYEE_CODE || 'SYSTEM',
            })

            if (response.data?.Status) {
                const message = response.data.Message || 'Supplier / Outsourcing Selection Sheet saved successfully.'
                ToastMessageSuccess({ 
                    title: 'Save GPR Form',
                    message 
                })
                onSaved?.()
            } else {
                ToastMessageError({ 
                    title: 'Save GPR Form',
                    message: response.data?.Message || 'Failed to save Supplier / Outsourcing Selection Sheet' 
                })
            }
        } catch (error: any) {
            ToastMessageError({ 
                title: 'Save GPR Form',
                message: error?.response?.data?.Message || error?.message || 'Failed to save Supplier / Outsourcing Selection Sheet' 
            })
        } finally {
            setSaving(false)
        }
    }, [rowData?.request_id, getValues, uploadPendingCriteriaFiles, user?.EMPLOYEE_CODE, onSaved])

    const handleExportPdf = useCallback(async () => {
        if (!rowData?.request_id) return

        setGeneratingPdf(true)

        try {
            const currentForm = await uploadPendingCriteriaFiles(getValues())
            if (!normalizeSanctionsStatus(currentForm.sanctions)) {
                const companyName = String(currentForm.company_name || '').trim()
                if (companyName) {
                    const blacklistResponse = await AddVendorServices.checkBlacklist({ company_name: companyName })
                    const blacklistResult = blacklistResponse.data
                    const matches = blacklistResult.blacklistMatches || []

                    currentForm.sanctions = blacklistResult.isBlacklisted && matches.length ? 'concerned' : 'non-concerned'
                    setValue('sanctions', currentForm.sanctions, { shouldDirty: true })
                    setSanctionsCheck({
                        checkedAt: new Date().toISOString(),
                        matches,
                        message: currentForm.sanctions === 'concerned'
                            ? blacklistResult.Message || `Vendor name matches ${matches.length} record(s) in the Blacklist`
                            : 'No blacklist match found.',
                    })
                }
            }
            currentForm.gpr_43_acceptance_status = normalizeGpr43AcceptanceStatus(currentForm.criteria.find(item => item.no === '4.3')?.remark)
            const saveResponse = await RegisterRequestServices.saveGprForm({
                request_id: rowData.request_id,
                gpr_data: currentForm,
                CREATE_BY: user?.EMPLOYEE_CODE || 'SYSTEM',
                UPDATE_BY: user?.EMPLOYEE_CODE || 'SYSTEM',
            })

            if (!saveResponse.data.Status) {
                ToastMessageError({
                    title: 'Generate PDF',
                    message: saveResponse.data.Message || 'Failed to save Supplier / Outsourcing Selection Sheet'
                })
                return
            }

            let chartDataUri = ''
            try {
                const chartResult = await ApexCharts.exec('financial-chart-pdf', 'dataURI')
                if (chartResult?.imgURI) chartDataUri = chartResult.imgURI
            } catch (error) {
                console.warn('Failed to extract chart dataURI:', error)
            }

            const blob = await pdf(
                <GprPdfDocument form={currentForm} rowData={rowData} chartDataUri={chartDataUri} />
            ).toBlob()

            const fileName = buildSelectionSheetPdfFileName(rowData?.request_number, rowData?.request_id)
            const url = URL.createObjectURL(blob)
            const anchor = document.createElement('a')
            anchor.href = url
            anchor.download = fileName
            anchor.click()
            URL.revokeObjectURL(url)

            ToastMessageSuccess({ title: 'Generate PDF', message: 'PDF generated and downloaded.' })
            onSaved?.()
        } catch (error: any) {
            ToastMessageError({
                title: 'Generate PDF',
                message: error?.response?.data?.Message || error?.message || 'Failed to generate PDF'
            })
        } finally {
            setGeneratingPdf(false)
        }
    }, [rowData, getValues, uploadPendingCriteriaFiles, user?.EMPLOYEE_CODE, onSaved])

    const criteriaDeletingAny = Object.values(criteriaDeleting).some(Boolean)
    const isBusy = saving || generatingPdf || sanctionsChecking || criteriaDeletingAny

    const handleDialogClose = useCallback((_event: unknown, reason?: string) => {
        if (reason !== 'backdropClick' && !isBusy) onClose()
    }, [isBusy, onClose])

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
        handleCloseClick,
    }
}
