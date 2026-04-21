import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { pdf } from '@react-pdf/renderer'
import ApexCharts from 'apexcharts'
import { GprPdfDocument } from './GprPdfDocument'
import RegisterRequestServices from '@_workspace/services/_register-request/RegisterRequestServices'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SalesProfitYear {
    year: string
    total_revenue: string
    total_revenue_pct: string
    net_profit: string
    net_profit_pct: string
}

export interface GprCriteria {
    no: string
    detail: string
    criteria: 'Need' | 'Optional'
    remark: string
    uploaded_file?: string
    uploaded_name?: string
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

// ── Constants ─────────────────────────────────────────────────────────────────

export const BUSINESS_CATEGORIES = ['Manufacturer', 'Trading', 'Service', 'Other']
export const THIS_YEAR = new Date().getFullYear()

export const DEFAULT_SALES_PROFIT: SalesProfitYear[] = Array.from({ length: 5 }, (_, i) => ({
    year: String(THIS_YEAR - 4 + i),
    total_revenue: '',
    total_revenue_pct: '',
    net_profit: '',
    net_profit_pct: '',
}))

export const CRITERIA_MASTER: Pick<GprCriteria, 'no' | 'detail' | 'criteria'>[] = [
    { no: '3.1', detail: 'Compliant of the law', criteria: 'Need' },
    { no: '3.2', detail: 'Anti-Bribery Policy Communication', criteria: 'Need' },
    { no: '3.3', detail: 'General Purchase Specification Requirement', criteria: 'Need' },
    { no: '3.4', detail: 'Manufacture location survey', criteria: 'Need' },
    { no: '3.5', detail: 'Company Environmental and Energy Policy', criteria: 'Need' },
    { no: '3.6', detail: 'Quality Management Certification', criteria: 'Optional' },
    { no: '3.7', detail: 'Environmental Certification such as RoHS, REACH, etc.', criteria: 'Optional' },
    { no: '3.8', detail: 'Environmental Management Certification', criteria: 'Optional' },
    { no: '3.9', detail: 'History reliability', criteria: 'Optional' },
    { no: '3.10', detail: 'Reliable performance', criteria: 'Optional' },
    { no: '3.11', detail: 'Advised by Customer, Parent Company or Manager up', criteria: 'Optional' },
    { no: '3.12', detail: 'Low Price', criteria: 'Optional' },
    { no: '3.13', detail: 'Document to request for Automatic Account Transfer', criteria: 'Optional' },
    { no: '3.14', detail: 'Other', criteria: 'Optional' },
]

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

    return {
        company_name: source.company_name,
        pic_name: source.pic_name,
        tel: source.tel,
        email: source.email,
        address: source.address,
        business_category: source.business_category,
        start_year: source.start_year,
        authorized_capital: source.authorized_capital,
        establish: source.establish ?? source.establish_years,
        number_of_employees: source.number_of_employees,
        manufactured_country: source.manufactured_country,
        vendor_original_country: source.vendor_original_country,
        sanctions: source.sanctions ?? source.sanctions_status,
        currency: source.currency,
        suggestion: source.suggestion,
        result: source.result ?? source.result_status,
        path: source.path ?? source.document_path,
        gpr_c_approver_name: source.gpr_c_approver_name,
        gpr_c_approver_email: source.gpr_c_approver_email,
        gpr_c_pc_pic_name: source.gpr_c_pc_pic_name,
        gpr_c_pc_pic_email: source.gpr_c_pc_pic_email,
        gpr_c_circular_list: (() => {
            try {
                const parsed = typeof source.gpr_c_circular_json === 'string'
                    ? JSON.parse(source.gpr_c_circular_json)
                    : source.gpr_c_circular_json
                return Array.isArray(parsed) ? parsed : []
            } catch {
                return []
            }
        })(),
        vendor_code_selector: source.vendor_code_selector,
        completion_date: source.completion_date,
        sales_profit: source.sales_profit,
        criteria: source.criteria,
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
        criteria: buildDefaultCriteria(saved?.criteria),
        suggestion: saved?.suggestion || '',
        result: saved?.result || '',
        path: saved?.path || '',
        gpr_c_approver_name: saved?.gpr_c_approver_name || '',
        gpr_c_approver_email: saved?.gpr_c_approver_email || '',
        gpr_c_pc_pic_name: saved?.gpr_c_pc_pic_name || '',
        gpr_c_pc_pic_email: saved?.gpr_c_pc_pic_email || '',
        gpr_c_circular_list: Array.from({ length: 6 }, (_, index) => saved?.gpr_c_circular_list?.[index] || ''),
        vendor_code_selector: saved?.vendor_code_selector || (rowData?.vendor_code || ''),
        completion_date: saved?.completion_date || '',
    }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

type UseGprFormArgs = Pick<GprFormDialogProps, 'open' | 'rowData' | 'onClose' | 'onSaved'>

export const useGprForm = ({ open, rowData, onClose, onSaved }: UseGprFormArgs) => {
    const user = getUserData()
    const methods = useForm<GprFormData>({ defaultValues: buildDefault(rowData) })
    const { reset, getValues, setValue } = methods

    const [saving, setSaving] = useState(false)
    const [generatingPdf, setGeneratingPdf] = useState(false)
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
    const [criteriaUploading, setCriteriaUploading] = useState<Record<number, boolean>>({})
    const [criteriaError, setCriteriaError] = useState<Record<number, string>>({})
    const fileInputRef = useRef<HTMLInputElement>(null)
    const uploadTargetRef = useRef<number>(-1)

    useEffect(() => {
        if (!open || !rowData?.request_id) return

        let active = true
        setFeedback(null)
        setCriteriaError({})

        const loadForm = async () => {
            try {
                const response = await RegisterRequestServices.getGprForm(rowData.request_id)
                if (!active) return

                if (response.data.Status && response.data.ResultOnDb) {
                    reset(buildDefault(rowData, normalizeSavedGpr(response.data.ResultOnDb)))
                } else {
                    reset(buildDefault(rowData))
                }
            } catch {
                if (active) reset(buildDefault(rowData))
            }
        }

        loadForm()

        return () => {
            active = false
        }
    }, [open, reset, rowData])

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
        setCriteriaUploading(prev => ({ ...prev, [index]: true }))
        setCriteriaError(prev => ({ ...prev, [index]: '' }))

        try {
            const formData = new FormData()
            formData.append('request_id', String(rowData?.request_id))
            formData.append('file', file)
            formData.append('CREATE_BY', user?.EMPLOYEE_CODE || 'SYSTEM')

            const response = await RegisterRequestServices.addDocument(formData)

            if (response.data.Status) {
                const { file_path, file_name } = response.data.ResultOnDb
                setValue(`criteria.${index}.uploaded_file` as any, file_path, { shouldDirty: true })
                setValue(`criteria.${index}.uploaded_name` as any, file_name || file.name, { shouldDirty: true })
            } else {
                setCriteriaError(prev => ({ ...prev, [index]: response.data.Message }))
            }
        } catch (error: any) {
            setCriteriaError(prev => ({ ...prev, [index]: error?.response?.data?.Message || 'Upload failed' }))
        } finally {
            setCriteriaUploading(prev => ({ ...prev, [index]: false }))
        }
    }, [rowData?.request_id, user?.EMPLOYEE_CODE, setValue])

    const removeCriteriaUpload = useCallback((index: number) => {
        setValue(`criteria.${index}.uploaded_file` as any, '', { shouldDirty: true })
        setValue(`criteria.${index}.uploaded_name` as any, '', { shouldDirty: true })
    }, [setValue])

    const handleSave = useCallback(async () => {
        if (!rowData?.request_id) return

        setSaving(true)
        setFeedback(null)

        try {
            const response = await RegisterRequestServices.saveGprForm({
                request_id: rowData.request_id,
                gpr_data: getValues(),
                UPDATE_BY: user?.EMPLOYEE_CODE || 'SYSTEM',
            })

            if (response.data.Status) {
                setFeedback({ type: 'success', msg: 'GPR form saved successfully.' })
                onSaved?.()
            } else {
                setFeedback({ type: 'error', msg: response.data.Message })
            }
        } catch (error: any) {
            setFeedback({ type: 'error', msg: error?.response?.data?.Message || 'Failed to save GPR form' })
        } finally {
            setSaving(false)
        }
    }, [rowData?.request_id, getValues, user?.EMPLOYEE_CODE, onSaved])

    const handleExportPdf = useCallback(async () => {
        if (!rowData?.request_id) return

        setGeneratingPdf(true)
        setFeedback(null)

        try {
            const currentForm = getValues()
            await RegisterRequestServices.saveGprForm({
                request_id: rowData.request_id,
                gpr_data: currentForm,
                UPDATE_BY: user?.EMPLOYEE_CODE || 'SYSTEM',
            })

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

            const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
            const fileName = `GPR_FormA_${rowData.request_id}_${today}.pdf`
            const url = URL.createObjectURL(blob)
            const anchor = document.createElement('a')
            anchor.href = url
            anchor.download = fileName
            anchor.click()
            URL.revokeObjectURL(url)

            const documentForm = new FormData()
            documentForm.append('request_id', String(rowData.request_id))
            documentForm.append('file', new File([blob], fileName, { type: 'application/pdf' }))
            documentForm.append('CREATE_BY', user?.EMPLOYEE_CODE || 'SYSTEM')
            await RegisterRequestServices.addDocument(documentForm)

            setFeedback({ type: 'success', msg: 'PDF generated, saved, and attached to request.' })
            onSaved?.()
        } catch (error: any) {
            setFeedback({ type: 'error', msg: error?.message || 'Failed to generate PDF' })
        } finally {
            setGeneratingPdf(false)
        }
    }, [rowData, getValues, user?.EMPLOYEE_CODE, onSaved])

    const clearFeedback = useCallback(() => setFeedback(null), [])

    const isBusy = saving || generatingPdf

    const handleDialogClose = useCallback((_event: unknown, reason?: string) => {
        if (reason !== 'backdropClick' && !isBusy) onClose()
    }, [isBusy, onClose])

    const handleCloseClick = useCallback(() => {
        if (!isBusy) onClose()
    }, [isBusy, onClose])

    return {
        methods,
        saving,
        generatingPdf,
        feedback,
        criteriaUploading,
        criteriaError,
        fileInputRef,
        isBusy,
        handleCriteriaUploadClick,
        handleFileChange,
        removeCriteriaUpload,
        handleSave,
        handleExportPdf,
        clearFeedback,
        handleDialogClose,
        handleCloseClick,
    }
}
