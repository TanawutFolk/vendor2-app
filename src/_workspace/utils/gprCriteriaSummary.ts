type RawCriterion = {
  no?: string
  detail?: string
  criteria?: string
  remark?: string
  uploaded_file?: string
}

export type GprCriteriaIssue = {
  no: string
  detail: string
  criteriaType: 'Need' | 'Optional'
  reason: string
  remark: string
  uploadedFile: boolean
  explicitNotAccept: boolean
}

export type GprCriteriaSummary = {
  hasIssues: boolean
  headline: string
  unresolvedRequired: GprCriteriaIssue[]
  unresolvedOptional: GprCriteriaIssue[]
  items: GprCriteriaIssue[]
  optionalUploadedCount: number
  optionalShortfall: number
}

const DETAIL_BY_NO: Record<string, string> = {
  '4.1': 'Compliant of the law',
  '4.2': 'Anti-Bribery Policy Communication',
  '4.3': 'General Purchase Specification Requirement',
  '4.4': 'Manufacture location survey',
  '4.5': 'Company Environmental and Energy Policy',
  '4.6': 'Quality Management Certification',
  '4.7': 'Environmental Certification such as RoHS, REACH, etc.',
  '4.8': 'Environmental Management Certification',
  '4.9': 'History reliability',
  '4.10': 'Reliable performance',
  '4.11': 'Advised by Customer, Parent Company or Manager up',
  '4.12': 'Low Price',
  '4.13': 'Document to request for Automatic Account Transfer',
  '4.14': 'Other',
}

const DECISION_CRITERIA = new Set(['4.3'])
const OPTIONAL_CRITERIA = new Set(['4.6', '4.8', '4.9', '4.10', '4.11', '4.12', '4.13'])
const OPTIONAL_REQUIRED_COUNT = 3

const normalizeText = (value: unknown) => String(value || '').trim()
const normalizeRemark = (value: unknown) => normalizeText(value).toLowerCase()

const isExplicitNotAccept = (remark: string) =>
  ['not accept', 'not accepted', 'disagree', 'rejected'].some(token => remark.includes(token))

const isExplicitAccept = (remark: string) =>
  ['accept', 'accepted', 'agree', 'agreed'].some(token => remark.includes(token))

const isUploaded = (value: unknown) => normalizeText(value).length > 0

const buildReason = (
  row: { no: string; remark: string; uploadedFile: boolean; explicitNotAccept: boolean; criteriaType: 'Need' | 'Optional' },
  optionalUploadedCount: number
) => {
  if (row.explicitNotAccept) {
    return 'Vendor marked this condition as Not Accept.'
  }

  if (row.no === '4.3') {
    return 'Vendor acceptance for this requirement is still not confirmed.'
  }

  return `Optional supporting document is still missing. Current optional count is ${optionalUploadedCount}/${OPTIONAL_REQUIRED_COUNT}.`
}

export const buildGprCriteriaSummary = (rows: RawCriterion[]): GprCriteriaSummary => {
  const normalizedRows = (Array.isArray(rows) ? rows : []).map(row => {
    const no = normalizeText(row?.no)
    const remark = normalizeText(row?.remark)
    const uploadedFile = isUploaded(row?.uploaded_file)
    const normalizedRemark = normalizeRemark(remark)

    return {
      no,
      detail: normalizeText(row?.detail) || DETAIL_BY_NO[no] || '-',
      criteriaType: DECISION_CRITERIA.has(no) ? 'Need' : 'Optional' as 'Need' | 'Optional',
      remark,
      uploadedFile,
      explicitNotAccept: isExplicitNotAccept(normalizedRemark),
      explicitAccept: isExplicitAccept(normalizedRemark),
    }
  })

  const optionalRows = normalizedRows.filter(row => OPTIONAL_CRITERIA.has(row.no))
  const optionalUploadedCount = optionalRows.filter(row => row.uploadedFile).length
  const optionalShortfall = Math.max(0, OPTIONAL_REQUIRED_COUNT - optionalUploadedCount)

  const unresolvedRequired = normalizedRows
    .filter(row => DECISION_CRITERIA.has(row.no))
    .filter(row => {
      return !row.explicitAccept || row.explicitNotAccept
    })
    .map(row => ({
      no: row.no,
      detail: row.detail,
      criteriaType: 'Need' as const,
      reason: buildReason(row, optionalUploadedCount),
      remark: row.remark,
      uploadedFile: row.uploadedFile,
      explicitNotAccept: row.explicitNotAccept,
    }))

  const unresolvedOptional = optionalShortfall > 0
    ? optionalRows
      .filter(row => !row.uploadedFile || row.explicitNotAccept)
      .map(row => ({
        no: row.no,
        detail: row.detail,
        criteriaType: 'Optional' as const,
        reason: buildReason(row, optionalUploadedCount),
        remark: row.remark,
        uploadedFile: row.uploadedFile,
        explicitNotAccept: row.explicitNotAccept,
      }))
    : []

  const items = [...unresolvedRequired, ...unresolvedOptional]
  const hasIssues = items.length > 0

  let headline = ''
  if (unresolvedRequired.length > 0) {
    headline = 'Vendor still has item 4.3 decision unresolved in the Selection Sheet.'
  } else if (optionalShortfall > 0) {
    headline = `Vendor still needs ${optionalShortfall} more optional supporting item(s) to meet the Selection Sheet rule (${optionalUploadedCount}/${OPTIONAL_REQUIRED_COUNT}).`
  }

  return {
    hasIssues,
    headline,
    unresolvedRequired,
    unresolvedOptional,
    items,
    optionalUploadedCount,
    optionalShortfall,
  }
}

export const buildGprCriteriaReasonLines = (rows: RawCriterion[]) =>
  buildGprCriteriaSummary(rows).items.map(item => `${item.no} ${item.detail}: ${item.reason}`)
