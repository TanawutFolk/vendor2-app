// Supplier / Outsourcing Selection Sheet — GPR Form A (full rewrite)
// Changes from v1:
//   · GprCriteria: removed `judgment`; added `uploaded_file` / `uploaded_name` per row
//   · GprFormData: `sales_profit_5years: string` → `sales_profit: SalesProfitYear[]`
//                  Added Section-5 fields: suggestion, result, path,
//                  vendor_code_selector, pm_manager, completion_date
//   · Business Category → MUI Select dropdown
//   · Section 4: per-row file-upload button; green ✓ chip on success
//   · Section 3: Sales/Profit 5-year input table + ApexCharts grouped bar
//   · Section 5: Suggestion · Remark (auto counts) · Approval/Disapproval
//                Signature block (visual) · Path · For Selector
//   · Actions: "Save" + "Save & Export PDF"

import { useState, useEffect, useRef, Fragment, forwardRef } from 'react'
import CustomTextField from '@components/mui/TextField'
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Box, Typography, Divider, TextField, Checkbox,
    FormControlLabel, FormLabel, FormControl, Select, MenuItem,
    Grid, CircularProgress, Alert, Chip, Paper, Table, TableHead,
    TableRow, TableCell, TableBody, TableContainer, InputLabel,
    Tooltip, IconButton, Slide
} from '@mui/material'
import type { SlideProps } from '@mui/material'
import type { ReactElement, Ref } from 'react'
import { useForm, Controller, useFieldArray, FormProvider } from 'react-hook-form'

const Transition = forwardRef(function Transition(
    props: SlideProps & { children?: ReactElement<any, any> },
    ref: Ref<unknown>
) {
    return <Slide direction='down' ref={ref} {...props} />
})
import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import ReactApexChart from 'react-apexcharts'
import ApexCharts from 'apexcharts'
import { pdf } from '@react-pdf/renderer'
import { GprPdfDocument } from './GprPdfDocument'
import RegisterRequestServices from '@_workspace/services/_register-request/RegisterRequestServices'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

// ─────────────────────────────────────────────────────────────────────────────
// Types (exported so GprPdfDocument can import them)
// ─────────────────────────────────────────────────────────────────────────────
export interface SalesProfitYear {
    year: string
    total_revenue: string      // Amount
    total_revenue_pct: string  // %Change
    net_profit: string         // Amount
    net_profit_pct: string     // %Change
}

export interface GprCriteria {
    no: string
    detail: string
    criteria: 'Need' | 'Optional'
    remark: string
    uploaded_file?: string   // file_path returned from server
    uploaded_name?: string   // display filename
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
    // ── Section 5 ──
    suggestion: string
    result: 'approval' | 'disapproval' | ''
    path: string
    vendor_code_selector: string
    completion_date: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const BUSINESS_CATEGORIES = ['Manufacturer', 'Trading', 'Service', 'Other']

// Default consecutive years ending at the current year (e.g. 2022–2026)
const THIS_YEAR = new Date().getFullYear()
const DEFAULT_SALES_PROFIT: SalesProfitYear[] = Array.from({ length: 5 }, (_, i) => ({
    year: String(THIS_YEAR - 4 + i),
    total_revenue: '', total_revenue_pct: '',
    net_profit: '', net_profit_pct: '',
}))

// 3.1–3.5 = Need  |  3.6–3.14 = Optional
// NOTE: 3.5 is "Need" — was incorrectly 'Optional' in the original file.
const CRITERIA_MASTER: Pick<GprCriteria, 'no' | 'detail' | 'criteria'>[] = [
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

const buildDefaultCriteria = (existing?: GprCriteria[]): GprCriteria[] =>
    CRITERIA_MASTER.map(m => {
        const found = existing?.find(e => e.no === m.no)
        return {
            ...m,
            remark: found?.remark || '',
            uploaded_file: found?.uploaded_file,
            uploaded_name: found?.uploaded_name,
        }
    })

// ─────────────────────────────────────────────────────────────────────────────
// Default form state builder (pre-fills from request data)
// ─────────────────────────────────────────────────────────────────────────────
const buildDefault = (rowData: any, saved?: Partial<GprFormData>): GprFormData => {
    const products = (() => {
        try { return typeof rowData?.products === 'string' ? JSON.parse(rowData.products) : (rowData?.products || []) }
        catch { return [] }
    })()
    const mainProductStr = products.map((p: any) => p.product_name || p.maker_name).filter(Boolean).join(', ')

    const contacts = (() => {
        try { return typeof rowData?.contacts === 'string' ? JSON.parse(rowData.contacts) : (rowData?.contacts || []) }
        catch { return [] }
    })().filter(Boolean)
    const firstContact = contacts[0] || {}

    return {
        company_name: saved?.company_name ?? (rowData?.company_name || ''),
        pic_name: saved?.pic_name ?? (firstContact.contact_name || ''),
        tel: saved?.tel ?? (firstContact.tel_phone || ''),
        email: saved?.email ?? (firstContact.email || ''),
        currency: saved?.currency ?? 'THB',
        sanctions: saved?.sanctions || '',
        address: saved?.address ?? (rowData?.address || ''),
        business_category: saved?.business_category || '',
        start_year: saved?.start_year || '',
        authorized_capital: saved?.authorized_capital || '',
        establish: saved?.establish || '',
        number_of_employees: saved?.number_of_employees || '',
        manufactured_country: saved?.manufactured_country || '',
        main_product: saved?.main_product ?? mainProductStr,
        sales_profit: saved?.sales_profit || DEFAULT_SALES_PROFIT,
        vendor_original_country: saved?.vendor_original_country || '',
        criteria: buildDefaultCriteria(saved?.criteria),
        suggestion: saved?.suggestion || '',
        result: saved?.result || '',
        path: saved?.path || '',
        vendor_code_selector: saved?.vendor_code_selector || (rowData?.vendor_code || ''),
        completion_date: saved?.completion_date || '',
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────
const SectionTitle = ({ no, title, color = 'primary.main' }: { no: string | number; title: string; color?: string }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, mt: 1 }}>
        <Box sx={{
            minWidth: 28, height: 28, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: color, color: '#fff', fontWeight: 800, fontSize: '0.75rem',
        }}>{no}</Box>
        <Typography variant='subtitle1' fontWeight={700}>{title}</Typography>
        <Divider sx={{ flex: 1 }} />
    </Box>
)


// ─────────────────────────────────────────────────────────────────────────────
// Main Dialog
// ─────────────────────────────────────────────────────────────────────────────
interface GprFormDialogProps {
    open: boolean
    rowData: any        // full row from SearchResult
    onClose: () => void
    onSaved?: () => void
}

export default function GprFormDialog({ open, rowData, onClose, onSaved }: GprFormDialogProps) {
    const user = getUserData()

    const methods = useForm<GprFormData>({
        defaultValues: buildDefault(rowData)
    })
    const { control, handleSubmit, reset, getValues, watch, setValue, register } = methods
    const [saving, setSaving] = useState(false)
    const [generatingPdf, setGeneratingPdf] = useState(false)
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

    // Per-criteria-row upload state
    const [criteriaUploading, setCriteriaUploading] = useState<Record<number, boolean>>({})
    const [criteriaError, setCriteriaError] = useState<Record<number, string>>({})

    // Single hidden <input type="file"> shared across all criteria rows
    const fileInputRef = useRef<HTMLInputElement>(null)
    const uploadTargetRef = useRef<number>(-1)

    // Load saved data on open
    useEffect(() => {
        if (!open || !rowData?.request_id) return
        
        let active = true
        setFeedback(null)
        setCriteriaError({})

        const loadForm = async () => {
            try {
                const res = await RegisterRequestServices.getGprForm(rowData.request_id)
                if (!active) return
                if (res.data.Status && res.data.ResultOnDb) {
                    reset(buildDefault(rowData, res.data.ResultOnDb))
                } else {
                    reset(buildDefault(rowData))
                }
            } catch {
                if (active) reset(buildDefault(rowData))
            }
        }

        loadForm()
        
        return () => { active = false }
    }, [open, rowData, reset])

    // Field arrays for complex grid/tables
    const { fields: criteriaFields } = useFieldArray({
        control,
        name: 'criteria'
    })

    const { fields: salesProfitFields } = useFieldArray({
        control,
        name: 'sales_profit'
    })

    // ── Criteria file upload ─────────────────────────────────────────────────
    const handleCriteriaUploadClick = (idx: number) => {
        uploadTargetRef.current = idx
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const idx = uploadTargetRef.current
        if (idx < 0) return
        e.target.value = ''   // reset so the same file can be re-selected later

        setCriteriaUploading(prev => ({ ...prev, [idx]: true }))
        setCriteriaError(prev => ({ ...prev, [idx]: '' }))
        try {
            const fd = new FormData()
            fd.append('request_id', String(rowData?.request_id))
            fd.append('file', file)
            fd.append('CREATE_BY', user?.EMPLOYEE_CODE || 'SYSTEM')
            const res = await RegisterRequestServices.addDocument(fd)
            if (res.data.Status) {
                const { file_path, file_name } = res.data.ResultOnDb
                setValue(`criteria.${idx}.uploaded_file`, file_path, { shouldDirty: true })
                setValue(`criteria.${idx}.uploaded_name`, file_name || file.name, { shouldDirty: true })
            } else {
                setCriteriaError(prev => ({ ...prev, [idx]: res.data.Message }))
            }
        } catch (err: any) {
            setCriteriaError(prev => ({ ...prev, [idx]: err?.response?.data?.Message || 'Upload failed' }))
        } finally {
            setCriteriaUploading(prev => ({ ...prev, [idx]: false }))
        }
    }

    const removeCriteriaUpload = (idx: number) => {
        setValue(`criteria.${idx}.uploaded_file`, '', { shouldDirty: true })
        setValue(`criteria.${idx}.uploaded_name`, '', { shouldDirty: true })
    }

    // ── Save JSON ────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!rowData?.request_id) return
        setSaving(true)
        setFeedback(null)
        try {
            const res = await RegisterRequestServices.saveGprForm({
                request_id: rowData.request_id,
                gpr_data: getValues(),
                UPDATE_BY: user?.EMPLOYEE_CODE || 'SYSTEM',
            })
            if (res.data.Status) {
                setFeedback({ type: 'success', msg: 'GPR form saved successfully.' })
                onSaved?.()
            } else {
                setFeedback({ type: 'error', msg: res.data.Message })
            }
        } catch (err: any) {
            setFeedback({ type: 'error', msg: err?.response?.data?.Message || 'Failed to save GPR form' })
        } finally {
            setSaving(false)
        }
    }

    // ── Save & Export PDF ────────────────────────────────────────────────────
    const handleExportPdf = async () => {
        if (!rowData?.request_id) return
        setGeneratingPdf(true)
        setFeedback(null)
        try {
            // 1. Persist JSON first
            const currentForm = getValues()
            await RegisterRequestServices.saveGprForm({
                request_id: rowData.request_id,
                gpr_data: currentForm,
                UPDATE_BY: user?.EMPLOYEE_CODE || 'SYSTEM',
            })

            // 1.5 Extract Chart Image
            let chartDataUri = ''
            try {
                const resUri = await ApexCharts.exec('financial-chart-pdf', 'dataURI')
                if (resUri && resUri.imgURI) {
                    chartDataUri = resUri.imgURI
                }
            } catch (err) {
                console.warn('Failed to extract chart dataURI:', err)
            }

            // 2. Render PDF blob
            const blob = await pdf(<GprPdfDocument form={currentForm} rowData={rowData} chartDataUri={chartDataUri} />).toBlob()

            // 3. Trigger browser file download
            const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
            const fileName = `GPR_FormA_${rowData.request_id}_${today}.pdf`
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = fileName
            a.click()
            URL.revokeObjectURL(url)

            // 4. Upload the generated PDF so it appears in "Attached Files" section
            const docFd = new FormData()
            docFd.append('request_id', String(rowData.request_id))
            docFd.append('file', new File([blob], fileName, { type: 'application/pdf' }))
            docFd.append('CREATE_BY', user?.EMPLOYEE_CODE || 'SYSTEM')
            await RegisterRequestServices.addDocument(docFd)

            setFeedback({ type: 'success', msg: 'PDF generated, saved, and attached to request.' })
            onSaved?.()
        } catch (err: any) {
            setFeedback({ type: 'error', msg: err?.message || 'Failed to generate PDF' })
        } finally {
            setGeneratingPdf(false)
        }
    }

    // ── Computed values ──────────────────────────────────────────────────────
    // Remark auto-counts
    const watchCriteria = watch('criteria') || []
    const watchSalesProfit = watch('sales_profit') || []

    const needUploaded = watchCriteria.filter(c => c.criteria === 'Need' && c.uploaded_file).length
    const optionalUploaded = watchCriteria.filter(c => c.criteria === 'Optional' && c.no !== '3.14' && c.uploaded_file).length

    const watchCurrency = watch('currency') || 'THB'
    const chartSeries = [
        { name: 'Total Revenue', type: 'column', data: watchSalesProfit.map(r => parseFloat(r.total_revenue) || 0) },
        { name: 'Net Profit', type: 'column', data: watchSalesProfit.map(r => parseFloat(r.net_profit) || 0) },
        {
            name: 'Net Profit Margin %', type: 'line',
            data: watchSalesProfit.map(r => {
                const rev = parseFloat(r.total_revenue) || 0
                const profit = parseFloat(r.net_profit) || 0
                return rev > 0 ? parseFloat((profit / rev * 100).toFixed(2)) : 0
            }),
        },
    ]
    const chartOptions = {
        chart: { id: 'financial-chart-pdf', type: 'line' as const, height: 270, toolbar: { show: false }, background: 'transparent', parentHeightOffset: 0 },
        plotOptions: { bar: { columnWidth: '55%', borderRadius: 3 } },
        dataLabels: { enabled: false },
        legend: { position: 'top' as const },
        stroke: { width: [0, 0, 2], curve: 'smooth' as const },
        markers: { size: [0, 0, 4] },
        xaxis: { categories: watchSalesProfit.map(r => r.year) },
        yaxis: [
            { title: { text: `Amount (${watchCurrency})` }, labels: { formatter: (v: number) => v.toLocaleString() } },
            { show: false },
            { opposite: true, title: { text: '% Margin' }, labels: { formatter: (v: number) => `${v.toFixed(2)}%` } },
        ],
        colors: ['#7367F0', '#28C76F', '#FF9F43'],
        tooltip: {
            y: [
                { formatter: (v: number) => v.toLocaleString() },
                { formatter: (v: number) => v.toLocaleString() },
                { formatter: (v: number) => `${v.toFixed(2)}%` },
            ],
        },
        grid: { borderColor: '#f0f0f0', padding: { left: 0, right: 0, top: 0, bottom: 0 } },
    }

    const isBusy = saving || generatingPdf

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <Dialog
            maxWidth='lg'
            fullWidth={true}
            onClose={(event, reason) => {
                if (reason !== 'backdropClick') {
                    if (!isBusy) onClose()
                }
            }}
            TransitionComponent={Transition}
            open={open}
            PaperProps={{ sx: { bgcolor: 'background.default' } }}
            sx={{
                '& .MuiDialog-paper': { overflow: 'visible' },
                '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
            }}
        >

            {/* Hidden file input — shared for all criteria row uploads */}
            <input
                type='file'
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept='.pdf,.doc,.docx,.jpg,.jpeg,.png'
                onChange={handleFileChange}
            />

            {/* ── Dialog Title — Premium Header ────────────────────────── */}
            <DialogTitle sx={{ p: 0, overflow: 'visible' }}>
                <Box sx={{
                    px: 3, py: 2.5,
                    background: 'linear-gradient(135deg, var(--mui-palette-primary-main) 0%, #7367F0 100%)',
                    color: '#fff',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                }}>
                    <Box>
                        <Typography variant='h5' fontWeight={800} sx={{ letterSpacing: 0.3 }}>
                            Supplier / Outsourcing Selection Sheet
                        </Typography>
                        <Typography variant='caption' sx={{ opacity: 0.85, display: 'block', mt: 0.5 }}>
                            GPR Form A · {methods.watch('company_name') || rowData?.company_name || '—'}
                        </Typography>
                    </Box>
                    <DialogCloseButton onClick={() => { if (!isBusy) onClose() }} disableRipple sx={{ color: '#fff' }}>
                        <i className='tabler-x' />
                    </DialogCloseButton>
                </Box>
            </DialogTitle>

            {/* ── Dialog Content ───────────────────────────────────────────── */}
            <DialogContent dividers sx={{ px: 4, py: 3, overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
                <FormProvider {...methods}>
                    {feedback && (
                        <Alert severity={feedback.type} sx={{ mb: 2 }} onClose={() => setFeedback(null)}>
                            {feedback.msg}
                        </Alert>
                    )}

                    {/* ── 1. Company Info ─────────────────────────────────────── */}
                    <SectionTitle no={1} title='Company Name' color='primary.main' />
                    <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'primary.main' }}>
                        <Grid container spacing={2.5}>
                            <Grid item xs={12} md={6}>
                                <CustomTextField
                                    fullWidth label='Company Name' placeholder='Enter company name...'
                                    {...register('company_name')}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <CustomTextField
                                    fullWidth label='Email' placeholder='Enter email...'
                                    {...register('email')}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <CustomTextField
                                    fullWidth label='PIC' placeholder='Enter PIC name...'
                                    {...register('pic_name')}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <CustomTextField
                                    fullWidth label='Tel' placeholder='Enter telephone...'
                                    {...register('tel')}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* ── 2. Sanctions ────────────────────────────────────────── */}
                    <SectionTitle no={2} title='List of two political parties subject to sanctions' color='primary.main' />
                    <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'primary.main' }}>
                        <FormControl>
                            <FormLabel sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 0.75, color: 'text.primary' }}>
                                Sanctions status
                            </FormLabel>
                            <Controller
                                name='sanctions'
                                control={control}
                                render={({ field }) => (
                                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    size='small' color='success'
                                                    checked={field.value === 'non-concerned'}
                                                    onChange={() => field.onChange(field.value === 'non-concerned' ? '' : 'non-concerned')}
                                                />
                                            }
                                            label={<Typography variant='body2' fontWeight={600} color='success.main'>Non-concerned</Typography>}
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    size='small' color='error'
                                                    checked={field.value === 'concerned'}
                                                    onChange={() => field.onChange(field.value === 'concerned' ? '' : 'concerned')}
                                                />
                                            }
                                            label={<Typography variant='body2' fontWeight={600} color='error.main'>Concerned</Typography>}
                                        />
                                    </Box>
                                )}
                            />
                        </FormControl>
                    </Paper>

                    {/* ── 3. Company General Information ──────────────────────── */}
                    <SectionTitle no={3} title='Company general information' color='primary.main' />
                    <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'primary.main' }}>
                        <Grid container spacing={2.5}>

                            {/* Address */}
                            <Grid item xs={12}>
                                <CustomTextField
                                    fullWidth label='Address' multiline rows={2}
                                    placeholder='Enter address...'
                                    {...register('address')}
                                />
                            </Grid>

                            {/* Business Category (dropdown) */}
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth size='small'>
                                    <InputLabel>Business Category</InputLabel>
                                    <Controller
                                        name='business_category'
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                label='Business Category'
                                                {...field}
                                            >
                                                {BUSINESS_CATEGORIES.map(cat => (
                                                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                                ))}
                                            </Select>
                                        )}
                                    />
                                </FormControl>
                            </Grid>

                            {/* Start Year */}
                            <Grid item xs={12} sm={4}>
                                <CustomTextField fullWidth label='Start Year' placeholder='e.g. 2005'
                                    {...register('start_year')}
                                />
                            </Grid>

                            {/* Authorized Capital */}
                            <Grid item xs={12} sm={4}>
                                <CustomTextField fullWidth label='Authorized Capital' placeholder='e.g. 10,000,000 THB'
                                    {...register('authorized_capital')}
                                />
                            </Grid>

                            {/* Establish */}
                            <Grid item xs={12} sm={4}>
                                <CustomTextField fullWidth label='Establish (years)' placeholder='e.g. 15'
                                    {...register('establish')}
                                />
                            </Grid>

                            {/* Number of Employees */}
                            <Grid item xs={12} sm={4}>
                                <CustomTextField fullWidth label='Number of Employees'
                                    placeholder='e.g. 150'
                                    {...register('number_of_employees')}
                                />
                            </Grid>

                            {/* Manufactured Country */}
                            <Grid item xs={12} sm={4}>
                                <CustomTextField fullWidth label='Manufactured Country'
                                    placeholder='e.g. Thailand'
                                    {...register('manufactured_country')}
                                />
                            </Grid>

                            {/* Main Product */}
                            <Grid item xs={12}>
                                <CustomTextField
                                    fullWidth label='Main Product' multiline rows={2}
                                    placeholder='e.g. Cables, Connectors'
                                    {...register('main_product')}
                                />
                            </Grid>

                            {/* ── Financial Data 5 Years — Chart LEFT, Table RIGHT ── */}
                            <Grid item xs={12}>
                                <Typography variant='caption' fontWeight={700} color='text.secondary' sx={{ mb: 1.5, display: 'block' }}>
                                    Financial Data — Last 5 Years
                                </Typography>
                                <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
                                    {/* LEFT: Input Table (40%) */}
                                    <Grid item xs={12} md={5}>
                                        <TableContainer component={Paper} variant='outlined' sx={{ borderRadius: 1.5, overflow: 'hidden', height: '100%' }}>
                                            <Table size='small' sx={{ tableLayout: 'fixed' }}>
                                                <TableHead>
                                                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', width: '20%', p: '6px 4px' }}>Year</TableCell>
                                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', width: '30%', p: '6px 4px' }}>Revenue</TableCell>
                                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', width: '30%', p: '6px 4px' }}>Net Profit</TableCell>
                                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', width: '20%', p: '6px 2px', color: 'success.main' }}>Margin</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {salesProfitFields.map((field, i) => {
                                                        const row = watchSalesProfit[i] || {}
                                                        const rev = parseFloat(row.total_revenue) || 0
                                                        const profit = parseFloat(row.net_profit) || 0
                                                        const margin = rev > 0 ? (profit / rev * 100).toFixed(1) : '-'
                                                        return (
                                                            <TableRow key={field.id} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                                                                <TableCell sx={{ p: '4px' }}>
                                                                    <TextField size='small' variant='standard'
                                                                        inputProps={{ style: { textAlign: 'center', fontWeight: 700, fontSize: '0.78rem' } }}
                                                                        {...register(`sales_profit.${i}.year`)}
                                                                        sx={{ width: '100%' }}
                                                                    />
                                                                </TableCell>
                                                                <TableCell sx={{ p: '4px' }}>
                                                                    <TextField size='small' variant='standard' placeholder='0' type='number'
                                                                        {...register(`sales_profit.${i}.total_revenue`)}
                                                                        sx={{ width: '100%' }}
                                                                    />
                                                                </TableCell>
                                                                <TableCell sx={{ p: '4px' }}>
                                                                    <TextField size='small' variant='standard' placeholder='0' type='number'
                                                                        {...register(`sales_profit.${i}.net_profit`)}
                                                                        sx={{ width: '100%' }}
                                                                    />
                                                                </TableCell>
                                                                <TableCell align='center' sx={{ p: '4px 2px' }}>
                                                                    <Typography variant='caption' fontWeight={700} color='success.main'>
                                                                        {margin !== '-' ? `${margin}%` : '-'}
                                                                    </Typography>
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    })}
                                                    <TableRow>
                                                        <TableCell colSpan={4} sx={{ p: '6px 8px', borderBottom: 0 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }}>
                                                                <Typography variant='caption' fontWeight={600}>Currency:</Typography>
                                                                <Controller
                                                                    name='currency'
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <Select {...field} size='small' variant='standard' sx={{ fontSize: '0.75rem', minWidth: 80, mb: 0.5 }}>
                                                                            <MenuItem value='THB'>THB</MenuItem>
                                                                            <MenuItem value='USD'>USD</MenuItem>
                                                                            <MenuItem value='EUR'>EUR</MenuItem>
                                                                            <MenuItem value='JPY'>JPY</MenuItem>
                                                                            <MenuItem value='CNY'>CNY</MenuItem>
                                                                        </Select>
                                                                    )}
                                                                />
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Grid>
                                    {/* RIGHT: Chart (60%) */}
                                    <Grid item xs={12} md={7}>
                                        <Paper variant='outlined' sx={{ p: 0, borderRadius: 1.5, height: '100%', overflow: 'hidden' }}>
                                            <ReactApexChart
                                                key={watchSalesProfit.map((r: any) => r.year).join(',')}
                                                type='line'
                                                options={chartOptions}
                                                series={chartSeries}
                                                height={280}
                                                width='100%'
                                            />
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Grid>

                            {/* Vendor's Original Country */}
                            <Grid item xs={12} sm={6}>
                                <CustomTextField fullWidth label="Vendor's Original Country"
                                    placeholder='e.g. Japan'
                                    {...register('vendor_original_country')}
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                    {/* ── 4. Criteria for Selection ────────────────────────────── */}
                    <SectionTitle no={4} title='Criteria for selection' color='primary.main' />
                    <Paper elevation={0} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'primary.main' }}>
                        <TableContainer>
                            <Table size='small'>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'primary.main' }}>
                                        <TableCell sx={{ color: '#fff', fontWeight: 700, width: 55 }}>No.</TableCell>
                                        <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Detail</TableCell>
                                        <TableCell sx={{ color: '#fff', fontWeight: 700, width: 90 }}>Criteria</TableCell>
                                        <TableCell sx={{ color: '#fff', fontWeight: 700, width: 180 }}>Remark</TableCell>
                                        <TableCell sx={{ color: '#fff', fontWeight: 700, width: 210 }}>Document</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {criteriaFields.map((field, idx) => {
                                        const row = watchCriteria[idx] || {}
                                        return (
                                            <TableRow
                                                key={field.id}
                                                sx={{
                                                    '&:last-child td': { borderBottom: 0 },
                                                    bgcolor: row.criteria === 'Need' ? 'rgba(115,103,240,0.04)' : 'transparent',
                                                }}
                                            >
                                                <TableCell>
                                                    <Typography variant='caption' fontWeight={700}>{row.no}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant='caption'>{row.detail}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={row.criteria}
                                                        size='small'
                                                        color={row.criteria === 'Need' ? 'primary' : 'default'}
                                                        variant={row.criteria === 'Need' ? 'filled' : 'tonal'}
                                                        sx={{ fontSize: '0.65rem' }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        size='small' variant='standard' fullWidth
                                                        placeholder='remark…'
                                                        {...register(`criteria.${idx}.remark`)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {row.uploaded_file ? (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <Chip
                                                                icon={<i className='tabler-check' style={{ fontSize: 13 }} />}
                                                                label={row.uploaded_name || 'Uploaded'}
                                                                size='small'
                                                                color='success'
                                                                variant='tonal'
                                                                sx={{ fontSize: '0.65rem', maxWidth: 155 }}
                                                            />
                                                            <Tooltip title='Remove'>
                                                                <IconButton size='small' onClick={() => removeCriteriaUpload(idx)} sx={{ p: 0.3 }}>
                                                                    <i className='tabler-x' style={{ fontSize: 12 }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    ) : (
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                                                            <Button
                                                                size='small'
                                                                variant='tonal'
                                                                color='secondary'
                                                                disabled={criteriaUploading[idx]}
                                                                startIcon={
                                                                    criteriaUploading[idx]
                                                                        ? <CircularProgress size={12} />
                                                                        : <i className='tabler-upload' style={{ fontSize: 13 }} />
                                                                }
                                                                onClick={() => handleCriteriaUploadClick(idx)}
                                                                sx={{ fontSize: '0.7rem', py: 0.25 }}
                                                            >
                                                                {criteriaUploading[idx] ? 'Uploading…' : 'Upload PDF'}
                                                            </Button>
                                                            {criteriaError[idx] && (
                                                                <Typography variant='caption' color='error' sx={{ fontSize: '0.62rem' }}>
                                                                    {criteriaError[idx]}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>

                    {/* ── 5. Suggestion + Remarks + Approval + Signature + Selector ── */}
                    <SectionTitle no={5} title='Suggestion' color='primary.main' />
                    <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'primary.main' }}>

                        {/* Suggestion */}
                        <CustomTextField
                            fullWidth label='Suggestion' multiline rows={2}
                            placeholder='Write your suggestion here…'
                            {...register('suggestion')}
                            sx={{ mb: 2 }}
                        />

                        {/* Remark block — auto-computed, read-only */}
                        <Paper variant='outlined' sx={{ p: 1.5, mb: 2, bgcolor: 'action.hover', borderRadius: 1.5 }}>
                            <Typography variant='caption' fontWeight={700} sx={{ display: 'block', mb: 1 }}>
                                Remark :
                            </Typography>
                            <Typography variant='caption' sx={{ display: 'block', mb: 0.5 }}>
                                {'1. Criteria for evaluation criteria in item 3.1 to 3.5, Which are all selected = '}
                                <Box component='span' sx={{ fontWeight: 700, color: 'primary.main' }}>{needUploaded}</Box>
                                {' items'}
                            </Typography>
                            <Typography variant='caption' sx={{ display: 'block', mb: 0.75 }}>
                                {'2. Item 3.6 to 3.13 as a criterion independent, Which must choose at least three items, Which are all selected = '}
                                <Box component='span' sx={{ fontWeight: 700, color: 'primary.main' }}>{optionalUploaded}</Box>
                                {' items'}
                            </Typography>
                            <Typography variant='caption' component='div' sx={{ pl: 1.5, color: 'text.secondary', lineHeight: 1.8 }}>
                                <strong>–</strong> Manufacturer shall be authorized capital is at least 1MTHB, Establish is at least 3 years and if the goods are raw materials, item no. 3.6-3.7 is recommended.<br />
                                <strong>–</strong> Other business category shall be authorized capital is at least 0.5 MTHB, Establish is at least 1 year.
                            </Typography>
                        </Paper>

                        {/* Approval / Disapproval */}
                        <FormControl sx={{ mb: 2 }}>
                            <FormLabel sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 0.5, color: 'text.primary' }}>
                                Result
                            </FormLabel>
                            <Controller
                                name='result'
                                control={control}
                                render={({ field }) => (
                                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    size='small' color='success'
                                                    checked={field.value === 'approval'}
                                                    onChange={() => field.onChange(field.value === 'approval' ? '' : 'approval')}
                                                />
                                            }
                                            label={<Typography variant='body2' fontWeight={600} color='success.main'>Approval</Typography>}
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    size='small' color='error'
                                                    checked={field.value === 'disapproval'}
                                                    onChange={() => field.onChange(field.value === 'disapproval' ? '' : 'disapproval')}
                                                />
                                            }
                                            label={<Typography variant='body2' fontWeight={600} color='error.main'>Disapproval</Typography>}
                                        />
                                    </Box>
                                )}
                            />
                        </FormControl>

                        {/* Signature block — visual only (signed on printed form) */}
                        <Paper variant='outlined' sx={{ mb: 2, borderRadius: 1.5, overflow: 'hidden' }}>
                            <Typography
                                variant='caption' color='text.secondary'
                                sx={{ display: 'block', p: 1, bgcolor: 'action.hover', fontStyle: 'italic' }}
                            >
                                ✎ Signatures are completed on the printed form — this section is for reference only.
                            </Typography>
                            <Box sx={{
                                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                                borderTop: '1px solid', borderTopColor: 'divider',
                            }}>
                                {['Selector', 'Checker', 'Checker', 'Approve by'].map((lbl, i) => (
                                    <Box key={i} sx={{
                                        p: 1.5, minHeight: 60,
                                        borderRight: i < 3 ? '1px solid' : 'none', borderRightColor: 'divider',
                                        textAlign: 'center',
                                    }}>
                                        <Typography variant='caption' fontWeight={700} display='block'>{lbl}</Typography>
                                        <Typography variant='caption' color='text.disabled' sx={{ fontSize: '0.62rem' }}>
                                            …/…/…
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                            <Box sx={{
                                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                                borderTop: '1px solid', borderTopColor: 'divider',
                            }}>
                                {['Issuer', 'Manager', 'General Manager', 'Managing Director'].map((lbl, i) => (
                                    <Box key={i} sx={{
                                        p: 0.75, textAlign: 'center',
                                        borderRight: i < 3 ? '1px solid' : 'none', borderRightColor: 'divider',
                                    }}>
                                        <Typography variant='caption' color='text.secondary'>{lbl}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Paper>

                        {/* Path */}
                        <CustomTextField
                            fullWidth label='Path' placeholder='File path / folder reference'
                            {...register('path')}
                            sx={{ mb: 2 }}
                        />

                        {/* For Selector */}
                        <Paper variant='outlined' sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'rgba(40,199,111,0.04)' }}>
                            <Typography variant='caption' fontWeight={700} sx={{ display: 'block', mb: 0.5 }}>
                                For Selector :
                            </Typography>
                            <Typography variant='caption' color='text.secondary' fontStyle='italic' sx={{ display: 'block', mb: 1.5 }}>
                                After completing the Supplier/Outsourcing registration, please specify.
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <CustomTextField fullWidth label='Vendor Code'
                                        {...register('vendor_code_selector')}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <CustomTextField
                                        fullWidth label='Completion Date' type='date'
                                        InputLabelProps={{ shrink: true }}
                                        {...register('completion_date')}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>

                    </Paper>
                </FormProvider>
            </DialogContent>

            {/* ── Actions ─────────────────────────────────────────────────── */}
            <DialogActions sx={{ justifyContent: 'flex-start', px: 3, py: 1.5, gap: 1 }}>
                <Button
                    variant='tonal' color='primary'
                    onClick={handleSave}
                    disabled={isBusy}
                    startIcon={saving ? <CircularProgress size={14} /> : <i className='tabler-device-floppy' style={{ fontSize: 16 }} />}
                >
                    {saving ? 'Saving…' : 'Save'}
                </Button>
                <Button
                    variant='contained' color='primary'
                    onClick={handleExportPdf}
                    disabled={isBusy}
                    startIcon={generatingPdf ? <CircularProgress size={14} color='inherit' /> : <i className='tabler-file-type-pdf' style={{ fontSize: 16 }} />}
                >
                    {generatingPdf ? 'Generating…' : 'Save & Export PDF'}
                </Button>
                <Button variant='tonal' color='secondary' onClick={onClose} disabled={isBusy}>
                    Cancel
                </Button>
            </DialogActions>

        </Dialog>
    )
}
