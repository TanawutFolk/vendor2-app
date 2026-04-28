// GPR Form A — Supplier / Outsourcing Selection Sheet (PDF template)
// Rendered with @react-pdf/renderer (client-side only, via Vite)
//
// Thai font: place Sarabun-Regular.ttf + Sarabun-Bold.ttf in /public/fonts/
// then uncomment the Font.register block below.

import { Document, Page, Text, View, StyleSheet, Image, Svg, Path } from '@react-pdf/renderer'
import type { GprFormData } from './useGprForm'
import { inferStepCode, isAgreementReachedStep } from '@_workspace/utils/requestWorkflow'
import fitelLogo from '@_workspace/utils/fitelLogo.png'

// ─── Optional Thai font registration ────────────────────────────────────────
// import { Font } from '@react-pdf/renderer'
// Font.register({
//   family: 'Sarabun',
//   fonts: [
//     { src: '/fonts/Sarabun-Regular.ttf' },
//     { src: '/fonts/Sarabun-Bold.ttf', fontWeight: 'bold' },
//   ]
// })

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    page: {
        fontSize: 8.5,
        fontFamily: 'Helvetica',
        paddingTop: 28,
        paddingBottom: 36,
        paddingHorizontal: 32,
        color: '#111',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        borderBottomStyle: 'solid',
        paddingBottom: 5,
        marginBottom: 6,
    },
        headerLeft: {
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: 8,
            flex: 1,
        },
        logo: {
            width: 72,
            height: 22,
            objectFit: 'contain',
        },
        companyText: {
            fontFamily: 'Helvetica-Bold',
            fontSize: 9,
        },
    title: {
        fontSize: 13,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    sNum: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 9,
        marginTop: 8,
        marginBottom: 4,
    },
    // ── Company info rows ──
    infoRow: { flexDirection: 'row', marginBottom: 3, alignItems: 'flex-end' },
    infoLbl: { fontFamily: 'Helvetica-Bold', fontSize: 8, width: 90 },
    infoVal: {
        fontSize: 8,
        flex: 1,
        borderBottomWidth: 0.5,
        borderBottomColor: '#666',
        borderBottomStyle: 'solid',
        paddingBottom: 1,
    },
    // ── Table ──
    tbl: {
        borderWidth: 0.5,
        borderColor: '#888',
        borderStyle: 'solid',
        marginBottom: 6,
    },
    tblRow: { flexDirection: 'row' },
    // Header cell (with right + bottom border)
    th: {
        fontFamily: 'Helvetica-Bold',
        backgroundColor: '#f0f0f0',
        fontSize: 7.5,
        padding: '3 4',
        borderRightWidth: 0.5,
        borderRightColor: '#888',
        borderRightStyle: 'solid',
        borderBottomWidth: 0.5,
        borderBottomColor: '#888',
        borderBottomStyle: 'solid',
    },
    // Last header cell (no right border)
    thl: {
        fontFamily: 'Helvetica-Bold',
        backgroundColor: '#f0f0f0',
        fontSize: 7.5,
        padding: '3 4',
        borderBottomWidth: 0.5,
        borderBottomColor: '#888',
        borderBottomStyle: 'solid',
    },
    // Data cell (right + bottom border)
    td: {
        fontSize: 7.5,
        padding: '3 4',
        borderRightWidth: 0.5,
        borderRightColor: '#aaa',
        borderRightStyle: 'solid',
        borderBottomWidth: 0.5,
        borderBottomColor: '#aaa',
        borderBottomStyle: 'solid',
    },
    // Last data cell in row (no right border)
    tdl: {
        fontSize: 7.5,
        padding: '3 4',
        borderBottomWidth: 0.5,
        borderBottomColor: '#aaa',
        borderBottomStyle: 'solid',
    },
    // Last row data cell (no bottom border)
    tdr: {
        fontSize: 7.5,
        padding: '3 4',
        borderRightWidth: 0.5,
        borderRightColor: '#aaa',
        borderRightStyle: 'solid',
    },
    // Last row + last col
    tdrl: {
        fontSize: 7.5,
        padding: '3 4',
    },
    // ── Checkbox ──
    chkRow: { flexDirection: 'row', alignItems: 'center', marginRight: 28 },
    chkBox: {
        width: 9,
        height: 9,
        borderWidth: 0.75,
        borderColor: '#333',
        borderStyle: 'solid',
        marginRight: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // ── Signature ──
    sigRow: { flexDirection: 'row' },
    sigCell: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderRightWidth: 0.5,
        borderRightColor: '#888',
        borderRightStyle: 'solid',
        alignItems: 'center',
        minHeight: 48,
    },
    sigCellLast: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 4,
        alignItems: 'center',
        minHeight: 48,
    },
    sigLbl: { fontFamily: 'Helvetica-Bold', fontSize: 8.5, textAlign: 'center' },
    sigDate: { fontSize: 7, color: '#777', marginTop: 12 },
    sigRoleRow: {
        flexDirection: 'row',
        borderTopWidth: 0.5,
        borderTopColor: '#888',
        borderTopStyle: 'solid',
    },
    sigRoleCell: {
        flex: 1,
        paddingVertical: 3,
        borderRightWidth: 0.5,
        borderRightColor: '#888',
        borderRightStyle: 'solid',
        alignItems: 'center',
    },
    sigRoleCellLast: { flex: 1, paddingVertical: 3, alignItems: 'center' },
    // ── Remarks ──
    rmkLine: { fontSize: 7.5, marginBottom: 3, paddingLeft: 10 },
    rmkBold: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', marginBottom: 2, paddingLeft: 18 },
    rmkItalic: { fontSize: 7, color: '#555', marginBottom: 2, paddingLeft: 18 },
})

// ─────────────────────────────────────────────────────────────────────────────
// PDF Document Component
// ─────────────────────────────────────────────────────────────────────────────
interface Props {
    form: GprFormData
    rowData: any
    chartDataUri?: string
}

type SignatureSlot = {
    role: string
    code: string
    signature: string
    date: string
}

export function GprPdfDocument({ form, rowData, chartDataUri }: Props) {

    const needUploaded    = form.criteria.filter(c => c.criteria === 'Need' && c.uploaded_file).length
    const optionalUploaded = form.criteria.filter(c => c.criteria === 'Optional' && c.no !== '4.14' && c.uploaded_file).length

    const approvalSteps = (() => {
        const raw = rowData?.approval_steps
        if (Array.isArray(raw)) return raw
        if (typeof raw === 'string') {
            try {
                return JSON.parse(raw)
            } catch {
                return []
            }
        }
        return []
    })()

    const approvedStatuses = new Set(['approved', 'completed'])

    const formatSignatureName = (fullName?: string, fallbackCode?: string) => {
        const source = String(fullName || '').trim()
        if (!source) return String(fallbackCode || '').trim()

        const parts = source.split(/\s+/).filter(Boolean)
        if (parts.length < 2) return source.toUpperCase()

        const firstName = parts[0]
        const lastName = parts[parts.length - 1]
        return `${lastName.toUpperCase()} ${firstName.charAt(0).toUpperCase()}.`
    }

    const formatDate = (rawDate?: string) => {
        if (!rawDate) return '........../........../..........'
        const d = new Date(rawDate)
        if (Number.isNaN(d.getTime())) return '........../........../..........'

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

    const findLatestApprovedAgreementReachedStep = () => {
        const matched = approvalSteps.filter((step: any) => {
            const status = String(step?.step_status || '').toLowerCase()
            if (!approvedStatuses.has(status)) return false

            return isAgreementReachedStep(step)
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

    const signatureSlots: SignatureSlot[] = [
        { role: 'Issuer', step: findLatestApprovedAgreementReachedStep() },
        { role: 'Manager', step: findLatestApprovedStep('PO_MGR_APPROVAL') },
        { role: 'General Manager', step: findLatestApprovedStep('PO_GM_APPROVAL') },
        { role: 'Managing Director', step: findLatestApprovedStep('MD_APPROVAL') },
    ].map((item: any) => {
        const step = item.step
        return {
            role: item.role,
            code: String(step?.approver_id || '').trim(),
            signature: formatSignatureName(step?.approver_name, step?.approver_id),
            date: formatDate(step?.UPDATE_DATE || step?.CREATE_DATE),
        }
    })

    return (
        <Document>
            <Page size='A4' style={s.page}>

                {/* ── Header ─────────────────────────────────────────────── */}
                <View style={s.headerRow}>
                        <View style={s.headerLeft}>
                            <Image src={fitelLogo} style={s.logo} />
                            <Text style={s.companyText}>Furukawa Fitel (Thailand) Co.,Ltd.</Text>
                        </View>
                    <Text style={{ fontSize: 8, color: '#666' }}>{rowData?.request_number || rowData?.request_id || ''}</Text>
                </View>

                <Text style={s.title}>Supplier / Outsourcing Selection Sheet</Text>

                {/* ── Section 1: Company Name ──────────────────────────── */}
                <Text style={s.sNum}>1.</Text>
                <View style={{ paddingLeft: 10, marginBottom: 6 }}>
                    <View style={s.infoRow}>
                        <Text style={s.infoLbl}>Company Name :</Text>
                        <Text style={s.infoVal}>{form.company_name || ''}</Text>
                    </View>
                    <View style={[s.infoRow, { marginBottom: 0 }]}>
                        <Text style={[s.infoLbl, { width: 30 }]}>PIC :</Text>
                        <Text style={[s.infoVal, { marginRight: 10 }]}>{form.pic_name || ''}</Text>
                        <Text style={[s.infoLbl, { width: 25 }]}>Tel :</Text>
                        <Text style={s.infoVal}>{form.tel || ''}</Text>
                    </View>
                    <View style={s.infoRow}>
                        <Text style={[s.infoLbl, { width: 45 }]}>Email :</Text>
                        <Text style={s.infoVal}>{form.email || ''}</Text>
                    </View>
                </View>

                {/* ── Section 2: Sanctions ─────────────────────────────── */}
                <Text style={s.sNum}>2.  List of two political parties subject to sanctions</Text>
                <View style={{ flexDirection: 'row', paddingLeft: 16, marginBottom: 7 }}>
                    <View style={s.chkRow}>
                        <View style={s.chkBox}>
                            <Text style={{ fontSize: 7 }}>{form.sanctions === 'non-concerned' ? 'X' : ' '}</Text>
                        </View>
                        <Text style={{ fontSize: 8 }}>####  Non-concerned</Text>
                    </View>
                    <View style={s.chkRow}>
                        <View style={s.chkBox}>
                            <Text style={{ fontSize: 7 }}>{form.sanctions === 'concerned' ? 'X' : ' '}</Text>
                        </View>
                        <Text style={{ fontSize: 8 }}>###  Concerned</Text>
                    </View>
                </View>

                {/* ── Section 3: General Information ───────────────────── */}
                <Text style={s.sNum}>3.  Company general information</Text>
                <View style={s.tbl}>
                    {/* Address */}
                    <View style={s.tblRow}>
                        <Text style={[s.td, { width: 130, fontFamily: 'Helvetica-Bold' }]}>Address</Text>
                        <Text style={[s.tdl, { flex: 1 }]}>{form.address}</Text>
                    </View>
                    {/* Business Category + Start Year */}
                    <View style={s.tblRow}>
                        <Text style={[s.td, { width: 130, fontFamily: 'Helvetica-Bold' }]}>Business Category</Text>
                        <Text style={[s.td, { flex: 1 }]}>{form.business_category}</Text>
                        <Text style={[s.td, { width: 80, fontFamily: 'Helvetica-Bold' }]}>Start Year</Text>
                        <Text style={[s.tdl, { width: 80 }]}>{form.start_year}</Text>
                    </View>
                    {/* Authorized Capital + Establish */}
                    <View style={s.tblRow}>
                        <Text style={[s.td, { width: 130, fontFamily: 'Helvetica-Bold' }]}>Authorized Capital</Text>
                        <Text style={[s.td, { flex: 1 }]}>{form.authorized_capital}</Text>
                        <Text style={[s.td, { width: 80, fontFamily: 'Helvetica-Bold' }]}>Establish</Text>
                        <Text style={[s.tdl, { width: 80 }]}>{form.establish}</Text>
                    </View>
                    {/* Number of Employees + Manufactured Country */}
                    <View style={s.tblRow}>
                        <Text style={[s.td, { width: 130, fontFamily: 'Helvetica-Bold' }]}>Number of Employees</Text>
                        <Text style={[s.td, { flex: 1 }]}>{form.number_of_employees}</Text>
                        <Text style={[s.td, { width: 80, fontFamily: 'Helvetica-Bold' }]}>Manufactured Country</Text>
                        <Text style={[s.tdl, { width: 80 }]}>{form.manufactured_country}</Text>
                    </View>
                    {/* Main Product */}
                    <View style={s.tblRow}>
                        <Text style={[s.td, { width: 130, fontFamily: 'Helvetica-Bold' }]}>Main Product</Text>
                        <Text style={[s.tdl, { flex: 1 }]}>{form.main_product}</Text>
                    </View>
                    {/* Sales & Profit 5 Years (Chart) */}
                    <View style={[s.tblRow, { alignItems: 'flex-start' }]}>
                        <Text style={[s.td, { width: 130, fontFamily: 'Helvetica-Bold' }]}>
                            {'Sales and Operational Profit\n(Last 5 Years)'}
                        </Text>
                        <View style={{ flex: 1, padding: 4, alignItems: 'center', justifyContent: 'center' }}>
                            {chartDataUri ? (
                                <Image src={chartDataUri} style={{ height: 160, width: '90%', objectFit: 'contain' }} />
                            ) : (
                                <Text style={{ fontSize: 8, color: '#999', fontStyle: 'italic', margin: 20 }}>Chart image will appear here</Text>
                            )}
                        </View>
                    </View>
                    {/* Vendor's Original Country — last row, no bottom border */}
                    <View style={[s.tblRow, { borderBottomWidth: 0 }]}>
                        <Text style={[s.tdr, { width: 130, fontFamily: 'Helvetica-Bold' }]}>Vendor's Original Country</Text>
                        <Text style={[s.tdrl, { flex: 1 }]}>{form.vendor_original_country}</Text>
                    </View>
                </View>

                {/* ── Section 4: Criteria ───────────────────────────────── */}
                <Text style={s.sNum}>4.  Criteria for selection</Text>
                <View style={s.tbl}>
                    <View style={s.tblRow}>
                        <Text style={[s.th, { width: 35 }]}>No.</Text>
                        <Text style={[s.th, { flex: 3 }]}>Detail</Text>
                        <Text style={[s.th, { width: 60 }]}>Criteria</Text>
                        <Text style={[s.th, { flex: 2 }]}>Remark</Text>
                        <Text style={[s.thl, { width: 55 }]}>Document</Text>
                    </View>
                    {form.criteria.map((c, i) => {
                        const isLast = i === form.criteria.length - 1
                        const Td = isLast ? s.tdr : s.td
                        const Tdl = isLast ? s.tdrl : s.tdl
                        return (
                            <View key={c.no} style={s.tblRow}>
                                <Text style={[Td, { width: 35 }]}>{c.no}</Text>
                                <Text style={[Td, { flex: 3 }]}>{c.detail}</Text>
                                <Text style={[Td, { width: 60 }]}>{c.criteria}</Text>
                                <Text style={[Td, { flex: 2 }]}>{c.remark}</Text>
                                <View style={[Tdl, { width: 55, alignItems: 'center', justifyContent: 'center' }]}>
                                    {c.uploaded_file ? (
                                        <Svg viewBox="0 0 24 24" width={12} height={12}>
                                            <Path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="#28C76F" />
                                        </Svg>
                                    ) : (
                                        <Text style={{ fontSize: 10 }}>-</Text>
                                    )}
                                </View>
                            </View>
                        )
                    })}
                </View>

                {/* ── Section 5: Suggestion ─────────────────────────────── */}
                <Text style={s.sNum}>5.  Suggestion :</Text>
                <View style={{
                    borderBottomWidth: 0.5, borderBottomColor: '#777', borderBottomStyle: 'solid',
                    minHeight: 24, marginBottom: 8, paddingBottom: 4, paddingLeft: 4,
                }}>
                    <Text style={{ fontSize: 8 }}>{form.suggestion}</Text>
                </View>

                {/* Remark block */}
                <View style={{ marginBottom: 6 }}>
                    <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>Remark :</Text>
                    <Text style={s.rmkLine}>
                        {`1. Criteria for evaluation criteria in item 4.1 to 4.5, Which are all selected   =   ${needUploaded}   items`}
                    </Text>
                    <Text style={s.rmkLine}>
                        {`2. Item 4.6 to 4.13 as a criterion independent, Which must choose at least four items, Which are all selected   =   ${optionalUploaded}   items`}
                    </Text>
                    <Text style={s.rmkBold}>
                        {'- Manufacturer shall be authorized capital is at least 1MTHB, Establish is at least 3 years and if the goods are raw materials, item no. 4.6-4.7 is recommended.'}
                    </Text>
                    <Text style={s.rmkItalic}>
                        {'- Other business category shall be authorized capital is at least 0.5 MTHB, Establish is at least 1 year.'}
                    </Text>
                </View>

                {/* Approval / Disapproval */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, paddingLeft: 8 }}>
                    <View style={s.chkRow}>
                        <View style={s.chkBox}>
                            <Text style={{ fontSize: 7 }}>{form.result === 'approval' ? 'X' : ' '}</Text>
                        </View>
                        <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>Approval</Text>
                    </View>
                    <View style={s.chkRow}>
                        <View style={s.chkBox}>
                            <Text style={{ fontSize: 7 }}>{form.result === 'disapproval' ? 'X' : ' '}</Text>
                        </View>
                        <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>Disapproval</Text>
                    </View>
                </View>

                {/* Signature Table */}
                <View style={{ borderWidth: 0.5, borderColor: '#888', borderStyle: 'solid', marginBottom: 6 }}>
                    <View style={s.sigRow}>
                        {signatureSlots.map((slot, i) => (
                            <View key={i} style={i < 3 ? s.sigCell : s.sigCellLast}>
                                <Text style={{ fontSize: 7, color: '#666' }}>{slot.code || '-'}</Text>
                                <Text style={s.sigLbl}>{slot.signature || '-'}</Text>
                                <Text style={s.sigDate}>{slot.date}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={s.sigRoleRow}>
                        {signatureSlots.map((slot, i) => (
                            <View key={i} style={i < 3 ? s.sigRoleCell : s.sigRoleCellLast}>
                                <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', textAlign: 'center' }}>{slot.role}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Path */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 }}>
                    <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', marginRight: 6 }}>Path :</Text>
                    <Text style={{
                        fontSize: 8, flex: 1,
                        borderBottomWidth: 0.5, borderBottomColor: '#666', borderBottomStyle: 'solid',
                        paddingBottom: 1,
                    }}>{form.path}</Text>
                </View>

                {/* For Selector */}
                <View style={{ borderTopWidth: 1, borderTopColor: '#000', borderTopStyle: 'solid', paddingTop: 6 }}>
                    <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', marginBottom: 2 }}>For Selector :</Text>
                    <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Oblique', marginBottom: 8 }}>
                        After completing the Supplier/Outsourcing registration, please specify.
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                        {/* Vendor Code */}
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginRight: 24 }}>
                            <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', marginRight: 4 }}>Vendor Code :</Text>
                            <Text style={{
                                fontSize: 8, minWidth: 100,
                                borderBottomWidth: 0.5, borderBottomColor: '#666', borderBottomStyle: 'solid',
                                paddingBottom: 1,
                            }}>{form.vendor_code_selector || '  '}</Text>
                        </View>

                        {/* Date */}
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', marginRight: 4 }}>Date :</Text>
                            <Text style={{
                                fontSize: 8, minWidth: 70,
                                borderBottomWidth: 0.5, borderBottomColor: '#666', borderBottomStyle: 'solid',
                                paddingBottom: 1,
                            }}>{form.completion_date || '  /  /  '}</Text>
                        </View>
                    </View>
                </View>

            </Page>
        </Document>
    )
}
