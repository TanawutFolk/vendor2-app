import React, { forwardRef, useMemo } from 'react'
import type { ReactElement, Ref } from 'react'
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
import {
    Controller,
    FormProvider,
    useFieldArray,
    useFormContext,
    useWatch,
} from 'react-hook-form'
import { useGprForm, BUSINESS_CATEGORIES } from './useGprForm'
import type { GprFormData, GprFormDialogProps } from './useGprForm'
import {
    inferStepCode,
    isAccountStep,
    isAgreementReachedStep,
    isIssueGprBStep,
    isIssueGprCStep,
    isPendingAgreementStep,
} from '@_workspace/utils/requestWorkflow'

// Re-export types so existing consumers (e.g. GprPdfDocument) keep working
export type { GprFormData, SalesProfitYear, GprCriteria } from './useGprForm'

const Transition = forwardRef(function Transition(
    props: SlideProps & { children?: ReactElement<any, any> },
    ref: Ref<unknown>
) {
    return <Slide direction='down' ref={ref} {...props} />
})

// ── Static UI helper ──────────────────────────────────────────────────────────

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

const DisabledBlock = ({ disabled, children }: { disabled: boolean; children: React.ReactNode }) => (
    <Box
        component='fieldset'
        disabled={disabled}
        sx={{
            border: 0,
            p: 0,
            m: 0,
            minWidth: 0,
        }}
    >
        {children}
    </Box>
)

type SignatureSlot = {
    role: string
    code: string
    signature: string
    date: string
}

// ── Memoized Section Components ───────────────────────────────────────────────

const DialogSubtitle = React.memo(({ fallbackName }: { fallbackName?: string }) => {
    const { control } = useFormContext<GprFormData>()
    const companyName = useWatch({ control, name: 'company_name' })

    return (
        <Typography variant='caption' sx={{ opacity: 0.85, display: 'block', mt: 0.5 }}>
            GPR Form A · {companyName || fallbackName || '-'}
        </Typography>
    )
})

const CompanyInfoSection = React.memo(() => {
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
})

const SanctionsSection = React.memo(() => {
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
})

const FinancialSection = React.memo(() => {
    const { control, register } = useFormContext<GprFormData>()
    const { fields } = useFieldArray({ control, name: 'sales_profit' })
    const salesProfit = useWatch({ control, name: 'sales_profit' }) || []
    const currency = useWatch({ control, name: 'currency' }) || 'THB'

    const chartSeries = useMemo(() => [
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
    ], [salesProfit])

    const chartOptions = useMemo(() => ({
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
    }), [salesProfit, currency])

    const chartKey = useMemo(
        () => salesProfit.map(item => item?.year || '').join(','),
        [salesProfit]
    )

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
                                                        <MenuItem value='CNY'>CNY</MenuItem>
                                                        <MenuItem value='EUR'>EUR</MenuItem>
                                                        <MenuItem value='JPY'>GBP</MenuItem>
                                                        <MenuItem value='CNY'>HKD</MenuItem>
                                                        <MenuItem value='CNY'>JPY</MenuItem>
                                                        <MenuItem value='CNY'>SGD</MenuItem>
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
                            key={chartKey}
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
})

const GeneralInfoSection = React.memo(() => {
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
})

const GprCNotificationSection = React.memo(() => {
    const { register } = useFormContext<GprFormData>()

    return (
        <>
            <SectionTitle no='C' title='GPR C Notification Setup' color='warning.main' />
            <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'warning.main' }}>
                <Grid container spacing={2.5}>
                    <Grid item xs={12}>
                        <Alert severity='warning' sx={{ py: 0 }}>
                            Used when the workflow escalates from GPR B to GPR C. The system will email checker and the configured GPR C approver automatically.
                        </Alert>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <CustomTextField fullWidth label='GPR C Approver Name' placeholder='Enter approver name...' {...register('gpr_c_approver_name')} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <CustomTextField fullWidth label='GPR C Approver Email' placeholder='name@example.com' {...register('gpr_c_approver_email')} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <CustomTextField fullWidth label='PC PIC Name' placeholder='Enter PC PIC name...' {...register('gpr_c_pc_pic_name')} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <CustomTextField fullWidth label='PC PIC Email' placeholder='name@example.com' {...register('gpr_c_pc_pic_email')} />
                    </Grid>
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Grid item xs={12} md={6} key={index}>
                            <CustomTextField
                                fullWidth
                                label={`Circular Email ${index + 1}`}
                                placeholder='optional@example.com'
                                {...register(`gpr_c_circular_list.${index}` as const)}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Paper>
        </>
    )
})

interface CriteriaSectionProps {
    criteriaUploading: Record<number, boolean>
    criteriaError: Record<number, string>
    onUploadClick: (idx: number) => void
    onRemoveUpload: (idx: number) => void
}

const CriteriaSection = React.memo(({ criteriaUploading, criteriaError, onUploadClick, onRemoveUpload }: CriteriaSectionProps) => {
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
})

/** Isolated sub-component: only re-renders when criteria uploaded_file values change */
const CriteriaStats = React.memo(() => {
    const { control } = useFormContext<GprFormData>()
    const criteria = useWatch({ control, name: 'criteria' }) || []
    const needUploaded = criteria.filter(item => item?.criteria === 'Need' && item?.uploaded_file).length
    const optionalUploaded = criteria.filter(item => item?.criteria === 'Optional' && item?.no !== '3.14' && item?.uploaded_file).length

    return (
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
    )
})

const SuggestionSection = React.memo(
    ({
        accountVendorCodeOnly = false,
        readOnly = false,
        signatures = [],
    }: {
        accountVendorCodeOnly?: boolean
        readOnly?: boolean
        signatures?: SignatureSlot[]
    }) => {
    const { control, register } = useFormContext<GprFormData>()
    const disableSuggestionInputs = accountVendorCodeOnly || readOnly

    return (
        <>
            <SectionTitle no={5} title='Suggestion' />
            <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'primary.main' }}>
                <DisabledBlock disabled={disableSuggestionInputs}>
                    <CustomTextField
                        fullWidth
                        label='Suggestion'
                        multiline
                        rows={2}
                        placeholder='Write your suggestion here...'
                        {...register('suggestion')}
                        sx={{ mb: 2 }}
                    />

                    <CriteriaStats />

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
                            {signatures.map((item, index) => (
                                <Box
                                    key={item.role + index}
                                    sx={{
                                        p: 1.5,
                                        minHeight: 60,
                                        borderRight: index < 3 ? '1px solid' : 'none',
                                        borderRightColor: 'divider',
                                        textAlign: 'center',
                                    }}
                                >
                                    <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.65rem', display: 'block', lineHeight: 1.1 }}>
                                        {item.code || '-'}
                                    </Typography>
                                    <Typography variant='caption' fontWeight={700} display='block' sx={{ letterSpacing: 0.5 }}>
                                        {item.signature || '-'}
                                    </Typography>
                                    <Typography variant='caption' color='text.disabled' sx={{ fontSize: '0.7rem' }}>
                                        {item.date || 'DD/MM/YYYY'}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid', borderTopColor: 'divider' }}>
                            {signatures.map((item, index) => (
                                <Box
                                    key={`${item.role}-label-${index}`}
                                    sx={{
                                        p: 0.75,
                                        textAlign: 'center',
                                        borderRight: index < 3 ? '1px solid' : 'none',
                                        borderRightColor: 'divider',
                                    }}
                                >
                                    <Typography variant='caption' color='text.secondary'>{item.role}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>

                    <CustomTextField fullWidth label='Path' placeholder='File path / folder reference' {...register('path')} sx={{ mb: 2 }} />
                </DisabledBlock>

                <Paper variant='outlined' sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'rgba(40,199,111,0.04)' }}>
                    <Typography variant='caption' fontWeight={700} sx={{ display: 'block', mb: 0.5 }}>
                        For Selector :
                    </Typography>
                    <Typography variant='caption' color='text.secondary' fontStyle='italic' sx={{ display: 'block', mb: 1.5 }}>
                        After completing the Supplier/Outsourcing registration, please specify.
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <CustomTextField fullWidth label='Vendor Code' disabled={readOnly} {...register('vendor_code_selector')} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <CustomTextField
                                fullWidth
                                label='Completion Date'
                                type='date'
                                disabled={disableSuggestionInputs}
                                InputLabelProps={{ shrink: true }}
                                {...register('completion_date')}
                            />
                        </Grid>
                    </Grid>
                </Paper>
            </Paper>
        </>
    )
})

// ── Main Dialog Component ─────────────────────────────────────────────────────

export default function GprFormDialog({ open, rowData, onClose, onSaved, readOnly = false }: GprFormDialogProps) {
    const {
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
    } = useGprForm({ open, rowData, onClose, onSaved })

    const approvalSteps = useMemo(() => {
        const rawSteps = rowData?.approval_steps

        if (Array.isArray(rawSteps)) return rawSteps
        if (typeof rawSteps === 'string') {
            try {
                return JSON.parse(rawSteps)
            } catch {
                return []
            }
        }

        return []
    }, [rowData?.approval_steps])

    const isAccountVendorCodeOnlyMode = useMemo(() => {
        const currentStep = approvalSteps.find((s: any) => s?.step_status === 'in_progress')
        return isAccountStep(currentStep)
    }, [approvalSteps])

    const isReadOnlyMode = readOnly && !isAccountVendorCodeOnlyMode
    const currentStep = useMemo(() => approvalSteps.find((s: any) => s?.step_status === 'in_progress'), [approvalSteps])
    const showGprCNotificationSection = useMemo(() => (
        isPendingAgreementStep(currentStep)
        || isAgreementReachedStep(currentStep)
        || isIssueGprBStep(currentStep)
        || isIssueGprCStep(currentStep)
    ), [currentStep])

    const signatureSlots = useMemo<SignatureSlot[]>(() => {
        const approvedStatuses = new Set(['approved', 'completed'])

        const formatSignatureName = (fullName?: string, fallbackCode?: string) => {
            const source = (fullName || '').trim()
            if (!source) return (fallbackCode || '').trim()

            const parts = source.split(/\s+/).filter(Boolean)
            if (parts.length < 2) return source.toUpperCase()

            const firstName = parts[0]
            const lastName = parts[parts.length - 1]
            return `${lastName.toUpperCase()} ${firstName.charAt(0).toUpperCase()}.`
        }

        const formatDate = (rawDate?: string) => {
            if (!rawDate) return ''
            const d = new Date(rawDate)
            if (Number.isNaN(d.getTime())) return ''

            const dd = String(d.getDate()).padStart(2, '0')
            const mm = String(d.getMonth() + 1).padStart(2, '0')
            const yyyy = d.getFullYear()
            return `${dd}/${mm}/${yyyy}`
        }

        const findLatestApprovedStep = (targetCode: string) => {
            const matched = approvalSteps.filter((step: any) => {
                const status = String(step?.step_status || '').toLowerCase()
                if (!approvedStatuses.has(status)) return false

                return inferStepCode(step) === targetCode
            })

            matched.sort((a: any, b: any) => {
                const orderDiff = Number(b?.step_order || 0) - Number(a?.step_order || 0)
                if (orderDiff !== 0) return orderDiff

                const aTime = new Date(a?.UPDATE_DATE || a?.CREATE_DATE || 0).getTime()
                const bTime = new Date(b?.UPDATE_DATE || b?.CREATE_DATE || 0).getTime()
                return bTime - aTime
            })

            return matched[0]
        }

        const mapSlot = (role: string, step: any): SignatureSlot => ({
            role,
            code: String(step?.approver_id || '').trim(),
            signature: formatSignatureName(step?.approver_name, step?.approver_id),
            date: formatDate(step?.UPDATE_DATE || step?.CREATE_DATE),
        })

        return [
            mapSlot('Issuer', findLatestApprovedStep('PIC_REVIEW')),
            mapSlot('Manager', findLatestApprovedStep('PO_MGR_APPROVAL')),
            mapSlot('General Manager', findLatestApprovedStep('PO_GM_APPROVAL')),
            mapSlot('Managing Director', findLatestApprovedStep('MD_APPROVAL')),
        ]
    }, [approvalSteps])

    return (
        <FormProvider {...methods}>
            <Dialog
                maxWidth='lg'
                fullWidth
                onClose={handleDialogClose}
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
                        <DialogCloseButton onClick={handleCloseClick} disableRipple sx={{ color: '#fff' }}>
                            <i className='tabler-x' />
                        </DialogCloseButton>
                    </Box>
                </DialogTitle>

                <DialogContent dividers sx={{ px: 4, py: 3, overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
                    {feedback && (
                        <Alert severity={feedback.type} sx={{ mb: 2 }} onClose={clearFeedback}>
                            {feedback.msg}
                        </Alert>
                    )}

                    {isReadOnlyMode && (
                        <Alert severity='info' sx={{ mb: 2 }}>
                            This sheet is in read-only mode at the current workflow step.
                        </Alert>
                    )}

                    <DisabledBlock disabled={isAccountVendorCodeOnlyMode || isReadOnlyMode}>
                        <CompanyInfoSection />
                        <SanctionsSection />
                        <GeneralInfoSection />
                        {showGprCNotificationSection && <GprCNotificationSection />}
                        <CriteriaSection
                            criteriaUploading={criteriaUploading}
                            criteriaError={criteriaError}
                            onUploadClick={handleCriteriaUploadClick}
                            onRemoveUpload={removeCriteriaUpload}
                        />
                    </DisabledBlock>
                    <SuggestionSection accountVendorCodeOnly={isAccountVendorCodeOnlyMode} readOnly={isReadOnlyMode} signatures={signatureSlots} />
                </DialogContent>

                <DialogActions sx={{ justifyContent: 'flex-start', px: 3, py: 1.5, gap: 1 }}>
                    <Button
                        variant='tonal'
                        color='primary'
                        onClick={handleSave}
                        disabled={isBusy || isReadOnlyMode}
                        startIcon={saving ? <CircularProgress size={14} /> : <i className='tabler-device-floppy' style={{ fontSize: 16 }} />}
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                        variant='contained'
                        color='primary'
                        onClick={handleExportPdf}
                        disabled={isBusy || isReadOnlyMode}
                        startIcon={generatingPdf ? <CircularProgress size={14} color='inherit' /> : <i className='tabler-file-type-pdf' style={{ fontSize: 16 }} />}
                    >
                        {generatingPdf ? 'Generating...' : 'Save & Export PDF'}
                    </Button>
                    <Button variant='tonal' color='secondary' onClick={handleCloseClick} disabled={isBusy}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </FormProvider>
    )
}
