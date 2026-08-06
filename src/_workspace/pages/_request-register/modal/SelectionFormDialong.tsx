import type { SignatureSlot, CriteriaSectionProps } from '@/_workspace/types/_request-register/RequestRegisterTypes'
import React, { forwardRef, useEffect, useMemo, useState } from 'react'
import type { ReactElement, Ref } from 'react'
import type { SlideProps } from '@mui/material'
import {
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
  Paper,
  Slide,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material'
import CustomTextField from '@components/mui/TextField'
import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import SkeletonCustom from '@components/SkeletonCustom'
import AsyncSelectCustom from '@components/react-select/AsyncSelectCustom'
import ConfirmModal from '@components/ConfirmModal'
import ReactApexChart from 'react-apexcharts'
import { Controller, FormProvider, useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { fetchBusinessCategories } from '@/_workspace/react-select/async-promise-load-options/request-register/fetchBusinessCategories'
import type { BusinessCategoryOption } from '@/_workspace/react-select/async-promise-load-options/request-register/fetchBusinessCategories'
import { fetchCurrencies } from '@/_workspace/react-select/async-promise-load-options/request-register/fetchCurrencies'
import { fetchCountries } from '@/_workspace/react-select/async-promise-load-options/find-vendor/fetchCountries'
import type { CurrencyOption } from '@/_workspace/react-select/async-promise-load-options/request-register/fetchCurrencies'
import type { CountryOption } from '@/_workspace/react-select/async-promise-load-options/find-vendor/fetchCountries'
import { useSelectionForm, MAX_CRITERIA_FILES, PENDING_UPLOAD_PREFIX } from './useSelectionForm'
import type {
  SelectionFormData,
  SelectionFormDialongProps,
  SelectionFormMode,
  SanctionsCheckState
} from './useSelectionForm'
import FileViewerDialog from './FileViewerDialog'
import { buildSelectionFileUrl } from '../components/shared'
import { ToastMessageError } from '@/components/ToastMessage'
import { getVendorCodePrefix, isAccountStep } from '@/_workspace/utils/requestWorkflow'
import useWorkflowIdentity from '@/_workspace/hooks/useWorkflowIdentity'
import { buildSelectionSignatureSlots } from '@/_workspace/utils/selectionSignature'

// Re-export types so existing consumers (e.g. GprPdfDocument) keep working
export type { SelectionFormData, SalesProfitYear, GprCriteria } from './useSelectionForm'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='down' ref={ref} {...props} />
})

// ── Static UI helper ──────────────────────────────────────────────────────────

const SectionTitle = ({
  no,
  title,
  color = 'primary.main'
}: {
  no: string | number
  title: string
  color?: string
}) => (
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
        fontSize: '0.75rem'
      }}
    >
      {no}
    </Box>
    <Typography variant='subtitle1' fontWeight={700}>
      {title}
    </Typography>
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
      minWidth: 0
    }}
  >
    {children}
  </Box>
)

// ── Memoized Section Components ───────────────────────────────────────────────

const DialogSubtitle = React.memo(({ fallbackName }: { fallbackName?: string }) => {
  const { control } = useFormContext<SelectionFormData>()
  const companyName = useWatch({ control, name: 'company_name' })

  return (
    <Typography variant='caption' sx={{ opacity: 0.85, display: 'block', mt: 0.5 }}>
      {companyName || fallbackName || '-'}
    </Typography>
  )
})

const CompanyInfoSection = React.memo(() => {
  const { register } = useFormContext<SelectionFormData>()

  return (
    <>
      <SectionTitle no={1} title='Company Name' />
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'primary.main' }}>
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <CustomTextField
              fullWidth
              label='Company Name'
              placeholder='Enter company name...'
              {...register('company_name')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <CustomTextField fullWidth label='PIC' placeholder='Enter PIC name...' {...register('pic_name')} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <CustomTextField fullWidth label='Tel' placeholder='Enter telephone...' {...register('tel')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomTextField fullWidth label='Email' placeholder='Enter email...' {...register('email')} />
          </Grid>
        </Grid>
      </Paper>
    </>
  )
})

const SanctionsSection = React.memo(
  ({
    checking,
    checkState,
    onRecheck
  }: {
    checking: boolean
    checkState: SanctionsCheckState | null
    onRecheck: () => void
  }) => {
    const { control } = useFormContext<SelectionFormData>()
    const checkedAt = checkState?.checkedAt ? new Date(checkState.checkedAt).toLocaleString() : ''
    const hasMatches = Boolean(checkState?.matches.length)
    const autoSanctions = checkState ? (hasMatches ? 'concerned' : 'non-concerned') : ''

    return (
      <>
        <SectionTitle no={2} title='List of two political parties subject to sanctions' />
        <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'primary.main' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 2,
              flexWrap: 'wrap'
            }}
          >
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
                        <Checkbox size='small' color='success' checked={field.value === 'non-concerned'} disabled />
                      }
                      label={
                        <Typography variant='body2' fontWeight={600} color='success.main'>
                          Non-concerned
                        </Typography>
                      }
                    />
                    <FormControlLabel
                      control={<Checkbox size='small' color='error' checked={field.value === 'concerned'} disabled />}
                      label={
                        <Typography variant='body2' fontWeight={600} color='error.main'>
                          Concerned
                        </Typography>
                      }
                    />
                  </Box>
                )}
              />
            </FormControl>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {hasMatches && (
                <Chip
                  size='small'
                  color='error'
                  variant='tonal'
                  label={`${checkState?.matches.length || 0} blacklist match(es)`}
                />
              )}
              <Button size='small' variant='tonal' color='primary' onClick={onRecheck} disabled={checking}>
                {checking ? 'Checking...' : 'Re-check Blacklist'}
              </Button>
            </Box>
          </Box>
          {checkState && (
            <Box sx={{ mt: 1.5 }}>
              {hasMatches && (
                <Typography variant='caption' color='error.main' sx={{ display: 'block' }}>
                  {checkState.message}
                </Typography>
              )}
              {checkedAt && (
                <Typography variant='caption' color='text.disabled'>
                  Last checked: {checkedAt}
                </Typography>
              )}
            </Box>
          )}
          {hasMatches && (
            <Box sx={{ overflowX: 'auto', mt: 2 }}>
              <Table size='small' sx={{ minWidth: 640 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>List</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Matched Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Match Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Source</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Entity No.</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {checkState?.matches.map((match, idx) => (
                    <TableRow key={`${match.GROUP_CODE}-${match.MATCHED_NAME}-${idx}`}>
                      <TableCell>
                        <Chip
                          label={match.GROUP_CODE}
                          size='small'
                          color={match.GROUP_CODE === 'US' ? 'primary' : 'warning'}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'error.main' }}>{match.MATCHED_NAME}</TableCell>
                      <TableCell>{match.MATCH_TYPE === 'alias' ? 'Alias' : 'Primary Name'}</TableCell>
                      <TableCell>{match.SOURCE_NAME || '-'}</TableCell>
                      <TableCell>{match.ENTITY_NUMBER || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </Paper>
      </>
    )
  }
)

const parseFinancialNumber = (value: unknown) => {
  const normalized = String(value ?? '')
    .replace(/,/g, '')
    .trim()
  const parsed = Number(normalized)

  return Number.isFinite(parsed) ? parsed : 0
}

const calculateMarginPercent = (revenueValue: unknown, profitValue: unknown) => {
  const revenue = parseFinancialNumber(revenueValue)
  const profit = parseFinancialNumber(profitValue)

  return revenue > 0 ? (profit / revenue) * 100 : null
}

const formatMarginPercent = (value: number | null | undefined) => {
  if (value === null || value === undefined || !Number.isFinite(value)) return '-'
  if (value === 0) return '0.00%'
  if (Math.abs(value) < 0.01) return '< 0.01%'
  if (Math.abs(value) < 1) return `${value.toFixed(3)}%`
  return `${value.toFixed(2)}%`
}

const getSeriesName = (element: Element) => String(element.getAttribute('seriesName') || '').replace(/%20/g, ' ')

const isSeriesGroup = (element: Element, seriesName: string, realIndex: string, rel: string) => {
  const currentSeriesName = getSeriesName(element)
  return (
    currentSeriesName === seriesName ||
    element.getAttribute('data:realIndex') === realIndex ||
    element.getAttribute('rel') === rel
  )
}

const resetTransform = (element: Element) => {
  const svgElement = element as SVGGraphicsElement
  const baseTransform = element.getAttribute('data-base-transform')
  if (baseTransform !== null) {
    svgElement.setAttribute('transform', baseTransform)
  }
}

const applyTranslateX = (element: Element, offsetX: number) => {
  const svgElement = element as SVGGraphicsElement
  let baseTransform = element.getAttribute('data-base-transform')

  if (baseTransform === null) {
    baseTransform = element.getAttribute('transform') || ''
    element.setAttribute('data-base-transform', baseTransform)
  }

  svgElement.setAttribute('transform', `${baseTransform} translate(${offsetX}, 0)`.trim())
}

const getVisibleBounds = (element: Element) => {
  const rect = element.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0 ? rect : null
}

const findFirstVisibleMarker = (groups: Element[]) => {
  const markerSelectors = [
    '.apexcharts-series-markers .apexcharts-marker',
    '.apexcharts-series-markers circle',
    '.apexcharts-marker'
  ]

  for (const selector of markerSelectors) {
    const marker = groups
      .flatMap(group => Array.from(group.querySelectorAll(selector)))
      .find(element => getVisibleBounds(element))

    if (marker) return marker
  }

  return undefined
}

const alignMarginLineToNetProfitBars = (chartContext?: any) => {
  const root = chartContext?.el as HTMLElement | undefined
  if (!root) return

  window.requestAnimationFrame(() => {
    const seriesGroups = Array.from(root.querySelectorAll('.apexcharts-series'))
    const netProfitGroup = seriesGroups.find(group => isSeriesGroup(group, 'Net Profit', '1', '2'))
    const marginGroups = seriesGroups.filter(group => isSeriesGroup(group, 'Net Profit Margin %', '2', '3'))
    const marginLabelGroups = Array.from(root.querySelectorAll('.apexcharts-datalabels')).filter(group =>
      isSeriesGroup(group, 'Net Profit Margin %', '2', '3')
    )
    const targetGroups = [...marginGroups, ...marginLabelGroups]

    targetGroups.forEach(resetTransform)

    const netProfitBars = Array.from(netProfitGroup?.querySelectorAll('path, rect') || []).filter(element =>
      getVisibleBounds(element)
    )
    const marginMarker = findFirstVisibleMarker(marginGroups)

    const firstNetProfitBar = netProfitBars[0]
    if (!firstNetProfitBar || !marginMarker) return

    const barRect = getVisibleBounds(firstNetProfitBar)
    const markerRect = getVisibleBounds(marginMarker)
    if (!barRect || !markerRect) return

    const offsetX = barRect.left + barRect.width / 2 - (markerRect.left + markerRect.width / 2)

    if (!Number.isFinite(offsetX) || Math.abs(offsetX) < 0.5) return
    targetGroups.forEach(group => applyTranslateX(group, offsetX))
  })
}

const FinancialSection = React.memo(({ mode = 'Edit' }: { mode?: SelectionFormMode }) => {
  const { control, register } = useFormContext<SelectionFormData>()
  const { fields } = useFieldArray({ control, name: 'sales_profit' })
  const salesProfit = useWatch({ control, name: 'sales_profit' }) || []
  const currency = useWatch({ control, name: 'currency' }) || 'THB'

  const marginPercents = useMemo(
    () => salesProfit.map(item => calculateMarginPercent(item?.total_revenue, item?.net_profit)),
    [salesProfit]
  )

  const chartAmountBounds = useMemo(() => {
    const amounts = salesProfit.flatMap(item => [
      parseFinancialNumber(item?.total_revenue),
      parseFinancialNumber(item?.net_profit)
    ])
    const minAmount = Math.min(...amounts, 0)
    const maxAmount = Math.max(...amounts, 0)
    const maxAbsoluteAmount = Math.max(Math.abs(minAmount), Math.abs(maxAmount))

    if (maxAbsoluteAmount <= 0) {
      return { min: 0, max: undefined, scale: undefined }
    }

    const magnitude = Math.pow(10, Math.max(0, Math.floor(Math.log10(maxAbsoluteAmount)) - 1))
    const min = minAmount < 0 ? Math.floor(minAmount / magnitude) * magnitude : 0
    const max = maxAmount > 0 ? Math.ceil(maxAmount / magnitude) * magnitude : 0

    return { min, max, scale: Math.max(Math.abs(min), Math.abs(max)) }
  }, [salesProfit])

  const chartSeries = useMemo(
    () => [
      {
        name: 'Total Revenue',
        type: 'column',
        data: salesProfit.map(item => parseFinancialNumber(item?.total_revenue))
      },
      { name: 'Net Profit', type: 'column', data: salesProfit.map(item => parseFinancialNumber(item?.net_profit)) },
      {
        name: 'Net Profit Margin %',
        type: 'line',
        data: salesProfit.map(item => {
          const revenue = parseFinancialNumber(item?.total_revenue)
          return revenue > 0 ? parseFinancialNumber(item?.net_profit) : null
        })
      }
    ],
    [salesProfit]
  )

  const chartOptions = useMemo(
    () => ({
      chart: {
        id: 'financial-chart-pdf',
        type: 'bar' as const,
        height: 270,
        toolbar: { show: false },
        zoom: { enabled: false },
        selection: { enabled: false },
        background: 'transparent',
        parentHeightOffset: 0,
        events: {
          mounted: (chartContext: any, config: any) => alignMarginLineToNetProfitBars(config?.ctx || chartContext),
          updated: (chartContext: any, config: any) => alignMarginLineToNetProfitBars(config?.ctx || chartContext),
          animationEnd: (chartContext: any, config: any) => alignMarginLineToNetProfitBars(config?.ctx || chartContext)
        }
      },
      plotOptions: { bar: { columnWidth: '55%', borderRadius: 3 } },
      dataLabels: {
        enabled: true,
        enabledOnSeries: [2],
        offsetY: -8,
        background: {
          enabled: true,
          borderRadius: 3,
          borderWidth: 0,
          opacity: 0.9,
          padding: 3
        },
        style: {
          fontSize: '10px',
          fontWeight: 700,
          colors: ['#FF9F43']
        },
        formatter: (_value: unknown, opts?: any) => {
          const margin = marginPercents[Number(opts?.dataPointIndex) || 0]
          return formatMarginPercent(margin)
        }
      },
      legend: { position: 'top' as const },
      stroke: { width: [0, 0, 2], curve: 'smooth' as const },
      markers: { size: [0, 0, 4] },
      xaxis: { categories: salesProfit.map(item => item?.year || '') },
      yaxis: [
        {
          seriesName: 'Total Revenue',
          min: chartAmountBounds.min,
          max: chartAmountBounds.max,
          title: { text: `Amount (${currency})` },
          labels: { formatter: (value: number) => value.toLocaleString() }
        },
        {
          seriesName: 'Net Profit',
          min: chartAmountBounds.min,
          max: chartAmountBounds.max,
          show: false
        },
        {
          opposite: true,
          seriesName: 'Net Profit Margin %',
          min: chartAmountBounds.min,
          max: chartAmountBounds.max,
          tickAmount: 5,
          title: { text: '% Margin' },
          labels: {
            formatter: (value: number) => {
              if (!chartAmountBounds.scale) return '-'
              return formatMarginPercent((value / chartAmountBounds.scale) * 100)
            }
          }
        }
      ],
      colors: ['#7367F0', '#28C76F', '#FF9F43'],
      tooltip: {
        y: [
          { formatter: (value: number) => value.toLocaleString() },
          { formatter: (value: number) => value.toLocaleString() },
          {
            formatter: (_value: unknown, opts?: any) => {
              const margin = marginPercents[Number(opts?.dataPointIndex) || 0]
              return formatMarginPercent(margin)
            }
          }
        ]
      },
      grid: { borderColor: '#f0f0f0', padding: { left: 0, right: 0, top: 0, bottom: 0 } }
    }),
    [salesProfit, currency, marginPercents, chartAmountBounds]
  )

  const chartKey = useMemo(
    () =>
      [
        currency,
        ...salesProfit.flatMap(item => [item?.year || '', item?.total_revenue || '', item?.net_profit || ''])
      ].join('|'),
    [currency, salesProfit]
  )

  return (
    <Grid item xs={12}>
      <Typography variant='caption' fontWeight={700} color='text.secondary' sx={{ mb: 1.5, display: 'block' }}>
        Financial Data - Last 5 Years
      </Typography>
      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid item xs={12} md={5}>
          <TableContainer
            component={Paper}
            variant='outlined'
            sx={{ borderRadius: 1.5, overflow: 'hidden', height: '100%' }}
          >
            <Table size='small' sx={{ tableLayout: 'fixed' }}>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', width: '20%', p: '6px 4px' }}>Year</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', width: '30%', p: '6px 4px' }}>
                    Revenue
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', width: '30%', p: '6px 4px' }}>
                    Net Profit
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, fontSize: '0.72rem', width: '20%', p: '6px 2px', color: 'success.main' }}
                  >
                    Margin
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.map((field, index) => {
                  const row = salesProfit[index] || {}
                  const revenue = parseFinancialNumber(row.total_revenue)
                  const profit = parseFinancialNumber(row.net_profit)
                  const isProfitExceedsRevenue = revenue > 0 && profit > revenue
                  const margin = formatMarginPercent(calculateMarginPercent(row.total_revenue, row.net_profit))

                  return (
                    <TableRow key={field.id} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                      <TableCell sx={{ p: '4px' }}>
                        <CustomTextField
                          size='small'
                          inputProps={{ style: { textAlign: 'center', fontWeight: 700, fontSize: '0.78rem' } }}
                          {...register(`sales_profit.${index}.year`)}
                          sx={{ width: '100%' }}
                        />
                      </TableCell>
                      <TableCell sx={{ p: '4px' }}>
                        <CustomTextField
                          size='small'
                          placeholder='0'
                          type='number'
                          {...register(`sales_profit.${index}.total_revenue`)}
                          sx={{ width: '100%' }}
                        />
                      </TableCell>
                      <TableCell sx={{ p: '4px' }}>
                        <CustomTextField
                          size='small'
                          placeholder='0'
                          type='number'
                          error={isProfitExceedsRevenue}
                          helperText={isProfitExceedsRevenue ? 'เกิน Revenue' : undefined}
                          FormHelperTextProps={{ sx: { fontSize: '0.6rem', mx: 0, mt: 0.25 } }}
                          {...register(`sales_profit.${index}.net_profit`)}
                          sx={{ width: '100%' }}
                        />
                      </TableCell>
                      <TableCell align='center' sx={{ p: '4px 2px' }}>
                        <Typography
                          variant='caption'
                          fontWeight={700}
                          color={isProfitExceedsRevenue ? 'error.main' : 'success.main'}
                        >
                          {margin}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )
                })}
                <TableRow>
                  <TableCell colSpan={4} sx={{ p: '6px 8px', borderBottom: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }}>
                      <Typography variant='caption' fontWeight={600}>
                        Currency:
                      </Typography>
                      <Controller
                        name='currency'
                        control={control}
                        render={({ field: { value, onChange, ...field } }) => (
                          <Box sx={{ minWidth: 110, mb: 0.5 }}>
                            <AsyncSelectCustom<CurrencyOption>
                              {...field}
                              isDisabled={mode === 'View'}
                              label=' '
                              placeholder='Select ...'
                              defaultOptions
                              cacheOptions
                              isClearable={false}
                              classNamePrefix='select'
                              loadOptions={fetchCurrencies}
                              value={value ? { value, label: value } : null}
                              onChange={val => onChange(val?.value || 'THB')}
                            />
                          </Box>
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

const GeneralInfoSection = React.memo(({ mode = 'Edit' }: { mode?: SelectionFormMode }) => {
  const { control, register } = useFormContext<SelectionFormData>()

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
          <Grid item xs={12} sm={4}>
            <Controller
              name='business_category'
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <AsyncSelectCustom<BusinessCategoryOption>
                  {...field}
                  isDisabled={mode === 'View'}
                  label='Business Category'
                  placeholder='Select ...'
                  defaultOptions
                  cacheOptions
                  isClearable
                  classNamePrefix='select'
                  loadOptions={fetchBusinessCategories}
                  value={value ? { value, label: value } : null}
                  onChange={val => onChange(val?.value || '')}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <CustomTextField fullWidth label='Start Year' placeholder='e.g. 2005' {...register('start_year')} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <CustomTextField
              fullWidth
              label='Authorized Capital'
              placeholder='e.g. 10,000,000 THB'
              {...register('authorized_capital')}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <CustomTextField fullWidth label='Establish (years)' placeholder='e.g. 15' {...register('establish')} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <CustomTextField
              fullWidth
              label='Number of Employees'
              placeholder='e.g. 150'
              {...register('number_of_employees')}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Controller
              name='manufactured_country'
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <AsyncSelectCustom<CountryOption>
                  {...field}
                  isDisabled={mode === 'View'}
                  label='Manufactured Country'
                  placeholder='Select ...'
                  defaultOptions
                  cacheOptions
                  isClearable
                  classNamePrefix='select'
                  loadOptions={fetchCountries}
                  value={value ? { value, label: value } : null}
                  onChange={val => onChange(val?.value || '')}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              fullWidth
              label='Main Product'
              multiline
              rows={2}
              placeholder='e.g. Cables, Connectors'
              {...register('main_product')}
            />
          </Grid>
          <FinancialSection mode={mode} />
          <Grid item xs={12} sm={6}>
            <Controller
              name='vendor_original_country'
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <AsyncSelectCustom<CountryOption>
                  {...field}
                  isDisabled={mode === 'View'}
                  label="Vendor's Original Country"
                  placeholder='Select ...'
                  defaultOptions
                  cacheOptions
                  isClearable
                  classNamePrefix='select'
                  loadOptions={fetchCountries}
                  value={value ? { value, label: value } : null}
                  onChange={val => onChange(val?.value || '')}
                />
              )}
            />
          </Grid>
        </Grid>
      </Paper>
    </>
  )
})

const CriteriaSection = React.memo(
  ({
    mode,
    criteriaUploading,
    criteriaDeleting,
    criteriaError,
    onUploadClick,
    onRemoveUpload,
    onDownloadUpload,
    onPreviewUpload
  }: CriteriaSectionProps) => {
    const isViewMode = mode === 'View'
    const { control } = useFormContext<SelectionFormData>()
    const { fields } = useFieldArray({ control, name: 'criteria' })
    const criteria = useWatch({ control, name: 'criteria' }) || []

    return (
      <>
        <SectionTitle no={4} title='Criteria for selection' />
        <Paper
          elevation={0}
          sx={{ mb: 3, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'primary.main' }}
        >
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size='small' sx={{ minWidth: 980, tableLayout: 'fixed' }}>
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor: '#eadcf8',
                    '& .MuiTableCell-root': {
                      color: '#111',
                      fontWeight: 700,
                      textAlign: 'center',
                      py: 0.75,
                      borderRight: '1px solid #666',
                      borderBottom: '1px solid #666',
                      '&:last-of-type': { borderRight: 0 }
                    }
                  }}
                >
                  <TableCell sx={{ width: 55 }}>No.</TableCell>
                  <TableCell sx={{ width: 330 }}>Detail</TableCell>
                  <TableCell sx={{ width: 100 }}>Criteria</TableCell>
                  <TableCell sx={{ width: 275 }}>Judgment</TableCell>
                  <TableCell sx={{ width: 220 }}>Remark</TableCell>
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
                        bgcolor: row.criteria === 'Need' ? 'rgba(115,103,240,0.04)' : 'transparent'
                      }}
                    >
                      <TableCell>
                        <Typography variant='caption' fontWeight={700}>
                          {row.no}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='caption'>{row.detail}</Typography>
                      </TableCell>
                      <TableCell align='center'>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <Chip
                            label={row.criteria}
                            size='small'
                            color={row.criteria === 'Need' ? 'primary' : 'default'}
                            variant={row.criteria === 'Need' ? 'filled' : 'tonal'}
                            sx={{ fontSize: '0.65rem' }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
                          {row.no === '4.3' && (
                            <Controller
                              name={`criteria.${index}.remark` as any}
                              control={control}
                              render={({ field }) => (
                                <Box sx={{ display: 'flex', gap: 1.5 }}>
                                  <FormControlLabel
                                    sx={{ m: 0 }}
                                    control={
                                      <Checkbox
                                        size='small'
                                        color='success'
                                        disabled={isViewMode}
                                        checked={field.value === 'Accept'}
                                        onChange={() => field.onChange(field.value === 'Accept' ? '' : 'Accept')}
                                      />
                                    }
                                    label={
                                      <Typography variant='caption' fontWeight={600} color='success.main'>
                                        Accept
                                      </Typography>
                                    }
                                  />
                                  <FormControlLabel
                                    sx={{ m: 0 }}
                                    control={
                                      <Checkbox
                                        size='small'
                                        color='error'
                                        disabled={isViewMode}
                                        checked={field.value === 'Not Accept'}
                                        onChange={() =>
                                          field.onChange(field.value === 'Not Accept' ? '' : 'Not Accept')
                                        }
                                      />
                                    }
                                    label={
                                      <Typography variant='caption' fontWeight={600} color='error.main'>
                                        Not Accept
                                      </Typography>
                                    }
                                  />
                                </Box>
                              )}
                            />
                          )}

                          {(row.files || []).map((file, fileIndex) => {
                            const isPending = file.file_path?.startsWith(PENDING_UPLOAD_PREFIX)

                            return (
                              <Box
                                key={file.criteria_file_id || file.pending_key || `${file.file_path}-${fileIndex}`}
                                sx={{ display: 'flex', alignItems: 'center', gap: 0.35 }}
                              >
                                <Tooltip title={isPending ? 'Pending upload' : 'Preview file'}>
                                  <Box
                                    onClick={() => !isPending && onPreviewUpload(file.file_path, file.file_name)}
                                    sx={{
                                      display: 'inline-flex',
                                      cursor: isPending ? 'default' : 'pointer',
                                      minWidth: 0
                                    }}
                                  >
                                    <Chip
                                      icon={
                                        <i
                                          className={isPending ? 'tabler-clock' : 'tabler-check'}
                                          style={{ fontSize: 13 }}
                                        />
                                      }
                                      label={file.file_name || `File ${fileIndex + 1}`}
                                      size='small'
                                      color={isPending ? 'warning' : 'success'}
                                      variant='tonal'
                                      sx={{
                                        fontSize: '0.65rem',
                                        maxWidth: 155,
                                        '&:hover': { bgcolor: 'action.hover' }
                                      }}
                                    />
                                  </Box>
                                </Tooltip>
                                {!isPending && (
                                  <>
                                    <Tooltip title='Preview'>
                                      <IconButton
                                        size='small'
                                        onClick={() => onPreviewUpload(file.file_path, file.file_name)}
                                        sx={{ p: 0.3 }}
                                      >
                                        <i className='tabler-eye' style={{ fontSize: 13 }} />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title='Download'>
                                      <IconButton
                                        size='small'
                                        onClick={() => onDownloadUpload(file.file_path, file.file_name)}
                                        sx={{ p: 0.3 }}
                                      >
                                        <i className='tabler-download' style={{ fontSize: 13 }} />
                                      </IconButton>
                                    </Tooltip>
                                  </>
                                )}
                                <Tooltip title={isViewMode ? 'View mode' : 'Remove'}>
                                  <IconButton
                                    size='small'
                                    onClick={() => onRemoveUpload(index, fileIndex)}
                                    disabled={
                                      isViewMode ||
                                      Boolean(criteriaDeleting[index]) ||
                                      Boolean(criteriaUploading[index])
                                    }
                                    sx={{ p: 0.3 }}
                                  >
                                    {criteriaDeleting[index] ? (
                                      <CircularProgress size={12} />
                                    ) : (
                                      <i className='tabler-x' style={{ fontSize: 12 }} />
                                    )}
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            )
                          })}

                          {(row.files || []).length < MAX_CRITERIA_FILES && (
                            <Button
                              size='small'
                              variant='tonal'
                              color='secondary'
                              disabled={isViewMode || criteriaUploading[index] || criteriaDeleting[index]}
                              startIcon={
                                criteriaUploading[index] ? (
                                  <CircularProgress size={12} />
                                ) : (
                                  <i className='tabler-upload' style={{ fontSize: 13 }} />
                                )
                              }
                              onClick={() => onUploadClick(index)}
                              sx={{ fontSize: '0.7rem', py: 0.25, alignSelf: 'flex-start' }}
                            >
                              {criteriaUploading[index]
                                ? 'Uploading...'
                                : `Select File (${(row.files || []).length}/${MAX_CRITERIA_FILES})`}
                            </Button>
                          )}
                          {criteriaError[index] && (
                            <Typography variant='caption' color='error' sx={{ fontSize: '0.62rem' }}>
                              {criteriaError[index]}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant='caption' sx={{ overflowWrap: 'anywhere' }}>
                          {(row.files || [])
                            .map(file => file.file_name)
                            .filter(Boolean)
                            .join(', ') || '-'}
                        </Typography>
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
)

/** Isolated sub-component: only re-renders when criteria file arrays change */
const CriteriaStats = React.memo(() => {
  const { control } = useFormContext<SelectionFormData>()
  const criteria = useWatch({ control, name: 'criteria' }) || []
  const needUploaded = criteria.filter(
    item => ['4.1', '4.2', '4.4', '4.5'].includes(String(item?.no || '')) && item?.files?.length
  ).length
  const isNeedPassed = needUploaded >= 4
  const optionalUploaded = criteria.filter(
    item => item?.criteria === 'Optional' && item?.no !== '4.14' && item?.files?.length
  ).length

  const isOptionalPassed = optionalUploaded >= 3

  return (
    <Paper variant='outlined' sx={{ p: 1.5, mb: 2, bgcolor: 'action.hover', borderRadius: 1.5 }}>
      <Typography variant='caption' fontWeight={700} sx={{ display: 'block', mb: 1 }}>
        Remark :
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
        <i
          className={isNeedPassed ? 'tabler-circle-check' : 'tabler-circle-x'}
          style={{
            color: isNeedPassed ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)',
            fontSize: 18
          }}
        />
        <Typography variant='caption'>
          {'1. Criteria for evaluation criteria item 4.1, 4.2, 4.4 and 4.5, Which are all selected = '}
          <Box component='span' sx={{ fontWeight: 700, color: isNeedPassed ? 'success.main' : 'error.main' }}>
            {needUploaded}
          </Box>
          {' items'}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
        <i
          className={isOptionalPassed ? 'tabler-circle-check' : 'tabler-circle-x'}
          style={{
            color: isOptionalPassed ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)',
            fontSize: 18
          }}
        />
        <Typography variant='caption'>
          {
            '2. Item 4.6 to 4.13 as a criterion independent, Which must choose at least three items, Which are all selected = '
          }
          <Box component='span' sx={{ fontWeight: 700, color: isOptionalPassed ? 'success.main' : 'error.main' }}>
            {optionalUploaded}
          </Box>
          {' items'}
        </Typography>
      </Box>
      <Typography variant='caption' component='div' sx={{ pl: 6, color: 'text.secondary', lineHeight: 1.8 }}>
        <strong>-</strong> Manufacturer shall be authorized capital is at least 1MTHB, Establish is at least 3 years and
        if the goods raw materials item no. 4.6 is recommended.
        <br />
        <strong>-</strong> Other business category shall be authorized capital is at least 0.5 MTHB, Establish is at
        least 1 year.
      </Typography>
    </Paper>
  )
})

// Local date in the yyyy-MM-dd shape a native <input type='date'> expects.
// Built from local parts (not toISOString) so a late-evening TH save doesn't land on the previous UTC day.
const todayInputValue = () => {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

const SuggestionSection = React.memo(
  ({
    accountVendorCodeOnly = false,
    mode = 'Edit',
    signatures = [],
    vendorRegion = ''
  }: {
    accountVendorCodeOnly?: boolean
    mode?: SelectionFormMode
    signatures?: SignatureSlot[]
    vendorRegion?: string
  }) => {
    const { control, register, setValue, getValues } = useFormContext<SelectionFormData>()
    const isViewMode = mode === 'View'
    const disableSuggestionInputs = accountVendorCodeOnly || isViewMode
    const disableSelectorInputs = isViewMode
    const vendorCodePrefix = getVendorCodePrefix(vendorRegion)

    // On the Account Register step the Selector fills in the Vendor Code, and the
    // Completion Date is the day that happens — so pin it to today rather than letting
    // it keep a stale saved value. Not editable here; handleSave reads it via getValues().
    const pinCompletionDateToToday = accountVendorCodeOnly && !isViewMode

    useEffect(() => {
      if (!pinCompletionDateToToday) return
      setValue('completion_date', todayInputValue(), { shouldDirty: true })

      const currentVendorCode = String(getValues('vendor_code_selector') || '').trim()
      if (!currentVendorCode && vendorCodePrefix) {
        setValue('vendor_code_selector', vendorCodePrefix, { shouldDirty: true })
      }
    }, [getValues, pinCompletionDateToToday, setValue, vendorCodePrefix])

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
              <FormLabel sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 0.5, color: 'text.primary' }}>Result</FormLabel>
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
                      label={
                        <Typography variant='body2' fontWeight={600} color='success.main'>
                          Approval
                        </Typography>
                      }
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
                      label={
                        <Typography variant='body2' fontWeight={600} color='error.main'>
                          Disapproval
                        </Typography>
                      }
                    />
                  </Box>
                )}
              />
            </FormControl>

            <Paper variant='outlined' sx={{ mb: 2, borderRadius: 1.5, overflow: 'hidden' }}>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ display: 'block', p: 1, bgcolor: 'action.hover', fontStyle: 'italic' }}
              >
                Signatures are completed on the printed form - this section is for reference only.
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  borderTop: '1px solid',
                  borderTopColor: 'divider'
                }}
              >
                {signatures.map((item, index) => (
                  <Box
                    key={item.role + index}
                    sx={{
                      p: 1.5,
                      minHeight: 60,
                      borderRight: index < 3 ? '1px solid' : 'none',
                      borderRightColor: 'divider',
                      textAlign: 'center'
                    }}
                  >
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ fontSize: '0.65rem', display: 'block', lineHeight: 1.1 }}
                    >
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
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  borderTop: '1px solid',
                  borderTopColor: 'divider'
                }}
              >
                {signatures.map((item, index) => (
                  <Box
                    key={`${item.role}-label-${index}`}
                    sx={{
                      p: 0.75,
                      textAlign: 'center',
                      borderRight: index < 3 ? '1px solid' : 'none',
                      borderRightColor: 'divider'
                    }}
                  >
                    <Typography variant='caption' color='text.secondary'>
                      {item.role}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>

            <CustomTextField
              fullWidth
              label='Path'
              placeholder='File path / folder reference'
              {...register('path')}
              sx={{ mb: 2 }}
            />
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
                <CustomTextField
                  fullWidth
                  label='Vendor Code'
                  disabled={isViewMode}
                  {...register('vendor_code_selector')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  label='Completion Date'
                  type='date'
                  disabled={disableSelectorInputs || pinCompletionDateToToday}
                  InputLabelProps={{ shrink: true }}
                  helperText={pinCompletionDateToToday ? "Set automatically to today's date" : undefined}
                  {...register('completion_date')}
                />
              </Grid>
            </Grid>
          </Paper>
        </Paper>
      </>
    )
  }
)

// ── Main Dialog Component ─────────────────────────────────────────────────────

export default function SelectionFormDialong({
  open,
  rowData,
  onClose,
  onSaved,
  mode = 'Edit'
}: SelectionFormDialongProps) {
  const { workflowStepIds, approvalStepStatusIds } = useWorkflowIdentity()
  const approvalSteps = useMemo(() => {
    const rawSteps = rowData?.APPROVAL_STEPS

    if (Array.isArray(rawSteps)) return rawSteps
    if (typeof rawSteps === 'string') {
      try {
        return JSON.parse(rawSteps)
      } catch {
        return []
      }
    }

    return []
  }, [rowData?.APPROVAL_STEPS])

  const isAccountVendorCodeOnlyMode = useMemo(() => {
    const currentStep = approvalSteps.find(
      (step: any) => Number(step?.M_APPROVAL_STEP_STATUS_ID) === approvalStepStatusIds.IN_PROGRESS
    )
    return isAccountStep(currentStep)
  }, [approvalStepStatusIds.IN_PROGRESS, approvalSteps])

  const isViewMode = mode === 'View'
  const contentMode: SelectionFormMode = isAccountVendorCodeOnlyMode ? 'View' : mode

  const {
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
  } = useSelectionForm({
    open,
    rowData,
    onClose,
    onSaved,
    mode,
    accountVendorCodeOnly: isAccountVendorCodeOnlyMode
  })
  const [confirmAction, setConfirmAction] = useState<'save' | 'export' | null>(null)
  const [deleteCriteriaFile, setDeleteCriteriaFile] = useState<{ criteriaIndex: number; fileIndex: number } | null>(
    null
  )
  const [previewFile, setPreviewFile] = useState<{ name: string; url: string } | null>(null)

  // Preview a criteria attachment in the same viewer the request's Attached Files use.
  const handlePreviewCriteriaFile = (filePath?: string, fileName?: string) => {
    const normalizedFilePath = String(filePath || '').trim()
    const normalizedFileName = String(fileName || '').trim()

    if (!normalizedFilePath) {
      ToastMessageError({ title: 'Preview File', message: 'File path is missing.' })
      return
    }

    if (normalizedFilePath.startsWith(PENDING_UPLOAD_PREFIX)) {
      ToastMessageError({
        title: 'Preview File',
        message: 'Please save the selection sheet before previewing this file.'
      })
      return
    }

    setPreviewFile({
      name: normalizedFileName || normalizedFilePath.split(/[/\\]/).pop() || 'Attachment',
      url: buildSelectionFileUrl(normalizedFilePath, normalizedFileName, String(rowData?.REQUEST_NUMBER || ''))
    })
  }

  const approvalLogs = useMemo(() => {
    const rawLogs = rowData?.APPROVAL_LOGS

    if (Array.isArray(rawLogs)) return rawLogs
    if (typeof rawLogs === 'string') {
      try {
        return JSON.parse(rawLogs)
      } catch {
        return []
      }
    }

    return []
  }, [rowData?.APPROVAL_LOGS])

  const requestRef = rowData?.REQUEST_NUMBER || rowData?.REQUEST_REGISTER_VENDOR_ID || '-'
  const handleConfirmAction = async () => {
    if (confirmAction === 'save') {
      await handleSave()
    } else if (confirmAction === 'export') {
      await handleExportPdf()
    }

    setConfirmAction(null)
  }

  const handleConfirmDeleteCriteriaFile = async () => {
    if (!deleteCriteriaFile) return

    await removeCriteriaUpload(deleteCriteriaFile.criteriaIndex, deleteCriteriaFile.fileIndex)
    setDeleteCriteriaFile(null)
  }

  const signatureSlots = useMemo(
    () =>
      buildSelectionSignatureSlots({
        approvalSteps,
        approvalLogs,
        workflowStepIds,
        approvalStepStatusIds
      }),
    [approvalLogs, approvalStepStatusIds, approvalSteps, workflowStepIds]
  )

  return (
    <FormProvider {...methods}>
      <Dialog
        maxWidth='lg'
        fullWidth
        TransitionComponent={Transition}
        keepMounted
        onClose={handleDialogClose}
        open={open}
        PaperProps={{ sx: { bgcolor: 'background.default' } }}
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
      >
        <input
          type='file'
          multiple
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept='.pdf,.doc,.docx,.jpg,.jpeg,.png'
          onChange={handleFileChange}
        />

        <DialogTitle sx={{ px: 4, py: 4, position: 'relative' }}>
          <Typography variant='h5' component='span' fontWeight={800} sx={{ letterSpacing: 0.3 }}>
            Supplier / Outsourcing Selection Sheet
          </Typography>
          <DialogSubtitle fallbackName={rowData?.COMPANY_NAME} />
          <Box sx={{ position: 'absolute', top: 16, right: 56, textAlign: 'right' }}>
            <Typography variant='body2' fontWeight={700} color='text.secondary'>
              {requestRef}
            </Typography>
          </Box>
          <DialogCloseButton onClick={handleCloseClick} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>

        <DialogContent dividers sx={{ px: 4, py: 3, overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
          {initializing ? (
            <Box sx={{ minHeight: 320 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <CircularProgress size={24} />
                <Typography variant='body2' sx={{ ml: 1.5 }}>
                  Loading selection sheet...
                </Typography>
              </Box>
              <SkeletonCustom />
            </Box>
          ) : (
            <>
              <DisabledBlock disabled={contentMode === 'View'}>
                <CompanyInfoSection />
                <SanctionsSection checking={sanctionsChecking} checkState={sanctionsCheck} onRecheck={checkSanctions} />
                <GeneralInfoSection mode={contentMode} />
              </DisabledBlock>
              <CriteriaSection
                mode={contentMode}
                criteriaUploading={criteriaUploading}
                criteriaDeleting={criteriaDeleting}
                criteriaError={criteriaError}
                onUploadClick={handleCriteriaUploadClick}
                onRemoveUpload={(criteriaIndex, fileIndex) => setDeleteCriteriaFile({ criteriaIndex, fileIndex })}
                onDownloadUpload={downloadCriteriaFile}
                onPreviewUpload={handlePreviewCriteriaFile}
              />
              <SuggestionSection
                accountVendorCodeOnly={isAccountVendorCodeOnlyMode}
                mode={mode}
                signatures={signatureSlots}
                vendorRegion={rowData?.VENDOR_REGION}
              />
            </>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: 'flex-start',
            px: 4,
            py: 3,
            gap: 2,
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Button
            variant='tonal'
            color='primary'
            onClick={() => setConfirmAction('save')}
            disabled={isBusy || isViewMode}
            startIcon={
              saving ? <CircularProgress size={14} /> : <i className='tabler-device-floppy' style={{ fontSize: 16 }} />
            }
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button
            variant='contained'
            color='primary'
            onClick={() => setConfirmAction('export')}
            disabled={isBusy}
            startIcon={
              generatingPdf ? (
                <CircularProgress size={14} color='inherit' />
              ) : (
                <i className='tabler-file-type-pdf' style={{ fontSize: 16 }} />
              )
            }
          >
            {generatingPdf ? 'Generating...' : isViewMode ? 'Export PDF' : 'Save & Export PDF'}
          </Button>
          <Button variant='tonal' color='secondary' onClick={handleCloseClick} disabled={isBusy}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <FileViewerDialog
        open={Boolean(previewFile)}
        files={previewFile ? [previewFile] : []}
        onClose={() => setPreviewFile(null)}
      />
      <ConfirmModal
        show={Boolean(confirmAction)}
        onConfirmClick={handleConfirmAction}
        onCloseClick={() => setConfirmAction(null)}
        isDelete={false}
        isLoading={isBusy}
      />
      <ConfirmModal
        show={Boolean(deleteCriteriaFile)}
        onConfirmClick={handleConfirmDeleteCriteriaFile}
        onCloseClick={() => setDeleteCriteriaFile(null)}
        isDelete
        isLoading={isBusy}
      />
    </FormProvider>
  )
}
