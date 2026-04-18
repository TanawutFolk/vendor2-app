import { forwardRef, useEffect, useRef, useState } from 'react'
import type { ChangeEvent, ReactElement, Ref } from 'react'
import type { SlideProps } from '@mui/material'
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    FormLabel,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Slide,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material'
import CustomTextField from '@components/mui/TextField'
import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import ReactApexChart from 'react-apexcharts'
import ApexCharts from 'apexcharts'
import { pdf } from '@react-pdf/renderer'
import {
    Controller,
    FormProvider,
    useFieldArray,
    useForm,
    useFormContext,
    useWatch,
} from 'react-hook-form'
import { GprPdfDocument } from './GprPdfDocument'
import RegisterRequestServices from '@_workspace/services/_register-request/RegisterRequestServices'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

const Transition = forwardRef(function Transition(
    props: SlideProps & { children?: ReactElement<any, any> },
    ref: Ref<unknown>
) {
    return <Slide direction='down' ref={ref} {...props} />
})

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
    vendor_code_selector: string
    completion_date: string
}

const BUSINESS_CATEGORIES = ['Manufacturer', 'Trading', 'Service', 'Other']
const THIS_YEAR = new Date().getFullYear()

const DEFAULT_SALES_PROFIT: SalesProfitYear[] = Array.from({ length: 5 }, (_, i) => ({
    year: String(THIS_YEAR - 4 + i),
    total_revenue: '',
    total_revenue_pct: '',
    net_profit: '',
    net_profit_pct: '',
}))

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
    CRITERIA_MASTER.map(master => {
        const found = existing?.find(item => item.no === master.no)

        return {
            ...master,
            remark: found?.remark || '',
            uploaded_file: found?.uploaded_file,
            uploaded_name: found?.uploaded_name,
        }
    })

const normalizeSavedGpr = (raw: any): Partial<GprFormData> | undefined => {
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
        main_product: source.main_product,
        vendor_original_country: source.vendor_original_country,
        sanctions: source.sanctions ?? source.sanctions_status,
        currency: source.currency,
        suggestion: source.suggestion,
        result: source.result ?? source.result_status,
        path: source.path ?? source.document_path,
        vendor_code_selector: source.vendor_code_selector,
        completion_date: source.completion_date,
        sales_profit: source.sales_profit,
        criteria: source.criteria,
    }
}

const buildDefault = (rowData: any, saved?: Partial<GprFormData>): GprFormData => {
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
        vendor_code_selector: saved?.vendor_code_selector || (rowData?.vendor_code || ''),
        completion_date: saved?.completion_date || '',
    }
}

const SectionTitle = ({ no, title, color = 'primary.main' }: { no: string | number; title: string; color?: string }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, mt: 1 }}>
        <Box
            sx={{
                minWidth: 28,
                height: 28,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: color,
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.75rem',
            }}
        >
            {no}
        </Box>
        <Typography variant='subtitle1' fontWeight={700}>{title}</Typography>
        <Divider sx={{ flex: 1 }} />
    </Box>
)

const DialogSubtitle = ({ fallbackName }: { fallbackName?: string }) => {
    const { control } = useFormContext<GprFormData>()
    const companyName = useWatch({ control, name: 'company_name' })

    return (
        <Typography variant='caption' sx={{ opacity: 0.85, display: 'block', mt: 0.5 }}>
            GPR Form A · {companyName || fallbackName || '-'}
        </Typography>
    )
}

const CompanyInfoSection = () => {
    const { register } = useFormContext<GprFormData>()

    return (
        <>
            <SectionTitle no={1} title='Company Name' />
            <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'primary.main' }}>
                <Grid container spacing={2.5}>
                    <Grid item xs={12} md={6}>
                        <CustomTextField fullWidth label='Company Name' placeholder='Enter company name...' {...register('company_name')} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <CustomTextField fullWidth label='Email' placeholder='Enter email...' {...register('email')} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <CustomTextField fullWidth label='PIC' placeholder='Enter PIC name...' {...register('pic_name')} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <CustomTextField fullWidth label='Tel' placeholder='Enter telephone...' {...register('tel')} />
                    </Grid>
                </Grid>
            </Paper>
        </>
    )
}

const SanctionsSection = () => {
    const { control } = useFormContext<GprFormData>()

    return (
        <>
            <SectionTitle no={2} title='List of two political parties subject to sanctions' />
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
                                            size='small'
                                            color='success'
                                            checked={field.value === 'non-concerned'}
                                            onChange={() => field.onChange(field.value === 'non-concerned' ? '' : 'non-concerned')}
                                        />
                                    }
                                    label={<Typography variant='body2' fontWeight={600} color='success.main'>Non-concerned</Typography>}
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            size='small'
                                            color='error'
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
        </>
    )
}

const FinancialSection = () => {
    const { control, register } = useFormContext<GprFormData>()
    const { fields } = useFieldArray({ control, name: 'sales_profit' })
    const salesProfit = useWatch({ control, name: 'sales_profit' }) || []
    const currency = useWatch({ control, name: 'currency' }) || 'THB'

    const chartSeries = [
        { name: 'Total Revenue', type: 'column', data: salesProfit.map(item => parseFloat(item?.total_revenue) || 0) },
        { name: 'Net Profit', type: 'column', data: salesProfit.map(item => parseFloat(item?.net_profit) || 0) },
        {
            name: 'Net Profit Margin %',
            type: 'line',
            data: salesProfit.map(item => {
                const revenue = parseFloat(item?.total_revenue) || 0
                const profit = parseFloat(item?.net_profit) || 0
                return revenue > 0 ? parseFloat((profit / revenue * 100).toFixed(2)) : 0
            }),
        },
    ]

    const chartOptions = {
        chart: {
            id: 'financial-chart-pdf',
            type: 'line' as const,
            height: 270,
            toolbar: { show: false },
            background: 'transparent',
            parentHeightOffset: 0,
        },
        plotOptions: { bar: { columnWidth: '55%', borderRadius: 3 } },
        dataLabels: { enabled: false },
        legend: { position: 'top' as const },
        stroke: { width: [0, 0, 2], curve: 'smooth' as const },
        markers: { size: [0, 0, 4] },
        xaxis: { categories: salesProfit.map(item => item?.year || '') },
        yaxis: [
            { title: { text: `Amount (${currency})` }, labels: { formatter: (value: number) => value.toLocaleString() } },
            { show: false },
            { opposite: true, title: { text: '% Margin' }, labels: { formatter: (value: number) => `${value.toFixed(2)}%` } },
        ],
        colors: ['#7367F0', '#28C76F', '#FF9F43'],
        tooltip: {
            y: [
                { formatter: (value: number) => value.toLocaleString() },
                { formatter: (value: number) => value.toLocaleString() },
                { formatter: (value: number) => `${value.toFixed(2)}%` },
            ],
        },
        grid: { borderColor: '#f0f0f0', padding: { left: 0, right: 0, top: 0, bottom: 0 } },
    }

    return (
        <Grid item xs={12}>
            <Typography variant='caption' fontWeight={700} color='text.secondary' sx={{ mb: 1.5, display: 'block' }}>
                Financial Data - Last 5 Years
            </Typography>
            <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
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
                                {fields.map((field, index) => {
                                    const row = salesProfit[index] || {}
                                    const revenue = parseFloat(row.total_revenue) || 0
                                    const profit = parseFloat(row.net_profit) || 0
                                    const margin = revenue > 0 ? (profit / revenue * 100).toFixed(1) : '-'

                                    return (
                                        <TableRow key={field.id} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                                            <TableCell sx={{ p: '4px' }}>
                                                <TextField
                                                    size='small'
                                                    variant='standard'
                                                    inputProps={{ style: { textAlign: 'center', fontWeight: 700, fontSize: '0.78rem' } }}
                                                    {...register(`sales_profit.${index}.year`)}
                                                    sx={{ width: '100%' }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ p: '4px' }}>
                                                <TextField
                                                    size='small'
                                                    variant='standard'
                                                    placeholder='0'
                                                    type='number'
                                                    {...register(`sales_profit.${index}.total_revenue`)}
                                                    sx={{ width: '100%' }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ p: '4px' }}>
                                                <TextField
                                                    size='small'
                                                    variant='standard'
                                                    placeholder='0'
                                                    type='number'
                                                    {...register(`sales_profit.${index}.net_profit`)}
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
                <Grid item xs={12} md={7}>
                    <Paper variant='outlined' sx={{ p: 0, borderRadius: 1.5, height: '100%', overflow: 'hidden' }}>
                        <ReactApexChart
                            key={salesProfit.map(item => item?.year || '').join(',')}
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
    )
}

const GeneralInfoSection = () => {
    const { control, register } = useFormContext<GprFormData>()

    return (
        <>
            <SectionTitle no={3} title='Company general information' />
            <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'primary.main' }}>
                <Grid container spacing={2.5}>
                    <Grid item xs={12}>
                        <CustomTextField
                            fullWidth
                            label='Address'
                            multiline
                            rows={2}
                            placeholder='Enter address...'
                            {...register('address')}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size='small'>
                            <InputLabel>Business Category</InputLabel>
                            <Controller
                                name='business_category'
                                control={control}
                                render={({ field }) => (
                                    <Select label='Business Category' {...field}>
                                        {BUSINESS_CATEGORIES.map(category => (
                                            <MenuItem key={category} value={category}>{category}</MenuItem>
                                        ))}
                                    </Select>
                                )}
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <CustomTextField fullWidth label='Start Year' placeholder='e.g. 2005' {...register('start_year')} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <CustomTextField fullWidth label='Authorized Capital' placeholder='e.g. 10,000,000 THB' {...register('authorized_capital')} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <CustomTextField fullWidth label='Establish (years)' placeholder='e.g. 15' {...register('establish')} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <CustomTextField fullWidth label='Number of Employees' placeholder='e.g. 150' {...register('number_of_employees')} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <CustomTextField fullWidth label='Manufactured Country' placeholder='e.g. Thailand' {...register('manufactured_country')} />
                    </Grid>
                    <Grid item xs={12}>
                        <CustomTextField fullWidth label='Main Product' multiline rows={2} placeholder='e.g. Cables, Connectors' {...register('main_product')} />
                    </Grid>
                    <FinancialSection />
                    <Grid item xs={12} sm={6}>
                        <CustomTextField fullWidth label="Vendor's Original Country" placeholder='e.g. Japan' {...register('vendor_original_country')} />
                    </Grid>
                </Grid>
            </Paper>
        </>
    )
}

interface CriteriaSectionProps {
    criteriaUploading: Record<number, boolean>
    criteriaError: Record<number, string>
    onUploadClick: (idx: number) => void
    onRemoveUpload: (idx: number) => void
}

const CriteriaSection = ({ criteriaUploading, criteriaError, onUploadClick, onRemoveUpload }: CriteriaSectionProps) => {
    const { control, register } = useFormContext<GprFormData>()
    const { fields } = useFieldArray({ control, name: 'criteria' })
    const criteria = useWatch({ control, name: 'criteria' }) || []

    return (
        <>
            <SectionTitle no={4} title='Criteria for selection' />
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
                            {fields.map((field, index) => {
                                const row = criteria[index] || {}

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
                                                size='small'
                                                variant='standard'
                                                fullWidth
                                                placeholder='remark...'
                                                {...register(`criteria.${index}.remark`)}
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
                                                        <IconButton size='small' onClick={() => onRemoveUpload(index)} sx={{ p: 0.3 }}>
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
                                                        disabled={criteriaUploading[index]}
                                                        startIcon={
                                                            criteriaUploading[index]
                                                                ? <CircularProgress size={12} />
                                                                : <i className='tabler-upload' style={{ fontSize: 13 }} />
                                                        }
                                                        onClick={() => onUploadClick(index)}
                                                        sx={{ fontSize: '0.7rem', py: 0.25 }}
                                                    >
                                                        {criteriaUploading[index] ? 'Uploading...' : 'Upload PDF'}
                                                    </Button>
                                                    {criteriaError[index] && (
                                                        <Typography variant='caption' color='error' sx={{ fontSize: '0.62rem' }}>
                                                            {criteriaError[index]}
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
        </>
    )
}

const SuggestionSection = () => {
    const { control, register } = useFormContext<GprFormData>()
    const criteria = useWatch({ control, name: 'criteria' }) || []
    const needUploaded = criteria.filter(item => item?.criteria === 'Need' && item?.uploaded_file).length
    const optionalUploaded = criteria.filter(item => item?.criteria === 'Optional' && item?.no !== '3.14' && item?.uploaded_file).length

    return (
        <>
            <SectionTitle no={5} title='Suggestion' />
            <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'primary.main' }}>
                <CustomTextField
                    fullWidth
                    label='Suggestion'
                    multiline
                    rows={2}
                    placeholder='Write your suggestion here...'
                    {...register('suggestion')}
                    sx={{ mb: 2 }}
                />

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
                        <strong>-</strong> Manufacturer shall be authorized capital is at least 1MTHB, Establish is at least 3 years and if the goods are raw materials, item no. 3.6-3.7 is recommended.<br />
                        <strong>-</strong> Other business category shall be authorized capital is at least 0.5 MTHB, Establish is at least 1 year.
                    </Typography>
                </Paper>

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
                                            size='small'
                                            color='success'
                                            checked={field.value === 'approval'}
                                            onChange={() => field.onChange(field.value === 'approval' ? '' : 'approval')}
                                        />
                                    }
                                    label={<Typography variant='body2' fontWeight={600} color='success.main'>Approval</Typography>}
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            size='small'
                                            color='error'
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

                <Paper variant='outlined' sx={{ mb: 2, borderRadius: 1.5, overflow: 'hidden' }}>
                    <Typography variant='caption' color='text.secondary' sx={{ display: 'block', p: 1, bgcolor: 'action.hover', fontStyle: 'italic' }}>
                        Signatures are completed on the printed form - this section is for reference only.
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid', borderTopColor: 'divider' }}>
                        {['Selector', 'Checker', 'Checker', 'Approve by'].map((label, index) => (
                            <Box
                                key={label + index}
                                sx={{
                                    p: 1.5,
                                    minHeight: 60,
                                    borderRight: index < 3 ? '1px solid' : 'none',
                                    borderRightColor: 'divider',
                                    textAlign: 'center',
                                }}
                            >
                                <Typography variant='caption' fontWeight={700} display='block'>{label}</Typography>
                                <Typography variant='caption' color='text.disabled' sx={{ fontSize: '0.62rem' }}>
                                    .../.../...
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid', borderTopColor: 'divider' }}>
                        {['Issuer', 'Manager', 'General Manager', 'Managing Director'].map((label, index) => (
                            <Box
                                key={label + index}
                                sx={{
                                    p: 0.75,
                                    textAlign: 'center',
                                    borderRight: index < 3 ? '1px solid' : 'none',
                                    borderRightColor: 'divider',
                                }}
                            >
                                <Typography variant='caption' color='text.secondary'>{label}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Paper>

                <CustomTextField fullWidth label='Path' placeholder='File path / folder reference' {...register('path')} sx={{ mb: 2 }} />

                <Paper variant='outlined' sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'rgba(40,199,111,0.04)' }}>
                    <Typography variant='caption' fontWeight={700} sx={{ display: 'block', mb: 0.5 }}>
                        For Selector :
                    </Typography>
                    <Typography variant='caption' color='text.secondary' fontStyle='italic' sx={{ display: 'block', mb: 1.5 }}>
                        After completing the Supplier/Outsourcing registration, please specify.
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <CustomTextField fullWidth label='Vendor Code' {...register('vendor_code_selector')} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <CustomTextField fullWidth label='Completion Date' type='date' InputLabelProps={{ shrink: true }} {...register('completion_date')} />
                        </Grid>
                    </Grid>
                </Paper>
            </Paper>
        </>
    )
}

interface GprFormDialogProps {
    open: boolean
    rowData: any
    onClose: () => void
    onSaved?: () => void
}

export default function GprFormDialog({ open, rowData, onClose, onSaved }: GprFormDialogProps) {
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

    const handleCriteriaUploadClick = (index: number) => {
        uploadTargetRef.current = index
        fileInputRef.current?.click()
    }

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
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
                setValue(`criteria.${index}.uploaded_file`, file_path, { shouldDirty: true })
                setValue(`criteria.${index}.uploaded_name`, file_name || file.name, { shouldDirty: true })
            } else {
                setCriteriaError(prev => ({ ...prev, [index]: response.data.Message }))
            }
        } catch (error: any) {
            setCriteriaError(prev => ({ ...prev, [index]: error?.response?.data?.Message || 'Upload failed' }))
        } finally {
            setCriteriaUploading(prev => ({ ...prev, [index]: false }))
        }
    }

    const removeCriteriaUpload = (index: number) => {
        setValue(`criteria.${index}.uploaded_file`, '', { shouldDirty: true })
        setValue(`criteria.${index}.uploaded_name`, '', { shouldDirty: true })
    }

    const handleSave = async () => {
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
    }

    const handleExportPdf = async () => {
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
    }

    const isBusy = saving || generatingPdf

    return (
        <FormProvider {...methods}>
            <Dialog
                maxWidth='lg'
                fullWidth
                onClose={(event, reason) => {
                    if (reason !== 'backdropClick' && !isBusy) onClose()
                }}
                TransitionComponent={Transition}
                open={open}
                PaperProps={{ sx: { bgcolor: 'background.default' } }}
                sx={{
                    '& .MuiDialog-paper': { overflow: 'visible' },
                    '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' },
                }}
            >
                <input
                    type='file'
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept='.pdf,.doc,.docx,.jpg,.jpeg,.png'
                    onChange={handleFileChange}
                />

                <DialogTitle sx={{ p: 0, overflow: 'visible' }}>
                    <Box
                        sx={{
                            px: 3,
                            py: 2.5,
                            background: 'linear-gradient(135deg, var(--mui-palette-primary-main) 0%, #7367F0 100%)',
                            color: '#fff',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                        }}
                    >
                        <Box>
                            <Typography variant='h5' fontWeight={800} sx={{ letterSpacing: 0.3 }}>
                                Supplier / Outsourcing Selection Sheet
                            </Typography>
                            <DialogSubtitle fallbackName={rowData?.company_name} />
                        </Box>
                        <DialogCloseButton onClick={() => { if (!isBusy) onClose() }} disableRipple sx={{ color: '#fff' }}>
                            <i className='tabler-x' />
                        </DialogCloseButton>
                    </Box>
                </DialogTitle>

                <DialogContent dividers sx={{ px: 4, py: 3, overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
                    {feedback && (
                        <Alert severity={feedback.type} sx={{ mb: 2 }} onClose={() => setFeedback(null)}>
                            {feedback.msg}
                        </Alert>
                    )}

                    <CompanyInfoSection />
                    <SanctionsSection />
                    <GeneralInfoSection />
                    <CriteriaSection
                        criteriaUploading={criteriaUploading}
                        criteriaError={criteriaError}
                        onUploadClick={handleCriteriaUploadClick}
                        onRemoveUpload={removeCriteriaUpload}
                    />
                    <SuggestionSection />
                </DialogContent>

                <DialogActions sx={{ justifyContent: 'flex-start', px: 3, py: 1.5, gap: 1 }}>
                    <Button
                        variant='tonal'
                        color='primary'
                        onClick={handleSave}
                        disabled={isBusy}
                        startIcon={saving ? <CircularProgress size={14} /> : <i className='tabler-device-floppy' style={{ fontSize: 16 }} />}
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                        variant='contained'
                        color='primary'
                        onClick={handleExportPdf}
                        disabled={isBusy}
                        startIcon={generatingPdf ? <CircularProgress size={14} color='inherit' /> : <i className='tabler-file-type-pdf' style={{ fontSize: 16 }} />}
                    >
                        {generatingPdf ? 'Generating...' : 'Save & Export PDF'}
                    </Button>
                    <Button variant='tonal' color='secondary' onClick={onClose} disabled={isBusy}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </FormProvider>
    )
}
